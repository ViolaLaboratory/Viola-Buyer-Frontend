/**
 * DiscoverPage Component
 * Full-page discover view for sync-ready tracks.
 * Accessible from Marketplace "See All" on the Discover Sync Ready Tracks section.
 */

import { useState } from "react";
import { Search, Filter, ArrowUp, Plus, Minus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── TYPES ─── */
interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  duration: string;
  bpm: number;
  key: string;
  iswc: string;
  isrc: string;
  writers: string[];
  extraGenres: string[];
  extraMoods: string[];
  cover: string;
}

/* ─── MOCK DATA ─── */
const DISCOVER_TRACKS: DiscoverTrack[] = [
  {
    id: "t1",
    title: "Golden Hour",
    artist: "Kaia Lune",
    genre: "Pop",
    mood: "Happy",
    duration: "3:24",
    bpm: 120,
    key: "C# Major",
    iswc: "C0101010101",
    isrc: "HLBD35793507",
    writers: ["Jude Gabriel Kozielec", "Ryan Chan", "Kyung Tae Kim"],
    extraGenres: ["R&B", "Afro-Beat"],
    extraMoods: ["Playful", "Upbeat", "Soothing"],
    cover: "https://picsum.photos/seed/golden-hour/200",
  },
  {
    id: "t2",
    title: "Velvet Haze",
    artist: "Noel Rivers",
    genre: "Indie",
    mood: "Chill",
    duration: "4:01",
    bpm: 98,
    key: "A Minor",
    iswc: "C0202020202",
    isrc: "HLBD33591588",
    writers: ["Mina Park", "Damon Wu", "Clara Swift"],
    extraGenres: ["Pop", "Synthwave"],
    extraMoods: ["Moody", "Chill", "Focused"],
    cover: "https://picsum.photos/seed/velvet-haze/200",
  },
  {
    id: "t3",
    title: "Midnight Drive",
    artist: "Sable Moon",
    genre: "R&B",
    mood: "Moody",
    duration: "3:45",
    bpm: 110,
    key: "F# Minor",
    iswc: "C0303030303",
    isrc: "HLBD28177421",
    writers: ["Andre Sol", "Mira Voss"],
    extraGenres: ["Indie", "Alt Rock"],
    extraMoods: ["Reflective", "Warm"],
    cover: "https://picsum.photos/seed/midnight-drive/200",
  },
  {
    id: "t4",
    title: "Neon Pulse",
    artist: "ZEKRA",
    genre: "Electronic",
    mood: "Energetic",
    duration: "3:12",
    bpm: 128,
    key: "Eb Major",
    iswc: "C0404040404",
    isrc: "HLBD35793507",
    writers: ["Jude Gabriel Kozielec", "Ryan Chan", "Kyung Tae Kim"],
    extraGenres: ["Synthwave", "Dance"],
    extraMoods: ["Playful", "Upbeat", "Soothing"],
    cover: "https://picsum.photos/seed/neon-pulse/200",
  },
  {
    id: "t5",
    title: "Southside Glow",
    artist: "Dex Amari",
    genre: "Hip-Hop",
    mood: "Dark",
    duration: "2:58",
    bpm: 140,
    key: "G Minor",
    iswc: "C0505050505",
    isrc: "HLBD33591588",
    writers: ["Mina Park", "Damon Wu"],
    extraGenres: ["Trap", "Lo-Fi"],
    extraMoods: ["Moody", "Gritty"],
    cover: "https://picsum.photos/seed/southside-glow/200",
  },
];

/* ─── COMPONENT ─── */
export const DiscoverPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>("t1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/demo/search", { state: { query: searchQuery.trim() } });
    }
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      {/* ─── HEADER ─── */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-dm tracking-tight">
        Discover
      </h1>

      {/* ─── SEARCH BAR ─── */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/10 hover:border-white/20 transition-colors">
          <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">✦</span>
          </div>
          <input
            type="text"
            placeholder="Your next song is found when you type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none w-full"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <button type="button" className="text-white/50 hover:text-white/80 transition-colors">
              <Filter className="h-4 w-4" />
            </button>
            <button type="submit" className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* ─── TABLE ─── */}
      <div>
        {/* Table header */}
        <div className="grid grid-cols-[40px_48px_1fr_1fr_1fr_1fr_1fr_120px] gap-4 px-4 py-3 text-sm text-white/60 font-dm">
          <div>#</div>
          <div></div>
          <div>Title</div>
          <div>Artist</div>
          <div>Genre</div>
          <div>Mood</div>
          <div>Details</div>
          <div></div>
        </div>

        {/* Track rows */}
        <div className="space-y-2">
          {DISCOVER_TRACKS.map((track, index) => {
            const isExpanded = expandedTrackId === track.id;
            const isFirst = index === 0;

            return (
              <div
                key={track.id}
                onClick={() => setExpandedTrackId(isExpanded ? null : track.id)}
                className={`rounded-lg border px-4 py-3 transition cursor-pointer ${
                  isFirst
                    ? "border-white/20 bg-black/40 shadow-[0_0_22px_rgba(0,0,0,0.35)]"
                    : "border-blue-500/30 bg-blue-900/10 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                } hover:bg-white/5`}
              >
                {/* Main row */}
                <div className="grid grid-cols-[40px_48px_1fr_1fr_1fr_1fr_1fr_120px] gap-4 items-center">
                  <div className="text-white/80 font-dm">{index + 1}</div>
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="h-10 w-10 rounded object-cover flex-shrink-0"
                  />
                  <div className="text-white text-sm font-medium truncate">{track.title}</div>
                  <div className="text-white/80 text-sm truncate">{track.artist}</div>
                  <div className="text-white/80 text-sm truncate">{track.genre}</div>
                  <div className="text-white/80 text-sm truncate">{track.mood}</div>
                  {/* Details */}
                  <div className="text-white text-sm space-y-1">
                    <div>{track.bpm} BPM</div>
                    <div>{track.key}</div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-white/60 text-xs">
                      {isExpanded ? "See Less" : "See more.."}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedTrackId(isExpanded ? null : track.id);
                      }}
                      className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? (
                        <Minus className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 grid grid-cols-[40px_48px_1fr_1fr_1fr_1fr_1fr_120px] gap-4 px-1 text-sm text-white items-start">
                    <div />
                    <div />
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">ISWC</div>
                        <div className="font-dm font-bold">{track.iswc}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">ISRC</div>
                        <div className="font-dm font-bold">{track.isrc}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">Writers/Composers</div>
                      {track.writers.map((writer) => (
                        <div key={writer} className="font-bold">{writer}</div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">Genre</div>
                      {track.extraGenres.map((genre) => (
                        <div key={genre}>{genre}</div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.2em] text-white/40">Mood</div>
                      {track.extraMoods.map((mood) => (
                        <div key={mood}>{mood}</div>
                      ))}
                    </div>
                    {/* Prices */}
                    <div className="flex flex-col gap-2">
                      <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 rounded border border-white/20 bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors">
                        30 Seconds
                      </button>
                      <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 rounded border border-white/20 bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors">
                        1 Minute
                      </button>
                      <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 rounded border border-white/20 bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors">
                        Contact Sales
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 rounded border border-purple-400/40 bg-purple-600/30 text-white text-xs font-medium hover:bg-purple-600/50 transition-colors flex items-center justify-center gap-1.5">
                        <ShoppingCart className="h-3 w-3" />
                        Add to Cart
                      </button>
                      <button onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 rounded border border-purple-400/60 bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors">
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
