"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import UserNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "@/components/Spinner";
import { motion } from "framer-motion";
import { BookOpen, Users, ImageIcon, ArrowRight } from "lucide-react";

export default function MyRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/my-rooms?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setRooms(data);
        } else {
          toast.error(data.error || "Failed to fetch rooms!", { style: { background: "red", color: "white" } });
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error(err.message || "Failed to fetch rooms!", { style: { background: "red", color: "white" } });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return <Spinner />;
  }

  return (
    <>
      <UserNavbar />
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(160deg, #07070f 0%, #0d0d1f 50%, #080b18 100%)" }}
      >
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-20">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-base uppercase tracking-widest font-semibold mb-2" style={{ color: "#7c3aed" }}>
              Your Rooms
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: "#f4f4ff", letterSpacing: "-0.02em" }}
                >
                  My Rooms
                </h1>
                <p className="mt-2 text-lg" style={{ color: "#8888aa" }}>
                  {rooms.length} room{rooms.length !== 1 ? "s" : ""} you own
                </p>
              </div>
              <Link
                href="/rooms"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold self-start sm:self-auto"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                }}
              >
                Browse All Rooms
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div
              className="w-full h-px mt-6"
              style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
            />
          </motion.div>

          {rooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 gap-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <BookOpen className="w-7 h-7" style={{ color: "#7c3aed" }} />
              </div>
              <p className="text-2xl font-semibold" style={{ color: "#f4f4ff" }}>No rooms yet</p>
              <p className="text-lg" style={{ color: "#5e5e80" }}>You have not created any rooms yet.</p>
              <Link
                href="/rooms"
                className="mt-2 px-5 py-2.5 rounded-xl text-base font-semibold"
                style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
              >
                Create your first room
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {rooms.map((room) => {
                const fillPct = Math.round((room.currentMembers / room.maxMembers) * 100);
                return (
                  <motion.div
                    key={room._id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -4, boxShadow: "0 12px 48px rgba(124,58,237,0.18)" }}
                    transition={{ duration: 0.22 }}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Link href={`/rooms/${room._id}`} className="flex flex-col flex-1">
                      {room.image ? (
                        <div className="w-full h-36 overflow-hidden relative">
                          <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                          <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(to bottom, transparent 50%, #0d0d1f 100%)" }}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-full h-36 flex items-center justify-center"
                          style={{ background: "rgba(124,58,237,0.07)" }}
                        >
                          <ImageIcon className="w-8 h-8" style={{ color: "rgba(124,58,237,0.3)" }} />
                        </div>
                      )}
                      <div className="flex flex-col flex-1 p-4 gap-3">
                        <div>
                          <h2 className="font-semibold text-lg leading-snug line-clamp-1" style={{ color: "#f4f4ff" }}>
                            {room.name}
                          </h2>
                          <p className="text-base mt-0.5" style={{ color: "#5e5e80" }}>By {room.owner}</p>
                        </div>
                        <p className="text-base leading-relaxed line-clamp-2 flex-1" style={{ color: "#8888aa" }}>
                          {room.description || "No description provided"}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
                              <span className="text-sm" style={{ color: "#8888aa" }}>
                                {room.currentMembers}/{room.maxMembers} members
                              </span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: fillPct >= 80 ? "#f87171" : "#6366f1" }}>
                              {fillPct}%
                            </span>
                          </div>
                          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${fillPct}%`,
                                background: fillPct >= 80
                                  ? "linear-gradient(90deg, #f87171, #ef4444)"
                                  : "linear-gradient(90deg, #7c3aed, #6366f1)",
                              }}
                            />
                          </div>
                        </div>
                        <div
                          className="flex items-center justify-between mt-1 pt-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          <span className="text-sm font-medium" style={{ color: "#a78bfa" }}>Open Room</span>
                          <ArrowRight className="w-4 h-4" style={{ color: "#a78bfa" }} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
}