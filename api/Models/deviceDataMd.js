import pool from "../db.js";
class DeviceData {
  static async creat({ deviceId, temperature, humidity,date }) {
    const [result] = await pool.execute(
      "INSERT INTO deviseDate (deviceId, temperature, humidity,date) VALUES (?,?,?.?)",
      [deviceId, temperature, humidity,date]
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
  static async findByUserId(userId) {
const [rows] = await pool.execute(
  "SELECT * FROM deviceDate INNER JOIN devices ON deviceDate.device = devices.id WHERE devices.userId = ?",
  [userId]
);
  }
}

export default DeviceData
