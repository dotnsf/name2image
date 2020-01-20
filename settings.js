
exports.watson_lt_apikey = '';
exports.watson_lt_url = '';

if( process.env.VCAP_SERVICES ){
  var VCAP_SERVICES = JSON.parse( process.env.VCAP_SERVICES );
  if( VCAP_SERVICES && VCAP_SERVICES.language_translator ){
    exports.watson_lt_apikey = VCAP_SERVICES.language_translator[0].credentials.apikey;
    exports.watson_lt_url = VCAP_SERVICES.language_translator[0].credentials.url;
  }
}
