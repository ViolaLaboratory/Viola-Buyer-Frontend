import { useNavigate } from "react-router-dom";
import { useRef, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Footer — Cluely-style structured footer on an elevated dark surface.
 * The page (near-black #09090b) gradient-fades into a faintly violet-tinted footer,
 * with a subtle brand glow up top. CTA → link columns → status pill / socials / copyright.
 */
const LogoMark = ({ className = "h-7 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 72 55" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z" fill="white"/>
    <path d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421" fill="white"/>
    <path d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582" fill="white"/>
  </svg>
);

const Footer = () => {
  const navigate = useNavigate();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    const button = buttonRefs.current[index];
    if (!button) return;
    const rect = button.getBoundingClientRect();
    button.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    button.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleJoinWaitlist = () => navigate("/waitlist");

  const linkClass = "block text-left text-sm text-white/55 transition-colors duration-200 hover:text-white";

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#09090b] via-[#0c0a12] to-[#0f0b18]">
      {/* subtle brand glow up top — the 'elevated' hint of color the page fades into */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_55%_100%_at_50%_0%,rgba(122,35,204,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* CTA */}
        <section className="py-16 text-center md:py-24">
          <h2 className="mb-4 font-zen text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to <span className="italic">revolutionize</span> your music discovery?
          </h2>
          <p className="mb-8 font-dm text-base text-white/60 md:text-lg">
            Join our waitlist to efficiently streamline the music licensing process.
          </p>
          <Button
            ref={(el) => (buttonRefs.current[3] = el)}
            onMouseMove={(e) => handleMouseMove(e, 3)}
            className="group relative rounded-xl px-8 py-6 text-base glass-btn glass-btn-primary"
            onClick={handleJoinWaitlist}
          >
            <span className="relative z-10">Join the Waitlist</span>
            <ArrowRight className="relative z-10 ml-2 h-4 w-4" />
          </Button>
        </section>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 border-t border-white/8 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="col-span-2 space-y-5 md:col-span-1">
            <LogoMark className="h-7 w-auto" />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber/70 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
              </span>
              Now in early access
            </div>
          </div>

          <nav className="space-y-3">
            <p className="eyebrow">Explore</p>
            <a href="#features" className={linkClass}>Features</a>
            <a href="#outcomes" className={linkClass}>Outcomes</a>
            <a href="#faq" className={linkClass}>FAQ</a>
          </nav>

          <nav className="space-y-3">
            <p className="eyebrow">Get Started</p>
            <button onClick={() => navigate("/waitlist")} className={linkClass}>Request Access</button>
            <button onClick={() => navigate("/demo")} className={linkClass}>Try the Demo</button>
            <a href="mailto:viola@theviola.co" className={linkClass}>Contact</a>
          </nav>
        </div>

        {/* Bottom bar — socials + copyright */}
        <div className="flex flex-col-reverse items-center gap-4 border-t border-white/8 py-6 sm:flex-row sm:justify-between">
          <p className="font-dm text-xs text-white/40">
            &copy; {new Date().getFullYear()} Viola Labs LLC. All rights reserved.
          </p>
          <div className="flex gap-2.5">
            <a
              href="https://www.instagram.com/viola.labs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Viola on Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors duration-200 hover:border-white/25 hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/violalabs/posts/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Viola on LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors duration-200 hover:border-white/25 hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="mailto:viola@theviola.co"
              aria-label="Email Viola"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors duration-200 hover:border-white/25 hover:bg-white/5 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
