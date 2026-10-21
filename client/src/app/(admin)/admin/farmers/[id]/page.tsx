"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sprout, ScanLine, Activity, CalendarDays, Mail, RefreshCw, ArrowRight, Leaf } from "lucide-react";
import { theme as T } from "../../../adminTheme";

interface Farmer {
  userId: string; name: string; email: string; role: string; createdAt: string;
  _count: { scanResults: number };
}

interface Scan {
  scanId: string; farmerId: string; imageUrl: string; predictedLabel: string | null;
  confidence: number | null; recommendedProductId: string | null; createdAt: string;
  recommendedProduct: {
    productId: string; name: string; price: number; rating: number | null; stockQuantity: number;
    targetCondition: string | null; applicationMethod: string | null; dosage: string | null;
  } | null;
}

export default function FarmerDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const farmerId = params.id as string;

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadData = async (refresh = false) => {
    try {
      setError("");
      if (refresh) setRefreshing(true); else setLoading(true);

      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const headers = { Authorization: `Bearer ${token}` };
      const [farmerResponse, scansResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/farmers/${farmerId}`, { headers, cache: "no-store" }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/farmers/${farmerId}/scans`, { headers, cache: "no-store" }),
      ]);

      if (!farmerResponse.ok) {
        const result = await farmerResponse.json().catch(() => null);
        throw new Error(result?.message || "Failed to load farmer");
      }
      if (!scansResponse.ok) {
        const result = await scansResponse.json().catch(() => null);
        throw new Error(result?.message || "Failed to load farmer scans");
      }

      setFarmer(await farmerResponse.json());
      setScans(await scansResponse.json());
    } catch (err) {
      console.error("Farmer dashboard error:", err);
      setError(err instanceof Error ? err.message : "Failed to load farmer dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (farmerId) loadData(); }, [farmerId]);

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const formatDateTime = (date: string) => new Date(date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const getConfidence = (confidence: number | null) => confidence === null ? "—" : `${(confidence * 100).toFixed(1)}%`;

  const deficiencyScans = scans.filter((scan) => scan.predictedLabel && scan.predictedLabel !== "Healthy");
  const healthyScans = scans.filter((scan) => scan.predictedLabel === "Healthy");
  const recommendations = scans.filter((scan) => scan.recommendedProduct);
  const latestScans = scans.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8" style={{ backgroundColor: T.bg }}>
        <div className="flex items-center gap-3" style={{ color: T.textSoft }}>
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading farmer dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 md:p-8">
        <button onClick={() => router.push("/admin/farmers")} className="flex items-center gap-2 text-sm mb-6" style={{ color: T.textSoft }}>
          <ArrowLeft className="w-4 h-4" /> Back to Farmers
        </button>
        <div className="rounded-xl p-6" style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: T.redBg, color: "#f87171" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!farmer) return null;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push("/admin/farmers")}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: T.textSoft }} />
          </button>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.greenBg }}>
            <Sprout className="w-5 h-5" style={{ color: T.greenSoft }} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold" style={{ color: T.text }}>{farmer.name}</h1>
              <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: T.greenBg, color: T.greenSoft }}>FARMER</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm" style={{ color: T.textMuted }}>
              <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {farmer.email}</span>
              <span className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Registered {formatDate(farmer.createdAt)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors flex-shrink-0"
          style={{ border: `1px solid ${T.border}`, backgroundColor: "rgba(255,255,255,0.03)", color: T.textSoft }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Scans", value: scans.length, icon: ScanLine },
          { label: "Deficiency Results", value: deficiencyScans.length, icon: Activity },
          { label: "Healthy Results", value: healthyScans.length, icon: Leaf },
          { label: "Recommendations", value: recommendations.length, icon: Sprout },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl p-5" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: T.textMuted }}>
              <Icon className="w-4 h-4" /> {label}
            </div>
            <p className="text-2xl font-bold mt-3" style={{ color: T.text }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: T.text }}>Recent Scan Activity</h2>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>Latest plant analysis results for this farmer.</p>
        </div>
        {scans.length > 0 && (
          <button
            onClick={() => router.push(`/admin/farmers/${farmerId}/scans`)}
            className="flex items-center gap-2 text-sm"
            style={{ color: T.blueSoft }}
          >
            View All Scans <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {latestScans.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <ScanLine className="w-10 h-10 mx-auto mb-4" style={{ color: T.textMuted }} />
          <h3 className="font-semibold" style={{ color: T.text }}>No scans yet</h3>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>This farmer has not uploaded any plant scans.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead style={{ borderBottom: `1px solid ${T.border}` }}>
                <tr className="text-left text-xs" style={{ color: T.textMuted }}>
                  <th className="px-5 py-4">Result</th>
                  <th className="px-5 py-4">Confidence</th>
                  <th className="px-5 py-4">Recommended Fertilizer</th>
                  <th className="px-5 py-4">Dosage</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {latestScans.map((scan, i) => (
                  <tr key={scan.scanId} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium"
                        style={
                          scan.predictedLabel === "Healthy" ? { backgroundColor: T.greenBg, color: T.greenSoft } :
                          scan.predictedLabel ? { backgroundColor: T.amberBg, color: "#fbbf24" } :
                          { backgroundColor: "rgba(255,255,255,0.05)", color: T.textSoft }
                        }
                      >
                        {scan.predictedLabel || "Unknown"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textSoft }}>{getConfidence(scan.confidence)}</td>
                    <td className="px-5 py-4">
                      {scan.recommendedProduct ? (
                        <div>
                          <p className="text-sm font-medium" style={{ color: T.text }}>{scan.recommendedProduct.name}</p>
                          <p className="text-xs mt-1" style={{ color: T.textMuted }}>Stock: {scan.recommendedProduct.stockQuantity}</p>
                        </div>
                      ) : <span className="text-sm" style={{ color: T.textMuted }}>No recommendation</span>}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textMuted }}>{scan.recommendedProduct?.dosage || "—"}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textMuted }}>{formatDateTime(scan.createdAt)}</td>
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