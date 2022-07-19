function driver(shapename) {
  fetch("./stl/" + shapename + ".stl")
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
}

function controller(url) {
  let urlsplit = url.split('?');
  let shapename = 'barz';
  if (urlsplit.length == 2) {
    let kvsplit = urlsplit[1].split('=');
    if (kvsplit.length == 2)
      for(let i = 0; i < EXAMPLES_AVA.length; i++)
        if (kvsplit[1] == EXAMPLES_AVA[i])
          shapename = kvsplit[1];
  }
  driver(shapename);
}

configureKeyboardController(CANVAS);
addDemoSelector(driver);
controller(window.location.href);

console.log('driver.js loaded.');