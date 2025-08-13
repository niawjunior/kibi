import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const visitorData = await request.json();

    // Validate required fields
    const requiredFields = [
      "id",
      "ref",
      "name",
      "last_name",
      "company",
      "position",
      "email",
      "phone",
      "event_id",
    ];

    for (const field of requiredFields) {
      if (!visitorData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Add timestamps
    const dataWithTimestamps = {
      ...visitorData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      registered: visitorData.registered || false,
      photo_url: visitorData.photo_url || null,
      qr_url: visitorData.qr_url || null,
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from("users")
      .insert([dataWithTimestamps])
      .select()
      .single();

    if (error) {
      console.error("Error creating visitor:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create visitor" },
        { status: error.code === "23505" ? 409 : 500 }
      );
    }

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (error: any) {
    console.error("Error in create visitor API route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
