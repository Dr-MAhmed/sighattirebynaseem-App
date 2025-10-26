import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchanges Policy | (SAN) sigh Attire by Naseem",
  description:
    "Learn about our returns, exchanges, and cancellations policy. We aim to make your shopping experience worry-free with our customer-friendly policies.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          Returns, Exchanges and Cancellations Policy
        </h1>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Return Policy</h2>
          <div className="space-y-4">
            <p>
              We offer a "no-questions asked" return policy on ready made items
              e.g. hijabs, accessories and all Ready-to-wear products.
            </p>
            <div className="mt-4 rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 dark:border-amber-400 dark:bg-amber-950/30">
              <p className="text-amber-800 dark:text-amber-200">
                <strong>Important Note:</strong> We discourage returns without
                reasons. We expect the customer to empathise with the hard work
                our team puts into packing, dispatching and servicing an order.
              </p>
            </div>
            <div className="mt-4 rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 dark:border-amber-400 dark:bg-amber-950/30">
              <p className="text-amber-800 dark:text-amber-200">
                <strong>Important Note:</strong> All Returns and Exchange
                requests must be made within 24 hours of receiving the order.
              </p>
            </div>

            <p>In case of returns:</p>
            <ul className="list-disc pl-5 space-y-2">
              Free shipping on orders above 10,000 PKR.
              <li>Customers will have to bear the return cost</li>Free shipping
              on orders above 10,000 PKR.
              <li>
                Refund will be made in 5 working days, after the product is
                received in the same condition as it was packed in: tags
                attached, unused and packed
              </li>
              <li>
                Please email at info@sighattirebynaseem.com or WhatsApp us at
                +92 3354034038 to process your return request
              </li>
              <li>Your query will be answered within 48 hours</li>
            </ul>
            <div className="mt-4 rounded-md border p-4">
              <p className="font-medium">Custom-Made Items:</p>
              <p>
                We do not offer exchange or return on Custom-Made and
                Make-To-Order items e.g. Abayas, hijab niqab sets. Because these
                are cut and stitched after the order is placed, specifically for
                the said customer.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Exchange Policy</h2>
          <div className="space-y-4">
            <p>
              As we work on the Make-To-Order model, we cannot exchange products
              if ordered in the wrong size or on the basis of 'Change of mind'.
              Therefore, we recommend you to check our size guidelines and
              description thoroughly before you place your order.
            </p>

            <div className="mt-4 rounded-md border p-4">
              <h3 className="mb-2 font-medium">Important Notes:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Items purchased on sale are not eligible for exchange</li>
                <li>
                  A small difference in colors may happen due to screen/lighting
                  settings
                </li>
                <li>
                  The exact color of the final item may slightly vary from what
                  is seen on screen
                </li>
                <li>Products cannot be exchanged for color variations</li>
              </ul>
            </div>

            <p className="font-medium mt-4">
              Exchange Terms for Defective Products:
            </p>
            <p>
              If there is a defect or sizing issue from our end, we will request
              clear photos for verification. Exchanges are possible under these
              conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Items are unused, all tags are intact</li>
              <li>Packing is in its original condition</li>
              <li>Original invoice is present</li>
              <li>Exchange request must be made within 24 hours</li>
              <li>
                If the abaya isn't available in your size, you can pick another
                abaya or items worth the same amount
              </li>
              <li>Shipping charges will apply for the 2nd exchange</li>
            </ul>

            <p className="mt-4">Exchange Timeline:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Regular exchanges: 12-15 working days</li>
              <li>Hand-embroidered abayas: Longer processing time</li>
              <li>Ready-to-wear items (hijabs/accessories): 2-3 days</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">International Orders</h2>
          <div className="space-y-4">
            <p>
              Currently, Sigh Attire by Naseem does not have an Exchange/Return
              policy for international orders. However, if you were delivered an
              incorrect or damaged item then please contact our customer care
              department for further help.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Cancellation Policy</h2>
          <div className="space-y-4">
            <p>
              We do not offer cancellations once the order is placed. We expect
              customers to be confident about their purchase and well-informed
              about specifications and delivery time.
            </p>

            <div className="mt-4 rounded-md border p-4">
              <h3 className="mb-2 font-medium">Important Guidelines:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Re-check cart thoroughly before checkout</li>
                <li>For order modifications, contact within 24 hours</li>
                <li>Email: info@sighattirebynaseem.com</li>
                <li>WhatsApp: +92 335 4034038</li>
              </ul>
            </div>

            <div className="mt-4 rounded-md border-l-4 border-red-500 bg-red-50 p-4 dark:border-red-400 dark:bg-red-950/30">
              <p className="text-red-800 dark:text-red-200">
                <strong>Note:</strong> Customers who confirm orders and later
                refuse at the doorstep will be blacklisted.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Shipping Policy</h2>
          <div className="space-y-4">
            <h3 className="font-medium">Shipping Within Pakistan</h3>
            <div className="mt-4 rounded-md border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-400 dark:bg-green-950/30">
              <p className="text-green-800 dark:text-green-200">
                <strong>Shipping Costs:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Orders under PKR 10,000: Flat rate of PKR 250 only</li>
                <li>Orders above PKR 10,000: FREE Shipping</li>
              </ul>
            </div>
            <ul className="list-disc pl-5 space-y-2 mt-4">
              <li>Free delivery on orders above Rs. 10,000</li>
              <li>Flat delivery fee of Rs. 250 for orders below Rs. 10,000</li>
            </ul>

            <h3 className="font-medium mt-4">Order Confirmation & Payment</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>20% advance payment required</li>
              <li>
                Bank transfers and Easy Paisa are accepted for advance payment
              </li>
              <li>Remaining balance via Cash on Delivery (COD)</li>
              <li>Payment verification required before order confirmation</li>
            </ul>

            <h3 className="font-medium mt-4">Dispatching Time</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ready-to-Deliver Items: 2–3 working days</li>
              <li>Regular Products: 7–10 working days</li>
              <li>Hand-Embroidered Products: 15–20 working days</li>
            </ul>

            <h3 className="font-medium mt-4">International Deliveries</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Full payment required in advance</li>
              <li>No deliveries to India & Bangladesh</li>
              <li>Customers responsible for customs duties and taxes</li>
              <li>Tracking information provided via email</li>
            </ul>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            This policy was last updated on{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            .
          </p>
          <p className="mt-4">
            For any questions about our policies, please contact us at{" "}
            <a
              href="mailto:info@sighattirebynaseem.com"
              className="text-primary hover:underline"
            >
              info@sighattirebynaseem.com
            </a>{" "}
            or WhatsApp at +92 3354034038.
          </p>
        </div>
      </div>
    </div>
  );
}
