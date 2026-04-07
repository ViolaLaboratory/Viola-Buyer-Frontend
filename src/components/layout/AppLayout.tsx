/**
 * AppLayout Component
 * Main layout wrapper for all demo pages
 * Provides:
 * - Sidebar navigation
 * - Content area
 * - Mobile blocking (reused from Index.tsx)
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedVLogo from "@/components/AnimatedVLogo";
import { Sidebar } from "./Sidebar";
import { CustomCursor } from "./CustomCursor";
import { CatalogMusicPlayerBar } from "@/components/CatalogMusicPlayerBar";
import { getSidebarCollapsed } from "@/services/sidebarStateService";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showMusicPlayer = location.pathname.includes("/catalog") || location.pathname.includes("/marketplace/discover");

  /* STATE: Mobile detection */
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    getSidebarCollapsed()
  );

  /* EFFECT: Detect mobile screens (soft-block demo on mobile) */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 1024px)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* EFFECT: Scroll to top when layout mounts */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.classList.add("demo-cursor");
    return () => document.body.classList.remove("demo-cursor");
  }, []);

  useEffect(() => {
    const syncState = () => setIsSidebarCollapsed(getSidebarCollapsed());
    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener("sidebarStateChanged", syncState);
    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("sidebarStateChanged", syncState);
    };
  }, []);

  /* MOBILE BLOCKING: Show message on small screens */
  if (isMobile) {
    return (
      <div
        className={`
          /* SIZE: Full screen */
          min-h-screen

          /* COLORS: Black background, white text */
          bg-black text-white

          /* LAYOUT: Center content */
          flex flex-col items-center justify-center

          /* PADDING: Screen padding */
          px-6 py-12

          /* TEXT: Center align */
          text-center

          /* SPACING: Vertical spacing */
          space-y-6
        `}
      >
        <div className="flex flex-col space-y-3 items-center gap-3">
          {/* LOGO: Animated V logo */}
          <AnimatedVLogo />

          {/* HEADING: Demo unavailable message */}
          <p className="text-sm uppercase tracking-[0.2em] text-white pt-10">
            Demo unavailable on mobile
          </p>

          <h1 className="text-3xl font-semibold font-zen">
            Please view the demo on desktop
          </h1>

          {/* DESCRIPTION: Helpful context */}
          <p className="text-white/70">
            The interactive search, catalog, and pitch builder are best experienced on a larger screen.
            Head back to the landing page for details, or open this link from your computer.
          </p>
        </div>

        {/* BUTTON: Return to landing page */}
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

  /* DESKTOP LAYOUT: Sidebar + Content */
  return (
    <div
      data-demo-layout
      style={{
        ["--sidebar-width" as string]: isSidebarCollapsed ? "70px" : "240px",
      }}
      className={`
        /* LAYOUT: Relative positioning for fixed sidebar */
        relative

        /* SIZE: Full screen height and width */
        h-screen w-full

        /* OVERFLOW: Prevent horizontal clipping */
        overflow-x-hidden

        /* TEXT: Foreground color */
        text-foreground

        px-0 mx-0

      `}
    >
      <div className="fixed inset-0 z-0 bg-[url('/viola.jpg')] bg-[length:360%_360%] bg-[position:75%_50%] bg-no-repeat blur-[36.4px] saturate-[2.4] contrast-[0.7] scale-[1.25] opacity-90" />
      <div className="fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.95)_50%,rgba(0,0,0,0)_100%)]" />

      <CustomCursor />
      {/* SIDEBAR: Navigation */}
      <Sidebar />

      {/* MAIN CONTENT: Page content */}
      <main
        style={{
          marginLeft: "var(--sidebar-width)",
          width: "calc(100% - var(--sidebar-width))",
          boxSizing: "border-box",
        }}
        className={`
          /* SIZE: Full height */
          h-screen

          /* POSITIONING: Relative with z-index */
          relative z-10

          /* OVERFLOW: Hidden to prevent scrollbars */
          overflow-hidden

          /* 하단 플레이어 공간 확보 */
          ${showMusicPlayer ? "pb-[88px]" : ""}

          /* CUSTOM SCROLLBAR: (optional, can style in global CSS) */
          /* scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent */
        `}
      >
        {children}
      </main>

      {/* Catalog/Pitch Kit 공통 플레이어 - body에 Portal로 렌더링, 잘림 방지 */}
      {showMusicPlayer && (
        <CatalogMusicPlayerBar sidebarWidth={isSidebarCollapsed ? "70px" : "240px"} />
      )}
    </div>
  );
};
