import { v4 as uuidv4 } from "uuid";

export interface ProductImage {
  url: string;
  alt_text: string;
  is_default: boolean;
}

export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function processProductImage(file: File): Promise<ProductImage> {
  try {
    // Convert file to base64
    const base64String = await convertFileToBase64(file);

    return {
      url: base64String,
      alt_text: file.name,
      is_default: false,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

export async function processMultipleProductImages(
  files: File[]
): Promise<ProductImage[]> {
  const processPromises = files.map((file) => processProductImage(file));
  const images = await Promise.all(processPromises);

  // Set the first image as default if there are images
  if (images.length > 0) {
    images[0].is_default = true;
  }

  return images;
}
