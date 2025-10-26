import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useProductViewers(productId: string) {
  const [viewerCount, setViewerCount] = useState<number>(0);
  
  useEffect(() => {
    if (!productId) return;
    
    // Generate a unique viewer ID for this browser/device
    // This ensures the same user isn't counted multiple times
    const getOrCreateViewerId = () => {
      const storageKey = 'product_viewer_id';
      let viewerId = localStorage.getItem(storageKey);
      
      if (!viewerId) {
        viewerId = `viewer_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(storageKey, viewerId);
      }
      
      return viewerId;
    };
    
    const viewerId = getOrCreateViewerId();
    
    // Reference to the product viewers document
    const viewersRef = doc(db, 'product_viewers', productId);
    
    // Add this viewer to the product
    const addViewer = async () => {
      try {
        // Check if the document exists
        const docSnap = await getDoc(viewersRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentViewers = data.viewers || {};
          
          // Only update if this viewer isn't already counted
          if (!currentViewers[viewerId]) {
            await updateDoc(viewersRef, {
              [`viewers.${viewerId}`]: Date.now(),
              // Set total count directly based on viewers object size
              total_count: Object.keys(currentViewers).length + 1
            });
          }
        } else {
          // Create new document
          await setDoc(viewersRef, {
            viewers: { [viewerId]: Date.now() },
            total_count: 1
          });
        }
      } catch (error) {
        console.error('Error adding viewer:', error);
      }
    };
    
    // Remove this viewer when they leave
    const removeViewer = async () => {
      try {
        const docSnap = await getDoc(viewersRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedViewers = { ...data.viewers };
          
          // Remove this viewer
          delete updatedViewers[viewerId];
          
          // Update the document with accurate count
          await updateDoc(viewersRef, {
            viewers: updatedViewers,
            total_count: Object.keys(updatedViewers).length
          });
        }
      } catch (error) {
        console.error('Error removing viewer:', error);
      }
    };
    
    // Clean up stale viewers (older than 5 minutes)
    const cleanupStaleViewers = async () => {
      try {
        const docSnap = await getDoc(viewersRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentViewers = data.viewers || {};
          const now = Date.now();
          const fiveMinutesAgo = now - 5 * 60 * 1000; // 5 minutes in milliseconds
          let updated = false;
          const updatedViewers = { ...currentViewers };
          
          // Remove viewers that haven't been active for 5 minutes
          Object.entries(currentViewers).forEach(([id, timestamp]) => {
            if ((timestamp as number) < fiveMinutesAgo) {
              delete updatedViewers[id];
              updated = true;
            }
          });
          
          // Only update if we removed stale viewers
          if (updated) {
            await updateDoc(viewersRef, {
              viewers: updatedViewers,
              total_count: Object.keys(updatedViewers).length
            });
          }
        }
      } catch (error) {
        console.error('Error cleaning up stale viewers:', error);
      }
    };
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(viewersRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Calculate count directly from viewers object to ensure accuracy
        const viewers = data.viewers || {};
        const count = Object.keys(viewers).length;
        
        // Update local state with accurate count
        setViewerCount(count);
      }
    });
    
    // Add viewer on mount and clean up stale viewers
    addViewer();
    cleanupStaleViewers();
    
    // Set up heartbeat to keep this viewer active
    const heartbeatInterval = setInterval(() => {
      updateDoc(viewersRef, {
        [`viewers.${viewerId}`]: Date.now()
      }).catch(err => console.error('Error updating heartbeat:', err));
    }, 30000); // Every 30 seconds
    
    // Clean up on unmount
    return () => {
      removeViewer();
      unsubscribe();
      clearInterval(heartbeatInterval);
    };
  }, [productId]);
  
  return viewerCount;
} 