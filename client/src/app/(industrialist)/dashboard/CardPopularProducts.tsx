
"use client";

import { useGetDashboardMetricsQuery } from "@/state/api";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "../../(components)/Rating";
import Image from "next/image";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://agristock-api-8all.onrender.com"

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading, isError } =
    useGetDashboardMetricsQuery();

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : isError ? (
        <div className="m-5 text-red-500">
          Failed to load popular products.
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
            Popular Products
          </h3>
          <hr />

          <div className="overflow-auto h-full">
            {dashboardMetrics?.popularProducts.map((product) => {
              const imageSrc = product.imageUrl
                ? product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `${API_BASE_URL.replace(/\/$/, "")}${
                      product.imageUrl.startsWith("/")
                        ? product.imageUrl
                        : `/${product.imageUrl}`
                    }`
                : null;

              return (
                <div
                  key={product.productId}
                  className="flex items-center justify-between gap-3 px-5 py-7 border-b"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="rounded-lg w-14 h-14 object-contain shrink-0"
                      />
                    ) : (
                      <div className="rounded-lg w-14 h-14 shrink-0 bg-gray-100 flex items-center justify-center text-xs text-gray-500 text-center">
                        No image
                      </div>
                    )}

                    <div className="flex flex-col justify-between gap-1 min-w-0">
                      <div className="font-bold text-gray-700">
                        {product.name}
                      </div>

                      <div className="flex text-sm items-center flex-wrap">
                        <span className="font-bold text-blue-500 text-xs">
                          ₹{product.price}
                        </span>
                        <span className="mx-2">|</span>
                        <Rating rating={product.rating || 0} />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs flex items-center shrink-0">
                    <button
                      type="button"
                      aria-label="Product sales"
                      className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    {product.soldQuantity ?? 0} Sold
                  </div>
                </div>
              );
            })}

            {(!dashboardMetrics?.popularProducts ||
              dashboardMetrics.popularProducts.length === 0) && (
              <p className="p-5 text-sm text-gray-500">
                No products available.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
