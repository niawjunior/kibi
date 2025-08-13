import { User } from "./supabase";

/**
 * Get user by reference ID from API
 * @param ref - Unique reference ID for the user (from QR code)
 * @returns User object or null if not found
 */
export async function getUserByRef(ref: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/get-by-ref?ref=${encodeURIComponent(ref)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.user as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Update user registration status and photo URL via API
 * @param ref - Unique reference ID for the user
 * @param photoUrl - URL or base64 data of the user's photo
 * @param badgeUrl - Optional URL of the user's badge image
 * @returns Updated user object or null if failed
 */
export async function updateUserRegistration(
  ref: string,
  photoUrl: string,
  badgeUrl?: string,
  cardUrl?: string
): Promise<User | null> {
  try {
    const response = await fetch('/api/users/update-registration', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref,
        photoUrl,
        badgeUrl,
        cardUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error updating user registration: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.user as User;
  } catch (error) {
    console.error("Error updating user registration:", error);
    return null;
  }
}

/**
 * Get all users for an event via API
 * @param eventId - ID of the event
 * @returns Array of users or empty array if none found
 */
export async function getUsersByEvent(eventId: string): Promise<User[]> {
  try {
    const response = await fetch(`/api/users/get-by-event?eventId=${encodeURIComponent(eventId)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching users by event: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.users as User[];
  } catch (error) {
    console.error("Error fetching users by event:", error);
    return [];
  }
}

/**
 * Upload user photo to Supabase storage and return the public URL
 * @param base64Image - Base64 encoded image data
 * @param userRef - User reference ID for filename
 * @returns Public URL of the uploaded image or null if failed
 */
/**
 * Create a new visitor via API
 * @param visitorData - Visitor information to save
 * @returns Created visitor object or null if failed
 */
export async function createVisitor(visitorData: {
  id: string;
  ref: string;
  name: string;
  last_name: string;
  company: string;
  position: string;
  email: string;
  phone: string;
  event_id: string;
  registered: boolean;
  photo_url: string | null;
  qr_url?: string | null;
}): Promise<User | null> {
  try {
    // Log the request for debugging
    console.log("Creating visitor with data:", {
      ref: visitorData.ref,
      name: visitorData.name,
      email: visitorData.email,
    });

    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visitorData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error creating visitor: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.user as User;
  } catch (error) {
    console.error("Error creating visitor:", error);
    throw error; // Re-throw to provide better error handling in the UI
  }
}

export async function uploadUserPhoto(
  base64Image: string,
  userRef: string
): Promise<string | null> {
  try {
    const response = await fetch('/api/storage/upload-photo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        userRef,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error uploading photo: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading photo:", error);
    return null;
  }
}

/**
 * Upload badge image via API and return the public URL
 * @param base64Image - Base64 encoded image data
 * @param userRef - User reference ID for filename
 * @returns Public URL of the uploaded image or null if failed
 */
export async function uploadBadgeImage(
  base64Image: string,
  userRef: string
): Promise<string | null> {
  try {
    // Check if the image is already a URL (not base64)
    if (base64Image.startsWith("http")) {
      return base64Image; // Return the URL as is
    }

    const response = await fetch('/api/storage/upload-badge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        userRef,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error uploading badge: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading badge:", error);
    return null;
  }
}

/**
 * Upload QR image to Supabase storage and return the public URL
 * @param base64Image - Base64 encoded image data
 * @param userRef - User reference ID for filename
 * @returns Public URL of the uploaded image or null if failed
 */
export async function uploadQrImage(
  base64Image: string,
  userRef: string
): Promise<string | null> {
  try {
    // Check if the image is already a URL (not base64)
    if (base64Image.startsWith("http")) {
      return base64Image; // Return the URL as is
    }

    const response = await fetch('/api/storage/upload-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Image,
        userRef,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error uploading QR image: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading QR image:", error);
    return null;
  }
}
