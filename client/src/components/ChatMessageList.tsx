import { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  userAudioName?: string;
  userAudioSize?: number;
  userAudioMime?: string;
  userAudioUrl?: string;
  userAudioInstruction?: string;
  audioUrl?: string;
  audioFilename?: string;
  audioDescription?: string;
  audioAppliedSteps?: string[];
  audioIntent?: string;
  audioPipeline?: string[];
  audioTechnicalNote?: string;
  audioVocalContext?: string;
  processingVersion?: string;
  operationsApplied?: string[];
  outputSizeKB?: number;
  isCopied?: boolean;
}

interface ChatMessageListProps {
  messages: Message[];
  isLoading: boolean;
  renderMessage: (message: Message) => React.ReactNode;
}

/**
 * ChatMessageList - একটি অপ্টিমাইজড মেসেজ লিস্ট কম্পোনেন্ট
 * বড় চ্যাট হিস্টরির জন্য পারফরম্যান্স উন্নতির জন্য ডিজাইন করা হয়েছে
 */
export default function ChatMessageList({ messages, isLoading, renderMessage }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // স্বয়ংক্রিয়ভাবে নতুন মেসেজে স্ক্রল করা
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // মেমরি অপ্টিমাইজেশনের জন্য পুরনো মেসেজগুলো সীমিত করা
  const visibleMessages = useMemo(() => {
    const MAX_VISIBLE_MESSAGES = 100;
    if (messages.length > MAX_VISIBLE_MESSAGES) {
      return messages.slice(-MAX_VISIBLE_MESSAGES);
    }
    return messages;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {visibleMessages.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", color: "#999", marginTop: "2rem" }}>
          <p>কোনো মেসেজ নেই। কথোপকথন শুরু করতে কিছু লিখুন।</p>
        </div>
      )}

      {visibleMessages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderMessage(message)}
        </motion.div>
      ))}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#999",
          }}
        >
          <div style={{ display: "flex", gap: "0.3rem" }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  background: "#C9A84C",
                }}
              />
            ))}
          </div>
          <span>চ্যাটবট লিখছে...</span>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
