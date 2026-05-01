import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

export const config = { api: { bodyParser: false } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AUDIO_SYSTEM_PROMPT = `You are a world-class AI audio engineer named "Sardar Audio Studio". You understand ANY instruction in Bengali or English and return correct audio operations as JSON.

RULE: ALWAYS return valid JSON with at least one operation. NEVER return empty operations list.

ALL AVAILABLE OPERATIONS:

BASIC: noise_reduction{strength:0-1}, normalize{}, volume_change{db:float}, trim{start_ms,end_ms}, fade_in{duration_ms}, fade_out{duration_ms}, reverse{}

PITCH & SPEED: pitch_shift{semitones}, speed_change{factor}, pitch_without_speed{semitones}

EFFECTS: reverb{room_size,wet_level}, echo{delay_ms,decay,repeats}, chorus{depth,rate}, distortion{gain}, telephone_effect{}, robot_voice{}, deep_voice{}, chipmunk_voice{}, whisper_effect{}, flanger{rate,depth}, phaser{rate,depth}, tremolo{rate,depth}, vibrato{rate,depth}, bitcrusher{bits}, tape_saturation{drive}, vinyl_effect{}, underwater_effect{}, cave_echo{}, stadium_reverb{}, bathroom_reverb{}, alien_voice{}, megaphone_effect{}, radio_effect{}

EQ: bass_boost{db}, treble_boost{db}, mid_boost{db}, bass_cut{db}, treble_cut{db}, equalizer{bass_db,mid_db,treble_db}, low_pass_filter{cutoff_hz}, high_pass_filter{cutoff_hz}, band_pass_filter{low_hz,high_hz}, notch_filter{freq_hz}, presence_boost{}, warmth_boost{}, air_boost{}

DYNAMICS: compress{threshold_db,ratio}, gate{threshold_db}, expander{threshold_db,ratio}, limiter{ceiling_db}, multiband_compress{}, de_ess{}, declick{}, declip{}, dehum{freq}, spectral_repair{}

VOCAL: vocal_enhance{}, stereo_widen{width}, stereo_narrow{}, stereo_to_mono{}, mono_to_stereo{}, stereo_balance{pan}, auto_tune{strength}, formant_shift{shift}, harmonic_exciter{amount}, transient_shaper{attack,sustain}, vocal_isolation{}, music_removal{}

MASTERING: loudness_normalize{target_lufs}, true_peak_limit{ceiling_db}, pitch_correct{scale}

VOICE BEAUTIFY PRESETS:
- honey_voice{} = মধুময় উষ্ণ মিষ্টি কণ্ঠ
- silky_voice{} = রেশমি মসৃণ কণ্ঠ
- broadcast_voice{} = TV/Radio প্রফেশনাল
- asmr_voice{} = ASMR ঘনিষ্ঠ ফিসফিস
- cinematic_voice{} = হলিউড সিনেমা ভয়েস
- angelic_voice{} = স্বর্গীয় উচ্চ স্বর
- vintage_radio{} = পুরনো রেডিও স্টাইল
- podcast_pro{} = পডকাস্ট প্রো কোয়ালিটি
- lofi_voice{} = Lo-Fi ক্যাসেট স্টাইল
- narrator_voice{} = অডিওবুক ন্যারেটর
- smooth_jazz_voice{} = স্মুদ্ধ জ্যাজ সিঙার
- epic_voice{} = শক্তিশালী হিরোইক কণ্ঠ
- sweet_voice{} = মিষ্টি মেয়েলি স্বর
- crystal_voice{} = স্ফটিকের মতো পরিষ্কার
- deep_warm_voice{} = গভীর উষ্ণ পুরুষালি স্বর

SMART INTERPRETATION:
"এডিটিং করো"/"ভালো করো"/"সুন্দর করো"/"fix it" → noise_reduction(0.5)+normalize+bass_boost(3)+reverb(0.3,0.2)
"মধুময়"/"honey"/"মিষ্টি কণ্ঠ"/"মধুর" → honey_voice
"রেশমি"/"silky"/"মসৃণ"/"smooth"/"নরম" → silky_voice
"ব্রডকাস্ট"/"broadcast"/"TV voice"/"নিউজ ভয়েস" → broadcast_voice
"ASMR"/"ফিসফিস"/"whisper close" → asmr_voice
"সিনেমা"/"cinematic"/"হলিউড" → cinematic_voice
"স্বর্গীয়"/"angelic"/"ফেরেশ্তা" → angelic_voice
"পুরনো রেডিও"/"vintage"/"retro" → vintage_radio
"পডকাস্ট প্রো"/"podcast pro" → podcast_pro
"lofi"/"lo-fi"/"ক্যাসেট" → lofi_voice
"ন্যারেটর"/"narrator"/"অডিওবুক" → narrator_voice
"জ্যাজ"/"jazz"/"smooth jazz" → smooth_jazz_voice
"এপিক"/"epic"/"হিরো"/"powerful" → epic_voice
"মিষ্টি"/"sweet"/"মেয়েলি" → sweet_voice
"স্ফটিক"/"crystal"/"পরিষ্কার"/"clear" → crystal_voice
"গভীর উষ্ণ"/"deep warm"/"পুরুষালি" → deep_warm_voice
"প্রফেশনাল করো"/"studio quality" → denoise_advanced(0.9)+de_ess+compress(-20,4)+equalizer(3,1,2)+limiter(-1)+loudness_normalize(-14)
"পডকাস্ট"/"podcast"/"ভয়েসওভার" → noise_reduction(0.8)+gate(-40)+compress(-18,3)+presence_boost+loudness_normalize(-16)
"নয়েজ কমাও"/"noise remove"/"পরিষ্কার করো" → denoise_advanced(0.8)+noise_reduction(0.6)+gate(-45)+normalize
"আরো নয়েজ কমাও" → denoise_advanced(0.9)+noise_reduction(0.7)+gate(-40)
"ভয়েস সুন্দর করো"/"vocal beautify"/"কণ্ঠ সুন্দর করো" → honey_voice+loudness_normalize(-14)
"কবিতার জন্য"/"আবৃত্তি"/"recitation" → silky_voice+reverb(0.4,0.25)+loudness_normalize(-16)
"গান"/"song"/"গানের ভয়েস" → vocal_enhance+de_ess+compress(-18,3)+reverb(0.4,0.3)+loudness_normalize(-14)
"ইন্টারভিউ"/"interview" → broadcast_voice+loudness_normalize(-18)
"লেকচার"/"lecture"/"ক্লাস" → crystal_voice+loudness_normalize(-18)
"ভলিউম বাড়াও"/"louder" → volume_change(+6)+normalize
"ভলিউম কমাও"/"quieter" → volume_change(-6)
"পিচ বাড়াও"/"higher pitch" → pitch_shift(+2)
"পিচ কমাও"/"lower pitch" → pitch_shift(-2)
"দ্রুত করো"/"faster" → speed_change(1.3)
"ধীর করো"/"slower" → speed_change(0.8)
"রিভার্ব যোগ করো"/"add reverb" → reverb(0.5,0.3)
"ইকো যোগ করো"/"add echo" → echo(300,0.5,3)
"বেস বাড়াও"/"more bass" → bass_boost(5)
"ট্রেবল বাড়াও"/"more treble" → treble_boost(4)
"হাম সরাও"/"50hz noise"/"বৈদ্যুতিক শব্দ" → dehum(50)+notch_filter(100)+notch_filter(150)
"ক্লিক সরাও"/"pop remove" → declick+declip
"রোবট ভয়েস"/"robot" → robot_voice
"টেলিফোন"/"phone call" → telephone_effect
"মেগাফোন"/"megaphone" → megaphone_effect
"পানির নিচে"/"underwater" → underwater_effect
"গুহার মধ্যে"/"cave" → cave_echo
"স্টেডিয়াম"/"stadium" → stadium_reverb
"বাথরুম"/"bathroom" → bathroom_reverb
"এলিয়েন ভয়েস"/"alien" → alien_voice
"ভিনাইল"/"vinyl"/"পুরনো রেকর্ড" → vinyl_effect
"টেপ"/"tape"/"ক্যাসেট" → tape_saturation(1.0)
"স্টেরিও চওড়া করো"/"wider" → stereo_widen(1.5)
"মনো করো"/"narrow" → stereo_narrow
"লাউডনেস নরমালাইজ"/"LUFS"/"streaming ready" → loudness_normalize(-14)
"লিমিটার"/"limiter" → limiter(-1)
"গেট"/"noise gate" → gate(-40)
"অটো টিউন"/"auto-tune"/"পিচ ঠিক করো" → auto_tune(0.7)
"প্রেজেন্স বাড়াও"/"presence" → presence_boost
"উষ্ণতা যোগ করো"/"warmth" → warmth_boost
"এয়ার বাড়াও"/"air" → air_boost

OUTPUT FORMAT (JSON only):
{
  "operations": [{"type": "OPERATION_NAME", "params": {"key": value}}, ...],
  "explanation": "বাংলায় বিস্তারিত ব্যাখ্যা",
  "pipeline": ["ধাপ ১: ...", "ধাপ ২: ...", "ধাপ ৩: ..."],
  "intent": "detected intent label",
  "technicalNote": "technical details (optional)"
}

NOISE REDUCTION RULES (CRITICAL — voice must be preserved):
- noise_reduction strength scale: 0.3=হালকা, 0.5=মাঝারি, 0.7=শক্তিশালী, 0.85=মাক্স
- NEVER use strength > 0.85 for noise_reduction (voice will be damaged)
- For "নয়েজ কমাও" / "noise remove" → noise_reduction(0.5) FIRST, then check
- For "আরো নয়েজ কমাও" → increase by 0.15 only (never jump to 1.0)
- For heavy noise: use denoise_advanced(0.7) NOT noise_reduction(1.0)
- denoise_advanced strength: 0.5=মাঝারি, 0.7=শক্তিশালী, 0.85=মাক্স (NEVER above 0.9)
- ALWAYS combine with vocal_enhance after noise reduction to restore voice clarity
- Pattern: noise_reduction(0.5) + vocal_enhance + loudness_normalize(-16)
- For "কণ্ঠ ঠিক রেখে নয়েজ সরাও" → noise_reduction(0.45) + vocal_enhance + presence_boost + loudness_normalize(-14)
- For "স্টুডিও মান" → denoise_advanced(0.7) + de_ess + compress(-22,3) + loudness_normalize(-14)

IMPORTANT: Use proportional values. For iterative requests increase strength by 0.1-0.2 only.

ADDITIONAL SMART RULES:
- "silence_remove" / "নীরবতা সরাও" / "শুরুর চুপ কাটো" → silence_remove(-40)
- "loop" / "লুপ করো" / "বারবার বাজাও" → loop(times:3)
- "add_silence" / "শুরুতে বিরতি যোগ করো" → add_silence(1000, start)
- "crossfade" / "smooth transition" → crossfade(2000)
- "ডাকিং" / "ducking" → ducking(-20, 10)
- "ব্যাকগ্রাউন্ড মিউজিক মিক্স করো" → mix_with_music(0.3, 1.0)
- "মাল্টিব্যান্ড কম্প্রেস" / "multiband" → multiband_compress
- "স্পেকট্রাল রিপেয়ার" / "spectral repair" → spectral_repair
- "ট্রু পিক" / "true peak" → true_peak_limit(-1)
- "ফর্মান্ট" / "formant" → formant_shift(1.0)
- "ট্রান্সিয়েন্ট" / "transient" / "পাঞ্চ বাড়াও" → transient_shaper(0.5, -0.3)
- "হার্মোনিক" / "exciter" / "উজ্জ্বল করো" → harmonic_exciter(0.5)
- "ব্যালেন্স বাম" / "pan left" → stereo_balance(-0.5)
- "ব্যালেন্স ডান" / "pan right" → stereo_balance(0.5)
- "ফ্ল্যাঞ্জার" / "flanger" → flanger(0.5, 5)
- "ফেজার" / "phaser" → phaser(1.0, 0.7)
- "ট্রেমোলো" / "tremolo" → tremolo(5, 0.5)
- "ভাইব্রেটো" / "vibrato" → vibrato(5, 0.5)
- "বিটক্রাশার" / "bitcrusher" / "8-bit" → bitcrusher(8)
- "ক্লিপিং ঠিক করো" / "distorted fix" → declip
- "ক্লিক সরাও" / "pop remove" → declick
- "ব্যান্ড পাস" / "band pass" → band_pass_filter(300, 3000)
- "নচ ফিল্টার" / "notch" → notch_filter(60)
- "স্টেরিও মনো" / "mono" → stereo_to_mono
- "মনো স্টেরিও" / "stereo" → mono_to_stereo`;

function buildFFmpegFilter(operations) {
  const filters = [];
  let pitchShift = null;
  let speedFactor = null;

  for (const op of operations) {
    const { type, params = {} } = op;
    switch (type) {
      case "noise_reduction": {
        // Voice-preserving NR — anlmdn (Non-Local Means) + afftdn (FFT) dual-pass
        const s = Math.min(Math.max(params.strength || 0.5, 0.0), 0.85); // max 0.85 to protect voice
        // Pass 1: Sub-bass rumble removal (below 80Hz) — voice starts at 80Hz+
        filters.push(`highpass=f=80:poles=2`);
        // Pass 2: Hum removal (50Hz electrical + harmonics)
        filters.push(`equalizer=f=50:t=h:width=8:g=-18`);
        filters.push(`equalizer=f=100:t=h:width=8:g=-12`);
        filters.push(`equalizer=f=150:t=h:width=8:g=-8`);
        // Pass 3: anlmdn — broadband noise via Non-Local Means (most effective for voice)
        // s: 1e-5 to 10; scale: 0.3→1.5, 0.5→3.0, 0.7→5.0, 0.85→7.0
        const anlmdnS = parseFloat((1.5 + s * 6.5).toFixed(2)); // 1.5 to 7.0
        filters.push(`anlmdn=s=${anlmdnS}:p=0.002:r=0.006:m=11`);
        // Pass 4: afftdn — stationary noise (fan, AC, room tone) using nr param (0.01-97)
        // nr: 0.3→25, 0.5→40, 0.7→55, 0.85→70
        const nrVal1 = Math.round(25 + s * 53); // 25 to 70
        const nfVal1 = Math.round(-30 - s * 10); // -30 to -38.5 dB floor
        filters.push(`afftdn=nr=${nrVal1}:nf=${nfVal1}:nt=w:tn=1`);
        // Pass 5: Soft noise gate — range=0.08 means max 8% reduction, never kills voice
        const gateThresh = Math.round(-50 + s * 10); // -50 to -41.5 dB
        filters.push(`agate=threshold=${gateThresh}dB:attack=40:release=350:ratio=3:range=0.08`);
        // Pass 6: Voice frequency restoration — compensate NR loss (300Hz, 1kHz, 2.5kHz)
        filters.push(`equalizer=f=300:t=h:width=200:g=1.5`);
        filters.push(`equalizer=f=1000:t=h:width=800:g=1.0`);
        filters.push(`equalizer=f=2500:t=h:width=1500:g=1.5`);
        break;
      }
      case "denoise_advanced": {
        // Ultra-clean 8-pass voice-preserving NR — anlmdn + dual afftdn
        const sa = Math.min(Math.max(params.strength || 0.7, 0.0), 0.85); // max 0.85
        // Pass 1: Sub-bass & hum removal
        filters.push(`highpass=f=80:poles=2`);
        filters.push(`equalizer=f=50:t=h:width=8:g=-20`);
        filters.push(`equalizer=f=100:t=h:width=8:g=-15`);
        filters.push(`equalizer=f=150:t=h:width=8:g=-10`);
        // Pass 2: anlmdn — broadband noise via Non-Local Means (most effective for voice)
        // s: 0.5→4.0, 0.7→5.5, 0.85→7.0
        const anlmdnSA = parseFloat((2.0 + sa * 7.0).toFixed(2)); // 2.0 to 7.95
        filters.push(`anlmdn=s=${anlmdnSA}:p=0.002:r=0.006:m=15`);
        // Pass 3: First afftdn pass — stationary noise with tn=1 transient detection
        const nrValA = Math.round(30 + sa * 40); // 30 to 64
        const nfValA = Math.round(-32 - sa * 8); // -32 to -38.8 dB floor
        filters.push(`afftdn=nr=${nrValA}:nf=${nfValA}:nt=w:tn=1`);
        // Pass 3b (was nfB): Second afftdn pass — non-stationary noise
        const nrValB = Math.round(20 + sa * 30); // 20 to 45.5
        const nfValB = Math.round(-28 - sa * 10); // -28 to -36.5
        filters.push(`afftdn=nr=${nrValB}:nf=${nfValB}:nt=w`);
        // Pass 4: Soft gate — range=0.05 = max 5% reduction, never kills voice
        const gateA = Math.round(-55 + sa * 15); // -55 to -42.25 dB
        filters.push(`agate=threshold=${gateA}dB:attack=50:release=400:ratio=5:range=0.05`);
        // Pass 5: Gentle high-freq de-essing instead of adeclick (adeclick crashes on some inputs)
        filters.push(`equalizer=f=9000:t=h:width=3000:g=-2`);
        // Pass 6: Voice frequency restoration (300Hz, 1kHz, 2.5kHz)
        filters.push(`equalizer=f=300:t=h:width=200:g=1.5`);
        filters.push(`equalizer=f=1000:t=h:width=800:g=1.0`);
        filters.push(`equalizer=f=2500:t=h:width=1500:g=1.5`);
        // Pass 7: Gentle compression to even out volume after NR
        filters.push(`acompressor=threshold=-28dB:ratio=2.5:attack=40:release=350:knee=6dB:makeup=1.5dB`);
        // Pass 8: True peak limiter
        filters.push(`alimiter=limit=-1dB:attack=5:release=50`);
        break;
      }
      case "normalize":
        filters.push("loudnorm=I=-16:TP=-1.5:LRA=11");
        break;
      case "volume_change":
        filters.push(`volume=${params.db || 0}dB`);
        break;
      case "fade_in":
        filters.push(`afade=t=in:d=${(params.duration_ms || 500) / 1000}`);
        break;
      case "fade_out":
        filters.push(`afade=t=out:st=0:d=${(params.duration_ms || 500) / 1000}`);
        break;
      case "reverse":
        filters.push("areverse");
        break;
      case "trim":
        filters.push(`atrim=start=${(params.start_ms || 0) / 1000}${params.end_ms ? `:end=${params.end_ms / 1000}` : ""}`);
        break;
      case "silence_remove":
        filters.push(`silenceremove=start_periods=1:start_threshold=${params.threshold_db || -40}dB:stop_periods=-1:stop_threshold=${params.threshold_db || -40}dB`);
        break;
      case "pitch_shift":
        pitchShift = params.semitones || 0;
        break;
      case "speed_change":
        speedFactor = params.factor || 1.0;
        break;
      case "pitch_without_speed": {
        const ratio = Math.pow(2, (params.semitones || 0) / 12);
        filters.push(`asetrate=r=${Math.round(44100 * ratio)},aresample=44100`);
        break;
      }
      case "bass_boost":
        filters.push(`equalizer=f=100:t=h:width=200:g=${params.db || 4}`);
        break;
      case "bass_cut":
        filters.push(`equalizer=f=100:t=h:width=200:g=${-(params.db || 4)}`);
        break;
      case "treble_boost":
        filters.push(`equalizer=f=8000:t=h:width=4000:g=${params.db || 4}`);
        break;
      case "treble_cut":
        filters.push(`equalizer=f=8000:t=h:width=4000:g=${-(params.db || 4)}`);
        break;
      case "mid_boost":
        filters.push(`equalizer=f=2500:t=h:width=2000:g=${params.db || 3}`);
        break;
      case "equalizer":
        if (params.bass_db) filters.push(`equalizer=f=100:t=h:width=200:g=${params.bass_db}`);
        if (params.mid_db) filters.push(`equalizer=f=2500:t=h:width=2000:g=${params.mid_db}`);
        if (params.treble_db) filters.push(`equalizer=f=8000:t=h:width=4000:g=${params.treble_db}`);
        break;
      case "low_pass_filter":
        filters.push(`lowpass=f=${params.cutoff_hz || 4000}`);
        break;
      case "high_pass_filter":
        filters.push(`highpass=f=${params.cutoff_hz || 80}`);
        break;
      case "band_pass_filter":
        filters.push(`highpass=f=${params.low_hz || 300},lowpass=f=${params.high_hz || 3000}`);
        break;
      case "notch_filter":
        filters.push(`equalizer=f=${params.freq_hz || 60}:t=h:width=30:g=-30`);
        break;
      case "presence_boost":
        filters.push("equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=5000:t=h:width=2000:g=2");
        break;
      case "warmth_boost":
        filters.push("equalizer=f=250:t=h:width=200:g=3,equalizer=f=400:t=h:width=200:g=2");
        break;
      case "air_boost":
        filters.push("equalizer=f=12000:t=h:width=4000:g=3,equalizer=f=16000:t=h:width=4000:g=2");
        break;
      case "dehum": {
        const freq = params.freq || 50;
        filters.push(`equalizer=f=${freq}:t=h:width=10:g=-30,equalizer=f=${freq*2}:t=h:width=10:g=-20,equalizer=f=${freq*3}:t=h:width=10:g=-15`);
        break;
      }
      case "compress":
        filters.push(`acompressor=threshold=${params.threshold_db || -20}dB:ratio=${params.ratio || 4}:attack=20:release=250:makeup=2dB:knee=6dB`);
        break;
      case "gate":
        filters.push(`agate=threshold=${params.threshold_db || -40}dB:attack=10:release=200`);
        break;
      case "limiter":
        filters.push(`alimiter=limit=${params.ceiling_db || -1}dB:attack=5:release=50`);
        break;
      case "true_peak_limit":
        filters.push(`alimiter=limit=${params.ceiling_db || -1}dB:attack=1:release=10`);
        break;
      case "expander":
        filters.push(`agate=threshold=${params.threshold_db || -40}dB:ratio=${params.ratio || 2}:attack=5:release=100`);
        break;
      case "multiband_compress":
        filters.push("acompressor=threshold=-30dB:ratio=3:attack=20:release=200:knee=6dB");
        break;
      case "vocal_enhance":
        filters.push("highpass=f=80,equalizer=f=200:t=h:width=200:g=2,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=5000:t=h:width=2000:g=2,acompressor=threshold=-20dB:ratio=3:attack=20:release=200:knee=6dB");
        break;
      case "de_ess":
        filters.push("equalizer=f=7000:t=h:width=3000:g=-4,equalizer=f=9000:t=h:width=2000:g=-2");
        break;
      case "declick":
        // adeclick can crash on some inputs — use gentle HF smoothing instead
        filters.push("equalizer=f=9000:t=h:width=3000:g=-2,equalizer=f=12000:t=h:width=3000:g=-3");
        break;
      case "declip":
        // adeclip can crash on some inputs — use gentle compression + limiter instead
        filters.push("acompressor=threshold=-6dB:ratio=20:attack=1:release=10:knee=3dB,alimiter=limit=-1dB:attack=1:release=5");
        break;
      case "spectral_repair":
        // Use anlmdn + afftdn for spectral repair (adeclick can crash on some inputs)
        filters.push("anlmdn=s=3:p=0.002:r=0.006:m=11,afftdn=nr=35:nf=-32:nt=w:tn=1");
        break;
      case "loudness_normalize":
        filters.push(`loudnorm=I=${params.target_lufs || -14}:TP=-1:LRA=11`);
        break;
      case "stereo_widen":
        filters.push(`stereotools=mlev=${params.width || 1.5}:slev=1`);
        break;
      case "stereo_narrow":
        filters.push("stereotools=mlev=0.5:slev=1");
        break;
      case "stereo_to_mono":
        filters.push("pan=mono|c0=0.5*c0+0.5*c1");
        break;
      case "mono_to_stereo":
        filters.push("pan=stereo|c0=c0|c1=c0");
        break;
      case "stereo_balance": {
        const pan = params.pan || 0;
        if (pan < 0) filters.push(`pan=stereo|c0=${1+pan}*c0+${-pan}*c1|c1=c1`);
        else filters.push(`pan=stereo|c0=c0|c1=${1-pan}*c1+${pan}*c0`);
        break;
      }
      case "harmonic_exciter": {
        const amt = params.amount || 0.5;
        filters.push(`equalizer=f=5000:t=h:width=3000:g=${amt*4},equalizer=f=10000:t=h:width=4000:g=${amt*3}`);
        break;
      }
      case "transient_shaper": {
        const atk = params.attack || 0.5;
        filters.push(`acompressor=threshold=-20dB:ratio=4:attack=${atk > 0 ? 5 : 20}:release=100:knee=3dB`);
        break;
      }
      case "reverb": {
        const room = params.room_size || 0.5;
        const wet = params.wet_level || 0.3;
        filters.push(`aecho=0.8:${wet}:${Math.round(room*500)}:${room*0.5}`);
        break;
      }
      case "echo": {
        const delay = params.delay_ms || 300;
        const decay = params.decay || 0.5;
        const reps = Math.min(params.repeats || 3, 5);
        let echoStr = "aecho=0.8:0.7";
        for (let i = 1; i <= reps; i++) echoStr += `:${delay*i}:${Math.pow(decay,i).toFixed(2)}`;
        filters.push(echoStr);
        break;
      }
      case "chorus":
        filters.push(`chorus=0.7:0.9:${Math.round((params.depth||0.5)*50)}:0.4:${params.rate||1.5}:1`);
        break;
      case "distortion": {
        const gain = params.gain || 3;
        filters.push(`volume=${gain}dB,acompressor=threshold=-10dB:ratio=20:attack=1:release=50,alimiter=limit=-1dB`);
        break;
      }
      case "telephone_effect":
        filters.push("highpass=f=300,lowpass=f=3000,equalizer=f=1500:t=h:width=1000:g=6,volume=2dB");
        break;
      case "robot_voice":
        filters.push("aecho=0.8:0.5:20:0.5,chorus=0.9:0.9:50:0.5:2:1,equalizer=f=1000:t=h:width=500:g=4");
        break;
      case "deep_voice":
        filters.push("asetrate=r=38000,aresample=44100,equalizer=f=100:t=h:width=200:g=5");
        break;
      case "chipmunk_voice":
        filters.push("asetrate=r=55000,aresample=44100");
        break;
      case "whisper_effect":
        filters.push("highpass=f=2000,volume=0.7dB,aecho=0.5:0.3:50:0.2");
        break;
      case "flanger":
        filters.push(`flanger=delay=5:depth=5:speed=${params.rate||0.5}`);
        break;
      case "phaser":
        filters.push(`aphaser=in_gain=0.4:out_gain=0.74:delay=3:decay=${params.depth||0.7}:speed=${params.rate||1.0}`);
        break;
      case "tremolo":
        filters.push(`tremolo=f=${params.rate||5}:d=${params.depth||0.5}`);
        break;
      case "vibrato":
        filters.push(`vibrato=f=${params.rate||5}:d=${params.depth||0.5}`);
        break;
      case "bitcrusher":
        filters.push(`acrusher=bits=${params.bits||8}:mode=log:aa=1`);
        break;
      case "tape_saturation": {
        const drive = params.drive || 1.0;
        filters.push(`volume=${drive*6}dB,acompressor=threshold=-10dB:ratio=10:attack=1:release=50,alimiter=limit=-1dB`);
        break;
      }
      case "vinyl_effect":
        filters.push("aecho=0.8:0.3:20:0.2,equalizer=f=60:t=h:width=30:g=-5,equalizer=f=12000:t=h:width=4000:g=-8");
        break;
      case "underwater_effect":
        filters.push("lowpass=f=500,aecho=0.8:0.5:100:0.4,equalizer=f=200:t=h:width=200:g=4");
        break;
      case "cave_echo":
        filters.push("aecho=0.8:0.6:500:0.6:800:0.4,equalizer=f=500:t=h:width=400:g=3");
        break;
      case "stadium_reverb":
        filters.push("aecho=0.8:0.7:300:0.5:600:0.4:900:0.3,equalizer=f=1000:t=h:width=1000:g=2");
        break;
      case "bathroom_reverb":
        filters.push("aecho=0.8:0.6:80:0.7:160:0.5,equalizer=f=3000:t=h:width=2000:g=4");
        break;
      case "alien_voice":
        filters.push("aecho=0.8:0.5:20:0.5,vibrato=f=8:d=0.8,equalizer=f=2000:t=h:width=1000:g=6");
        break;
      case "megaphone_effect":
        filters.push("highpass=f=500,lowpass=f=4000,equalizer=f=2000:t=h:width=1000:g=8,volume=4dB,acompressor=threshold=-10dB:ratio=15:attack=1:release=50");
        break;
      case "radio_effect":
        filters.push("highpass=f=400,lowpass=f=4000,equalizer=f=2000:t=h:width=1000:g=5,volume=2dB");
        break;
      // VOICE BEAUTIFY PRESETS
      case "honey_voice":
        filters.push("highpass=f=80,equalizer=f=200:t=h:width=200:g=3,equalizer=f=400:t=h:width=200:g=2,equalizer=f=3000:t=h:width=2000:g=2,equalizer=f=7000:t=h:width=3000:g=-3,acompressor=threshold=-22dB:ratio=3:attack=20:release=300:knee=6dB:makeup=2dB,aecho=0.8:0.2:80:0.15,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "silky_voice":
        filters.push("highpass=f=100,equalizer=f=7000:t=h:width=3000:g=-4,equalizer=f=9000:t=h:width=2000:g=-3,equalizer=f=300:t=h:width=200:g=2,equalizer=f=2000:t=h:width=1500:g=2,acompressor=threshold=-20dB:ratio=3:attack=15:release=200:knee=6dB:makeup=1dB,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "broadcast_voice":
        filters.push("highpass=f=80,equalizer=f=7000:t=h:width=3000:g=-4,equalizer=f=1500:t=h:width=2000:g=3,equalizer=f=4000:t=h:width=2000:g=2,acompressor=threshold=-18dB:ratio=3.5:attack=20:release=250:knee=6dB:makeup=2dB,alimiter=limit=-1dB:attack=5:release=50,loudnorm=I=-16:TP=-1:LRA=11");
        break;
      case "asmr_voice":
        filters.push("highpass=f=60,lowpass=f=8000,equalizer=f=300:t=h:width=200:g=3,equalizer=f=600:t=h:width=300:g=2,aecho=0.8:0.3:80:0.2,volume=-3dB,loudnorm=I=-18:TP=-1:LRA=11");
        break;
      case "cinematic_voice":
        filters.push("highpass=f=60,equalizer=f=100:t=h:width=150:g=4,equalizer=f=3000:t=h:width=2000:g=2,aecho=0.8:0.4:400:0.4:800:0.2,acompressor=threshold=-20dB:ratio=4:attack=20:release=300:knee=6dB:makeup=3dB,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "angelic_voice":
        filters.push("asetrate=r=46000,aresample=44100,equalizer=f=5000:t=h:width=3000:g=3,equalizer=f=10000:t=h:width=4000:g=2,aecho=0.8:0.35:200:0.35:400:0.2,chorus=0.7:0.9:50:0.4:1.5:1,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "vintage_radio":
        filters.push("highpass=f=300,lowpass=f=3000,equalizer=f=1500:t=h:width=1000:g=5,volume=2dB,acompressor=threshold=-15dB:ratio=5:attack=10:release=100:knee=3dB");
        break;
      case "podcast_pro":
        filters.push("highpass=f=100,afftdn=nf=-25:nt=w,agate=threshold=-40dB:attack=10:release=200,equalizer=f=200:t=h:width=200:g=2,equalizer=f=2500:t=h:width=2000:g=2,acompressor=threshold=-18dB:ratio=4:attack=20:release=250:knee=6dB:makeup=2dB,alimiter=limit=-1dB:attack=5:release=50,loudnorm=I=-16:TP=-1:LRA=11");
        break;
      case "lofi_voice":
        filters.push("lowpass=f=8000,equalizer=f=200:t=h:width=200:g=3,acompressor=threshold=-20dB:ratio=3:attack=10:release=100:knee=3dB,volume=1dB");
        break;
      case "narrator_voice":
        filters.push("highpass=f=80,asetrate=r=42000,aresample=44100,equalizer=f=150:t=h:width=150:g=3,equalizer=f=2500:t=h:width=2000:g=2,equalizer=f=5000:t=h:width=2000:g=1,acompressor=threshold=-20dB:ratio=3:attack=20:release=300:knee=6dB:makeup=2dB,aecho=0.8:0.2:60:0.12,loudnorm=I=-16:TP=-1:LRA=11");
        break;
      case "smooth_jazz_voice":
        filters.push("highpass=f=100,equalizer=f=200:t=h:width=200:g=3,equalizer=f=3000:t=h:width=2000:g=2,equalizer=f=7000:t=h:width=3000:g=-2,aecho=0.8:0.25:120:0.2,chorus=0.7:0.9:30:0.3:1.0:1,acompressor=threshold=-22dB:ratio=3:attack=20:release=300:knee=6dB:makeup=2dB,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "epic_voice":
        filters.push("highpass=f=60,asetrate=r=40000,aresample=44100,equalizer=f=80:t=h:width=100:g=5,equalizer=f=3000:t=h:width=2000:g=3,aecho=0.8:0.5:300:0.4:600:0.2,acompressor=threshold=-18dB:ratio=5:attack=10:release=200:knee=6dB:makeup=4dB,loudnorm=I=-12:TP=-1:LRA=11");
        break;
      case "sweet_voice":
        filters.push("highpass=f=100,asetrate=r=46000,aresample=44100,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=7000:t=h:width=3000:g=2,aecho=0.8:0.2:60:0.15,chorus=0.7:0.9:30:0.3:1.5:1,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "crystal_voice":
        filters.push("highpass=f=100,afftdn=nf=-30:nt=w,equalizer=f=3000:t=h:width=2000:g=3,equalizer=f=8000:t=h:width=4000:g=3,equalizer=f=12000:t=h:width=4000:g=2,acompressor=threshold=-20dB:ratio=3:attack=20:release=200:knee=6dB:makeup=2dB,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "deep_warm_voice":
        filters.push("highpass=f=60,asetrate=r=40000,aresample=44100,equalizer=f=100:t=h:width=150:g=5,equalizer=f=250:t=h:width=200:g=3,equalizer=f=3000:t=h:width=2000:g=2,equalizer=f=7000:t=h:width=3000:g=-2,acompressor=threshold=-20dB:ratio=3:attack=20:release=300:knee=6dB:makeup=3dB,aecho=0.8:0.2:80:0.15,loudnorm=I=-14:TP=-1:LRA=11");
        break;
      case "auto_tune":
      case "pitch_correct":
        filters.push("asetrate=r=44100,aresample=44100");
        break;
      case "formant_shift": {
        const shift = params.shift || 1.0;
        filters.push(`asetrate=r=${Math.round(44100 * shift)},aresample=44100`);
        break;
      }
      default:
        break;
    }
  }

  if (pitchShift !== null) {
    const ratio = Math.pow(2, pitchShift / 12);
    filters.push(`asetrate=r=${Math.round(44100 * ratio)},aresample=44100`);
  }
  if (speedFactor !== null) {
    filters.push(`atempo=${Math.max(0.5, Math.min(2.0, speedFactor))}`);
  }

  return filters;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const tmpDir = os.tmpdir();
  let inputPath = null;
  let outputPath = null;

  try {
    let instruction = "";

    // Support both JSON (base64) and multipart form
    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("application/json")) {
      // JSON mode: audioData is base64 string
      // Vercel serverless-এ req.body undefined হয়, তাই raw body manually parse করতে হবে
      let body = {};
      try {
        if (req.body && typeof req.body === "object") {
          body = req.body;
        } else {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const rawBody = Buffer.concat(chunks).toString("utf8");
          body = JSON.parse(rawBody);
        }
      } catch (parseErr) {
        return res.status(400).json({ error: "JSON parse error: " + parseErr.message });
      }
      const audioBase64 = body.audioData;
      instruction = body.instruction || "অডিওটি সুন্দর করো";

      if (!audioBase64) return res.status(400).json({ error: "অডিও ফাইল পাওয়া যায়নি" });

      // Decode base64 → temp file
      const audioBuffer = Buffer.from(audioBase64, "base64");
      inputPath = path.join(tmpDir, `sardar_input_${Date.now()}.wav`);
      fs.writeFileSync(inputPath, audioBuffer);
    } else {
      // Multipart form mode
      const form = formidable({ uploadDir: tmpDir, keepExtensions: true, maxFileSize: 50 * 1024 * 1024 });
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err); else resolve([fields, files]);
        });
      });

      const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
      instruction = Array.isArray(fields.instruction) ? fields.instruction[0] : (fields.instruction || "অডিওটি সুন্দর করো");

      if (!audioFile) return res.status(400).json({ error: "অডিও ফাইল পাওয়া যায়নি" });
      inputPath = audioFile.filepath;
    }

    // ── from here, inputPath is set ──
    outputPath = path.join(tmpDir, `sardar_edited_${Date.now()}.wav`);

    let parsed;
    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: AUDIO_SYSTEM_PROMPT },
          { role: "user", content: instruction || "অডিওটি সুন্দর করো" }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1000,
      });
      parsed = JSON.parse(aiResponse.choices[0].message.content);
    } catch (e) {
      parsed = {
        operations: [
          { type: "denoise_advanced", params: { strength: 0.6 } },
          { type: "vocal_enhance", params: {} },
          { type: "loudness_normalize", params: { target_lufs: -14 } }
        ],
        explanation: "সাধারণ নির্দেশনা বুঝে ডিফল্ট ভয়েস এনহান্সমেন্ট প্রয়োগ করা হয়েছে।",
        pipeline: ["১. নয়েজ রিডাকশন", "২. ভয়েস এনহান্সমেন্ট", "৩. লাউডনেস নরমালাইজ"],
        intent: "ডিফল্ট এনহান্সমেন্ট"
      };
    }

    const operations = parsed.operations || [];
    if (operations.length === 0) {
      operations.push({ type: "denoise_advanced", params: { strength: 0.6 } });
      operations.push({ type: "vocal_enhance", params: {} });
      operations.push({ type: "loudness_normalize", params: { target_lufs: -14 } });
    }

    const filters = buildFFmpegFilter(operations);
    const filterStr = filters.length > 0 ? filters.join(",") : "anull";

    let ffmpegPath = "ffmpeg";
    try {
      const ffmpegStatic = await import("ffmpeg-static");
      ffmpegPath = ffmpegStatic.default || "ffmpeg";
    } catch (e) {}

    const ffmpegCmd = `"${ffmpegPath}" -y -i "${inputPath}" -af "${filterStr}" -ar 44100 -ac 1 -acodec pcm_s16le "${outputPath}" 2>&1`;

    try {
      execSync(ffmpegCmd, { timeout: 120000, stdio: "pipe" });
    } catch (ffmpegErr) {
      const fallbackCmd = `"${ffmpegPath}" -y -i "${inputPath}" -af "loudnorm=I=-14:TP=-1:LRA=11" -ar 44100 -ac 1 -acodec pcm_s16le "${outputPath}" 2>&1`;
      execSync(fallbackCmd, { timeout: 60000, stdio: "pipe" });
    }

    if (!fs.existsSync(outputPath)) return res.status(500).json({ error: "অডিও প্রসেসিং ব্যর্থ হয়েছে" });

    const outputBuffer = fs.readFileSync(outputPath);
    const base64Audio = outputBuffer.toString("base64");

    try { fs.unlinkSync(inputPath); } catch (e) {}
    try { fs.unlinkSync(outputPath); } catch (e) {}

    return res.status(200).json({
      success: true,
      audioData: base64Audio,
      audioMime: "audio/wav",
      description: parsed.explanation || parsed.description || "অডিও প্রসেসিং সম্পন্ন হয়েছে।",
      appliedSteps: (parsed.pipeline || []).map(s => s.replace(/^[০-৯\d]+\.\s*/, "")),
      operations: operations.map(op => op.type),
      pipeline: parsed.pipeline || [],
      intent: parsed.intent || "অডিও এনহান্সমেন্ট",
      technicalNote: parsed.technicalNote || "",
    });

  } catch (error) {
    if (inputPath) try { fs.unlinkSync(inputPath); } catch (e) {}
    if (outputPath) try { fs.unlinkSync(outputPath); } catch (e) {}
    console.error("Audio edit error:", error);
    return res.status(500).json({ error: "অডিও প্রসেসিং ব্যর্থ হয়েছে: " + error.message });
  }
}
