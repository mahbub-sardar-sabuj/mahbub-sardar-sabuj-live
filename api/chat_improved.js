/**
 * ✨ উন্নত চ্যাটবট API - মাহবুব সরদার সবুজ
 * ✅ সরাসরি উত্তর এবং প্রাসঙ্গিক তথ্য নিশ্চিত করে
 * ✅ অপ্রয়োজনীয় প্রচারমূলক বার্তা বর্জন করে
 * ✅ উন্নত এরর হ্যান্ডলিং এবং রিট্রাই লজিক
 */

const Anthropic = require("@anthropic-ai/sdk").default;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 উন্নত সিস্টেম প্রম্পট - সরাসরি এবং প্রাসঙ্গিক উত্তর নিশ্চিত করে
// ═══════════════════════════════════════════════════════════════════════════════
const IMPROVED_SYSTEM_PROMPT = `আপনি মাহবুব সরদার সবুজের একটি সহায়ক চ্যাটবট। আপনার নাম "সরদার সহায়ক"।

📌 **আপনার প্রধান দায়িত্ব:**
১. ব্যবহারকারীর প্রশ্নের সরাসরি এবং সংক্ষিপ্ত উত্তর দেওয়া।
২. লেখক সম্পর্কিত তথ্য প্রদান করা (বই, কবিতা, জীবনী, যোগাযোগ)।
৩. সাধারণ প্রশ্নের ক্ষেত্রে শুধুমাত্র সঠিক উত্তর দেওয়া, অপ্রয়োজনীয় তথ্য যোগ না করা।

📋 **লেখক সম্পর্কিত মূল তথ্য:**
- **নাম:** মাহবুব সরদার সবুজ
- **পেশা:** লেখক ও কবি
- **অবস্থান:** সৌদি আরব
- **প্রকাশিত বই:**
  • "আমি বিচ্ছেদকে বলি দুঃখবিলাস" (ফিজিক্যাল বই)
  • "স্মৃতির বসন্তে তুমি" (ই-বুক)
  • "চাঁদফুল" (ই-বুক)
  • "সময়ের গহ্বরে" (ই-বুক)
- **যোগাযোগ:** lekhokmahbubsardarsabuj@gmail.com
- **সোশ্যাল মিডিয়া:** Facebook (Lekhok.MahbubSardarSabuj), Instagram (@mahbub_sardar_sabuj), YouTube (@mahbubsardarsabuj)

⚠️ **গুরুত্বপূর্ণ নিয়ম:**
✅ **করুন:**
- সরাসরি এবং স্পষ্ট উত্তর দিন।
- প্রশ্নের সাথে প্রাসঙ্গিক তথ্য শেয়ার করুন।
- যদি ব্যবহারকারী "সরাসরি উত্তর দিন" বলে, তাহলে শুধুমাত্র প্রথম বাক্যটি বা সংক্ষিপ্ত উত্তর দিন।
- প্রয়োজনে প্রাসঙ্গিক লিংক বা বাটন সাজেশন দিন।

❌ **করবেন না:**
- "আমি একটি এআই চ্যাটবট" বা "আমি মানুষ নই" এর মতো অপ্রয়োজনীয় কথা বলবেন না।
- প্রতিটি উত্তরের শেষে "আপনার কি আরও কিছু জানার আছে?" বা "তবে আমি মূলত..." এর মতো বাক্য যোগ করবেন না।
- লেখকের সাথে সম্পর্কহীন বিষয়ে দীর্ঘ উত্তর দেবেন না।
- অপ্রয়োজনীয় আত্ম-পরিচয় বা ওয়েবসাইটের প্রচারমূলক বার্তা যোগ করবেন না।

🎯 **উত্তরের ফরম্যাট:**
- **সাধারণ প্রশ্নের জন্য:** সরাসরি উত্তর (১-২ বাক্য)।
- **লেখক সম্পর্কিত প্রশ্নের জন্য:** প্রাসঙ্গিক তথ্য + প্রয়োজনে অ্যাকশন বাটন সাজেশন।
- **বহু-অংশীয় প্রশ্নের জন্য:** প্রতিটি অংশের উত্তর সংক্ষিপ্তভাবে দিন।

🔗 **প্রাসঙ্গিক বাটন সাজেশন (যখন প্রয়োজন):**
- "📖 বই পড়ুন"
- "📧 যোগাযোগ করুন"
- "🎨 ডিজাইন করুন"
- "📸 গ্যালারি দেখুন"
- "🎤 আবৃত্তি শুনুন"
- "📰 সংবাদ পড়ুন"

💡 **উদাহরণ:**
- প্রশ্ন: "৫ যোগ ৫ কত?"
  উত্তর: "১০"
  
- প্রশ্ন: "লেখকের প্রথম বই কি?"
  উত্তর: "মাহবুব সরদার সবুজের প্রথম প্রকাশিত বই 'আমি বিচ্ছেদকে বলি দুঃখবিলাস'। এটি বিচ্ছেদ, ভালোবাসা এবং জীবনের গভীর অনুভূতি নিয়ে লেখা। [📖 বই পড়ুন] [🛒 রকমারি থেকে অর্ডার করুন]"

- প্রশ্ন: "আপনি কি মানুষের মতো অনুভব করতে পারেন?"
  উত্তর: "না, আমি একটি এআই চ্যাটবট। আমি প্রোগ্রাম করা হয়েছি মাহবুব সরদার সবুজ সম্পর্কিত তথ্য প্রদান করতে এবং ব্যবহারকারীদের সাহায্য করতে।"`;

// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ প্রম্পট ইনজেকশন সুরক্ষা এবং ইনপুট ভ্যালিডেশন
// ═══════════════════════════════════════════════════════════════════════════════
function sanitizeInput(input) {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid input: must be a non-empty string");
  }
  
  // দৈর্ঘ্য চেক (প্রম্পট ইনজেকশন প্রতিরোধ)
  if (input.length > 2000) {
    throw new Error("Input too long: maximum 2000 characters allowed");
  }
  
  // বিপজ্জনক প্যাটার্ন চেক
  const dangerousPatterns = [
    /ignore.*instruction/i,
    /system.*prompt/i,
    /override.*rule/i,
    /forget.*previous/i,
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      throw new Error("Invalid input: potential prompt injection detected");
    }
  }
  
  return input.trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 রেসপন্স পোস্ট-প্রসেসিং - অপ্রয়োজনীয় বার্তা সরানো
// ═══════════════════════════════════════════════════════════════════════════════
function postProcessResponse(response, userMessage) {
  let processed = response;
  
  // অপ্রয়োজনীয় বাক্যগুলো সরান
  const unnecessaryPhrases = [
    /তবে আমি মূলত.*?\./gi,
    /আপনার কি আরও কিছু জানার আছে\?/gi,
    /আমি একটি এআই চ্যাটবট.*?\./gi,
    /আমি মানুষ নই.*?\./gi,
    /এই ওয়েবসাইটে আরও জানতে পারবেন।/gi,
  ];
  
  for (const phrase of unnecessaryPhrases) {
    processed = processed.replace(phrase, "");
  }
  
  // একাধিক স্পেস সরান
  processed = processed.replace(/\s+/g, " ").trim();
  
  // যদি ব্যবহারকারী "সরাসরি উত্তর দিন" বলে, শুধুমাত্র প্রথম বাক্য রাখুন
  if (userMessage.toLowerCase().includes("সরাসরি") || userMessage.toLowerCase().includes("সংক্ষেপে")) {
    const sentences = processed.split("।");
    if (sentences.length > 0) {
      processed = sentences[0].trim() + "।";
    }
  }
  
  return processed;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 মূল চ্যাট ফাংশন - রিট্রাই লজিক সহ
// ═══════════════════════════════════════════════════════════════════════════════
async function chat(userMessage, conversationHistory = []) {
  try {
    // ইনপুট ভ্যালিডেশন
    const sanitizedMessage = sanitizeInput(userMessage);
    
    // রিট্রাই লজিক
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await client.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: IMPROVED_SYSTEM_PROMPT,
          messages: [
            ...conversationHistory,
            { role: "user", content: sanitizedMessage }
          ],
        });
        
        let assistantMessage = response.content[0].text;
        
        // পোস্ট-প্রসেসিং
        assistantMessage = postProcessResponse(assistantMessage, sanitizedMessage);
        
        return {
          success: true,
          message: assistantMessage,
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        };
      } catch (error) {
        lastError = error;
        
        // যদি রেট লিমিট হয়, অপেক্ষা করুন
        if (error.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // এক্সপোনেনশিয়াল ব্যাকঅফ
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          throw error; // অন্যান্য এরর সরাসরি থ্রো করুন
        }
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error("Chat API Error:", error);
    
    // ব্যবহারকারী-বান্ধব এরর মেসেজ
    let errorMessage = "দুঃখিত, আমি এই মুহূর্তে সাহায্য করতে পারছি না। অনুগ্রহ করে পরে চেষ্টা করুন।";
    
    if (error.message.includes("prompt injection")) {
      errorMessage = "আপনার বার্তায় সন্দেহজনক কন্টেন্ট রয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
    } else if (error.message.includes("too long")) {
      errorMessage = "আপনার বার্তা খুব দীর্ঘ। অনুগ্রহ করে সংক্ষিপ্ত করুন এবং আবার চেষ্টা করুন।";
    }
    
    return {
      success: false,
      error: errorMessage,
      details: error.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 এক্সপোর্ট
// ═══════════════════════════════════════════════════════════════════════════════
module.exports = { chat, sanitizeInput, postProcessResponse };
