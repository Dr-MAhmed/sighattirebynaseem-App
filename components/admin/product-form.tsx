"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { X, Plus, Loader2, Upload, Trash2 } from "lucide-react"
import { getCategories } from "@/lib/firebase/firestore"
import type { ProductType, ProductImage, ProductVariant } from "@/types/product"
import type { CategoryType } from "@/types/category"
import { createProduct, updateProduct } from "@/lib/admin/product-actions"
import { processMultipleProductImages } from "@/lib/admin/image-utils"
import { v4 as uuidv4 } from "uuid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import ReactMarkdown from "react-markdown"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface ProductFormProps {
  product?: ProductType
  isEdit?: boolean
}

// Function to compress an image with size target
const compressImage = (file: File, maxSizeKB: number = 500): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Calculate dimensions - scale down large images
        let width = img.width;
        let height = img.height;
        const maxDimension = 1500; // Max dimension for very large images
        
        // Scale down if image is too large
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height / width) * maxDimension);
            width = maxDimension;
          } else {
            width = Math.round((width / height) * maxDimension);
            height = maxDimension;
          }
        }
        
        // Create canvas with new dimensions
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try compressing with decreasing quality until target size is reached
        const compressWithQuality = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }
              
              // Check if size is within the target
              const currentSizeKB = blob.size / 1024;
              
              if (currentSizeKB <= maxSizeKB || quality <= 10) {
                // Either reached target size or minimum quality
                // Create a new file from the blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                resolve(compressedFile);
              } else {
                // Still too large, reduce quality more
                compressWithQuality(quality - 10);
              }
            },
            'image/jpeg', 
            quality / 100
          );
        };
        
        // Start with 80% quality
        compressWithQuality(80);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Process all images for compression
const compressMultipleImages = async (files: File[], maxSizeKB: number = 500): Promise<File[]> => {
  const compressedFiles: File[] = [];
  
  // Process images sequentially to avoid memory issues
  for (const file of files) {
    try {
      // ALWAYS compress images, regardless of size
      const compressedFile = await compressImage(file, maxSizeKB);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`Error compressing image ${file.name}:`, error);
      // Fallback - use aggressive compression on original
      try {
        // Create a final emergency attempt with very low quality
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
        
        // Make dimensions smaller in emergency mode
        const scale = Math.min(1, 800 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, 'image/jpeg', 0.1)
        );
        
        if (blob) {
          const emergencyFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          console.log(`Emergency compression for ${file.name}: ${(emergencyFile.size/1024).toFixed(2)}KB`);
          compressedFiles.push(emergencyFile);
        } else {
          throw new Error('Emergency compression failed');
        }
      } catch (emergencyError) {
        console.error(`Emergency compression failed for ${file.name}`, emergencyError);
        // No choice but to use original file as last resort
        compressedFiles.push(file);
      }
    }
  }
  
  return compressedFiles;
};

// DateInputPicker component for popup calendar
function DateInputPicker({ value, onChange }: { value: Date | undefined, onChange: (date: Date | undefined) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          {value ? format(value, "PPP") : <span>Select date...</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function ProductForm({ product, isEdit = false }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [activeTab, setActiveTab] = useState("basic")
  const [showVariantDialog, setShowVariantDialog] = useState(false)
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(null)
  const [isNewVariant, setIsNewVariant] = useState(false)
  const [compressionQuality, setCompressionQuality] = useState(80) // Default compression quality
  const [compressedSizes, setCompressedSizes] = useState<{[key: string]: {original: string, compressed: string}}>({})
  const [isCompressing, setIsCompressing] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<ProductType>>({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price || 0,
    sale_price: product?.sale_price || 0,
    category_id: product?.category_id || "",
    subcategory_id: product?.subcategory_id || "",
    stock_quantity: product?.stock_quantity || 0,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    has_hijab: product?.has_hijab ?? false,
    sku: product?.sku || "",
    images: product?.images || [],
    attributes: product?.attributes || {},
    variants: product?.variants || [],
    has_variants: product?.has_variants || false,
    is_exclusive_discount: product?.is_exclusive_discount ?? false,
    save_percent: product?.save_percent,
    discount_expiry: product?.discount_expiry,
  })

  // Image state
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageAlt, setNewImageAlt] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])

  // Attribute state
  const [attributeKey, setAttributeKey] = useState("")
  const [attributeValue, setAttributeValue] = useState("")

  // Add state for discount expiry date and time
  const [discountExpiryDate, setDiscountExpiryDate] = useState<Date | undefined>(product?.discount_expiry ? new Date(product.discount_expiry) : undefined);
  const [discountExpiryTime, setDiscountExpiryTime] = useState<string>(product?.discount_expiry ? format(new Date(product.discount_expiry), "HH:mm") : "");

  // Initialize discount expiry fields when product changes (for editing)
  useEffect(() => {
    if (product?.discount_expiry) {
      try {
        const expiryDate = new Date(product.discount_expiry);
        if (!isNaN(expiryDate.getTime())) {
          setDiscountExpiryDate(expiryDate);
          setDiscountExpiryTime(format(expiryDate, "HH:mm"));
        }
      } catch (error) {
        console.error("Error parsing discount expiry date:", error);
      }
    } else {
      // Clear fields if no expiry date
      setDiscountExpiryDate(undefined);
      setDiscountExpiryTime("");
    }
  }, [product?.discount_expiry]);

  // Update form data when product changes (for editing)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price || 0,
        sale_price: product.sale_price || 0,
        category_id: product.category_id || "",
        subcategory_id: product.subcategory_id || "",
        stock_quantity: product.stock_quantity || 0,
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_new_arrival: product.is_new_arrival ?? false,
        has_hijab: product.has_hijab ?? false,
        sku: product.sku || "",
        images: product.images || [],
        attributes: product.attributes || {},
        variants: product.variants || [],
        has_variants: product.has_variants || false,
        is_exclusive_discount: product.is_exclusive_discount ?? false,
        save_percent: product.save_percent,
        discount_expiry: product.discount_expiry,
      });
    }
  }, [product]);

  // Common attributes
  const commonAttributes = {
    Color: ["Red", "Blue", "Green", "Black", "White", "Yellow", "Purple", "Orange", "Pink", "Gray", "Copper Brown", "Dark Turquoise"],
    Size: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
    Material: ["Cotton", "Polyester", "Wool", "Silk", "Linen", "Leather", "Denim"],
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        // Filter categories to only include the allowed ones
        const allowedCategoryNames = [
          "New Arrivals",
          "Abayas",
          "Modest Maxi & Dresses",
          "Prayer / Namaz Chadar",
          "Irani Chadar",
          "Hijabs",
          "Essentials"
        ];
        const filteredCategories = fetchedCategories.filter(cat => 
          allowedCategoryNames.includes(cat.name)
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  // Update formData.discount_expiry when date or time changes
  useEffect(() => {
    if (discountExpiryDate && discountExpiryTime) {
      const [hours, minutes] = discountExpiryTime.split(":").map(Number);
      const expiry = new Date(discountExpiryDate);
      expiry.setHours(hours);
      expiry.setMinutes(minutes);
      expiry.setSeconds(0);
      expiry.setMilliseconds(0);
      setFormData((prev) => ({ ...prev, discount_expiry: expiry.toISOString() }));
    } else {
      setFormData((prev) => ({ ...prev, discount_expiry: undefined }));
    }
  }, [discountExpiryDate, discountExpiryTime]);

  // Auto-clear expired discount fields
  useEffect(() => {
    if (discountExpiryDate && discountExpiryTime) {
      const [hours, minutes] = discountExpiryTime.split(":").map(Number);
      const expiry = new Date(discountExpiryDate);
      expiry.setHours(hours);
      expiry.setMinutes(minutes);
      expiry.setSeconds(0);
      expiry.setMilliseconds(0);
      
      const now = new Date();
      
      // Check if expiry has passed
      if (expiry < now) {
        // Clear the discount expiry fields
        setDiscountExpiryDate(undefined);
        setDiscountExpiryTime("");
        
        // Update form data with all discount fields cleared
        setFormData((prev) => ({ 
          ...prev, 
          discount_expiry: undefined,
          is_exclusive_discount: false,
          save_percent: null,
          sale_price: 0
        }));
        
        // Show a toast notification
        toast({
          title: "Discount Expired",
          description: "The discount expiry date and time have passed. All discount fields have been cleared.",
          variant: "default",
        });
      }
    }
  }, [discountExpiryDate, discountExpiryTime, toast]);

  // Real-time check for expired discounts (runs every 10 seconds for immediate UI updates)
  useEffect(() => {
    const checkExpiredDiscountsImmediate = () => {
      if (discountExpiryDate && discountExpiryTime) {
        try {
          const [hours, minutes] = discountExpiryTime.split(":").map(Number);
          const expiry = new Date(discountExpiryDate);
          expiry.setHours(hours);
          expiry.setMinutes(minutes);
          expiry.setSeconds(0);
          expiry.setMilliseconds(0);
          
          const now = new Date();
          
          // Check if expiry has passed
          if (expiry < now) {
            // Clear the discount expiry fields
            setDiscountExpiryDate(undefined);
            setDiscountExpiryTime("");
            
            // Update form data with all discount fields cleared
            setFormData((prev) => ({ 
              ...prev, 
              discount_expiry: undefined,
              is_exclusive_discount: false,
              save_percent: null,
              sale_price: 0
            }));
            
            // Show a toast notification
            toast({
              title: "Discount Expired",
              description: "The discount expiry date and time have passed. All discount fields have been cleared.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Error checking discount expiry:", error);
        }
      }
    };

    // Check immediately
    checkExpiredDiscountsImmediate();
    
    // Set up interval to check every 10 seconds for immediate UI updates
    const interval = setInterval(checkExpiredDiscountsImmediate, 10000); // 10000ms = 10 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [discountExpiryDate, discountExpiryTime, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    console.log(`Form field changed: ${name} = ${value}`)

    // Handle number inputs
    if (type === "number") {
      const newValue = Number.parseFloat(value) || 0
      console.log(`Converting ${name} to number: ${newValue}`)
      setFormData({
        ...formData,
        [name]: newValue,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    console.log(`Switch changed: ${name} = ${checked}`)
    // If this is the New Arrivals switch
    if (name === "is_new_arrival") {
      // Find the New Arrivals category
      const newArrivalsCategory = categories.find(cat => cat.name === "New Arrivals");
      
      if (checked && newArrivalsCategory) {
        // When turning on New Arrivals, ensure we have the category ID
        setFormData(prev => ({
          ...prev,
          is_new_arrival: true,
          new_arrivals_category_id: newArrivalsCategory.categoryId,
          // Add New Arrivals as a secondary category
          secondary_categories: [...(prev.secondary_categories || []), newArrivalsCategory.categoryId]
        }));
        console.log("Product will be added to New Arrivals category");
      } else {
        // When turning off New Arrivals, remove it from secondary categories
        setFormData(prev => ({
          ...prev,
          is_new_arrival: false,
          new_arrivals_category_id: "",
          secondary_categories: (prev.secondary_categories || []).filter(id => id !== newArrivalsCategory?.categoryId)
        }));
        console.log("Product will be removed from New Arrivals category");
      }
    } else {
      // Handle other switches normally
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select changed: ${name} = ${value}`)
    if (name === "category_id") {
      // Find the selected category to get category name and slug
      const selectedCategory = categories.find(cat => cat.categoryId === value);
      console.log("Selected category:", selectedCategory)
      
      // Reset subcategory when category changes
      setFormData({
        ...formData,
        [name]: value,
        category: selectedCategory?.name || "",
        category_slug: selectedCategory?.slug || "",
        subcategory_id: "",
        subcategory: "",
        subcategory_slug: "",
      });
    } else if (name === "subcategory_id") {
      // Find the selected category and subcategory
      const selectedCategory = categories.find(cat => cat.categoryId === formData.category_id);
      const selectedSubcategory = selectedCategory?.subcategories?.find(
        sub => sub.slug === value
      );
      console.log("Selected subcategory:", selectedSubcategory)
      
      setFormData({
        ...formData,
        [name]: value,
        subcategory: selectedSubcategory?.name || "",
        subcategory_slug: selectedSubcategory?.slug || "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      
      // Filter out duplicate files based on name and size
      const uniqueFiles = files.filter((newFile) => {
        return !uploadedFiles.some(
          (existingFile) =>
            existingFile.name === newFile.name && existingFile.size === newFile.size
        )
      })

      if (uniqueFiles.length === 0) {
        toast({
          title: "Duplicate Images",
          description: "Some images were skipped because they were duplicates.",
          variant: "destructive",
        })
        return
      }

      setUploadedFiles((prev) => [...prev, ...uniqueFiles])

      // Create preview URLs
      const newPreviews = uniqueFiles.map((file) => URL.createObjectURL(file))
      setPreviewImages((prev) => [...prev, ...newPreviews])

      // Add to form data images array with temporary local URLs
      const newImages: ProductImage[] = uniqueFiles.map((file) => ({
        url: URL.createObjectURL(file),
        alt_text: file.name,
        is_default: formData.images?.length === 0 && uploadedFiles.length === 0,
        file: file,
      }))

      setFormData({
        ...formData,
        images: [...(formData.images || []), ...newImages],
      })
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return

    const newImages = [
      ...(formData.images || []),
      {
        url: newImageUrl,
        alt_text: newImageAlt || newImageUrl,
        is_default: formData.images?.length === 0,
      },
    ]

    setFormData({
      ...formData,
      images: newImages,
    })

    setNewImageUrl("")
    setNewImageAlt("")
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])]
    const removedImage = newImages[index]

    // If it's a preview image, revoke the object URL
    if (removedImage.url.startsWith("blob:")) {
      URL.revokeObjectURL(removedImage.url)

      // Also remove from uploadedFiles if it's a file
      if (removedImage.file) {
        const fileIndex = uploadedFiles.findIndex((f) => f === removedImage.file)
        if (fileIndex !== -1) {
          const newFiles = [...uploadedFiles]
          newFiles.splice(fileIndex, 1)
          setUploadedFiles(newFiles)
        }
      }
    }

    newImages.splice(index, 1)

    // If we removed the default image and there are still images, make the first one default
    if (newImages.length > 0 && !newImages.some((img) => img.is_default)) {
      newImages[0].is_default = true
    }

    setFormData({
      ...formData,
      images: newImages,
    })
  }

  const handleSetDefaultImage = (index: number) => {
    const newImages = (formData.images || []).map((img, i) => ({
      ...img,
      is_default: i === index,
    }))

    setFormData({
      ...formData,
      images: newImages,
    })
  }

  const handleAddAttribute = () => {
    if (!attributeKey.trim() || !attributeValue.trim()) return;

    // If the attribute is a color type, add one color at a time
    if (attributeKey.toLowerCase().includes('color')) {
      const colorValue = attributeValue.trim();
      if (!colorValue) return;
      const newAttributes = { ...formData.attributes };
      if (newAttributes[attributeKey]) {
        if (!newAttributes[attributeKey].includes(colorValue)) {
          newAttributes[attributeKey] = [...newAttributes[attributeKey], colorValue];
        }
      } else {
        newAttributes[attributeKey] = [colorValue];
      }
      setFormData({
        ...formData,
        attributes: newAttributes,
      });
      setAttributeValue(""); // Only clear color input, not product type
      return;
    }

    // Default: single value for non-color attributes
    const newAttributes = { ...formData.attributes };
    if (newAttributes[attributeKey]) {
      if (!newAttributes[attributeKey].includes(attributeValue)) {
        newAttributes[attributeKey] = [...newAttributes[attributeKey], attributeValue];
      }
    } else {
      newAttributes[attributeKey] = [attributeValue];
    }
    setFormData({
      ...formData,
      attributes: newAttributes,
    });
    setAttributeValue("");
  };

  const handleAddCommonAttribute = (key: string, value: string) => {
    const newAttributes = { ...formData.attributes }

    if (newAttributes[key]) {
      // Add to existing attribute if it doesn't already exist
      if (!newAttributes[key].includes(value)) {
        newAttributes[key] = [...newAttributes[key], value]
      }
    } else {
      // Create new attribute
      newAttributes[key] = [value]
    }

    setFormData({
      ...formData,
      attributes: newAttributes,
    })
  }

  const handleRemoveAttributeValue = (key: string, valueIndex: number) => {
    const newAttributes = { ...formData.attributes }

    if (newAttributes[key] && newAttributes[key].length > valueIndex) {
      newAttributes[key] = newAttributes[key].filter((_, i) => i !== valueIndex)

      // If no values left, remove the attribute key
      if (newAttributes[key].length === 0) {
        delete newAttributes[key]
      }

      setFormData({
        ...formData,
        attributes: newAttributes,
      })
    }
  }

  const handleRemoveAttribute = (key: string) => {
    const newAttributes = { ...formData.attributes }
    delete newAttributes[key]

    setFormData({
      ...formData,
      attributes: newAttributes,
    })
  }

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()

      setFormData({
        ...formData,
        slug,
      })
    }
  }

  // Variant management
  const openVariantDialog = (variant?: ProductVariant) => {
    if (variant) {
      setCurrentVariant(variant)
      setIsNewVariant(false)
    } else {
      setCurrentVariant({
        id: uuidv4(),
        attributes: {},
        price: formData.price,
        sale_price: formData.sale_price,
        stock_quantity: 0,
        sku: "",
      })
      setIsNewVariant(true)
    }
    setShowVariantDialog(true)
  }

  const handleVariantChange = (field: string, value: string | number) => {
    if (!currentVariant) return

    setCurrentVariant({
      ...currentVariant,
      [field]: field === "price" || field === "sale_price" || field === "stock_quantity" ? Number(value) : value,
    })
  }

  const handleVariantAttributeChange = (key: string, value: string) => {
    if (!currentVariant) return

    setCurrentVariant({
      ...currentVariant,
      attributes: {
        ...currentVariant.attributes,
        [key]: value,
      },
    })
  }

  const saveVariant = () => {
    if (!currentVariant) return

    let updatedVariants: ProductVariant[]

    if (isNewVariant) {
      updatedVariants = [...(formData.variants || []), currentVariant]
    } else {
      updatedVariants = (formData.variants || []).map((v) => (v.id === currentVariant.id ? currentVariant : v))
    }

    setFormData({
      ...formData,
      variants: updatedVariants,
      has_variants: true,
    })

    setShowVariantDialog(false)
    setCurrentVariant(null)
  }

  const deleteVariant = (variantId: string) => {
    const updatedVariants = (formData.variants || []).filter((v) => v.id !== variantId)

    setFormData({
      ...formData,
      variants: updatedVariants,
      has_variants: updatedVariants.length > 0,
    })
  }

  // Modify the handleSubmit function to fix product creation issues
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Form submission started with formData:", JSON.stringify(formData, null, 2));

      // Ensure that both category_id and subcategory_id are included in the submission
      const dataToSubmit: Partial<ProductType> = {
        ...formData,
        category_id: formData.category_id || "",
        subcategory_id: formData.subcategory_id || "",
        // Ensure category and subcategory information is included
        category: formData.category || "",
        category_slug: formData.category_slug || "",
        subcategory: formData.subcategory || "",
        subcategory_slug: formData.subcategory_slug || "",
      }

      console.log("Data to submit:", JSON.stringify(dataToSubmit, null, 2));

      // Process images and upload them if needed
      if (uploadedFiles.length > 0) {
        try {
          // Create a copy of images for safety
          const imagesToProcess = [...uploadedFiles];
          console.log(`Starting compression for ${imagesToProcess.length} images`);
          
          // Compress all images
          const compressedFiles = await compressMultipleImages(imagesToProcess, 300);
          console.log(`Compressed ${compressedFiles.length} images successfully`);
          
          // Process one image at a time for reliability
          const processedImages: ProductImage[] = [];
          
          for (const file of compressedFiles) {
            try {
              // Process single image
              console.log(`Processing image: ${file.name} (${(file.size/1024).toFixed(2)}KB)`);
              const singleResult = await processMultipleProductImages([file]);
              
              if (singleResult && singleResult.length > 0) {
                processedImages.push(singleResult[0]);
                console.log(`Successfully processed image: ${file.name}`);
              } else {
                throw new Error(`Failed to process image: ${file.name}`);
              }
            } catch (singleError) {
              console.error(`Error processing individual image ${file.name}:`, singleError);
              // Continue with next image
            }
          }
          
          console.log(`Successfully processed ${processedImages.length} images`);
          
          // Create a simple array of images without file references
          const finalImages = processedImages.map(img => ({
            url: img.url,
            alt_text: img.alt_text || "Product image",
            is_default: img.is_default || processedImages.indexOf(img) === 0,
          }));
          
          // Replace the image URLs directly
          dataToSubmit.images = finalImages;
          
        } catch (imgError) {
          console.error("Error processing images:", imgError);
          toast({
            title: "Image Processing Error",
            description: "There was an error with your images. Trying to create product without images.",
            variant: "destructive",
          });
          
          // Attempt to create product without images as fallback
          dataToSubmit.images = [];
        }
      }

      // Create product with clean data
      const cleanData = {
        name: dataToSubmit.name,
        slug: dataToSubmit.slug,
        description: dataToSubmit.description,
        price: dataToSubmit.price,
        sale_price: dataToSubmit.sale_price || 0,
        stock_quantity: Number(dataToSubmit.stock_quantity) || 0,
        images: dataToSubmit.images || [],
        attributes: dataToSubmit.attributes || {},
        variants: dataToSubmit.variants || [],
        has_variants: dataToSubmit.has_variants || false,
        is_active: dataToSubmit.is_active ?? true,
        is_featured: dataToSubmit.is_featured ?? false,
        is_new_arrival: dataToSubmit.is_new_arrival ?? false,
        has_hijab: dataToSubmit.has_hijab ?? false,
        sku: dataToSubmit.sku || "",
        category_id: dataToSubmit.category_id,
        category: dataToSubmit.category,
        category_slug: dataToSubmit.category_slug,
        subcategory_id: dataToSubmit.subcategory_id,
        subcategory: dataToSubmit.subcategory,
        subcategory_slug: dataToSubmit.subcategory_slug,
        is_exclusive_discount: dataToSubmit.is_exclusive_discount ?? false,
        save_percent: dataToSubmit.save_percent === null ? null : (dataToSubmit.save_percent || undefined),
        discount_expiry: dataToSubmit.discount_expiry,
      };
      
      console.log("Clean data for submission:", JSON.stringify(cleanData, null, 2));

      let result;
      try {
        if (isEdit && product?.productId) {
          console.log("Updating existing product with ID:", product.productId);
          result = await updateProduct(product.productId, cleanData);
          console.log("Update result:", result);
        } else {
          console.log("Attempting to create product with data:", {
            name: cleanData.name,
            price: cleanData.price,
            category_id: cleanData.category_id,
            images: cleanData.images.length,
            attributes: Object.keys(cleanData.attributes || {}).length,
            variants: cleanData.variants?.length || 0
          });
          
          result = await createProduct(cleanData);
          
          if (!result) {
            console.error("No response received from createProduct API");
            throw new Error("No response received from server");
          }
          
          console.log("Product creation API response:", result);
        }

        if (!result) {
          console.error("No response received from update/create operation");
          throw new Error("No response from product creation/update");
        }

        if (result.success) {
          console.log("Product update/create successful");
          toast({
            title: isEdit ? "Product updated" : "Product created",
            description: isEdit
              ? "Your product has been updated successfully."
              : "Your product has been added to the store.",
          });
          
          // Reset form and navigate
          if (!isEdit) {
            setFormData({
              name: "",
              slug: "",
              description: "",
              price: 0,
              sale_price: 0,
              category_id: "",
              subcategory_id: "",
              stock_quantity: 0,
              is_active: true,
              is_featured: false,
              is_new_arrival: false,
              has_hijab: false,
              sku: "",
              images: [],
              attributes: {},
              variants: [],
              has_variants: false,
              is_exclusive_discount: false,
            });
            setUploadedFiles([]);
            setPreviewImages([]);
          }
          
          // Dispatch event for product creation
          window.dispatchEvent(new Event('productCreated'));
          
          // Navigate after everything is done
          setTimeout(() => router.push("/admin/products"), 500);
          return;
        } else {
          console.error("Product update/create failed with response:", result);
          throw new Error(result.error || "Failed to create/update product");
        }
      } catch (createError) {
        console.error("Error in product API:", createError);
        console.error("Full error details:", {
          error: createError,
          message: createError instanceof Error ? createError.message : "Unknown error",
          stack: createError instanceof Error ? createError.stack : undefined
        });
        
        toast({
          title: "Error",
          description: createError instanceof Error ? createError.message : "Failed to create/update product. Please try again.",
          variant: "destructive",
        });
        throw createError;
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      setIsSubmitting(false);
    }
  }

  // Get selected category's subcategories
  const selectedCategory = categories.find(cat => cat.categoryId === formData.category_id);
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Product" : "Add New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug *
                      <Button type="button" variant="link" className="h-auto p-0 ml-2 text-xs" onClick={generateSlug}>
                        Generate from name
                      </Button>
                    </Label>
                    <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <div className="border rounded-md">
                    <div className="border-b p-2 flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const textarea = document.getElementById('description') as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description || '';
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                          setFormData({ ...formData, description: newText });
                          // Set cursor position after the formatted text
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + 2, end + 2);
                          }, 0);
                        }}
                      >
                        <span className="font-bold">B</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const textarea = document.getElementById('description') as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description || '';
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                          setFormData({ ...formData, description: newText });
                          // Set cursor position after the formatted text
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + 1, end + 1);
                          }, 0);
                        }}
                      >
                        <span className="italic">I</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const textarea = document.getElementById('description') as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description || '';
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `### ${selectedText}` + text.substring(end);
                          setFormData({ ...formData, description: newText });
                          // Set cursor position after the formatted text
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + 4, end + 4);
                          }, 0);
                        }}
                      >
                        <span className="font-bold">H3</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const textarea = document.getElementById('description') as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = formData.description || '';
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `- ${selectedText}` + text.substring(end);
                          setFormData({ ...formData, description: newText });
                          // Set cursor position after the formatted text
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + 2, end + 2);
                          }, 0);
                        }}
                      >
                        <span>•</span>
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={8}
                      className="min-h-[200px] font-mono text-sm p-4"
                      placeholder="Write your product description here... You can use markdown formatting:
**Bold text**
*Italic text*
### Heading
- Bullet points"
                    />
                  </div>
                  <div className="mt-4 border rounded-md p-4 bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="text-sm font-medium mb-2">Preview:</h4>
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-4 text-base leading-relaxed text-muted-foreground">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground">{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li className="text-base">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-primary">{children}</strong>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold mb-3 text-foreground/90">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-bold mb-2 text-foreground/80">{children}</h3>
                          ),
                          a: ({ children, href }) => (
                            <a href={href} className="text-primary hover:text-primary/80 underline transition-colors">{children}</a>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="pl-4 border-l-4 border-primary/20 italic text-muted-foreground">{children}</blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-primary/5 rounded px-1 py-0.5 text-primary">{children}</code>
                          )
                        }}
                      >
                        {formData.description || "Preview will appear here..."}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select text and click formatting buttons to apply styles. You can also use markdown directly.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Pricing</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Regular Price (Rs.) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Sale Price (Rs.)</Label>
                    <Input
                      id="sale_price"
                      name="sale_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {/* Discount Expiry Date/Time Picker */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Discount/Label Expiry Date</Label>
                    <DateInputPicker value={discountExpiryDate} onChange={setDiscountExpiryDate} />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount/Label Expiry Time</Label>
                    <Input
                      type="time"
                      value={discountExpiryTime}
                      onChange={e => setDiscountExpiryTime(e.target.value)}
                    />
                  </div>
                </div>
                {formData.discount_expiry && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Expiry set to: {format(new Date(formData.discount_expiry), "dd MMM yyyy, hh:mm a")}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Category</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => handleSelectChange("category_id", value)}
                      >
                        <SelectTrigger id="category_id">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.categoryId} value={category.categoryId}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory_id">Subcategory</Label>
                      <Select
                        value={formData.subcategory_id}
                        onValueChange={(value) => handleSelectChange("subcategory_id", value)}
                        disabled={!formData.category_id || !categories.find(cat => cat.categoryId === formData.category_id)?.subcategories?.length}
                      >
                        <SelectTrigger id="subcategory_id">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.category_id && 
                            categories.find(cat => cat.categoryId === formData.category_id)?.subcategories?.map((subcategory) => (
                              <SelectItem key={subcategory.slug} value={subcategory.slug}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Status</h3>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleSwitchChange("is_featured", checked)}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_new_arrival"
                    checked={formData.is_new_arrival}
                    onCheckedChange={(checked) => handleSwitchChange("is_new_arrival", checked)}
                  />
                  <Label htmlFor="is_new_arrival">New Arrival</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_exclusive_discount"
                    checked={formData.is_exclusive_discount}
                    onCheckedChange={(checked) => handleSwitchChange("is_exclusive_discount", checked)}
                  />
                  <Label htmlFor="is_exclusive_discount">Exclusive Discount</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="has_hijab"
                    checked={formData.has_hijab}
                    onCheckedChange={(checked) => handleSwitchChange("has_hijab", checked)}
                  />
                  <Label htmlFor="has_hijab">Hijab Included</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="save_percent_switch"
                    checked={!!formData.save_percent}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => ({
                        ...prev,
                        save_percent: checked ? (prev.save_percent || 5) : null,
                      }));
                    }}
                  />
                  <Label htmlFor="save_percent_switch">Save xyz %</Label>
                  {formData.save_percent !== null && formData.save_percent !== undefined && (
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      step={1}
                      className="w-24 ml-2"
                      value={formData.save_percent}
                      onChange={e => setFormData(prev => ({ ...prev, save_percent: Number(e.target.value) }))}
                      placeholder="%"
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Images</h3>

                <div className="flex flex-col gap-4">
                  {/* Image upload area */}
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <p className="text-lg font-medium">Click to upload images</p>
                      <p className="text-sm text-muted-foreground">Upload multiple product images (JPG, PNG, WebP)</p>
                    </div>
                  </div>

                  {/* Image compression info */}
                  {uploadedFiles.length > 0 && (
                    <div className="rounded-lg border p-4 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      <p className="text-sm">
                        Images will be automatically compressed before being uploaded to optimize storage and loading times.
                      </p>
                    </div>
                  )}

                  {/* External image URL input */}
                  <div className="flex flex-col gap-2">
                    <h4 className="font-medium">Or add image by URL</h4>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Alt Text"
                          value={newImageAlt}
                          onChange={(e) => setNewImageAlt(e.target.value)}
                        />
                      </div>
                      <Button type="button" onClick={handleAddImage}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image gallery */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Product Images ({formData.images?.length || 0})</h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {formData.images?.map((image, index) => (
                        <div key={index} className="relative border rounded-md overflow-hidden">
                          <img
                            src={image.url || "/placeholder.svg?height=100&width=100"}
                            alt={image.alt_text || "Product image"}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute top-0 right-0 p-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="p-2 bg-white">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`default-image-${index}`}
                                checked={image.is_default}
                                onCheckedChange={() => handleSetDefaultImage(index)}
                              />
                              <Label htmlFor={`default-image-${index}`} className="text-xs">
                                Default
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Attributes Tab */}
            <TabsContent value="attributes" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Attributes</h3>
                <p className="text-sm text-muted-foreground">
                  Add attributes like color, size, material, etc. These will be used to create product variants.
                </p>

                {/* Colors Section */}
                <div className="space-y-2 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium">Colors</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Add a color (e.g. Black, Blue, Red)"
                          value={attributeValue}
                          onChange={(e) => setAttributeValue(e.target.value)}
                        />
                      </div>
                      <Button type="button" onClick={() => {
                        if (!attributeValue.trim()) return;
                        const newAttributes = { ...formData.attributes };
                        if (newAttributes['Color']) {
                          if (!newAttributes['Color'].includes(attributeValue.trim())) {
                            newAttributes['Color'] = [...newAttributes['Color'], attributeValue.trim()];
                          }
                        } else {
                          newAttributes['Color'] = [attributeValue.trim()];
                        }
                        setFormData({
                          ...formData,
                          attributes: newAttributes,
                        });
                        setAttributeValue("");
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add multiple colors for your product. Users will be able to select one color at a time.
                    </p>
                    {/* Show current colors as removable badges */}
                    {formData.attributes?.Color && formData.attributes.Color.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.attributes.Color.map((value, idx) => (
                          <div key={idx} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full px-3 py-1 text-sm flex items-center">
                            {value}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => {
                                const newAttributes = { ...formData.attributes };
                                newAttributes['Color'] = newAttributes['Color'].filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  attributes: newAttributes,
                                });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Order Input Section */}
                <div className="space-y-2 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium">Custom Order Input</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Order value (e.g. front open, with side pockets)"
                          value={attributeValue}
                          onChange={(e) => setAttributeValue(e.target.value)}
                        />
                      </div>
                      <Button type="button" onClick={() => {
                        if (!attributeValue.trim()) return;
                        const newAttributes = { ...formData.attributes };
                        if (newAttributes['order']) {
                          if (!newAttributes['order'].includes(attributeValue.trim())) {
                            newAttributes['order'] = [...newAttributes['order'], attributeValue.trim()];
                          }
                        } else {
                          newAttributes['order'] = [attributeValue.trim()];
                        }
                        setFormData({
                          ...formData,
                          attributes: newAttributes,
                        });
                        setAttributeValue("");
                      }}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Example: front open, front closed, with side pockets, without side pockets
                    </p>
                    {/* Show current order values as removable badges */}
                    {formData.attributes?.order && formData.attributes.order.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.attributes.order.map((value, idx) => (
                          <div key={idx} className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center">
                            {value}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => {
                                const newAttributes = { ...formData.attributes };
                                newAttributes['order'] = newAttributes['order'].filter((_, i) => i !== idx);
                                setFormData({
                                  ...formData,
                                  attributes: newAttributes,
                                });
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Attributes Display */}
                <div className="space-y-4 mt-4">
                  <h4 className="font-medium">Current Attributes</h4>
                  {Object.entries(formData.attributes || {}).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attributes added yet.</p>
                  ) : (
                    <>
                      {/* Custom Colors in a single row */}
                      <div className="border rounded-md p-4 mb-4">
                        <h4 className="font-medium mb-2">Color</h4>
                        <div className="space-y-2">
                          {Object.entries(formData.attributes || {})
                            .filter(([key]) => key.toLowerCase().includes('color'))
                            .map(([key, values]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="font-medium capitalize">{key.replace('color', '').trim()}:</span>
                                {values.map((value, index) => (
                                  <span
                                    key={`${key}-${index}`}
                                    className="bg-purple-400 text-white rounded px-3 py-1 text-sm font-medium"
                                  >
                                    {value}
                                  </span>
                                ))}
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Other Attributes */}
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-2">Other Attributes</h4>
                        <div className="space-y-4">
                          {Object.entries(formData.attributes || {})
                            .filter(([key]) => !key.toLowerCase().includes('color'))
                            .map(([key, values]) => (
                              <div key={key} className="border-b last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">{key}</h4>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleRemoveAttribute(key)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {values.map((value, index) => (
                                    <div
                                      key={`${key}-${index}`}
                                      className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
                                    >
                                      {value}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-1"
                                        onClick={() => handleRemoveAttributeValue(key, index)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {Object.entries(commonAttributes).map(([key, values]) => (
                  <div key={key} className="space-y-2">
                    <h4 className="font-medium">{key}</h4>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <Badge
                          key={value}
                          variant={formData.attributes?.[key]?.includes(value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleAddCommonAttribute(key, value)}
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom attribute input */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Custom Attributes</h4>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Attribute (e.g. Material, Pattern)"
                      value={attributeKey}
                      onChange={(e) => setAttributeKey(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Value (e.g. Cotton, Striped)"
                      value={attributeValue}
                      onChange={(e) => setAttributeValue(e.target.value)}
                    />
                  </div>
                  <Button type="button" onClick={handleAddAttribute}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Current attributes */}
              <div className="space-y-4 mt-4">
                <h4 className="font-medium">Current Attributes</h4>
                {Object.entries(formData.attributes || {}).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No attributes added yet.</p>
                ) : (
                  Object.entries(formData.attributes || {}).map(([key, values]) => (
                    <div key={key} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{key}</h4>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveAttribute(key)}>
                          Remove
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value, index) => (
                          <div
                            key={`${key}-${index}`}
                            className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm flex items-center"
                          >
                            {value}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1"
                              onClick={() => handleRemoveAttributeValue(key, index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Product Variants</h3>
                  <Button
                    type="button"
                    onClick={() => openVariantDialog()}
                    disabled={Object.keys(formData.attributes || {}).length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {Object.keys(formData.attributes || {}).length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-yellow-800">
                      You need to add product attributes before creating variants. Go to the Attributes tab to add some.
                    </p>
                  </div>
                )}

                {formData.variants && formData.variants.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Sale Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <Badge key={key} className="mr-1">
                                {key}: {value}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>{variant.price || formData.price}</TableCell>
                          <TableCell>{variant.sale_price || formData.sale_price || "-"}</TableCell>
                          <TableCell>{variant.stock_quantity}</TableCell>
                          <TableCell>{variant.sku || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="ghost" size="sm" onClick={() => openVariantDialog(variant)}>
                              Edit
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => deleteVariant(variant.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No variants added yet.</p>
                )}
              </div>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inventory</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="has_variants"
                    checked={formData.has_variants}
                    onCheckedChange={(checked) => handleSwitchChange("has_variants", checked)}
                  />
                  <Label htmlFor="has_variants">This product has multiple variants</Label>
                </div>

                {formData.has_variants && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-2">
                    <p className="text-blue-800">
                      When using variants, inventory will be managed at the variant level. The main product stock
                      quantity will be the sum of all variant quantities.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </CardFooter>
      </Card>

      {/* Variant Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isNewVariant ? "Add Variant" : "Edit Variant"}</DialogTitle>
            <DialogDescription>
              Create a product variant with specific attributes, price and inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Variant Attributes</Label>
              {Object.keys(formData.attributes || {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attributes available. Add some in the Attributes tab.
                </p>
              ) : (
                Object.entries(formData.attributes || {}).map(([key, values]) => (
                  <div key={key} className="grid grid-cols-2 gap-2 items-center">
                    <Label>{key}</Label>
                    <Select
                      value={currentVariant?.attributes[key] || ""}
                      onValueChange={(value) => handleVariantAttributeChange(key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${key}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant-price">Price</Label>
                <Input
                  id="variant-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentVariant?.price || 0}
                  onChange={(e) => handleVariantChange("price", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-sale-price">Sale Price</Label>
                <Input
                  id="variant-sale-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentVariant?.sale_price || 0}
                  onChange={(e) => handleVariantChange("sale_price", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant-stock">Stock Quantity</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={currentVariant?.stock_quantity || 0}
                  onChange={(e) => handleVariantChange("stock_quantity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant-sku">SKU</Label>
                <Input
                  id="variant-sku"
                  value={currentVariant?.sku || ""}
                  onChange={(e) => handleVariantChange("sku", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowVariantDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveVariant}>
              Save Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
