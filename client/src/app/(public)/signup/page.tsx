"use client";
import Image from "next/image";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import { Leaf, ScanLine, Sparkles, ShieldCheck, Mail, ArrowLeft } from "lucide-react";

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
  whiteFaint: "rgba(255,255,255,0.45)",
};

export default function SignupPage() {
  return (
    <div style={{ backgroundColor: C.bg }} className="min-h-screen">
      {/* TOP BAR — logo + back to home */}
      <div className="px-6 pt-8 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2">
          
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

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          style={{ color: C.inkSoft }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col-reverse md:flex-row gap-10 items-start">
        {/* VISUAL PANEL — always rendered, sits below form on mobile via flex-col-reverse */}
        <div className="flex-1 w-full">
          <div
            className="relative rounded-3xl p-8 h-full flex flex-col overflow-hidden animate-fade-in-up"
            style={{
              background: `radial-gradient(circle at 30% 20%, ${C.greenMid} 0%, ${C.greenDark} 65%)`,
            }}
          >
            {/* decorative glow */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            />

            <div className="relative z-10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                🌱
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: C.white }}>
                Smarter Farming Starts Here
              </h2>
              <p className="text-sm mb-8" style={{ color: C.whiteSoft }}>
                A quick look at what happens after you sign in.
              </p>

              <div className="space-y-3">
                {[
                  { icon: Leaf, label: "Upload a plant image" },
                  { icon: ScanLine, label: "AI analyzes nutrient condition" },
                  { icon: Sparkles, label: "Get a fertilizer recommendation" },
                ].map(({ icon: Icon, label }, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl p-4 transition-transform hover:translate-x-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                    >
                      <Icon className="w-4 h-4" style={{ color: C.white }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: C.white }}>{label}</span>
                    <span
                      className="ml-auto text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.12)", color: C.whiteSoft }}
                    >
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>

              <span className="text-[11px] block mt-8" style={{ color: C.whiteFaint }}>
                Illustration — not live data
              </span>
            </div>
          </div>
        </div>

        {/* SIGNUP CARD + supporting sections */}
        <div className="flex-1 w-full">
          <div
            className="rounded-2xl p-8 md:p-10 animate-fade-in-up"
            style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
          >
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: C.greenSoft, color: C.greenDark }}
            >
              Farmer Account
            </span>

            <h1 className="text-3xl font-bold mb-2" style={{ color: C.ink }}>
              Create Your Farmer Account
            </h1>
            <p className="text-sm mb-8" style={{ color: C.inkSoft }}>
              Join AGRISTOCK and get AI-powered fertilizer recommendations for smarter farming.
            </p>

            {/* Existing form — untouched, only wrapped */}
            <SignupForm />

            <p className="text-center text-sm mt-6" style={{ color: C.inkSoft }}>
              Already have an account?{" "}
              <Link href="/login?role=farmer" className="font-semibold" style={{ color: C.green }}>
                Farmer Login
              </Link>
            </p>
          </div>

          {/* TRUST INDICATORS */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: ScanLine, label: "AI-Powered Analysis" },
              { icon: Sparkles, label: "Smart Recommendations" },
              { icon: ShieldCheck, label: "Secure Account" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 p-3 rounded-xl"
                style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
              >
                <Icon className="w-4 h-4" style={{ color: C.green }} />
                <span className="text-xs font-medium" style={{ color: C.inkSoft }}>{label}</span>
              </div>
            ))}
          </div>

          {/* INDUSTRY INFORMATION */}
          <div
            className="mt-6 rounded-2xl p-6"
            style={{ backgroundColor: C.greenSoft, border: `1px solid ${C.border}` }}
          >
            <h3 className="font-semibold text-sm mb-1" style={{ color: C.greenDark }}>
              Are you an agricultural industry?
            </h3>
            <p className="text-sm mb-4" style={{ color: C.inkSoft }}>
              AGRISTOCK inventory management is available to registered industries. To use the
              Industrialist portal, your organization must first register with us.
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
        </div>
      </div>
    </div>
  );
}