"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress";
import { savePhotos } from "@/app/admin/actions";

type Status = { type: "idle" | "busy" | "success" | "error"; message: string };

export default function AddPhotosForm({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const busy = status.type === "busy";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const files = (fd.getAll("photos") as File[]).filter((f) => f && f.size > 0);
    if (files.length === 0) {
      setStatus({ type: "error", message: "Selecione ao menos uma foto." });
      return;
    }
    try {
      const supabase = createBrowserClient();
      const items: { url: string; width: number; height: number }[] = [];
      for (let i = 0; i < files.length; i++) {
        setStatus({ type: "busy", message: `Enviando ${i + 1} de ${files.length}...` });
        const { blob, width, height } = await compressImage(files[i]);
        const path = `${albumId}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage
          .from("photos")
          .upload(path, blob, { contentType: "image/webp", upsert: false });
        if (error) throw new Error(error.message);
        const url = supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
        items.push({ url, width, height });
      }
      const res = await savePhotos(albumId, items);
      if (res.error) throw new Error(res.error);
      form.reset();
      setStatus({ type: "success", message: `${items.length} foto(s) adicionada(s).` });
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Erro no upload." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="file"
        name="photos"
        multiple
        accept="image/*"
        className="block w-full text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.15em] hover:file:bg-ink hover:file:text-paper"
      />
      <button
        type="submit"
        disabled={busy}
        className="border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {busy ? "Enviando..." : "Enviar fotos"}
      </button>
      {status.type !== "idle" && (
        <p
          className={`text-sm ${
            status.type === "error"
              ? "text-red-700"
              : status.type === "success"
              ? "text-green-700"
              : "text-neutral-600"
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
