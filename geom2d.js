var vertShader = `
  attribute vec2    a_position;
  uniform   mat3    m_trfm;

  void main() {
    gl_Position = vec4(m_trfm*vec3(a_position, 1), 1);
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
  var unifLocMatTrfm = gl.getUniformLocation(program, 'm_trfm');

  let sz = 20;
  let fr = 8;
  let shape = buildF(0, 0, sz, fr);
  let shapeCenter = [sz*(1 + fr)/6, sz*fr/2]
  
  let translation = [gl.canvas.width/2, gl.canvas.height/2];
  let rotation = [0, 1];
  let scale = [1, 1];
  
  setupSliderTrans(0, gl.canvas.width);
  setupSliderTrans(1, gl.canvas.height);
  setupSliderRotat(1);
  setupSliderScale(0, 5);
  setupSliderScale(1, 5);
  
  gl.uniform4f(unifLocColor, Math.random(), Math.random(), Math.random(), 1);
  set2dShape(gl, shape);
  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    let mat = m3.identity();
    for (let i = 0; i < 1; i++) {
      mat = m3.mult(mat, m3.translate(-shapeCenter[0], -shapeCenter[1]));
      mat = m3.mult(mat, m3.rotation(rotation[0], rotation[1]));
      mat = m3.mult(mat, m3.scale(scale[0], scale[1]));
      mat = m3.mult(mat, m3.translate(translation[0], translation[1]));
      mat = m3.mult(mat, m3.projection(gl.canvas.width, gl.canvas.height));
      gl.uniformMatrix3fv(unifLocMatTrfm, false, mat);
      gl.drawArrays(gl.TRIANGLES, 0, shape.length/pointSize);
    }
  }

  function setupSliderScale(axis, max) {
    let pres = 1000;
    let label = document.createElement('label'); // TODO: this code is duplicated in each slider ...
    label.innerHTML = scale[axis];
    let div = configureSlider(max*pres, function(event) {
      let factor = parseInt(event.target.value);
      scale[axis] = 2*factor/pres - max;
      label.innerHTML = scale[axis];
      drawScene();
    });
    div.appendChild(label);

  }

  function setupSliderTrans(axis, max) {
    let label = document.createElement('label');
    label.innerHTML = translation[axis];
    let div = configureSlider(max, function(event) {
      let coord = parseInt(event.target.value);
      translation[axis] = coord;
      label.innerHTML = translation[axis];
      drawScene();
    });
    div.appendChild(label);
  }

  function setupSliderRotat(turns) {
    let precision = 1000;
    let label = document.createElement('label');
    label.innerHTML = 0;
    let div = configureSlider(2*turns*Math.PI*precision, function(event) {
      let rad = parseInt(event.target.value);
      // TODO: The rotation also is scaling the object
      rotation = [Math.sin(rad/precision), Math.cos(rad/precision)];
      label.innerHTML = rad/precision;
      drawScene();
    })
    div.appendChild(label);
  }
  drawScene();
}

main();

print('geom2d.js loaded.');