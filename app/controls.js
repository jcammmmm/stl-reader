function configureSlider(domid, min, max, curr, callback) {
  let div = document.createElement('div');
  let slider = document.createElement('input');
  slider.setAttribute('id', domid);
  slider.setAttribute('type', 'range');
  slider.setAttribute('min', min);
  slider.setAttribute('max', max);
  slider.setAttribute('value', curr); // setting this attr goes after min and max
  slider.oninput = callback;
  slider.addEventListener('keydown', keyboardController);
  div.appendChild(slider);
  document.body.append(div);
  return div;
}

function configureKeyboardController(elem) {
  elem.addEventListener('keydown', keyboardController);
}

function configureMouseController(elem, tr, rt, sc, width, height, drawFun) {
  let prev = [0, 0];
  let active = false;
  let factor = 5/width;
  elem.addEventListener('mousemove', function(e) {
    if (active) {
      rt[0] += (prev[1] - e.offsetY)*factor;
      rt[1] += (prev[0] - e.offsetX)*factor;
      prev = [e.offsetX, e.offsetY];
      drawFun(tr, rt, sc);
    }
  });

  elem.addEventListener('mousedown', function(e) {
    prev = [e.offsetX, e.offsetY];
    active = true;
  });

  elem.addEventListener('mouseup', function(e) {
    prev = [0, 0]
    active = false;
  });

  elem.addEventListener('mouseleave', function(e) {
    prev = [0, 0]
    active = false;
  });

  elem.addEventListener('wheel', function(e) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
    let smoothness = 60;
    let deltay = e.deltaY/smoothness;
    let deltax = e.deltaX/smoothness;
    e.preventDefault(); // disables the ctrl + scroll zoom default action on webbrowsers
    if (e.ctrlKey) {
      sc[0] += deltay;
      sc[1] += deltay;
      sc[2] += deltay;
    } else if (e.shiftKey) {
      tr[0] += deltay;
    } else {
      tr[0] += -deltax;
      tr[1] += deltay;
    }
    drawFun(tr, rt, sc);
  });
}

/**
 *  keydown { target: canvas#c, key: "1", charCode: 0, keyCode: 49 }
    keydown { target: canvas#c, key: "2", charCode: 0, keyCode: 50 }
    keydown { target: canvas#c, key: "3", charCode: 0, keyCode: 51 }
    keydown { target: canvas#c, key: "q", charCode: 0, keyCode: 81 }
    keydown { target: canvas#c, key: "w", charCode: 0, keyCode: 87 }
    keydown { target: canvas#c, key: "e", charCode: 0, keyCode: 69 }
    keydown { target: canvas#c, key: "a", charCode: 0, keyCode: 65 }
    keydown { target: canvas#c, key: "s", charCode: 0, keyCode: 83 }
    keydown { target: canvas#c, key: "d", charCode: 0, keyCode: 68 }
    keydown { target: canvas#c, key: "j", charCode: 0, keyCode: 74 }
    keydown { target: canvas#c, key: "k", charCode: 0, keyCode: 75 }

 * @param {*} event 
 */
function keyboardController(event) {
  switch (event.keyCode) {
    case 49: // '1' => x axis
      document.getElementById('ctrlAxis0').focus();
      break;
    case 50: // '2' => y axis
      document.getElementById('ctrlAxis1').focus();
      break;
    case 51: // '3' => z axis
      document.getElementById('ctrlAxis2').focus();
      break;
    case 81: // 'q' => x rotation
      document.getElementById('ctrlRot0').focus();
      break;
    case 87: // 'w' => y rotation
      document.getElementById('ctrlRot1').focus();
      break;
    case 69: // 'e' => z rotation
      document.getElementById('ctrlRot2').focus();
      break;
    case 65: // 'a' => scaling
      document.getElementById('ctrlSca').focus();
      break;
    case 83: // 's' => perspective
      document.getElementById('ctrlPersp').focus();
      break;
    case 68: // 'd' => ??
      document.getElementById('').focus();
      break;
    case 74: // '1' => x axis
      document.getElementById('ctrlAxis0').focus();
      break;
    case 75: // '1' => x axis
      document.getElementById('ctrlAxis0').focus();
      break;
    default:
      break;
  }
}

function addDemoSelector(driverFunction) {
  let select = document.createElement('select');
  for(let i = 0; i < EXAMPLES_AVA.length; i++) {
    let option = document.createElement('option');
    option.setAttribute('value', EXAMPLES_AVA[i]);
    option.textContent = EXAMPLES_AVA[i];
    option.addEventListener('mousedown', e => driverFunction(EXAMPLES_AVA[i]));
    select.appendChild(option);
  }
  document.getElementById('c').appendChild(select);
  document.body.appendChild(select);
}