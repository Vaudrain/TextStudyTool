/** BUILT ON TOP OF CODE BASED ON CODE FROM https://code.tutsplus.com/tutorials/creating-a-keyboard-with-css-and-jquery--net-5774 and https://github.com/chrisdavidmills/gamepad-buttons*/

var triggerShift = false
// BALLS
var gp;
var ball = document.getElementById("ball");
var ball2 = document.getElementById("ball2");
var start;
var a = 0;
var a2 = 0;
var b = 0;
var b2 = 0;
var leftClick = 0;
var rightClick = 0;
var rAF = window.requestAnimationFrame ||
  window.requestAnimationFrame;
var rAFStop = window.requestAnimationFrame ||
  window.cancelRequestAnimationFrame;

function gameLoop() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  var gp = gamepads[0];
  if (!gp || !dualKeyboard) {
    return;
  }

  // Shift modifiers
  if ((buttonPressed(gp.buttons[4]) || buttonPressed(gp.buttons[5])) && shift == false) {
    $('.left-shift').trigger("click");
    triggerShift = true;
  } else if (!(buttonPressed(gp.buttons[4]) || buttonPressed(gp.buttons[5])) && shift == true && triggerShift == true) {
    triggerShift = false;
    shift = false;
    $('.letter').toggleClass('uppercase');
    $('.symbol span').toggle();
  }

  // Highlighting and Clicking

  for (var i = 0; i < keys.length; i++) {
    rect1 = keys[i][0].getBoundingClientRect();
    rect2 = ball.getBoundingClientRect();
    rect3 = ball2.getBoundingClientRect();
    // faster to hardcode the half of ball size at 10px than calculate every tick
    rect2centerX = (rect2.left + 10)
    rect2centerY = (rect2.top + 10)
    rect3centerX = (rect3.left + 10)
    rect3centerY = (rect3.top + 10)
    var overlap1 = !(rect2centerX < rect1.left ||
                rect2centerX > rect1.right ||
                rect2centerY < rect1.top ||
                rect2centerY > rect1.bottom);
    var overlap2 = !(rect3centerX < rect1.left ||
                rect3centerX > rect1.right ||
                rect3centerY < rect1.top ||
                rect3centerY > rect1.bottom);
    if (overlap1) {
      keys[i].css("background","red")
      if (buttonPressed(gp.buttons[6])) {
        if (leftClick == 0) {
          keys[i].trigger("click");
          leftClick = 1;
        }
      } else {
        leftClick = 0;
      }
    }
    if (overlap2) {
      keys[i].css("background","purple")
      if (buttonPressed(gp.buttons[7])) {
        if (rightClick == 0) {
          keys[i].trigger("click");
          rightClick = 1;
        }
      } else {
        rightClick = 0;
      }
    } else if (!overlap1 && !overlap2) {
      keys[i].css("background","black");
    }
  }

  if (gp.axes[1] < -0.2) {
    b+= 1.3 * ( gp.axes[1]+0.2);
  } else if (gp.axes[1] > 0.2) {
    b+= 1.3 * ( gp.axes[1]-0.2);
  }
  if(gp.axes[0] > 0.2) {
    a+= 1.3 * ( gp.axes[0]-0.2);
  } else if(gp.axes[0] < -0.2) {
    a+= 1.3 * ( gp.axes[0]+0.2);
  }
  if (gp.axes[3] < -0.2) {
    b2+= 1.3 * ( gp.axes[3]+0.2);
  } else if (gp.axes[3] > 0.2) {
    b2+= 1.3 * ( gp.axes[3]-0.2);
  }
  if(gp.axes[2] > 0.2) {
    a2+= 1.3 * ( gp.axes[2]-0.2);
  } else if(gp.axes[2] < -0.2) {
    a2+= 1.3 * ( gp.axes[2]+0.2);
  }
  if (a < 0) {
    a = 0;
  }
  if (b > 0) {
    b = 0;
  }
  if (a2 > 0) {
    a2 = 0;
  }
  if (b2 > 0) {
    b2 = 0;
  }

  if (a > 170) {
    a = 170;
  }
  if (b < -118) {
    b = -118;
  }
  if (a2 < -170) {
    a2 = -170;
  }
  if (b2 < -118) {
    b2 = -118;
  }
  ball.style.left = a*2 + "px";
  ball.style.top = b*2 + "px";
  ball2.style.left = a2*2 + "px";
  ball2.style.top = b2*2 + "px";
  if (dualKeyboard) {
    var start = rAF(gameLoop);
  }
};
