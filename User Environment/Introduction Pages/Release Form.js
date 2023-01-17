function Consent() {
  if ($('#consent input[type=checkbox]').is(':checked')) {
    $('#consent button').css('pointer-events', 'auto').css({filter: 'blur(0px) grayscale(0%)'}, 500).animate({opacity: 1.0}, 500);
  } else {
    $('#consent button').css('pointer-events', 'none').css({filter: 'blur(1px) grayscale(80%)'}, 500).animate({opacity: 0.5}, 500);
  }
}
