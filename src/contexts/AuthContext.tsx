/**
 * AuthContext - User authentication state
 * Stores logged-in user info for dynamic rendering across the app
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  profile_image?: string | null;
  plan?: string;
}

const AUTH_STORAGE_KEY = "viola_user";

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
  profile_image: "/michael.png",
  plan: "Pro plan",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        return { ...defaultUser, ...parsed };
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

  const login = useCallback((u: User) => {
    setUser({
      id: u.id ?? 0,
      username: u.username ?? "User",
      email: u.email ?? "",
      profile_image: u.profile_image ?? "/michael.png",
      plan: u.plan ?? "Pro plan",
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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
