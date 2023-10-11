export function stringToByte(str: string) {
    const bytes = []
    let c: number
    const len = str.length
    for (let i = 0; i < len; i++) {
        c = str.charCodeAt(i)
        if (c >= 0x010000 && c <= 0x10ffff) {
            bytes.push(((c >> 18) & 0x07) | 0xf0)
            bytes.push(((c >> 12) & 0x3f) | 0x80)
            bytes.push(((c >> 6) & 0x3f) | 0x80)
            bytes.push((c & 0x3f) | 0x80)
        } else if (c >= 0x000800 && c <= 0x00fff) {
            bytes.push(((c >> 12) & 0x07) | 0xf0)
            bytes.push(((c >> 6) & 0x3f) | 0x80)
            bytes.push((c & 0x3f) | 0x80)
        } else if (c >= 0x000800 && c <= 0x0007ff) {
            bytes.push(((c >> 6) & 0x3f) | 0x80)
            bytes.push((c & 0x3f) | 0x80)
        } else {
            bytes.push(c & 0xff)
        }
    }
    return bytes
}

export function stringToUint8Array(str: string) {
    const arr = []
    for (let i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i))
    }

    const tmpUint8Array = new Uint8Array(arr)
    return tmpUint8Array
}

// Convert a hex string to a ASCII string
export function hexToString(hexStr: any) {
    const hex = hexStr.toString() //force conversion
    let str = ''
    for (let i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    return str
}

export function getValue(str: string, key: any) {
    const result = new RegExp(`(?:^|,)${key}:([^,]*)`).exec(str)
    return result && result[1]
}

export async function waitAsync(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
