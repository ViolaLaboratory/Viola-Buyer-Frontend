import { useEffect } from "react";

/**
 * Makes EVERY `.glass-btn` track the cursor. On pointer move over a glass button it sets
 * --mouse-x / --mouse-y, which the button's hover spotlight (`.glass-btn::before`) reads —
 * so the light follows the cursor on all glass buttons, no per-button wiring needed.
 */
export default function GlassSpotlight() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest?.(".glass-btn") as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
      btn.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
