"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { Leaf, ScanLine, Package, BarChart3, Mail } from "lucide-react";

const C = {
  bg: "#f7f8f6",
  bgAlt: "#ffffff",
  ink: "#14251c",
  inkSoft: "#4b5d54",
  green: "#1f7a4d",
  greenDark: "#123c28",
  greenMid: "#1a5c3b",
  greenSoft: "#e7f3ec",
  border: "#e3e7e2",
  white: "#ffffff",
  whiteSoft: "rgba(255,255,255,0.75)",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const isIndustrialist = role === "industrialist";
  const isAdmin = role === "admin";

  const title = isAdmin ? "Admin Login" : isIndustrialist ? "Industrialist Login" : "Farmer Login";
  const subtitle = isAdmin
  ? "Manage users, monitor platform statistics and oversee AGRISTOCK activity."
  : isIndustrialist
    ? "Manage inventory, purchases, sales and agricultural products."
    : "Access AI-powered crop analysis and smart fertilizer recommendations.";

  const expectedRole = isAdmin ? "ADMIN" : isIndustrialist ? "INDUSTRIALIST" : "FARMER";

  const features = [
    { icon: ScanLine, label: "AI-powered leaf analysis" },
    { icon: Package, label: "Real-time inventory tracking" },
    { icon: BarChart3, label: "Sales & purchase analytics" },
  ];

  return (
    <div style={{ backgroundColor: C.bg }} className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT — BRANDING PANEL */}
      <div className="w-full md:w-1/2 px-8 md:px-12 pt-8 md:pt-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          
<div className="flex items-center gap-3 mb-6">
  <Image
    src="/agristock-logo.png.png"
    alt="AGRISTOCK logo"
    width={56}
    height={56}
    priority
    className="h-14 w-14 object-contain"
  />
  <span className="text-2xl font-bold tracking-tight text-[#14251c]">
    AGRISTOCK
  </span>
</div>

        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: C.ink }}>
          Smarter Farming.<br />
          <span style={{ color: C.green }}>Smarter Inventory.</span>
        </h1>
        <p className="text-sm mb-10 max-w-sm" style={{ color: C.inkSoft }}>
          One platform connecting AI-driven crop analysis with intelligent fertilizer inventory management.
        </p>

        {/* decorative visual — hidden on small screens to keep things simple */}
        <div
          className="hidden md:block relative rounded-3xl p-8 mb-10 max-w-sm overflow-hidden"
          style={{ background: `radial-gradient(circle at 25% 20%, ${C.greenMid} 0%, ${C.greenDark} 70%)` }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
          <span className="text-2xl relative z-10">🌾</span>
          <p className="relative z-10 text-sm font-medium mt-3" style={{ color: C.white }}>
            AI Confidence: <span style={{ color: C.whiteSoft }}>98.8%</span>
          </p>
          <p className="relative z-10 text-xs mt-1" style={{ color: C.whiteSoft }}>Example scan result</p>
        </div>

        <div className="flex flex-col gap-3 max-w-sm">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.greenSoft }}>
                <Icon className="w-4 h-4" style={{ color: C.green }} />
              </div>
              <span className="text-sm font-medium" style={{ color: C.inkSoft }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — LOGIN CARD */}
      <div className="order-1 md:order-2 flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Role switcher */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
          >
            <Link
              href="/login?role=farmer"
              className="flex-1 text-center text-sm font-semibold py-2.5 rounded-lg transition-colors"
              style={
                !isIndustrialist && !isAdmin
                  ? { backgroundColor: C.green, color: C.white }
                  : { color: C.inkSoft }
              }
            >
              Farmer Login
            </Link>
            <Link
              href="/login?role=industrialist"
              className="flex-1 text-center text-sm font-semibold py-2.5 rounded-lg transition-colors"
              style={
                isIndustrialist
                  ? { backgroundColor: C.green, color: C.white }
                  : { color: C.inkSoft }
              }
            >
              Industrialist Login
            </Link>
          </div>

          <div
            className="rounded-2xl p-8 md:p-10"
            style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: C.ink }}>{title}</h2>
            <p className="text-sm mb-8" style={{ color: C.inkSoft }}>{subtitle}</p>

            {/* Existing form — untouched, same expectedRole contract as before */}
            <LoginForm expectedRole={expectedRole} />

            {isIndustrialist ? (
              <div className="mt-6 pt-6 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-sm mb-3" style={{ color: C.inkSoft }}>
                  Industrialist accounts are provided only to registered agricultural industries.
                </p>
                {/* TODO: replace with the real AGRISTOCK registration email once available */}

<a
  href="mailto:REPLACE_WITH_AGRISTOCK_EMAIL@example.com"
  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all hover:-translate-y-0.5"
  style={{
    backgroundColor: C.green,
    color: C.white,
  }}
>
                  <Mail className="w-4 h-4" />
                  Contact Us
                </a>
              </div>
            ) : (
              <p className="text-center text-sm mt-6" style={{ color: C.inkSoft }}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold" style={{ color: C.green }}>
                  Create a Farmer account
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}