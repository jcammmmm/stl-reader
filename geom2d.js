var vertShader = `
  attribute vec2    a_position;
  uniform   vec2    u_translation;
  uniform   vec2    u_rotation;
  uniform   vec2    u_scale;

  uniform   mat3    m_trans;
  uniform   mat3    m_rotat;

  void main2() {
    vec2 rot_position = vec2(a_position.x*u_rotation.y - a_position.y*u_rotation.x,
                             a_position.x*u_rotation.x + a_position.y*u_rotation.y);
    vec2 scaled_position = rot_position*u_scale;
    gl_Position = vec4(scaled_position + u_translation, 0, 1);
  }

  void main() {
    gl_Position = vec4(m_trans*m_rotat*vec3(a_position, 1), 1);
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
  identity: function() {
    return [
      1,  0,  0,
      0,  1,  0,
      0,  0,  1,
    ]
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
  var unifLocTrans = gl.getUniformLocation(program, 'u_translation');   // UNUSED
  var unifLocRotat = gl.getUniformLocation(program, 'u_rotation');      // UNUSED
  var unifLocScale = gl.getUniformLocation(program, 'u_scale');         // UNUSED

  var unifLocMatTrans = gl.getUniformLocation(program, 'm_trans');
  var unifLocMatRotat = gl.getUniformLocation(program, 'm_rotat');
  
  setupSliderTrans(0, gl.canvas.height);
  setupSliderTrans(1, gl.canvas.width);
  setupSliderRotat(1);
  // setupSliderScale(0, 5);
  // setupSliderScale(1, 5);
  
  let translation = [0, 0];
  let rotation = [0, 1];
  let scale = [1, 1];
  
  let shape = buildF(0, 0, 0.05, 8);
  set2dShape(gl, shape);

  function drawScene() {
    gl.uniform4f(unifLocColor, 0.5, 0.5, 1 , 1);
    gl.uniform2f(unifLocTrans, translation[0], translation[1]);       // UNUSED
    gl.uniform2f(unifLocRotat, rotation[0], rotation[1]);             // UNUSED
    gl.uniform2f(unifLocScale, scale[0], scale[1]);                   // UNUSED

    gl.uniformMatrix3fv(unifLocMatTrans, false, m3.translate(translation[0], translation[1]));
    gl.uniformMatrix3fv(unifLocMatRotat, false, m3.rotation(rotation[0], rotation[1]));

    gl.drawArrays(gl.TRIANGLES, 0, shape.length/pointSize);
  }

  function setupSliderScale(axis, max) {
    let pres = 1000;
    configureSlider(max*pres, function(event) {
      let factor = parseInt(event.target.value);
      scale[axis] = 2*factor/pres - max;
      drawScene();
    })
  }

  function setupSliderTrans(axis, max) {
    configureSlider(max, function(event) {
      let coord = parseInt(event.target.value);
      translation[axis] = coord/max*2 - 1;
      drawScene();
    });
  }

  function setupSliderRotat(turns) {
    let precision = 1000;
    configureSlider(2*turns*Math.PI*precision, function(event) {
      let rad = parseInt(event.target.value);
      // TODO: The rotation also is scaling the object
      rotation = [Math.sin(rad/precision), Math.cos(rad/precision)];
      drawScene();
    })
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