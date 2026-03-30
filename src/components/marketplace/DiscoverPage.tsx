/**
 * DiscoverPage Component
 * Full-page discover view for sync-ready tracks.
 * Accessible from Marketplace "See All" on the Discover Sync Ready Tracks section.
 */

import { useState } from "react";
import { Search, Filter, ArrowUp, Plus, Minus, ShoppingCart, X } from "lucide-react";
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
  const [pricingTrack, setPricingTrack] = useState<DiscoverTrack | null>(null);
  const [selectedPrices, setSelectedPrices] = useState<Record<string, string>>({});
  const [modalSelection, setModalSelection] = useState<string | null>(null);

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
        <div className="grid grid-cols-[40px_48px_1fr_1fr_1fr_1fr_1fr_1fr_100px] gap-3 px-4 py-3 text-sm text-white/60 font-dm">
          <div>#</div>
          <div></div>
          <div>Title</div>
          <div>Artist</div>
          <div>Genre</div>
          <div>Mood</div>
          <div>Details</div>
          <div>Prices</div>
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
                className={`relative rounded-lg border px-4 py-3 transition cursor-pointer ${
                  isFirst
                    ? "border-white/20 bg-black/40 shadow-[0_0_22px_rgba(0,0,0,0.35)]"
                    : "border-blue-500/30 bg-blue-900/10 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                } hover:bg-white/5`}
              >
                {/* Main row */}
                <div className="grid grid-cols-[40px_48px_1fr_1fr_1fr_1fr_1fr_1fr_100px] gap-3 items-center">
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
                  {/* Prices */}
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPricingTrack(track);
                        setModalSelection(selectedPrices[track.id] || null);
                      }}
                      className={`px-4 py-1.5 rounded border text-xs font-medium transition-colors ${
                        selectedPrices[track.id]
                          ? "border-purple-400/40 bg-purple-600/30 text-white hover:bg-purple-600/50"
                          : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {selectedPrices[track.id] || "See Prices"}
                    </button>
                  </div>
                  {/* See more (only when collapsed) */}
                  {!isExpanded && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-white/60 text-xs">See more..</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTrackId(track.id);
                        }}
                        className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0"
                        aria-label="Expand"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {isExpanded && <div />}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="relative mt-6 text-sm text-white">
                    {/* See Less — top right corner */}
                    <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                      <span className="text-white/60 text-xs">See Less</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTrackId(null);
                        }}
                        className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0"
                        aria-label="Collapse"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-[40px_48px_1fr_1fr_1fr_1fr_1fr_1fr_100px] gap-3 items-start">
                      {/* Remaining details — pushed to left */}
                      <div className="col-span-2 space-y-2">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/40">ISWC</div>
                          <div className="font-dm font-bold">{track.iswc}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mt-2">ISRC</div>
                          <div className="font-dm font-bold">{track.isrc}</div>
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Writers/Composers</div>
                        {track.writers.map((writer) => (
                          <div key={writer} className="font-bold">{writer}</div>
                        ))}
                      </div>
                      {/* Other Genre — under Genre column */}
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Other Genre</div>
                        {track.extraGenres.map((genre) => (
                          <div key={genre}>{genre}</div>
                        ))}
                      </div>
                      {/* Other Mood — under Mood column */}
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Other Mood</div>
                        {track.extraMoods.map((mood) => (
                          <div key={mood}>{mood}</div>
                        ))}
                      </div>
                      {/* Empty under Details */}
                      <div />
                      {/* Add to Cart / Checkout — under Prices */}
                      <div className="flex flex-col gap-1.5 pt-4">
                        <button onClick={(e) => e.stopPropagation()} className="w-full px-3 py-1.5 rounded border border-purple-400/40 bg-purple-600/30 text-white text-xs font-medium hover:bg-purple-600/50 transition-colors flex items-center justify-center gap-1.5">
                          <ShoppingCart className="h-3 w-3" />
                          Add to Cart
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="w-full px-3 py-1.5 rounded border border-purple-400/60 bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors text-center">
                          Checkout
                        </button>
                      </div>
                      <div />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── PRICING MODAL ─── */}
      {pricingTrack && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (modalSelection && pricingTrack) {
              setSelectedPrices((prev) => ({ ...prev, [pricingTrack.id]: modalSelection }));
            }
            setPricingTrack(null);
            setModalSelection(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[460px] p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => {
                if (modalSelection && pricingTrack) {
                  setSelectedPrices((prev) => ({ ...prev, [pricingTrack.id]: modalSelection }));
                }
                setPricingTrack(null);
                setModalSelection(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Track info */}
            <h2 className="text-xl font-bold text-gray-900">{pricingTrack.title}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {pricingTrack.genre} · {pricingTrack.duration} · BPM {pricingTrack.bpm}
            </p>

            {/* Price cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setModalSelection("30s · $1,200")}
                className={`border rounded-xl p-5 text-center transition-colors cursor-pointer ${
                  modalSelection === "30s · $1,200"
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/30"
                    : "border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="text-sm text-gray-500 mb-1">30 sec</div>
                <div className="text-2xl font-bold text-gray-900">$1,200</div>
              </button>
              <button
                onClick={() => setModalSelection("60s · $1,800")}
                className={`border rounded-xl p-5 text-center transition-colors cursor-pointer ${
                  modalSelection === "60s · $1,800"
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/30"
                    : "border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="text-sm text-gray-500 mb-1">60 sec</div>
                <div className="text-2xl font-bold text-gray-900">$1,800</div>
              </button>
            </div>

            {/* Contact Sales */}
            <button className="w-full mt-4 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
