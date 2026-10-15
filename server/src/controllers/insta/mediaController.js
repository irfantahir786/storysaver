import express from 'express';
import axios from 'axios';
import { USER_AGENT } from '../../configs/constants.js';
import redisClient from '../../configs/redis.js';
import { getActiveSession, logOutSession } from '../../configs/sessions.helper.js';

async function getMedia(req, res) {
    var session = await getActiveSession();
     console.log('session ', session?.name)

    if (!session) {
        return res.status(420).json({ status: "fail", user: null });
    }

    const { mediaId } = req.params;


    const cacheKey = `media:${mediaId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        console.log("Cache hit for mediaId:", mediaId);
        return res.status(200).json(JSON.parse(cachedData));
    }

    const url = `https://i.instagram.com/api/v1/media/${mediaId}/info/`;
    

    axios.get(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Cookie": `sessionid=${session.sessionid}; ds_user_id=${session.ds_user_id};`
        }
    })
    .then(response => {

        if (response.status !== 200) {
            return res.status(500).json({ status: "fail" });
        }

        const items = response.data.items || [];

        if (items.length === 0) {
            return res.status(200).json({ status: "ok", data: [] });
        }

        const userData = items[0].user;

        const user = {
            id: userData.id,
            username: userData.username,
            name: userData.full_name || '',
            profile_pic: userData?.hd_profile_pic_url_info?.url || userData.profile_pic_url || null,
            profile_pic_id: userData.profile_pic_id,
            is_private: userData.is_private,
            is_verified: userData.is_verified ?? false,
        };

        const data = [];

        if (items[0].media_type === 1) {
            data.push({
                id: String(items[0].id),
                type: "image",
                thumb: items[0].image_versions2?.candidates?.[0]?.url ?? null,
                url: items[0].image_versions2?.candidates?.[0]?.url ?? null,
            });
        }
        else if (items[0].media_type === 2) {
            data.push({
                id: String(items[0].id),
                type: "video",
                thumb: items[0].image_versions2?.candidates?.[0]?.url ?? null,
                url: items[0].video_versions?.[0]?.url ?? null,
            });
        }
        else {
            (items[0].carousel_media || []).forEach(item => {
                if (item.media_type === 1) {
                    data.push({
                        id: String(item.id),
                        type: "image",
                        thumb: item.image_versions2?.candidates?.[0]?.url ?? null,
                        url: item.image_versions2?.candidates?.[0]?.url ?? null,
                    });
                } else if (item.media_type === 2) {
                    data.push({
                        id: String(item.id),
                        type: "video",
                        thumb: item.image_versions2?.candidates?.[0]?.url ?? null,
                        url: item.video_versions?.[0]?.url ?? null,
                    });
                }
            });
        }

        let post = {
            likes: items[0]?.like_count,
            caption: items[0]?.caption?.text
        };

        if (post.likes === undefined) {
            post = null;
        }

        // cache (non-blocking)
        redisClient.setEx(cacheKey, 86400, JSON.stringify({ status: "ok", user, data })).catch(() => {});
        redisClient.setEx(`user:${user.username}`, 86400, JSON.stringify({ status: "ok", user })).catch(() => {});

        return res.status(200).json({ status: "ok", user, data, post });

    })
    .catch(async error => {

        console.log("error", error?.message);

        // 🔥 retry on 400
        const states  = error.response?.status
        if (states === 400 ) {
            console.log("Session expired, retrying...");

            await logOutSession(session?.id);
            const newSession = await getActiveSession();
  console.log('new session ', newSession?.name)
            if (!newSession) {
                return res.status(500).json({ status: "fail" });
            }

            return axios.get(url, {
                headers: {
                    "User-Agent": USER_AGENT,
                    "Cookie": `sessionid=${newSession.sessionid}; ds_user_id=${newSession.ds_user_id};`
                }
            })
            .then(response => {

                const items = response.data.items || [];

                if (items.length === 0) {
                    return res.status(200).json({ status: "ok", data: [] });
                }

                const userData = items[0].user;

                const user = {
                    id: userData.id,
                    username: userData.username,
                    name: userData.full_name || '',
                    profile_pic: userData?.hd_profile_pic_url_info?.url || userData.profile_pic_url || null,
                };

                const data = [];

                items.forEach(item => {
                    data.push({
                        id: String(item.id),
                        type: item.media_type === 1 ? "image" : "video",
                        url: item.media_type === 1
                            ? item.image_versions2?.candidates?.[0]?.url
                            : item.video_versions?.[0]?.url
                    });
                });

                return res.status(200).json({ status: "ok", user, data });
            })
            .catch(err => {
                return res.status(err.response?.status || 500).json({ status: "failed" });
            });
        }

        // normal errors
        if (error.response) {
            const status = error.response.status;

            if (status === 403 || status === 401) {
                logOutSession(session?.id);
            }

            return res.status(status).json({ status: "fail" });
        }

        return res.status(500).json({ status: "fail" });
    });
}



export { getMedia }
