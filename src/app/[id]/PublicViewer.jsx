"use client";

import { useState, useEffect, useMemo } from "react";
import { Moon, Sun } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { marked } from "marked";

// Explicitly register languages (same as Editor)
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';

const lowlight = createLowlight(common);

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);

/**
 * PublicViewer Component
 * Read-only markdown viewer with theme toggle
 * Uses TipTap in read-only mode for consistent rendering with Editor
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

  // Parse markdown to HTML using marked
  const htmlContent = useMemo(() => {
    return marked.parse(content || "");
  }, [content]);

  // Initialize TipTap editor in read-only mode
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Disable default code block, we use CodeBlockLowlight instead
        codeBlock: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      // Syntax-highlighted code blocks
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
        HTMLAttributes: {
          class: "github-code-block",
        },
      }),
      Typography,
    ],
    content: htmlContent, 
    editorProps: {
      attributes: {
        class: "tiptap",
        spellcheck: "false",
      },
    },
    // Prevent SSR issues
    immediatelyRender: false,
  });

  // Update editor content if it changes externally
  // although mostly PublicViewer receives content once
  useEffect(() => {
    if (editor && htmlContent && htmlContent !== editor.getHTML()) {
       // Only set content if it's materially different to avoid cursor jumps (though this is read only)
       // TipTap's setContent can be heavy, but necessary if content prop updates
       // Check if editor is empty or content changed significantly
       if (editor.isEmpty || editor.getHTML() !== htmlContent) {
           editor.commands.setContent(htmlContent);
       }
    }
  }, [htmlContent, editor]);
  
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
          
          {/* Rendered Markdown - TipTap ReadOnly */}
          <div className="tiptap-renderer-wrapper">
             <EditorContent editor={editor} />
          </div>

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
