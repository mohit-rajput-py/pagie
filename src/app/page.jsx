"use client";

import { useState, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Editor from "@/components/Editor";

/**
 * Default documents to start with
 */
const defaultDocuments = [
  {
    id: "1",
    title: "Welcome to Pagie",
    content: `<h1>Welcome to Pagie</h1>
<p>A beautiful, distraction-free Markdown editor inspired by Notion and Obsidian.</p>
<h2>Getting Started</h2>
<p>Just start typing! Use Markdown shortcuts for quick formatting:</p>
<ul>
<li>Type <code>#</code> followed by space for headings</li>
<li>Type <code>-</code> or <code>*</code> followed by space for bullet lists</li>
<li>Type <code>1.</code> followed by space for numbered lists</li>
<li>Type <code>&gt;</code> followed by space for blockquotes</li>
<li>Wrap text with backticks for <code>inline code</code></li>
</ul>
<h2>Keyboard Shortcuts</h2>
<p>Speed up your writing with these shortcuts:</p>
<ul>
<li><strong>Ctrl+B</strong> — Bold</li>
<li><strong>Ctrl+I</strong> — Italic</li>
<li><strong>Ctrl+E</strong> — Inline code</li>
<li><strong>Ctrl+Shift+8</strong> — Bullet list</li>
<li><strong>Ctrl+Shift+7</strong> — Numbered list</li>
</ul>
<blockquote><p>Tip: Your documents are saved in your browser. Try creating a new document from the sidebar!</p></blockquote>`,
  },
  {
    id: "2",
    title: "Code Examples",
    content: `<h1>Code Blocks</h1>
<p>Pagie supports syntax-highlighted code blocks. Try typing three backticks followed by a language name:</p>
<pre><code class="language-javascript">// A simple greeting function
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));</code></pre>
<p>Code blocks support multiple languages including JavaScript, Python, TypeScript, and more.</p>
<pre><code class="language-python"># Python example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print([fibonacci(i) for i in range(10)])</code></pre>`,
  },
  {
    id: "3",
    title: "Meeting Notes",
    content: `<h1>Meeting Notes</h1>
<p>Use this document as a template for your meeting notes.</p>
<h2>Attendees</h2>
<ul>
<li>Person 1</li>
<li>Person 2</li>
<li>Person 3</li>
</ul>
<h2>Agenda</h2>
<ol>
<li>Review last week's action items</li>
<li>Discuss current project status</li>
<li>Plan next sprint</li>
</ol>
<h2>Notes</h2>
<p>Start taking notes here...</p>
<h2>Action Items</h2>
<ul>
<li>[ ] First action item</li>
<li>[ ] Second action item</li>
<li>[ ] Third action item</li>
</ul>`,
  },
];

/**
 * Convert HTML content to Markdown
 * Used for sharing documents as Markdown
 */
function htmlToMarkdown(html) {
  if (!html) return "";

  let markdown = html;

  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");

  // Convert bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~");

  // Convert inline code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Convert code blocks
  markdown = markdown.replace(
    /<pre[^>]*><code[^>]*class="language-(\w+)"[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    "```$1\n$2\n```\n\n"
  );
  markdown = markdown.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    "```\n$1\n```\n\n"
  );

  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    const lines = content.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n").split("\n");
    return lines.map((line) => `> ${line}`).join("\n") + "\n\n";
  });

  // Convert unordered lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/gi, "- $1\n")
                  .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n") + "\n";
  });

  // Convert ordered lists
  let olCounter = 0;
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    olCounter = 0;
    return content.replace(/<li[^>]*><p[^>]*>(.*?)<\/p><\/li>/gi, () => {
      olCounter++;
      return `${olCounter}. $1\n`;
    }).replace(/<li[^>]*>(.*?)<\/li>/gi, (m, c) => {
      olCounter++;
      return `${olCounter}. ${c}\n`;
    }) + "\n";
  });

  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  // Convert horizontal rules
  markdown = markdown.replace(/<hr[^>]*>/gi, "---\n\n");

  // Clean up HTML entities
  markdown = markdown.replace(/&lt;/g, "<");
  markdown = markdown.replace(/&gt;/g, ">");
  markdown = markdown.replace(/&amp;/g, "&");
  markdown = markdown.replace(/&nbsp;/g, " ");

  // Remove any remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, "");

  // Clean up excessive newlines
  markdown = markdown.replace(/\n{3,}/g, "\n\n");

  return markdown.trim();
}

/**
 * Parse Markdown to HTML for Import
 * Converts incoming markdown structure to HTML that TipTap can ingest
 */
function parseMarkdownForImport(markdown) {
  if (!markdown) return "";
  
  let html = markdown.replace(/\r\n/g, "\n");
  
  // Code Blocks (```lang ... ```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'text';
    const escapedCode = code
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;");
    return `<pre><code class="language-${language}">${escapedCode.trim()}</code></pre>`;
  });
  
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
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr>");
  
  // Paragraphs
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (block.match(/^<(h\d|pre|ul|ol|blockquote|hr)/)) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
    
  return html;
}

/**
 * Main Page Component
 * Manages documents state and orchestrates the editor UI
 */
export default function Home() {
  // Document state management
  const [documents, setDocuments] = useState(defaultDocuments);
  const [activeDocId, setActiveDocId] = useState(defaultDocuments[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Ref for file input
  const fileInputRef = useRef(null);

  // Get the currently active document
  const activeDocument = documents.find((doc) => doc.id === activeDocId);

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
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === activeDocId) {
          // Extract title from first H1 or use first line of text
          let newTitle = doc.title;
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
          
          return {
            ...doc,
            content,
            title: newTitle || "Untitled",
          };
        }
        return doc;
      })
    );
  }, [activeDocId]);

  /**
   * Create a new document
   */
  const handleNewDocument = useCallback(() => {
    const newDoc = {
      id: Date.now().toString(),
      title: "Untitled",
      content: "<p></p>",
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  }, []);

  /**
   * Rename a document
   */
  const handleRenameDocument = useCallback((docId, newTitle) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, title: newTitle } : doc))
    );
  }, []);

  /**
   * Delete a document
   */
  const handleDeleteDocument = useCallback((docId) => {
    setDocuments((prev) => {
      const newDocs = prev.filter((doc) => doc.id !== docId);
      // If we deleted the active doc, switch to the first available one
      if (activeDocId === docId && newDocs.length > 0) {
        setActiveDocId(newDocs[0].id);
      } else if (newDocs.length === 0) {
        // If no docs left, create a new untitled one
        const newDoc = {
          id: Date.now().toString(),
          title: "Untitled",
          content: "<p></p>",
        };
        setActiveDocId(newDoc.id);
        return [newDoc];
      }
      return newDocs;
    });
  }, [activeDocId]);

  /**
   * Duplicate a document
   */
  const handleDuplicateDocument = useCallback((docId) => {
    setDocuments((prev) => {
      const docToClone = prev.find((doc) => doc.id === docId);
      if (!docToClone) return prev;

      const newDoc = {
        ...docToClone,
        id: Date.now().toString(), // Simple ID generation
        title: `${docToClone.title} (Copy)`,
      };
      
      // Insert after original
      const index = prev.findIndex(d => d.id === docId);
      const newDocs = [...prev];
      newDocs.splice(index + 1, 0, newDoc);
      
      return newDocs;
    });
  }, []);

  /**
   * Switch to a different document
   */
  const handleDocumentSelect = useCallback((docId) => {
    setActiveDocId(docId);
  }, []);

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
      // Convert HTML to Markdown for storage
      const markdown = htmlToMarkdown(activeDocument.content);
      
      // Send to API
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: markdown,
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
          content: parseMarkdownForImport(content),
        };
        setDocuments((prev) => [newDoc, ...prev]);
        setActiveDocId(newDoc.id);
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
