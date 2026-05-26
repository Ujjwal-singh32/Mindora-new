"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Globe, Tag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";

export default function UploadLink({ roomId }) {
  const { user } = useUser();
  const [topic, setTopic] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  const urlPattern = /^(https?:\/\/)?([\w\-])+(\.[\w\-]+)+[/#?]?.*$/;

  const validateLink = (val) => {
    if (!val.trim()) { setLinkError(""); return; }
    setLinkError(urlPattern.test(val) ? "" : "Please enter a valid URL.");
  };

  const handleUpload = async () => {
    if (!topic.trim() || !link.trim()) {
      toast.error("Please fill both fields before uploading.");
      return;
    }
    if (!urlPattern.test(link)) {
      toast.error("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/links/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          topic,
          uploaderId: user.id,
          url: link,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload link");

      toast.success("Link uploaded successfully!");
      setTopic("");
      setLink("");
      setLinkError("");
    } catch (err) {
      toast.error(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const isLinkValid = link.trim() && urlPattern.test(link) && !linkError;
  const canSubmit = topic.trim() && isLinkValid && !loading;

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Add Reference Link</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Share useful links with your room</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-8"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg mx-auto space-y-5"
      >
        {/* Topic input */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
            <Tag className="w-3.5 h-3.5" />
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Newton's Laws – Video Explanation"
            className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f4f4ff",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(124,58,237,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Link input */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
            <Globe className="w-3.5 h-3.5" />
            URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={link}
              onChange={(e) => { setLink(e.target.value); validateLink(e.target.value); }}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full pl-4 pr-10 py-3 rounded-xl text-base outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: linkError
                  ? "1px solid rgba(239,68,68,0.5)"
                  : isLinkValid
                  ? "1px solid rgba(74,222,128,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: "#f4f4ff",
                boxShadow: linkError ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
              }}
              onFocus={(e) => {
                if (!linkError) {
                  e.target.style.border = "1px solid rgba(124,58,237,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
                }
              }}
              onBlur={(e) => {
                if (!linkError && !isLinkValid) {
                  e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }
              }}
            />
            {/* Inline status icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {isLinkValid && <CheckCircle2 className="w-4 h-4" style={{ color: "#4ade80" }} />}
              {linkError && <AlertCircle className="w-4 h-4" style={{ color: "#f87171" }} />}
            </div>
          </div>

          {/* Link validation error */}
          <AnimatePresence>
            {linkError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1.5 text-sm"
                style={{ color: "#f87171" }}
              >
                {linkError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Link preview card */}
        <AnimatePresence>
          {isLinkValid && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{
                background: "rgba(124,58,237,0.07)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.15)" }}
              >
                <Globe className="w-4 h-4" style={{ color: "#a78bfa" }} />
              </div>
              <p className="text-sm truncate flex-1" style={{ color: "#c4b5fd" }}>
                {link}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.97 } : {}}
          onClick={handleUpload}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)"
              : "rgba(124,58,237,0.15)",
            color: canSubmit ? "#fff" : "#5e5e80",
            boxShadow: canSubmit ? "0 0 24px rgba(124,58,237,0.35)" : "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Upload Link
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}