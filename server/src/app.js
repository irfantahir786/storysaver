import express from 'express'
import igUserRoutes from './routes/insta/user.js'
import sessions from './routes/insta/sessions.js'
import requestLogger from './configs/log.helper.js'


const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(requestLogger)

export default app




