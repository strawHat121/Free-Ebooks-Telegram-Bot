const TelegramBot = require("node-telegram-bot-api")
require('dotenv').config()
const scrapy = require("./scrapy")

const token = process.env.BOT_KEY

const bot = new TelegramBot(token, { polling: true })

let menuTriggered = false

bot.onText(/\/start/, (msg) => {

    bot.sendMessage(msg.chat.id, "Welcome");

});

// bot.onText(/\/echo (.+)/, (msg, match) => {
//     // console.log(msg)
//     const chatId = msg.chat.id;
//     const resp = match[1]

//     bot.sendMessage(chatId, resp);
// });

bot.onText(/\/m/, async (msg) => {
    const languages = await scrapy()
    menuTriggered = true
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

bot.on('message', async (msg, match) => {
    const chatId = msg.chat.id;
    if (menuTriggered) {
        bot.sendMessage(chatId, msg.text)
        menuTriggered = false
    }
})