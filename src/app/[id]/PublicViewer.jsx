"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import Editor from "@/components/Editor";
import Image from "next/image";

/**
 * PublicViewer Component
 * Read-only viewer for shared documents.
 * 
 * Updated to use the shared Editor component in read-only mode.
 * This guarantees exact parity with the editor's rendering, syntax highlighting,
 * and typography, as it runs the exact same Tiptap pipeline.
 */
export default function PublicViewer({ content, title, createdAt }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  
  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("pagie-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);
  
  // Toggle theme and persist to localStorage
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("pagie-theme", newTheme);
  };
  
  // Format date
  const formattedDate = useMemo(() => {
    return new Date(createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [createdAt]);
  
  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }
  
  const isDark = theme === "dark";
  
  return (
    <div 
      className={`public-viewer-page ${isDark ? "dark" : ""}`}
      style={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#0f0f0f" : "#FAF9F6",
        color: isDark ? "#e5e5e5" : "#474646",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Theme Toggle Button - Floating Right */}
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        title={`Switch to ${isDark ? "light" : "dark"} theme`}
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "all 0.2s ease",
          backgroundColor: isDark ? "#1f1f1f" : "#f0efeb",
          color: isDark ? "#e5e5e5" : "#474646",
        }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      
      {/* Content Container - Same as editor-container */}
      <div 
        className="editor-container"
        style={{
          flex: 1,
          display: "flex", // Keep flex layout
          justifyContent: "center",
          padding: "32px 24px",
          overflowY: "auto",
        }}
      >
        <div 
          className="editor-wrapper"
          style={{
            width: "100%",
            maxWidth: "720px",
          }}
        >
          {/* Document metadata */}
          <div 
            style={{
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e8e7e4"}`,
            }}
          >
            <time 
              style={{
                fontSize: "0.875rem",
                opacity: 0.6,
                fontFamily: "'Outfit', system-ui, sans-serif",
              }}
            >
              {formattedDate}
            </time>
          </div>
          
          {/* 
            Render the shared Editor component in Read-Only mode.
            This ensures identical rendering to the editing experience.
          */}
          <Editor 
            content={content} 
            readOnly={true} 
            // Callbacks are no-op in read-only
            onContentChange={()=>{}} 
            onExport={()=>{}}
          />

        </div>
      </div>
            { !isDark && <p
                    style={{
                      fontSize: '0.875rem',        // text-sm
                      color: '#000',            // text-muted
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    Built With
                    ❤️
                    Using
                    <a
                      href="https://nextjs.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <Image
                        src="/next.svg"
                        alt="Next.js logo"
                        style={{ marginLeft: '0.25rem' }}
                        width={46}
                        height={28}
                      />
                    </a>
                  </p>}
       {/* Dark theme styles */}
       {isDark && (
        <style jsx global>{`
          .public-viewer-page .tiptap h1,
          .public-viewer-page .tiptap h2,
          .public-viewer-page .tiptap h3 {
            color: #f5f5f5 !important;
          }
          
          .public-viewer-page .tiptap p,
          .public-viewer-page .tiptap li {
            color: #e5e5e5 !important;
          }
        `}</style>
      )}
    </div>
  );
}
