import { DataTypes } from 'sequelize'
import sequelize from '../lib/db.js'

const Session = sequelize.define(
    'Session',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sessionid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        owner: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'logins',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

export default Session
