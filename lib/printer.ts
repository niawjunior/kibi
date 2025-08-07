/**
 * Utility functions for handling Bluetooth printing
 * Uses RAWBT protocol for sending print commands to thermal printers
 * 
 * ESC/POS is a printer command language used by most thermal receipt printers
 * RAWBT is a protocol for sending raw binary data to Bluetooth printers
 */

// ESC/POS commands as hex values
const ESC = '1B'; // Escape byte
const GS = '1D';  // Group Separator
const INIT = `${ESC}@`;  // Initialize printer
const CUT = `${GS}V1`;   // Cut paper
const CENTER = `${ESC}a1`; // Center align
const LEFT = `${ESC}a0`;   // Left align
const RIGHT = `${ESC}a2`;  // Right align
const BOLD_ON = `${ESC}E1`; // Bold on
const BOLD_OFF = `${ESC}E0`; // Bold off
const TEXT_NORMAL = `${ESC}!0`; // Normal text size
const TEXT_LARGE = `${ESC}!16`; // Large text size
const LINE_FEED = '0A';    // Line feed

/**
 * Convert a string to hex representation for ESC/POS commands
 */
function textToHex(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += text.charCodeAt(i).toString(16);
  }
  return result;
}

/**
 * Prepare image and user data for printing in ESC/POS format
 * 
 * @param imageBase64 - Base64 encoded image data
 * @param userData - User information to print on badge
 * @returns Formatted print data in hex format
 */
export function prepareImageForPrinting(
  imageBase64: string,
  userData: { name: string; last_name: string; company: string; position: string; email: string; phone: string }
): string {
  // In a real implementation, this would convert the image to ESC/POS format
  // using a library like escpos-image or node-thermal-printer
  
  // For this demo, we'll create a simulated ESC/POS command sequence
  // that would print a badge with user info and image
  
  // Start with printer initialization
  let commands = INIT;
  
  // Center align and set large text size for name
  commands += CENTER + TEXT_LARGE + BOLD_ON;
  commands += textToHex(`${userData.name} ${userData.last_name}`);
  commands += LINE_FEED + LINE_FEED;
  
  // Normal size for company and position
  commands += TEXT_NORMAL + BOLD_OFF;
  commands += textToHex(userData.company);
  commands += LINE_FEED;
  commands += textToHex(userData.position);
  commands += LINE_FEED;
  
  // Contact information
  commands += textToHex(userData.email);
  commands += LINE_FEED;
  commands += textToHex(userData.phone);
  commands += LINE_FEED + LINE_FEED;
  
  // In a real implementation, we would convert and add the image here
  // For now, we'll just add a placeholder note
  commands += LEFT + textToHex('[Photo would be printed here]');
  commands += LINE_FEED + LINE_FEED;
  
  // Add event information
  commands += CENTER;
  commands += textToHex('AI Conference 2025');
  commands += LINE_FEED;
  commands += textToHex(new Date().toLocaleDateString());
  commands += LINE_FEED + LINE_FEED;
  
  // Cut the paper
  commands += CUT;
  
  // For demo purposes, we'll also include the original image data
  // This wouldn't be part of a real implementation but helps for testing
  const demoData = {
    commands: commands,
    imageBase64: imageBase64.substring(0, 100) + '...' // Truncated for brevity
  };
  
  // In a real implementation, we would return just the commands
  // For this demo, we'll stringify the object to show what's happening
  return JSON.stringify(demoData);
}

/**
 * Send print data to a Bluetooth printer
 * 
 * @param printData - Formatted print data
 * @returns Promise resolving to success status
 */
export async function printViaBluetooth(printData: string): Promise<boolean> {
  try {
    // In a real implementation, this would send the data to a Bluetooth printer
    // using the RAWBT protocol via a URL or Web Bluetooth API
    
    // For development purposes, we'll just log the action
    console.log('Sending print data to Bluetooth printer...');
    console.log('Print data length:', printData.length);
    
    // Simulate a successful print with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  } catch (error) {
    console.error('Error printing via Bluetooth:', error);
    return false;
  }
}

/**
 * Generate a RAWBT URL for Bluetooth printing
 * 
 * @param printData - Formatted print data
 * @returns RAWBT URL for triggering Bluetooth printing
 */
export function generateRawBtUrl(printData: string): string {
  // RAWBT is a protocol for sending raw binary data to Bluetooth printers
  // Format: rawbt://base64,<base64_encoded_data>
  
  // In a real implementation on Android, this URL would be opened by the kiosk browser
  // and handled by a RAWBT-compatible app that sends the data to the printer
  return `rawbt://base64,${encodeURIComponent(printData)}`;
}
