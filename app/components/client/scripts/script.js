$(document).ready(function() {
  // Animate header div up
  $('#arrow').on('click', function() {
    if ($('#arrow').hasClass('flipped')) {
      $('#arrow').removeClass('flipped');
      $('#header').animate({'bottom': '0px', 'top': '0px'}, 400);

      if ($(window).width() < 480) {
        $('#logo').animate({'height' : '100px', 'top': '20px', 'left': '5px'}, 400);
      } else {
        $('#logo').animate({'height' : '100px', 'top': '20px', 'left': '20px'}, 400);
      }

      $('#arrow-div').animate({'bottom': '30px'}, 500);
    } else {
      $('#arrow').addClass('flipped');
      $('#header').animate({'bottom': ($(window).height() - 50) + 'px', 'top': '-' + ($(window).height() - 50) + 'px'}, 400);
      $('#logo').animate({'height' : '40px', 'top': '-3px', 'left': '0px'}, 400);
      $('#arrow-div').animate({'bottom': '0'}, 200);
    }
  });
  // Animate header div down
  // $('#header').animate({'bottom': '0px', 'top': '0px'}, 500)
});