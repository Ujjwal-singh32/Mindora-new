"use client";
import React from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const LandingPage = () => {
  const features = [
    {
      title: "Upload Notes",
      desc: "Easily upload and organize your study materials in one place.",
      icon: "📄",
      gradient: "from-violet-500/20 to-purple-500/10",
      border: "border-violet-500/30",
      glow: "group-hover:shadow-violet-500/20",
    },
    {
      title: "Take Quizzes",
      desc: "Interactive quizzes to test and reinforce your knowledge.",
      icon: "📝",
      gradient: "from-indigo-500/20 to-blue-500/10",
      border: "border-indigo-500/30",
      glow: "group-hover:shadow-indigo-500/20",
    },
    {
      title: "Short Notes",
      desc: "Access concise, AI-summarized notes for quick revision.",
      icon: "✏️",
      gradient: "from-cyan-500/20 to-teal-500/10",
      border: "border-cyan-500/30",
      glow: "group-hover:shadow-cyan-500/20",
    },
    {
      title: "Track Progress",
      desc: "Monitor your learning milestones and achievements.",
      icon: "📊",
      gradient: "from-fuchsia-500/20 to-pink-500/10",
      border: "border-fuchsia-500/30",
      glow: "group-hover:shadow-fuchsia-500/20",
    },
    {
      title: "Discussion Forums",
      desc: "Collaborate, share ideas, and discuss with your peers.",
      icon: "💬",
      gradient: "from-purple-500/20 to-violet-500/10",
      border: "border-purple-500/30",
      glow: "group-hover:shadow-purple-500/20",
    },
    {
      title: "Expert Guidance",
      desc: "Get curated tips and advice from top educators.",
      icon: "👨‍🏫",
      gradient: "from-blue-500/20 to-indigo-500/10",
      border: "border-blue-500/30",
      glow: "group-hover:shadow-blue-500/20",
    },
  ];

  const highlights = [
    {
      title: "Dark & Light Mode",
      desc: "Switch between modes for a comfortable viewing experience.",
      icon: "🌙",
      gradient: "from-slate-600/30 to-slate-700/10",
      border: "border-slate-500/30",
    },
    {
      title: "Cloud Sync",
      desc: "Access your notes and quizzes seamlessly on any device.",
      icon: "☁️",
      gradient: "from-sky-500/20 to-blue-500/10",
      border: "border-sky-500/30",
    },
    {
      title: "Gamified Learning",
      desc: "Earn points, climb leaderboards, and unlock achievements.",
      icon: "🏆",
      gradient: "from-amber-500/20 to-orange-500/10",
      border: "border-amber-500/30",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Learners" },
    { value: "200+", label: "Study Rooms" },
    { value: "1M+", label: "Notes Uploaded" },
    { value: "99%", label: "Satisfaction Rate" },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a14 0%, #0d0d1f 40%, #080b18 100%)" }}
    >
      {/* ── Ambient background orbs ── */}
      <div className="pointer-events-none select-none">
        <div
          className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
        />
        <div
          className="absolute top-[30%] right-[-8%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[90px]"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between px-8 md:px-24 pt-28 pb-16 gap-12">
        {/* Left copy */}
        <div className="md:w-1/2 space-y-7">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#a78bfa",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Next-Gen Learning Platform
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight"
            style={{ color: "#f1f0ff" }}
          >
            Learn{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #a78bfa, #6366f1, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Anything
            </span>
            ,{" "}
            <br className="hidden md:block" />
            Anytime, Anywhere
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-base md:text-lg leading-relaxed max-w-md"
            style={{ color: "#a0a0c0" }}
          >
            Upload notes, take quizzes, and access short notes to enhance your
            learning experience — all in one beautifully crafted workspace.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-wrap gap-4 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                color: "#fff",
                boxShadow: "0 0 24px rgba(124,58,237,0.35), 0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              Start Learning
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "#a78bfa",
              }}
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </div>

        {/* Right — Lottie + decorative rings */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="md:w-1/2 flex justify-center items-center relative"
        >
          {/* Glow rings */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 380,
              height: 380,
              border: "1px solid rgba(139,92,246,0.15)",
              boxShadow: "0 0 60px rgba(124,58,237,0.08)",
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              border: "1px solid rgba(99,102,241,0.12)",
            }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />
          {/* Lottie Animation */}
          <div className="relative w-72 h-72 md:w-[360px] md:h-[360px] z-10">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-20"
              style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
            />
            <Lottie
              animationData={require("./animation.json")}
              loop
              autoplay
            />
          </div>
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 mx-8 md:mx-24 mb-20"
      >
        <div
          className="rounded-2xl px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(139,92,246,0.12)",
            backdropFilter: "blur(12px)",
          }}
        >
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1">
              <span
                className="text-3xl font-extrabold tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #a78bfa, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </span>
              <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "#6b6b8a" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Features Section ── */}
      <section id="features" className="relative z-10 px-8 md:px-24 mb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#7c3aed" }}
          >
            Everything You Need
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: "#f1f0ff" }}
          >
            Key Features
          </h2>
          <p className="mt-4 text-sm max-w-xl mx-auto" style={{ color: "#7070a0" }}>
            A complete toolkit designed to supercharge how you study, collaborate, and grow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.5}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`group relative rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300 ${feature.glow} hover:shadow-2xl`}
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
                border: "1px solid rgba(139,92,246,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Icon bubble */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${feature.gradient} ${feature.border} border`}
              >
                {feature.icon}
              </div>
              <div>
                <h4 className="text-base font-bold mb-1" style={{ color: "#e8e8ff" }}>
                  {feature.title}
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: "#7070a0" }}>
                  {feature.desc}
                </p>
              </div>
              {/* Subtle corner glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(ellipse at top left, rgba(124,58,237,0.07), transparent 60%)",
                }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Highlights Section ── */}
      <section className="relative z-10 px-8 md:px-24 mb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "#6366f1" }}
          >
            Built Different
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: "#f1f0ff" }}
          >
            More Highlights
          </h2>
          <p className="mt-4 text-sm max-w-xl mx-auto" style={{ color: "#7070a0" }}>
            Premium features that set Mindora apart from the rest.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.5}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative rounded-2xl p-8 flex flex-col items-center text-center gap-4 transition-all duration-300 hover:shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(139,92,246,0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${item.gradient} ${item.border} border`}
              >
                {item.icon}
              </div>
              <h4 className="text-base font-bold" style={{ color: "#e8e8ff" }}>
                {item.title}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "#7070a0" }}>
                {item.desc}
              </p>
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(ellipse at top, rgba(99,102,241,0.06), transparent 60%)",
                }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="relative z-10 px-8 md:px-24 mb-32">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-14 md:p-20 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.12) 60%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* CTA background glow */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[80px] opacity-20"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
          />

          <p
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: "#a78bfa" }}
          >
            Start Today — It&apos;s Free
          </p>
          <h2
            className="text-4xl md:text-5xl xl:text-6xl font-extrabold tracking-tight mb-5 relative z-10"
            style={{ color: "#f1f0ff" }}
          >
            Ready to start your <br className="hidden md:block" />
            <span
              style={{
                background: "linear-gradient(90deg, #a78bfa, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              learning journey?
            </span>
          </h2>
          <p className="text-sm md:text-base mb-10 max-w-md mx-auto relative z-10" style={{ color: "#8080a8" }}>
            Join thousands of students who are already learning smarter with Mindora.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative z-10 px-10 py-4 rounded-xl font-bold text-base tracking-wide transition-all"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              color: "#fff",
              boxShadow: "0 0 40px rgba(124,58,237,0.4), 0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
