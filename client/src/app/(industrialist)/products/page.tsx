
"use client";

import { useState } from "react";
import {
  useCreateProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type Product,
  type UpdateProduct,
} from "@/state/api";
import {
  PlusCircle,
  Search,
  Pencil,
  Trash2,
  X,
  PackagePlus,
} from "lucide-react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";

type ProductFormData = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
  image?: File;
};

type EditForm = {
  name: string;
  price: string;
  stockQuantity: string;
  rating: string;
  brand: string;
  description: string;
  targetCondition: string;
  targetCrops: string;
  dosage: string;
  applicationMethod: string;
  packageSize: string;
  packageUnit: string;
  image?: File;
};

const emptyForm: EditForm = {
  name: "",
  price: "",
  stockQuantity: "",
  rating: "0",
  brand: "",
  description: "",
  targetCondition: "",
  targetCrops: "",
  dosage: "",
  applicationMethod: "",
  packageSize: "",
  packageUnit: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001")
    .replace(/\/+$/, "");

function getImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return "/product-placeholder.png";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_BASE}/${imageUrl.replace(/^\/+/, "")}`;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery(searchTerm);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      await createProduct(productData).unwrap();
      setSuccess("Product created successfully.");
      setError("");
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create product.");
      throw err;
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setError("");
    setSuccess("");
    setForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      stockQuantity: String(product.stockQuantity ?? 0),
      rating: String(product.rating ?? 0),
      brand: product.brand || "",
      description: product.description || "",
      targetCondition: product.targetCondition || "",
      targetCrops: product.targetCrops || "",
      dosage: product.dosage || "",
      applicationMethod: product.applicationMethod || "",
      packageSize: product.packageSize == null ? "" : String(product.packageSize),
      packageUnit: product.packageUnit || "",
      image: undefined,
    });
  };

  const closeEditor = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProduct) return;

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);
    const rating = Number(form.rating);
    const packageSize =
      form.packageSize.trim() === "" ? null : Number(form.packageSize);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a price greater than zero.");
      return;
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError("Stock must be a non-negative whole number.");
      return;
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }
    if (
      packageSize !== null &&
      (!Number.isFinite(packageSize) || packageSize <= 0)
    ) {
      setError("Package size must be greater than zero.");
      return;
    }
    if ((packageSize === null) !== (form.packageUnit === "")) {
      setError("Provide both package size and package unit.");
      return;
    }

    const changes: UpdateProduct = {
      name: form.name.trim(),
      price,
      stockQuantity,
      rating,
      brand: form.brand,
      description: form.description,
      targetCondition: form.targetCondition,
      targetCrops: form.targetCrops,
      dosage: form.dosage,
      applicationMethod: form.applicationMethod,
      packageSize,
      packageUnit: packageSize === null ? null : form.packageUnit,
      image: form.image,
    };

    try {
      setIsSaving(true);
      setError("");
      await updateProduct({
        productId: editingProduct.productId,
        changes,
      }).unwrap();
      setSuccess("Product updated successfully.");
      closeEditor();
    } catch (err: any) {
      setError(err?.data?.message || "Failed to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteProduct(product.productId).unwrap();
      setSuccess("Product deleted successfully.");
    } catch (err: any) {
      setError(
        err?.data?.message ||
          "Could not delete product. Check whether it has transaction history."
      );
    }
  };

  if (isLoading) return <div className="py-4">Loading products...</div>;

  if (isError || !products) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to fetch products.
      </div>
    );
  }

  const setField = (field: keyof EditForm, value: string | File) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="mx-auto w-full pb-5">
      <div className="mb-6 flex items-center rounded-lg border-2 border-gray-200 bg-white">
        <Search className="m-2 h-5 w-5 text-gray-500" />
        <input
          className="w-full rounded-lg bg-white px-4 py-2 text-gray-900 outline-none"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <Header name="Products" />
        <button
          type="button"
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Product
        </button>
      </div>

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          {success}
        </div>
      )}
      {error && !editingProduct && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.productId}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-44 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="h-full w-full object-contain"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/product-placeholder.png";
                }}
              />
            </div>

            <div className="flex-1 pt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>
              {product.brand && (
                <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
              )}
              <p className="mt-2 text-lg font-semibold text-gray-900">
                ₹{Number(product.price).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Stock: <span className="font-semibold">{product.stockQuantity}</span>
                {product.packageUnit ? ` ${product.packageUnit}` : " units"}
              </p>
              {product.rating != null && (
                <div className="mt-2 flex justify-center">
                  <Rating rating={product.rating} />
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => startEditing(product)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Pencil className="h-4 w-4" />
                Edit / Stock
              </button>
              <button
                type="button"
                onClick={() => handleDelete(product)}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {products.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          No products found.
        </p>
      )}

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Product
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update details, pricing, packaging, and stock.
                </p>
              </div>
              <button type="button" onClick={closeEditor} aria-label="Close">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Product name *
                <input
                  required
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Brand
                <input
                  className={inputClass}
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Price per package (₹) *
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Stock quantity *
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={form.stockQuantity}
                  onChange={(e) => setField("stockQuantity", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Rating (0–5)
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className={inputClass}
                  value={form.rating}
                  onChange={(e) => setField("rating", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Target condition
                <input
                  className={inputClass}
                  value={form.targetCondition}
                  onChange={(e) => setField("targetCondition", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Target crops
                <input
                  className={inputClass}
                  value={form.targetCrops}
                  onChange={(e) => setField("targetCrops", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Dosage
                <input
                  className={inputClass}
                  value={form.dosage}
                  onChange={(e) => setField("dosage", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Package size
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  className={inputClass}
                  value={form.packageSize}
                  onChange={(e) => setField("packageSize", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700">
                Package unit
                <select
                  className={inputClass}
                  value={form.packageUnit}
                  onChange={(e) => setField("packageUnit", e.target.value)}
                >
                  <option value="">Select unit</option>
                  {["kg", "g", "litre", "ml", "bag", "packet", "bottle"].map(
                    (unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Application method
                <input
                  className={inputClass}
                  value={form.applicationMethod}
                  onChange={(e) => setField("applicationMethod", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Description
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </label>

              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Replace product image (optional)
                <input
                  type="file"
                  accept="image/*"
                  className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1`}
                  onChange={(e) =>
                    setField("image", e.target.files?.[0] || "")
                  }
                />
                <span className="mt-1 block text-xs text-gray-500">
                  Leave empty to keep the current image.
                </span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                <PackagePlus className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Products;
