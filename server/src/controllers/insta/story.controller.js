import axios from "axios";
import { getActiveSession, logOutSession } from '../../configs/sessions.helper.js';
import { USER_AGENT } from "../../configs/constants.js";
import redisClient from '../../configs/redis.js';


// 🔥 reusable request with retry
async function instaRequest(url, session) {
  
    return axios.get(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Cookie": `sessionid=${session.sessionid}; ds_user_id=${session.ds_user_id};`
        }
    }).catch(async (error) => {
        const states  = error.response?.status
        if (states === 400 || states === 404 ) {
            console.log("Session expired, retrying...");

            await logOutSession(session?.id);
            const newSession = await getActiveSession();

            if (!newSession) {
                throw error;
            }

            return axios.get(url, {
                headers: {
                    "User-Agent": USER_AGENT,
                    "Cookie": `sessionid=${newSession.sessionid}; ds_user_id=${newSession.ds_user_id};`
                }
            });
        }

        throw error;
    });
}

// ✅ YOUR STORY CONTROLLER
export async function fetchUserStories(req, res) {

    getActiveSession().then(session => {
          console.log(session)

        if (!session) {
            return res.status(420).json({ status: "fail", user: null });
        }

        const { userId } = req.params;
        const url = `https://i.instagram.com/api/v1/feed/user/${userId}/reel_media/`;

        instaRequest(url, session)
        .then(async (response) => {

            if (response.status !== 200) {
                return res.status(500).json({ status: "fail", user: null });
            }

            const userData = response.data.user;
            const items = response.data.items || [];

            let user = null;
            let data = [];

            if (items.length === 0) {
                user = {
                    id: userData?.pk_id || userData?.pk,
                    username: userData?.username,
                    name: userData?.full_name || '',
                    profile_pic: userData?.profile_pic_url || null,
                    profile_pic_id: userData?.profile_pic_id,
                    is_private: userData?.is_private,
                    is_verified: userData?.is_verified ?? false,
                };

                return res.status(200).json({ status: "fail", user, data: [] });
            }

            user = {
                id: userData?.pk_id || userData?.pk,
                username: userData?.username,
                name: userData?.full_name || '',
                profile_pic: items[0]?.user?.hd_profile_pic_url_info?.url || userData?.profile_pic_url || null,
                profile_pic_id: userData?.profile_pic_id,
                is_private: userData?.is_private,
                is_verified: userData?.is_verified ?? false,
            };

                const cacheKey = `user:${userData?.username}`;
                console.log(cacheKey)
                redisClient.setEx(cacheKey, 86400, JSON.stringify({ status: "ok", user })).catch(() => {
                    console.log("Failed to cache user data");
                });

           

            items.forEach(item => {
                if (item.media_type === 1) {
                    data.push({
                        id: String(item.id),
                        type: "image",
                        thumb: item.image_versions2?.candidates?.[0]?.url || null,
                        url: item.image_versions2?.candidates?.[0]?.url || null,
                        expiring: item.expiring_at,
                    });
                } else if (item.media_type === 2) {
                    data.push({
                        id: String(item.id),
                        type: "video",
                        thumb: item.image_versions2?.candidates?.[0]?.url || null,
                        url: item.video_versions?.[0]?.url || null,
                        expiring: item.expiring_at,
                    });
                }
            });

            return res.status(200).json({ status: "ok", user, data });

        })
        .catch(error => {

            console.log("error", error.response.status);

            if (error.response) {
                const status = error.response.status;

                if (status === 403) {
                    logOutSession(session?.id);
                }

                return res.status(status).json({ status: "fail", user: null });
            }

            return res.status(500).json({ status: "fail", user: null });
        });

    });
}