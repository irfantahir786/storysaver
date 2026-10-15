import { Op } from "sequelize";
import db from "../lib/db.js";
import Ad from "../models/ads.js";



export const createAd = async (req, res) => {
    try {
        let isMobile = Number(req.body.is_mobile);
        if (![0, 1, 2].includes(isMobile)) isMobile = 2;

        const ad = await Ad.create({
            ...req.body,
            is_mobile: isMobile,
        });

        return res.json({ success: true, data: ad });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Get All Ads (admin)
export const getAllAds = async (req, res) => {
    try {
        const ads = await Ad.findAll({
            order: [["priority", "DESC"]],
        });

        return res.json({ success: true, data: ads });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Get Active Ads (with device filter)
export const getActiveAds = async (req, res) => {
    try {
        const now = new Date();

        const isMobileDevice = /mobile/i.test(req.headers["user-agent"]);

        const ads = await Ad.findAll({
            where: {
                is_active: true,
                start_date: { [Op.lte]: now },
                [Op.or]: [
                    { end_date: null },
                    { end_date: { [Op.gte]: now } },
                ]

            },
            order: [["priority", "DESC"]],
        });

        return res.json({ success: true, data: ads });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Get Single Ad
export const getAdById = async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id);

        if (!ad) {
            return res.status(404).json({ success: false, message: "Ad not found" });
        }

        return res.json({ success: true, data: ad });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Update Ad
export const updateAd = async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id);

        if (!ad) {
            return res.status(404).json({ success: false, message: "Ad not found" });
        }

        let updateData = { ...req.body };

        if (req.body.is_mobile !== undefined) {
            let isMobile = Number(req.body.is_mobile);
            if (![0, 1, 2].includes(isMobile)) isMobile = 2;
            updateData.is_mobile = isMobile;
        }

        await ad.update(updateData);

        return res.json({ success: true, data: ad });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Delete Ad
export const deleteAd = async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id);

        if (!ad) {
            return res.status(404).json({ success: false, message: "Ad not found" });
        }

        await ad.destroy();

        return res.json({ success: true, message: "Ad deleted" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ Track Click
export const trackClick = async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id);

        if (!ad) {
            return res.status(404).json({ success: false, message: "Ad not found" });
        }

        await ad.increment("clicks");

        return res.json({
            success: true,
            click_url: ad.click_url,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};