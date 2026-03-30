/**
 * Marketplace Component
 * Main marketplace/discover page with:
 * - Hero carousel (Viola Top Picks)
 * - Genre grid (links to genre marketplaces)
 * - Record Labels list (links to label/artist marketplaces)
 * - Discover Sync Ready Tracks (general marketplace)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ─── TYPES ─── */
interface TopPick {
  id: string;
  title: string;
  artist: string;
  image: string;
  gradient: string;
}

interface Genre {
  id: string;
  name: string;
  color: string;
}

interface RecordLabel {
  id: string;
  name: string;
  logo: string;
}

interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  bpm: number;
  duration: string;
  cover: string;
}

/* ─── MOCK DATA ─── */
const TOP_PICKS: TopPick[] = [
  {
    id: "1",
    title: "End of Beginning",
    artist: "DJO",
    image: "https://i.scdn.co/image/ab67616d0000b273fddfffec51b4580acae727c1",
    gradient: "from-purple-900/80 via-purple-800/60 to-transparent",
  },
  {
    id: "2",
    title: "Espresso",
    artist: "Sabrina Carpenter",
    image: "https://i.scdn.co/image/ab67616d0000b273fd8d7a8d96871e791cb1f626",
    gradient: "from-amber-900/80 via-orange-800/60 to-transparent",
  },
  {
    id: "3",
    title: "Birds of a Feather",
    artist: "Billie Eilish",
    image: "https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62",
    gradient: "from-blue-900/80 via-cyan-800/60 to-transparent",
  },
  {
    id: "4",
    title: "Good Luck, Babe!",
    artist: "Chappell Roan",
    image: "https://i.scdn.co/image/ab67616d0000b27391b4bc7c88d91a42e0f3a8b7",
    gradient: "from-rose-900/80 via-pink-800/60 to-transparent",
  },
  {
    id: "5",
    title: "Lunch",
    artist: "Billie Eilish",
    image: "https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62",
    gradient: "from-emerald-900/80 via-teal-800/60 to-transparent",
  },
];

const GENRES: Genre[] = [
  { id: "pop", name: "Pop", color: "bg-rose-400" },
  { id: "rnb", name: "R&B", color: "bg-pink-300" },
  { id: "indie", name: "Indie", color: "bg-orange-300" },
  { id: "hip-hop", name: "Hip-Hop", color: "bg-yellow-300" },
  { id: "electronic", name: "Electronic", color: "bg-blue-300" },
  { id: "jazz", name: "Jazz", color: "bg-indigo-300" },
  { id: "thriller", name: "Thriller", color: "bg-red-900" },
  { id: "disco", name: "Disco", color: "bg-purple-400" },
  { id: "country", name: "Country", color: "bg-amber-600" },
];

const RECORD_LABELS: RecordLabel[] = [
  { id: "umg", name: "Universal Music Group", logo: "/logos/universal.svg" },
  { id: "sony", name: "Sony Music Entertainment", logo: "/logos/sony-music.svg" },
  { id: "warner", name: "Warner Music Group", logo: "/logos/warner-music.svg" },
  { id: "88rising", name: "88rising", logo: "/logos/88rising.svg" },
  { id: "hybe", name: "HYBE Labels", logo: "/logos/hybe.svg" },
  { id: "jyp", name: "JYP Entertainment", logo: "/logos/jyp.svg" },
];

const DISCOVER_TRACKS: DiscoverTrack[] = [
  { id: "t1", title: "Golden Hour", artist: "Kaia Lune", genre: "Pop", mood: "Happy", bpm: 120, duration: "3:24", cover: "https://picsum.photos/seed/golden-hour/200" },
  { id: "t2", title: "Velvet Haze", artist: "Noel Rivers", genre: "Indie", mood: "Chill", bpm: 98, duration: "4:01", cover: "https://picsum.photos/seed/velvet-haze/200" },
  { id: "t3", title: "Midnight Drive", artist: "Sable Moon", genre: "R&B", mood: "Moody", bpm: 110, duration: "3:45", cover: "https://picsum.photos/seed/midnight-drive/200" },
  { id: "t4", title: "Neon Pulse", artist: "ZEKRA", genre: "Electronic", mood: "Energetic", bpm: 128, duration: "3:12", cover: "https://picsum.photos/seed/neon-pulse/200" },
  { id: "t5", title: "Southside Glow", artist: "Dex Amari", genre: "Hip-Hop", mood: "Dark", bpm: 140, duration: "2:58", cover: "https://picsum.photos/seed/southside-glow/200" },
  { id: "t6", title: "Blue Satin", artist: "Mila Sorrento", genre: "Jazz", mood: "Smooth", bpm: 95, duration: "4:30", cover: "https://picsum.photos/seed/blue-satin/200" },
];

/* ─── COMPONENT ─── */
export const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  /* Auto-advance carousel */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOP_PICKS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + TOP_PICKS.length) % TOP_PICKS.length);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % TOP_PICKS.length);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/demo/search", { state: { query: searchQuery.trim() } });
    }
  };

  const currentPick = TOP_PICKS[currentSlide];

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white font-dm tracking-tight">
          Welcome back, {user?.username || "Guest"}
        </h1>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5 border border-white/10 hover:border-white/20 transition-colors w-[340px]">
            <Search className="h-4 w-4 text-white/50 flex-shrink-0" />
            <input
              type="text"
              placeholder="Your next song is found when you type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none w-full"
            />
          </div>
        </form>
      </div>

      {/* ─── HERO CAROUSEL: Viola Top Picks ─── */}
      <div className="relative rounded-2xl overflow-hidden h-[280px] group">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
          style={{ backgroundImage: `url(${currentPick.image})` }}
        />
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentPick.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-8">
          <p className="text-white/80 text-sm font-semibold tracking-widest uppercase mb-4">
            Viola Top Picks for you
          </p>
          <h2 className="text-5xl font-bold text-white font-dm leading-tight">
            {currentPick.title}
          </h2>
          <p className="text-white/80 text-lg font-medium mt-1">
            {currentPick.artist}
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button className="px-5 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/30 hover:bg-white/30 transition-colors">
              Listen Now
            </button>
            <button className="px-5 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              Learn More
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-2 mt-5">
            {TOP_PICKS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "w-6 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Artist image on right side */}
        <div className="absolute right-0 top-0 h-full w-[40%] pointer-events-none">
          <img
            src={currentPick.image}
            alt={currentPick.artist}
            className="h-full w-full object-cover object-top opacity-80 mask-gradient-left"
            style={{
              maskImage: "linear-gradient(to left, rgba(0,0,0,0.8) 30%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.8) 30%, transparent 100%)",
            }}
          />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ─── BOTTOM GRID: Genres / Record Labels / Discover ─── */}
      <div className="grid grid-cols-12 gap-4 pb-6">
        {/* GENRES */}
        <div className="col-span-3 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-base">Genres</h3>
            <button className="text-white/50 text-xs hover:text-white/80 transition-colors">
              See All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => navigate(`/demo/marketplace/genre/${genre.id}`)}
                className="group/genre"
              >
                <div
                  className={`w-full aspect-square rounded-xl ${genre.color} opacity-80 group-hover/genre:opacity-100 group-hover/genre:scale-105 transition-all duration-200 shadow-lg flex items-end justify-start p-2`}
                >
                  <span className="text-white text-[11px] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                    {genre.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RECORD LABELS */}
        <div className="col-span-4 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-base">Record Labels</h3>
            <button className="text-white/50 text-xs hover:text-white/80 transition-colors">
              See All
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {RECORD_LABELS.map((label) => (
              <button
                key={label.id}
                onClick={() => navigate(`/demo/marketplace/label/${label.id}`)}
                className="flex items-center w-full rounded-full bg-black/60 border border-white/10 hover:border-white/25 transition-colors group/label overflow-hidden p-2.5"
              >
                <div className="flex items-center justify-center flex-shrink-0 h-10 w-10">
                  <img
                    src={label.logo}
                    alt={label.name}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-white/90 text-sm font-medium ml-auto pr-3 group-hover/label:text-white transition-colors">
                  {label.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* DISCOVER SYNC READY TRACKS */}
        <div className="col-span-5 bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-base">Discover Sync Ready Tracks</h3>
            <Link
              to="/demo/marketplace/discover"
              className="text-white/50 text-sm hover:text-white transition-colors underline underline-offset-2 z-10 relative"
            >
              See All
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            {DISCOVER_TRACKS.map((track, i) => (
              <button
                key={track.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group/track w-full text-left"
              >
                {/* Album cover */}
                <img
                  src={track.cover}
                  alt={track.title}
                  className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                />

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate group-hover/track:text-white/90">
                    {track.title}
                  </div>
                  <div className="text-white/40 text-xs truncate">{track.artist}</div>
                </div>

                {/* Tags */}
                <div className="hidden xl:flex items-center gap-2 text-[10px] text-white/40">
                  <span className="px-2 py-0.5 rounded bg-white/5">{track.genre}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">{track.mood}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5">BPM {track.bpm}</span>
                  <span>{track.duration}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
