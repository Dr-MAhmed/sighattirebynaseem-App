import { storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// Cache for download URLs
const urlCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const IMAGE_LOAD_TIMEOUT = 15000; // 15 seconds timeout for image loading

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await delay(delayMs);
    return retryOperation(operation, retries - 1, delayMs * 2);
  }
}

async function getCachedDownloadURL(path: string): Promise<string> {
  const cached = urlCache.get(path);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }

  try {
    const storageRef = ref(storage, path);
    const url = await retryOperation(() => getDownloadURL(storageRef));
    urlCache.set(path, { url, timestamp: now });
    return url;
  } catch (error) {
    console.error(`Error getting download URL for ${path}:`, error);
    // Return a placeholder URL if we can't get the actual URL
    return "/placeholder.svg?height=400&width=400";
  }
}

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  try {
    // Create a unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Create a reference to the file location
    const storageRef = ref(storage, `products/${productId}/${fileName}`);

    // Upload the file with retry
    await retryOperation(() => uploadBytes(storageRef, file));

    // Get the download URL with caching
    const downloadURL = await getCachedDownloadURL(
      `products/${productId}/${fileName}`
    );

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function uploadMultipleProductImages(
  files: File[],
  productId: string
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadProductImage(file, productId)
  );
  return Promise.all(uploadPromises);
}

// Function to get a fresh URL for an existing image with retry
export async function refreshImageUrl(path: string): Promise<string> {
  try {
    // If the path is a full URL, extract the storage path
    if (path.includes("firebasestorage.googleapis.com")) {
      const storagePath = path.split("/o/")[1]?.split("?")[0];
      if (storagePath) {
        path = decodeURIComponent(storagePath);
      }
    }

    // Get a fresh URL from Firebase Storage
    const storageRef = ref(storage, path);
    const url = await retryOperation(() => getDownloadURL(storageRef));
    return url;
  } catch (error) {
    console.error("Error refreshing image URL:", error);
    return "/placeholder.svg?height=400&width=400";
  }
}

// Function to preload an image with timeout and retry
export async function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const MAX_IMAGE_RETRIES = 3;

    const cleanup = () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };

    const tryLoadImage = async () => {
      cleanup();

      timeoutId = setTimeout(() => {
        cleanup();
        if (retryCount < MAX_IMAGE_RETRIES) {
          retryCount++;
          console.log(
            `Retrying image load (${retryCount}/${MAX_IMAGE_RETRIES}): ${url}`
          );
          tryLoadImage();
        } else {
          reject(
            new Error(
              `Image load timeout after ${MAX_IMAGE_RETRIES} retries: ${url}`
            )
          );
        }
      }, IMAGE_LOAD_TIMEOUT);

      // Add crossOrigin attribute for Firebase Storage URLs
      if (url.includes("firebasestorage.googleapis.com")) {
        img.crossOrigin = "anonymous";
      }

      img.onload = () => {
        cleanup();
        resolve();
      };

      img.onerror = async () => {
        cleanup();
        // If the image fails to load, try to refresh the URL
        try {
          if (url.includes("firebasestorage.googleapis.com")) {
            const path = url.split("/o/")[1]?.split("?")[0];
            if (path) {
              const decodedPath = decodeURIComponent(path);
              // Get a fresh URL from Firebase Storage
              const storageRef = ref(storage, decodedPath);
              const newUrl = await retryOperation(() =>
                getDownloadURL(storageRef)
              );
              if (newUrl !== url) {
                // Try loading with the new URL
                return preloadImage(newUrl);
              }
            }
          }
        } catch (error) {
          console.error("Error refreshing image URL:", error);
        }

        if (retryCount < MAX_IMAGE_RETRIES) {
          retryCount++;
          console.log(
            `Retrying image load after error (${retryCount}/${MAX_IMAGE_RETRIES}): ${url}`
          );
          tryLoadImage();
        } else {
          reject(
            new Error(
              `Failed to preload image after ${MAX_IMAGE_RETRIES} retries: ${url}`
            )
          );
        }
      };

      img.src = url;
    };

    tryLoadImage();
  });
}
