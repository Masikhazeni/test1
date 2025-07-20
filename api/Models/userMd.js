import pool from "../db";
class User{
    static async create({phoneNumber,email,password}){
        const [result]=await pool.execute(
            'INSERT INTO users(phoneNumber,email,password) VALUES(?,?,?)',
            [phoneNumber,email,password]
        )
        return result.insertId
    }
    static async findById(id){
        const [rows]=await pool.execute(
            'SELECT * FROM users WHERE id=?',
            [id]
        )
        return rows[0] || null
    }
    static async findByPhoneNumber(phoneNumber){
        const [rows]=await pool.execute(
            'SELECT * FROM users WHERE phoneNumber=?',
            [phoneNumber]
        )
        return rows[0] || null
    }
    static async findByEmail(phoneNumber){
        const [rows]=await pool.execute(
            'SELECT * FROM users WHERE email=?',
            [email]
        )
        return rows[0] || null
    }
    
}

export default User