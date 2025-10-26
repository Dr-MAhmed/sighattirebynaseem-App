"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/store/cart-actions";
import { useAuth } from "@/lib/firebase/auth-context";
import { useAtom } from "jotai";
import {
  cartTotalAtom,
  checkoutShippingAddressAtom,
  checkoutPaymentScreenshotAtom,
  checkoutStepAtom,
  type ShippingAddress,
} from "@/lib/store/atoms";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, serverTimestamp, collection, getDoc, runTransaction } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { sendOrderConfirmationEmail } from "@/lib/email/actions";
import { OrderStatus } from "@/types/order";
import { updateMultipleProductStocks } from "@/lib/firebase/product-stock";

// Add type definition for order data
interface OrderData {
  order_number: string;
  user_id: string;
  email: string;
  order_date: any;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price_per_item: number;
    attributes_selected: Record<string, string>;
    product: {
      images: Array<{ url: string; alt_text?: string }>;
      name: string;
      slug: string;
    };
  }>;
  shipping_address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
  };
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  advance_payment_required: number;
  payment_screenshot_base64?: string;
  advance_payment_status: string;
  order_status: OrderStatus;
  order_notes?: string | null;
  updated_at: any;
}

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const [cartTotal] = useAtom(cartTotalAtom);
  const [currentStep, setCurrentStep] = useAtom(checkoutStepAtom);
  const [shippingAddress, setShippingAddress] = useAtom(
    checkoutShippingAddressAtom
  );
  const [paymentScreenshot, setPaymentScreenshot] = useAtom(
    checkoutPaymentScreenshotAtom
  );

  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");

  // Calculate cart total considering sale prices
  const cartTotalWithSalePrices = cartItems.reduce((total, item) => {
    const itemPrice = item.product.sale_price && item.product.sale_price > 0 
      ? item.product.sale_price 
      : item.price_at_add;
    return total + (itemPrice * item.quantity);
  }, 0);

  // Calculate shipping cost based on order total (using sale prices)
  const shippingCost = cartTotalWithSalePrices < 10000 ? 250 : 0;
  const totalWithShipping = cartTotalWithSalePrices + shippingCost;

  // Calculate advance payment based on payment method
  const isNonCOD = paymentMethod === "bank_transfer" || paymentMethod === "easypaisa";
  const discountPercentage = isNonCOD ? 0.05 : 0; // 5% discount for non-COD
  const discountAmount = totalWithShipping * discountPercentage;
  const discountedTotal = totalWithShipping - discountAmount;
  const advancePaymentAmount = isNonCOD ? discountedTotal : totalWithShipping * 0.2;

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      toast({
        title: "Error",
        description: "Please provide shipping address before placing order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First validate stock availability for all items
      const stockValidationPromises = cartItems.map(async (item) => {
        const productRef = doc(db, "products", item.product_id);
        const productDoc = await getDoc(productRef);
        
        if (!productDoc.exists()) {
          throw new Error(`Product ${item.product.name} not found`);
        }

        const productData = productDoc.data();
        const currentStock = productData.stock_quantity || 0;

        if (currentStock < item.quantity) {
          throw new Error(`Not enough stock for ${item.product.name}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }

        return true;
      });

      await Promise.all(stockValidationPromises);

      // Convert payment screenshot to base64 if available
      let paymentScreenshotBase64: string | undefined;
      if (paymentScreenshot) {
        try {
          paymentScreenshotBase64 = await fileToBase64(paymentScreenshot);
        } catch (error) {
          console.error("Error converting screenshot to base64:", error);
          toast({
            title: "Warning",
            description:
              "Failed to process payment screenshot. Order will still be placed.",
            variant: "destructive",
          });
        }
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      // Create order data with proper typing
      const orderData: OrderData = {
        order_number: orderNumber,
        user_id: user?.uid || "anonymous",
        email: shippingAddress.email,
        order_date: serverTimestamp(),
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          name: item.product.name,
          quantity: item.quantity,
          price_per_item: item.product.sale_price && item.product.sale_price > 0 
            ? item.product.sale_price 
            : item.price_at_add,
          attributes_selected: item.attributes_selected || {},
          product: {
            images: item.product.images || [],
            name: item.product.name,
            slug: item.product.slug,
          },
        })),
        shipping_address: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          city: shippingAddress.city,
          province: shippingAddress.province,
        },
        subtotal: cartTotalWithSalePrices,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        total_amount: discountedTotal,
        payment_method: paymentMethod,
        advance_payment_required: advancePaymentAmount,
        advance_payment_status: paymentScreenshotBase64
          ? "Pending Verification"
          : "Pending Upload",
        order_status: "pending_advance",
        order_notes: orderNotes || null,
        updated_at: serverTimestamp(),
      };

      // Only add payment_screenshot_base64 if it exists
      if (paymentScreenshotBase64) {
        orderData.payment_screenshot_base64 = paymentScreenshotBase64;
      }

      // Use a transaction to ensure both order creation and stock updates happen atomically
      let orderId = '';
      await runTransaction(db, async (transaction) => {
        // First, read all product documents to check stock
        const productDocs = await Promise.all(
          cartItems.map(async (item) => {
            const productRef = doc(db, "products", item.product_id);
            const productDoc = await transaction.get(productRef);
            return { item, productDoc };
          })
        );

        // Validate all products exist and have sufficient stock
        for (const { item, productDoc } of productDocs) {
          if (!productDoc.exists()) {
            throw new Error(`Product ${item.product.name} not found during stock update`);
          }

          const productData = productDoc.data();
          if (!productData) {
            throw new Error(`Product data not found for ${item.product.name}`);
          }

          const currentStock = productData.stock_quantity || 0;
          const newStock = currentStock - item.quantity;

          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${item.product.name}`);
          }
        }

        // Create the order
        const ordersRef = collection(db, "orders");
        const orderRef = doc(ordersRef);
        orderId = orderRef.id;
        transaction.set(orderRef, orderData);

        // Update stock for each product
        for (const { item, productDoc } of productDocs) {
          const productRef = doc(db, "products", item.product_id);
          const productData = productDoc.data();
          if (!productData) {
            throw new Error(`Product data not found for ${item.product.name}`);
          }
          const currentStock = productData.stock_quantity || 0;
          const newStock = currentStock - item.quantity;

          transaction.update(productRef, {
            stock_quantity: newStock,
            updated_at: new Date(),
          });
        }
      });

      // Send order confirmation email
      const emailResult = await sendOrderConfirmationEmail({
        id: orderId,
        order_number: orderNumber,
        customerId: user?.uid || "anonymous",
        customerName: shippingAddress.name,
        customerEmail: shippingAddress.email,
        items: cartItems.map((item) => ({
          id: item.product_id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.sale_price && item.product.sale_price > 0 
            ? item.product.sale_price 
            : item.price_at_add,
          image: item.product.images?.[0]?.url,
        })),
        totalAmount: discountedTotal,
        status: "pending_advance",
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.province,
          zipCode: "", // Add if available
          country: "Pakistan", // Default to Pakistan
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethod: paymentMethod,
        paymentStatus: "pending",
      });

      if (!emailResult.success) {
        console.error(
          "Failed to send order confirmation email:",
          emailResult.error
        );
        // Don't show error to user as the order was placed successfully
      }

      // Clear cart
      await clearCart();

      // Reset checkout state
      setCurrentStep(1);
      setShippingAddress(null);
      setPaymentScreenshot(null);

      // Show success message
      toast({
        title: "Order placed successfully!",
        description: `Your order number is ${orderNumber}. We'll contact you shortly to confirm.`,
      });

      // Redirect to success page using window.location for more reliable navigation
      window.location.href = `/checkout/success?order=${orderNumber}`;
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: error instanceof Error ? error.message : "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      {/* Checkout Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentStep >= 1
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background"
              }`}
            >
              {currentStep > 1 ? <Check className="w-5 h-5" /> : 1}
            </div>
            <span className="ml-2 font-medium">Shipping</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentStep >= 2
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background"
              }`}
            >
              {currentStep > 2 ? <Check className="w-5 h-5" /> : 2}
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                currentStep >= 3
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background"
              }`}
            >
              3
            </div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {currentStep === 1 && (
            <div className="border rounded-lg bg-card">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-medium">
                  Shipping Information
                </h2>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={shippingAddress?.name || ""}
                        onChange={(e) =>
                          setShippingAddress(
                            (prev) =>
                              ({
                                ...(prev || {}),
                                name: e.target.value,
                              } as ShippingAddress)
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress?.email || ""}
                        onChange={(e) =>
                          setShippingAddress(
                            (prev) =>
                              ({
                                ...(prev || {}),
                                email: e.target.value,
                              } as ShippingAddress)
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress?.phone || ""}
                      onChange={(e) =>
                        setShippingAddress(
                          (prev) =>
                            ({
                              ...(prev || {}),
                              phone: e.target.value,
                            } as ShippingAddress)
                        )
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingAddress?.street || ""}
                      onChange={(e) =>
                        setShippingAddress(
                          (prev) =>
                            ({
                              ...(prev || {}),
                              street: e.target.value,
                            } as ShippingAddress)
                        )
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress?.city || ""}
                        onChange={(e) =>
                          setShippingAddress(
                            (prev) =>
                              ({
                                ...(prev || {}),
                                city: e.target.value,
                              } as ShippingAddress)
                          )
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={shippingAddress?.province || ""}
                        onChange={(e) =>
                          setShippingAddress(
                            (prev) =>
                              ({
                                ...(prev || {}),
                                province: e.target.value,
                              } as ShippingAddress)
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Continue to Payment</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <div className="border rounded-lg bg-card">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-medium">Payment Method</h2>

                {/* Advance Payment Notice */}
                <div className="p-4 mb-6 text-sm rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">Please Note:</h3>
                  <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• For Cash on Delivery, a minimum advance payment of 20% is required to confirm your order.</li>
                    <li>• If you prefer a non-COD transaction, select either the 'Bank Transfer' or 'Easy Paisa' option and complete the full payment using the provided details.</li>
                    <li>• Want to save more? Go for a full advance (Non-COD) and enjoy an extra 5% discount – valid on all items!</li>
                  </ul>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center p-4 space-x-2 border rounded-lg">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        Cash on Delivery
                      </Label>
                    </div>
                    <div className="flex items-center p-4 space-x-2 border rounded-lg">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                        Bank Transfer
                      </Label>
                    </div>
                    <div className="flex items-center p-4 space-x-2 border rounded-lg">
                      <RadioGroupItem value="easypaisa" id="easypaisa" />
                      <Label htmlFor="easypaisa" className="flex-1 cursor-pointer">
                        Easy Paisa
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="p-4 rounded-lg bg-muted">
                    <h3 className="mb-2 font-medium">
                      {isNonCOD ? "Full Advance Payment Required" : "Advance Payment Required"}
                    </h3>
                    {/* <p className="mb-2 text-sm text-muted-foreground">
                    Due to high demand and limited batch, 100% advance payment is required for Namaz Chaddars and
                    </p> */}
                    {isNonCOD ? (
                      <>
                        <div className="p-3 mb-4 text-sm rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <p className="text-green-800 dark:text-green-200 font-medium">
                            🎉 You've selected a non-COD payment method. Enjoy your 5% discount!
                          </p>
                          <div className="mt-2 space-y-1 text-green-700 dark:text-green-300">
                            <p>Original Total: {formatCurrency(totalWithShipping)}</p>
                            <p>Discount (5%): -{formatCurrency(discountAmount)}</p>
                            <p className="font-semibold">Final Amount: {formatCurrency(discountedTotal)}</p>
                          </div>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          To confirm your order, please make the full advance payment of {formatCurrency(discountedTotal)} to one of the following accounts:
                        </p>
                      </>
                    ) : (
                      <p className="mb-2 text-sm text-muted-foreground">
                        To confirm your order, please make an advance payment of
                        20% ({formatCurrency(advancePaymentAmount)}) to one of the
                        following accounts:
                      </p>
                    )}
                    <ul className="mb-4 space-y-2 text-sm">
                      <li>
                        Bank Transfer: SIGHATTIREBYNASEEM SMC PRIVATE LIMITED
                      </li>
                      <li>Account Number: 5010348108800016</li>
                      <li>IBAN Number: PK61 BPUN 5010 3481 0880 0016</li>
                      <li>EasyPaisa: 0335-4034038</li>
                      <li>Title: Noreen</li>
                      <li>Active on RAAST ID: Yes</li>
                    </ul>

                    <div className={` ${isNonCOD && "p-4 mb-4 text-sm rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"} `}>
                      <p className={` ${isNonCOD && "text-amber-800 dark:text-amber-200"} `}>
                        {isNonCOD 
                          ? "Please complete the full payment using the provided details to confirm your order."
                          : ""
                        }
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment-screenshot">
                        Upload Payment Screenshot
                      </Label>
                      <Input
                        id="payment-screenshot"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setPaymentScreenshot(e.target.files?.[0] || null)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Please upload a screenshot of your payment receipt.
                        Accepted formats: JPG, PNG, JPEG.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order-notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="order-notes"
                      placeholder="Any special instructions for your order"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Shipping
                    </Button>
                    <Button type="submit">Review Order</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {currentStep === 3 && (
            <div className="border rounded-lg bg-card">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-medium">Review Your Order</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-medium">Shipping Address</h3>
                    {shippingAddress && (
                      <div className="p-4 text-sm rounded-lg bg-muted">
                        <p className="font-medium">{shippingAddress.name}</p>
                        <p>{shippingAddress.street}</p>
                        <p>
                          {shippingAddress.city}, {shippingAddress.province}
                        </p>
                        <p>Phone: {shippingAddress.phone}</p>
                        <p>Email: {shippingAddress.email}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 font-medium">Payment Method</h3>
                    <div className="p-4 text-sm rounded-lg bg-muted">
                      <p>{paymentMethod === "cod" ? "Cash on Delivery" : 
                          paymentMethod === "bank_transfer" ? "Bank Transfer" : 
                          paymentMethod === "easypaisa" ? "Easy Paisa" : "Unknown"}</p>
                      {isNonCOD ? (
                        <>
                          <p className="mt-1 text-green-600">
                            🎉 5% discount applied for non-COD payment
                          </p>
                          <p className="mt-1">
                            Full Advance Payment: {formatCurrency(advancePaymentAmount)}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1">
                          Advance Payment: {formatCurrency(advancePaymentAmount)} (20%)
                        </p>
                      )}
                      <p className="mt-1">
                        {paymentScreenshot ? (
                          <span className="text-green-600">
                            Payment screenshot uploaded
                          </span>
                        ) : (
                          <span className="text-amber-600">
                            No payment screenshot uploaded
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-medium">Order Items</h3>
                    <div className="border divide-y rounded-lg">
                      {cartItems.map((item, index) => (
                        <div
                          key={`${item.product_id}-${index}`}
                          className="flex items-center p-4"
                        >
                          <div className="relative w-16 h-16 overflow-hidden rounded aspect-square min-w-fit">
                            <Image
                              src={
                                item.product.images?.[0]?.url ||
                                "/placeholder.svg?height=64&width=64"
                              }
                              alt={
                                item.product.images?.[0]?.alt_text ||
                                item.product.name ||
                                "Product image"
                              }
                              fill
                              className="absolute object-cover"
                            />
                          </div>
                          <div className="flex-1 ml-4">
                            <p className="font-medium">{item.product.name}</p>
                            {item.attributes_selected &&
                              Object.keys(item.attributes_selected).length >
                                0 && (
                                <p className="text-xs text-muted-foreground">
                                  {Object.entries(item.attributes_selected)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ")}
                                </p>
                              )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {/* Show sale price if available and greater than 0, otherwise show original price */}
                              {item.product.sale_price && item.product.sale_price > 0 ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-muted-foreground line-through text-sm">
                                    {formatCurrency(item.price_at_add)}
                                  </span>
                                  <span className="text-primary font-semibold">
                                    {formatCurrency(item.product.sale_price)}
                                  </span>
                                </div>
                              ) : (
                                formatCurrency(item.price_at_add)
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {orderNotes && (
                    <div>
                      <h3 className="mb-2 font-medium">Order Notes</h3>
                      <div className="p-4 text-sm rounded-lg bg-muted">
                        <p>{orderNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      Back to Payment
                    </Button>
                    <Button onClick={handlePlaceOrder} disabled={isLoading}>
                      {isLoading ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

              <div className="space-y-4">
                {/* Show sale price indicator if any items have sale prices */}
                {cartItems.some(item => item.product.sale_price && item.product.sale_price > 0) && (
                  <div className="p-3 text-sm rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      🎉 Sale prices have been applied to eligible items!
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatCurrency(cartTotalWithSalePrices)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                  </span>
                </div>

                {isNonCOD && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (5%)</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(discountedTotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>{isNonCOD ? "Full Advance Payment" : "Advance Payment (20%)"}</span>
                  <span>{formatCurrency(advancePaymentAmount)}</span>
                </div>

                <div className="text-xs text-center text-muted-foreground">
                  By placing your order, you agree to our Terms of Service and
                  Privacy Policy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
