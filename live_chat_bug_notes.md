# Live chat audio-routing bug note

Date: 2026-06-11
URL: https://www.mahbubsardarsabuj.com/

## Observed live behavior

In the AI Agent chat window, the following normal conversation was tested:

1. User: `কেমন আছেন?`
2. Bot: `আলহামদুলিল্লাহ, আমি ভালো আছি। আপনার খোঁজ নেওয়ার জন্য ধন্যবাদ। আপনি কেমন আছেন?`
3. User: `আলহামদুলিল্লাহ ভালো`
4. Bot incorrectly replied with audio-editing context: `অডিও এডিটিংয়ের জন্য প্রস্তুত! নিচের 🎵 বাটনে ক্লিক করে অডিও ফাইলটি আপলোড করুন — তারপর আমি তাৎক্ষণিক "আলহামদুলিল্লাহ ভালো" অনুযায়ী এডিট করে দেব।`

## Expected behavior

For normal conversational replies such as `আলহামদুলিল্লাহ ভালো`, the bot must answer conversationally and must not enter audio-editing mode unless an audio file is selected/uploaded or the user explicitly requests an audio editing operation.

## Implication

The previous send-button routing fix was not sufficient for the live behavior. The remaining issue is likely in intent detection/fallback response generation, not only the send button path.

