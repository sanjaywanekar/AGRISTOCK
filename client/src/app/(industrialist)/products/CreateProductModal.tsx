
"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { v4 } from "uuid";
import Header from "@/app/(components)/Header";

export type ProductFormData = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
  image?: File;
  description: string;
  brand: string;
  targetCondition: string;
  targetCrops: string;
  dosage: string;
  applicationMethod: string;
  packageSize: number;
  packageUnit: string;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void | Promise<void>;
};

const initialFormData = (): ProductFormData => ({
  productId: v4(),
  name: "",
  price: 0,
  stockQuantity: 0,
  rating: 0,
  description: "",
  brand: "",
  targetCondition: "",
  targetCrops: "",
  dosage: "",
  applicationMethod: "",
  packageSize: 0,
  packageUnit: "kg",
});

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const numericFields = [
      "price",
      "stockQuantity",
      "rating",
      "packageSize",
    ];

    setFormData((previous) => ({
      ...previous,
      [name]: numericFields.includes(name)
        ? value === ""
          ? 0
          : Number(value)
        : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be 10 MB or less.");
      e.target.value = "";
      return;
    }

    setFormData((previous) => ({ ...previous, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.price <= 0) {
      alert("Package price must be greater than zero.");
      return;
    }

    if (formData.stockQuantity < 0 || !Number.isInteger(formData.stockQuantity)) {
      alert("Stock quantity must be a non-negative whole number.");
      return;
    }

    if (formData.packageSize <= 0) {
      alert("Package size must be greater than zero.");
      return;
    }

    if (formData.rating < 0 || formData.rating > 5) {
      alert("Rating must be between 0 and 5.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate(formData);
      setFormData(initialFormData());
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Could not create the product. Please check the server and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700 mb-1";
  const inputCssStyles =
    "block w-full mb-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-gray-600 bg-opacity-50 p-4">
      <div className="relative mx-auto my-8 w-full max-w-2xl rounded-md border bg-white p-5 shadow-lg">
        <Header name="Create New Product" />

        <form onSubmit={handleSubmit} className="mt-5">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Product Information
          </h3>

          <label htmlFor="name" className={labelCssStyles}>
            Product Name *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="e.g. Urea Nitrogen Fertilizer"
            value={formData.name}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          <label htmlFor="brand" className={labelCssStyles}>
            Brand / Manufacturer
          </label>
          <input
            id="brand"
            type="text"
            name="brand"
            placeholder="Enter brand or manufacturer"
            value={formData.brand}
            onChange={handleChange}
            className={inputCssStyles}
          />

          <label htmlFor="description" className={labelCssStyles}>
            Product Description / Main Use
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the fertilizer and its intended use"
            value={formData.description}
            onChange={handleChange}
            className={inputCssStyles}
            rows={3}
          />

          <label htmlFor="productImage" className={labelCssStyles}>
            Fertilizer Image
          </label>
          <input
            id="productImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-3 block w-full text-sm"
          />

          {imagePreview && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Image Preview
              </p>
              <img
                src={imagePreview}
                alt="Fertilizer preview"
                className="h-40 w-full rounded-md border bg-gray-50 object-contain"
              />
            </div>
          )}

          <hr className="my-5" />

          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Agricultural Use & Recommendations
          </h3>

          <label htmlFor="targetCondition" className={labelCssStyles}>
            Target Nutrient / Deficiency *
          </label>
          <select
            id="targetCondition"
            name="targetCondition"
            value={formData.targetCondition}
            onChange={handleChange}
            className={inputCssStyles}
            required
          >
            <option value="">Select target deficiency</option>
            <option value="Nitrogen">Nitrogen (N) deficiency</option>
            <option value="Phosphorus">Phosphorus (P) deficiency</option>
            <option value="Potassium">Potassium (K) deficiency</option>
            <option value="Micronutrients">Micronutrient deficiency</option>
            <option value="Multiple Nutrients">Multiple nutrient deficiencies</option>
            <option value="General Nutrition">General plant nutrition</option>
            <option value="Other">Other / specify in description</option>
          </select>

          <label htmlFor="targetCrops" className={labelCssStyles}>
            Suitable Crops
          </label>
          <input
            id="targetCrops"
            type="text"
            name="targetCrops"
            placeholder="e.g. Wheat, rice, cotton"
            value={formData.targetCrops}
            onChange={handleChange}
            className={inputCssStyles}
          />
          <p className="-mt-3 mb-4 text-xs text-gray-500">
            Separate crop names with commas.
          </p>

          <label htmlFor="dosage" className={labelCssStyles}>
            Recommended Dosage
          </label>
          <input
            id="dosage"
            type="text"
            name="dosage"
            placeholder="e.g. 45–50 kg/hectare"
            value={formData.dosage}
            onChange={handleChange}
            className={inputCssStyles}
          />

          <label htmlFor="applicationMethod" className={labelCssStyles}>
            Application Method
          </label>
          <select
            id="applicationMethod"
            name="applicationMethod"
            value={formData.applicationMethod}
            onChange={handleChange}
            className={inputCssStyles}
          >
            <option value="">Select application method</option>
            <option value="Soil application">Soil application</option>
            <option value="Foliar spray">Foliar spray</option>
            <option value="Fertigation">Fertigation</option>
            <option value="Seed treatment">Seed treatment</option>
            <option value="Other">Other</option>
          </select>

          <hr className="my-5" />

          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            Packaging, Pricing & Stock
          </h3>

          <label htmlFor="packageSize" className={labelCssStyles}>
            Quantity per Package *
          </label>
          <input
            id="packageSize"
            type="number"
            name="packageSize"
            min="0.001"
            step="any"
            placeholder="e.g. 50"
            value={formData.packageSize || ""}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          <label htmlFor="packageUnit" className={labelCssStyles}>
            Package Unit *
          </label>
          <select
            id="packageUnit"
            name="packageUnit"
            value={formData.packageUnit}
            onChange={handleChange}
            className={inputCssStyles}
            required
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="litre">Litres (L)</option>
            <option value="ml">Millilitres (mL)</option>
            <option value="bag">Bag (size not convertible)</option>
            <option value="packet">Packet (size not convertible)</option>
            <option value="bottle">Bottle (size not convertible)</option>
          </select>

          <label htmlFor="price" className={labelCssStyles}>
            Price per Package (₹) *
          </label>
          <input
            id="price"
            type="number"
            name="price"
            min="0.01"
            step="0.01"
            placeholder="e.g. 650"
            value={formData.price || ""}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          {formData.packageSize > 0 &&
            formData.price > 0 &&
            ["kg", "g", "litre", "ml"].includes(formData.packageUnit) && (
              <p className="-mt-3 mb-4 text-sm text-blue-700">
                Approximate price per {formData.packageUnit === "g"
                  ? "kg"
                  : formData.packageUnit === "ml"
                    ? "litre"
                    : formData.packageUnit}
                : ₹
                {(
                  formData.price /
                  (formData.packageUnit === "g" ||
                  formData.packageUnit === "ml"
                    ? formData.packageSize / 1000
                    : formData.packageSize)
                ).toFixed(2)}
              </p>
            )}

          <label htmlFor="stockQuantity" className={labelCssStyles}>
            Number of Packages in Stock *
          </label>
          <input
            id="stockQuantity"
            type="number"
            name="stockQuantity"
            min="0"
            step="1"
            placeholder="e.g. 54 bags"
            value={formData.stockQuantity}
            onChange={handleChange}
            className={inputCssStyles}
            required
          />

          <label htmlFor="rating" className={labelCssStyles}>
            Rating (0–5)
          </label>
          <input
            id="rating"
            type="number"
            name="rating"
            min="0"
            max="5"
            step="0.1"
            placeholder="e.g. 4.5"
            value={formData.rating}
            onChange={handleChange}
            className={inputCssStyles}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>

            <button
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
