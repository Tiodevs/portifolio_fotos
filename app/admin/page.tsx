import Link from "next/link";
import Image from "next/image";
import { getAllAlbums } from "@/lib/albums";
import { deleteAlbum } from "@/app/admin/actions";
import NewAlbumForm from "@/app/admin/new-album-form";
import ConfirmForm from "@/app/admin/confirm-form";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const albums = await getAllAlbums();
  const homeCount = albums.filter((a) => a.category === "home").length;
  const personalCount = albums.filter((a) => a.category === "personal").length;

  return (
    <div className="px-6 py-16 md:px-10">
      <header className="mb-16 border-b border-line pb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Painel de controle
        </p>
        <h1 className="display text-6xl md:text-8xl">Admin</h1>
        <p className="mt-6 max-w-md text-neutral-600">
          Crie e gerencie seus albuns. {albums.length} album(ns) no total —{" "}
          {homeCount} na Home e {personalCount} em Pessoal.
        </p>
      </header>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section>
          <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Novo album
          </h2>
          <NewAlbumForm />
        </section>

        <section>
          <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Albuns
          </h2>
          {albums.length === 0 ? (
            <p className="border border-dashed border-line px-6 py-12 text-center text-neutral-500">
              Nenhum album ainda. Crie o primeiro ao lado.
            </p>
          ) : (
            <ul className="border-t border-line">
              {albums.map((album) => (
                <li
                  key={album.id}
                  className="group flex items-center gap-4 border-b border-line py-4 transition-colors hover:bg-black/[0.03]"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-neutral-200">
                    {album.cover_url && (
                      <Image
                        src={album.cover_url}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex border border-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">
                        {album.category === "home" ? "Home" : "Pessoal"}
                      </span>
                      {album.album_date && (
                        <span className="text-xs text-neutral-500">
                          {formatDate(album.album_date)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-lg font-medium">{album.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-xs uppercase tracking-wide">
                    <Link
                      href={`/admin/${album.id}`}
                      className="underline underline-offset-4 hover:opacity-60"
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/projetos/${album.id}`}
                      target="_blank"
                      className="underline underline-offset-4 hover:opacity-60"
                    >
                      Ver
                    </Link>
                    <ConfirmForm
                      action={deleteAlbum}
                      message={`Excluir o album "${album.title}" e todas as fotos?`}
                    >
                      <input type="hidden" name="id" value={album.id} />
                      <button
                        type="submit"
                        className="text-red-700 underline underline-offset-4 hover:opacity-60"
                      >
                        Excluir
                      </button>
                    </ConfirmForm>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
