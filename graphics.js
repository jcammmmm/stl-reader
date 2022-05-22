function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success)
    return shader;
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success)
    return program;
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  var canvas = document.querySelector("#c");

  var gl = canvas.getContext("webgl");
  if (!gl) {
    throw Error("Cannot load WebGL context.");
  }

  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionAttribLocation = gl.getAttribLocation(program, 'a_position');
  var colorAttribLocation = gl.getAttribLocation(program, 'a_color');

  var positionBuffer = gl.createBuffer();
  var colorBuffer = gl.createBuffer();

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);   
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer

 
  let mv = 0;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0 + mv, 0 + mv,
      100 + mv, 0 + mv,
      100 + mv, 70 + mv,
      100 + mv, 70 + mv,
      0 + mv, 70 + mv,
      0 + mv, 0 + mv,
    ]),
    gl.STATIC_DRAW
  )
  gl.vertexAttribPointer(positionAttribLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttribLocation);

  var r = Math.random();
  var g = Math.random();
  var b = Math.random();

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      r, g, b, 1,
      r, g, b, 1,
      r, g, b, 1,
      1 - r, 1 - g, 1 - b, 1,
      1 - r, 1 - g, 1 - b, 1,
      1 - r, 1 - g, 1 - b, 1,
    ]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(colorAttribLocation);
  gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 0);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Tell it to use our program (pair of shaders)

  gl.useProgram(program);
  var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // addSlider(gl, function () {
  //   drawBasicExample(gl, program, this.value);
  // });


  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
  // drawRandomSquares(gl, program);

}

function clearCanvas(gl) {
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function addSlider(gl, callback) {
  let slider = document.createElement('input');
  slider.setAttribute("type", "range");
  slider.setAttribute("value", gl.canvas.width / 2);
  slider.setAttribute("min", 0);
  slider.setAttribute("max", gl.canvas.width);
  slider.oninput = callback;
  document.body.append(slider);
}

function drawRandomSquares(gl, program) {
  var resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  var colorUniformLocation = gl.getUniformLocation(program, 'u_color');
  for (ii = 0; ii < 50; ii++) {
    var ow = Math.random() * gl.canvas.width;
    var oh = Math.random() * gl.canvas.height;
    var sw = Math.random() * (gl.canvas.width - ow);
    var sh = Math.random() * (gl.canvas.height - oh);
    var r = Math.random();
    var g = Math.random();
    var b = Math.random();
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform4f(colorUniformLocation, r, g, b, 1);
    // console.log(l1 + " - " + l2 + " .. " + r + " " + g + " " + b);
    var positions = [
      ow, oh,
      ow + sw, oh,
      ow + sw, oh + sh,
      ow + sw, oh + sh,
      ow, oh + sh,
      ow, oh
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

main();


