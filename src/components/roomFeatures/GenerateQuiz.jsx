"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import {
  Brain, ChevronDown, Loader2, Sparkles, BookOpen,
  Hash, Award, Clock, Minus, Tag,
} from "lucide-react";

const inputClass = "w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200";
const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#f4f4ff",
};
const focusStyle = {
  border: "1px solid rgba(124,58,237,0.5)",
  boxShadow: "0 0 0 3px rgba(124,58,237,0.1)",
};
const blurStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "none",
};

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "#a78bfa" }}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function QuizGenerator({ roomId }) {
  const { user } = useUser();
  const [pdfUrl, setPdfUrl] = useState("");
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    topic: "",
    title: "",
    numQuestions: 5,
    totalMarks: 20,
    difficulty: "Medium",
    timePerQuestion: 30,
    negativeMarking: 1,
  });

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    const fetchTopics = async () => {
      if (!roomId) return;
      try {
        const res = await fetch("/api/quiz/fetch-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        if (data.success && data.notes.length) {
          setNotes(data.notes);
          const uniqueTopics = [...new Set(data.notes.map((n) => n.topic))];
          setTopics(uniqueTopics);
        } else {
          setNotes([]);
          setTopics([]);
        }
      } catch (err) {
        console.error("Error fetching topics:", err);
        toast.error("Failed to fetch topics");
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, [roomId]);

  const handleGenerate = async () => {
    if (!form.topic) return toast.error("Select a topic");
    if (!form.title.trim()) return toast.error("Enter a quiz title");

    const selectedNote = notes.find((n) => n.topic === form.topic);
    const pdfLink = selectedNote?.link || "";
    toast.info("Generating quiz... AI may take a few seconds!");
    setGenerating(true);

    try {
      const res = await fetch("/api/quiz/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          pdfUrl: pdfLink,
          createdBy: user.id,
          ...form,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Quiz created successfully!");
        console.log("Created Quiz:", data.quiz);
      } else {
        toast.error(data.error || "Failed to create quiz");
        console.error("API Error:", data);
      }
    } catch (err) {
      console.error("Network Error:", err);
      toast.error("Failed to create quiz");
    } finally {
      setGenerating(false);
    }
  };

  const difficultyColors = {
    Easy:   { bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.3)",  text: "#4ade80"  },
    Medium: { bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  text: "#fbbf24"  },
    Hard:   { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", text: "#f87171"  },
  };
  const dc = difficultyColors[form.difficulty] || difficultyColors.Medium;

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Generate AI Quiz</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Create quizzes from uploaded notes using AI</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-7"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl mx-auto space-y-5"
      >
        {/* Topic selector */}
        <Field label="Select Topic" icon={BookOpen}>
          <div className="relative">
            <select
              className={inputClass}
              style={{
                ...inputStyle,
                appearance: "none",
                paddingRight: "2.5rem",
                opacity: loadingTopics || topics.length === 0 ? 0.5 : 1,
                cursor: loadingTopics || topics.length === 0 ? "not-allowed" : "pointer",
              }}
              value={form.topic}
              onChange={(e) => {
                const selectedTopic = e.target.value;
                handleChange("topic", selectedTopic);
                const note = notes.find((n) => n.topic === selectedTopic);
                setPdfUrl(note?.link || "");
                console.log("Selected topic PDF URL:", note?.link);
              }}
              disabled={loadingTopics || topics.length === 0}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            >
              <option value="" disabled hidden style={{ background: "#0d0d1f" }}>
                {loadingTopics ? "Loading topics..." : topics.length === 0 ? "No topics available" : "-- Choose a Topic --"}
              </option>
              {topics.map((t, i) => (
                <option key={i} value={t} style={{ background: "#0d0d1f", color: "#f4f4ff" }}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#5e5e80" }} />
            {loadingTopics && (
              <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin pointer-events-none" style={{ color: "#7c3aed" }} />
            )}
          </div>
          <AnimatePresence>
            {topics.length === 0 && !loadingTopics && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 text-xs"
                style={{ color: "#5e5e80" }}
              >
                Upload notes first to generate a quiz.
              </motion.p>
            )}
          </AnimatePresence>
        </Field>

        {/* Quiz title */}
        <Field label="Quiz Title" icon={Tag}>
          <input
            type="text"
            placeholder="e.g. Chapter 3 – Mid-term Practice"
            className={inputClass}
            style={inputStyle}
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
          />
        </Field>

        {/* 2-col row: questions + total marks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Number of Questions" icon={Hash}>
            <input
              type="number" min="1" max="50"
              className={inputClass}
              style={inputStyle}
              value={form.numQuestions || 5}
              onChange={(e) => handleChange("numQuestions", e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            />
          </Field>
          <Field label="Total Marks" icon={Award}>
            <input
              type="number" min="10" max="200"
              className={inputClass}
              style={inputStyle}
              value={form.totalMarks}
              onChange={(e) => handleChange("totalMarks", e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            />
          </Field>
        </div>

        {/* Difficulty — pill selector */}
        <Field label="Difficulty" icon={Sparkles}>
          <div className="flex gap-3">
            {["Easy", "Medium", "Hard"].map((d) => {
              const active = form.difficulty === d;
              const col = difficultyColors[d];
              return (
                <button
                  key={d}
                  onClick={() => handleChange("difficulty", d)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: active ? col.bg : "rgba(255,255,255,0.03)",
                    border: active ? `1px solid ${col.border}` : "1px solid rgba(255,255,255,0.07)",
                    color: active ? col.text : "#5e5e80",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </Field>

        {/* 2-col row: time + negative marking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Time Per Question (sec)" icon={Clock}>
            <input
              type="number" min="10" max="300"
              className={inputClass}
              style={inputStyle}
              value={form.timePerQuestion}
              onChange={(e) => handleChange("timePerQuestion", e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            />
          </Field>
          <Field label="Negative Marking (pts)" icon={Minus}>
            <input
              type="number" min="0" max="10" step="0.5"
              className={inputClass}
              style={inputStyle}
              value={form.negativeMarking}
              onChange={(e) => handleChange("negativeMarking", e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            />
          </Field>
        </div>

        {/* Summary strip */}
        <AnimatePresence>
          {form.topic && form.title && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2 p-4 rounded-xl"
              style={{
                background: "rgba(124,58,237,0.07)",
                border: "1px solid rgba(124,58,237,0.18)",
              }}
            >
              {[
                { label: "Topic", value: form.topic },
                { label: "Questions", value: form.numQuestions || 5 },
                { label: "Marks", value: form.totalMarks },
                { label: "Difficulty", value: form.difficulty, color: dc.text },
                { label: "Time/Q", value: `${form.timePerQuestion}s` },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-xs" style={{ color: "#5e5e80" }}>{label}:</span>
                  <span className="text-xs font-semibold" style={{ color: color || "#c4b5fd" }}>{value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <motion.button
          whileHover={!generating ? { scale: 1.02 } : {}}
          whileTap={!generating ? { scale: 0.97 } : {}}
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
          style={{
            background: generating
              ? "rgba(124,58,237,0.3)"
              : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
            color: generating ? "#8888aa" : "#fff",
            boxShadow: generating ? "none" : "0 0 24px rgba(124,58,237,0.4)",
            cursor: generating ? "not-allowed" : "pointer",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quiz with AI
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}