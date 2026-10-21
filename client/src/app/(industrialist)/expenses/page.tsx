
"use client";

import {
  ExpenseByCategorySummary,
  useCreateExpenseMutation,
  useGetExpensesByCategoryQuery,
} from "@/state/api";
import { FormEvent, useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const CATEGORIES = [
  "Office",
  "Professional",
  "Salaries",
  "Transportation",
  "Utilities",
  "Maintenance",
  "Other",
];

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#dc2626",
  "#64748b",
];

type ChartItem = {
  name: string;
  amount: number;
  color: string;
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Expenses = () => {
  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();

  const [createExpense, { isLoading: isSaving }] =
    useCreateExpenseMutation();

  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("Office");
  const [amount, setAmount] = useState("5000");
  const [date, setDate] = useState(today());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const expenses = useMemo(
    () => expensesData ?? [],
    [expensesData]
  );

  const parseDate = (value: string) => {
    // API returns an ISO timestamp. Extract its calendar date
    // without shifting it due to the browser's timezone.
    return value.slice(0, 10);
  };

  const aggregatedData: ChartItem[] = useMemo(() => {
    const totals: Record<string, number> = {};

    expenses
      .filter((expense: ExpenseByCategorySummary) => {
        const expenseDate = parseDate(expense.date);

        const categoryMatches =
          selectedCategory === "All" ||
          expense.category === selectedCategory;

        const startMatches =
          !startDate || expenseDate >= startDate;

        const endMatches =
          !endDate || expenseDate <= endDate;

        return categoryMatches && startMatches && endMatches;
      })
      .forEach((expense) => {
        const value = Number(expense.amount);

        if (Number.isFinite(value)) {
          totals[expense.category] =
            (totals[expense.category] ?? 0) + value;
        }
      });

    return Object.entries(totals).map(([name, total], index) => ({
      name,
      amount: total,
      color: COLORS[index % COLORS.length],
    }));
  }, [expenses, selectedCategory, startDate, endDate]);

  const totalExpenses = aggregatedData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    if (!date) {
      setFormError("Please select the expense date.");
      return;
    }

    try {
      await createExpense({
        category,
        amount: numericAmount,
        date,
      }).unwrap();

      setSuccessMessage("Expense saved successfully.");
      setCategory("Office");
      setAmount("");
      setDate(today());
      setShowForm(false);
    } catch (error) {
      console.error("Create expense failed:", error);
      setFormError(
        "Could not save the expense. Check your login and backend, then try again."
      );
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  if (isLoading) {
    return <div className="py-8 text-center">Loading expenses...</div>;
  }

  if (isError) {
    return (
      <div className="py-8 text-center text-red-600">
        Failed to fetch expenses. Check your login and backend.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Header name="Expenses" />
          <p className="text-sm text-gray-500">
            Track and visualize your expenses over time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setFormError("");
            setSuccessMessage("");
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-md bg-green-50 p-3 text-sm text-green-700"
        >
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">
            Add New Expense
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="expense-category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="expense-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
                required
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="expense-amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount (₹)
              </label>
              <input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="e.g. 5000"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="expense-date"
                className="block text-sm font-medium text-gray-700"
              >
                Expense Date
              </label>
              <input
                id="expense-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputClass}
                required
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 md:col-span-3">
                {formError}
              </p>
            )}

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow md:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">
            Filter Expenses
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="filter-category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className={inputClass}
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setStartDate("");
                setEndDate("");
              }}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow md:col-span-2">
          <h2 className="mb-2 text-lg font-semibold">
            Expenses by Category
          </h2>

          <p className="mb-2 text-sm text-gray-500">
            Total: ₹
            {totalExpenses.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          {aggregatedData.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
              <p className="font-medium text-gray-700">
                No expenses to display
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add an expense or change your filters to see the chart.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="50%"
                  dataKey="amount"
                  nameKey="name"
                  outerRadius={130}
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`
                  }
                >
                  {aggregatedData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    "Amount",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
