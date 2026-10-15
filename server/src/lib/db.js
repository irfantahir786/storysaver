import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'
dotenv.config()

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        dialect: 'mysql',
        logging: false, // turn on if you want SQL logs
    }
)

console.log("ENV", process.env.DATABASE_NAME,)

export default sequelize