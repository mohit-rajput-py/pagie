"use client";

import { useState, useEffect, useMemo } from "react";
import { Moon, Sun } from "lucide-react";

// Highlight.js for syntax highlighting
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import markdownLang from 'highlight.js/lib/languages/markdown';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('xml', xml); // Handles HTML
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('markdown', markdownLang);

/**
 * Simple Markdown to HTML converter for rendering
 * Handles common markdown syntax
 */
function parseMarkdown(markdown) {
  if (!markdown) return "";
  
  let html = markdown;
  
  // Code blocks - Process BEFORE generic escaping to avoid double escaping content
  // We use a placeholder to avoid other regexes mess up the highlighted HTML
  const codeBlocks = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang && hljs.getLanguage(lang) ? lang : null;
    let highlightedCode;
    
    try {
      if (language) {
        highlightedCode = hljs.highlight(code.trim(), { language }).value;
      } else {
        // Auto-detect or plain text if no language
        highlightedCode = hljs.highlightAuto(code.trim()).value;
      }
    } catch (e) {
      // Fallback
      highlightedCode = code.trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<pre class="github-code-block"><code class="hljs language-${language || 'text'}">${highlightedCode}</code></pre>`
    );
    return placeholder;
  });
  
  // Escape HTML entities in the REST of the text
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Restore code blocks (which are already escaped/highlighted)
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => codeBlocks[parseInt(index)]);
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  
  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>");
  
  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote><p>$1</p></blockquote>");
  
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");
  
  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");
  
  // Paragraphs (wrap remaining text)
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (block.startsWith("<h") || 
          block.startsWith("<ul") || 
          block.startsWith("<ol") ||
          block.startsWith("<blockquote") ||
          block.startsWith("<pre") ||
          block.startsWith("<hr")) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  
  return html;
}

/**
 * PublicViewer Component
 * Read-only markdown viewer with theme toggle
 * Uses same styling as the main editor
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
  
  // Parse markdown to HTML
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);
  
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
          display: "flex",
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
          
          {/* Rendered Markdown - Uses .tiptap class for same styling */}
          <div
            className="tiptap"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={isDark ? {
              // Dark theme overrides
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
          
          /* Code block highlighting is now handled by globals.css via .github-code-block class */
        `}</style>
      )}
    </div>
  );
}
