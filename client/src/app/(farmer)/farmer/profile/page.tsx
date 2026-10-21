"use client";

import { useAppSelector } from "@/app/redux";
import { UserCircle, Mail, ShieldCheck } from "lucide-react";

const C = {
  bgAlt: "#ffffff", ink: "#14251c", inkSoft: "#4b5d54", inkFaint: "#8a978f",
  green: "#1f7a4d", greenSoft: "#e7f3ec", border: "#e3e7e2",
};

export default function FarmerProfilePage() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold" style={{ color: C.ink }}>Profile</h1>
        <p className="mt-4 text-sm" style={{ color: C.inkSoft }}>No user information found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6" style={{ color: C.ink }}>Profile</h1>

      <div className="rounded-2xl p-8" style={{ backgroundColor: C.bgAlt, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
            <UserCircle className="w-7 h-7" style={{ color: C.green }} />
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: C.ink }}>{user.name}</p>
            <p className="text-sm" style={{ color: C.inkFaint }}>AGRISTOCK Farmer Account</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4" style={{ color: C.inkFaint }} />
            <div>
              <p className="text-xs" style={{ color: C.inkFaint }}>Email</p>
              <p className="font-semibold text-sm" style={{ color: C.ink }}>{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4" style={{ color: C.inkFaint }} />
            <div>
              <p className="text-xs" style={{ color: C.inkFaint }}>Role</p>
              <p className="font-semibold text-sm" style={{ color: C.green }}>{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}