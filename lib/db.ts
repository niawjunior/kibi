import { supabase, User } from "./supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Get user by reference ID from Supabase
 * @param ref - Unique reference ID for the user (from QR code)
 * @returns User object or null if not found
 */
export async function getUserByRef(ref: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("ref", ref)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Update user registration status and photo URL in Supabase
 * @param ref - Unique reference ID for the user
 * @param photoUrl - URL or base64 data of the user's photo
 * @returns Updated user object or null if failed
 */
export async function updateUserRegistration(
  ref: string,
  photoUrl: string
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        registered: true,
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("ref", ref)
      .select()
      .single();

    if (error) {
      console.error("Error updating user registration:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Error updating user registration:", error);
    return null;
  }
}

/**
 * Get all users for an event
 * @param eventId - ID of the event
 * @returns Array of users or empty array if none found
 */
export async function getUsersByEvent(eventId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching users by event:", error);
      return [];
    }

    return data as User[];
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
 * Create a new visitor in Supabase
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
}): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          ...visitorData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating visitor:", error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error("Error creating visitor:", error);
    return null;
  }
}

export async function uploadUserPhoto(
  base64Image: string,
  userRef: string
): Promise<string | null> {
  try {
    // Remove the data URL prefix to get just the base64 data
    const base64Data = base64Image.split(",")[1];
    if (!base64Data) {
      console.error("Invalid base64 image format");
      return null;
    }

    // Convert base64 to binary data
    const binaryData = Buffer.from(base64Data, "base64");

    // Generate a unique filename with user reference and timestamp
    const fileExt = "jpg";
    const fileName = `${userRef}_${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(filePath, binaryData, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading photo to storage:", error);
      return null;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    return null;
  }
}
