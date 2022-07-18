var vertShader = `
  attribute vec4  a_position;
  attribute vec4  a_color;
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
var CANVAS = document.getElementById('c');
var PROD_ENV = true;

var render = async function render(shape) {
  CANVAS.setAttribute('tabIndex', -1); // https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
  let gl = CANVAS.getContext('webgl');
  let program = createProgram(gl, vertShader, fragShader);

  let unifLocMatrix = gl.getUniformLocation(program, 'u_mat');
  gl.useProgram(program);

  // shape = buildOrto3dF(0, 0, 30, 6);
  // printAs3dCoordinates(shape.geom, 13);

  let tr = [0.0, 0.0, 0.0];  // translation
  let rt = [0.0, 0.0, 0.0];  // rotation
  let sc = [ 1.0,  1.0,  1.00];  // scaling
  let ff = 1.0;
  
  let ol = getMaxAbsNorm(shape.geom) // shape's limits

  if (!PROD_ENV) {
    setupSliderTr(0, -ol, ol);
    setupSliderTr(1, -ol, ol);
    setupSliderTr(2, -ol, ol);
    setupSliderRt(0, -1, 1);
    setupSliderRt(1, -1, 1);
    setupSliderRt(2, -1, 1);
    setupSliderSc(3);
    setupSliderFf(Math.PI);
  }

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

  function draw(tr, rt, sc) {
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    // mat.perspective(ff, gl.canvas.clientWidth, gl.canvas.clientHeight, -DEPTH_SZ/2, DEPTH_SZ/2);
    mat = new M4();
    mat.rotate(rt[0], rt[1], rt[2]);
    mat.scale(sc[0], sc[1], sc[2]);
    mat.translate(tr[0], tr[1], tr[2]);
    mat.orthographic(ol, -ol, ol, -ol, ol, -ol);
    mat.perspectiveSimple(ff);
    // printAs3dCoordinates(mat.transform(shape.geom, TUPLE_SZ), 3);
    gl.uniformMatrix4fv(unifLocMatrix, false, mat.val);
    gl.drawArrays(gl.TRIANGLES, 0, shape.geom.length/TUPLE_SZ);
  }

  function setupSliderTr(axis, min, max) {
    let label = document.createElement('label');
    label.innerHTML = tr[axis];
    let pres = 5;
    let div = configureSlider('ctrlAxis' + axis, min*pres, max*pres, tr[axis]*pres, function(e) {
      tr[axis] = parseInt(e.target.value)/pres;
      label.innerHTML = tr[axis];
      draw();
    });
    div.appendChild(label);
  }

  function setupSliderRt(axis, minTurns, maxTurns) {
    let label = document.createElement('label');
    label.innerHTML = rt[axis];
    let pres = 10;
    let div = configureSlider('ctrlRot' + axis, Math.PI*minTurns*pres, Math.PI*maxTurns*pres, rt[axis]*pres, function(e) {
      rt[axis] = parseInt(e.target.value)/pres;
      label.innerHTML = rt[axis];
      draw(tr, rt, sc);
    })
    div.appendChild(label);
  }

  function setupSliderSc(max) {
    let label = document.createElement('label');
    label.innerHTML = sc[0];
    let pres = 10;
    let div = configureSlider('ctrlSca', 0, max*pres, sc[0]*pres, function(e) {
      let factor = parseInt(e.target.value)/pres;
      sc = [factor, factor, factor]
      label.innerHTML = factor;
      draw(tr, rt, sc);
    })
    div.appendChild(label);
  }

  function setupSliderFf(max) {
    let label = document.createElement('label');
    label.innerHTML = ff;
    let pres = 10;
    let div = configureSlider('ctrlPersp', 0, max*pres, ff*pres, function(e) {
      ff = parseInt(e.target.value)/pres;
      label.innerHTML = ff;
      draw(tr, rt, sc);
    })
    div.appendChild(label);
  }

  configureMouseController(CANVAS, tr, rt, sc, gl.canvas.clientWidth, gl.canvas.clientHeight, draw);
  draw(tr, rt, sc);
  console.log('%cOK!', 'color: lime');
}

print('geom3d.js loaded.')