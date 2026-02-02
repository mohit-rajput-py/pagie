import { notFound, permanentRedirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import SharedDocument from "@/models/SharedDocument";
import PublicViewer from "./PublicViewer";
import { cache } from "react";

export const revalidate = false;
export const dynamic = "force-static";

// Helper to generate slug URL
// Handles fallback if doc.slug is missing (legacy docs)
function getCanonicalSlug(doc) {
  const baseSlug = doc.slug || (doc.title || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
    
  return `${baseSlug}-${doc._id}`;
}

// Cached data fetching
const getSharedDocument = cache(async (id) => {
  await dbConnect();
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) return null;
  
  const doc = await SharedDocument.findById(id);
  if (!doc || !doc.isPublic) return null;
  return doc;
});

/**
 * Generate metadata with canonical implementation
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  // Extract ID from the end of the slug param (last 24 hex chars)
  const idMatch = slug.match(/([0-9a-fA-F]{24})$/);
  const id = idMatch ? idMatch[1] : null;
  
  const doc = await getSharedDocument(id);
  
  if (!doc) {
    return { title: "Document Not Found — Pagie" };
  }
  
  return {
    title: `${doc.title} — Pagie`,
    description: doc.content.substring(0, 160),
    alternates: {
        canonical: `/${getCanonicalSlug(doc)}`,
    }
  };
}

/**
 * Public Page Component
 * Handles routing, ID extraction, and canonical redirects
 */
export default async function PublicPage({ params }) {
  const { slug } = await params;
  
  // Extract ID: match the last 24 hex characters
  // Examples:
  // "how-to-js-507f1f77bcf86cd799439011" -> "507f1f77bcf86cd799439011"
  // "507f1f77bcf86cd799439011" -> "507f1f77bcf86cd799439011" (Legacy)
  const idMatch = slug.match(/([0-9a-fA-F]{24})$/);
  const id = idMatch ? idMatch[1] : null;

  if (!id) {
    notFound();
  }

  const doc = await getSharedDocument(id);
  
  if (!doc) {
    notFound();
  }

  // SEO: Redirect to canonical URL if mismatch
  // This handles:
  // 1. Legacy IDs (/id -> /slug-id)
  // 2. Changed slugs (/old-slug-id -> /new-slug-id)
  // 3. Typo/Malware protection
  const canonicalSlug = getCanonicalSlug(doc);
  
  if (slug !== canonicalSlug) {
    permanentRedirect(`/${canonicalSlug}`);
  }

  // Render content
  return (
    <PublicViewer
      content={doc.content}
      title={doc.title}
      createdAt={doc.createdAt.toISOString()}
    />
  );
}
