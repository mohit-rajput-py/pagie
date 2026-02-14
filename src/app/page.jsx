"use client";


/**
 * Main Page Component
 * Manages documents state and orchestrates the editor UI
 */
import { useState, useCallback, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Editor from "@/components/Editor";

import { useFileSystem } from "@/hooks/useFileSystem";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdownUtils";

/**
 * Main Page Component
 * Manages file system state and orchestrates the editor UI
 */
export default function Home() {
  // File System state management via custom hook
  const {
    currentFolderId,
    nodes,
    breadcrumbs,
    loading,
    activeFileId,
    activeFile,
    navigate,
    createFolder,
    createFile,
    renameItem,
    deleteItem,
    saveFileContent,
    setActiveFileId,
    moveItem
  } = useFileSystem();

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

  /*
   * Handle content updates from the editor
   * Updates the file in DB and updates name if H1 changes
   */
  const handleContentChange = useCallback((content, plainText) => {
    if (activeFileId) {
        // 1. Save content
        saveFileContent(activeFileId, content);

        // 2. Extract title from first H1 to update filename (Auto-rename feature)
        // We throttle this to prevent constant DB updates for name
        // actually name update is cheap, but let's be careful.
        let newName = null;
        const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (h1Match && h1Match[1]) {
            newName = h1Match[1].replace(/<[^>]*>/g, "").trim();
        }

        // Only rename if significantly different and present
        if (newName && activeFile && newName !== activeFile.name) {
             // We use the hook's renameItem which refreshes the folder view too.
             // This keeps sidebar in sync.
             renameItem(activeFileId, newName).catch(err => console.error("Auto-rename failed", err));
        }
    }
  }, [activeFileId, activeFile, saveFileContent, renameItem]);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Handle share button click
   */
  const handleShare = useCallback(async () => {
    if (!activeFile || isSharing) return;
    
    setIsSharing(true);
    
    try {
      const contentToShare = activeFile.content || "";
      
      // Send to API
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToShare,
          title: activeFile.name,
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
  }, [activeFile, isSharing, showToastMessage]);

  /**
   * Export current document as Markdown
   */
  const handleExport = useCallback((markdownContent) => {
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeFile?.name || "document"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeFile?.name]);

  /**
   * Handle Move (Basic)
   */
  const handleMove = useCallback(async (id) => {
      // Basic implementation: Move to root if not in root, 
      // or if in root, prompt (but here we just do simple move up for demo)
      if (currentFolderId) {
          await moveItem(id, null); // Move to root
          showToastMessage("Moved to Home");
      } else {
          showToastMessage("Already in Home");
      }
  }, [currentFolderId, moveItem, showToastMessage]);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        nodes={nodes}
        currentFolderId={currentFolderId}
        breadcrumbs={breadcrumbs}
        activeFileId={activeFileId}
        onNavigate={navigate}
        onFileSelect={setActiveFileId}
        onCreateFolder={createFolder}
        onCreateFile={createFile}
        onRename={renameItem}
        onDelete={deleteItem}
        onMove={handleMove}
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
            {activeFile ? (
              <Editor
                key={activeFileId} // Remount editor when switching files
                content={activeFile.content || ""}
                onContentChange={handleContentChange}
                onExport={handleExport}
                readOnly={false}
              />
            ) : (
                <div className="empty-state">
                    <div className="empty-content">
                        <h3>Select a file to edit</h3>
                        <p>Or create a new one from the sidebar.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      <div className={`tooltip ${showToast ? "visible" : ""}`}>
        {toastMessage}
      </div>
    </div>
  );
}
