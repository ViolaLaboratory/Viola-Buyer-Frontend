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
import Checkout from "./pages/Checkout";
import License from "./pages/License";

/* NEW IMPORTS: Layout and pages for demo */
import { AppLayout } from "./components/layout/AppLayout";
import { SearchInterface } from "./components/SearchInterface";
import { PitchBuilder } from "./components/PitchBuilder";
import { MusicCatalog } from "./components/MusicCatalog";
import { Marketplace } from "./components/marketplace/Marketplace";
import { DiscoverPage } from "./components/marketplace/DiscoverPage";
import { RecordLabelsPage } from "./components/marketplace/RecordLabelsPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { TransactionsPage } from "./components/dashboard/TransactionsPage";
import { CountriesPage } from "./components/dashboard/CountriesPage";
import { RequireSellerPortal, RequireBuyerPortal } from "./components/routing/PortalGuards";
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
    
    if (
      prevPath &&
      (prevPath.includes("/catalog") || prevPath.includes("/pitch-kit")) &&
      !currentPath.includes("/catalog") &&
      !currentPath.includes("/pitch-kit")
    ) {
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

                {/* MARKETPLACE */}
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="marketplace/discover" element={<DiscoverPage />} />
                <Route path="marketplace/labels" element={<RecordLabelsPage />} />
                <Route path="marketplace/*" element={<Marketplace />} />

                {/* SELLER: Dashboard + Pitch Kit */}
                <Route
                  path="dashboard"
                  element={
                    <RequireSellerPortal>
                      <Dashboard />
                    </RequireSellerPortal>
                  }
                />
                <Route
                  path="dashboard/transactions"
                  element={
                    <RequireSellerPortal>
                      <TransactionsPage />
                    </RequireSellerPortal>
                  }
                />
                <Route
                  path="dashboard/countries"
                  element={
                    <RequireSellerPortal>
                      <CountriesPage />
                    </RequireSellerPortal>
                  }
                />
                <Route
                  path="playlists"
                  element={
                    <RequireSellerPortal>
                      <PitchBuilder />
                    </RequireSellerPortal>
                  }
                />
                <Route
                  path="drive"
                  element={
                    <RequireSellerPortal>
                      <PitchBuilder />
                    </RequireSellerPortal>
                  }
                />
                <Route
                  path="pitch-kit"
                  element={
                    <RequireSellerPortal>
                      <PitchBuilder />
                    </RequireSellerPortal>
                  }
                />

                {/* SEARCH */}
                <Route path="search" element={<SearchInterface />} />
                <Route path="search/:sessionId" element={<SearchInterface />} />

                {/* CATALOG (full library view) */}
                <Route path="catalog" element={<MusicCatalog />} />

                <Route path="profile" element={<Profile />} />
                <Route
                  path="checkout"
                  element={
                    <RequireBuyerPortal>
                      <Checkout />
                    </RequireBuyerPortal>
                  }
                />
                <Route
                  path="license"
                  element={
                    <RequireBuyerPortal>
                      <License />
                    </RequireBuyerPortal>
                  }
                />
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
