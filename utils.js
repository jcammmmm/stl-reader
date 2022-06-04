function configureSlider(max, callback) {
  let div = document.createElement('div');
  let slider = document.createElement('input');
  slider.setAttribute('type', 'range');
  slider.setAttribute('value', max/2); // TODO: Fix. This does not put the slider to the middle.
  slider.setAttribute('min', 0);
  slider.setAttribute('max', max);
  slider.oninput = callback;
  div.appendChild(slider);
  document.body.append(div);
  return div;
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

function print(smth) {
  console.log(smth);
}

console.log('utils.js loaded.')