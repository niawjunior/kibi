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
): Promise<{ displayUrl: string; printUrl: string } | null> => {
  try {
    // 1) Base canvas (your original layout, landscape)
    const base = document.createElement("canvas");
    const bctx = base.getContext("2d");
    if (!bctx) throw new Error("Could not get base canvas context");

    base.width = 1519;
    base.height = 482;

    // Load images
    const templateImage = new Image();
    templateImage.crossOrigin = "anonymous";

    const userPhoto = new Image();
    userPhoto.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      templateImage.onload = () => {
        userPhoto.onload = () => resolve();
        userPhoto.onerror = () =>
          reject(new Error("Failed to load user photo"));
        userPhoto.src = photoUrl;
      };
      templateImage.onerror = () =>
        reject(new Error("Failed to load template image"));
      templateImage.src = "/badge-template.png";
    });

    // Draw template
    bctx.imageSmoothingEnabled = true;
    bctx.drawImage(templateImage, 0, 0, base.width, base.height);

    // Draw centered user photo
    const photoWidth = 300;
    const photoHeight = 300;
    const photoX = (base.width - photoWidth) / 2;
    const photoY = (base.height - photoHeight) / 2;
    bctx.drawImage(userPhoto, photoX, photoY, photoWidth, photoHeight);

    // Add text
    if (userData?.name) {
      bctx.fillStyle = "#350A7F";
      bctx.textBaseline = "top";
      bctx.textAlign = "center";
      bctx.font = "bold 24px Prompt";
      const textX = base.width / 2;
      const textY = photoY + photoHeight + 40;
      bctx.fillText(
        `${userData.name.toUpperCase()} ${
          userData.last_name?.[0]?.toUpperCase() ?? ""
        }`,
        textX,
        textY
      );
    }

    // 2) Rotate the composed image 90° clockwise and export that
    const rotated = document.createElement("canvas");
    const rctx = rotated.getContext("2d");
    if (!rctx) throw new Error("Could not get rotated canvas context");

    // Swap dimensions
    rotated.width = base.height; // 482
    rotated.height = base.width; // 1519

    // Move origin to the right edge of the rotated canvas, rotate, then draw
    rctx.imageSmoothingEnabled = true;
    rctx.translate(rotated.width, 0);
    rctx.rotate(Math.PI / 2); // 90 deg clockwise
    rctx.drawImage(base, 0, 0); // draws the entire base canvas

    // Generate both display (non-rotated) and print (rotated) versions
    const displayUrl = base.toDataURL("image/png");
    const printUrl = rotated.toDataURL("image/png");
    
    return { displayUrl, printUrl };
  } catch (err) {
    console.error("Error generating blended badge:", err);
    return null;
  }
};
