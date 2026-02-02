import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SharedDocument from "@/models/SharedDocument";

/**
 * POST /api/share
 * Creates a new shared document and returns the public URL
 * 
 * Request body:
 * {
 *   content: string (markdown),
 *   title?: string
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   id: string (ObjectId as URL slug),
 *   url: string (full public URL)
 * }
 */
export async function POST(request) {
    try {
        // Connect to MongoDB
        await dbConnect();

        // Parse request body
        const body = await request.json();
        const { content, title } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, error: "Content is required" },
                { status: 400 }
            );
        }

        // Create URL-safe slug
        const slug = (title || "Untitled")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        // Create new shared document
        const doc = await SharedDocument.create({
            content,
            title: title || "Untitled",
            slug,
            isPublic: true,
        });

        // Get the base URL from the request
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host") || "localhost:3000";
        const baseUrl = `${protocol}://${host}`;

        return NextResponse.json({
            success: true,
            id: doc._id.toString(),
            url: `${baseUrl}/${slug}-${doc._id.toString()}`,
        });
    } catch (error) {
        console.error("Share API error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create shared document" },
            { status: 500 }
        );
    }
}
