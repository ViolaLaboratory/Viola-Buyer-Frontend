/**
 * CountriesPage Component
 * Full-page view of sync licensing breakdown by country.
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ALL_COUNTRIES = [
  { name: "United States", percentage: 42, revenue: "$73,850" },
  { name: "United Kingdom", percentage: 18, revenue: "$31,650" },
  { name: "Germany", percentage: 12, revenue: "$21,100" },
  { name: "Japan", percentage: 10, revenue: "$17,583" },
  { name: "South Korea", percentage: 8, revenue: "$14,067" },
  { name: "Brazil", percentage: 6, revenue: "$10,550" },
  { name: "France", percentage: 5, revenue: "$8,792" },
  { name: "Canada", percentage: 4, revenue: "$7,033" },
  { name: "Australia", percentage: 3, revenue: "$5,275" },
  { name: "Mexico", percentage: 2, revenue: "$3,517" },
  { name: "India", percentage: 1.5, revenue: "$2,638" },
  { name: "Netherlands", percentage: 1, revenue: "$1,758" },
];

export const CountriesPage = () => {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/demo/dashboard" className="text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-white font-dm tracking-tight">
          Revenue by Country
        </h1>
      </div>

      {/* Countries list */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        {ALL_COUNTRIES.map((country) => (
          <div key={country.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">{country.name}</span>
              <div className="flex items-center gap-4">
                <span className="text-white/70 text-sm">{country.revenue}</span>
                <span className="text-white/50 text-xs w-10 text-right">{country.percentage}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500"
                style={{ width: `${country.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
