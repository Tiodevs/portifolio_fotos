"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import type { Photo } from "@/lib/types";

const BUCKET = "photos";

function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

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
    const supabase = createAdminClient();
    const title = input.title.trim();
    if (!title) return { error: "Informe um titulo." };
    const category = input.category === "personal" ? "personal" : "home";

    const { data, error } = await supabase
      .from("albums")
      .insert({
        title,
        description: input.description.trim() || null,
        album_date: input.album_date || null,
        category,
      })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message || "Erro ao criar album." };

    revalidateAll(data.id);
    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}

export async function savePhotos(
  albumId: string,
  items: { url: string; width: number; height: number }[]
): Promise<{ error?: string }> {
  try {
    if (!albumId) return { error: "Album invalido." };
    if (items.length === 0) return {};
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("photos")
      .select("sort_order")
      .eq("album_id", albumId)
      .order("sort_order", { ascending: false })
      .limit(1);
    let order = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const rows = items.map((it) => ({
      album_id: albumId,
      url: it.url,
      width: it.width,
      height: it.height,
      sort_order: order++,
    }));

    const { error } = await supabase.from("photos").insert(rows);
    if (error) return { error: error.message };

    const { data: album } = await supabase
      .from("albums")
      .select("cover_url")
      .eq("id", albumId)
      .single();
    if (album && !album.cover_url) {
      await supabase
        .from("albums")
        .update({ cover_url: rows[0].url })
        .eq("id", albumId);
    }

    revalidateAll(albumId);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}

export async function updateAlbum(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const albumDate = String(formData.get("album_date") || "") || null;
  const category = String(formData.get("category") || "home") as
    | "home"
    | "personal";
  if (!id || !title) return;

  await supabase
    .from("albums")
    .update({
      title,
      description: description || null,
      album_date: albumDate,
      category,
    })
    .eq("id", id);

  revalidateAll(id);
  redirect(`/admin/${id}`);
}

export async function deletePhoto(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const albumId = String(formData.get("album_id"));
  const url = String(formData.get("url"));
  if (!id) return;

  const path = storagePathFromUrl(url);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
  await supabase.from("photos").delete().eq("id", id);

  const { data: album } = await supabase
    .from("albums")
    .select("cover_url")
    .eq("id", albumId)
    .single();
  if (album && album.cover_url === url) {
    const { data: remaining } = await supabase
      .from("photos")
      .select("url")
      .eq("album_id", albumId)
      .order("sort_order", { ascending: true })
      .limit(1);
    const newCover =
      remaining && remaining.length > 0 ? remaining[0].url : null;
    await supabase
      .from("albums")
      .update({ cover_url: newCover })
      .eq("id", albumId);
  }

  revalidateAll(albumId);
  redirect(`/admin/${albumId}`);
}

export async function setCover(formData: FormData) {
  const supabase = createAdminClient();
  const albumId = String(formData.get("album_id"));
  const url = String(formData.get("url"));
  if (!albumId || !url) return;
  await supabase.from("albums").update({ cover_url: url }).eq("id", albumId);
  revalidateAll(albumId);
  redirect(`/admin/${albumId}`);
}

export async function movePhoto(formData: FormData) {
  const supabase = createAdminClient();
  const albumId = String(formData.get("album_id"));
  const id = String(formData.get("id"));
  const direction = String(formData.get("direction"));
  if (!albumId || !id) return;

  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });
  const photos = (data as Photo[]) ?? [];
  const index = photos.findIndex((p) => p.id === id);
  if (index === -1) redirect(`/admin/${albumId}`);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= photos.length) redirect(`/admin/${albumId}`);

  const a = photos[index];
  const b = photos[swapWith];
  await supabase.from("photos").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("photos").update({ sort_order: a.sort_order }).eq("id", b.id);

  revalidateAll(albumId);
  redirect(`/admin/${albumId}`);
}

export async function deleteAlbum(formData: FormData) {
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  if (!id) return;

  const { data: photos } = await supabase
    .from("photos")
    .select("url")
    .eq("album_id", id);
  const paths = (photos ?? [])
    .map((p) => storagePathFromUrl(p.url as string))
    .filter((p): p is string => Boolean(p));
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);

  await supabase.from("albums").delete().eq("id", id);

  revalidateAll();
  redirect("/admin");
}
