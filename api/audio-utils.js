import fs from "fs";
import path from "path";

/**
 * Audio processing utilities and error handling
 */

// ── Logger ──────────────────────────────────────────────────────────────
export const audioLogger = {
  info: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[AUDIO-INFO] ${timestamp}: ${msg}`, data || "");
  },
  error: (msg, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[AUDIO-ERROR] ${timestamp}: ${msg}`, error || "");
  },
  warn: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[AUDIO-WARN] ${timestamp}: ${msg}`, data || "");
  },
  debug: (msg, data = null) => {
    if (process.env.DEBUG_AUDIO) {
      const timestamp = new Date().toISOString();
      console.debug(`[AUDIO-DEBUG] ${timestamp}: ${msg}`, data || "");
    }
  },
};

// ── Custom Error Classes ────────────────────────────────────────────────
export class AudioProcessingError extends Error {
  constructor(message, code = "AUDIO_PROCESSING_ERROR", statusCode = 500) {
    super(message);
    this.name = "AudioProcessingError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AudioValidationError extends AudioProcessingError {
  constructor(message) {
    super(message, "AUDIO_VALIDATION_ERROR", 400);
    this.name = "AudioValidationError";
  }
}

export class FFmpegError extends AudioProcessingError {
  constructor(message, stderr = "") {
    super(message, "FFMPEG_ERROR", 500);
    this.name = "FFmpegError";
    this.stderr = stderr;
  }
}

// ── Input Validation ────────────────────────────────────────────────────
export function validateAudioFile(file) {
  if (!file) {
    throw new AudioValidationError("No audio file provided");
  }

  const allowedMimes = [
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
    "audio/aac",
    "audio/ogg",
    "audio/webm",
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    throw new AudioValidationError(
      `Invalid audio format: ${file.mimetype}. Allowed: ${allowedMimes.join(", ")}`
    );
  }

  const maxSize = 210 * 1024 * 1024; // 210MB
  if (file.size > maxSize) {
    throw new AudioValidationError(
      `File size exceeds limit: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${maxSize / 1024 / 1024}MB`
    );
  }

  return true;
}

export function validateOperations(operations) {
  if (!Array.isArray(operations)) {
    throw new AudioValidationError("Operations must be an array");
  }

  const validOperations = [
    "noise_reduction",
    "de_essing",
    "vocal_enhancement",
    "pitch_shift",
    "speed_change",
    "normalize",
    "fade_in",
    "fade_out",
    "trim",
  ];

  for (const op of operations) {
    if (!op.type || !validOperations.includes(op.type)) {
      throw new AudioValidationError(`Invalid operation type: ${op.type}`);
    }
  }

  return true;
}

// ── File Management ────────────────────────────────────────────────────
export function ensureTempDir(tempDir) {
  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      audioLogger.info(`Created temp directory: ${tempDir}`);
    }
    return tempDir;
  } catch (error) {
    throw new AudioProcessingError(
      `Failed to create temp directory: ${error.message}`
    );
  }
}

export function cleanupTempDir(tempDir) {
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      audioLogger.info(`Cleaned up temp directory: ${tempDir}`);
    }
  } catch (error) {
    audioLogger.warn(`Failed to cleanup temp directory: ${error.message}`);
  }
}

export function getOutputPath(tempDir, format = "mp3") {
  return path.join(tempDir, `output.${format}`);
}

// ── FFmpeg Command Building ────────────────────────────────────────────
export function buildFFmpegArgs(inputPath, outputPath, filterChain, options = {}) {
  const {
    codec = "libmp3lame",
    bitrate = "192k",
    sampleRate = "44100",
    channels = 2,
  } = options;

  const args = ["-i", inputPath];

  if (filterChain) {
    args.push("-af", filterChain);
  }

  args.push(
    "-acodec", codec,
    "-ab", bitrate,
    "-ar", sampleRate,
    "-ac", channels.toString(),
    "-y",
    outputPath
  );

  return args;
}

// ── Response Handling ────────────────────────────────────────────────────
export function sendAudioResponse(res, audioBuffer, filename = "output.mp3") {
  try {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", audioBuffer.length);
    res.send(audioBuffer);
    audioLogger.info(`Sent audio response: ${filename} (${audioBuffer.length} bytes)`);
  } catch (error) {
    audioLogger.error("Failed to send audio response", error);
    throw error;
  }
}

export function sendErrorResponse(res, error) {
  const statusCode = error.statusCode || 500;
  const response = {
    error: error.name || "AudioProcessingError",
    message: error.message,
    code: error.code || "UNKNOWN_ERROR",
  };

  if (process.env.DEBUG_AUDIO && error.stderr) {
    response.details = error.stderr;
  }

  audioLogger.error(`Sending error response: ${error.message}`, error);
  res.status(statusCode).json(response);
}

// ── Progress Tracking ────────────────────────────────────────────────────
export class ProgressTracker {
  constructor(totalSteps = 100) {
    this.totalSteps = totalSteps;
    this.currentStep = 0;
    this.startTime = Date.now();
  }

  step(stepName) {
    this.currentStep++;
    const progress = Math.round((this.currentStep / this.totalSteps) * 100);
    const elapsed = (Date.now() - this.startTime) / 1000;
    audioLogger.debug(`Progress: ${progress}% - ${stepName} (${elapsed.toFixed(1)}s)`);
    return progress;
  }

  complete() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    audioLogger.info(`Processing completed in ${totalTime.toFixed(2)}s`);
  }
}

// ── Performance Monitoring ────────────────────────────────────────────────
export class PerformanceMonitor {
  constructor(name) {
    this.name = name;
    this.startTime = Date.now();
  }

  mark(label) {
    const elapsed = Date.now() - this.startTime;
    audioLogger.debug(`[${this.name}] ${label}: ${elapsed}ms`);
  }

  end() {
    const totalTime = Date.now() - this.startTime;
    audioLogger.info(`[${this.name}] Total time: ${totalTime}ms`);
    return totalTime;
  }
}
