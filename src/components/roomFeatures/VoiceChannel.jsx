"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneCall, PhoneOff, Radio, Users } from "lucide-react";

export default function VoiceChannel({ roomId, userId }) {
  const [client, setClient] = useState(null);
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  // Initialize Agora client
  useEffect(() => {
    const initAgora = async () => {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const c = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      setClient(c);
    };
    initAgora();
  }, []);

  // Poll room API to check voice status every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        const data = await res.json();
        setVoiceActive(data.voiceActive);
      } catch (err) {
        console.error("Error fetching room data:", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const startVoiceChat = async () => {
    try {
      await fetch(`/api/rooms/${roomId}/start-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setIsHost(true);
      setVoiceActive(true);
      joinChannel();
    } catch (err) {
      console.error("Error starting voice chat:", err);
    }
  };

  const joinChannel = async () => {
    if (!client) return;
    const APP_ID = process.env.NEXT_PUBLIC_VOICE_APP_ID;
    const channel = roomId || "defaultRoom";
    const uid = userId || Math.floor(Math.random() * 100000);
    const res = await fetch(`/api/agora-token?channel=${channel}&uid=${uid}`);
    const { token } = await res.json();
    await client.join(APP_ID, channel, token, uid);
    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    const localTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await client.publish([localTrack]);
    setJoined(true);
    client.on("user-published", async (remoteUser, mediaType) => {
      await client.subscribe(remoteUser, mediaType);
      if (mediaType === "audio") {
        remoteUser.audioTrack.play();
      }
    });
  };

  const leaveChannel = async () => {
    if (!client) return;
    await client.leave();
    setJoined(false);
    if (isHost) {
      try {
        await fetch(`/api/rooms/${roomId}/end-voice`, { method: "POST" });
      } catch (err) {
        console.error("Error ending voice chat:", err);
      }
    }
    setIsHost(false);
    setVoiceActive(false);
  };

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>Voice Channel</h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Real-time voice communication</p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-8"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Status indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full"
            style={{
              background: voiceActive ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${voiceActive ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: voiceActive ? "#22c55e" : "#5e5e80",
                boxShadow: voiceActive ? "0 0 8px rgba(34,197,94,0.6)" : "none",
              }}
            />
            <span className="text-sm font-semibold"
              style={{ color: voiceActive ? "#86efac" : "#8888aa" }}>
              {voiceActive ? "Voice Session Active" : "No Active Session"}
            </span>
          </div>
        </div>

        {/* Center visual */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative flex items-center justify-center">
            {/* Pulse rings when active */}
            <AnimatePresence>
              {voiceActive && (
                <>
                  {[1, 2, 3].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute rounded-full"
                      style={{
                        border: `1px solid ${joined ? "rgba(124,58,237,0.4)" : "rgba(34,197,94,0.35)"}`,
                      }}
                      initial={{ width: 80, height: 80, opacity: 0.8 }}
                      animate={{ width: 80 + ring * 36, height: 80 + ring * 36, opacity: 0 }}
                      transition={{ duration: 2, delay: ring * 0.5, repeat: Infinity, ease: "easeOut" }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Core icon circle */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center relative z-10 transition-all duration-500"
              style={{
                background: joined
                  ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.25))"
                  : voiceActive
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(255,255,255,0.04)",
                border: joined
                  ? "2px solid rgba(124,58,237,0.5)"
                  : voiceActive
                  ? "2px solid rgba(34,197,94,0.4)"
                  : "2px solid rgba(255,255,255,0.08)",
                boxShadow: joined
                  ? "0 0 32px rgba(124,58,237,0.3)"
                  : voiceActive
                  ? "0 0 24px rgba(34,197,94,0.2)"
                  : "none",
              }}
            >
              {joined ? (
                <Mic className="w-8 h-8" style={{ color: "#a78bfa" }} />
              ) : voiceActive ? (
                <Radio className="w-8 h-8" style={{ color: "#86efac" }} />
              ) : (
                <MicOff className="w-8 h-8" style={{ color: "#5e5e80" }} />
              )}
            </div>
          </div>

          {/* Status text */}
          <div className="text-center">
            <p className="text-base font-semibold mb-1" style={{ color: "#f4f4ff" }}>
              {joined
                ? "Connected to Voice Channel"
                : voiceActive
                ? "Session in progress — join to participate"
                : "Start a session to enable voice"}
            </p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>
              {joined
                ? "Your microphone is live"
                : voiceActive
                ? "Click below to join the session"
                : "You will become the host"}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {!voiceActive ? (
              <motion.button
                key="start"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                onClick={startVoiceChat}
                className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  color: "#fff",
                  boxShadow: "0 0 24px rgba(124,58,237,0.35)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 36px rgba(124,58,237,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <PhoneCall className="w-4 h-4" />
                Start Voice Session
              </motion.button>
            ) : !joined ? (
              <motion.button
                key="join"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                onClick={joinChannel}
                className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.2))",
                  border: "1px solid rgba(34,197,94,0.4)",
                  color: "#86efac",
                  boxShadow: "0 0 20px rgba(34,197,94,0.15)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 32px rgba(34,197,94,0.3)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Users className="w-4 h-4" />
                Join Voice Session
              </motion.button>
            ) : (
              <motion.button
                key="leave"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                onClick={leaveChannel}
                className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                  boxShadow: "0 0 16px rgba(239,68,68,0.1)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 28px rgba(239,68,68,0.25)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px rgba(239,68,68,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <PhoneOff className="w-4 h-4" />
                Leave Session
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Host badge */}
        <AnimatePresence>
          {isHost && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex justify-center mt-4"
            >
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#a78bfa",
                }}
              >
                You are the host
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}