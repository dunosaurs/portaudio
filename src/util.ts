const buffer = new ArrayBuffer(2);
new DataView(buffer).setInt16(0, 256, true);
export const endianess = new Int16Array(buffer)[0] === 256;
