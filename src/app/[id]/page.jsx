import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import SharedDocument from "@/models/SharedDocument";
import PublicViewer from "./PublicViewer";
import { cache } from "react";

// ISR: Cache this page for 1 year (31536000 seconds).
// This serves the static HTML from the cache on subsequent requests.
// On-demand revalidation can still be used to update it manually if needed.
export const revalidate = false;
export const dynamic = "force-static";
// Deduplicate requests using React cache
const getSharedDocument = cache(async (id) => {
  await dbConnect();
  
  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return null;
  }

  const doc = await SharedDocument.findById(id);
  
  if (!doc || !doc.isPublic) {
    return null;
  }
  
  return doc;
});

/**
 * Generate metadata for the shared document page
 */
export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const doc = await getSharedDocument(id);
    
    if (!doc) {
      return { title: "Document Not Found — Pagie" };
    }
    
    return {
      title: `${doc.title} — Pagie`,
      description: doc.content.substring(0, 160),
    };
  } catch {
    return { title: "Document Not Found — Pagie" };
  }
}

/**
 * Public Document Page
 * Renders a read-only view of a shared markdown document
 */
export default async function PublicPage({ params }) {
  try {
    const { id } = await params;
    const doc = await getSharedDocument(id);
    
    if (!doc) {
      notFound();
    }
    
    // Pass document data to client component
    return (
      <PublicViewer
        content={doc.content}
        title={doc.title}
        createdAt={doc.createdAt.toISOString()}
      />
    );
  } catch (error) {
    console.error("Public page error:", error);
    notFound();
  }
}
