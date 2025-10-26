import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - (SAN) Sigh Attire by Naseem",
  description: `Doing business has always been a dream of mine — a passion quietly tucked
            away in my heart. I used to hesitate at the first step, unsure of how to begin.
            But one day, I made up my mind and turned to Allah with full trust. I came
            across the verse: "And when you have decided, then rely upon Allah. Indeed,
            Allah loves those who rely upon Him." (Qur'an 3:159–160). I was reminded of
            the hadith that "Nine out of ten sources of sustenance lie in trade," and
            inspired deeply by the legacy of the first businesswoman in Islam, Hazrat
            Khadija (s.a). From that moment on, I witnessed how Allah made the path
            easier for me — from the tiniest details to the biggest decisions — guiding me
            gently as I built this brand.`,
};

export default function AboutPage() {
  return (
    <div className="container px-4 py-16 mx-auto md:py-24">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 font-serif text-4xl md:text-5xl">Our Story</h1>
        <p className="text-lg text-muted-foreground">Sigh Attire by Naseem</p>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto space-y-12">
        {/* First Section */}
        <section className="space-y-6">
          <p className="text-lg leading-relaxed">
            Doing business has always been a dream of mine — a passion quietly
            tucked away in my heart. I used to hesitate at the first step,
            unsure of how to begin. But one day, I made up my mind and turned to
            Allah with full trust. I came across the verse: "And when you have
            decided, then rely upon Allah. Indeed, Allah loves those who rely
            upon Him." (Qur'an 3:159–160). I was reminded of the hadith that
            "Nine out of ten sources of sustenance lie in trade," and inspired
            deeply by the legacy of the first businesswoman in Islam, Hazrat
            Khadija (s.a). From that moment on, I witnessed how Allah made the
            path easier for me — from the tiniest details to the biggest
            decisions — guiding me gently as I built this brand.
          </p>
          <p className="text-lg italic font-medium">Alhamdulilah.</p>
        </section>

        <Separator className="my-8" />

        {/* Second Section */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl">The Beginning</h2>
          <p className="text-lg leading-relaxed">
            Sigh Attire by Naseem was born from something deeply personal — a
            feeling, a moment, a woman.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Third Section */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl">The Inspiration</h2>
          <p className="text-lg leading-relaxed">
            My mother, Naseem, is the soul of this brand — a woman of grace,
            dignity, and modesty that never needed to be spoken aloud to be
            seen. The way she carries herself, the calm in her voice, the
            elegance in her presence — it is like a sigh: soft, yet powerful.
            She taught me that the most meaningful things in life don't come
            with noise — they come with depth, with feeling, with presence.
          </p>
          <p className="text-lg italic font-medium">
            This brand is my tribute to her.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Fourth Section */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl">The Meaning</h2>
          <p className="text-lg leading-relaxed">
            The word "sigh" means many things — relief, presence, emotion. To
            me, it's that calm exhale when something feels just right. That's
            how I want Sigh Attire to feel. Not dramatic. Not trend-chasing.
            Just quietly right.
          </p>
          <p className="text-lg leading-relaxed">
            Our pieces are designed for women who want to feel at ease in their
            clothing — not hidden, not dressed up for anyone else — but
            genuinely at home in what they wear. The kind of outfit that doesn't
            just suit the moment, but suits you.
          </p>
        </section>

        <Separator className="my-8" />

        {/* Final Section */}
        <section className="text-center">
          <h2 className="mb-4 font-serif text-2xl md:text-3xl">
            Welcome to Sigh Attire by Naseem
          </h2>
          <p className="text-lg font-medium">
            — because modesty deserves to be felt, not just seen! —
          </p>
        </section>
      </div>
    </div>
  );
}
