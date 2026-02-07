# ChromaDB & MongoDB Integration Guide

This document explains how ChromaDB and MongoDB are integrated into the Viola frontend.

## Overview

- **ChromaDB**: Used directly from the frontend to fetch track metadata and search tracks
- **MongoDB**: Connection info provided for backend reference (should NOT be used directly in frontend)

## ChromaDB Integration

### Configuration

ChromaDB credentials are configured in `src/config/chromadb.ts`:

```typescript
- API Key: ck-5R1gbicHUMeAERcAPhRzoN2U5znRkrRjSjdJXdu7U8RA
- Tenant: b2a6f32d-669f-4c1a-8525-c857a7d1e59e
- Database: VIOLA
- Collection: fma_small
```

### Track Service

The `src/services/trackService.ts` file provides three main functions:

1. **`fetchTrackDetailsFromChroma(trackIds: string[])`**
   - Fetches track details by track IDs
   - Used in SearchInterface and PitchBuilder

2. **`searchTracksInChroma(queryText: string, limit?: number)`**
   - Searches tracks by text query
   - Can be used for direct search functionality

3. **`getAllTracksFromChroma(limit?: number)`**
   - Fetches all tracks from the catalog
   - Used in MusicCatalog component

### Usage in Components

#### SearchInterface
- Fetches track details when chatbot returns track IDs
- Converts ChromaDB results to Song format for display

#### PitchBuilder
- Loads recommended songs from ChromaDB
- Uses track IDs saved from search results

#### MusicCatalog
- Loads all tracks from ChromaDB on mount
- Displays full catalog with metadata

## MongoDB Configuration

MongoDB connection string is stored in `src/config/mongodb.ts` for reference:

```
# Set in .env - NEVER commit real credentials
# VITE_MONGODB_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?appName=viola
```

**⚠️ Important**: MongoDB should ONLY be accessed through your backend API. Never use MongoDB directly in the frontend.

## Environment Variables

Create a `.env` file in the project root with:

```env
# ChromaDB Configuration - add these to .env (do NOT commit .env)
VITE_CHROMA_API_KEY=your-chroma-api-key
VITE_CHROMA_TENANT=your-tenant-id
VITE_CHROMA_DATABASE=VIOLA
VITE_CHROMA_COLLECTION_NAME=fma_small

# MongoDB (Backend Only - Do NOT use in frontend)
# VITE_MONGODB_URL=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/...
```

## Security Notes

1. **ChromaDB API Key**: Currently hardcoded as fallback. In production, use environment variables only.

2. **MongoDB**: Never expose MongoDB credentials in frontend code. Always use backend API endpoints.

3. **Production**: Move all sensitive credentials to environment variables and never commit them to version control.

## Testing

To test the ChromaDB integration:

1. Start the development server: `npm run dev`
2. Navigate to Search page and perform a search
3. Check browser console for any ChromaDB connection errors
4. Verify that track details are fetched and displayed correctly

## Troubleshooting

### ChromaDB Connection Issues

- Verify API key is correct
- Check tenant and database names match your ChromaDB setup
- Ensure collection name `fma_small` exists in your database
- Check browser console for detailed error messages

### Track Details Not Loading

- Verify track IDs are valid
- Check ChromaDB collection has the expected metadata fields
- Review `trackService.ts` for field mapping issues

## Next Steps

1. **Backend API**: Create MongoDB endpoints in your backend to fetch additional track details
2. **Error Handling**: Add user-friendly error messages for ChromaDB failures
3. **Caching**: Consider caching ChromaDB results to reduce API calls
4. **Pagination**: Implement pagination for large catalogs

