import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback, MouseEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Bug, X, CloudUpload, Drill, BrainCircuit, CheckCircle2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";
import HeroShader from "@/components/HeroShader";
import MobileMenu from "@/components/MobileMenu";

// ─── Assets ──────────────────────────────────────────────────────────────────
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;
const searchVideo    = asset("violaSearch.mp4");
const pitchVideo     = asset("violaPitchBuilder.mp4");
const catalogueVideo = asset("violaCatalogue.mp4");
const fallbackPoster = asset("viola.jpg");

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
    <path d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z" fill="white"/>
    <path d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421" fill="white"/>
    <path d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582" fill="white"/>
  </svg>
);

// ─── useInView ────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Feature tabs (Warp-style "Why Viola" switcher) ───────────────────────────
const featureTabs = [
  {
    id: "search",
    label: "AI Search",
    icon: <BrainCircuit className="w-4 h-4" />,
    headline: "Find the perfect track in seconds",
    body: "Type your brief in natural language, from mood, tempo, genre, and storyline. Viola understands the creative context and provides the best fitting songs.",
    video: searchVideo,
  },
  {
    id: "pitch",
    label: "Marketplace",
    icon: <Drill className="w-4 h-4" />,
    headline: "Access the songs you want to license with ease",
    body: "Browse a marketplace of commercially recorded songs that are all pre-approved and ready for sync.",
    video: pitchVideo,
  },
  {
    id: "catalog",
    label: "One Workspace",
    icon: <CloudUpload className="w-4 h-4" />,
    headline: "Everything in one workspace",
    body: "Find the song you want, select all the licensing terms to clear that song, sign the licensing agreement all in one place, and pay all in one place.",
    video: catalogueVideo,
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

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqItems = [
  { q: "Are you replacing sync agents, sync managers, and music supervisors?", a: "No. Viola is a workflow tool and marketplace that accelerates the music licensing process, taking the load of intermediary steps off your shoulders." },
  { q: "Who is Viola intended for?", a: "Viola is intended for users who need to locate and license commercially recorded music that best fits their creative projects in a streamlined and efficient manner." },
  { q: "Do we have to move our whole catalog into Viola?", a: "We partner with record labels and publishing companies to help with the catalog integration process." },
  { q: "How technical is it to get started?", a: "If you can type a brief, you can use Viola. We handle the setup and give you a live onboarding session." },
  { q: "What does early access include?", a: "Hands-on onboarding, direct feedback channel with our team, and preferred pricing when we launch public plans." },
];

// ─── Landing ──────────────────────────────────────────────────────────────────
const Landing = () => {
  const navigate = useNavigate();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [scrolled, setScrolled]               = useState(false);
  const [activeTab, setActiveTab]             = useState(0);
  const [tabsStuck, setTabsStuck]             = useState(false);
  const tabsSentinelRef = useRef<HTMLDivElement>(null);
  const [videoErrors, setVideoErrors]         = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery]         = useState("");
  const [hasSearched, setHasSearched]         = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Find ");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [withViolaVisible, setWithViolaVisible] = useState(false);
  const withViolaRef = useRef<HTMLDivElement>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const goToTestimonial = (i: number) =>
    setTestimonialIndex(((i % testimonials.length) + testimonials.length) % testimonials.length);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) goToTestimonial(testimonialIndex + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  };
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  const whySection          = useInView(0.1);
  const outcomesSection     = useInView(0.1);
  const testimonialsSection = useInView(0.1);
  const whoSection          = useInView(0.1);

  // Scroll-aware nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Stuck-state for the feature jump-tabs: when the sentinel scrolls above the
  // sticky offset, the tabs pin as a full-bleed glass nav bar.
  useEffect(() => {
    const el = tabsSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setTabsStuck(!e.isIntersecting),
      { rootMargin: "-65px 0px 0px 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Flicker animation for "With Viola" card
  useEffect(() => {
    const el = withViolaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setWithViolaVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
    }, del ? 320 : 150);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLButtonElement>, i: number) => {
    const btn = buttonRefs.current[i];
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
    btn.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
  }, []);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    setSearchQuery("");
    navigate("/waitlist");
  };

  return (
    <div className="relative min-h-screen text-white font-inter overflow-x-hidden">

      {/* ── Background — one consistent near-black; all color lives in the hero shader ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[#09090b]" />

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .animate-marquee { animation: marquee 32s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @keyframes flicker-on {
          0%   { opacity: 0; filter: brightness(0.8); }
          20%  { opacity: 0.4; filter: brightness(1.1); }
          60%  { opacity: 0.9; filter: brightness(1.05); }
          100% { opacity: 1; filter: brightness(1); }
        }
        .flicker-on { animation: flicker-on 900ms ease-out forwards; }
        @keyframes border-glow {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        .glow-border {
          background: linear-gradient(120deg,rgba(249,249,249,0.18),rgba(255,255,255,0.43),rgba(202,145,255,0.27),rgba(255,210,233,0.4));
          background-size: 300% 300%;
          animation: border-glow 6s linear infinite;
          padding: 1px;
          border-radius: 999px;
          box-shadow: 0 0 40px rgba(255,255,255,0.3);
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.7s ease-out forwards; }
      `}</style>

      {/* ── Sticky Nav ── */}
      <header>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0e0e10]/90 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/40" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <LogoMark className="h-7 w-auto" />
            <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors duration-200">Features</button>
              <button onClick={() => document.getElementById("outcomes")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors duration-200">Outcomes</button>
              <button onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white transition-colors duration-200">FAQ</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden sm:flex text-white/60 hover:text-white hover:bg-white/8 text-sm px-4 py-2 h-auto rounded-lg"
              onClick={() => window.location.href = "mailto:viola@theviola.co"}
            >
              Contact
            </Button>
            <Button
              ref={(el) => (buttonRefs.current[0] = el)}
              onMouseMove={(e) => handleMouseMove(e, 0)}
              onClick={() => navigate("/waitlist")}
              className="group relative hidden md:inline-flex text-sm px-5 py-2 h-auto rounded-lg font-semibold overflow-hidden glass-btn glass-btn-primary"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Request Access
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Button>
            <MobileMenu />
          </div>
        </div>
      </nav>
      </header>

      <main>
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-0 px-5 overflow-hidden">
        <HeroShader />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <h1 className="font-zen text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[1.05] tracking-tight opacity-0 fade-up [animation-delay:200ms]">
            License music<br />
            <span className="text-white italic">effortlessly.</span>
          </h1>

          <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed font-dm opacity-0 fade-up [animation-delay:350ms]">
            Viola is the all-in-one platform and marketplace that makes music licensing simple, efficient, and accessible for everyone's creative projects.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 fade-up [animation-delay:500ms]">
            <Button
              ref={(el) => (buttonRefs.current[1] = el)}
              onMouseMove={(e) => handleMouseMove(e, 1)}
              onClick={() => navigate("/waitlist")}
              className="group px-7 py-3 h-auto text-base font-semibold rounded-xl glass-btn glass-btn-primary"
            >
              <span className="flex items-center gap-2">
                Join the Waitlist
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "mailto:viola@theviola.co"}
              className="glass-btn glass-btn-secondary px-7 py-3 h-auto text-base rounded-xl hover:bg-white/10 hover:text-white"
            >
              Talk to Our Team
            </Button>
          </div>

          <p className="font-dm text-white/30 text-xs tracking-widest uppercase opacity-0 fade-up [animation-delay:650ms]">
            Built for Sync Teams · Music Supervisors · Record Labels · Music Publishing
          </p>
        </div>

        {/* Hero product screenshot */}
        <div className="relative mt-16 max-w-6xl mx-auto opacity-0 fade-up [animation-delay:800ms]">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-[0_40px_120px_rgba(0,0,0,0.8)] aspect-video">
            {videoErrors["hero"] ? (
              <img src={fallbackPoster} alt="viola product interface preview" className="w-full h-full object-cover brightness-75" />
            ) : (
              <video autoPlay muted loop playsInline preload="metadata" poster={fallbackPoster} crossOrigin="anonymous"
                onError={() => setVideoErrors(v => ({ ...v, hero: true }))}
                className="w-full h-full object-cover"
              >
                <source src={searchVideo} type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            <button
              onClick={() => navigate("/demo/marketplace")}
              className="group absolute left-1/2 bottom-6 -translate-x-1/2 z-10 gap-2 px-6 py-3 rounded-full text-sm font-semibold glass-btn glass-btn-primary"
            >
              <span className="sm:hidden">Try it now</span>
              <span className="hidden sm:inline">Try the marketplace for free</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="absolute -bottom-px left-0 right-0 h-32 bg-gradient-to-t from-[#0e0e10] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex gap-2 px-3 py-2 rounded-full bg-white text-black mb-6 ring-1 ring-white/30">
            <Bug className="w-4 h-4" />
            <span className="text-xs font-medium">The Problem</span>
          </div>
          <h2 className="font-zen text-3xl md:text-4xl leading-tight text-white mb-6">
            The work is creative.<br />The workflow still is not.
          </h2>
          <div className="space-y-3">
            {[
              "Can take Months to license a song for your project",
              "Unorganized and inefficient communication for every music license negotiated",
              "Inaccessible music licenses leave money on the table",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/4 px-4 py-3.5 text-sm text-white/80">
                <X className="w-4 h-4 text-[#ee481f] mt-0.5 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="font-dm text-white/50 text-sm pt-6">Viola gives you the tools to streamline the busy work.</p>
        </div>
      </section>

      {/* ── Why Viola — Features ── */}
      <section id="features" ref={whySection.ref} className="py-24 px-5 border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-white/40 text-xs uppercase tracking-widest font-dm mb-3">Features</p>
            <h2 className="font-zen text-4xl md:text-5xl font-semibold text-white leading-tight">
              Why Viola
            </h2>
          </div>
        </div>

        {/* Sticky jump-tabs — becomes a full-bleed glass nav bar once you scroll past it (mobile + desktop) */}
        <div ref={tabsSentinelRef} aria-hidden className="h-px w-full" />
        <div
          className={`sticky top-[56px] md:top-[64px] z-30 mb-16 -mx-5 px-5 py-3 transition-colors duration-300 ${
            tabsStuck ? "border-b border-white/10 bg-[#0b0b0e]/85 backdrop-blur-xl" : ""
          }`}
        >
          <div className="flex justify-center overflow-x-auto px-1 py-1">
            <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-[#0d0d10]/80 backdrop-blur-md shadow-lg shadow-black/30">
              {featureTabs.map((tab, i) => (
                <button
                  key={tab.id}
                  onClick={() => featureRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === i
                      ? "bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.25)]"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* All features stacked */}
          <div className="space-y-24 lg:space-y-32">
            {featureTabs.map((tab, i) => (
              <div
                key={tab.id}
                ref={(el) => (featureRefs.current[i] = el)}
                className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center scroll-mt-32"
              >
                <div className={`space-y-5 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <h3 className="font-zen text-3xl md:text-4xl font-semibold text-white leading-snug">
                    {tab.headline}
                  </h3>
                  <p className="font-dm text-white/60 text-base leading-relaxed">
                    {tab.body}
                  </p>
                  <button
                    onClick={() => navigate("/waitlist")}
                    className="inline-flex items-center gap-2 text-white/90 hover:text-amber text-sm font-medium hover:gap-3 transition-all duration-200"
                  >
                    Join the Waitlist <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/50 shadow-[0_20px_60px_rgba(0,0,0,0.6)] aspect-video">
                    {videoErrors[tab.id] ? (
                      <img src={fallbackPoster} alt={tab.label} className="w-full h-full object-cover brightness-75 grayscale" />
                    ) : (
                      <video autoPlay muted loop playsInline preload="metadata" poster={fallbackPoster} crossOrigin="anonymous"
                        onError={() => setVideoErrors(v => ({ ...v, [tab.id]: true }))}
                        className="w-full h-full object-cover lg:-translate-y-4 md:-translate-y-3"
                      >
                        <source src={tab.video} type="video/mp4" />
                      </video>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Callout Banner ── */}
      <section className="px-5 py-6">
        <div className="max-w-6xl mx-auto overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-sm text-white py-16 px-8 text-center space-y-3">
          <p className="uppercase tracking-[0.25em] text-xs font-dm opacity-60">Locate · Listen · License</p>
          <h2 className="font-zen font-semibold text-2xl md:text-3xl lg:text-4xl leading-tight max-w-4xl mx-auto">
            <span className="md:whitespace-nowrap">From Negotiation that feels Endless to</span>{" "}
            <br className="hidden md:block" />
            <span className="md:whitespace-nowrap">Licensed in Minutes</span>
          </h2>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section id="outcomes" ref={outcomesSection.ref} className="py-20 px-5">
        <div className={`max-w-5xl mx-auto space-y-8 transition-all duration-700 ${outcomesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-center">
            <p className="uppercase tracking-[0.2em] text-white/40 font-dm text-xs mb-3">Outcomes</p>
            <h2 className="text-3xl md:text-4xl font-zen font-semibold text-white">What changes when you use Viola</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-red-600/30 bg-gradient-to-br from-red-900/25 via-black/50 to-black/80 p-6 md:p-8 space-y-6">
              <div className="inline-flex items-center gap-2 text-red-300 text-xs uppercase tracking-widest font-dm">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-300"><X className="w-3.5 h-3.5" /></span>
                Without Viola
              </div>

              {[
                {
                  group: "For Music Licensees",
                  items: [
                    "Delays in submitting a brief and receiving songs",
                    "Inefficient back-and-forth negotiation wastes valuable time and energy",
                    "Cannot fully own music taste",
                  ],
                },
                {
                  group: "For Record Labels & Publishing Companies",
                  items: [
                    "Inefficient manual music licensing processes mean missed sync orders and lost revenue at scale",
                    "Manual music searching and pitch packaging per brief is time consuming",
                    "Tight deadlines of up to 48 hours turnaround time for certain briefs",
                  ],
                },
              ].map((section) => (
                <div key={section.group} className="space-y-3">
                  <p className="font-dm text-red-200/90 text-xs font-semibold uppercase tracking-wider">{section.group}</p>
                  <ul className="space-y-2.5 text-white/60 text-sm list-none">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <X className="w-4 h-4 text-red-400/70 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              ref={withViolaRef}
              className={`rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 via-white/10 to-white/[0.06] text-white p-6 md:p-8 space-y-5 shadow-[0_0_60px_rgba(255,255,255,0.08)] ${withViolaVisible ? "flicker-on" : "opacity-80"}`}
            >
              <div className="inline-flex items-center gap-2 text-white text-xs uppercase tracking-widest font-dm font-bold">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 shadow-sm"><Check className="w-3.5 h-3.5 text-white" /></span>
                With Viola
              </div>

              {[
                {
                  group: "For Music Licensees",
                  items: [
                    { main: "Complete briefs efficiently", sub: "Search, shortlist, clear songs, and checkout" },
                    { main: "1 workspace for everything", sub: "Music licensing done in one platform" },
                  ],
                },
                {
                  group: "For Record Labels & Publishing Companies",
                  items: [
                    { main: "Goodbye to cluttered email inbox and messaging", sub: "No inefficient back-and-forth negotiation — clear songs faster" },
                    { main: "Track sync orders, total revenue, and other analytics in one dashboard" },
                    { main: "Fulfill sync orders that were once missed" },
                    { main: "Maximize catalog revenue and focus efforts more wisely" },
                  ],
                },
              ].map((section) => (
                <div key={section.group} className="space-y-3">
                  <p className="font-dm text-white/50 text-xs font-bold uppercase tracking-wider">{section.group}</p>
                  <ul className="space-y-2.5 text-white/80 text-sm list-none">
                    {section.items.map((item) => (
                      <li key={item.main} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-white/70 mt-0.5 flex-shrink-0" />
                        <span className="flex flex-col">
                          <span className="font-semibold">{item.main}</span>
                          {item.sub && <span className="text-white/50">{item.sub}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xl text-white/60 text-center font-dm">
            More of your day goes to <span className="italic text-white">music taste,</span> not paperwork and negotiation.
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section ref={testimonialsSection.ref} className="py-20 px-5 border-t border-white/6">
        <div className={`max-w-6xl mx-auto transition-all duration-700 ${testimonialsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-center mb-12">
            <p className="text-white/40 text-xs uppercase tracking-widest font-dm mb-3">What People Say</p>
            <h2 className="text-3xl md:text-4xl font-zen font-semibold text-white">Our Users weigh in</h2>
          </div>

          {/* Swipeable testimonial carousel */}
          <div className="relative">
            <div
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/3"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
              >
                {testimonials.map((t) => (
                  <div key={t.name} className="w-full flex-shrink-0 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center max-w-4xl mx-auto">
                      <div className="relative w-full md:w-2/5 flex-shrink-0">
                        <div className="relative aspect-[4/3] bg-black/50 rounded-xl border border-white/10 overflow-hidden">
                          <div className="absolute top-4 left-4 z-10">
                            <LogoMark className="h-6 w-auto" />
                          </div>
                          <img src="/calloutImage.png" alt="Music industry professional" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="space-y-5 select-none">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-amber" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          ))}
                        </div>
                        <p className="font-zen text-xl md:text-2xl text-white/90 leading-relaxed">
                          "{t.quote}"
                        </p>
                        <div className="flex items-center gap-3 text-sm text-white/45 font-dm">
                          <div className="h-px w-8 bg-white/30 flex-shrink-0" />
                          <span>{t.name} · {t.role}{t.company ? ` @ ${t.company}` : ""}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow controls */}
            <button
              aria-label="Previous testimonial"
              onClick={() => goToTestimonial(testimonialIndex - 1)}
              className="absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-[#0d0d10]/80 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label="Next testimonial"
              onClick={() => goToTestimonial(testimonialIndex + 1)}
              className="absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-[#0d0d10]/80 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => goToTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === testimonialIndex ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section ref={whoSection.ref} className="py-20 px-5">
        <div className={`max-w-5xl mx-auto space-y-10 transition-all duration-700 ${whoSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="text-center">
            <p className="text-white/40 text-xs uppercase tracking-widest font-dm mb-3">Who It's For</p>
            <h2 className="text-3xl md:text-4xl font-zen font-semibold text-white">Built for people who have musical taste</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {/* FIT — who Viola is for */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 md:p-8 backdrop-blur-sm transition-all duration-300 ease-out-quint hover:-translate-y-1 hover:border-amber/30 hover:bg-white/[0.05]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber/10 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber/15 text-amber ring-1 ring-amber/20">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-amber/90">Perfect if you are a</p>
                </div>
                <ul className="space-y-3.5">
                  {["Music Supervisor", "Sync Licensing Manager", "Sync Agency Owner", "Record Label or Publishing Company Team Member"].map(r => (
                    <li key={r} className="flex items-start gap-3 text-[15px] leading-snug text-white/80">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber/70" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* PAIN — what they're tired of */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 md:p-8 backdrop-blur-sm transition-all duration-300 ease-out-quint hover:-translate-y-1 hover:border-red-orange/30 hover:bg-white/[0.05]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-red-orange/10 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-orange/15 text-red-orange ring-1 ring-red-orange/20">
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-red-orange/90">And you're tired of</p>
                </div>
                <ul className="space-y-3.5">
                  {["Digging through clunky library interfaces", "Unfulfilled and missed sync orders", "Losing months to the licensing negotiation process"].map(r => (
                    <li key={r} className="flex items-start gap-3 text-[15px] leading-snug text-white/80">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-orange/70" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Try Our Demo ── */}
      <section className="py-20 px-5 border-t border-white/6">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <p className="text-white/40 text-xs uppercase tracking-widest font-dm">Try Our Demo</p>
          <h2 className="font-zen text-4xl md:text-6xl font-semibold text-white leading-tight">
            See Viola in action.
          </h2>
          <p className="text-white/50 font-dm text-base max-w-md mx-auto">
            Type a brief the way you actually write it and watch Viola go to work.
          </p>
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto pt-2">
            <div className="glow-border">
              <div className="relative">
                <img
                  src="/flower.png"
                  alt=""
                  className={`absolute invert left-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full object-cover transition-all duration-300 ${isSearchFocused ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={placeholderText}
                  className={`h-14 text-base border-0 bg-white text-black placeholder:text-black/50 focus-visible:ring-1 focus-visible:ring-black rounded-full shadow-lg transition-all duration-300 ${isSearchFocused ? "pl-14 pr-12" : "pl-5 pr-5"}`}
                />
                {isSearchFocused && <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />}
              </div>
            </div>
            {!hasSearched && <p className="text-white/30 text-xs mt-3 tracking-widest uppercase font-dm">Locate, Listen, License.</p>}
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <Button
              ref={(el) => (buttonRefs.current[2] = el)}
              onMouseMove={(e) => handleMouseMove(e, 2)}
              onClick={() => navigate("/waitlist")}
              className="group px-8 py-4 h-auto text-base font-semibold rounded-xl min-w-[220px] glass-btn glass-btn-primary"
            >
              <span className="flex items-center justify-center gap-2">
                Join the Waitlist
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "mailto:viola@theviola.co?subject=Talk%20with%20Viola&body=Hi%20Viola%20team%2C%0A%0AI%27d%20love%20to%20connect."}
              className="glass-btn glass-btn-secondary px-8 py-4 h-auto text-base rounded-xl min-w-[220px] hover:bg-white/10 hover:text-white"
            >
              Talk to Our Team
            </Button>
          </div>
          <p className="text-white/20 text-xs font-dm pt-2">No credit card required · Hands-on onboarding included</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-5 border-t border-white/8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <p className="text-white/40 text-xs uppercase tracking-widest font-dm">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-zen font-semibold text-white">Asked & answered</h2>
            <p className="text-white/40 text-sm font-dm">Questions we've already heard tastemakers ask.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-2.5">
            {faqItems.map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`item-${idx}`}
                className="overflow-hidden rounded-xl border border-white/8 bg-white/3 transition-colors duration-200 data-[state=open]:bg-white/10 data-[state=open]:border-white/20"
              >
                <AccordionTrigger className="px-5 py-4 text-left text-white text-sm font-semibold hover:no-underline group transition-colors duration-200 data-[state=open]:text-white">
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 p-4 items-center justify-center rounded-full bg-white/10 text-white text-xs transition-colors duration-200 group-data-[state=open]:bg-white/15 group-data-[state=open]:text-white">
                      {idx + 1}
                    </span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 text-sm leading-relaxed text-white/70 data-[state=open]:text-white/70">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Landing;
