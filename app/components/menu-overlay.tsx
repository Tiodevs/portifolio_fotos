"use client";

import Link from "next/link";

const links = [
  { href: "/", label: "HOME" },
  { href: "/sobre", label: "SOBRE" },
  { href: "/pessoal", label: "PESSOAL" },
];

export default function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className="display text-lg">felipe.</span>
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center bg-ink text-2xl leading-none text-paper"
        >
          &times;
        </button>
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-1 px-6 md:px-10">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="display text-5xl transition-opacity hover:opacity-50 md:text-7xl"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="overflow-hidden px-6 md:px-10">
        <span className="display block text-[22vw] leading-none text-ink/10 select-none">
          Felipe.
        </span>
      </div>

      <div className="px-6 pb-8 md:px-10">
        <p className="text-xs tracking-[0.2em] text-neutral-500">
          &copy;2026 DIREITOS RESERVADOS
        </p>
      </div>
    </div>
  );
}
