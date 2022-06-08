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
  setupSliderX(0, gl.canvas.width);
  setupSliderX(1, gl.canvas.height);
  setupSliderX(2, gl.canvas.width);

  let tr = [0, 0, 0];  // translation 
  
  let shape = build3dTriangle(40);
  // let shape = buildF(0, 0, 20, 8);
  set2dShape(gl, shape);
  
  function draw() {
    let mat = new M4();
    mat.scale(1, 1, 1);
    mat.translate(tr[0], tr[1], tr[2]);
    mat.transform(gl.canvas.width, gl.canvas.height, gl.canvas.width);
    gl.uniformMatrix4fv(unifLocMatrix, false, mat.val);
    gl.drawArrays(gl.TRIANGLES, 0, shape.length/POINT_SZ);
  }

  function setupSliderX(axis, max) {
    let label = document.createElement('label');
    let div = configureSlider(max, function(e) {
      tr[axis] = parseInt(e.target.value);
      // print(tr[axis])
      draw();
    });
    div.appendChild(label);
  }

  draw();
}

main();

print('geom3d.js loaded.')