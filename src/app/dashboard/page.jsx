"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import UserNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import { Mail, UserPlus, Users, BookOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const [stats, setStats] = useState({
    totalCreated: 0,
    totalJoined: 0,
    totalRequests: 0,
    totalInvitations: 0,
    createdPerMonth: [],
    joinedPerMonth: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${userId}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const createdData = stats.createdPerMonth.map((d) => ({
    month: monthNames[d._id - 1],
    rooms: d.count,
  }));

  const joinedData = stats.joinedPerMonth.map((d) => ({
    month: monthNames[d._id - 1],
    rooms: d.count,
  }));

  if (!isLoaded || loading) return <Spinner />;

  const statCards = [
    {
      label: "Rooms Created",
      value: stats.totalCreated,
      icon: Users,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
      glow: "rgba(124,58,237,0.3)",
    },
    {
      label: "Rooms Joined",
      value: stats.totalJoined,
      icon: UserPlus,
      gradient: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
      glow: "rgba(79,70,229,0.3)",
    },
    {
      label: "Room Requests",
      value: stats.totalRequests,
      icon: Mail,
      gradient: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)",
      glow: "rgba(109,40,217,0.3)",
    },
    {
      label: "Invitations",
      value: stats.totalInvitations,
      icon: BookOpen,
      gradient: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
      glow: "rgba(99,102,241,0.3)",
    },
  ];

  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: "#0d0d1f",
      border: "1px solid rgba(124,58,237,0.3)",
      borderRadius: "10px",
      color: "#f4f4ff",
      fontSize: "14px",
    },
    labelStyle: { color: "#a78bfa", fontWeight: 600 },
    cursor: { fill: "rgba(124,58,237,0.08)" },
  };

  return (
    <>
      <UserNavbar />
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(160deg, #07070f 0%, #0d0d1f 50%, #080b18 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-20">

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-sm uppercase tracking-widest mb-2 font-semibold" style={{ color: "#7c3aed" }}>
              Your Activity
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: "#f4f4ff", letterSpacing: "-0.02em" }}
                >
                  Dashboard
                </h1>
                {user?.firstName && (
                  <p className="mt-2 text-base" style={{ color: "#8888aa" }}>
                    Welcome back, <span style={{ color: "#a78bfa" }}>{user.firstName}</span>
                  </p>
                )}
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#a78bfa",
                }}
              >
                <TrendingUp className="w-4 h-4" />
                Live stats
              </div>
            </div>

            {/* Divider */}
            <div
              className="w-full h-px mt-6"
              style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
            />
          </motion.div>

          {/* ── Stat Cards ── */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {statCards.map(({ label, value, icon: Icon, gradient, glow }) => (
              <motion.div
                key={label}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -4, boxShadow: `0 12px 40px ${glow}` }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl p-5 sm:p-6 flex items-center gap-4"
                style={{
                  background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: gradient, boxShadow: `0 0 18px ${glow}` }}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "#8888aa" }}>
                    {label}
                  </p>
                  <p
                    className="text-4xl font-bold"
                    style={{ color: "#f4f4ff", letterSpacing: "-0.03em" }}
                  >
                    {value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Charts ── */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
          >
            {/* Line Chart — Rooms Created */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-2xl p-5 md:p-6"
              style={{
                background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-semibold" style={{ color: "#f4f4ff" }}>
                  Rooms Created Per Month
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={createdData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#5e5e80" tick={{ fill: "#8888aa", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#5e5e80" tick={{ fill: "#8888aa", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ color: "#8888aa", fontSize: 13 }} />
                  <Line
                    type="monotone"
                    dataKey="rooms"
                    stroke="url(#lineGrad)"
                    strokeWidth={2.5}
                    dot={{ fill: "#7c3aed", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#a78bfa" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Bar Chart — Rooms Joined */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              className="rounded-2xl p-5 md:p-6"
              style={{
                background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}
                >
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-semibold" style={{ color: "#f4f4ff" }}>
                  Rooms Joined Per Month
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={joinedData}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#5e5e80" tick={{ fill: "#8888aa", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#5e5e80" tick={{ fill: "#8888aa", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ color: "#8888aa", fontSize: 13 }} />
                  <Bar dataKey="rooms" fill="url(#barGrad)" radius={[6, 6, 0, 0]} cursor={{ fill: "rgba(124,58,237,0.08)" }} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>

        </div>
      </div>
      <Footer />
    </>
  );
}
