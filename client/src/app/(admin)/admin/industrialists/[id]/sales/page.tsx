"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, RefreshCw, ShoppingCart, TrendingUp } from "lucide-react";
import { theme as T } from "../../../../adminTheme";

interface Sale {
  saleId: string; industrialistId: string; productId: string; timestamp: string;
  quantity: number; unitPrice: number; totalAmount: number;
  product?: { productId: string; name: string };
}

export default function IndustrialistSalesPage() {
  const params = useParams();
  const router = useRouter();
  const industrialistId = params.id as string;

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadSales = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      setError("");
      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists/${industrialistId}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to load sales");
      }
      setSales(await response.json());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load sales.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (industrialistId) loadSales(); }, [industrialistId]);

  const filteredSales = sales.filter((sale) => {
    const query = search.toLowerCase();
    return sale.saleId.toLowerCase().includes(query) || sale.productId.toLowerCase().includes(query) || (sale.product?.name || "").toLowerCase().includes(query);
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
  const formatDate = (date: string) => new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push(`/admin/industrialists/${industrialistId}`)}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: T.textSoft }} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: T.greenBg }}>
                <ShoppingCart className="w-5 h-5" style={{ color: T.greenSoft }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: T.text }}>Sales</h1>
            </div>
            <p className="text-sm mt-2" style={{ color: T.textMuted }}>View sales transactions belonging to this industrialist.</p>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted }}><TrendingUp className="w-4 h-4" /> Total Revenue</div>
            <p className="text-2xl font-bold mt-3" style={{ color: T.text }}>{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted }}><ShoppingCart className="w-4 h-4" /> Total Items Sold</div>
            <p className="text-2xl font-bold mt-3" style={{ color: T.text }}>{totalQuantity}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: T.redBg, border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>{error}</div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 flex-1" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <Search className="w-4 h-4" style={{ color: T.textMuted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sales..." className="bg-transparent outline-none text-sm w-full" style={{ color: T.text }} />
        </div>
        <button
          onClick={() => loadSales(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textSoft }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl p-12 flex justify-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3" style={{ color: T.textSoft }}><RefreshCw className="w-5 h-5 animate-spin" /> Loading sales...</div>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <ShoppingCart className="w-10 h-10 mx-auto mb-4" style={{ color: T.textMuted }} />
          <h3 className="font-semibold" style={{ color: T.text }}>No sales found</h3>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>{search ? "Try a different search." : "This industrialist has no sales yet."}</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead style={{ borderBottom: `1px solid ${T.border}` }}>
                <tr className="text-left text-xs" style={{ color: T.textMuted }}>
                  <th className="px-5 py-4">Product</th><th className="px-5 py-4">Sale ID</th><th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Unit Price</th><th className="px-5 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, i) => (
                  <tr key={sale.saleId} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold" style={{ color: T.text }}>{sale.product?.name || sale.productId}</p>
                      <p className="text-xs mt-1" style={{ color: T.textMuted }}>{sale.productId}</p>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: T.textSoft }}>{sale.saleId}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textSoft }}>{formatDate(sale.timestamp)}</td>
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: T.text }}>{sale.quantity}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textSoft }}>{formatCurrency(sale.unitPrice)}</td>
                    <td className="px-5 py-4 text-right text-sm font-semibold" style={{ color: T.greenSoft }}>{formatCurrency(sale.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}