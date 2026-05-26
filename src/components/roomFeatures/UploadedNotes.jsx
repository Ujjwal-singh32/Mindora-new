"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Eye, Download, ArrowLeft, BookOpen, Calendar, User } from "lucide-react";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function UploadedNotes({ roomId }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notes/fetch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        if (res.ok) {
          setNotes(data.notes || []);
        } else {
          setError(data.message || "Failed to fetch notes");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [roomId]);

  // ── VIEW MODE ────────────────────────────────────────────────────────────────
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
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold truncate" style={{ color: "#f4f4ff" }}>
              {selectedNote.topic || selectedNote.fileName}
            </span>
          </div>

          <a
            href={selectedNote.link || selectedNote.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "#fff",
              boxShadow: "0 0 16px rgba(124,58,237,0.3)",
              border: "1px solid rgba(124,58,237,0.4)",
            }}
          >
            <Download className="w-4 h-4" /> Download
          </a>
        </div>

        {/* PDF iframe */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
            border: "1px solid rgba(124,58,237,0.18)",
            minHeight: "520px",
          }}
        >
          <iframe
            src={selectedNote.link || selectedNote.url}
            className="w-full h-full"
            style={{ minHeight: "520px", border: "none" }}
            title="PDF Viewer"
          />
        </motion.div>
      </div>
    );
  }

  // ── LIST MODE ────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Uploaded Notes</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Browse and view notes shared in this room</p>
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
          className="flex flex-col items-center justify-center py-16 gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <FileText className="w-7 h-7" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No notes yet</p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>Notes uploaded to this room will appear here.</p>
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
                  <FileText className="w-7 h-7" style={{ color: "#a78bfa" }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-base" style={{ color: "#f4f4ff" }}>
                    {note.topic}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: "#8888aa" }}>
                      <User className="w-3.5 h-3.5" />
                      {note.uploader?.name || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: "#8888aa" }}>
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(note.date).toLocaleDateString()}
                    </span>
                  </div>
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
                <a
                  href={note.link || note.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
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
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}