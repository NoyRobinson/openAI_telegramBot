require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const { getChats, getChat, createChat } = require('./database.js');

const {TOKEN, SERVER_URL, OPEN_AI_TOKEN} = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL+URI
const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

const headers = {
    'Authorization': `Bearer ${OPEN_AI_TOKEN}`,
    'Content-Type': 'application/json',
  };

const app = express()
app.use(bodyParser.json())

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data)
}

app.post(URI, async (req, res) => {
    console.log(req.body)

    const chatId = req.body.message.chat.id
    const text = req.body.message.text

    const openAiResponse = await axios.post(OPENAI_API, {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: 'user',
                content: text,
            }
        ]
    }, { headers })

    const response = openAiResponse.data.choices[0].message.content

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: response
    })

    return res.send()
})

app.get("/chats", async (req, res) => {
    const chats = await getChats()
    res.send(chats)
})

app.get("/chats/:id", async (req, res) => {
    const chat_id = req.params.id
    //req.body.message.chat.id
    const chat = await getChat(chat_id)
    res.send(chat)
})

app.post("/chats", async (req, res) => {
    const chat_id = req.body.message.chat.id
    console.log("chat id = " + chat_id)
    const question = req.body.message.text
    const answer = openAiResponse.data.choices[0].message.content
    const time = req.body.message.date
    const chat = await createChat(chat_id, question, answer, time)
    res.status(201).send(chat)
})

// app.use((err, req, res, next) => {
//     console.err(err.stack)
//     res.status(500).send('Something broke!')
// })

app.listen(process.env.PORT || 4040, async () => {
    console.log('app running on port', process.env.PORT || 4040)
    await init()
})