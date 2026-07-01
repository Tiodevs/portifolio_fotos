"use client";

import { useActionState } from "react";
import { createAlbum, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = { status: "idle", message: "" };

const labelClass = "mb-2 block text-xs uppercase tracking-[0.2em] text-neutral-500";
const inputClass =
  "w-full rounded-none border border-line bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-ink";

export default function NewAlbumForm() {
  const [state, formAction, pending] = useActionState(createAlbum, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className={labelClass}>Titulo</label>
        <input name="title" required className={inputClass} placeholder="Nome do album" />
      </div>

      <div>
        <label className={labelClass}>Descricao</label>
        <textarea
          name="description"
          rows={3}
          className={inputClass}
          placeholder="Um breve texto sobre o album (opcional)"
        />
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
        disabled={pending}
        className="w-full bg-ink px-6 py-4 text-xs uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Criar album"}
      </button>

      {state.status !== "idle" && (
        <p
          className={`border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-green-700 text-green-700"
              : "border-red-700 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
