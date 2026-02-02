import mongoose from "mongoose";

/**
 * SharedDocument Schema
 * Stores publicly shared markdown documents
 * 
 * _id (ObjectId) is used directly as the public URL slug
 */
const SharedDocumentSchema = new mongoose.Schema(
    {
        // Markdown content (not HTML)
        content: {
            type: String,
            required: true,
        },
        // Whether the document is publicly accessible
        isPublic: {
            type: Boolean,
            default: true,
        },
        // Optional title for metadata
        title: {
            type: String,
            default: "Untitled",
        },
        // URL-safe slug generated from title
        slug: {
            type: String,
            required: true,
        },
    },
    {
        // Automatically add createdAt and updatedAt
        timestamps: true,
    }
);

// Prevent model recompilation in development
export default mongoose.models.SharedDocument ||
    mongoose.model("SharedDocument", SharedDocumentSchema);
