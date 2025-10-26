import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | (SAN) sigh Attire by Naseem",
  description:
    "Learn how Sigh Attire by Naseem collects, uses, and protects your personal information. Our privacy policy outlines our commitment to safeguarding your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
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
              Sigh Attire by Naseem respects your privacy and is committed to
              protecting your personal data. This privacy policy explains how we
              collect, use, disclose, and safeguard your information when you
              visit our website, use our services, or make a purchase.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree
              with the terms of this privacy policy, please do not access the
              site. We reserve the right to make changes to this privacy policy
              at any time and for any reason. Any changes will be effective
              immediately upon posting the updated privacy policy on the
              website.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Information We Collect</h2>
          <div className="space-y-4">
            <p>
              We may collect personal data from you in several ways, including:
            </p>

            <h3 className="mt-6 mb-2 text-base font-medium">
              Personal Data You Provide
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Contact information (name, email address, phone number, shipping
                and billing address)
              </li>
              <li>Account information (username, password)</li>
              <li>
                Payment information (credit card details, bank account numbers)
              </li>
              <li>Order information (products purchased, order history)</li>
              <li>Communication information (inquiries, feedback, reviews)</li>
              <li>Profile information (preferences, sizes, wishlist)</li>
            </ul>

            <h3 className="mt-6 mb-2 text-base font-medium">
              Automatically Collected Data
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Device information (IP address, browser type, operating system)
              </li>
              <li>
                Usage data (pages visited, time spent on site, links clicked)
              </li>
              <li>Location data (country, region, city)</li>
              <li>Cookie data (for website functionality and analytics)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            How We Use Your Information
          </h2>
          <div className="space-y-4">
            <p>We use your personal data for various purposes, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Processing and fulfilling your orders</li>
              <li>Creating and managing your account</li>
              <li>
                Communicating with you about orders, products, services, and
                promotions
              </li>
              <li>Providing customer support</li>
              <li>Improving our website, products, and services</li>
              <li>Processing payments and preventing fraud</li>
              <li>Complying with legal obligations</li>
              <li>Personalizing your shopping experience</li>
              <li>Sending marketing communications (with your consent)</li>
              <li>Analyzing customer behavior to improve our offerings</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Information Sharing and Disclosure
          </h2>
          <div className="space-y-4">
            <p>
              We may share your personal data with third parties in certain
              circumstances, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Service Providers:</span> We may
                share your information with third-party vendors, service
                providers, and other business partners who perform services on
                our behalf, such as payment processing, shipping, data analysis,
                email delivery, and customer service.
              </li>
              <li>
                <span className="font-medium">Legal Requirements:</span> We may
                disclose your information if required to do so by law or in
                response to valid requests by public authorities (e.g., a court
                or government agency).
              </li>
              <li>
                <span className="font-medium">Business Transfers:</span> If we
                are involved in a merger, acquisition, or sale of all or a
                portion of our assets, your information may be transferred as
                part of that transaction.
              </li>
              <li>
                <span className="font-medium">With Your Consent:</span> We may
                share your information with third parties when we have your
                consent to do so.
              </li>
            </ul>
            <p>
              We do not sell, rent, or lease your personal information to third
              parties without your consent.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Cookies and Tracking Technologies
          </h2>
          <div className="space-y-4">
            <p>
              We use cookies and similar tracking technologies to collect and
              track information about your browsing activities on our website.
              Cookies are small data files that are placed on your device when
              you visit a website.
            </p>
            <p>The types of cookies we use include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Essential Cookies:</span>{" "}
                Necessary for the website to function properly.
              </li>
              <li>
                <span className="font-medium">
                  Analytical/Performance Cookies:
                </span>{" "}
                Allow us to recognize and count the number of visitors and see
                how visitors move around our website.
              </li>
              <li>
                <span className="font-medium">Functionality Cookies:</span>{" "}
                Enable the website to provide enhanced functionality and
                personalization.
              </li>
              <li>
                <span className="font-medium">Targeting Cookies:</span> Record
                your visit to the website, the pages you visit, and the links
                you follow.
              </li>
            </ul>
            <p>
              You can set your browser to refuse all or some browser cookies or
              to alert you when websites set or access cookies. However, if you
              disable or refuse cookies, some parts of the website may become
              inaccessible or not function properly.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Data Security</h2>
          <div className="space-y-4">
            <p>
              We have implemented appropriate security measures to protect your
              personal data from accidental loss, unauthorized access, use,
              alteration, and disclosure. These measures include data
              encryption, secure payment processing, regular security
              assessments, and restricted access to personal information.
            </p>
            <p>
              While we strive to use commercially acceptable means to protect
              your personal data, no method of transmission over the Internet or
              method of electronic storage is 100% secure. Therefore, we cannot
              guarantee its absolute security.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Your Rights</h2>
          <div className="space-y-4">
            <p>
              Depending on your location, you may have certain rights regarding
              your personal data, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to rectify or update your personal data</li>
              <li>The right to delete your personal data</li>
              <li>
                The right to restrict or object to the processing of your
                personal data
              </li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the
              information provided in the "Contact Us" section below.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Children's Privacy</h2>
          <div className="space-y-4">
            <p>
              Our website is not intended for children under the age of 13. We
              do not knowingly collect personal data from children under 13. If
              you are a parent or guardian and believe that your child has
              provided us with personal data, please contact us immediately so
              that we can take necessary actions.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            International Data Transfers
          </h2>
          <div className="space-y-4">
            <p>
              Your personal data may be transferred to, and processed in,
              countries other than the country in which you reside. These
              countries may have data protection laws that are different from
              the laws of your country.
            </p>
            <p>
              When we transfer your personal data to other countries, we will
              take appropriate measures to protect your personal data in
              accordance with this privacy policy and applicable law.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Contact Us</h2>
          <div className="space-y-4">
            <p>
              If you have any questions or concerns about this privacy policy or
              our privacy practices, please contact us at:
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
            By using our website, you consent to the terms of this privacy
            policy.
          </p>
        </div>
      </div>
    </div>
  );
}
