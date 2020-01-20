//. records_api.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    client = require( 'cheerio-httpcli' ),
    fs = require( 'fs' ),
    router = express.Router();
var settings = require( '../settings' );

router.use( bodyParser.urlencoded( { limit: '10mb', extended: true } ) );
router.use( bodyParser.json() );

//. Watson Language Translator
var lt3 = require( 'ibm-watson/language-translator/v3' );
var { IamAuthenticator } = require( 'ibm-watson/auth' );
var lt = new lt3({
  version: '2018-05-01',
  authenticator: new IamAuthenticator({
    apikey: settings.watson_lt_apikey
  }),
  url: settings.watson_lt_url
});

router.post( '/name2image', function( req, res ){
  res.contentType( 'application/json; charset=utf-8' );

  var name = mytrim( req.body.name );
  if( name ){
    imagesearch( name ).then( function( urls ){
      //console.log( urls );
      res.write( JSON.stringify( { status: true, urls: urls }, 2, null ) );
      res.end();
    }).catch( function( err ){
      console.log( err );
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: err }, 2, null ) );
      res.end();
    });
  }else{
    res.status( 400 );
    res.write( JSON.stringify( { status: false, error: 'parameter "name" required.' }, 2, null ) );
    res.end();
  }
});


function translate( text, src, dst ){
  return new Promise( function( resolve, reject ){
    if( lt ){
      var params = {
        text: text,
        source: src,
        target: dst
      };
      lt.translate( params ).then( function( result ){
        //console.log( result );
        if( result.result.translations ){
          //console.log( JSON.stringify( result.result.translations ) );
          resolve( { status: true, translation: result.result.translations[0].translation } );
        }else{
          resolve( { status: false, error: 'not translated.' } );
        }
      }).catch( function( err ){
        resolve( { status: false, error: err } );
      });
    }else{
      resolve( { status: false, error: 'Language Translator not initialized.' } );
    }
  });
}

function imagesearch( text ){
  return new Promise( function( resolve, reject ){
    //console.log( 'imagesearch: text = ' + text );
    var query = "";
    var cnt = 0;
    for( var i = 0; i < text.length; i ++ ){
      var c = text.charAt( i );
      translate( c, 'ja', 'en' ).then( function( t ){
        if( query.length > 0 ){ query += " "; }
        if( t.status && t.translation ){
          query += t.translation;
        }

        cnt ++;
        if( cnt == text.length ){
          var url = 'https://www.google.com/search?q=' + query + '&source=lnms&tbm=isch';

          //console.log( 'imagesearch: url = ' + url );
          client.fetch( url, {}, 'UTF-8', function( err, $, res, body ){
            if( err ){
              console.log( err );
              reject( err );
            }else{
              //saveToFile( body, './debug.txt' );
              var urls = [];
              $('img[data-src]').each( function(){
                var imgurl = $(this).attr( 'data-src' );
                urls.push( imgurl );
              });
              if( urls.length == 0 ){
                $('img[data-iurl]').each( function(){
                  var imgurl = $(this).attr( 'data-iurl' );
                  urls.push( imgurl );
                });
              }
              resolve( urls );
            }
          });
        }
      });
    }
  });
}

function mytrim( str ){
  return str.replace( /[\s|　]/g, '' );
}

function saveToFile( text, filename ){
  fs.writeFileSync( filename, text, 'utf-8' );
}


module.exports = router;
