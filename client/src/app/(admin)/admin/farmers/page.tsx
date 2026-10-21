"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, Search, RefreshCw, ArrowRight, ScanLine, Mail, CalendarDays } from "lucide-react";
import { theme as T } from "../../adminTheme";

interface Farmer {
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { scanResults: number };
}

export default function FarmersPage() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadFarmers = async (isRefresh = false) => {
    try {
      setError("");
      if (isRefresh) setRefreshing(true); else setLoading(true);

      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/farmers`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Failed to load farmers");
      }

      setFarmers(await response.json());
    } catch (err) {
      console.error("Load farmers error:", err);
      setError(err instanceof Error ? err.message : "Failed to load farmers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadFarmers(); }, []);

  const filteredFarmers = farmers.filter((farmer) => {
    const query = search.toLowerCase();
    return farmer.name.toLowerCase().includes(query) || farmer.email.toLowerCase().includes(query);
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.greenBg }}>
            <Sprout className="w-5 h-5" style={{ color: T.greenSoft }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: T.text }}>Farmers</h1>
            <p className="text-sm mt-1" style={{ color: T.textMuted }}>Manage registered farmers and view their scan activity.</p>
          </div>
        </div>
        <button
          onClick={() => loadFarmers(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors flex-shrink-0"
          style={{ border: `1px solid ${T.border}`, backgroundColor: "rgba(255,255,255,0.03)", color: T.textSoft }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted }}>
              <Sprout className="w-4 h-4" /> Registered Farmers
            </div>
            <p className="text-2xl font-bold mt-3" style={{ color: T.text }}>{farmers.length}</p>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted }}>
              <ScanLine className="w-4 h-4" /> Total Scans
            </div>
            <p className="text-2xl font-bold mt-3" style={{ color: T.text }}>
              {farmers.reduce((total, farmer) => total + farmer._count.scanResults, 0)}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: T.redBg, color: "#f87171" }}>
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg px-3 py-3 mb-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: T.textMuted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search farmers..."
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: T.text }}
        />
      </div>

      {loading && (
        <div className="rounded-xl p-12 flex items-center justify-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3" style={{ color: T.textSoft }}>
            <RefreshCw className="w-5 h-5 animate-spin" /> Loading farmers...
          </div>
        </div>
      )}

      {!loading && filteredFarmers.length === 0 && (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <Sprout className="w-10 h-10 mx-auto mb-4" style={{ color: T.textMuted }} />
          <h3 className="font-semibold" style={{ color: T.text }}>No farmers found</h3>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>{search ? "Try a different search." : "No farmers are registered yet."}</p>
        </div>
      )}

      {!loading && filteredFarmers.length > 0 && (
        <div className="space-y-3">
          {filteredFarmers.map((farmer) => (
            <div
              key={farmer.userId}
              className="rounded-xl p-5 transition-colors"
              style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0" style={{ backgroundColor: T.greenBg, color: T.greenSoft }}>
                    {farmer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: T.text }}>{farmer.name}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: T.textMuted }}>
                      <Mail className="w-3.5 h-3.5" /> {farmer.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: T.textMuted }}>
                      <CalendarDays className="w-3.5 h-3.5" /> Registered {formatDate(farmer.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="min-w-[130px] rounded-lg px-5 py-3" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                    <div className="flex items-center gap-2 text-xs" style={{ color: T.textMuted }}>
                      <ScanLine className="w-3.5 h-3.5" /> Scans
                    </div>
                    <p className="text-xl font-semibold mt-1" style={{ color: T.text }}>{farmer._count.scanResults}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/admin/farmers/${farmer.userId}`)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.text }}
                  >
                    View Farmer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}