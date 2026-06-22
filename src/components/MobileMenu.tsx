import { useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Mobile nav menu (Pass 2). Mirrors the desktop nav links (which are `hidden md:flex`).
 * Hamburger toggles a glass panel; links smooth-scroll to the existing section ids and close.
 * Hidden at md+ where the inline links take over.
 */
const LINKS = [
  { label: "Features", id: "features" },
  { label: "Outcomes", id: "outcomes" },
  { label: "FAQ", id: "faq" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="glass-btn glass-btn-secondary h-10 w-10 rounded-lg"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* tap-away scrim */}
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[64px] z-40 cursor-default bg-black/40"
          />
          <div className="fixed left-0 right-0 top-[64px] z-50 px-5">
            <div className="rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl p-2 shadow-xl shadow-black/50">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm text-white/70 transition-colors duration-150 ease-out-quint hover:bg-white/5 hover:text-white"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  window.location.href = "mailto:viola@theviola.co";
                }}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-white/70 transition-colors duration-150 ease-out-quint hover:bg-white/5 hover:text-white"
              >
                Contact
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
