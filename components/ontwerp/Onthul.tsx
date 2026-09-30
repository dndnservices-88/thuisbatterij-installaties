"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Laat een blok rustig omhoog infaden zodra het in beeld komt. Eén keer, niet
 * elke keer opnieuw: wie terugscrolt, wil lezen en niet weer een animatie zien.
 *
 * De verborgen begintoestand staat in ontwerp.css en geldt alleen als de klasse
 * js-onthul op <html> staat. Faalt het script, dan blijft alles gewoon zichtbaar.
 */
export function Onthul({
  children,
  vertraging = 0,
  className = "",
}: {
  children: ReactNode;
  vertraging?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setZichtbaar(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setZichtbaar(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`onthul ${zichtbaar ? "zichtbaar" : ""} ${className}`}
      style={{ "--vertraging": `${vertraging}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Dunne voortgangslijn bovenaan het scherm: hoe ver je door de pagina bent.
 * Werkt zonder React-state per scrollstap — de breedte wordt direct op het
 * element gezet, anders rendert de hele component zestig keer per seconde.
 */
export function Leesvoortgang() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const werkBij = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const opScroll = () => {
      if (!frame) frame = requestAnimationFrame(werkBij);
    };
    werkBij();
    window.addEventListener("scroll", opScroll, { passive: true });
    window.addEventListener("resize", opScroll);
    return () => {
      window.removeEventListener("scroll", opScroll);
      window.removeEventListener("resize", opScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
      <div ref={ref} className="h-full origin-left bg-paars" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
