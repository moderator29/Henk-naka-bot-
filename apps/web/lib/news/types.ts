/** Shared news/broadcast types (plain module, no "use server"). */

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
}

export interface NewsComment {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
}
