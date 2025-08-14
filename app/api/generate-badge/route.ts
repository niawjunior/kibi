import { NextRequest, NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { AvatarStyle } from "@/lib/badge";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side environment variable
});

/**
 * Get prompt based on selected avatar style
 * @param style The avatar style to use
 * @returns Prompt text for the selected style
 */
function getAvatarPrompt(style: AvatarStyle): string {
  const basePrompt =
    "Convert the provided portrait into a high-quality Keep the likeness and recognizable features.\nPlace the subject inside a perfect circular crop and must no stroke or border or shadow.\nMake the background fully transparent outside the portrait.\nNo text, no extra elements, only the single character's face and shoulders inside the circle.";

  switch (style) {
    case "photo-shoot":
      return `3D anime-style character.\n${basePrompt}`;
    case "anime":
      return `Create an image in a detailed anime aesthetic: expressive eyes, smooth cel-shaded coloring, and clean linework. Emphasize emotion and character presence, with a sense of motion or atmosphere typical of anime scenes. \n${basePrompt}`;
    case "80s-Glam":
      return `Create a selfie styled like a cheesy 1980s mall glamour shot, foggy soft lighting, teal and magenta lasers in the background, feathered hair, shoulder pads, portrait studio vibes, ironic 'glam 4 life' caption. \n${basePrompt}`;
    default:
      return `Create a selfie styled like a cheesy 1980s mall glamour shot, foggy soft lighting, teal and magenta lasers in the background, feathered hair, shoulder pads, portrait studio vibes, ironic 'glam 4 life' caption. \n${basePrompt}`;
  }
}

/**
 * Convert a base64 string to a Blob
 * @param base64 Base64 string to convert
 * @param mimeType MIME type of the blob
 * @returns Blob created from the base64 string
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);

    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { photoUrl, visitorName, style = "photo-shoot" } = body;

    if (!photoUrl) {
      return NextResponse.json(
        { error: "Photo URL is required" },
        { status: 400 }
      );
    }

    console.log("Generating badge preview for:", visitorName);
    console.log("Using style:", style);

    // Convert image to File object for the OpenAI SDK
    let visitorImageBlob;
    if (photoUrl.startsWith("data:image")) {
      // It's a base64 string
      visitorImageBlob = base64ToBlob(photoUrl, "image/png");
    } else {
      // It's a URL - fetch it first
      const response = await fetch(photoUrl);
      visitorImageBlob = await response.blob();
    }

    // Convert blob to File object for the OpenAI SDK
    const visitorImageFile = await toFile(visitorImageBlob, "visitor.png", {
      type: "image/png",
    });

    // Get the prompt based on selected style
    const prompt = getAvatarPrompt(style as AvatarStyle);

    // Create the badge using OpenAI's image edit API
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: visitorImageFile,
      quality: "low",
      background: "transparent",
      prompt,
      size: "1024x1024", // Using a supported size from the OpenAI API
      n: 1,
    });

    // Return the base64 image data
    if (
      response.data &&
      response.data.length > 0 &&
      response.data[0].b64_json
    ) {
      return NextResponse.json({
        success: true,
        badge: response.data[0].b64_json,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to generate badge" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating badge:", error);
    return NextResponse.json(
      { error: "Failed to generate badge" },
      { status: 500 }
    );
  }
}
