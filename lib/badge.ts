/**
 * Badge generation utilities using OpenAI Image API
 */
import OpenAI, { toFile } from "openai";

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

/**
 * Convert a URL to a Blob
 * @param url URL to convert to blob
 * @returns Promise resolving to a Blob
 */
async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  return await response.blob();
}

/**
 * Generate a badge preview using OpenAI Image API
 * @param backgroundImageUrl URL of the badge background image
 * @param visitorPhotoUrl URL or base64 of the visitor's photo
 * @param visitorName Name of the visitor for the badge
 * @returns Base64 encoded image data of the generated badge
 */
export async function generateBadgePreview(
  backgroundImageUrl: string,
  visitorPhotoUrl: string,
  visitorName: string
): Promise<string | null> {
  try {
    console.log("Generating badge preview for:", visitorName);
    console.log("Using background:", backgroundImageUrl);
    console.log("Using photo:", visitorPhotoUrl.substring(0, 50) + "...");

    // Initialize the OpenAI client
    const client = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    // Convert image URLs/base64 to File objects for the OpenAI SDK
    let visitorImageBlob;
    if (visitorPhotoUrl.startsWith("data:image")) {
      // It's a base64 string
      visitorImageBlob = base64ToBlob(visitorPhotoUrl, "image/png");
    } else {
      // It's a URL
      visitorImageBlob = await urlToBlob(visitorPhotoUrl);
    }

    // Convert blobs to File objects for the OpenAI SDK
    const visitorImageFile = await toFile(visitorImageBlob, "visitor.png", {
      type: "image/png",
    });

    // Create the badge using OpenAI's image edit API
    const response = await client.images.edit({
      model: "gpt-image-1",
      image: visitorImageFile,
      quality: "low",
      background: "transparent",
      prompt: `Convert the provided portrait into a high-quality 3D anime-style character.
Keep the likeness and recognizable features.
Place the subject inside a perfect circular crop and must no stroke or border.
Make the background fully transparent outside the portrait.
Use smooth shading, soft lighting, and expressive eyes.
No text, no extra elements, only the character's face and shoulders inside the circle.`,
      size: "1024x1024", // Using a supported size from the OpenAI API
      n: 1,
    });

    // Return the base64 image data
    if (
      response.data &&
      response.data.length > 0 &&
      response.data[0].b64_json
    ) {
      return response.data[0].b64_json;
    }

    console.error("No image data returned from OpenAI API");
    return null;
  } catch (error) {
    console.error("Error generating badge preview:", error);
    return null;
  }
}
