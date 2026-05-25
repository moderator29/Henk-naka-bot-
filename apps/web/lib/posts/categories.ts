/**
 * Post types / styles. The creator picks one when composing; it's stored in
 * posts.category (no new column needed). The picker is searchable because the
 * list is long. Audience (public / subscribers / tier) is separate.
 */

export const POST_CATEGORIES: string[] = [
  // Creative
  "Art", "Photography", "Illustration", "Digital Art", "Design", "Fashion",
  "Makeup", "Cosplay", "Tattoo", "Crafts", "Animation", "Film", "Video",
  "Short Film", "Cinematography", "Editing",
  // Music & audio
  "Music", "Singing", "Songwriting", "Production", "DJ", "Beats", "Covers",
  "Instrumental", "Podcast", "ASMR", "Voice", "Audio",
  // Performance
  "Dance", "Choreography", "Burlesque", "Pole", "Performance", "Theatre",
  "Comedy", "Drag",
  // Lifestyle
  "Lifestyle", "Fitness", "Yoga", "Wellness", "Beauty", "Skincare",
  "Travel", "Food", "Cooking", "Recipes", "Home", "Decor", "Gardening",
  "Pets", "Parenting", "Relationships", "Dating",
  // Adult (18+)
  "18+", "Glamour", "Boudoir", "Lingerie", "Sensual", "NSFW", "Fetish",
  "Roleplay", "Couples", "Solo",
  // Knowledge
  "Education", "Tutorial", "How-To", "Strategy", "Business", "Marketing",
  "Finance", "Investing", "Trading", "Crypto", "Web3", "NFTs", "Tech",
  "Coding", "AI", "Science", "Writing", "Books", "Language", "History",
  "Philosophy",
  // Play
  "Gaming", "Streaming", "Esports", "Sports", "Cars", "Motorsport",
  "Outdoors", "Fishing", "Hiking",
  // Community
  "Announcements", "Updates", "Behind the Scenes", "Q&A", "Polls",
  "Curations", "Reviews", "Reactions", "Vlog", "Daily", "Motivation",
  "Spirituality", "Astrology", "Meditation",
  // Commerce
  "Merch", "Giveaway", "Collab", "Event", "Live", "Exclusive", "Premium",
  // Catch-all
  "Other",
];

/** Case-insensitive contains filter for the searchable picker. */
export function filterCategories(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return POST_CATEGORIES;
  return POST_CATEGORIES.filter((c) => c.toLowerCase().includes(q));
}
