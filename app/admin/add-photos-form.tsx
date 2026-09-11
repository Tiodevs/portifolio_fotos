"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/compress";
import { uploadPhotos } from "@/app/admin/actions";

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
      const uploadFd = new FormData();
      for (let i = 0; i < files.length; i++) {
        setStatus({ type: "busy", message: `Comprimindo ${i + 1} de ${files.length}...` });
        const { blob, width, height } = await compressImage(files[i]);
        uploadFd.append("photos", blob, `${crypto.randomUUID()}.webp`);
        uploadFd.append("widths", String(width));
        uploadFd.append("heights", String(height));
      }
      setStatus({ type: "busy", message: "Enviando fotos..." });
      const res = await uploadPhotos(albumId, uploadFd);
      if (res.error) throw new Error(res.error);
      form.reset();
      setStatus({
        type: "success",
        message: `${res.count ?? files.length} foto(s) adicionada(s).`,
      });
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
        className="block w-full min-w-0 max-w-full text-sm text-neutral-600 file:mb-2 file:mr-0 file:block file:cursor-pointer file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.15em] sm:file:mb-0 sm:file:mr-4 sm:file:inline-block hover:file:bg-ink hover:file:text-paper"
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
