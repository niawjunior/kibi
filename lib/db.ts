import { supabase, User } from './supabase';

/**
 * Get user by reference ID from Supabase
 * @param ref - Unique reference ID for the user (from QR code)
 * @returns User object or null if not found
 */
export async function getUserByRef(ref: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('ref', ref)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error fetching user:', error);
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
      .from('users')
      .update({ 
        registered: true, 
        photo_url: photoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('ref', ref)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user registration:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error updating user registration:', error);
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
      .from('users')
      .select('*')
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error fetching users by event:', error);
      return [];
    }
    
    return data as User[];
  } catch (error) {
    console.error('Error fetching users by event:', error);
    return [];
  }
}
