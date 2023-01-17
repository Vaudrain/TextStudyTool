
// variables for tracking test progress and device issue warnings
var warning = false; // required, as alert would constantly retrigger without it
var testing = true;

// Prevents accidental page leaving while test is still active
window.onbeforeunload=function(){
  if (testing) {
    return "Are you sure you want to leave this page?";
  }
}

// Listens for gamepads being attatched, activates appropriate keyboard
window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes, %s mapping",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length,
    e.gamepad.mapping);
  if (e.gamepad.mapping != "standard"){
    if (!warning) {
      alert("WARNING: 1 or more of your input devices has failed to be registered properly. Please try a different browser or device.");
      warning = true;
      testing = false;
    }
  }

  /* if more keyboards are added, this should switch case on schema, and schema should be declared in the html file instead */
  if (dualKeyboard) {
    gameLoop();
  }
  if (discreteKeyboard) {
    gameLoop2();
  }
  if (daisyWheel) {
    $(".daisywheel").focus();
  }
});

// shorthand
function daisyWheelFocus() {
  $(".daisywheel").focus();
}

/* Declare and Populate variables */
/** In a more modular solution, the tokenTypes and schemaTypes variables should be populated by the server */
var tokens = ["Error: Failed to retrieve tokens"];
var text = "";
var nextTextIndex = 0;
var numCorrectInputs = 0;
var numIncorrectInputs = 0;
var errorPercent = 0;
var lastLength = 0;
var longestLength = 0;
var tokenTypes = [
  "Alphabetic strings without capitalisation or special characters",
  /*"Alphabetic strings without capitalisation and with special characters",
  "Alphabetic strings with capitalisation and without special characters",*/
  "Alphabetic strings with capitalisation and with special characters",
  /*"Alphanumeric strings without capitalisation or special characters",
  "Alphanumeric strings without capitalisation and with special characters",
  "Alphanumeric strings with capitalisation and without special characters",*/
  "Alphanumeric strings with capitalisation and with special characters",
  /*"Proper Nouns",*/
  "Words",
  /*"Multi-word concatenated strings",
  "Sentences without punctuation",*/
  "Sentences with punctuation"
];
var tokenTypeIndex = 0;
var tokenType = "";
var schemaTypes = [
  "Discrete Movement Keyboard",
  "Dual-Cursor Keyboard",
  "Chord Keyboard"
];
var schemaIndex = 0;
var schema = "";
var schemajs = "";
var schemacss = "";

function setEndOfContenteditable(contentEditableElement) {
    var range, selection;
    if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(contentEditableElement);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (document.selection) {
        range = document.body.createTextRange();
        range.moveToElementText(contentEditableElement);
        range.collapse(false);
        range.select();
    }
}

function nextSchema() {
  if (schemaIndex < schemaTypes.length) {
    testing = true;
    schema = schemaTypes[schemaIndex];
    schemaIndex++;
    text = "";
    nextTextIndex = 0;
    numCorrectInputs = 0;
    numIncorrectInputs = 0;
    errorPercent = 0;
    lastLength = 0;
    tokenTypeIndex = 0;
    tokenType = "";
    retrieveNewSchema();
    nextTokenType();
    retrieveNewTokens();
    $("#briefing").html("The current schema is <b>" + schema + "</b>. The next token type to test is <b>" + tokenType + "</b>, you will have one minute.");
    $('#startTest').css("display","block").css('pointer-events', 'none').text("Please type \"Ready!\" to continue.").css({filter: 'grayscale(80%)'}, 500).animate({opacity: 0.5}, 500);
    text = ("Ready!");
    $(".gray").text("Ready!");
    if (daisyWheel) {
      $(".daisywheel").focus();
    }
  } else {
    alert("All tests complete! Thank you for your assistance with this Study!");
    testing = false;
  }
}

function nextToken() {
  if (nextTextIndex < tokens.length) {
    text = tokens[nextTextIndex];
    nextTextIndex++;
    longestLength = 0;
  } else {
    $(".textbox").attr("contentEditable","false");
    text = "ERROR: END OF TOKEN LIST - correct: " + numCorrectInputs + "| Incorrect: " + numIncorrectInputs;
  }
}

function nextTokenType() {
  if (tokenTypeIndex < tokenTypes.length) {
    tokenType = tokenTypes[tokenTypeIndex];
    tokenTypeIndex++;
    retrieveNewTokens();
    nextToken();
    return 0;
  } else {
    return 1;
  }
}

/* use ajax calls to allow for modularity, instead of sending gigantic files */
function retrieveNewTokens() {
  $.post("/token",{tokenType: tokenType}, function(data,status) {
    if (status == "success") {
      tokens = JSON.parse(data);
      nextTextIndex = 0;
    } else {
      console.error("Failed to retrive token list.");
      $post(this);
    }
  });
}

/* Ideally this would allow for dynamic loading of js, but this was infeasible to implement while learning the technology, and risky to implement whilst testing is ongoing */
function retrieveNewSchema() {
  for (var i = 0; i < keys.length; i++) {
    keys[i].css("background","black");
  }
  switch (schema) {
    case "Dual-Cursor Keyboard":
      dualKeyboard = true;
      discreteKeyboard = false;
      daisyWheel = false;
      $("#daisyWheelFocus").css("visibility","hidden");
      $("#keyboard").css("visibility","visible");
      $(".ball").css("visibility","visible");
      $("#instructions").text("Use the left analog stick to control the red cursor, and the right analog stick to control the purple cursor. Neither can move far into the other half of the keyboard. Use the left trigger (L2) to input the red-highlighted key, and the right trigger (R2) to input a purple-highlighted key. You may hold either bumper (L1/R1) to toggle Shift, or may input using the onscreen key.");
      $(".textbox").focus();
      gameLoop();
      break;
    case "Discrete Movement Keyboard":
      dualKeyboard = false;
      discreteKeyboard = true;
      daisyWheel = false;
      $("#daisyWheelFocus").css("visibility","hidden");
      $("#keyboard").css("visibility","visible");
      $(".ball").css("visibility","hidden");
      $("#instructions").text("Use the directional buttons on your device to navigate around the keyboard, and the bottom face button (A on Xbox pads, X on Playstation controllers etc.) to confirm an input.");
      $(".textbox").focus();
      gameLoop2();
      break;
    case "Chord Keyboard":
      dualKeyboard = false;
      discreteKeyboard = false;
      daisyWheel = true;
      $("#daisyWheelFocus").css("visibility","visible");
      $("#keyboard").css("visibility","hidden");
      $(".ball").css("visibility","hidden");
      $("#instructions").text("");
      $(".daisywheel").focus();
      break;
    default:

  }
}

function startTest() {
  nextToken();
  $(".results").text("");
  numCorrectInputs = 0;
  numIncorrectInputs = 0;
  countdown("countdown", 1, 0);
  $("#briefing").html("");
  $("#startTest").css("display","none");
  $("#results").text("");

  if (daisyWheel) {
    $(".daisywheel").focus();
  }

  $(".textbox").html("");
  /** Content interaction events */
  $(".textbox").on("focus blur", function(){
    $(".wrapper").toggleClass("focused");
  });

  $(".wrapper").click(function (e) {
    if (e.target == this) {
      var b = $(".textbox", this).focus();
      setEndOfContenteditable(b[0]);
    }
  }).trigger("click");
  $('.textbox').trigger("input");
}
$(".wrapper > .textbox").on("input", function(){
  if ($(this).text() == "Ready!") {
    $('#startTest').css('pointer-events', 'auto').text("Begin Test").css({filter: 'blur(0px) grayscale(0%)'}, 500).animate({opacity: 1.0}, 500);
  } else if (text == $(this).text()) {
    nextToken();
    $(this).text("");
    $(".daisywheel").text("");
    numCorrectInputs++; // wouldn't happen as length is now shorter
  }
  var ipt = $(this).text().replace(/\u00A0/g, " ");
  //no-break spaces
  if(text.indexOf(ipt) == 0){
    if ($(this).text().length > longestLength) {
      if ($(".gray").css("color") != "red") { //offsets the +1 from resetting to neutral
        longestLength = $(this).text().length;
        numCorrectInputs++;
      }
    }
    $(".gray").css("color","grey");
    $(".gray").text(text.substr(ipt.length, text.length) + " " + '\u2588');
  }else{
    if ($(this).text().length > lastLength) {
      numIncorrectInputs++;
    }
    $(".gray").css("color","red");
    $(".gray").text(text.substr(ipt.length, text.length) + " " + '\u2589');
  }
  lastLength = $(this).text().length;
})

$("#daisywheel-input").on("change", function(){
  console.log($("#daisywheel-input").val());
  $(".textbox").text($(this).val());
  $(".textbox").trigger("input");
})


/* Simple countdown function, ends test on countdown ending */
function countdown( elementName, minutes, seconds ) {
    var element, endTime, hours, mins, msLeft, time;

    function twoDigits( n ) {
        return (n <= 9 ? "0" + n : n);
    }

    function updateTimer() {
        msLeft = endTime - (+new Date);
        if ( msLeft < 11000 ) {
            $("#countdown").css("color","red");
        }
        if ( msLeft < 1000 ) {
          $("#countdown").css("color","white");
          element.innerHTML = "Sending test results...";
          $(".textbox").attr("contentEditable","false");
          if (numCorrectInputs == 0 && numIncorrectInputs == 0) {
            errorPercent = "N/A";
          } else {
            errorPercent = ((numIncorrectInputs/(numCorrectInputs + numIncorrectInputs)) * 100).toFixed(3);
          }
          text = "Correct Inputs: " + numCorrectInputs + " Incorrect Inputs: " + numIncorrectInputs + " Percentage Error Rate: " + (errorPercent*1).toString() + "%"; // The *1 is to cull trailing 0s when displaying
          $(".gray").text("");
          $(".textbox").text("");
          $(".results").text(text);
          text = "";
          $.ajax({
              type: "POST",
              url: "/tokenResults",
              dataType: "json",
              data: {
                TokenType: tokenType,
                Scheme: schema,
                Correct: numCorrectInputs,
                Incorrect: numIncorrectInputs,
                Percentage: errorPercent
              },
              success: function (data) {
                element.innerHTML = "";
                numCorrectInputs = 0;
                numIncorrectInputs = 0;
                if (nextTokenType() == 0) {
                  $("#briefing").html("The current schema is <b>" + schema + "</b>. The next token type to test is <b>" + tokenType + "</b>, you will have one minute.");
                  $("#startTest").css("display","block");
                } else {
                  nextSchema();
                }
              },
              error: function () {
               alert('Error');
              }
          });
        } else {
            time = new Date( msLeft );
            hours = time.getUTCHours();
            mins = time.getUTCMinutes();
            element.innerHTML = (hours ? hours + ':' + twoDigits( mins ) : mins) + ':' + twoDigits( time.getUTCSeconds() );
            setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
        }
    }

    element = document.getElementById( elementName );
    endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
    updateTimer();
}

nextSchema(); // Call next schema on load to begin
