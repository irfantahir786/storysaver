import { DataTypes } from 'sequelize'
import sequelize from '../lib/db.js'

const Ad = sequelize.define(
    'Ad',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        image_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        logo_url: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        click_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        ad_type: {
            type: DataTypes.ENUM(
                'banner',
                'interstitial',
                'native',
                'rewarded'
            ),
            allowNull: false,
            defaultValue: 'banner',
        },

        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },

        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        priority: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },

        clicks: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        is_mobile: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2,
            validate: {
                isIn: [[0, 1, 2]],
            },
            comment: '0 = web, 1 = mobile, 2 = both',
        },
    },
    {
        tableName: 'maven_ads',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

export default Ad