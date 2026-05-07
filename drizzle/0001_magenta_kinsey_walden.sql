CREATE TABLE `live_chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`sender` enum('visitor','admin') NOT NULL,
	`content` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `live_chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`visitorName` varchar(128) DEFAULT 'অতিথি',
	`visitorId` varchar(64) NOT NULL,
	`status` enum('active','closed','waiting') NOT NULL DEFAULT 'waiting',
	`adminRead` boolean NOT NULL DEFAULT false,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_chat_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `live_chat_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `writing_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`authorOpenId` varchar(64) NOT NULL,
	`authorName` varchar(160) NOT NULL,
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected','removed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writing_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writing_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`authorOpenId` varchar(64) NOT NULL,
	`authorName` varchar(160) NOT NULL,
	`title` varchar(220) NOT NULL,
	`category` enum('experience','story','poem','thought','photo','video') NOT NULL DEFAULT 'thought',
	`content` text NOT NULL,
	`mediaUrl` text,
	`mediaType` enum('none','image','video') NOT NULL DEFAULT 'none',
	`status` enum('pending','approved','rejected','removed') NOT NULL DEFAULT 'pending',
	`featured` boolean NOT NULL DEFAULT false,
	`boostedScore` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writing_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `writing_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `writing_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userOpenId` varchar(64) NOT NULL,
	`type` enum('like','love','inspiring','sad') NOT NULL DEFAULT 'like',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writing_reactions_id` PRIMARY KEY(`id`)
);
