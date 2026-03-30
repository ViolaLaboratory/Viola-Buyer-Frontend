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
          {/* ─── STAT CARDS + ANALYTICS ─── */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left: 2x2 stat cards */}
            <div className="col-span-5 grid grid-cols-2 gap-4">
              {/* Total Revenue */}
              <div className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-4 space-y-2">
                <div className="text-white/60 text-xs font-medium">Total Revenue</div>
                <div className="text-white text-xl font-bold font-dm">$175,833.00</div>
              </div>

              {/* Total Sync Orders */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <div className="text-white/60 text-xs font-medium">Total Sync Orders</div>
                <div className="text-white text-xl font-bold font-dm">53</div>
              </div>

              {/* Total Catalog */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <div className="text-white/60 text-xs font-medium">Total Catalog</div>
                <div className="text-white text-xl font-bold font-dm">34,061 Songs</div>
              </div>

              {/* Top Earning Song */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                <div className="text-white/60 text-xs font-medium">Top Earning Song</div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-500/40 to-pink-500/40 flex-shrink-0" />
                  <div>
                    <div className="text-white text-xs font-medium">Fashion</div>
                    <div className="text-white/50 text-[10px]">Cortis</div>
                  </div>
                </div>
                <div className="text-green-400 text-lg font-bold font-dm">$150,000</div>
              </div>
            </div>

            {/* Right: Analytics graph */}
            <div className="col-span-7 rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col">
              <div className="text-white/60 text-sm font-medium mb-4">Analytics</div>
              <div className="flex-1 relative min-h-0">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-white/30 w-8">
                  <span>$50k</span>
                  <span>$40k</span>
                  <span>$30k</span>
                  <span>$20k</span>
                  <span>$10k</span>
                  <span>$0</span>
                </div>
                {/* Graph area */}
                <div className="ml-10 h-full flex flex-col">
                  <div className="flex-1 relative">
                    {/* Grid lines */}
                    {[0, 20, 40, 60, 80, 100].map((pos) => (
                      <div
                        key={pos}
                        className="absolute left-0 right-0 border-t border-white/5"
                        style={{ top: `${pos}%` }}
                      />
                    ))}
                    {/* Line graph */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 110 100">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(168,85,247)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(168,85,247)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Filled area */}
                      <path
                        d="M0,70 L10,55 L20,62 L30,35 L40,48 L50,40 L60,22 L70,45 L80,30 L90,38 L100,18 L110,25 L110,100 L0,100 Z"
                        fill="url(#lineGrad)"
                      />
                      {/* Line */}
                      <polyline
                        points="0,70 10,55 20,62 30,35 40,48 50,40 60,22 70,45 80,30 90,38 100,18 110,25"
                        fill="none"
                        stroke="rgb(168,85,247)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                      {/* Data points */}
                      {[[0,70],[10,55],[20,62],[30,35],[40,48],[50,40],[60,22],[70,45],[80,30],[90,38],[100,18],[110,25]].map(([x,y], i) => (
                        <circle key={i} cx={x} cy={y} r="3" fill="rgb(168,85,247)" vectorEffect="non-scaling-stroke" />
                      ))}
                    </svg>
                  </div>
                  {/* X-axis labels */}
                  <div className="flex justify-between text-[10px] text-white/30 pt-2">
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
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
