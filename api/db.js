import mysql from 'mysql2/promise'
const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'M.kh11775',
    database:'devise_data_db'
})

export default pool