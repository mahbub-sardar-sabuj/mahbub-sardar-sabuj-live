/**
 * রেসপন্স অপ্টিমাইজার - চ্যাটবটের উত্তরগুলোকে সংক্ষিপ্ত এবং সরাসরি করতে সাহায্য করে
 */

/**
 * উত্তরকে সংক্ষিপ্ত করা - অপ্রাসঙ্গিক তথ্য বর্জন করে
 * @param {string} response - মূল উত্তর
 * @param {string} questionType - প্রশ্নের ধরন (general, author, website, personal)
 * @returns {string} - অপ্টিমাইজড উত্তর
 */
function optimizeResponse(response, questionType = 'general') {
  if (!response || typeof response !== 'string') return response;

  // ধাপ ১: অপ্রয়োজনীয় পুনরাবৃত্তি সরাও
  // "আমি একজন কৃত্রিম বুদ্ধিমত্তা, তাই..." এর পর অপ্রাসঙ্গিক কথা সরাও
  response = response.replace(
    /(\আমি একজন কৃত্রিম বুদ্ধিমত্তা.*?\।)\s*আমি আপনাকে.*?সাহায্য করতে পারি.*?[\।!]/gi,
    '$1'
  );

  // ধাপ ২: "তবে আমি মূলত..." এর পর অপ্রাসঙ্গিক কথা সরাও
  response = response.replace(
    /\s*তবে আমি মূলত.*?(?=\n|$)/gi,
    ''
  );

  // ধাপ ৩: "আপনার কি ... জানার আছে?" এর মতো অপ্রয়োজনীয় প্রশ্ন সরাও
  response = response.replace(
    /\s*আপনার কি.*?জানার আছে\?/gi,
    ''
  );

  // ধাপ ৪: একাধিক পিরিয়ড বা এক্সক্লামেশন মার্ক সরাও
  response = response.replace(/([।!])\1+/g, '$1');

  // ধাপ ৫: শেষে অপ্রয়োজনীয় স্পেস সরাও
  response = response.trim();

  // ধাপ ৬: যদি উত্তর ১০০ শব্দের বেশি হয় এবং সাধারণ প্রশ্ন হয়, তাহলে প্রথম ৭০ শব্দ রাখো
  if (questionType === 'general' || questionType === 'personal') {
    const words = response.split(/\s+/);
    if (words.length > 100) {
      response = words.slice(0, 70).join(' ') + '।';
    }
  }

  return response;
}

/**
 * প্রশ্নের ধরন নির্ধারণ করা
 * @param {string} question - ব্যবহারকারীর প্রশ্ন
 * @returns {string} - প্রশ্নের ধরন
 */
function determineQuestionType(question) {
  if (!question || typeof question !== 'string') return 'general';

  const lowerQuestion = question.toLowerCase();

  // লেখক সম্পর্কে প্রশ্ন
  if (lowerQuestion.includes('লেখক') || lowerQuestion.includes('মাহবুব') || 
      lowerQuestion.includes('সরদার') || lowerQuestion.includes('জন্ম') ||
      lowerQuestion.includes('বাবা') || lowerQuestion.includes('মা') ||
      lowerQuestion.includes('ইমেইল') || lowerQuestion.includes('ফেসবুক')) {
    return 'author';
  }

  // ওয়েবসাইট সম্পর্কে প্রশ্ন
  if (lowerQuestion.includes('ওয়েবসাইট') || lowerQuestion.includes('সাইট') ||
      lowerQuestion.includes('পেজ') || lowerQuestion.includes('ফিচার') ||
      lowerQuestion.includes('চ্যাট') || lowerQuestion.includes('ডিজাইন') ||
      lowerQuestion.includes('অডিও') || lowerQuestion.includes('বই') ||
      lowerQuestion.includes('কবিতা') || lowerQuestion.includes('লেখা')) {
    return 'website';
  }

  // ব্যক্তিগত প্রশ্ন
  if (lowerQuestion.includes('প্রিয়') || lowerQuestion.includes('খাবার') ||
      lowerQuestion.includes('অনুভব') || lowerQuestion.includes('মানুষ') ||
      lowerQuestion.includes('কে')) {
    return 'personal';
  }

  return 'general';
}

/**
 * চ্যাটবটের উত্তর পোস্ট-প্রসেস করা
 * @param {string} response - মূল উত্তর
 * @param {string} question - ব্যবহারকারীর প্রশ্ন
 * @returns {string} - অপ্টিমাইজড উত্তর
 */
function postProcessResponse(response, question) {
  if (!response || typeof response !== 'string') return response;

  const questionType = determineQuestionType(question);
  let optimized = optimizeResponse(response, questionType);

  // যদি "সরাসরি উত্তর দিন" বা "সংক্ষেপে" থাকে, তাহলে আরও সংক্ষিপ্ত করো
  if (question.toLowerCase().includes('সরাসরি') || 
      question.toLowerCase().includes('সংক্ষেপে')) {
    const sentences = optimized.split(/[।!]/);
    if (sentences.length > 1) {
      optimized = sentences[0] + '।';
    }
  }

  return optimized;
}

module.exports = {
  optimizeResponse,
  determineQuestionType,
  postProcessResponse
};
