import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | (SAN) sigh Attire by Naseem",
  description:
    "Learn about our shipping methods, delivery times, and costs. Find information on international shipping and tracking your order.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Shipping Policy</h1>
        <p className="text-muted-foreground">
          Information about our shipping methods, delivery times, and costs.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Processing Time</h2>
          <div className="space-y-4">
            <p>
              All orders are processed within 10-15 business days. Custom orders
              may require additional processing time, typically 2-3 weeks
              depending on the complexity of the design and our current
              workload.
            </p>
            <p>
              Once your order has been processed and shipped, you will receive a
              confirmation email with tracking information. Please note that
              processing times do not include weekends or holidays.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Shipping Within Pakistan
          </h2>
          <div className="space-y-4">
            <p>
              We offer shipping to all major cities within Pakistan. Delivery
              typically takes 10-15 business days from the shipping date,
              depending on your location.
            </p>
            <div className="mt-4 rounded-md border p-4">
              <h3 className="mb-2 font-medium">Shipping Costs:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Orders under PKR 5,000: Flat rate of PKR 300</li>
                <li>
                  Orders over PKR 5,000: <strong>FREE shipping</strong>
                </li>
              </ul>
            </div>
            <p>
              We use reliable courier services within Pakistan to ensure your
              package arrives safely and on time.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">International Shipping</h2>
          <div className="space-y-4">
            <p>
              We ship to most countries worldwide. International shipping
              typically takes 15-20 business days from the shipping date,
              depending on your location and customs processing times.
            </p>
            <div className="mt-4 rounded-md border p-4">
              <h3 className="mb-2 font-medium">
                International Shipping Costs:
              </h3>
              <p>
                International shipping costs are calculated at checkout based on
                the destination country, package weight, and delivery method
                selected.
              </p>
              <p className="mt-2">
                <strong>Average shipping costs by region:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Middle East: $20-30 USD</li>
                <li>Europe: $30-45 USD</li>
                <li>North America: $35-50 USD</li>
                <li>Asia: $25-40 USD</li>
                <li>Australia & New Zealand: $40-55 USD</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Customs, Duties, and Taxes
          </h2>
          <div className="space-y-4">
            <p>
              International customers are responsible for all customs duties,
              taxes, and import fees that may be imposed by their country's
              government. These fees are not included in the purchase price or
              shipping cost and are collected directly by your country's customs
              agency.
            </p>
            <p>
              We are legally required to declare the actual value of merchandise
              on customs forms and cannot mark packages as "gifts" or reduce the
              declared value to avoid customs fees.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Tracking Your Order</h2>
          <div className="space-y-4">
            <p>
              All shipments include tracking information that will be sent to
              you via email once your order ships. You can use this tracking
              number on our website or directly with the shipping carrier to
              monitor your package's progress.
            </p>
            <p>
              If you have any questions about your tracking information or
              shipment status, please
              <a href="/contact" className="text-primary hover:underline">
                {" "}
                contact us
              </a>{" "}
              with your order number.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Delivery Delays</h2>
          <div className="space-y-4">
            <p>
              While we make every effort to ensure timely delivery, we cannot
              guarantee specific delivery dates. Shipping delays can
              occasionally occur due to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Weather conditions and natural disasters</li>
              <li>Customs delays for international shipments</li>
              <li>High volume periods (e.g., Eid, Ramadan)</li>
              <li>Incorrect or incomplete delivery addresses</li>
              <li>Local courier service constraints</li>
            </ul>
            <p>
              We appreciate your understanding in case of any unforeseen delays.
              If your package is significantly delayed, please{" "}
              <a href="/contact" className="text-primary hover:underline">
                contact us
              </a>{" "}
              for assistance.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
          <div className="space-y-4">
            <p>
              It is the customer's responsibility to provide accurate and
              complete shipping information. We cannot be held responsible for
              delivery delays or failed deliveries due to incorrect address
              information.
            </p>
            <p>
              If you need to change your shipping address after placing an
              order, please contact us as soon as possible. We will try to
              accommodate your request if the order has not yet been shipped.
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            This shipping policy was last updated on{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            .
          </p>
          <p className="mt-4">
            If you have any questions about our shipping policy, please
            <a href="/contact" className="text-primary hover:underline">
              {" "}
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
