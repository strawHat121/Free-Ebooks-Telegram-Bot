const TelegramBot = require("node-telegram-bot-api")
require('dotenv').config()
const languages = require("./scrapeByLanguages")
const topics = require("./scrapeByTopics")
let secondMenu = false

const token = process.env.BOT_KEY
const MAX_MESSAGE_LENGTH = 4096;

const bot = new TelegramBot(token, { polling: true })

let menuTriggered = false
let allOptions = []

function splitMessage(message) {
    const chunks = [];
    let currentChunk = '';

    const words = message.split(' ');

    for (const word of words) {
        if (currentChunk.length + word.length + 1 <= MAX_MESSAGE_LENGTH) {
            currentChunk += word + ' ';
        } else {
            chunks.push(currentChunk.trim());
            currentChunk = word + ' ';
        }
    }

    if (currentChunk.trim() !== '') {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}


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

    bot.sendMessage(msg.chat.id, "Menu", {
        "reply_markup": {
            "keyboard": [["Programming Languages"], ["Topics"]]
        }
    })

    menuTriggered = true

})

bot.on('message', async (msg, match) => {
    const chatId = msg.chat.id;
    if (menuTriggered && msg.text === "Programming Languages") {
        const data = await languages()
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
        secondMenu = true
        menuTriggered = false
    }
    else if (menuTriggered && msg.text === "Topics") {
        const data = await topics()
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
        secondMenu = true
        menuTriggered = false
    }
    else if (secondMenu) {
        console.log("Test")
        console.log(msg.text)
        for (let i = 0; i < allOptions.length; i++) {

            if (msg.text === allOptions[i].headingText) {
                console.log("Hello worl")
                let message = `Here are the resources for ${msg.text}:\n\n`
                allOptions[i].listItems.forEach((link, index) => {
                    message += `${index + 1}. ${link.text} ${link.href}\n\n`
                });
                if (message.length > 4095) {
                    const messageChunks = splitMessage(message);
                    for (const chunk of messageChunks) {
                        bot.sendMessage(chatId, chunk);
                    }
                }
                else {
                    bot.sendMessage(chatId, message)
                }

                //console.log(allOptions[i].listItems)
            }
        }
        secondMenu = false
    }
})