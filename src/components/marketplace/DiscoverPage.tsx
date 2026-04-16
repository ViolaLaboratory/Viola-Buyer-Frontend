/**
 * DiscoverPage Component
 * Full-page discover view for sync-ready tracks.
 * Accessible from Marketplace "See All" on the Discover Sync Ready Tracks section.
 */

import { useState, useEffect, useCallback } from "react";
import { Filter, ArrowUp, Plus, Minus, ShoppingCart, X, Play, Pause, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "@/config/api";
import { useMusicPlayer, type Song } from "@/contexts/MusicPlayerContext";
import { useToast } from "@/hooks/use-toast";
import { addCartItem, hasTrackInCart, type CartPriceOption } from "@/services/cartService";

/* ─── TYPES ─── */
interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  mood: string;
  duration: string;
  bpm: number | null;
  key: string | null;
  iswc: string | null;
  isrc: string | null;
  writers: string[];
  extraGenres: string[];
  extraMoods: string[];
  cover: string;
  audioUrl?: string;
}

interface DiscoverApiRow {
  id: string | number;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  mood: string;
  duration: string;
  bpm: number | null;
  key: string | null;
  iswc: string | null;
  isrc: string | null;
  writers: string[];
  extra_genres: string[];
  extra_moods: string[];
  thumbnail: string;
  audio_url?: string;
}

function resolveCover(id: string, thumbnail?: string): string {
  const t = thumbnail?.trim();
  if (t && t.startsWith("http")) return t;
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/200`;
}

function normalizeGenre(g: string): string {
  if (!g || /^undefined$/i.test(g)) return "Unknown";
  return g;
}

function mapRowToTrack(row: DiscoverApiRow): DiscoverTrack {
  const id = String(row.id);
  return {
    id,
    title: row.title || "Unknown Title",
    artist: row.artist || "Unknown Artist",
    album: row.album,
    genre: normalizeGenre(row.genre || ""),
    mood: row.mood || "N/A",
    duration: row.duration || "0:00",
    bpm: row.bpm ?? null,
    key: row.key ?? null,
    iswc: row.iswc ?? null,
    isrc: row.isrc ?? null,
    writers: Array.isArray(row.writers) ? row.writers : [],
    extraGenres: Array.isArray(row.extra_genres) ? row.extra_genres : [],
    extraMoods: Array.isArray(row.extra_moods) ? row.extra_moods : [],
    cover: resolveCover(id, row.thumbnail),
    audioUrl: row.audio_url,
  };
}

function trackToSong(t: DiscoverTrack): Song {
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    album: t.album,
    duration: t.duration,
    audioUrl: t.audioUrl,
    thumbnail: t.cover,
  };
}

/* ─── COMPONENT ─── */
export const DiscoverPage = () => {
  const navigate = useNavigate();
  const { playSong, loadSong, pause, isPlaying, currentSong } = useMusicPlayer();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<DiscoverTrack[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [pricingTrack, setPricingTrack] = useState<DiscoverTrack | null>(null);
  const [selectedPrices, setSelectedPrices] = useState<Record<string, string>>({});
  const [modalSelection, setModalSelection] = useState<string | null>(null);

  const fetchDiscoverTracks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(API_ENDPOINTS.DISCOVER_TRACKS(1, 500), {
        cache: "no-store",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const rows: DiscoverApiRow[] = data.results ?? [];
      const next = rows.map(mapRowToTrack);
      setTracks(next);
      setExpandedTrackId((prev) => {
        if (prev && next.some((t) => t.id === prev)) return prev;
        return next[0]?.id ?? null;
      });
    } catch (e) {
      console.error("Discover tracks fetch failed:", e);
      setLoadError("Could not load tracks. Check MongoDB settings and try again.");
      setTracks([]);
      setExpandedTrackId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscoverTracks();
  }, [fetchDiscoverTracks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/demo/search", { state: { query: searchQuery.trim() } });
    }
  };

  const handleCoverPlayClick = (e: React.MouseEvent, track: DiscoverTrack) => {
    e.stopPropagation();
    const song = trackToSong(track);
    const queue = tracks.map(trackToSong);
    if (currentSong?.id === track.id && isPlaying) {
      pause();
    } else {
      playSong(song, queue);
    }
  };

  const isTrackPlaying = (trackId: string) => currentSong?.id === trackId && isPlaying;
  const getSelectedPriceOption = (trackId: string): CartPriceOption => {
    const selected = selectedPrices[trackId];
    if (selected === "30s · $1,200") return "30_sec";
    if (selected === "Contact Sales") return "contact_sales";
    return "1_min";
  };

  const getPriceAmount = (priceOption: CartPriceOption): number => {
    if (priceOption === "30_sec") return 1200;
    if (priceOption === "contact_sales") return 0;
    return 1800;
  };

  const getPriceLabel = (priceOption: CartPriceOption): string => {
    if (priceOption === "30_sec") return "30 Seconds";
    if (priceOption === "contact_sales") return "Contact Sales";
    return "1 Minute";
  };

  const addTrackToCart = async (track: DiscoverTrack) => {
    const alreadyInCart = await hasTrackInCart(String(track.id));
    if (alreadyInCart) {
      return { added: false as const };
    }

    const selected = getSelectedPriceOption(track.id);
    await addCartItem({
      track_id: String(track.id),
      title: track.title,
      artist: track.artist,
      price_option: selected,
      unit_price: getPriceAmount(selected),
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${track.title} (${getPriceLabel(selected)})`,
    });
    return { added: true as const };
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      {/* ─── HEADER ─── */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-dm tracking-tight">
        Discover
      </h1>

      {loadError && (
        <p className="text-sm text-amber-200/90 font-dm">{loadError}</p>
      )}

      {/* ─── SEARCH BAR ─── */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/10 hover:border-white/20 transition-colors">
          <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">{"\u2726"}</span>
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

        {loading && (
          <div className="px-4 py-8 text-white/50 text-sm font-dm">Loading tracks…</div>
        )}

        {/* Track rows */}
        {!loading && tracks.length === 0 && !loadError && (
          <div className="px-4 py-8 text-white/50 text-sm font-dm">No sync-ready tracks found.</div>
        )}

        <div className="space-y-2">
          {!loading &&
            tracks.map((track, index) => {
            const isExpanded = expandedTrackId === track.id;
            const isFirst = index === 0;

            return (
              <div
                key={track.id}
                onClick={() => {
                  const selectedSong = trackToSong(track);
                  const queue = tracks.map(trackToSong);
                  loadSong(selectedSong, queue);
                  setExpandedTrackId(isExpanded ? null : track.id);
                }}
                className={`relative rounded-lg border px-4 py-3 transition cursor-pointer ${
                  isFirst
                    ? "border-white/20 bg-black/40 shadow-[0_0_22px_rgba(0,0,0,0.35)]"
                    : "border-blue-500/30 bg-blue-900/10 shadow-[0_0_12px_rgba(59,130,246,0.1)]"
                } hover:bg-white/5`}
              >
                {/* Main row */}
                <div className="grid grid-cols-[40px_48px_1fr_1fr_1fr_1fr_1fr_1fr_100px] gap-3 items-center">
                  <div className="text-white/80 font-dm">{index + 1}</div>
                  <div
                    className="relative h-10 w-10 flex-shrink-0 group/cover"
                    onClick={(e) => handleCoverPlayClick(e, track)}
                  >
                    <img
                      src={track.cover}
                      alt={track.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className={`absolute inset-0 rounded flex items-center justify-center transition-opacity ${
                      isTrackPlaying(track.id) ? "bg-black/50 opacity-100" : "bg-black/40 opacity-0 group-hover/cover:opacity-100"
                    }`}>
                      {isTrackPlaying(track.id) ? (
                        <Pause className="h-4 w-4 text-white" fill="white" />
                      ) : (
                        <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                      )}
                    </div>
                  </div>
                  <div className="text-white text-sm font-medium truncate">{track.title}</div>
                  <div className="text-white/80 text-sm truncate">{track.artist}</div>
                  <div className="text-white/80 text-sm truncate">{track.genre}</div>
                  <div className="text-white/80 text-sm truncate">{track.mood}</div>
                  {/* Details */}
                  <div className="text-white text-sm space-y-1">
                    <div>{track.bpm != null && track.bpm > 0 ? `${track.bpm} BPM` : "—"}</div>
                    <div>{track.key || "—"}</div>
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
                          <div className="font-dm font-bold">{track.iswc || "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mt-2">ISRC</div>
                          <div className="font-dm font-bold">{track.isrc || "—"}</div>
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Writers/Composers</div>
                        {track.writers.length > 0 ? (
                          track.writers.map((writer) => (
                            <div key={writer} className="font-bold">{writer}</div>
                          ))
                        ) : (
                          <div className="font-dm text-white/50">—</div>
                        )}
                      </div>
                      {/* Other Genre — under Genre column */}
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Other Genre</div>
                        {track.extraGenres.length > 0 ? (
                          track.extraGenres.map((genre) => (
                            <div key={genre}>{genre}</div>
                          ))
                        ) : (
                          <div className="text-white/50">—</div>
                        )}
                      </div>
                      {/* Other Mood — under Mood column */}
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">Other Mood</div>
                        {track.extraMoods.length > 0 ? (
                          track.extraMoods.map((mood) => (
                            <div key={mood}>{mood}</div>
                          ))
                        ) : (
                          <div className="text-white/50">—</div>
                        )}
                      </div>
                      {/* Empty under Details */}
                      <div />
                      {/* Add to Cart / Checkout — under Prices */}
                      <div className="flex flex-col gap-1.5 pt-4">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const result = await addTrackToCart(track);
                              if (!result.added) {
                                toast({
                                  title: (
                                    <span className="flex items-center gap-2 text-red-500">
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                      <span>Already in Cart</span>
                                    </span>
                                  ),
                                  description: `${track.title} is already in your cart.`,
                                });
                              }
                            } catch {
                              toast({
                                title: "Failed to add to cart",
                                description: "Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="w-full px-3 py-1.5 rounded border border-purple-400/40 bg-purple-600/30 text-white text-xs font-medium hover:bg-purple-600/50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Add to Cart
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const result = await addTrackToCart(track);
                              if (!result.added) {
                                toast({
                                  title: (
                                    <span className="flex items-center gap-2 text-red-500">
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                      <span>Already in Cart</span>
                                    </span>
                                  ),
                                  description: `${track.title} is already in your cart.`,
                                });
                              }
                              navigate("/demo/checkout");
                            } catch {
                              toast({
                                title: "Checkout failed",
                                description: "Could not add track to cart.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="w-full px-3 py-1.5 rounded border border-purple-400/60 bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors text-center"
                        >
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
              {pricingTrack.genre} · {pricingTrack.duration}
              {pricingTrack.bpm != null && pricingTrack.bpm > 0 ? ` · BPM ${pricingTrack.bpm}` : ""}
            </p>

            {/* Price cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setModalSelection("30s · $1,200")}
                className={`border rounded-xl p-5 text-center transition-colors cursor-pointer ${
                  modalSelection === "30s · $1,200"
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/30"
                    : "border-gray-200 bg-gray-50/50 hover:bg-purple-50 hover:border-purple-300"
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
                    : "border-gray-200 bg-gray-50/50 hover:bg-purple-50 hover:border-purple-300"
                }`}
              >
                <div className="text-sm text-gray-500 mb-1">60 sec</div>
                <div className="text-2xl font-bold text-gray-900">$1,800</div>
              </button>
            </div>

            {/* Contact Sales */}
            <button className="w-full mt-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
              Contact Sales
            </button>

            {/* Confirm Price */}
            <button
              disabled={!modalSelection}
              onClick={() => {
                if (modalSelection && pricingTrack) {
                  setSelectedPrices((prev) => ({ ...prev, [pricingTrack.id]: modalSelection }));
                }
                setPricingTrack(null);
                setModalSelection(null);
              }}
              className={`w-full mt-3 py-3 rounded-xl font-medium transition-colors ${
                modalSelection
                  ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Price
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
