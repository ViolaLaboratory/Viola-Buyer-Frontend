import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import API_ENDPOINTS from "@/config/api";

const TABS = ["Overview", "Notifications", "Chats"] as const;
type Tab = typeof TABS[number];

type DashboardOverview = {
  totalRevenue: number;
  totalSyncOrders: number;
  totalCatalog: number;
  topTitle: string;
  topArtist: string;
  topRevenue: number;
};

type MonthlyRevenue = { month: string; revenue: number };
type Transaction = {
  song_name: string;
  placement_amount: number;
  transaction_date: string;
  status: string;
  license_name: string;
};
type CountryRow = {
  name: string;
  percentage: number;
  top_tracks?: { title: string; artist: string; revenue: number }[];
};
type NotificationItem = { type: string; message: string; created_at: string };
type ChatThread = {
  thread_id: string;
  counterparty_name: string;
  song_name: string;
  last_message_at: string;
  messages: { id: string; sender_name: string; body: string; message_type: string; created_at: string }[];
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [overview, setOverview] = useState<DashboardOverview>({
    totalRevenue: 0,
    totalSyncOrders: 0,
    totalCatalog: 0,
    topTitle: "N/A",
    topArtist: "N/A",
    topRevenue: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [overviewRes, detailsRes] = await Promise.all([
          fetch(API_ENDPOINTS.DASHBOARD_OVERVIEW, { method: "GET", credentials: "include" }),
          fetch(API_ENDPOINTS.DASHBOARD_DETAILS, { method: "GET", credentials: "include" }),
        ]);

        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setOverview({
            totalRevenue: Number(data.total_revenue || 0),
            totalSyncOrders: Number(data.total_sync_orders || 0),
            totalCatalog: Number(data.total_catalog || 0),
            topTitle: data.top_earning_song?.title || "N/A",
            topArtist: data.top_earning_song?.artist || "N/A",
            topRevenue: Number(data.top_earning_song?.revenue || 0),
          });
        }

        if (detailsRes.ok) {
          const details = await detailsRes.json();
          setMonthlyRevenue(Array.isArray(details.analytics_monthly) ? details.analytics_monthly : []);
          setTransactions(Array.isArray(details.recent_transactions) ? details.recent_transactions : []);
          setCountries(Array.isArray(details.by_country) ? details.by_country : []);
          setNotifications(Array.isArray(details.notifications) ? details.notifications : []);
          const threads = Array.isArray(details.chat_threads) ? details.chat_threads : [];
          setChatThreads(threads);
          if (threads.length > 0 && !selectedThreadId) setSelectedThreadId(threads[0].thread_id);
        }
      } catch {
        // keep safe defaults
      }
    };

    fetchDashboard();
  }, [user]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0);
  const formatCount = (value: number) => new Intl.NumberFormat("en-US").format(value || 0);
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "-";
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const chartData: MonthlyRevenue[] =
    monthlyRevenue.length > 0
      ? monthlyRevenue
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => ({ month: m, revenue: 0 }));
  const maxRevenue = Math.max(...chartData.map((d) => Number(d.revenue || 0)), 1);
  const linePoints = chartData
    .map((d, i) => {
      const x = (i / Math.max(chartData.length - 1, 1)) * 110;
      const y = 100 - (Number(d.revenue || 0) / maxRevenue) * 80 - 10;
      return `${x},${Math.max(5, Math.min(95, y))}`;
    })
    .join(" ");
  const areaPath = `M${linePoints.replace(/ /g, " L")} L110,100 L0,100 Z`;

  const recentRows = transactions.slice(0, 5);
  const topCountries = countries.slice(0, 7);
  const selectedThread = chatThreads.find((t) => t.thread_id === selectedThreadId) || chatThreads[0];

  const sendMessage = async () => {
    if (!selectedThread || !newMessage.trim()) return;
    try {
      const res = await fetch(API_ENDPOINTS.DIRECT_CHAT_SEND(selectedThread.thread_id), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage, message_type: "chat" }),
      });
      if (res.ok) {
        setNewMessage("");
        const msgRes = await fetch(API_ENDPOINTS.DIRECT_CHAT_MESSAGES(selectedThread.thread_id), { method: "GET", credentials: "include" });
        if (msgRes.ok) {
          const msgs = await msgRes.json();
          setChatThreads((prev) =>
            prev.map((t) => (t.thread_id === selectedThread.thread_id ? { ...t, messages: Array.isArray(msgs) ? msgs : [] } : t)),
          );
        }
      }
    } catch {
      // no-op
    }
  };

  return (
    <div className="h-screen overflow-hidden px-6 py-4 space-y-4">
      <h1 className="text-3xl font-bold text-white font-dm tracking-tight">Dashboard</h1>

      <div className="flex items-center gap-6 border-b border-white/10 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab ? "text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 items-stretch">
            <div className="grid grid-cols-2 grid-rows-2 auto-rows-fr gap-4 h-[360px]">
              <div className="h-full rounded-xl border border-purple-500/30 bg-purple-900/20 p-5 space-y-2 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#CC78F9] hover:to-[#8D36C7] hover:border-transparent">
                <div className="text-white/60 text-xs font-medium">Total Revenue</div>
                <div className="text-white text-xl font-bold font-dm">{formatMoney(overview.totalRevenue)}</div>
              </div>

              <div className="h-full rounded-xl border border-white/10 bg-white/5 p-5 space-y-2 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#CC78F9] hover:to-[#8D36C7] hover:border-transparent">
                <div className="text-white/60 text-xs font-medium">Total Sync Orders</div>
                <div className="text-white text-xl font-bold font-dm">{formatCount(overview.totalSyncOrders)}</div>
              </div>

              <div className="h-full rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between transition-all duration-300 hover:bg-gradient-to-br hover:from-[#CC78F9] hover:to-[#8D36C7] hover:border-transparent">
                <div className="text-white/60 text-xs font-medium">Total Catalog</div>
                <div className="text-white text-xl font-bold font-dm mt-auto">{formatCount(overview.totalCatalog)} Songs</div>
              </div>

              <div className="h-full rounded-xl border border-white/10 bg-white/5 p-5 space-y-2 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#CC78F9] hover:to-[#8D36C7] hover:border-transparent">
                <div className="text-white/60 text-xs font-medium">Top Earning Song</div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-500/40 to-pink-500/40 flex-shrink-0" />
                  <div>
                    <div className="text-white text-xs font-medium">{overview.topTitle}</div>
                    <div className="text-white/50 text-[10px]">{overview.topArtist}</div>
                  </div>
                </div>
                <div className="text-green-400 text-lg font-bold font-dm">{formatMoney(overview.topRevenue)}</div>
              </div>
            </div>

            <div className="h-[360px] rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col">
              <div className="text-white/60 text-sm font-medium mb-4">Analytics (Monthly Revenue)</div>
              <div className="flex-1 relative min-h-0">
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-white/30 w-10">
                  {[1, 0.8, 0.6, 0.4, 0.2, 0].map((v) => (
                    <span key={v}>{formatMoney(maxRevenue * v).replace(".00", "")}</span>
                  ))}
                </div>
                <div className="ml-10 h-full flex flex-col">
                  <div className="flex-1 relative">
                    {[0, 20, 40, 60, 80, 100].map((pos) => (
                      <div key={pos} className="absolute left-0 right-0 border-t border-white/5" style={{ top: `${pos}%` }} />
                    ))}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 110 100">
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(168,85,247)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(168,85,247)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#lineGrad)" />
                      <polyline points={linePoints} fill="none" stroke="rgb(168,85,247)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30 pt-2">
                    {chartData.map((item) => (
                      <span key={item.month}>{item.month}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 pt-2">
            <div className="col-span-8 rounded-xl border border-white/10 bg-white/5 p-5 min-h-[305px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-base">Recent Transactions</h3>
                <Link to="/demo/dashboard/transactions" className="text-white/50 text-xs hover:text-white/80 transition-colors">
                  See All
                </Link>
              </div>
              <div className="space-y-0">
                <div className="grid grid-cols-5 gap-4 px-3 py-2 text-xs text-white/40 font-dm">
                  <div>Song Name</div>
                  <div>Placement Amount</div>
                  <div>Date</div>
                  <div>Status</div>
                  <div>Licensee Name</div>
                </div>
                {recentRows.map((tx, i) => (
                  <div
                    key={`${tx.song_name}-${tx.transaction_date}-${i}`}
                    className="grid grid-cols-5 gap-4 px-3 py-3 text-sm text-white/80 border-t border-white/5 hover:bg-white/5 rounded transition-colors"
                  >
                    <div className="text-white font-medium">{tx.song_name}</div>
                    <div>{formatMoney(tx.placement_amount)}</div>
                    <div>{formatDate(tx.transaction_date)}</div>
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          tx.status === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : tx.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <div>{tx.license_name}</div>
                  </div>
                ))}
                {recentRows.length === 0 && <div className="px-3 py-6 text-sm text-white/40 border-t border-white/5">No transaction data yet.</div>}
              </div>
            </div>

            <div className="col-span-4 rounded-xl border border-white/10 bg-white/5 p-5 min-h-[305px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-base">By Country</h3>
                <Link to="/demo/dashboard/countries" className="text-white/50 text-xs hover:text-white/80 transition-colors">
                  See All
                </Link>
              </div>
              <div className="space-y-4">
                {topCountries.map((country) => (
                  <div key={country.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{country.name}</span>
                      <span className="text-white/50 text-xs">{country.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500" style={{ width: `${country.percentage}%` }} />
                    </div>
                    {!!country.top_tracks?.length && (
                      <div className="text-[10px] text-white/50">Top: {country.top_tracks.slice(0, 2).map((t) => t.title).join(", ")}</div>
                    )}
                  </div>
                ))}
                {topCountries.length === 0 && <div className="text-sm text-white/40">No country sales data yet.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Notifications" && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
          {notifications.map((n, i) => (
            <div key={`${n.created_at}-${i}`} className="border-b border-white/5 pb-3 last:border-b-0">
              <div className="text-white text-sm">{n.message}</div>
              <div className="text-white/40 text-xs mt-1">{formatDate(n.created_at)}</div>
            </div>
          ))}
          {notifications.length === 0 && <div className="text-white/40 text-sm">No notifications yet.</div>}
        </div>
      )}
      {activeTab === "Chats" && (
        <div className="grid grid-cols-12 gap-4 h-[70vh]">
          <div className="col-span-4 rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 overflow-y-auto">
            {chatThreads.map((thread) => (
              <button
                key={thread.thread_id}
                onClick={() => setSelectedThreadId(thread.thread_id)}
                className={`w-full text-left p-3 rounded-lg border ${selectedThread?.thread_id === thread.thread_id ? "border-purple-400 bg-purple-500/20" : "border-white/10 bg-white/5"}`}
              >
                <div className="text-white text-sm font-medium">{thread.counterparty_name || "Buyer/Seller"}</div>
                <div className="text-white/50 text-xs truncate">{thread.song_name || "General inquiry"}</div>
              </button>
            ))}
            {chatThreads.length === 0 && <div className="text-white/40 text-sm">No chat threads yet.</div>}
          </div>
          <div className="col-span-8 rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3">
              {(selectedThread?.messages || []).map((m) => (
                <div key={m.id} className="rounded-lg bg-white/10 p-3">
                  <div className="text-white/60 text-xs">{m.sender_name}</div>
                  <div className="text-white text-sm mt-1">{m.body}</div>
                </div>
              ))}
              {!selectedThread && <div className="text-white/40 text-sm">Select a chat thread.</div>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white text-sm outline-none"
              />
              <button onClick={sendMessage} className="rounded-lg px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
