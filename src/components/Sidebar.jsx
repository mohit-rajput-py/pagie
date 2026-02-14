"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Plus, 
  FileText, 
  Folder, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  CornerUpLeft, 
  Move,
  ChevronRight
} from "lucide-react";

/**
 * Sidebar Component
 * Displays file system nodes with navigation, actions, and context menu
 */
export default function Sidebar({
  isOpen,
  nodes, // Array of current folder contents
  currentFolderId,
  breadcrumbs,
  activeFileId,
  onNavigate,
  onFileSelect,
  onCreateFolder,
  onCreateFile,
  onRename,
  onDelete,
  onMove
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

  const handleContextMenu = (e, nodeId, type) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      nodeId,
      type
    });
  };

  const startRenaming = (nodeId, currentName) => {
    setRenamingId(nodeId);
    setRenameValue(currentName);
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

  const handleContainerContextMenu = (e) => {
      e.preventDefault();
      // Only show if clicking empty space, maybe for "New Folder"?
      // For now, let's just ignore or show a generic menu if needed.
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} onContextMenu={handleContainerContextMenu}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">Pagie</h1>
      </div>

      {/* Breadcrumbs / Navigation */}
      <div className="sidebar-nav">
        
        
        <div className="breadcrumbs">
          <span 
            className={`breadcrumb-item ${!currentFolderId ? 'active' : ''}`}
            onClick={() => onNavigate(null)}
          >
            Home
          </span>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id} className="breadcrumb-wrapper">
                <ChevronRight size={12} className="breadcrumb-separator"/>
                <span 
                    className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                    onClick={() => onNavigate(crumb.id)}
                >
                    {crumb.name}
                </span>
            </span>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="sidebar-content">
        <ul className="doc-list">
          {nodes.map((node) => (
            <li key={node.id} onContextMenu={(e) => handleContextMenu(e, node.id, node.type)}>
              {renamingId === node.id ? (
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
                    className={`doc-item ${node.id === activeFileId ? "active" : ""}`}
                    onClick={() => {
                        if (node.type === 'folder') {
                            onNavigate(node.id);
                        } else {
                            onFileSelect(node.id);
                        }
                    }}
                    title={node.name}
                  >
                    {node.type === 'folder' ? (
                        <Folder size={16} style={{ marginRight: "8px", flexShrink: 0, color: "var(--accent-color)" }} fill="currentColor" fillOpacity={0.2} />
                    ) : (
                        <FileText size={14} style={{ marginRight: "8px", flexShrink: 0, opacity: 0.6 }} />
                    )}
                    
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {node.name || "Untitled"}
                    </span>
                  </button>
                  
                  {/* Menu Trigger */}
                  <button 
                    className="item-menu-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, node.id, node.type);
                    }}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      opacity: 0,
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
      </div>
      
      {/* Actions Footer */}
      <div className="sidebar-footer">
          <div className="doc-actions" style={{gap: '8px'}}>
            <button className="action-btn" onClick={() => onCreateFile("Untitled")}>
                <Plus size={14} />
                <span>New File</span>
            </button>
            <button className="action-btn" onClick={() => onCreateFolder("New Folder")}>
                <Folder size={14} />
                <span>New Folder</span>
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
            onClick={() => startRenaming(contextMenu.nodeId, nodes.find(n => n.id === contextMenu.nodeId)?.name)}
          >
            <Edit2 size={14} />
            <span>Rename</span>
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
                // Simple move: Prompt for Parent ID (Root or nothing for now as text is hard)
                // Let's implement a wrapper onMove that works for now.
                // For MVP: Move to Parent (..).
                if (currentFolderId) {
                    // We are in a folder, allow moving to root?
                    // Better: onMove(id) triggers a UI mode or dialog.
                    // Let's just use Rename for now as standard action.
                    onMove(contextMenu.nodeId); // Logic to be handled in parent
                } else {
                    alert("Move functionality to specific folders requires a picker. Currently supporting basic moves.");
                }
                setContextMenu(null);
            }}
          >
            <Move size={14} />
            <span>Move...</span>
          </button>
          <div className="context-menu-divider" />
          <button
            className="context-menu-item delete"
            onClick={() => {
              onDelete(contextMenu.nodeId);
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
