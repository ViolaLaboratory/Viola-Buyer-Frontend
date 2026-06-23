import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

/**
 * Mobile nav menu (Pass 2). Mirrors the desktop nav links (which are `hidden md:flex`).
 * Panel + scrim stay mounted and animate via the `open` class, so open AND close are smooth.
 * Solid panel + darkened/blurred scrim so page content never bleeds through.
 */
const LINKS = [
  { label: "Features", id: "features" },
  { label: "Outcomes", id: "outcomes" },
  { label: "FAQ", id: "faq" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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

      {/* tap-away scrim — dark + blurred so content behind is fully obscured */}
      <button
        aria-hidden
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 top-[64px] z-40 cursor-default bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* panel — solid surface, slides + fades in/out */}
      <div
        className={`fixed left-0 right-0 top-[64px] z-50 px-4 transition-all duration-200 ease-out-quint ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0e] p-2 shadow-2xl shadow-black/70">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="block w-full rounded-xl px-4 py-3 text-left text-sm text-white/70 transition-colors duration-150 hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              window.location.href = "mailto:viola@theviola.co";
            }}
            className="block w-full rounded-xl px-4 py-3 text-left text-sm text-white/70 transition-colors duration-150 hover:bg-white/5 hover:text-white"
          >
            Contact
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/waitlist");
            }}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold glass-btn glass-btn-primary"
          >
            Request Access
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
