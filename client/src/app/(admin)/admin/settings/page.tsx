"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux";
import { theme as T } from "../../adminTheme";

export default function AdminSettingsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // FIX: the app authenticates via cookie everywhere else, not localStorage — this now actually logs out.
  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="relative h-6 w-11 rounded-full transition-colors"
      style={{ backgroundColor: on ? T.blue : "rgba(255,255,255,0.12)" }}
    >
      <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: on ? "24px" : "4px" }} />
    </button>
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="text-xl font-semibold" style={{ color: T.text }}>Settings</h1>
        <p className="text-xs mt-1" style={{ color: T.textMuted }}>Manage your AGRISTOCK admin account and dashboard preferences.</p>
      </div>

      <section className="mb-5 rounded-xl p-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: T.text }}>Admin Profile</h2>
        <p className="text-xs mb-5" style={{ color: T.textMuted }}>Information about the current administrator account.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>Name</p>
            <p className="mt-2 text-sm font-medium" style={{ color: T.text }}>{user?.name || "—"}</p>
          </div>
          <div className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>Role</p>
            <p className="mt-2 text-sm font-medium" style={{ color: T.text }}>{user?.role || "ADMIN"}</p>
          </div>
          <div className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>Email</p>
            <p className="mt-2 text-sm font-medium" style={{ color: T.text }}>{user?.email || "—"}</p>
          </div>
          <div className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>Account Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: T.green }} />
              <span className="text-sm font-medium" style={{ color: T.text }}>Active</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-xl p-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: T.text }}>Dashboard Preferences</h2>
        <p className="text-xs mb-2" style={{ color: T.textMuted }}>Configure how the admin dashboard behaves. (Frontend-only for now.)</p>
        <div className="divide-y" style={{ borderColor: T.border }}>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium" style={{ color: T.text }}>Notifications</p>
              <p className="mt-1 text-xs" style={{ color: T.textMuted }}>Receive important system notifications.</p>
            </div>
            <Toggle on={notifications} onClick={() => setNotifications(!notifications)} />
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium" style={{ color: T.text }}>Auto Refresh</p>
              <p className="mt-1 text-xs" style={{ color: T.textMuted }}>Automatically refresh dashboard data.</p>
            </div>
            <Toggle on={autoRefresh} onClick={() => setAutoRefresh(!autoRefresh)} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          {saved && <span className="text-xs" style={{ color: T.greenSoft }}>Settings saved</span>}
          <button onClick={handleSave} className="rounded-lg px-4 py-2 text-xs font-medium transition-colors" style={{ backgroundColor: T.text, color: T.bg }}>
            Save Changes
          </button>
        </div>
      </section>

      <section className="mb-5 rounded-xl p-6" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: T.text }}>System Information</h2>
        <p className="text-xs mb-5" style={{ color: T.textMuted }}>Current AGRISTOCK system information.</p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>Application</p>
            <p className="mt-2 text-sm font-medium" style={{ color: T.text }}>AGRISTOCK</p>
          </div>
          <div className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>Environment</p>
            <p className="mt-2 text-sm font-medium" style={{ color: T.text }}>Development</p>
          </div>
          <div className="rounded-lg p-4" style={{ border: `1px solid ${T.border}` }}>
            <p className="text-xs" style={{ color: T.textMuted }}>Backend Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: T.green }} />
              <span className="text-sm font-medium" style={{ color: T.text }}>Connected</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl p-6" style={{ backgroundColor: T.card, border: "1px solid rgba(239,68,68,0.2)" }}>
        <h2 className="text-sm font-semibold mb-1" style={{ color: T.text }}>Security</h2>
        <p className="text-xs mb-5" style={{ color: T.textMuted }}>Manage your current administrator session.</p>
        <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-xs font-medium transition-colors" style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          Logout
        </button>
      </section>
    </div>
  );
}