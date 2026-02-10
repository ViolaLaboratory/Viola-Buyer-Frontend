/**
 * HomePage Component
 * Main landing page for the demo application
 * Features:
 * - Centered search input
 * - Mouse-following gradient background
 * - Personalized greeting
 */

import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const HomePage = () => {
  const navigate = useNavigate();

  /* STATE: Search query input */
  const [query, setQuery] = useState("");

  /* STATE: Background gradient shift based on mouse position */
  const [backgroundShift, setBackgroundShift] = useState({ x: 50, y: 50 });

  /* EFFECT: Track mouse movement to create fluid background effect */
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;

      // Convert mouse position to percentage
      const xPercent = (event.clientX / innerWidth) * 100;
      const yPercent = (event.clientY / innerHeight) * 100;

      // Apply subtle movement (20% of mouse movement)
      setBackgroundShift({
        x: 50 + (xPercent - 50) * 0.2,
        y: 50 + (yPercent - 50) * 0.2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* HANDLER: Submit search query */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      // Navigate to search page with query in state
      navigate('/demo/search', { state: { query: query.trim() } });
    }
  };

  return (
    <div
      className={`
        /* SIZE: Full screen */
        relative min-h-screen

        /* LAYOUT: Center content vertically and horizontally */
        flex items-center justify-center

        /* PADDING: Screen padding */
        px-8

        /* COLORS: Black base background */
        bg-black

        /* OVERFLOW: Prevent scrollbars from background effects */
        overflow-hidden
      `}
      style={{
        /* CUSTOM PROPERTIES: Pass background shift to CSS */
        ['--bg-x' as string]: `${backgroundShift.x}%`,
        ['--bg-y' as string]: `${backgroundShift.y}%`,
      }}
    >
      {/*
        BACKGROUND LAYER 1: Blurred image background
        Uses viola.jpg with blur and saturation effects
      */}
      <div
        className={`
          /* POSITION: Fixed behind content */
          fixed inset-0 z-[-2]

          /* BACKGROUND: Image from /public folder */
          bg-[url('/viola.jpg')]

          /* SIZE & POSITION: Oversized and responsive to mouse */
          bg-[length:200%_200%]
          bg-no-repeat

          /* FILTERS: Blur and color enhancement */
          blur-[22px]
          saturate-[2]

          /* TRANSFORM: Subtle movement based on mouse position */
          scale-[1.3]

          /* ANIMATION: Smooth transitions */
          transition-transform duration-[350ms] ease-out

          /* OPACITY: Slightly transparent */
          opacity-90
        `}
        style={{
          backgroundPosition: `var(--bg-x, 50%) var(--bg-y, 50%)`,
        }}
      />

      {/*
        BACKGROUND LAYER 2: Gradient overlay
        Creates purple/orange/pink gradient that follows mouse
      */}
      <div
        className={`
          /* POSITION: Fixed behind content but above image layer */
          fixed inset-0 z-[-1]

          /* BLEND MODE: Screen mode for vibrant colors */
          mix-blend-screen

          /* FILTERS: Additional blur */
          blur-[22px]

          /* OPACITY: Transparent overlay */
          opacity-90

          /* ANIMATION: Smooth transitions */
          transition-transform duration-[250ms] ease-out
        `}
        style={{
          /* GRADIENT: Complex radial gradients for depth */
          backgroundImage: `
            radial-gradient(
              circle at calc(var(--bg-x, 50%) + 5%) calc(var(--bg-y, 50%) + 8%),
              rgba(255, 214, 92, 0.55),
              rgba(247, 98, 19, 0.4) 18%,
              rgba(122, 35, 204, 0.55) 42%,
              rgba(22, 4, 47, 0.8) 70%
            ),
            radial-gradient(
              circle at calc(var(--bg-x, 50%) - 10%) calc(var(--bg-y, 50%) - 12%),
              rgba(0, 0, 0, 0.35),
              transparent 45%
            ),
            linear-gradient(
              120deg,
              rgba(16, 0, 32, 0.95),
              rgba(45, 3, 81, 0.95)
            )
          `,
        }}
      />

      {/* CONTENT CONTAINER: Centered content */}
      <div
        className={`
          /* SIZE: Max width for readability */
          max-w-4xl w-full

          /* SPACING: Vertical spacing for elements */
          space-y-8

          /* Z-INDEX: Above background layers */
          relative z-10
        `}
      >
        {/* HEADING: Personalized greeting */}
        <h1
          className={`
            /* SIZE: Large text */
            text-5xl md:text-6xl

            /* WEIGHT: Semi-bold */
            font-semibold

            /* COLOR: White text */
            text-white

            /* ALIGNMENT: Center */
            text-center

            /* FONT: Use DM Sans font from theme */
            font-sans

            /* ANIMATION: Fade in on load */
            animate-in fade-in duration-700
          `}
        >
          What are we up to today, Sarah?
        </h1>

        {/* SEARCH FORM: Input and submit button */}
        <form
          onSubmit={handleSubmit}
          className={`
            /* LAYOUT: Horizontal flex */
            flex items-center gap-4

            /* SIZE: Full width */
            w-full

            /* ANIMATION: Fade in with delay */
            animate-in fade-in duration-700 delay-200
          `}
        >
          {/* INPUT CONTAINER: Wrapper for styling */}
          <div
            className={`
              /* FLEX: Take remaining space */
              flex-1

              /* POSITION: Relative for pseudo-elements */
              relative
            `}
          >
            {/* INPUT: Search query input */}
            <Input
              type="text"
              placeholder="Your next song is found when you type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`
                /* SIZE: Full width, large height */
                w-full h-14

                /* PADDING: Horizontal padding for text */
                px-6

                /* COLORS: Transparent background with white border */
                bg-black/40 backdrop-blur-sm
                border-2 border-white/20

                /* TEXT: Large white text */
                text-lg text-white
                placeholder:text-white/50

                /* SHAPE: Rounded */
                rounded-2xl

                /* FOCUS: Glow effect on focus */
                focus:border-white/40
                focus:ring-2 focus:ring-white/20
                focus:shadow-[0_0_20px_rgba(255,255,255,0.15)]

                /* HOVER: Subtle glow on hover */
                hover:border-white/30
                hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]

                /* ANIMATION: Smooth transitions */
                transition-all duration-300
              `}
            />
          </div>

          {/* SUBMIT BUTTON: Arrow button to submit search */}
          <Button
            type="submit"
            disabled={!query.trim()}
            className={`
              /* SIZE: Square button */
              h-14 w-14

              /* PADDING: None (icon centered) */
              p-0

              /* COLORS: White background */
              bg-white hover:bg-white/90

              /* SHAPE: Circular */
              rounded-full

              /* DISABLED: Lower opacity when disabled */
              disabled:opacity-40
              disabled:cursor-not-allowed
              disabled:hover:bg-white

              /* SHADOW: Subtle glow */
              shadow-lg hover:shadow-xl

              /* ANIMATION: Smooth transitions */
              transition-all duration-300

              /* HOVER: Scale up slightly */
              hover:scale-105
              active:scale-95
            `}
          >
            <ArrowRight className="h-6 w-6 text-black" />
          </Button>
        </form>

        {/* HELPER TEXT: Subtitle (optional) */}
        <p
          className={`
            /* TEXT: Small, centered, muted */
            text-center text-white/60 text-sm

            /* ANIMATION: Fade in with delay */
            animate-in fade-in duration-700 delay-300
          `}
        >
          Describe the music you're looking for, and we'll find it for you
        </p>
      </div>
    </div>
  );
};
