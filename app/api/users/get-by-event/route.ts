import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get the event ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Query Supabase for users in this event, sorted by updated_at descending
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("event_id", eventId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching users by event:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error("Error in get-by-event API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
