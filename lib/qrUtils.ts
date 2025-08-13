/**
 * Converts a QR code component to a base64 image
 * @param qrCodeRef - Reference to the QR code component
 * @returns Promise that resolves to Base64 encoded image data or null
 */
export const qrCodeToBase64 = async (qrCodeRef: React.RefObject<HTMLDivElement>): Promise<string | null> => {
  try {
    if (!qrCodeRef.current) return null;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const qrElement = qrCodeRef.current;
    
    // Set canvas dimensions to match QR code
    const width = qrElement.offsetWidth;
    const height = qrElement.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Draw QR code to canvas
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    // Convert SVG to XML string
    const svgElement = qrElement.querySelector('svg');
    if (!svgElement) return null;
    
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    // Create a data URL from the SVG string
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    // Return a promise that resolves with the base64 data
    return new Promise<string>((resolve, reject) => {
      img.onload = () => {
        // Draw image to canvas with white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to base64
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load QR code image'));
      };
      
      img.src = url;
    });
  } catch (error) {
    console.error('Error converting QR code to base64:', error);
    return null;
  }
};
