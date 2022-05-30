var vertShader = `
  attribute vec4 a_position;

  void main() {
    gl_Position = a_position;
  }
`

var fragShader = `
  precision mediump float;
  uniform vec4 u_color;

  void main() {
    gl_FragColor = u_color;
  }
`

function main() {
  var canvas = document.getElementById('c');
  var gl = canvas.getContext('webgl');
  
  var program = createProgram(gl, vertShader, fragShader);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  var attrLocPosition = gl.getAttribLocation(program, 'a_position');
  gl.vertexAttribPointer(attrLocPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrLocPosition);
  gl.useProgram(program);
  var unifLocColor = gl.getUniformLocation(program, 'u_color');
  gl.uniform4f(unifLocColor, 0.5, 0.5, 1 , 1);

  setupSlider(0, gl.canvas.height);
  setupSlider(1, gl.canvas.width);

  let translation = [0, 0];
  let rectangles = [];
  let count = 0;

  function drawScene() {
    setRectangle(gl, translation);
    gl.drawArrays(gl.TRIANGLES, 0, count);
  }

  function setupSlider(axis, max) {
    configureSlider(max, function(event) {
      let coord = parseInt(event.target.value);
      translation[axis] = coord/max*2 - 1;
      drawScene();
    });
  }

  function setRectangle(gl, tr) {
    let rectangle = [
      0   + tr[0], 0   + tr[1],
      0.1 + tr[0], 0   + tr[1],
      0.1 + tr[0], 0.1 + tr[1],
      0.1 + tr[0], 0.1 + tr[1],
      0   + tr[0], 0.1 + tr[1],
      0   + tr[0], 0   + tr[1],
    ]
    count += 6;
    rectangles = rectangles.concat(rectangle);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(rectangles),
      gl.STATIC_DRAW
    )
  }

  drawScene();
}



main();

console.log('geom2d.js loaded.');