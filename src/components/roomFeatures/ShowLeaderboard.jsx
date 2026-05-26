"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Users, Trophy, Medal } from "lucide-react";

const podiumConfig = [
  { rank: 1, emoji: "🥇", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)", glow: "rgba(251,191,36,0.25)", avatarSize: { width: "clamp(72px, 22vw, 112px)", height: "clamp(72px, 22vw, 112px)" }, fontSize: "clamp(1.75rem, 6vw, 3rem)", barH: "clamp(48px, 12vw, 80px)" },
  { rank: 2, emoji: "🥈", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.25)", glow: "rgba(148,163,184,0.15)", avatarSize: { width: "clamp(60px, 18vw, 96px)", height: "clamp(60px, 18vw, 96px)" }, fontSize: "clamp(1.5rem, 5vw, 2.5rem)", barH: "clamp(34px, 9vw, 56px)" },
  { rank: 3, emoji: "🥉", color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.25)", glow: "rgba(251,146,60,0.15)", avatarSize: { width: "clamp(52px, 16vw, 80px)", height: "clamp(52px, 16vw, 80px)" }, fontSize: "clamp(1.25rem, 4.5vw, 1.875rem)", barH: "clamp(22px, 7vw, 40px)" },
];

export default function LeaderboardPage({ roomId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/leaderboard/show-ranks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId }),
        });
        const data = await res.json();
        if (res.ok) {
          setLeaderboard(data.leaderboard || []);
        } else {
          setError(data.message || "Failed to fetch leaderboard");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [roomId]);

  if (loading) {
    return (
      <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Leaderboard</h2>
            <p className="text-sm" style={{ color: "#5e5e80" }}>Top performers in this room</p>
          </div>
        </div>
        <div className="w-full h-px mb-7" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 md:p-7 min-h-full flex items-center justify-center">
        <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  // podium order: 2nd (left), 1st (center), 3rd (right)
  const podiumOrder = [
    top3[1] ? { user: top3[1], cfg: podiumConfig[1] } : null,
    top3[0] ? { user: top3[0], cfg: podiumConfig[0] } : null,
    top3[2] ? { user: top3[2], cfg: podiumConfig[2] } : null,
  ].filter(Boolean);

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Leaderboard</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Top performers in this room</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px mb-8"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />

      {leaderboard.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <Trophy className="w-7 h-7" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No scores yet</p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>Attempt a quiz to appear on the leaderboard.</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* ── PODIUM ─────────────────────────────────────────────────────── */}
          {top3.length > 0 && (
            <div className="w-full flex items-end gap-2 sm:gap-4 mb-10 px-1">
              {podiumOrder.map(({ user, cfg }, i) => (
                <motion.div
                  key={user.clerkId}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="flex-1 flex flex-col items-center gap-2 min-w-0"
                >
                  {/* Avatar circle */}
                  <div
                    className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
                    style={{
                      width: cfg.avatarSize.width,
                      height: cfg.avatarSize.height,
                      fontSize: cfg.fontSize,
                      background: cfg.bg,
                      border: `2px solid ${cfg.border}`,
                      boxShadow: `0 0 24px ${cfg.glow}`,
                    }}
                  >
                    {cfg.emoji}
                  </div>

                  {/* Name */}
                  <p className="text-xs sm:text-sm font-bold text-center truncate w-full px-1"
                    style={{ color: cfg.color }}>
                    {user.name}
                  </p>

                  {/* Score */}
                  <span className="text-xs font-bold px-1.5 py-1 rounded-full text-center w-full"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, display: "block", textAlign: "center" }}>
                    {user.totalScore} pts
                  </span>

                  {/* Podium bar */}
                  <div
                    className="w-full rounded-t-2xl mt-1 flex items-center justify-center text-xs sm:text-sm font-bold"
                    style={{
                      background: `linear-gradient(180deg, ${cfg.bg}, rgba(0,0,0,0))`,
                      border: `1px solid ${cfg.border}`,
                      borderBottom: "none",
                      height: cfg.barH,
                      color: cfg.color,
                    }}
                  >
                    #{cfg.rank}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── REST OF LEADERBOARD ────────────────────────────────────────── */}
          {rest.length > 0 && (
            <div className="space-y-3">
              {rest.map((user, i) => (
                <motion.div
                  key={user.clerkId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl transition-all duration-200"
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
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    {/* Rank badge */}
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                      {i + 4}
                    </div>
                    {/* User icon + name */}
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#8888aa" }} />
                    </div>
                    <span className="text-sm sm:text-base font-semibold truncate" style={{ color: "#f4f4ff" }}>{user.name}</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex-shrink-0"
                    style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#c4b5fd" }}>
                    {user.totalScore} pts
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}