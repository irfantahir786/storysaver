import express from "express";
import {
    createAd,
    getAllAds,
    getActiveAds,
    getAdById,
    updateAd,
    deleteAd,
    trackClick,
} from "../controllers/ads.controller.js";

const adsRouter = express.Router();

// 🔒 Admin routes (protect these with API key middleware)
adsRouter.post("/", createAd);
adsRouter.get("/", getAllAds);
adsRouter.get("/:id", getAdById);
adsRouter.put("/:id", updateAd);
adsRouter.delete("/:id", deleteAd);

// 🌍 Public routes
adsRouter.get("/active/list", getActiveAds);
adsRouter.post("/click/:id", trackClick);

export default adsRouter;