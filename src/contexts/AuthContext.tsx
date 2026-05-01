/**
 * AuthContext - User authentication state
 * Stores logged-in user info for dynamic rendering across the app
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type UserPortal = "buyer" | "seller";

export interface User {
  id: number;
  username: string;
  email: string;
  profile_image?: string | null;
  plan?: string;
  account_type: UserPortal;
  seller_verified: boolean;
  /** Active session (chooser at login) */
  portal: UserPortal;
}

const AUTH_STORAGE_KEY = "viola_user";
const LAST_ACTIVE_KEY = "viola_last_active_at";
const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const defaultUser: User = {
  id: 0,
  username: "Michael Smith",
  email: "michael@example.com",
  profile_image: "/viola-logo.jpg",
  plan: "Free plan",
  account_type: "buyer",
  seller_verified: false,
  portal: "buyer",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<User>;
        return {
          ...defaultUser,
          ...parsed,
          account_type: parsed.account_type ?? "buyer",
          seller_verified: parsed.seller_verified ?? false,
          portal: parsed.portal ?? "buyer",
        };
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Auto logout: close tab → 10+ min → reopen = logout. Tab switch does NOT trigger.
  useEffect(() => {
    const checkInactivity = () => {
      if (!user) return;
      const lastAt = localStorage.getItem(LAST_ACTIVE_KEY);
      if (!lastAt) return;
      const elapsed = Date.now() - parseInt(lastAt, 10);
      if (elapsed >= INACTIVITY_MS) {
        setUser(null);
        localStorage.removeItem(LAST_ACTIVE_KEY);
      }
    };

    // Only when closing tab/window, not when switching tabs
    const handlePageHide = () => {
      if (user) localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    };

    // On mount: if returning after 10+ min since close, logout
    checkInactivity();

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [user]);

  const login = useCallback((u: User) => {
    setUser({
      id: u.id ?? 0,
      username: u.username ?? "User",
      email: u.email ?? "",
      profile_image: u.profile_image ?? "/viola-logo.jpg",
      plan: u.plan ?? "Free plan",
      account_type: u.account_type ?? "buyer",
      seller_verified: u.seller_verified ?? false,
      portal: u.portal ?? "buyer",
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
