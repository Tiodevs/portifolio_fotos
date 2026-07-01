export type Category = "home" | "personal";

export interface Album {
  id: string;
  title: string;
  description: string | null;
  album_date: string | null;
  category: Category;
  cover_url: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  url: string;
  sort_order: number;
  width: number | null;
  height: number | null;
}
