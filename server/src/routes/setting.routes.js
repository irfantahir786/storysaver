import express from "express";
import { createSettingWithNotes, getAllSettings, getSetting, upsertSetting, deleteSettings } from '../controllers/settings.js'


const router = express.Router();

router.get("/", getAllSettings);
router.get("/:key", getSetting);
router.post("/", createSettingWithNotes);
router.put("/:key", upsertSetting);
router.delete("/:key", deleteSettings);

export default router;