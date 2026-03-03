import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useEffect, useState } from "react";

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    seekTo,
  } = useMusicPlayer();

  const [sliderValue, setSliderValue] = useState([0]);
  const [albumArtError, setAlbumArtError] = useState(false);

  // Reset image error when song changes so we retry loading thumbnail
  useEffect(() => {
    setAlbumArtError(false);
  }, [currentSong?.id, currentSong?.thumbnail]);

  const showAlbumArtImage =
    currentSong?.thumbnail &&
    currentSong.thumbnail !== "🎵" &&
    !albumArtError;

  const albumPlaceholderLetter = currentSong?.title?.trim().charAt(0)?.toUpperCase() || "?";

  useEffect(() => {
    if (duration > 0) {
      setSliderValue([(currentTime / duration) * 100]);
    }
  }, [currentTime, duration]);

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seekTo(newTime);
    setSliderValue(value);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  if (!currentSong) {
    return null; // Don't render if no song is selected
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-border px-6 py-4 z-50">
      <div className="flex items-center justify-between gap-8">
        {/* Current Track Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
            {showAlbumArtImage ? (
              <img
                src={currentSong.thumbnail!}
                alt="Album Art"
                className="w-full h-full object-cover"
                onError={() => setAlbumArtError(true)}
              />
            ) : (
              <img
                src="/NoteAlbumArt.png"
                alt="Album Art"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-extrabold truncate font-dm">
              {currentSong.title}
            </span>
            <span className="text-muted-foreground text-sm truncate font-dm">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="transition all duration-300 h-8 w-8 hover:bg-[#E4EA04]/30"
              onClick={previousTrack}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="transition all duration-300 h-10 w-10 bg-[#E4EA04] hover:bg-[#E4EA04]/80 text-black rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5" fill="currentColor" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[#E4EA04]/40"
              onClick={nextTrack}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={sliderValue}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {currentSong?.duration || formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Additional Controls */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="transition all duration-300 h-8 w-8 text-[#E4EA04] hover:bg-[#E4EA04] hover:text-black"
          >
            <ListMusic className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
