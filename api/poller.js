import pool from "./db.js";
import { sendToUser } from "./sse.js";

let lastId = 0;

export async function startPolling() {
    try {
        setInterval(async () => {
            const [rows] = await pool.query(
                `SELECT * 
                 FROM deviceDate
                 JOIN devices ON deviceDate.device = devices.id
                 WHERE deviceDate.deviceDataId > ? 
                 ORDER BY deviceDate.deviceDataId DESC 
                 LIMIT 1`,
                [lastId]
            );
            
            if (rows.length > 0) {
                const latest = rows[0];
                sendToUser(latest.userId, latest);
            }
        }, 15 * 60 * 1000);
    } catch (error) {
        console.error("Polling error:", error);
    }
}
