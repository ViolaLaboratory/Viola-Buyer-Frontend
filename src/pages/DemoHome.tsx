import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, MessageSquare, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const RECENT_CHATS = [
  "Hip-Hop, 130 bpm, raspy voice",
  "R&B, Female Vocals, C# major, Piano",
];

const USE_CASES = [
  "Product Commercials",
  "Video Game Soundtracks",
  "Fashion Commercials",
  "Trailers",
  "Horror Films",
];

const typingPhrases = [
  "Your next song is found when you type...",
  "Spooky choirs for a late-night chase...",
  "Dark synths with a slow burn...",
  "Cinematic builds that hit at 1:10...",
];

const DemoHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.username?.trim().split(/\s+/)[0] || "there";
  const [query, setQuery] = useState("");
  const [placeholderText, setPlaceholderText] = useState(" ");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIndex];
    const typingSpeed = isDeleting ? 35 : 55;
    const pauseDuration =
      !isDeleting && charIndex === currentPhrase.length ? 1100 : typingSpeed;
    const timeout = window.setTimeout(() => {
      if (!isDeleting && charIndex < currentPhrase.length) {
        const nextCharIndex = charIndex + 1;
        setPlaceholderText(currentPhrase.slice(0, nextCharIndex));
        setCharIndex(nextCharIndex);
        return;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && charIndex > 0) {
        const nextCharIndex = charIndex - 1;
        setPlaceholderText(currentPhrase.slice(0, nextCharIndex) || " ");
        setCharIndex(nextCharIndex);
        return;
      }

      if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % typingPhrases.length);
      }
    }, pauseDuration);

    return () => window.clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate("/demo/search", { state: { query: query.trim() } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white font-exo">

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-6">
        <div className="w-full max-w-5xl space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal font-dm drop-shadow-[0_0_18px_rgba(255,255,255,0.2)]">
              What are we up to today, {firstName}?
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <img
                  src="/flower.png"
                  alt="Search"
                  className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 opacity-60 z-20 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]"
                />
                <Input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={placeholderText}
                  className="demo-search-input h-16 w-full rounded-full border border-white/20 bg-white/10 pl-16 pr-16 text-base text-white placeholder:text-white/75 shadow-[0_0_24px_rgba(255,255,255,0.12)] backdrop-blur-md focus:border-white/50 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  type="submit"
                  className={`absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.35)] transition duration-300 ease-out ${
                    query.trim().length > 0
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  aria-label="Search"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>

          {/* ─── RECENT CHATS & USE CASES ─── */}
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Recent Chats */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-5 w-5 text-white/70" />
                <h2 className="text-xl font-semibold text-white">Recent Chats</h2>
              </div>
              <div className="space-y-2">
                {RECENT_CHATS.map((chat) => (
                  <button
                    key={chat}
                    onClick={() => {
                      setQuery(chat);
                      navigate("/demo/search", { state: { query: chat } });
                    }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4 text-white/50" />
                    </div>
                    <span className="text-white/80 text-sm">{chat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <svg className="h-5 w-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h2 className="text-xl font-semibold text-white">Use Cases</h2>
              </div>
              <div className="space-y-2">
                {USE_CASES.map((useCase) => (
                  <button
                    key={useCase}
                    onClick={() => {
                      setQuery(useCase);
                      navigate("/demo/search", { state: { query: useCase } });
                    }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Video className="h-4 w-4 text-white/50" />
                    </div>
                    <span className="text-white/80 text-sm">{useCase}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoHome;
