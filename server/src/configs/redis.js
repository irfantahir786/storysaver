import { createClient } from "redis";

const redisClient = createClient({
    socket: {
        host: "127.0.0.1",
        port: 6379,
    },
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

await redisClient.connect();

export default redisClient;