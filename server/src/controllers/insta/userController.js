import express from 'express';
import axios from 'axios';
import { USER_AGENT } from '../../configs/constants.js';
import redisClient from '../../configs/redis.js';
import Session from '../../models/sessions.js'
import { getActiveSession } from '../../configs/sessions.helper.js';
import { getBestProfilePic } from '../../configs/insta.helper.js';

//https://i.instagram.com/api/v1/users/web_profile_info/?username=irfantahir786

export async function getUser(req, res) {
    const { username } = req.params
    const normalizedUsername = username?.toLowerCase()
    console.log(normalizedUsername)
    const cacheKey = `user:${normalizedUsername}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("Cache hit for userId:", normalizedUsername);
        return res.status(200).json(JSON.parse(cachedData));
    }
    else {
        console.log("No cache:", normalizedUsername);
        return res.status(404).json({ "status": "fail", "user": null });

    }

}


export async function fetchUserById(req, res) {
    console.log(req.params)
    const { userId } = req.params
    const url = `https://i.instagram.com/api/v1/users/${userId}/info/`;
    console.log(url)
    axios.get(url,
        {
            headers: {
                'User-Agent': USER_AGENT,
                'Cookie': 'sessionid=61002577730%3AuFAkkSSnOZMd5r%3A15%3AAYiGPegXUo7VKa_5LVRcbJbFpHfWpmEhkHFW3FQ-mw; ds_user_id=61002577730;'
            },

        })
        .then(response => {
            if (response.status === 200) {
                console.log(response.data)
                const data = response.data.user
                const user = {
                    id: data.pk_id,
                    username: data.username,
                    name: data.full_name,
                    profile_pic: data.hd_profile_pic_url_info.url,
                    profile_pic_id: data.profile_pic_id,
                    is_private: data.is_private,
                    is_verified: data.is_verified,
                    bio: data.biography,
                    media_count: data.media_count,
                    following: data.following_count,
                    follower: data.follower_count

                }
                res.status(200).json({ 'status': 'ok', 'user': user });

            }
            else {
                res.status(500).json({ 'status': 'fail', 'user': null });
            }

        })
        .catch(error => {
            if (error.response) {
                console.error(`statusCode: ${error.response.status}`);
                if (error.response.status === 403) {
                    res.status(403).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 401) {
                    res.status(401).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 404) {
                    res.status(404).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 429) {
                    res.status(429).json({ "status": "fail", "user": null });
                }
                else {
                    res.status(500).json({ "status": "fail", "user": null });
                }
            }
        });
}

export async function searchUser(req, res) {

    const { username } = req.params
    console.log(username)
    const normalizedUsername = username?.toLowerCase()
    console.log(normalizedUsername)

    var session = await getActiveSession()
    if (!session) {
        return res.status(425).json({ "status": "fail", "user": null });
    }

    const url = `https://i.instagram.com/api/v1/users/search/?q=${normalizedUsername}`;
    console.log(url)
    axios.get(url,
        {
            headers: {
                'User-Agent': USER_AGENT,
                "Cookie": `sessionid=${session.sessionid}; ds_user_id=${session.ds_user_id};`
            },

        })
        .then(response => {
            if (response.status === 200) {
                console.log("Response Done")
                const data = response.data.users
                const users = data.map(data => ({
                    id: data.pk_id || data.pk,
                    username: data.username,
                    name: data.full_name || '',
                    profile_pic: data.profile_pic_url,
                    profile_pic_id: data.profile_pic_id,
                    is_private: data.is_private,
                    is_verified: data.is_verified ?? false
                }))

                res.status(200).json({ status: 'ok', users })

            }
            else {
                res.status(500).json({ 'status': 'fail', 'user': null });
            }

        })
        .catch(error => {

            if (error.response) {
                console.error(`statusCode: ${error.response.status}`);
                if (error.response.status === 400) {
                    res.status(400).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 403) {
                    res.status(403).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 401) {
                    res.status(401).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 404) {
                    res.status(404).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 429) {
                    res.status(429).json({ "status": "fail", "user": null });
                }
                else {
                    res.status(500).json({ "status": "fail", "user": null });
                }
            }
        });
}


export async function fetchUserByUsername(req, res) {

    const { username } = req.params
    const normalizedUsername = username?.toLowerCase()

    const cacheKey = `user:${normalizedUsername}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        console.log("Cache hit for userId:", normalizedUsername);
        return res.status(200).json(JSON.parse(cachedData));
    }
    var session = await getActiveSession()
    if (!session) {
        return res.status(425).json({ "status": "fail", "user": null });
    }
    const url = `https://www.instagram.com/api/v1/users/${normalizedUsername}/usernameinfo`;
    axios.get(url,
        {
            headers: {
                'User-Agent': USER_AGENT,
                "Cookie": `sessionid=${session.sessionid}; ds_user_id=${session.ds_user_id};`
            },

        })
        .then(async response => {
            if (response.status === 200) {
                console.log(response.data)

                const data = response.data.user
                const user = {
                    id: data.id,
                    username: data.username,
                    name: data.full_name,
                    profile_pic: data.hd_profile_pic_url_info?.url || data.profile_pic_url,
                    profile_pic_id: data.profile_pic_id,
                    is_private: data.is_private,
                    is_verified: data.is_verified,
                    // bio: data.biography || '',
                    // media_count: data.media_count || 0,
                    // following: data.following_count || 0,
                    // follower: data.follower_count || 0
                }
                console.log("Response Done + Cache Set")
                try {
                    await redisClient.setEx(
                        `user:${user.username}`,
                        86400,
                        JSON.stringify({ status: "ok", user })
                    );
                } catch (e) {
                    console.error("Redis error:", e.message);
                }
                res.status(200).json({ 'status': 'ok', 'user': user });

            }
            else {
                res.status(500).json({ 'status': 'fail', 'user': null });
            }

        })
        .catch(error => {
            if (error.response) {
                console.error(`statusCode: ${error.response.status}`);

                if (error.response.status === 403) {
                    res.status(403).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 401) {
                    res.status(401).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 404) {
                    res.status(404).json({ "status": "fail", "user": null });
                }
                else if (error.response.status === 429) {
                    console.log(error.response)
                    res.status(429).json({ "status": "fail", "user": null });
                }
                else {
                    res.status(500).json({ "status": "fail", "user": null });
                }
            }
        });
}


