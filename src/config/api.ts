/**
 * API Configuration
 * Centralized API endpoint configuration for Viola backend
 */

// Use /api (proxied to backend) in dev when VITE_API_BASE_URL is not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
// Cloud Run URLs - set in .env (VITE_CHATBOT_API_URL, VITE_CLAP_API_URL). Search uses backend proxy (MUSIC_SEARCH).
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL ?? '';
const CLAP_API_URL = import.meta.env.VITE_CLAP_API_URL ?? '';

export const API_ENDPOINTS = {
  // Django Backend APIs
  WAITLIST_SUBMIT: `${API_BASE_URL}/waitlist/submit/`,
  TRACK_DETAILS: (trackId: string) => `${API_BASE_URL}/music/tracks/${trackId}/`,
  TRACK_AUDIO: (trackId: string) => `${API_BASE_URL}/music/tracks/${trackId}/audio/`,
  SONGS_UPLOAD: `${API_BASE_URL}/music/songs/upload/`,
  SONGS_LIST: (page?: number, limit?: number, q?: string) => {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    if (q && q.trim()) params.set('q', q.trim());
    params.set('_', Date.now().toString());
    return `${API_BASE_URL}/music/songs/?${params.toString()}`;
  },
  SONGS_SEARCH: (query: string, page?: number, limit?: number) =>
    `${API_BASE_URL}/music/songs/search/?q=${encodeURIComponent(query)}${page ? `&page=${page}` : ''}${limit ? `&limit=${limit}` : ''}`,
  
  // User Authentication APIs
  LOGIN: `${API_BASE_URL}/users/login/`,
  SEND_VERIFICATION: `${API_BASE_URL}/users/send-verification/`,
  VERIFY_EMAIL: `${API_BASE_URL}/users/verify-email/`,
  SIGNUP: `${API_BASE_URL}/users/signup/`,
  
  // Chatbot API (for music search conversation)
  CHATBOT_CHAT: CHATBOT_API_URL,
  
  // CLAP Model API (for direct music recommendations)
  CLAP_QUERY: CLAP_API_URL,

  // Chatbot Search (via backend proxy - avoids CORS)
  MUSIC_SEARCH: `${API_BASE_URL}/music/search/`,

  // Batch track fetch (avoids N+1 queries)
  TRACKS_BATCH: `${API_BASE_URL}/music/tracks/batch/`,

  // Chat sessions (persist to DB)
  CHATS_LIST: `${API_BASE_URL}/chats/`,
  CHATS_SAVE: `${API_BASE_URL}/chats/save/`,
  CHATS_GET: (id: string) => `${API_BASE_URL}/chats/${id}/`,
  CHATS_DELETE: (id: string) => `${API_BASE_URL}/chats/${id}/delete/`,
};

export default API_ENDPOINTS;

