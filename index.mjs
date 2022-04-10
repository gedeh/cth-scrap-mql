import puppeteer from 'puppeteer-core'
import fs from 'fs'

(async () => {
    const resultDir = './results'
    if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir)
    if (!fs.existsSync('./config.json')) throw Error('File config.json is required')

    const config = JSON.parse(fs.readFileSync('./config.json'))
    console.log(`Using browser: ${config.chrome}`)

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: config.chrome
     });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })
    var result = []

    console.log('Processing signals')
    for (const signal of config.signals) {
        console.log(`- Signal ${signal}`)
        await page.goto(`https://www.mql5.com/en/signals/${signal}?source=Unknown`, { waitUntil: 'domcontentloaded'});
        await page.screenshot({ path: `${resultDir}/${signal}.png` });
        console.log(`  Screenshot captured as ${resultDir}/${signal}.png`)

        console.log('  Signal details:')
        const title = await page.$eval('.s-plain-card__title .s-plain-card__title-wrapper', title => title.textContent.trim())
        const author = await page.$eval('.s-plain-card__author a', author => author.textContent.trim())
        console.log(`    Title: ${title}`)
        console.log(`    Author: ${author}`)
        const values = await page.$$eval(
            '#left-panel.sidebar > div.s-list-info:nth-of-type(2) .s-list-info__item .s-list-info__label + .s-list-info__value',
            items => items.map(item => item.textContent.trim()))
        var details = { signal, title, author }
        values.forEach((value, index) => {
            switch (index) {
                case 0:
                    details.growth = value
                    console.log(`    Growth: ${value}`)
                    break;
                case 1:
                    details.profit = value
                    console.log(`    Profit: ${value}`)
                    break;
                case 2:
                    details.equity = value
                    console.log(`    Equity: ${value}`)
                    break;
                case 3:
                    details.balance = value
                    console.log(`    Balance: ${value}`)
                    break;
                case 4:
                    details.initialDeposit = value
                    console.log(`    Initial Deposit: ${value}`)
                    break;
                case 5:
                    details.withdrawals = value
                    console.log(`    Withdrawals: ${value}`)
                    break;
                case 6:
                    details.deposit = value
                    console.log(`    Deposit: ${value}`)
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
})().catch(exception => console.error(exception));