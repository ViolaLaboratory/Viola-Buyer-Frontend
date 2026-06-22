import { useRef, useState, MouseEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy } from "lucide-react";
import Footer from "@/components/Footer";

/**
 * LogoMark Component
 * Displays the Viola logo SVG used in the header
 */
const LogoMark = () => (
  <svg
    viewBox="0 0 72 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
  >
    <path
      d="M35.1375 54.8993C35.0844 55.8883 32.5205 49.348 31.3059 46.0832C30.7393 44.5589 36.4796 44.8638 38.059 44.4916C43.6789 43.1622 55.2446 38.3589 56.4097 21.2373C56.9727 12.96 47.7159 9.45769 47.7974 5.56189C47.9143 1.0616e-06 55.6802 0.127614 55.6802 0.127614L69.3741 0C71.2723 0.0460832 72.5223 1.98867 71.7857 3.73983L50.9491 53.2438C50.5277 54.2435 49.5503 54.8922 48.4667 54.8922H35.1375V54.8993Z"
      fill="white"
    />
    <path
      d="M16.1494 4.20421L37.6163 51.4359C38.3635 53.0807 37.0604 54.8993 35.1339 54.8993H24.8396C23.7559 54.8993 22.7786 54.2966 22.3572 53.375L1.23368 4.20421"
      fill="white"
    />
    <path
      d="M23.4124 53.5274L0.213799 4.07659C-0.533402 2.38215 0.769773 0.506915 2.69621 0.506915H12.9906C14.0742 0.506915 15.0516 1.12727 15.473 2.08083L37.8324 52.7582"
      fill="white"
    />
  </svg>
);

/**
 * ThankYou Page Component
 * Displays confirmation page after waitlist signup
 * Features:
 * - Animated check badge confirmation
 * - Shareable waitlist URL with copy functionality
 * - Social media sharing buttons (Twitter, LinkedIn, Facebook)
 * - Animated viola background with heatwave effect
 */
const ThankYou = () => {
  // State for copy button feedback
  const [copied, setCopied] = useState(false);

  // URL for sharing the waitlist page
  const waitlistUrl = window.location.origin + "/waitlist";

  // Pre-written share text for different platforms
  const shareMessages = {
    twitter: "Just joined the @ViolaLabs waitlist! 🎵\n\nViola is building AI-powered music discovery for sync teams—helping tastemakers find, shortlist, and clear the right track in under 30 minutes.\n\nIf you work in sync, this is for you:",
    linkedin: "Excited to join the Viola waitlist!\n\nViola is revolutionizing music discovery for sync professionals with AI that understands natural language searches—no more endless scrolling or keyword guessing.\n\nKey features:\n• Find tracks in seconds with conversational search\n• Smart curation tools that learn your taste\n• Integrated licensing workflow\n\nIf you're in sync/music supervision, check it out:",
    facebook: "Just joined the Viola waitlist! 🎵 If you work in music sync or supervision, you need to see this—AI-powered search that actually understands what you're looking for. From brief to cleared track in under 30 minutes.",
    email: `Hi there,

I just joined the Viola waitlist and thought you might be interested!

Viola is an AI music workspace built specifically for sync teams and music supervisors. It helps you find, shortlist, and clear the right track without losing your day or sanity.

Key features:
• Natural language search - just describe what you need
• Smart curation tools that remember your taste
• Integrated licensing workflow

If you work in sync, this could be a game-changer.

Check it out: ${waitlistUrl}

Best,`,
  };

  // React Router navigation hook
  const navigate = useNavigate();

  // Refs for button hover effects with radial gradient
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Copies the waitlist URL to clipboard and shows temporary feedback
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(waitlistUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Opens social media share dialog for the specified platform with pre-filled text
   * @param platform - "twitter", "linkedin", "facebook", or "email"
   */
  const handleSocialShare = (platform: keyof typeof shareMessages) => {
    let shareUrl = "";
    const message = shareMessages[platform];
    const encodedUrl = encodeURIComponent(waitlistUrl);

    switch (platform) {
      case "twitter":
        // Twitter combines text and URL in the text parameter
        const twitterText = `${message}\n${waitlistUrl}`;
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
        break;
      case "linkedin":
        // LinkedIn only takes URL, text is not pre-fillable via URL
        // Users will need to add their own text, but we can show a suggestion
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        // Note: LinkedIn doesn't support pre-filled text via URL parameters
        break;
      case "facebook":
        // Facebook only takes URL in the share dialog
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "email":
        // Email with pre-filled subject and body
        const subject = "Check out Viola - AI Music Discovery for Sync";
        shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        break;
    }

    if (shareUrl) {
      if (platform === "email") {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  /**
   * Scrolls to top of page on mount
   * Ensures users see the confirmation message when navigating from waitlist form
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Creates a radial gradient effect that follows the mouse cursor on buttons
   * Used for the interactive hover effect on the "Back to landing" button
   */
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    const button = buttonRefs.current[index];
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    button.style.setProperty("--mouse-x", `${x}px`);
    button.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="relative min-h-screen bg-black text-foreground flex flex-col">
      <style>
        {`
          @keyframes badge-pop {
            0% { transform: scale(0.6); opacity: 0; }
            60% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes check-draw {
            0% { stroke-dashoffset: 60; opacity: 0; transform: rotate(-6deg) scale(0.9); }
            60% { stroke-dashoffset: 0; opacity: 1; transform: rotate(4deg) scale(1.05); }
            100% { stroke-dashoffset: 0; opacity: 1; transform: rotate(0deg) scale(1); }
          }
          .badge-animate {
            animation: badge-pop 520ms ease-out forwards;
          }
          .check-animate {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            animation: check-draw 620ms ease-out forwards 120ms;
          }
        `}
      </style>
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(122,35,204,0.16),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(238,72,31,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 opacity-10 mix-blend-screen viola-glow-bg scale-[1.05] animate-heatwave heatwave-allow-mobile"></div>
      </div>
      {/* Header with Logo */}
      <header className="flex items-center justify-between px-6 py-6 sticky top-0 backdrop-blur-xl border-b border-white/10 z-20 bg-transparent">
        <div className="flex items-center gap-3">
          <LogoMark />
        </div>
        <div className="flex items-center gap-3">
          <Button
            ref={(el) => (buttonRefs.current[0] = el)}
            onMouseMove={(e) => handleMouseMove(e, 0)}
            className="group relative transition duration-500 ease-in-out hover:cursor-pointer rounded-2xl border border-white px-6 py-2 font-medium bg-transparent text-white min-w-[150px] hover:border-white/40 hover:bg-white/10 overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[radial-gradient(circle_80px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.15),transparent)]"
            onClick={() => navigate("/")}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Back to home
            </span>
          </Button>
        </div>
      </header>

      {/* Thank You Section */}
      <main className="relative flex-1 flex items-center bg-white/0 justify-center px-4 sm:px-6 py-10 sm:py-12 font-dm overflow-hidden z-10">
        <div className="w-full max-w-2xl text-center relative px-2">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/15 border border-white/70 rounded-full flex items-center justify-center mx-auto mb-6 badge-animate">
              <Check className="w-10 h-10 text-white check-animate" strokeWidth={3} aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-zen text-white">
              You're on the list!
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-2">
            You’ll be among the first to try Viola when we open early access.
            </p>
          </div>

          <div className="bg-white/10 border border-white/40 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 font-zen text-white">Share with friends</h2>

            {/* Copy Link */}
            <div className="mb-6">
              <label className="text-sm text-white mb-2 block">
                Copy waitlist link
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={waitlistUrl}
                  readOnly
                  aria-label="Waitlist link"
                  className="flex-1 bg-black/40 border-white/20 text-white"
                />
                <Button
                  onClick={handleCopy}
                  className="w-full sm:w-auto px-6 rounded-md transition duration-500 glass-btn glass-btn-primary"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <label className="text-sm text-white mb-3 block">
                Share with your network
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={() => handleSocialShare("twitter")}
                  variant="outline"
                  size="lg"
                  title="Share on Twitter with pre-filled message"
                  className="border-white/20 transition duration-300 ease-in-out text-white hover:bg-white/10"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </Button>
                <Button
                  onClick={() => handleSocialShare("linkedin")}
                  variant="outline"
                  size="lg"
                  title="Share on LinkedIn"
                  className="border-white/20 transition duration-300 ease-in-out text-white hover:bg-white/10"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </Button>
                <Button
                  onClick={() => handleSocialShare("facebook")}
                  variant="outline"
                  size="lg"
                  title="Share on Facebook"
                  className="border-white/20 transition duration-300 ease-in-out text-white hover:bg-white/10"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  Facebook
                </Button>
                
              </div>
             
            </div>
          </div>

          <p className="text-sm text-white">
            We'll notify you when Viola launches. Stay tuned!
          </p>
        </div>
      </main>
      <div className="z-30">
        <Footer/>
      </div>

     
    </div>
  );
};

export default ThankYou;
