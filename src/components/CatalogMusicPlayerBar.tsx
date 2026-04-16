/**
 * Catalog/Pitch Kit 공통 하단 뮤직 플레이어바
 * body에 Portal로 렌더링하여 overflow 잘림 방지
 */

import { createPortal } from "react-dom";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

interface CatalogMusicPlayerBarProps {
  sidebarWidth: string;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const CatalogMusicPlayerBar = ({ sidebarWidth }: CatalogMusicPlayerBarProps) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
  } = useMusicPlayer();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!duration || !isFinite(duration) || duration <= 0) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = percentage * duration;
    seekTo(seekTime);
  };

  const playerEl = (
    <div
      className="fixed bottom-0 z-50 rounded-xl border border-white/25 bg-black/85 backdrop-blur-md px-6 py-3 shadow-[0_0_28px_rgba(0,0,0,0.6)] text-white"
      style={{ left: sidebarWidth, right: 0 }}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-white">
            <img
              src={currentSong?.thumbnail && currentSong.thumbnail !== "🎵" ? currentSong.thumbnail : "/NoteAlbumArt.png"}
              alt="Album art"
              className="w-full h-full object-cover"
              onError={(e) => {
                if (e.currentTarget.src !== "/NoteAlbumArt.png") {
                  e.currentTarget.src = "/NoteAlbumArt.png";
                }
              }}
            />
          </div>
          <div>
            <div className="font-dm">{currentSong?.title || "Song Title"}</div>
            <div className="text-white/60 text-sm font-exo">{currentSong?.artist || "Artist Name"}</div>
            <div className="text-white/60 text-sm font-exo">{currentSong?.album || "Album Name"}</div>
          </div>
        </div>
        <div className="flex-1 px-6 min-w-0">
          <div
            className="relative h-[3px] bg-white/20 rounded-full cursor-pointer group"
            onClick={currentSong ? handleProgressBarClick : undefined}
            title={currentSong ? "Click to seek" : undefined}
          >
            <div
              className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            {currentSong && (
              <div className="absolute inset-0 rounded-full group-hover:bg-white/10 transition-colors" />
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-white/60 mt-2 font-dm">
            <span>{currentSong ? formatTime(currentTime) : "0:00"}</span>
            <span>{currentSong ? (currentSong.duration || formatTime(duration) || "0:00") : "2:37"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={previousTrack}
            disabled={!currentSong}
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={togglePlayPause}
            disabled={!currentSong}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={nextTrack}
            disabled={!currentSong}
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Portal to body - overflow:hidden 부모에서 벗어나 잘림 방지
  return createPortal(playerEl, document.body);
};
