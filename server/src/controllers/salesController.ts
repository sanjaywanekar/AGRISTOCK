import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSale = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      productId,
      quantity,
      unitPrice,
    } = req.body;

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!productId || !quantity || !unitPrice) {
      res.status(400).json({
        message:
          "productId, quantity and unitPrice are required",
      });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({
        message: "Quantity must be greater than 0",
      });
      return;
    }

    const industrialistId = req.user.userId;

    // Only allow the logged-in industrialist to sell
    // their own product.
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

    if (product.stockQuantity < quantity) {
      res.status(400).json({
        message: "Insufficient stock",
        availableStock:
          product.stockQuantity,
      });
      return;
    }

    if (unitPrice <= 0) {
      res.status(400).json({
        message: "Unit price must be greater than 0",
      });
      return;
    }

    const totalAmount =
      quantity * unitPrice;

    const result = await prisma.$transaction(
      async (tx) => {
        const sale =
          await tx.sales.create({
            data: {
              saleId: crypto.randomUUID(),
              industrialistId,
              productId,
              timestamp: new Date(),
              quantity,
              unitPrice,
              totalAmount,
            },
          });

        const updatedProduct =
          await tx.products.update({
            where: {
              productId,
            },
            data: {
              stockQuantity: {
                decrement: quantity,
              },
            },
          });

        return {
          sale,
          updatedProduct,
        };
      }
    );

    res.status(201).json({
      message: "Sale created successfully",
      sale: result.sale,
      remainingStock:
        result.updatedProduct.stockQuantity,
    });
  } catch (error) {
    console.error(
      "Create sale error:",
      error
    );

    res.status(500).json({
      message: "Error creating sale",
    });
  }
};

export const getSales = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const where: any = {};

    if (req.user?.role === "INDUSTRIALIST") {
      where.industrialistId = req.user.userId;
    }

    const sales =
      await prisma.sales.findMany({
        where,
        include: {
          product: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

    res.status(200).json(sales);
  } catch (error) {
    console.error(
      "Get sales error:",
      error
    );

    res.status(500).json({
      message: "Error retrieving sales",
    });
  }
};