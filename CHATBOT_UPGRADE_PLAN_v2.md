# AI Chatbot Upgrade Plan v2

## 1. Backend Improvements (`api/chat.js`)
- **System Prompt Refinement**: Enhance the persona to be more empathetic, professional, and context-aware.
- **Improved Fallbacks**: Add more specific regex matches for common queries (e.g., pricing, availability, specific book details).
- **Better Error Handling**: Return more descriptive, user-friendly Bengali error messages instead of generic HTTP errors.
- **Enhanced AI Configuration**: Add support for structured output if supported by the model, ensuring consistent button formatting.

## 2. Frontend Improvements (`AIChatbot.tsx`)
- **Typing Animation**: Add a natural typing effect for AI responses instead of showing the entire message instantly.
- **Message Reactions**: Allow users to react (e.g., 👍, 👎) to AI responses for feedback.
- **Context-Aware Suggestions**: Update the suggestion chips dynamically based on the current conversation context, not just at the beginning.
- **Improved UI/UX**:
  - Add a "Scroll to bottom" button when the user scrolls up.
  - Enhance the styling of the audio player and attachment cards.
  - Add tooltips to all icon buttons for better accessibility.
- **Audio/Image Capabilities**:
  - Add a drag-and-drop zone for files over the chat window.
  - Show a progress bar during audio processing/uploading.

## 3. Implementation Steps
1. Update `api/chat.js` with refined prompts and error handling.
2. Update `AIChatbot.tsx` with typing animations, dynamic suggestions, and UI enhancements.
3. Test locally.
4. Commit and push to GitHub.
