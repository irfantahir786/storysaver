import Session from '../models/sessions.js'


export async function logOutSession(sessionId) {
    try {
        const session = await Session.findOne({ where: { id: sessionId } })
        if (!session) {
            return false
        }
        session.status = 0
        await session.save()
        return true
    } catch (err) {
        console.error(err)
        return false
    }
}

export async function getActiveSession() {
    try {
        const session = await Session.findOne({
            where: { status: 1 },
            order: Session.sequelize.random()
        })
        if (!session) {
            return null
        }
        return session.dataValues

    } catch (err) {
        console.error(err)
        return null
    }
}