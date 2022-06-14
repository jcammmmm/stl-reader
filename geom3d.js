var vertShader = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  uniform   mat4 u_mat;
  varying   vec4 v_color;

  void main() {
    gl_Position = u_mat*a_position;
    v_color = a_color;
  }
`

var fragShader = `
  precision mediump float;
  varying   vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`
var POINT_SZ = 3;

function main() {
  let gl = document.getElementById('c').getContext('webgl');
  let program = createProgram(gl, vertShader, fragShader);

  let unifLocMatrix = gl.getUniformLocation(program, 'u_mat');

  gl.useProgram(program);
  setupSliderTr(0, gl.canvas.width);
  setupSliderTr(1, gl.canvas.height);
  setupSliderTr(2, gl.canvas.width);
  setupSliderRt(0, 1);
  setupSliderRt(1, 1);
  setupSliderRt(2, 1);

  let tr = [300, 200, 0];  // translation 
  let rt = [0.6, 0.9, 0];  // rotation
  
  // let shape = build3dTriangle(40);
  // let shape = buildF(0, 0, 20, 8);
  // let shape = buildOrto3dRectangle(0, 0, 0, 20, 40);
  let shape = buildOrto3dF(0, 0, 20, 8);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  let attrLocPosition = gl.getAttribLocation(program, 'a_position');
  set2dShape(gl, shape.geom);
  gl.vertexAttribPointer(attrLocPosition, POINT_SZ, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrLocPosition);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  let attrColorPosition = gl.getAttribLocation(program, 'a_color');
  set2dShape(gl, shape.color);
  gl.vertexAttribPointer(attrColorPosition, POINT_SZ, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrColorPosition);
  
  function draw() {
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    let mat = new M4();
    mat.scale(1, 1, 1);
    mat.rotatex(rt[0]);
    mat.rotatey(rt[1]);
    mat.rotatez(rt[2]);
    mat.translate(tr[0], tr[1], tr[2]);
    mat.orthographic(gl.canvas.width, 0, gl.canvas.height, 0, 400, -400);
    gl.uniformMatrix4fv(unifLocMatrix, false, mat.val);
    gl.drawArrays(gl.TRIANGLES, 0, shape.geom.length/POINT_SZ);
  }

  function setupSliderTr(axis, max) {
    let label = document.createElement('label');
    let div = configureSlider(max, function(e) {
      tr[axis] = parseInt(e.target.value);
      label.innerHTML = tr[axis];
      draw();
    });
    div.appendChild(label);
  }

  function setupSliderRt(axis, turns) {
    let label = document.createElement('label');
    let pres = 10;
    let div = configureSlider(2*Math.PI*turns*pres, function(e) {
      rt[axis] = parseInt(e.target.value)/pres;
      label.innerHTML = rt[axis];
      draw();
    })
    div.appendChild(label);
  }

  draw();
}

main();

print('geom3d.js loaded.')