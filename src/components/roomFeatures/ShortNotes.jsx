"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Printer, ArrowLeft, FileText, Zap, Calendar, Clock } from "lucide-react";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ShortNotes({ roomId }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/short-notes/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        setNotes(data.shortNotesList || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch short notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [roomId]);

  const handlePrint = (note) => {
    const printContents = `
      <h2>${note.topic}</h2>
      ${note.shortNotes
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          if (trimmed.startsWith("**")) {
            return `<h3 style="font-size:18px; font-weight:bold; color:black; margin-top:10px;">${trimmed.replace(/\*\*/g, "")}</h3>`;
          } else if (trimmed.startsWith("*")) {
            return `<p style="color:orange; margin-left:20px;">• ${trimmed.replace(/^\*\s*/, "")}</p>`;
          } else {
            return `<p style="color:#555; margin-left:20px;">${trimmed}</p>`;
          }
        })
        .join("")}
      <p>Generated at: ${new Date(note.generatedAt).toLocaleString()}</p>
    `;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // ── VIEW MODE ──────────────────────────────────────────────────────────────
  if (selectedNote) {
    return (
      <div className="p-5 md:p-7 min-h-full flex flex-col" style={{ color: "#f4f4ff" }}>

        {/* View header */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <button
            onClick={() => setSelectedNote(null)}
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
            <ArrowLeft className="w-4 h-4" /> Back to Notes
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold truncate" style={{ color: "#f4f4ff" }}>
              {selectedNote.topic}
            </span>
          </div>

          <button
            onClick={() => handlePrint(selectedNote)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#fff",
              boxShadow: "0 0 16px rgba(124,58,237,0.3)",
              border: "1px solid rgba(124,58,237,0.4)",
            }}
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* Content card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 rounded-2xl p-6 overflow-y-auto"
          style={{
            background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
            border: "1px solid rgba(124,58,237,0.18)",
            minHeight: "420px",
          }}
        >
          {selectedNote.shortNotes.split("\n").map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith("**")) {
              return (
                <h3
                  key={i}
                  className="text-base font-bold mt-5 mb-2 pb-1"
                  style={{
                    color: "#c4b5fd",
                    borderBottom: "1px solid rgba(124,58,237,0.2)",
                  }}
                >
                  {trimmed.replace(/\*\*/g, "")}
                </h3>
              );
            } else if (trimmed.startsWith("*")) {
              return (
                <div key={i} className="flex items-start gap-2.5 ml-3 mb-1.5">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#7c3aed" }}
                  />
                  <p className="text-sm leading-relaxed" style={{ color: "#d4d4f0" }}>
                    {trimmed.replace(/^\*\s*/, "")}
                  </p>
                </div>
              );
            } else {
              return (
                <p key={i} className="text-sm leading-relaxed ml-3 mb-1" style={{ color: "#8888aa" }}>
                  {trimmed}
                </p>
              );
            }
          })}

          <div
            className="flex items-center gap-1.5 mt-6 pt-4 text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#5e5e80" }}
          >
            <Clock className="w-3 h-3" />
            Generated at: {new Date(selectedNote.generatedAt).toLocaleString()}
          </div>
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
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Short Notes</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>AI-generated summaries from uploaded notes</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-7"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p className="text-center text-sm" style={{ color: "#f87171" }}>{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && notes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <Zap className="w-7 h-7" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No short notes yet</p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>AI summaries are generated automatically when notes are uploaded.</p>
          </div>
        </motion.div>
      )}

      {/* Notes list */}
      {!loading && notes.length > 0 && (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {notes.map((note, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex items-center justify-between gap-4 p-5 rounded-2xl transition-all duration-200"
              style={{
                background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon + info */}
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <Zap className="w-7 h-7" style={{ color: "#a78bfa" }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-base mb-1" style={{ color: "#f4f4ff" }}>
                    {note.topic}
                  </p>
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: "#8888aa" }}>
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(note.generatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelectedNote(note)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "#a78bfa",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,0.28)";
                    e.currentTarget.style.boxShadow = "0 0 14px rgba(124,58,237,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Eye className="w-4 h-4" /> View
                </button>
                <button
                  onClick={() => handlePrint(note)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    border: "1px solid rgba(124,58,237,0.4)",
                    color: "#fff",
                    boxShadow: "0 0 16px rgba(124,58,237,0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 16px rgba(124,58,237,0.25)";
                  }}
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}