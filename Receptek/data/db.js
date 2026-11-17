import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"receptek",
    port:3306,
    waitForConnections:true,
    connectionLimit:10,
    dateStrings:true
});

export default pool;