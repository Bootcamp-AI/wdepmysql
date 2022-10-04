//const mysql = require('mysql2/promise');
import mysql from 'mysql2/promise';
import {
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT,
    DB_USER
} from './config.js'

export const createConnection =  async()=>{
    return await mysql.createConnection({ 
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    database: DB_NAME,
    port: DB_PORT,
    password: DB_PASSWORD
})
}


