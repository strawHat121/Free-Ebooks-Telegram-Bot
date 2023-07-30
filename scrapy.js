const puppeteer = require("puppeteer")
const fs = require('fs');

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
        const ulElements = section.querySelectorAll('ul');
        const associations = [];

        ulElements.forEach((ul, index) => {
            let heading = ul.previousElementSibling;
            while (heading && !['H3', 'H4'].includes(heading.tagName)) {
                heading = heading.previousElementSibling;
            }

            if (heading) {
                const listItems = Array.from(ul.querySelectorAll('li')).map(li => {
                    const anchor = li.querySelector('a');
                    return {
                        href: anchor ? anchor.getAttribute('href') : null,
                        text: anchor ? anchor.innerText.trim() : li.innerText.trim(),
                    };
                });

                associations.push({
                    headingText: heading.innerText.trim(),
                    ulIndex: index,
                    listItems,
                });
            }

        });

        return associations;

    });
    console.log(links); // Output the extracted associations (optional).

    await browser.close()

    return links

}

// scrapy()

module.exports = scrapy