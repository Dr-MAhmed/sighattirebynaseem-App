import { 
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./config"

export interface RegisterData {
  email: string
  password: string
  name: string
}

export const registerUser = async (data: RegisterData): Promise<User> => {
  try {
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(
      auth as Auth,
      data.email,
      data.password
    )

    // Update the user's profile with their name
    await updateProfile(userCredential.user, {
      displayName: data.name
    })

    // Store additional user data in Firestore
    const userData = {
      uid: userCredential.user.uid,
      email: data.email,
      displayName: data.name,
      created_at: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: "user",
      isEmailVerified: false,
      phoneNumber: null,
      address: null,
      wishlist: [],
      cart: [],
      orders: [],
      preferences: {
        newsletter: false,
        notifications: true
      }
    };

    await setDoc(doc(db, "users", userCredential.user.uid), userData)

    return userCredential.user
  } catch (error: any) {
    console.error("Registration error:", error);
    // Handle specific Firebase auth errors
    switch (error.code) {
      case "auth/email-already-in-use":
        throw new Error("This email is already registered")
      case "auth/invalid-email":
        throw new Error("Invalid email address")
      case "auth/operation-not-allowed":
        throw new Error("Email/password accounts are not enabled")
      case "auth/weak-password":
        throw new Error("Password is too weak")
      default:
        throw new Error(error.message || "Failed to create account")
    }
  }
}

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth as Auth, provider)
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", result.user.uid))
    
    // If user document doesn't exist, create it
    if (!userDoc.exists()) {
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        created_at: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: "user",
        isEmailVerified: result.user.emailVerified,
        phoneNumber: result.user.phoneNumber,
        address: null,
        wishlist: [],
        cart: [],
        orders: [],
        preferences: {
          newsletter: false,
          notifications: true
        }
      };

      await setDoc(doc(db, "users", result.user.uid), userData)
    } else {
      // Update last login time and user info
      await setDoc(doc(db, "users", result.user.uid), {
        lastLogin: new Date().toISOString(),
        isEmailVerified: result.user.emailVerified,
        photoURL: result.user.photoURL,
        displayName: result.user.displayName,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber
      }, { merge: true })
    }

    return result.user
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    switch (error.code) {
      case "auth/popup-closed-by-user":
        throw new Error("Sign-in popup was closed before completing the sign-in")
      case "auth/cancelled-popup-request":
        throw new Error("Multiple popup requests were made")
      case "auth/popup-blocked":
        throw new Error("Popup was blocked by the browser")
      default:
        throw new Error(error.message || "Failed to sign in with Google")
    }
  }
}

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth as Auth, email, password)
    
    // Update last login time
    await setDoc(doc(db, "users", result.user.uid), {
      lastLogin: new Date().toISOString(),
      isEmailVerified: result.user.emailVerified,
      email: result.user.email,
      displayName: result.user.displayName,
      phoneNumber: result.user.phoneNumber
    }, { merge: true })
    
    return result.user
  } catch (error: any) {
    console.error("Email sign-in error:", error);
    switch (error.code) {
      case "auth/invalid-email":
        throw new Error("Invalid email address")
      case "auth/user-disabled":
        throw new Error("This account has been disabled")
      case "auth/user-not-found":
        throw new Error("No account found with this email")
      case "auth/wrong-password":
        throw new Error("Incorrect password")
      default:
        throw new Error(error.message || "Failed to sign in")
    }
  }
} 