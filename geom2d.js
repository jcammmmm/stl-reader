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

  var pBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
  setRectangle(gl);

  var attrLocPosition = gl.getAttribLocation(program, 'a_position');
  gl.vertexAttribPointer(attrLocPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrLocPosition);

  var unifLocColor = gl.getUniformLocation(program, 'u_color');
  gl.uniform4f(unifLocColor, 0.5, 0.5, 0.5, 1);
  gl.useProgram(program)
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  
}

function createShader(gl, shaderSource, type) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    var info = gl.getShaderInfoLog(shader);
    throw 'No se pudo comilar el shader.\nDetalles:\n' + info;
  }
  return shader;
}

function createProgram(gl, vertShader, fragShader) {
  var vShader = createShader(gl, vertShader, gl.VERTEX_SHADER);
  var fShader = createShader(gl, fragShader, gl.FRAGMENT_SHADER);

  var program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(program);
    throw 'No se puede compilar el programa WebGL.\nDetalles:\n' + info;
  }
  return program;
}


function setRectangle(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.1, 0.1,
      0.8, 0.1,
      0.8, 0.7
    ]),
    gl.STATIC_DRAW
  )
}

main();