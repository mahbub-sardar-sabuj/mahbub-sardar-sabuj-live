-- Community feed performance indexes.
-- The feed filters by status/category and enriches visible posts by postId.

CREATE INDEX `writing_posts_status_feed_idx`
  ON `writing_posts` (`status`, `featured`, `boostedScore`, `createdAt`);

CREATE INDEX `writing_posts_status_category_feed_idx`
  ON `writing_posts` (`status`, `category`, `featured`, `boostedScore`, `createdAt`);

CREATE INDEX `writing_comments_post_status_idx`
  ON `writing_comments` (`postId`, `status`);

CREATE INDEX `writing_reactions_post_idx`
  ON `writing_reactions` (`postId`);

CREATE INDEX `writing_reactions_user_post_idx`
  ON `writing_reactions` (`userOpenId`, `postId`);
