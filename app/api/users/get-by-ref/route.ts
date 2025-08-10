import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Get the ref from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json(
        { error: "Reference ID is required" },
        { status: 400 }
      );
    }

    // Query Supabase for the user
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("ref", ref)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Error in get-by-ref API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
