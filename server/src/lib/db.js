import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'
dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

const sequelize = isProduction
    ? new Sequelize(
          process.env.DATABASE_NAME || 'storysaver',
          process.env.DATABASE_USER || 'storysaver',
          process.env.DATABASE_PASSWORD || 'Maven@1122',
          {
              host: process.env.DATABASE_HOST || 'localhost',
              port: Number(process.env.DATABASE_PORT) || 3306,
              dialect: 'mysql',
              logging: false, // turn on if you want SQL logs
          }
      )
    : new Sequelize(
          process.env.DEV_DATABASE_NAME || 'reels',
          process.env.DEV_DATABASE_USER || 'root',
          process.env.DEV_DATABASE_PASSWORD !== undefined
              ? process.env.DEV_DATABASE_PASSWORD
              : '',
          {
              host: process.env.DEV_DATABASE_HOST || 'localhost',
              port: Number(process.env.DEV_DATABASE_PORT) || 3306,
              dialect: 'mysql',
              logging: false, // turn on if you want SQL logs
          }
      )

console.log(
    `[DB] Connected to database: ${isProduction ? (process.env.DATABASE_NAME || 'storysaver') : (process.env.DEV_DATABASE_NAME || 'reels')} (${isProduction ? 'production' : 'development'})`
)

export default sequelize
