"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useUser } from "@clerk/nextjs";
import {
  ClipboardList, BookOpen, BarChart2, Clock, Star,
  ChevronRight, Eye, CheckCircle2, XCircle, MinusCircle,
  ArrowLeft, Trophy, Layers,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const difficultyColor = {
  Easy:   "#4ade80",
  Medium: "#fbbf24",
  Hard:   "#f87171",
};

const btnBase = {
  transition: "all 0.2s",
  cursor: "pointer",
};

export default function AttemptQuiz({ roomId }) {
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizScores, setQuizScores] = useState({});
  const [viewingQuiz, setViewingQuiz] = useState(null);

  // ── FETCH QUIZZES & SCORES ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch("/api/quiz/show-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        if (data.success) {
          setQuizzes(data.quizzes);
          const scorePromises = data.quizzes.map(async (quiz) => {
            if (quiz.attemptedBy.includes(user.id)) {
              const resScore = await fetch("/api/quiz/get-individual-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId, quizId: quiz._id, clerkId: user.id }),
              });
              const scoreData = await resScore.json();
              if (scoreData && typeof scoreData.score === "number") {
                return { quizId: quiz._id, score: scoreData.score };
              }
            }
            return null;
          });
          const results = await Promise.all(scorePromises);
          const scores = {};
          results.forEach((r) => { if (r) scores[r.quizId] = r.score; });
          setQuizScores(scores);
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      }
    };
    fetchQuizzes();
  }, [roomId, user]);

  // ── START QUIZ ─────────────────────────────────────────────────────────────
  const startQuiz = async (quiz) => {
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, quizId: quiz._id, clerkId: user.id, score: 0 }),
      });
      await fetch("/api/quiz/update-user-attempt-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, quizId: quiz._id, clerkId: user.id }),
      });
    } catch (err) {
      console.error("Error initializing quiz attempt:", err);
    }
    setSelectedQuiz(quiz);
    setSelectedOptions(Array(quiz.questions.length).fill(null));
    setCurrentQ(0);
    setShowSummary(false);
    setShowAnswers(false);
    setScoreData(0);
    setViewingQuiz(null);
  };

  // ── TIMER ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedQuiz || showSummary || showAnswers) return;
    setTimeLeft(selectedQuiz.timePerQuestion || 30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); handleNext(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQ, selectedQuiz, showSummary, showAnswers]);

  // ── NAVIGATION ─────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (currentQ < selectedQuiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const score = selectedQuiz.questions.reduce((acc, q, i) => {
        if (selectedOptions[i] === q.correct) return acc + selectedQuiz.totalMarks / selectedQuiz.totalQuestions;
        else if (selectedOptions[i] !== null) return acc - (selectedQuiz.negativeMarking || 0);
        return acc;
      }, 0);
      try {
        await fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, quizId: selectedQuiz._id, clerkId: user.id, score }),
        });
        setScoreData(score);
        setShowSummary(true);
      } catch (err) {
        console.error("Error submitting quiz:", err);
      }
    }
  };

  const handleOptionSelect = (index) => {
    const updated = [...selectedOptions];
    updated[currentQ] = index;
    setSelectedOptions(updated);
  };

  const toggleAnswers = () => setShowAnswers(true);
  const backToChart = () => setShowAnswers(false);

  // Chart data
  const correct = selectedQuiz?.questions?.reduce((acc, q, i) => acc + (selectedOptions[i] === q.correct ? 1 : 0), 0) ?? 0;
  const wrong = selectedQuiz?.questions?.reduce((acc, q, i) => acc + (selectedOptions[i] !== null && selectedOptions[i] !== q.correct ? 1 : 0), 0) ?? 0;
  const unattempted = selectedQuiz?.questions?.reduce((acc, q, i) => acc + (selectedOptions[i] === null ? 1 : 0), 0) ?? 0;

  const chartData = {
    labels: ["Correct", "Wrong", "Unattempted"],
    datasets: [{
      data: [correct, wrong, unattempted],
      backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
      borderColor: ["rgba(34,197,94,0.2)", "rgba(239,68,68,0.2)", "rgba(234,179,8,0.2)"],
      borderWidth: 1,
    }],
  };
  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#a78bfa", padding: 16, font: { size: 13 } },
      },
    },
  };

  // ── QUIZ LIST ──────────────────────────────────────────────────────────────
  if (!selectedQuiz && !viewingQuiz) {
    return (
      <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Available Quizzes</h2>
            <p className="text-sm" style={{ color: "#5e5e80" }}>Select a quiz to attempt or review</p>
          </div>
        </div>

        <div className="w-full h-px mb-7" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />

        {quizzes.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <ClipboardList className="w-7 h-7" style={{ color: "#7c3aed" }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No quizzes yet</p>
              <p className="text-sm" style={{ color: "#5e5e80" }}>Quizzes generated for this room will appear here.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz, idx) => {
              const attempted = quiz.attemptedBy.includes(user?.id);
              const dc = difficultyColor[quiz.difficulty] || "#a78bfa";
              return (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
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
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <Layers className="w-7 h-7" style={{ color: "#a78bfa" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-base" style={{ color: "#f4f4ff" }}>{quiz.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: `${dc}18`, color: dc, border: `1px solid ${dc}40` }}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#8888aa" }}>
                          <BookOpen className="w-3 h-3" /> {quiz.topic}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#8888aa" }}>
                          <BarChart2 className="w-3 h-3" /> {quiz.totalQuestions} Qs
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#8888aa" }}>
                          <Star className="w-3 h-3" /> {quiz.totalMarks} pts
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#8888aa" }}>
                          <Clock className="w-3 h-3" /> {quiz.timePerQuestion}s/Q
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: score + button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {attempted && quizScores[quiz._id] !== undefined && (
                      <div className="flex flex-col items-center px-3 py-1.5 rounded-xl"
                        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <span className="text-xs" style={{ color: "#86efac" }}>Score</span>
                        <span className="text-sm font-bold" style={{ color: "#4ade80" }}>
                          {quizScores[quiz._id]} / {quiz.totalMarks}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={attempted ? () => setViewingQuiz(quiz) : () => startQuiz(quiz)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                      style={attempted ? {
                        background: "rgba(79,70,229,0.15)",
                        border: "1px solid rgba(79,70,229,0.3)",
                        color: "#818cf8",
                        ...btnBase,
                      } : {
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        border: "1px solid rgba(124,58,237,0.4)",
                        color: "#fff",
                        boxShadow: "0 0 16px rgba(124,58,237,0.25)",
                        ...btnBase,
                      }}
                    >
                      {attempted ? <><Eye className="w-4 h-4" /> View</> : <><ChevronRight className="w-4 h-4" /> Attempt</>}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── ACTIVE QUIZ ────────────────────────────────────────────────────────────
  if (selectedQuiz) {
    const total = selectedQuiz.questions.length;
    const progress = ((currentQ + 1) / total) * 100;
    const timerPct = (timeLeft / (selectedQuiz.timePerQuestion || 30)) * 100;
    const timerColor = timeLeft <= 5 ? "#f87171" : timeLeft <= 10 ? "#fbbf24" : "#a78bfa";

    return (
      <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

        {/* Quiz header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold truncate" style={{ color: "#f4f4ff" }}>{selectedQuiz.title}</p>
            <p className="text-xs" style={{ color: "#5e5e80" }}>{selectedQuiz.topic} · {selectedQuiz.difficulty}</p>
          </div>
        </div>

        <div className="w-full h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />

        {!showSummary && !showAnswers ? (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto"
          >
            {/* Progress + timer row */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: "#a78bfa" }}>
                Question {currentQ + 1} / {total}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: timerColor }} />
                <span className="text-sm font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full mb-5 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5)", width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Timer bar */}
            <div className="w-full h-1 rounded-full mb-6 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: timerColor, width: `${timerPct}%` }}
                animate={{ width: `${timerPct}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>

            {/* Question card */}
            <div className="p-5 rounded-2xl mb-5"
              style={{
                background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(124,58,237,0.18)",
              }}>
              <p className="text-base font-semibold leading-relaxed" style={{ color: "#f4f4ff" }}>
                {selectedQuiz.questions[currentQ].question}
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 mb-6">
              {selectedQuiz.questions[currentQ].options.map((opt, i) => {
                const selected = selectedOptions[currentQ] === i;
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(i)}
                    className="text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: selected ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.03)",
                      border: selected ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      color: selected ? "#c4b5fd" : "#d4d4f0",
                      boxShadow: selected ? "0 0 12px rgba(124,58,237,0.15)" : "none",
                    }}
                  >
                    <span className="mr-3 inline-flex w-6 h-6 rounded-lg items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: selected ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)",
                        color: selected ? "#e9d5ff" : "#5e5e80",
                      }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(124,58,237,0.35)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  ...btnBase,
                }}>
                {currentQ === total - 1 ? "Submit Quiz" : "Next"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          // ── SUMMARY / ANSWERS ──────────────────────────────────────────────
          <div className="max-w-2xl mx-auto">
            {!showAnswers ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6">

                {/* Score card */}
                <div className="w-full p-6 rounded-2xl text-center"
                  style={{
                    background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    boxShadow: "0 0 40px rgba(124,58,237,0.1)",
                  }}>
                  <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: "#fbbf24" }} />
                  <p className="text-sm mb-1" style={{ color: "#5e5e80" }}>Your Score</p>
                  <p className="text-4xl font-bold mb-1" style={{ color: "#c4b5fd" }}>
                    {scoreData ?? 0}
                  </p>
                  <p className="text-sm" style={{ color: "#8888aa" }}>out of {selectedQuiz?.totalMarks ?? 0} points</p>

                  <div className="flex justify-center gap-4 mt-5 flex-wrap">
                    {[
                      { label: "Correct", value: correct, color: "#4ade80", icon: CheckCircle2 },
                      { label: "Wrong", value: wrong, color: "#f87171", icon: XCircle },
                      { label: "Skipped", value: unattempted, color: "#fbbf24", icon: MinusCircle },
                    ].map(({ label, value, color, icon: Icon }) => (
                      <div key={label} className="flex flex-col items-center px-4 py-2.5 rounded-xl"
                        style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                        <Icon className="w-4 h-4 mb-1" style={{ color }} />
                        <span className="text-base font-bold" style={{ color }}>{value}</span>
                        <span className="text-xs" style={{ color: "#5e5e80" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie chart */}
                <div className="w-52 h-52">
                  <Pie data={chartData} options={chartOptions} />
                </div>

                <button onClick={toggleAnswers}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "#a78bfa",
                    ...btnBase,
                  }}>
                  <Eye className="w-4 h-4" /> View Questions & Answers
                </button>
              </motion.div>
            ) : (
              // ── ANSWERS VIEW ──────────────────────────────────────────────
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                {selectedQuiz.questions.map((q, i) => (
                  <div key={i} className="p-4 rounded-2xl"
                    style={{
                      background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}>
                    <p className="font-semibold text-sm mb-3" style={{ color: "#c4b5fd" }}>
                      Q{i + 1}. {q.question}
                    </p>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correct;
                        return (
                          <div key={idx} className="px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
                            style={{
                              background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.02)",
                              border: isCorrect ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.06)",
                              color: isCorrect ? "#4ade80" : "#8888aa",
                            }}>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />}
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-2 mb-4">
                  <button onClick={backToChart}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      border: "1px solid rgba(124,58,237,0.4)",
                      color: "#fff",
                      boxShadow: "0 0 16px rgba(124,58,237,0.3)",
                      ...btnBase,
                    }}>
                    <ArrowLeft className="w-4 h-4" /> Back to Summary
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── VIEW ATTEMPTED QUIZ ────────────────────────────────────────────────────
  if (viewingQuiz) {
    return (
      <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <button onClick={() => setViewingQuiz(null)}
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
            }}>
            <ArrowLeft className="w-4 h-4" /> Back to Quizzes
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold truncate" style={{ color: "#f4f4ff" }}>
              {viewingQuiz.title}
            </span>
          </div>
          <div />
        </div>

        <div className="w-full h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />

        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {viewingQuiz.questions.map((q, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 rounded-2xl"
              style={{
                background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
              <p className="font-semibold text-sm mb-3" style={{ color: "#c4b5fd" }}>
                Q{i + 1}. {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correct;
                  return (
                    <div key={idx} className="px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
                      style={{
                        background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.02)",
                        border: isCorrect ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        color: isCorrect ? "#4ade80" : "#8888aa",
                      }}>
                      {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />}
                      {opt}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}