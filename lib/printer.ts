/**
 * Generate a RAWBT URL for Bluetooth printing directly from base64 image
 *
 * @param imageBase64 - Base64 encoded image data
 * @returns RAWBT URL for triggering Bluetooth printing
 */
export function generateRawBtUrl(imageBase64: string): string {
  // RAWBT is a protocol for sending raw binary data to Bluetooth printers
  // For direct image printing, we use the image URL format
  // Format: rawbt://image.base64,<base64_encoded_image>

  // This URL will be opened by the kiosk browser and handled by a RAWBT-compatible app
  // that sends the image directly to the printer without additional processing
  return `rawbt://image.base64,${imageBase64}`;
}
