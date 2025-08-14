import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const { ref, photoUrl, badgeUrl, cardUrl, printUrl } = await request.json();

    if (!ref || !photoUrl) {
      return NextResponse.json(
        { error: "Reference ID and photo URL are required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      registered: boolean;
      photo_url: string;
      badge_url?: string;
      card_url?: string;
      print_url?: string;
      updated_at: string;
    } = {
      registered: true,
      photo_url: photoUrl,
      updated_at: new Date().toISOString(),
    };

    // Add badge_url if provided
    if (badgeUrl) {
      updateData.badge_url = badgeUrl;
    }
    
    // Add card_url if provided
    if (cardUrl) {
      updateData.card_url = cardUrl;
    }
    
    // Add print_url if provided
    if (printUrl) {
      updateData.print_url = printUrl;
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("ref", ref)
      .select()
      .single();

    if (error) {
      console.error("Error updating user registration:", error);
      return NextResponse.json(
        { error: "Failed to update user registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error: any) {
    console.error("Error in update registration API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
