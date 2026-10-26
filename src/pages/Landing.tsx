import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, FormEvent, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ArrowUpRight, X, Check, CloudUpload, Drill, BrainCircuit, Search,
  Headphones, FileCheck2, Quote, Sparkles,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import LandingFooter from "@/components/LandingFooter";

// ─── Assets ──────────────────────────────────────────────────────────────────
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;
const searchVideo    = asset("violaSearch.mp4");
const pitchVideo     = asset("violaPitchBuilder.mp4");
const catalogueVideo = asset("violaCatalogue.mp4");
const fallbackPoster = asset("viola.jpg");

const CONTACT_MAILTO = "mailto:viola@theviola.co?subject=Talk%20with%20Viola&body=Hi%20Viola%20team%2C%0A%0AI%27d%20love%20to%20connect.";

// ─── Typing phrases ───────────────────────────────────────────────────────────
const typingPhrases = [
  "spooky choirs...",
  "dark synths...",
  "a spicy melody...",
  "cinematic builds...",
];

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark = ({ className = "h-7 w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 72 55" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z" fill="currentColor"/>
    <path d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421" fill="currentColor"/>
    <path d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582" fill="currentColor"/>
  </svg>
);

// ─── useInView ────────────────────────────────────────────────────────────────
function useInView<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

// Fades children up once they scroll into view
const Reveal = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
    <span className="h-1 w-1 rounded-full bg-[#e4ea04]" />
    {children}
  </p>
);

const SectionHeader = ({ eyebrow, title, sub, align = "center" }: { eyebrow: string; title: ReactNode; sub?: ReactNode; align?: "center" | "left" }) => (
  <div className={`space-y-4 ${align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-xl"}`}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] leading-[1.05] text-white">
      {title}
    </h2>
    {sub && <p className="text-base md:text-lg text-white/55 leading-relaxed">{sub}</p>}
  </div>
);

// App-window chrome around product videos
const BrowserFrame = ({ children, url = "theviola.co" }: { children: ReactNode; url?: string }) => (
  <div className="rounded-2xl p-px bg-gradient-to-b from-white/20 via-white/[0.06] to-white/[0.02] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
    <div className="overflow-hidden rounded-[15px] bg-[#0b0b0e]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.05] px-3 py-1 text-[11px] text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e4ea04]/80" />
          {url}
        </div>
        <span className="w-[46px]" />
      </div>
      {children}
    </div>
  </div>
);

// ─── Feature tabs ─────────────────────────────────────────────────────────────
const featureTabs = [
  {
    id: "search",
    label: "AI Search",
    icon: BrainCircuit,
    url: "theviola.co/search",
    headline: "Find the perfect track in seconds",
    body: "Type your brief in natural language, from mood, tempo, genre, and storyline. Viola understands the creative context and provides the best fitting songs.",
    points: ["Natural-language briefs", "Mood, tempo, and metadata", "Instant previews"],
    video: searchVideo,
  },
  {
    id: "pitch",
    label: "Marketplace",
    icon: Drill,
    url: "theviola.co/marketplace",
    headline: "Access the songs you want to license with ease",
    body: "Browse through a marketplace of record label and publisher partnered catalogs.",
    points: ["Commercially recorded catalog", "Ready for sync licensing", "Browse available metadata for each song"],
    video: pitchVideo,
  },
  {
    id: "catalog",
    label: "One Workspace",
    icon: CloudUpload,
    url: "theviola.co/catalog",
    headline: "Everything in one workspace",
    body: "Complete the licensing process all in one place.",
    points: ["Find the song you want", "Select licensing terms", "Sign agreements", "Pay in one place"],
    video: catalogueVideo,
  },
];

const steps = [
  { icon: Search,     title: "Locate",  body: "Describe the brief the way you'd write it." },
  { icon: Headphones, title: "Listen",  body: "Shortlist sync-ready tracks from partnered catalogs." },
  { icon: FileCheck2, title: "License", body: "Pick terms, sign, and pay — in one place." },
];

const problems = [
  "Can take months to license a song for your project",
  "Unorganized and inefficient communication for every music license negotiated",
  "Many unattended sync deals result in money left on the table",
];

const withoutViola = [
  {
    group: "For music licensees",
    items: [
      "Delays in submitting a brief and receiving songs",
      "Inefficient back-and-forth negotiation wastes valuable time and energy",
      "Cannot fully own music taste",
    ],
  },
  {
    group: "For record labels & publishers",
    items: [
      "Inefficient manual music licensing processes mean missed sync orders and lost revenue at scale",
      "Manual music searching and pitch packaging per brief is time consuming",
      "Tight deadlines of up to 48 hours turnaround time for certain briefs",
    ],
  },
];

const withViola = [
  {
    group: "For music licensees",
    items: [
      { main: "Complete briefs efficiently", sub: "Search, shortlist, clear songs, and checkout" },
      { main: "1 workspace for everything", sub: "Music licensing done in one platform" },
    ],
  },
  {
    group: "For record labels & publishers",
    items: [
      { main: "Goodbye to cluttered inboxes", sub: "No back-and-forth negotiation — clear songs faster" },
      { main: "Track sync orders, revenue, and analytics in one dashboard" },
      { main: "Fulfill sync orders that were once missed" },
      { main: "Maximize catalog revenue and focus efforts more wisely" },
    ],
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "A reliable AI metadata tagging system would be a game changer for sync. Imagine searching every placement worldwide in seconds. That's the future.",
    name: "Michael Chen",
    role: "Coordinator, Creative Marketing — Film & TV",
    company: "Sony Music Publishing",
  },
  {
    quote: "Viola is the kind of tool the industry has needed for years. Getting the right song in front of the right project — fast — is everything, and this makes it effortless.",
    name: "Alex Magnus Karlsson",
    role: "52x Billboard No. 1 Producer",
    company: "",
  },
];

const roles = ["Music Supervisor", "Sync Licensing Manager", "Sync Agency Owner", "Record Label Team", "Publishing Company Team"];
const painPoints = ["Digging through clunky library interfaces", "Unfulfilled and missed sync orders", "Losing months to the licensing negotiation process"];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqItems = [
  { q: "Are you replacing sync agents, sync managers, and music supervisors?", a: "No. Viola is a workflow tool and marketplace that accelerates the music licensing process, taking the load of intermediary steps off your shoulders." },
  { q: "Who is Viola intended for?", a: "Viola is intended for users who need to locate and license commercially recorded music that best fits their creative projects in a streamlined and efficient manner." },
  { q: "Do we have to move our whole catalog into Viola?", a: "We partner with record labels and publishing companies to help with the catalog integration process." },
  { q: "How technical is it to get started?", a: "If you can type a brief, you can use Viola. We handle the setup and give you a live onboarding session." },
  { q: "What does early access include?", a: "Hands-on onboarding, direct feedback channel with our team, and preferred pricing when we launch public plans." },
];

const initials = (name: string) => name.split(" ").map(p => p[0]).slice(0, 2).join("");

// ─── Landing ──────────────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();

  const [scrolled, setScrolled]               = useState(false);
  const [activeTab, setActiveTab]             = useState(0);
  const [videoErrors, setVideoErrors]         = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery]         = useState("");
  const [placeholderText, setPlaceholderText] = useState("Find ");
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll-aware nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Scroll-spy: highlight active feature tab as each feature scrolls into view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    featureRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveTab(i); },
        { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
      );
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  // Typing animation
  useEffect(() => {
    let pi = 0, ci = 0, del = false;
    const id = setInterval(() => {
      const phrase = typingPhrases[pi];
      setPlaceholderText(`Find me ${phrase.slice(0, ci)}`);
      if (!del) { ci++; if (ci > phrase.length) del = true; }
      else { ci--; if (ci === 0) { del = false; pi = (pi + 1) % typingPhrases.length; } }
    }, 120);
    return () => clearInterval(id);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchQuery("");
    navigate("/waitlist");
  };

  const renderVideo = (key: string, src: string, alt: string, className = "") =>
    videoErrors[key] ? (
      <img src={fallbackPoster} alt={alt} className="w-full h-full object-cover brightness-75" />
    ) : (
      <video autoPlay muted loop playsInline preload="metadata" poster={fallbackPoster} crossOrigin="anonymous"
        onError={() => setVideoErrors(v => ({ ...v, [key]: true }))}
        className={`w-full h-full object-cover ${className}`}
      >
        <source src={src} type="video/mp4" />
      </video>
    );

  const primaryBtn = "group inline-flex items-center justify-center gap-2 rounded-full bg-[#e4ea04] text-black font-semibold transition-all duration-200 hover:bg-[#eef25a] hover:shadow-[0_0_32px_rgba(228,234,4,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e4ea04]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  const secondaryBtn = "inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] text-white/80 font-medium transition-all duration-200 hover:bg-white/[0.08] hover:text-white hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

  return (
    <div className="relative min-h-screen bg-[#070709] text-white font-geist antialiased overflow-x-clip selection:bg-[#e4ea04] selection:text-black">

      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.8s cubic-bezier(.2,.7,.2,1) forwards; }
        @keyframes shine { to { background-position: 200% center; } }
        .text-shine {
          background: linear-gradient(110deg, #e4ea04 20%, #fbfdc2 40%, #e4ea04 60%);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: shine 6s linear infinite;
        }
        .bg-grid {
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; opacity: 1; }
          .text-shine { animation: none; }
        }
      `}</style>

      {/* ── Floating Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
        <nav className={`mx-auto flex max-w-5xl items-center justify-between rounded-full border px-3 py-2 pl-5 transition-all duration-300 ${scrolled ? "border-white/10 bg-[#0c0c0f]/75 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]" : "border-transparent bg-transparent"}`}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5" aria-label="Viola home">
            <LogoMark className="h-5 w-auto text-white" />
            <span className="text-[17px] font-semibold tracking-tight">viola</span>
          </button>
          <div className="hidden md:flex items-center gap-1 text-sm text-white/55">
            {[["Features", "features"], ["Outcomes", "outcomes"], ["FAQ", "faq"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-white/[0.06]">{label}</button>
            ))}
            <button onClick={() => navigate("/demo/marketplace")} className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-white/[0.06]">Demo</button>
          </div>
          <div className="flex items-center gap-1.5">
            <a href="mailto:viola@theviola.co" className="hidden sm:inline-flex rounded-full px-3.5 py-1.5 text-sm text-white/55 transition-colors hover:text-white">Contact</a>
            <button onClick={() => navigate("/waitlist")} className={`${primaryBtn} px-4 py-2 text-sm`}>
              Request access
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative px-4 pt-36 sm:pt-44">
        {/* backdrop: grid + light beam */}
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[620px] w-[1100px] max-w-[200vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(108,36,232,0.38),transparent)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[340px] w-[560px] max-w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(228,234,4,0.14),transparent)]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <button
            onClick={() => navigate("/demo/marketplace")}
            className="group mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 pr-3.5 text-sm text-white/70 backdrop-blur transition-colors hover:border-white/20 hover:text-white opacity-0 fade-up"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e4ea04] px-2.5 py-0.5 text-xs font-semibold text-black">
              <Sparkles className="h-3 w-3" /> Early access
            </span>
            Try the marketplace for free
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>

          <h1 className="text-balance text-[44px] leading-[1.02] sm:text-7xl lg:text-[88px] font-semibold tracking-[-0.045em] opacity-0 fade-up [animation-delay:120ms]">
            <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">License music</span>
            <br />
            <span className="font-serif italic font-normal tracking-[-0.02em] text-shine pr-2">effortlessly.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/60 opacity-0 fade-up [animation-delay:240ms]">
            Viola is the marketplace that streamlines the inefficient roadblocks of the entire music licensing process for everyone's creative projects.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 fade-up [animation-delay:360ms]">
            <button onClick={() => navigate("/waitlist")} className={`${primaryBtn} w-full sm:w-auto px-7 py-3.5 text-[15px]`}>
              Join the waitlist
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => navigate("/demo/marketplace")} className={`${secondaryBtn} w-full sm:w-auto px-7 py-3.5 text-[15px]`}>
              Explore the demo
            </button>
          </div>
        </div>

        {/* Product shot */}
        <div className="relative z-10 mx-auto mt-16 sm:mt-20 max-w-6xl opacity-0 fade-up [animation-delay:500ms]">
          <div className="pointer-events-none absolute -inset-x-10 top-10 bottom-0 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(108,36,232,0.35),transparent_65%)] blur-2xl" />
          <div className="relative">
            <BrowserFrame url="theviola.co/search">
              <div className="relative aspect-video">
                {renderVideo("hero", searchVideo, "Viola AI search")}
              </div>
            </BrowserFrame>
          </div>
          <div className="pointer-events-none absolute inset-x-0 -bottom-px h-40 bg-gradient-to-t from-[#070709] to-transparent" />
        </div>

        {/* Audience strip */}
        <div className="relative z-10 mx-auto max-w-5xl pb-6 pt-4 text-center">
          <p className="mb-4 text-xs text-white/35">Built for the people behind the soundtrack</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:text-base font-medium text-white/50">
            {["Sync Teams", "Music Supervisors", "Record Labels", "Music Publishers"].map(a => (
              <span key={a} className="tracking-tight">{a}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="px-4 py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20 items-start">
          <Reveal className="lg:sticky lg:top-32">
            <SectionHeader
              align="left"
              eyebrow="The problem"
              title={<>The work is creative.<br /><span className="text-white/40">The workflow still isn't.</span></>}
              sub="Viola gives you the tools to streamline the busy work."
            />
          </Reveal>
          <div className="space-y-3">
            {problems.map((item, i) => (
              <Reveal key={item} delay={i * 80}>
                <div className="group flex items-start gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.04]">
                  <span className="font-mono text-xs text-white/30 pt-1">0{i + 1}</span>
                  <div className="flex-1 text-base sm:text-lg leading-snug text-white/85">{item}</div>
                  <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#ee481f]/10 text-[#ee481f]">
                    <X className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative px-4 py-24 sm:py-32 border-t border-white/[0.06] scroll-mt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeader
              eyebrow="Product"
              title={<>Everything you need to go from <span className="font-serif italic font-normal">brief</span> to <span className="font-serif italic font-normal text-[#e4ea04]">licensed.</span></>}
            />
          </Reveal>

          {/* Sticky jump-tabs */}
          <div className="sticky top-[76px] z-30 mt-12 mb-14 flex justify-center">
            <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0c0c0f]/80 p-1 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              {featureTabs.map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => featureRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === i ? "bg-white text-black" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {featureTabs.map((tab, i) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id} ref={(el) => (featureRefs.current[i] = el)} className="scroll-mt-40">
                  <Reveal>
                    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01]">
                      <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(108,36,232,0.18),transparent)]" />
                      <div className="relative grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:p-14">
                        <div className={`space-y-6 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                            <Icon className="h-3.5 w-3.5 text-[#e4ea04]" />
                            0{i + 1} · {tab.label}
                          </div>
                          <h3 className="text-balance text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]">{tab.headline}</h3>
                          <p className="text-base leading-relaxed text-white/55">{tab.body}</p>
                          <ul className="space-y-2.5">
                            {tab.points.map(p => (
                              <li key={p} className="flex items-center gap-3 text-sm text-white/75">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e4ea04]/12 text-[#e4ea04]"><Check className="h-3 w-3" /></span>
                                {p}
                              </li>
                            ))}
                          </ul>
                          <button onClick={() => navigate("/waitlist")} className="group inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#e4ea04] transition-colors">
                            Get early access <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </button>
                        </div>
                        <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                          <BrowserFrame url={tab.url}>
                            <div className="relative aspect-video overflow-hidden">
                              {renderVideo(tab.id, tab.video, tab.label, "lg:-translate-y-4 md:-translate-y-3")}
                            </div>
                          </BrowserFrame>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Statement + 3 steps ── */}
      <section className="relative px-4 py-24 sm:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <Reveal>
            <Eyebrow>Locate · Listen · License</Eyebrow>
            <h2 className="mt-6 text-balance text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.04em] leading-[1.05]">
              From negotiation that feels endless to <span className="font-serif italic font-normal text-shine pr-1">licensed in minutes.</span>
            </h2>
          </Reveal>
          <div className="relative mt-16 grid gap-4 sm:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent sm:block" />
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 100}>
                  <div className="relative flex flex-col items-center gap-4 px-4">
                    <span className="relative inline-flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-white/10 bg-[#0e0e12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                      <Icon className="h-6 w-6 text-[#e4ea04]" />
                    </span>
                    <div>
                      <p className="text-lg font-semibold tracking-tight">{s.title}</p>
                      <p className="mt-1 text-sm text-white/50">{s.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Outcomes ── */}
      <section id="outcomes" className="px-4 py-24 sm:py-32 border-t border-white/[0.06] scroll-mt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeader
              eyebrow="Outcomes"
              title="What changes when you use Viola"
              sub={<>More of your day goes to <span className="font-serif italic text-white text-xl">music taste</span>, not paperwork and negotiation.</>}
            />
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-white/[0.08] bg-white/[0.015] p-7 sm:p-9">
                <div className="mb-8 flex items-center gap-2.5 text-sm font-medium text-white/50">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06]"><X className="h-3.5 w-3.5" /></span>
                  Without Viola
                </div>
                <div className="space-y-8">
                  {withoutViola.map(section => (
                    <div key={section.group} className="space-y-3.5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">{section.group}</p>
                      <ul className="space-y-3">
                        {section.items.map(item => (
                          <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-white/50">
                            <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#ee481f]/70" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative h-full rounded-3xl p-px bg-gradient-to-b from-[#e4ea04]/70 via-[#e4ea04]/20 to-white/[0.06]">
                <div className="relative h-full overflow-hidden rounded-[23px] bg-[#0d0d0a] p-7 sm:p-9">
                  <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(228,234,4,0.16),transparent)]" />
                  <div className="relative mb-8 flex items-center gap-2.5 text-sm font-semibold text-[#e4ea04]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e4ea04] text-black"><Check className="h-3.5 w-3.5" /></span>
                    With Viola
                  </div>
                  <div className="relative space-y-8">
                    {withViola.map(section => (
                      <div key={section.group} className="space-y-3.5">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#e4ea04]/60">{section.group}</p>
                        <ul className="space-y-3">
                          {section.items.map(item => (
                            <li key={item.main} className="flex items-start gap-3 text-[15px] leading-snug">
                              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e4ea04]" />
                              <span className="flex flex-col gap-0.5">
                                <span className="font-medium text-white">{item.main}</span>
                                {item.sub && <span className="text-white/50 text-sm">{item.sub}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-4 py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeader eyebrow="What people say" title="Loved by the industry's ears" />
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120} className="h-full">
                <figure className="flex h-full flex-col justify-between gap-10 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 sm:p-10">
                  <div className="space-y-6">
                    <Quote className="h-7 w-7 text-[#e4ea04]" />
                    <blockquote className="text-xl sm:text-2xl leading-snug tracking-[-0.015em] text-white/90">
                      {t.quote}
                    </blockquote>
                  </div>
                  <figcaption className="flex items-center gap-4">
                    <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6c24e8] to-[#ee481f] text-sm font-semibold">
                      {initials(t.name)}
                    </span>
                    <div className="text-sm">
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-white/45">{t.role}{t.company ? ` · ${t.company}` : ""}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-4 py-24 sm:py-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeader eyebrow="Who it's for" title={<>Built for people who have <span className="font-serif italic font-normal">musical taste.</span></>} />
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10">
                <p className="text-sm font-medium text-white/50">Perfect if you are a</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {roles.map(r => (
                    <span key={r} className="rounded-full border border-[#e4ea04]/25 bg-[#e4ea04]/[0.06] px-4 py-2 text-sm text-white/90">{r}</span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10">
                <p className="text-sm font-medium text-white/50">And you're tired of</p>
                <ul className="mt-6 space-y-4">
                  {painPoints.map(r => (
                    <li key={r} className="flex items-center gap-3 text-[15px] text-white/80">
                      <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#ee481f]/10 text-[#ee481f]"><X className="h-3.5 w-3.5" /></span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Demo CTA ── */}
      <section className="px-4 py-16 sm:py-24">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0b0e] px-6 py-20 sm:px-12 sm:py-24 text-center">
            <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,black,transparent)]" />
            <div className="pointer-events-none absolute left-1/2 bottom-[-220px] h-[440px] w-[900px] max-w-[180vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(108,36,232,0.45),transparent)]" />
            <div className="pointer-events-none absolute left-1/2 bottom-[-120px] h-[240px] w-[480px] max-w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(228,234,4,0.18),transparent)]" />

            <div className="relative mx-auto max-w-2xl space-y-6">
              <Eyebrow>Try our demo</Eyebrow>
              <h2 className="text-balance text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[1.02]">
                See Viola <span className="font-serif italic font-normal">in action.</span>
              </h2>
              <p className="mx-auto max-w-md text-white/55">Type a brief the way you actually write it and watch Viola go to work.</p>

              <form onSubmit={handleSearch} className="mx-auto w-full max-w-xl pt-2">
                <div className="relative rounded-full p-px bg-gradient-to-r from-white/30 via-[#e4ea04]/50 to-white/30 shadow-[0_0_50px_rgba(228,234,4,0.15)]">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholderText}
                    aria-label="Describe your music brief"
                    className="h-14 rounded-full border-0 bg-[#0e0e12] pl-14 pr-32 text-base text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button type="submit" className={`${primaryBtn} absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 text-sm`}>
                    Search <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button onClick={() => navigate("/waitlist")} className={`${primaryBtn} w-full sm:w-auto px-7 py-3.5 text-[15px]`}>
                  Join the waitlist <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <a href={CONTACT_MAILTO} className={`${secondaryBtn} w-full sm:w-auto px-7 py-3.5 text-[15px]`}>
                  Talk to our team
                </a>
              </div>
              <p className="text-xs text-white/35">No credit card required · Hands-on onboarding included</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="px-4 py-24 sm:py-32 scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <SectionHeader
              align="left"
              eyebrow="FAQ"
              title="Asked & answered"
              sub={<>Questions we've already heard tastemakers ask. Something else? <a href={CONTACT_MAILTO} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-[#e4ea04]">Email us</a>.</>}
            />
          </Reveal>
          <Reveal delay={100}>
            <Accordion type="single" collapsible className="border-t border-white/[0.08]">
              {faqItems.map((item, idx) => (
                <AccordionItem key={item.q} value={`item-${idx}`} className="border-b border-white/[0.08]">
                  <AccordionTrigger className="py-6 text-left text-base sm:text-lg font-medium text-white/90 hover:text-white hover:no-underline [&>svg]:text-white/40">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pr-8 text-[15px] leading-relaxed text-white/55">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Landing;
