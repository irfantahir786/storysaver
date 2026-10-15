import { DataTypes } from "sequelize";
import sequelize from "../lib/db.js";

const Setting = sequelize.define(
    "Setting",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        app: {
            type: DataTypes.BOOLEAN, // cleaner than integer
            allowNull: false,
            defaultValue: false, // false = web, true = mobile
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "settings",
        timestamps: true,
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    }
);

export default Setting;