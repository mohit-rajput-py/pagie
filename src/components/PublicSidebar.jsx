"use client";

import { Moon, Sun, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function PublicSidebar({ isOpen, onClose, theme, toggleTheme }) {
  const isDark = theme === "dark";
  const sidebarRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest(".icon-btn")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{
          zIndex: 100,
          backgroundColor: isDark ? "#1f1f1f" : "#f3f2ef",
          borderRight: `1px solid ${isDark ? "#2a2a2a" : "#e8e7e4"}`,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          transition:
            "transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Header */}
        <div
          className="sidebar-header"
          style={{
            borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e8e7e4"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <h1
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              color: isDark ? "#e5e5e5" : "inherit",
            }}
            onClick={() => (window.location.href = "/")}
          >
            Pagie
          </h1>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isDark ? "#e5e5e5" : "inherit",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="sidebar-content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 0",
          }}
        >
          <div className="sidebar-section">
            <h3
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "8px",
                paddingLeft: "16px",
                color: isDark ? "#a0a0a0" : "#6b7280",
              }}
            >
              Settings
            </h3>

            <button
              onClick={toggleTheme}
              style={{
                width: "100%",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: isDark ? "#e5e5e5" : "inherit",
              }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px",
            textAlign: "center",
            fontSize: "0.875rem",
            borderTop: `1px solid ${isDark ? "#2a2a2a" : "#e8e7e4"}`,
            color: isDark ? "#e5e5e5" : "#000",
          }}
        >
          <a
            href="https://github.com/mohit-rajput-py/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            GitHub
          </a>{" "}
          ·{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Vercel
          </a>{" "}
          ·{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Next.js
          </a>
        </div>
      </aside>

      {/* Overlay CSS */}
      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 90;
        }

        .sidebar-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </>
  );
}
