"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function UploadNotes({ roomId }) {
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else {
      setFile(null);
      setError("Only PDF files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a PDF first");
    if (!topic.trim()) return toast.error("Please enter a topic");
    if (!user) return toast.error("You must be logged in");

    setLoading(true);
    try {
      const res = await fetch("/api/upload-pdf-s3", {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          "x-filename": file.name,
        },
        body: file,
      });

      const data = await res.json();

      if (!data.url) {
        toast.error("Upload error: " + (data.error || "No URL returned"));
        setLoading(false);
        return;
      }

      const pdfUrl = data.url;

      const saveRes = await fetch("/api/notes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          topic,
          uploaderId: user.id,
          link: pdfUrl,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.message || "Failed to save note");

      toast.success(`Note "${topic}" uploaded successfully!`);

      fetch("/api/short-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, pdfUrl, roomId }),
      }).catch((err) => console.error("Short notes generation failed:", err));

      setFile(null);
      setTopic("");
      setError("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError("");
  };

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Upload Notes</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Share PDF notes with your room</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-8"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg mx-auto space-y-5"
      >
        {/* Topic input */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
            Topic
          </label>
          <input
            type="text"
            placeholder="e.g. Chapter 3 – Thermodynamics"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
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

        {/* File drop zone */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
            PDF File
          </label>
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.label
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center gap-3 w-full py-12 rounded-2xl cursor-pointer transition-all duration-200"
                style={{
                  border: "2px dashed rgba(124,58,237,0.3)",
                  background: "rgba(124,58,237,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)";
                  e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
                  e.currentTarget.style.background = "rgba(124,58,237,0.04)";
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                >
                  <Upload className="w-6 h-6" style={{ color: "#a78bfa" }} />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium" style={{ color: "#c4b5fd" }}>
                    Click to select a PDF
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#5e5e80" }}>
                    Only .pdf files are accepted
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>
            ) : (
              <motion.div
                key="file-preview"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.25)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#e2d9ff" }}>
                    {file.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#5e5e80" }}>
                    {(file.size / 1024).toFixed(1)} KB · PDF Document
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#4ade80" }} />
                  <button
                    onClick={clearFile}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <X className="w-3.5 h-3.5" style={{ color: "#8888aa" }} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Validation error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm font-medium"
              style={{ color: "#f87171" }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Upload button */}
        <motion.button
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          onClick={handleUpload}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
          style={{
            background: loading
              ? "rgba(124,58,237,0.3)"
              : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
            color: loading ? "#8888aa" : "#fff",
            boxShadow: loading ? "none" : "0 0 24px rgba(124,58,237,0.35)",
            cursor: loading ? "not-allowed" : "pointer",
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
              <Upload className="w-4 h-4" />
              Upload Notes
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}