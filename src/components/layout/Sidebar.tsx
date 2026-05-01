/**
 * Sidebar Component
 * Collapsible navigation sidebar with:
 * - V logo (click to go home)
 * - Toggle button (collapse/expand)
 * - Main navigation (Search, Drive, Pitch Kit, Catalog)
 * - Profile photo (bottom)
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ListMusic, PanelLeft, Trash2, Home, ShoppingCart, Wrench, LayoutGrid } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getChatHistory, getChatsFromBackend, deleteChatSession, deleteChatFromBackend, type ChatSession } from "@/services/chatHistoryService";
import { getSidebarCollapsed, setSidebarCollapsed } from "@/services/sidebarStateService";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeProfileImageUrl } from "@/utils/profileImage";

/* V LOGO COMPONENT: Extracted from original Navigation.tsx */
const VLogo = () => (
  <svg
    viewBox="0 0 72 55"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
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

type NavItem =
  | { readonly id: string; readonly label: string; readonly icon: typeof Home; readonly path: string }
  | {
      readonly id: string;
      readonly label: string;
      readonly iconType: "image";
      readonly iconSrc: string;
      readonly path: string;
    };

const BUYER_NAV_ITEMS: readonly NavItem[] = [
  { id: "marketplace", label: "Marketplace", icon: Home, path: "/demo/marketplace" },
  { id: "search", label: "Search", iconType: "image", iconSrc: "/flower.png", path: "/demo/home" },
  { id: "catalog", label: "Catalog", icon: ListMusic, path: "/demo/marketplace/discover" },
  { id: "shoppingCart", label: "Shopping Cart", icon: ShoppingCart, path: "/demo/checkout" },
];

const SELLER_NAV_ITEMS: readonly NavItem[] = [
  { id: "marketplace", label: "Marketplace", icon: Home, path: "/demo/marketplace" },
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, path: "/demo/dashboard" },
  { id: "search", label: "Search", iconType: "image", iconSrc: "/flower.png", path: "/demo/home" },
  { id: "pitchKit", label: "Pitch Kit", icon: Wrench, path: "/demo/pitch-kit" },
  { id: "catalog", label: "Catalog", icon: ListMusic, path: "/demo/catalog" },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.portal === "seller" ? SELLER_NAV_ITEMS : BUYER_NAV_ITEMS;

  /* STATE: Sidebar collapse/expand */
  const [isCollapsed, setIsCollapsed] = useState(() => getSidebarCollapsed());
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const loadChatHistory = () => {
      setChatSessions(getChatHistory());
    };

    const loadMerged = async () => {
      try {
        const fromBackend = await getChatsFromBackend();
        const local = getChatHistory();
        const byId = new Map<string, ChatSession>();
        local.forEach((s) => byId.set(s.id, s));
        fromBackend.forEach((s) => byId.set(s.id, s));
        const merged = Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 50);
        setChatSessions(merged);
      } catch {
        loadChatHistory();
      }
    };

    loadMerged();
    window.addEventListener("storage", loadChatHistory);
    window.addEventListener("chatHistoryUpdated", loadMerged);

    return () => {
      window.removeEventListener("storage", loadChatHistory);
      window.removeEventListener("chatHistoryUpdated", loadMerged);
    };
  }, []);

  /* HANDLER: Toggle sidebar collapse state */
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    setSidebarCollapsed(newState);
    window.dispatchEvent(new Event("sidebarStateChanged"));
  };

  const handleLogoClick = () => {
    navigate("/demo/marketplace");
  };

  const handleNavClick = (path: string) => {
    if (path === "/demo/search" && location.pathname.startsWith("/demo/search")) {
      navigate("/demo/search", { state: { reset: true }, replace: true });
    } else {
      navigate(path);
    }
  };

  /* HANDLER: Resume chat session */
  const handleChatClick = (sessionId: string, e?: React.MouseEvent) => {
    // Don't navigate if user is trying to delete (swipe or right-click)
    if (e?.defaultPrevented) return;
    navigate(`/demo/search/${sessionId}`);
  };

  /* HANDLER: Delete chat session (local + backend) */
  const handleDeleteChat = async (sessionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) return;
    deleteChatSession(sessionId);
    try {
      await deleteChatFromBackend(sessionId);
    } catch {
      // ignore
    }
    setChatSessions(getChatHistory());
    window.dispatchEvent(new Event("chatHistoryUpdated"));
  };

  /* HELPER: Check if nav item is active */
  const isNavItemActive = (path: string) => {
    if (path === "/demo/search") {
      return location.pathname.startsWith(path);
    }
    if (path === "/demo/home") {
      return (
        location.pathname === "/demo/home" ||
        location.pathname.startsWith("/demo/search")
      );
    }
    return location.pathname === path;
  };

  /* HELPER: Format relative time for chat sessions */
  const formatRelativeTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <aside
      style={{
        width: isCollapsed ? '70px' : '240px',
      }}
      className={`
        /* HEIGHT: Full screen */
        h-screen

        /* LAYOUT: Flex column with spaced sections */
        flex flex-col justify-between

        /* COLORS: Dark translucent background */
        bg-[rgba(0,0,0,0.33)] backdrop-blur-[26px]

        /* ANIMATION: Smooth width transition */
        transition-all duration-300 ease-in-out

        /* Z-INDEX: Above content */
        fixed left-0 top-0 z-20 shadow-none
      `}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/40 to-transparent opacity-40" />

      {/* HEADER: Logo + Toggle Button */}
      <div
        className={`
          flex items-center px-4 pt-6 pb-4
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}
      >
        {!isCollapsed && (
          <button
            onClick={handleLogoClick}
            className="transition-opacity duration-200 hover:opacity-80 focus:outline-none rounded"
            aria-label="Go to home"
          >
            <VLogo />
          </button>
        )}
        <button
          onClick={handleToggleCollapse}
          className="h-9 w-9 flex items-center justify-center rounded-md text-white transition-colors focus:outline-none"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>

      {/* MAIN NAVIGATION: Search, Pitch Kit, Catalog */}
      <nav
        className={`
          px-2 py-2
          flex flex-col gap-2
        `}
      >
        {navItems.map((item) => {
          const isActive = isNavItemActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`
                flex items-center gap-3 overflow-hidden
                ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
                rounded-xl
                ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white hover:bg-white/10'
                }
                transition-all duration-200
                focus:outline-none
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* ICON: Navigation icon */}
              {"iconType" in item ? (
                <img
                  src={item.iconSrc}
                  alt=""
                  className="h-6 w-6 flex-shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]"
                />
              ) : (
                <item.icon className="h-6 w-6 flex-shrink-0 text-white" />
              )}

              {/* LABEL: Navigation text (hidden when collapsed) */}
              {!isCollapsed && (
                <span className="text-sm truncate font-dm text-white">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="flex-1 px-3 pb-4">
          <div className="text-xs font-dm uppercase tracking-[0.18em] text-white/50 px-2 py-2">
            Recent Chats
          </div>
          <ScrollArea className="h-full pr-1">
            <div className="flex flex-col gap-1">
              {user && chatSessions.length > 0 ? (
                chatSessions.map((session) => (
                  <ChatItem
                    key={session.id}
                    session={session}
                    onChatClick={handleChatClick}
                    onDelete={handleDeleteChat}
                    formatRelativeTime={formatRelativeTime}
                  />
                ))
              ) : (
                <div className="px-3 py-6 text-center text-xs text-white/40">
                  {user ? "No recent chats yet." : "Log in to see your chat history."}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="px-3 pb-6 pt-2">
        <button
          onClick={() => navigate("/demo/profile")}
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "justify-start gap-3"
          } w-full rounded-xl py-1 transition-colors hover:bg-white/5`}
          aria-label="User profile"
        >
          <div
            className={`h-12 w-12 rounded-full overflow-hidden flex-shrink-0 aspect-square ${
              isCollapsed ? "" : "shadow-[0_0_18px_rgba(255,255,255,0.2)]"
            }`}
          >
            <img
              src={normalizeProfileImageUrl(user?.profile_image)}
              alt="User profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/viola-logo.jpg";
              }}
            />
          </div>
          {!isCollapsed && (
            <div className="text-left">
              <div className="text-sm font-dm text-white">
                {user?.username || "Guest"}
              </div>
              <div className="text-xs text-white/50">
                {user?.plan || "Free plan"}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

/* CHAT ITEM COMPONENT: Handles swipe-to-delete and right-click delete */
interface ChatItemProps {
  session: ChatSession;
  onChatClick: (sessionId: string, e?: React.MouseEvent) => void;
  onDelete: (sessionId: string, e?: React.MouseEvent) => void;
  formatRelativeTime: (timestamp: number) => string;
}

const ChatItem = ({ session, onChatClick, onDelete, formatRelativeTime }: ChatItemProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50; // Minimum distance to trigger delete

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Only allow horizontal swipe (swipe right to delete)
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      setSwipeOffset(Math.min(deltaX, 100)); // Cap at 100px
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset >= SWIPE_THRESHOLD) {
      // Trigger delete
      onDelete(session.id);
      setSwipeOffset(0);
    } else {
      // Snap back
      setSwipeOffset(0);
    }
    setIsSwiping(false);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (swipeOffset > 0) {
      e.preventDefault();
      return;
    }
    onChatClick(session.id, e);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="relative overflow-hidden rounded-lg"
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Delete indicator (red background when swiping) */}
          <div
            className="absolute inset-0 bg-red-500/20 flex items-center justify-end pr-4"
            style={{
              opacity: Math.min(swipeOffset / SWIPE_THRESHOLD, 1),
            }}
          >
            <Trash2 className="h-5 w-5 text-red-400" />
          </div>

          {/* Chat item content */}
          <button
            onClick={handleClick}
            className="relative w-full rounded-lg px-3 py-2 text-left text-white/80 hover:bg-white/10 transition-colors bg-transparent"
            aria-label={`Resume chat: ${session.title}`}
          >
            <div className="text-sm font-dm truncate text-white">
              {session.title}
            </div>
            <div className="text-xs text-white/50">
              {session.resultCount} tracks · {formatRelativeTime(session.updatedAt)}
            </div>
          </button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={(e) => {
            e.preventDefault();
            onDelete(session.id, e);
          }}
          className="text-red-500 focus:text-red-500"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Chat
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
