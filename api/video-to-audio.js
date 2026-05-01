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

// ── Resolve FFmpeg path ──────────────────────────────────────────────────────
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

// ── Get audio duration ───────────────────────────────────────────────────────
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
      // Try video stream duration as fallback
      const videoStream = info.streams?.find(s => s.codec_type === "video");
      const vDur = parseFloat(videoStream?.duration);
      if (!isNaN(vDur) && vDur > 0) return vDur;
    }
  } catch (e) {}
  // Fallback: ffmpeg -i stderr
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

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let videoBuffer = null;
  let videoMime = "video/mp4";
  let videoName = "video.mp4";
  let tempVideoPath = null;
  let tempAudioPath = null;

  const contentType = req.headers["content-type"] || "";

  try {
    if (contentType.includes("application/json")) {
      // JSON base64 path
      const body = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error("Invalid JSON")); }
        });
        req.on("error", reject);
      });

      if (!body.videoData) {
        return res.status(400).json({ error: "Missing videoData" });
      }

      videoBuffer = Buffer.from(body.videoData, "base64");
      videoMime = body.videoMime || "video/mp4";
      videoName = body.videoName || "video.mp4";
    } else {
      return res.status(400).json({ error: "Only JSON (base64) upload supported" });
    }

    // Determine file extension from mime or name
    const ext = videoName.match(/\.[^.]+$/)?.[0]?.toLowerCase() ||
      (videoMime.includes("mp4") ? ".mp4" :
       videoMime.includes("mov") || videoMime.includes("quicktime") ? ".mov" :
       videoMime.includes("avi") ? ".avi" :
       videoMime.includes("mkv") || videoMime.includes("matroska") ? ".mkv" :
       videoMime.includes("webm") ? ".webm" :
       videoMime.includes("flv") ? ".flv" :
       videoMime.includes("wmv") ? ".wmv" :
       videoMime.includes("3gp") ? ".3gp" : ".mp4");

    // Write video to temp file
    tempVideoPath = path.join(os.tmpdir(), `video_${Date.now()}${ext}`);
    fs.writeFileSync(tempVideoPath, videoBuffer);

    const ffmpegPath = getFFmpegPath();

    // Get duration before extraction
    const duration = getAudioDuration(tempVideoPath, ffmpegPath);

    // Extract audio using FFmpeg
    const audioBaseName = videoName.replace(/\.[^.]+$/, "") + "_audio.mp3";
    tempAudioPath = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`);

    // FFmpeg command: extract audio, convert to MP3 at 192kbps
    execFileSync(ffmpegPath, [
      "-i", tempVideoPath,
      "-vn",                    // no video
      "-acodec", "libmp3lame",  // MP3 codec
      "-ab", "192k",            // 192kbps bitrate
      "-ar", "44100",           // 44.1kHz sample rate
      "-ac", "2",               // stereo
      "-y",                     // overwrite output
      tempAudioPath,
    ], {
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
      timeout: 120000, // 2 minute timeout
    });

    // Read extracted audio
    const audioBuffer = fs.readFileSync(tempAudioPath);
    const audioBase64 = audioBuffer.toString("base64");

    // Cleanup
    try { fs.unlinkSync(tempVideoPath); } catch (e) {}
    try { fs.unlinkSync(tempAudioPath); } catch (e) {}

    return res.status(200).json({
      audioData: audioBase64,
      audioMime: "audio/mpeg",
      audioFilename: audioBaseName,
      duration: duration,
      originalVideo: videoName,
      fileSizeBytes: audioBuffer.length,
    });

  } catch (err) {
    // Cleanup on error
    try { if (tempVideoPath) fs.unlinkSync(tempVideoPath); } catch (e) {}
    try { if (tempAudioPath) fs.unlinkSync(tempAudioPath); } catch (e) {}

    console.error("video-to-audio error:", err);

    // Check if it's a "no audio stream" error
    const errMsg = err.stderr?.toString() || err.message || "";
    if (errMsg.includes("no audio") || errMsg.includes("Output file does not contain any stream")) {
      return res.status(422).json({
        error: "এই ভিডিওতে কোনো অডিও ট্র্যাক নেই।",
      });
    }

    return res.status(500).json({
      error: `ভিডিও প্রসেসিং ব্যর্থ: ${err.message || "Unknown error"}`,
    });
  }
}
