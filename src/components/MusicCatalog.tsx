import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUp, Play, Pause, Plus, Minus, Loader2, SkipBack, SkipForward, FilePlus, Upload, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import API_ENDPOINTS from "@/config/api";
import { useMusicPlayer, type Song as MusicPlayerSong } from "@/contexts/MusicPlayerContext";
import { useAuth } from "@/contexts/AuthContext";

const ACCEPTED_AUDIO = ".mp3,.wav,.m4a,.flac,.ogg,.aac";

interface Song {
  id: number | string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  licensing: string;
  duration: string;
  thumbnail: string;
  views?: string;
  audioUrl?: string;
}

interface BackendTrack {
  id?: number | string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  mood?: string;
  licensing?: string;
  duration?: string;
  thumbnail?: string;
  audio_url?: string;
}

interface CatalogResponse {
  results?: BackendTrack[];
  pagination?: {
    total_pages?: number;
  };
}

const detailVariants = [
  {
    iswc: "C0101010101",
    isrc: "HLBD35793507",
    writers: ["Jude Gabriel Kozielec", "Ryan Chan", "Kyung Tae Kim"],
    extraGenres: ["R&B", "Afro-Beat"],
    extraMoods: ["Playful", "Upbeat", "Soothing"],
  },
  {
    iswc: "C0202020202",
    isrc: "HLBD33591588",
    writers: ["Mina Park", "Damon Wu", "Clara Swift"],
    extraGenres: ["Pop", "Synthwave"],
    extraMoods: ["Moody", "Chill", "Focused"],
  },
  {
    iswc: "C0303030303",
    isrc: "HLBD28177421",
    writers: ["Andre Sol", "Mira Voss"],
    extraGenres: ["Indie", "Alt Rock"],
    extraMoods: ["Reflective", "Warm"],
  },
];

// Default/fallback songs
const defaultSongs: Song[] = [
  {
    id: 1,
    title: "new Phone, new Me",
    artist: "Neon District",
    album: "Chromatic Bloom",
    genre: "Pop",
    mood: "Upbeat",
    licensing: "Standard",
    duration: "2:09",
    thumbnail: "🎵",
    views: "524,424,511",
  },
  {
    id: 2,
    title: "Up the Score",
    artist: "Tidal Echo",
    album: "Heartline",
    genre: "Pop",
    mood: "Energetic",
    licensing: "Premium",
    duration: "2:30",
    thumbnail: "🎵",
    views: "10,117,807",
  },
  {
    id: 3,
    title: "Z Branch",
    artist: "City Lanterns",
    album: "After Hours",
    genre: "R&B",
    mood: "Chill",
    licensing: "Standard",
    duration: "2:34",
    thumbnail: "🎵",
    views: "5,938,875",
  },
  {
    id: 4,
    title: "Right Here",
    artist: "Blushing Violet",
    album: "Midnight Bloom",
    genre: "Hip Hop",
    mood: "Intense",
    licensing: "Premium",
    duration: "2:31",
    thumbnail: "🎵",
    views: "135,604,979",
  },
  {
    id: 5,
    title: "John Wick",
    artist: "Axiom Fields",
    album: "Nocturne Drive",
    genre: "Electronic",
    mood: "Dark",
    licensing: "Standard",
    duration: "2:34",
    thumbnail: "🎵",
    views: "2,966,803",
  },
  {
    id: 6,
    title: "Midnight Dreams",
    artist: "Nova Saffron",
    album: "Violet Echoes",
    genre: "Ambient",
    mood: "Relaxing",
    licensing: "Premium",
    duration: "3:15",
    thumbnail: "🎵",
  },
  {
    id: 7,
    title: "Electric Pulse",
    artist: "Phase Runner",
    album: "Circuit Bloom",
    genre: "EDM",
    mood: "Energetic",
    licensing: "Standard",
    duration: "2:45",
    thumbnail: "🎵",
  },
  {
    id: 8,
    title: "Summer Breeze",
    artist: "Golden Sands",
    album: "Evershine",
    genre: "Indie",
    mood: "Happy",
    licensing: "Premium",
    duration: "3:20",
    thumbnail: "🎵",
  },
  {
    id: 9,
    title: "Harbor Lights",
    artist: "Selene Ward",
    album: "Blue Harbour",
    genre: "Indie",
    mood: "Dreamy",
    licensing: "Standard",
    duration: "3:08",
    thumbnail: "🎵",
    views: "1,245,998",
  },
  {
    id: 10,
    title: "Carbon Pulse",
    artist: "Riot Satellite",
    album: "Neo Arc",
    genre: "Electronic",
    mood: "Hype",
    licensing: "Premium",
    duration: "2:57",
    thumbnail: "🎵",
    views: "22,110,543",
  },
  {
    id: 11,
    title: "Glasshouse",
    artist: "Lumen Choir",
    album: "Holographic Bloom",
    genre: "Alternative",
    mood: "Ethereal",
    licensing: "Standard",
    duration: "3:32",
    thumbnail: "🎵",
  },
  {
    id: 12,
    title: "Floodline",
    artist: "Compass North",
    album: "Greywater",
    genre: "Rock",
    mood: "Driving",
    licensing: "Standard",
    duration: "2:51",
    thumbnail: "🎵",
  },
  {
    id: 13,
    title: "Metallic Heart",
    artist: "Chrome Coral",
    album: "Pulse Engine",
    genre: "Synthwave",
    mood: "Moody",
    licensing: "Premium",
    duration: "3:04",
    thumbnail: "🎵",
  },
  {
    id: 14,
    title: "Dawn Patrol",
    artist: "Atlas Vega",
    album: "Skyline Shift",
    genre: "Ambient",
    mood: "Uplifting",
    licensing: "Standard",
    duration: "4:01",
    thumbnail: "🎵",
  },
  {
    id: 15,
    title: "Mercury Bloom",
    artist: "Static Bloom",
    album: "Soft Voltage",
    genre: "Pop",
    mood: "Nostalgic",
    licensing: "Premium",
    duration: "3:18",
    thumbnail: "🎵",
  },
  {
    id: 16,
    title: "Silver Thread",
    artist: "Emberline",
    album: "Handwritten Notes",
    genre: "Folk",
    mood: "Warm",
    licensing: "Standard",
    duration: "3:40",
    thumbnail: "🎵",
  },
  {
    id: 17,
    title: "Rose Quartz Run",
    artist: "Muse District",
    album: "Velvet Traces",
    genre: "R&B",
    mood: "Seductive",
    licensing: "Premium",
    duration: "2:48",
    thumbnail: "🎵",
  },
  {
    id: 18,
    title: "Night Swim",
    artist: "Hollow Isles",
    album: "Blue Static",
    genre: "Indie",
    mood: "Introspective",
    licensing: "Standard",
    duration: "3:26",
    thumbnail: "🎵",
  },
  {
    id: 19,
    title: "Ghost Metric",
    artist: "Vapor Scout",
    album: "Prism Ghosts",
    genre: "Electronic",
    mood: "Mysterious",
    licensing: "Premium",
    duration: "3:11",
    thumbnail: "🎵",
  },
  {
    id: 20,
    title: "Satellite Bloom",
    artist: "Lunar Pines",
    album: "Signal Fires",
    genre: "Alternative",
    mood: "Expansive",
    licensing: "Standard",
    duration: "4:12",
    thumbnail: "🎵",
  },
  {
    id: 21,
    title: "Crimson Paper",
    artist: "The Civic",
    album: "Letters West",
    genre: "Rock",
    mood: "Anthemic",
    licensing: "Premium",
    duration: "3:44",
    thumbnail: "🎵",
  },
  {
    id: 22,
    title: "Ivory Circuit",
    artist: "Magnet Juno",
    album: "Orbit Field",
    genre: "EDM",
    mood: "Pulsing",
    licensing: "Standard",
    duration: "2:55",
    thumbnail: "🎵",
  },
  {
    id: 23,
    title: "Paper Lantern Wolves",
    artist: "June Monsoon",
    album: "Night Market",
    genre: "Indie",
    mood: "Playful",
    licensing: "Premium",
    duration: "3:05",
    thumbnail: "🎵",
  },
  {
    id: 24,
    title: "Fever Coast",
    artist: "Desert Bloom",
    album: "Mirage Diaries",
    genre: "Pop",
    mood: "Sultry",
    licensing: "Standard",
    duration: "2:59",
    thumbnail: "🎵",
  },
  {
    id: 25,
    title: "Cerulean Static",
    artist: "Polar Isles",
    album: "Crystal Archive",
    genre: "Ambient",
    mood: "Glacial",
    licensing: "Premium",
    duration: "4:18",
    thumbnail: "🎵",
  },
  {
    id: 26,
    title: "Voltage Bloom",
    artist: "Phase Garden",
    album: "Neon Roots",
    genre: "Electronic",
    mood: "Driving",
    licensing: "Standard",
    duration: "3:00",
    thumbnail: "🎵",
  },
  {
    id: 27,
    title: "Sable Skyline",
    artist: "Echo Harbor",
    album: "Anthracite",
    genre: "Alternative",
    mood: "Brooding",
    licensing: "Premium",
    duration: "3:29",
    thumbnail: "🎵",
  },
  {
    id: 28,
    title: "Sunset Static",
    artist: "Pacific Relay",
    album: "Signal Orange",
    genre: "Indie",
    mood: "Carefree",
    licensing: "Standard",
    duration: "3:14",
    thumbnail: "🎵",
  },
  {
    id: 29,
    title: "Monochrome Bloom",
    artist: "Retro Courier",
    album: "Analog Atlas",
    genre: "Synthwave",
    mood: "Cinematic",
    licensing: "Premium",
    duration: "3:47",
    thumbnail: "🎵",
  },
  {
    id: 30,
    title: "Drift Theory",
    artist: "Cascade 94",
    album: "Outer Bloom",
    genre: "Ambient",
    mood: "Serene",
    licensing: "Standard",
    duration: "4:26",
    thumbnail: "🎵",
  },
];

export const MusicCatalog = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedSongId, setExpandedSongId] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [songDurations, setSongDurations] = useState<Record<string, string>>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ uploaded: number; errors?: { file: string; error: string }[] } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 30; // Show 30 songs per page in the catalog

  // Same audio URL logic as MusicPlayerContext so preloaded duration matches player bar
  const getAudioUrlForSong = (song: Song): string =>
    song.audioUrl ||
    `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(typeof song.id === "number" ? song.id : 0) % 10 + 1}.mp3`;
  
  /* Music Player Integration */
  const { loadSong } = useMusicPlayer();
  const { isAuthenticated } = useAuth();

  // Preload audio metadata for current page songs so catalog duration matches player bar
  useEffect(() => {
    songs.forEach((song) => {
      const key = String(song.id);
      if (songDurations[key] != null || !song.id) return;
      const audio = new Audio();
      const audioUrl = getAudioUrlForSong(song);
      audio.addEventListener("loadedmetadata", () => {
        const sec = audio.duration;
        if (sec > 0 && isFinite(sec)) {
          const m = Math.floor(sec / 60);
          const s = Math.floor(sec % 60);
          setSongDurations((prev) => ({
            ...prev,
            [key]: `${m}:${s.toString().padStart(2, "0")}`,
          }));
        }
        audio.src = "";
        audio.load();
      });
      audio.addEventListener("error", () => {
        audio.src = "";
        audio.load();
      });
      audio.src = audioUrl;
      audio.load();
    });
  }, [songs]);

  // Load songs from MongoDB backend API with pagination and optional search (title, genre, mood)
  const loadSongsFromBackend = useCallback(async (page: number = 1, q: string = "") => {
    try {
      const response = await fetch(API_ENDPOINTS.SONGS_LIST(page, pageSize, q || undefined), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CatalogResponse = await response.json();
      const fetchedTracks = data.results ?? [];
      const pagination = data.pagination ?? {};

      const catalogSongs: Song[] = fetchedTracks.map((track) => {
        const songId = track.id ?? "0";
        const id = typeof songId === "string" && (songId.startsWith("upload_") || isNaN(parseInt(songId, 10)))
          ? songId
          : (typeof songId === "string" ? parseInt(songId, 10) || 0 : songId);

        return {
          id,
          title: track.title || "Unknown Title",
          artist: track.artist || "Unknown Artist",
          album: track.album || "Unknown Album",
          genre: track.genre || "Unknown",
          mood: track.mood || "Unknown",
          licensing: track.licensing || "Standard",
          duration: track.duration || "0:00",
          thumbnail: track.thumbnail || "🎵",
          audioUrl: track.audio_url,
        };
      });

      // Replace current page of songs
      setSongs(catalogSongs);

      // Use pagination info from backend when available
      const totalPagesCount = pagination.total_pages || page;
      setTotalPages(totalPagesCount);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error loading from backend:', error);
      return false;
    }
  }, [pageSize]);

  const loadSongs = useCallback(async (page: number = 1, append: boolean = false, search: string = "") => {
    setIsLoading(true);
    setError(null);
    // Demo mode: not logged in → use defaultSongs only, no API
    if (!isAuthenticated) {
      const q = typeof search === "string" ? search.trim().toLowerCase() : "";
      const filtered = q
        ? defaultSongs.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.artist.toLowerCase().includes(q) ||
              s.genre.toLowerCase().includes(q) ||
              s.mood.toLowerCase().includes(q)
          )
        : defaultSongs;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);
      setSongs(paginated);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
      setIsLoading(false);
      return;
    }
    const q = typeof search === "string" ? search : "";
    const success = await loadSongsFromBackend(page, q);
    if (!success && !append) {
      setSongs([]);
      setError(
        'We couldn\'t load the catalog right now. Please try again in a moment.'
      );
    }
    setIsLoading(false);
  }, [loadSongsFromBackend, isAuthenticated, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadSongs(1, false, searchQuery.trim());
  };

  const handleUploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) =>
      /\.(mp3|wav|m4a|flac|ogg|aac)$/i.test(f.name)
    );
    if (fileList.length === 0) {
      setUploadResult({ uploaded: 0, errors: [{ file: "", error: "Supported formats: MP3, WAV, M4A, FLAC, OGG, AAC" }] });
      return;
    }
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    fileList.forEach((f) => formData.append("files", f));
    try {
      const res = await fetch(API_ENDPOINTS.SONGS_UPLOAD, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadResult({ uploaded: data.uploaded ?? fileList.length, errors: data.errors ?? undefined });
        if ((data.uploaded ?? 0) > 0) {
          setCurrentPage(1);
          loadSongs(1, false, searchQuery.trim());
        }
      } else {
        setUploadResult({ uploaded: 0, errors: [{ file: "", error: data.error || "Upload failed" }] });
      }
    } catch (e) {
      setUploadResult({ uploaded: 0, errors: [{ file: "", error: "Failed to connect to server" }] });
    } finally {
      setUploading(false);
    }
  }, [currentPage, searchQuery, loadSongs]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (uploading) return;
      handleUploadFiles(e.dataTransfer.files);
    },
    [uploading, handleUploadFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const openFilePicker = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  useEffect(() => {
    loadSongs(1, false, "");
  }, [loadSongs]);

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isLoading) {
      return;
    }
    setCurrentPage(page);
    loadSongs(page, false, searchQuery.trim());
  };

  const getPageNumbers = () => {
    const maxVisible = 7;
    let start = Math.max(1, currentPage - 3);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section className="w-full h-full min-h-0 text-white font-exo">
      <div className="h-full min-h-0 w-full px-10 py-8 flex flex-col">
        <div className="mt-6 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-between gap-6 rounded-full border border-white/30 bg-black/40 px-6 py-3 shadow-[inset_0_0_24px_rgba(255,255,255,0.08)] flex-1 min-w-0 max-w-[calc(100%-4rem)]">
              <div className="flex items-center gap-4 text-white/70 flex-1 min-w-0">
                <img src="/flower.png" alt="Search" className="h-5 w-5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by song name, genre, or mood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm"
                  aria-label="Search catalog by title, genre, or mood"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 hover:opacity-90 disabled:opacity-50 transition-opacity"
                aria-label="Search"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            {isAuthenticated && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex-shrink-0 w-[calc(2.5rem+0.75rem*2)] h-[calc(2.5rem+0.75rem*2)] rounded-full border border-white/30 bg-black/40 flex items-center justify-center text-white/90 hover:bg-white/10 hover:border-white/50 transition-colors shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]"
                      aria-label="Add Songs to Catalogue"
                      onClick={() => { setUploadResult(null); setUploadDialogOpen(true); }}
                    >
                      <FilePlus className="h-6 w-6 flex-shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover text-popover-foreground">
                    Add Songs to Catalogue
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
              <p className="ml-3">Loading catalog...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-red-300 mb-4 text-center">{error}</p>
              <Button
                onClick={() => loadSongs(1, false, searchQuery.trim())}
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Retry
              </Button>
            </div>
          ) : songs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <p className="text-white/60 mb-2">No songs found.</p>
              <p className="text-white/40 text-sm max-w-md">
                The catalog may be temporarily unavailable. Please try again in a moment.
              </p>
              <Button
                onClick={() => loadSongs(1, false, searchQuery.trim())}
                variant="outline"
                className="mt-4 bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-[60px_90px_1fr_1fr_1fr_140px_140px_120px_120px] gap-4 px-2 text-sm text-white font-dm">
                <div>#</div>
                <div></div>
                <div>Title</div>
                <div>Artist</div>
                <div>Album</div>
                <div className="">Genre</div>
                <div className="">Mood</div>
                <div className="">Duration</div>
                <div className="">Details</div>
              </div>

              <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-2 space-y-3">
                {songs.map((song, index) => {
                  const detail = detailVariants[index % detailVariants.length];
                  const rowId = song.id || index + 1;
                  const isExpanded = expandedSongId === rowId;

                  const handleSongClick = () => {
                    const musicPlayerSong: MusicPlayerSong = {
                      id: song.id,
                      title: song.title,
                      artist: song.artist,
                      album: song.album,
                      duration: song.duration,
                      keywords: song.genre ? [song.genre] : [],
                      thumbnail: song.thumbnail,
                      audioUrl: song.audioUrl,
                    };
                    const queue: MusicPlayerSong[] = songs.map((s) => ({
                      id: s.id,
                      title: s.title,
                      artist: s.artist,
                      album: s.album,
                      duration: s.duration,
                      keywords: s.genre ? [s.genre] : [],
                      thumbnail: s.thumbnail,
                      audioUrl: s.audioUrl,
                    }));
                    
                    // Load the selected song with the queue (but don't auto-play)
                    loadSong(musicPlayerSong, queue);
                  };

                  return (
                    <div
                      key={rowId}
                      className="rounded-xl border border-white/20 bg-black/40 px-4 py-3 shadow-[0_0_22px_rgba(0,0,0,0.35)] transition cursor-pointer hover:bg-white/5"
                      onClick={handleSongClick}
                    >
                      <div className="grid grid-cols-[60px_90px_1fr_1fr_1fr_140px_140px_120px_120px] gap-2 items-center">
                        <div className="text-white/80 font-dm">
                          {(currentPage - 1) * pageSize + index + 1}
                        </div>
                        <div className="h-12 w-12 rounded-md overflow-hidden shrink-0 bg-white">
                          <img
                            src={song.thumbnail && song.thumbnail !== "🎵" ? song.thumbnail : "/NoteAlbumArt.png"}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (e.currentTarget.src !== "/NoteAlbumArt.png") {
                                e.currentTarget.src = "/NoteAlbumArt.png";
                              }
                            }}
                          />
                        </div>
                        <div className="text-white min-w-0 truncate" title={song.title}>{song.title}</div>
                        <div className="text-white/80 min-w-0 truncate">{song.artist}</div>
                        <div className="text-white/80 min-w-0 truncate">{song.album}</div>
                        <div className="text-white/80 min-w-0 truncate">{song.genre}</div>
                        <div className="text-white/80 min-w-0 truncate max-w-[140px]" title={song.mood}>{song.mood || "—"}</div>
                        <div className="text-white/80 font-dm tabular-nums min-w-[4rem]">{songDurations[String(song.id)] ?? song.duration}</div>
                        <div className="flex items-center justify-center gap-3 text-sm text-white/70 min-w-[120px] shrink-0">
                          <span>{isExpanded ? "Collapse" : "See more..."}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent song click when clicking expand button
                              setExpandedSongId(isExpanded ? null : rowId);
                            }}
                            className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center"
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

                      {isExpanded && (
                        <div className="mt-4 grid grid-cols-[60px_90px_1fr_1fr_1fr_140px_140px_120px_120px] gap-4 px-1 text-sm text-white/70">
                          <div />
                          <div />
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-white/40">ISWC</div>
                              <div className="text-white font-dm">{detail.iswc}</div>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-white/40">ISRC</div>
                              <div className="text-white font-dm">{detail.isrc}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs uppercase tracking-[0.2em] text-white/40">Writers/Composers</div>
                            {detail.writers.map((writer) => (
                              <div key={writer} className="text-white">
                                {writer}
                              </div>
                            ))}
                          </div>
                          <div />
                          <div className="space-y-2 text-center">
                            {detail.extraGenres.map((genre) => (
                              <div key={genre} className="text-white">
                                {genre}
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2 text-center">
                            {detail.extraMoods.map((mood) => (
                              <div key={mood} className="text-white">
                                {mood}
                              </div>
                            ))}
                          </div>
                          <div />
                          <div />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/60">
                <span>
                  Page {currentPage} of {totalPages} • Showing {songs.length} songs per page
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-40"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    ‹
                  </Button>
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 rounded-full px-0 ${
                        page === currentPage
                          ? "bg-white text-black border-transparent"
                          : "bg-transparent border-white/20 text-white hover:bg-white/10"
                      }`}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-40"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    ›
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md bg-[#0d0d0d] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add songs to catalog</DialogTitle>
            <DialogDescription className="text-white/60">
              Select music files from your local device or drag them here to add to the catalog.
            </DialogDescription>
          </DialogHeader>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_AUDIO}
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) {
                handleUploadFiles(files);
                e.target.value = "";
              }
            }}
          />
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={openFilePicker}
            className={`
              mt-4 rounded-xl border-2 border-dashed px-8 py-12 cursor-pointer
              transition-colors flex flex-col items-center justify-center gap-3
              ${isDragOver ? "border-white/60 bg-white/10" : "border-white/30 bg-white/5 hover:bg-white/10"}
              ${uploading ? "pointer-events-none opacity-70" : ""}
            `}
          >
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-white/80" />
                <p className="text-white/80">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-white/60" />
                <p className="text-white/90 font-medium">Drag files here or click to select</p>
                <p className="text-sm text-white/50">MP3, WAV, M4A, FLAC, OGG, AAC</p>
              </>
            )}
          </div>
          {uploadResult && (
            <div className="mt-4 rounded-lg bg-white/5 px-4 py-3 text-sm">
              {uploadResult.uploaded > 0 && (
                <p className="text-green-400 flex items-center gap-2">
                  <Music2 className="h-4 w-4" />
                  {uploadResult.uploaded} song{uploadResult.uploaded !== 1 ? "s" : ""} added to catalog.
                </p>
              )}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2 text-amber-300">
                  {uploadResult.errors.map((err, i) => (
                    <p key={i}>
                      {err.file ? `${err.file}: ` : ""}{err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
