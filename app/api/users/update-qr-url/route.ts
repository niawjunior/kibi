import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const { ref, qrUrl } = await request.json();

    if (!ref || !qrUrl) {
      return NextResponse.json(
        { error: "Reference ID and QR URL are required" },
        { status: 400 }
      );
    }

    // Update the user record with the QR URL
    const { data, error } = await supabase
      .from("users")
      .update({
        qr_url: qrUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("ref", ref)
      .select()
      .single();

    if (error) {
      console.error("Error updating QR URL:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update QR URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error: any) {
    console.error("Error in update QR URL API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
