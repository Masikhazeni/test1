import pool from "../db";

class Device{
    static async creat({userId,deviceName}){
        const[result]=await pool.execute(
            'INSERT INTO devices (userId,deviceName) VALUES (?,?)',[userId,deviceName]
        )
        return result.insertId
    }
    static async findById(id){
        const[rowes]=await pool.execute(
            'SELECT * FROM devices WHERE id=?',[id]
        )
        return rowes[0] ||null
    }
    static async findByUserId(userId){
        const[rowes]=await pool.execute(
            'SELECT * FROM devices WHERE userId=?',[userId]
        )
        return rowes[0] ||null
    }
    static async delete(id){
       await pool.execute(
            'DELET FROM devices WHERE id=?',[id]
        )
    }
}

export default Device