/**
 * চ্যাটবট এরর হ্যান্ডলিং ইউটিলিটি
 * ব্যবহারকারী-বান্ধব এবং সহায়ক এরর মেসেজ প্রদান করে
 */

export interface ChatError {
  code: string;
  message: string;
  suggestion?: string;
  isRetryable: boolean;
}

export function parseApiError(error: any): ChatError {
  // নেটওয়ার্ক এরর
  if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
    return {
      code: "TIMEOUT",
      message: "চ্যাটবট সাড়া দিতে অনেক সময় নিচ্ছে।",
      suggestion: "অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।",
      isRetryable: true,
    };
  }

  if (error?.name === "TypeError" || error?.message?.includes("fetch")) {
    return {
      code: "NETWORK_ERROR",
      message: "নেটওয়ার্ক সংযোগ বিচ্ছিন্ন হয়েছে।",
      suggestion: "আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।",
      isRetryable: true,
    };
  }

  // এপিআই এরর
  if (error?.status === 429) {
    return {
      code: "RATE_LIMIT",
      message: "অনেক বেশি অনুরোধ পাঠানো হয়েছে।",
      suggestion: "অনুগ্রহ করে কিছু সময় অপেক্ষা করুন এবং আবার চেষ্টা করুন।",
      isRetryable: true,
    };
  }

  if (error?.status === 401 || error?.status === 403) {
    return {
      code: "AUTH_ERROR",
      message: "অনুমতি দেওয়া হয়নি।",
      suggestion: "অনুগ্রহ করে পৃষ্ঠা রিফ্রেশ করুন এবং আবার চেষ্টা করুন।",
      isRetryable: false,
    };
  }

  if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
    return {
      code: "SERVER_ERROR",
      message: "সার্ভার এই মুহূর্তে অনুপলব্ধ।",
      suggestion: "সার্ভার পুনরুদ্ধার হচ্ছে, অনুগ্রহ করে কিছু সময় পর আবার চেষ্টা করুন।",
      isRetryable: true,
    };
  }

  if (error?.status === 400) {
    return {
      code: "BAD_REQUEST",
      message: "অনুরোধটি বৈধ নয়।",
      suggestion: "আপনার ইনপুট পরীক্ষা করুন এবং আবার চেষ্টা করুন।",
      isRetryable: false,
    };
  }

  // ডিফল্ট এরর
  return {
    code: "UNKNOWN_ERROR",
    message: "কিছু ভুল হয়েছে।",
    suggestion: "অনুগ্রহ করে পৃষ্ঠা রিফ্রেশ করুন এবং আবার চেষ্টা করুন। যদি সমস্যা থাকে তবে সাপোর্টে যোগাযোগ করুন।",
    isRetryable: true,
  };
}

export function formatErrorMessage(error: ChatError): string {
  let message = `❌ ${error.message}`;
  if (error.suggestion) {
    message += `\n\n💡 ${error.suggestion}`;
  }
  return message;
}

export function isRetryableError(error: any): boolean {
  const parsed = parseApiError(error);
  return parsed.isRetryable;
}
