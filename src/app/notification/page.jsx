"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import UserNavbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Mail, Users, CheckCircle2, XCircle } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useUser();
  const [invites, setInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("invites");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const inviteRes = await fetch(`/api/notifications/invites?userId=${user.id}`);
        const inviteData = await inviteRes.json();
        const requestRes = await fetch(`/api/notifications/requests?userId=${user.id}`);
        const requestData = await requestRes.json();

        if (inviteRes.ok) setInvites(inviteData);
        else toast.error("Failed to fetch invites!");

        if (requestRes.ok) setRequests(requestData);
        else toast.error("Failed to fetch requests!");
      } catch (err) {
        console.error(err);
        toast.error("Error fetching notifications!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleInviteAction = async (inviteId, action) => {
    try {
      const res = await fetch(`/api/notifications/invites/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: user.id }),
      });
      if (res.ok) {
        setInvites((prev) => prev.filter((i) => i.inviteId !== inviteId));
        toast.success(`Invite ${action}ed successfully!`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to perform action!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to perform action!");
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const res = await fetch(`/api/notifications/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: user.id }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
        toast.success(`Request ${action}ed successfully!`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to perform action!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to perform action!");
    }
  };

  const tabs = [
    { id: "invites", label: "Room Invitations", Icon: Mail, count: invites.length },
    { id: "requests", label: "Room Requests", Icon: Users, count: requests.length },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.07 } }),
  };

  return (
    <div className="flex flex-col min-h-screen"
      style={{ background: "linear-gradient(160deg, #07070f 0%, #0d0d1f 50%, #080b18 100%)" }}>
      <UserNavbar />

      <main className="flex-1 px-4 sm:px-8 md:px-16 py-10 md:py-14" style={{ color: "#f4f4ff" }}>

        {/* Page header */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 32px rgba(124,58,237,0.4)" }}>
            <Bell className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center" style={{ color: "#f4f4ff" }}>Notifications</h1>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Manage your room invitations and join requests</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {tabs.map(({ id, label, Icon, count }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                style={
                  active
                    ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8888aa" }
                }
              >
                <Icon className="w-4 h-4" />
                {label}
                {count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: active ? "rgba(255,255,255,0.2)" : "rgba(124,58,237,0.3)",
                      color: active ? "#fff" : "#c4b5fd",
                    }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto"
            >
              {/* Invitations */}
              {activeTab === "invites" && (
                invites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <Mail className="w-7 h-7" style={{ color: "#7c3aed" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No pending invitations</p>
                      <p className="text-sm" style={{ color: "#5e5e80" }}>When someone invites you to a room, it will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {invites.map((invite, i) => (
                      <motion.div key={invite.inviteId} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl transition-all duration-200"
                        style={{ background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)", border: "1px solid rgba(124,58,237,0.2)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.45)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(124,58,237,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {invite.roomImage ? (
                            <img src={invite.roomImage} alt={invite.roomName}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                              style={{ border: "2px solid rgba(124,58,237,0.3)" }} />
                          ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                              <Mail className="w-5 h-5" style={{ color: "#a78bfa" }} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "#f4f4ff" }}>{invite.roomName}</p>
                            <p className="text-sm" style={{ color: "#8888aa" }}>Invited by {invite.roomOwner}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 sm:ml-4">
                          <button onClick={() => handleInviteAction(invite.inviteId, "accept")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.22)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.12)"; }}>
                            <CheckCircle2 className="w-4 h-4" /> Accept
                          </button>
                          <button onClick={() => handleInviteAction(invite.inviteId, "reject")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}>
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {/* Requests */}
              {activeTab === "requests" && (
                requests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                      <Users className="w-7 h-7" style={{ color: "#7c3aed" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1" style={{ color: "#f4f4ff" }}>No pending requests</p>
                      <p className="text-sm" style={{ color: "#5e5e80" }}>Join requests for your rooms will appear here.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {requests.map((request, i) => (
                      <motion.div key={request.requestId} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl transition-all duration-200"
                        style={{ background: "linear-gradient(160deg, #111128 0%, #0d0d1f 100%)", border: "1px solid rgba(124,58,237,0.2)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.45)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(124,58,237,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {request.roomImage ? (
                            <img src={request.roomImage} alt={request.roomName}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                              style={{ border: "2px solid rgba(124,58,237,0.3)" }} />
                          ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                              <Users className="w-5 h-5" style={{ color: "#a78bfa" }} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "#f4f4ff" }}>{request.roomName}</p>
                            <p className="text-sm" style={{ color: "#8888aa" }}>Owner: {request.roomOwner}</p>
                            <p className="text-xs italic" style={{ color: "#5e5e80" }}>Requested by: {request.fromUserEmail}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 sm:ml-4">
                          <button onClick={() => handleRequestAction(request.requestId, "accept")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.22)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.12)"; }}>
                            <CheckCircle2 className="w-4 h-4" /> Accept
                          </button>
                          <button onClick={() => handleRequestAction(request.requestId, "reject")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}>
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}