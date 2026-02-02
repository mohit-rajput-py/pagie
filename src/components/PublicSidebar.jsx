"use client";

import { Moon, Sun, X } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * PublicSidebar Component
 * A drawer that slides in from the left.
 * Contains the theme toggle button.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the sidebar is open
 * @param {Function} props.onClose - Callback to close sidebar
 * @param {string} props.theme - Current theme ("light" or "dark")
 * @param {Function} props.toggleTheme - Callback to toggle theme
 */
export default function PublicSidebar({ isOpen, onClose, theme, toggleTheme }) {
  const isDark = theme === "dark";
  const sidebarRef = useRef(null);

  // Close when clicking outside on mobile (overlay)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        // Don't close if clicking hamburger menu (which is outside sidebar)
        !event.target.closest('.icon-btn')
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay for mobile/desktop when open */}
      <div 
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside 
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{ 
          zIndex: 100,
          backgroundColor: isDark ? "#1f1f1f" : "#f3f2ef", // Darker bg for sidebar
          borderRight: `1px solid ${isDark ? "#2a2a2a" : "#e8e7e4"}`,
          transition: "transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease"
        }}
      >
        {/* Sidebar Header */}
        <div 
          className="sidebar-header"
          style={{
            borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e8e7e4"}`,
          }}
        >
          <h1 
            className="sidebar-title"
            style={{ color: isDark ? "#e5e5e5" : "inherit" }}
            onClick={()=> window.location.href = "/"}
          >
            Pagie
          </h1>
          <button 
            className="icon-btn" 
            onClick={onClose}
            aria-label="Close sidebar"
            style={{ color: isDark ? "#e5e5e5" : "inherit" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3 className="section-title" style={{ 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              color: isDark ? '#a0a0a0' : 'var(--text-muted)', 
              fontWeight: 600,
              marginBottom: '8px',
              paddingLeft: '12px'
            }}>
              Settings
            </h3>
            
            {/* Theme Toggle Item */}
            <button 
              className="doc-item" 
              onClick={toggleTheme}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: isDark ? "#e5e5e5" : "inherit",
                
              }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
          <p
                    style={{
                      fontSize: '0.875rem',        // text-sm
                      color: isDark ? '#e5e5e5' : '#000',            // text-muted
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      paddingBottom: '2rem',
                      position : "absolute",
                      bottom : 0,
                      left : 0,
                      right : 0

                    }}
                  >
                    <a href="https://github.com/mohit-rajput-py/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', color: isDark ? '#e5e5e5' : '#000', textDecoration: 'none' }}
                    >
                      GitHub
                    </a>
                     . 
                    <a href="https://vercel.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', color: isDark ? '#e5e5e5' : '#000', textDecoration: 'none' }}
                    >
                      Vercel
                    </a>
                    .
                    <a
                      href="https://nextjs.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', color: isDark ? '#e5e5e5' : '#000', textDecoration: 'none' }}
                    >
                      Next.js

                    </a>
                  </p>
        </div>
      </aside>

      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
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
