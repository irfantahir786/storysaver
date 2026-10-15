import Setting from "../models/settings.js";

const APP = {
    WEB: 0,
    MOBILE: 1,
};

// GET /settings?app=0  OR  /settings (grouped)
export const getAllSettings = async (req, res) => {
    console.log("Setting API hit")
    try {
        const settings = await Setting.findAll();

        const result = {
            web: {},
            app: {},
        };

        settings.forEach((s) => {
            if (s.app == 1) {
                result.app[s.key] = {
                    value: s.value,
                    notes: s.notes,
                };
            } else {
                result.web[s.key] = {
                    value: s.value,
                    notes: s.notes,
                };
            }
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch settings",
            error: err.message,
        });
    }
};
// GET /settings/:key?app=0
export const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const appType = Number(req.query.app ?? APP.WEB);

        const setting = await Setting.findOne({
            where: { key, app: appType },
        });

        if (!setting) {
            return res.status(404).json({ message: "Setting not found" });
        }

        res.json({
            key: setting.key,
            value: setting.value,
            app: setting.app,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching setting", error: err.message });
    }
};

// POST /settings  (create or update)
export const upsertSetting = async (req, res) => {
    try {
        const key = req.params.key;
        const { value, notes, app } = req.body;

        if (!key) {
            return res.status(400).json({ message: "Key is required" });
        }

        const appType = Number(app ?? APP.WEB);

        const [setting, created] = await Setting.findOrCreate({
            where: { key, app: appType },
            defaults: { value, notes },
        });

        if (!created) {
            setting.value = value;
            if (notes !== undefined) setting.notes = notes;
            await setting.save();
        }

        res.json({
            message: created ? "Created" : "Updated",
            data: {
                key,
                value,
                notes,
                app: appType,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Error saving setting", error: err.message });
    }
};

// GET /settings/admin (includes notes)


// Create a setting with notes

export const createSettingWithNotes = async (req, res) => {
    console.log("Create Setting with Notes called with body:", req.body);
    try {
        const { key, value, notes, app } = req.body;

        if (!key) {
            return res.status(400).json({ message: "Key is required" });
        }

        const appType = Number(app ?? APP.WEB);

        const setting = await Setting.create({
            key,
            value,
            notes,
            app: appType,
        });

        res.json({
            message: "Setting created",
            data: {
                key: setting.key,
                value: setting.value,
                notes: setting.notes,
                app: setting.app,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating setting", error: err.message });
    }
};

export const deleteSettings = async (req, res) => {
    try {
        const { key } = req.params;
        const appType = Number(req.query.app ?? APP.WEB);

        const deletedCount = await Setting.destroy({
            where: { key, app: appType },
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Setting not found" });
        }

        res.json({ message: "Setting deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting setting", error: err.message });
    }
};                                              