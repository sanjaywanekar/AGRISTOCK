"use client";

import { useEffect, useState } from "react";

interface Product {
  productId: string;
  name: string;
  price: number;
  rating: number | null;
  stockQuantity: number;
  targetCondition: string | null;
  applicationMethod: string | null;
  dosage: string | null;
}

interface Purchase {
  purchaseId: string;
  productId: string;
  timestamp: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  product: Product;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Purchase modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  };

  // =====================================================
  // FETCH PURCHASES + PRODUCTS
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      const [purchasesResponse, productsResponse] =
        await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchases`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const purchasesData = await purchasesResponse.json();
      const productsData = await productsResponse.json();

      if (!purchasesResponse.ok) {
        throw new Error(
          purchasesData.message ||
            "Failed to fetch purchases"
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          productsData.message ||
            "Failed to fetch products"
        );
      }

      setPurchases(purchasesData);
      setProducts(productsData);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // PRODUCT SELECTION
  // =====================================================

  const handleProductChange = (
    productId: string
  ) => {
    setSelectedProductId(productId);

    const product = products.find(
      (item) => item.productId === productId
    );

    if (product) {
      // Default purchase cost to current product price
      setUnitCost(product.price);
    } else {
      setUnitCost(0);
    }
  };

  // =====================================================
  // CREATE PURCHASE
  // =====================================================

  const handleCreatePurchase = async () => {
    setPurchaseError("");
    setSuccessMessage("");

    if (!selectedProductId) {
      setPurchaseError("Please select a product.");
      return;
    }

    if (quantity <= 0) {
      setPurchaseError(
        "Quantity must be greater than 0."
      );
      return;
    }

    if (unitCost <= 0) {
      setPurchaseError(
        "Unit cost must be greater than 0."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setPurchaseError("You are not logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchases`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: selectedProductId,
            quantity,
            unitCost,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create purchase."
        );
      }

      setSuccessMessage(
        `Purchase successful. ${quantity} unit(s) added to inventory for ₹${data.purchase.totalCost.toLocaleString(
          "en-IN"
        )}.`
      );

      // Reset modal
      setShowModal(false);
      setSelectedProductId("");
      setQuantity(1);
      setUnitCost(0);

      // Refresh purchases and stock
      await fetchData();
    } catch (error) {
      console.error(error);

      setPurchaseError(
        error instanceof Error
          ? error.message
          : "Failed to create purchase."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalCost = purchases.reduce(
    (sum, purchase) =>
      sum + purchase.totalCost,
    0
  );

  const totalUnits = purchases.reduce(
    (sum, purchase) =>
      sum + purchase.quantity,
    0
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-5">
        Loading purchases...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold">
          Purchase History
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Purchase History
          </h1>

          <p className="mt-2 text-gray-600">
            View fertilizer purchases and inventory
            restocking.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setPurchaseError("");
            setSuccessMessage("");
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + New Purchase
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="mt-5 rounded-lg bg-green-50 p-4">
          <p className="font-medium text-green-800">
            {successMessage}
          </p>
        </div>
      )}

      {/* SUMMARY */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Purchases
          </p>

          <p className="mt-1 text-2xl font-bold">
            {purchases.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Units Purchased
          </p>

          <p className="mt-1 text-2xl font-bold">
            {totalUnits}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Purchase Cost
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-700">
            ₹{totalCost.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* TABLE */}

      <div className="mt-8 overflow-x-auto rounded-xl bg-white shadow">
        {purchases.length === 0 ? (
          <div className="p-8 text-gray-600">
            No purchases found.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-4 text-sm font-semibold">
                  Date
                </th>

                <th className="px-5 py-4 text-sm font-semibold">
                  Product
                </th>

                <th className="px-5 py-4 text-sm font-semibold">
                  Quantity
                </th>

                <th className="px-5 py-4 text-sm font-semibold">
                  Unit Cost
                </th>

                <th className="px-5 py-4 text-sm font-semibold">
                  Total Cost
                </th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => (
                <tr
                  key={purchase.purchaseId}
                  className="border-b last:border-b-0"
                >
                  <td className="px-5 py-4 text-sm">
                    {new Date(
                      purchase.timestamp
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold">
                      {purchase.product.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {purchase.productId}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {purchase.quantity}
                  </td>

                  <td className="px-5 py-4">
                    ₹
                    {purchase.unitCost.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    ₹
                    {purchase.totalCost.toLocaleString(
                      "en-IN"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================================================= */}
      {/* NEW PURCHASE MODAL */}
      {/* ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                New Purchase
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setPurchaseError("");
                }}
                className="text-xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Add fertilizer stock to your inventory.
            </p>

            {/* PRODUCT */}

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700">
                Product
              </label>

              <select
                value={selectedProductId}
                onChange={(e) =>
                  handleProductChange(e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">
                  Select a product
                </option>

                {products.map((product) => (
                  <option
                    key={product.productId}
                    value={product.productId}
                  >
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CURRENT STOCK */}

            {selectedProductId && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  Current Stock
                </p>

                <p className="font-semibold">
                  {
                    products.find(
                      (product) =>
                        product.productId ===
                        selectedProductId
                    )?.stockQuantity
                  }{" "}
                  units
                </p>
              </div>
            )}

            {/* QUANTITY */}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Number(e.target.value)
                  )
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            {/* UNIT COST */}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Unit Cost
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={unitCost}
                onChange={(e) =>
                  setUnitCost(
                    Number(e.target.value)
                  )
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            {/* TOTAL */}

            <div className="mt-5 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                Total Purchase Cost
              </p>

              <p className="mt-1 text-xl font-bold text-blue-800">
                ₹
                {(
                  quantity * unitCost
                ).toLocaleString("en-IN")}
              </p>
            </div>

            {/* ERROR */}

            {purchaseError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  {purchaseError}
                </p>
              </div>
            )}

            {/* BUTTONS */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setPurchaseError("");
                }}
                disabled={isSubmitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleCreatePurchase}
                disabled={
                  isSubmitting ||
                  !selectedProductId ||
                  quantity <= 0 ||
                  unitCost <= 0
                }
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Processing..."
                  : "Confirm Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}