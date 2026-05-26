"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import Spinner from "../Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Search, Send, Loader2, Users } from "lucide-react";

export default function InviteMembers({ roomId }) {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(null);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/search-users?query=${value}`);
      const data = await res.json();
      if (res.ok) setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Search failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (email) => {
    try {
      setInviting(email);
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, email, fromUserId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Invitation sent!");
      } else {
        toast.error(data.error || "Failed to invite.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to invite.");
    } finally {
      setInviting(null);
    }
  };

  return (
    <div className="p-5 md:p-7 min-h-full" style={{ color: "#f4f4ff" }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#f4f4ff" }}>
            Invite Members
          </h2>
          <p className="text-sm" style={{ color: "#5e5e80" }}>
            Search by email and send invitations
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-6"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
      />

      {/* Search input */}
      <div className="relative w-full">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "#5e5e80" }}
          />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search by email address..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-base outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f4f4ff",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(124,58,237,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
          {loading && (
            <Loader2
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin"
              style={{ color: "#7c3aed" }}
            />
          )}
        </div>

        {/* Results dropdown */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full left-0 z-20 w-full mt-2 rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #141430 0%, #0d0d22 100%)",
                border: "1px solid rgba(124,58,237,0.2)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08)",
                maxHeight: "280px",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#5e5e80" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""} found
                </p>
              </div>
              {results.map((result, i) => (
                <motion.li
                  key={result._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 mx-2 mb-1 rounded-xl transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  {/* Avatar initials */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))",
                      border: "1px solid rgba(124,58,237,0.25)",
                      color: "#c4b5fd",
                    }}
                  >
                    {result.email?.[0]?.toUpperCase() || "?"}
                  </div>

                  <span className="flex-1 text-sm truncate" style={{ color: "#e2d9ff" }}>
                    {result.email}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleInvite(result.email)}
                    disabled={inviting === result.email}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all"
                    style={{
                      background: inviting === result.email
                        ? "rgba(124,58,237,0.15)"
                        : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      color: inviting === result.email ? "#8888aa" : "#fff",
                      border: "1px solid rgba(124,58,237,0.3)",
                      boxShadow: inviting === result.email ? "none" : "0 0 12px rgba(124,58,237,0.3)",
                      cursor: inviting === result.email ? "not-allowed" : "pointer",
                    }}
                  >
                    {inviting === result.email ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    {inviting === result.email ? "Sending..." : "Invite"}
                  </motion.button>
                </motion.li>
              ))}
              <div className="pb-2" />
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Empty / idle state */}
      {!loading && results.length === 0 && query.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <Users className="w-7 h-7" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold mb-1" style={{ color: "#f4f4ff" }}>
              Invite people to this room
            </p>
            <p className="text-sm" style={{ color: "#5e5e80" }}>
              Type at least 2 characters to search for users by email.
            </p>
          </div>
        </motion.div>
      )}

      {/* No results state */}
      {!loading && results.length === 0 && query.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-3 mt-4"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Search className="w-6 h-6" style={{ color: "#5e5e80" }} />
          </div>
          <p className="text-base font-semibold" style={{ color: "#f4f4ff" }}>No users found</p>
          <p className="text-sm" style={{ color: "#5e5e80" }}>
            No account matches &ldquo;{query}&rdquo;
          </p>
        </motion.div>
      )}
    </div>
  );
}