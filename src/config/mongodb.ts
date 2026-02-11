/**
 * MongoDB Configuration (Frontend)
 *
 * WARNING: MongoDB credentials must NEVER be in the frontend.
 * All MongoDB access goes through the backend API.
 *
 * This module exists only for documentation/reference.
 * Use backend endpoints like GET /api/music/tracks/:trackId
 */

// No credentials here - frontend calls backend API only
export const MONGODB_CONFIG = {
  CONNECTION_STRING: '', // Intentionally empty; use backend API
};

export default MONGODB_CONFIG;

