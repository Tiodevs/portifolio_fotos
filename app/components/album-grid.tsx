import type { Photo } from "@/lib/types";
import RevealImage from "@/app/components/reveal-image";

export default function AlbumGrid({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return <p className="text-neutral-500">Este album ainda nao tem fotos.</p>;
  }

  return (
    <div className="columns-1 gap-6 sm:columns-2">
      {photos.map((photo, index) => (
        <div key={photo.id} className="mb-6 break-inside-avoid">
          <RevealImage
            src={photo.url}
            alt=""
            width={photo.width ?? 1200}
            height={photo.height ?? 1500}
            quality={90}
            sizes="(max-width: 640px) 100vw, 600px"
            delay={Math.min(index * 0.06, 0.3)}
            priority={index < 4}
          />
        </div>
      ))}
    </div>
  );
}
