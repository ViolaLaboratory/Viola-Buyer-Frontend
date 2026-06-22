import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  currentView: 'search' | 'pitchBuilder' | 'catalogue';
  onViewChange: (view: 'search' | 'pitchBuilder' | 'catalogue') => void;
}

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

const tabStyles = {
  search: {
    border: "border-black",
    text: "text-[#F7F8FF]",
    hover: "transition-all duration-500 ease-in-out hover:bg-[#C0C0C0]/20 hover:text-black hover:bg-white hover:shadow-white hover:border-white",
    active: "bg-[#C0C0C0]/20 border-[#C0C0C0] text-foreground",
  },
  pitchBuilder: {
    border: "border-black",
    text: "text-[#F7F8FF]",
    hover: "transition-all duration-500 ease-in-out hover:bg-[#F0FF5A] hover:text-[#1B1F05] hover:shadow-[0_0_18px_rgba(240,255,90,0.55)] hover:border-[#F0FF5A]",
    active: "bg-[#C4D82E]/20 border-[#C4D82E] text-foreground",
  },
  catalogue: {
    border: "border-black",
    text: "text-[#F7F8FF]",
    hover: "transition-all duration-500 ease-in-out hover:bg-[#FF1F2A] hover:text-black hover:shadow-[0_0_18px_rgba(255,90,95,0.55)] hover:border-[#FF1F2A]",
    active: "bg-[#FF5A5F]/20 border-[#FF5A5F] text-foreground",
  },
} satisfies Record<
  NavigationProps["currentView"],
  { border: string; text: string; hover: string; active: string }
>;

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-black backdrop-blur-md relative z-50">
      <div className="flex items-center px-6 py-4 justify-between">
        <div className="flex items-center gap-6">
          <LogoMark />
          <nav className="flex items-center gap-3">
            {(["search", "pitchBuilder", "catalogue"] as NavigationProps["currentView"][]).map((view) => {
              const style = tabStyles[view];
              const isActive = currentView === view;
              return (
                <Button
                  key={view}
                  variant="ghost"
                  onClick={() => onViewChange(view)}
                  className={`rounded-2xl border px-6 py-2 font-medium transition-colors duration-200 bg-transparent min-w-[150px] ${style.border} ${style.text} ${style.hover} ${
                    isActive ? style.active : ""
                  }`}
                >
                  {view === "pitchBuilder"
                    ? "Pitch Builder"
                    : view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="rounded-2xl border border-white/20 px-6 py-2 font-medium transition-all duration-300 bg-transparent text-white hover:bg-white/10 hover:border-white/40"
          >
            Home
          </Button>
          <Button
            onClick={() => navigate("/waitlist")}
            className="rounded-2xl px-6 py-2 font-medium glass-btn glass-btn-primary"
          >
            Join Waitlist
          </Button>
          <img
            src="/viola-logo.jpg"
            alt="User Profile Photo"
            className="w-12 h-12 rounded-full" />
        </div>
      </div>
    </header>
  );
};
