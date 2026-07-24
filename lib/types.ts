export type Category = "home" | "personal";

export interface Album {
  id: string;
  title: string;
  description: string | null;
  album_date: string | null;
  category: Category;
  /** Object key in storage (raw). */
  cover_key?: string | null;
  /** Signed URL for display (or null). */
  cover_url: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  /** Object key in storage (raw). */
  storage_key?: string;
  /** Signed URL for display. */
  url: string;
  sort_order: number;
  width: number | null;
  height: number | null;
}
