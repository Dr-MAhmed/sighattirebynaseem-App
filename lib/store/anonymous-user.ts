"use client"

import { useAtom } from "jotai"
import { deviceIdAtom } from "./atoms"
import { useCallback, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "@/lib/firebase/auth-context"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"

export function useAnonymousUser() {
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom)
  const { user } = useAuth()

  // Generate device ID if not exists
  useEffect(() => {
    if (!deviceId) {
      setDeviceId(uuidv4())
    }
  }, [deviceId, setDeviceId])

  // Update user document with device ID when user logs in
  useEffect(() => {
    const updateUserWithDeviceId = async () => {
      if (user && deviceId && db) {
        try {
          const userRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists()) {
            await setDoc(
              userRef,
              {
                ...userDoc.data(),
                device_id: deviceId,
                updated_at: new Date(),
              },
              { merge: true },
            )
          }
        } catch (error) {
          console.error("Error updating user with device ID:", error)
        }
      }
    }

    updateUserWithDeviceId()
  }, [user, deviceId])

  const mergeAnonymousData = useCallback(async () => {
    if (!user || !deviceId || !db) return

    try {
      // Check if there's anonymous cart data
      const anonymousCartRef = doc(db, "carts", deviceId)
      const anonymousCartDoc = await getDoc(anonymousCartRef)

      if (anonymousCartDoc.exists()) {
        const anonymousCartData = anonymousCartDoc.data()

        // Check if user already has a cart
        const userCartRef = doc(db, "carts", user.uid)
        const userCartDoc = await getDoc(userCartRef)

        if (userCartDoc.exists()) {
          // Merge carts
          const userCartData = userCartDoc.data()
          const userItems = userCartData.items || []
          const anonymousItems = anonymousCartData.items || []

          // Simple merge strategy - add anonymous items that don't exist in user cart
          const mergedItems = [...userItems]

          for (const anonymousItem of anonymousItems) {
            const existingItemIndex = userItems.findIndex(
              (item: any) =>
                item.product_id === anonymousItem.product_id &&
                JSON.stringify(item.attributes_selected) === JSON.stringify(anonymousItem.attributes_selected),
            )

            if (existingItemIndex > -1) {
              // Update quantity if item exists
              mergedItems[existingItemIndex].quantity += anonymousItem.quantity
            } else {
              // Add new item
              mergedItems.push(anonymousItem)
            }
          }

          // Update user cart
          await setDoc(userCartRef, {
            user_id: user.uid,
            items: mergedItems,
            updated_at: new Date(),
          })
        } else {
          // User doesn't have a cart, copy anonymous cart
          await setDoc(userCartRef, {
            user_id: user.uid,
            items: anonymousCartData.items || [],
            updated_at: new Date(),
          })
        }

        // Delete anonymous cart after merging
        await deleteDoc(anonymousCartRef)
      }

      // Similar process for wishlist
      const anonymousWishlistRef = doc(db, "wishlists", deviceId)
      const anonymousWishlistDoc = await getDoc(anonymousWishlistRef)

      if (anonymousWishlistDoc.exists()) {
        const anonymousWishlistData = anonymousWishlistDoc.data()

        // Check if user already has a wishlist
        const userWishlistRef = doc(db, "wishlists", user.uid)
        const userWishlistDoc = await getDoc(userWishlistRef)

        if (userWishlistDoc.exists()) {
          // Merge wishlists
          const userWishlistData = userWishlistDoc.data()
          const userItems = userWishlistData.items || []
          const anonymousItems = anonymousWishlistData.items || []

          // Simple merge strategy - add anonymous items that don't exist in user wishlist
          const mergedItems = [...userItems]

          for (const anonymousItem of anonymousItems) {
            const existingItemIndex = userItems.findIndex(
              (item: any) => item.product_id === anonymousItem.product_id,
            )

            if (existingItemIndex === -1) {
              // Add new item
              mergedItems.push(anonymousItem)
            }
          }

          // Update user wishlist
          await setDoc(userWishlistRef, {
            user_id: user.uid,
            items: mergedItems,
            updated_at: new Date(),
          })
        } else {
          // User doesn't have a wishlist, copy anonymous wishlist
          await setDoc(userWishlistRef, {
            user_id: user.uid,
            items: anonymousWishlistData.items || [],
            updated_at: new Date(),
          })
        }

        // Delete anonymous wishlist after merging
        await deleteDoc(anonymousWishlistRef)
      }
    } catch (error) {
      console.error("Error merging anonymous data:", error)
    }
  }, [user, deviceId])

  return {
    deviceId,
    mergeAnonymousData,
  }
}
