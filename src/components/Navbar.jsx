"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, Menu, X, BookOpen } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function UserNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { user } = useUser();
  const drawerRef = useRef(null);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Rooms", href: "/rooms" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Contact Us", href: "/contact" },
    { label: "My-Rooms", href: "/my-rooms" },
    { label: "Joined-Rooms", href: "/joined-rooms" },
  ];

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Fetch invites + requests count
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const [invitesRes, requestsRes] = await Promise.all([
          fetch(`/api/notifications/invites?userId=${user.id}`),
          fetch(`/api/notifications/requests?userId=${user.id}`),
        ]);

        const invites = invitesRes.ok ? await invitesRes.json() : [];
        const requests = requestsRes.ok ? await requestsRes.json() : [];

        setNotifCount(invites.length + requests.length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [user]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(6, 6, 18, 0.92)"
            : "rgba(6, 6, 18, 0.60)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled
            ? "0 1px 0 rgba(139,92,246,0.12), 0 8px 40px rgba(0,0,0,0.5)"
            : "none",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 30%, rgba(99,102,241,0.6) 70%, transparent 100%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between h-[70px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              {/* Logo mark */}
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200 group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  boxShadow: "0 0 12px rgba(124,58,237,0.4)",
                }}
              >
                <BookOpen className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              {/* Wordmark */}
              <span
                className="text-[1.55rem] font-bold tracking-tight select-none"
                style={{ color: "#f4f4ff", letterSpacing: "-0.025em" }}
              >
                Mindora
              </span>
            </Link>

            {/* ── Desktop nav links — centered pill hovers ── */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative px-3.5 py-2 rounded-lg text-[0.95rem] font-medium transition-all duration-150"
                  style={{ color: "#8888aa" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#e8e8ff";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#8888aa";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* ── Desktop right ── */}
            <div className="hidden md:flex items-center gap-2.5">
              <SignedIn>
                <a
                  href="/notification"
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
                  style={{ color: "#7070a0" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#c4b5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#7070a0";
                  }}
                >
                  <Bell
                    className={`w-[18px] h-[18px] ${notifCount > 0 ? "animate-pulse" : ""}`}
                    style={{ color: "inherit" }}
                  />
                  {notifCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white"
                      style={{ background: "#7c3aed" }}
                    >
                      {notifCount}
                    </span>
                  )}
                </a>
              </SignedIn>

              {/* Divider */}
              <SignedOut>
                <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.08)" }} />
              </SignedOut>

              <SignedOut>
                <SignInButton>
                  <button
                    className="px-4 py-2 rounded-lg text-[0.95rem] font-semibold transition-all duration-150"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      color: "#c4b5fd",
                      border: "1px solid rgba(139,92,246,0.35)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(124,58,237,0.25)";
                      e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(124,58,237,0.15)";
                      e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)";
                    }}
                  >
                    Sign In
                  </button>
                </SignInButton>
                <Link href="/sign-up">
                  <button
                    className="px-4 py-2 rounded-lg text-[0.95rem] font-semibold transition-all duration-150"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 0 14px rgba(124,58,237,0.3)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 22px rgba(124,58,237,0.5)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 14px rgba(124,58,237,0.3)")}
                  >
                    Get Started
                  </button>
                </Link>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            {/* ── Mobile right ── */}
            <div className="md:hidden flex items-center gap-2">
              <SignedIn>
                <a
                  href="/notification"
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
                  style={{ color: "#7070a0" }}
                >
                  <Bell
                    className={`w-[18px] h-[18px] ${notifCount > 0 ? "animate-pulse" : ""}`}
                    style={{ color: notifCount > 0 ? "#a78bfa" : "inherit" }}
                  />
                  {notifCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white"
                      style={{ background: "#7c3aed" }}
                    >
                      {notifCount}
                    </span>
                  )}
                </a>
              </SignedIn>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#9090b8",
                }}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Overlay ── */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* ── Mobile Drawer ── */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[280px] z-50 md:hidden flex flex-col"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
          background: "#0b0b1a",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.7)",
        }}
      >
        {/* Drawer top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)",
          }}
        />

        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 h-[70px] flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-md"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                boxShadow: "0 0 10px rgba(124,58,237,0.35)",
              }}
            >
              <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2.2} />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "#f4f4ff", letterSpacing: "-0.025em" }}
            >
              Mindora
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#7070a0",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation section label */}
        <div className="px-5 pt-5 pb-2">
          <span
            className="uppercase tracking-widest"
            style={{ fontSize: "10px", fontWeight: 600, color: "#3d3d5c", letterSpacing: "0.12em" }}
          >
            Navigation
          </span>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-3.5 py-2.5 rounded-lg text-[0.95rem] font-medium transition-all duration-150"
              style={{ color: "#8888aa" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "#e0e0f8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#8888aa";
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth footer */}
        <div
          className="px-4 pb-8 pt-4 flex flex-col gap-2.5 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <SignedOut>
            <SignInButton>
              <button
                className="w-full py-2.5 rounded-lg text-[0.95rem] font-semibold transition-all duration-150"
                style={{
                  background: "rgba(124,58,237,0.15)",
                  color: "#c4b5fd",
                  border: "1px solid rgba(139,92,246,0.35)",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </SignInButton>
            <Link href="/sign-up" onClick={() => setIsOpen(false)}>
              <button
                className="w-full py-2.5 rounded-lg text-[0.95rem] font-semibold transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(124,58,237,0.3)",
                }}
              >
                Get Started
              </button>
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3 px-1 py-1">
              <UserButton afterSignOutUrl="/" />
              <div className="flex flex-col">
                <span className="text-sm font-medium" style={{ color: "#c0c0e0" }}>Account</span>
                <span className="text-[13px]" style={{ color: "#444460" }}>Manage your profile</span>
              </div>
            </div>
          </SignedIn>
        </div>
      </div>
    </>
  );
}