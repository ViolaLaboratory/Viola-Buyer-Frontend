# Frontend Update Guide

This guide shows what has been updated in your frontend to connect to the Django backend.

## ✅ Changes Made

### 1. Created API Configuration File
**File**: `src/config/api.ts`
- Centralized API endpoint configuration
- Uses environment variable `VITE_API_BASE_URL` or defaults to `http://localhost:8001/api`
- All API endpoints are now in one place

### 2. Updated Waitlist Form
**File**: `src/pages/Waitlist.tsx`
- ✅ Removed Google Apps Script integration
- ✅ Now uses Django backend API: `POST /api/waitlist/submit/`
- ✅ Removed `generateUserId()` function (backend generates it now)
- ✅ Added proper error handling
- ✅ Shows success/error messages

### 3. Updated Music Search
**File**: `src/components/SearchInterface.tsx`
- ✅ Added session management state
- ✅ Integrated with Django backend API: `POST /api/music/search/`
- ✅ Handles multi-turn conversation flow
- ✅ Auto-starts session on component mount
- ✅ Falls back to mock data if API fails

## 🚀 How to Use

### Step 1: Start the Backend
```bash
cd Viola-Backend
source venv/bin/activate
python manage.py runserver 8001
```

### Step 2: Start the Frontend
```bash
cd Viola-Frontend
npm run dev
```

### Step 3: Test the Integration

1. **Test Waitlist Form**:
   - Navigate to `http://localhost:5173/waitlist`
   - Fill out and submit the form
   - Check browser console for success message
   - Check Django admin at `http://localhost:8001/admin/` to see the entry

2. **Test Music Search**:
   - Navigate to `http://localhost:5173/demo`
   - Type a search query like "I want happy hip-hop songs"
   - The chatbot will ask follow-up questions
   - Continue the conversation until you get results

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

For production, update this to your production API URL.

### API Endpoints

All endpoints are configured in `src/config/api.ts`:

- `WAITLIST_SUBMIT`: Submit waitlist form
- `MUSIC_SEARCH`: Search for music
- `MUSIC_SESSION_START`: Start new search session
- `TRACK_DETAILS(trackId)`: Get track details

## 📝 What Changed in Code

### Waitlist.tsx

**Before:**
```typescript
await fetch("https://script.google.com/...", {
  mode: "no-cors",
  ...
});
```

**After:**
```typescript
const response = await fetch(API_ENDPOINTS.WAITLIST_SUBMIT, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ... }),
});
```

### SearchInterface.tsx

**Before:**
```typescript
// Simulated search with setTimeout
setTimeout(() => {
  setIsLoading(false);
  setShowResults(true);
}, 2000);
```

**After:**
```typescript
const response = await fetch(API_ENDPOINTS.MUSIC_SEARCH, {
  method: "POST",
  body: JSON.stringify({ query: searchQuery, session_id }),
});
// Handle real API response
```

## 🐛 Troubleshooting

### CORS Errors
- Make sure backend is running on port 8001
- Check that `CORS_ALLOWED_ORIGINS` in Django settings includes `http://localhost:5173`
- Verify `corsheaders` is in `INSTALLED_APPS` and `MIDDLEWARE`

### API Connection Errors
- Verify backend is running: `http://localhost:8001/api/`
- Check browser console for error messages
- Ensure API_BASE_URL is correct in `src/config/api.ts`

### Search Not Working
- Check that Chatbot API and CLAP API are accessible
- Look at Django server logs for errors
- Verify session_id is being maintained between requests

## 🎯 Next Steps

1. **Improve Chat UI**: Replace `alert()` with a proper chat interface for multi-turn conversations
2. **Track Details**: Implement fetching track details from MongoDB when results are shown
3. **Error Handling**: Add toast notifications instead of alerts
4. **Loading States**: Improve loading indicators during API calls
5. **Session Persistence**: Store session_id in localStorage to persist across page refreshes

## 📚 Additional Resources

- Backend API docs: See `Viola-Backend/README.md`
- Testing guide: See `Viola-Backend/TESTING.md`
- Frontend integration: See `Viola-Backend/FRONTEND_INTEGRATION.md`

