export function randomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomBoolean() {
    return Boolean(randomInt(0, 1))
}

export function randomFloat(min: number = 0, max: number = 1) {
    return Math.random() * (max - min) + min
}

export function randomChoice(items: any[]) {
    return items[Math.floor(Math.random() * items.length)]
}

export const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[j]
        array[j] = array[i]
        array[i] = tmp
    }
    return array
}

export const randomString = (length = 16) => {
    return [...Array(length)]
        .map(() => Math.floor(Math.random() * 36).toString(36))
        .join('')
}