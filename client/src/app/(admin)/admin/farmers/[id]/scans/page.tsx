"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Search, ScanLine, Package, Calendar, Image as ImageIcon } from "lucide-react";
import { theme as T } from "../../../../adminTheme";

type Product = {
  productId: string; industrialistId: string; name: string; price: number; rating?: number | null;
  stockQuantity: number; targetCondition?: string | null; applicationMethod?: string | null; dosage?: string | null;
};

type Scan = {
  scanId: string; farmerId: string; imageUrl: string; predictedLabel?: string | null; confidence?: number | null;
  recommendedProductId?: string | null; createdAt: string; recommendedProduct?: Product | null;
};

export default function FarmerScansPage() {
  const params = useParams();
  const router = useRouter();
  const farmerId = params.id as string;

  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadScans = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      // FIX: was hardcoded to http://localhost:3001 — now uses the same env var as the rest of the app
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/farmers/${farmerId}/scans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to load farmer scans");
      const data = await response.json();
      setScans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load scan history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (farmerId) loadScans(); }, [farmerId]);

  const filteredScans = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return scans;
    return scans.filter((scan) =>
      scan.scanId.toLowerCase().includes(query) ||
      scan.predictedLabel?.toLowerCase().includes(query) ||
      scan.recommendedProduct?.name.toLowerCase().includes(query) ||
      scan.recommendedProductId?.toLowerCase().includes(query)
    );
  }, [scans, search]);

  const formatDate = (date: string) => new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const confidence = (value?: number | null) => value === null || value === undefined ? "—" : `${(value * 100).toFixed(1)}%`;
  const imageUrl = (path: string) => !path ? "" : path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

  const confidenceStyle = (value?: number | null) => {
    if (value === null || value === undefined) return { backgroundColor: "rgba(255,255,255,0.05)", color: T.textSoft };
    if (value >= 0.8) return { backgroundColor: T.greenBg, color: T.greenSoft };
    if (value >= 0.5) return { backgroundColor: T.amberBg, color: "#fbbf24" };
    return { backgroundColor: T.redBg, color: "#f87171" };
  };

  const totalScans = scans.length;
  const successfulScans = scans.filter((scan) => scan.predictedLabel).length;
  const recommendations = scans.filter((scan) => scan.recommendedProduct).length;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.back()}
            className="mt-1 w-9 h-9 rounded-md flex items-center justify-center transition-colors flex-shrink-0"
            style={{ border: `1px solid ${T.border}` }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: T.textSoft }} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" style={{ color: T.blueSoft }} />
              <h1 className="text-xl font-semibold" style={{ color: T.text }}>Scan History</h1>
            </div>
            <p className="text-xs mt-1" style={{ color: T.textMuted }}>View all plant scans and fertilizer recommendations for this farmer.</p>
          </div>
        </div>

        <button
          onClick={loadScans}
          disabled={loading}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs disabled:opacity-50 transition-colors flex-shrink-0"
          style={{ border: `1px solid ${T.border}`, color: T.textSoft }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Scans", value: totalScans, icon: ScanLine },
          { label: "Classified Scans", value: successfulScans, icon: ImageIcon },
          { label: "Recommendations", value: recommendations, icon: Package },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg p-4" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: T.textMuted }}>
              <Icon className="w-4 h-4" /> {label}
            </div>
            <p className="text-2xl font-semibold mt-3" style={{ color: T.text }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 rounded-md px-3" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
          <Search className="w-4 h-4" style={{ color: T.textMuted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scans, conditions or products..."
            className="w-full bg-transparent outline-none py-2.5 text-sm"
            style={{ color: T.text }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg p-4 text-sm mb-4" style={{ border: "1px solid rgba(239,68,68,0.2)", backgroundColor: T.redBg, color: "#f87171" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg p-12 text-center" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
          <RefreshCw className="w-6 h-6 animate-spin mx-auto" style={{ color: T.textMuted }} />
          <p className="text-sm mt-3" style={{ color: T.textMuted }}>Loading scan history...</p>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="rounded-lg p-12 text-center" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
          <ScanLine className="w-8 h-8 mx-auto" style={{ color: T.textMuted }} />
          <p className="text-sm font-medium mt-3" style={{ color: T.text }}>No scans found</p>
          <p className="text-xs mt-1" style={{ color: T.textMuted }}>{search ? "Try a different search." : "This farmer has not performed any scans yet."}</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
          <div className="hidden md:grid grid-cols-[80px_1.4fr_1fr_120px_1.4fr_160px] gap-4 px-4 py-3 text-[10px] uppercase tracking-wide" style={{ borderBottom: `1px solid ${T.border}`, color: T.textMuted }}>
            <div>Image</div><div>Condition</div><div>Confidence</div><div>Date</div><div>Recommended Product</div><div>Dosage</div>
          </div>

          {filteredScans.map((scan, i) => (
            <div
              key={scan.scanId}
              onClick={() => router.push(`/admin/farmers/${farmerId}/scans/${scan.scanId}`)}
              className="grid grid-cols-1 md:grid-cols-[80px_1.4fr_1fr_120px_1.4fr_160px] gap-4 px-4 py-4 cursor-pointer transition-colors"
              style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}
            >
              <div>
                {scan.imageUrl ? (
                  <img src={imageUrl(scan.imageUrl)} alt="Plant scan" className="w-14 h-14 rounded-md object-cover" style={{ border: `1px solid ${T.border}` }} />
                ) : (
                  <div className="w-14 h-14 rounded-md flex items-center justify-center" style={{ border: `1px solid ${T.border}` }}>
                    <ImageIcon className="w-5 h-5" style={{ color: T.textMuted }} />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium" style={{ color: T.text }}>{scan.predictedLabel || "Not classified"}</p>
                <p className="text-[10px] mt-1 break-all" style={{ color: T.textMuted }}>{scan.scanId}</p>
              </div>

              <div className="flex items-center">
                <span className="text-xs px-2 py-1 rounded-md" style={confidenceStyle(scan.confidence)}>
                  {confidence(scan.confidence)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs" style={{ color: T.textSoft }}>
                <Calendar className="w-3.5 h-3.5" /><span>{formatDate(scan.createdAt)}</span>
              </div>

              <div>
                {scan.recommendedProduct ? (
                  <>
                    <p className="text-sm font-medium" style={{ color: T.text }}>{scan.recommendedProduct.name}</p>
                    <p className="text-[10px] mt-1" style={{ color: T.textMuted }}>{scan.recommendedProductId}</p>
                  </>
                ) : <span className="text-xs" style={{ color: T.textMuted }}>No recommendation</span>}
              </div>

              <div className="text-xs" style={{ color: T.textSoft }}>{scan.recommendedProduct?.dosage || "—"}</div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] mt-4" style={{ color: T.textMuted }}>Showing {filteredScans.length} of {scans.length} scans</p>
    </div>
  );
}