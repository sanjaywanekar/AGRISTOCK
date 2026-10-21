"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Sparkles, XCircle, Clock, Star, ScanLine } from "lucide-react";

interface RecommendedProduct {
  productId: string; name: string; price: number; rating: number | null;
  stockQuantity: number; targetCondition: string | null; dosage: string | null; applicationMethod: string | null;
}

interface Scan {
  scanId: string; farmerId: string; imageUrl: string; predictedLabel: string | null;
  confidence: number | null; recommendedProductId: string | null; createdAt: string;
  recommendedProduct: RecommendedProduct | null;
}

const C = {
  bgAlt: "#ffffff", ink: "#14251c", inkSoft: "#4b5d54", inkFaint: "#8a978f",
  green: "#1f7a4d", greenDark: "#123c28", greenSoft: "#e7f3ec", border: "#e3e7e2", white: "#ffffff",
  amber: "#92400e", amberSoft: "#fffbeb",
  red: "#b91c1c", redSoft: "#fef2f2",
};

function getScanStatus(scan: Scan) {
  if (scan.confidence === null) return { label: "Analysis Pending", icon: Clock, color: C.inkFaint, bg: "#f3f4f1" };
  if (scan.confidence < 0.6) return { label: "Low Confidence", icon: AlertTriangle, color: C.amber, bg: C.amberSoft };
  if (scan.predictedLabel === "Healthy") return { label: "Healthy", icon: CheckCircle2, color: C.green, bg: C.greenSoft };
  if (scan.recommendedProduct) return { label: "Recommendation Available", icon: Sparkles, color: C.green, bg: C.greenSoft };
  return { label: "No Matching Fertilizer", icon: XCircle, color: C.amber, bg: C.amberSoft };
}

export default function ScanHistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
        if (!token) { setError("You are not logged in."); return; }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch scans");

        const data = await response.json();
        setScans(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load scan history.");
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: C.ink }}>Scan History</h1>
        <p className="mt-2 text-sm" style={{ color: C.inkSoft }}>Loading scans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold" style={{ color: C.ink }}>Scan History</h1>
        <p className="mt-4 text-sm" style={{ color: C.red }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{ color: C.ink }}>Scan History</h1>
      <p className="mt-2 text-sm mb-8" style={{ color: C.inkSoft }}>
        View your previously uploaded plant images and AI analysis.
      </p>

      {scans.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.greenSoft }}>
            <ScanLine className="w-6 h-6" style={{ color: C.green }} />
          </div>
          <p className="font-semibold" style={{ color: C.ink }}>No scan history yet.</p>
          <p className="text-sm mt-1 mb-5" style={{ color: C.inkSoft }}>Upload your first leaf image to get started.</p>
          <Link href="/farmer/upload" className="inline-block font-semibold px-5 py-2.5 rounded-lg" style={{ backgroundColor: C.green, color: C.white }}>
            Start Your First Scan
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scans.map((scan) => {
            const status = getScanStatus(scan);
            const StatusIcon = status.icon;
            return (
              <div key={scan.scanId} className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
                <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${scan.imageUrl}`} alt="Uploaded plant" className="h-44 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs" style={{ color: C.inkFaint }}>{new Date(scan.createdAt).toLocaleString()}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: status.bg, color: status.color }}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </span>
                  </div>

                  {scan.confidence !== null && scan.confidence >= 0.6 && scan.predictedLabel !== "Healthy" && (
                    <>
                      <p className="text-xs" style={{ color: C.inkFaint }}>Detected Condition</p>
                      <p className="font-bold mb-2" style={{ color: C.green }}>{scan.predictedLabel || "Unknown"}</p>
                      <p className="text-xs" style={{ color: C.inkFaint }}>AI Confidence</p>
                      <p className="font-semibold text-sm mb-3" style={{ color: C.ink }}>{(scan.confidence * 100).toFixed(2)}%</p>
                    </>
                  )}

                  {scan.recommendedProduct && scan.confidence !== null && scan.confidence >= 0.6 && scan.predictedLabel !== "Healthy" && (
                    <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: C.greenSoft }}>
                      <p className="font-semibold text-sm" style={{ color: C.greenDark }}>{scan.recommendedProduct.name}</p>
                      <p className="text-xs mt-1" style={{ color: C.inkSoft }}>₹{scan.recommendedProduct.price.toLocaleString("en-IN")} · Stock {scan.recommendedProduct.stockQuantity}</p>
                      {scan.recommendedProduct.rating !== null && (
                        <p className="text-xs flex items-center gap-1 mt-1" style={{ color: C.inkSoft }}>
                          <Star className="w-3 h-3" style={{ color: C.green }} fill={C.green} /> {scan.recommendedProduct.rating}
                        </p>
                      )}
                      {scan.recommendedProduct.dosage && <p className="text-xs mt-2" style={{ color: C.inkSoft }}><b>Dosage:</b> {scan.recommendedProduct.dosage}</p>}
                      {scan.recommendedProduct.applicationMethod && <p className="text-xs mt-1" style={{ color: C.inkSoft }}><b>Application:</b> {scan.recommendedProduct.applicationMethod}</p>}
                    </div>
                  )}

                  {scan.confidence !== null && scan.confidence < 0.6 && (
                    <p className="text-sm" style={{ color: C.amber }}>Please upload a clearer leaf image.</p>
                  )}
                  {scan.predictedLabel === "Healthy" && scan.confidence !== null && scan.confidence >= 0.6 && (
                    <p className="text-sm" style={{ color: C.greenDark }}>No nutrient-deficiency fertilizer recommended.</p>
                  )}
                  {scan.confidence === null && (
                    <p className="text-sm" style={{ color: C.inkFaint }}>AI analysis is being processed.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}