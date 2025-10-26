"use client";

import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductType } from "@/types/product";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { deleteProduct } from "@/lib/admin/product-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminProductsPage() {
  const { adminUser, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      console.log("Starting to fetch products...");
      
      // Use fetch API to call the server endpoint
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const allProducts = await response.json();
      
      console.log(`Fetched ${allProducts.length} products`);
      
      if (!Array.isArray(allProducts)) {
        console.error("Invalid products data received:", allProducts);
        toast({
          title: "Error",
          description: "Received invalid data format. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      console.log("Admin user authenticated, fetching products...");
      fetchProducts();
    }
  }, [adminUser, toast]);

  // Add event listener for product creation
  useEffect(() => {
    const handleProductCreated = () => {
      fetchProducts();
    };

    window.addEventListener('productCreated', handleProductCreated);
    return () => {
      window.removeEventListener('productCreated', handleProductCreated);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category_id?.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleDeleteProduct = async (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const result = await deleteProduct(productToDelete);

      if (result.success) {
        // Remove from local state
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.productId !== productToDelete)
        );
        setFilteredProducts((prevProducts) =>
          prevProducts.filter((p) => p.productId !== productToDelete)
        );

        // Dispatch event to notify other parts of the application
        window.dispatchEvent(new Event('productDeleted'));

        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } else {
        throw new Error(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black dark:text-white">
      <AdminHeader />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Product Management
            </h1>
            <Link prefetch href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="text-center py-10">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  {searchQuery
                    ? "No products match your search"
                    : "No products found"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const defaultImage =
                          product.images?.find((img) => img.is_default) ||
                          product.images?.[0];
                        const imageUrl =
                          defaultImage?.url ||
                          "/placeholder.svg?height=50&width=50";

                        return (
                          <TableRow key={product.productId}>
                            <TableCell>
                              <div className="h-10 w-10 rounded overflow-hidden">
                                <img
                                  src={imageUrl || "/placeholder.svg"}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {product.name}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(product.price)}
                            </TableCell>
                            <TableCell>
                              {product.category_id || "Uncategorized"}
                            </TableCell>
                            <TableCell>
                              {product.stock_quantity ?? "N/A"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  product.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  prefetch
                                  href={`/admin/products/${product.productId}`}
                                >
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    if (typeof product.productId === 'string') {
                                      handleDeleteProduct(product.productId)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
