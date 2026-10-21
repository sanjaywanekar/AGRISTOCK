"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ScanLine, Sparkles, Package, ImageIcon } from "lucide-react";
import { theme as T } from "../../../../../adminTheme";

type Scan = {
  scanId: string; farmerId: string; imageUrl: string; predictedLabel: string | null; confidence: number | null;
  recommendedProductId: string | null; createdAt: string;
  recommendedProduct?: {
    productId: string; name: string; price: number; rating: number | null;
    targetCondition: string | null; applicationMethod: string | null; dosage: string | null;
  } | null;
};

export default function ScanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const farmerId = params.id as string;
  const scanId = params.scanId as string;

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
  const imageUrl = (path: string) => !path ? "" : path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

  useEffect(() => {
    const fetchScan = async () => {
      try {
        setLoading(true);
        setError("");
        const token = getToken();
        if (!token) { router.replace("/login?role=admin"); return; }

        // FIX: was hardcoded to http://localhost:3001 — now uses the same env var as the rest of the app
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/farmers/${farmerId}/scans/${scanId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to load scan details");
        }

        setScan(await response.json());
      } catch (err) {
        console.error("Scan details error:", err);
        setError(err instanceof Error ? err.message : "Unable to load scan details.");
      } finally {
        setLoading(false);
      }
    };
    if (farmerId && scanId) fetchScan();
  }, [farmerId, scanId, router]);

  const confidenceStyle = (value: number | null) => {
    if (value === null) return { backgroundColor: "rgba(255,255,255,0.05)", color: T.textSoft };
    if (value >= 0.8) return { backgroundColor: T.greenBg, color: T.greenSoft };
    if (value >= 0.5) return { backgroundColor: T.amberBg, color: "#fbbf24" };
    return { backgroundColor: T.redBg, color: "#f87171" };
  };

  if (loading) {
    return <div className="min-h-full p-8 text-sm" style={{ backgroundColor: T.bg, color: T.textMuted }}>Loading scan details...</div>;
  }

  if (error || !scan) {
    return (
      <div className="min-h-full p-5 md:p-8" style={{ backgroundColor: T.bg }}>
        <button onClick={() => router.back()} className="mb-6 rounded-lg px-4 py-2 text-sm transition-colors" style={{ border: `1px solid ${T.border}`, color: T.textSoft }}>
          ← Back to Scan History
        </button>
        <div className="rounded-xl p-8 text-sm" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card, color: T.textMuted }}>
          {error || "Scan not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start gap-3">
        <button
          onClick={() => router.back()}
          className="mt-1 flex h-9 w-9 items-center justify-center rounded-md transition-colors flex-shrink-0"
          style={{ border: `1px solid ${T.border}` }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: T.textSoft }} />
        </button>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: T.text }}>Scan Details</h1>
          <p className="mt-1 text-xs" style={{ color: T.textMuted }}>Complete information about this plant scan.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* PLANT IMAGE — dominant visual element */}
        <div className="lg:col-span-3 rounded-xl p-5" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: T.text }}>Plant Image</h2>
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-lg" style={{ backgroundColor: "#000" }}>
            {scan.imageUrl ? (
              <img src={imageUrl(scan.imageUrl)} alt="Plant scan" className="max-h-[520px] max-w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8" style={{ color: T.textMuted }} />
                <p className="text-sm" style={{ color: T.textMuted }}>No image available</p>
              </div>
            )}
          </div>
        </div>

        {/* AI CLASSIFICATION */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4" style={{ color: T.blueSoft }} />
            <h2 className="text-sm font-semibold" style={{ color: T.text }}>AI Classification</h2>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs" style={{ color: T.textMuted }}>Condition</p>
              <p className="mt-1 text-lg font-medium" style={{ color: T.text }}>{scan.predictedLabel || "Not classified"}</p>
            </div>

            <div>
              <p className="text-xs mb-2" style={{ color: T.textMuted }}>Confidence</p>
              <span className="inline-block text-sm font-semibold px-3 py-1.5 rounded-md" style={confidenceStyle(scan.confidence)}>
                {scan.confidence !== null ? `${(scan.confidence * 100).toFixed(1)}%` : "—"}
              </span>
            </div>

            <div>
              <p className="text-xs" style={{ color: T.textMuted }}>Scan Date</p>
              <p className="mt-1 text-sm" style={{ color: T.textSoft }}>
                {new Date(scan.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>

            <div>
              <p className="text-xs" style={{ color: T.textMuted }}>Scan ID</p>
              <p className="mt-1 break-all font-mono text-xs" style={{ color: T.textMuted }}>{scan.scanId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FERTILIZER RECOMMENDATION — prominent */}
      <div className="mt-5 rounded-xl p-6" style={{ border: `1px solid ${T.border}`, backgroundColor: T.card }}>
        <div className="flex items-center gap-2 mb-5">
          <Package className="w-4 h-4" style={{ color: T.greenSoft }} />
          <h2 className="text-sm font-semibold" style={{ color: T.text }}>Fertilizer Recommendation</h2>
        </div>

        {!scan.recommendedProduct ? (
          <div className="rounded-lg p-6 text-center text-sm" style={{ border: `1px solid ${T.border}`, color: T.textMuted }}>
            No fertilizer recommendation for this scan.
          </div>
        ) : (
          <div className="rounded-lg p-5" style={{ backgroundColor: T.greenBg }}>
            <p className="text-lg font-bold mb-4" style={{ color: T.text }}>{scan.recommendedProduct.name}</p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs" style={{ color: T.textMuted }}>Price</p>
                <p className="mt-1 text-sm font-medium" style={{ color: T.text }}>₹{scan.recommendedProduct.price}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: T.textMuted }}>Stock</p>
                <p className="mt-1 text-sm font-medium" style={{ color: T.greenSoft }}>Available</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: T.textMuted }}>Target Condition</p>
                <p className="mt-1 text-sm" style={{ color: T.textSoft }}>{scan.recommendedProduct.targetCondition || "—"}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs" style={{ color: T.textMuted }}>Dosage</p>
                <p className="mt-1 text-sm" style={{ color: T.textSoft }}>{scan.recommendedProduct.dosage || "—"}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: T.textMuted }}>Application Method</p>
                <p className="mt-1 text-sm" style={{ color: T.textSoft }}>{scan.recommendedProduct.applicationMethod || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}