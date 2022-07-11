var READING_LOG_BLOCK_SZ      = 2;
var FACET_BYTE_SZ             = 50;

class STLUnpacker {
  constructor(controller, streamLenght) {
    this.ctlr = controller;
    this.streamLenght = streamLenght;
    this.currLenght = 0;
    this.pos = 84;
    this.halfchunk = new Uint8Array(0);
  }

  /**
   * Each chunk passed her has a random lenght, since this unpacker is 
   * piped previusly by a ReadableStream that streams data from  a network 
   * resource.
   * [1] if slice is out of bounds, takes 
   * @param {ArrayBuffer} chunk 
   */
  enqueueFacets(chunk) {
    this.enqueuePartialFacet(chunk);
    let i = this.pos
    for(; i + 50 < chunk.byteLength; i += 50)
      this.ctlr.enqueue(chunk.slice(i, i + 50));
    this.halfchunk = chunk.slice(i, chunk.byteLength);
    this.pos = 0;
    
    if ((this.currLenght += chunk.byteLength) == this.streamLenght) {
      this.enqueuePartialFacet(new Uint8Array(0));
      controller.close();
    }
  }

  enqueuePartialFacet(chunk) {
    let facet = new Uint8Array(50);
    let half1 = this.halfchunk;
    let half2 = chunk.slice(this.pos, this.pos + facet.byteLength - half1.byteLength);
    if (half1.byteLength + half2.byteLength == facet.byteLength) {
      for(let i = 0; i < half1.byteLength; i++)
        facet[i] = half1[i];
      for(let i = half1.byteLength, j = 0; i < half2.byteLength; i++, j++)
        facet[i] = half2[j];
    }
    else
      throw Error('STL model file is corrupted. One facet has missing data.');
      
    this.ctlr.enqueue(facet);
    this.pos += half2.byteLength;
  }

  getHeader(enconding='binary', headerbuff) {
    if (enconding == 'binary') {
      for(let i in headerbuff) {
        if (headerbuff[i] == 0)
          headerbuff[i] = 32;
      }
      this.pos += 80;
      return txt = (new TextDecoder("UTF-8")).decode(headerbuff);
    } else 
      throw Error(enconding + ' is not a valid encoding.')
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
class STLTransformStream {
  constructor(streamLenght) {
    let unpkr;
    // We need to carry the controller to the unpacker context
    // in order to fill up the stream when the writer stream places
    // a new chunk.
    this.readable = new ReadableStream({
      start(controller) {
        unpkr = new STLUnpacker(controller, parseInt(streamLenght));
      }
    });

    /**
     * When this transform gets instanced, the write stream is called first.
     * (write) ->> [WritableStream] -->> (enqueue) ->> [ReadableStream]
     */
    this.writable = new WritableStream({
      write(uint8chunk) {
        unpkr.enqueueFacets(uint8chunk);
      }
    });
  }
}

class FacetTransformStream {
  constructor(facetCount) {
    this.facetCount = facetCount;
    this.precision = Math.round(facetCount/10);
    this.currCount = 0;
  }

  transform(chunk, controller) {
    controller.enqueue(this.parseFacet(chunk));
  }

  parseFacet(facetData) {
    // 48bytes = 4 groups of 12bytes = 3x3D points + 1 3D normal
    let dots = [];
    let pos = 12;  // 1x3D point (normal vector)
    for(var i = 1; i < 4; i++)      // 3x3D points (triangle vectors)
      // 12bytes = 3 little endian 4byte floats = 1 3D point
      for(var j = 0; j < 3; j++) {
        dots.push(new DataView(facetData.buffer.slice(pos, pos + 4)).getFloat32(0, true));
        pos += 4;
      }
    // 2bytes  = attribute count
    pos += 2;
    // pass
    if (++this.currCount%this.precision == this.precision - 1)
      console.log(++this.currCount/this.facetCount);
    return dots;
  }
}

class TriangleDataSink {
  constructor(facetCount) {
    this.facetCount = facetCount;
    this.currCount = 0;
    this.shapeData = new Array(0);
    this.colorData = new Array(0);
  }

  write(triangleData) {
    this.shapeData = this.shapeData.concat(triangleData);
    let r = Math.random(), g = Math.random(), b = Math.random();
    this.colorData = this.colorData.concat([
      r, g, b,
      r, g, b,
      r, g, b,
    ])
    if(++this.currCount == this.facetCount)
      this.close();
  }

  close() {
    render({
      geom: this.shapeData,
      color: this.colorData
    });
  }
}

console.log('parser.js loaded.');