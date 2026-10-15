import dotenv from 'dotenv'
dotenv.config()
import Session from '../../models/sessions.js'

export async function homeStats(req, res) {
    try {
        const totalSessions = await Session.count()
        const activeSessions = await Session.count({ where: { status: 1 } })
        const inactiveSessions = totalSessions - activeSessions

        res.json({ totalSessions, activeSessions, inactiveSessions })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'DB error' })
    }
}

export async function getSingleSession(req, res) {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ error: "id is required" })
        }
        const session = await Session.findOne({
            where: { id }
        })
        if (!session) {
            return res.status(404).json({ error: "Session not found" })
        }
        res.json(session)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'DB error' })
    }
}

export async function updateSession(req, res) {
    try {
        console.log(req.body)
        const { id, sessionid } = req.body
        if (!id) {
            return res.status(400).json({ error: "id is required" })
        }
        console.log(id, sessionid)
        const session = await Session.findByPk(id)
        if (!session) {
            return res.status(404).json({ error: "Session not found" })
        }
        session.sessionid = sessionid || session.sessionid
        session.status = 1
        await session.save()
        res.json({ message: "Session updated successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'DB error' })
    }
}


export async function updateStatus(req, res) {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).json({ error: "id and status are required" })
        }
        const session = await Session.findByPk(id)
        if (!session) {
            return res.status(404).json({ error: "Session not found" })
        }
        session.status = !session.status
        await session.save()
        res.json({ message: "Session status updated successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'DB error' })
    }
}



export async function getActiveSession(req, res) {
    try {
        const session = await Session.findOne({
            where: { status: 1 },
            order: Session.sequelize.random()
        })
        if (!session) {
            return res.status(400).json({ error: "No active session found" })
        }
        res.json(session)

    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "error getting active session" })
    }
}

export async function allSessions(req, res) {
    try {
        const sessions = await Session.findAll()
        res.json({ data: sessions })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'DB error' })
    }
}

export async function createSession(req, res) {
    try {
        const { name, userid, sessionid, status, owner } = req.body
        const requiredFields = { name, userid, sessionid }
        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === null || value === undefined) {
                return res.status(400).json({ error: `${key} is required` })
            }
        }
        const existing = await Session.findOne({
            where: { userid }
        })

        if (existing) {
            return res.status(409).json({ status: "fail", message: "User already exists" })
        }
        const session = await Session.create({
            name, userid, sessionid, status: 1
        })
        if (!session || !session.id) {
            return res.status(500).json({ status: "fail", message: 'Session not created' })
        }

        return res.status(201).json({ status: "ok", message: 'Session created successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'DB error' })
    }
}