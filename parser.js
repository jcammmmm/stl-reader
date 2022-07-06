var READING_LOG_BLOCK_SZ      = 2;

class STLReader {
  #buffer = null;
  #pos = 0;

  constructor(buffer) {
    this.#buffer = buffer;
    this.#pos = 0;
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
      let str = new Uint8Array(this.#buffer.slice(0, 80));
      for(let i in str) {
        if (str[i] == 0)
          str[i] = 32;
      }
      let txt = (new TextDecoder("UTF-8")).decode(str);
      this.#pos += 80;
      return txt;
    } else {
      throw Error(enconding + ' is not a valid encoding.')
    }
  }

  getFacetCount() {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/slice
    let int32LE = (new DataView(this.#buffer.slice(this.#pos, this.#pos + 4))).getInt32(0, true);
    this.#pos += 4;
    return int32LE;
  }

  /**
   * The procesing is performed for each float and not by array chunks because
   * the procesing by chunks reads each float as big endian, and the STL file
   * provides this data as little endian floats.
   * @returns 3x3D points that represents a shape's triangle
   */
  next50bitFacet() {
    // 48bytes = 4 groups of 12bytes = 3x3D points + 1 3D normal
    let facet = [];
    this.#pos += 12;             // 1x3D facet's normal vector
    for(var i = 1; i < 4; i++) { // 3x3D points
      // 12bytes = 3 little endian 4byte floats = 1 3D point
      for(var j = 0; j < 3; j++) {
        facet.push(new DataView(this.#buffer.slice(this.#pos, this.#pos + 4)).getFloat32(0, true));
        this.#pos += 4;
      }
    }
    // 2bytes  = attribute count
    this.#pos += 2;
    // pass
    return facet;
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
  console.log('%creading file ...', 'color: green')
  let blckCount = Math.round(facets/READING_LOG_BLOCK_SZ);
  for(var i = 0; i < facets; i++) {
    if (i%blckCount == blckCount - 1)
      console.log('%c' + Math.round(i*100/facets) + '% completed. ', 'color: green');
    try {
      triangles = triangles.concat(reader.next50bitFacet());
      let color = [Math.random(), Math.random(), Math.random()]
      colors    = colors.concat(color, color, color);
    } catch(err) {
      missingTriangles++;
    }
  }
  missingTriangles == 0 ? NaN : console.log('%cmissed triangles: ' + missingTriangles, 'color: red');
  return {
    geom: triangles,
    color: colors
  };
}