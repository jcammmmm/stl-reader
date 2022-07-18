var vertShader = `
  #define CUBE_PLAYGROUDS2
  attribute vec3  a_pos;
  bool            t       = false;

  void main() {
    #if defined(CUBE_PLAYGROUNDS)
      vec4 v = vec4(0, 0, 0, 0);
      if (a_pos.x < a_pos.y)
        v = vec4(a_pos, 0.8);
      else
        v = vec4(a_pos, 1.8);
      gl_Position = v;
    #else
      gl_Position = vec4(a_pos, 3);
    #endif
  }
`

var fragShader = `
  precision mediump float;
  uniform   vec4    u_color;

  void main() {
    gl_FragColor = u_color;
  }
`
async function main() {
  let gl = document.getElementById('c').getContext('webgl');
  let program = createProgram(gl, vertShader, fragShader);
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  
  function draw(shape, color, mode) {
    gl.uniform4fv(gl.getUniformLocation(program, 'u_color'), color);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    let attrPosLoc = gl.getAttribLocation(program, 'a_pos');
    set2dShape(gl, shape);
    gl.vertexAttribPointer(attrPosLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrPosLoc);
    gl.drawArrays(mode, 0, shape.length/3);
  }

  // If x, y belongs to z and x < y, then x will appear nearer that y to the screen.
  // draw(buildOrto3dRectangle(true, 2, -0.50, -0.60, 0.3, 0.90, 0.80), [0.2, 0.3, 0.4, 0.5], gl.TRIANGLES); // blue cream
  // draw(buildOrto3dRectangle(true, 2,-0.40, -0.70, 0.2, 0.30, 1.00), [0.4, 0.3, 0.1, 0.5], gl.TRIANGLES); // yellow cream
  // draw([-1.0, -1.0, 0.0, 1.0, 1.0, 0.0], [0, 0, 0, 1], gl.LINES);
  // draw([ 0.0, -1.0, 0.0, 0.0, 1.0, 0.0], [0, 0, 0, 1], gl.LINES);
  // draw([-1.0,  0.0, 0.0, 1.0, 0.0, 0.0], [0, 0, 0, 1], gl.LINES);
  let verts = await openStlFile();
  let s = [];
  for(v of verts) 
    s = s.concat(v[1], v[2], v[3]);
  printAs3dCoordinates(s);
  draw(s, [0.1, 0.2, 0.3, 0.5], gl.TRIANGLES);
}
print('drafts.js loaded.');
main();