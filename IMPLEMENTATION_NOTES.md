# Home Page Redesign - Implementation Notes

## Overview
Complete redesign of Viola's navigation from horizontal tabs to a collapsible sidebar with chat history persistence.

## ✅ What Was Built

### 1. Services (Data Layer)
- **`src/services/chatHistoryService.ts`**: localStorage persistence for chat sessions (max 50)
- **`src/services/sidebarStateService.ts`**: Sidebar collapsed/expanded state persistence

### 2. Layout Components
- **`src/components/layout/Sidebar.tsx`**: Collapsible navigation sidebar
- **`src/components/layout/AppLayout.tsx`**: Main layout wrapper (sidebar + content)
- **`src/components/layout/ProfileMenu.tsx`**: User profile dropdown menu

### 3. Pages
- **`src/components/home/HomePage.tsx`**: New home page with centered search and gradient background

### 4. Updated Files
- **`src/App.tsx`**: Updated routing structure for `/demo/*` routes
- **`src/components/SearchInterface.tsx`**: Added chat history saving and session resuming

---

## 🎨 Styling Guide

All components use **extensive Tailwind CSS comments** to make styling easy to find and modify. Look for comments like:

```tsx
/* WIDTH: 280px expanded, 80px collapsed */
/* COLORS: Dark background with right border */
/* ANIMATION: Smooth width transition */
```

### Key Style Locations

#### Sidebar Width & Colors
**File**: `src/components/layout/Sidebar.tsx` (Line ~163)
```tsx
/* WIDTH: 280px expanded, 80px collapsed */
${isCollapsed ? 'w-20' : 'w-70'}

/* COLORS: Dark background with right border */
bg-card border-r border-border
```

#### Sidebar Collapse Animation
**File**: `src/components/layout/Sidebar.tsx` (Line ~172)
```tsx
/* ANIMATION: Smooth width transition */
transition-all duration-300 ease-in-out
```

#### Home Page Gradient Background
**File**: `src/components/home/HomePage.tsx` (Lines ~95-140)
- **Layer 1**: Blurred image background (`viola.jpg`)
- **Layer 2**: Radial gradient overlay (purple/orange/pink)
- Both layers follow mouse movement via CSS custom properties

```tsx
/* BACKGROUND LAYER 1: Blurred image background */
blur-[22px] saturate-[2]

/* BACKGROUND LAYER 2: Gradient overlay */
mix-blend-screen
```

To modify colors, search for: `rgba(255, 214, 92` or `rgba(122, 35, 204`

#### Search Input Styling
**File**: `src/components/home/HomePage.tsx` (Line ~182)
```tsx
/* COLORS: Transparent background with white border */
bg-black/40 backdrop-blur-sm
border-2 border-white/20

/* FOCUS: Glow effect on focus */
focus:border-white/40
focus:ring-2 focus:ring-white/20
focus:shadow-[0_0_20px_rgba(255,255,255,0.15)]
```

#### Navigation Items (Active State)
**File**: `src/components/layout/Sidebar.tsx` (Line ~258)
```tsx
/* COLORS: Active state vs hover state */
${
  isActive
    ? 'bg-accent/20 text-accent-foreground font-medium'
    : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
}
```

#### Profile Menu
**File**: `src/components/layout/ProfileMenu.tsx` (Line ~26)
```tsx
/* COLORS: Subtle background on hover */
hover:bg-accent/10
```

---

## 🗂️ File Structure

```
src/
├── services/
│   ├── chatHistoryService.ts         [NEW] Chat session persistence
│   ├── sidebarStateService.ts        [NEW] Sidebar state persistence
│   ├── folderService.ts               [EXISTING] Unchanged
│   └── trackService.ts                [EXISTING] Unchanged
│
├── components/
│   ├── layout/                        [NEW FOLDER]
│   │   ├── Sidebar.tsx                Collapsible sidebar with chat history
│   │   ├── AppLayout.tsx              Layout wrapper (sidebar + content)
│   │   └── ProfileMenu.tsx            User profile dropdown
│   │
│   ├── home/                          [NEW FOLDER]
│   │   └── HomePage.tsx               Home page with search input
│   │
│   ├── SearchInterface.tsx            [MODIFIED] Added session management
│   ├── PitchBuilder.tsx               [UNCHANGED]
│   ├── MusicCatalog.tsx               [UNCHANGED]
│   └── Navigation.tsx                 [LEGACY] Not used anymore
│
├── pages/
│   ├── Index.tsx                      [LEGACY] Not used anymore
│   ├── Landing.tsx                    [UNCHANGED]
│   ├── Waitlist.tsx                   [UNCHANGED]
│   └── ThankYou.tsx                   [UNCHANGED]
│
└── App.tsx                            [MODIFIED] Updated routing
```

---

## 🧭 Routing Structure

**Old Routes:**
```
/ → Landing page
/demo → Index.tsx (horizontal tabs)
/waitlist → Waitlist
/thank-you → Thank you
```

**New Routes:**
```
/ → Landing page
/demo → Redirects to /demo/home
/demo/home → HomePage (new centered search)
/demo/search → SearchInterface (new session)
/demo/search/:sessionId → Resume saved chat session
/demo/playlists → PitchBuilder
/demo/catalog → MusicCatalog
/waitlist → Waitlist
/thank-you → Thank you
```

All `/demo/*` routes are wrapped in `AppLayout` (sidebar + content area).

---

## 💾 localStorage Schema

### Chat History
**Key**: `viola_chat_history`
**Type**: JSON array of ChatSession objects
**Max Size**: 50 sessions (oldest auto-removed)

```typescript
interface ChatSession {
  id: string;                    // UUID
  title: string;                 // First query (truncated to 50 chars)
  query: string;                 // Original search query
  sessionId: string;             // Backend session ID
  conversationHistory: Array<{
    role: 'user' | 'bot';
    message: string;
  }>;
  resultCount: number;
  createdAt: number;             // Timestamp
  updatedAt: number;             // Timestamp
}
```

### Sidebar State
**Key**: `viola_sidebar_collapsed`
**Type**: String ('true' | 'false')
**Default**: 'false' (expanded)

### Existing Keys (Unchanged)
- `viola_session_id`: Backend session ID
- `viola_folders`: Pitch builder folders

---

## 🔄 User Flows

### Flow 1: Home → New Search
1. User lands on `/demo/home`
2. Enters search query
3. Clicks submit button
4. Navigates to `/demo/search` with query in state
5. SearchInterface auto-submits query
6. On completion, session saved to chat history
7. Chat appears in sidebar

### Flow 2: Resume Chat Session
1. User clicks chat history item in sidebar
2. Navigates to `/demo/search/:sessionId`
3. SearchInterface loads session from localStorage
4. Conversation history restored
5. Toast notification shows session resumed

### Flow 3: Sidebar Toggle
1. User clicks collapse button in sidebar
2. Sidebar animates from 280px to 80px (or vice versa)
3. Text labels fade out (icons remain)
4. State saved to localStorage
5. Persists across page refreshes

---

## 🐛 Debugging Tips

### Chat History Not Showing?
Check browser console for:
```javascript
localStorage.getItem('viola_chat_history')
```

### Session Not Saving?
Ensure search completes successfully (check for `data.is_complete === true`)

### Sidebar Not Persisting State?
Check:
```javascript
localStorage.getItem('viola_sidebar_collapsed')
```

### Custom Events
The app uses a custom event to update sidebar chat history:
```javascript
window.dispatchEvent(new Event('chatHistoryUpdated'));
```

Listen for this event in components that need to react to chat history changes.

---

## 🎯 Modifying Styles Quick Reference

| What to Change | Where to Look | Search For |
|----------------|---------------|------------|
| Sidebar width | `Sidebar.tsx` | `/* WIDTH: 280px expanded` |
| Sidebar colors | `Sidebar.tsx` | `/* COLORS: Dark background` |
| Collapse animation speed | `Sidebar.tsx` | `transition-all duration-300` |
| Home page gradient colors | `HomePage.tsx` | `rgba(122, 35, 204` |
| Home page blur amount | `HomePage.tsx` | `blur-[22px]` |
| Search input glow | `HomePage.tsx` | `focus:shadow-[0_0_20px` |
| Nav item active color | `Sidebar.tsx` | `/* COLORS: Active state` |
| Profile menu hover | `ProfileMenu.tsx` | `hover:bg-accent/10` |
| Chat history font size | `Sidebar.tsx` | `text-sm text-foreground` |

---

## 📱 Mobile Blocking

Mobile devices (< 1024px width) are soft-blocked with a message:
> "Demo unavailable on mobile. Please view the demo on desktop."

Location: `src/components/layout/AppLayout.tsx` (Lines ~30-70)

To change breakpoint, modify:
```tsx
window.matchMedia("(max-width: 1024px)").matches
```

---

## ⚡ Performance Notes

- Build size: ~548 KB (gzipped: ~167 KB)
- No new dependencies added (uses existing libraries)
- Chat history limited to 50 sessions to prevent localStorage bloat
- Mouse movement debounced for smooth gradient animation

---

## 🔧 Future Enhancements (Not Implemented)

- [ ] Search/filter chat history
- [ ] Pin favorite chat sessions
- [ ] Export chat history to JSON
- [ ] Delete individual chat sessions
- [ ] Dark/light mode toggle
- [ ] Keyboard shortcuts (Cmd+K for search)
- [ ] Virtual scrolling for 100+ chat sessions
- [ ] Restore search results when resuming sessions

---

## 📦 Dependencies Used

**No new dependencies added!** All features use existing libraries:

- `lucide-react` (icons)
- `react-router-dom` (routing)
- `@radix-ui` components (dropdown, scroll-area, avatar)
- `tailwindcss` (styling)

---

## ✨ Key Features Implemented

✅ Collapsible sidebar (280px ↔ 80px)
✅ Chat history persistence (localStorage)
✅ Resume previous conversations
✅ Mouse-following gradient background
✅ Profile menu with settings dropdown
✅ Auto-submit search from home page
✅ Mobile blocking for demo
✅ Session state persistence
✅ Toast notifications
✅ Accessible keyboard navigation
✅ Smooth animations throughout

---

## 🚀 Running the App

```bash
# Start frontend
cd Viola-Frontend
npm run dev

# Start backend (separate terminal)
cd Viola-Backend
source .venv/bin/activate
python manage.py runserver
```

Frontend: http://localhost:8080
Backend: http://localhost:8000

---

**Last Updated**: Implementation completed successfully
**Build Status**: ✅ All tests passing
**TypeScript**: ✅ No errors
