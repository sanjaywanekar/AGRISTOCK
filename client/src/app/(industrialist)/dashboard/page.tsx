"use client";

import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useGetDashboardMetricsQuery } from "@/state/api";

import CardExpenseSummary from "./CardExpenseSummary";
import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import StatCard from "./StatCard";

const Dashboard = () => {
  const { data, isLoading } =
    useGetDashboardMetricsQuery();

  const products = data?.popularProducts || [];
  const salesSummary = data?.salesSummary || [];
  const purchaseSummary =
    data?.purchaseSummary || [];

  // =====================================================
  // INVENTORY
  // =====================================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + product.stockQuantity,
    0
  );

  // =====================================================
  // STOCK ALERTS
  // =====================================================

  const lowStockProducts = products.filter(
    (product) =>
      product.stockQuantity > 0 &&
      product.stockQuantity <= 10
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      product.stockQuantity === 0
  ).length;

  // =====================================================
  // SALES
  // =====================================================

  const totalSales = salesSummary.reduce(
    (sum, item) =>
      sum + item.totalValue,
    0
  );

  // =====================================================
  // PURCHASES
  // =====================================================

  const totalPurchases =
    purchaseSummary.reduce(
      (sum, item) =>
        sum + item.totalPurchased,
      0
    );

  if (isLoading) {
    return (
      <div className="p-5">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {/* ================================================= */}
      {/* POPULAR PRODUCTS */}
      {/* ================================================= */}

      <CardPopularProducts />

      {/* ================================================= */}
      {/* SALES SUMMARY */}
      {/* ================================================= */}

      <CardSalesSummary />

      {/* ================================================= */}
      {/* PURCHASE SUMMARY */}
      {/* ================================================= */}

      <CardPurchaseSummary />

      {/* ================================================= */}
      {/* EXPENSE SUMMARY */}
      {/* ================================================= */}

      <CardExpenseSummary />

      {/* ================================================= */}
      {/* INVENTORY OVERVIEW */}
      {/* ================================================= */}

      <StatCard
        title="Inventory Overview"
        primaryIcon={
          <Package className="text-blue-600 w-6 h-6" />
        }
        dateRange="Current inventory"
        details={[
          {
            title: "Total Products",
            amount: totalProducts.toString(),
            changePercentage: 0,
            IconComponent: Package,
          },
          {
            title: "Stock Units",
            amount: totalStock.toString(),
            changePercentage: 0,
            IconComponent: Package,
          },
        ]}
      />

      {/* ================================================= */}
      {/* STOCK ALERTS */}
      {/* ================================================= */}

      <StatCard
        title="Stock Alerts"
        primaryIcon={
          <AlertTriangle className="text-blue-600 w-6 h-6" />
        }
        dateRange="Current stock status"
        details={[
          {
            title: "Low Stock",
            amount: lowStockProducts.toString(),
            changePercentage: 0,
            IconComponent: AlertTriangle,
          },
          {
            title: "Out of Stock",
            amount: outOfStockProducts.toString(),
            changePercentage: 0,
            IconComponent: AlertTriangle,
          },
        ]}
      />

      {/* ================================================= */}
      {/* FINANCIAL OVERVIEW */}
      {/* ================================================= */}

      <StatCard
        title="Financial Overview"
        primaryIcon={
          <TrendingUp className="text-blue-600 w-6 h-6" />
        }
        dateRange="Last 5 days"
        details={[
          {
            title: "Sales Revenue",
            amount: `₹${totalSales.toLocaleString(
              "en-IN"
            )}`,
            changePercentage: 0,
            IconComponent: TrendingUp,
          },
          {
            title: "Purchase Cost",
            amount: `₹${totalPurchases.toLocaleString(
              "en-IN"
            )}`,
            changePercentage: 0,
            IconComponent: TrendingDown,
          },
        ]}
      />
    </div>
  );
};

export default Dashboard;