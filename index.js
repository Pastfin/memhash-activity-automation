import fs from 'fs/promises';
import ExcelJS from 'exceljs';
import { connect } from 'puppeteer-real-browser';
import { completeActivity } from './utils/activity.js';
import { randomLongDelaySec } from './utils/helpers.js';
import { startMining } from './utils/mining.js';

async function readConfig() {
    const configData = await fs.readFile('config.json', 'utf8');
    return JSON.parse(configData);
}

function getRandomDelay(min, max) {
    return Math.random() * (max - min) + min;
}

async function startMiner(proxyOptions, link, userAgent, miningPeriodMinutes, maxRetries) {
    let browser;
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            console.log("Инициализация подключения к браузеру...");

            const connectOptions = {
                headless: false,
                args: [
                    '--window-size=1280,1024',
                    '--disable-web-security',
                    `--user-agent=${userAgent}`
                ],
                customConfig: {},
                turnstile: true,
                connectOption: {
                    defaultViewport: null
                },
                disableXvfb: false,
                ignoreAllFlags: false,
            };

            if (proxyOptions) {
                connectOptions.proxy = {
                    host: proxyOptions.host,
                    port: proxyOptions.port,
                    username: proxyOptions.username,
                    password: proxyOptions.password
                };
            }

            const { page, browser: launchedBrowser } = await connect(connectOptions);
            browser = launchedBrowser;
            console.log("Браузер запущен.");
            
            await page.goto(link);
            await new Promise(resolve => setTimeout(resolve, randomLongDelaySec()));
            
            await completeActivity(page);
            console.log(`Активность прожата, наверно.`);
            await new Promise(resolve => setTimeout(resolve, randomLongDelaySec()));

            await startMining(page);
            console.log(`Майнинг запущен на период: ${Math.round(miningPeriodMinutes, 2)} минут.`);
            await new Promise(resolve => setTimeout(resolve, miningPeriodMinutes * 60 * 1000));
            
            await browser.close();
            return;

        } catch (error) {
            console.error("Произошла ошибка:", error);
            if (browser) await browser.close();
            attempts++;
        }
    }

    if (attempts === maxRetries) {
        console.log(`Майнинг не удался после ${maxRetries} попыток.`);
        if (browser) await browser.close();
        return;
    }
}

async function main() {
    const config = await readConfig();
    const { shuffleProfiles, miningPeriodMinutes, delayBetweenProfilesMinutes } = config;

    const maxRetries = 5;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('accounts.xlsx');

    const worksheet = workbook.getWorksheet(1);
    let rows = worksheet.getRows(2, worksheet.rowCount - 1);

    if (shuffleProfiles) {
        rows = rows.sort(() => Math.random() - 0.5);
    }

    for (const row of rows) {
        const isSkip = row.getCell(3).value;
        if (isSkip)
            continue;

        const proxy = row.getCell(1).value;
        const appLink = row.getCell(2).value;
        const userAgent = row.getCell(4).value;

        let proxyOptions = null;

        if (proxy) {
            const [host, port, username, password] = proxy.replace(' ', '').split(':');
            proxyOptions = { host, port, username, password };
        }

        console.log(`Запуск аккаунта с прокси: ${proxy}`);
        await startMiner(
            proxyOptions, 
            appLink, 
            userAgent, 
            getRandomDelay(miningPeriodMinutes.min, miningPeriodMinutes.max), 
            maxRetries
        );

        const delayBetweenProfiles = getRandomDelay(delayBetweenProfilesMinutes.min, delayBetweenProfilesMinutes.max) * 60 * 1000;
        console.log(`Задержка перед следующим аккаунтом: ${delayBetweenProfiles / 1000} секунд.`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenProfiles));
    }
}

main();
