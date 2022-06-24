var HTTP_FILE_TRANSFER_ENABLE = true;

if (HTTP_FILE_TRANSFER_ENABLE) {
  var FileHandle = class {
    constructor(data) {
      this.data = data;
      this.position = 0;
    }

    read(buffer, length) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/slice
      buffer.data = this.data.slice(this.position, this.position + length);
      this.position += length;
      return buffer;
    }
  }

  var BufferImpl = class {
    constructor(bytes) {
      this.data = new ArrayBuffer(bytes);
    };

    toString(enconding) {
      if (enconding == 'ascii') {
        let str = new Uint8Array(this.data);
        for(let i in str) {
          if (str[i] == 0)
            str[i] = 32;
        }
        return (new TextDecoder("UTF-8")).decode(str);
      } else {
        throw Error(enconding + ' is not a valid encoding.')
      }
    }

    readInt32LE(offset) {
      return (new DataView(this.data)).getInt32(offset, true);
    }

    readFloatLE(offset) {
      return (new DataView(this.data)).getFloat32(offset, true);
    }
  }

  var readChunk = function(bytes, fileHandle, parseCallback) {
    let buffer = new BufferImpl(bytes);
    return parseCallback(fileHandle.read(buffer, bytes));
  }
} else {
  var fs = require("fs/promises");
  /**
   * Allocates a buffer, reads a chunk of bytes size, then parses
   * this chunk with the provided parseCallback and return the 
   * parsing results.
   * @param {int} bytes 
   * @param {FileHandle} fileHandle 
   * @param {Function} parseCallback
   * @returns a value after chunk casting
   */
  var readChunk = function (bytes, fileHandle, parseCallback) {
    let buffer = Buffer.alloc(bytes);
    let chunk = fileHandle.read(buffer, 0, bytes, null);
    return chunk.then(value => parseCallback(value.buffer))
  }
}

// file structure in http://www.fabbers.com/tech/STL_Format
async function openStlFile() {
  let fileHandle;
  if (HTTP_FILE_TRANSFER_ENABLE) {
    response = await fetch("http://127.0.0.1:5500/stl/cube.stl");
    let reader = response.body.getReader();
    let data = await reader.read();
    fileHandle = new FileHandle(data.value.buffer);
  } 
  else {
    fileHandle = await fs.open("./stl/cube.stl");
  }
  // read header
  const header = await readChunk(80, fileHandle, buffer => buffer.toString('ascii'));
  console.log(header);
  // number of facets
  const facets = await readChunk(4, fileHandle, buffer => buffer.readInt32LE(0));
  console.log(facets);
  // triangular facet
  let triangles = [];
  for(var i = 0; i < facets; i++) {
    let facet = await readChunk(50, fileHandle, buffer => read50bitFacet(buffer));
    triangles.push(facet);
    console.log(facet);
  }
  return triangles;
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
 * @deprecated in favor of https://nodejs.org/api/buffer.html#buftostringencoding-start-end
 * @param {Buffer} buffer 
 */
function printBufferAsString(buffer) {
  str = '';
  for(const b of buffer.entries())
    str += String.fromCharCode(b[1]);
  console.log(str);
}

/**
 * @deprecated in favor of https://nodejs.org/api/buffer.html#bufreadint32leoffset
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
  return n;
}