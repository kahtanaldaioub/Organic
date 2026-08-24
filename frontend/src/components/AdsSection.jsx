// src/components/AdsSection.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import AdCard from "./AdCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdsSection() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await API.get("/ads/active");
        console.log("📢 Active ads fetched:", res.data); // Debug log
        setAds(res.data);
      } catch (err) {
        console.error("Failed to load ads:", err);
        setError("Failed to load sponsored products");
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="animate-spin text-green-600" /></div>;
  if (error) return null; // Hide on error
  if (ads.length === 0) return null; // Hide if no ads

  return (
    <div className="relative mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-yellow-500">✦</span> Sponsored Products
      </h3>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 scrollbar-hide snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ads.map((ad) => (
            <div key={ad._id} className="snap-start">
              <AdCard ad={ad} />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}