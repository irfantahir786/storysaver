import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, "requests.csv");

// create file with header if not exists
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(
        logFilePath,
        "time,method,url,status,ip,responseTime\n"
    );
}

// export function logIGRequest(req, res, next){
//     if (req.originalUrl )
    


// }

export default function requestLogger(req, res, next) {
    if (req.originalUrl === "/favicon.ico") return next();
     if (req.originalUrl === "/favicon.png") return next();
      if (req.originalUrl === "/") return next();
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;

        const time = new Date().toISOString();
        const method = req.method;
        const url = req.originalUrl.replace(/,/g, "");
        const status = res.statusCode;
        const ip =
            req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const responseTime = duration + "ms";

        const row = `${time},${method},${url},${status},${ip},${responseTime}\n`;

        fs.appendFile(logFilePath, row, (err) => {
            if (err) console.error("Log write failed:", err);
        });
    });

    next();
}