/**
 * Badge generation utilities
 */

// Define avatar style options
export type AvatarStyle = "photo-shoot" | "anime" | "80s-Glam";

/**
 * Generate a badge preview using server API endpoint
 * @param photoUrl URL or base64 of the visitor's photo
 * @param visitorName Name of the visitor for the badge
 * @param style Avatar style to use
 * @returns Base64 encoded image data of the generated badge
 */
export async function generateBadgePreview(
  photoUrl: string,
  visitorName: string,
  style: AvatarStyle = "photo-shoot"
): Promise<string | null> {
  try {
    console.log("Calling API to generate badge preview for:", visitorName);
    console.log("Using style:", style);

    // Call our secure API endpoint instead of using OpenAI client directly
    const response = await fetch("/api/generate-badge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        photoUrl,
        visitorName,
        style,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate badge");
    }

    const data = await response.json();
    return data.badge;
  } catch (error) {
    console.error("Error generating badge preview:", error);
    return null;
  }
}

export const generateBlendedBadge = async (
  photoUrl: string,
  userData?: {
    name?: string;
    last_name?: string;
    company?: string;
    position?: string;
  }
) => {
  try {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Set canvas dimensions
    canvas.width = 2000;
    canvas.height = 600;

    // Load the badge template image
    const templateImage = document.createElement("img");
    templateImage.crossOrigin = "anonymous";

    // Load the user photo
    const userPhoto = document.createElement("img");
    userPhoto.crossOrigin = "anonymous";

    // Wait for both images to load
    await new Promise((resolve, reject) => {
      templateImage.onload = () => {
        userPhoto.onload = resolve;
        userPhoto.onerror = () =>
          reject(new Error("Failed to load user photo"));
        userPhoto.src = photoUrl;
      };
      templateImage.onerror = () =>
        reject(new Error("Failed to load template image"));
      templateImage.src = "/badge-template.png";
    });

    // Draw the template first
    ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

    // Draw the user photo on top
    const photoWidth = 500;
    const photoHeight = 500;
    const photoX = canvas.width - photoWidth - 72;
    const photoY = (canvas.height - photoHeight) / 2;

    ctx.drawImage(userPhoto, photoX, photoY, photoWidth, photoHeight);

    // Add text to the badge
    if (userData) {
      // Configure text styling
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";

      // Draw the user name center
      if (userData.name) {
        ctx.font = "bold 80px Prompt";
        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(
          userData?.name?.toUpperCase() || "",
          canvas.width / 2,
          canvas.height / 2
        );

        // Add position below the name
        if (userData.position) {
          ctx.font = "bold 40px Prompt";
          ctx.fillStyle = "#ffffff";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(
            userData.position.toUpperCase() || "",
            canvas.width / 2,
            canvas.height / 2 + 100
          );
        }

        // Add company name below the position
        if (userData.company) {
          ctx.font = "bold 40px Prompt";
          ctx.fillStyle = "#ffffff";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(
            `( ${userData.company || ""} )`,
            canvas.width / 2,
            canvas.height / 2 + 200
          );
        }
      }
    }

    // Convert canvas to data URL
    const blendedImageUrl = canvas.toDataURL("image/png");
    return blendedImageUrl;
  } catch (err: any) {
    console.error("Error generating blended badge:", err);
    return null;
  }
};
