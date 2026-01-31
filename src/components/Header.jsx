"use client";

import { Menu, Share2, Loader2 } from "lucide-react";

/**
 * Header Component
 * Contains sidebar toggle (left) and share button (right)
 * 
 * @param {Object} props
 * @param {Function} props.onToggleSidebar - Callback to toggle sidebar
 * @param {Function} props.onShare - Callback for share button click
 * @param {boolean} props.sidebarOpen - Current sidebar state
 * @param {boolean} props.isSharing - Whether share is in progress
 */
export default function Header({ onToggleSidebar, onShare, sidebarOpen, isSharing }) {
  return (
    <header className="header">
      <div className="header-left">
        {/* Sidebar toggle button */}
        <button
          className="icon-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="header-right">
        {/* Share button - saves to MongoDB and copies URL */}
        <button 
          className="share-btn" 
          onClick={onShare}
          disabled={isSharing}
          style={{ opacity: isSharing ? 0.7 : 1 }}
        >
          {isSharing ? (
            <Loader2 size={16} className="spin" />
          ) : (
            <Share2 size={16} />
          )}
          <span>{isSharing ? "Sharing..." : "Share"}</span>
        </button>
      </div>

      <style jsx>{`
        :global(.spin) {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
