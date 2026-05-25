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
      flexWrap: "wrap",
      gap: 6,
      padding: "8px 12px 4px",
    }}>
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={() => !isLoading && onSelect(action.text)}
          disabled={isLoading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            background: "rgba(212,168,67,0.07)",
            border: "1px solid rgba(212,168,67,0.22)",
            borderRadius: 20,
            color: isLoading ? "rgba(212,168,67,0.3)" : "rgba(212,168,67,0.8)",
            fontSize: "0.62rem",
            fontFamily: "'AdorshoLipi', 'Noto Sans Bengali', sans-serif",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.18s",
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.15)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,67,0.45)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,168,67,0.95)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,168,67,0.07)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,67,0.22)";
            (e.currentTarget as HTMLButtonElement).style.color = isLoading ? "rgba(212,168,67,0.3)" : "rgba(212,168,67,0.8)";
          }}
        >
          <span style={{ fontSize: "0.75rem" }}>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}
