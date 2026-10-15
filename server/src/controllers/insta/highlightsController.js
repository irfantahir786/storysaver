import express from 'express';
import axios from 'axios';
import { USER_AGENT } from '../../configs/constants.js';
import { getActiveSession, logOutSession } from '../../configs/sessions.helper.js';
import redisClient from '../../configs/redis.js';
import { getBestProfilePic } from '../../configs/insta.helper.js';


export async function fetchHighlights(req, res) {
    var session = await getActiveSession();
    console.log('session ', session.name)
    if (!session) {
        return res.status(420).json({ status: "fail", user: null });
    }

    const { userId } = req.params;
    const url = `https://i.instagram.com/api/v1/highlights/${userId}/highlights_tray/`;
    console.log(url);

    // first request
    axios.get(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Cookie": `sessionid=${session.sessionid}; ds_user_id=${session.ds_user_id};`
        }
    })
    .then(response => {

        if (response.status !== 200) {
            return res.status(500).json({ status: "fail", user: null });
        }

        const items = response.data.tray || [];

        if (items.length === 0) {
            return res.status(200).json({ status: "ok", data: [] });
        }

        const data = [];

        items.forEach(item => {
            data.push({
                id: String(item.id),
                title: item.title,
                cover: item.cover_media?.cropped_image_version?.url ?? null,
                media_count: item.media_count,
            });
        });

        return res.status(200).json({ status: "ok", data });

    })
    .catch(async error => {

        console.log("error", error.response?.status);

        // 🔥 retry on 400
       const states  = error.response?.status
        if (states === 400 || states === 404 ) {
            console.log("Session expired, retrying...");

            await logOutSession(session?.id);
            const newSession = await getActiveSession();
            console.log("NEw Session ", newSession.name)

            if (!newSession) {
                return res.status(500).json({ status: "fail", user: null });
            }

            // retry request (no nested helper)
            return axios.get(url, {
                headers: {
                    "User-Agent": USER_AGENT,
                    "Cookie": `sessionid=${newSession.sessionid}; ds_user_id=${newSession.ds_user_id};`
                }
            })
            .then(response => {

                const items = response.data.tray || [];

                if (items.length === 0) {
                    return res.status(200).json({ status: "ok", data: [] });
                }

                const data = [];

                items.forEach(item => {
                    data.push({
                        id: String(item.id),
                        title: item.title,
                        cover: item.cover_media?.cropped_image_version?.url ?? null,
                        media_count: item.media_count,
                    });
                });

                return res.status(200).json({ status: "ok", data });
            })
            .catch(err => {
                return res.status(err.response?.status || 500).json({ status: "fail", user: null });
            });
        }

        // normal errors
        if (error.response) {
            const status = error.response.status;

            if (status === 403) {
                logOutSession(session?.id);
            }

            return res.status(status).json({ status: "fail", user: null });
        }

        return res.status(500).json({ status: "fail", user: null });
    });
}

export async function fetchHighlightDetails(req, res) {
    console.log("fetchHighlightDetails called");

    var session = await getActiveSession();
    console.log('session ', session.name)

    if (!session) {
        return res.status(420).json({ status: "fail", user: null });
    }

    const { highlightId } = req.params;
    const url = `https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=${highlightId}`;
    console.log(url);

    axios.get(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Cookie": `sessionid=${session.sessionid}; ds_user_id=${session.ds_user_id};`
        }
    })
    .then(response => {

        if (response.status !== 200) {
            return res.status(500).json({ status: "fail", user: null });
        }

        const reels = response.data.reels;
        const reel = reels?.[highlightId];

        if (!reel) {
            return res.status(404).json({ status: "fail", user: null });
        }

        const items = reel.items || [];
        const userData = reel.user;

        if (items.length === 0) {
            return res.status(200).json({ status: "ok", data: [] });
        }

        const user = {
            id: userData?.pk_id || userData?.pk,
            username: userData?.username,
            name: userData?.full_name || '',
            profile_pic: userData?.profile_pic_url || null,
            profile_pic_id: userData?.profile_pic_id,
            is_private: userData?.is_private,
            is_verified: userData?.is_verified ?? false,
        };

        const data = [];

        items.forEach(item => {
            if (item.media_type === 1) {
                data.push({
                    id: String(item.id),
                    type: "image",
                    thumb: item.image_versions2?.candidates?.[0]?.url ?? null,
                    url: item.image_versions2?.candidates?.[0]?.url ?? null,
                    expiring: item.expiring_at,
                });
            } else if (item.media_type === 2) {
                data.push({
                    id: String(item.id),
                    type: "video",
                    thumb: item.image_versions2?.candidates?.[0]?.url ?? null,
                    url: item.video_versions?.[0]?.url ?? null,
                    expiring: item.expiring_at,
                });
            }
        });

        return res.status(200).json({ status: "ok", data, user });

    })
    .catch(async error => {

        console.log("error", error);

        // 🔥 retry on 400
        const states  = error.response?.status
        if (states === 400 || states === 404 ) {
            console.log("Session expired, retrying...");

            await logOutSession(session?.id);
            const newSession = await getActiveSession();
            console.log("New Session " , newSession.name)

            if (!newSession) {
                return res.status(500).json({ status: "fail", user: null });
            }

            return axios.get(url, {
                headers: {
                    "User-Agent": USER_AGENT,
                    "Cookie": `sessionid=${newSession.sessionid}; ds_user_id=${newSession.ds_user_id};`
                }
            })
            .then(response => {

                const reels = response.data.reels;
                const reel = reels?.[highlightId];

                if (!reel) {
                    return res.status(404).json({ status: "fail", user: null });
                }

                const items = reel.items || [];
                const userData = reel.user;

                if (items.length === 0) {
                    return res.status(200).json({ status: "ok", data: [] });
                }

                const user = {
                    id: userData?.pk_id || userData?.pk,
                    username: userData?.username,
                    name: userData?.full_name || '',
                    profile_pic: userData?.profile_pic_url || null,
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

                return res.status(200).json({ status: "ok", data, user });
            })
            .catch(err => {
                return res.status(err.response?.status || 500).json({ status: "fail", user: null });
            });
        }

        // normal errors
        if (error.response) {
            const status = error.response.status;

            if (status === 403) {
                logOutSession(session?.id);
            }

            return res.status(status).json({ status: "fail", user: null });
        }

        return res.status(500).json({ status: "fail", user: null });
    });
}

