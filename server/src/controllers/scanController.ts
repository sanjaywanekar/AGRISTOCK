import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import FormData from "form-data";
import { uploadToCloudinary } from "../config/cloudinary";

const prisma = new PrismaClient();

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://localhost:8000";

export const createScan = async (req: Request, res: Response) => {
  try {
    // --------------------------------------------------
    // CHECK FILE
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    // --------------------------------------------------
    // CHECK AUTHENTICATION
    // --------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const farmerId = req.user.userId;

    // --------------------------------------------------
    // SAVE IMAGE PATH
    // --------------------------------------------------

    const uploadedImage = await uploadToCloudinary(
  req.file.buffer,
  "agristock/scans"
);

const imageUrl = uploadedImage.secure_url;

    // --------------------------------------------------
    // CREATE INITIAL SCAN RECORD
    // --------------------------------------------------

    const scan = await prisma.scanResults.create({
      data: {
        farmerId,
        imageUrl,
        predictedLabel: null,
        confidence: null,
        recommendedProductId: null,
      },
    });

    // --------------------------------------------------
    // SEND IMAGE TO FASTAPI
    // --------------------------------------------------

    console.log("Sending image to ML service...");

    const form = new FormData();

    form.append("file", req.file.buffer, {
  filename: req.file.originalname || "leaf-image.jpg",
  contentType: req.file.mimetype,
});

    

const maxAttempts = 3;
let mlResponse;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const retryForm = new FormData();

  retryForm.append("file", req.file.buffer, {
    filename: req.file.originalname || "leaf-image.jpg",
    contentType: req.file.mimetype,
  });

  try {
    console.log(
      `Calling ML service (attempt ${attempt}/${maxAttempts})...`
    );

    mlResponse = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      retryForm,
      {
        headers: { ...retryForm.getHeaders() },
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );

    break;
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    const isTransient =
      axios.isAxiosError(error) &&
      (
        !error.response ||
        [429, 502, 503, 504].includes(status ?? 0)
      );

    if (!isTransient || attempt === maxAttempts) {
      throw error;
    }

    // Give Render's free ML service time to wake up.
    const delayMs = status === 429 ? 60000 : 10000 * attempt;

    console.warn(
      `ML service temporarily unavailable (status: ${status ?? "network error"}). ` +
      `Retrying in ${delayMs / 1000} seconds...`
    );

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

if (!mlResponse) {
  throw new Error("ML service did not return a response after retries");
}



    const {
      label,
      confidence,
      accepted,
    } = mlResponse.data;

    console.log("ML result:", {
      label,
      confidence,
      accepted,
    });

    // --------------------------------------------------
    // IF CONFIDENCE IS TOO LOW
    // --------------------------------------------------

    if (!accepted) {
      const updatedScan = await prisma.scanResults.update({
        where: {
          scanId: scan.scanId,
        },
        data: {
          predictedLabel: null,
          confidence: confidence,
          recommendedProductId: null,
        },
      });

      return res.status(201).json({
        ...updatedScan,
        recommendationAvailable: false,
        message:
          "The AI could not confidently identify the nutrient condition. Please upload a clearer leaf image.",
      });
    }

    // --------------------------------------------------
// HANDLE HEALTHY LEAF
// --------------------------------------------------

if (label === "Healthy") {
  const updatedScan = await prisma.scanResults.update({
    where: {
      scanId: scan.scanId,
    },
    data: {
      predictedLabel: label,
      confidence: confidence,
      recommendedProductId: null,
    },
  });

  return res.status(201).json({
    ...updatedScan,
    recommendationAvailable: false,
    recommendedProduct: null,
    healthy: true,
    message:
      "The leaf appears healthy. No nutrient-deficiency fertilizer is recommended.",
  });
}

// --------------------------------------------------
// FIND MATCHING FERTILIZER
// --------------------------------------------------

const product = await prisma.products.findFirst({
  where: {
    targetCondition: label,
    stockQuantity: {
      gt: 0,
    },
  },
  orderBy: {
    stockQuantity: "desc",
  },
});

    // --------------------------------------------------
    // UPDATE SCAN WITH AI RESULT
    // --------------------------------------------------

    const updatedScan = await prisma.scanResults.update({
      where: {
        scanId: scan.scanId,
      },
      data: {
        predictedLabel: label,
        confidence: confidence,
        recommendedProductId: product
          ? product.productId
          : null,
      },
    });

    // --------------------------------------------------
    // RETURN RESULT
    // --------------------------------------------------

    return res.status(201).json({
      ...updatedScan,

      recommendationAvailable: !!product,

      recommendedProduct: product
  ? {
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      rating: product.rating,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      targetCondition: product.targetCondition,
      dosage: product.dosage,
      applicationMethod: product.applicationMethod,
    }
  : null,

      message: product
        ? "Scan analyzed successfully and fertilizer recommendation found."
        : "Scan analyzed successfully, but no matching fertilizer is currently in stock.",
    });

  } catch (error) {
    console.error("Create scan error:", error);

    return res.status(500).json({
      message: "Failed to analyze scan",
    });
  }
};


// ======================================================
// GET SCAN HISTORY
// ======================================================

// ======================================================
// GET SCAN HISTORY
// ======================================================

export const getScans = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const scans = await prisma.scanResults.findMany({
      where: {
        farmerId: req.user.userId,
      },
      include: {
        recommendedProduct: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all recommended products for these scans
    const productIds = scans
      .map((scan) => scan.recommendedProductId)
      .filter((id): id is string => id !== null);

    const products = await prisma.products.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
    });

    // Attach product information to each scan
    const scansWithProducts = scans.map((scan) => {
      const product = scan.recommendedProductId
        ? products.find(
            (p) => p.productId === scan.recommendedProductId
          )
        : null;

      return {
        ...scan,

        recommendationAvailable: !!product,

        recommendedProduct: product
  ? {
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      rating: product.rating,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl,
      targetCondition: product.targetCondition,
      dosage: product.dosage,
      applicationMethod: product.applicationMethod,
    }
  : null,
      };
    });

    return res.status(200).json(scansWithProducts);
  } catch (error) {
    console.error("Get scans error:", error);

    return res.status(500).json({
      message: "Failed to fetch scans",
    });
  }
};
