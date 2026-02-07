import { FormEvent, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

interface ChatEntry {
  role: string;
  message: string;
}

interface ChatPanelProps {
  conversationHistory: ChatEntry[];
  waitingForResponse: boolean;
  isLoading: boolean;
  showResults: boolean;
  thinkingText: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ChatPanel = ({
  conversationHistory,
  waitingForResponse,
  isLoading,
  showResults,
  thinkingText,
  searchQuery,
  onSearchChange,
  onSubmit,
}: ChatPanelProps) => {
  const defaultText = "Updating Brief Instructions...";
  const [typedText, setTypedText] = useState("");
  const charIndexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseCountRef = useRef(0);

  useEffect(() => {
    if (!(isLoading || showResults)) {
      setTypedText("");
      charIndexRef.current = 0;
      pauseCountRef.current = 0;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const textToType = thinkingText || defaultText;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const currentTextToType = thinkingText || defaultText;
      
      if (charIndexRef.current < currentTextToType.length) {
        // Typing forward
        charIndexRef.current++;
        setTypedText(currentTextToType.slice(0, charIndexRef.current));
      } else {
        // Finished typing, pause briefly then restart
        pauseCountRef.current++;
        if (pauseCountRef.current > 30) { // ~1.5 seconds at 50ms intervals
          charIndexRef.current = 0;
          setTypedText("");
          pauseCountRef.current = 0;
        }
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading, showResults, thinkingText, defaultText]);

  // Deduplicate consecutive identical bot messages (e.g. from older saved sessions)
  const dedupedHistory = conversationHistory.filter((entry, index) => {
    if (entry.role !== "bot") return true;
    const prev = conversationHistory[index - 1];
    return !(prev?.role === "bot" && prev?.message === entry.message);
  });

  return (
  <section className="w-1/3 min-w-0 flex flex-col bg-[rgba(0,0,0,0.33)] backdrop-blur-[26px] border-r border-white/40 shadow-[inset_0_0_35.4px_rgba(255,255,255,0.15)] h-screen font-exo">
    <div className="flex-1 space-y-5 overflow-y-auto pr-2 px-6 py-8">
      {dedupedHistory.map((entry, index) => (
        <div
          key={`${entry.role}-${index}`}
          className={`text-sm leading-relaxed ${
            entry.role === "user"
              ? "ml-auto max-w-max rounded-[17px] bg-white/8 px-4 py-3 backdrop-blur-[10px] shadow-[0_0_13px_rgba(255,255,255,0.16),inset_0_0_4px_rgba(255,255,255,0.08)] relative z-10 mr-4"
              : "text-white/80"
          }`}
        >
          {entry.message}
        </div>
      ))}
      {dedupedHistory.length > 0 &&
        dedupedHistory[dedupedHistory.length - 1]?.role === "user" && (
          <div className="text-white/70 text-sm leading-relaxed">
            im working on that now.
          </div>
        )}
      {waitingForResponse && (
        <div className="text-white/60 text-xs tracking-wide">
          Updating brief instructions...
        </div>
      )}
    </div>

    <div className="pt-4 px-6">
      {(isLoading || showResults) && (
        <div className="flex items-center h-12 gap-3 pb-3 text-white/60 pl-3">
          <img src="/flower.png" alt="Status" className="h-5 w-5" />
          <span className="italic text-sm">
            {typedText}
            <span className="animate-pulse">|</span>
          </span>
        </div>
      )}
      <form onSubmit={onSubmit} className="relative">
        <Input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={dedupedHistory.length > 0 ? "Ask Away" : ""}
          className="h-12 w-full rounded-full border border-white/15 bg-black/40 pl-5 pr-12 text-sm text-white placeholder:text-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white text-black flex items-center justify-center transition duration-300"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="text-[11px] text-white/40 py-3 text-center">
        viola is still in development. leave us feedback{" "}
        <a href="#" className="underline">
          here
        </a>
        .
      </p>
    </div>
  </section>
  );
};
