import Link from "next/link";
import type { Album } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import RevealImage from "@/app/components/reveal-image";

export default function AlbumCard({
  album,
  index = 0,
}: {
  album: Album;
  index?: number;
}) {
  return (
    <Link href={`/projetos/${album.id}`} className="group block">
      {album.cover_url ? (
        <RevealImage
          src={album.cover_url}
          alt={album.title}
          width={4}
          height={3}
          sizes="(max-width: 768px) 100vw, 50vw"
          delay={Math.min(index * 0.06, 0.3)}
          priority={index < 4}
          className="transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-line text-sm text-neutral-500">
          Sem foto
        </div>
      )}
      <div className="mt-3">
        {album.album_date && (
          <p className="text-xs text-neutral-500">{formatDate(album.album_date)}</p>
        )}
        <h3 className="text-xl font-medium">{album.title}</h3>
      </div>
    </Link>
  );
}
