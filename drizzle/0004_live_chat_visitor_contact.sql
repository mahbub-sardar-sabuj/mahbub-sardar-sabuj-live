-- Migration: Add visitorContact and visitorContactType to live_chat_sessions
-- This allows storing visitor WhatsApp/Gmail contact info for offline follow-up

ALTER TABLE `live_chat_sessions`
  ADD COLUMN `visitorContact` varchar(200),
  ADD COLUMN `visitorContactType` enum('whatsapp','gmail','other');
