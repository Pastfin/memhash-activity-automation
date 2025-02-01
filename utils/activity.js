import { randomClickOffset, randomDelaySec } from './helpers.js';


async function switchToActivityPage(page) {
    const baseX = randomClickOffset(515);
    const baseY = 840;
    await page.mouse.click(baseX, baseY);
    return;
}

async function clickOnActivity(page) {
    const baseX = randomClickOffset(280);
    const baseY = 63;
    await page.mouse.click(baseX, baseY);
    await new Promise(resolve => setTimeout(resolve, randomDelaySec()));
    const activityX = randomClickOffset(514);
    const activityY = 822;
    await page.mouse.click(activityX, activityY);
    return;
}

async function completeActivity(page) {
    await switchToActivityPage(page);
    await new Promise(resolve => setTimeout(resolve, randomDelaySec()));
    await clickOnActivity(page);
    return;
}

export { completeActivity }
