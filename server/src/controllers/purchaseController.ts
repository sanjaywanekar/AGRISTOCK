import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPurchase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      productId,
      quantity,
      unitCost,
    } = req.body;

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!productId || !quantity || !unitCost) {
      res.status(400).json({
        message:
          "productId, quantity and unitCost are required",
      });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({
        message: "Quantity must be greater than 0",
      });
      return;
    }

    if (unitCost <= 0) {
      res.status(400).json({
        message: "Unit cost must be greater than 0",
      });
      return;
    }

    const industrialistId = req.user.userId;

    // Only allow the logged-in industrialist to purchase
    // against their own product.
    const product = await prisma.products.findFirst({
      where: {
        productId,
        industrialistId,
      },
    });

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    const totalCost = quantity * unitCost;

    const result = await prisma.$transaction(
      async (tx) => {
        const purchase =
          await tx.purchases.create({
            data: {
              purchaseId: crypto.randomUUID(),
              industrialistId,
              productId,
              timestamp: new Date(),
              quantity,
              unitCost,
              totalCost,
            },
          });

        const updatedProduct =
          await tx.products.update({
            where: {
              productId,
            },
            data: {
              stockQuantity: {
                increment: quantity,
              },
            },
          });

        return {
          purchase,
          updatedProduct,
        };
      }
    );

    res.status(201).json({
      message: "Purchase created successfully",
      purchase: result.purchase,
      updatedStock:
        result.updatedProduct.stockQuantity,
    });
  } catch (error) {
    console.error(
      "Create purchase error:",
      error
    );

    res.status(500).json({
      message: "Error creating purchase",
    });
  }
};

export const getPurchases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const where: any = {};

    if (req.user?.role === "INDUSTRIALIST") {
      where.industrialistId = req.user.userId;
    }

    const purchases =
      await prisma.purchases.findMany({
        where,
        include: {
          product: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

    res.status(200).json(purchases);
  } catch (error) {
    console.error(
      "Get purchases error:",
      error
    );

    res.status(500).json({
      message: "Error retrieving purchases",
    });
  }
};