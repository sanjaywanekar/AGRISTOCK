"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Factory, Package, ShoppingCart, ShoppingBag, Receipt, Boxes, TrendingUp, TrendingDown, RefreshCw, Mail, Calendar } from "lucide-react";
import { theme as T } from "../../../adminTheme";

interface DashboardData {
  industrialist: { userId: string; name: string; email: string; createdAt: string };
  totals: { products: number; sales: number; purchases: number; expenses: number; stock: number };
  financials: { sales: number; purchases: number; expenses: number; estimatedProfit: number };
}

export default function IndustrialistDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadDashboard = async () => {
    try {
      setError("");
      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists/${id}/dashboard`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("Industrialist not found.");
        throw new Error("Failed to load industrialist dashboard.");
      }

      setData(await response.json());
    } catch (err) {
      console.error("Industrialist dashboard error:", err);
      setError(err instanceof Error ? err.message : "Unable to load industrialist dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (id) loadDashboard(); }, [id]);

  const refreshDashboard = () => { setRefreshing(true); loadDashboard(); };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ backgroundColor: T.bg }}>
        <div className="flex items-center gap-3" style={{ color: T.textSoft }}>
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading industrialist dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-5 md:p-8">
        <button onClick={() => router.push("/admin/industrialists")} className="flex items-center gap-2 text-sm mb-6" style={{ color: T.textSoft }}>
          <ArrowLeft className="w-4 h-4" /> Back to Industrialists
        </button>
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: T.card, border: "1px solid rgba(239,68,68,0.2)" }}>
          <Factory className="w-10 h-10 mx-auto mb-4" style={{ color: "#f87171" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: T.text }}>Unable to load dashboard</h2>
          <p className="text-sm" style={{ color: T.textMuted }}>{error || "Industrialist data was not found."}</p>
        </div>
      </div>
    );
  }

  const { industrialist, totals, financials } = data;
  const profitPositive = financials.estimatedProfit >= 0;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/admin/industrialists")}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors mt-1 flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: T.textSoft }} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: T.blueBg }}>
                <Factory className="w-5 h-5" style={{ color: T.blueSoft }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: T.text }}>{industrialist.name}</h1>
              <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: T.greenBg, color: T.greenSoft }}>INDUSTRIALIST</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: T.textMuted }}>
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {industrialist.email}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Registered {new Date(industrialist.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        </div>

        <button
          onClick={refreshDashboard}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textSoft }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <MetricCard icon={Package} label="Products" value={totals.products} />
        <MetricCard icon={ShoppingCart} label="Sales" value={totals.sales} />
        <MetricCard icon={ShoppingBag} label="Purchases" value={totals.purchases} />
        <MetricCard icon={Receipt} label="Expenses" value={totals.expenses} />
        <MetricCard icon={Boxes} label="Current Stock" value={totals.stock} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4" style={{ color: T.text }}>Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <FinancialCard icon={TrendingUp} label="Total Sales" value={formatCurrency(financials.sales)} />
          <FinancialCard icon={ShoppingBag} label="Total Purchases" value={formatCurrency(financials.purchases)} />
          <FinancialCard icon={Receipt} label="Total Expenses" value={formatCurrency(financials.expenses)} />
          <FinancialCard icon={profitPositive ? TrendingUp : TrendingDown} label="Estimated Profit" value={formatCurrency(financials.estimatedProfit)} positive={profitPositive} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: T.text }}>Manage Industrialist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ManagementCard icon={Package} title="Products" description="View and manage fertilizer products." onClick={() => router.push(`/admin/industrialists/${id}/products`)} />
          <ManagementCard icon={ShoppingCart} title="Sales" description="View sales transactions and revenue." onClick={() => router.push(`/admin/industrialists/${id}/sales`)} />
          <ManagementCard icon={ShoppingBag} title="Purchases" description="View purchase transactions." onClick={() => router.push(`/admin/industrialists/${id}/purchases`)} />
          <ManagementCard icon={Receipt} title="Expenses" description="View recorded business expenses." onClick={() => router.push(`/admin/industrialists/${id}/expenses`)} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: T.blueBg }}>
        <Icon className="w-4 h-4" style={{ color: T.blueSoft }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: T.text }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: T.textMuted }}>{label}</p>
    </div>
  );
}

function FinancialCard({ icon: Icon, label, value, positive }: { icon: React.ElementType; label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
          <Icon className="w-4 h-4" style={{ color: T.textSoft }} />
        </div>
        <span className="text-sm" style={{ color: T.textSoft }}>{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color: positive === true ? T.greenSoft : positive === false ? "#f87171" : T.text }}>
        {value}
      </p>
    </div>
  );
}

function ManagementCard({ icon: Icon, title, description, onClick }: { icon: React.ElementType; title: string; description: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left rounded-xl p-5 transition-all" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: T.blueBg }}>
        <Icon className="w-4 h-4" style={{ color: T.blueSoft }} />
      </div>
      <h3 className="font-semibold mb-1" style={{ color: T.text }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: T.textMuted }}>{description}</p>
    </button>
  );
}