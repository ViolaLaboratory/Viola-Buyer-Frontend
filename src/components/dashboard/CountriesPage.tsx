import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API_ENDPOINTS from "@/config/api";

type CountryRow = {
  name: string;
  percentage: number;
  revenue: number;
  top_tracks?: { title: string; artist: string; revenue: number }[];
};

export const CountriesPage = () => {
  const [rows, setRows] = useState<CountryRow[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.DASHBOARD_DETAILS, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setRows(Array.isArray(data.by_country) ? data.by_country : []);
      } catch {
        // no-op
      }
    };
    run();
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0);

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/demo/dashboard" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-white font-dm tracking-tight">Revenue by Country</h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        {rows.map((country) => (
          <div key={country.name} className="space-y-2 border-b border-white/5 pb-3 last:border-b-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">{country.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-white/70 text-sm">{formatMoney(country.revenue)}</span>
                <span className="text-white/50 text-xs w-10 text-right">{country.percentage}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-purple-500" style={{ width: `${country.percentage}%` }} />
            </div>
            {!!country.top_tracks?.length && (
              <div className="text-xs text-white/60">
                Top Tracks: {country.top_tracks.map((t) => `${t.title} (${formatMoney(t.revenue)})`).join(", ")}
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-white/40">No country sales data yet.</div>}
      </div>
    </div>
  );
};
