"use client"
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

const NamazChaddarShowcase = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      if (imageRef.current) {
        setDimensions({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <section className="relative container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold w-full">BEST-SELLER</h2>
      </div>
      <div className="flex justify-center w-full">
        <div
          ref={imageRef}
          className="
            relative w-full h-[28rem] md:w-[90%] md:h-[32rem]
            bg-[url('/bestsellernoor.jpeg')]
            lg:bg-[url('/bestSellerPhoto.png')]
            bg-cover bg-center rounded-sm
          "
        >
          {/* Background image is set via Tailwind classes above */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-32">
            {/* <p className="text-primary text-7xl font-light drop-shadow mb-2">BEST SELLER</p> */}
            <Link
              href="/categories/prayer-namaz-chadar"
              className="bg-primary text-white rounded-lg shadow-lg px-3 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors duration-200"
            >
              EXPLORE ALL NAMAZ CHADDARS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NamazChaddarShowcase;