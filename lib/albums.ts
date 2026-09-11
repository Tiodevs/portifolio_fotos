import { sql } from "@/lib/db";
import { presignObject, presignMany } from "@/lib/storage";
import { toDateInputValue } from "@/lib/utils";
import type { Album, Category, Photo } from "@/lib/types";

type AlbumRow = Omit<Album, "cover_key"> & { cover_url: string | null };
type PhotoRow = Omit<Photo, "storage_key">;

async function signAlbum(row: AlbumRow): Promise<Album> {
  return {
    ...row,
    album_date: toDateInputValue(row.album_date) || null,
    cover_key: row.cover_url,
    cover_url: await presignObject(row.cover_url),
  };
}

async function signPhotos(rows: PhotoRow[]): Promise<Photo[]> {
  const urls = await presignMany(rows.map((p) => p.url));
  return rows.map((p, i) => ({
    ...p,
    storage_key: p.url,
    url: urls[i] ?? p.url,
  }));
}

export async function getAlbums(category: Category): Promise<Album[]> {
  try {
    const rows = await sql<AlbumRow[]>`
      select * from albums
      where category = ${category}
      order by album_date desc nulls last, created_at desc
    `;
    return Promise.all(rows.map(signAlbum));
  } catch (err) {
    console.error("getAlbums:", err);
    return [];
  }
}

export async function getAllAlbums(): Promise<Album[]> {
  try {
    const rows = await sql<AlbumRow[]>`
      select * from albums
      order by created_at desc
    `;
    return Promise.all(rows.map(signAlbum));
  } catch (err) {
    console.error("getAllAlbums:", err);
    return [];
  }
}

export async function getAlbum(
  id: string
): Promise<{ album: Album; photos: Photo[] } | null> {
  try {
    const albums = await sql<AlbumRow[]>`
      select * from albums where id = ${id}::uuid limit 1
    `;
    const album = albums[0];
    if (!album) return null;

    const photos = await sql<PhotoRow[]>`
      select * from photos
      where album_id = ${id}::uuid
      order by sort_order asc
    `;

    return {
      album: await signAlbum(album),
      photos: await signPhotos(photos),
    };
  } catch (err) {
    console.error("getAlbum:", err);
    return null;
  }
}
