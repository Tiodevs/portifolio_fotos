import Image from "next/image";
import Link from "next/link";
import type { Album } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <Link href={`/projetos/${album.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
        {album.cover_url ? (
          <Image
            src={album.cover_url}
            alt={album.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            Sem foto
          </div>
        )}
      </div>
      <div className="mt-3">
        {album.album_date && (
          <p className="text-xs text-neutral-500">{formatDate(album.album_date)}</p>
        )}
        <h3 className="text-xl font-medium">{album.title}</h3>
      </div>
    </Link>
  );
}
