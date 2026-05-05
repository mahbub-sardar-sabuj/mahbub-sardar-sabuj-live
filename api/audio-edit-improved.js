import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { exec, execFile } from "child_process";
import util from "util";

const execFileAsync = util.promisify(execFile);
const execAsync = util.promisify(exec);

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "210mb",
  },
};

// ── Logger utility ──────────────────────────────────────────────────────
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()}: ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()}: ${msg}`),
};

// ── Resolve FFmpeg path ──────────────────────────────────────────────────
function getFFmpegPath() {
  let ffmpegPath = "ffmpeg";
  try {
    if (ffmpegInstaller?.path && fs.existsSync(ffmpegInstaller.path)) {
      ffmpegPath = ffmpegInstaller.path;
      fs.chmodSync(ffmpegPath, 0o755);
    }
  } catch (e) {
    logger.warn(`Failed to resolve FFmpeg path: ${e.message}`);
  }
  return ffmpegPath;
}

// ── Async FFmpeg command execution ──────────────────────────────────────
async function runFFmpegCommand(ffmpegPath, args, options = {}) {
  try {
    const { timeout = 55000, maxBuffer = 50 * 1024 * 1024 } = options;
    
    logger.info(`Running FFmpeg command: ${ffmpegPath} ${args.join(" ")}`);
    
    const { stdout, stderr } = await execFileAsync(ffmpegPath, args, {
      timeout,
      maxBuffer,
      stdio: ["ignore", "pipe", "pipe"],
    });

    logger.info("FFmpeg command completed successfully");
    return { stdout, stderr, success: true };
  } catch (error) {
    logger.error(`FFmpeg command failed: ${error.message}`);
    logger.error(`stderr: ${error.stderr}`);
    throw new Error(`FFmpeg processing failed: ${error.message}`);
  }
}

// ── Get audio duration ──────────────────────────────────────────────────
async function getAudioDuration(filePath, ffmpegPath) {
  try {
    const ffprobePath = ffmpegPath.replace(/ffmpeg$/, "ffprobe");
    
    if (!fs.existsSync(ffprobePath)) {
      logger.warn("ffprobe not found, using fallback method");
      return null;
    }

    const { stdout } = await execFileAsync(ffprobePath, [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);

    const duration = parseFloat(stdout.trim());
    if (!isNaN(duration) && duration > 0) {
      logger.info(`Audio duration: ${duration} seconds`);
      return duration;
    }
  } catch (error) {
    logger.warn(`Failed to get audio duration: ${error.message}`);
  }

  return null;
}

// ── Noise Reduction Filter ──────────────────────────────────────────────
function getNoiseReductionFilter(intensity = "medium") {
  const intensityMap = {
    light: "afftdn=nr=8:nf=-20:nt=w",
    medium: "afftdn=nr=15:nf=-25:nt=w,afftdn=nr=8:nf=-18:nt=w",
    heavy: "afftdn=nr=20:nf=-30:nt=w,afftdn=nr=12:nf=-22:nt=w,afftdn=nr=6:nf=-15:nt=w",
  };
  return intensityMap[intensity] || intensityMap.medium;
}

// ── De-essing Filter ────────────────────────────────────────────────────
function getDeEssingFilter(intensity = "medium") {
  const intensityMap = {
    light: "equalizer=f=6000:t=h:width=2000:g=-2",
    medium: "equalizer=f=7000:t=h:width=2500:g=-3.5",
    heavy: "equalizer=f=7500:t=h:width=3000:g=-5",
  };
  return intensityMap[intensity] || intensityMap.medium;
}

// ── Build comprehensive vocal enhancement filter ─────────────────────────
function getVocalEnhancementFilter(vocalContext = "general", options = {}) {
  const {
    enableNoiseReduction = true,
    enableDeEssing = true,
    noiseIntensity = "medium",
    deEssIntensity = "medium",
  } = options;

  let filters = [];

  // Subsonic removal
  filters.push("highpass=f=75");

  // Noise reduction
  if (enableNoiseReduction) {
    filters.push(getNoiseReductionFilter(noiseIntensity));
  }

  // De-essing
  if (enableDeEssing) {
    filters.push(getDeEssingFilter(deEssIntensity));
  }

  // Context-aware EQ and compression
  switch (vocalContext) {
    case "poetry":
      filters.push(
        "equalizer=f=160:t=h:width=120:g=2.5," +
        "equalizer=f=320:t=h:width=200:g=2.0," +
        "equalizer=f=700:t=h:width=300:g=-1.0," +
        "equalizer=f=2500:t=h:width=1500:g=2.0," +
        "equalizer=f=5000:t=h:width=2000:g=1.5," +
        "acompressor=threshold=-24dB:ratio=2.2:attack=25:release=350:knee=10dB:makeup=1dB"
      );
      break;
    case "narration":
      filters.push(
        "equalizer=f=160:t=h:width=120:g=1.5," +
        "equalizer=f=700:t=h:width=300:g=-1.5," +
        "equalizer=f=2500:t=h:width=1500:g=3.0," +
        "equalizer=f=5000:t=h:width=2000:g=2.5," +
        "equalizer=f=9000:t=h:width=3000:g=1.0," +
        "acompressor=threshold=-20dB:ratio=3.0:attack=12:release=180:knee=6dB:makeup=1.5dB"
      );
      break;
    case "deep":
      filters.push(
        "equalizer=f=200:t=h:width=150:g=-2.0," +
        "equalizer=f=320:t=h:width=200:g=1.5," +
        "equalizer=f=2500:t=h:width=1500:g=2.5," +
        "equalizer=f=4500:t=h:width=2000:g=2.0," +
        "acompressor=threshold=-20dB:ratio=3.5:attack=18:release=200:knee=5dB:makeup=1dB"
      );
      break;
    case "soft":
      filters.push(
        "equalizer=f=160:t=h:width=120:g=3.0," +
        "equalizer=f=320:t=h:width=200:g=2.0," +
        "equalizer=f=700:t=h:width=300:g=-1.0," +
        "equalizer=f=3500:t=h:width=1500:g=2.0," +
        "equalizer=f=6000:t=h:width=2000:g=1.5," +
        "acompressor=threshold=-28dB:ratio=2.0:attack=28:release=380:knee=12dB:makeup=1dB"
      );
      break;
    default:
      filters.push(
        "equalizer=f=160:t=h:width=120:g=2.0," +
        "equalizer=f=320:t=h:width=200:g=1.5," +
        "equalizer=f=700:t=h:width=300:g=-1.5," +
        "equalizer=f=2500:t=h:width=1500:g=2.5," +
        "equalizer=f=5000:t=h:width=2000:g=2.0," +
        "equalizer=f=9000:t=h:width=3000:g=1.0," +
        "acompressor=threshold=-22dB:ratio=2.8:attack=18:release=250:knee=8dB:makeup=1.5dB"
      );
  }

  // Loudness normalization
  filters.push("loudnorm=I=-16:TP=-1.5:LRA=11");

  return filters.join(",");
}

// ── Main handler ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let tempDir;
  try {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "audio-edit-"));
    logger.info(`Created temp directory: ${tempDir}`);

    const form = new formidable.IncomingForm({
      uploadDir: tempDir,
      keepExtensions: true,
      maxFileSize: 210 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);
    logger.info(`Parsed form data: ${JSON.stringify(Object.keys(fields))}`);

    // Extract parameters
    const audioFile = files.audio?.[0];
    const musicFile = files.music?.[0];
    const operations = JSON.parse(fields.operations?.[0] || "[]");
    const vocalContext = fields.vocal_context?.[0] || "general";
    const enableNoiseReduction = fields.enable_noise_reduction?.[0] !== "false";
    const enableDeEssing = fields.enable_de_essing?.[0] !== "false";

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    logger.info(`Processing audio file: ${audioFile.originalFilename}`);

    const ffmpegPath = getFFmpegPath();
    const outputPath = path.join(tempDir, "output.mp3");

    // Build filter chain
    let filterChain = getVocalEnhancementFilter(vocalContext, {
      enableNoiseReduction,
      enableDeEssing,
    });

    // Apply additional operations if provided
    if (operations.length > 0) {
      logger.info(`Applying ${operations.length} operations`);
      // Additional operations can be added here
    }

    // Run FFmpeg
    const ffmpegArgs = [
      "-i", audioFile.filepath,
      "-af", filterChain,
      "-acodec", "libmp3lame",
      "-ab", "192k",
      "-ar", "44100",
      "-y",
      outputPath,
    ];

    await runFFmpegCommand(ffmpegPath, ffmpegArgs);

    // Read output file
    const audioBuffer = fs.readFileSync(outputPath);

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
    logger.info("Cleaned up temp directory");

    // Send response
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", 'attachment; filename="output.mp3"');
    res.send(audioBuffer);
  } catch (error) {
    logger.error(`Handler error: ${error.message}`);
    
    // Clean up on error
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    res.status(500).json({
      error: "Audio processing failed",
      message: error.message,
    });
  }
}
