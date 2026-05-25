/** Shared engagement types (kept out of the "use server" actions module, which
 * may only export async functions). */

export interface CommentItem {
  id: string;
  body: string;
  authorName: string;
  authorUsername: string;
  createdAt: string;
}
