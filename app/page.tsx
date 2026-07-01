import Link from "next/link";
import { getAlbums } from "@/lib/albums";
import AlbumCard from "@/app/components/album-card";

export default async function Home() {
  const albums = await getAlbums("home");

  return (
    <div>
      <section className="px-6 pt-8 pb-16 md:px-10">
        <h1 className="display text-[15vw] leading-[0.85] md:text-[5vw]">
        Ensaio  de  fotos  Felipe
        </h1>
        <div className="mt-10 max-w-xl space-y-8">
          <p className="text-lg leading-relaxed">
          Hi! Sou fotógrafo e eternizo os maiores momento das pessoas atravez da fotografia. Porque cada grande história merece ser lembrada.
          </p>
          <div className="space-y-1 text-sm uppercase tracking-wide">
            <p>santospefelipe@gmail.com</p>
            <p>Brasil, Curitiba</p>
            <p>+55 (41) 987208843</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10">
        <p className="mb-8 text-sm tracking-[0.2em] text-neutral-500">
          APERTE EM UM ALBUM
        </p>
        {albums.length === 0 ? (
          <p className="text-neutral-500">
            Nenhum album ainda.
          </p>
        ) : (
          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
