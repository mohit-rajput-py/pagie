"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";

/**
 * Custom 404 Page
 * Shown when a shared document is not found or not public
 */
export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <FileQuestion size={64} strokeWidth={1.5} />
        <h1>Document Not Found</h1>
        <p>This document doesn't exist or has been removed.</p>
        <Link href="/" className="back-link">
          ← Back to Editor
        </Link>
      </div>

      <style jsx>{`
        .not-found {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #FAF9F6;
          color: #474646;
          padding: 24px;
        }

        .not-found-content {
          text-align: center;
          max-width: 400px;
        }

        .not-found-content :global(svg) {
          color: #9a9998;
          margin-bottom: 24px;
        }

        h1 {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        p {
          font-family: 'Outfit', system-ui, sans-serif;
          color: #6b6a69;
          margin-bottom: 32px;
        }

        .back-link {
          display: inline-block;
          font-family: 'Outfit', system-ui, sans-serif;
          color: #8b7355;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #7a6449;
        }
      `}</style>
    </div>
  );
}
