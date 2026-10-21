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

interface Sale {
  saleId: string;
  productId: string;
  timestamp: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  product: Product;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch sales"
          );
        }

        setSales(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load sales."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );

  const totalUnits = sales.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  if (loading) {
    return (
      <div className="p-5">
        Loading sales...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <h1 className="text-2xl font-bold">
          Sales History
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-5">
      {/* Header */}
      <h1 className="text-2xl font-bold">
        Sales History
      </h1>

      <p className="mt-2 text-gray-600">
        View all completed fertilizer sales and revenue.
      </p>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Sales
          </p>

          <p className="mt-1 text-2xl font-bold">
            {sales.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Units Sold
          </p>

          <p className="mt-1 text-2xl font-bold">
            {totalUnits}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">
            Total Revenue
          </p>

          <p className="mt-1 text-2xl font-bold text-green-700">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Sales table */}
      <div className="mt-8 overflow-x-auto rounded-xl bg-white shadow">
        {sales.length === 0 ? (
          <div className="p-8 text-gray-600">
            No sales found.
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
                  Unit Price
                </th>

                <th className="px-5 py-4 text-sm font-semibold">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.saleId}
                  className="border-b last:border-b-0"
                >
                  <td className="px-5 py-4 text-sm">
                    {new Date(
                      sale.timestamp
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold">
                      {sale.product.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {sale.productId}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {sale.quantity}
                  </td>

                  <td className="px-5 py-4">
                    ₹
                    {sale.unitPrice.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    ₹
                    {sale.totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}