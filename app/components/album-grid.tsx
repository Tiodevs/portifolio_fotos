import Image from "next/image";
import type { Photo } from "@/lib/types";

export default function AlbumGrid({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return <p className="text-neutral-500">Este album ainda nao tem fotos.</p>;
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2">
      {photos.map((photo) => (
        <div key={photo.id} className="mb-6 break-inside-avoid">
          <Image
            src={photo.url}
            alt=""
            width={900}
            height={1100}
            sizes="(max-width: 640px) 100vw, 50vw"
            className="h-auto w-full grayscale"
          />
        </div>
      ))}
    </div>
  );
}
