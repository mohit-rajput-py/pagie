"use client";

import { useState, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Editor from "@/components/Editor";

import { useDocuments } from "@/hooks/useDocuments";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdownUtils";

/**
 * Main Page Component
 * Manages documents state and orchestrates the editor UI
 */
export default function Home() {
  // Document state management via custom hook
  const {
    documents,
    activeDocId,
    activeDocument,
    loading,
    setActiveDocId,
    createDocument,
    updateCurrentDocument,
    renameDocument,
    duplicateDocument,
    removeDocument,
    saveImmediate
  } = useDocuments();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Ref for file input
  const fileInputRef = useRef(null);

  /**
   * Show a toast notification
   */
  const showToastMessage = useCallback((message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  /**
   * Handle content updates from the editor
   * Updates the document in state and extracts title from first heading
   */
  const handleContentChange = useCallback((content, plainText) => {
    // Extract title from first H1 or use first line of text
    let newTitle = activeDocument?.title;
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      // Strip HTML tags from the matched content
      newTitle = h1Match[1].replace(/<[^>]*>/g, "").trim();
    } else if (plainText) {
      // Use first line of plain text
      const firstLine = plainText.split("\n")[0].trim();
      if (firstLine) {
        newTitle = firstLine.substring(0, 50);
      }
    }
    
    updateCurrentDocument(content, newTitle || "Untitled");
  }, [activeDocument?.title, updateCurrentDocument]);

  /**
   * Create a new document
   */
  const handleNewDocument = useCallback(() => {
    createDocument();
  }, [createDocument]);

  /**
   * Rename a document
   */
  const handleRenameDocument = useCallback((docId, newTitle) => {
    renameDocument(docId, newTitle);
  }, [renameDocument]);

  /**
   * Delete a document
   */
  const handleDeleteDocument = useCallback((docId) => {
    removeDocument(docId);
  }, [removeDocument]);

  /**
   * Duplicate a document
   */
  const handleDuplicateDocument = useCallback((docId) => {
    duplicateDocument(docId);
  }, [duplicateDocument]);

  /**
   * Switch to a different document
   */
  const handleDocumentSelect = useCallback((docId) => {
    setActiveDocId(docId);
  }, [setActiveDocId]);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Handle share button click
   * Saves document to MongoDB and copies public URL to clipboard
   */
  const handleShare = useCallback(async () => {
    if (!activeDocument || isSharing) return;
    
    setIsSharing(true);
    
    try {
      // Send raw HTML content directly to API (No Markdown conversion)
      const contentToShare = activeDocument.content;
      
      // Send to API
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToShare,
          title: activeDocument.title,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Copy URL to clipboard
        await navigator.clipboard.writeText(data.url);
        showToastMessage(`Link copied to clipboard!`);
      } else {
        showToastMessage("Failed to share document");
      }
    } catch (error) {
      console.error("Share error:", error);
      showToastMessage("Failed to share document");
    } finally {
      setIsSharing(false);
    }
  }, [activeDocument, isSharing, showToastMessage]);

  /**
   * Export current document as Markdown
   */
  const handleExport = useCallback((markdownContent) => {
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDocument?.title || "document"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeDocument?.title]);

  /**
   * Trigger file import dialog
   */
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle imported Markdown file
   */
  const handleFileImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        // Create a new document with imported content
        const fileName = file.name.replace(/\.md$/i, "");
        
        const newDoc = {
          id: Date.now().toString(),
          title: fileName,
          content: markdownToHtml(content),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Optimistic update
        setDocuments((prev) => [newDoc, ...prev]);
        setActiveDocId(newDoc.id);
        
        // Persist to IndexedDB
        saveImmediate(newDoc);
      }
    };
    reader.readAsText(file);
    // Reset the input
    event.target.value = "";
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        documents={documents}
        activeDocId={activeDocId}
        onDocumentSelect={handleDocumentSelect}
        onNewDocument={handleNewDocument}
        onImport={handleImportClick}
        onRename={handleRenameDocument}
        onDelete={handleDeleteDocument}
        onDuplicate={handleDuplicateDocument}
      />

      {/* Main Content */}
      <div className={`main-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Header
          onToggleSidebar={toggleSidebar}
          onShare={handleShare}
          sidebarOpen={sidebarOpen}
          isSharing={isSharing}
        />

        <div className="editor-container">
          <div className="editor-wrapper">
            {activeDocument && (
              <Editor
                key={activeDocId}
                content={activeDocument.content}
                onContentChange={handleContentChange}
                onExport={handleExport}
              />
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleFileImport}
        className="hidden-input"
      />

      {/* Toast notification */}
      <div className={`tooltip ${showToast ? "visible" : ""}`}>
        {toastMessage}
      </div>
    </div>
  );
}
