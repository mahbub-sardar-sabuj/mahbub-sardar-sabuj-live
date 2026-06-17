/**
 * /api/video-to-audio — Video processing API
 * Actions:
 *   action=extract_audio (default) → Extract audio as MP3
 *   action=upscale → Upscale video using FFmpeg Lanczos3 + unsharp mask
 */
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { execFileSync } from "child_process";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "210mb",
  },
};

function getFFmpegPath() {
  let ffmpegPath = "ffmpeg";
  try {
    if (ffmpegInstaller?.path && fs.existsSync(ffmpegInstaller.path)) {
      ffmpegPath = ffmpegInstaller.path;
      fs.chmodSync(ffmpegPath, 0o755);
    }
  } catch (e) {}
  return ffmpegPath;
}

function getAudioDuration(filePath, ffmpegPath) {
  try {
    const ffprobePath = ffmpegPath.replace(/ffmpeg$/, "ffprobe");
    if (fs.existsSync(ffprobePath)) {
      const out = execFileSync(ffprobePath, [
        "-v", "quiet", "-print_format", "json",
        "-show_streams", filePath,
      ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 2 * 1024 * 1024 });
      const info = JSON.parse(out.toString());
      const audioStream = info.streams?.find(s => s.codec_type === "audio");
      const dur = parseFloat(audioStream?.duration);
      if (!isNaN(dur) && dur > 0) return dur;
      const videoStream = info.streams?.find(s => s.codec_type === "video");
      const vDur = parseFloat(videoStream?.duration);
      if (!isNaN(vDur) && vDur > 0) return vDur;
    }
  } catch (e) {}
  try {
    execFileSync(ffmpegPath, ["-i", filePath, "-f", "null", "-"],
      { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 2 * 1024 * 1024 });
  } catch (e) {
    const stderr = e.stderr?.toString() || "";
    const m = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (m) return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
  }
  return null;
}

function getVideoInfo(filePath, ffmpegPath) {
  try {
    const ffprobePath = ffmpegPath.replace(/ffmpeg$/, "ffprobe");
    if (fs.existsSync(ffprobePath)) {
      const out = execFileSync(ffprobePath, [
        "-v", "quiet", "-print_format", "json",
        "-show_streams", "-show_format", filePath,
      ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 2 * 1024 * 1024 });
      const info = JSON.parse(out.toString());
      const video = info.streams?.find(s => s.codec_type === "video");
      const audio = info.streams?.find(s => s.codec_type === "audio");
      return { width: video?.width || 0, height: video?.height || 0, hasAudio: !!audio };
    }
  } catch (e) {}
  return { width: 0, height: 0, hasAudio: false };
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return res.status(400).json({ error: "Only JSON (base64) upload supported" });
  }

  let body;
  try { body = await parseJsonBody(req); }
  catch (e) { return res.status(400).json({ error: "Invalid JSON body" }); }

  const action = body.action || "extract_audio";

  if (action === "upscale") return handleUpscale(res, body);
  return handleExtractAudio(res, body);
}

async function handleUpscale(res, body) {
  const { videoData, videoName = "video.mp4", scale = 2 } = body;
  if (!videoData) return res.status(400).json({ error: "Missing videoData" });

  const scaleNum = parseInt(scale, 10);
  if (![2, 4].includes(scaleNum)) return res.status(400).json({ error: "Scale must be 2 or 4" });

  let tempInputPath = null;
  let tempOutputPath = null;

  try {
    const base64Data = videoData.includes(",") ? videoData.split(",")[1] : videoData;
    const videoBuffer = Buffer.from(base64Data, "base64");

    if (videoBuffer.length > 150 * 1024 * 1024) {
      return res.status(400).json({ error: "ভিডিও সাইজ ১৫০MB এর বেশি হওয়া যাবে না।" });
    }

    const ext = videoName.match(/\.[^.]+$/)?.[0]?.toLowerCase() || ".mp4";
    tempInputPath = path.join(os.tmpdir(), `vu_in_${Date.now()}${ext}`);
    tempOutputPath = path.join(os.tmpdir(), `vu_out_${Date.now()}.mp4`);

    fs.writeFileSync(tempInputPath, videoBuffer);

    const ffmpegPath = getFFmpegPath();
    const info = getVideoInfo(tempInputPath, ffmpegPath);

    const inputW = info.width || 1280;
    const inputH = info.height || 720;
    const outputW = Math.min(inputW * scaleNum, 7680);
    const outputH = Math.min(inputH * scaleNum, 4320);

    const vfFilter = [
      `scale=${outputW}:${outputH}:flags=lanczos`,
      `unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=1.2:chroma_msize_x=5:chroma_msize_y=5:chroma_amount=0.5`,
      `eq=contrast=1.05:saturation=1.1:brightness=0.01`,
    ].join(",");

    const ffmpegArgs = [
      "-i", tempInputPath,
      "-vf", vfFilter,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "18",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
    ];

    if (info.hasAudio) {
      ffmpegArgs.push("-c:a", "aac", "-b:a", "192k");
    } else {
      ffmpegArgs.push("-an");
    }
    ffmpegArgs.push("-y", tempOutputPath);

    execFileSync(ffmpegPath, ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 200 * 1024 * 1024,
      timeout: 280000,
    });

    const outputBuffer = fs.readFileSync(tempOutputPath);
    const outputBase64 = outputBuffer.toString("base64");

    try { fs.unlinkSync(tempInputPath); } catch (e) {}
    try { fs.unlinkSync(tempOutputPath); } catch (e) {}

    return res.status(200).json({
      success: true,
      videoData: `data:video/mp4;base64,${outputBase64}`,
      originalSize: { width: inputW, height: inputH },
      outputSize: { width: outputW, height: outputH },
      scale: scaleNum,
      fileSizeBytes: outputBuffer.length,
    });

  } catch (err) {
    try { if (tempInputPath) fs.unlinkSync(tempInputPath); } catch (e) {}
    try { if (tempOutputPath) fs.unlinkSync(tempOutputPath); } catch (e) {}
    console.error("video-upscale error:", err);
    const errMsg = err.stderr?.toString() || err.message || "";
    return res.status(500).json({ error: `আপস্কেল ব্যর্থ: ${errMsg.slice(0, 300) || "Unknown error"}` });
  }
}

async function handleExtractAudio(res, body) {
  let tempVideoPath = null;
  let tempAudioPath = null;

  try {
    if (!body.videoData) return res.status(400).json({ error: "Missing videoData" });

    const videoBuffer = Buffer.from(body.videoData, "base64");
    const videoMime = body.videoMime || "video/mp4";
    const videoName = body.videoName || "video.mp4";

    const ext = videoName.match(/\.[^.]+$/)?.[0]?.toLowerCase() ||
      (videoMime.includes("mp4") ? ".mp4" :
       videoMime.includes("mov") || videoMime.includes("quicktime") ? ".mov" :
       videoMime.includes("avi") ? ".avi" :
       videoMime.includes("mkv") || videoMime.includes("matroska") ? ".mkv" :
       videoMime.includes("webm") ? ".webm" :
       videoMime.includes("flv") ? ".flv" :
       videoMime.includes("wmv") ? ".wmv" :
       videoMime.includes("3gp") ? ".3gp" : ".mp4");

    tempVideoPath = path.join(os.tmpdir(), `video_${Date.now()}${ext}`);
    fs.writeFileSync(tempVideoPath, videoBuffer);

    const ffmpegPath = getFFmpegPath();
    const duration = getAudioDuration(tempVideoPath, ffmpegPath);
    const audioBaseName = videoName.replace(/\.[^.]+$/, "") + "_audio.mp3";
    tempAudioPath = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`);

    execFileSync(ffmpegPath, [
      "-i", tempVideoPath, "-vn",
      "-acodec", "libmp3lame", "-ab", "192k",
      "-ar", "44100", "-ac", "2", "-y", tempAudioPath,
    ], { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 50 * 1024 * 1024, timeout: 120000 });

    const audioBuffer = fs.readFileSync(tempAudioPath);
    const audioBase64 = audioBuffer.toString("base64");

    try { fs.unlinkSync(tempVideoPath); } catch (e) {}
    try { fs.unlinkSync(tempAudioPath); } catch (e) {}

    return res.status(200).json({
      audioData: audioBase64,
      audioMime: "audio/mpeg",
      audioFilename: audioBaseName,
      duration,
      originalVideo: videoName,
      fileSizeBytes: audioBuffer.length,
    });

  } catch (err) {
    try { if (tempVideoPath) fs.unlinkSync(tempVideoPath); } catch (e) {}
    try { if (tempAudioPath) fs.unlinkSync(tempAudioPath); } catch (e) {}
    console.error("video-to-audio error:", err);
    const errMsg = err.stderr?.toString() || err.message || "";
    if (errMsg.includes("no audio") || errMsg.includes("Output file does not contain any stream")) {
      return res.status(422).json({ error: "এই ভিডিওতে কোনো অডিও ট্র্যাক নেই।" });
    }
    return res.status(500).json({ error: `ভিডিও প্রসেসিং ব্যর্থ: ${err.message || "Unknown error"}` });
  }
}
