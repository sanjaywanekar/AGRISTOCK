import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* =========================================================
   SYSTEM-WIDE ADMIN STATS
   GET /admin/stats
========================================================= */

export const getAdminStats = async (
  req: Request,
  res: Response
) => {
  try {
    const [
      totalFarmers,
      totalIndustrialists,
      totalProducts,
      totalScans,
    ] = await Promise.all([
      prisma.users.count({
        where: {
          role: "FARMER",
        },
      }),

      prisma.users.count({
        where: {
          role: "INDUSTRIALIST",
        },
      }),

      prisma.products.count(),

      prisma.scanResults.count(),
    ]);

    const scansByLabelRaw = await prisma.scanResults.groupBy({
      by: ["predictedLabel"],
      _count: {
        predictedLabel: true,
      },
      where: {
        predictedLabel: {
          not: null,
        },
      },
    });

    const scansByLabel = scansByLabelRaw.map((row) => ({
      label: row.predictedLabel as string,
      count: row._count.predictedLabel,
    }));

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    );

    const recentScans = await prisma.scanResults.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const scansByDayMap: Record<string, number> = {};

    recentScans.forEach((scan) => {
      const day = scan.createdAt
        .toISOString()
        .slice(0, 10);

      scansByDayMap[day] =
        (scansByDayMap[day] || 0) + 1;
    });

    const scansOverTime = Object.entries(
      scansByDayMap
    )
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      );

    return res.json({
      totalFarmers,
      totalIndustrialists,
      totalProducts,
      totalScans,
      scansByLabel,
      scansOverTime,
    });
  } catch (err) {
    console.error(
      "Admin stats error:",
      err
    );

    return res.status(500).json({
      message: "Failed to load admin stats",
    });
  }
};


/* =========================================================
   GET ALL INDUSTRIALISTS
   GET /admin/industrialists
========================================================= */

export const getIndustrialists = async (
  req: Request,
  res: Response
) => {
  try {
    const industrialists =
      await prisma.users.findMany({
        where: {
          role: "INDUSTRIALIST",
        },

        select: {
          userId: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,

          _count: {
            select: {
              products: true,
              sales: true,
              purchases: true,
              expenses: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return res.json(industrialists);
  } catch (err) {
    console.error(
      "Get industrialists error:",
      err
    );

    return res.status(500).json({
      message: "Failed to load industrialists",
    });
  }
};


/* =========================================================
   GET SINGLE INDUSTRIALIST
   GET /admin/industrialists/:id
========================================================= */

export const getIndustrialist = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const industrialist =
      await prisma.users.findFirst({
        where: {
          userId: id,
          role: "INDUSTRIALIST",
        },

        select: {
          userId: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,

          _count: {
            select: {
              products: true,
              sales: true,
              purchases: true,
              expenses: true,
            },
          },
        },
      });

    if (!industrialist) {
      return res.status(404).json({
        message: "Industrialist not found",
      });
    }

    return res.json(industrialist);
  } catch (err) {
    console.error(
      "Get industrialist error:",
      err
    );

    return res.status(500).json({
      message: "Failed to load industrialist",
    });
  }
};


/* =========================================================
   INDUSTRIALIST DASHBOARD
   GET /admin/industrialists/:id/dashboard
========================================================= */

export const getIndustrialistDashboard =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const industrialist =
        await prisma.users.findFirst({
          where: {
            userId: id,
            role: "INDUSTRIALIST",
          },

          select: {
            userId: true,
            name: true,
            email: true,
            createdAt: true,
          },
        });

      if (!industrialist) {
        return res.status(404).json({
          message: "Industrialist not found",
        });
      }

      const [
        totalProducts,
        totalSales,
        totalPurchases,
        totalExpenses,
        stockResult,
        salesResult,
        purchasesResult,
        expensesResult,
      ] = await Promise.all([
        prisma.products.count({
          where: {
            industrialistId: id,
          },
        }),

        prisma.sales.count({
          where: {
            industrialistId: id,
          },
        }),

        prisma.purchases.count({
          where: {
            industrialistId: id,
          },
        }),

        prisma.expenses.count({
          where: {
            industrialistId: id,
          },
        }),

        prisma.products.aggregate({
          where: {
            industrialistId: id,
          },

          _sum: {
            stockQuantity: true,
          },
        }),

        prisma.sales.aggregate({
          where: {
            industrialistId: id,
          },

          _sum: {
            totalAmount: true,
          },
        }),

        prisma.purchases.aggregate({
          where: {
            industrialistId: id,
          },

          _sum: {
            totalCost: true,
          },
        }),

        prisma.expenses.aggregate({
          where: {
            industrialistId: id,
          },

          _sum: {
            amount: true,
          },
        }),
      ]);

      const totalStock =
        stockResult._sum.stockQuantity ?? 0;

      const totalSalesValue =
        salesResult._sum.totalAmount ?? 0;

      const totalPurchaseValue =
        purchasesResult._sum.totalCost ?? 0;

      const totalExpenseValue =
        expensesResult._sum.amount ?? 0;

      const estimatedProfit =
        totalSalesValue -
        totalPurchaseValue -
        totalExpenseValue;

      return res.json({
        industrialist,

        totals: {
          products: totalProducts,
          sales: totalSales,
          purchases: totalPurchases,
          expenses: totalExpenses,
          stock: totalStock,
        },

        financials: {
          sales: totalSalesValue,
          purchases: totalPurchaseValue,
          expenses: totalExpenseValue,
          estimatedProfit,
        },
      });
    } catch (err) {
      console.error(
        "Industrialist dashboard error:",
        err
      );

      return res.status(500).json({
        message:
          "Failed to load industrialist dashboard",
      });
    }
  };


/* =========================================================
   INDUSTRIALIST PRODUCTS
   GET /admin/industrialists/:id/products
========================================================= */

export const getIndustrialistProducts =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const industrialist =
        await prisma.users.findFirst({
          where: {
            userId: id,
            role: "INDUSTRIALIST",
          },

          select: {
            userId: true,
          },
        });

      if (!industrialist) {
        return res.status(404).json({
          message: "Industrialist not found",
        });
      }

      const products =
        await prisma.products.findMany({
          where: {
            industrialistId: id,
          },

          orderBy: {
            name: "asc",
          },
        });

      return res.json(products);
    } catch (err) {
      console.error(
        "Industrialist products error:",
        err
      );

      return res.status(500).json({
        message:
          "Failed to load industrialist products",
      });
    }
  };


/* =========================================================
   INDUSTRIALIST SALES
   GET /admin/industrialists/:id/sales
========================================================= */

export const getIndustrialistSales =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const sales =
        await prisma.sales.findMany({
          where: {
            industrialistId: id,
          },

          include: {
            product: true,
          },

          orderBy: {
            timestamp: "desc",
          },
        });

      return res.json(sales);
    } catch (err) {
      console.error(
        "Industrialist sales error:",
        err
      );

      return res.status(500).json({
        message:
          "Failed to load industrialist sales",
      });
    }
  };


/* =========================================================
   INDUSTRIALIST PURCHASES
   GET /admin/industrialists/:id/purchases
========================================================= */

export const getIndustrialistPurchases =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const purchases =
        await prisma.purchases.findMany({
          where: {
            industrialistId: id,
          },

          include: {
            product: true,
          },

          orderBy: {
            timestamp: "desc",
          },
        });

      return res.json(purchases);
    } catch (err) {
      console.error(
        "Industrialist purchases error:",
        err
      );

      return res.status(500).json({
        message:
          "Failed to load industrialist purchases",
      });
    }
  };


/* =========================================================
   INDUSTRIALIST EXPENSES
   GET /admin/industrialists/:id/expenses
========================================================= */

export const getIndustrialistExpenses =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const expenses =
        await prisma.expenses.findMany({
          where: {
            industrialistId: id,
          },

          orderBy: {
            timestamp: "desc",
          },
        });

      return res.json(expenses);
    } catch (err) {
      console.error(
        "Industrialist expenses error:",
        err
      );

      return res.status(500).json({
        message:
          "Failed to load industrialist expenses",
      });
    }
  };

  /* =========================================================
   ADMIN PRODUCT MANAGEMENT
   ========================================================= */

/* ---------------------------------------------------------
   CREATE PRODUCT FOR INDUSTRIALIST
   POST /admin/industrialists/:id/products
--------------------------------------------------------- */

export const createIndustrialistProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      productId,
      name,
      price,
      rating,
      stockQuantity,
      targetCondition,
      applicationMethod,
      dosage,
    } = req.body;

    // Verify Industrialist exists
    const industrialist = await prisma.users.findFirst({
      where: {
        userId: id,
        role: "INDUSTRIALIST",
      },
      select: {
        userId: true,
      },
    });

    if (!industrialist) {
      return res.status(404).json({
        message: "Industrialist not found",
      });
    }

    if (!name || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({
        message: "name, price and stockQuantity are required",
      });
    }

    const product = await prisma.products.create({
      data: {
        productId: productId || crypto.randomUUID(),
        name,
        price: Number(price),
        rating:
          rating !== undefined && rating !== null
            ? Number(rating)
            : null,
        stockQuantity: Number(stockQuantity),
        targetCondition: targetCondition || null,
        applicationMethod: applicationMethod || null,
        dosage: dosage || null,

        industrialist: {
          connect: {
            userId: id,
          },
        },
      },
    });

    return res.status(201).json(product);
  } catch (err) {
    console.error("Create industrialist product error:", err);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};


/* ---------------------------------------------------------
   UPDATE PRODUCT
   PUT /admin/industrialists/:id/products/:productId
--------------------------------------------------------- */

export const updateIndustrialistProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, productId } = req.params;

    const {
      name,
      price,
      rating,
      stockQuantity,
      targetCondition,
      applicationMethod,
      dosage,
    } = req.body;

    // Make sure product belongs to this Industrialist
    const existingProduct = await prisma.products.findFirst({
      where: {
        productId,
        industrialistId: id,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found for this industrialist",
      });
    }

    const product = await prisma.products.update({
      where: {
        productId,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(rating !== undefined && {
          rating:
            rating === null || rating === ""
              ? null
              : Number(rating),
        }),
        ...(stockQuantity !== undefined && {
          stockQuantity: Number(stockQuantity),
        }),
        ...(targetCondition !== undefined && {
          targetCondition: targetCondition || null,
        }),
        ...(applicationMethod !== undefined && {
          applicationMethod: applicationMethod || null,
        }),
        ...(dosage !== undefined && {
          dosage: dosage || null,
        }),
      },
    });

    return res.json(product);
  } catch (err) {
    console.error("Update industrialist product error:", err);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};


/* ---------------------------------------------------------
   DELETE PRODUCT
   DELETE /admin/industrialists/:id/products/:productId
--------------------------------------------------------- */

export const deleteIndustrialistProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, productId } = req.params;

    // Make sure product belongs to this Industrialist
    const product = await prisma.products.findFirst({
      where: {
        productId,
        industrialistId: id,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found for this industrialist",
      });
    }

    // Don't delete products that already have transaction history
    const [salesCount, purchasesCount] = await Promise.all([
      prisma.sales.count({
        where: {
          productId,
          industrialistId: id,
        },
      }),

      prisma.purchases.count({
        where: {
          productId,
          industrialistId: id,
        },
      }),
    ]);

    if (salesCount > 0 || purchasesCount > 0) {
      return res.status(409).json({
        message:
          "This product cannot be deleted because it has sales or purchase history.",
        salesCount,
        purchasesCount,
      });
    }

    // Remove optional scan recommendations pointing to this product
    await prisma.scanResults.updateMany({
      where: {
        recommendedProductId: productId,
      },
      data: {
        recommendedProductId: null,
      },
    });

    await prisma.products.delete({
      where: {
        productId,
      },
    });

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Delete industrialist product error:", err);

    return res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

export const getFarmers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const farmers = await prisma.users.findMany({
      where: {
        role: "FARMER",
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            scanResults: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(farmers);
  } catch (error) {
    console.error("Get farmers error:", error);

    res.status(500).json({
      message: "Failed to load farmers",
    });
  }
};


export const getFarmer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const farmer = await prisma.users.findFirst({
      where: {
        userId: id,
        role: "FARMER",
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            scanResults: true,
          },
        },
      },
    });

    if (!farmer) {
      res.status(404).json({
        message: "Farmer not found",
      });
      return;
    }

    res.json(farmer);
  } catch (error) {
    console.error("Get farmer error:", error);

    res.status(500).json({
      message: "Failed to load farmer",
    });
  }
};


export const getFarmerScans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const farmer = await prisma.users.findFirst({
      where: {
        userId: id,
        role: "FARMER",
      },
      select: {
        userId: true,
      },
    });

    if (!farmer) {
      res.status(404).json({
        message: "Farmer not found",
      });
      return;
    }

    const scans = await prisma.scanResults.findMany({
      where: {
        farmerId: id,
      },
      include: {
        recommendedProduct: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(scans);
  } catch (error) {
    console.error("Get farmer scans error:", error);

    res.status(500).json({
      message: "Failed to load farmer scans",
    });
  }
};

export const getFarmerScan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, scanId } = req.params;

    // Verify farmer exists
    const farmer = await prisma.users.findFirst({
      where: {
        userId: id,
        role: "FARMER",
      },
      select: {
        userId: true,
      },
    });

    if (!farmer) {
      res.status(404).json({
        message: "Farmer not found",
      });
      return;
    }

    // Get the specific scan belonging to this farmer
    const scan = await prisma.scanResults.findFirst({
      where: {
        scanId,
        farmerId: id,
      },
      include: {
        recommendedProduct: true,
      },
    });

    if (!scan) {
      res.status(404).json({
        message: "Scan not found",
      });
      return;
    }

    res.json(scan);
  } catch (error) {
    console.error("Get farmer scan error:", error);

    res.status(500).json({
      message: "Failed to load scan",
    });
  }
};