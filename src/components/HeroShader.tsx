import { useEffect, useState } from "react";
import { MeshGradient, meshGradientPresets } from "@paper-design/shaders-react";

/**
 * Hero shader — the one bold moment (Pass 2).
 *
 * Animated mesh-gradient seeded with the brand spectrum (amber → orange → violet → ink),
 * with the library's built-in grain overlay (kills banding + the AI-smooth-gradient look).
 * Rendered via WebGL (shaders.com / paper-design).
 *
 * Client-only + lazy + conditional — it never blocks first paint, and it only runs where
 * it earns its keep. Everywhere else it stays the static CSS gradient:
 *   - no WebGL context (older Safari, locked-down browsers)
 *   - prefers-reduced-motion: reduce
 *   - mobile / small screens (battery + runtime smoothness)
 */
const SPECTRUM = ["#FFD65C", "#F76213", "#7A23CC", "#16042F"];

function canRunShader(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(max-width: 768px)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HeroShader() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!canRunShader()) return;
    // defer past first paint so the shader never blocks LCP
    const id = window.requestAnimationFrame(() => setOn(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Static fallback: pre-mount, no-WebGL, reduced-motion, and mobile all land here.
  if (!on) {
    return <div aria-hidden className="absolute inset-0 hero-gradient-fallback" />;
  }

  return (
    <div aria-hidden className="absolute inset-0">
      <MeshGradient
        {...meshGradientPresets[0].params}
        colors={SPECTRUM}
        speed={0.3}
        distortion={0.85}
        swirl={0.12}
        grainOverlay={0.16}
        className="absolute inset-0 h-full w-full"
      />
      {/* radial bloom from one region + top/bottom dark scrim → headline legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_30%,transparent,rgba(9,9,11,0.55)_78%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/30 via-transparent to-[#09090b]" />
    </div>
  );
}
