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
    
    // For demo purposes, we'll use a placeholder audio URL
    // In production, you'd get this from your backend
    const audioUrl = song.audioUrl || `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${song.id % 10 + 1}.mp3`;
    
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
        // If audio fails to load, still show the song as selected
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
