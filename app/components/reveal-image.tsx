"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/app/lib/gsap";

type RevealImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  quality?: number;
  delay?: number;
  priority?: boolean;
  className?: string;
};

export default function RevealImage({
  src,
  alt,
  width,
  height,
  sizes,
  quality = 90,
  delay = 0,
  priority = false,
  className,
}: RevealImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(src);

  if (src !== loadedSrc) {
    setLoadedSrc(src);
    setReady(false);
    playedRef.current = false;
  }

  useEffect(() => {
    if (ready) return;
    const root = rootRef.current;
    if (!root) return;

    const markIfReady = () => {
      const img = root.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) {
        setReady(true);
        return true;
      }
      return false;
    };

    if (markIfReady()) return;

    const img = root.querySelector("img");
    img?.addEventListener("load", markIfReady);
    img?.addEventListener("error", () => setReady(true));
    const interval = window.setInterval(() => {
      if (markIfReady()) window.clearInterval(interval);
    }, 150);

    return () => {
      img?.removeEventListener("load", markIfReady);
      window.clearInterval(interval);
    };
  }, [src, ready]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || ready) return;
      const bar = root.querySelector(".reveal-bar");
      gsap.set(bar, { scaleX: 0.12, transformOrigin: "left center" });
      gsap.to(bar, {
        scaleX: 1,
        duration: 1.15,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: rootRef, dependencies: [src, ready] },
  );

  useGSAP(
    () => {
      if (!ready || playedRef.current) return;
      playedRef.current = true;

      const root = rootRef.current;
      if (!root) return;
      const img = root.querySelector("img");
      const loader = root.querySelector(".reveal-loader");

      if (prefersReducedMotion()) {
        gsap.set(img, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(loader, { autoAlpha: 0 });
        return;
      }

      gsap
        .timeline()
        .to(loader, { autoAlpha: 0, duration: 0.35, ease: "power2.out" })
        .fromTo(
          img,
          { clipPath: "inset(100% 0% 0% 0%)", scale: 1.04 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            duration: 0.95,
            delay,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(img, { clearProps: "transform,scale" });
            },
          },
          0.04,
        );
    },
    { scope: rootRef, dependencies: [ready, delay] },
  );

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-hidden bg-line"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div className="reveal-loader pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
        <div
          className="reveal-bar h-px w-16 bg-ink"
          style={{ transform: "scaleX(0.12)", transformOrigin: "left center" }}
        />
        <p className="text-[10px] tracking-[0.35em] text-neutral-500">
          CARREGANDO
        </p>
      </div>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        unoptimized
        loading="eager"
        onLoad={() => setReady(true)}
        onError={() => setReady(true)}
        className={["object-cover", className].filter(Boolean).join(" ")}
        style={{ clipPath: "inset(100% 0% 0% 0%)" }}
      />
    </div>
  );
}
