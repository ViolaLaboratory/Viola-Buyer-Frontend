/**
 * Chat History Service
 * Manages persistent storage of chat sessions in localStorage and syncs to backend DB
 *
 * STORAGE KEY: 'viola_chat_history'
 * MAX SESSIONS: 50 (oldest sessions are automatically removed)
 */

import API_ENDPOINTS from "@/config/api";

export interface ChatSession {
  id: string;                    // Unique UUID for this chat session
  title: string;                 // Display title (first query, truncated to 50 chars)
  query: string;                 // Original search query
  sessionId: string;             // Backend session ID for API continuity
  conversationHistory: Array<{   // Full conversation between user and bot
    role: 'user' | 'bot';
    message: string;
  }>;
  resultCount: number;           // Number of tracks found
  searchResults?: Array<{        // Saved search results to restore
    id: number;
    title: string;
    artist: string;
    album: string;
    keywords: string[];
    duration: string;
  }>;
  selectedSongId?: number;        // ID of the currently selected song in details view
  createdAt: number;             // Timestamp (Date.now())
  updatedAt: number;             // Timestamp (Date.now())
}

const STORAGE_KEY_BASE = 'viola_chat_history';
const MAX_SESSIONS = 50;

function getUserStorageKey(): string {
  try {
    const storedUser = localStorage.getItem('viola_user');
    if (!storedUser) return STORAGE_KEY_BASE;
    const parsed = JSON.parse(storedUser) as { email?: string };
    const email = (parsed.email || '').toLowerCase().trim();
    if (!email) return STORAGE_KEY_BASE;
    return `${STORAGE_KEY_BASE}_${email}`;
  } catch {
    return STORAGE_KEY_BASE;
  }
}

/** Map API response (snake_case, ISO dates) to ChatSession */
function apiToChatSession(res: Record<string, unknown>): ChatSession {
  const createdAt = typeof res.created_at === 'string' ? new Date(res.created_at).getTime() : Number(res.created_at) || Date.now();
  const updatedAt = typeof res.updated_at === 'string' ? new Date(res.updated_at).getTime() : Number(res.updated_at) || Date.now();
  return {
    id: String(res.id ?? ''),
    title: String(res.title ?? ''),
    query: String(res.query ?? ''),
    sessionId: String(res.backend_session_id ?? ''),
    conversationHistory: Array.isArray(res.conversation_history) ? res.conversation_history as ChatSession['conversationHistory'] : [],
    resultCount: Number(res.result_count ?? 0),
    searchResults: Array.isArray(res.search_results) ? res.search_results as ChatSession['searchResults'] : undefined,
    selectedSongId: res.selected_song_id != null ? Number(res.selected_song_id) : undefined,
    createdAt,
    updatedAt,
  };
}

/** Map ChatSession to API request body */
function chatSessionToApi(session: ChatSession): Record<string, unknown> {
  return {
    id: session.id,
    backend_session_id: session.sessionId,
    title: session.title,
    query: session.query,
    conversation_history: session.conversationHistory,
    search_results: session.searchResults ?? [],
    result_count: session.resultCount,
    selected_song_id: session.selectedSongId ?? null,
  };
}

/**
 * Get all chat sessions from localStorage
 * @returns Array of ChatSession objects, sorted by most recent first
 */
export const getChatHistory = (): ChatSession[] => {
  try {
    const key = getUserStorageKey();
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const sessions: ChatSession[] = JSON.parse(stored);

    // Sort by updatedAt (most recent first)
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Error reading chat history:', error);
    return [];
  }
};

/**
 * Save or update a chat session (local + backend DB)
 * Automatically cleans up old sessions if MAX_SESSIONS is exceeded
 * @param session - ChatSession object to save
 */
export const saveChatSession = (session: ChatSession): void => {
  try {
    const sessions = getChatHistory();

    // Check if session already exists (update case)
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }

    const toKeep = sessions.slice(0, MAX_SESSIONS);
    const key = getUserStorageKey();
    localStorage.setItem(key, JSON.stringify(toKeep));

    // Persist to backend DB (fire-and-forget)
    saveChatSessionToBackend(session).catch(() => {});
  } catch (error) {
    console.error('Error saving chat session:', error);
  }
};

/**
 * Fetch chat list from backend and return as ChatSession[] (for Recent Chats)
 */
export const getChatsFromBackend = async (): Promise<ChatSession[]> => {
  try {
    const res = await fetch(API_ENDPOINTS.CHATS_LIST, { credentials: "include" });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, unknown>[];
    return data.map((item) => apiToChatSession(item));
  } catch {
    return [];
  }
};

/**
 * Fetch a single chat session from backend by id
 */
export const getChatFromBackend = async (id: string): Promise<ChatSession | null> => {
  try {
    const res = await fetch(API_ENDPOINTS.CHATS_GET(id), { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return apiToChatSession(data);
  } catch {
    return null;
  }
};

/**
 * Save chat session to backend DB
 */
export const saveChatSessionToBackend = async (session: ChatSession): Promise<void> => {
  const res = await fetch(API_ENDPOINTS.CHATS_SAVE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify(chatSessionToApi(session)),
  });
  if (!res.ok) throw new Error('Failed to save chat');
};

/**
 * Delete chat session from backend DB
 */
export const deleteChatFromBackend = async (id: string): Promise<void> => {
  const res = await fetch(API_ENDPOINTS.CHATS_DELETE(id), {
    method: 'DELETE',
    credentials: "include",
  });
  if (!res.ok && res.status !== 404) throw new Error('Failed to delete chat');
};

/**
 * Delete a specific chat session (local + backend)
 * @param id - Session ID to delete
 */
export const deleteChatSession = (id: string): void => {
  try {
    const sessions = getChatHistory();
    const filtered = sessions.filter(s => s.id !== id);
    const key = getUserStorageKey();
    localStorage.setItem(key, JSON.stringify(filtered));
    deleteChatFromBackend(id).catch(() => {});
  } catch (error) {
    console.error('Error deleting chat session:', error);
  }
};

/**
 * Get a specific chat session by ID (local first; then try backend)
 * @param id - Session ID to retrieve
 * @returns ChatSession object or null if not found
 */
export const getChatSessionById = (id: string): ChatSession | null => {
  try {
    const sessions = getChatHistory();
    return sessions.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

/**
 * Get chat by ID: try backend first, then local (for restoring when clicking Recent Chat)
 */
export const getChatSessionByIdOrBackend = async (id: string): Promise<ChatSession | null> => {
  const fromBackend = await getChatFromBackend(id);
  if (fromBackend) return fromBackend;
  return getChatSessionById(id);
};

/**
 * Clear all chat history (useful for debugging or user preference)
 */
export const clearChatHistory = (): void => {
  try {
    const key = getUserStorageKey();
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};
