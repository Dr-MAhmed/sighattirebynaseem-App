import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const messages = [
  "Pay in full in advance and enjoy an extra 5% off!",
  "Free Shipping on orders above 10,000 Rs.",
  "DC Rs 250 (within Pakistan) & Delivery time,",
  "7-10 working days for Regular Abayas,",
  "15-20 working days for Hand-Embroidered Abayas",
  "delay expected in case of bad weather,",
  "/public holidays/courier issues",
  "Customer Support: +92335 4034038 (Whatsapp)",
  "info@sighattirebynaseem.com (email)"
];

function MiddleBar() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Manual navigation
  const prevMessage = () => {
    setCurrent((prev) => (prev - 1 + messages.length) % messages.length);
    resetInterval();
  };

  const nextMessage = () => {
    setCurrent((prev) => (prev + 1) % messages.length);
    resetInterval();
  };

  // Reset interval on manual navigation
  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % messages.length);
    }, 5000);
  };

  return (
    <div className="w-full bg-[#B870DB] dark:bg-[#222] py-2 flex items-center justify-center relative">
      <button
        className="absolute left-4 text-white p-1 rounded-full hover:bg-[#333] transition md:left-8"
        onClick={prevMessage}
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-sm text-white px-8">{messages[current]}</span>
      <button
        className="absolute right-4 text-white p-1 rounded-full hover:bg-[#333] transition md:right-8"
        onClick={nextMessage}
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default MiddleBar;