import Link from "next/link";
import { getAlbums } from "@/lib/albums";
import AlbumCard from "@/app/components/album-card";

export default async function PessoalPage() {
  const albums = await getAlbums("personal");

  return (
    <div className="px-6 py-10 md:px-10">
      <h1 className="display mb-10 text-6xl md:text-8xl">Pessoal</h1>
      {albums.length === 0 ? (
        <p className="text-neutral-500">
          Nenhum album pessoal ainda.
        </p>
      ) : (
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
