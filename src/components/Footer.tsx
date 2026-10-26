import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/**
 * Footer Component
 * Site-wide footer used on Landing, Waitlist and Thank You pages.
 * Features:
 * - Brand blurb + product / company link columns
 * - Social media links (Instagram, LinkedIn, Email)
 * - Oversized faded wordmark and copyright bar
 */

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/viola.labs/",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/violalabs/posts/",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:viola@theviola.co",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const linkClass = "inline-flex items-center gap-1 text-sm text-white/55 transition-colors hover:text-white";

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#070709] font-geist text-white">
    <div className="mx-auto max-w-6xl px-4 pt-16 pb-10">
      <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-5">
          <p className="text-xl font-semibold tracking-tight">viola</p>
          <p className="max-w-xs text-sm leading-relaxed text-white/50">
            The all-in-one platform and marketplace for licensing music. Locate, listen, license.
          </p>
          <div className="flex gap-2">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[#e4ea04] hover:bg-[#e4ea04] hover:text-black"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">Product</p>
          <ul className="space-y-3">
            <li><Link to="/demo/marketplace" className={linkClass}>Marketplace demo</Link></li>
            <li><Link to="/waitlist" className={linkClass}>Join the waitlist</Link></li>
            <li><Link to="/login" className={linkClass}>Log in</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">Company</p>
          <ul className="space-y-3">
            <li><a href="mailto:viola@theviola.co" className={linkClass}>Contact</a></li>
            <li><a href="https://www.linkedin.com/company/violalabs/posts/" target="_blank" rel="noopener noreferrer" className={linkClass}>LinkedIn <ArrowUpRight className="h-3 w-3" /></a></li>
            <li><a href="https://www.instagram.com/viola.labs/" target="_blank" rel="noopener noreferrer" className={linkClass}>Instagram <ArrowUpRight className="h-3 w-3" /></a></li>
          </ul>
        </div>
      </div>

      <div className="mt-16 flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Viola Labs LLC. All rights reserved.</p>
        <p>Made for tastemakers.</p>
      </div>
    </div>

    {/* Oversized wordmark */}
    <div aria-hidden="true" className="pointer-events-none select-none -mb-[0.22em] text-center text-[28vw] font-semibold leading-none tracking-[-0.06em] bg-gradient-to-b from-white/[0.07] to-transparent bg-clip-text text-transparent">
      viola
    </div>
  </footer>
);

export default Footer;
