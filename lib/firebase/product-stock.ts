import { db } from "./config";
import { doc, updateDoc, runTransaction } from "firebase/firestore";
import type { ProductType } from "@/types/product";

/**
 * Updates a product's stock quantity in Firestore
 * @param productId The ID of the product to update
 * @param newQuantity The new stock quantity
 * @returns A promise that resolves when the update is complete
 */
export const updateProductStock = async (
  productId: string,
  newQuantity: number
): Promise<void> => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      stock_quantity: newQuantity,
      updated_at: new Date(),
    });
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Decreases a product's stock quantity by the specified amount
 * @param productId The ID of the product
 * @param decreaseBy The amount to decrease the stock by
 * @returns A promise that resolves to true if successful
 */
export const decreaseProductStock = async (
  productId: string,
  decreaseBy: number
): Promise<boolean> => {
  try {
    const productRef = doc(db, "products", productId);

    // Use a transaction to ensure we don't go below zero or encounter race conditions
    return await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        console.error(`Product ${productId} not found`);
        return false;
      }

      const productData = productDoc.data() as ProductType;
      const currentStock = productData.stock_quantity || 0;

      // Ensure we don't go below 0
      const newStock = Math.max(0, currentStock - decreaseBy);

      transaction.update(productRef, {
        stock_quantity: newStock,
        updated_at: new Date(),
      });

      return true;
    });
  } catch (error) {
    console.error(`Error decreasing stock for product ${productId}:`, error);
    return false;
  }
};

/**
 * Updates stock quantities for multiple products at once
 * @param items Array of {productId, quantity} pairs
 * @returns A promise that resolves when all updates are complete
 */
export const updateMultipleProductStocks = async (
  items: Array<{ productId: string; quantity: number }>
): Promise<void> => {
  try {
    // Process all updates in parallel
    await Promise.all(
      items.map(async (item) => {
        try {
          await decreaseProductStock(item.productId, item.quantity);
        } catch (error) {
          console.error(
            `Error updating stock for product ${item.productId}:`,
            error
          );
          // Continue with other updates even if one fails
        }
      })
    );
  } catch (error) {
    console.error("Error updating multiple product stocks:", error);
    throw error;
  }
};
