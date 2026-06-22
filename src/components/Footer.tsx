import { useNavigate } from "react-router-dom";
import { useRef, MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Footer Component
 * Displays site-wide footer with CTA section and social links
 * Features:
 * - Early access CTA button with interactive hover effect
 * - Social media links (Instagram, LinkedIn, Email)
 * - Copyright information
 * - Viola branding elements
 */
const Footer = () => {
  // React Router navigation hook
  const navigate = useNavigate();

  // Refs for storing button elements for hover effects
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Creates a radial gradient effect that follows the mouse cursor on buttons
   * Updates CSS custom properties (--mouse-x, --mouse-y) for the gradient position
   */
  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    const button = buttonRefs.current[index];
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    button.style.setProperty('--mouse-x', `${x}px`);
    button.style.setProperty('--mouse-y', `${y}px`);
  };

  /**
   * Navigates user to the waitlist page
   */
  const handleJoinWaitlist = () => {
    navigate("/waitlist");
  };

  return (
    <footer
      className="relative rounded-2xl overflow-hidden inset-shadow-lg inset-shadow-indigo-500"
      style={{
        border: "1px solid transparent",
        backgroundImage:
          "linear-gradient(black, black), linear-gradient(to bottom, rgba(255, 255, 255, 0.4), black)",
        backgroundOrigin: "padding-box, border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {/* CTA Section */}
      <section className="px-6 md:px-12 py-16 md:py-24 mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-zen">
            Ready to <span className="italic">revolutionize</span> your music discovery?
          </h2>
          <p className="text-base md:text-lg text-white/60 font-dm mb-8">
            Join our waitlist to efficiently streamline the music licensing process.
          </p>

          <Button ref={(el) => (buttonRefs.current[3] = el)}
              onMouseMove={(e) => handleMouseMove(e, 3)}
              className="group relative transition duration-500 text-base mb-12 px-8 py-6 rounded-xl glass-btn glass-btn-primary overflow-hidden before:absolute before:inset-0 before:rounded-xl before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:bg-[radial-gradient(circle_100px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent)]"
              onClick={handleJoinWaitlist}
            >
              <span className="relative z-10">Join the Waitlist</span>
              <ArrowRight className="w-4 h-4 ml-2 relative z-10" />
            </Button>

          <div className="flex gap-4 justify-center">
              <a
                href="https://www.instagram.com/viola.labs/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/30 hover:border-white/50 hover:bg-white/10 hover:text-white transition duration-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/violalabs/posts/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/30 hover:border-white/50 hover:bg-white/10 hover:text-white transition duration-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="mailto:viola@theviola.co"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/30 hover:border-white/50 hover:bg-white/10 hover:text-white transition duration-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-6 md:px-12 py-6">
        <p className="text-xs text-white/40 text-center font-dm">
          &copy; {new Date().getFullYear()} Viola Labs LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
