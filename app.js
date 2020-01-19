//. app.js
var express = require( 'express' ),
    ejs = require( 'ejs' ),
    api = require('./routes/api'),
    app = express();

app.use( '/api', api );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );
app.use( express.static( __dirname + '/public' ) );


app.get( '/', function( req, res ){
  res.render( 'index', {} );
});


var port = process.env.port || 3000;
app.listen( port );
console.log( "server stating on " + port + " ..." );
