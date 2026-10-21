"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Pencil, Trash2, Package, RefreshCw, X } from "lucide-react";
import { theme as T } from "../../../../adminTheme";

interface Product {
  productId: string; industrialistId: string; name: string; price: number; rating: number | null;
  stockQuantity: number; targetCondition: string | null; applicationMethod: string | null; dosage: string | null;
}

interface ProductForm {
  productId: string; name: string; price: string; rating: string; stockQuantity: string;
  targetCondition: string; applicationMethod: string; dosage: string;
}

const emptyForm: ProductForm = {
  productId: "", name: "", price: "", rating: "", stockQuantity: "", targetCondition: "", applicationMethod: "", dosage: "",
};

export default function IndustrialistProductsPage() {
  const params = useParams();
  const router = useRouter();
  const industrialistId = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];

  const loadProducts = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      setError("");
      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists/${industrialistId}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to load products");
      setProducts(await response.json());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load products.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (industrialistId) loadProducts(); }, [industrialistId]);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      productId: product.productId,
      name: product.name,
      price: String(product.price),
      rating: product.rating !== null ? String(product.rating) : "",
      stockQuantity: String(product.stockQuantity),
      targetCondition: product.targetCondition || "",
      applicationMethod: product.applicationMethod || "",
      dosage: product.dosage || "",
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const updateForm = (field: keyof ProductForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const saveProduct = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      if (!form.name.trim()) { setError("Product name is required."); return; }
      if (form.price === "" || Number(form.price) < 0) { setError("Enter a valid price."); return; }
      if (form.stockQuantity === "" || Number(form.stockQuantity) < 0) { setError("Enter a valid stock quantity."); return; }

      const body = {
        ...(editingProduct ? {} : { productId: form.productId.trim() || undefined }),
        name: form.name.trim(),
        price: Number(form.price),
        rating: form.rating.trim() === "" ? null : Number(form.rating),
        stockQuantity: Number(form.stockQuantity),
        targetCondition: form.targetCondition.trim() || null,
        applicationMethod: form.applicationMethod.trim() || null,
        dosage: form.dosage.trim() || null,
      };

      const url = editingProduct
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists/${industrialistId}/products/${editingProduct.productId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists/${industrialistId}/products`;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save product.");

      setSuccess(editingProduct ? "Product updated successfully." : "Product added successfully.");
      setShowModal(false);
      setEditingProduct(null);
      setForm(emptyForm);
      await loadProducts(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.name}"?\n\nProducts with sales or purchase history cannot be deleted.`);
    if (!confirmed) return;

    try {
      setDeleting(product.productId);
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) { router.replace("/login?role=admin"); return; }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/industrialists/${industrialistId}/products/${product.productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete product.");

      setSuccess("Product deleted successfully.");
      await loadProducts(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();
    return product.name.toLowerCase().includes(query) || product.productId.toLowerCase().includes(query) || (product.targetCondition || "").toLowerCase().includes(query);
  });

  const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

  const stockStyle = (qty: number) => {
    if (qty === 0) return { color: "#f87171" };
    if (qty < 20) return { color: "#fbbf24" };
    return { color: T.greenSoft };
  };

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push(`/admin/industrialists/${industrialistId}`)}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: T.textSoft }} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: T.blueBg }}>
                <Package className="w-5 h-5" style={{ color: T.blueSoft }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: T.text }}>Products</h1>
            </div>
            <p className="text-sm mt-2" style={{ color: T.textMuted }}>Manage products belonging to this industrialist.</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
          style={{ backgroundColor: T.blue, color: "#ffffff" }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {error && !showModal && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: T.redBg, border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>{error}</div>
      )}
      {success && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: T.greenBg, border: "1px solid rgba(34,197,94,0.2)", color: T.greenSoft }}>{success}</div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 flex-1" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <Search className="w-4 h-4" style={{ color: T.textMuted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="bg-transparent outline-none text-sm w-full" style={{ color: T.text }} />
        </div>
        <button
          onClick={() => loadProducts(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}`, color: T.textSoft }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl p-12 flex justify-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3" style={{ color: T.textSoft }}><RefreshCw className="w-5 h-5 animate-spin" /> Loading products...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <Package className="w-10 h-10 mx-auto mb-4" style={{ color: T.textMuted }} />
          <h3 className="font-semibold" style={{ color: T.text }}>No products found</h3>
          <p className="text-sm mt-1" style={{ color: T.textMuted }}>{search ? "Try a different search." : "This industrialist has no products yet."}</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead style={{ borderBottom: `1px solid ${T.border}` }}>
                <tr className="text-left text-xs" style={{ color: T.textMuted }}>
                  <th className="px-5 py-4">Product</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Stock</th><th className="px-5 py-4">Condition</th><th className="px-5 py-4">Dosage</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, i) => (
                  <tr key={product.productId} style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold" style={{ color: T.text }}>{product.name}</p>
                      <p className="text-xs mt-1" style={{ color: T.textMuted }}>{product.productId}</p>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: T.textSoft }}>{formatCurrency(product.price)}</td>
                    <td className="px-5 py-4">
                      {product.rating !== null
                        ? <span className="text-sm" style={{ color: "#fbbf24" }}>★ {product.rating}</span>
                        : <span className="text-sm" style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium" style={stockStyle(product.stockQuantity)}>{product.stockQuantity}</span>
                    </td>
                    <td className="px-5 py-4">
                      {product.targetCondition
                        ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: T.blueBg, color: T.blueSoft }}>{product.targetCondition}</span>
                        : <span className="text-sm" style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm max-w-[220px]" style={{ color: T.textSoft }}>{product.dosage || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ backgroundColor: "rgba(255,255,255,0.04)", color: T.textSoft }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product)}
                          disabled={deleting === product.productId}
                          title="Delete product"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                          style={{ backgroundColor: "rgba(255,255,255,0.04)", color: T.textSoft }}
                        >
                          {deleting === product.productId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: T.text }}>{editingProduct ? "Edit Product" : "Add Product"}</h2>
                <p className="text-xs mt-1" style={{ color: T.textMuted }}>
                  {editingProduct ? "Update this product's information." : "Add a new product for this industrialist."}
                </p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <X className="w-4 h-4" style={{ color: T.textSoft }} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: T.redBg, border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!editingProduct && (
                  <Field label="Product ID" value={form.productId} onChange={(v) => updateForm("productId", v)} placeholder="Auto-generated if empty" />
                )}
                <Field label="Product Name" value={form.name} onChange={(v) => updateForm("name", v)} placeholder="e.g. Urea Nitrogen Fertilizer" />
                <Field label="Price (₹)" type="number" value={form.price} onChange={(v) => updateForm("price", v)} placeholder="650" />
                <Field label="Rating" type="number" value={form.rating} onChange={(v) => updateForm("rating", v)} placeholder="4.5" />
                <Field label="Stock Quantity" type="number" value={form.stockQuantity} onChange={(v) => updateForm("stockQuantity", v)} placeholder="50" />
                <Field label="Target Condition" value={form.targetCondition} onChange={(v) => updateForm("targetCondition", v)} placeholder="Nitrogen" />
              </div>

              <Field label="Application Method" value={form.applicationMethod} onChange={(v) => updateForm("applicationMethod", v)} placeholder="Apply around the root zone..." />
              <Field label="Dosage" value={form.dosage} onChange={(v) => updateForm("dosage", v)} placeholder="45–50 kg/hectare" />
            </div>

            <div className="flex justify-end gap-3 px-6 py-5" style={{ borderTop: `1px solid ${T.border}` }}>
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", color: T.textSoft }}
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors"
                style={{ backgroundColor: T.blue, color: "#ffffff" }}
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: T.textSoft }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
        style={{ backgroundColor: T.bg, border: `1px solid ${T.border}`, color: T.text }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = T.border; }}
      />
    </div>
  );
}