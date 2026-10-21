"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/app/redux";
import { ScanLine, History, UserCircle, UploadCloud, ImageIcon, Sun, Eye, ArrowRight } from "lucide-react";

interface Scan {
  scanId: string;
  predictedLabel: string | null;
  confidence: number | null;
  createdAt: string;
}

const C = {
  bg: "#f7f8f6", bgAlt: "#ffffff", ink: "#14251c", inkSoft: "#4b5d54", inkFaint: "#8a978f",
  green: "#1f7a4d", greenDark: "#123c28", greenSoft: "#e7f3ec", border: "#e3e7e2", white: "#ffffff",
};

export default function FarmerDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scans`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch scans");

        const data = await response.json();
        setScans(data);
      } catch (error) {
        console.error("Failed to load farmer scans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  const totalScans = scans.length;
  const latestScan = scans[0] || null;
  const latestCondition = latestScan?.predictedLabel || "No scans yet";
  const latestConfidence =
    latestScan?.confidence !== null && latestScan?.confidence !== undefined
      ? `${(latestScan.confidence * 100).toFixed(2)}%`
      : "N/A";

  const steps = [
    { n: "01", title: "Upload Leaf Image", desc: "Upload a clear image of your crop leaf.", icon: UploadCloud },
    { n: "02", title: "AI Analysis", desc: "Our AI analyzes the visible condition of the leaf.", icon: ScanLine },
    { n: "03", title: "Fertilizer Recommendation", desc: "Get a fertilizer recommendation based on the detected condition and available inventory.", icon: ArrowRight },
  ];

  const tips = [
    { icon: ImageIcon, text: "Upload a clear leaf image" },
    { icon: Sun, text: "Use good lighting" },
    { icon: Eye, text: "Keep the leaf fully visible" },
  ];

  return (
    <div>
      {/* HERO */}
      <div
        className="rounded-3xl p-8 md:p-10 mb-8"
        style={{ background: `radial-gradient(circle at 20% 20%, ${C.green} 0%, ${C.greenDark} 75%)` }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: C.white }}>
          Welcome, {user?.name || "Farmer"} 👋
        </h1>
        <p className="text-sm max-w-md mb-6" style={{ color: "rgba(255,255,255,0.8)" }}>
          Make smarter farming decisions with AI-powered crop analysis and fertilizer recommendations.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/farmer/upload" className="inline-flex items-center gap-2 font-semibold px-5 py-3 rounded-xl transition-transform hover:-translate-y-0.5" style={{ backgroundColor: C.white, color: C.greenDark }}>
            <ScanLine className="w-4 h-4" /> Scan Your Crop
          </Link>
          <Link href="/farmer/history" className="inline-flex items-center gap-2 font-semibold px-5 py-3 rounded-xl border transition-colors" style={{ borderColor: "rgba(255,255,255,0.3)", color: C.white }}>
            View Scan History
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl p-6" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-medium" style={{ color: C.inkFaint }}>Total Scans</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: C.green }}>{loading ? "…" : totalScans}</p>
          <p className="mt-1 text-xs" style={{ color: C.inkFaint }}>Plant images analyzed</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-medium" style={{ color: C.inkFaint }}>Latest Result</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: C.green }}>{loading ? "…" : latestCondition}</p>
          <p className="mt-1 text-xs" style={{ color: C.inkFaint }}>Most recent AI prediction</p>
        </div>
        <div className="rounded-xl p-6" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-medium" style={{ color: C.inkFaint }}>AI Confidence</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: C.green }}>{loading ? "…" : latestConfidence}</p>
          <p className="mt-1 text-xs" style={{ color: C.inkFaint }}>Latest analysis confidence</p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: ScanLine, title: "AI Leaf Scan", desc: "Upload a plant image and identify possible nutrient deficiencies.", cta: "Start Scan", href: "/farmer/upload" },
          { icon: History, title: "Scan History", desc: "Review your previous crop analyses and fertilizer recommendations.", cta: "View History", href: "/farmer/history" },
          { icon: UserCircle, title: "Profile", desc: "View your AGRISTOCK account information.", cta: "View Profile", href: "/farmer/profile" },
        ].map(({ icon: Icon, title, desc, cta, href }) => (
          <div key={title} className="rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: C.greenSoft }}>
              <Icon className="w-5 h-5" style={{ color: C.green }} />
            </div>
            <h3 className="font-semibold mb-1" style={{ color: C.ink }}>{title}</h3>
            <p className="text-sm mb-4 flex-1" style={{ color: C.inkSoft }}>{desc}</p>
            <Link href={href} className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: C.green }}>
              {cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* HOW AGRISTOCK HELPS */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-6" style={{ color: C.ink }}>How AGRISTOCK Helps You</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ n, title, desc, icon: Icon }) => (
            <div key={n} className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: C.greenSoft, color: C.green }}>
                {n}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: C.ink }}>{title}</h3>
                <p className="text-sm" style={{ color: C.inkSoft }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TIPS */}
      <div className="rounded-2xl p-6 mb-10" style={{ backgroundColor: C.greenSoft }}>
        <h3 className="font-semibold mb-4" style={{ color: C.greenDark }}>Get Better Results From Your Scan</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {tips.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm" style={{ color: C.inkSoft }}>
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: C.green }} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* RECENT SCAN */}
      {!loading && latestScan && (
        <div className="rounded-xl p-6" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
          <h2 className="font-bold mb-4" style={{ color: C.ink }}>Latest Scan</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs" style={{ color: C.inkFaint }}>Condition</p>
              <p className="mt-1 font-semibold" style={{ color: C.ink }}>{latestCondition}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: C.inkFaint }}>Confidence</p>
              <p className="mt-1 font-semibold" style={{ color: C.ink }}>{latestConfidence}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: C.inkFaint }}>Date</p>
              <p className="mt-1 font-semibold" style={{ color: C.ink }}>{new Date(latestScan.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          </div>
          <Link href="/farmer/history" className="mt-5 inline-block text-sm font-semibold" style={{ color: C.green }}>
            View Scan History →
          </Link>
        </div>
      )}
    </div>
  );
}