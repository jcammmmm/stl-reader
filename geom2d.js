var vertShader = `
  attribute vec4 a_position;
  uniform vec2 u_translation;

  void main() {
    gl_Position = a_position + vec4(u_translation, 0, 0);
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
  var pointSize = 2;
  gl.vertexAttribPointer(attrLocPosition, pointSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrLocPosition);
  
  gl.useProgram(program);
  var unifLocColor = gl.getUniformLocation(program, 'u_color');
  var unifLocTrans = gl.getUniformLocation(program, 'u_translation')
  
  setupSlider(0, gl.canvas.height);
  setupSlider(1, gl.canvas.width);
  
  let translation = [0, 0];
  
  let shape = buildF(0, 0, 0.05, 8);
  set2dShape(gl, shape);

  function drawScene() {
    gl.uniform4f(unifLocColor, 0.5, 0.5, 1 , 1);
    gl.uniform2f(unifLocTrans, translation[0], translation[1]);
    gl.drawArrays(gl.TRIANGLES, 0, shape.length/pointSize);
  }

  function setupSlider(axis, max) {
    configureSlider(max, function(event) {
      let coord = parseInt(event.target.value);
      translation[axis] = coord/max*2 - 1;
      drawScene();
    });
  }

  function buildRectangle(x0, y0, width, height) {
    return [
      x0,          y0,
      x0 + width,  y0,
      x0 + width,  y0 + height,
      x0 + width,  y0 + height,
      x0        ,  y0 + height,
      x0        ,  y0,
    ]
  }

  function buildF(x0, y0, sz, fr) {
    let f = [];
    f = f.concat(buildRectangle(0,        0,      sz, sz*fr));
    f = f.concat(buildRectangle(sz,   sz*fr, sz*fr/3, -sz));
    f = f.concat(buildRectangle(sz, sz*fr/2, sz*fr/4, -sz));
    return f;
  }

  function set2dShape(gl, shape) {
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(shape),
      gl.STATIC_DRAW
    )
  }

  drawScene();
}



main();

print('geom2d.js loaded.');