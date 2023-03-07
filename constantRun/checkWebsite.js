const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const bot = require('../src/botMain');



async function checkWebsite(originLink, findLink, game) {
    const logChannel = await bot.channels.fetch("1029817668083130459")
    let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(new chrome.Options().headless())
        .build();


    try {
        await driver.get(originLink);
        let el = await driver.findElement(By.xpath("/html/body/script[2]")).then(el => el.getAttribute("innerHTML"))
        let e = el.match(findLink)
        console.log(e[0])

    } finally {
        console.log("no")
        await logChannel.send(`No longer logging ${game}`)
        await driver.quit();
    }
};

checkWebsite("https://www.skill-capped.com/wow/browse3/course/vtmsjp38f1/8kyt37v0dt", "https://lol-content-dumps.s3.amazonaws.com/courses_v2/wow/course_dump_[0-9]+.json")





/* 

asd */