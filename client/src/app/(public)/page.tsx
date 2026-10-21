"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Leaf,
  Sparkles,
  Package,
  BarChart3,
  History,
  ShoppingCart,
  ScanLine,
  Sprout,
  Factory,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// ---- colors (explicit hex — see note on tw-colors remapping) ----
const C = {
  bg: "#f7f8f6",
  bgAlt: "#ffffff",
  ink: "#14251c",
  inkSoft: "#4b5d54",
  green: "#1f7a4d",
  greenDark: "#155c39",
  greenSoft: "#e7f3ec",
  border: "#e3e7e2",
  accent: "#3b6ef2",
};

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={inView ? "animate-fade-in-up" : "opacity-0"}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { icon: ScanLine, title: "AI Leaf Analysis", desc: "Upload a plant/leaf image and let AI identify nutrient conditions." },
    { icon: Sparkles, title: "Smart Fertilizer Recommendations", desc: "Detected conditions are matched with fertilizers actually available in inventory." },
    { icon: Package, title: "Inventory Management", desc: "Track products and stock levels across your fertilizer catalog." },
    { icon: ShoppingCart, title: "Sales & Purchases", desc: "Record transactions and watch inventory update in real time." },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Monitor sales, purchases, expenses, and scan activity in one view." },
    { icon: History, title: "Scan History", desc: "Farmers can revisit previous AI analysis results anytime." },
  ];

  const steps = [
    { n: "01", title: "Upload Leaf", desc: "Take a photo of the affected plant leaf and upload it." },
    { n: "02", title: "AI Analysis", desc: "Our model analyzes the image for visible nutrient stress." },
    { n: "03", title: "Get Recommendation", desc: "See a matching fertilizer from real, available stock." },
    { n: "04", title: "Make Better Decisions", desc: "Apply the right fertilizer, in the right dose, at the right time." },
  ];

  const roles = [
  {
    icon: Sprout,
    title: "Farmer",
    desc: "Analyze crops, get fertilizer recommendations, and track scan history.",
    href: "/login?role=farmer",
    cta: "Farmer Login",
  },
  {
    icon: Factory,
    title: "Industrialist",
    desc: "Manage inventory, track purchases and sales, monitor analytics.",
    href: "/login?role=industrialist",
    cta: "Industrialist Login",
  },
  {
    icon: Sprout,
    title: "Farmer Signup",
    desc: "Create your farmer account and start using AI-powered crop analysis and fertilizer recommendations.",
    href: "/signup",
    cta: "Create Farmer Account",
  },
];

  const mockProducts = [
    { name: "Urea Nitrogen Fertilizer", price: "₹650", status: "In Stock" },
    { name: "MOP Potassium Fertilizer", price: "₹900", status: "In Stock" },
    { name: "DAP Phosphorus Fertilizer", price: "₹1,350", status: "In Stock" },
  ];

  return (
    <main style={{ backgroundColor: C.bg, color: C.ink }} className="min-h-screen">
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-sm" : ""
        }`}
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8 lg:px-12 flex items-center justify-between" style={{ height: scrolled ? "64px" : "76px", transition: "height 300ms" }}>
          <div className="flex items-center gap-2">
            
<Image
  src="/agristock-logo.png.png"
  alt="AGRISTOCK logo"
  width={44}
  height={44}
  priority
  className="h-11 w-11 object-contain"
/>
<span
  className="font-bold text-lg tracking-tight"
  style={{ color: C.ink }}
>
  AGRISTOCK
</span>

          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base font-medium">
            <a href="#" style={{ color: C.inkSoft }} className="hover:opacity-70 transition-opacity">Home</a>
            <a href="#features" style={{ color: C.inkSoft }} className="hover:opacity-70 transition-opacity">Features</a>
            <a href="#how-it-works" style={{ color: C.inkSoft }} className="hover:opacity-70 transition-opacity">How It Works</a>
            <a href="#about" style={{ color: C.inkSoft }} className="hover:opacity-70 transition-opacity">About</a>
          </nav>

          <div className="flex items-center gap-5">
  <Link
    href="/login?role=farmer"
    className="font-medium transition-colors hover:text-green-700"
    style={{ color: C.ink }}
  >
    Farmer Login
  </Link>

  <Link
    href="/login?role=industrialist"
    className="font-medium transition-colors hover:text-green-700"
    style={{ color: C.ink }}
  >
    Industrialist Login
  </Link>

  <Link
    href="/signup"
    className="font-semibold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
    style={{
      backgroundColor: C.green,
      color: "#ffffff",
    }}
  >
    Get Started
  </Link>
</div>

          <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ backgroundColor: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
            <a href="#" onClick={() => setMobileOpen(false)} style={{ color: C.inkSoft }}>Home</a>
            <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: C.inkSoft }}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} style={{ color: C.inkSoft }}>How It Works</a>
            <a href="#about" onClick={() => setMobileOpen(false)} style={{ color: C.inkSoft }}>About</a>
            <Link href="/login" onClick={() => setMobileOpen(false)} style={{ color: C.ink }} className="font-medium">Login</Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="text-center font-semibold px-5 py-3 rounded-lg"
              style={{ backgroundColor: C.green, color: "#ffffff" }}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section 
className="pt-36 lg:pt-40 pb-20 lg:pb-24 px-6 lg:px-12 max-w-[1440px] mx-auto grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div>
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: C.greenSoft, color: C.greenDark }}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Agriculture Platform
          </span>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6" style={{ color: C.ink }}>
            Smarter Farming.<br />Smarter Inventory.<br />
            <span style={{ color: C.green }}>Better Decisions.</span>
          </h1>

          <p className="text-lg mb-8 max-w-md" style={{ color: C.inkSoft }}>
            AGRISTOCK combines AI-powered crop analysis with intelligent fertilizer inventory
            management to help farmers and agricultural businesses make better decisions.
          </p>

          <div className="flex flex-wrap gap-4">
                    <Link
          href="/signup"
          className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: C.green, color: "#ffffff" }}
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href="#features"
          className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-xl transition-colors"
          style={{
            border: `1.5px solid ${C.border}`,
            color: C.ink,
          }}
        >
          Explore Platform
        </a>
          </div>
        </div>

        {/* HERO VISUAL — floating mockup cards, no external images */}
        <div className="relative h-[440px] lg:h-[500px] hidden md:block">
          <div
            className="absolute top-0 left-4 w-64 lg:w-72 rounded-2xl p-5 lg:p-6 shadow-lg animate-fade-in-up"
            style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ScanLine className="w-4 h-4" style={{ color: C.green }} />
              <span className="text-xs font-semibold" style={{ color: C.inkSoft }}>Leaf Scan</span>
            </div>
            
<div className="h-24 overflow-hidden rounded-xl bg-[#e6f4ec]">
  <Image
    src="/nitrogen-deficiency-leaf.png"
    alt="Leaf showing signs of nitrogen deficiency"
    width={400}
    height={180}
    className="h-full w-full object-contain"
  />
</div>

            <div className="text-xs mt-1" style={{ color: C.inkSoft }}> Nitrogen deficiency Confidence: 98.8%</div>
          </div>

          <div
            className="absolute bottom-0 right-0 w-60 rounded-2xl p-5 shadow-lg animate-fade-in-up"
            style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}`, animationDelay: "150ms" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4" style={{ color: C.accent }} />
              <span className="text-xs font-semibold" style={{ color: C.inkSoft }}>Recommended</span>
            </div>
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Urea Nitrogen Fertilizer</div>
            <div className="flex items-center justify-between mt-2 text-xs" style={{ color: C.inkSoft }}>
              <span>₹650</span>
              <span className="font-medium" style={{ color: C.green }}>In Stock</span>
            </div>
          </div>

          <div
            className="absolute top-1/3 right-8 w-44 rounded-2xl p-4 shadow-lg animate-fade-in-up"
            style={{ backgroundColor: C.greenDark, animationDelay: "300ms" }}
          >
            <div className="text-xs font-medium text-white/70 mb-1">Stock Alert</div>
            <div className="text-sm font-semibold text-white">4 Products Tracked</div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="px-6 max-w-[1440px] mx-auto pb-20">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 rounded-2xl"
          style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
        >
          {["AI-Powered Analysis", "Real-Time Inventory", "Smart Recommendations", "Role-Based Platform"].map((t) => (
            <div key={t} className="flex items-center justify-center gap-2 px-4 text-center">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: C.green }} />
              <span className="text-sm font-medium" style={{ color: C.inkSoft }}>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 max-w-[1440px] mx-auto py-20">
        <Reveal>
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: C.ink }}>
            Everything You Need to Manage Smarter Agriculture
          </h2>
          <p className="text-center max-w-lg mx-auto mb-14" style={{ color: C.inkSoft }}>
            One platform for AI-driven crop insight and day-to-day inventory operations.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 60}>
              <div
                className="p-6 rounded-2xl h-full transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: C.greenSoft }}>
                  <Icon className="w-5 h-5" style={{ color: C.green }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: C.ink }}>{title}</h3>
                <p className="text-sm" style={{ color: C.inkSoft }}>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 max-w-[1440px] mx-auto py-20">
        <Reveal>
          <h2 className="text-3xl font-bold text-center mb-14" style={{ color: C.ink }}>How It Works</h2>
        </Reveal>

        <div className="grid md:grid-cols-4 gap-6 relative">
          <div
            className="hidden md:block absolute top-6 left-0 right-0 h-px"
            style={{ backgroundColor: C.border }}
          />
          {steps.map(({ n, title, desc }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div className="relative text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4 relative z-10"
                  style={{ backgroundColor: C.green, color: "#ffffff" }}
                >
                  {n}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: C.ink }}>{title}</h3>
                <p className="text-sm" style={{ color: C.inkSoft }}>{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI + INVENTORY SHOWCASE */}
      <section className="px-6 max-w-[1440px] mx-auto py-20">
        <Reveal>
          <div className="text-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.inkSoft }}>
              Product Demonstration
            </span>
          </div>
          <h2 className="text-3xl font-bold text-center mb-14" style={{ color: C.ink }}>
            From Leaf to Recommendation
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <div className="p-8 rounded-2xl" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
              <span className="text-xs font-medium" style={{ color: C.inkSoft }}>Example — AI Analysis</span>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm" style={{ color: C.ink }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                    <Leaf className="w-4 h-4" style={{ color: C.green }} />
                  </div>
                  Leaf Image Uploaded
                </div>
                <div className="pl-4" style={{ borderLeft: `2px solid ${C.border}` }}>
                  <div className="text-xs" style={{ color: C.inkSoft }}>↓ AI Analysis</div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: C.greenSoft }}>
                  <span className="text-sm font-semibold" style={{ color: C.greenDark }}>Nitrogen Deficiency</span>
                  <span className="text-xs font-medium" style={{ color: C.greenDark }}>98.8% confidence</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="p-8 rounded-2xl" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
              <span className="text-xs font-medium" style={{ color: C.inkSoft }}>Example — Recommendation</span>
              <div className="mt-4">
                <h4 className="font-semibold text-lg" style={{ color: C.ink }}>Urea Nitrogen Fertilizer</h4>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <div style={{ color: C.inkSoft }} className="text-xs">Price</div>
                    <div className="font-semibold" style={{ color: C.ink }}>₹650</div>
                  </div>
                  <div>
                    <div style={{ color: C.inkSoft }} className="text-xs">Stock</div>
                    <div className="font-semibold" style={{ color: C.green }}>Available</div>
                  </div>
                  <div>
                    <div style={{ color: C.inkSoft }} className="text-xs">Dosage</div>
                    <div className="font-semibold" style={{ color: C.ink }}>45–50 kg/hectare</div>
                  </div>
                  <div>
                    <div style={{ color: C.inkSoft }} className="text-xs">Application</div>
                    <div className="font-semibold" style={{ color: C.ink }}>Soil + irrigation</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ROLE-BASED */}
      <section id="about" className="px-6 max-w-[1440px] mx-auto py-20">
        <Reveal>
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: C.ink }}>
            Built for Every Part of the Agricultural Supply Chain
          </h2>
          <p className="text-center max-w-lg mx-auto mb-14" style={{ color: C.inkSoft }}>
            Three focused experiences, one connected platform.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map(({ icon: Icon, title, desc, href, cta }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div
                className="p-6 rounded-2xl h-full flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: C.greenSoft }}>
                  <Icon className="w-5 h-5" style={{ color: C.green }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: C.ink }}>{title}</h3>
                <p className="text-sm mb-6 flex-1" style={{ color: C.inkSoft }}>{desc}</p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: C.green }}
                >
                  {cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
                {/* INDUSTRY REGISTRATION INFORMATION */}
        <Reveal delay={240}>
          <div
            className="mt-10 rounded-2xl p-6 md:p-8"
            style={{
              backgroundColor: C.greenSoft,
              border: `1px solid ${C.border}`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Factory
                    className="w-5 h-5"
                    style={{ color: C.green }}
                  />
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: C.ink }}
                  >
                    Industry Registration Required
                  </h3>
                </div>

                <p
                  className="text-sm leading-6 max-w-3xl"
                  style={{ color: C.inkSoft }}
                >
                  Industries that want to use the AGRISTOCK inventory
                  management system must first register their organization
                  with us. Contact us through the email below with your
                  industry details. After verification and registration,
                  we will provide your authorized login ID and password
                  credentials, which you can use to access the
                  Industrialist portal.
                </p>
              </div>

              <a
                href="mailto:sanjaywanekar34@gmail.com"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold px-5 py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: C.green,
                  color: "#ffffff",
                }}
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div
              className="mt-5 pt-5 text-sm"
              style={{
                borderTop: `1px solid ${C.border}`,
                color: C.ink,
              }}
            >
              <span className="font-semibold">Registration Email: </span>
              <a
                href="mailto:sanjaywanekar34@gmail.com"
                className="font-medium hover:underline"
                style={{ color: C.green }}
              >
                sanjaywanekar34@gmail.com
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* INVENTORY SHOWCASE */}
      <section className="px-6 max-w-[1440px] mx-auto py-20">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-wide block text-center mb-3" style={{ color: C.inkSoft }}>
            Example — Not Live Data
          </span>
          <h2 className="text-3xl font-bold text-center mb-14" style={{ color: C.ink }}>
            A Clear View of Your Fertilizer Stock
          </h2>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-3 px-6 py-3 text-xs font-semibold" style={{ backgroundColor: C.greenSoft, color: C.greenDark }}>
              <span>Product</span>
              <span>Price</span>
              <span>Status</span>
            </div>
            {mockProducts.map((p) => (
              <div
                key={p.name}
                className="grid grid-cols-3 px-6 py-4 text-sm items-center"
                style={{ borderTop: `1px solid ${C.border}`, color: C.ink }}
              >
                <span className="font-medium">{p.name}</span>
                <span style={{ color: C.inkSoft }}>{p.price}</span>
                <span className="font-medium" style={{ color: C.green }}>{p.status}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 max-w-[1440px] mx-auto py-20">
        <Reveal>
          <div className="rounded-3xl px-8 py-16 text-center" style={{ backgroundColor: C.greenDark }}>
            <h2 className="text-3xl font-bold text-white mb-4">Make Agriculture Smarter with AGRISTOCK</h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              Bring AI-powered crop analysis and intelligent inventory management together in one platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="font-semibold px-6 py-3.5 rounded-xl transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: "#ffffff", color: C.greenDark }}
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="font-semibold px-6 py-3.5 rounded-xl border border-white/30 text-white transition-colors hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-14" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4" style={{ color: C.green }} />
              <span className="font-bold" style={{ color: C.ink }}>AGRISTOCK</span>
            </div>
            <p className="text-sm" style={{ color: C.inkSoft }}>
              AI-powered crop analysis and fertilizer inventory management, in one platform.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: C.inkSoft }}>Navigation</h4>
            <ul className="space-y-2 text-sm" style={{ color: C.ink }}>
              <li><a href="#">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: C.inkSoft }}>Product</h4>
            <ul className="space-y-2 text-sm" style={{ color: C.ink }}>
             <li><Link href="/login">Farmer Login</Link></li>
             <li><Link href="/login">Industrialist Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: C.inkSoft }}>Account</h4>
            <ul className="space-y-2 text-sm" style={{ color: C.ink }}>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/signup">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto mt-10 pt-6 text-center text-xs" style={{ borderTop: `1px solid ${C.border}`, color: C.inkSoft }}>
          © 2026 AGRISTOCK
        </div>
      </footer>
    </main>
  );
}