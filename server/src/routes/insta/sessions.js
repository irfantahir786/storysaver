import { Router } from 'express'
import axios from 'axios'
import { allSessions, createSession, getActiveSession, updateStatus, updateSession, homeStats } from '../../controllers/insta/sessionsController.js'


const router = Router()

// User Routes
router.get('/home', homeStats)
router.get('/', allSessions)
// router.get('/:id', getSingleSession)
router.post('/', createSession)
router.put('/', updateSession)
router.get('/getActiveSession', getActiveSession)
router.post('/updateStatus', updateStatus)




export default router