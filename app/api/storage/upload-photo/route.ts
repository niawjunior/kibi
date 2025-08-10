import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { base64Image, userRef } = await request.json();

    if (!base64Image || !userRef) {
      return NextResponse.json(
        { error: "Base64 image and user reference are required" },
        { status: 400 }
      );
    }

    // Remove the data URL prefix to get just the base64 data
    const base64Data = base64Image.split(",")[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: "Invalid base64 image format" },
        { status: 400 }
      );
    }

    // Convert base64 to binary data
    const binaryData = Buffer.from(base64Data, "base64");

    // Generate a unique filename with user reference and timestamp
    const fileExt = "jpg";
    const fileName = `${userRef}_${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from("photos")
      .upload(filePath, binaryData, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading photo to storage:", error);
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error("Error in upload photo API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
