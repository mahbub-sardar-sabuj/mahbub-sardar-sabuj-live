-- Literary social platform: follows, notifications, workflows, reading analytics and editorial/community features.

ALTER TABLE `writing_posts`
  MODIFY COLUMN `status` enum('draft','scheduled','pending','approved','rejected','removed') NOT NULL DEFAULT 'pending';
ALTER TABLE `writing_posts` ADD COLUMN IF NOT EXISTS `scheduledFor` timestamp NULL;
ALTER TABLE `writing_posts` ADD COLUMN IF NOT EXISTS `publishedAt` timestamp NULL;
CREATE INDEX `writing_posts_scheduled_idx` ON `writing_posts` (`status`, `scheduledFor`);

ALTER TABLE `writing_comments` ADD COLUMN IF NOT EXISTS `parentCommentId` int NULL;
ALTER TABLE `writing_comments` ADD COLUMN IF NOT EXISTS `mentionedOpenId` varchar(64) NULL;
CREATE INDEX `writing_comments_parent_idx` ON `writing_comments` (`parentCommentId`);

CREATE TABLE IF NOT EXISTS `writing_follows` (
  `id` int AUTO_INCREMENT NOT NULL,
  `followerOpenId` varchar(64) NOT NULL,
  `followingOpenId` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `writing_follows_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_follows_follower_following_unique` UNIQUE (`followerOpenId`, `followingOpenId`),
  KEY `writing_follows_following_idx` (`followingOpenId`)
);

CREATE TABLE IF NOT EXISTS `writing_notifications` (
  `id` int AUTO_INCREMENT NOT NULL,
  `recipientOpenId` varchar(64) NOT NULL,
  `actorOpenId` varchar(64),
  `type` enum('follow','reaction','comment','reply','mention','editorial','challenge','collaboration','scheduled') NOT NULL,
  `postId` int,
  `commentId` int,
  `title` varchar(220) NOT NULL,
  `body` varchar(600),
  `readAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `writing_notifications_id` PRIMARY KEY (`id`),
  KEY `writing_notifications_recipient_read_created_idx` (`recipientOpenId`, `readAt`, `createdAt`)
);

CREATE TABLE IF NOT EXISTS `writing_drafts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `authorOpenId` varchar(64) NOT NULL,
  `title` varchar(220),
  `category` enum('experience','story','poem','thought','photo','video') NOT NULL DEFAULT 'thought',
  `content` text NOT NULL,
  `mediaUrl` text,
  `mediaType` enum('none','image','video') NOT NULL DEFAULT 'none',
  `challengeId` int,
  `scheduledFor` timestamp NULL,
  `autosavedAt` timestamp NOT NULL DEFAULT (now()),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_drafts_id` PRIMARY KEY (`id`),
  KEY `writing_drafts_author_updated_idx` (`authorOpenId`, `updatedAt`),
  KEY `writing_drafts_scheduled_idx` (`scheduledFor`)
);

CREATE TABLE IF NOT EXISTS `writing_reading_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `readerOpenId` varchar(64),
  `eventType` enum('view','complete','share','audio_play') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `writing_reading_events_id` PRIMARY KEY (`id`),
  KEY `writing_reading_events_post_created_idx` (`postId`, `createdAt`),
  KEY `writing_reading_events_reader_created_idx` (`readerOpenId`, `createdAt`)
);

CREATE TABLE IF NOT EXISTS `writing_prompts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `category` enum('experience','story','poem','thought','photo','video') NOT NULL DEFAULT 'thought',
  `title` varchar(180) NOT NULL,
  `prompt` varchar(900) NOT NULL,
  `active` boolean NOT NULL DEFAULT true,
  `position` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `writing_prompts_id` PRIMARY KEY (`id`),
  KEY `writing_prompts_active_position_idx` (`active`, `position`)
);

CREATE TABLE IF NOT EXISTS `writing_collections` (
  `id` int AUTO_INCREMENT NOT NULL,
  `slug` varchar(180) NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` varchar(900),
  `coverUrl` text,
  `active` boolean NOT NULL DEFAULT true,
  `createdByOpenId` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_collections_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_collections_slug_unique` UNIQUE (`slug`),
  KEY `writing_collections_active_created_idx` (`active`, `createdAt`)
);

CREATE TABLE IF NOT EXISTS `writing_collection_items` (
  `id` int AUTO_INCREMENT NOT NULL,
  `collectionId` int NOT NULL,
  `postId` int NOT NULL,
  `position` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `writing_collection_items_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_collection_items_collection_post_unique` UNIQUE (`collectionId`, `postId`),
  KEY `writing_collection_items_collection_position_idx` (`collectionId`, `position`)
);

CREATE TABLE IF NOT EXISTS `writing_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(180) NOT NULL,
  `prompt` text NOT NULL,
  `category` enum('experience','story','poem','thought','photo','video') NOT NULL DEFAULT 'thought',
  `status` enum('draft','scheduled','live','ended','archived') NOT NULL DEFAULT 'draft',
  `startsAt` timestamp NOT NULL,
  `endsAt` timestamp NOT NULL,
  `createdByOpenId` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_events_id` PRIMARY KEY (`id`),
  KEY `writing_events_status_starts_idx` (`status`, `startsAt`)
);

CREATE TABLE IF NOT EXISTS `writing_collaboration_invites` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `inviterOpenId` varchar(64) NOT NULL,
  `inviteeOpenId` varchar(64) NOT NULL,
  `status` enum('pending','accepted','declined','cancelled') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_collaboration_invites_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_collaboration_invites_post_invitee_unique` UNIQUE (`postId`, `inviteeOpenId`),
  KEY `writing_collaboration_invites_invitee_status_idx` (`inviteeOpenId`, `status`)
);

CREATE TABLE IF NOT EXISTS `writing_moderation_signals` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `type` enum('duplicate','sensitive','profanity','community_report') NOT NULL,
  `score` int NOT NULL DEFAULT 0,
  `details` varchar(900),
  `status` enum('open','reviewed','dismissed') NOT NULL DEFAULT 'open',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_moderation_signals_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_moderation_signals_post_type_unique` UNIQUE (`postId`, `type`),
  KEY `writing_moderation_signals_status_created_idx` (`status`, `createdAt`)
);

INSERT INTO `writing_prompts` (`category`, `title`, `prompt`, `position`)
SELECT 'experience', 'একটি বদলে দেওয়া মুহূর্ত', 'নিজের জীবনের এমন একটি ঘটনা লিখুন, যা আপনাকে বদলে দিয়েছে বা নতুন কিছু ভাবতে শিখিয়েছে।', 10
WHERE NOT EXISTS (SELECT 1 FROM `writing_prompts` WHERE `title` = 'একটি বদলে দেওয়া মুহূর্ত');

INSERT INTO `writing_prompts` (`category`, `title`, `prompt`, `position`)
SELECT 'story', 'মানুষ ও সমাজের গল্প', 'গ্রাম, শহর, পরিবার, শ্রম, সম্পর্ক বা মানবতার কোনো সত্য ঘটনা নিজের ভাষায় তুলে ধরুন।', 20
WHERE NOT EXISTS (SELECT 1 FROM `writing_prompts` WHERE `title` = 'মানুষ ও সমাজের গল্প');

INSERT INTO `writing_prompts` (`category`, `title`, `prompt`, `position`)
SELECT 'thought', 'একটি ছোট ভাবনা', 'কোনো সমস্যা, শিক্ষা বা সমাধান নিয়ে সংক্ষিপ্ত কিন্তু অর্থবহ একটি ভাবনা লিখুন।', 30
WHERE NOT EXISTS (SELECT 1 FROM `writing_prompts` WHERE `title` = 'একটি ছোট ভাবনা');
