import { createAdminClient } from "@/lib/supabase/server";
import type { Album, Category, Photo } from "@/lib/types";

export async function getAlbums(category: Category): Promise<Album[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("category", category)
      .order("album_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Album[]) ?? [];
  } catch (err) {
    console.error("getAlbums:", err);
    return [];
  }
}

export async function getAllAlbums(): Promise<Album[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Album[]) ?? [];
  } catch (err) {
    console.error("getAllAlbums:", err);
    return [];
  }
}

export async function getAlbum(
  id: string
): Promise<{ album: Album; photos: Photo[] } | null> {
  try {
    const supabase = createAdminClient();
    const { data: album, error } = await supabase
      .from("albums")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !album) return null;

    const { data: photos } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", id)
      .order("sort_order", { ascending: true });

    return { album: album as Album, photos: (photos as Photo[]) ?? [] };
  } catch (err) {
    console.error("getAlbum:", err);
    return null;
  }
}
