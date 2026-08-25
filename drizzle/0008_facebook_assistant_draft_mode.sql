-- Facebook Assistant draft-mode foundation
-- Idempotent migration: only creates new tables and indexes.

CREATE TABLE IF NOT EXISTS facebook_assistant_settings (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ownerOpenId VARCHAR(64) NOT NULL,
  commentDraftEnabled BOOLEAN NOT NULL DEFAULT FALSE,
  messengerDraftEnabled BOOLEAN NOT NULL DEFAULT FALSE,
  autoReplyEnabled BOOLEAN NOT NULL DEFAULT FALSE,
  humanHandoffEnabled BOOLEAN NOT NULL DEFAULT TRUE,
  disclosureText VARCHAR(600) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY facebook_assistant_settings_owner_unique (ownerOpenId)
);

CREATE TABLE IF NOT EXISTS facebook_knowledge_entries (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ownerOpenId VARCHAR(64) NOT NULL,
  category ENUM('business','service','price','faq','delivery','contact','policy','other') NOT NULL DEFAULT 'other',
  title VARCHAR(220) NOT NULL,
  content LONGTEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sortOrder INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY facebook_knowledge_owner_active_idx (ownerOpenId, active, sortOrder)
);

CREATE TABLE IF NOT EXISTS facebook_style_profiles (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ownerOpenId VARCHAR(64) NOT NULL,
  name VARCHAR(120) NOT NULL DEFAULT 'আমার স্বাভাবিক উত্তরধারা',
  toneInstructions LONGTEXT NOT NULL,
  sampleReplies LONGTEXT NULL,
  language VARCHAR(24) NOT NULL DEFAULT 'bn',
  replyLength ENUM('short','medium','detailed') NOT NULL DEFAULT 'short',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY facebook_style_owner_unique (ownerOpenId)
);

CREATE TABLE IF NOT EXISTS facebook_safety_rules (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ownerOpenId VARCHAR(64) NOT NULL,
  ruleType ENUM('keyword','category') NOT NULL DEFAULT 'keyword',
  pattern VARCHAR(300) NOT NULL,
  action ENUM('handoff','block','draft_only') NOT NULL DEFAULT 'handoff',
  note VARCHAR(600) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY facebook_safety_owner_active_idx (ownerOpenId, active)
);

CREATE TABLE IF NOT EXISTS facebook_reply_drafts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ownerOpenId VARCHAR(64) NOT NULL,
  channel ENUM('comment','messenger','manual') NOT NULL DEFAULT 'manual',
  status ENUM('pending','approved','rejected','handoff','sent','failed') NOT NULL DEFAULT 'pending',
  pageId VARCHAR(64) NULL,
  postId VARCHAR(120) NULL,
  commentId VARCHAR(120) NULL,
  conversationId VARCHAR(120) NULL,
  senderPsid VARCHAR(120) NULL,
  incomingText LONGTEXT NOT NULL,
  postContext LONGTEXT NULL,
  conversationContext LONGTEXT NULL,
  suggestedReply LONGTEXT NULL,
  finalReply LONGTEXT NULL,
  safetyFlags LONGTEXT NULL,
  confidence INT NOT NULL DEFAULT 0,
  humanReason VARCHAR(600) NULL,
  generatedBy VARCHAR(80) NULL,
  approvedByOpenId VARCHAR(64) NULL,
  approvedAt TIMESTAMP NULL,
  sentAt TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY facebook_drafts_owner_status_created_idx (ownerOpenId, status, createdAt),
  KEY facebook_drafts_channel_status_created_idx (channel, status, createdAt),
  UNIQUE KEY facebook_drafts_comment_unique (commentId)
);

CREATE TABLE IF NOT EXISTS facebook_assistant_audit_logs (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ownerOpenId VARCHAR(64) NOT NULL,
  actorOpenId VARCHAR(64) NULL,
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(80) NOT NULL,
  entityId VARCHAR(120) NULL,
  details LONGTEXT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY facebook_audit_owner_created_idx (ownerOpenId, createdAt),
  KEY facebook_audit_entity_idx (entityType, entityId)
);
