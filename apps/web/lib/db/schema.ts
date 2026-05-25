/**
 * Aurora database schema, Drizzle.
 *
 * Mirrors RPD §5.3. All `id` columns use UUID. Numeric columns hold $NSFW
 * balances at 36/6 precision (the token has 18 decimals on-chain; we store a
 * human-scale value with 6 fractional digits, which is plenty for display and
 * off-chain accounting).
 *
 * Row Level Security policies, full-text indexes, and triggers ship as raw
 * SQL in supabase/migrations alongside the generated DDL.
 */

import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
  date,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique(),
    username: text("username").unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    displayName: text("display_name"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    coverUrl: text("cover_url"),
    walletAddress: text("wallet_address"),
    country: text("country"),
    dateOfBirth: date("date_of_birth"),
    isCreator: boolean("is_creator").default(false).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  },
  (t) => ({
    usernameIdx: index("users_username_idx").on(t.username),
    walletIdx: index("users_wallet_idx").on(t.walletAddress),
  })
);

export const creatorProfiles = pgTable("creator_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  tagline: text("tagline"),
  categories: text("categories").array(),
  payoutWallet: text("payout_wallet"),
  totalEarningsNsfw: numeric("total_earnings_nsfw", {
    precision: 36,
    scale: 6,
  })
    .default("0")
    .notNull(),
  subscriberCount: integer("subscriber_count").default(0).notNull(),
  verifiedCreator: boolean("verified_creator").default(false).notNull(),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
});

export const subscriptionTiers = pgTable(
  "subscription_tiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceNsfw: numeric("price_nsfw", { precision: 36, scale: 6 }).notNull(),
    benefits: jsonb("benefits"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    creatorIdx: index("tiers_creator_idx").on(t.creatorId),
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fanId: uuid("fan_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tierId: uuid("tier_id")
      .notNull()
      .references(() => subscriptionTiers.id),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    autoRenew: boolean("auto_renew").default(true).notNull(),
    txHash: text("tx_hash"),
  },
  (t) => ({
    fanIdx: index("subs_fan_idx").on(t.fanId),
    expiresIdx: index("subs_expires_idx").on(t.expiresAt),
  })
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    caption: text("caption"),
    media: jsonb("media"),
    tierRequired: uuid("tier_required").references(() => subscriptionTiers.id),
    category: text("category"),
    isDemo: boolean("is_demo").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  },
  (t) => ({
    creatorIdx: index("posts_creator_idx").on(t.creatorId),
    createdIdx: index("posts_created_idx").on(t.createdAt),
    categoryIdx: index("posts_category_idx").on(t.category),
  })
);

export const likes = pgTable(
  "likes",
  {
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.postId, t.userId] }) })
);

export const saves = pgTable(
  "saves",
  {
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.postId, t.userId] }) })
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    postIdx: index("comments_post_idx").on(t.postId),
  })
);

export const tips = pgTable("tips", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUser: uuid("from_user")
    .references(() => users.id)
    .notNull(),
  toUser: uuid("to_user")
    .references(() => users.id)
    .notNull(),
  amountNsfw: numeric("amount_nsfw", { precision: 36, scale: 6 }).notNull(),
  postId: uuid("post_id").references(() => posts.id),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followingId: uuid("following_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
    followerIdx: index("follows_follower_idx").on(t.followerId),
    followingIdx: index("follows_following_idx").on(t.followingId),
  })
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userIdx: index("notifications_user_idx").on(t.userId),
  })
);

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  categoriesInterest: jsonb("categories_interest"),
  creatorAffinities: jsonb("creator_affinities"),
  aiPersonaMemory: jsonb("ai_persona_memory"),
  settings: jsonb("settings"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  onboardingCompletedAt: timestamp("onboarding_completed_at", {
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const stakingPositions = pgTable("staking_positions", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  wallet: text("wallet").notNull(),
  amountStaked: numeric("amount_staked", { precision: 36, scale: 6 })
    .default("0")
    .notNull(),
  stakedAt: timestamp("staked_at", { withTimezone: true }),
  unlockAt: timestamp("unlock_at", { withTimezone: true }),
  pendingRewards: numeric("pending_rewards", { precision: 36, scale: 6 })
    .default("0")
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const nftHoldings = pgTable(
  "nft_holdings",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    contractAddress: text("contract_address").notNull(),
    tokenId: text("token_id").notNull(),
    metadata: jsonb("metadata"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.userId, t.contractAddress, t.tokenId],
    }),
  })
);

export const marketplaceListings = pgTable(
  "marketplace_listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    contractAddress: text("contract_address").notNull(),
    tokenId: text("token_id").notNull(),
    priceNsfw: numeric("price_nsfw", { precision: 36, scale: 6 }).notNull(),
    status: text("status").default("active").notNull(),
    isDemo: boolean("is_demo").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    statusIdx: index("listings_status_idx").on(t.status),
  })
);

/**
 * Direct messaging tables.
 *
 * conversations.participant_a and participant_b are stored in a canonical
 * (sorted) order so a unique(participant_a, participant_b) constraint
 * prevents duplicate threads between the same two users.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantA: uuid("participant_a")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    participantB: uuid("participant_b")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    aIdx: index("conv_a_idx").on(t.participantA),
    bIdx: index("conv_b_idx").on(t.participantB),
    lastMsgIdx: index("conv_last_msg_idx").on(t.lastMessageAt),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    senderId: uuid("sender_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    body: text("body"),
    /** Reserved for post-MVP media messages and in-DM tips. Null at MVP. */
    media: jsonb("media"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    convIdx: index("messages_conv_idx").on(t.conversationId),
    createdIdx: index("messages_created_idx").on(t.createdAt),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
