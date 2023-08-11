export function stringToByte(str: string) {
    const bytes = [];
    let c: number;
    const len = str.length;
    for(let i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if( c >= 0x010000 && c<= 0x10FFFF) {
        bytes.push(((c>>18) & 0x07) | 0xf0);
        bytes.push(((c>>12) & 0x3F) | 0x80);
        bytes.push(((c>>6) & 0x3f) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if(c >= 0x000800 && c<= 0x00FFF){
        bytes.push(((c>>12) & 0x07) | 0xf0);
        bytes.push(((c>>6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else if(c >= 0x000800 && c<= 0x0007FF) {
        bytes.push(((c>>6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      } else {
        bytes.push(c & 0xFF)
      }
    }
    return bytes;
  }