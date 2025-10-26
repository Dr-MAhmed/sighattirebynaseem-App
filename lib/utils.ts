import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Check if the amount is an integer
  if (amount % 1 === 0) {
    return `Rs. ${amount.toString()}`;
  } else {
    // Format with two decimal places for cents
    return `Rs. ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

// Utility function to validate price consistency
export function validatePriceConsistency(storedPrice: number, currentPrice: number, productName: string): number {
  // If prices differ by more than 1 cent, log a warning
  if (Math.abs(storedPrice - currentPrice) > 0.01) {
    console.warn(`Price inconsistency detected for ${productName}:`, {
      storedPrice: formatCurrency(storedPrice),
      currentPrice: formatCurrency(currentPrice),
      difference: formatCurrency(Math.abs(storedPrice - currentPrice))
    });
  }
  
  // Always return the stored price to maintain consistency
  // Note: We now use original prices consistently across all pages
  return storedPrice;
}
