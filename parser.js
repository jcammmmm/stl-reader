var READING_LOG_BLOCK_SZ      = 2;
var FACET_BYTE_SZ             = 50;

class STLReader {
  #BUFFER_BYTE_SZ = 10*FACET_BYTE_SZ;
  #buffers = [];
  #bufferssz = this.#buffers.length - 2;
  #iters = 0;

  /**
   * - [1] Each facet has 50 bytes of length, then we must split the vertex
   *   data in multiples of 50 bytes, e.g. 500 bytes.
   * @param {ArrayBuffer} buffer 
   */
  constructor(buffer) {
    // header data
    this.#buffers.push(buffer.slice(0, 80));
    // facet count
    this.#buffers.push(buffer.slice(80, 84));
    // vertex data [1]
    let j = 84;
    let hadNext = true;
    while(hadNext) {
      let i = j;
      j += this.#BUFFER_BYTE_SZ;
      if (j >= buffer.byteLength) {
        j = buffer.byteLength;
        hadNext = false;
      }
      this.#buffers.push(buffer.slice(i, j));
    }
  }

  static async build(shapename) {
    let response = await fetch("http://127.0.0.1:5500/stl/" + shapename + ".stl");
    let reader = response.body.getReader();
    console.log('file size: ' + (response.headers.get('content-length')) + ' bytes');
    // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader/read#return_value
    let data = await reader.read();
    return new STLReader(data.value.buffer);
  }

  getHeader(enconding='binary') {
    if (enconding == 'binary') {
      // first 80 bytes of binary STL are heading comments
      let str = new Uint8Array(this.#buffers[0]);
      for(let i in str) {
        if (str[i] == 0)
          str[i] = 32;
      }
      let txt = (new TextDecoder("UTF-8")).decode(str);
      return txt;
    } else {
      throw Error(enconding + ' is not a valid encoding.')
    }
  }

  getFacetCount() {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/slice
    return (new DataView(this.#buffers[1])).getInt32(0, true);
  }

  /**
   * The procesing is performed for each float and not by array chunks because
   * the procesing by chunks reads each float as big endian, and the STL file
   * provides this data as little endian floats.
   * @returns 3x3D points that represents a shape's triangle
   */
  getNextFacetChunk() {
    let buffer = this.#buffers.pop();
    // 48bytes = 4 groups of 12bytes = 3x3D points + 1 3D normal
    let dots = [];
    for (let k = 0; k < buffer.byteLength/50; k++) {
      let pos = k*50 + 12;     // 1x3D facet's normal vector
      for(var i = 1; i < 4; i++) {        // 3x3D points
        // 12bytes = 3 little endian 4byte floats = 1 3D point
        for(var j = 0; j < 3; j++) {
          // console.log(new DataView(this.#buffers[buffIdx].slice(pos, pos + 4)).getFloat32(0, true));
          dots.push(new DataView(buffer.slice(pos, pos + 4)).getFloat32(0, true));
          pos += 4;
        }
      }
      // 2bytes  = attribute count
      pos += 2;
      // pass
    }
    this.#iters++;
    return dots;
  }

  getLoadStatus() {
    return Math.round(this.#iters*100/this.#bufferssz) + '%';
  }

  hasNextFacetChunk() {
    return this.#iters != this.#bufferssz;
  }
}

// file structure in http://www.fabbers.com/tech/STL_Format
// TODO: read file by chunks of 10kb for RAM performance.
/**
 * @returns an object that holds the 3D vertex point array (ignoring the normal vectors)
 * of triangles and an array of colors that colorize each triangle with a random color.
 */
async function openStlFile(shapename) {
  let reader = await STLReader.build(shapename);  

  // read header
  const header = reader.getHeader();
  console.log(header);
  if (header.slice(0, 5) == 'solid')
    throw Error('Parsing ascii STL files is not supported. Please format this STL to a binary one.');

  // number of facets
  const facets = reader.getFacetCount();
  console.log('triangle count: ' + facets);

  // triangular facet
  let triangles = [];
  let colors = [];
  let missingTriangles = 0;
  console.log('%creading file ...', 'color: green');
  let blckCount = Math.round(facets/READING_LOG_BLOCK_SZ);
  while(reader.hasNextFacetChunk()) {
    // console.log('%c' + reader.getLoadStatus(), 'color: green');
    try {
      triangles = triangles.concat(reader.getNextFacetChunk());
    } catch (error) {
      console.log(triangles.length);
      break;
    }
  }
  for (let j = 0; j < triangles.length/3; j++) {
    let color = [Math.random(), Math.random(), Math.random()];
    colors    = colors.concat(color, color, color);
  }
  // for(var i = 0; i < 1; i++) {
  //   if (i%blckCount == blckCount - 1)
  //     console.log('%c' + Math.round(i*100/facets) + '% completed. ', 'color: green');
  //   try {
  //     triangles = triangles.concat(reader.getNextFacetChunk());
  //     triangles = triangles.concat(reader.getNextFacetChunk());
  //     for (let j = 0; j < triangles.length/3; j++) {
  //       let color = [Math.random(), Math.random(), Math.random()];
  //       colors    = colors.concat(color, color, color);
  //     }
  //   } catch(err) {
  //     missingTriangles++;
  //   }
  // }
  // missingTriangles == 0 ? NaN : console.log('%cmissed triangles: ' + missingTriangles, 'color: red');
  return {
    geom: triangles,
    color: colors
  };
}