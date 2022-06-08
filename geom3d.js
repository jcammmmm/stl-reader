var vertShader = `
  attribute vec4 a_position;
  uniform   mat4 u_mat;

  void main() {
    gl_Position = u_mat*a_position;
  }
`

var fragShader = `
  precision mediump float;

  void main() {
    gl_FragColor = vec4(0.3, 1, 0.6, 1);
  }
`
var POINT_SZ = 3;

function main() {
  let gl = document.getElementById('c').getContext('webgl');
  let program = createProgram(gl, vertShader, fragShader);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  let attrLocPosition = gl.getAttribLocation(program, 'a_position');
  gl.vertexAttribPointer(attrLocPosition, POINT_SZ, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrLocPosition);
  let unifLocMatrix = gl.getUniformLocation(program, 'u_mat');
  
  gl.useProgram(program);
  setupSliderTr(0, gl.canvas.width);
  setupSliderTr(1, gl.canvas.height);
  setupSliderTr(2, gl.canvas.width);
  setupSliderRt(0, 3);
  setupSliderRt(1, 3);
  setupSliderRt(2, 3);

  let tr = [300, 200, 0];  // translation 
  let rt = [0, 0, 0];  // rotation
  
  let shape = build3dTriangle(40);
  // let shape = buildF(0, 0, 20, 8);
  // let shape = build3dF();
  set2dShape(gl, shape);
  
  function draw() {
    let mat = new M4();
    mat.scale(1, 1, 1);
    mat.rotatex(rt[0]);
    mat.rotatey(rt[1]);
    mat.rotatez(rt[2]);
    mat.translate(tr[0], tr[1], tr[2]);
    mat.transform(gl.canvas.width, gl.canvas.height, gl.canvas.width);
    gl.uniformMatrix4fv(unifLocMatrix, false, mat.val);
    gl.drawArrays(gl.TRIANGLES, 0, shape.length/POINT_SZ);
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
    let pres = 100;
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