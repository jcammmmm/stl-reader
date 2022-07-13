(function(shapename) {
  shapename = 'barz';
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
  // .then(async function(o) {
  //   let src = o.stream.getReader();
  //   console.log('%c' + o.fcount, 'color: cyan');
  //   let s = 0;
  //   while(true) {
  //     let ch = await src.read();
  //     s += ch.value.length/9;
  //     console.log(s)
  //     // console.log(s += ch.value.length);
  //     if (ch.done) {
  //       console.log('fin');
  //       break;
  //     }
  //   }
  // })

  
})();

console.log('driver.js loaded.');