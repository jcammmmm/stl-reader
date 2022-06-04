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

var m3 = {
  translate: function(tx, ty) {
    return [
      1,  0,  0,
      0,  1,  0,
      tx, ty, 1,
    ]
  },
  rotation: function(sin, cos) {
    return [
      cos,    -sin,     0,
      sin,     cos,     0,
        0,       0,     1,
    ]
  },
  scale: function(sx, sy) {
    return [
      sx,  0,  0,
      0,  sy,  0,
      0,   0,  1,
    ]
  },
  identity: function() {
    return [
      1,  0,  0,
      0,  1,  0,
      0,  0,  1,
    ]
  },
  mult: function(A, B) {
    let a00 = A[0]; let a01 = A[1]; let a02 = A[2];
    let a10 = A[3]; let a11 = A[4]; let a12 = A[5];
    let a20 = A[6]; let a21 = A[7]; let a22 = A[8];

    let b00 = B[0]; let b01 = B[1]; let b02 = B[2];
    let b10 = B[3]; let b11 = B[4]; let b12 = B[5];
    let b20 = B[6]; let b21 = B[7]; let b22 = B[8];

    let M = [
      NaN, NaN, NaN,
      NaN, NaN, NaN,
      NaN, NaN, NaN,
    ]

    M[0] = a00*b00 + a01*b10 + a02*b20;
    M[1] = a00*b01 + a01*b11 + a02*b21;
    M[2] = a00*b02 + a01*b12 + a02*b22;
    M[3] = a10*b00 + a11*b10 + a12*b20;
    M[4] = a10*b01 + a11*b11 + a12*b21;
    M[5] = a10*b02 + a11*b12 + a12*b22;
    M[6] = a20*b00 + a21*b10 + a22*b20;
    M[7] = a20*b01 + a21*b11 + a22*b21;
    M[8] = a20*b02 + a21*b12 + a22*b22;

    return M;
  }
}

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
  
  let translation = [0, 0];
  let rotation = [0, 1];
  let scale = [0.8, 0.8];
  
  setupSliderTrans(0, gl.canvas.height);
  setupSliderTrans(1, gl.canvas.width);
  setupSliderRotat(1);
  setupSliderScale(0, 5);
  setupSliderScale(1, 5);
  
  let shape = buildF(0, 0, 0.05, 8);
  
  gl.uniform4f(unifLocColor, Math.random(), Math.random(), Math.random(), 1);
  set2dShape(gl, shape);
  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    let mat = m3.identity();
    for (let i = 0; i < 1; i++) {
      mat = m3.mult(mat, m3.translate(-.05500000000000005, -.21333333333333337))
      mat = m3.mult(mat, m3.rotation(rotation[0], rotation[1]));
      mat = m3.mult(mat, m3.translate(translation[0], translation[1]));
      mat = m3.mult(mat, m3.scale(scale[0], scale[1]));
      gl.uniformMatrix3fv(unifLocMatTrfm, false, mat);
      gl.drawArrays(gl.TRIANGLES, 0, shape.length/pointSize);
    }
  }

  function setupSliderScale(axis, max) {
    let pres = 1000;
    let label = document.createElement('label');
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
      translation[axis] = coord/max*2 - 1;
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
      label.innerHTML = rad;
      drawScene();
    })
    div.appendChild(label);
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