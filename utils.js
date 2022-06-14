function configureSlider(max, callback) {
  let div = document.createElement('div');
  let slider = document.createElement('input');
  slider.setAttribute('type', 'range');
  slider.setAttribute('value', 0); // TODO: Fix. This does not put the slider to the middle.
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
    throw 'No se pudo comilar el shader.\n[' + (type == 0x8B31 ? 'vertex' : 'fragment') + ' shader]\nDetalles:\n' + info;
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

function set2dShape(gl, shape) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(shape),
    gl.STATIC_DRAW
  )
}

function M4() {
  this.val = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  this.scale = function(sx, sy, sz) {
    this.val = this.mult([
      sx,  0,  0,   0,
       0, sy,  0,   0,
       0,  0, sz,   0, 
       0,  0,  0,   1
    ]);
  }

  this.translate = function(tx, ty, tz) {
    this.val = this.mult([
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0, 
     tx, ty, tz,  1,
    ]);
  }

  this.transform = function(rx, ry, rz) { // projection
    this.val = this.mult([
      2/rx,     0,     0,    0,
         0,  2/ry,     0,    0,
         0,     0,  1/rz,    0,
        -1,    -1,     0,    1,
    ]);
  }

  this.orthographic = function(right, left, top, bottom, near, far) {
    this.val = this.mult([
      2/(right - left), 0, 0, 0,
      0, 2/(top - bottom), 0, 0,
      0, 0, 2/(near - far), 0,
      
      (right + left)/-(right - left),
      (top + bottom)/-(top - bottom),
      (near + far)/(near - far),
      1
    ]);
  }

  this.rotatez = function(rad) {
    let c = Math.cos(rad);
    let s = Math.sin(rad);
    this.val = this.mult([
      c, -s,  0,  0,
      s,  c,  0,  0,
      0,  0,  1,  0,
      0,  0,  0,  1
    ]);
  }

  this.rotatey = function(rad) {
    let c = Math.cos(rad);
    let s = Math.sin(rad);
    this.val = this.mult([
      c,  0, -s,  0,
      0,  1,  0,  0,
      s,  0,  c,  0,
      0,  0,  0,  1
    ]);
  }

  this.rotatex = function(rad) {
    let c = Math.cos(rad);
    let s = Math.sin(rad);
    this.val = this.mult([
      1,  0,  0,  0,
      0,  c, -s,  0,
      0,  s,  c,  0,
      0,  0,  0,  1
    ]);
  }

  this.mult = function(B) {
    A = this.val;
    a00 = A[ 0]; a10 = A[ 1]; a20 = A[ 2]; a30 = A[ 3];
    a01 = A[ 4]; a11 = A[ 5]; a21 = A[ 6]; a31 = A[ 7];
    a02 = A[ 8]; a12 = A[ 9]; a22 = A[10]; a32 = A[11];
    a03 = A[12]; a13 = A[13]; a23 = A[14]; a33 = A[15];

    b00 = B[ 0]; b10 = B[ 1]; b20 = B[ 2]; b30 = B[ 3];
    b01 = B[ 4]; b11 = B[ 5]; b21 = B[ 6]; b31 = B[ 7];
    b02 = B[ 8]; b12 = B[ 9]; b22 = B[10]; b32 = B[11];
    b03 = B[12]; b13 = B[13]; b23 = B[14]; b33 = B[15];

    return [
      a00*b00+a10*b01+a20*b02+a30*b03,
      a00*b10+a10*b11+a20*b12+a30*b13,
      a00*b20+a10*b21+a20*b22+a30*b23,
      a00*b30+a10*b31+a20*b32+a30*b33,

      a01*b00+a11*b01+a21*b02+a31*b03,
      a01*b10+a11*b11+a21*b12+a31*b13,
      a01*b20+a11*b21+a21*b22+a31*b23,
      a01*b30+a11*b31+a21*b32+a31*b33,

      a02*b00+a12*b01+a22*b02+a32*b03,
      a02*b10+a12*b11+a22*b12+a32*b13,
      a02*b20+a12*b21+a22*b22+a32*b23,
      a02*b30+a12*b31+a22*b32+a32*b33,
      
      a03*b00+a13*b01+a23*b02+a33*b03,
      a03*b10+a13*b11+a23*b12+a33*b13,
      a03*b20+a13*b21+a23*b22+a33*b23,
      a03*b30+a13*b31+a23*b32+a33*b33,
    ];
  }
}

var m3 = {
  projection: function(resx, resy) {
    return [
      2/resx,      0,    0,
       0,     2/resy,    0,
      -1,         -1,    1
    ]
  },
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

    M[0] = a00*b00 + a01*b10 + a02*b20; M[3] = a10*b00 + a11*b10 + a12*b20; M[6] = a20*b00 + a21*b10 + a22*b20; 
    M[1] = a00*b01 + a01*b11 + a02*b21; M[4] = a10*b01 + a11*b11 + a12*b21; M[7] = a20*b01 + a21*b11 + a22*b21;
    M[2] = a00*b02 + a01*b12 + a02*b22; M[5] = a10*b02 + a11*b12 + a12*b22; M[8] = a20*b02 + a21*b12 + a22*b22;

    return M;
  }
}

function print(smth) {
  console.log(smth);
}

function printMat(matArr) {
  if (matArr.length == 9) {
    console.log(matArr.slice(0, 3));
    console.log(matArr.slice(3, 6));
    console.log(matArr.slice(6));
  } else if (matArr.length == 16) {
    console.log(matArr.slice(0, 4));
    console.log(matArr.slice(4, 8));
    console.log(matArr.slice(8, 12));
    console.log(matArr.slice(12));
  } else {
    throw Error('This is not a square matrix.');
  }
}

console.log('utils.js loaded.')