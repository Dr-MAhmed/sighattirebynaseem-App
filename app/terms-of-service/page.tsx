import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | (SAN) sigh Attire by Naseem",
  description:
    "Read our Terms of Service to understand the rules and guidelines for using our website and services. These terms outline your rights and responsibilities as a customer.",
};

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          Terms of Service
        </h1>
        <p className="text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Introduction</h2>
          <div className="space-y-4">
            <p>
              Welcome to Sigh Attire by Naseem. These Terms of Service ("Terms")
              govern your use of our website, located at
              https://sighattirebynaseem.com (the "Site"), and the services we
              offer (collectively, the "Services").
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these
              Terms. If you do not agree to these Terms, please do not use our
              Services.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Any
              changes will be effective immediately upon posting on the Site.
              Your continued use of the Services following the posting of
              revised Terms means that you accept and agree to the changes.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Account Registration</h2>
          <div className="space-y-4">
            <p>
              To access certain features of the Site, you may be required to
              register for an account. You agree to provide accurate, current,
              and complete information during the registration process and to
              update such information to keep it accurate, current, and
              complete.
            </p>
            <p>
              You are responsible for safeguarding your password and for all
              activities that occur under your account. You agree to immediately
              notify us of any unauthorized use of your account or any other
              breach of security.
            </p>
            <p>
              We reserve the right to terminate your account, refuse service,
              and cancel orders at our sole discretion, including, without
              limitation, if we believe that your conduct violates applicable
              law or is harmful to our interests or the interests of another
              user or third party.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Products and Orders</h2>
          <div className="space-y-4">
            <p>
              All product descriptions, including pricing and availability, are
              subject to change without notice. We reserve the right to
              discontinue any product at any time.
            </p>
            <p>
              We make every effort to display as accurately as possible the
              colors and images of our products. However, we cannot guarantee
              that your computer's display will accurately reflect the actual
              color of the products.
            </p>
            <p>
              All orders are subject to acceptance and availability. We reserve
              the right to refuse any order placed with us. Once we receive your
              order, we will send you an email confirming receipt of your order.
              This email confirmation will constitute an acceptance of your
              order.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Pricing and Payment</h2>
          <div className="space-y-4">
            <p>
              All prices are displayed in Pakistani Rupees (PKR) unless
              otherwise specified and are inclusive of applicable taxes.
              Shipping costs are not included in the product prices and will be
              calculated and displayed at checkout.
            </p>
            <p>
              We accept various payment methods, including Easy Paisa, Cash on
              Delivery, bank transfers. By providing a payment method, you
              represent and warrant that you are authorized to use the
              designated payment method and that you authorize us to charge your
              payment method for the total amount of your order (including taxes
              and shipping costs).
            </p>
            <p>
              If the payment method you provide cannot be verified, is invalid,
              or is otherwise not acceptable, your order may be suspended or
              canceled. You are responsible for resolving any problems we
              encounter in processing your payment.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Shipping and Delivery</h2>
          <div className="space-y-4">
            <p>
              We ship to most locations within Pakistan and internationally.
              Delivery times may vary depending on your location, the shipping
              method selected, and other factors beyond our control.
            </p>
            <p>
              We are not responsible for delays in shipping or delivery due to
              circumstances beyond our reasonable control, including, but not
              limited to, acts of God, natural disasters, customs delays, or
              carrier delays.
            </p>
            <p>
              Risk of loss and title for items purchased from our Site pass to
              you upon delivery of the items to the carrier. You are responsible
              for filing any claims with carriers for damaged or lost shipments.
            </p>
            <p>
              For detailed information about shipping methods, delivery times,
              and costs, please refer to our
              <a
                href="/shipping-policy"
                className="text-primary hover:underline"
              >
                {" "}
                Shipping Policy
              </a>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Returns and Refunds</h2>
          <div className="space-y-4">
            <p>
              We want you to be completely satisfied with your purchase. If you
              are not satisfied, you may be eligible to return or exchange the
              product according to our{" "}
              <a
                href="/returns-policy"
                className="text-primary hover:underline"
              >
                Returns Policy
              </a>
              .
            </p>
            <p>
              Custom-made or personalized items cannot be returned unless they
              are defective or not as described. Please carefully review the
              product details before placing an order for custom items.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Intellectual Property Rights
          </h2>
          <div className="space-y-4">
            <p>
              The Site and its entire contents, features, and functionality
              (including but not limited to all information, text, displays,
              images, graphics, video, audio, design, selection, and
              arrangement) are owned by Sigh Attire by Naseem, its licensors, or
              other providers of such material and are protected by copyright,
              trademark, patent, trade secret, and other intellectual property
              or proprietary rights laws.
            </p>
            <p>
              You may access, use, and display the Site and its contents for
              your personal, non-commercial use only. You must not reproduce,
              distribute, modify, create derivative works from, publicly
              display, publicly perform, republish, download, store, or transmit
              any of the material on our Site except as generally and ordinarily
              permitted through the Site according to these Terms.
            </p>
            <p>
              Any use of the Site not expressly permitted by these Terms is a
              breach of these Terms and may violate copyright, trademark, and
              other laws.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">User Content</h2>
          <div className="space-y-4">
            <p>
              Our Site may allow you to post, submit, publish, display, or
              transmit content such as product reviews, comments, or other
              materials ("User Content").
            </p>
            <p>
              By providing User Content, you grant us and our affiliates and
              service providers a non-exclusive, royalty-free, perpetual,
              irrevocable, and fully sublicensable right to use, reproduce,
              modify, adapt, publish, translate, create derivative works from,
              distribute, perform, and display such User Content throughout the
              world in any media.
            </p>
            <p>You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                You own or control all rights in and to the User Content you
                provide.
              </li>
              <li>
                All User Content is accurate, not misleading, and does not
                violate these Terms.
              </li>
              <li>
                The User Content does not infringe, misappropriate, or violate
                any third party's rights.
              </li>
              <li>
                The User Content does not contain any defamatory, obscene,
                offensive, or otherwise unlawful material.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Prohibited Uses</h2>
          <div className="space-y-4">
            <p>You agree not to use the Site:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                In any way that violates any applicable law or regulation.
              </li>
              <li>
                To transmit or procure the sending of any advertising or
                promotional material without our prior consent.
              </li>
              <li>
                To impersonate or attempt to impersonate the company, a company
                employee, another user, or any other person or entity.
              </li>
              <li>
                To engage in any conduct that restricts or inhibits anyone's use
                or enjoyment of the Site.
              </li>
              <li>
                To attempt to gain unauthorized access to, interfere with,
                damage, or disrupt any parts of the Site, the server on which
                the Site is stored, or any server, computer, or database
                connected to the Site.
              </li>
              <li>
                To attack the Site via a denial-of-service attack or a
                distributed denial-of-service attack.
              </li>
              <li>
                To use any robot, spider, or other automatic device, process, or
                means to access the Site for any purpose, including monitoring
                or copying any material on the Site.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Disclaimer of Warranties
          </h2>
          <div className="space-y-4">
            <p>
              THE SITE AND ALL PRODUCTS AND SERVICES OFFERED THROUGH THE SITE
              ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p>
              WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT
              LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
              THE SITE WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE
              CORRECTED, OR THAT THE SITE OR THE SERVER THAT MAKES IT AVAILABLE
              ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Limitation of Liability
          </h2>
          <div className="space-y-4">
            <p>
              IN NO EVENT WILL WE, OUR AFFILIATES, OR THEIR LICENSORS, SERVICE
              PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR
              DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN
              CONNECTION WITH YOUR USE OR INABILITY TO USE THE SITE, ANY
              WEBSITES LINKED TO IT, ANY CONTENT ON THE SITE OR SUCH OTHER
              WEBSITES, OR ANY PRODUCTS OR SERVICES PURCHASED THROUGH THE SITE,
              INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Indemnification</h2>
          <div className="space-y-4">
            <p>
              You agree to defend, indemnify, and hold us harmless from and
              against any claims, liabilities, damages, judgments, awards,
              losses, costs, expenses, or fees (including reasonable attorneys'
              fees) arising out of or relating to your violation of these Terms
              or your use of the Site.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Governing Law and Jurisdiction
          </h2>
          <div className="space-y-4">
            <p>
              These Terms and any dispute or claim arising out of or in
              connection with them shall be governed by and construed in
              accordance with the laws of Pakistan. Any legal suit, action, or
              proceeding arising out of, or related to, these Terms or the Site
              shall be instituted exclusively in the courts of Pakistan.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
          <div className="space-y-4">
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-2 ml-4">
              <p className="font-medium">Sigh Attire by Naseem</p>
              <p>Lahore, Pakistan</p>
              <p>Email: info@sighattirebynaseem.com</p>
              <p>Phone: +92 3354034038</p>
            </div>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p className="text-center text-sm text-muted-foreground">
            By using our website, you acknowledge that you have read,
            understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
