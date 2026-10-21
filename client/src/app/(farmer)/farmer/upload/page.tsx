"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud, Sparkles, CheckCircle2, AlertTriangle, Star, History } from "lucide-react";

interface RecommendedProduct {
  productId: string;
  name: string;
  brand?: string | null;
  price: number;
  rating: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  targetCondition: string | null;
  dosage: string | null;
  applicationMethod: string | null;
}

interface ScanResult {
  scanId: string;
  predictedLabel: string | null;
  confidence: number | null;
  recommendedProduct: RecommendedProduct | null;
}

const C = {
  bgAlt: "#ffffff", ink: "#14251c", inkSoft: "#4b5d54", inkFaint: "#8a978f",
  green: "#1f7a4d", greenDark: "#123c28", greenSoft: "#e7f3ec", border: "#e3e7e2", white: "#ffffff",
  amber: "#92400e", amberSoft: "#fffbeb", amberBorder: "#fde68a",
  red: "#b91c1c", redSoft: "#fef2f2", redBorder: "#fecaca",
};

export default function UploadScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setStatus("loading");
    setResult(null);
    setErrorMessage("");

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      setStatus("error");
      setErrorMessage("You are not logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scans`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setResult(data);
      setStatus("done");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.");
    }
  };

  const isLowConfidence = result?.confidence !== null && result?.confidence !== undefined && result.confidence < 0.6;
  const isHealthy = result?.predictedLabel === "Healthy" && !isLowConfidence;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1" style={{ color: C.ink }}>AI Crop Health Scan</h1>
      <p className="text-sm mb-8" style={{ color: C.inkSoft }}>
        Upload a clear image of a plant leaf to analyze its visible nutrient condition.
      </p>

      {/* UPLOAD AREA */}
      <label
        htmlFor="leaf-upload"
        className="block rounded-2xl p-10 text-center cursor-pointer transition-colors"
        style={{ backgroundColor: C.greenSoft, border: `2px dashed ${C.green}` }}
      >
        <input id="leaf-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {preview ? (
          <img src={preview} alt="Selected plant leaf" className="max-h-64 mx-auto rounded-xl object-cover" />
        ) : (
          <>
            <UploadCloud className="w-10 h-10 mx-auto mb-3" style={{ color: C.green }} />
            <p className="font-semibold" style={{ color: C.greenDark }}>Upload Leaf Image</p>
            <p className="text-sm mt-1" style={{ color: C.inkSoft }}>PNG, JPG or JPEG</p>
            <span className="inline-block mt-4 text-sm font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: C.green, color: C.white }}>
              Choose Image
            </span>
          </>
        )}
      </label>

      {preview && status === "idle" && (
        <p className="text-sm mt-3 font-medium" style={{ color: C.inkSoft }}>Ready to Analyze</p>
      )}

      {/* SUBMIT */}
      {file && (
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="mt-4 inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-60"
          style={{ backgroundColor: C.green, color: C.white }}
        >
          <Sparkles className="w-4 h-4" />
          {status === "loading" ? "Analyzing Leaf..." : "Analyze Leaf"}
        </button>
      )}

      {/* ERROR */}
      {status === "error" && (
        <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: C.redSoft, border: `1px solid ${C.redBorder}` }}>
          <p className="font-semibold text-sm" style={{ color: C.red }}>Upload failed</p>
          <p className="text-sm mt-1" style={{ color: C.red }}>{errorMessage}</p>
        </div>
      )}

      {/* RESULT */}
      {status === "done" && result && (
        <div className="mt-8 rounded-2xl p-6" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
          <h2 className="font-bold mb-5" style={{ color: C.ink }}>AI Analysis Result</h2>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs" style={{ color: C.inkFaint }}>Detected Condition</p>
              <p className="text-lg font-bold mt-1" style={{ color: C.green }}>
                {isLowConfidence ? "Unable to determine" : result.predictedLabel || "Unknown"}
              </p>
            </div>
            {result.confidence !== null && (
              <div>
                <p className="text-xs" style={{ color: C.inkFaint }}>AI Confidence</p>
                <p className="text-lg font-bold mt-1" style={{ color: C.ink }}>{(result.confidence * 100).toFixed(2)}%</p>
              </div>
            )}
          </div>

          {isLowConfidence ? (
            <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: C.amberSoft, border: `1px solid ${C.amberBorder}` }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: C.amber }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: C.amber }}>Unable to confidently identify the nutrient condition</p>
                <p className="text-sm mt-1" style={{ color: C.amber }}>The AI confidence is below the 60% threshold.</p>
                <p className="text-sm mt-1" style={{ color: C.amber }}>Please upload a clearer leaf image.</p>
              </div>
            </div>
          ) : isHealthy ? (
            <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: C.greenSoft }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: C.green }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: C.greenDark }}>Healthy Leaf</p>
                <p className="text-sm mt-1" style={{ color: C.greenDark }}>The leaf appears healthy. No nutrient-deficiency fertilizer is recommended.</p>
              </div>
            </div>
          ) : result.recommendedProduct ? (
            <div className="rounded-xl p-5" style={{ backgroundColor: C.greenSoft }}>
              <p
  className="text-sm font-semibold mb-3"
  style={{ color: C.greenDark }}
>
  Recommended Fertilizer
</p>

<div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
  {result.recommendedProduct.imageUrl ? (
    <img
      src={
        result.recommendedProduct.imageUrl.startsWith("http")
          ? result.recommendedProduct.imageUrl
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}${result.recommendedProduct.imageUrl}`
      }
      alt={result.recommendedProduct.name}
      className="w-28 h-28 rounded-xl object-contain bg-white border p-2 shrink-0"
    />
  ) : (
    <div className="w-28 h-28 rounded-xl bg-white border flex items-center justify-center text-sm text-gray-400 shrink-0">
      No image
    </div>
  )}

  <div>
    <p
      className="text-lg font-bold"
      style={{ color: C.ink }}
    >
      {result.recommendedProduct.name}
    </p>
    <p className="text-sm text-gray-600 mt-1">
  Brand / Industry: {result.recommendedProduct.brand || "Not specified"}
</p>
    <p className="text-sm mt-1" style={{ color: C.inkSoft }}>
      Recommended based on the detected nutrient condition
    </p>
  </div>
</div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p style={{ color: C.inkFaint }}>Price</p>
                  <p className="font-semibold" style={{ color: C.ink }}>₹{result.recommendedProduct.price.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p style={{ color: C.inkFaint }}>Stock</p>
                  <p className="font-semibold" style={{ color: C.ink }}>{result.recommendedProduct.stockQuantity}</p>
                </div>
                {result.recommendedProduct.rating !== null && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" style={{ color: C.green }} fill={C.green} />
                    <span className="font-semibold" style={{ color: C.ink }}>{result.recommendedProduct.rating}</span>
                  </div>
                )}
              </div>
              {result.recommendedProduct.dosage && (
                <p className="text-sm mb-1" style={{ color: C.inkSoft }}>
                  <span className="font-semibold" style={{ color: C.ink }}>Dosage: </span>{result.recommendedProduct.dosage}
                </p>
              )}
              {result.recommendedProduct.applicationMethod && (
                <p className="text-sm" style={{ color: C.inkSoft }}>
                  <span className="font-semibold" style={{ color: C.ink }}>Application: </span>{result.recommendedProduct.applicationMethod}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl p-4" style={{ backgroundColor: C.amberSoft, border: `1px solid ${C.amberBorder}` }}>
              <p className="text-sm" style={{ color: C.amber }}>No matching fertilizer is currently available in inventory.</p>
            </div>
          )}

          <Link href="/farmer/history" className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold" style={{ color: C.green }}>
            <History className="w-3.5 h-3.5" /> View Scan History
          </Link>
        </div>
      )}
    </div>
  );
}