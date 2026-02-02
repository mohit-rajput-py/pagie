"use client";

import { Menu, Search } from "lucide-react";

/**
 * PublicHeader Component
 * Contains hamburger sidebar toggle (left) and search button (right)
 * 
 * @param {Object} props
 * @param {Function} props.onToggleSidebar - Callback to toggle sidebar
 * @param {Function} props.onSearch - Callback for search button click
 */
export default function PublicHeader({ onToggleSidebar, onSearch, isDark }) {
  return (
    <header 
      className="header" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        width: '100%', 
        zIndex: 50,
        backgroundColor: isDark ? "#1f1f1f" : "#FAF9F6",
        borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e8e7e4"}`,
        transition: "background-color 0.3s ease, border-color 0.3s ease"
      }}
    >
      <div className="header-left">
        <button
          className="icon-btn"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
          title="Open sidebar"
          style={{ color: isDark ? "#e5e5e5" : "inherit" }}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="header-right">
        <button
          className="icon-btn"
          onClick={onSearch}
          aria-label="Search"
          title="Search"
          style={{ color: isDark ? "#e5e5e5" : "inherit" }}
        >
          <Search size={20} />
        </button>
      </div>
    </header>
  );
}
