"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Crown, UserMinus, X, Trash2, ShieldCheck } from "lucide-react";

export default function Members({ roomId }) {
  const [members, setMembers] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/members`);
        const data = await res.json();
        if (res.ok) {
          setMembers(data.members || []);
          setOwner(data.owner);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        toast.error("Failed to fetch members!");
      } finally {
        setLoading(false);
      }
    };
    if (roomId && user) fetchMembers();
  }, [roomId, user]);

  const toggleMemberSelection = (clerkId) => {
    setSelectedMembers((prev) =>
      prev.includes(clerkId)
        ? prev.filter((id) => id !== clerkId)
        : [...prev, clerkId]
    );
  };

  const handleRemoveMembers = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/remove-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: selectedMembers }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers((prev) =>
          prev.filter((m) => !selectedMembers.includes(m.clerkId))
        );
        setSelectedMembers([]);
        setRemoveModalOpen(false);
        toast.success("Member(s) removed successfully!");
      } else {
        toast.error(data.error || "Failed to remove members!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong!");
    }
  };

  if (loading) return <Spinner />;

  const isOwner = owner?.clerkId === user?.id;
  const totalCount = members.length + (owner ? 1 : 0);

  return (
    <div
      className="p-5 md:p-7 min-h-full"
      style={{ color: "#f4f4ff" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>
              Members
            </h2>
            <p className="text-sm" style={{ color: "#5e5e80" }}>
              {totalCount} {totalCount === 1 ? "person" : "people"} in this room
            </p>
          </div>
        </div>

        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setRemoveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            <UserMinus className="w-4 h-4" />
            Remove Members
          </motion.button>
        )}
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-6"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Owner card */}
      {owner && (
        <div className="mb-5">
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#7c3aed" }}>
            Room Owner
          </p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.07) 100%)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <div className="relative flex-shrink-0">
              <img
                src={owner.profileImage || "/default-avatar.png"}
                alt={owner.name}
                className="w-12 h-12 rounded-full object-cover"
                style={{ border: "2px solid rgba(124,58,237,0.5)" }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "2px solid #0d0d1f" }}
              >
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: "#f4f4ff" }}>{owner.name}</p>
              <p className="text-sm truncate" style={{ color: "#5e5e80" }}>{owner.email}</p>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <Crown className="w-3 h-3" style={{ color: "#f59e0b" }} />
              <span className="text-xs font-semibold" style={{ color: "#fbbf24" }}>Owner</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Members list */}
      {members.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#5e5e80" }}>
            Members — {members.length}
          </p>
          <motion.ul
            className="space-y-2"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {members.map((member) => (
              <motion.li
                key={member.clerkId}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
                whileHover={{
                  background: "rgba(124,58,237,0.06)",
                  borderColor: "rgba(124,58,237,0.15)",
                }}
              >
                <img
                  src={member.profileImage || "/default-avatar.png"}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: "#e2d9ff" }}>{member.name}</p>
                  <p className="text-sm truncate" style={{ color: "#5e5e80" }}>{member.email}</p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                >
                  <ShieldCheck className="w-3 h-3" style={{ color: "#818cf8" }} />
                  <span className="text-xs font-medium" style={{ color: "#a5b4fc" }}>Member</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      {/* Empty state */}
      {members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <Users className="w-6 h-6" style={{ color: "#7c3aed" }} />
          </div>
          <p className="text-base font-semibold" style={{ color: "#f4f4ff" }}>No members yet</p>
          <p className="text-sm" style={{ color: "#5e5e80" }}>Invite people to join this room.</p>
        </div>
      )}

      {/* Remove Members Modal */}
      <AnimatePresence>
        {removeModalOpen && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setRemoveModalOpen(false); }}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #141430 0%, #0d0d22 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)",
              }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: "#f87171" }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "#f4f4ff" }}>Remove Members</h3>
                    <p className="text-xs" style={{ color: "#5e5e80" }}>Select members to remove from this room</p>
                  </div>
                </div>
                <button
                  onClick={() => setRemoveModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <X className="w-4 h-4" style={{ color: "#8888aa" }} />
                </button>
              </div>

              {/* Member list */}
              <div className="px-6 py-4 max-h-72 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {members.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: "#5e5e80" }}>No members to remove.</p>
                ) : (
                  <ul className="space-y-2">
                    {members.map((member) => {
                      const isOwnerMember = owner?.clerkId === member.clerkId;
                      const isChecked = selectedMembers.includes(member.clerkId);
                      return (
                        <li
                          key={member.clerkId}
                          onClick={() => !isOwnerMember && toggleMemberSelection(member.clerkId)}
                          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
                          style={{
                            background: isChecked
                              ? "rgba(239,68,68,0.08)"
                              : "rgba(255,255,255,0.03)",
                            border: isChecked
                              ? "1px solid rgba(239,68,68,0.3)"
                              : "1px solid rgba(255,255,255,0.05)",
                            cursor: isOwnerMember ? "not-allowed" : "pointer",
                            opacity: isOwnerMember ? 0.45 : 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled={isOwnerMember}
                            checked={isChecked}
                            onChange={() => toggleMemberSelection(member.clerkId)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 flex-shrink-0 accent-violet-500"
                          />
                          <img
                            src={member.profileImage || "/default-avatar.png"}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "#e2d9ff" }}>{member.name}</p>
                            <p className="text-xs truncate" style={{ color: "#5e5e80" }}>{member.email}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Modal footer */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-sm" style={{ color: "#5e5e80" }}>
                  {selectedMembers.length > 0
                    ? `${selectedMembers.length} selected`
                    : "Select members above"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setRemoveModalOpen(false); setSelectedMembers([]); }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#8888aa",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveMembers}
                    disabled={selectedMembers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: selectedMembers.length === 0
                        ? "rgba(239,68,68,0.1)"
                        : "linear-gradient(135deg, #dc2626, #b91c1c)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: selectedMembers.length === 0 ? "#5e5e80" : "#fff",
                      cursor: selectedMembers.length === 0 ? "not-allowed" : "pointer",
                      boxShadow: selectedMembers.length > 0 ? "0 0 16px rgba(220,38,38,0.3)" : "none",
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}