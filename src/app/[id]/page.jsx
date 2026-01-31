import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import SharedDocument from "@/models/SharedDocument";
import PublicViewer from "./PublicViewer";

/**
 * Generate metadata for the shared document page
 */
export async function generateMetadata({ params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const doc = await SharedDocument.findById(id);
    
    if (!doc || !doc.isPublic) {
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
    await dbConnect();
    const { id } = await params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      notFound();
    }
    
    const doc = await SharedDocument.findById(id);
    
    // Check if document exists and is public
    if (!doc || !doc.isPublic) {
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
