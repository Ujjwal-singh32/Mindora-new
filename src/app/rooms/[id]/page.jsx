"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ChatWidget from "@/components/roomFeatures/Chats";
import Members from "@/components/roomFeatures/Members";
import UploadNotes from "@/components/roomFeatures/UploadNotes";
import InviteMembers from "@/components/roomFeatures/InviteMembers";
import VoiceChannel from "@/components/roomFeatures/VoiceChannel";
import UploadLink from "@/components/roomFeatures/AddYoutubeLinks";
import UploadImage from "@/components/roomFeatures/UploadImages";
import UploadedNotes from "@/components/roomFeatures/UploadedNotes";
import UploadedLinks from "@/components/roomFeatures/YoutubeLinks";
import UploadedImages from "@/components/roomFeatures/UploadedImages";
import ShortNotes from "@/components/roomFeatures/ShortNotes";
import QuizGenerator from "@/components/roomFeatures/GenerateQuiz";
import AttemptQuiz from "@/components/roomFeatures/AttemptQuiz";
import Whiteboard from "@/components/roomFeatures/Whiteboard";
import LeaderboardPageDummy from "@/components/roomFeatures/ShowLeaderboard";
import AnnouncementsPage from "@/components/roomFeatures/Announcements";
import UploadAnnouncement from "@/components/roomFeatures/AnnounceToRoom";
import {
  Users, Upload, UserPlus, Mic, Link2, Image, FileText, Youtube,
  Images, StickyNote, Brain, Trophy, Radio, PenLine, Megaphone,
  Bell, Menu, X, ChevronRight,
} from "lucide-react";

const sidebarOptions = [
  { label: "Members",          icon: Users      },
  { label: "Invite Members",   icon: UserPlus   },
  { label: "Upload Notes",     icon: Upload     },
  { label: "Upload Image",     icon: Image      },
  { label: "Add Links",        icon: Link2      },
  { label: "Generate Quiz",    icon: Brain      },
  { label: "Uploaded Notes",   icon: FileText   },
  { label: "Uploaded Images",  icon: Images     },
  { label: "Links",            icon: Youtube    },
  { label: "Short Notes",      icon: StickyNote },
  { label: "Attempt Quiz",     icon: PenLine    },
  { label: "Leaderboard",      icon: Trophy     },
  { label: "Voice Call",       icon: Mic        },
  { label: "Whiteboard",       icon: Radio      },
  { label: "Announce To Room", icon: Megaphone  },
  { label: "Announcements",    icon: Bell       },
];

function SidebarContent({ sidebarRef, buttonRefs, selected, handleSelect }) {
  return (
    <div
      ref={sidebarRef}
      className="flex flex-col h-full overflow-y-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-5 pb-4 flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #0e0e22 85%, transparent 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <span className="text-base font-semibold" style={{ color: "#f4f4ff" }}>
            Features
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {sidebarOptions.map(({ label, icon: Icon }, i) => {
          const isActive = selected === label;
          return (
            <button
              key={label}
              ref={(el) => (buttonRefs.current[i] = el)}
              onClick={() => handleSelect(label, i)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(79,70,229,0.15) 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(124,58,237,0.3)"
                  : "1px solid transparent",
              }}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: isActive ? "#a78bfa" : "#5e5e80" }}
              />
              <span
                className="text-sm font-medium truncate"
                style={{ color: isActive ? "#e2d9ff" : "#8888aa" }}
              >
                {label}
              </span>
              {isActive && (
                <ChevronRight
                  className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                  style={{ color: "#7c3aed" }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function RoomFeaturesPage() {
  const [selected, setSelected] = useState(sidebarOptions[0].label);
  const [roomData, setRoomData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const buttonRefs = useRef([]);
  const params = useParams();
  const id = params.id;
  const { user } = useUser();
  const userId = user ? user.id : null;
  const firstName = user?.firstName;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${id}/detail`);
        const data = await res.json();
        if (!data.error) setRoomData(data);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    fetchRoom();
  }, [id]);

  const componentsMap = {
    "Members":          <Members roomId={id} />,
    "Upload Notes":     <UploadNotes roomId={id} />,
    "Invite Members":   <InviteMembers roomId={id} />,
    "Voice Call":       <VoiceChannel roomId={id} userId={userId} />,
    "Add Links":        <UploadLink roomId={id} />,
    "Upload Image":     <UploadImage roomId={id} />,
    "Uploaded Notes":   <UploadedNotes roomId={id} />,
    "Links":            <UploadedLinks roomId={id} />,
    "Uploaded Images":  <UploadedImages roomId={id} />,
    "Short Notes":      <ShortNotes roomId={id} />,
    "Generate Quiz":    <QuizGenerator roomId={id} />,
    "Attempt Quiz":     <AttemptQuiz roomId={id} />,
    "Leaderboard":      <LeaderboardPageDummy roomId={id} />,
    "Whiteboard":       <Whiteboard roomId={id} />,
    "Announcements":    <AnnouncementsPage roomId={id} />,
    "Announce To Room": <UploadAnnouncement roomId={id} />,
  };

  const handleSelect = (option, index) => {
    setSelected(option);
    setIsSidebarOpen(false);
    const button = buttonRefs.current[index];
    const sidebar = sidebarRef.current;
    if (button && sidebar) {
      const scrollTop =
        button.offsetTop - sidebar.clientHeight / 2 + button.clientHeight / 2;
      sidebar.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  };

  const selectedOption = sidebarOptions.find((o) => o.label === selected);
  const SelectedIcon = selectedOption?.icon;

  return (
    /*
     * Layout strategy: page-level scroll, sticky sidebar.
     *
     * ┌──────────────────────────────────────────────┐
     * │  <Navbar />  (sticky top-0 inside its own    │
     * │               component, ~70px tall)          │
     * ├──────────┬───────────────────────────────────┤
     * │ Sidebar  │  Room header                      │
     * │ sticky   │  Feature component                │
     * │ top-[70] │  ...                              │
     * │ h-[calc  │  <Footer />                       │
     * │ (100vh-  │                                   │
     * │  70px)]  │                                   │
     * └──────────┴───────────────────────────────────┘
     *
     * The page itself scrolls normally.
     * The sidebar is sticky so it stays visible while content scrolls.
     * Footer sits naturally after all content — no trapping.
     */
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #07070f 0%, #0d0d1f 50%, #080b18 100%)" }}
    >
      <Navbar />

      {/* Body row: sidebar + main column */}
      <div className="flex items-start">

        {/* ── Desktop sidebar: sticky, never covers navbar ── */}
        <aside
          className="hidden md:flex flex-col w-64 flex-shrink-0 sticky top-[70px] h-[calc(100vh-70px)]"
          style={{
            background: "linear-gradient(180deg, #0e0e22 0%, #090916 100%)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <SidebarContent
            sidebarRef={sidebarRef}
            buttonRefs={buttonRefs}
            selected={selected}
            handleSelect={handleSelect}
          />
        </aside>

        {/* ── Mobile drawer (fixed, below navbar) ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 md:hidden"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.div
                key="drawer"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 z-50 w-72 md:hidden"
                style={{
                  top: "70px",
                  bottom: 0,
                  background: "linear-gradient(180deg, #0e0e22 0%, #090916 100%)",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <SidebarContent
                  sidebarRef={null}
                  buttonRefs={buttonRefs}
                  selected={selected}
                  handleSelect={handleSelect}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Right column: room content + footer ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 md:p-6">

            {/* Room header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
              style={{
                background: "linear-gradient(135deg, #111128 0%, #0d0d1f 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              }}
            >
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: "0 0 14px rgba(124,58,237,0.4)",
                }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen
                  ? <X className="w-4 h-4 text-white" />
                  : <Menu className="w-4 h-4 text-white" />
                }
              </button>

              {/* Room avatar */}
              {roomData?.image ? (
                <img
                  src={roomData.image}
                  alt={roomData.name}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  style={{ border: "1px solid rgba(124,58,237,0.3)" }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    border: "1px solid rgba(124,58,237,0.3)",
                  }}
                >
                  <span className="text-base font-bold text-white">
                    {roomData?.name?.[0]?.toUpperCase() || "R"}
                  </span>
                </div>
              )}

              {/* Room info */}
              <div className="flex-1 min-w-0">
                <h2
                  className="text-base font-bold leading-tight truncate"
                  style={{ color: "#f4f4ff" }}
                >
                  {roomData?.name || "Loading..."}
                </h2>
                <p className="text-xs truncate" style={{ color: "#5e5e80" }}>
                  {roomData?.owner ? `By ${roomData.owner}` : ""}
                </p>
              </div>

              {/* Active section badge */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                {SelectedIcon && (
                  <SelectedIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#a78bfa" }} />
                )}
                <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>
                  {selected}
                </span>
              </div>
            </motion.div>

            {/* Feature area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  minHeight: "520px",
                }}
              >
                {componentsMap[selected] || (
                  <div className="flex flex-col items-center justify-center gap-3 p-16">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "rgba(124,58,237,0.1)",
                        border: "1px solid rgba(124,58,237,0.2)",
                      }}
                    >
                      {SelectedIcon && (
                        <SelectedIcon className="w-6 h-6" style={{ color: "#7c3aed" }} />
                      )}
                    </div>
                    <p className="text-lg font-semibold" style={{ color: "#f4f4ff" }}>
                      {selected}
                    </p>
                    <p className="text-base" style={{ color: "#5e5e80" }}>
                      This section is under construction.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <Footer />
        </div>
      </div>

      <ChatWidget roomId={id} userName={firstName} />
    </div>
  );
}