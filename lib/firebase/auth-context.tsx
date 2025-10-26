"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import { auth } from "./config";
import { registerUser, signInWithGoogle as googleSignIn } from "./auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(
      auth as Auth,
      email,
      password
    );
    return result.user;
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log("Starting signup process...");
      const user = await registerUser({ email, password, name });
      console.log("User created successfully:", user.uid);

      // Sign out the user after registration
      await signOut(auth as Auth);
      console.log("User signed out after registration");

      return user;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const user = await googleSignIn();
      return user;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const logOut = async () => {
    await signOut(auth as Auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, logOut, signInWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
