
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

export const getDashboardMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    // Industrialists see only their own records.
    // Admins can see all records.
    const industrialistFilter =
      req.user.role === "INDUSTRIALIST"
        ? { industrialistId: req.user.userId }
        : {};

    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "INDUSTRIALIST"
    ) {
      res.status(403).json({
        message: "Access denied",
      });
      return;
    }

    // PRODUCTS
    const products = await prisma.products.findMany({
      where: industrialistFilter,
      take: 15,
      orderBy: {
        stockQuantity: "desc",
      },
    });

    // SALES: only the logged-in industrialist's sales.
    const sales = await prisma.sales.findMany({
      where: industrialistFilter,
      orderBy: {
        timestamp: "desc",
      },
    });

    // PURCHASES: only the logged-in industrialist's purchases.
    const purchases = await prisma.purchases.findMany({
      where: industrialistFilter,
      orderBy: {
        timestamp: "desc",
      },
    });

    // POPULAR PRODUCTS
    const salesByProduct = new Map<string, number>();

    for (const sale of sales) {
      salesByProduct.set(
        sale.productId,
        (salesByProduct.get(sale.productId) || 0) +
          sale.quantity
      );
    }

    const popularProducts = products.map((product) => ({
      ...product,
      soldQuantity: salesByProduct.get(product.productId) || 0,
    }));

    // LAST FIVE UTC CALENDAR DAYS
    const today = new Date();
    const todayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

    const days = Array.from({ length: 5 }, (_, index) => {
      return new Date(todayUtc - (4 - index) * DAY_MS);
    });

    const getDayTotal = (
      records: { timestamp: Date; totalAmount?: number; totalCost?: number }[],
      day: Date,
      field: "totalAmount" | "totalCost"
    ): number => {
      const start = day.getTime();
      const end = start + DAY_MS;

      return records.reduce((sum, record) => {
        const timestamp = record.timestamp.getTime();

        if (timestamp >= start && timestamp < end) {
          return sum + Number(record[field] ?? 0);
        }

        return sum;
      }, 0);
    };

    // SALES SUMMARY
    const salesSummary = days.map((day, index) => {
      const totalValue = getDayTotal(
        sales,
        day,
        "totalAmount"
      );

      const previousDayValue =
        index > 0
          ? getDayTotal(sales, days[index - 1], "totalAmount")
          : 0;

      const changePercentage =
        previousDayValue > 0
          ? ((totalValue - previousDayValue) /
              previousDayValue) *
            100
          : 0;

      return {
        salesSummaryId: `sales-${day.toISOString().slice(0, 10)}`,
        totalValue,
        changePercentage,
        date: day,
      };
    });

    // PURCHASE SUMMARY
    const purchaseSummary = days.map((day, index) => {
      const totalPurchased = getDayTotal(
        purchases,
        day,
        "totalCost"
      );

      const previousDayValue =
        index > 0
          ? getDayTotal(
              purchases,
              days[index - 1],
              "totalCost"
            )
          : 0;

      const changePercentage =
        previousDayValue > 0
          ? ((totalPurchased - previousDayValue) /
              previousDayValue) *
            100
          : 0;

      return {
        purchaseSummaryId: `purchases-${day.toISOString().slice(0, 10)}`,
        totalPurchased,
        changePercentage,
        date: day,
      };
    });

    // EXPENSES: only this industrialist's expenses.
    const expenses = await prisma.expenses.findMany({
      where: industrialistFilter,
      orderBy: {
        timestamp: "desc",
      },
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );

    const expenseSummary = [
      {
        expenseSummaryId: "expense-total",
        totalExpenses,
        date: new Date(),
      },
    ];

    // EXPENSE TOTALS BY CATEGORY
    const categoryTotals = new Map<string, number>();

    for (const expense of expenses) {
      categoryTotals.set(
        expense.category,
        (categoryTotals.get(expense.category) || 0) +
          Number(expense.amount)
      );
    }

    const expenseByCategorySummary = Array.from(
      categoryTotals.entries()
    ).map(([category, amount], index) => ({
      expenseByCategorySummaryId: `expense-category-${index}`,
      category,
      amount: amount.toString(),
      date: new Date(),
    }));

    res.json({
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);

    res.status(500).json({
      message: "Error retrieving dashboard metrics",
    });
  }
};
