var vertShader = `
  attribute vec4  a_position;
  attribute vec4  a_color;
  uniform   float u_ffactor;
  uniform   mat4  u_mat;
  varying   vec4  v_color;

  void main() {
    vec4 v = u_mat*a_position;
    gl_Position = v;
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
var TUPLE_SZ = 3; // the number of entries per vertex
var DEPTH_SZ = 400; // the size of depth axis

var render = async function render(shape) {
  let gl = document.getElementById('c').getContext('webgl');
  let program = createProgram(gl, vertShader, fragShader);

  let unifLocMatrix = gl.getUniformLocation(program, 'u_mat');
  let unifLocFFactor = gl.getUniformLocation(program, 'u_ffactor');

  gl.useProgram(program);

  // let shape = build3dTriangle(40);
  // let shape = buildF(0, 0, 20, 8);
  // let shape = buildOrto3dRectangle(0, 0, 0, 20, 40);
  // let shape = buildOrto3dF(0, 0, 30, 6);
  // let shape = await openStlFile('ovni');
  printAs3dCoordinates(shape.geom, 3);

  let ol = getMinimumContainerBox(shape.geom); // shape limits
  let tr = [0.0, 0.0, 0.0];  // translation 
  let rt = [3.7, 2.3, 3.3];  // rotation
  let sc = [0.7, 0.7, 0.7]
  let ff = Math.PI/3;

  setupSliderTr(0, gl.canvas.width);
  setupSliderTr(1, gl.canvas.height);
  setupSliderTr(2, DEPTH_SZ);
  setupSliderRt(0, 1);
  setupSliderRt(1, 1);
  setupSliderRt(2, 1);
  setupSliderSc(3);
  setupSliderFf(Math.PI);


  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  let attrLocPosition = gl.getAttribLocation(program, 'a_position');
  set2dShape(gl, shape.geom);
  gl.vertexAttribPointer(attrLocPosition, TUPLE_SZ, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrLocPosition);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  let attrColorPosition = gl.getAttribLocation(program, 'a_color');
  set2dShape(gl, shape.color);
  gl.vertexAttribPointer(attrColorPosition, TUPLE_SZ, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attrColorPosition);
  
  function draw() {
    // console.clear();
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    // mat.perspective(ff, gl.canvas.clientWidth, gl.canvas.clientHeight, -DEPTH_SZ/2, DEPTH_SZ/2);
    mat = new M4();
    mat.rotate(rt[0], rt[1], rt[2]);
    mat.scale(sc[0], sc[1], sc[2]);
    mat.translate(tr[0], tr[1], tr[2]);
    // mat.perspectiveSimple(0.7);
    mat.orthographic(ol[0], ol[1], ol[2], ol[3], ol[4], ol[5]);
    // printAs3dCoordinates(mat.transform(shape.geom, TUPLE_SZ), 3);
    gl.uniformMatrix4fv(unifLocMatrix, false, mat.val);
    gl.uniform1f(unifLocFFactor, ff);
    gl.drawArrays(gl.TRIANGLES, 0, shape.geom.length/TUPLE_SZ);
  }

  function setupSliderTr(axis, max) {
    let label = document.createElement('label');
    label.innerHTML = tr[axis];
    let div = configureSlider(max, tr[axis], function(e) {
      tr[axis] = parseInt(e.target.value);
      label.innerHTML = tr[axis];
      draw();
    });
    div.appendChild(label);
  }

  function setupSliderRt(axis, turns) {
    let label = document.createElement('label');
    label.innerHTML = rt[axis];
    let pres = 10;
    let div = configureSlider(2*Math.PI*turns*pres, rt[axis]*pres, function(e) {
      rt[axis] = parseInt(e.target.value)/pres;
      label.innerHTML = rt[axis];
      draw();
    })
    div.appendChild(label);
  }

  function setupSliderSc(max) {
    let label = document.createElement('label');
    label.innerHTML = sc[0];
    let pres = 500;
    let div = configureSlider(max*pres, sc[0]*pres, function(e) {
      let factor = parseInt(e.target.value)/pres;
      sc = [factor, factor, factor]
      label.innerHTML = factor;
      draw();
    })
    div.appendChild(label);
  }

  function setupSliderFf(max) {
    let label = document.createElement('label');
    let pres = 1000;
    let div = configureSlider(pres*max, function(e) {
      ff = parseInt(e.target.value)/pres;
      label.innerHTML = ff;
      draw();
    })
    div.appendChild(label);
  }

  draw();
}

print('geom3d.js loaded.')