"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2, CheckCircle2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";

export default function UploadImage({ roomId }) {
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
    } else {
      setFile(null);
      setPreview(null);
      setError("Only image files are allowed (jpg, png, etc).");
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select an image file before uploading.");
    if (!topic.trim()) return setError("Please enter a topic for the image.");
    if (!user) return toast.error("You must be logged in to upload.");

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const cloudRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (cloudData.error) throw new Error(cloudData.error);

      const imageUrl = cloudData.secure_url;

      const saveRes = await fetch("/api/images/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          topic,
          uploaderId: user.id,
          link: imageUrl,
        }),
      });

      const saveData = await saveRes.json();
      if (saveData.error) throw new Error(saveData.error);

      toast.success("Image uploaded successfully!");
      setFile(null);
      setPreview(null);
      setTopic("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <ImagePlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Upload Image</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Share images with your room</p>
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
          <label className="block text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
            Topic
          </label>
          <input
            type="text"
            placeholder="e.g. Lab Diagram – Chapter 5"
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

        {/* File zone */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
            Image File
          </label>
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.label
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                htmlFor="image-upload"
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
                  <ImagePlus className="w-6 h-6" style={{ color: "#a78bfa" }} />
                </div>
                <div className="text-center">
                  <p className="text-base font-medium" style={{ color: "#c4b5fd" }}>
                    Click to select an image
                  </p>
                  <p className="text-sm mt-1" style={{ color: "#5e5e80" }}>
                    JPG, PNG, GIF, WEBP accepted
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid rgba(124,58,237,0.25)",
                  background: "rgba(124,58,237,0.06)",
                }}
              >
                {/* Image preview */}
                <div className="w-full h-52 flex items-center justify-center overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* File info bar */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#4ade80" }} />
                  <span className="text-sm font-medium flex-1 truncate" style={{ color: "#e2d9ff" }}>
                    {file.name}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: "#5e5e80" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={clearFile}
                    className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
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
              <ImagePlus className="w-4 h-4" />
              Upload Image
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}