/**
 * Track Service
 * Handles fetching track details from ChromaDB and MongoDB
 * 
 * Note: Using ChromaDB HTTP API directly instead of SDK to avoid Node.js dependencies
 * MongoDB should be accessed through backend API
 */

import { CHROMA_CONFIG } from "@/config/chromadb";
import API_ENDPOINTS from "@/config/api";

export interface TrackDetails {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre?: string;
  mood?: string;
  keywords?: string[];
  duration: string;
  thumbnail?: string;
  producer?: string;
  writer?: string;
  licensing?: string;
}

const CHROMA_API_KEY = import.meta.env.VITE_CHROMA_API_KEY ?? '';
const CHROMA_TENANT = import.meta.env.VITE_CHROMA_TENANT ?? '';
const CHROMA_DATABASE = import.meta.env.VITE_CHROMA_DATABASE ?? 'VIOLA';
// ChromaDB Cloud API base URL
const CHROMA_BASE_URL = `https://api.trychroma.com/api/v1`;

/**
 * Helper function to make authenticated ChromaDB API requests
 */
const chromaFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${CHROMA_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CHROMA_API_KEY}`,
      'X-Chroma-Token': CHROMA_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`ChromaDB API error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`ChromaDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch track details from MongoDB backend API by track IDs
 * Falls back to ChromaDB if backend API is unavailable
 */
export const fetchTrackDetailsFromMongoDB = async (trackIds: string[]): Promise<TrackDetails[]> => {
  try {
    // Use batch endpoint to avoid N+1 queries
    const response = await fetch(API_ENDPOINTS.TRACKS_BATCH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ track_ids: trackIds }),
    });

    if (!response.ok) {
      console.error(`Batch fetch failed: ${response.status}`);
      throw new Error(`Batch fetch failed: ${response.status}`);
    }

    const data = await response.json();

    const tracks: TrackDetails[] = (data.results || []).map((track: any) => ({
      id: String(track.id),
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: track.album || 'Unknown Album',
      genre: track.genre,
      mood: track.mood,
      keywords: track.genre ? [track.genre] : ['Music'],
      duration: track.duration || '03:00',
      thumbnail: track.thumbnail || '🎵',
      producer: track.producer,
      writer: track.writer,
      licensing: track.licensing || 'Standard',
    }));

    if (tracks.length > 0) {
      return tracks;
    }
  } catch (error) {
    console.error("Error fetching tracks from MongoDB:", error);
  }

  // Fallback to ChromaDB
  return fetchTrackDetailsFromChroma(trackIds);
};

/**
 * Fetch track details from ChromaDB by track IDs
 */
export const fetchTrackDetailsFromChroma = async (trackIds: string[]): Promise<TrackDetails[]> => {
  try {
    // ChromaDB Cloud API: Get collection by name with tenant and database
    const collectionPath = `${CHROMA_TENANT}/${CHROMA_DATABASE}/${CHROMA_CONFIG.COLLECTION_NAME}`;

    // Fetch documents by IDs
    const getResponse = await chromaFetch(`/collections/${collectionPath}/get`, {
      method: 'POST',
      body: JSON.stringify({
        ids: trackIds,
      }),
    });

    const results = getResponse.data || {};
    const documents = results.documents || [];
    const metadatas = results.metadatas || [];

    // Transform ChromaDB results to TrackDetails format
    // Map MongoDB schema: track_id, title, genre_top, name (artist)
    const tracks: TrackDetails[] = trackIds.map((id, index) => {
      const doc = documents[index];
      const metadata = metadatas[index] || {};

      // Map MongoDB schema fields
      const trackId = metadata.track_id || id;
      const title = metadata.title || doc?.title || `Track ${trackId}`;
      const artist = metadata.name || metadata.artist || doc?.artist || "Unknown Artist";
      const album = metadata.album || doc?.album || "Unknown Album";
      const genre = metadata.genre_top || metadata.genre || doc?.genre || "Unknown";

      return {
        id: trackId as string,
        title: title,
        artist: artist,
        album: album,
        genre: genre,
        mood: metadata.mood || doc?.mood || "Unknown",
        keywords: metadata.keywords ?
          (Array.isArray(metadata.keywords) ? metadata.keywords : [metadata.keywords]) :
          (doc?.keywords ? (Array.isArray(doc.keywords) ? doc.keywords : [doc.keywords]) : [genre]),
        duration: metadata.duration || doc?.duration || "03:00",
        thumbnail: metadata.thumbnail || doc?.thumbnail || "🎵",
        producer: metadata.producer || doc?.producer,
        writer: metadata.writer || doc?.writer,
        licensing: metadata.licensing || doc?.licensing || "Standard",
      };
    });

    return tracks;
  } catch (error) {
    console.error("Error fetching tracks from ChromaDB:", error);
    // Return placeholder tracks on error
    return trackIds.map((id, index) => ({
      id: id,
      title: `Track ${id}`,
      artist: "Unknown Artist",
      album: "Unknown Album",
      keywords: ["Music"],
      duration: "03:00",
      thumbnail: "🎵",
    }));
  }
};

/**
 * Search tracks in ChromaDB by query text
 */
export const searchTracksInChroma = async (
  queryText: string,
  limit: number = 10
): Promise<TrackDetails[]> => {
  try {
    // ChromaDB Cloud API: Use collection path with tenant and database
    const collectionPath = `${CHROMA_TENANT}/${CHROMA_DATABASE}/${CHROMA_CONFIG.COLLECTION_NAME}`;

    // Query ChromaDB with text search
    const queryResponse = await chromaFetch(`/collections/${collectionPath}/query`, {
      method: 'POST',
      body: JSON.stringify({
        query_texts: [queryText],
        n_results: limit,
      }),
    });

    const results = queryResponse.data || {};
    const ids = results.ids?.[0] || [];
    const documents = results.documents?.[0] || [];
    const metadatas = results.metadatas?.[0] || [];

    if (ids.length === 0) {
      return [];
    }

    // Transform results
    const tracks: TrackDetails[] = ids.map((id: string, index: number) => {
      const metadata = metadatas[index] || {};
      const doc = documents[index];

      return {
        id: id as string,
        title: metadata.title || doc?.title || `Track ${id}`,
        artist: metadata.artist || doc?.artist || "Unknown Artist",
        album: metadata.album || doc?.album || "Unknown Album",
        genre: metadata.genre || doc?.genre,
        mood: metadata.mood || doc?.mood,
        keywords: metadata.keywords ?
          (Array.isArray(metadata.keywords) ? metadata.keywords : [metadata.keywords]) :
          (doc?.keywords ? (Array.isArray(doc.keywords) ? doc.keywords : [doc.keywords]) : ["Music"]),
        duration: metadata.duration || doc?.duration || "03:00",
        thumbnail: metadata.thumbnail || doc?.thumbnail || "🎵",
        producer: metadata.producer || doc?.producer,
        writer: metadata.writer || doc?.writer,
        licensing: metadata.licensing || doc?.licensing || "Standard",
      };
    });

    return tracks;
  } catch (error) {
    console.error("Error searching tracks in ChromaDB:", error);
    return [];
  }
};

/**
 * Get all tracks from ChromaDB (for catalog)
 * Supports pagination to fetch all 7,997 songs
 */
export const getAllTracksFromChroma = async (limit: number = 100, offset: number = 0): Promise<TrackDetails[]> => {
  try {
    // ChromaDB Cloud API: Use collection path with tenant and database
    const collectionPath = `${CHROMA_TENANT}/${CHROMA_DATABASE}/${CHROMA_CONFIG.COLLECTION_NAME}`;

    // Get documents with limit and offset for pagination
    const getResponse = await chromaFetch(`/collections/${collectionPath}/get`, {
      method: 'POST',
      body: JSON.stringify({
        limit: limit,
        offset: offset,
      }),
    });

    const results = getResponse.data || {};
    const ids = results.ids || [];
    const documents = results.documents || [];
    const metadatas = results.metadatas || [];

    if (ids.length === 0) {
      return [];
    }

    // Transform results - map MongoDB schema fields
    const tracks: TrackDetails[] = ids.map((id: string, index: number) => {
      const metadata = metadatas[index] || {};
      const doc = documents[index];

      // Map MongoDB schema: track_id, title, genre_top, name (artist)
      const trackId = metadata.track_id || id;
      const title = metadata.title || doc?.title || `Track ${trackId}`;
      const artist = metadata.name || metadata.artist || doc?.artist || "Unknown Artist";
      const album = metadata.album || doc?.album || "Unknown Album";
      const genre = metadata.genre_top || metadata.genre || doc?.genre || "Unknown";

      return {
        id: trackId as string,
        title: title,
        artist: artist,
        album: album,
        genre: genre,
        mood: metadata.mood || doc?.mood || "Unknown",
        keywords: metadata.keywords ?
          (Array.isArray(metadata.keywords) ? metadata.keywords : [metadata.keywords]) :
          (doc?.keywords ? (Array.isArray(doc.keywords) ? doc.keywords : [doc.keywords]) : [genre]),
        duration: metadata.duration || doc?.duration || "03:00",
        thumbnail: metadata.thumbnail || doc?.thumbnail || "🎵",
        producer: metadata.producer || doc?.producer,
        writer: metadata.writer || doc?.writer,
        licensing: metadata.licensing || doc?.licensing || "Standard",
      };
    });

    return tracks;
  } catch (error) {
    console.error("Error fetching tracks from ChromaDB:", error);
    return [];
  }
};
