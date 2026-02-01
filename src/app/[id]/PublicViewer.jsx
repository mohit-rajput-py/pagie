"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Moon, Sun } from "lucide-react";

// Explicitly register languages (same as Editor)
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import markdownLang from "highlight.js/lib/languages/markdown";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("markdown", markdownLang);

/**
 * PublicViewer Component
 * Read-only viewer for shared documents.
 * Renders the STORED HTML directly from the database.
 * Does NOT sanitize or parse, assumes trusted Editor content.
 * Applies Highlight.js to code blocks for syntax coloring.
 */
export default function PublicViewer({ content, title, createdAt }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef(null);
  
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
  
  // Apply syntax highlighting to code blocks manually
  useEffect(() => {
    if (contentRef.current) {
      // Find all code blocks. Editor output usually has <pre><code class="language-...">
      const codeBlocks = contentRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        // Apply syntax highlighting
        hljs.highlightElement(block);
        
        // Ensure the .github-code-block class is on the parent <pre>
        // Use classList add to not overwrite other classes if any
        if (block.parentElement && block.parentElement.tagName === "PRE") {
            block.parentElement.classList.add("github-code-block");
        }
      });
    }
  }, [content]); // Re-run if content updates
  
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
          position: "fixed",
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
          
          {/* Rendered HTML Directly - Uses .tiptap class for same styling */}
          {/* We rely on the trusted content coming from the editor */}
          <div 
            ref={contentRef}
            className="tiptap tiptap-renderer-wrapper"
            dangerouslySetInnerHTML={{ __html: content }} 
            style={isDark ? {
              // Dark theme overrides via inline styles in case Global CSS misses something specific
              "--text-primary": "#f5f5f5",
              "--text-secondary": "#9ca3af",
              "--bg-code": "#1f1f1f",
              "--accent": "#a78bfa",
              "--border-light": "#2a2a2a",
            } : {}}
          />

        </div>
      </div>

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
