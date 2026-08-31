import { useEffect, useRef } from "react";

/**
 * Parallax scroll driver for a single section.
 *
 * Attaches a passive, rAF-throttled scroll listener that writes a CSS custom
 * property `--parallax-y` (px, 0 -> maxShift as the section scrolls out) on
 * the container element. Child layers read it via calc() in CSS.
 *
 * Disabled when the user prefers reduced motion, or on small viewports where
 * the hero scroll distance is too short for the effect to feel right.
 */
export function useParallax<T extends HTMLElement>(options?: { maxShift?: number }) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 767px)");
    const maxShift = options?.maxShift ?? 56; // px — cinematic, not gimmicky
    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      // 0 when hero top is at viewport top, 1 once it has scrolled fully past
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
      const y = progress * maxShift;
      el.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
      el.style.setProperty("--parallax-progress", progress.toFixed(4));
      void viewportH;
      void smallScreen;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    const update = () => {
      if (reduceMotion.matches || smallScreen.matches) {
        el.style.setProperty("--parallax-y", "0px");
        el.style.setProperty("--parallax-progress", "0");
        window.removeEventListener("scroll", onScroll);
      } else {
        window.addEventListener("scroll", onScroll, { passive: true });
        apply();
      }
    };

    update();
    reduceMotion.addEventListener("change", update);
    smallScreen.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      reduceMotion.removeEventListener("change", update);
      smallScreen.removeEventListener("change", update);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
