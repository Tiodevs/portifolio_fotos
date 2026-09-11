"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/app/lib/gsap";

const links = [
  { href: "/", label: "HOME" },
  { href: "/sobre", label: "SOBRE" },
  { href: "/pessoal", label: "PESSOAL" },
  { href: "/contato", label: "CONTATO" },
];

export default function MenuOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const bar = root.querySelector(".menu-bar");
      const items = root.querySelectorAll(".menu-link");
      const mark = root.querySelector(".menu-mark");
      const copy = root.querySelector(".menu-copy");

      gsap.set(root, {
        autoAlpha: 0,
        pointerEvents: "none",
        clipPath: "inset(0% 0% 100% 0%)",
      });
      gsap.set([bar, items, mark, copy], { autoAlpha: 0, y: 0 });

      const tl = gsap.timeline({ paused: true });
      tl.set(root, { autoAlpha: 1, pointerEvents: "auto" })
        .fromTo(
          root,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.72,
            ease: "power4.inOut",
          },
        )
        .fromTo(
          bar,
          { y: -18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out" },
          0.22,
        )
        .fromTo(
          items,
          { y: 64, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.09,
            ease: "power3.out",
          },
          0.32,
        )
        .fromTo(
          mark,
          { y: 48, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.85, ease: "power3.out" },
          0.4,
        )
        .fromTo(
          copy,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4 },
          0.55,
        );

      tlRef.current = tl;
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const closeBtn = root.querySelector<HTMLButtonElement>(".menu-close");
      const menuBtn = document.querySelector<HTMLButtonElement>(
        '[aria-label="Abrir menu"]',
      );

      if (prefersReducedMotion()) {
        gsap.set(root, {
          autoAlpha: open ? 1 : 0,
          clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
          pointerEvents: open ? "auto" : "none",
        });
        gsap.set(
          root.querySelectorAll(".menu-bar, .menu-link, .menu-mark, .menu-copy"),
          { autoAlpha: open ? 1 : 0, y: 0 },
        );
        if (open) closeBtn?.focus();
        else if (tlRef.current && tlRef.current.progress() > 0) menuBtn?.focus();
        return;
      }

      const tl = tlRef.current;
      if (!tl) return;

      if (open) {
        tl.eventCallback("onComplete", () => closeBtn?.focus());
        tl.play();
        return;
      }

      if (tl.progress() === 0) return;

      tl.eventCallback("onReverseComplete", () => {
        gsap.set(root, { pointerEvents: "none" });
        menuBtn?.focus();
      });
      tl.reverse();
    },
    { dependencies: [open], revertOnUpdate: false, scope: rootRef },
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      id="site-menu"
      role="dialog"
      aria-modal={open || undefined}
      aria-hidden={!open}
      aria-label="Menu"
      inert={!open}
      className="pointer-events-none fixed inset-0 z-50 flex flex-col overflow-y-auto bg-paper"
      style={{ visibility: "hidden" }}
    >
      <div className="menu-bar flex items-center justify-between px-6 py-5 md:px-10">
        <span className="display text-lg">felipe.</span>
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="menu-close flex h-10 w-10 items-center justify-center bg-ink text-2xl leading-none text-paper"
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
            className="menu-link display text-4xl transition-opacity hover:opacity-50 sm:text-5xl md:text-7xl"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="menu-mark overflow-hidden px-6 md:px-10">
        <span className="display block text-[22vw] leading-none text-ink/10 select-none">
          Felipe.
        </span>
      </div>

      <div className="menu-copy px-6 pb-8 md:px-10">
        <p className="text-xs tracking-[0.2em] text-neutral-500">
          &copy;2026 DIREITOS RESERVADOS
        </p>
      </div>
    </div>
  );
}
