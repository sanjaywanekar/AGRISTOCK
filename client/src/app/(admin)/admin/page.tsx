"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "@/app/redux";
import { Factory, Sprout, Package, ScanLine, RefreshCw, Download, AlertCircle, TrendingUp, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { theme as T } from "../adminTheme";

interface AdminStats {
  totalFarmers: number;
  totalIndustrialists: number;
  totalProducts: number;
  totalScans: number;
  scansByLabel: { label: string; count: number }[];
  scansOverTime: { date: string; count: number }[];
}

const CONDITION_COLORS: Record<string, string> = {
  Healthy: "#22c55e", Nitrogen: "#3b82f6", Phosphorus: "#f59e0b", Potassium: "#a855f7", Magnesium: "#ec4899",
};

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded ${className}`} style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />;
}

function SectionCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: T.text }}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(false);
    const token = document.cookie.split("token=")[1]?.split(";")[0];
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = [
    { label: "Total Farmers", value: stats?.totalFarmers, icon: Sprout, color: T.greenSoft, bg: T.greenBg },
    { label: "Total Industrialists", value: stats?.totalIndustrialists, icon: Factory, color: T.blueSoft, bg: T.blueBg },
    { label: "Total Products", value: stats?.totalProducts, icon: Package, color: "#c084fc", bg: T.purpleBg },
    { label: "Total Scans", value: stats?.totalScans, icon: ScanLine, color: "#fb923c", bg: T.amberBg },
  ];

  const topCondition = stats && stats.scansByLabel.length > 0 ? [...stats.scansByLabel].sort((a, b) => b.count - a.count)[0] : null;
  const avgScansPerFarmer = stats && stats.totalFarmers > 0 ? (stats.totalScans / stats.totalFarmers).toFixed(1) : null;

  const exportCsv = () => {
    if (!stats) return;
    const rows = [
      ["Metric", "Value"], ["Total Farmers", stats.totalFarmers], ["Total Industrialists", stats.totalIndustrialists],
      ["Total Products", stats.totalProducts], ["Total Scans", stats.totalScans], [],
      ["Condition", "Count"], ...stats.scansByLabel.map((s) => [s.label, s.count]), [],
      ["Date", "Scans"], ...stats.scansOverTime.map((s) => [s.date, s.count]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `agristock-admin-stats-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* WELCOME */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: T.text }}>Welcome back, {user?.name || "Admin"}</h1>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>A system-wide view of AGRISTOCK — farmers, industrialists, and inventory.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStats} disabled={loading} className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: T.textSoft }}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={exportCsv} disabled={!stats} className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: T.blueBg, color: T.blueSoft }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 text-sm rounded-lg px-4 py-3" style={{ backgroundColor: T.redBg, border: "1px solid rgba(239,68,68,0.2)" }}>
          <span className="flex items-center gap-2" style={{ color: "#f87171" }}><AlertCircle className="w-4 h-4" /> Unable to load admin statistics. Please check your connection or try again.</span>
          <button onClick={fetchStats} className="text-xs font-semibold underline flex-shrink-0" style={{ color: "#f87171" }}>Retry</button>
        </div>
      )}

      {/* KEY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl p-5 flex flex-col gap-3 transition-colors" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: T.textMuted }}>{label}</span>
              {loading ? <Skeleton className="w-8 h-8" /> : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              )}
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : <span className="text-2xl font-bold" style={{ color: T.text }}>{value}</span>}
          </div>
        ))}
      </div>

      {/* SYSTEM ACTIVITY */}
      {!loading && stats && stats.totalScans > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {topCondition && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
              <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: T.blueSoft }} />
              <div><p className="text-xs" style={{ color: T.textMuted }}>Most Detected Condition</p><p className="text-sm font-semibold" style={{ color: T.text }}>{topCondition.label} ({topCondition.count})</p></div>
            </div>
          )}
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <Activity className="w-4 h-4 flex-shrink-0" style={{ color: "#fb923c" }} />
            <div><p className="text-xs" style={{ color: T.textMuted }}>Avg Scans per Farmer</p><p className="text-sm font-semibold" style={{ color: T.text }}>{avgScansPerFarmer ?? "—"}</p></div>
          </div>
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <Package className="w-4 h-4 flex-shrink-0" style={{ color: "#c084fc" }} />
            <div><p className="text-xs" style={{ color: T.textMuted }}>Active Condition Categories</p><p className="text-sm font-semibold" style={{ color: T.text }}>{stats.scansByLabel.length}</p></div>
          </div>
        </div>
      )}

      {/* AI CLASSIFICATION OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Scan Conditions" subtitle="Distribution of detected nutrient conditions">
          {loading ? <Skeleton className="h-[200px] w-full" /> : stats && stats.scansByLabel.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={200} className="sm:!w-1/2">
                <PieChart>
                  <Pie data={stats.scansByLabel} dataKey="count" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {stats.scansByLabel.map((entry) => <Cell key={entry.label} fill={CONDITION_COLORS[entry.label] || "#6b7280"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 w-full space-y-2">
                {stats.scansByLabel.map((entry) => {
                  const pct = stats.totalScans > 0 ? ((entry.count / stats.totalScans) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={entry.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2" style={{ color: T.textSoft }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: CONDITION_COLORS[entry.label] || "#6b7280" }} />{entry.label}
                      </span>
                      <span className="font-medium" style={{ color: T.text }}>{entry.count} <span style={{ color: T.textMuted }}>({pct}%)</span></span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <p className="text-sm" style={{ color: T.textMuted }}>No scan data available yet.</p>}
        </SectionCard>

        <SectionCard title="Scans — Last 30 Days" subtitle="Plant scans recorded over time">
          {loading ? <Skeleton className="h-[200px] w-full" /> : stats && stats.scansOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.scansOverTime}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#scanGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-sm" style={{ color: T.textMuted }}>No scans in the last 30 days.</p>}
        </SectionCard>
      </div>
    </div>
  );
}