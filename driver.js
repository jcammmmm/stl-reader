(function(shapename) {
  shapename = 'barz';
  fetch("http://127.0.0.1:5500/stl/" + shapename + ".stl")
  // fetch('https://mdn.github.io/dom-examples/streams/png-transform-stream/png-logo.png')
  .then(response => ({
    stream: response.body,
    length: response.headers.get('content-length')
  }))
  .then(model => model.stream.pipeThrough(new STLTransformStream(model.length)))
  .then(async function(data) {
    let reader = data.getReader();
    let i = 0;
    while(true) {
      let v = await reader.read();
      i++;
      console.log(i);
    }

  });
})();
console.log('driver.js loaded.');