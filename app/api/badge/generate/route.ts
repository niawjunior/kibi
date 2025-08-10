import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { photoUrl, name, company, style } = await request.json();

    if (!photoUrl) {
      return NextResponse.json(
        { error: "Photo URL is required" },
        { status: 400 }
      );
    }

    // Determine the prompt based on the selected style
    let prompt = "Create a professional headshot avatar";
    
    if (style === "cartoon") {
      prompt = "Create a cartoon style avatar with vibrant colors";
    } else if (style === "sketch") {
      prompt = "Create a pencil sketch style portrait";
    } else if (style === "professional") {
      prompt = "Create a professional headshot avatar with a clean background";
    }

    // Add name and company to the prompt if provided
    if (name) {
      prompt += ` for ${name}`;
    }
    
    if (company) {
      prompt += ` from ${company}`;
    }

    // Call OpenAI API to generate badge image
    const response = await openai.images.edit({
      image: await fetch(photoUrl).then((res) => res.blob()),
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    // Check if response data exists
    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate badge image: No data returned" },
        { status: 500 }
      );
    }
    
    // Get the base64 image data
    const imageData = response.data[0].b64_json;
    
    if (!imageData) {
      return NextResponse.json(
        { error: "Failed to generate badge image: No image data" },
        { status: 500 }
      );
    }

    // Return the base64 image data
    return NextResponse.json({
      image: `data:image/png;base64,${imageData}`,
    });
  } catch (error: any) {
    console.error("Error generating badge:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate badge" },
      { status: 500 }
    );
  }
}
