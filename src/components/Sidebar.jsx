"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, FileText, Upload, MoreVertical, Trash2, Edit2, Copy } from "lucide-react";

/**
 * Sidebar Component
 * Displays document list with navigation, actions, and context menu
 */
export default function Sidebar({
  isOpen,
  documents,
  activeDocId,
  onDocumentSelect,
  onNewDocument,
  onImport,
  onRename,
  onDelete,
  onDuplicate,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Focus input when renaming starts
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleContextMenu = (e, docId) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      docId,
    });
  };

  const startRenaming = (docId, currentTitle) => {
    setRenamingId(docId);
    setRenameValue(currentTitle);
    setContextMenu(null);
  };

  const saveRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveRename();
    } else if (e.key === "Escape") {
      setRenamingId(null);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} onContextMenu={(e) => e.preventDefault()}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">Pagie</h1>
      </div>

      {/* Document List */}
      <div className="sidebar-content">
        <ul className="doc-list">
          {documents.map((doc) => (
            <li key={doc.id} onContextMenu={(e) => handleContextMenu(e, doc.id)}>
              {renamingId === doc.id ? (
                <div className="rename-container" style={{ padding: "4px 8px" }}>
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={handleKeyDown}
                    className="sidebar-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <div className="doc-item-wrapper" style={{ position: "relative" }}>
                  <button
                    className={`doc-item ${doc.id === activeDocId ? "active" : ""}`}
                    onClick={() => onDocumentSelect(doc.id)}
                    title={doc.title}
                  >
                    <FileText
                      size={14}
                      style={{ marginRight: "8px", flexShrink: 0, opacity: 0.6 }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {doc.title || "Untitled"}
                    </span>
                  </button>
                  
                  {/* Quick Action Menu Button (optional visual cue) */}
                  <button 
                    className="item-menu-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, doc.id);
                    }}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      opacity: 0, // Visible on hover via CSS
                      padding: "4px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                    }}
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* New Document Button */}
        <button className="new-doc-btn" onClick={onNewDocument}>
          <Plus size={16} />
          <span>New Document</span>
        </button>
      </div>

      {/* Sidebar Footer with Import */}
      <div className="sidebar-footer">
        <div className="doc-actions">
          <button className="action-btn" onClick={onImport}>
            <Upload size={14} />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
        >
          <button
            className="context-menu-item"
            onClick={() => startRenaming(contextMenu.docId, documents.find(d => d.id === contextMenu.docId)?.title)}
          >
            <Edit2 size={14} />
            <span>Rename</span>
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
              onDuplicate(contextMenu.docId);
              setContextMenu(null);
            }}
          >
            <Copy size={14} />
            <span>Duplicate</span>
          </button>
          <div className="context-menu-divider" />
          <button
            className="context-menu-item delete"
            onClick={() => {
              onDelete(contextMenu.docId);
              setContextMenu(null);
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </aside>
  );
}
