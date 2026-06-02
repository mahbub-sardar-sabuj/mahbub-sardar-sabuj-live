// client/src/components/chatbot/QuickActions.tsx
// Context-aware dynamic quick action suggestions

interface QuickActionsProps {
  messages: Array<{ role: string; content: string }>;
  onSelect: (text: string) => void;
  isLoading: boolean;
}

interface Action {
  label: string;
  text: string;
  icon: string;
}

function getContextualActions(messages: Array<{ role: string; content: string }>): Action[] {
  const lastUserMsgs = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content.toLowerCase());

  const lastAiMsgs = messages
    .filter((m) => m.role === "assistant")
    .slice(-2)
    .map((m) => m.content.toLowerCase());

  const combined = [...lastUserMsgs, ...lastAiMsgs].join(" ");

  // Book context
  if (/দুঃখবিলাস|dukkhovilash/.test(combined)) {
    return [
      { icon: "📖", label: "বইটি পড়ুন", text: "দুঃখবিলাস বইটি অনলাইনে পড়তে চাই" },
      { icon: "💰", label: "মূল্য জানুন", text: "দুঃখবিলাস বইটির মূল্য কত?" },
      { icon: "📚", label: "অন্য বই", text: "আর কোন বই আছে?" },
    ];
  }

  if (/স্মৃতির বসন্তে|smritir/.test(combined)) {
    return [
      { icon: "📖", label: "বইটি পড়ুন", text: "স্মৃতির বসন্তে বইটি পড়তে চাই" },
      { icon: "📚", label: "অন্য বই", text: "আর কোন বই আছে?" },
      { icon: "✍️", label: "লেখক সম্পর্কে", text: "লেখক সম্পর্কে বলুন" },
    ];
  }

  // Audio context
  if (/অডিও|audio|নয়েজ|ভোকাল|vocal|রেকর্ড/.test(combined)) {
    return [
      { icon: "🎙️", label: "নয়েজ কমান", text: "অডিও থেকে নয়েজ কমাও" },
      { icon: "✨", label: "ভয়েস এনহ্যান্স", text: "ভয়েস এনহ্যান্স করো" },
      { icon: "🎚️", label: "স্টুডিও কোয়ালিটি", text: "স্টুডিও কোয়ালিটিতে রূপান্তর করো" },
    ];
  }

  // Writing context
  if (/লেখা|কবিতা|writings|বিচ্ছেদ|ভালোবাসা/.test(combined)) {
    return [
      { icon: "💔", label: "বিচ্ছেদের লেখা", text: "বিচ্ছেদ নিয়ে কিছু লেখা দেখাও" },
      { icon: "❤️", label: "ভালোবাসার লেখা", text: "ভালোবাসা নিয়ে কিছু লেখা দেখাও" },
      { icon: "📝", label: "কবিতা", text: "কবিতা দেখতে চাই" },
    ];
  }

  // Author context
  if (/লেখক|কবি|মাহবুব|সবুজ|পরিচয়/.test(combined)) {
    return [
      { icon: "📚", label: "বইগুলো দেখুন", text: "সব বইয়ের তালিকা দিন" },
      { icon: "🎤", label: "আবৃত্তি দেখুন", text: "আবৃত্তিগুলো দেখতে চাই" },
      { icon: "📞", label: "যোগাযোগ করুন", text: "যোগাযোগের তথ্য দিন" },
    ];
  }

  // Default actions (first message or general)
  return [
    { icon: "📚", label: "বইগুলো দেখুন", text: "সব বইয়ের তালিকা দিন" },
    { icon: "✍️", label: "লেখালেখি", text: "লেখালেখি সম্পর্কে বলুন" },
    { icon: "🎤", label: "আবৃত্তি", text: "আবৃত্তিগুলো দেখতে চাই" },
    { icon: "🎵", label: "অডিও এডিট", text: "অডিও এডিট করতে চাই" },
  ];
}

export function QuickActions({ messages, onSelect, isLoading }: QuickActionsProps) {
  const actions = getContextualActions(messages);

  return (
    <div style={{
      display: "flex",
      flexWrap: "nowrap",
      gap: 7,
      padding: "8px 4px 9px",
      overflowX: "auto",
      scrollbarWidth: "none",
    }}>
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => !isLoading && onSelect(action.text)}
          disabled={isLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            background: i === 0 ? "linear-gradient(135deg, #0084FF, #00A6FF)" : "rgba(255,255,255,0.92)",
            border: i === 0 ? "1px solid rgba(0,132,255,0.18)" : "1px solid rgba(0,132,255,0.12)",
            borderRadius: 999,
            color: isLoading ? "rgba(71,85,105,0.38)" : (i === 0 ? "#ffffff" : "#006AFF"),
            fontSize: "0.66rem",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontWeight: 700,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.18s",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
            boxShadow: i === 0 ? "0 8px 18px rgba(0,132,255,0.2)" : "0 4px 14px rgba(15,23,42,0.06)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 22px rgba(0,132,255,0.18)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = i === 0 ? "0 8px 18px rgba(0,132,255,0.2)" : "0 4px 14px rgba(15,23,42,0.06)";
          }}
        >
          <span style={{ fontSize: "0.78rem" }}>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}
