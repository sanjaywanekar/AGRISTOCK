"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Factory,
  Package,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  RefreshCw,
  ArrowRight,
  Search,
  UserPlus,
  X,
  LoaderCircle,
} from "lucide-react";
import { theme as T } from "../../adminTheme";

interface Industrialist {
  userId: string; name: string; email: string; role: string; createdAt: string;
  _count: { products: number; sales: number; purchases: number; expenses: number };
}

export default function IndustrialistsPage() {
  const router = useRouter();
  const [industrialists, setIndustrialists] = useState<Industrialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [newIndustrialist, setNewIndustrialist] = useState({
  name: "",
  email: "",
  password: "",
});
  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadIndustrialists = async () => {
    try {
      setError("");
      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to load industrialists");
      setIndustrialists(await response.json());
    } catch (err) {
      console.error(err);
      setError("Unable to load industrialists.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadIndustrialists(); }, []);

  const handleRefresh = () => { setRefreshing(true); loadIndustrialists(); };

  const filteredIndustrialists = industrialists.filter((industrialist) => {
    const value = search.toLowerCase();
    return industrialist.name.toLowerCase().includes(value) || industrialist.email.toLowerCase().includes(value);
  });

const handleCreateIndustrialist = async (
  e: FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setCreateError("");
  setCreateSuccess("");

  const name = newIndustrialist.name.trim();
  const email = newIndustrialist.email.trim().toLowerCase();
  const password = newIndustrialist.password;

  if (!name || !email || !password) {
    setCreateError("Please fill in all fields.");
    return;
  }

  if (password.length < 8) {
    setCreateError("Password must contain at least 8 characters.");
    return;
  }

  const token = getToken();

  if (!token) {
    router.replace("/login?role=admin");
    return;
  }

  setCreating(true);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/industrialists`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decodeURIComponent(token)}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to create industrialist account."
      );
    }

    setCreateSuccess(
      `Account created successfully for ${email}.`
    );

    setNewIndustrialist({
      name: "",
      email: "",
      password: "",
    });

    setShowAddModal(false);
    await loadIndustrialists();
  } catch (err) {
    setCreateError(
      err instanceof Error
        ? err.message
        : "Something went wrong."
    );
  } finally {
    setCreating(false);
  }
};

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: T.blueBg }}>
              <Factory className="w-5 h-5" style={{ color: T.blueSoft }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: T.text }}>Industrialists</h1>
          </div>
          <p className="text-sm" style={{ color: T.textMuted }}>Manage registered agricultural industries and view their inventory activity.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
  <button
    onClick={() => {
      setCreateError("");
      setCreateSuccess("");
      setShowAddModal(true);
    }}
    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
    style={{
      backgroundColor: T.blueBg,
      color: T.blueSoft,
      border: `1px solid ${T.border}`,
    }}
  >
    <UserPlus className="w-4 h-4" />
    Add Industrialist
  </button>

  <button
    onClick={handleRefresh}
    disabled={refreshing}
    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
    style={{
      backgroundColor: "rgba(255,255,255,0.04)",
      border: `1px solid ${T.border}`,
      color: T.textSoft,
    }}
  >
    <RefreshCw
      className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
    />
    Refresh
  </button>
</div>
      </div>

{createSuccess && (
  <div
    className="mb-5 rounded-lg px-4 py-3 text-sm"
    style={{
      backgroundColor: T.greenBg,
      color: T.greenSoft,
      border: `1px solid ${T.border}`,
    }}
  >
    {createSuccess}
  </div>
)}

{showAddModal && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !creating) {
        setShowAddModal(false);
      }
    }}
  >
    <div
      className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
      style={{
        backgroundColor: T.card,
        border: `1px solid ${T.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-xl font-bold"
          style={{ color: T.text }}
        >
          Add Industrialist
        </h2>

        <button
          type="button"
          disabled={creating}
          onClick={() => setShowAddModal(false)}
          className="p-2 rounded-lg disabled:opacity-50"
          style={{ color: T.textMuted }}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p
        className="text-sm mb-6"
        style={{ color: T.textMuted }}
      >
        Create login credentials for a new industrialist.
      </p>

      <form
        onSubmit={handleCreateIndustrialist}
        className="space-y-4"
      >
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: T.text }}
            htmlFor="industrialist-name"
          >
            Full name
          </label>

          <input
            id="industrialist-name"
            required
            autoComplete="name"
            value={newIndustrialist.name}
            onChange={(e) =>
              setNewIndustrialist({
                ...newIndustrialist,
                name: e.target.value,
              })
            }
            placeholder="Enter industrialist name"
            className="w-full rounded-lg px-3 py-3 text-sm outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.border}`,
              color: T.text,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: T.text }}
            htmlFor="industrialist-email"
          >
            Email address
          </label>

          <input
            id="industrialist-email"
            type="email"
            required
            autoComplete="email"
            value={newIndustrialist.email}
            onChange={(e) =>
              setNewIndustrialist({
                ...newIndustrialist,
                email: e.target.value,
              })
            }
            placeholder="industry@example.com"
            className="w-full rounded-lg px-3 py-3 text-sm outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.border}`,
              color: T.text,
            }}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: T.text }}
            htmlFor="industrialist-password"
          >
            Initial password
          </label>

          <input
            id="industrialist-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newIndustrialist.password}
            onChange={(e) =>
              setNewIndustrialist({
                ...newIndustrialist,
                password: e.target.value,
              })
            }
            placeholder="At least 8 characters"
            className="w-full rounded-lg px-3 py-3 text-sm outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.border}`,
              color: T.text,
            }}
          />
        </div>

        {createError && (
          <p
            className="text-sm rounded-lg p-3"
            style={{
              backgroundColor: T.redBg,
              color: "#f87171",
            }}
          >
            {createError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={creating}
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2.5 rounded-lg text-sm disabled:opacity-50"
            style={{
              border: `1px solid ${T.border}`,
              color: T.textSoft,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            style={{
              backgroundColor: T.blueSoft,
              color: "#ffffff",
            }}
          >
            {creating && (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            )}
            {creating ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6 max-w-md" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
        <Search className="w-4 h-4" style={{ color: T.textMuted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search industrialists..."
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: T.text }}
        />
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: T.redBg, border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: T.blueSoft }} />
        </div>
      ) : filteredIndustrialists.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <Factory className="w-10 h-10 mx-auto mb-4" style={{ color: T.textMuted }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: T.text }}>No industrialists found</h2>
          <p className="text-sm" style={{ color: T.textMuted }}>{search ? "Try a different search." : "No registered industrialists are available yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredIndustrialists.map((industrialist) => (
            <div key={industrialist.userId} className="rounded-2xl p-6 transition-colors" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: T.blueBg }}>
                    <Factory className="w-5 h-5" style={{ color: T.blueSoft }} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate" style={{ color: T.text }}>{industrialist.name}</h2>
                    <p className="text-sm truncate" style={{ color: T.textMuted }}>{industrialist.email}</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: T.greenBg, color: T.greenSoft }}>
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Stat icon={Package} label="Products" value={industrialist._count.products} />
                <Stat icon={ShoppingCart} label="Sales" value={industrialist._count.sales} />
                <Stat icon={ShoppingBag} label="Purchases" value={industrialist._count.purchases} />
                <Stat icon={Receipt} label="Expenses" value={industrialist._count.expenses} />
              </div>

              <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
                <div>
                  <p className="text-[11px]" style={{ color: T.textMuted }}>Registered</p>
                  <p className="text-xs mt-1" style={{ color: T.textSoft }}>{new Date(industrialist.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => router.push(`/admin/industrialists/${industrialist.userId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: T.blueBg, color: T.blueSoft }}
                >
                  View Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color: T.textMuted }} />
        <span className="text-[11px]" style={{ color: T.textMuted }}>{label}</span>
      </div>
      <p className="text-lg font-semibold" style={{ color: T.text }}>{value}</p>
    </div>
  );
}