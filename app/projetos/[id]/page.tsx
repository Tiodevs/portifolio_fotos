import { notFound } from "next/navigation";
import { getAlbum } from "@/lib/albums";
import AlbumGrid from "@/app/components/album-grid";
import { formatDate } from "@/lib/utils";

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAlbum(id);
  if (!data) notFound();

  const { album, photos } = data;

  return (
    <article className="px-6 py-10 md:px-10">
      <header className="mb-10">
        {album.album_date && (
          <p className="mb-2 text-sm text-neutral-500">
            {formatDate(album.album_date)}
          </p>
        )}
        <h1 className="display text-4xl md:text-7xl">{album.title}</h1>
        {album.description && (
          <p className="mt-4 max-w-2xl text-neutral-600">{album.description}</p>
        )}
      </header>
      <AlbumGrid photos={photos} />
    </article>
  );
}
