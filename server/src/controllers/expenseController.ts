
import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const validCategories = [
  "Office",
  "Professional",
  "Salaries",
  "Transportation",
  "Utilities",
  "Maintenance",
  "Other",
];

// GET /expenses
// Return individual expenses. The frontend aggregates them for the chart.
export const getExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const where =
      req.user.role === "ADMIN"
        ? {}
        : { industrialistId: req.user.userId };

    const expenses = await prisma.expenses.findMany({
      where,
      orderBy: { timestamp: "desc" },
    });

    res.json(
      expenses.map((expense) => ({
        expenseByCategorySummaryId: expense.expenseId,
        expenseId: expense.expenseId,
        industrialistId: expense.industrialistId,
        category: expense.category,
        amount: String(expense.amount),
        date: expense.timestamp.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Error retrieving expenses" });
  }
};

// POST /expenses
export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const category =
      typeof req.body.category === "string"
        ? req.body.category.trim()
        : "";

    const amount = Number(req.body.amount);
    const date =
      typeof req.body.date === "string" ? req.body.date.trim() : "";

    if (!validCategories.includes(category)) {
      res.status(400).json({
        message: "Please select a valid expense category",
      });
      return;
    }

    if (
      req.body.amount === undefined ||
      req.body.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      res.status(400).json({
        message: "Amount must be a positive number",
      });
      return;
    }

    // Accept a calendar date in YYYY-MM-DD format.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        message: "Please provide a valid expense date",
      });
      return;
    }

    const timestamp = new Date(`${date}T12:00:00.000Z`);

    if (
      Number.isNaN(timestamp.getTime()) ||
      timestamp.toISOString().slice(0, 10) !== date
    ) {
      res.status(400).json({
        message: "Please provide a valid expense date",
      });
      return;
    }

    // Never accept industrialistId from the client.
    const industrialistId = req.user.userId;

    const expense = await prisma.expenses.create({
      data: {
        expenseId: randomUUID(),
        industrialistId,
        category,
        amount,
        timestamp,
      },
    });

    res.status(201).json({
      expenseId: expense.expenseId,
      industrialistId: expense.industrialistId,
      category: expense.category,
      amount: String(expense.amount),
      date: expense.timestamp.toISOString(),
    });
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: "Error creating expense" });
  }
};
