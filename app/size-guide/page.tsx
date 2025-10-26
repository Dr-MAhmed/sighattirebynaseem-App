import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide | (SAN) sigh Attire by Naseem",
  description:
    "Find your perfect fit with our detailed size guide for abayas and Islamic modest clothing. Learn how to measure correctly for the best fitting garments.",
};

export default function SizeGuidePage() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Size Guide</h1>
        <p className="text-muted-foreground">
          Find your perfect fit with our detailed size guide for abayas and
          Islamic clothing.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">How to Measure</h2>
          <div className="space-y-4">
            <p>
              To find your perfect size, you'll need a soft measuring tape. If
              you don't have one, you can use a string and then measure it
              against a ruler. For the most accurate measurements:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep the measuring tape snug but not tight</li>
              <li>Wear light clothing when taking measurements</li>
              <li>Have someone help you measure for more accuracy</li>
              <li>
                Stand naturally, don't hold your breath or stand unnaturally
                straight
              </li>
            </ul>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Bust/Chest</h3>
                <p className="text-sm text-muted-foreground">
                  Measure around the fullest part of your bust/chest, keeping
                  the tape parallel to the floor.
                </p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Waist</h3>
                <p className="text-sm text-muted-foreground">
                  Measure around your natural waistline, at the narrowest part
                  of your torso.
                </p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Hips</h3>
                <p className="text-sm text-muted-foreground">
                  Measure around the fullest part of your hips, usually about 8
                  inches below your waistline.
                </p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Length</h3>
                <p className="text-sm text-muted-foreground">
                  Measure from your shoulder to where you want the abaya to end
                  (typically at the ankle).
                </p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Sleeves</h3>
                <p className="text-sm text-muted-foreground">
                  Measure from the shoulder seam to where you want the sleeve to
                  end.
                </p>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 font-medium">Shoulders</h3>
                <p className="text-sm text-muted-foreground">
                  Measure from the edge of one shoulder to the other, across
                  your upper back.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Standard Abaya Size Chart
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Size</th>
                  <th className="p-3 text-left font-medium">Bust (cm)</th>
                  <th className="p-3 text-left font-medium">Waist (cm)</th>
                  <th className="p-3 text-left font-medium">Hips (cm)</th>
                  <th className="p-3 text-left font-medium">Length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">XS (50)</td>
                  <td className="p-3">96-100</td>
                  <td className="p-3">76-80</td>
                  <td className="p-3">96-100</td>
                  <td className="p-3">140-142</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">S (52)</td>
                  <td className="p-3">101-105</td>
                  <td className="p-3">81-85</td>
                  <td className="p-3">101-105</td>
                  <td className="p-3">142-144</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">M (54)</td>
                  <td className="p-3">106-110</td>
                  <td className="p-3">86-90</td>
                  <td className="p-3">106-110</td>
                  <td className="p-3">144-146</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">L (56)</td>
                  <td className="p-3">111-115</td>
                  <td className="p-3">91-95</td>
                  <td className="p-3">111-115</td>
                  <td className="p-3">146-148</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">XL (58)</td>
                  <td className="p-3">116-120</td>
                  <td className="p-3">96-100</td>
                  <td className="p-3">116-120</td>
                  <td className="p-3">148-150</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">2XL (60)</td>
                  <td className="p-3">121-125</td>
                  <td className="p-3">101-105</td>
                  <td className="p-3">121-125</td>
                  <td className="p-3">150-152</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">3XL (62)</td>
                  <td className="p-3">126-130</td>
                  <td className="p-3">106-110</td>
                  <td className="p-3">126-130</td>
                  <td className="p-3">152-154</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Note: These measurements are body measurements, not garment
            measurements. Our abayas are designed with appropriate ease for
            comfortable movement.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Sleeve Length Chart</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Size</th>
                  <th className="p-3 text-left font-medium">
                    Sleeve Length (cm)
                  </th>
                  <th className="p-3 text-left font-medium">
                    Shoulder Width (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">XS (50)</td>
                  <td className="p-3">58-59</td>
                  <td className="p-3">38-39</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">S (52)</td>
                  <td className="p-3">59-60</td>
                  <td className="p-3">40-41</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">M (54)</td>
                  <td className="p-3">60-61</td>
                  <td className="p-3">42-43</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">L (56)</td>
                  <td className="p-3">61-62</td>
                  <td className="p-3">44-45</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">XL (58)</td>
                  <td className="p-3">62-63</td>
                  <td className="p-3">46-47</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">2XL (60)</td>
                  <td className="p-3">63-64</td>
                  <td className="p-3">48-49</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">3XL (62)</td>
                  <td className="p-3">64-65</td>
                  <td className="p-3">50-51</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            International Size Conversion
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">SighAttire Size</th>
                  <th className="p-3 text-left font-medium">UK/US</th>
                  <th className="p-3 text-left font-medium">EU</th>
                  <th className="p-3 text-left font-medium">Middle East</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">XS (50)</td>
                  <td className="p-3">4-6</td>
                  <td className="p-3">34-36</td>
                  <td className="p-3">50</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">S (52)</td>
                  <td className="p-3">8-10</td>
                  <td className="p-3">38-40</td>
                  <td className="p-3">52</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">M (54)</td>
                  <td className="p-3">12-14</td>
                  <td className="p-3">42-44</td>
                  <td className="p-3">54</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">L (56)</td>
                  <td className="p-3">16-18</td>
                  <td className="p-3">46-48</td>
                  <td className="p-3">56</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">XL (58)</td>
                  <td className="p-3">20-22</td>
                  <td className="p-3">50-52</td>
                  <td className="p-3">58</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">2XL (60)</td>
                  <td className="p-3">24-26</td>
                  <td className="p-3">54-56</td>
                  <td className="p-3">60</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">3XL (62)</td>
                  <td className="p-3">28-30</td>
                  <td className="p-3">58-60</td>
                  <td className="p-3">62</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Finding Your Perfect Fit
          </h2>
          <div className="space-y-4">
            <p>
              If you're between sizes, we recommend sizing up for a more
              comfortable, modest fit. Our abayas are designed to be flowing and
              elegant, so a slightly larger size often looks better than one
              that's too tight.
            </p>
            <div className="rounded-md border-l-4 border-primary/70 bg-primary/10 p-4">
              <h3 className="mb-2 font-medium">Fit Tips:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  If your measurements fall between two sizes, choose the larger
                  size
                </li>
                <li>
                  Consider the style of the abaya - some designs are meant to be
                  more fitted than others
                </li>
                <li>
                  For layering, you may want to choose a slightly larger size
                </li>
                <li>
                  Fabric type affects fit - stretchy fabrics provide more
                  flexibility
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Custom Sizing</h2>
          <div className="space-y-4">
            <p>
              We understand that standard sizes don't work for everyone. That's
              why we offer custom sizing for most of our abayas. If you need a
              custom size:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Take your measurements following the guide above</li>
              <li>
                Contact us through our{" "}
                <a href="/contact" className="text-primary hover:underline">
                  contact form
                </a>{" "}
                or email us at
                <span className="font-medium"> custom@sighattire.com</span>
              </li>
              <li>
                Include your measurements and the style number of the abaya
                you're interested in
              </li>
              <li>
                We'll get back to you with a quote and estimated production time
              </li>
            </ol>
            <p className="mt-2">
              Please note that custom-sized items cannot be returned unless
              there is a manufacturing defect.
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t">
          <p>
            Still have questions about finding your size? Please{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact us
            </a>{" "}
            and our team will be happy to help you find the perfect fit.
          </p>
        </div>
      </div>
    </div>
  );
}
