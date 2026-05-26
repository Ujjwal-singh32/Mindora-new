"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Megaphone, Calendar, User, Loader2 } from "lucide-react";

export default function AnnouncementsPage({ roomId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [roomId]);

  const fetchAnnouncements = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/announcements/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.announcements || []);
      } else {
        console.error(data.message || "Failed to fetch announcements");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = el;
      if (scrollTop + clientHeight >= scrollHeight - 100 && !loadingMore) {
        loadMore();
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadingMore]);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => setLoadingMore(false), 800);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.06 } }),
  };

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Megaphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Announcements</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Updates and notices from room admins</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-8"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Loading skeletons */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <Megaphone className="w-7 h-7" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No announcements yet</p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>When admins post announcements, they will appear here.</p>
          </div>
        </motion.div>
      ) : (
        <div ref={containerRef} className="space-y-4">
          {announcements.map((a, i) => (
            <motion.div
              key={a._id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl p-5 transition-all duration-200"
              style={{
                background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(124,58,237,0.22)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.55)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(124,58,237,0.14)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.22)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Top row: icon + title + date */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                  >
                    <Megaphone className="w-4 h-4" style={{ color: "#a78bfa" }} />
                  </div>
                  <h3 className="font-semibold text-base truncate" style={{ color: "#f4f4ff" }}>
                    {a.topic}
                  </h3>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 text-xs"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "#8888aa",
                  }}
                >
                  <Calendar className="w-3 h-3" />
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Body */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#c4b5fd", opacity: 0.85 }}>
                {a.body}
              </p>

              {/* Footer: announced by */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: "#8888aa" }} />
                </div>
                <p className="text-xs" style={{ color: "#5e5e80" }}>
                  Announced by{" "}
                  <span className="font-semibold" style={{ color: "#8888aa" }}>{a.uploaderName}</span>
                </p>
              </div>
            </motion.div>
          ))}

          {/* Load more indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 py-4" style={{ color: "#8888aa" }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading more…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}