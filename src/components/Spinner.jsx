// Spinner.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const Spinner = () => {
  return (
    <div
      className="flex flex-col justify-center items-center h-screen gap-6"
      style={{ background: "linear-gradient(160deg, #07070f 0%, #0d0d1f 50%, #080b18 100%)" }}
    >
      {/* Spinner rings */}
      <div className="relative flex items-center justify-center w-24 h-24">

        {/* Outer slow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 96,
            height: 96,
            border: "2px solid transparent",
            borderTopColor: "#7c3aed",
            borderRightColor: "rgba(124,58,237,0.25)",
            borderBottomColor: "transparent",
            borderLeftColor: "rgba(124,58,237,0.1)",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
        />

        {/* Middle counter ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 72,
            height: 72,
            border: "2px solid transparent",
            borderTopColor: "transparent",
            borderRightColor: "#6366f1",
            borderBottomColor: "rgba(99,102,241,0.3)",
            borderLeftColor: "transparent",
          }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.0, ease: "linear" }}
        />

        {/* Inner fast ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 48,
            height: 48,
            border: "2px solid transparent",
            borderTopColor: "#a78bfa",
            borderRightColor: "transparent",
            borderBottomColor: "rgba(167,139,250,0.2)",
            borderLeftColor: "transparent",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
        />

        {/* Center logo mark */}
        <motion.div
          className="relative z-10 flex items-center justify-center w-9 h-9 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
            boxShadow: "0 0 18px rgba(124,58,237,0.45)",
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <BookOpen className="w-4 h-4 text-white" strokeWidth={2.2} />
        </motion.div>
      </div>

      {/* Label */}
      <motion.div
        className="flex flex-col items-center gap-1"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      >
        <span
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: "#6d5af0", letterSpacing: "0.14em" }}
        >
          Loading
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ background: "#7c3aed" }}
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Spinner;
