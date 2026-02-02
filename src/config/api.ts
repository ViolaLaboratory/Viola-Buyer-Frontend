/**
 * API Configuration
 * Centralized API endpoint configuration for Viola backend
 */

// Use /api (proxied to backend) in dev when VITE_API_BASE_URL is not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'https://chatbot-901724938348.us-west1.run.app/chat';
const CLAP_API_URL = import.meta.env.VITE_CLAP_API_URL || 'https://clap-model-901724938348.us-west1.run.app/query';

export const API_ENDPOINTS = {
  // Django Backend APIs
  WAITLIST_SUBMIT: `${API_BASE_URL}/waitlist/submit/`,
  TRACK_DETAILS: (trackId: string) => `${API_BASE_URL}/music/tracks/${trackId}/`,
  TRACK_AUDIO: (trackId: string) => `${API_BASE_URL}/music/tracks/${trackId}/audio/`,
  SONGS_LIST: (page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    const queryString = params.toString();
    return `${API_BASE_URL}/music/songs/${queryString ? `?${queryString}` : ''}`;
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
};

export default API_ENDPOINTS;

