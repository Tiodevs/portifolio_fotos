"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress";
import { createAlbumMeta, savePhotos } from "@/app/admin/actions";

const labelClass = "mb-2 block text-xs uppercase tracking-[0.2em] text-neutral-500";
const inputClass =
  "w-full rounded-none border border-line bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-ink";

type Status = { type: "idle" | "busy" | "success" | "error"; message: string };

export default function NewAlbumForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const busy = status.type === "busy";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") || "").trim();
    if (!title) {
      setStatus({ type: "error", message: "Informe um titulo." });
      return;
    }
    const files = (fd.getAll("photos") as File[]).filter((f) => f && f.size > 0);

    setStatus({ type: "busy", message: "Criando album..." });
    const meta = await createAlbumMeta({
      title,
      description: String(fd.get("description") || ""),
      album_date: String(fd.get("album_date") || ""),
      category: String(fd.get("category") || "home"),
    });
    if (meta.error || !meta.id) {
      setStatus({ type: "error", message: meta.error || "Erro ao criar album." });
      return;
    }

    try {
      const supabase = createBrowserClient();
      const items: { url: string; width: number; height: number }[] = [];
      for (let i = 0; i < files.length; i++) {
        setStatus({ type: "busy", message: `Enviando foto ${i + 1} de ${files.length}...` });
        const { blob, width, height } = await compressImage(files[i]);
        const path = `${meta.id}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage
          .from("photos")
          .upload(path, blob, { contentType: "image/webp", upsert: false });
        if (error) throw new Error(error.message);
        const url = supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
        items.push({ url, width, height });
      }
      const res = await savePhotos(meta.id, items);
      if (res.error) throw new Error(res.error);

      form.reset();
      setStatus({ type: "success", message: `Album "${title}" criado com ${items.length} foto(s).` });
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Erro no upload." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Titulo</label>
        <input name="title" required className={inputClass} placeholder="Nome do album" />
      </div>

      <div>
        <label className={labelClass}>Descricao</label>
        <textarea name="description" rows={3} className={inputClass} placeholder="Um breve texto (opcional)" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Data</label>
          <input type="date" name="album_date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Onde aparece</label>
          <select name="category" defaultValue="home" className={inputClass}>
            <option value="home">Home</option>
            <option value="personal">Pessoal</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Fotos</label>
        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          className="block w-full text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.15em] hover:file:bg-ink hover:file:text-paper"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-ink px-6 py-4 text-xs uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {busy ? "Processando..." : "Criar album"}
      </button>

      {status.type !== "idle" && (
        <p
          className={`border px-4 py-3 text-sm ${
            status.type === "error"
              ? "border-red-700 text-red-700"
              : status.type === "success"
              ? "border-green-700 text-green-700"
              : "border-line text-neutral-600"
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  );
}
