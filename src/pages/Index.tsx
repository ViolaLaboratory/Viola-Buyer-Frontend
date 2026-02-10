import { Navigation } from "@/components/Navigation";
import { MusicCatalog } from "@/components/MusicCatalog";
import { SearchInterface } from "@/components/SearchInterface";
import { PitchBuilder } from "@/components/PitchBuilder";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedVLogo from "@/components/AnimatedVLogo";

const Index = () => {
  const [currentView, setCurrentView] = useState<'search' | 'pitchBuilder' | 'catalogue'>('search');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Soft-block the interactive demo on small screens and steer users back to landing
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 1024px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-12 text-center space-y-6">
        <div className="flex flex-col space-y-3 items-center gap-3">
          <AnimatedVLogo/>
          <p className="text-sm uppercase tracking-[0.2em] text-white pt-10">Demo unavailable on mobile</p>
          <h1 className="text-3xl font-semibold font-zen">Please view the demo on desktop</h1>
          <p className="text-white/70">
            The interactive search, catalog, and pitch builder are best experienced on a larger screen.
            Head back to the landing page for details, or open this link from your computer.
          </p>
        </div>
        <Button
          variant="secondary"
          className="bg-white text-black hover:bg-white/90"
          onClick={() => navigate("/")}
        >
          Return to landing page
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-0">
      <header className="sticky top-0 z-20">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </header>
      
      <main className="pt-0 pb-8">
        {currentView === 'search' && <SearchInterface />}
        {currentView === 'pitchBuilder' && <PitchBuilder />}
        {currentView === 'catalogue' && <MusicCatalog />}
      </main>
    </div>
  );
};

export default Index;
