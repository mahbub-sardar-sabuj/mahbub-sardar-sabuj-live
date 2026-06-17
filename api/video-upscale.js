/**
 * /api/video-upscale — Server-side video upscaling using FFmpeg
 * Uses: lanczos scaling + unsharp mask + contrast/saturation enhancement
 * Supports: 2x (FHD→4K) and 4x (HD→8K) upscaling
 */
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { execFileSync } from "child_process";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "200mb",
    },
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
      return {
        width: video?.width || 0,
        height: video?.height || 0,
        duration: parseFloat(info.format?.duration || "0"),
        hasAudio: !!audio,
        fps: video?.r_frame_rate ? eval(video.r_frame_rate) : 30,
      };
    }
  } catch (e) {}
  return { width: 0, height: 0, duration: 0, hasAudio: false, fps: 30 };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoData, videoName = "video.mp4", scale = 2 } = req.body;

  if (!videoData) {
    return res.status(400).json({ error: "No video data provided" });
  }

  const scaleNum = parseInt(scale, 10);
  if (![2, 4].includes(scaleNum)) {
    return res.status(400).json({ error: "Scale must be 2 or 4" });
  }

  let tempInputPath = null;
  let tempOutputPath = null;

  try {
    // Decode base64 video
    const base64Data = videoData.includes(",") ? videoData.split(",")[1] : videoData;
    const videoBuffer = Buffer.from(base64Data, "base64");

    // File size limit: 150MB
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
    const outputW = inputW * scaleNum;
    const outputH = inputH * scaleNum;

    // Cap at 7680x4320 (8K)
    const maxDim = 7680;
    const finalW = Math.min(outputW, maxDim);
    const finalH = Math.min(outputH, maxDim);

    // FFmpeg filter chain:
    // 1. scale with lanczos (best quality)
    // 2. unsharp mask for sharpening (luma + chroma)
    // 3. eq for slight contrast + saturation boost
    const vfFilter = [
      `scale=${finalW}:${finalH}:flags=lanczos`,
      `unsharp=luma_msize_x=5:luma_msize_y=5:luma_amount=1.2:chroma_msize_x=5:chroma_msize_y=5:chroma_amount=0.5`,
      `eq=contrast=1.05:saturation=1.1:brightness=0.01`,
    ].join(",");

    const ffmpegArgs = [
      "-i", tempInputPath,
      "-vf", vfFilter,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "18",          // High quality (lower = better, 18 is visually lossless)
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
    ];

    // Keep audio if present
    if (info.hasAudio) {
      ffmpegArgs.push("-c:a", "aac", "-b:a", "192k");
    } else {
      ffmpegArgs.push("-an");
    }

    ffmpegArgs.push("-y", tempOutputPath);

    execFileSync(ffmpegPath, ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 200 * 1024 * 1024,
      timeout: 300000, // 5 minutes
    });

    const outputBuffer = fs.readFileSync(tempOutputPath);
    const outputBase64 = outputBuffer.toString("base64");

    // Cleanup
    try { fs.unlinkSync(tempInputPath); } catch (e) {}
    try { fs.unlinkSync(tempOutputPath); } catch (e) {}

    return res.status(200).json({
      success: true,
      videoData: `data:video/mp4;base64,${outputBase64}`,
      originalSize: { width: inputW, height: inputH },
      outputSize: { width: finalW, height: finalH },
      scale: scaleNum,
      fileSizeBytes: outputBuffer.length,
    });

  } catch (err) {
    try { if (tempInputPath) fs.unlinkSync(tempInputPath); } catch (e) {}
    try { if (tempOutputPath) fs.unlinkSync(tempOutputPath); } catch (e) {}
    console.error("video-upscale error:", err);
    const errMsg = err.stderr?.toString() || err.message || "";
    return res.status(500).json({
      error: `ভিডিও প্রসেসিং ব্যর্থ: ${errMsg.slice(0, 200) || "Unknown error"}`,
    });
  }
}
