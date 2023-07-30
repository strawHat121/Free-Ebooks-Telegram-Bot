const TelegramBot = require("node-telegram-bot-api")
require('dotenv').config()
const scrapy = require("./scrapy")

const token = process.env.BOT_KEY

const bot = new TelegramBot(token, { polling: true })

let menuTriggered = false
let allOptions = []

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
    const data = await scrapy()
    menuTriggered = true
    let buttons = []
    allOptions = data;
    for (let i = 1; i < data.length; i++) {
        buttons.push([data[i].headingText])
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
        for (let i = 0; i < allOptions.length; i++) {
            if (msg.text === allOptions[i].headingText) {
                let message = `Here are the resources for ${msg.text}:\n`
                allOptions[i].listItems.forEach((link, index) => {
                    message += `${index + 1}. ${link.text} ${link.href}\n`
                });
                bot.sendMessage(chatId, message)
                // console.log(allOptions[i].listItems)
            }
        }
        menuTriggered = false
    }
})