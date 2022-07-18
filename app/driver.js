(function(shapename) {
  shapename = 'teapot';
  fetch("http://127.0.0.1:5500/stl/" + shapename + ".stl")
  // fetch('https://mdn.github.io/dom-examples/streams/png-transform-stream/png-logo.png')
  .then(response => ({
    stream: response.body,
    length: response.headers.get('content-length')
  }))
  .then(model => ({
    stream: model.stream.pipeThrough(new STLTransformStream(model.length)),
    fcount: (model.length - 84)/50
  }))
  .then(facets => ({
    stream: facets.stream.pipeThrough(new TransformStream(new FacetTransformStream(facets.fcount))),
    fcount: facets.fcount
  }))
  .then(triangles => triangles.stream.pipeTo(new WritableStream(new TriangleDataSink(triangles.fcount))));  
})();

console.log('driver.js loaded.');