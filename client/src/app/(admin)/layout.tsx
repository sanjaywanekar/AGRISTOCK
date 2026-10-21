"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/app/redux";
import {
  LayoutDashboard, Factory, Sprout, BarChart3, Settings,
  LogOut, Search, Bell, Menu, X, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { theme as T } from "./adminTheme";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin" },
  { label: "Industrialists", icon: Factory, href: "/admin/industrialists" },
  { label: "Farmers", icon: Sprout, href: "/admin/farmers" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/industrialists": "Industrialists",
  "/admin/farmers": "Farmers",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (!token) {
      router.replace("/login?role=admin");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("admin-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      window.localStorage.setItem("admin_sidebar_collapsed", String(!prev));
      return !prev;
    });
  };

  const logout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  };

  const filteredNavItems = navItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  const adminName = user?.name || "Admin";
  const initial = adminName.charAt(0).toUpperCase();
  const currentTitle = pageTitles[pathname] || (pathname.startsWith("/admin/farmers") ? "Farmers" : pathname.startsWith("/admin/industrialists") ? "Industrialists" : "Admin Console");

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: T.bg, color: T.text }}>
        <p className="text-sm" style={{ color: T.textSoft }}>Checking authentication...</p>
      </div>
    );
  }

  const NavList = ({ showLabels }: { showLabels: boolean }) => (
    <nav className="flex-1 py-4">
      {filteredNavItems.length === 0 && (
        <p className="px-6 text-xs" style={{ color: T.textMuted }}>No matching sections.</p>
      )}
      {filteredNavItems.map(({ label, icon: Icon, href }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
        return (
          <div
            key={label}
            title={!showLabels ? label : undefined}
            onClick={() => { router.push(href); setMobileOpen(false); }}
            className="group relative flex items-center gap-3 mx-2 mb-1 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150"
            style={active
              ? { backgroundColor: T.blueBg, color: T.blueSoft }
              : { color: T.textSoft }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            {showLabels && <span className="truncate">{label}</span>}
            {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r" style={{ backgroundColor: T.blueSoft }} />}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: T.bg, color: T.text }}>
      {/* DESKTOP SIDEBAR */}
      <aside
        className="hidden md:flex flex-col transition-all duration-200"
        style={{ width: collapsed ? "76px" : "252px", backgroundColor: T.bgElevated, borderRight: `1px solid ${T.border}` }}
      >
        <div className="h-16 flex items-center justify-between px-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          {!collapsed && (
            <div>
              <div className="text-base font-bold" style={{ color: T.text }}>AGRISTOCK</div>
              <div className="text-[11px]" style={{ color: T.textMuted }}>Admin Console</div>
            </div>
          )}
          <button onClick={toggleCollapsed} className="p-1.5 rounded-md hover:bg-white/5 transition-colors" style={{ color: T.textMuted }}>
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <NavList showLabels={!collapsed} />

        <div className="p-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className={`flex items-center gap-3 px-2 py-2 mb-1 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ backgroundColor: T.blueBg, color: T.blueSoft }}>
              {initial}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: T.text }}>{adminName}</p>
                <p className="text-[11px]" style={{ color: T.textMuted }}>Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-2 text-sm font-medium py-2 rounded-md transition-colors ${collapsed ? "justify-center" : "justify-center"}`}
            style={{ color: T.textSoft }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.backgroundColor = T.redBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = T.textSoft; e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && "Logout"}
          </button>
          {!collapsed && <p className="text-center text-[10px] mt-3" style={{ color: T.textMuted }}>&copy; 2026 Agristock</p>}
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col h-full" style={{ backgroundColor: T.bgElevated }}>
            <div className="h-16 flex items-center justify-between px-6" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="text-base font-bold" style={{ color: T.text }}>AGRISTOCK</div>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" style={{ color: T.textSoft }} /></button>
            </div>
            <NavList showLabels={true} />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-6" style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgElevated }}>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" style={{ color: T.text }} />
            </button>
            <h1 className="text-sm font-semibold hidden sm:block flex-shrink-0" style={{ color: T.text }}>{currentTitle}</h1>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 w-full max-w-xs" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: T.textMuted }} />
              <input
                id="admin-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sections..."
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: T.text }}
              />
              <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: T.textMuted }}>⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <Bell className="w-4 h-4" style={{ color: T.textSoft }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: T.blueBg, color: T.blueSoft }}>
              {initial}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: T.bg }}>{children}</main>
      </div>
    </div>
  );
}