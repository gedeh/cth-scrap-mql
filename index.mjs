import puppeteer from 'puppeteer-core'
import { stringify } from 'csv-stringify'
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
        await page.goto(`https://www.mql5.com/en/signals/${signal}?source=Unknown`, { waitUntil: 'domcontentloaded'});
        await page.screenshot({ path: `${resultDir}/${signal}.png` });

        const title = await page.$eval('.s-plain-card__title .s-plain-card__title-wrapper', title => title.textContent.trim())
        const author = await page.$eval('.s-plain-card__author a', author => author.textContent.trim())
        const infoValues = await page.$$eval(
            '#left-panel.sidebar > div.s-list-info:nth-of-type(2) .s-list-info__item .s-list-info__label + .s-list-info__value',
            items => items.map(item => item.textContent.trim()))

        var details = { signal, title, author }
        infoValues.forEach((info, index) => {
            switch (index) {
                case 0:
                    details.growth = info
                    break;
                case 1:
                    details.profit = info
                    break;
                case 2:
                    details.equity = info
                    break;
                case 3:
                    details.balance = info
                    break;
                case 4:
                    details["initial-deposit"] = info
                    break;
                case 5:
                    details.withdrawals = info
                    break;
                case 6:
                    details.deposit = info
                    break;
                default:
                    break;
            }
        })

        const riskValues = await page.$$eval(
            'div#tab_content_risks div#risksTradeDataColumns div.header + div.s-data-columns__item + div.s-data-columns__item div.s-data-columns__value',
            items => items.map(item => item.textContent.trim()))
        riskValues.forEach((risk, index) => {
            switch (index) {
                case 0:
                    details['drawdown-max-balance'] = risk
                    break;
                case 1:
                    details['drawdown-max-equity'] = risk
                    break;
                default:
                    break;
            }
        })

        const statsValues = await page.$$eval(
            'div#tab_content_stats div#tradeDataColumns div.s-data-columns > div.s-data-columns__column:first-child div.s-data-columns__item div.s-data-columns__value',
            items => items.map(item => item.textContent.trim()))
            statsValues.forEach((stat, index) => {
            switch (index) {
                case 1:
                    details['profit-trades'] = stat
                    break;
                case 2:
                    details['loss-trades'] = stat
                    break;
                default:
                    break;
            }
        })

        result.push(details)
    }

    stringify(result, { header: true, quoted_string: true }, (error, data) => {
        if (error) {
            const diagnostic = `Error conversting result into CSV file: ${error}`
            throw new Error(diagnostic, error)
        }
        fs.writeFileSync(`${resultDir}/result.csv`, data)
    })

    fs.writeFileSync(`${resultDir}/result.json`, JSON.stringify(result))
    await browser.close();
})().catch(exception => console.error(exception));