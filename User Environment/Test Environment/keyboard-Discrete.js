/** BUILT ON TOP OF CODE BASED ON CODE FROM https://code.tutsplus.com/tutorials/creating-a-keyboard-with-css-and-jquery--net-5774 and https://github.com/chrisdavidmills/gamepad-buttons*/

var highlightedKey = 0;
var pressed = 0;
var input = 0;
var movementOffset = 0;

function gameLoop2() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  var gp = gamepads[0];
  if (!gp || !discreteKeyboard)
    return;
  // Highlighting and Clicking
  keys[highlightedKey].css("background","black");


  // The following is very very hacky and janky, due to time constraints
  if (buttonPressed(gp.buttons[13])) { //down
    if (pressed == 0) {
      if (highlightedKey < 27) { // first and most of second row
        highlightedKey+=14;
      } else if (highlightedKey < 40) {
        highlightedKey+=13;
      } else if (highlightedKey == 40) {
        highlightedKey+=12;
      } else if (highlightedKey < 53) {
        movementOffset = highlightedKey;
        highlightedKey = 53;
      }
      pressed = 1;
    }
  } else if (buttonPressed(gp.buttons[12])) { //up
    if (pressed == 0) {
      if (highlightedKey == 53) { // first and most of second row
        highlightedKey = movementOffset;
      } else if (highlightedKey > 39) {
        highlightedKey-=13;
      } else if (highlightedKey > 13) {
        highlightedKey-=14;
      }
      pressed = 1;
    }
  } else if (buttonPressed(gp.buttons[14])) { //left
    if (pressed == 0) {
      switch (highlightedKey) {
        case 0:
        case 14:
        case 28:
        case 41:
        case 53:
          break;
        default:
          highlightedKey--;
      }
      pressed = 1;
    }
  } else if (buttonPressed(gp.buttons[15])) { //right
    if (pressed == 0) {
      switch (highlightedKey) {
        case 13:
        case 27:
        case 40:
        case 52:
        case 53:
          break;
        default:
          highlightedKey++;
      }
      pressed = 1;
    }
  } else {
    pressed = 0;
  }
  if (buttonPressed(gp.buttons[0])) { //confirm
    if (input == 0) {
      keys[highlightedKey].trigger("click");
      input = 1;
    }
  } else {
    input = 0;
  }
  keys[highlightedKey].css("background","#3f51b5");

  for (var i = 0; i < keys.length; i++) {

  }
  if (discreteKeyboard) {
    var start = rAF(gameLoop2);
  }
};
