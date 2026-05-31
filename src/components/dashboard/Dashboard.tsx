import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import API_ENDPOINTS from "@/config/api";
import Chart from 'chart.js/auto';

const TABS = ["Overview", "Notifications", "Chats", "Rate Card"] as const;
type Tab = typeof TABS[number];

// Types for Rate Card settings from backend
interface ProjectTypeSetting {
  project_type: string;
  is_blocked: boolean;
  standard_rate: string | null;
  price_ceiling: string | null;
  model_price: string | null;
}

interface AudienceSizeSetting {
  audience_tier: string;
  is_blocked: boolean;
}

interface BrandRestriction {
  id: number;
  brand_name: string;
  is_preset: boolean;
}

interface BrandThatNeedsRequest {
  id: number;
  brand_name: string;
  is_preset: boolean;
}

interface TerritoryRef {
  id: number;
  name: string;
  code: string;
}

interface CountryRef {
  id: number;
  name: string;
  code: string;
  territory_id: number | null;
}

interface SongSettings {
  project_type_settings: ProjectTypeSetting[];
  audience_size_settings: AudienceSizeSetting[];
  brand_restrictions: BrandRestriction[];
  brands_that_need_requests: BrandThatNeedsRequest[];
  territory_ids: number[];
  country_ids: number[];
}

// Convert API project type to frontend format
function apiProjectTypeToFrontend(pt: ProjectTypeSetting) {
  return {
    label: pt.project_type,
    blocked: pt.is_blocked,
    standardRate: pt.standard_rate ?? "950.00",
    priceCeiling: pt.price_ceiling ?? "2500.00",
    modelPrice: pt.model_price ?? "0.00",
  };
}

// Convert API audience tier to frontend format
function apiAudienceToFrontend(at: AudienceSizeSetting) {
  return {
    label: at.audience_tier,
    blocked: at.is_blocked,
  };
}

const MOCK_TRANSACTIONS = [
  { id: 1, index: 1, trackId: "samp_001", name: "Neon Dreams", artist: "Aiden Chase", genre: "Electronic", mood: "Energetic", duration: "3:12", clip: "30 secs" },
  { id: 2, index: 2, trackId: "samp_002", name: "Midnight Drift", artist: "Luna Vega", genre: "Ambient", mood: "Chill", duration: "4:05", clip: "30 secs" },
  { id: 3, index: 3, trackId: "samp_003", name: "Velvet Skies", artist: "The Wandering Souls", genre: "Indie Rock", mood: "Melancholic", duration: "3:48", clip: "30 secs" },
  { id: 4, index: 4, trackId: "samp_004", name: "Pulse", artist: "Circuit Breakers", genre: "Techno", mood: "Driving", duration: "5:20", clip: "30 secs" },
  { id: 5, index: 5, trackId: "samp_005", name: "Golden Hour", artist: "Maya Torres", genre: "Pop", mood: "Upbeat", duration: "3:30", clip: "30 secs" },
];

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

// ── Brand Add Modal sub-component ──
const BrandAddModal = ({
  type,
  inputValue,
  onInputChange,
  onAdd,
  onClose,
}: {
  type: "blocked" | "needs_request";
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: (name: string) => void;
  onClose: () => void;
}) => {
  const title = type === "blocked" ? "Add Brand Restriction" : "Add Brand That Needs Request";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-[420px] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold text-base">{title}</div>
          <button onClick={onClose} className="text-white/40 text-xs hover:text-white/70 transition-colors">
            Cancel
          </button>
        </div>

        <input
          autoFocus
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && inputValue.trim()) {
              onAdd(inputValue.trim());
            }
          }}
          placeholder="Enter brand name..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-xs px-3 py-1.5 rounded-md border border-white/20 text-white/70">
            Cancel
          </button>
          <button
            onClick={() => {
              if (inputValue.trim()) {
                onAdd(inputValue.trim());
              }
            }}
            className="text-xs px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Overview sub-component ──
const OverviewContent = ({
  songId,
  projectTypes,
  activeLicenseTab,
  onSelectLicenseTab,
  dynamicPricing,
}: {
  songId: number;
  projectTypes: Array<{label: string; blocked: boolean; standardRate: string; priceCeiling: string; modelPrice: string}>;
  activeLicenseTab: string;
  onSelectLicenseTab: (tab: string) => void;
  dynamicPricing: boolean;
}) => {
  const availableTabs = projectTypes.filter(p => !p.blocked);
  const activePT = projectTypes.find(p => p.label === activeLicenseTab);
  const fmtPrice = (v: string | undefined) => {
    const n = parseFloat(v ?? "0");
    return isNaN(n) ? "$0.00" : `$${n.toFixed(2)}`;
  };
  const modelPriceVal = parseFloat(activePT?.modelPrice ?? "0");
  const baseRateVal = parseFloat(activePT?.standardRate ?? "0");
  const modelDiff = baseRateVal > 0 ? Math.round(((modelPriceVal - baseRateVal) / baseRateVal) * 100) : 0;

  if (availableTabs.length === 0) {
    return <div className="text-xs text-white/30 py-4">No license types available</div>;
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {availableTabs.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelectLicenseTab(item.label)}
            className={`text-xs px-3 py-1 rounded-full border ${
              activeLicenseTab === item.label ? "border-green-400 text-green-400 bg-green-500/10" : "border-white/15 text-white/50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 divide-x divide-white/10 rounded-lg overflow-hidden bg-white/5">
        <div className="p-3 space-y-1">
          <div className="text-white/40 text-xs">Base Rate</div>
          <div className="text-white font-medium">{fmtPrice(activePT?.standardRate)}</div>
          <div className="text-white/40 text-xs">{activeLicenseTab}</div>
        </div>
        <div className="p-3 space-y-1">
          <div className="text-white/40 text-xs">Model Price</div>
          <div className="text-white font-medium">{fmtPrice(activePT?.modelPrice)}</div>
          <div className={`text-xs ${modelDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
            {modelDiff >= 0 ? "+" : ""}{modelDiff}%
          </div>
        </div>
        <div className="p-3 space-y-1">
          <div className="text-white/40 text-xs">Buyer Sees</div>
          <div className="text-white font-medium">{fmtPrice(dynamicPricing ? activePT?.modelPrice : activePT?.standardRate)}</div>
          <div className="text-white/40 text-xs">{activeLicenseTab}</div>
        </div>
        <div className="p-3 space-y-1">
          <div className="text-white/40 text-xs">Adjustments</div>
          <div className="flex flex-wrap gap-1 pt-1">
            {["Search +15%", "Streams +23%", "Non-Exclusive", "U.S. Only -10%"].map((adj) => (
              <span key={adj} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">{adj}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-green-400 text-xs mb-3">{activeLicenseTab}</div>
        <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4 self-start">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <div className="text-white/35 text-[10px]">Publisher Rights</div>
                <div className="text-white text-sm font-medium">Sync + Master License</div>
                <div className="flex justify-between text-xs border-t border-white/10 pt-2">
                  <span className="text-white/50">Base Rate</span>
                  <span className="text-white font-medium">{fmtPrice(activePT?.standardRate)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-white/10 pt-2">
                  <span className="text-white/50">Ceiling</span>
                  <span className="text-white font-medium">{fmtPrice(activePT?.priceCeiling)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-white/10 pt-2">
                  <span className="text-white/50">Model Price</span>
                  <span className="text-white font-medium">{fmtPrice(activePT?.modelPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="self-start">
            <div className="text-white/40 text-[11px] mb-2">The past six months Search Volume</div>
            <div className="relative h-40 w-full rounded-lg border border-white/10 bg-black/10 overflow-hidden">
              <canvas id={`searchChart-${songId}`} />
            </div>
          </div>

          <div className="self-start">
            <div className="text-white/40 text-[11px] mb-2">The past six months Stream Volume</div>
            <div className="relative h-40 w-full rounded-lg border border-white/10 bg-black/10 overflow-hidden">
              <canvas id={`streamChart-${songId}`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [expandedId, setExpandedId] = useState<number | null>(1);

  // pricing
  const [activePricingTab, setActivePricingTab] = useState("Overview");
  const [activeLicenseTab, setActiveLicenseTab] = useState<string>("");
  const [dynamicPricing, setDynamicPricing] = useState(true);

  // ── Territory / Country reference data ──
  const [territoryRefs, setTerritoryRefs] = useState<TerritoryRef[]>([]);
  const [countryRefs, setCountryRefs] = useState<CountryRef[]>([]);

  useEffect(() => {
    // Fetch territories from reference API, fallback to hardcoded if unavailable
    fetch(API_ENDPOINTS.TERRITORIES, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.length > 0) {
          setTerritoryRefs(data);
        } else {
          // Fallback defaults
          setTerritoryRefs([
            { id: 1, name: "Worldwide", code: "WW" },
            { id: 2, name: "North America", code: "NA" },
            { id: 3, name: "Asia Pacific", code: "AP" },
            { id: 4, name: "Europe", code: "EU" },
            { id: 5, name: "Latin America", code: "LA" },
            { id: 6, name: "Middle East", code: "ME" },
          ]);
        }
      })
      .catch(() => {
        // Fallback defaults if fetch fails
        setTerritoryRefs([
          { id: 1, name: "Worldwide", code: "WW" },
          { id: 2, name: "North America", code: "NA" },
          { id: 3, name: "Asia Pacific", code: "AP" },
          { id: 4, name: "Europe", code: "EU" },
          { id: 5, name: "Latin America", code: "LA" },
          { id: 6, name: "Middle East", code: "ME" },
        ]);
      });
    fetch(API_ENDPOINTS.COUNTRIES, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.length > 0) {
          setCountryRefs(data);
        } else {
          setCountryRefs([
            { id: 1, name: "United Kingdom", code: "GB", territory_id: 4 },
            { id: 2, name: "Hong Kong", code: "HK", territory_id: 3 },
            { id: 3, name: "South Korea", code: "KR", territory_id: 3 },
            { id: 4, name: "Japan", code: "JP", territory_id: 3 },
          ]);
        }
      })
      .catch(() => {
        setCountryRefs([
          { id: 1, name: "United Kingdom", code: "GB", territory_id: 4 },
          { id: 2, name: "Hong Kong", code: "HK", territory_id: 3 },
          { id: 3, name: "South Korea", code: "KR", territory_id: 3 },
          { id: 4, name: "Japan", code: "JP", territory_id: 3 },
        ]);
      });
  }, []);

  // ── Territory / Country toggling (mutates the cached settings) ──
  const toggleTerritory = (id: number) => {
    const wwId = territoryRefs.find(t => t.name === "Worldwide")?.id;
    if (id === wwId) {
      // Selecting Worldwide deselects all others
      setCurrentSettings(curr => ({
        ...curr,
        territory_ids: [wwId!],
        country_ids: [],
      }));
      return;
    }
    setCurrentSettings(curr => {
      const ids = curr.territory_ids ?? [];
      // Deselect Worldwide when picking a specific territory
      const filtered = wwId ? ids.filter(x => x !== wwId) : [...ids];
      return {
        ...curr,
        territory_ids: filtered.includes(id)
          ? filtered.filter(x => x !== id)
          : [...filtered, id],
      };
    });
  };

  const toggleCountry = (id: number) => {
    const wwId = territoryRefs.find(t => t.name === "Worldwide")?.id;
    setCurrentSettings(curr => ({
      ...curr,
      territory_ids: (curr.territory_ids ?? []).filter(tId => tId !== wwId),
      country_ids: (curr.country_ids ?? []).includes(id)
        ? (curr.country_ids ?? []).filter(cId => cId !== id)
        : [...(curr.country_ids ?? []), id],
    }));
  };

  // Rate Card settings fetched from backend per song
  const [songSettingsCache, setSongSettingsCache] = useState<Map<number, SongSettings>>(new Map());
  const [loadingSettings, setLoadingSettings] = useState<number | null>(null);

  // ── Derived state (declared before useCallback that reference them) ──
  const currentSettings = expandedId !== null ? songSettingsCache.get(expandedId) : undefined;

  // ── Fetch settings when a song is expanded ──
  const fetchSettings = useCallback(async (transactionId: number, trackId: string) => {
    setLoadingSettings(transactionId);
    try {
      const url = API_ENDPOINTS.SONG_SETTINGS(trackId);
      console.log("Fetching song settings:", url);
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data: SongSettings = await res.json();
        console.log("Song settings loaded:", data.project_type_settings.length, "project types");
        setSongSettingsCache(prev => new Map(prev).set(transactionId, data));
      } else {
        const text = await res.text();
        console.error("Song settings fetch failed:", res.status, res.statusText, text);
      }
    } catch (err) {
      console.error("Failed to fetch song settings:", err);
    } finally {
      setLoadingSettings(null);
    }
  }, []);

  // ── Save current song's settings to the backend ──
  const saveCurrentSettings = useCallback(async () => {
    if (expandedId === null || !currentSettings) return;
    const txn = MOCK_TRANSACTIONS.find(t => t.id === expandedId);
    if (!txn) return;
    setLoadingSettings(expandedId);
    try {
      const body = {
        project_type_settings: currentSettings.project_type_settings.map(p => ({
          project_type: p.project_type,
          is_blocked: p.is_blocked,
          standard_rate: p.standard_rate,
          price_ceiling: p.price_ceiling,
          model_price: p.model_price,
        })),
        audience_size_settings: currentSettings.audience_size_settings.map(a => ({
          audience_tier: a.audience_tier,
          is_blocked: a.is_blocked,
        })),
        brand_restrictions: currentSettings.brand_restrictions.map(b => ({
          brand_name: b.brand_name,
          is_preset: b.is_preset,
        })),
        brands_that_need_requests: currentSettings.brands_that_need_requests.map(b => ({
          brand_name: b.brand_name,
          is_preset: b.is_preset,
        })),
        territory_ids: currentSettings.territory_ids ?? [],
        country_ids: currentSettings.country_ids ?? [],
      };
      const res = await fetch(API_ENDPOINTS.SONG_UPDATE_SETTINGS(txn.trackId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // Re-fetch to show DB-persisted values (keeps what user sees in sync)
        fetchSettings(expandedId, txn.trackId);
      } else {
        console.error("Save failed:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Failed to save song settings:", err);
    } finally {
      setLoadingSettings(null);
    }
  }, [expandedId, currentSettings, fetchSettings]);

  // ── When expandedId changes, fetch the settings for that song ──
  useEffect(() => {
    if (expandedId !== null) {
      const txn = MOCK_TRANSACTIONS.find(t => t.id === expandedId);
      if (txn) {
        fetchSettings(txn.id, txn.trackId);
      }
    }
  }, [expandedId, fetchSettings]);

  // ── Sync activeLicenseTab when song settings load ──
  useEffect(() => {
    const available = (currentSettings?.project_type_settings ?? []).filter(p => !p.is_blocked);
    if (available.length > 0) {
      setActiveLicenseTab(prev => {
        // Keep current tab if still available, otherwise switch to first
        return available.some(p => p.project_type === prev) ? prev : available[0].project_type;
      });
    }
  }, [currentSettings]);

  // ── Derived display values ──
  const projectTypes = currentSettings
    ? currentSettings.project_type_settings.map(apiProjectTypeToFrontend)
    : [];
  const brandRestrictions = currentSettings?.brand_restrictions ?? [];
  const brandsThatNeedRequests = currentSettings?.brands_that_need_requests ?? [];
  const audienceSizes = currentSettings
    ? currentSettings.audience_size_settings.map(apiAudienceToFrontend)
    : [];
  const territoryIds = currentSettings?.territory_ids ?? [];
  const countryIds = currentSettings?.country_ids ?? [];
  const selectedTerritories = territoryRefs.filter(t => territoryIds.includes(t.id)).map(t => t.name);
  const selectedCountries = countryRefs.filter(c => countryIds.includes(c.id)).map(c => c.name);

  // Helper: update the cache for the currently expanded song
  const setCurrentSettings = useCallback((updater: (prev: SongSettings) => SongSettings) => {
    if (expandedId === null) return;
    setSongSettingsCache(prev => {
      const existing = prev.get(expandedId);
      if (!existing) return prev;
      return new Map(prev).set(expandedId, updater(existing));
    });
  }, [expandedId]);

  // Wrappers that match the old setProjectTypes/setAudienceSizes signatures
  const setProjectTypes = useCallback((updater: (prev: Array<{label: string; blocked: boolean; standardRate: string; priceCeiling: string; modelPrice: string}>) => Array<{label: string; blocked: boolean; standardRate: string; priceCeiling: string; modelPrice: string}>) => {
    setCurrentSettings(curr => ({
      ...curr,
      project_type_settings: updater(
        curr.project_type_settings.map(apiProjectTypeToFrontend)
      ).map(f => ({
        project_type: f.label,
        is_blocked: f.blocked,
        standard_rate: f.standardRate,
        price_ceiling: f.priceCeiling,
        model_price: f.modelPrice,
      })),
    }));
  }, [setCurrentSettings]);

  const setAudienceSizes = useCallback((updater: (prev: Array<{label: string; blocked: boolean}>) => Array<{label: string; blocked: boolean}>) => {
    setCurrentSettings(curr => ({
      ...curr,
      audience_size_settings: updater(
        curr.audience_size_settings.map(apiAudienceToFrontend)
      ).map(f => ({
        audience_tier: f.label,
        is_blocked: f.blocked,
      })),
    }));
  }, [setCurrentSettings]);

  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [addBrandPopup, setAddBrandPopup] = useState<{type: "blocked" | "needs_request"; value: string} | null>(null);
  const [brandAddInput, setBrandAddInput] = useState("");

  const formatPrice = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

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

  // overview's monthly revenue charts (search vs stream) - uses Chart.js for simplicity
  // useEffect(() => {
  //   if (activePricingTab !== "Overview") return;

  //   const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

  //   const barOpts = () => ({
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: { legend: { display: false } },
  //     scales: {
  //       x: {
  //         ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10 } },
  //         grid: { display: false },
  //         border: { display: false },
  //       },
  //       y: { display: false },
  //     },
  //   });

  //   const s1 = new Chart(document.getElementById('searchChart') as HTMLCanvasElement, {
  //     type: 'bar',
  //     data: {
  //       labels: months,
  //       datasets: [{
  //         data: [4200, 5100, 4800, 6300, 7100, 6600],
  //         backgroundColor: 'rgba(74,222,128,0.3)',
  //         borderColor: 'rgba(74,222,128,0.7)',
  //         borderWidth: 1,
  //         borderRadius: 3,
  //       }],
  //     },
  //     options: barOpts(),
  //   });

  //   const s2 = new Chart(document.getElementById('streamChart') as HTMLCanvasElement, {
  //     type: 'bar',
  //     data: {
  //       labels: months,
  //       datasets: [{
  //         data: [18000, 22000, 19000, 27000, 31000, 29000],
  //         backgroundColor: 'rgba(96,165,250,0.3)',
  //         borderColor: 'rgba(96,165,250,0.7)',
  //         borderWidth: 1,
  //         borderRadius: 3,
  //       }],
  //     },
  //     options: barOpts(),
  //   });

  //   return () => {
  //     s1.destroy();
  //     s2.destroy();
  //   };
  // }, [activePricingTab, activeLicenseTab]);
  useEffect(() => {
    if (activePricingTab !== "Overview" || expandedId === null) return;

    const searchEl = document.getElementById(`searchChart-${expandedId}`) as HTMLCanvasElement | null;
    const streamEl = document.getElementById(`streamChart-${expandedId}`) as HTMLCanvasElement | null;

    if (!searchEl || !streamEl) return; // canvas 還沒掛上就先跳出

    const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];

    const barOpts = () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 10 } },
          title: { display: true, text: 'Month', color: 'rgba(255,255,255,0.6)', font: { size: 11 } },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 10 } },
          title: { display: true, text: 'Volume', color: 'rgba(255,255,255,0.6)', font: { size: 11 } },
          grid: { display: false },
          border: { display: false },
        },
      },
    });

    const s1 = new Chart(searchEl, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          data: [4200, 5100, 4800, 6300, 7100, 6600],
          backgroundColor: 'rgba(74,222,128,0.3)',
          borderColor: 'rgba(74,222,128,0.7)',
          borderWidth: 1,
          borderRadius: 3,
        }],
      },
      options: barOpts(),
    });

    const s2 = new Chart(streamEl, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          data: [18000, 22000, 19000, 27000, 31000, 29000],
          backgroundColor: 'rgba(96,165,250,0.3)',
          borderColor: 'rgba(96,165,250,0.7)',
          borderWidth: 1,
          borderRadius: 3,
        }],
      },
      options: barOpts(),
    });

    return () => {
      s1.destroy();
      s2.destroy();
    };
  }, [activePricingTab, activeLicenseTab, projectTypes, expandedId]);
  
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
                <Link to="/demo/dashboard/transactions" className="text-white/50 text-xs hover:text-white/80 transition-colors">See All</Link>
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
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        tx.status === "Completed" ? "bg-green-500/20 text-green-400" :
                        tx.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>{tx.status}</span>
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
                <Link to="/demo/dashboard/countries" className="text-white/50 text-xs hover:text-white/80 transition-colors">See All</Link>
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
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedThread?.thread_id === thread.thread_id ? "border-purple-400 bg-purple-500/20" : "border-white/10 bg-white/5"
                }`}
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
              <button onClick={sendMessage} className="rounded-lg px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm">Send</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Rate Card" && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3 h-[calc(100vh-120px)] custom-scroll">
          <div className="text-white font-semibold text-base">Recent Transactions</div>

          <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/10 overflow-y-auto h-[calc(100vh-190px)] custom-scroll">
            {MOCK_TRANSACTIONS.map((t) => (
              <div key={t.id}>
                {/* 列表行 */}
                <div
                  className="grid grid-cols-[24px_40px_1fr_1fr_1fr_1fr_60px_70px_80px_28px] items-center gap-2 px-4 py-2.5 text-xs text-white/50 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <span>{t.index}</span>
                  <div className="w-8 h-8 rounded bg-white/10" />
                  <span className="text-white text-sm">{t.name}</span>
                  <span>{t.artist}</span>
                  <span>{t.genre}</span>
                  <span>{t.mood}</span>
                  <span>{t.duration}</span>
                  <span>{t.clip}</span>
                  <div className="relative w-24 h-4">
                    <span className={`absolute inset-0 flex items-center text-white/40 text-xs transition-opacity duration-300 ${expandedId === t.id ? "opacity-0" : "opacity-100"}`}>
                      See more...
                    </span>
                  </div>
                  <button
                    className="w-5 h-5 rounded-full border border-white/20 bg-white/10 text-white/50 text-xs flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(expandedId === t.id ? null : t.id);
                    }}
                  >
                    {expandedId === t.id ? "−" : "+"}
                  </button>
                </div>

                {/* 展開內容 */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === t.id ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10">

                    {/* Overview / Modify tabs */}
                    <div className="flex items-center justify-between gap-2 pt-3">
                      <div className="flex items-center gap-2">
                        {["Overview", "Modify"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActivePricingTab(tab)}
                            className={`text-xs px-3 py-1 rounded-full border ${
                              activePricingTab === tab ? "border-white/50 text-white" : "border-white/15 text-white/50"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      {/* 右邊 Dynamic Pricing */}
                      <div
                        className="flex items-center gap-2 text-white/50 text-xs flex-shrink-0 transition-opacity duration-300 cursor-pointer select-none"
                        onClick={() => setDynamicPricing(p => !p)}
                      >
                        Dynamic Pricing
                        <div className={`w-8 h-4 rounded-full relative flex-shrink-0 transition-colors ${dynamicPricing ? "bg-green-500" : "bg-white/20"}`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${dynamicPricing ? "right-0.5" : "left-0.5"}`} />
                        </div>
                      </div>
                    </div>



                    {/* Overview */}
                    {activePricingTab === "Overview" && <OverviewContent
                      songId={t.id}
                      projectTypes={projectTypes}
                      activeLicenseTab={activeLicenseTab}
                      onSelectLicenseTab={setActiveLicenseTab}
                      dynamicPricing={dynamicPricing}
                    />}

                    {/* Modify */}
                    {activePricingTab === "Modify" && (
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                        <div>
                          <div className="text-white text-sm font-medium">Project Eligibility Rules</div>
                          <div className="text-white/40 text-xs mt-1">
                            Set which project types and audience sizes can license this song. Buyers must fill in project details. This model uses this to adjust pricing and flag ineligible sync requests.
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                              <div className="w-2.5 h-2.5 rounded-sm bg-green-500/40" /> Allowed
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                              <div className="w-2.5 h-2.5 rounded-sm bg-red-400/40" /> Blocked (Needs Approval)
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {/* 左：Project Type */}
                          <div>
                            <div className="text-white/40 text-xs mb-2 flex items-center gap-2">
                              <span>⊞</span> Project Type
                            </div>
                            <div className="space-y-0.5">
                              {projectTypes.map((item) => (
                                <div
                                  key={item.label}
                                  onClick={() => setProjectTypes(prev =>
                                    prev.map(p => p.label === item.label ? { ...p, blocked: !p.blocked } : p)
                                  )}
                                  className={`grid grid-cols-[1fr_30px_50px] items-center px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                                    item.blocked ? "bg-red-400/15 text-red-300 hover:bg-red-400/25" : "bg-green-500/10 text-green-300 hover:bg-green-500/20"
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProject(item.label);
                                    }}
                                    className="text-[10px] text-white/70 bg-white/10 hover:bg-white/20 px-2 py-1 transition-colors flex items-center justify-center rounded-full"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-[10px] text-right">{item.blocked ? "Blocked" : "Allowed"}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 中：Audience Size */}
                          <div>
                            <div className="text-white/40 text-xs mb-2">General Audience Size Permissions</div>
                            <div className="space-y-0.5">
                              {audienceSizes.map((item) => (
                                <div
                                  key={item.label}
                                  onClick={() => setAudienceSizes(prev =>
                                    prev.map(a => a.label === item.label ? { ...a, blocked: !a.blocked } : a)
                                  )}
                                  className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                                    item.blocked ? "bg-red-400/15 text-red-300 hover:bg-red-400/25" : "bg-green-500/10 text-green-300 hover:bg-green-500/20"
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  <span className="text-[10px]">{item.blocked ? "⊗ Blocked" : "✓ Allowed"}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 右：Brand Restrictions */}
                          <div className="space-y-4">
                            {/* Blocked Brands */}
                            <div>
                              <div className="text-white/40 text-xs mb-2">Brand Restrictions</div>
                              {loadingSettings === t.id ? (
                                <div className="text-xs text-white/30">Loading...</div>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {brandRestrictions.map((brand) => (
                                    <span
                                      key={brand.id}
                                      onClick={() => {
                                        setCurrentSettings(curr => ({
                                          ...curr,
                                          brand_restrictions: curr.brand_restrictions.filter(b => b.id !== brand.id),
                                        }));
                                      }}
                                      className="text-xs px-2.5 py-1 rounded-full bg-red-400/15 text-red-300 border border-red-400/20 cursor-pointer hover:bg-red-400/25 hover:line-through transition-all"
                                      title="Click to remove"
                                    >
                                      {brand.brand_name}
                                    </span>
                                  ))}
                                  <span
                                    onClick={() => { setAddBrandPopup({ type: "blocked", value: "" }); setBrandAddInput(""); }}
                                    className="text-xs px-2.5 py-1 rounded-full border border-dashed border-white/20 text-white/40 cursor-pointer hover:bg-white/5"
                                  >
                                    +
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Brands That Need Requests */}
                            <div>
                              <div className="text-white/40 text-xs mb-2">Brands That Need Requests</div>
                              {loadingSettings === t.id ? (
                                <div className="text-xs text-white/30">Loading...</div>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {brandsThatNeedRequests.map((brand) => (
                                    <span
                                      key={brand.id}
                                      onClick={() => {
                                        setCurrentSettings(curr => ({
                                          ...curr,
                                          brands_that_need_requests: curr.brands_that_need_requests.filter(b => b.id !== brand.id),
                                        }));
                                      }}
                                      className="text-xs px-2.5 py-1 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/20 cursor-pointer hover:bg-yellow-400/25 hover:line-through transition-all"
                                      title="Click to remove"
                                    >
                                      {brand.brand_name}
                                    </span>
                                  ))}
                                  <span
                                    onClick={() => { setAddBrandPopup({ type: "needs_request", value: "" }); setBrandAddInput(""); }}
                                  >
                                    +
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 操作按鈕 */}
                    <div className="flex justify-end gap-2">
                      <button className="text-xs px-3 py-1.5 rounded-md border border-white/20 text-white/70">
                        Accept Model Price
                      </button>
                      <button
                        onClick={saveCurrentSettings}
                        disabled={loadingSettings === t.id}
                        className={`text-xs px-3 py-1.5 rounded-md ${loadingSettings === t.id ? "bg-white/5 text-white/30" : "bg-white/10 text-white hover:bg-white/20"}`}
                      >
                        {loadingSettings === t.id ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit popup — 放在最外層，確保 z-index 正確 */}
      {editingProject && (() => {
        const item = projectTypes.find(p => p.label === editingProject)!;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            // onClick={() => setEditingProject(null)}
          >
            <div
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-[600px] space-y-5"
              // onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-base">Pricing Details</div>
                  <div className="text-white/40 text-xs mt-0.5">{editingProject}</div>
                </div>
                <button onClick={() => setEditingProject(null)} className="text-white/40 text-xs hover:text-white/70 transition-colors">
                  Close Edit
                </button>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                <div>
                  <div className="text-white text-sm font-medium">Sync + Master License</div>
                  <div className="text-white/40 text-xs">Publisher Rights</div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/10">
                  <span className="text-white text-sm font-medium">Standard Rate</span>
                  <div className="flex items-center gap-1 text-white font-semibold">
                    <span>$</span>
                    <input
                      value={item.standardRate}
                      onChange={(e) => {
                        if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                          setProjectTypes(prev => prev.map(p =>
                            p.label === editingProject ? { ...p, standardRate: e.target.value } : p
                          ));
                        }
                      }}
                      onBlur={() => setProjectTypes(prev => prev.map(p =>
                        p.label === editingProject ? { ...p, standardRate: formatPrice(p.standardRate) } : p
                      ))}
                      className="bg-transparent text-right outline-none w-24"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/10">
                  <span className="text-white text-sm font-medium">Price Ceiling</span>
                  <div className="flex items-center gap-1 text-white font-semibold">
                    <span>$</span>
                    <input
                      value={item.priceCeiling}
                      onChange={(e) => {
                        if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                          setProjectTypes(prev => prev.map(p =>
                            p.label === editingProject ? { ...p, priceCeiling: e.target.value } : p
                          ));
                        }
                      }}
                      onBlur={() => setProjectTypes(prev => prev.map(p =>
                        p.label === editingProject ? { ...p, priceCeiling: formatPrice(p.priceCeiling) } : p
                      ))}
                      className="bg-transparent text-right outline-none w-24"
                    />
                  </div>
                </div>

              </div>

              <div className="space-y-1">
                <div className="text-white text-sm font-medium">Exclusivity</div>
                <div className="text-white/40 text-xs">This song can only be licensed on a non-exclusive deal.</div>
              </div>

              <div className="text-white text-sm font-medium">Licensing Area</div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                <div>
                  <div className="text-white/40 text-xs mb-2">Territories Available For Licensing</div>
                  <div className="flex gap-2 flex-wrap">
                    {territoryRefs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => toggleTerritory(t.id)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          territoryIds.includes(t.id) ? "border-green-400 text-green-400 bg-green-500/10" : "border-white/15 text-white/50"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-white/40 text-xs mb-2">Countries Available For Licensing</div>
                  <div className="flex gap-2 flex-wrap">
                    {countryRefs.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleCountry(c.id)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          countryIds.includes(c.id) ? "border-green-400 text-green-400 bg-green-500/10" : "border-white/15 text-white/50"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingProject(null)} className="text-xs px-3 py-1.5 rounded-md bg-white/10 text-white">
                  Discard Changes
                </button>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    saveCurrentSettings();
                  }}
                  className="text-xs px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Brand Add Popup */}
      {addBrandPopup && (
        <BrandAddModal
          type={addBrandPopup.type}
          inputValue={brandAddInput}
          onInputChange={setBrandAddInput}
          onAdd={(name) => {
            if (addBrandPopup.type === "blocked") {
              setCurrentSettings(curr => ({
                ...curr,
                brand_restrictions: [
                  ...curr.brand_restrictions,
                  { id: -Date.now(), brand_name: name, is_preset: false },
                ],
              }));
            } else {
              setCurrentSettings(curr => ({
                ...curr,
                brands_that_need_requests: [
                  ...curr.brands_that_need_requests,
                  { id: -Date.now(), brand_name: name, is_preset: false },
                ],
              }));
            }
            setAddBrandPopup(null);
            setBrandAddInput("");
          }}
          onClose={() => { setAddBrandPopup(null); setBrandAddInput(""); }}
        />
      )}
    </div>
  );
};
