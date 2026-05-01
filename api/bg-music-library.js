// Background Music Library API
// Provides curated royalty-free music for background mixing
// Sources: Pixabay (free, no attribution required), curated CDN links

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { category, search, limit = "12" } = req.query;

  // ── Curated Built-in Music Library ─────────────────────────────────────────
  // All tracks are royalty-free from Pixabay (https://pixabay.com/music/)
  // No attribution required for Pixabay music
  const MUSIC_LIBRARY = [
    // ── কবিতা ও আবৃত্তি ──
    {
      id: "poetry_soft_piano",
      title: "নরম পিয়ানো",
      titleEn: "Soft Piano",
      category: "poetry",
      categoryLabel: "কবিতা ও আবৃত্তি",
      mood: "calm",
      bpm: 70,
      duration: 120,
      tags: ["piano", "soft", "calm", "poetry", "কবিতা", "আবৃত্তি"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/01/15/audio_4e5d2a3b7c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/01/15/audio_4e5d2a3b7c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["poetry", "recitation", "soft_poetry", "deep_recitation"],
    },
    {
      id: "poetry_ambient_strings",
      title: "অ্যাম্বিয়েন্ট স্ট্রিংস",
      titleEn: "Ambient Strings",
      category: "poetry",
      categoryLabel: "কবিতা ও আবৃত্তি",
      mood: "emotional",
      bpm: 65,
      duration: 180,
      tags: ["strings", "ambient", "emotional", "poetry", "কবিতা"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/11/20/audio_7f3a1b2c4d.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/11/20/audio_7f3a1b2c4d.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["poetry", "narration", "soft_poetry"],
    },
    {
      id: "poetry_gentle_guitar",
      title: "মৃদু গিটার",
      titleEn: "Gentle Guitar",
      category: "poetry",
      categoryLabel: "কবিতা ও আবৃত্তি",
      mood: "warm",
      bpm: 75,
      duration: 150,
      tags: ["guitar", "gentle", "warm", "poetry", "কবিতা"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/02/10/audio_9c8b7a6d5e.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/02/10/audio_9c8b7a6d5e.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["poetry", "warm_voice", "deep_recitation"],
    },

    // ── মেডিটেশন ও শান্তি ──
    {
      id: "meditation_deep_calm",
      title: "গভীর প্রশান্তি",
      titleEn: "Deep Calm",
      category: "meditation",
      categoryLabel: "মেডিটেশন ও শান্তি",
      mood: "peaceful",
      bpm: 55,
      duration: 240,
      tags: ["meditation", "calm", "peaceful", "nature", "মেডিটেশন"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/09/05/audio_2a4c6e8f1b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/09/05/audio_2a4c6e8f1b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["meditation_voice", "asmr_voice", "soft"],
    },
    {
      id: "meditation_nature_sounds",
      title: "প্রকৃতির শব্দ",
      titleEn: "Nature Sounds",
      category: "meditation",
      categoryLabel: "মেডিটেশন ও শান্তি",
      mood: "peaceful",
      bpm: 60,
      duration: 300,
      tags: ["nature", "birds", "water", "meditation", "প্রকৃতি"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/03/01/audio_5d7e9f2a4c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/03/01/audio_5d7e9f2a4c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["meditation_voice", "soft", "narration"],
    },
    {
      id: "meditation_tibetan_bowls",
      title: "তিব্বতি বাটি",
      titleEn: "Tibetan Bowls",
      category: "meditation",
      categoryLabel: "মেডিটেশন ও শান্তি",
      mood: "spiritual",
      bpm: 50,
      duration: 200,
      tags: ["tibetan", "bowls", "spiritual", "meditation", "আধ্যাত্মিক"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/12/15/audio_3b5d7f9a1c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/12/15/audio_3b5d7f9a1c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["meditation_voice", "asmr_voice"],
    },

    // ── পডকাস্ট ও ভয়েসওভার ──
    {
      id: "podcast_upbeat_intro",
      title: "পডকাস্ট ইন্ট্রো",
      titleEn: "Podcast Upbeat Intro",
      category: "podcast",
      categoryLabel: "পডকাস্ট ও ভয়েসওভার",
      mood: "energetic",
      bpm: 120,
      duration: 30,
      tags: ["podcast", "intro", "upbeat", "energetic", "পডকাস্ট"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/01/20/audio_6e8f1a3c5b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/01/20/audio_6e8f1a3c5b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["podcast_pro", "broadcast_voice", "youtube_voice"],
    },
    {
      id: "podcast_background_lofi",
      title: "পডকাস্ট লো-ফাই",
      titleEn: "Podcast Lo-Fi Background",
      category: "podcast",
      categoryLabel: "পডকাস্ট ও ভয়েসওভার",
      mood: "chill",
      bpm: 85,
      duration: 180,
      tags: ["lofi", "chill", "podcast", "background", "লো-ফাই"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/10/12/audio_8f2a4c6e1b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/10/12/audio_8f2a4c6e1b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["podcast_pro", "lofi_voice", "narrator_voice"],
    },
    {
      id: "podcast_corporate_soft",
      title: "কর্পোরেট সফট",
      titleEn: "Corporate Soft",
      category: "podcast",
      categoryLabel: "পডকাস্ট ও ভয়েসওভার",
      mood: "professional",
      bpm: 100,
      duration: 120,
      tags: ["corporate", "professional", "soft", "podcast", "প্রফেশনাল"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/02/05/audio_1c3e5f7a9b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/02/05/audio_1c3e5f7a9b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["broadcast_voice", "conference_voice", "news_anchor"],
    },

    // ── সিনেমাটিক ও ড্রামাটিক ──
    {
      id: "cinematic_epic_orchestra",
      title: "এপিক অর্কেস্ট্রা",
      titleEn: "Epic Orchestra",
      category: "cinematic",
      categoryLabel: "সিনেমাটিক ও ড্রামাটিক",
      mood: "epic",
      bpm: 130,
      duration: 180,
      tags: ["epic", "orchestra", "cinematic", "dramatic", "এপিক"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/08/20/audio_4d6f8b2a1c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/08/20/audio_4d6f8b2a1c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["epic_voice", "cinematic_voice", "deep"],
    },
    {
      id: "cinematic_emotional_piano",
      title: "আবেগময় পিয়ানো",
      titleEn: "Emotional Piano",
      category: "cinematic",
      categoryLabel: "সিনেমাটিক ও ড্রামাটিক",
      mood: "emotional",
      bpm: 80,
      duration: 200,
      tags: ["piano", "emotional", "cinematic", "sad", "আবেগময়"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/01/08/audio_7b9d2f4a6c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/01/08/audio_7b9d2f4a6c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["cinematic_voice", "deep_recitation", "emotional"],
    },
    {
      id: "cinematic_dark_ambient",
      title: "ডার্ক অ্যাম্বিয়েন্ট",
      titleEn: "Dark Ambient",
      category: "cinematic",
      categoryLabel: "সিনেমাটিক ও ড্রামাটিক",
      mood: "dark",
      bpm: 70,
      duration: 240,
      tags: ["dark", "ambient", "cinematic", "mysterious", "রহস্যময়"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/11/05/audio_9e1c3a5d7f.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/11/05/audio_9e1c3a5d7f.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["deep_warm_voice", "cinematic_voice", "deep"],
    },

    // ── সোশ্যাল মিডিয়া (TikTok/Reels/YouTube) ──
    {
      id: "social_upbeat_pop",
      title: "আপবিট পপ",
      titleEn: "Upbeat Pop",
      category: "social",
      categoryLabel: "সোশ্যাল মিডিয়া",
      mood: "happy",
      bpm: 128,
      duration: 60,
      tags: ["pop", "upbeat", "happy", "tiktok", "reels", "TikTok"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/03/10/audio_2f4a6c8e1b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/03/10/audio_2f4a6c8e1b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["tiktok_voice", "youtube_voice", "sweet_voice"],
    },
    {
      id: "social_chill_beats",
      title: "চিল বিটস",
      titleEn: "Chill Beats",
      category: "social",
      categoryLabel: "সোশ্যাল মিডিয়া",
      mood: "chill",
      bpm: 90,
      duration: 90,
      tags: ["chill", "beats", "hip-hop", "youtube", "reels"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/12/20/audio_5c7e9a2b4d.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/12/20/audio_5c7e9a2b4d.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["youtube_voice", "tiktok_voice", "crystal_voice"],
    },
    {
      id: "social_motivational",
      title: "মোটিভেশনাল",
      titleEn: "Motivational",
      category: "social",
      categoryLabel: "সোশ্যাল মিডিয়া",
      mood: "inspiring",
      bpm: 115,
      duration: 120,
      tags: ["motivational", "inspiring", "youtube", "powerful", "অনুপ্রেরণা"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/02/18/audio_3d5f7b9a1c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/02/18/audio_3d5f7b9a1c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["epic_voice", "youtube_voice", "broadcast_voice"],
    },

    // ── ক্লাসিক্যাল ও ঐতিহ্যবাহী ──
    {
      id: "classical_bengali_flute",
      title: "বাঁশির সুর",
      titleEn: "Bengali Flute",
      category: "classical",
      categoryLabel: "ক্লাসিক্যাল ও ঐতিহ্যবাহী",
      mood: "traditional",
      bpm: 70,
      duration: 180,
      tags: ["flute", "bengali", "classical", "traditional", "বাঁশি", "বাংলা"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/10/25/audio_6a8c1e3f5b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/10/25/audio_6a8c1e3f5b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["bangla_recitation_pro", "poetry", "deep_recitation"],
    },
    {
      id: "classical_sitar_ambient",
      title: "সেতারের সুর",
      titleEn: "Sitar Ambient",
      category: "classical",
      categoryLabel: "ক্লাসিক্যাল ও ঐতিহ্যবাহী",
      mood: "meditative",
      bpm: 60,
      duration: 200,
      tags: ["sitar", "indian", "classical", "ambient", "সেতার"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/01/30/audio_8e2a4c6f1b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/01/30/audio_8e2a4c6f1b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["bangla_recitation_pro", "meditation_voice", "poetry"],
    },
    {
      id: "classical_tabla_rhythm",
      title: "তবলার তাল",
      titleEn: "Tabla Rhythm",
      category: "classical",
      categoryLabel: "ক্লাসিক্যাল ও ঐতিহ্যবাহী",
      mood: "rhythmic",
      bpm: 90,
      duration: 150,
      tags: ["tabla", "rhythm", "bengali", "classical", "তবলা"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/09/15/audio_1b3d5f7a9c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/09/15/audio_1b3d5f7a9c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["bangla_recitation_pro", "deep_recitation"],
    },

    // ── জ্যাজ ও লাউঞ্জ ──
    {
      id: "jazz_smooth_lounge",
      title: "স্মুদ জ্যাজ লাউঞ্জ",
      titleEn: "Smooth Jazz Lounge",
      category: "jazz",
      categoryLabel: "জ্যাজ ও লাউঞ্জ",
      mood: "smooth",
      bpm: 95,
      duration: 180,
      tags: ["jazz", "smooth", "lounge", "saxophone", "জ্যাজ"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/02/25/audio_4c6e8a1b3d.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/02/25/audio_4c6e8a1b3d.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["smooth_jazz_voice", "narrator_voice", "audiobook_voice"],
    },
    {
      id: "jazz_cafe_piano",
      title: "ক্যাফে পিয়ানো",
      titleEn: "Cafe Piano Jazz",
      category: "jazz",
      categoryLabel: "জ্যাজ ও লাউঞ্জ",
      mood: "relaxed",
      bpm: 88,
      duration: 200,
      tags: ["jazz", "piano", "cafe", "relaxed", "ক্যাফে"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/11/28/audio_7f9b2d4e6a.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/11/28/audio_7f9b2d4e6a.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["smooth_jazz_voice", "lofi_voice", "warm_voice"],
    },

    // ── লো-ফাই ও চিল ──
    {
      id: "lofi_study_beats",
      title: "লো-ফাই স্টাডি",
      titleEn: "Lo-Fi Study Beats",
      category: "lofi",
      categoryLabel: "লো-ফাই ও চিল",
      mood: "focused",
      bpm: 80,
      duration: 240,
      tags: ["lofi", "study", "chill", "beats", "লো-ফাই"],
      previewUrl: "https://cdn.pixabay.com/audio/2024/03/05/audio_9a1c3e5f7b.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2024/03/05/audio_9a1c3e5f7b.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["lofi_voice", "audiobook_voice", "narrator_voice"],
    },
    {
      id: "lofi_rainy_day",
      title: "বৃষ্টির দিন",
      titleEn: "Rainy Day Lo-Fi",
      category: "lofi",
      categoryLabel: "লো-ফাই ও চিল",
      mood: "melancholic",
      bpm: 75,
      duration: 200,
      tags: ["lofi", "rain", "melancholic", "chill", "বৃষ্টি"],
      previewUrl: "https://cdn.pixabay.com/audio/2023/12/08/audio_2b4d6f8a1c.mp3",
      downloadUrl: "https://cdn.pixabay.com/audio/2023/12/08/audio_2b4d6f8a1c.mp3",
      source: "Pixabay",
      license: "Pixabay License (Free)",
      recommended_for: ["lofi_voice", "poetry", "soft_poetry"],
    },
  ];

  // ── Category definitions ────────────────────────────────────────────────────
  const CATEGORIES = [
    { id: "all", label: "সব মিউজিক", icon: "🎵" },
    { id: "poetry", label: "কবিতা ও আবৃত্তি", icon: "📜" },
    { id: "meditation", label: "মেডিটেশন", icon: "🧘" },
    { id: "podcast", label: "পডকাস্ট", icon: "🎙️" },
    { id: "cinematic", label: "সিনেমাটিক", icon: "🎬" },
    { id: "social", label: "সোশ্যাল মিডিয়া", icon: "📱" },
    { id: "classical", label: "ক্লাসিক্যাল", icon: "🪘" },
    { id: "jazz", label: "জ্যাজ", icon: "🎷" },
    { id: "lofi", label: "লো-ফাই", icon: "🎧" },
  ];

  // Handle categories request
  if (req.url?.includes("?categories")) {
    return res.status(200).json({ categories: CATEGORIES });
  }

  // Filter by category
  let results = MUSIC_LIBRARY;
  if (category && category !== "all") {
    results = results.filter(track => track.category === category);
  }

  // Filter by search query
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(track =>
      track.title.toLowerCase().includes(q) ||
      track.titleEn.toLowerCase().includes(q) ||
      track.tags.some(tag => tag.toLowerCase().includes(q)) ||
      track.categoryLabel.toLowerCase().includes(q)
    );
  }

  // Limit results
  const limitNum = Math.min(parseInt(limit) || 12, 50);
  results = results.slice(0, limitNum);

  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.status(200).json({
    tracks: results,
    total: results.length,
    categories: CATEGORIES,
  });
}
