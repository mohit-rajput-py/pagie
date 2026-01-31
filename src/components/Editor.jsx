"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useCallback } from "react";
import { Download } from "lucide-react";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Explicitly register languages (as requested)
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('java', java);

/**
 * Convert TipTap HTML content to Markdown
 * This is a simplified converter for common elements
 * 
 * @param {string} html - HTML content from TipTap
 * @returns {string} Markdown representation
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
 * Editor Component
 * TipTap-based WYSIWYG Markdown editor with inline transformations
 * 
 * @param {Object} props
 * @param {string} props.content - Initial HTML content
 * @param {Function} props.onContentChange - Callback when content changes
 * @param {Function} props.onExport - Callback to export as Markdown
 */
export default function Editor({ content, onContentChange, onExport }) {
  // Initialize TipTap editor with extensions
  const editor = useEditor({
    extensions: [
      // StarterKit includes common extensions with Markdown-like input rules
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Disable default code block, we use CodeBlockLowlight instead
        codeBlock: false,
        // Enable bullet and ordered lists with input rules
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        // Blockquote with input rule (> )
        blockquote: {},
        // Code marks for inline code
        code: {},
      }),

      // Syntax-highlighted code blocks
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
        HTMLAttributes: {
          class: "github-code-block",
        },
      }),

      // Placeholder text when editor is empty
      Placeholder.configure({
        placeholder: "Start writing...",
        emptyEditorClass: "is-editor-empty",
      }),

      // Smart typography (quotes, dashes, etc.)
      Typography,
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap",
        spellcheck: "true",
      },
    },
    // Handle content updates
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onContentChange(html, text);
    },
    // Prevent SSR issues
    immediatelyRender: false,
  });

  // Update content when prop changes (document switch)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  /**
   * Handle export button click
   */
  const handleExport = useCallback(() => {
    if (editor) {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onExport(markdown);
    }
  }, [editor, onExport]);

  return (
    <div className="editor-component">
      {/* Editor toolbar with export */}
      {/* <div className="editor-toolbar" style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "var(--space-md)",
        paddingBottom: "var(--space-sm)",
        borderBottom: "1px solid var(--border-light)",
      }}>
        
      </div> */}

      {/* TipTap editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
