-- Literary community extensions: bookmarks, reader feedback, reports, challenges and editorial picks.
-- All schema changes run only via Drizzle migrations, never from request handlers.

ALTER TABLE `local_users` ADD COLUMN IF NOT EXISTS `bio` text;
ALTER TABLE `local_users` ADD COLUMN IF NOT EXISTS `avatarUrl` longtext;
ALTER TABLE `local_users` ADD COLUMN IF NOT EXISTS `coverUrl` longtext;
ALTER TABLE `local_users` MODIFY COLUMN `avatarUrl` longtext;
ALTER TABLE `local_users` MODIFY COLUMN `coverUrl` longtext;

ALTER TABLE `writing_posts` ADD COLUMN IF NOT EXISTS `challengeId` int;
CREATE INDEX `writing_posts_challenge_idx` ON `writing_posts` (`challengeId`);

CREATE TABLE IF NOT EXISTS `writing_bookmarks` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `userOpenId` varchar(64) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `writing_bookmarks_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_bookmarks_user_post_unique` UNIQUE (`userOpenId`, `postId`),
  KEY `writing_bookmarks_post_idx` (`postId`)
);

CREATE TABLE IF NOT EXISTS `writing_feedback` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `userOpenId` varchar(64) NOT NULL,
  `kind` enum('meaningful','relatable','helpful','beautiful') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_feedback_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_feedback_user_post_unique` UNIQUE (`userOpenId`, `postId`),
  KEY `writing_feedback_post_idx` (`postId`)
);

CREATE TABLE IF NOT EXISTS `writing_reports` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `reporterOpenId` varchar(64) NOT NULL,
  `reason` enum('harassment','misinformation','plagiarism','other') NOT NULL,
  `details` varchar(600),
  `status` enum('pending','reviewed','actioned','dismissed') NOT NULL DEFAULT 'pending',
  `adminNote` varchar(600),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_reports_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_reports_reporter_post_unique` UNIQUE (`reporterOpenId`, `postId`),
  KEY `writing_reports_status_idx` (`status`)
);

CREATE TABLE IF NOT EXISTS `writing_challenges` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(180) NOT NULL,
  `prompt` text NOT NULL,
  `category` enum('experience','story','poem','thought','photo','video') NOT NULL DEFAULT 'thought',
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `startsAt` timestamp NOT NULL DEFAULT (now()),
  `endsAt` timestamp NULL,
  `createdByOpenId` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_challenges_id` PRIMARY KEY (`id`),
  KEY `writing_challenges_status_idx` (`status`)
);

CREATE TABLE IF NOT EXISTS `writing_editorial_picks` (
  `id` int AUTO_INCREMENT NOT NULL,
  `postId` int NOT NULL,
  `headline` varchar(180),
  `editorNote` varchar(600),
  `position` int NOT NULL DEFAULT 0,
  `active` boolean NOT NULL DEFAULT true,
  `createdByOpenId` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `writing_editorial_picks_id` PRIMARY KEY (`id`),
  CONSTRAINT `writing_editorial_picks_post_unique` UNIQUE (`postId`),
  KEY `writing_editorial_picks_active_position_idx` (`active`, `position`)
);

-- Launch a single community prompt only when no active challenge exists.
INSERT INTO `writing_challenges` (`title`, `prompt`, `category`, `status`)
SELECT 'এই সপ্তাহের বাস্তবতা', 'এই সপ্তাহে এমন একটি বাস্তব ঘটনা লিখুন, যা আপনাকে মানুষ, সম্পর্ক বা জীবন সম্পর্কে নতুন করে ভাবিয়েছে।', 'experience', 'active'
WHERE NOT EXISTS (SELECT 1 FROM `writing_challenges` WHERE `status` = 'active');
