import { useNavigate } from "react-router-dom";
import { useState, useRef, MouseEvent, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Target, Bug, X, Cog, CloudUpload, Drill, BrainCircuit, Star, Users, CheckCircle2, ChevronDown, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";

/**
 * Phrases that cycle through in the search bar placeholder
 * Used to demonstrate different types of music search queries
 */
const typingPhrases = [
  "spooky choirs...",
  "dark synths...",
  "a spicy melody...",
  "cinematic builds..."
];

// Serve videos directly from the public folder to avoid bundling issues on deploy
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;
const heroVideo = asset("viola_background.mp4");
const searchVideo = asset("violaSearch.mp4");
const pitchVideo = asset("violaPitchBuilder.mp4");
const catalogueVideo = asset("violaCatalogue.mp4");
const fallbackPoster = asset("viola.jpg");

/**
 * LogoMark Component
 * Displays the Viola logo SVG used in the navigation header
 */
const LogoMark = () => (
  <svg
    viewBox="0 0 72 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
  >
    <path
      d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z"
      fill="white"
    />
    <path
      d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421"
      fill="white"
    />
    <path
      d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582"
      fill="white"
    />
  </svg>
);

/**
 * Landing Page Component
 * Main landing page for Viola with multiple sections showcasing the product
 *
 * Key Features:
 * - Interactive hero section with video background
 * - Mouse-tracking background effects in Problem section
 * - Animated search bar with typing placeholder effect
 * - Feature demonstrations with videos
 * - Before/After comparison with flicker animation
 * - Interactive canvas spotlight effect
 * - FAQ accordion section
 * - Fully responsive design
 */
const Landing = () => {
  // React Router navigation
  const navigate = useNavigate();

  // Refs for interactive button hover effects
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Background animation in Problem section - follows mouse movement
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [backgroundTransform, setBackgroundTransform] = useState({ x: 0, y: 0 });

  // Intersection observer for "With Viola" card flicker animation
  const withViolaRef = useRef<HTMLDivElement>(null);
  const [withViolaVisible, setWithViolaVisible] = useState(false);

  // Search bar state in Why/Trust section
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Find ");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [searchVideoFailed, setSearchVideoFailed] = useState(false);
  const [pitchVideoFailed, setPitchVideoFailed] = useState(false);
  const [catalogueVideoFailed, setCatalogueVideoFailed] = useState(false);

  /**
   * Creates radial gradient effect that follows mouse cursor on CTA buttons
   * Updates CSS custom properties for dynamic gradient positioning
   */
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    const button = buttonRefs.current[index];
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    button.style.setProperty('--mouse-x', `${x}px`);
    button.style.setProperty('--mouse-y', `${y}px`);
  };

  /**
   * Navigates user to the waitlist signup page
   */
  const handleJoinWaitlist = () => {
    navigate("/waitlist");
  };

  /**
   * Handles mouse movement over the Problem section background
   * Creates a parallax effect by translating background position based on mouse position
   * Maximum movement is 20px in any direction from center
   */
  const handleBackgroundMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!backgroundRef.current) return;

    const rect = backgroundRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center, normalized to -1 to 1
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Apply subtle movement (max 20px in each direction for the background)
    const moveX = deltaX * 20;
    const moveY = deltaY * 20;

    setBackgroundTransform({ x: moveX, y: moveY });
  };

  /**
   * Resets background position when mouse leaves the Problem section
   */
  const handleBackgroundMouseLeave = () => {
    setBackgroundTransform({ x: 0, y: 0 });
  };

  /**
   * Handles search form submission in the Why/Trust section
   * Navigates to waitlist page (search is a demo, not functional)
   */
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    setSearchQuery("");
    navigate("/waitlist");
  };

  /**
   * Scrolls to top of page on mount
   * Ensures users see the hero section when navigating to landing page
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Intersection Observer effect for "With Viola" card animation
   * Triggers the flicker-on animation when card becomes 30% visible
   */
  useEffect(() => {
    const target = withViolaRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWithViolaVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  /**
   * Typing animation effect for search bar placeholder
   * Cycles through phrases array, typing and deleting characters
   * Creates an engaging, dynamic placeholder that demonstrates search capabilities
   */
  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const intervalId = setInterval(() => {
      const phrase = typingPhrases[phraseIndex];
      setPlaceholderText(`Find me ${phrase.slice(0, charIndex)}`);

      if (!deleting) {
        charIndex++;
        if (charIndex > phrase.length) {
          deleting = true;
        }
      } else {
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        }
      }
    }, deleting ? 320 : 150);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-black font-inter">
      {/* Navigation */}
      <nav className="absolute z-50 w-full backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="flex items-center px-6 py-6 lg:justify-between justify-center">
          <div className="flex items-center gap-6">
            <LogoMark />
          </div>
          <div>
            <Button
              ref={(el) => (buttonRefs.current[0] = el)}
              onMouseMove={(e) => handleMouseMove(e, 0)}
              onClick={handleJoinWaitlist}
              style={{ boxShadow: 'none' }}
              className="
              hidden
              lg:inline-flex lg:items-center
              group relative transition duration-500
              ease-in-out hover:cursor-pointer rounded-lg border
              border-white px-6 py-2 font-medium bg-transparent text-white min-w-[150px]
              hover:border-[#e4ea04] hover:text-black hover:bg-[#e4ea04]
              shadow-none hover:shadow-none hover:shadow-transparent drop-shadow-none hover:drop-shadow-none
              focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
              overflow-hidden
              "
            >
              <span className="relative z-10">Request Early Access</span>
              <ArrowRight className="w-4 h-4 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center content-center justify-center px-2 lg:px-8 pt-20 md:pt-32 overflow-hidden">
        {/* Video Background */}
        {heroVideoFailed ? null : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            onError={() => setHeroVideoFailed(true)}
            className="absolute lg:rounded-full invert top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[22px] sm:w-full lg:w-3/4 h-1/2 h-auto object-cover z-0 opacity-90 hidden sm:block"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        )}
        {/* Lightweight static fallback for mobile */}
        <div className="absolute saturate-[0] inset-0 sm:hidden viola-glow-bg opacity-70 blur-2xl scale-125"></div>
        {/* Mobile header fade from transparent (top) to black (bottom) */}
        <div className="absolute inset-0 sm:hidden bg-gradient-to-b from-transparent via-black/45 to-black z-[1]"></div>
        {/* Desktop/tablet gradient */}
        <div className="absolute saturate-[0] inset-0 bg-gradient-to-b from-black via-black/30 to-black/80 z-[1] hidden sm:block"></div>

        <div className="
      absolute saturate-[0] pointer-events-none -inset-[90%] z-10
      bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(0,0,0,1)_50%,rgba(255,255,255,0.1)_100%)]
       blur-[40px] opacity-40"></div>

        <div className="text-center font-dm max-w-6xl mx-auto relative z-10 space-y-8">
          <h1 className="font-[500] font-zen drop-shadow-[0px_0px_3px_rgba(255,255,255,1)] text-4xl sm:text-6xl lg:text-7xl font-[500] tracking-tight opacity-0 animate-fade-in-up [animation-delay:400ms]">
            Pitch Your Catalog Efficiently and Effortlessly
          </h1>

          <p className="text-md md:text-xl max-w-3xl text-white/70 mx-auto opacity-0 animate-fade-in-up [animation-delay:600ms]">
          Viola is the all-in-one music licensing platform for sync teams and the creative tastemakers. 
          <br />
          Locate, Listen, and License the right tracks you want efficiently and accessibly.
          </p>

          <div className="cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up [animation-delay:800ms]">
            <Button
              ref={(el) => (buttonRefs.current[1] = el)}
              onMouseMove={(e) => handleMouseMove(e, 1)}
              size="lg"
              className="group relative transition duration-500 text-lg px-8 py-6 bg-white text-black hover:bg-[#e4ea04]/90 hover:shadow-[0_0_20px_rgba(228,234,4,0.5),0_0_40px_rgba(228,234,4,0.2)] rounded-lg overflow-hidden before:absolute before:inset-0 before:rounded-lg before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[radial-gradient(circle_100px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent)]"
              onClick={handleJoinWaitlist}
            >
              <span className="relative z-10">Request Early Access</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="px-4 md:px-8 lg:px-12 py-12 md:py-10 lg:py-10 pt-12 lg:pt-0">
        <div className="max-w-9xl mx-auto">

          <div className="relative overflow-hidden rounded-2xl px-6 md:px-10 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] pt-0">
            <div className="absolute inset-0 pointer-events-none"></div>
              <div className="flex flex-col items-center md:flex-row gap-6 w-full">
                <div className="relative w-full md:w-1/2 overflow-hidden rounded-xl">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-transparent to-black/60 z-10 pointer-events-none">
                    
                  </div>
        
                  <div className="aspect-[4/3] md:aspect-[3/5] lg:aspect-[7/5] flex items-center justify-center bg-black/50 rounded-xl border border-white/10">
                    <div className="absolute w-full top-4 left-4">
                      <div className="flex items-center gap-6">
                      <svg
                        viewBox="0 0 72 55"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className=" h-8 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                      >
                        <path
                          d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z"
                          fill="white"
                        />
                        <path
                          d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421"
                          fill="white"
                        />
                        <path
                          d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582"
                          fill="white"
                        />
                      </svg>
                      </div>
                    </div>
                    <img
                       src="/calloutImage.png"
                       alt="Industry testimonial"
                       className="h-full w-full object-cover rounded-xl" 
                    />
                  </div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-evenly gap-6">
                  <p className="relative font-zen text-xl md:text-2xl lg:text-3xl leading-relaxed text-white">
                  "A reliable AI metadata tagging system would be a game changer for sync. Imagine searching every placement worldwide in seconds. That’s the future."
                  </p>

                  <div className="relative flex items-center gap-3 text-sm md:text-base text-white/70">
                    <div className="h-px w-10 bg-[#e4ea04]"></div>
                    <p className="font-dm">Michael Chen · Coordinator, Creative Marketing — Film & TV @ Sony Music Publishing</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <div
        className="px-4 md:px-8 lg:px-10 py-8 md:py-12 lg:py-24"
        onMouseMove={handleBackgroundMouseMove}
        onMouseLeave={handleBackgroundMouseLeave}
      >
        <div className="relative max-w-6xl mx-auto">
          {/* Blurred background image acting as border */}
          <div
            ref={backgroundRef}
            className="absolute inset-0 rounded-xl md:rounded-2xl transition-transform duration-500 ease-out viola-glow-bg animate-heatwave w-full overflow-hidden"
            style={{
              transform: `translate(${backgroundTransform.x}px, ${backgroundTransform.y}px) scale(1)`
            }}
          ></div>

          {/* Main content container */}
          <div className="relative bg-black/90 rounded-xl md:rounded-2xl m-2 md:m-3 border border-white/10 backdrop-blur-sm shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="max-w-4xl mx-auto px-6 py-10 md:px-10 md:py-14">
              <div className="inline-flex gap-2 px-3 py-2 md:px-4 rounded-full bg-white text-black mb-6 ring-1 ring-white/30">
                <Bug className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">The Problem</span>
              </div>

              <h2 className="font-zen text-2xl md:text-4xl leading-tight text-white mb-4">
                The work is creative. The workflow still is not.
              </h2>

              <ul className="space-y-3">
                <li className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm md:text-base text-white/90">
                  3–4 hours of manual searching and sifting tracks for every placement
                </li>
                <li className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm md:text-base text-white/90">
                  Unorganized and inefficient communication for every music license negotiated
                </li>
                <li className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm md:text-base text-white/90">
                  Inaccessible music licenses leaves money on the table
                </li>
              </ul>

              <p className="text-white/85 text-sm md:text-base pt-5">
                Viola gives you the tools to streamline the busy work.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Callout Section */}
      <section className="py-12 md:py-16 lg:py-24 text-black">
        <div className="relative w-full max-w-6xl mx-auto min-h-[220px] md:min-h-[260px] lg:min-h-[320px] overflow-hidden flex items-center justify-center rounded-none lg:rounded-[32px] border border-white/10">
          {/* Blurred background with heatwave animation */}
          <div
            className="absolute inset-0 rounded-none lg:rounded-[32px] bg-[#e4ea04] shadow-lg shadow-rose-500"
          ></div>

          {/* Content */}
          <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 lg:py-20 text-center space-y-3 md:space-y-4">
            <p className="uppercase tracking-[0.25em] text-xs">Locate · Listen · License</p>
            <h2 className="font-zen font-semibold text-2xl md:text-3xl lg:text-4xl leading-tight max-w-5xl mx-auto">
              From <span className="italic">"I'll Know It When I Hear It"</span> to Easily Pitched.
              <span className="block h-4 md:h-6" aria-hidden="true"></span>
              <span className="block font-dm">All Done in One Place.</span>
            </h2>
          </div>
        </div>
      </section>

      <div className="px-4 md:px-8 lg:px-24 ">
        {/* Feature Section 1: Locate */}
        <section className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16 rounded-2xl backdrop-blur-sm p-4 sm:p-6">
            {/* Animation - Left */}
            <div className="w-full lg:flex-1 flex justify-center">
              <div className="relative w-full max-w-3xl overflow-hidden rounded-xl aspect-video animate-fade-in-up border border-white/10 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                {searchVideoFailed ? (
                  <img
                    src={fallbackPoster}
                    alt="Search demo placeholder"
                    className="absolute inset-0 w-full h-full object-cover lg:-translate-y-5 md:-translate-y-4 sm:-translate-y-3 -translate-y-1 brightness-75 grayscale"
                  />
                ) : (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={fallbackPoster}
                    crossOrigin="anonymous"
                    onError={() => setSearchVideoFailed(true)}
                    className="absolute inset-0 w-full h-full object-cover lg:-translate-y-5 md:-translate-y-4 sm:-translate-y-3 -translate-y-1"
                  >
                    <source src={searchVideo} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>

            {/* Text - Right */}
            <div className="w-full lg:flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e4ea04]/10 text-[#e4ea04] mb-6 ring-1 ring-[#e4ea04]">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-sm font-medium">AI Search</span>
              </div>
              <h2 className="font-zen text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Find the Perfect Track in Seconds
              </h2>
              <p className="text-base md:text-lg text-white/80 mb-4">
              Type what you would say in your natural language: "dark and eerie songs where the lead girl and boy are being chased in the woods, subtle vocal, 130 bpm, no explicit lyrics." Viola understands the mood, genre, tempo, reference, and story context. No more blind metadata  keyword filtering and guessing, or endless scroll. Just say what you need, and Viola pulls the right tracks that actually feels right to you.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Section 2: Listen */}
        <section className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8 md:gap-12 lg:gap-16 rounded-2xl backdrop-blur-sm p-4 sm:p-6">
            {/* Animation - Right */}
            <div className="w-full lg:flex-1 flex justify-center">
              <div className="relative w-full max-w-3xl overflow-hidden rounded-xl aspect-video animate-fade-in-up border border-white/10 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                {pitchVideoFailed ? (
                  <img
                    src={fallbackPoster}
                    alt="Pitch builder placeholder"
                    className="absolute inset-0 w-full h-full object-cover lg:-translate-y-5 md:-translate-y-4 sm:-translate-y-3 -translate-y-1 brightness-75 grayscale"
                  />
                ) : (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={fallbackPoster}
                    crossOrigin="anonymous"
                    onError={() => setPitchVideoFailed(true)}
                    className="absolute inset-0 w-full h-full object-cover lg:-translate-y-5 md:-translate-y-4 sm:-translate-y-3 -translate-y-1"
                  >
                    <source src={pitchVideo} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>

            {/* Text - Left */}
            <div className="w-full lg:flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e4ea04]/10 text-[#e4ea04] mb-6 ring-1 ring-[#e4ea04]">
                <Drill className="w-4 h-4" />
                <span className="text-sm font-medium">Pitch Kit Builder</span>
              </div>
              <h2 className="font-zen text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Curate with Confidence
              </h2>
              <p className="text-base md:text-lg text-white/80 mb-4">
              Build ready-to-send pitch kits in a few clicks. Viola pulls in metadata, covert art, licensing information, and audio files for every track automatically to ensure that organization is clean, consistent, and synced to the catalog.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Section 3: License */}
        <section className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16 rounded-2xl backdrop-blur-sm p-4 sm:p-6">
            {/* Animation - Left */}
            <div className="w-full lg:flex-1 flex justify-center">
              <div className="relative w-full max-w-3xl overflow-hidden rounded-xl aspect-video animate-fade-in-up border border-white/10 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                {catalogueVideoFailed ? (
                  <img
                    src={fallbackPoster}
                    alt="Catalog viewer placeholder"
                    className="absolute inset-0 w-full h-full object-cover lg:-translate-y-5 md:-translate-y-4 sm:-translate-y-3 -translate-y-1 brightness-75 grayscale"
                  />
                ) : (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={fallbackPoster}
                    crossOrigin="anonymous"
                    onError={() => setCatalogueVideoFailed(true)}
                    className="absolute inset-0 w-full h-full object-cover lg:-translate-y-5 md:-translate-y-4 sm:-translate-y-3 -translate-y-1"
                  >
                    <source src={catalogueVideo} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>

            {/* Text - Right */}
            <div className="w-full lg:flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e4ea04]/10 text-[#e4ea04] mb-6 ring-1 ring-[#e4ea04]">
                <CloudUpload className="w-4 h-4" />
                <span className="text-sm font-medium">Catalog Viewer</span>
              </div>
              <h2 className="font-zen text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Clear Tracks Faster than Ever
              </h2>
              <p className="text-base md:text-lg text-white/80 mb-4">
              Drag and drop all your songs, and have it all in one place. See metadata, mood, and licensing status at a glance. Having the catalog integrated with the smart catalog search engine and pitch kit builder, Viola streamlines the music sync process in one workspace. 
              </p>
              
            </div>
          </div>
        </section>
      </div>

      {/* Outcomes / Before vs After */}
      <section className="px-6 py-16 md:py-20 pb-8 md:pb-8">
        <style>
          {`
            @keyframes flicker-on {
              0% { opacity: 0; filter: brightness(0.8); }
              20% { opacity: 0.4; filter: brightness(1.1); }
              40% { opacity: 0.6; filter: brightness(0.9); }
              60% { opacity: 0.9; filter: brightness(1.05); }
              100% { opacity: 1; filter: brightness(1); }
            }
            .flicker-on {
              animation: flicker-on 900ms ease-out forwards;
            }
          `}
        </style>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <p className="uppercase tracking-[0.2em] text-white font-dm text-xs mb-3">Outcomes</p>
            <h2 className="text-3xl md:text-4xl font-zen font-semibold text-white">What changes when you use Viola</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 ">
            <div className="rounded-2xl border border-red-600/50 bg-gradient-to-br from-red-600/20 via-red-700/20 to-black/70 p-6 md:p-8 space-y-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
              <div className="inline-flex items-center gap-2 text-red-100 text-sm uppercase tracking-[0.15em]">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/30 text-red-100 "><X className="w-4 h-4 "/></span>
                <span className="font-dm">The old way</span>
              </div>
              <ul className="space-y-3 text-red-50/90 text-sm md:text-base list-disc ml-5">
                <li><span className="font-semibold text-red-50">1–2 days per brief.</span> Before you even get to clearance.</li>
                <li><span className="font-semibold text-red-50">10–15 tabs/threads.</span> Libraries, emails, links, notes all open at once.</li>
                <li><span className="font-semibold text-red-50">40–60 messages per project.</span> Just to wrangle rights and versions.</li>
                <li><span className="font-semibold text-red-50">Almost 0% pure taste.</span> Most of your day is admin, not listening.</li>
                <li>Manual notes to remember what you liked.</li>
                <li>Licensing handled in a totally separate system.</li>
              </ul>
            </div>

            <div
              ref={withViolaRef}
              className={`rounded-2xl border border-yellow-400/60 bg-gradient-to-br from-[#e4ea04] via-[#e4ea04]/90 to-[#e4ea04] text-black p-6 md:p-8 space-y-5 shadow-[0_0px_90px_rgba(228,234,4,0.55),0_0_15px_rgba(228,234,4,0.55)] ${withViolaVisible ? "flicker-on" : "opacity-80"}`}
            >
              <div className="inline-flex items-center gap-2 text-black text-sm uppercase tracking-[0.15em]">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-base shadow-[0_0_25px_rgba(0,0,0,0.15)]"><Check className="w-4 h-4 text-[#e4ea04] " /></span>
                <span className="font-dm font-black">With Viola</span>
              </div>
              <ul className="space-y-3 text-black text-sm md:text-base list-disc ml-5">
                <li><span className="font-semibold text-black">Under 30 minutes per brief.</span> Find, shortlist, and start clearing the right track.</li>
                <li><span className="font-semibold text-black">1 workspace for everything.</span> Search, shortlists, and clearance in the same place.</li>
                <li><span className="font-semibold text-black">Auto‑saved searches & shortlists.</span> Every pass, version, and favorite is remembered.</li>
                <li><span className="font-semibold text-black">Up to 50% fewer emails.</span> Cleaner approvals, faster sign‑offs, happier clients.</li>
              </ul>
            </div>
          </div>
          <p className="text-2xl text-white place-self-center font-dm text-center">
                Net effect: more of your day goes to <span className="italic">taste,</span> not tabs.
          </p>
        </div>
      </section>



      {/* Who Viola Is For */}
      <section className="px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center">
            <p className="uppercase tracking-[0.2em] text-white font-dm text-xs mb-3">CLEAR THE NOISE: Who It's For</p>
            <h2 className="text-3xl md:text-4xl font-zen font-semibold text-white">Built For People Who Have Musical Taste</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="relative p-8 md:p-10 space-y-4 rounded-2xl border-2 border-[#e4ea04]/40 bg-gradient-to-br from-[#e4ea04]/10 via-black/60 to-black/80 backdrop-blur-sm text-center shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(228,234,4,0.15)] hover:border-[#e4ea04]/60 transition-all duration-300">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#e4ea04] shadow-[0_0_10px_rgba(228,234,4,0.8)]"></div>
              <p className="text-[#e4ea04] text-sm uppercase tracking-[0.15em] font-zen font-semibold">Perfect if you are a</p>
              <ul className="space-y-3 text-white/80 text-base">
                <li className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e4ea04]" />
                  <span>Music Supervisor</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e4ea04]" />
                  <span>Sync Licensing Manager</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e4ea04]" />
                  <span>Sync Agency Owner</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#e4ea04]" />
                  <span>Record Label or Publishing Company Team Player </span>
                </li>
              </ul>
            </div>

            <div className="relative p-8 md:p-10 space-y-4 rounded-2xl border-2 border-[#ee481f]/40 bg-gradient-to-br from-[#ee481f]/10 via-black/60 to-black/80 backdrop-blur-sm text-center shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(238,72,31,0.15)] hover:border-[#ee481f]/60 transition-all duration-300">
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#ee481f] shadow-[0_0_10px_rgba(238,72,31,0.8)]"></div>
              <p className="text-[#ee481f] text-sm uppercase tracking-[0.15em] font-zen font-semibold">And you're tired of</p>
              <ul className="space-y-3 text-white/80 text-base">
                <li className="flex items-center justify-center gap-2">
                  <X className="w-4 h-4 text-[#ee481f]" />
                  <span>Digging through clunky library interfaces</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <X className="w-4 h-4 text-[#ee481f]" />
                  <span>Chasing rights info across spreadsheets</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <X className="w-4 h-4 text-[#ee481f]" />
                  <span>Losing half a day to every temp track swap</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

{/* Why / Trust */}
      <section className="px-6 py-16 md:py-20 border border-white/10 rounded-2xl">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <p className="uppercase tracking-[0.2em] text-white font-dm text-xs">Why Viola</p>
          <h2 className="text-4xl md:text-7xl font-zen font-semibold text-white pb-6 px-8">AI that assists your ear, not replaces it.</h2>
          <p className="font-dm">The conversational workspace that understands briefs the way you actually write them.</p>

          <style>
            {`
              @keyframes border-glow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .glow-border {
                background: linear-gradient(120deg,rgba(249, 249, 249, 0.18),rgba(255, 255, 255, 0.43),rgba(202, 145, 255, 0.27),rgba(255, 210, 233, 0.4),rgba(231, 208, 255, 0.23));
                background-size: 300% 300%;
                animation: border-glow 6s linear infinite;
                padding: 1px;
                border-radius: 999px;
                box-shadow: 0 0 40px rgba(255, 255, 255, 0.4);
              }
              .glow-border:hover {
                background: white;
                transition: all 0.2s ease-in-out;
              }
            `}
          </style>

          {/* Search Bar with purple glow */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto transition-all duration-700">
            <div className="glow-border">
              <div className="relative">
                <img
                  src="/flower.png"
                  alt="Viola"
                  className={`absolute invert left-4 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full object-cover transition-all duration-300 ${
                    isSearchFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={placeholderText}
                  className={`h-14 text-base border border-black/10 border-1 bg-white text-black placeholder:text-black/60 focus-visible:ring-1 focus-visible:ring-black rounded-full shadow-lg hover:border-black/30 shadow-black/20 transition-all duration-300 ${
                    isSearchFocused ? 'pl-16 pr-14' : 'pl-6 pr-6'
                  }`}
                />
                {isSearchFocused && (
                  <ArrowRight className={`absolute right-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black transition-all duration-300 ${
                    isSearchFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`} />
                )}
              </div>
            </div>

            {/* Tagline - only visible when not searched */}
            {!hasSearched && (
              <p className="text-center text-white/70 text-sm mt-4 tracking-wide">
                Locate, Listen, License.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Primary CTA Block */}
      <section className="px-6 py-16 md:py-20 pb-0 md:pb-0 rounded-3xl">
        <div className="border border-white/20 border-3 rounded-3xl">
          <div className="max-w-5xl mx-auto  bg-black p-6 md:p-10 rounded-3xl space-y-8 shadow-[0_50px_90px_rgba(0,0,0,1)]">
            <div className="space-y-6 text-center">
              <p className="text-white font-zen text-2xl md:text-3xl leading-tight">
                Ready To Access Licensable Music Within Your Fingertips?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  ref={(el) => (buttonRefs.current[3] = el)}
                  onMouseMove={(e) => handleMouseMove(e, 3)}
                  className="group relative transition duration-500 text-lg px-8 py-6 sm:min-w-[220px] bg-white text-black hover:bg-[#e4ea04]/90 hover:shadow-[0_0_20px_rgba(228,234,4,0.5),0_0_40px_rgba(228,234,4,0.2)] rounded-lg overflow-hidden before:absolute before:inset-0 before:rounded-lg before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[radial-gradient(circle_100px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent)]"
                  onClick={handleJoinWaitlist}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Request Early Access
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="hidden lg:flex text-white border-white/40 px-16 py-6 sm:min-w-[220px] text-lg rounded-lg transition-all duration-500 ease-out hover:border-[#e4ea04] hover:text-black hover:bg-[#e4ea04]/85 hover:shadow-[0_0_30px_rgba(228,234,4,0.35)]"
                  onClick={() => navigate("/demo")}
                >
                  Checkout Demo
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-white/40 px-16 py-6 sm:min-w-[220px] text-lg rounded-lg transition-all duration-500 ease-out hover:border-[#e4ea04] hover:text-black hover:bg-[#e4ea04]/85 hover:shadow-[0_0_30px_rgba(228,234,4,0.35)]"
                  onClick={() => window.location.href = "mailto:viola@theviola.co?subject=Talk%20with%20Viola&body=Hi%20Viola%20team%2C%0A%0AI%27d%20love%20to%20connect.%20Here%27s%20a%20bit%20about%20our%20work%3A%0A-%20Role%3A%0A-%20Company%3A%0A-%20Brief%20volume%3A%0A%0AThanks!"}
                >
                  Talk to Our Team 
                </Button>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 md:bg-black/70 backdrop-blur-sm md:backdrop-blur-xl p-6 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[-20%] bg-[radial-gradient(circle_at_85%_40%,rgba(238,72,31,0.12),transparent_45%)]"></div>
            <div className="absolute inset-0 opacity-25 mix-blend-screen viola-glow-bg sm:animate-heatwave"></div>
          </div>

          <div className="relative space-y-6">
            <div className="text-center space-y-2">
              <p className="uppercase tracking-[0.2em] text-xs font-dm">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-zen font-semibold text-white">Asked & Answered</h2>
              <p className="text-white text-sm md:text-base">Questions we've already heard tastemakers ask. Tap to reveal. P.S.: No corporate, you're not alone.</p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "Are you replacing sync agents, sync managers, and music supervisors?",
                  a: "No. Viola is a workflow tool for people whose full-time job is taste and judgment. It helps you find, sort, and clear faster. You decide what's right for the project."
                },
                {
                  q: "Who's Viola intended for?",
                  a: "Viola is intended for users who work in sync and music supervisors to improve their workflow efficiency and make more informed decisions."
                },
                {
                  q: "Do we have to move our whole catalog into Viola?",
                  a: "No. We integrate with existing catalogs / libraries you already use. (Adjust based on your actual setup.)"
                },
                {
                  q: "How technical is it to get started?",
                  a: "If you can type a brief, you can use Viola. We handle the setup and give you a live onboarding session."
                },
                {
                  q: "What does early access include?",
                  a: "Hands-on onboarding, direct feedback channel with our team, and preferred pricing when we launch public plans."
                }
              ].map((item, idx) => (
                <AccordionItem
                  key={item.q}
                  value={`item-${idx}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors duration-200 data-[state=open]:bg-[#e4ea04] data-[state=open]:border-[#e4ea04]"
                >
                  <AccordionTrigger className="px-4 py-3 text-left text-white font-semibold hover:no-underline group transition-colors duration-200 data-[state=open]:text-black">
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 p-4 items-center justify-center rounded-full bg-white/15 text-white text-xs transition-colors duration-200 group-hover:bg-white group-hover:text-black group-data-[state=open]:bg-black/10 group-data-[state=open]:text-black">
                        {idx + 1}
                      </span>
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-black leading-relaxed transition-all duration-200 data-[state=open]:text-black">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Landing;
