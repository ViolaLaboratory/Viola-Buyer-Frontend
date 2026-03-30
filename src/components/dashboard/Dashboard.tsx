/**
 * Dashboard Component
 * Main dashboard with:
 * - Overview / Notifications / Chats tabs
 * - Stat cards (Total Revenue, Total Sync Orders, Analytics, Total Catalog, Top Earning Song)
 * - Recent Transactions table
 * - By Country section
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

/* ─── TABS ─── */
const TABS = ["Overview", "Notifications", "Chats"] as const;
type Tab = typeof TABS[number];

/* ─── MOCK DATA ─── */
const RECENT_TRANSACTIONS = [
  { songName: "Golden Hour", amount: "$4,200", date: "Mar 28, 2026", status: "Completed", licensee: "Netflix Studios" },
  { songName: "Velvet Haze", amount: "$2,800", date: "Mar 25, 2026", status: "Pending", licensee: "Nike Inc." },
  { songName: "Midnight Drive", amount: "$6,500", date: "Mar 22, 2026", status: "Completed", licensee: "Apple Music" },
  { songName: "Neon Pulse", amount: "$1,900", date: "Mar 20, 2026", status: "Completed", licensee: "EA Games" },
  { songName: "Southside Glow", amount: "$3,400", date: "Mar 18, 2026", status: "Processing", licensee: "HBO Max" },
];

const COUNTRIES = [
  { name: "United States", percentage: 42 },
  { name: "United Kingdom", percentage: 18 },
  { name: "Germany", percentage: 12 },
  { name: "Japan", percentage: 10 },
  { name: "South Korea", percentage: 8 },
  { name: "Brazil", percentage: 6 },
  { name: "Other", percentage: 4 },
];

/* ─── COMPONENT ─── */
export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      {/* ─── HEADER ─── */}
      <h1 className="text-3xl font-bold text-white font-dm tracking-tight">
        Dashboard
      </h1>

      {/* ─── TABS ─── */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          {/* ─── STAT CARDS ─── */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total Revenue */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-5 space-y-3">
              <div className="text-white/60 text-sm font-medium">Total Revenue</div>
              <div className="text-white text-3xl font-bold font-dm">$175,833.00</div>
            </div>

            {/* Total Sync Orders */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="text-white/60 text-sm font-medium">Total Sync Orders</div>
              <div className="text-white text-3xl font-bold font-dm">53</div>
            </div>

            {/* Analytics */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="text-white/60 text-sm font-medium">Analytics</div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 65].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-purple-500/40 rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Catalog */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="text-white/60 text-sm font-medium">Total Catalog</div>
              <div className="text-white text-3xl font-bold font-dm">34,061 Songs</div>
            </div>

            {/* Top Earning Song */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="text-white/60 text-sm font-medium">Top Earning Song</div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-purple-500/40 to-pink-500/40" />
                <div>
                  <div className="text-white text-sm font-medium">Fashion</div>
                  <div className="text-white/50 text-xs">Cortis</div>
                </div>
              </div>
              <div className="text-green-400 text-xl font-bold font-dm">$150,000</div>
            </div>
          </div>

          {/* ─── BOTTOM SECTION ─── */}
          <div className="grid grid-cols-12 gap-4">
            {/* Recent Transactions */}
            <div className="col-span-8 rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-base">Recent Transactions</h3>
                <button className="text-white/50 text-xs hover:text-white/80 transition-colors">
                  See All
                </button>
              </div>
              <div className="space-y-0">
                {/* Table header */}
                <div className="grid grid-cols-5 gap-4 px-3 py-2 text-xs text-white/40 font-dm">
                  <div>Song Name</div>
                  <div>Placement Amount</div>
                  <div>Date</div>
                  <div>Status</div>
                  <div>Licensee Name</div>
                </div>
                {/* Table rows */}
                {RECENT_TRANSACTIONS.map((tx, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-5 gap-4 px-3 py-3 text-sm text-white/80 border-t border-white/5 hover:bg-white/5 rounded transition-colors"
                  >
                    <div className="text-white font-medium">{tx.songName}</div>
                    <div>{tx.amount}</div>
                    <div>{tx.date}</div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        tx.status === "Completed" ? "bg-green-500/20 text-green-400" :
                        tx.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <div>{tx.licensee}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Country */}
            <div className="col-span-4 rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-white font-semibold text-base mb-4">By Country</h3>
              <div className="space-y-3">
                {COUNTRIES.map((country) => (
                  <div key={country.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{country.name}</span>
                      <span className="text-white/50 text-xs">{country.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── NOTIFICATIONS TAB ─── */}
      {activeTab === "Notifications" && (
        <div className="flex items-center justify-center h-64 text-white/40 text-sm">
          No new notifications
        </div>
      )}

      {/* ─── CHATS TAB ─── */}
      {activeTab === "Chats" && (
        <div className="flex items-center justify-center h-64 text-white/40 text-sm">
          No recent chats
        </div>
      )}
    </div>
  );
};
