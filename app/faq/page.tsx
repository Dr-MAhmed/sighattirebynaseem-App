import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ | (SAN) sigh Attire by Naseem",
  description:
    "Find answers to frequently asked questions about our modest Islamic clothing, ordering process, shipping, returns, and more at Sigh Attire by Naseem.",
};

export default function FAQPage() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground">
          Find answers to common questions about our products, ordering,
          shipping, and more.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-6 text-xl font-semibold">Products & Sizing</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sizing-guide">
              <AccordionTrigger>
                How do I find my correct size?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  We recommend referring to our detailed size guide available on
                  our website. For each product, you'll find specific
                  measurements. If you're between sizes, we suggest going up a
                  size for a more comfortable fit.
                </p>
                <p className="mt-2">
                  You can view our complete size guide{" "}
                  <a href="/size-guide" className="underline text-primary">
                    here
                  </a>
                  .
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="materials">
              <AccordionTrigger>
                What materials do you use for your abayas?
              </AccordionTrigger>
              <AccordionContent>
                We use premium quality fabrics for all our abayas, including
                silk blend, crepe, chiffon, and cotton depending on the design.
                All materials are carefully selected for comfort, durability,
                and to maintain modest coverage while looking elegant.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care-instructions">
              <AccordionTrigger>
                How should I care for my abaya?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  Most of our abayas are dry clean only to maintain their
                  quality and shape. Always check the care label attached to
                  your garment for specific instructions.
                </p>
                <p className="mt-2">General care tips:</p>
                <ul className="pl-5 mt-2 list-disc">
                  <li>Store on padded hangers to maintain shape</li>
                  <li>Keep away from direct sunlight when storing</li>
                  <li>Steam rather than iron when possible</li>
                  <li>
                    If hand washing is recommended, use cold water and mild
                    detergent
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="custom-designs">
              <AccordionTrigger>Do you offer custom designs?</AccordionTrigger>
              <AccordionContent>
                Yes, we offer custom design services for special occasions. You
                can reach out to us with your specific requirements, and our
                design team will work with you to create a bespoke abaya that
                meets your needs. Please note that custom orders require
                additional time for design and production.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="mb-6 text-xl font-semibold">Orders & Shipping</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="processing-time">
              <AccordionTrigger>
                How long does it take to process my order?
              </AccordionTrigger>
              <AccordionContent>
                Most orders are processed within 10-15 business days. Custom
                orders may take up to 2-3 weeks depending on complexity and
                current workload.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping-time">
              <AccordionTrigger>
                What are the shipping times and costs?
              </AccordionTrigger>
              <AccordionContent>
                <p>Shipping times and costs vary by location:</p>
                <ul className="pl-5 mt-2 list-disc">
                  <li>
                    Within Pakistan: 10-15 business days (Free shipping on
                    orders over PKR 10,000)
                  </li>
                  <li>
                    International shipping: 15-20 business days (Shipping costs
                    calculated at checkout)
                  </li>
                </ul>
                <p className="mt-2">
                  You can view our complete shipping policy{" "}
                  <a href="/shipping-policy" className="underline text-primary">
                    here
                  </a>
                  .
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="order-tracking">
              <AccordionTrigger>How can I track my order?</AccordionTrigger>
              <AccordionContent>
                Once your order ships, you'll receive a confirmation email with
                a tracking number. You can use this tracking number on the
                shipping carrier to monitor your package's progress.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="international-orders">
              <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
              <AccordionContent>
                Yes, we ship to most countries worldwide. International
                customers may be responsible for any customs duties, taxes, or
                import fees levied by their country. These fees are not included
                in our shipping costs and are the responsibility of the
                customer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="mb-6 text-xl font-semibold">Returns & Exchanges</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="return-policy">
              <AccordionTrigger>What is your return policy?</AccordionTrigger>
              <AccordionContent>
                <p>
                  We accept returns within 14 days of delivery for unused items
                  in their original packaging. Custom orders are non-returnable.
                </p>
                <p className="mt-2">
                  For full details, please see our{" "}
                  <a href="/returns-policy" className="underline text-primary">
                    returns policy
                  </a>
                  .
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="exchange-process">
              <AccordionTrigger>How do I exchange an item?</AccordionTrigger>
              <AccordionContent>
                To exchange an item, please contact us within 24 hours of
                receiving your order. Items must be unworn, in original
                condition with all tags attached. We'll help you process the
                exchange for a different size or product of equal value.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="damaged-items">
              <AccordionTrigger>
                What if my item arrives damaged?
              </AccordionTrigger>
              <AccordionContent>
                If your item arrives damaged, please contact us immediately with
                photos of the damage. We'll arrange for a replacement or refund
                as quickly as possible.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <h2 className="mb-6 text-xl font-semibold">Payment & Security</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="payment-methods">
              <AccordionTrigger>
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent>
                We accept bank transfers only for international orders. For
                customers in Pakistan, we offer bank transfers, easy paisa and
                cash on delivery.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="secure-payment">
              <AccordionTrigger>
                Is my payment information secure?
              </AccordionTrigger>
              <AccordionContent>
                Yes, We accept bank transfers only for international orders. For
                customers in Pakistan, we offer bank transfers, easy paisa and
                cash on delivery.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <div className="pt-8 mt-12 text-center border-t">
          <h2 className="mb-4 text-xl font-semibold">Still have questions?</h2>
          <p className="mb-6 text-muted-foreground">
            If you couldn't find the answer to your question, please don't
            hesitate to contact us.
          </p>
          <div className="flex justify-center">
            <a
              href="/contact"
              className="px-6 py-3 text-sm font-medium rounded-md shadow bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
