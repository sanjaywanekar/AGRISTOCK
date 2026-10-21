
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  soldQuantity?: number;
  imageUrl?: string | null;

  // Fertilizer details
  description?: string | null;
  brand?: string | null;
  targetCondition?: string | null;
  targetCrops?: string | null;
  dosage?: string | null;
  applicationMethod?: string | null;

  // Packaging details
  packageSize?: number | null;
  packageUnit?: string | null;
}

export interface NewProduct {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  image?: File;


  
  // Fertilizer details
  description?: string;
  brand?: string;
  targetCondition?: string;
  targetCrops?: string;
  dosage?: string;
  applicationMethod?: string;

  // Packaging details
  packageSize?: number;
  packageUnit?: string;
}


export interface UpdateProduct {
  name?: string;
  price?: number;
  rating?: number;
  stockQuantity?: number;
  description?: string;
  brand?: string;
  targetCondition?: string;
  targetCrops?: string;
  dosage?: string;
  applicationMethod?: string;
  packageSize?: number | null;
  packageUnit?: string | null;
  image?: File;
}


export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  expenseId?: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers) => {
    // Read JWT from browser cookie
    if (typeof document !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return headers;
  },
});

export const api = createApi({
  baseQuery,
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses"],

  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),

    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),

    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => {
        const formData = new FormData();

        formData.append("productId", newProduct.productId);
        formData.append("name", newProduct.name);
        formData.append("price", String(newProduct.price));
        formData.append(
          "stockQuantity",
          String(newProduct.stockQuantity)
        );
        formData.append("rating", String(newProduct.rating ?? 0));

        // Fertilizer details
        formData.append("description", newProduct.description ?? "");
        formData.append("brand", newProduct.brand ?? "");
        formData.append(
          "targetCondition",
          newProduct.targetCondition ?? ""
        );
        formData.append("targetCrops", newProduct.targetCrops ?? "");
        formData.append("dosage", newProduct.dosage ?? "");
        formData.append(
          "applicationMethod",
          newProduct.applicationMethod ?? ""
        );

        // Packaging details
        formData.append(
          "packageSize",
          String(newProduct.packageSize ?? "")
        );
        formData.append("packageUnit", newProduct.packageUnit ?? "");

        // Preserve existing image upload
        if (newProduct.image) {
          formData.append("image", newProduct.image);
        }

        return {
          url: "/products",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Products"],
    }),


updateProduct: build.mutation<
  Product,
  { productId: string; changes: UpdateProduct }
>({
  query: ({ productId, changes }) => {
    const formData = new FormData();

    Object.entries(changes).forEach(([key, value]) => {
      if (value !== undefined && key !== "image") {
        formData.append(key, value === null ? "" : String(value));
      }
    });

    if (changes.image) {
      formData.append("image", changes.image);
    }

    return {
      url: `/products/${encodeURIComponent(productId)}`,
      method: "PATCH",
      body: formData,
    };
  },
  invalidatesTags: ["Products", "DashboardMetrics"],
}),

deleteProduct: build.mutation<
  { message: string },
  string
>({
  query: (productId) => ({
    url: `/products/${encodeURIComponent(productId)}`,
    method: "DELETE",
  }),
  invalidatesTags: ["Products", "DashboardMetrics"],
}),


    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    getExpensesByCategory: build.query<
      ExpenseByCategorySummary[],
      void
    >({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
    createExpense: build.mutation<
  ExpenseByCategorySummary,
  {
    category: string;
    amount: number;
    date: string;
  }
>({
  query: (newExpense) => ({
    url: "/expenses",
    method: "POST",
    body: newExpense,
  }),
  invalidatesTags: ["Expenses"],
}),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
  useCreateExpenseMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api;
