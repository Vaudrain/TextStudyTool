function resetemail() {
  var username = $("#username").val();
  $.ajax({
    type:    "POST",
    url:     "/ResetPassword",
    data:    {username:username},
    success: function(data) {
      alert("Sent! You should receive an email with a new password shortly.");
      $(".psw").css("pointer-events","none").css({filter: 'blur(1px) grayscale(80%)'}, 500).animate({opacity: 1.0}, 500);
    },
    error:   function(jqXHR, textStatus, errorThrown) {
      alert("Error, status = " + textStatus + ", " +
            "error thrown: " + errorThrown
      );
    }
  });
}
