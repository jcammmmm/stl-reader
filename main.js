const fs = require("fs/promises");

const filepath = "/Users/juan.florez/Downloads/cube.stl";

// file structure in http://www.fabbers.com/tech/STL_Format
async function openStlFile() {
  const fileHandle = await fs.open(filepath);
  // read header
  const header = await readChunk(80, fileHandle, buffer => buffer.toString('ascii'));
  console.log(header);
  // number of facets
  const facets = await readChunk(4, fileHandle, buffer => buffer.readInt32LE(0));
  console.log(facets);
  // triangular facet
  for(var i = 0; i < facets; i++) {
    let facet = await readChunk(50, fileHandle, buffer => read50bitFacet(buffer));
    console.log(facet);
  }
}

/**
 * Allocates a buffer, reads a chunk of bytes size, then parses
 * this chunk with the provided parseCallback and return the 
 * parsing results.
 * @param {int} bytes 
 * @param {FileHandle} fileHandle 
 * @param {Function} parseCallback 
 * @returns a value after chunk casting
 */
function readChunk(bytes, fileHandle, parseCallback) {
  var buffer = Buffer.alloc(bytes);
  var chunk = fileHandle.read(buffer, 0, bytes, null);
  return chunk.then(value => parseCallback(value.buffer))
}

/**
 * 
 * @param {Buffer} buffer 
 * @returns 
 */
function read50bitFacet(buffer) {
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