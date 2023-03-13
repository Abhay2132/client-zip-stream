const CRC_TABLE = createCrcTable();

function createCrcTable() {
  const crcTable = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}

export default function crc32(buf, pre) {
	if(pre instanceof Uint8Array) {
		pre = new DataView(pre.buffer)
		pre = pre.getUint32(0);
	}
  let crc = ~~(pre||0) ^ (-1);
//  console.log(buf, pre)
  for (const byte of buf) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xFF];
  }

  return (crc ^ (-1)) >>> 0;
}