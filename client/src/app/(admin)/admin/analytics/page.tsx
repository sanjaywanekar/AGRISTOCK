"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { theme as T } from "../../adminTheme";

type AdminStats = {
  totalFarmers: number; totalIndustrialists: number; totalProducts: number; totalScans: number;
  scansByLabel: { label: string; count: number }[]; scansOverTime: { date: string; count: number }[];
};

const CONDITION_COLORS: Record<string, string> = {
  Healthy: "#22c55e", Nitrogen: "#3b82f6", Phosphorus: "#f59e0b", Potassium: "#a855f7", Magnesium: "#ec4899",
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) { setError("Authentication required"); return; }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error();
      setStats(await response.json());
    } catch {
      setError("Unable to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="p-8 text-sm" style={{ color: T.textMuted }}>Loading analytics...</div>;
  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="rounded-xl p-8 text-sm" style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, color: T.textMuted }}>
          {error || "Unable to load analytics"}
        </div>
      </div>
    );
  }

  const highestLabel = stats.scansByLabel.length > 0 ? [...stats.scansByLabel].sort((a, b) => b.count - a.count)[0] : null;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: T.blueBg }}>
          <BarChart3 className="w-5 h-5" style={{ color: T.blueSoft }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: T.text }}>Analytics</h1>
          <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>Overview of AGRISTOCK system activity and scan analytics.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {[
          { label: "Total Farmers", value: stats.totalFarmers, sub: "Registered farmers" },
          { label: "Industrialists", value: stats.totalIndustrialists, sub: "Registered industrialists" },
          { label: "Total Products", value: stats.totalProducts, sub: "Products in inventory" },
          { label: "Total Scans", value: stats.totalScans, sub: "Plant scans performed" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>{c.label}</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: T.text }}>{c.value}</p>
            <p className="mt-1 text-xs" style={{ color: T.textMuted }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 mb-6">
        <div className="rounded-xl p-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: T.text }}>Scan Classification</h2>
          <p className="text-xs mb-5" style={{ color: T.textMuted }}>Distribution of detected nutrient conditions.</p>
          {stats.scansByLabel.length === 0 ? (
            <p className="text-sm" style={{ color: T.textMuted }}>No scan classification data available.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={220} className="sm:!w-1/2">
                <PieChart>
                  <Pie data={stats.scansByLabel} dataKey="count" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {stats.scansByLabel.map((entry) => <Cell key={entry.label} fill={CONDITION_COLORS[entry.label] || "#6b7280"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 w-full space-y-2">
                {stats.scansByLabel.map((item) => {
                  const pct = stats.totalScans > 0 ? (item.count / stats.totalScans) * 100 : 0;
                  return (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2" style={{ color: T.textSoft }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: CONDITION_COLORS[item.label] || "#6b7280" }} />{item.label}
                      </span>
                      <span style={{ color: T.text }}>{item.count} <span style={{ color: T.textMuted }}>({pct.toFixed(1)}%)</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {highestLabel && (
            <div className="mt-6 rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
              <TrendingUp className="w-4 h-4" style={{ color: T.blueSoft }} />
              <div>
                <p className="text-xs" style={{ color: T.textMuted }}>Most detected condition</p>
                <p className="text-sm font-medium" style={{ color: T.text }}>{highestLabel.label} — {highestLabel.count} scans</p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl p-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: T.text }}>Scan Activity</h2>
          <p className="text-xs mb-5" style={{ color: T.textMuted }}>Plant scans recorded over the last 30 days.</p>
          {stats.scansOverTime.length === 0 ? (
            <p className="text-sm" style={{ color: T.textMuted }}>No scan activity available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.scansOverTime}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#analyticsGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
        <h2 className="text-sm font-semibold mb-5" style={{ color: T.text }}>Analytics Summary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Average scans per farmer", value: stats.totalFarmers > 0 ? (stats.totalScans / stats.totalFarmers).toFixed(1) : "0" },
            { label: "Classified scans", value: stats.scansByLabel.reduce((sum, i) => sum + i.count, 0) },
            { label: "Active inventory products", value: stats.totalProducts },
          ].map((s) => (
            <div key={s.label} className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
              <p className="text-xs" style={{ color: T.textMuted }}>{s.label}</p>
              <p className="mt-2 text-lg font-medium" style={{ color: T.text }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}