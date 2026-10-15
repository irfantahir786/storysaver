import dotenv from 'dotenv';
dotenv.config();
export default function apiMiddleware(req, res, next) {

    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({
            error: "Unauthenticated",
        });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            error: "Invalid Credentials",
        });
    }
    console.log("Middleware Passed")
    next();

}                                   