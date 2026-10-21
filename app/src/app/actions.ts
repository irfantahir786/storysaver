"use server";

import type { ContentItem } from '@/lib/types';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = (
  process.env.API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.storysaver.in'
    : 'http://localhost:3005')
).replace(/\/$/, '');

const SETTINGS_REVALIDATE_SECONDS = 60 * 60 * 1;

// Module-level cache for API delay setting
let cachedDelaySeconds: number | null = null;
let delayCacheTimestamp: number = 0;
const DELAY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseDelaySeconds(settings: any): number {
  const rawDelay =
    settings?.web?.delay?.value ??
    settings?.web?.delay ??
    settings?.web?.api_delay_seconds?.value ??
    settings?.web?.api_delay_seconds;

  const parsed = Number(rawDelay);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
}

async function getCachedDelay(): Promise<number> {
  const now = Date.now();

  // Return cached delay if not expired
  if (cachedDelaySeconds !== null && (now - delayCacheTimestamp) < DELAY_CACHE_TTL_MS) {
    return cachedDelaySeconds;
  }

  // Fetch fresh settings and cache delay
  try {
    const settings = await fetchSettings();
    cachedDelaySeconds = parseDelaySeconds(settings);
    delayCacheTimestamp = now;
  } catch (error) {
    console.error('Error fetching delay from settings:', error);
    cachedDelaySeconds = 0;
    delayCacheTimestamp = now;
  }

  return cachedDelaySeconds;
}

async function applyConfiguredDelay(): Promise<void> {
  const delaySeconds = await getCachedDelay();
  if (delaySeconds > 0) {
    await sleep(delaySeconds * 1000);
  }
}

/**
 * @fileOverview Server Actions for interacting with the StorySaver API.
 * These actions run on the server to bypass CORS restrictions.
 */

/**
 * Fetches application settings from the VPS API.
 * Returns an empty structure on failure to prevent app-wide crashes during metadata generation.
 */
export async function fetchSettings() {

  try {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      next: {
        revalidate: SETTINGS_REVALIDATE_SECONDS,
        tags: ['settings'],
      },
    });
    if (!response.ok) {
      console.warn(`Settings API unavailable (Status ${response.status})`);
      return { web: {}, app: {} };
    }
    const data = await response.json();
    cachedDelaySeconds = parseDelaySeconds(data);
    delayCacheTimestamp = Date.now();
    return data;
  } catch (error) {
    console.error('Error in fetchSettings server action:', error);
    return { web: {}, app: {} };
  }
}

/**
 * Fetches advertisement units from the ads API.
 * Returns an empty list on failure.
 */
export async function fetchAds() {
  try {
    const response = await fetch(`${API_BASE_URL}/ads/`, {
      cache: 'no-store'
    });
    if (!response.ok) {
      console.warn(`Ads API unavailable (Status ${response.status})`);
      await applyConfiguredDelay();
      return { data: [] };
    }
    const data = await response.json();
    await applyConfiguredDelay();
    return data;
  } catch (error) {
    console.error('Error in fetchAds server action:', error);
    return { data: [] };
  }
}


/**
 * Searches for Instagram users by username.
 */
export async function searchInstagramUser(username: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/ig/searchUser/${username}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_API_KEY as string,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();
    await applyConfiguredDelay();
    return data;
  } catch (error) {
    console.error("Error searching user:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to search for user. Please try again later.");
  }
}

/**
 * Fetches active stories for a given user ID.
 * Handles 404 and 410 as "No story Found".
 */
export async function fetchUserStories(userId: string) {
  try {
    const apiKey = process.env.BACKEND_API_KEY;

    if (!apiKey) {
      throw new Error("API_KEY missing in env");
    }

    const response = await fetch(
      `${API_BASE_URL}/ig/stories/${userId}`,
      {
        cache: "no-store",
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    // 404 / 410 → no stories
    if (response.status === 404 || response.status === 410) {
      await applyConfiguredDelay();
      return { status: "ok", data: [], message: "No story Found" };
    }

    if (!response.ok) {
      throw new Error(`Stories fetch failed with status: ${response.status}`);
    }

    const result = await response.json();

    // normalize empty response
    if (
      result.status === "ok" &&
      (!result.data || result.data.length === 0) &&
      (!result.stories || result.stories.length === 0)
    ) {
      await applyConfiguredDelay();
      return { ...result, data: [], message: "No story Found" };
    }

    await applyConfiguredDelay();
    return result;
  } catch (error) {
    console.error("Error fetching stories:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch stories for this user.");
  }
}

/**
 * Reusable function to fetch specific story media by its mediaId.
 */
export async function fetchStoryByMediaId(mediaId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ig/media/${mediaId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_API_KEY as string,
        },
      });
    if (!response.ok) {
      throw new Error(`Media fetch failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'ok' && data.data) {
      const result = {
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
      await applyConfiguredDelay();
      return result;
    }
    await applyConfiguredDelay();
    return null;
  } catch (error) {
    console.error('Error in fetchStoryByMediaId:', error);
    throw error instanceof Error ? error : new Error('The story could not be retrieved.');
  }
}

/**
 * Fetches content for a specific highlight by its full highlight ID.
 */
export async function fetchHighlightMedia(highlightId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ig/highlight/${highlightId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_API_KEY as string,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Highlight fetch failed with status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'ok' && data.data) {
      const result = {
        status: 'ok',
        items: data.data.map((item: any) => ({
          id: item.id,
          type: item.type === 'video' ? 'video' : 'photo',
          url: item.url,
          thumbnailUrl: item.thumb || item.url
        }))
      };
      await applyConfiguredDelay();
      return result;
    }
    await applyConfiguredDelay();
    return null;
  } catch (error) {
    console.error('Error in fetchHighlightMedia:', error);
    throw error instanceof Error ? error : new Error('The highlight could not be retrieved.');
  }
}

/**
 * Fetches the high-quality profile picture (DP) for a given username.
 */
export async function fetchBaseDP(username: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ig/baseDP/${username}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_API_KEY as string,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`DP fetch failed with status: ${response.status}`);
    }
    const result = await response.json();
    if (result.status === 'ok' && result.user) {
      const returnData = {
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
      await applyConfiguredDelay();
      return returnData;
    }
    await applyConfiguredDelay();
    return result;
  } catch (error) {
    console.error('Error in fetchBaseDP:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch profile picture.');
  }
}

/**
 * Fetches all active login sessions.
 */
export async function fetchSessions() {
  try {
    const response = await fetch(`${API_BASE_URL}/ig/sessions`, { cache: 'no-store' });
    if (!response.ok) {
      await applyConfiguredDelay();
      return { data: [] };
    }
    const data = await response.json();
    await applyConfiguredDelay();
    return data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return { data: [] };
  }
}

/**
 * Updates a session's access token.
 */
export async function updateSessionStatus(id: number | string, sessionid: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/ig/sessions/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id), sessionid }),
    });
    if (!response.ok) throw new Error('Update failed');
    const data = await response.json();
    await applyConfiguredDelay();
    return data;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error instanceof Error ? error : new Error('Failed to update session.');
  }
}

/**
 * Toggles a session's active status.
 */
export async function toggleSessionStatus(id: number | string, status: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/ig/sessions/updateStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id), status: Number(status) }),
    });
    if (!response.ok) throw new Error('Status toggle failed');
    const data = await response.json();
    await applyConfiguredDelay();
    return data;
  } catch (error) {
    console.error('Error toggling session:', error);
    throw error instanceof Error ? error : new Error('Failed to update session status.');
  }
}
