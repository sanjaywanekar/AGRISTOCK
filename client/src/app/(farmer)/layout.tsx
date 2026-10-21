"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAppSelector } from "@/app/redux";
import { LayoutDashboard, ScanLine, History, UserCircle, LogOut, Leaf, Menu, X, Bell } from "lucide-react";

const C = {
  bg: "#f7f8f6", bgAlt: "#ffffff", ink: "#14251c", inkSoft: "#4b5d54", inkFaint: "#8a978f",
  green: "#1f7a4d", greenSoft: "#e7f3ec", border: "#e3e7e2", red: "#dc2626",
};

const navItems = [
  { href: "/farmer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/farmer/upload", label: "AI Leaf Scan", icon: ScanLine },
  { href: "/farmer/history", label: "Scan History", icon: History },
  { href: "/farmer/profile", label: "Profile", icon: UserCircle },
];

const pageTitles: Record<string, string> = {
  "/farmer": "Farmer Dashboard",
  "/farmer/upload": "AI Leaf Scan",
  "/farmer/history": "Scan History",
  "/farmer/profile": "Profile",
};

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  };

  const currentTitle = pageTitles[pathname] || "Farmer Portal";
  const farmerName = user?.name || "Farmer";
  const initial = farmerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.bg }}>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col fixed h-screen" style={{ backgroundColor: C.bgAlt, borderRight: `1px solid ${C.border}` }}>
        <div className="px-6 py-6" style={{ borderBottom: `1px solid ${C.border}` }}>
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
          <span className="text-xs font-medium mt-1 block" style={{ color: C.inkFaint }}>Farmer Portal</span>
        </div>

        <nav className="flex-1 py-4 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium mb-1 transition-all duration-150"
                style={active ? { backgroundColor: C.greenSoft, color: C.green } : { color: C.inkSoft }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0" style={{ backgroundColor: C.greenSoft, color: C.green }}>
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: C.ink }}>{farmerName}</p>
              <p className="text-xs" style={{ color: C.inkFaint }}>Farmer</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 justify-center text-sm font-medium py-2.5 rounded-lg transition-colors" style={{ color: C.red }}>
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3" style={{ backgroundColor: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
            <Leaf className="w-3.5 h-3.5" style={{ color: C.green }} />
          </div>
          <span className="font-bold text-sm" style={{ color: C.ink }}>AGRISTOCK</span>
        </div>
        <button onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X className="w-5 h-5" style={{ color: C.ink }} /> : <Menu className="w-5 h-5" style={{ color: C.ink }} />}
        </button>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 z-30 px-4 py-4" style={{ backgroundColor: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium mb-1" style={active ? { backgroundColor: C.greenSoft, color: C.green } : { color: C.inkSoft }}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-3 text-sm font-medium mt-2" style={{ color: C.red }}>
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 pt-[57px] md:pt-0 w-full">
        <header className="hidden md:flex items-center justify-between px-8 py-5 sticky top-0 z-20" style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
          <h1 className="text-lg font-bold" style={{ color: C.ink }}>{currentTitle}</h1>
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
              <Bell className="w-4 h-4" style={{ color: C.inkSoft }} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: C.greenSoft, color: C.green }}>
                {initial}
              </div>
              <span className="text-sm font-medium" style={{ color: C.ink }}>{farmerName}</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}