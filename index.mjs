import puppeteer from 'puppeteer-core'
import fs from 'fs'

(async () => {
    const resultDir = './results'
    if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir)

    const config = JSON.parse(fs.readFileSync('./config.json'))

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: config.chrome
     });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })
    var result = []

    for (const signal of config.signals) {
        await page.goto(`https://www.mql5.com/en/signals/${signal}?source=Unknown`, { waitUntil: 'domcontentloaded'});
        await page.screenshot({ path: `${resultDir}/${signal}.png` });

        const title = await page.$eval('.s-plain-card__title .s-plain-card__title-wrapper', el => el.innerText)
        const author = await page.$eval('.s-plain-card__author a', el => el.innerText)
        const values = await page.$$eval(
            '#left-panel.sidebar > div.s-list-info:nth-of-type(2) .s-list-info__item .s-list-info__label + .s-list-info__value',
            items => items.map(item => item.textContent))
        var details = { signal, title, author }
        values.forEach((value, index) => {
            switch (index) {
                case 0:
                    details.growth = value
                    break;
                case 1:
                    details.profit = value
                    break;
                case 2:
                    details.equity = value
                    break;
                case 3:
                    details.balance = value
                    break;
                case 4:
                    details.initialDeposit = value
                    break;
                case 5:
                    details.withdrawals = value
                    break;
                case 6:
                    details.deposit = value
                    break;
                default:
                    break;
            }
        })
        result.push(details)
    }

    console.log(result)
    fs.writeFileSync(`${resultDir}/result.json`, JSON.stringify(result))
    await browser.close();
})();