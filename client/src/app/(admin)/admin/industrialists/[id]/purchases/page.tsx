"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, RefreshCw, ShoppingBag, TrendingDown } from "lucide-react";
import { theme as T } from "../../../../adminTheme";

interface Purchase {
  purchaseId: string; industrialistId: string; productId: string; timestamp: string;
  quantity: number; unitCost: number; totalCost: number;
  product?: { productId: string; name: string };
}

export default function IndustrialistPurchasesPage() {
  const params = useParams();
  const router = useRouter();
  const industrialistId = params.id as string;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadPurchases = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      setError("");
      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists/${industrialistId}/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to load purchases");
      }
      setPurchases(await response.json());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load purchases.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (industrialistId) loadPurchases(); }, [industrialistId]);

  const filteredPurchases = purchases.filter((purchase) => {
    const query = search.toLowerCase();
    return purchase.purchaseId.toLowerCase().includes(query) || purchase.productId.toLowerCase().includes(query) || (purchase.product?.name || "").toLowerCase().includes(query);
  });

  const totalPurchaseCost = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const totalQuantity = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
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
                <ShoppingBag className="w-5 h-5" style={{ color: T.greenSoft }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: T.text }}>Purchases</h1>
            </div>
            <p className="text-sm mt-2" style={{ color: T.textMuted }}>View purchase transactions belonging to this industrialist.</p>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted }}><TrendingDown className="w-4 h-4" /> Total Purchase Cost</div>
            <p className="text-2xl font-bold mt-3" style={{ color: T.text }}>{formatCurrency(totalPurchaseCost)}</p>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted }}><ShoppingBag className="w-4 h-4" /> Total Items Purchased</div>
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search purchases..." className="bg-transparent outline-none text-sm w-full" style={{ color: T.text }} />
        </div>
        <button
          onClick={() => loadPurchases(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textSoft }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl p-12 flex justify-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3" style={{ color: T.textSoft }}><RefreshCw className="w-5 h-5 animate-spin" /> Loading purchases...</div>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <ShoppingBag className="w-10 h-10 mx-auto mb-4" style={{ color: T.textMuted }} />
          <h3 className="font-semibold" style={{ color: T.text }}>No purchases found</h3>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>{search ? "Try a different search." : "This industrialist has no purchases yet."}</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead style={{ borderBottom: `1px solid ${T.border}` }}>
                <tr className="text-left text-xs" style={{ color: T.textMuted }}>
                  <th className="px-5 py-4">Product</th><th className="px-5 py-4">Purchase ID</th><th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Quantity</th><th className="px-5 py-4">Unit Cost</th><th className="px-5 py-4 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase, i) => (
                  <tr key={purchase.purchaseId} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold" style={{ color: T.text }}>{purchase.product?.name || purchase.productId}</p>
                      <p className="text-xs mt-1" style={{ color: T.textMuted }}>{purchase.productId}</p>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: T.textSoft }}>{purchase.purchaseId}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textSoft }}>{formatDate(purchase.timestamp)}</td>
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: T.text }}>{purchase.quantity}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textSoft }}>{formatCurrency(purchase.unitCost)}</td>
                    <td className="px-5 py-4 text-right text-sm font-semibold" style={{ color: T.greenSoft }}>{formatCurrency(purchase.totalCost)}</td>
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