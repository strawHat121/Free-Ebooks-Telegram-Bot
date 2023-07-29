const puppeteer = require("puppeteer")

const scrapy = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    const page = await browser.newPage();

    await page.setJavaScriptEnabled(true);


    await page.goto("https://github.com/EbookFoundation/free-programming-books/blob/main/books/free-programming-books-langs.md", {
        waitUntil: "domcontentloaded"
    })

    const links = await page.evaluate(() => {
        const section = document.querySelector('.entry-content')
        // const heading = section.querySelector('#by-programming-language').innerText
        const ul = section.querySelector('ul')
        const li = ul.querySelectorAll('li')
        return Array.from(li).map((item) => {
            const text = item.querySelector('a').innerText
            const href = item.querySelector('a').href
            return { text, href }
        })
    })

    await browser.close()

    return links


}

module.exports = scrapy