import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ChatPanel } from "@/components/search/ChatPanel";
import { ResultsPanel } from "@/components/search/ResultsPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PitchBuilder } from "./PitchBuilder"; // Import your existing PitchBuilder
import API_ENDPOINTS from "@/config/api";
import { fetchTrackDetailsFromMongoDB } from "@/services/trackService";
import {
  getFolders,
  addTracksToFolder,
  type Folder,
} from "@/services/folderService";
/* NEW IMPORT: Chat history service for session persistence */
import {
  saveChatSession,
  getChatSessionById,
  getChatSessionByIdOrBackend,
} from "@/services/chatHistoryService";
import { useMusicPlayer, type Song as MusicPlayerSong } from "@/contexts/MusicPlayerContext";
import { useAuth } from "@/contexts/AuthContext";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  keywords: string[];
  duration: string;
  genre?: string;
  mood?: string;
  producer?: string;
  writer?: string;
}

const mockSongs: Song[] = [
  {
    id: 1,
    title: "Into the Upside Down",
    artist: "Kyle Bobby Dunn",
    album: "Strange Atmospheres",

    keywords: ["Eerie", "Suspenseful", "Dark", "Atmospheric"],
    duration: "03:24",
  },
  {
    id: 2,
    title: "Forest of Shadows",
    artist: "Akira Yamaoka",
    album: "Silent Tracks",

    keywords: ["Horror", "Tension", "Mysterious", "Cinematic"],
    duration: "04:12",
  },
  {
    id: 3,
    title: "Moonlit Concrete",
    artist: "Midnight Highrise",
    album: "Grayscale Echoes",

    keywords: ["Eerie", "Industrial", "Pulse", "Noir"],
    duration: "03:12",
  },
  {
    id: 4,
    title: "Fog Ritual",
    artist: "Astra & The Veil",
    album: "Coven Choir",

    keywords: ["Choir", "Haunting", "Ambient", "Slow Burn"],
    duration: "04:05",
  },
  {
    id: 5,
    title: "Midnight Salt",
    artist: "Vox Meridian",
    album: "Glassheart",

    keywords: ["Darkwave", "Ethereal", "Cold", "Electronic"],
    duration: "03:58",
  },
  {
    id: 6,
    title: "Whispers in the Dark",
    artist: "Echo Chamber",
    album: "Nocturnal Visions",

    keywords: ["Ambient", "Mysterious", "Ethereal", "Dark"],
    duration: "04:32",
  },
  {
    id: 7,
    title: "Shadow Path",
    artist: "Luna Obscura",
    album: "Midnight Tales",

    keywords: ["Cinematic", "Tense", "Atmospheric", "Eerie"],
    duration: "05:18",
  },
  {
    id: 8,
    title: "The Hunt Begins",
    artist: "Thorn & Thistle",
    album: "Wilderness Calls",

    keywords: ["Suspenseful", "Dark", "Pulsing", "Intense"],
    duration: "03:47",
  },
  {
    id: 9,
    title: "Beneath the Canopy",
    artist: "Moss & Stone",
    album: "Forest Echoes",

    keywords: ["Natural", "Ambient", "Mysterious", "Organic"],
    duration: "04:56",
  },
  {
    id: 10,
    title: "Nightfall Pursuit",
    artist: "Crimson Veil",
    album: "Twilight Hours",

    keywords: ["Dark", "Urgent", "Cinematic", "Suspenseful"],
    duration: "03:41",
  },
];

const typingPhrases = [
  "spooky choirs...",
  "dark synths...",
  "a spicy melody...",
  "cinematic builds...",
];

const thinkingPhrases = [
  "humming along...",
  "arguing with managers...",
  "going for lunch...",
];

export const SearchInterface = () => {
  /* ROUTING HOOKS: For navigation and URL parameters */
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId?: string }>();
  const { toast } = useToast();

  /* STATE: Search and UI */
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPitchBuilder, setShowPitchBuilder] = useState(false);
  const [showPitchSelection, setShowPitchSelection] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<number>>(
    new Set()
  );
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  
  /* Music Player Integration */
  const { loadSong, isPlaying: playerIsPlaying, togglePlayPause, currentSong, clearQueue } = useMusicPlayer();
  const { isAuthenticated } = useAuth();

  /* STATE: Chat session management */
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; message: string }>
  >([]);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  /* STATE: Track current chat session ID for saving */
  const [currentChatSessionId, setCurrentChatSessionId] = useState<
    string | null
  >(null);

  /* EFFECT: Initialize session - handle resuming saved sessions or starting new ones */
  useEffect(() => {
    // Guest: never restore sessions - show empty search page
    if (!isAuthenticated) {
      if (urlSessionId) {
        navigate("/demo/search", { replace: true });
      }
      setSearchQuery("");
      setConversationHistory([]);
      setSearchResults([]);
      setShowResults(false);
      setSelectedSong(null);
      setCurrentChatSessionId(null);
      setHasSearched(false);
      setIsFirstMessage(true);
      setIsLoading(false);
      setWaitingForResponse(false);
      setChatMessage("Hi! Tell me what kind of music you'd like, and I'll help you find the perfect tracks.");
      localStorage.removeItem("viola_current_chat_session_id");
      setFolders(getFolders());
      return;
    }

    // CASE 1: Resuming a saved chat session from URL parameter (load from DB or local)
    if (urlSessionId) {
      getChatSessionByIdOrBackend(urlSessionId).then((savedSession) => {
        if (!savedSession) {
          toast({
            title: "Session not found",
            description: "Starting a new search session instead",
            variant: "destructive",
          });
          navigate("/demo/search", { replace: true });
          return;
        }
        // Restore chat session from history
        setCurrentChatSessionId(urlSessionId);
        // Store current chat session ID for restoration when navigating back
        localStorage.setItem("viola_current_chat_session_id", urlSessionId);
        setSessionId(savedSession.sessionId);
        setConversationHistory(savedSession.conversationHistory);
        setChatMessage(
          savedSession.conversationHistory[
            savedSession.conversationHistory.length - 1
          ]?.message || "Session resumed"
        );
        setHasSearched(true);
        setIsFirstMessage(false);

        // Restore search results if available
        if (savedSession.searchResults && savedSession.searchResults.length > 0) {
          setSearchResults(savedSession.searchResults);
          setShowResults(true);
          setHasSearched(true); // Ensure hasSearched is true to show results
          setIsLoading(false); // Ensure loading is false to show results
          setWaitingForResponse(false); // Ensure waiting state is cleared
          
          // Restore selected song if available, otherwise select first song
          if (savedSession.selectedSongId) {
            const restoredSong = savedSession.searchResults.find(
              song => song.id === savedSession.selectedSongId
            );
            if (restoredSong) {
              setSelectedSong(restoredSong);
              // Load the song into the music player (without playing)
              const musicPlayerSong = {
                id: restoredSong.id,
                title: restoredSong.title,
                artist: restoredSong.artist,
                album: restoredSong.album,
                duration: restoredSong.duration,
                keywords: restoredSong.keywords,
              };
              const queue = savedSession.searchResults.map(s => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: s.duration,
                keywords: s.keywords,
              }));
              loadSong(musicPlayerSong, queue);
            }
          } else if (savedSession.searchResults.length > 0) {
            // If no selected song, select the first one to show details
            const firstSong = savedSession.searchResults[0];
            setSelectedSong(firstSong);
            // Load the first song into the music player (without playing)
            const musicPlayerSong = {
              id: firstSong.id,
              title: firstSong.title,
              artist: firstSong.artist,
              album: firstSong.album,
              duration: firstSong.duration,
              keywords: firstSong.keywords,
            };
            const queue = savedSession.searchResults.map(s => ({
              id: s.id,
              title: s.title,
              artist: s.artist,
              album: s.album,
              duration: s.duration,
              keywords: s.keywords,
            }));
            loadSong(musicPlayerSong, queue);
          }
        } else {
          // Even if no search results, ensure showResults is false and loading is false
          setShowResults(false);
          setIsLoading(false);
          setWaitingForResponse(false);
        }

        toast({
          title: "Chat session resumed",
          description: `Conversation: "${savedSession.title}"`,
        });
      });
      return;
    }
    // CASE 2: Starting new session from HomePage (query in location.state)
    else if (location.state?.query) {
      const initialQuery = location.state.query;

      // Generate new session ID
      const newSessionId = crypto.randomUUID();
      localStorage.setItem("viola_session_id", newSessionId);
      setSessionId(newSessionId);

      // Set search query and trigger search automatically
      setSearchQuery(initialQuery);
      setIsFirstMessage(true);

      // Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });

      // Trigger search automatically (after a brief delay to ensure state is set)
      setTimeout(() => {
        const form = document.querySelector("form");
        if (form) {
          form.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
          );
        }
      }, 100);
    }
    // CASE 3: Regular new session or returning to Search page
    else {
      // Check if we have a current chat session ID to restore
      const storedChatSessionId = localStorage.getItem("viola_current_chat_session_id");
      if (storedChatSessionId) {
        const savedSession = getChatSessionById(storedChatSessionId);
        if (savedSession) {
          // Restore the current session
          setCurrentChatSessionId(storedChatSessionId);
          setSessionId(savedSession.sessionId);
          setConversationHistory(savedSession.conversationHistory);
          setChatMessage(
            savedSession.conversationHistory[
              savedSession.conversationHistory.length - 1
            ]?.message || "Session resumed"
          );
          setHasSearched(true);
          setIsFirstMessage(false);

          // Restore search results if available
          if (savedSession.searchResults && savedSession.searchResults.length > 0) {
            setSearchResults(savedSession.searchResults);
            setShowResults(true);
            setIsLoading(false);
            setWaitingForResponse(false);
            setHasSearched(true);
            
            // Restore selected song if available, otherwise select first song
            if (savedSession.selectedSongId) {
              const restoredSong = savedSession.searchResults.find(
                song => song.id === savedSession.selectedSongId
              );
              if (restoredSong) {
                setSelectedSong(restoredSong);
                // Load the song into the music player (without playing)
                const musicPlayerSong = {
                  id: restoredSong.id,
                  title: restoredSong.title,
                  artist: restoredSong.artist,
                  album: restoredSong.album,
                  duration: restoredSong.duration,
                  keywords: restoredSong.keywords,
                };
                const queue = savedSession.searchResults.map(s => ({
                  id: s.id,
                  title: s.title,
                  artist: s.artist,
                  album: s.album,
                  duration: s.duration,
                  keywords: s.keywords,
                }));
                loadSong(musicPlayerSong, queue);
              }
            } else if (savedSession.searchResults.length > 0) {
              // If no selected song, select the first one to show details
              const firstSong = savedSession.searchResults[0];
              setSelectedSong(firstSong);
              // Load the first song into the music player (without playing)
              const musicPlayerSong = {
                id: firstSong.id,
                title: firstSong.title,
                artist: firstSong.artist,
                album: firstSong.album,
                duration: firstSong.duration,
                keywords: firstSong.keywords,
              };
              const queue = savedSession.searchResults.map(s => ({
                id: s.id,
                title: s.title,
                artist: s.artist,
                album: s.album,
                duration: s.duration,
                keywords: s.keywords,
              }));
              loadSong(musicPlayerSong, queue);
            }
          } else {
            // Even if no search results, ensure showResults is false and loading is false
            setShowResults(false);
            setIsLoading(false);
            setWaitingForResponse(false);
          }
        } else {
          // Session not found, start fresh
          const storedSessionId = localStorage.getItem("viola_session_id");
          if (storedSessionId) {
            setSessionId(storedSessionId);
          } else {
            const newSessionId = crypto.randomUUID();
            localStorage.setItem("viola_session_id", newSessionId);
            setSessionId(newSessionId);
          }
          setChatMessage(
            "Hi! Tell me what kind of music you'd like, and I'll help you find the perfect tracks."
          );
        }
      } else {
        // No current session, start fresh
        const storedSessionId = localStorage.getItem("viola_session_id");
        if (storedSessionId) {
          setSessionId(storedSessionId);
        } else {
          const newSessionId = crypto.randomUUID();
          localStorage.setItem("viola_session_id", newSessionId);
          setSessionId(newSessionId);
        }
        setChatMessage(
          "Hi! Tell me what kind of music you'd like, and I'll help you find the perfect tracks."
        );
      }
    }

    // Load folders
    setFolders(getFolders());
  }, [urlSessionId, location.state, location.pathname, isAuthenticated, navigate]); // Re-run when auth changes (e.g. logout)

  /* EFFECT: Handle reset when Search button is clicked twice */
  useEffect(() => {
    // Check if we should reset (from location.state.reset flag)
    if (location.state?.reset === true && !urlSessionId) {
      // Reset all chat panel state
      setSearchQuery("");
      setConversationHistory([]);
      setSearchResults([]);
      setShowResults(false);
      setSelectedSong(null);
      setCurrentChatSessionId(null);
      setHasSearched(false);
      setIsFirstMessage(true);
      setIsLoading(false);
      setWaitingForResponse(false);
      setChatMessage(
        "Hi! Tell me what kind of music you'd like, and I'll help you find the perfect tracks."
      );
      
      // Clear current chat session ID
      localStorage.removeItem("viola_current_chat_session_id");
      
      // Clear the reset flag from location state
      navigate(location.pathname, { replace: true, state: {} });
      
      // Clear music player
      clearQueue();
    }
  }, [location.state?.reset, urlSessionId, navigate, clearQueue, location.pathname]);

  // Fetch track details from MongoDB (falls back to ChromaDB)
  const fetchTrackDetails = async (trackIds: string[]): Promise<Song[]> => {
    try {
      const tracks = await fetchTrackDetailsFromMongoDB(trackIds);
      // Convert TrackDetails to Song format
      return tracks.map((track) => ({
        id: parseInt(track.id) || 0,
        title: track.title,
        artist: track.artist,
        album: track.album,
        keywords: track.keywords || ["Music"],
        duration: track.duration,
        genre: track.genre,
        mood: track.mood || "N/A",
        producer: track.producer || "N/A",
        writer: track.writer || "N/A",
      }));
    } catch (error) {
      console.error("Error fetching track details:", error);
      // Fallback to placeholder songs
      return trackIds.map((id, index) => ({
        id: parseInt(id) || index + 1,
        title: `Track ${id}`,
        artist: "Unknown Artist",
        album: "Unknown Album",
        keywords: ["Music"],
        duration: "03:00",
      }));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isAuthenticated && !sessionId) return;

    // Clear previous search results when starting a new search
    setSearchResults([]);
    setShowResults(false);
    setConversationHistory([]);
    setCurrentChatSessionId(null);
    // Clear current chat session ID when starting a new search
    localStorage.removeItem("viola_current_chat_session_id");

    setIsLoading(true);
    setHasSearched(true);
    setWaitingForResponse(true);

    // Add user message to conversation
    const userMessage = searchQuery;
    setConversationHistory((prev) => [
      ...prev,
      { role: "user", message: userMessage },
    ]);

    // Demo mode: not logged in → show mock data only, no API call
    if (!isAuthenticated) {
      setConversationHistory((prev) => [
        ...prev,
        { role: "bot", message: "Here are some demo tracks. Log in for full search." },
      ]);
      setChatMessage("Here are some demo tracks. Log in for full search.");
      setSearchResults(mockSongs);
      setShowResults(true);
      setIsLoading(false);
      setWaitingForResponse(false);
      if (isFirstMessage) setIsFirstMessage(false);
      // Select first song so details page is shown
      const firstSong = mockSongs[0];
      setSelectedSong(firstSong);
      loadSong(
        { id: firstSong.id, title: firstSong.title, artist: firstSong.artist, album: firstSong.album, duration: firstSong.duration, keywords: firstSong.keywords },
        mockSongs.map(s => ({ id: s.id, title: s.title, artist: s.artist, album: s.album, duration: s.duration, keywords: s.keywords }))
      );
      return;
    }

    try {
      // Call backend search endpoint (proxies to chatbot, then CLAP when complete)
      const response = await fetch(API_ENDPOINTS.MUSIC_SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          session_id: sessionId,
          is_new_session: isFirstMessage, // used to tell the backend to initialize a new chatbot session
        }),
      });

      // Mark that we've sent the first message
      if (isFirstMessage) {
        setIsFirstMessage(false);
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      // Store session ID
      if (data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem("viola_session_id", data.session_id);
      }

      // Add bot response to conversation (skip if last message is identical to avoid duplicates)
      if (data.message) {
        setChatMessage(data.message);
        setConversationHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "bot" && last?.message === data.message) return prev;
          return [...prev, { role: "bot", message: data.message }];
        });
      }

      // Check if conversation is complete and we have results
      if (data.is_complete && data.tracks && data.tracks.length > 0) {
        // Use tracks directly from backend response (no separate fetch needed)

        const songs = data.tracks.map((track: any) => ({
          id: parseInt(track.id) || 0,
          title: track.title || "Unknown Title",
          artist: track.artist || "Unknown Artist",
          album: track.album || "Unknown Album",
          keywords: track.keywords || [track.genre || "Music"],
          duration: track.duration || "03:00",
          genre: track.genre || "Unknown",
          mood: track.mood || "N/A",
          producer: track.producer || "N/A",
          writer: track.writer || "N/A",
          thumbnail: track.thumbnail || track.thumbnail_url || "🎵",
        }));

        setSearchResults(songs);
        setShowResults(true);
        setIsLoading(false);
        setWaitingForResponse(false);

        /* NEW: Save completed chat session to history (avoid duplicate bot message) */
        const prevForSave = [...conversationHistory];
        const last = prevForSave[prevForSave.length - 1];
        const updatedHistory =
          last?.role === "bot" && last?.message === data.message
            ? prevForSave
            : [...prevForSave, { role: "bot", message: data.message }];

        // Generate chat session ID if we don't have one yet
        const chatSessionId = currentChatSessionId || crypto.randomUUID();
        setCurrentChatSessionId(chatSessionId);
        // Store current chat session ID for restoration when navigating back
        localStorage.setItem("viola_current_chat_session_id", chatSessionId);

        // Extract title from first user message (truncate to 50 chars)
        const firstUserMessage =
          updatedHistory.find((msg) => msg.role === "user")?.message ||
          "Untitled Search";
        const title =
          firstUserMessage.length > 50
            ? firstUserMessage.slice(0, 50) + "..."
            : firstUserMessage;

        // Get existing session to preserve selectedSongId if updating
        const existingSession = currentChatSessionId ? getChatSessionById(currentChatSessionId) : null;
        
        // Save to chat history with search results and selected song
        saveChatSession({
          id: chatSessionId,
          title: title,
          query: firstUserMessage,
          sessionId: data.session_id,
          conversationHistory: updatedHistory,
          resultCount: songs.length,
          searchResults: songs, // Save search results for restoration
          selectedSongId: selectedSong?.id || existingSession?.selectedSongId, // Preserve selected song
          createdAt: existingSession?.createdAt || Date.now(), // Keep original creation time if updating
          updatedAt: Date.now(),
        });

        // Dispatch custom event to notify sidebar of chat history update
        window.dispatchEvent(new Event("chatHistoryUpdated"));
      } else {
        // Conversation is still ongoing (e.g. fallback "Describe what you'd like...") - save partial session so it appears in Recent Chats
        setIsLoading(false);
        setWaitingForResponse(false);
        setShowResults(false);
        const prevForSave = [...conversationHistory];
        const lastOngoing = prevForSave[prevForSave.length - 1];
        const updatedHistory =
          lastOngoing?.role === "bot" && lastOngoing?.message === data.message
            ? prevForSave
            : [...prevForSave, { role: "bot", message: data.message }];
        const firstUserMessage = updatedHistory.find((m) => m.role === "user")?.message || "Untitled Search";
        const title = firstUserMessage.length > 50 ? firstUserMessage.slice(0, 50) + "..." : firstUserMessage;
        const chatSessionId = currentChatSessionId || crypto.randomUUID();
        setCurrentChatSessionId(chatSessionId);
        localStorage.setItem("viola_current_chat_session_id", chatSessionId);
        const existingSession = currentChatSessionId ? getChatSessionById(currentChatSessionId) : null;
        saveChatSession({
          id: chatSessionId,
          title,
          query: firstUserMessage,
          sessionId: data.session_id,
          conversationHistory: updatedHistory,
          resultCount: 0,
          searchResults: [],
          selectedSongId: existingSession?.selectedSongId,
          createdAt: existingSession?.createdAt || Date.now(),
          updatedAt: Date.now(),
        });
        window.dispatchEvent(new Event("chatHistoryUpdated"));
      }
    } catch (error) {
      console.error("Search error:", error);
      setChatMessage("Sorry, I encountered an error. Please try again.");
      setIsLoading(false);
      setWaitingForResponse(false);
      // Fallback to showing mock results if API fails
      setSearchResults(mockSongs);
      setShowResults(true);
    }

    // Clear search input
    setSearchQuery("");
  };

  const [placeholderText, setPlaceholderText] = useState("Find ");
  const [thinkingText, setThinkingText] = useState("");

  // Thinking text animation effect - runs when loading
  useEffect(() => {
    if (!isLoading) {
      setThinkingText("");
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const intervalId = setInterval(
      () => {
        const phrase = thinkingPhrases[phraseIndex];
        setThinkingText(phrase.slice(0, charIndex));

        if (!deleting) {
          charIndex++;
          if (charIndex > phrase.length) {
            deleting = true;
          }
        } else {
          charIndex--;
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % thinkingPhrases.length;
          }
        }
      },
      deleting ? 90 : 100
    );

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Placeholder text animation effect
  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const intervalId = setInterval(
      () => {
        const phrase = typingPhrases[phraseIndex];
        setPlaceholderText(`Find me ${phrase.slice(0, charIndex)}`);

        if (!deleting) {
          charIndex++;
          if (charIndex > phrase.length) {
            deleting = true;
            setTimeout(() => {}, 2000);
          }
        } else {
          charIndex--;
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % typingPhrases.length;
          }
        }
      },
      deleting ? 400 : 170
    );

    return () => clearInterval(intervalId);
  }, []);

  const toggleTrackSelection = (songId: number) => {
    setSelectedTrackIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  const handleSaveToFolder = () => {
    if (selectedTrackIds.size === 0) {
      return;
    }
    setShowFolderDialog(true);
  };

  const saveTracksToFolder = (folderId: string) => {
    const trackIdsToSave = Array.from(selectedTrackIds).map((id) =>
      id.toString()
    );
    addTracksToFolder(folderId, trackIdsToSave);
    setShowFolderDialog(false);
    setSelectedTrackIds(new Set());
    // Show success feedback (could use a toast here)
    alert(`Saved ${trackIdsToSave.length} track(s) to folder`);
  };

  const addToPitch = (song: Song) => {
    setSelectedSong(song);
    setShowPitchSelection(true);

    // Save track ID to localStorage for PitchBuilder (legacy support)
    const savedTrackIds = JSON.parse(
      localStorage.getItem("pitch_track_ids") || "[]"
    );
    if (!savedTrackIds.includes(song.id.toString())) {
      savedTrackIds.push(song.id.toString());
      localStorage.setItem("pitch_track_ids", JSON.stringify(savedTrackIds));
    }
  };

  const selectPitch = (folder: Folder) => {
    if (selectedSong) {
      // Add the selected song to the chosen folder
      addTracksToFolder(folder.id, [selectedSong.id.toString()]);

      // Refresh folders to show updated track counts
      setFolders(getFolders());

      // Show success feedback
      alert(`Added "${selectedSong.title}" to ${folder.name}`);
    }
    setShowPitchSelection(false);
    setSelectedSong(null);
  };

  const handleSongClick = (song: Song) => {
    // Convert Song to MusicPlayerSong format
    const musicPlayerSong: MusicPlayerSong = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      keywords: song.keywords,
    };
    
    // Get all available songs for the queue
    const allSongs = searchResults.length > 0 ? searchResults : mockSongs;
    const queue: MusicPlayerSong[] = allSongs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      duration: s.duration,
      keywords: s.keywords,
    }));
    
    // Load the selected song with the queue (but don't auto-play - user must click play)
    loadSong(musicPlayerSong, queue);
    setSelectedSong(song);
  };

  if (showPitchBuilder) {
    return <PitchBuilder />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden text-white font-dm">
      <style>
        {`
          @keyframes cd-spin {
            from { transform: rotate(var(--start-rotation, 0deg)); }
            to { transform: rotate(calc(var(--start-rotation, 0deg) + 360deg)); }
          }
          .cd-disc.is-spinning {
            animation: cd-spin 3.2s linear infinite;
          }
          .album-spin.is-spinning {
            animation: cd-spin 7s linear infinite;
            animation-play-state: running;
          }
          .album-spin.is-paused {
            animation-play-state: paused;
          }
          .loading-drive {
            width: 420px;
            max-width: 80%;
            height: 180px;
            border: 1px solid rgba(255,255,255,0.5);
            border-radius: 12px;
            position: relative;
          }
          .loading-drive::before {
            content: "";
            position: absolute;
            left: 50%;
            top: 58%;
            transform: translate(-50%, -50%);
            width: 72%;
            height: 16px;
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 999px;
          }
          .loading-drive::after {
            content: "";
            position: absolute;
            right: 18px;
            top: 22px;
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: rgba(255,255,255,0.9);
          }
        `}
      </style>

      <div className="relative z-10 flex h-screen w-full">
        <ChatPanel
          conversationHistory={conversationHistory}
          waitingForResponse={waitingForResponse}
          isLoading={isLoading}
          showResults={showResults}
          thinkingText={thinkingText}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSubmit={handleSearch}
        />
        <ResultsPanel
          isLoading={isLoading}
          showResults={showResults}
          thinkingText={thinkingText}
          isPlaying={playerIsPlaying}
          onTogglePlay={togglePlayPause}
          searchResults={searchResults}
          fallbackSongs={mockSongs}
          selectedSong={currentSong || selectedSong}
          onSongClick={handleSongClick}
        />
      </div>

      {/* Folder Selection Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Tracks to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to save {selectedTrackIds.size} track
              {selectedTrackIds.size > 1 ? "s" : ""} to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => saveTracksToFolder(folder.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-purple-200 hover:bg-purple-50/10 transition-all duration-200 text-left group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                  {folder.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-lg">{folder.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {folder.trackIds.length} track
                    {folder.trackIds.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-8 h-8 bg-[#E4EA04] rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pitch Selection Modal */}
      {showPitchSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm drop-shadow-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-dm">Add to Pitch</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPitchSelection(false)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4 m-2 hover:bg-[#e4ea04]" />
                </Button>
              </div>

              {selectedSong && (
                <div className="flex content-center gap-3 p-3 bg-muted/50 rounded-sm">
                  <div className="w-12 h-12 bg-gradient-to-br flex items-center justify-center">
                    <img
                      src="/NoteAlbumArt.png"
                      alt="Album Art"
                      className="rounded-sm w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{selectedSong.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSong.artist}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                Select a folder to add this song to:
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => selectPitch(folder)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-purple-200 hover:bg-purple-50/10 transition-all duration-200 text-left group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                      {folder.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{folder.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {folder.trackIds.length} track
                        {folder.trackIds.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-8 h-8 bg-[#E4EA04] rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-black" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
