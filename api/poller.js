import pool from "./db.js";
import { broadcast } from "./sse.js";

let lastId = 0;

export async function startPolling() {
    try {
        setInterval(async () => {
            const [rows] = await pool.query(
                `SELECT dd.*, d.userId 
                 FROM deviceDate dd
                 JOIN devices d ON dd.device = d.id
                 WHERE dd.deviceDataId > ? 
                 ORDER BY dd.deviceDataId DESC 
                 LIMIT 1`,
                [lastId]
            );
            
            if (rows.length > 0) {
                const latest = rows[0];
                lastId = latest.deviceDataId;
                broadcast(latest.userId, latest);
            }
        }, 5000);
    } catch (error) {
        console.error("Polling error:", error);
    }
}
