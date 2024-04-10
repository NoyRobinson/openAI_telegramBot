
require('dotenv').config()

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

async function getAnswersbyChatId(chat_id) {
    try{
      const [answers] = await pool.query(`
        SELECT * FROM telegramChats WHERE chat_id = ?`, 
        [chat_id]);
      return answers;
    } catch (error) {
        console.error("error executing query:", error);
    }
}

async function createChat(chat_id, question, answer) {
    try {
        const result = await pool.query(`
        INSERT INTO telegramChats (chat_id, question, answer)
        VALUES (?, ?, ?)`, 
        [chat_id, question, answer]);

        console.log("Inserted chat with id:", result[0].insertId);
        return result[0].insertId;
    } catch(error) {
        console.error("error executing query:", error);
    }
}

module.exports = { getAnswersbyChatId, createChat };