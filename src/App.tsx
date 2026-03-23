import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Landing from "./pages/Landing";
import Waitlist from "./pages/Waitlist";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import DemoHome from "./pages/DemoHome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

/* NEW IMPORTS: Layout and pages for demo */
import { AppLayout } from "./components/layout/AppLayout";
import { SearchInterface } from "./components/SearchInterface";
import { PitchBuilder } from "./components/PitchBuilder";
import { MusicCatalog } from "./components/MusicCatalog";
import { Marketplace } from "./components/marketplace/Marketplace";
import { MusicPlayerProvider, useMusicPlayer } from "./contexts/MusicPlayerContext";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Component to handle music stopping on navigation
const MusicNavigationHandler = () => {
  const location = useLocation();
  const { pause, isPlaying } = useMusicPlayer();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;
    
    // If we were on catalog or pitch-kit page and navigated away, stop music
    if (prevPath && (prevPath.includes('/catalog') || prevPath.includes('/pitch-kit')) && 
        !currentPath.includes('/catalog') && !currentPath.includes('/pitch-kit')) {
      if (isPlaying) {
        pause();
      }
    }
    
    prevPathRef.current = currentPath;
  }, [location.pathname, pause, isPlaying]);

  return null;
};

const AppContent = () => {
  const location = useLocation();
  const isCatalogPage = location.pathname.includes('/catalog');
  
  return (
    <>
      <MusicNavigationHandler />
      <Routes>
        {/* LANDING PAGE: Marketing page */}
        <Route path="/" element={<Landing />} />

        {/* LOGIN: Login page */}
        <Route path="/login" element={<Login />} />

        {/* SIGNUP: Signup page */}
        <Route path="/signup" element={<Signup />} />

        {/* WAITLIST: Signup form */}
        <Route path="/waitlist" element={<Waitlist />} />

        {/* THANK YOU: Post-signup confirmation */}
        <Route path="/thank-you" element={<ThankYou />} />

        {/* DEMO ROUTES: All demo pages wrapped in AppLayout (sidebar + content) */}
        <Route path="/demo" element={<Navigate to="/demo/home" replace />} />
        <Route
          path="/demo/*"
          element={
            <AppLayout>
              <Routes>
                {/* HOME: Main search page with gradient background */}
                <Route path="home" element={<DemoHome />} />

                {/* MARKETPLACE: Discover page with carousel, genres, labels, tracks */}
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="marketplace/*" element={<Marketplace />} />

                {/* SEARCH: Music search interface (new session) */}
                <Route path="search" element={<SearchInterface />} />

                {/* SEARCH: Resume chat session by ID */}
                <Route path="search/:sessionId" element={<SearchInterface />} />

                {/* PITCH BUILDER: Folder management (legacy route for backward compatibility) */}
                <Route path="playlists" element={<PitchBuilder />} />

                {/* DRIVE: Placeholder route using pitch builder */}
                <Route path="drive" element={<PitchBuilder />} />

                {/* PITCH KIT: Dedicated path for pitch kit builder */}
                <Route path="pitch-kit" element={<PitchBuilder />} />

                {/* CATALOG: Music catalog browser */}
                <Route path="catalog" element={<MusicCatalog />} />

                {/* PROFILE: User profile page */}
                <Route path="profile" element={<Profile />} />
              </Routes>
            </AppLayout>
          }
        />

        {/* 404: Catch-all for unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MusicPlayerProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
        </MusicPlayerProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
