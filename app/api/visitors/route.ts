import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, last_name, company, position, email, phone, ref } = body;

    // Create visitor with server-side auth
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          id: uuidv4(),
          ref: ref,
          name,
          last_name,
          company,
          position,
          email,
          phone,
          event_id: "00000000-0000-0000-0000-000000000001", // Default event ID
          registered: false,
          photo_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating visitor:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in visitor creation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
