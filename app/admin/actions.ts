"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { removeObject, removeObjects, uploadObject } from "@/lib/storage";
import type { Photo } from "@/lib/types";

function revalidateAll(albumId?: string) {
  revalidatePath("/");
  revalidatePath("/pessoal");
  revalidatePath("/admin");
  if (albumId) revalidatePath(`/admin/${albumId}`);
}

export async function createAlbumMeta(input: {
  title: string;
  description: string;
  album_date: string;
  category: string;
}): Promise<{ id?: string; error?: string }> {
  try {
    const title = input.title.trim();
    if (!title) return { error: "Informe um titulo." };
    const category = input.category === "personal" ? "personal" : "home";

    const rows = await sql<{ id: string }[]>`
      insert into albums (title, description, album_date, category)
      values (
        ${title},
        ${input.description.trim() || null},
        ${input.album_date || null},
        ${category}
      )
      returning id
    `;
    const id = rows[0]?.id;
    if (!id) return { error: "Erro ao criar album." };

    revalidateAll(id);
    return { id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}

export async function uploadPhotos(
  albumId: string,
  formData: FormData
): Promise<{ error?: string; count?: number }> {
  try {
    if (!albumId) return { error: "Album invalido." };

    const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    const widths = formData.getAll("widths").map((w) => Number(w));
    const heights = formData.getAll("heights").map((h) => Number(h));

    if (files.length === 0) return { count: 0 };

    const existing = await sql<{ sort_order: number }[]>`
      select sort_order from photos
      where album_id = ${albumId}::uuid
      order by sort_order desc
      limit 1
    `;
    let order = existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const items: { url: string; width: number | null; height: number | null; sort_order: number }[] =
      [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = `${albumId}/${crypto.randomUUID()}.webp`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await uploadObject(key, buffer, file.type || "image/webp");
      items.push({
        url: key,
        width: Number.isFinite(widths[i]) ? widths[i] : null,
        height: Number.isFinite(heights[i]) ? heights[i] : null,
        sort_order: order++,
      });
    }

    for (const it of items) {
      await sql`
        insert into photos (album_id, url, width, height, sort_order)
        values (
          ${albumId}::uuid,
          ${it.url},
          ${it.width},
          ${it.height},
          ${it.sort_order}
        )
      `;
    }

    const albums = await sql<{ cover_url: string | null }[]>`
      select cover_url from albums where id = ${albumId}::uuid limit 1
    `;
    if (albums[0] && !albums[0].cover_url && items[0]) {
      await sql`
        update albums set cover_url = ${items[0].url} where id = ${albumId}::uuid
      `;
    }

    revalidateAll(albumId);
    return { count: items.length };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}

export async function updateAlbum(formData: FormData) {
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const albumDate = String(formData.get("album_date") || "") || null;
  const category = String(formData.get("category") || "home") as "home" | "personal";
  if (!id || !title) return;

  await sql`
    update albums set
      title = ${title},
      description = ${description || null},
      album_date = ${albumDate},
      category = ${category}
    where id = ${id}::uuid
  `;

  revalidateAll(id);
  redirect(`/admin/${id}`);
}

export async function deletePhoto(formData: FormData) {
  const id = String(formData.get("id"));
  const albumId = String(formData.get("album_id"));
  if (!id) return;

  const rows = await sql<{ url: string }[]>`
    select url from photos where id = ${id}::uuid limit 1
  `;
  const key = rows[0]?.url;
  if (key && !key.startsWith("http")) {
    await removeObject(key);
  }

  await sql`delete from photos where id = ${id}::uuid`;

  const albums = await sql<{ cover_url: string | null }[]>`
    select cover_url from albums where id = ${albumId}::uuid limit 1
  `;
  if (albums[0] && albums[0].cover_url === key) {
    const remaining = await sql<{ url: string }[]>`
      select url from photos
      where album_id = ${albumId}::uuid
      order by sort_order asc
      limit 1
    `;
    const newCover = remaining[0]?.url ?? null;
    await sql`update albums set cover_url = ${newCover} where id = ${albumId}::uuid`;
  }

  revalidateAll(albumId);
  redirect(`/admin/${albumId}`);
}

export async function setCover(formData: FormData) {
  const albumId = String(formData.get("album_id"));
  const photoId = String(formData.get("photo_id") || "");
  if (!albumId || !photoId) return;

  const rows = await sql<{ url: string }[]>`
    select url from photos where id = ${photoId}::uuid limit 1
  `;
  const key = rows[0]?.url;
  if (!key) return;

  await sql`update albums set cover_url = ${key} where id = ${albumId}::uuid`;
  revalidateAll(albumId);
  redirect(`/admin/${albumId}`);
}

export async function movePhoto(formData: FormData) {
  const albumId = String(formData.get("album_id"));
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction"));
  if (!albumId || !id) return;

  const photos = await sql<Photo[]>`
    select * from photos
    where album_id = ${albumId}::uuid
    order by sort_order asc
  `;
  const index = photos.findIndex((p) => p.id === id);
  if (index === -1) redirect(`/admin/${albumId}`);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= photos.length) redirect(`/admin/${albumId}`);

  const a = photos[index];
  const b = photos[swapWith];
  await sql`update photos set sort_order = ${b.sort_order} where id = ${a.id}::uuid`;
  await sql`update photos set sort_order = ${a.sort_order} where id = ${b.id}::uuid`;

  revalidateAll(albumId);
  redirect(`/admin/${albumId}`);
}

export async function deleteAlbum(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) return;

  const photos = await sql<{ url: string }[]>`
    select url from photos where album_id = ${id}::uuid
  `;
  const keys = photos.map((p) => p.url).filter((u) => u && !u.startsWith("http"));
  if (keys.length > 0) await removeObjects(keys);

  await sql`delete from albums where id = ${id}::uuid`;

  revalidateAll();
  redirect("/admin");
}
