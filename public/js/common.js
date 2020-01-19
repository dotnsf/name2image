
$(function(){
  $('#frm').submit( function(){
    $('#mycarousel').html( '' );
    var name = $('#name').val();
    if( name ){
      var obj = getBusyOverlay( 'viewport', { color: 'black', opacity: 0.5, text: 'processing..', style: 'text-decoration: blink; font-weight: bold; font-size: 12px; clor: white;' } );
      $.ajax({
        type: "POST",
        url: "./api/name2image",
        data: { name: name },
        success: function( result ){
          obj.remove();
          console.log( result );
          if( result.status && result.urls ){
            var inner = '';
            result.urls.forEach( function( url ){
              var figure = '<figure>'
                + '<img src="' + url + '" width="100%"/>'
                + '</figure>';
              inner += figure;
            });

            $('#mycarousel').html( '<div id="mycarousel-inner"></div>' );
            $('#mycarousel-inner').html( inner );
            $('#mycarousel-inner').slick({
              arrows: true,
              autoplay: false,
              infinite: false,
              initialSlide: 0,
              slidesToShow: 3,
              slidesToScroll: 1
            });
          }
        },
        error: function( e0, e1, e2 ){
          obj.remove();
          console.log( e1 );
        }
      });
    }

    return false;
  });
});
