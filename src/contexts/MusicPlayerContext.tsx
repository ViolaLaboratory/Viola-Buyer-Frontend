import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export interface Song {
  id: number | string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  audioUrl?: string;
  thumbnail?: string;
  genre?: string[];
  mood?: string[];
  keywords?: string[];
  producer?: string;
  writer?: string;
  key?: string;
  tempo?: string;
  licensing?: string;
}

interface MusicPlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song, queue?: Song[]) => void;
  loadSong: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  addToQueue: (song: Song) => void;
  clearQueue: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSongRef = useRef<Song | null>(null);
  const isPlayingRef = useRef(false);
  const fallbackTriedRef = useRef(false);

  const getFallbackAudioUrl = (songId: number | string) => {
    const raw = String(songId ?? "");
    const numericFromId = Number(raw);
    const extracted = Number.isFinite(numericFromId)
      ? numericFromId
      : Number((raw.match(/\d+/)?.[0] ?? "1"));
    const safeId = Number.isFinite(extracted) && extracted > 0 ? extracted : 1;
    return `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(safeId % 10) + 1}.mp3`;
  };

  const getPlayableAudioUrl = (song: Song) => {
    const url = (song.audioUrl || "").trim();
    if (url) return url;
    return getFallbackAudioUrl(song.id);
  };

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        nextTrack();
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        const song = currentSongRef.current;
        if (!audioRef.current || !song) {
          setIsPlaying(false);
          return;
        }

        // If primary source fails, retry once with a known public sample source.
        if (!fallbackTriedRef.current) {
          fallbackTriedRef.current = true;
          const fallbackUrl = getFallbackAudioUrl(song.id);
          audioRef.current.src = fallbackUrl;
          audioRef.current.load();
          if (isPlayingRef.current) {
            audioRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch((fallbackErr) => {
              console.error('Fallback audio play failed:', fallbackErr);
              setIsPlaying(false);
            });
          }
          return;
        }

        setIsPlaying(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadSong = (song: Song, newQueue?: Song[]) => {
    // If a queue is provided, use it; otherwise, add to existing queue
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
    } else if (!queue.find(s => s.id === song.id)) {
      setQueue(prev => [...prev, song]);
    }

    setCurrentSong(song);
    fallbackTriedRef.current = false;
    
    const audioUrl = getPlayableAudioUrl(song);
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      // Don't auto-play - just load the song
      setIsPlaying(false);
    }
  };

  const playSong = (song: Song, newQueue?: Song[]) => {
    // Load the song first
    loadSong(song, newQueue);
    
    // Then start playing
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing audio:', error);
        // If backend audio URL fails, retry once with stable public fallback.
        if (audioRef.current) {
          const fallbackUrl = getFallbackAudioUrl(song.id);
          if (audioRef.current.src !== fallbackUrl) {
            fallbackTriedRef.current = true;
            audioRef.current.src = fallbackUrl;
            audioRef.current.load();
            audioRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch((fallbackError) => {
              console.error('Fallback audio failed:', fallbackError);
              setIsPlaying(false);
            });
            return;
          }
        }
        setIsPlaying(false);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error resuming audio:', error);
      });
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const nextTrack = () => {
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextSong = queue[nextIndex];
    
    if (nextSong) {
      playSong(nextSong);
    }
  };

  const previousTrack = () => {
    if (!currentSong || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    const prevSong = queue[prevIndex];
    
    if (prevSong) {
      playSong(prevSong);
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentSong(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
  };

  const value: MusicPlayerContextType = {
    currentSong,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    playSong,
    loadSong,
    pause,
    resume,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    seekTo,
    addToQueue,
    clearQueue,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
