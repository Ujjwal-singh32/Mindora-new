"use client";

import Footer from "@/components/Footer";
import UserNavbar from "@/components/Navbar";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "@/components/Spinner";
import { motion } from "framer-motion";
import { BookOpen, Mail, MessageSquare, Send } from "lucide-react";

export default function ContactUsPage() {
  const { user, isLoaded } = useUser();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoaded) return <Spinner />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          description,
          userId: user?.id,
        }),
      });

      if (res.ok) {
        toast.success("✅ Your issue has been sent to the admin!", {
          style: { background: "black", color: "#fde047" },
        });
        setTopic("");
        setDescription("");
      } else {
        toast.error("❌ Failed to send. Please try again later.", {
          style: { background: "red", color: "white" },
        });
      }
    } catch (err) {
      toast.error("⚠️ Something went wrong.", {
        style: { background: "red", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserNavbar />

      <div
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(160deg, #07070f 0%, #0d0d1f 50%, #080b18 100%)" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(124,58,237,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center flex-1 gap-12 px-4 md:px-10 py-16 max-w-5xl mx-auto w-full">

          {/* ── Left panel — info ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full lg:w-2/5 flex flex-col gap-6"
          >
            {/* Logo mark */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                }}
              >
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-2xl font-bold" style={{ color: "#f4f4ff" }}>Mindora</span>
            </div>

            <div>
              <p className="text-base uppercase tracking-widest font-semibold mb-2" style={{ color: "#7c3aed" }}>
                Get in Touch
              </p>
              <h1
                className="text-5xl md:text-6xl font-bold leading-tight"
                style={{ color: "#f4f4ff", letterSpacing: "-0.025em" }}
              >
                Contact Us
              </h1>
              <p className="mt-3 text-lg leading-relaxed" style={{ color: "#8888aa" }}>
                Have a problem, suggestion, or just want to say hi? We read every message and typically respond within 24 hours.
              </p>
            </div>

            {/* Info pills */}
            <div className="flex flex-col gap-3 mt-2">
              {[
                { icon: Mail, text: "support@mindora.app" },
                { icon: MessageSquare, text: "We reply within 24 hours" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(124,58,237,0.15)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#a78bfa" }} />
                  </div>
                  <span className="text-base" style={{ color: "#8888aa" }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right panel — form ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="w-full lg:w-3/5 rounded-2xl p-6 md:p-8"
            style={{
              background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 0 60px rgba(124,58,237,0.08)",
            }}
          >
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#f4f4ff" }}>
              Send a message
            </h2>
            <p className="text-base mb-6" style={{ color: "#5e5e80" }}>
              Fill in the form below and we'll get back to you.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Topic */}
              <div>
                <label className="block text-base font-medium mb-1.5" style={{ color: "#8888aa" }}>
                  Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bug report, Feature request…"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f4f4ff",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.55)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-base font-medium mb-1.5" style={{ color: "#8888aa" }}>
                  Description
                </label>
                <textarea
                  placeholder="Describe your issue or question in detail…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                  className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f4f4ff",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.55)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading
                    ? "rgba(124,58,237,0.4)"
                    : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  color: "#fff",
                  boxShadow: loading ? "none" : "0 0 24px rgba(124,58,237,0.4)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        <Footer />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

