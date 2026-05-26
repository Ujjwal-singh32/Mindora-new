import { Facebook, Twitter, Linkedin, Instagram, BookOpen } from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Courses", href: "/courses" },
    { label: "Projects", href: "/projects" },
    { label: "Contact Us", href: "/contact" },
  ];

  const resources = [
    { label: "Blog", href: "#" },
    { label: "Guides", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Support", href: "#" },
  ];

  const socials = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
  ];

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080812 0%, #06060f 100%)" }}
    >
      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.45) 30%, rgba(99,102,241,0.45) 70%, transparent 100%)",
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[120px] opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  boxShadow: "0 0 14px rgba(124,58,237,0.35)",
                }}
              >
                <BookOpen className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: "#f4f4ff", letterSpacing: "-0.025em" }}
              >
                Mindora
              </span>
            </div>

            <p style={{ color: "#5e5e80", fontSize: "0.9rem", lineHeight: 1.75, maxWidth: "260px" }}>
              AI-powered collaborative learning. Connect, learn, and grow together with your peers.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
                  style={{ color: "#5e5e80", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#a78bfa";
                    e.currentTarget.style.background = "rgba(139,92,246,0.1)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#5e5e80";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                color: "#f0efff",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Quick Links
            </p>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-all duration-150"
                    style={{ color: "#5e5e80", fontSize: "0.9rem" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#5e5e80")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                color: "#f0efff",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Resources
            </p>
            <ul className="flex flex-col gap-2.5">
              {resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-all duration-150"
                    style={{ color: "#5e5e80", fontSize: "0.9rem" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#5e5e80")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <p
              style={{
                color: "#f0efff",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              Stay Updated
            </p>
            <p style={{ color: "#5e5e80", fontSize: "0.85rem", lineHeight: 1.65 }}>
              Get the latest updates, articles, and resources directly to your inbox.
            </p>
            <div className="flex flex-col gap-2 mt-1">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e0e0f8",
                  fontSize: "0.9rem",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button
                className="w-full py-2.5 rounded-lg font-semibold transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 16px rgba(124,58,237,0.25)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,0.42)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 16px rgba(124,58,237,0.25)")}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="mt-14 mb-6"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ color: "#3a3a58", fontSize: "0.825rem" }}>
            &copy; {new Date().getFullYear()} Mindora. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <a
                key={item}
                href="#"
                className="transition-all duration-150"
                style={{ color: "#3a3a58", fontSize: "0.825rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#8b7cf5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a58")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
