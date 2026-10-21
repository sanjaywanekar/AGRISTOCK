"use client";

import { useState } from "react";
import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Product {
  productId: string;
  name: string;
  price: number;
  rating: number | null;
  stockQuantity: number;
  targetCondition: string | null;
  dosage: string | null;
  applicationMethod: string | null;
}

const Inventory = () => {
  const {
    data: products,
    isError,
    isLoading,
    refetch,
  } = useGetProductsQuery();

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [isSelling, setIsSelling] = useState(false);
  const [saleMessage, setSaleMessage] = useState("");
  const [saleError, setSaleError] = useState("");

  const handleSell = async () => {
    if (!selectedProduct) return;

    if (quantity <= 0) {
      setSaleError("Quantity must be greater than 0.");
      return;
    }

    if (quantity > selectedProduct.stockQuantity) {
      setSaleError(
        `Only ${selectedProduct.stockQuantity} units are available.`
      );
      return;
    }

    setIsSelling(true);
    setSaleError("");
    setSaleMessage("");

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: selectedProduct.productId,
            quantity,
            unitPrice: selectedProduct.price,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create sale."
        );
      }

      setSaleMessage(
        `Sale successful. ${quantity} unit(s) sold for ₹${data.sale.totalAmount.toLocaleString(
          "en-IN"
        )}.`
      );

      setSelectedProduct(null);
      setQuantity(1);

      // Refresh inventory
      refetch();
    } catch (error) {
      console.error(error);

      setSaleError(
        error instanceof Error
          ? error.message
          : "Failed to create sale."
      );
    } finally {
      setIsSelling(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "productId",
      headerName: "ID",
      width: 120,
    },
    {
      field: "name",
      headerName: "Product Name",
      width: 220,
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      type: "number",
      valueGetter: (value, row) =>
        `₹${row.price.toLocaleString("en-IN")}`,
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 110,
      type: "number",
      valueGetter: (value, row) =>
        row.rating ? row.rating : "N/A",
    },
    {
      field: "stockQuantity",
      headerName: "Stock Quantity",
      width: 150,
      type: "number",
    },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <button
          onClick={() => {
            setSelectedProduct(params.row);
            setQuantity(1);
            setSaleMessage("");
            setSaleError("");
          }}
          disabled={params.row.stockQuantity <= 0}
          className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Sell
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-5">
        Loading...
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="p-5 text-red-600">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="p-5">
      <Header name="Inventory" />

      {/* Success message */}
      {saleMessage && (
        <div className="mt-5 rounded-lg bg-green-50 p-4 text-green-800">
          {saleMessage}
        </div>
      )}

      {/* Inventory table */}
      <DataGrid
        rows={products}
        columns={columns}
        getRowId={(row) => row.productId}
        checkboxSelection
        className="mt-5 rounded-lg border border-gray-200 bg-white !text-gray-700 shadow"
        autoHeight
      />

      {/* ===================================================== */}
      {/* SELL PRODUCT MODAL */}
      {/* ===================================================== */}

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">
              Sell Product
            </h2>

            <p className="mt-2 text-gray-600">
              {selectedProduct.name}
            </p>

            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm">
                Price:{" "}
                <span className="font-semibold">
                  ₹
                  {selectedProduct.price.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </p>

              <p className="mt-1 text-sm">
                Available Stock:{" "}
                <span className="font-semibold">
                  {selectedProduct.stockQuantity}
                </span>
              </p>
            </div>

            {/* Quantity */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                max={selectedProduct.stockQuantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-green-600"
              />
            </div>

            {/* Total */}
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Total Amount
              </p>

              <p className="text-xl font-bold text-green-800">
                ₹
                {(
                  selectedProduct.price * quantity
                ).toLocaleString("en-IN")}
              </p>
            </div>

            {/* Error */}
            {saleError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  {saleError}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setQuantity(1);
                  setSaleError("");
                }}
                disabled={isSelling}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSell}
                disabled={
                  isSelling ||
                  quantity <= 0 ||
                  quantity > selectedProduct.stockQuantity
                }
                className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSelling ? "Processing..." : "Confirm Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;