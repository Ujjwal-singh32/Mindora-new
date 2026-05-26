"use client";

import UserNavbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, Search, ImageIcon, Upload, BookOpen } from "lucide-react";

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    image: "",
    description: "",
    maxMembers: 5,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { user } = useUser();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user) return;
      try {
        setLoading(true); // ✅ Show spinner while fetching
        const res = await fetch(`/api/rooms?userId=${user.id}`);
        const data = await res.json();
        setRooms(data.filter((room) => room.currentMembers < room.maxMembers));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch rooms!", {
          style: { background: "red", color: "white" },
        });
      } finally {
        setLoading(false); // ✅ Hide spinner after fetch
      }
    };
    fetchRooms();
  }, [user]);

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, image: data.secure_url }));
        toast.success("Image uploaded successfully!", {
          style: { background: "black", color: "yellow" },
        });
      } else {
        toast.error(data.error || "Image upload failed!", {
          style: { background: "red", color: "white" },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Image upload failed!", {
        style: { background: "red", color: "white" },
      });
    } finally {
      setUploading(false);
    }
  };

  // Create new room
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setRooms((prev) => [data, ...prev]);
        setShowForm(false);
        setFormData({ name: "", owner: "", image: "", description: "", maxMembers: 5 });
        toast.success("Room created successfully!", {
          style: { background: "black", color: "yellow" },
        });
      } else {
        toast.error(data.error || "Error creating room!", {
          style: { background: "red", color: "white" },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error creating room!", {
        style: { background: "red", color: "white" },
      });
    }
  };

  const handleJoinRequest = async (roomId) => {
    try {
      const res = await fetch("/api/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, fromUserId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Join request sent ✅", {
          style: { background: "black", color: "yellow" },
        });
      } else {
        toast.error(data.error || "Failed to send request!", {
          style: { background: "red", color: "white" },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error sending join request!", {
        style: { background: "red", color: "white" },
      });
    }
  };

  // ✅ Show Spinner while loading
  if (loading) return <Spinner />;

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <UserNavbar />
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(160deg, #07070f 0%, #0d0d1f 50%, #080b18 100%)" }}
      >
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
          >
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7c3aed" }}>
                Discover &amp; Collaborate
              </p>
              <h1
                className="text-3xl md:text-4xl font-bold"
                style={{ color: "#f4f4ff", letterSpacing: "-0.02em" }}
              >
                Available Rooms
              </h1>
              <p className="mt-2 text-sm" style={{ color: "#8888aa" }}>
                {rooms.length} room{rooms.length !== 1 ? "s" : ""} open for new members
              </p>
            </div>

            {/* Search + Create */}
            <div className="flex gap-3 w-full md:w-auto">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 md:w-56"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: "#5e5e80" }} />
                <input
                  type="text"
                  placeholder="Search rooms…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm outline-none w-full"
                  style={{ color: "#f4f4ff" }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(124,58,237,0.35)",
                }}
              >
                <Plus className="w-4 h-4" />
                Create Room
              </motion.button>
            </div>
          </motion.div>

          {/* Divider */}
          <div
            className="w-full h-px mb-8"
            style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }}
          />
        </div>

        {/* Create Room Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 20 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="w-full max-w-lg rounded-2xl p-6 md:p-8 relative"
                style={{
                  background: "linear-gradient(160deg, #0f0f22 0%, #0d0d1f 100%)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  boxShadow: "0 0 60px rgba(124,58,237,0.15)",
                }}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                    >
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold" style={{ color: "#f4f4ff" }}>
                      Create New Room
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "#8888aa",
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Room Name */}
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: "#8888aa" }}>
                      Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced React Study Group"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#f4f4ff",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: "#8888aa" }}>
                      Owner Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name or alias"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#f4f4ff",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: "#8888aa" }}>
                      Room Image <span style={{ color: "#5e5e80" }}>(optional)</span>
                    </label>
                    <label
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#8888aa",
                      }}
                    >
                      <Upload className="w-4 h-4 shrink-0" style={{ color: "#7c3aed" }} />
                      <span className="text-sm">
                        {uploading ? "Uploading…" : formData.image ? "Image uploaded ✓" : "Choose an image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                      />
                    </label>
                    {uploading && (
                      <p className="text-xs mt-1.5" style={{ color: "#7c3aed" }}>Uploading image…</p>
                    )}
                    {formData.image && !uploading && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="mt-2 w-full h-28 object-cover rounded-xl"
                        style={{ border: "1px solid rgba(124,58,237,0.2)" }}
                      />
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: "#8888aa" }}>
                      Description <span style={{ color: "#5e5e80" }}>(10–200 chars)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what this room is about…"
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#f4f4ff",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* Max Members */}
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: "#8888aa" }}>
                      Max Members
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      min={2}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#f4f4ff",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      value={formData.maxMembers}
                      onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#8888aa",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        color: "#fff",
                        boxShadow: "0 0 18px rgba(124,58,237,0.35)",
                      }}
                    >
                      Create Room
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rooms Grid */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
          {filteredRooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-28 gap-4"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <BookOpen className="w-6 h-6" style={{ color: "#7c3aed" }} />
              </div>
              <p className="text-base font-semibold" style={{ color: "#f4f4ff" }}>
                {search ? "No rooms match your search" : "No rooms available"}
              </p>
              <p className="text-sm" style={{ color: "#5e5e80" }}>
                {search ? "Try a different keyword" : "Be the first to create one!"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {filteredRooms.map((room) => {
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
                    {/* Room Image */}
                    {room.image ? (
                      <div className="w-full h-36 overflow-hidden relative">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
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

                    {/* Card Body */}
                    <div className="flex flex-col flex-1 p-4 gap-3">
                      <div>
                        <h2
                          className="font-semibold text-base leading-snug line-clamp-1"
                          style={{ color: "#f4f4ff" }}
                        >
                          {room.name}
                        </h2>
                        <p className="text-xs mt-0.5" style={{ color: "#5e5e80" }}>
                          by {room.owner}
                        </p>
                      </div>

                      <p
                        className="text-xs leading-relaxed line-clamp-2 flex-1"
                        style={{ color: "#8888aa" }}
                      >
                        {room.description || "No description provided"}
                      </p>

                      {/* Capacity bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" style={{ color: "#7c3aed" }} />
                            <span className="text-xs" style={{ color: "#8888aa" }}>
                              {room.currentMembers}/{room.maxMembers} members
                            </span>
                          </div>
                          <span className="text-xs" style={{ color: fillPct >= 80 ? "#f87171" : "#6366f1" }}>
                            {fillPct}%
                          </span>
                        </div>
                        <div
                          className="w-full h-1 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.07)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${fillPct}%`,
                              background: fillPct >= 80
                                ? "linear-gradient(90deg, #f87171, #ef4444)"
                                : "linear-gradient(90deg, #7c3aed, #6366f1)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Join button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleJoinRequest(room._id)}
                        className="w-full py-2 rounded-xl text-xs font-semibold transition-all mt-1"
                        style={{
                          background: "rgba(124,58,237,0.12)",
                          border: "1px solid rgba(124,58,237,0.35)",
                          color: "#a78bfa",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #7c3aed, #4f46e5)";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(124,58,237,0.12)";
                          e.currentTarget.style.color = "#a78bfa";
                          e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)";
                        }}
                      >
                        Ask to Join
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
