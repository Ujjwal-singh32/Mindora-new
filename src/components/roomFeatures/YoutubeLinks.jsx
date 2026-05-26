"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Youtube, User, Calendar, Link2 } from "lucide-react";
import { toast } from "react-toastify";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

function getYoutubeThumbnail(url) {
  try {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  } catch {
    return null;
  }
}

export default function UploadedLinks({ roomId }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    const fetchLinks = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/links/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch links");
        setLinks(data.links || []);
      } catch (err) {
        toast.error(err.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [roomId]);

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Youtube className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>YouTube Links</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Video resources shared in this room</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-7"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="h-36" style={{ background: "rgba(255,255,255,0.03)" }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded-full w-3/4" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="h-3 rounded-full w-1/2" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && links.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <Youtube className="w-7 h-7" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No links yet</p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>YouTube links added to this room will appear here.</p>
          </div>
        </motion.div>
      )}

      {/* Links grid */}
      {!loading && links.length > 0 && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {links.map((link, i) => {
            const thumbnail = getYoutubeThumbnail(link.url);
            return (
              <motion.div
                key={i}
                variants={itemVariants}
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
                {/* Thumbnail / placeholder */}
                <div className="relative overflow-hidden" style={{ height: "150px" }}>
                  {thumbnail ? (
                    <>
                      <img
                        src={thumbnail}
                        alt={link.topic}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* YouTube play badge */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ background: "rgba(220,38,38,0.9)", boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}
                        >
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "rgba(124,58,237,0.07)" }}
                    >
                      <Link2 className="w-8 h-8" style={{ color: "#5e5e80" }} />
                    </div>
                  )}
                </div>

                {/* Card info + action */}
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-sm truncate mb-1" style={{ color: "#f4f4ff" }}>{link.topic}</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8888aa" }}>
                        <User className="w-3 h-3" /> {link.uploader?.name || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: "#5e5e80" }}>
                        <Calendar className="w-3 h-3" /> {new Date(link.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      color: "#fff",
                      boxShadow: "0 0 16px rgba(124,58,237,0.25)",
                      border: "1px solid rgba(124,58,237,0.4)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,0.45)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 16px rgba(124,58,237,0.25)";
                    }}
                  >
                    <ExternalLink className="w-4 h-4" /> Open Link
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}