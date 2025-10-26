"use client";
import { useEffect, useState } from "react";

const reviews = [
  {
    id: 1,
    name: "Maryam Rao",
    rating: 5,
    comment: "Who needs a cape when you’ve a velvet abaya? Now this is my fav one.",
    location: "Karachi"
  },
  {
    id: 2,
    name: "Maryam Malik",
    rating: 5,
    comment: "Your Cashmere winter scarf is so beautiful, seriously!",
    location: "Lahore"
  },
  {
    id: 3,
    name: "Rahila Khanum",
    rating: 5,
    comment: "MashaAllah Abayas and Packaging are very nice",
    location: "Narowal"
  },
  {
    id: 4,
    name: "Soma Sufan",
    rating: 5,
    comment: "I gifted my mom the Hijar and SunDusk abaya. She loved them a lot—especially the beautiful packaging. Thank you for the handwritten letter you wrote for her",
    location: "Lahore"
  },
  {
    id: 5,
    name: "Sumbal Zahra",
    rating: 5,
    comment: "Salam, I loved the color combination of Azal Abaya. Even my husband liked it alot. The packaging was lovely and the abaya had a beautiful fragrance",
    location: "Daska"
  }
];

export default function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-primary/5 py-16 dark:bg-primary/10">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold uppercase tracking-tight">
          What Our Clients Say About Us
        </h2>
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="w-full flex-shrink-0 px-4"
              >
                <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                  <div className="mb-4 flex items-center">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mb-4 text-lg italic text-gray-600 dark:text-gray-300">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {review.location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentIndex ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 