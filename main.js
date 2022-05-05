const fs = require("fs/promises");

const filepath = "/Users/juan.florez/Downloads/cube.stl";

// file structure in http://www.fabbers.com/tech/STL_Format


async function openStlFile() {
  const filehandle = await fs.open(filepath);
  // read header
  var buffer = Buffer.alloc(80);
  var data = await filehandle.read(buffer, 0, 80, null);
  console.log(buffer.toString('ascii'))
  // number of facets
  buffer = Buffer.alloc(4);
  data = await filehandle.read(buffer, 0, 4, null);
  console.log(buffer.readInt32LE(0))
  // triangular facet
  buffer = Buffer.alloc(50);
  data = await filehandle.read(buffer, 0, 50, null);
  printBufferAsFacet(data.buffer);
}

function printBufferAsFacet(buffer) {
  // 48bytes = 4 groups of 12bytes
  var facet = [];
  for(var i = 0; i < 4; i++) {
    var coord = []
    // 12bytes = 3 little endian 4byte floats
    for(var j = 0; j < 3; j++)
      coord.push(buffer.readFloatLE(12*i + 4*j));
    facet.push(coord);
  }
  // 2bytes  = attribute count
  // pass
  console.log(facet);
  return facet;
}

/**
 * DEPRECATED in favor of https://nodejs.org/api/buffer.html#buftostringencoding-start-end
 * @param {Buffer} buffer 
 */
function printBufferAsString(buffer) {
  str = '';
  for(const b of buffer.entries())
    str += String.fromCharCode(b[1]);
  console.log(str);
}

/**
 * DEPRECATED in favor of https://nodejs.org/api/buffer.html#bufreadint32leoffset
 * @param {Buffer} buffer 
 * @returns 
 */
function printBufferAsInteger(buffer) {
  // numbers are little endian
  // https://www.loc.gov/preservation/digital/formats/fdd/fdd000505.shtml
  var int = [];
  for(const b of buffer.entries())
    int.push(b[1])
  var n = Number(int.reverse().join(''))
  console.log(n);
  return n
}

openStlFile();