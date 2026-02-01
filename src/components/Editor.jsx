"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
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

import { htmlToMarkdown } from "@/lib/markdownUtils";

/**
 * Editor Component
 * TipTap-based WYSIWYG Markdown editor with inline transformations
 * 
 * @param {Object} props
 * @param {string} props.content - Initial HTML content
 * @param {Function} props.onContentChange - Callback when content changes
 * @param {Function} props.onExport - Callback to export as Markdown
 */
export default function Editor({ content, onContentChange, onExport, readOnly = false }) {
  // Initialize TipTap editor with extensions
  const editor = useEditor({
    editable: !readOnly,
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

      // Tables
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,

      // Placeholder text when editor is empty (only in editable mode)
      Placeholder.configure({
        placeholder: "Start writing...",
        emptyEditorClass: "is-editor-empty",
        showOnlyWhenEditable: true,
      }),

      // Smart typography (quotes, dashes, etc.)
      Typography,
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap",
        spellcheck: !readOnly ? "true" : "false",
      },
    },
    // Handle content updates
    onUpdate: ({ editor }) => {
      // Only trigger change if editable
      if (!readOnly && onContentChange) {
        const html = editor.getHTML();
        const text = editor.getText();
        onContentChange(html, text);
      }
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
