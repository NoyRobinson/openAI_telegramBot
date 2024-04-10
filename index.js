require('dotenv').config()

const database = require('./database.js');

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const {TOKEN, SERVER_URL, OPEN_AI_TOKEN} = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL+URI;
const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

const headers = {
    'Authorization': `Bearer ${OPEN_AI_TOKEN}`,
    'Content-Type': 'application/json',
};

const app = express();
app.use(bodyParser.json());

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
};

app.post(URI, async (req, res) => {
    console.log(req.body);

    const chatId = req.body.message.chat.id;
    const question = req.body.message.text;

    const answer = await getAnswerFromOpenAI(question);

    database
        .createChat(chatId, question, answer)
        .then((insertedId) =>
            console.log("Successfully inserted conversation with ID:", insertedId))
        .catch((error) => console.error("Error in insertConversation:", error));
    
        console.log(`answer is: ${answer}`);

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: answer.replace(/"/g, "").replace(/\\n\\n/g, "\n"),
    });

    return res.send();
});

const getAnswerFromOpenAI = async (question) => {  
    const payload = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
    };
  
    try {
      const response = await axios.post(OPENAI_API, payload, { headers });
      if (response.status === 200 && response.data.choices.length > 0) {
        console.log("data is:" + JSON.stringify(response.data, null, 2));
        return JSON.stringify(response.data.choices[0].message.content, null, 2);
      } else {
        return "No response received from the model.";
      }
    } catch (error) {
      console.error("OpenAI API request failed:", error.message);
      return "API request failed.";
    }
  };

app.listen(process.env.PORT || 4040, async () => {
    console.log('app running on port', process.env.PORT || 4040);
    await init();
});