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

  enqueueFacets(chunk) {
    let interfacet = new Uint8Array(50);
    let otherhalf = chunk.slice(this.pos, this.pos + interfacet.length - this.halfchunk.length);
    for(let i = 0; i < this.halfchunk.length; i++)
      interfacet[i] = this.halfchunk[i];
    for(let i = this.halfchunk.length, j = 0; i < interfacet.length; i++, j++)
      interfacet[i] = otherhalf[j];
    this.ctlr.enqueue(interfacet);
    this.pos += otherhalf.length;

    let rem = (chunk.byteLength - this.pos)%50;
    this.ctlr.enqueue(chunk.slice(this.pos, chunk.byteLength - rem));
    this.pos = 0;
    this.halfchunk = chunk.slice(chunk.length - rem, chunk.length);
  }

  // TODO: discover the bug
  /**
   * Each chunk passed her has a random lenght, since this unpacker is 
   * piped previusly by a ReadableStream that streams data from  a network 
   * resource.
   * [1] if slice is out of bounds, takes 
   * @param {ArrayBuffer} chunk 
   */
  enqueueFacets5(chunk) {
    // concat the interchunk splitted facet
    let facet = new Uint8Array(50);
    let half1 = this.halfchunk;
    let half2 = chunk.slice(this.pos, this.pos + facet.length - half1.length);
    for(let i = 0; i < half1.length; i++)
      facet[i] = half1[i];
    for(let i = half1.length, j = 0; i < half2.length; i++, j++)
      facet[i] = half2[j];
    this.pos += half2.length;
    this.ctlr.enqueue(facet);
    // enqueue remainding facets
    let rmdr = (chunk.length - this.pos)%50;
    this.ctlr.enqueue(chunk.slice(this.pos, chunk.length - rmdr));
    this.halfchunk = chunk.slice(chunk.length - rmdr, chunk.length);
    this.pos = 0;

    console.log(this.currLenght*100/this.streamLenght);
    if ((this.currLenght += chunk.byteLength) == this.streamLenght)
      controller.close();
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
    this.precision = Math.round(facetCount/100);
    this.currCount = 0;
    console.log('%c' + facetCount + ' triangles.', 'color: cyan');
  }

  transform(chunk, controller) {
    controller.enqueue(this.parseFacet(chunk));
  }

  parseFacet(facetData) {
    let dots = [];
    for(let k = 0; k < facetData.length/50; k++) {
      // 48bytes = 4 groups of 12bytes = 3x3D points + 1 3D normal
      let pos = 50*k + 12;  // 1x3D point (normal vector)
      for(var i = 1; i < 4; i++)      // 3x3D points (triangle vectors)
        // 12bytes = 3 little endian 4byte floats = 1 3D point
        for(var j = 0; j < 3; j++) {
          dots.push(new DataView(facetData.buffer.slice(pos, pos + 4)).getFloat32(0, true));
          pos += 4;
        }
      // 2bytes  = attribute count
      pos += 2;
      // pass
    }
    return dots;
  }
}

class TriangleDataSink {
  constructor(facetCount) {
    this.facetCount = facetCount;
    this.currCount = 0;

    this.shapeData = new Array(facetCount*9);
    this.colorData = new Array(facetCount*9);
    console.log('%c'+ 2*this.shapeData.length/1_000_000 + ' megabytes allocated.', 'color: cyan');
  }

  write(triangleData) {
    for(let i = 0; i < triangleData.length; i++) {
      this.shapeData[this.currCount++] = triangleData[i];
      this.colorData[this.currCount] = (Math.sin(triangleData[i]) + 1)/2;
    }
    if(this.currCount/9 == this.facetCount)
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