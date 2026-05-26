"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ArrowLeft, ImageIcon, User, Calendar, Images } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
};

export default function UploadedImages({ roomId }) {
  const { user } = useUser();
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/images/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch images");
        setImages(
          data.images.map((img, index) => ({
            id: index + 1,
            topic: img.topic,
            uploadedBy: img.uploader?.name || "Unknown",
            date: new Date(img.date).toLocaleDateString(),
            url: img.link,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Error fetching images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [roomId]);

  // ── VIEW MODE ──────────────────────────────────────────────────────────────
  if (selectedImage) {
    return (
      <div className="p-5 md:p-7 min-h-full flex flex-col" style={{ color: "#f4f4ff" }}>
        {/* View header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <button
            onClick={() => setSelectedImage(null)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#a78bfa",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(124,58,237,0.12)";
              e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Images
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold truncate" style={{ color: "#f4f4ff" }}>
              {selectedImage.topic}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "#8888aa" }}>
              <User className="w-3.5 h-3.5" /> {selectedImage.uploadedBy}
            </span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: "#8888aa" }}>
              <Calendar className="w-3.5 h-3.5" /> {selectedImage.date}
            </span>
          </div>
        </div>

        {/* Image display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
            border: "1px solid rgba(124,58,237,0.18)",
            minHeight: "520px",
          }}
        >
          <img
            src={selectedImage.url}
            alt={selectedImage.topic}
            className="w-full h-full object-contain"
            style={{ maxHeight: "560px" }}
          />
        </motion.div>
      </div>
    );
  }

  // ── LIST MODE ──────────────────────────────────────────────────────────────
  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Images className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Uploaded Images</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Browse images shared in this room</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-7"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="h-48" style={{ background: "rgba(255,255,255,0.03)" }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded-full w-3/4" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="h-3 rounded-full w-1/2" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && images.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <ImageIcon className="w-7 h-7" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No images yet</p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>Images uploaded to this room will appear here.</p>
          </div>
        </motion.div>
      )}

      {/* Image grid */}
      {!loading && images.length > 0 && (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {images.map((img) => (
            <motion.div
              key={img.id}
              variants={cardVariants}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,58,237,0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Image area */}
              <div className="relative overflow-hidden" style={{ height: "180px" }}>
                <img
                  src={img.url}
                  alt={img.topic}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(7,7,15,0.55)" }}
                >
                  <button
                    onClick={() => setSelectedImage(img)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      color: "#fff",
                      boxShadow: "0 0 20px rgba(124,58,237,0.5)",
                      border: "1px solid rgba(124,58,237,0.5)",
                    }}
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                </div>
              </div>

              {/* Card info */}
              <div className="p-3 flex flex-col gap-1">
                <p className="font-semibold truncate text-sm" style={{ color: "#f4f4ff" }}>{img.topic}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8888aa" }}>
                    <User className="w-3 h-3" /> {img.uploadedBy}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "#5e5e80" }}>
                    <Calendar className="w-3 h-3" /> {img.date}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}