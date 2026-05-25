/** Shared user-settings shape + defaults. Kept out of the "use server" actions
 * module because server-action files may only export async functions. */

export interface UserSettings {
  notifications: {
    follows: boolean;
    posts: boolean;
    tips: boolean;
    renewals: boolean;
  };
  ai: { concierge: boolean; search: boolean; copilot: boolean };
  privacy: {
    /** Appear in search and discovery. */
    searchable: boolean;
    /** Let others see your Likes tab. */
    showLikes: boolean;
    /** Show your online / recently-active status. */
    showOnlineStatus: boolean;
  };
  language: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  notifications: { follows: true, posts: true, tips: true, renewals: true },
  ai: { concierge: true, search: true, copilot: true },
  privacy: { searchable: true, showLikes: true, showOnlineStatus: true },
  language: "en",
};
