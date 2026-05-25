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
  language: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  notifications: { follows: true, posts: true, tips: true, renewals: true },
  ai: { concierge: true, search: true, copilot: true },
  language: "en",
};
