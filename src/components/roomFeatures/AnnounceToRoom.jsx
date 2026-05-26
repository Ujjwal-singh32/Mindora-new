"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function UploadAnnouncement({ roomId }) {
  const { user } = useUser();
  const [form, setForm] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [message, setMessage] = useState("");

  const [titleFocus, setTitleFocus] = useState(false);
  const [bodyFocus, setBodyFocus] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setStatus("error");
      setMessage("You must be logged in to post announcements.");
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const res = await fetch("/api/announcements/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          userId: user.id,
          topic: form.title,
          body: form.body,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Announcement posted successfully!");
        setForm({ title: "", body: "" });
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to upload announcement");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Failed to upload announcement.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
    boxShadow: focused ? "0 0 0 3px rgba(124,58,237,0.1)" : "none",
    color: "#f4f4ff",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
  });

  const canSubmit = form.title.trim() && form.body.trim() && !loading;

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
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Post Announcement</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Broadcast a message to all room members</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-8"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Title field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" style={{ color: "#a78bfa" }}>
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter announcement title"
              required
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={inputStyle(titleFocus)}
              onFocus={() => setTitleFocus(true)}
              onBlur={() => setTitleFocus(false)}
            />
          </div>

          {/* Body field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" style={{ color: "#a78bfa" }}>
              Body
            </label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="Write the announcement details..."
              required
              rows={5}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none"
              style={{ ...inputStyle(bodyFocus), lineHeight: "1.6" }}
              onFocus={() => setBodyFocus(true)}
              onBlur={() => setBodyFocus(false)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
            style={
              canSubmit
                ? {
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    color: "#fff",
                    boxShadow: "0 0 24px rgba(124,58,237,0.35)",
                    cursor: "pointer",
                  }
                : {
                    background: "rgba(124,58,237,0.15)",
                    color: "#5e5e80",
                    cursor: "not-allowed",
                  }
            }
            onMouseEnter={(e) => {
              if (canSubmit) {
                e.currentTarget.style.boxShadow = "0 0 36px rgba(124,58,237,0.55)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (canSubmit) {
                e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,0.35)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Posting..." : "Post Announcement"}
          </button>
        </form>

        {/* Feedback message */}
        <AnimatePresence>
          {status && (
            <motion.div
              key={status + message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 mt-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: status === "success" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${status === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: status === "success" ? "#86efac" : "#fca5a5",
              }}
            >
              {status === "success" ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}