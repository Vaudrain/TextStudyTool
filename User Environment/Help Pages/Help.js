/* Accordion code from W3Schools */

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight){
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
    if ($(this).parent().hasClass('panel')) {
      panel.style.backgroundColor = "#232323";
      if ($(this).parent().css('maxHeight') != $(this).parent().css('scrollHeight')){
        $(this).parent().css('maxHeight',(parseInt($(this).parent().css('maxHeight')) + panel.scrollHeight) + "px");
      } else {
        console.log("aa");
        $(this).parent().css('maxHeight',$(this).parent().css('scrollHeight') + "px");
      }
    }
  });
}
