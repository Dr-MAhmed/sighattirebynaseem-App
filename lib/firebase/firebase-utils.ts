import { db, storage } from "./config"
import { doc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Helper function to safely perform Firestore operations
export async function safeFirestoreOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  errorMessage: string,
): Promise<T> {
  try {
    // Check if Firestore is properly initialized
    if (!db || typeof db.collection !== "function") {
      console.warn("Firestore not properly initialized, using mock behavior")
      return fallbackValue
    }

    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    return fallbackValue
  }
}

// Helper function to safely perform Storage operations
export async function safeStorageOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  errorMessage: string,
): Promise<T> {
  try {
    // Check if Storage is properly initialized
    if (!storage || typeof storage.ref !== "function") {
      console.warn("Firebase Storage not properly initialized, using mock behavior")
      return fallbackValue
    }

    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    return fallbackValue
  }
}

// Example usage for uploading an image
export async function uploadImage(file: File, path: string): Promise<string> {
  return safeStorageOperation(
    async () => {
      const storageRef = ref(storage, path)
      const snapshot = await uploadBytes(storageRef, file)
      return getDownloadURL(snapshot.ref)
    },
    "/placeholder.svg?height=400&width=400", // Fallback URL
    "Error uploading image:",
  )
}

// Example usage for getting a document
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  return safeFirestoreOperation(
    async () => {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data() as T
      }
      return null
    },
    null,
    `Error getting document from ${collectionName}:`,
  )
}
