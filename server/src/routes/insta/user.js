import { Router } from 'express'
import axios from 'axios'
import { fetchUserById, fetchUserByUsername, getUser, searchUser } from '../../controllers/insta/userController.js'
import { fetchHighlightDetails, fetchHighlights } from '../../controllers/insta/highlightsController.js'
import { fetchUserStories } from '../../controllers/insta/story.controller.js'
import apiMiddleware from '../../middlewares/api.js'
const router = Router()

// User Routes
router.get('/user/:userId', apiMiddleware, fetchUserById)
router.get('/baseDP/:username', apiMiddleware, getUser)
router.get('/userByUsername/:username', apiMiddleware,fetchUserByUsername)
router.get('/searchUser/:username',apiMiddleware ,searchUser)


// Stories Routes
router.get('/stories/:userId', apiMiddleware, fetchUserStories)
router.get('/highlights/:userId', apiMiddleware, fetchHighlights)
router.get('/highlight/:highlightId', apiMiddleware, fetchHighlightDetails)

export default router