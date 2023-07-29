const TelegramBot = require("node-telegram-bot-api")
require('dotenv').config()
const scrapy = require("./scrapy")

const token = process.env.BOT_KEY

const bot = new TelegramBot(token, { polling: true })

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "Welcome");

});

bot.onText(/\/echo (.+)/, (msg, match) => {
    console.log(msg)
    const chatId = msg.chat.id;
    const resp = match[1]

    bot.sendMessage(chatId, resp);
});

bot.onText(/\/menu/, async (msg) => {
    const languages = await scrapy()
    console.log(languages)
    let buttons = []
    for (let i = 0; i < languages.length; i++) {
        buttons.push([languages[i].text])
    }
    bot.sendMessage(msg.chat.id, "Menu", {
        "reply_markup": {
            "keyboard": buttons
        }
    })
})

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Received your msg')
})