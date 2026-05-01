import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API_ENDPOINTS from "@/config/api";

type Transaction = {
  song_name: string;
  placement_amount: number;
  transaction_date: string;
  status: string;
  license_name: string;
};

export const TransactionsPage = () => {
  const [rows, setRows] = useState<Transaction[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.DASHBOARD_DETAILS, { method: "GET", credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setRows(Array.isArray(data.recent_transactions) ? data.recent_transactions : []);
      } catch {
        // no-op
      }
    };
    run();
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0);
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "-";
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/demo/dashboard" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-white font-dm tracking-tight">All Transactions</h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="grid grid-cols-5 gap-4 px-3 py-2 text-xs text-white/40 font-dm">
          <div>Song Name</div>
          <div>Placement Amount</div>
          <div>Date</div>
          <div>Status</div>
          <div>Licensee Name</div>
        </div>
        {rows.map((tx, i) => (
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
        {rows.length === 0 && <div className="px-3 py-6 text-sm text-white/40 border-t border-white/5">No transaction data yet.</div>}
      </div>
    </div>
  );
};
