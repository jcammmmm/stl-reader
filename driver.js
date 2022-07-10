(function(shapename) {
  shapename = 'barz';
  fetch("http://127.0.0.1:5500/stl/" + shapename + ".stl")
  // fetch('https://mdn.github.io/dom-examples/streams/png-transform-stream/png-logo.png')
  .then(response => ({
    stream: response.body,
    length: response.headers.get('content-length')
  }))
  .then(model => model.stream.pipeThrough(new STLTransformStream(model.length)))
  .then(facets => facets.pipeThrough(new TransformStream(new FacetTransformStream())))
  .then(async function(triangles) {
    let reader = triangles.getReader();
    let val;
    let i = 0;
    do {
      val = await reader.read();
      console.log(val.value);
    } while(!val.done);
  })
})();
console.log('driver.js loaded.');