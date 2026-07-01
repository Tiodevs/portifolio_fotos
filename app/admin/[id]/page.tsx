import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAlbum } from "@/lib/albums";
import {
  updateAlbum,
  addPhotos,
  deletePhoto,
  setCover,
  movePhoto,
} from "@/app/admin/actions";
import ConfirmForm from "@/app/admin/confirm-form";

export const dynamic = "force-dynamic";

const labelClass = "mb-2 block text-xs uppercase tracking-[0.2em] text-neutral-500";
const inputClass =
  "w-full rounded-none border border-line bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-ink";

export default async function EditAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAlbum(id);
  if (!data) notFound();

  const { album, photos } = data;

  return (
    <div className="px-6 py-16 md:px-10">
      <header className="mb-16 border-b border-line pb-10">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="text-xs uppercase tracking-[0.2em] underline underline-offset-4 hover:opacity-60"
          >
            Voltar
          </Link>
          <Link
            href={`/projetos/${album.id}`}
            target="_blank"
            className="text-xs uppercase tracking-[0.2em] underline underline-offset-4 hover:opacity-60"
          >
            Ver pagina
          </Link>
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Editando album
        </p>
        <h1 className="display text-5xl md:text-7xl">{album.title}</h1>
      </header>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-16">
          <section>
            <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
              Dados do album
            </h2>
            <form action={updateAlbum} className="space-y-6">
              <input type="hidden" name="id" value={album.id} />
              <div>
                <label className={labelClass}>Titulo</label>
                <input name="title" required defaultValue={album.title} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descricao</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={album.description ?? ""}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Data</label>
                  <input
                    type="date"
                    name="album_date"
                    defaultValue={album.album_date ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Onde aparece</label>
                  <select name="category" defaultValue={album.category} className={inputClass}>
                    <option value="home">Home</option>
                    <option value="personal">Pessoal</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-ink px-6 py-4 text-xs uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80"
              >
                Salvar alteracoes
              </button>
            </form>
          </section>

          <section>
            <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
              Adicionar fotos
            </h2>
            <form action={addPhotos} className="space-y-4">
              <input type="hidden" name="album_id" value={album.id} />
              <input
                type="file"
                name="photos"
                multiple
                accept="image/*"
                className="block w-full text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.15em] hover:file:bg-ink hover:file:text-paper"
              />
              <button
                type="submit"
                className="border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper"
              >
                Enviar fotos
              </button>
            </form>
          </section>
        </div>

        <section>
          <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Fotos ({photos.length})
          </h2>
          {photos.length === 0 ? (
            <p className="border border-dashed border-line px-6 py-12 text-center text-neutral-500">
              Nenhuma foto ainda. Adicione ao lado.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              {photos.map((photo, index) => {
                const isCover = album.cover_url === photo.url;
                return (
                  <li key={photo.id} className="group">
                    <div className="relative aspect-square overflow-hidden bg-neutral-200">
                      <Image
                        src={photo.url}
                        alt=""
                        fill
                        sizes="200px"
                        className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
                      />
                      {isCover && (
                        <span className="absolute left-2 top-2 bg-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-paper">
                          Capa
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <div className="flex gap-1">
                          <form action={movePhoto}>
                            <input type="hidden" name="album_id" value={album.id} />
                            <input type="hidden" name="id" value={photo.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              disabled={index === 0}
                              aria-label="Mover para tras"
                              className="flex h-7 w-7 items-center justify-center bg-paper text-ink transition hover:bg-white disabled:opacity-30"
                            >
                              &lsaquo;
                            </button>
                          </form>
                          <form action={movePhoto}>
                            <input type="hidden" name="album_id" value={album.id} />
                            <input type="hidden" name="id" value={photo.id} />
                            <input type="hidden" name="direction" value="down" />
                            <button
                              type="submit"
                              disabled={index === photos.length - 1}
                              aria-label="Mover para frente"
                              className="flex h-7 w-7 items-center justify-center bg-paper text-ink transition hover:bg-white disabled:opacity-30"
                            >
                              &rsaquo;
                            </button>
                          </form>
                        </div>
                        <ConfirmForm action={deletePhoto} message="Excluir esta foto?">
                          <input type="hidden" name="id" value={photo.id} />
                          <input type="hidden" name="album_id" value={album.id} />
                          <input type="hidden" name="url" value={photo.url} />
                          <button
                            type="submit"
                            aria-label="Excluir foto"
                            className="flex h-7 w-7 items-center justify-center bg-paper text-red-700 transition hover:bg-white"
                          >
                            &times;
                          </button>
                        </ConfirmForm>
                      </div>
                    </div>
                    {!isCover && (
                      <form action={setCover} className="mt-2">
                        <input type="hidden" name="album_id" value={album.id} />
                        <input type="hidden" name="url" value={photo.url} />
                        <button
                          type="submit"
                          className="w-full border border-line px-2 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors hover:border-ink"
                        >
                          Definir capa
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
