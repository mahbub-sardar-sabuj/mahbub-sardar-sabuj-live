import { useState, useRef } from "react";
import { Send, Paperclip, Mic2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * ChatInput - চ্যাট ইনপুট কম্পোনেন্ট
 * টেক্সট ইনপুট, ফাইল আপলোড এবং ভয়েস ইনপুট সাপোর্ট করে
 */
export default function ChatInput({
  onSendMessage,
  onFileUpload,
  isLoading = false,
  placeholder = "আপনার বার্তা লিখুন...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        padding: "1rem",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        background: isDragging ? "rgba(201,168,76,0.05)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            style={{
              width: "100%",
              minHeight: "2.5rem",
              maxHeight: "6rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(201,168,76,0.2)",
              background: "rgba(10,22,40,0.5)",
              color: "#F8E9B6",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              resize: "none",
              opacity: isLoading ? 0.6 : 1,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="ফাইল আপলোড করুন"
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "#C9A84C",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Paperclip size={20} />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            title="বার্তা পাঠান (Enter)"
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              background: message.trim() && !isLoading ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.2)",
              color: "#C9A84C",
              cursor: message.trim() && !isLoading ? "pointer" : "not-allowed",
              opacity: message.trim() && !isLoading ? 1 : 0.5,
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleFileSelect}
        accept="audio/*,image/*"
      />

      {isDragging && (
        <div style={{ marginTop: "0.5rem", color: "#C9A84C", fontSize: "0.85rem" }}>
          ফাইলটি এখানে ড্রপ করুন...
        </div>
      )}
    </div>
  );
}
