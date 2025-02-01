
export function randomClickOffset(coords) {
    const randomOffset = Math.floor(Math.random() * 21) - 5;
    const random = coords + randomOffset;
    return random;
}

export function randomDelaySec() {
    const randomDelay = Math.random() * (4000 - 2000) + 2000;
    return randomDelay;
}

export function randomLongDelaySec() {
    const randomDelay = Math.random() * (20000 - 15000) + 15000;
    return randomDelay;
}