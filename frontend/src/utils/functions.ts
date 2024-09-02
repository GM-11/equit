export function hexBytesToString(hex: string) {
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
  
    let decodedString = '';
    for (let i = 0; i < hex.length; i += 2) {
        decodedString += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
  
    return decodedString;
  }
  