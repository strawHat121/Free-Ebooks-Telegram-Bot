const TelegramBot = require("node-telegram-bot-api")
require('dotenv').config()
const languages = require("./scrapeByLanguages")
const topics = require("./scrapeByTopics")
let secondMenu = false
const request = require('request');
const express = require('express');
const app = express();

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

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Replace 'YOUR_WELCOME_MESSAGE' with the message you want to send at the start of the chat
    const welcomeMessage = `Welcome to the free ebooks telegram bot. Please type /menu to acces the menu.`;

    bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/menu/, async (msg) => {

    bot.sendMessage(msg.chat.id, "Please select either Language or Topic", {
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
        bot.sendMessage(msg.chat.id, "Please select one of the programming languages from the list", {
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
        bot.sendMessage(msg.chat.id, "Please select one of the topics from the list", {
            "reply_markup": {
                "keyboard": buttons
            }
        })
        secondMenu = true
        menuTriggered = false
    }
    else if (secondMenu) {
        let inputFound = false
        for (let i = 0; i < allOptions.length; i++) {
            if (msg.text === allOptions[i].headingText) {
                inputFound = true
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
            }
        }
        if (!inputFound)
            bot.sendMessage(chatId, "This topic is not present. Please select a value from the menu")
        secondMenu = false
    }
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log(`Server is running at port ${PORT}`);
});