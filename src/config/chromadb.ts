/**
 * ChromaDB Configuration
 * 
 * WARNING: In production, these credentials should be stored securely
 * and accessed through environment variables, not hardcoded.
 * 
 * Note: Using HTTP API directly instead of SDK to avoid Node.js dependencies
 */

// Use env vars only — never hardcode credentials (GitHub/security)
const CHROMA_API_KEY = import.meta.env.VITE_CHROMA_API_KEY ?? '';
const CHROMA_TENANT = import.meta.env.VITE_CHROMA_TENANT ?? '';
const CHROMA_DATABASE = import.meta.env.VITE_CHROMA_DATABASE ?? 'VIOLA';
const CHROMA_COLLECTION_NAME = import.meta.env.VITE_CHROMA_COLLECTION_NAME ?? 'fma_small';

export const CHROMA_CONFIG = {
  API_KEY: CHROMA_API_KEY,
  TENANT: CHROMA_TENANT,
  DATABASE: CHROMA_DATABASE,
  COLLECTION_NAME: CHROMA_COLLECTION_NAME,
  BASE_URL: `https://${CHROMA_TENANT}.chromadb.com/api/v1`,
};

export default CHROMA_CONFIG;

