
require('dotenv').config()

const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function getChats() {
    const [rows] = await pool.query("SELECT * FROM chats")
    return rows
}

async function getChat(chat_id) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM chats
    WHERE chat_id = ?
    `, [chat_id])
    return rows[0]
}

async function createChat(chat_id, question, answer, time) {
    const [result] = await pool.query(`
    INSERT INTO chats (chat_id, question, answer, time)
    VALUES (?, ?, ?, ?)
    `, [chat_id, question, answer, time])
    const id = result.insertId
    return getChat(id)
}

module.exports = { getChats, getChat, createChat };