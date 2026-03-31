/**
 * TransactionsPage Component
 * Full-page view of all recent transactions.
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ALL_TRANSACTIONS = [
  { songName: "Golden Hour", amount: "$4,200", date: "Mar 28, 2026", status: "Completed", licensee: "Netflix Studios" },
  { songName: "Velvet Haze", amount: "$2,800", date: "Mar 25, 2026", status: "Pending", licensee: "Nike Inc." },
  { songName: "Midnight Drive", amount: "$6,500", date: "Mar 22, 2026", status: "Completed", licensee: "Apple Music" },
  { songName: "Neon Pulse", amount: "$1,900", date: "Mar 20, 2026", status: "Completed", licensee: "EA Games" },
  { songName: "Southside Glow", amount: "$3,400", date: "Mar 18, 2026", status: "Processing", licensee: "HBO Max" },
  { songName: "Blue Satin", amount: "$5,100", date: "Mar 15, 2026", status: "Completed", licensee: "Spotify Originals" },
  { songName: "Neon Pulse", amount: "$2,200", date: "Mar 12, 2026", status: "Completed", licensee: "Adidas" },
  { songName: "Golden Hour", amount: "$7,800", date: "Mar 10, 2026", status: "Completed", licensee: "Universal Pictures" },
  { songName: "Midnight Drive", amount: "$3,600", date: "Mar 8, 2026", status: "Pending", licensee: "Samsung" },
  { songName: "Velvet Haze", amount: "$4,500", date: "Mar 5, 2026", status: "Completed", licensee: "Amazon Studios" },
  { songName: "Southside Glow", amount: "$1,800", date: "Mar 3, 2026", status: "Processing", licensee: "Coca-Cola" },
  { songName: "Blue Satin", amount: "$9,200", date: "Feb 28, 2026", status: "Completed", licensee: "BMW" },
];

export const TransactionsPage = () => {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/demo/dashboard" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-white font-dm tracking-tight">
          All Transactions
        </h1>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 px-3 py-2 text-xs text-white/40 font-dm">
          <div>Song Name</div>
          <div>Placement Amount</div>
          <div>Date</div>
          <div>Status</div>
          <div>Licensee Name</div>
        </div>
        {/* Table rows */}
        {ALL_TRANSACTIONS.map((tx, i) => (
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
  );
};
