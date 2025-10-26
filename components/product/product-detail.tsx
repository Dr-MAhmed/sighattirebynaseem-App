"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-actions";
import { useWishlist } from "@/lib/store/wishlist-actions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Heart,
  ShoppingBag,
  Check,
  Minus,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
  ZoomIn,
} from "lucide-react";
import type { ProductType, ReviewType } from "@/types/product";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ReactMarkdown from "react-markdown";
import { refreshImageUrl, preloadImage } from "@/lib/admin/storage-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProductViewers } from "@/hooks/useProductViewers";
import { ViewersToast } from "@/components/ui/viewers-toast";
import { useRouter } from "next/navigation";

interface ProductDetailProps {
  product: ProductType;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  // Add state to force re-renders when discount expires
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to check for expired discounts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Check every 10 seconds for immediate updates

    return () => clearInterval(interval);
  }, []);

  // Helper function to get a valid image URL - moved to top
  const getValidImageUrl = (url: string | undefined) => {
    if (!url || url.trim() === "" || url.includes("undefined")) {
      return "/placeholder.svg?height=400&width=400";
    }
    return url;
  };

  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOrderOptions, setSelectedOrderOptions] = useState<string[]>(
    []
  );
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set()
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTooltipImageFullScreen, setIsTooltipImageFullScreen] =
    useState(false);
  const [selectedTooltipImage, setSelectedTooltipImage] = useState<
    string | null
  >(null);
  const [isModalImageFullScreen, setIsModalImageFullScreen] = useState(false);
  const [selectedModalImage, setSelectedModalImage] = useState<string | null>(
    null
  );
  const [customDesignDetails, setCustomDesignDetails] = useState("");
  const [isCustomDesign, setIsCustomDesign] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [isButtonShaking, setIsButtonShaking] = useState(false);
  const [currentStock, setCurrentStock] = useState(product.stock_quantity || 0);

  // Add state for category name and slug
  const [categoryName, setCategoryName] = useState<string>(
    product.category || "Category"
  );
  const [categorySlug, setCategorySlug] = useState<string>(
    product.category_slug || ""
  );

  // Fetch category name and slug if not available
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!product.category && product.category_id) {
        try {
          const categoryDoc = await getDoc(
            doc(db, "categories", product.category_id)
          );
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            setCategoryName(categoryData.name);
            setCategorySlug(categoryData.slug);
          }
        } catch (error) {
          console.error("Error fetching category:", error);
        }
      }
    };

    fetchCategoryInfo();
  }, [product.category, product.category_id, product.category_slug]);

  // Add the product viewers hook
  const viewerCount = useProductViewers(product.productId || "");
  const [prevViewerCount, setPrevViewerCount] = useState(0);

  // Safely check if product is in wishlist
  const isInWishlist =
    wishlistItems?.some((item) => item.product_id === product.productId) ||
    false;

  const router = useRouter();

  const handleAttributeChange = (attributeName: string, value: string) => {
    if (value === "Custom Design") {
      setIsCustomDesign(true);
    } else {
      setIsCustomDesign(false);
    }
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  const handleOrderOptionToggle = (value: string) => {
    setSelectedOrderOptions((prev) => {
      // If the value is one of the first two options
      if (
        value === product.attributes.order[0] ||
        value === product.attributes.order[1]
      ) {
        // If clicking the currently selected option, deselect it
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        }
        // If selecting a new option from first two, replace any existing first two option
        const filtered = prev.filter(
          (v) =>
            v !== product.attributes.order[0] &&
            v !== product.attributes.order[1]
        );
        return [...filtered, value];
      }
      // If the value is one of the last two options
      if (
        value === product.attributes.order[2] ||
        value === product.attributes.order[3]
      ) {
        // If clicking the currently selected option, deselect it
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        }
        // If selecting a new option from last two, replace any existing last two option
        const filtered = prev.filter(
          (v) =>
            v !== product.attributes.order[2] &&
            v !== product.attributes.order[3]
        );
        return [...filtered, value];
      }
      // For other options, maintain the existing behavior
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else if (prev.length < 2) {
        return [...prev, value];
      }
      return prev;
    });
  };

  // Add validation function
  const validateRequiredOptions = () => {
    const errors: Record<string, boolean> = {};
    let hasErrors = false;

    // Check if all required attributes are selected
    if (product.attributes) {
      Object.entries(product.attributes).forEach(([attributeName, values]) => {
        // Special handling for size - it's always required
        if (attributeName.toLowerCase().includes('size')) {
          if (!selectedAttributes[attributeName]) {
            errors[attributeName] = true;
            hasErrors = true;
          }
        } 
        // Special handling for order options - check both groups separately
        else if (attributeName === 'order') {
          const orderOptions = product.attributes.order;
          if (orderOptions && orderOptions.length >= 4) {
            // Check if first group (first 2 options) is selected
            const firstGroupSelected = selectedOrderOptions.some(option => 
              option === orderOptions[0] || option === orderOptions[1]
            );
            if (!firstGroupSelected) {
              errors["order_first_group"] = true;
              hasErrors = true;
            }
            
            // Check if second group (last 2 options) is selected
            const secondGroupSelected = selectedOrderOptions.some(option => 
              option === orderOptions[2] || option === orderOptions[3]
            );
            if (!secondGroupSelected) {
              errors["order_second_group"] = true;
              hasErrors = true;
            }
          } else {
            // Fallback for cases with less than 4 options
            if (selectedOrderOptions.length === 0) {
              errors[attributeName] = true;
              hasErrors = true;
            }
          }
        }
        // Remove validation for other attributes
      });
    }

    setValidationErrors(errors);
    return !hasErrors;
  };

  const handleAddToCart = () => {
    try {
      if (!product.productId) return;

      // Validate required options
      if (!validateRequiredOptions()) {
        setIsButtonShaking(true);
        setTimeout(() => {
          setIsButtonShaking(false);
        }, 500);
        return;
      }

      // Check if requested quantity is available
      if (quantity > currentStock) {
        toast.error(`Only ${currentStock} items available in stock.`, {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      // Merge all selected attributes (size, color, order, etc.)
      const allSelectedAttributes = {
        ...selectedAttributes,
        ...(selectedOrderOptions.length > 0 ? { Order: selectedOrderOptions.join(", ") } : {}),
        ...(isCustomDesign && customDesignDetails ? { "Custom Design": customDesignDetails } : {})
      };

      addToCart(
        product.productId,
        product,
        quantity,
        allSelectedAttributes
      );

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);

      toast.success("Added to cart!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleWishlistToggle = () => {
    try {
      if (!product.productId) return;
      if (isInWishlist) {
        removeFromWishlist(product.productId);
      } else {
        addToWishlist(product.productId!, product);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("There was a problem updating your wishlist.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > currentStock) return;
    setQuantity(newQuantity);
  };

  // Ensure we have images array with valid URLs
  const images =
    product.images?.filter((img) => img.url && img.url.trim() !== "") || [];

  // If no valid images, add a placeholder
  if (images.length === 0) {
    images.push({
      url: "/placeholder.svg?height=600&width=600",
      alt_text: product.name || "Product image",
      is_default: true,
    });
  }

  // Get the default image or first valid image
  const defaultImage = images.find((img) => img.is_default) || images[0];
  const imageUrl =
    currentImageUrl ||
    (defaultImage
      ? getValidImageUrl(defaultImage.url)
      : "/placeholder.svg?height=400&width=400");

  // Preload main image and first 4 thumbnails
  useEffect(() => {
    let isMounted = true;

    async function preloadImages() {
      if (!defaultImage?.url) {
        setIsLoading(false);
        return;
      }

      try {
        // Preload main image
        const mainUrl = getValidImageUrl(defaultImage.url);
        await preloadImage(mainUrl);
        if (isMounted) {
          setIsLoading(false);
          setCurrentImageUrl(mainUrl);
          setPreloadedImages((prev) => new Set([...prev, mainUrl]));
        }

        // Preload first 4 thumbnails
        const thumbnailsToPreload = images.slice(0, 4);
        for (const img of thumbnailsToPreload) {
          if (img.url && !preloadedImages.has(img.url)) {
            const url = getValidImageUrl(img.url);
            await preloadImage(url);
            if (isMounted) {
              setPreloadedImages((prev) => new Set([...prev, url]));
            }
          }
        }
      } catch (error) {
        console.error("Error preloading images:", error);
        if (isMounted) {
          setIsLoading(false);
          handleImageError();
        }
      }
    }

    preloadImages();

    return () => {
      isMounted = false;
    };
  }, [defaultImage?.url, images]);

  const handleImageError = async () => {
    if (!imageError && defaultImage?.url) {
      setImageError(true);
      try {
        // Extract the path from the Firebase Storage URL
        const url = new URL(defaultImage.url);
        const path = url.pathname.split("/o/")[1]?.split("?")[0];
        if (path) {
          const newUrl = await refreshImageUrl(decodeURIComponent(path));
          setCurrentImageUrl(newUrl);
        }
      } catch (error) {
        console.error("Error refreshing image URL:", error);
      }
    }
  };

  const handleThumbnailClick = async (imageUrl: string) => {
    if (!preloadedImages.has(imageUrl)) {
      try {
        await preloadImage(imageUrl);
        setPreloadedImages((prev) => new Set([...prev, imageUrl]));
      } catch (error) {
        console.error("Error preloading thumbnail:", error);
      }
    }
    setSelectedImage(imageUrl);
  };

  const handleFullScreen = () => {
    setIsFullScreen(true);
    setCurrentImageIndex(
      images.findIndex(
        (img) => getValidImageUrl(img.url) === (selectedImage || imageUrl)
      )
    );
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef,
          where("product_id", "==", product.productId),
          orderBy("created_at", "desc")
        );
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate(),
          updated_at: doc.data().updated_at?.toDate(),
        })) as ReviewType[];
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [product.productId]);

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (!reviewerName.trim()) {
      toast.error("Please enter your name before submitting.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      let reviewImageUrl = null;
      
      // Upload image if provided
      if (reviewImage) {
        try {
          const formData = new FormData();
          formData.append("file", reviewImage);
          formData.append("upload_preset", "sighattire");
          formData.append("folder", "reviews");

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/domkn0iif/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            reviewImageUrl = data.secure_url;
          }
        } catch (error) {
          console.error("Error uploading review image:", error);
          toast.warning("Image upload failed, but review will be submitted.", {
            position: "top-center",
            autoClose: 3000,
          });
        }
      }

      const reviewData = {
        product_id: product.productId,
        user_id: user?.uid || null, // Optional - can be null for anonymous reviews
        user_name: reviewerName.trim(),
        rating,
        comment: comment.trim() || null,
        review_image: reviewImageUrl,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Add review to Firestore
      await addDoc(collection(db, "reviews"), reviewData);

      // Update product's average rating and review count
      if (!product.productId) return;
      const productRef = doc(db, "products", product.productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const productData = productDoc.data();
        const currentRating = productData.avg_rating || 0;
        const currentCount = productData.review_count || 0;

        // Calculate new average rating
        const newCount = currentCount + 1;
        const newRating = (currentRating * currentCount + rating) / newCount;

        await updateDoc(productRef, {
          avg_rating: Number(newRating.toFixed(1)),
          review_count: newCount,
        });
      }

      // Update local state
      setReviews((prev) => [
        {
          id: Date.now().toString(),
          ...reviewData,
        } as ReviewType,
        ...prev,
      ]);

      // Reset form
      setRating(0);
      setComment("");
      setReviewerName("");
      setReviewImage(null);
      setIsReviewModalOpen(false);

      toast.success("Thank you for your review!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        "There was a problem submitting your review. Please try again.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleTooltipImageClick = (imageSrc: string) => {
    setSelectedTooltipImage(imageSrc);
    setIsTooltipImageFullScreen(true);
  };

  const handleModalImageClick = (imageSrc: string) => {
    setSelectedModalImage(imageSrc);
    setIsModalImageFullScreen(true);
  };

  // Show viewers toast when count changes
  useEffect(() => {
    // Only show toast when there are actually multiple viewers (more than just the current user)
    if (viewerCount > 1 && viewerCount > prevViewerCount) {
      // Show toast with a slight delay to avoid immediate popup on page load
      const toastTimer = setTimeout(() => {
        toast.info(<ViewersToast count={viewerCount} />, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "viewers-toast",
        });
      }, 1500);

      // Clear timeout if component unmounts before toast is shown
      return () => clearTimeout(toastTimer);
    }

    // Update previous count
    setPrevViewerCount(viewerCount);
  }, [viewerCount]);

  // Add real-time stock listener
  useEffect(() => {
    if (!product.productId) return;

    const productRef = doc(db, "products", product.productId);
    const unsubscribe = onSnapshot(productRef, (doc) => {
      if (doc.exists()) {
        const productData = doc.data();
        setCurrentStock(productData.stock_quantity || 0);
      }
    });

    return () => unsubscribe();
  }, [product.productId]);

  // Helper: check if discount/label is expired
  const isDiscountExpired = (() => {
    if (!product.discount_expiry) return false;
    
    try {
      const expiryDate = new Date(product.discount_expiry);
      
      // Check if expiry date is valid
      if (isNaN(expiryDate.getTime())) return false;
      
      // Return true if current time is past expiry time
      return currentTime > expiryDate;
    } catch (error) {
      console.error(`Error checking discount expiry for ${product.name}:`, error);
      return false;
    }
  })();

  // Add custom shake animation style
  const shakeAnimation = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
      20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    .shake {
      animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
    }
  `;

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <style>{shakeAnimation}</style>
      <ToastContainer />
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category_id && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categories/${categorySlug}`}>
                  {categoryName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          {product.subcategory_id && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/categories/${categorySlug}/${product.subcategory_id}`}
                >
                  {product.subcategory || "Subcategory"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            <div className="relative">
              <Image
                src={selectedImage || imageUrl}
                alt={product.name}
                width={800}
                height={800}
                className={`w-full object-cover transition-opacity duration-300 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                priority
                loading="eager"
                quality={90}
                onError={handleImageError}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black"
                onClick={handleFullScreen}
              >
                <ZoomIn className="h-5 w-5" />
                <span className="sr-only">View full screen</span>
              </Button>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black"
                    onClick={() => {
                      const currentIndex = images.findIndex(
                        (img) =>
                          getValidImageUrl(img.url) ===
                          (selectedImage || imageUrl)
                      );
                      const prevIndex =
                        (currentIndex - 1 + images.length) % images.length;
                      handleThumbnailClick(
                        getValidImageUrl(images[prevIndex].url)
                      );
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Previous image</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black"
                    onClick={() => {
                      const currentIndex = images.findIndex(
                        (img) =>
                          getValidImageUrl(img.url) ===
                          (selectedImage || imageUrl)
                      );
                      const nextIndex = (currentIndex + 1) % images.length;
                      handleThumbnailClick(
                        getValidImageUrl(images[nextIndex].url)
                      );
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                    <span className="sr-only">Next image</span>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={image.url}
                onClick={() =>
                  handleThumbnailClick(getValidImageUrl(image.url))
                }
                className={`relative aspect-square overflow-hidden rounded-lg ${
                  selectedImage === getValidImageUrl(image.url) ||
                  (!selectedImage && index === 0)
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <Image
                  src={getValidImageUrl(image.url)}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full object-cover"
                  loading={index < 4 ? "eager" : "lazy"}
                  quality={75}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center">
              <div className="flex">
                {product.avg_rating
                  ? [...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.avg_rating || 0)
                            ? "text-yellow-400"
                            : i < (product.avg_rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))
                  : null}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {product.avg_rating?.toFixed(1) || "0.0"} (
                {product.review_count || 0} reviews)
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center">
              {!isDiscountExpired && product.sale_price && product.sale_price > 0 && product.sale_price !== null && product.sale_price !== undefined ? (
                <>
                  {/* Show original price with strikethrough */}
                  <span className="text-2xl font-bold text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                  {/* Show sale price prominently */}
                  <span className="ml-2 text-2xl font-bold text-primary">
                    {formatCurrency(product.sale_price)}
                  </span>
                </>
              ) : (
                <>
                  {/* Display only original price if no sale_price or expired */}
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentStock > 0
                ? `In stock (${currentStock} available)`
                : "Out of stock"}
            </p>
          </div>

          <div className="space-y-4">
            {product.description && (
              <div className="space-y-6">
                <h3 className="font-bold text-2xl lg:text-3xl text-primary relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-2/3 after:h-0.5 after:bg-primary/20">
                  Description
                </h3>
                <div className="prose dark:prose-invert max-w-none text-foreground bg-gray-50 dark:bg-gray-900/50 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-200 hover:shadow-md hover:border-primary/20 group">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4 text-base leading-relaxed text-muted-foreground hover:text-foreground transition-colors">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-base hover:text-foreground transition-colors">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-primary">
                          {children}
                        </strong>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-4 text-foreground">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold mb-3 text-foreground/90">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-bold mb-2 text-foreground/80">
                          {children}
                        </h3>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          className="text-primary hover:text-primary/80 underline transition-colors"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="pl-4 border-l-4 border-primary/20 italic text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-primary/5 rounded px-1 py-0.5 text-primary">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {product.description}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Product Attributes */}
            {product.attributes && (
              <>
                {/* Colors Section */}
                {product.attributes.Color &&
                  product.attributes.Color.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">Colors</p>
                      <div className="flex flex-wrap gap-2">
                        {product.attributes.Color.map((color) => (
                          <Button
                            key={color}
                            variant={
                              selectedAttributes["Color"] === color
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttributeChange("Color", color)
                            }
                            type="button"
                            className={`${
                              selectedAttributes["Color"] === color
                                ? "bg-purple-600 hover:bg-purple-700 text-white"
                                : "bg-white hover:bg-gray-100 hover:text-gray-800 text-gray-800 border-gray-300"
                            } transition-colors duration-200`}
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                      {validationErrors["Color"] && (
                        <p className="text-sm text-red-500 mt-1"></p>
                      )}
                    </div>
                  )}

                {/* Order Attribute Section */}
                {product.attributes.order &&
                  product.attributes.order.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium capitalize">Order</p>
                      
                      {/* First group validation message */}
                      {validationErrors["order_first_group"] && (
                        <p className="text-sm text-red-500">Please select</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        {product.attributes.order.map((value, index) => (
                          <Button
                            key={value}
                            variant={
                              selectedOrderOptions.includes(value)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleOrderOptionToggle(value)}
                            type="button"
                            disabled={
                              // First two options: disable if the other is selected
                              (index === 0 && selectedOrderOptions.includes(product.attributes.order[1])) ||
                              (index === 1 && selectedOrderOptions.includes(product.attributes.order[0])) ||
                              // Last two options: disable if the other is selected
                              (index === 2 && selectedOrderOptions.includes(product.attributes.order[3])) ||
                              (index === 3 && selectedOrderOptions.includes(product.attributes.order[2]))
                            }
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                      
                      {/* Second group validation message */}
                      {validationErrors["order_second_group"] && (
                        <p className="text-sm text-red-500 mt-1">Please select</p>
                      )}
                    </div>
                  )}

                {/* Size Guide Section */}
                {Object.entries(product.attributes)
                  .filter(([attributeName]) =>
                    attributeName.toLowerCase().includes("size")
                  )
                  .map(([attributeName, values]) => (
                    <div key={attributeName} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">Size Chart <span className="text-red-500">*</span></p>
                        <Dialog
                          open={isSizeGuideOpen}
                          onOpenChange={setIsSizeGuideOpen}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                  >
                                    <Info className="h-4 w-4" />
                                    <span className="sr-only">Size Guide</span>
                                  </Button>
                                </DialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent
                                className="w-[400px] p-0"
                                side="right"
                              >
                                <div className="grid grid-cols-2 gap-2 p-2">
                                  <div
                                    className="relative aspect-[3/4] w-full cursor-pointer"
                                    onClick={() =>
                                      handleTooltipImageClick("/1.png")
                                    }
                                  >
                                    <Image
                                      src="/1.png"
                                      alt="Size Guide 1"
                                      fill
                                      className="object-contain rounded-md hover:opacity-90 transition-opacity"
                                      quality={100}
                                    />
                                  </div>
                                  <div
                                    className="relative aspect-[3/4] w-full cursor-pointer"
                                    onClick={() =>
                                      handleTooltipImageClick("/2.png")
                                    }
                                  >
                                    <Image
                                      src="/2.png"
                                      alt="Size Guide 2"
                                      fill
                                      className="object-contain rounded-md hover:opacity-90 transition-opacity"
                                      quality={100}
                                    />
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                            <DialogHeader className="mb-4">
                              <DialogTitle>Size Guide</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div
                                className="relative aspect-[3/4] cursor-pointer"
                                onClick={() => handleModalImageClick("/1.png")}
                              >
                                <Image
                                  src="/1.png"
                                  alt="Size Guide 1"
                                  fill
                                  className="object-contain hover:opacity-90 transition-opacity"
                                  quality={100}
                                />
                              </div>
                              <div
                                className="relative aspect-[3/4] cursor-pointer"
                                onClick={() => handleModalImageClick("/2.png")}
                              >
                                <Image
                                  src="/2.png"
                                  alt="Size Guide 2"
                                  fill
                                  className="object-contain hover:opacity-90 transition-opacity"
                                  quality={100}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <Button
                            key={value}
                            variant={
                              selectedAttributes[attributeName] === value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttributeChange(attributeName, value)
                            }
                            type="button"
                          >
                            {value}
                          </Button>
                        ))}
                        <Button
                          variant={isCustomDesign ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            handleAttributeChange(
                              attributeName,
                              "Custom Design"
                            )
                          }
                          type="button"
                        >
                          Custom Design
                        </Button>
                      </div>
                      {validationErrors[attributeName] && (
                        <p className="text-sm text-red-500 mt-1">Please select</p>
                      )}
                      {isCustomDesign && (
                        <div className="mt-4 space-y-2">
                          <p className="font-medium">Custom Design Details</p>
                          <Textarea
                            placeholder="Please describe your custom design requirements..."
                            value={customDesignDetails}
                            onChange={(e) => setCustomDesignDetails(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                {/* Other Attributes Section (excluding 'order' and color) */}
                {Object.entries(product.attributes)
                  .filter(
                    ([attributeName]) =>
                      !attributeName.toLowerCase().includes("color") &&
                      attributeName !== "order" &&
                      !attributeName.toLowerCase().includes("size")
                  )
                  .map(([attributeName, values]) => (
                    <div key={attributeName} className="space-y-2">
                      <p className="font-medium capitalize">{attributeName}</p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <Button
                            key={value}
                            variant={
                              selectedAttributes[attributeName] === value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttributeChange(attributeName, value)
                            }
                            type="button"
                            disabled={true}
                            className="opacity-100 cursor-not-allowed"
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                      {validationErrors[attributeName] && (
                        <p className="text-sm text-red-500 mt-1"></p>
                      )}
                    </div>
                  ))}
              </>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <p className="font-medium">Quantity</p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  type="button"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={
                    product.stock_quantity
                      ? quantity >= product.stock_quantity
                      : false
                  }
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                className={`flex-1 ${isButtonShaking ? 'shake' : ''}`}
                onClick={handleAddToCart}
                disabled={addedToCart || product.stock_quantity === 0}
                type="button"
                style={{
                  transform: 'translateX(0)',
                  transition: 'transform 0.1s ease-in-out'
                }}
              >
                {addedToCart ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
                type="button"
              >
                <Heart
                  className="h-4 w-4"
                  fill={isInWishlist ? "currentColor" : "none"}
                />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <Card className="p-4">
            <div className="space-y-2">
              <p className="font-medium">Product Details</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {product.sku && <li>SKU: {product.sku}</li>}
                {product.attributes?.Fabric && (
                  <li>Fabric: {product.attributes.Fabric.join(", ")}</li>
                )}
                {product.attributes?.Color && (
                  <li>
                    Available Colors: {product.attributes.Color.join(", ")}
                  </li>
                )}
                {product.attributes?.Size && (
                  <li>Available Sizes: {product.attributes.Size.join(", ")}</li>
                )}
              </ul>
            </div>
          </Card>

          {/* Frequently Asked Questions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  What is your return or exchange policy?
                </AccordionTrigger>
                <AccordionContent>
                  We're happy to exchange items only if there's a manufacturing
                  defect or the fault is from our side. To be eligible, please
                  make sure the product is unused, tagged in and in its original
                  condition. We don't offer exchanges for wrong size orders, so
                  please double-check our size chart before buying.
                  <br />
                  <br />
                  We only offer returns for ready-to-wear products(e.g., hijabs
                  and accessories). For an exchange, we kindly request that you
                  first send the product to our warehouse. Please note that the
                  delivery charges for the re-shipment will apply as well. For
                  further details, please go through our " Returns, Exchanges &
                  Cancellations" page or feel free to reach out to our customer
                  service team via email or whatsapp—we're happy to help!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  How long does shipping take?
                </AccordionTrigger>
                <AccordionContent>
                  Shipping times may vary based on your order. For regular
                  abayas, please allow 7–10 working days. For hand-embroidered
                  or custom abayas, we'll need a little extra time—around 15–20
                  working days. We appreciate your patience while we prepare
                  your order with care!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Do you offer international shipping?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, we do ship worldwide! Additional charges may apply
                  depending on your location. For details on international
                  shipping rates and delivery times, please go through our
                  Shipping Policy page or feel free to reach out to our customer
                  service team via email or whatsapp—we're happy to help!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  What is your cancellation policy?
                </AccordionTrigger>
                <AccordionContent>
                  We do not offer cancellations once an order is placed, so
                  please review your cart carefully before checkout. For full
                  details, please visit our Cancellation Policy page.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
            onClick={() => {
              setIsFullScreen(false);
              setCurrentImageIndex(0);
            }}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close full screen</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50 md:left-8"
            onClick={handlePrevImage}
          >
            <ChevronLeft className="h-8 w-8" />
            <span className="sr-only">Previous image</span>
          </Button>

          <div className="relative flex items-center justify-center w-full h-full p-8">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={getValidImageUrl(images[currentImageIndex].url)}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                quality={100}
                priority
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-50 md:right-8"
            onClick={handleNextImage}
          >
            <ChevronRight className="h-8 w-8" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>
      )}

      {/* Full Screen Tooltip Image Viewer */}
      {isTooltipImageFullScreen && selectedTooltipImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => {
              setIsTooltipImageFullScreen(false);
              setSelectedTooltipImage(null);
            }}
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close full screen</span>
          </Button>

          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Image
              src={selectedTooltipImage}
              alt="Size Guide Full Screen"
              width={1200}
              height={1200}
              className="object-contain"
              quality={100}
            />
          </div>
        </div>
      )}

      {/* Full Screen Modal Image Viewer */}
      {isModalImageFullScreen && selectedModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center overflow-y-auto"
          onClick={() => {
            setIsModalImageFullScreen(false);
            setSelectedModalImage(null);
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 right-4 text-white hover:bg-white/20 p-3 rounded-full bg-black/50 backdrop-blur-sm z-[60] min-w-[48px] min-h-[48px] flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalImageFullScreen(false);
              setSelectedModalImage(null);
            }}
          >
            <X className="h-8 w-8" />
            <span className="sr-only">Close full screen</span>
          </Button>

          <div 
            className="relative w-full h-full flex items-center justify-center p-4 mt-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedModalImage}
                alt="Size Guide Full Screen"
                width={1200}
                height={1200}
                className="object-contain w-auto h-auto max-w-full max-h-[calc(100vh-8rem)]"
                quality={100}
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Customer Reviews</h2>
          <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Write a Review</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <p className="font-medium">Your Name *</p>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Rating *</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Your Review (Optional)</p>
                  <Textarea
                    placeholder="Share your experience with this product... (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Add Image (Optional)</p>
                  <div className="border border-gray-300 rounded-md p-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReviewImage(e.target.files?.[0] || null)}
                      className="w-full text-sm"
                    />
                  </div>
                  {reviewImage && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ Image selected: {reviewImage.name}</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview}
                  className="w-full"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user_name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.created_at.toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                  {review.review_image && (
                    <div className="mt-3">
                      <Image
                        src={review.review_image}
                        alt="Review image"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          if (review.review_image) {
                            setSelectedModalImage(review.review_image as string);
                            setIsModalImageFullScreen(true);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
