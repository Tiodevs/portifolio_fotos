"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import MenuOverlay from "@/app/components/menu-overlay";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-paper/90 px-6 py-5 backdrop-blur md:px-10">
        <Link href="/" className="display text-lg">
          felipe.
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
          className="display text-lg transition-opacity hover:opacity-60"
        >
          MENU
        </button>
      </header>
      <MenuOverlay open={open} onClose={close} />
    </>
  );
}
