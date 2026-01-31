"use client";

import { Plus, FileText, Upload } from "lucide-react";

/**
 * Sidebar Component
 * Displays document list with navigation and actions
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether sidebar is visible
 * @param {Array} props.documents - List of documents
 * @param {string} props.activeDocId - Currently active document ID
 * @param {Function} props.onDocumentSelect - Callback when document is selected
 * @param {Function} props.onNewDocument - Callback to create new document
 * @param {Function} props.onImport - Callback to trigger import dialog
 */
export default function Sidebar({
  isOpen,
  documents,
  activeDocId,
  onDocumentSelect,
  onNewDocument,
  onImport,
}) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">Pagie</h1>
      </div>

      {/* Document List */}
      <div className="sidebar-content">
        <ul className="doc-list">
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                className={`doc-item ${doc.id === activeDocId ? "active" : ""}`}
                onClick={() => onDocumentSelect(doc.id)}
                title={doc.title}
              >
                <FileText
                  size={14}
                  style={{ marginRight: "8px", flexShrink: 0, opacity: 0.6 }}
                />
                {doc.title || "Untitled"}
              </button>
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
    </aside>
  );
}
