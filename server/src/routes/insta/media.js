import { Router } from 'express'
import axios from 'axios'
import { getMedia } from '../../controllers/insta/mediaController.js'
import apiMiddleware from '../../middlewares/api.js'

const mediaRouter = Router()

mediaRouter.get("/:mediaId", apiMiddleware, getMedia)

export default mediaRouter   