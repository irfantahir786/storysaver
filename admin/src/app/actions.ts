"use server";

import type { ContentItem } from '@/lib/types';

/**
 * @fileOverview Server Actions for interacting with the StorySaver API.
 * These actions run on the server to bypass CORS restrictions.
 */

/**
 * Fetches application settings from the VPS API.
 */
export async function fetchSettings() {
  try {
    const response = await fetch('https://api.storysaver.in/settings', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchSettings server action:', error);
    throw new Error('Failed to retrieve settings from the server.');
  }
}

/**
 * Fetches advertisement units from the ads API.
 */
export async function fetchAds() {
  try {
    const response = await fetch('https://api.storysaver.in/ads/', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ads: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in fetchAds server action:', error);
    throw new Error('Failed to retrieve ads from the server.');
  }
}

/**
 * Fetches a single advertisement by its ID.
 */
export async function fetchAdById(id: string) {
  try {
    const response = await fetch(`https://api.storysaver.in/ads/${id}`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ad: ${response.status}`);
    }
    const result = await response.json();
    // Return data property if it exists, otherwise return the result itself
    return result?.data || result;
  } catch (error) {
    console.error(`Error in fetchAdById (${id}):`, error);
    throw new Error('Failed to retrieve advertisement details.');
  }
}

/**
 * Updates an existing advertisement unit via the ads API using PUT.
 */
export async function updateAd(id: string | number, payload: any) {
  try {
    const response = await fetch(`https://api.storysaver.in/ads/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update ad: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in updateAd (${id}):`, error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred while updating the advertisement.');
  }
}

/**
 * Creates a NEW setting via the settings API.
 */
export async function createSetting(payload: { key: string; value: string; notes: string; app: number }) {
  try {
    const response = await fetch('https://api.storysaver.in/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create setting: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createSetting:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred.');
  }
}

/**
 * Updates an existing setting via the settings API using PUT.
 */
export async function updateSetting(key: string, payload: { value: string; notes: string; app: number }) {
  try {
    const response = await fetch(`https://api.storysaver.in/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update setting: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in updateSetting (${key}):`, error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred.');
  }
}

/**
 * Deletes an existing setting via the settings API using DELETE.
 */
export async function deleteSetting(key: string) {
  try {
    const response = await fetch(`https://api.storysaver.in/settings/${key}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete setting: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in deleteSetting (${key}):`, error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred.');
  }
}

/**
 * Searches for Instagram users by username.
 */
export async function searchInstagramUser(username: string) {
  try {
    const response = await fetch(`https://api.storysaver.in/ig/searchUser/${username}`);
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching user:', error);
    throw new Error('Failed to search for user. Please try again later.');
  }
}

/**
 * Fetches active stories for a given user ID.
 * Handles 404 and 410 as "No story Found".
 */
export async function fetchUserStories(userId: string) {
  try {
    const response = await fetch(`https://api.storysaver.in/ig/stories/${userId}`, {
      cache: 'no-store'
    });
    
    // 404 or 410 indicate no active stories or "Gone"
    if (response.status === 404 || response.status === 410) {
      return { status: 'ok', data: [], message: 'No story Found' };
    }
    
    if (!response.ok) {
      throw new Error(`Stories fetch failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Check if result data is empty but status is ok
    if (result.status === 'ok' && (!result.data || result.data.length === 0) && (!result.stories || result.stories.length === 0)) {
      return { ...result, data: [], message: 'No story Found' };
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw new Error('Failed to fetch stories for this user.');
  }
}

/**
 * Reusable function to fetch specific story media by its mediaId.
 */
export async function fetchStoryByMediaId(mediaId: string) {
  try {
    const response = await fetch(`https://api.storysaver.in/ig/media/${mediaId}`);
    if (!response.ok) {
      throw new Error(`Media fetch failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'ok' && data.data) {
      return {
        user: data.user,
        caption: data.post?.caption || data.caption || null,
        likes: data.post?.likes || 0,
        items: data.data.map((item: any) => ({
          id: item.id,
          type: item.type === 'video' ? 'video' : 'photo',
          url: item.url,
          thumbnailUrl: item.thumb || item.url
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('Error in fetchStoryByMediaId:', error);
    throw new Error('The story could not be retrieved.');
  }
}

/**
 * Fetches content for a specific highlight by its full highlight ID.
 */
export async function fetchHighlightMedia(highlightId: string) {
  try {
    const response = await fetch(`https://api.storysaver.in/ig/highlight/${highlightId}`);
    if (!response.ok) {
      throw new Error(`Highlight fetch failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'ok' && data.data) {
      return {
        status: 'ok',
        items: data.data.map((item: any) => ({
          id: item.id,
          type: item.type === 'video' ? 'video' : 'photo',
          url: item.url,
          thumbnailUrl: item.thumb || item.url
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('Error in fetchHighlightMedia:', error);
    throw new Error('The highlight could not be retrieved.');
  }
}

/**
 * Fetches the high-quality profile picture (DP) for a given username.
 */
export async function fetchBaseDP(username: string) {
  try {
    const response = await fetch(`https://api.storysaver.in/ig/baseDP/${username}`);
    if (!response.ok) {
      throw new Error(`DP fetch failed with status: ${response.status}`);
    }
    const result = await response.json();
    if (result.status === 'ok' && result.user) {
        return {
            status: 'ok',
            user: {
                id: result.user.id,
                username: result.user.username,
                name: result.user.name,
                profile_pic: result.user.profile_pic,
                is_private: result.user.is_private,
                is_verified: result.user.is_verified
            }
        };
    }
    return result;
  } catch (error) {
    console.error('Error in fetchBaseDP:', error);
    throw new Error('Failed to fetch profile picture.');
  }
}

/**
 * Fetches all active login sessions.
 */
export async function fetchSessions() {
  try {
    const response = await fetch('https://api.storysaver.in/ig/sessions', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch sessions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw new Error('Failed to retrieve sessions.');
  }
}

/**
 * Updates a session's access token.
 */
export async function updateSessionStatus(id: number | string, sessionid: string) {
  try {
    const response = await fetch('https://api.storysaver.in/ig/sessions/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id), sessionid }),
    });
    if (!response.ok) throw new Error('Update failed');
    return await response.json();
  } catch (error) {
    console.error('Error updating session:', error);
    throw new Error('Failed to update session.');
  }
}

/**
 * Toggles a session's active status.
 */
export async function toggleSessionStatus(id: number | string, status: number) {
  try {
    const response = await fetch('https://api.storysaver.in/ig/sessions/updateStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id), status: Number(status) }),
    });
    if (!response.ok) throw new Error('Status toggle failed');
    return await response.json();
  } catch (error) {
    console.error('Error toggling session:', error);
    throw new Error('Failed to update session status.');
  }
}
