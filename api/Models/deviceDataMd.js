import pool from "../db.js";
import { sendToUser } from "../sse.js";
class DeviceData {
  static async creat({ device, temperature, humidity,date }) {
    const [result] = await pool.execute(
      "INSERT INTO deviceDate (device, temperature, humidity,date) VALUES (?,?,?,?)",
      [device, temperature, humidity,date]
    );
    return result.insertId;
  }

  static async findById(deviceDataId) {
    const [rows] = await pool.execute("SELECT * FROM deviceDate WHERE deviceDataId=?", [
      deviceDataId,
    ]);
    return rows[0];
  }
  
  static async findByDeviceId(deviceId) {
    const [rows] = await pool.execute(
      "SELECT * FROM deviceDate WHERE device = ? ORDER BY deviceDataId DESC",
      [deviceId]
    );
    return rows;
  }
  static async findLatestByDeviceId(deviceId) {
    const [rows] = await pool.execute(
     'SELECT * FROM deviceDate WHERE device = ? ORDER BY deviceDataId DESC LIMIT 1',
      [deviceId]
    );
    return rows[0];
  }
//   static async findByUserId(userId) {
// const [rows] = await pool.execute(
//   "SELECT * FROM deviceDate JOIN devices ON deviceDate.device = devices.id WHERE devices.userId = ?",
//   [userId]
// );
//   }

static async findByUserId(userId) {
 const [rows] = await pool.execute(
  `SELECT 
    deviceDate.deviceDataId,
    deviceDate.temperature,
    deviceDate.humidity,
    deviceDate.date,
    devices.deviceName
  FROM deviceDate 
  JOIN devices ON deviceDate.device = devices.id 
  WHERE devices.userId = ?
  ORDER BY deviceDate.date DESC
  LIMIT 1`,
  [userId]
);
  return rows;
}
}

export default DeviceData
