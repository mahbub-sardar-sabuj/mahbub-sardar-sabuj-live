/**
 * FAQ Section Component — Structured Data for SEO
 * Generates FAQ schema for Google Rich Snippets
 * Usage: <FAQSection faqs={faqData} />
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  description?: string;
}

export default function FAQSection({ faqs, title = "সাধারণ প্রশ্ন", description }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Generate FAQ Schema for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema — Hidden from users, visible to search engines */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      {/* FAQ Section UI */}
      <section style={{
        margin: "3rem 0",
        padding: "2rem",
        background: "rgba(201,168,76,0.03)",
        border: "1px solid rgba(201,168,76,0.1)",
        borderRadius: 12,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Title */}
          <h2 style={{
            fontFamily: "'AdorshoLipi', sans-serif",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#FAF6EF",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}>
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p style={{
              fontFamily: "'AdorshoLipi', sans-serif",
              fontSize: "0.95rem",
              color: "rgba(250,246,239,0.6)",
              textAlign: "center",
              marginBottom: "2rem",
              lineHeight: 1.7,
            }}>
              {description}
            </p>
          )}

          {/* FAQ Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={false}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {/* Question Button */}
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  style={{
                    width: "100%",
                    padding: "1.2rem",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    textAlign: "left",
                  }}
                  aria-expanded={openIndex === index}
                >
                  <span style={{
                    fontFamily: "'AdorshoLipi', sans-serif",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#FAF6EF",
                    flex: 1,
                  }}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={20} color="#C9A84C" />
                  </motion.div>
                </button>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        borderTop: "1px solid rgba(201,168,76,0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <p style={{
                        fontFamily: "'AdorshoLipi', sans-serif",
                        fontSize: "0.95rem",
                        color: "rgba(250,246,239,0.7)",
                        padding: "1.2rem",
                        margin: 0,
                        lineHeight: 1.8,
                      }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
