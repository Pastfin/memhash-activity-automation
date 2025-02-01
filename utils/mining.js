import { randomClickOffset, randomDelaySec } from './helpers.js';


async function switchToMiningPage(page){
    const baseX = randomClickOffset(107);
    const baseY = 850;
    await page.mouse.click(baseX, baseY);
    return;
}

async function clickStartMining(page){
    const baseX = randomClickOffset(550);
    const baseY = 385;
    await page.mouse.click(baseX, baseY);
    return;
}

async function startMining(page) {
    await switchToMiningPage(page);
    await new Promise(resolve => setTimeout(resolve, randomDelaySec()));
    await clickStartMining(page);
    return;
}

export { startMining }