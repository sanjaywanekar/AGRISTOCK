
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();

    const where: any = {};

    // Industrialists only see their own products.
    if (req.user?.role === "INDUSTRIALIST") {
      where.industrialistId = req.user.userId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const products = await prisma.products.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      message: "Error retrieving products",
    });
  }
};

export const createProduct = async (
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

    const {
      productId,
      name,
      description,
      brand,
      targetCondition,
      targetCrops,
      applicationMethod,
      dosage,
      packageUnit,
    } = req.body;

    const price = Number(req.body.price);
    const stockQuantity = Number(req.body.stockQuantity);
    const rating =
      req.body.rating === undefined || req.body.rating === ""
        ? 0
        : Number(req.body.rating);

    const packageSize =
      req.body.packageSize === undefined || req.body.packageSize === ""
        ? null
        : Number(req.body.packageSize);

    // Validate required product fields.
    if (
      typeof productId !== "string" ||
      !productId.trim() ||
      typeof name !== "string" ||
      !name.trim() ||
      req.body.price === undefined ||
      req.body.price === "" ||
      !Number.isFinite(price) ||
      price <= 0 ||
      req.body.stockQuantity === undefined ||
      req.body.stockQuantity === "" ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      res.status(400).json({
        message:
          "Valid productId, name, positive price and non-negative whole-number stockQuantity are required",
      });
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      res.status(400).json({
        message: "Rating must be between 0 and 5",
      });
      return;
    }

    if (
      packageSize !== null &&
      (!Number.isFinite(packageSize) || packageSize <= 0)
    ) {
      res.status(400).json({
        message: "Package size must be greater than zero",
      });
      return;
    }

    // Package size and unit must be supplied together.
    if (
      (packageSize === null && packageUnit) ||
      (packageSize !== null && !packageUnit)
    ) {
      res.status(400).json({
        message: "Provide both package size and package unit",
      });
      return;
    }

    const allowedUnits = [
      "kg",
      "g",
      "litre",
      "ml",
      "bag",
      "packet",
      "bottle",
    ];

    if (packageUnit && !allowedUnits.includes(packageUnit)) {
      res.status(400).json({
        message: "Invalid package unit",
      });
      return;
    }

    // Industrialist owns the product being created.
    const industrialistId = req.user.userId;

    // Preserve the existing image-upload behavior.
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const product = await prisma.products.create({
      data: {
        productId: productId.trim(),
        industrialistId,
        name: name.trim(),
        price,
        rating,
        stockQuantity,
        imageUrl,

        // Fertilizer details.
        description: description?.trim() || null,
        brand: brand?.trim() || null,
        targetCondition: targetCondition?.trim() || null,
        targetCrops: targetCrops?.trim() || null,
        applicationMethod: applicationMethod?.trim() || null,
        dosage: dosage?.trim() || null,

        // Packaging details.
        packageSize,
        packageUnit: packageUnit || null,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Error creating product",
    });
  }
};


export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { productId } = req.params;
    const industrialistId = req.user.userId;

    const existing = await prisma.products.findFirst({
      where: {
        productId,
        ...(req.user.role === "ADMIN" ? {} : { industrialistId }),
      },
    });

    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const data: any = {};

    if (req.body.name !== undefined) {
      if (
        typeof req.body.name !== "string" ||
        !req.body.name.trim()
      ) {
        res.status(400).json({ message: "Product name is required" });
        return;
      }
      data.name = req.body.name.trim();
    }

    if (req.body.price !== undefined && req.body.price !== "") {
      const price = Number(req.body.price);
      if (!Number.isFinite(price) || price <= 0) {
        res.status(400).json({ message: "Price must be greater than zero" });
        return;
      }
      data.price = price;
    }

    if (req.body.stockQuantity !== undefined && req.body.stockQuantity !== "") {
      const stockQuantity = Number(req.body.stockQuantity);
      if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
        res.status(400).json({
          message: "Stock must be a non-negative whole number",
        });
        return;
      }
      data.stockQuantity = stockQuantity;
    }

    if (req.body.rating !== undefined && req.body.rating !== "") {
      const rating = Number(req.body.rating);
      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        res.status(400).json({ message: "Rating must be between 0 and 5" });
        return;
      }
      data.rating = rating;
    }

    const textFields = [
      "description",
      "brand",
      "targetCondition",
      "targetCrops",
      "dosage",
      "applicationMethod",
      "packageUnit",
    ] as const;

    for (const field of textFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field].trim() || null;
      }
    }

    
if (req.body.packageSize !== undefined) {
  if (req.body.packageSize === "") {
    data.packageSize = null;
    data.packageUnit = null;
  } else {
    const packageSize = Number(req.body.packageSize);

    if (!Number.isFinite(packageSize) || packageSize <= 0) {
      res.status(400).json({
        message: "Package size must be greater than zero",
      });
      return;
    }

    data.packageSize = packageSize;
  }
}


    const allowedUnits = [
      "kg", "g", "litre", "ml", "bag", "packet", "bottle",
    ];

    const finalPackageSize =
      data.packageSize !== undefined
        ? data.packageSize
        : existing.packageSize;

    const finalPackageUnit =
      data.packageUnit !== undefined
        ? data.packageUnit
        : existing.packageUnit;

    if (
      (finalPackageSize === null && finalPackageUnit) ||
      (finalPackageSize !== null && !finalPackageUnit)
    ) {
      res.status(400).json({
        message: "Provide both package size and package unit",
      });
      return;
    }

    if (finalPackageUnit && !allowedUnits.includes(finalPackageUnit)) {
      res.status(400).json({ message: "Invalid package unit" });
      return;
    }

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.products.update({
      where: { productId },
      data,
    });

    res.status(200).json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { productId } = req.params;

    const product = await prisma.products.findFirst({
      where: {
        productId,
        ...(req.user.role === "ADMIN"
          ? {}
          : { industrialistId: req.user.userId }),
      },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const [salesCount, purchasesCount] = await Promise.all([
      prisma.sales.count({ where: { productId } }),
      prisma.purchases.count({ where: { productId } }),
    ]);

    if (salesCount > 0 || purchasesCount > 0) {
      res.status(409).json({
        message:
          "This product has sales or purchase history and cannot be deleted. You can set its stock to zero instead.",
      });
      return;
    }

    await prisma.products.delete({ where: { productId } });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};
