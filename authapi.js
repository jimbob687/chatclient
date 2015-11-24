var request = require('request');    // https://www.npmjs.com/package/request

/*
* Server to get user information off. Will make requests to the server and expect json in return
*/


module.exports = {

  queryAuthAPI: function(username, password, callback) {

    var serverURL = apiServerConfig.protocol + "://" + apiServerConfig.serverhostname + ":" + apiServerConfig.serverport;

    var authURI = "/mytannfe/auth/AdminApiAuth.do";

    var formData = {form:{ username: username, password: password}}

    request.post(serverURL + apiServerConfig.authpath, formData, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        logger.debug(body); 
        callback(false, JSON.parse(body));
      }
      else {
        logger.error("Error making request: " + body);
        callback(true, JSON.parse(body));
      }
    })
  },

  queryProfileAPI: function(jsessionID, callback) {
    // Query the profile for an admin using the jsessionid

    var serverURL = apiServerConfig.protocol + "://" + apiServerConfig.serverhostname + ":" + apiServerConfig.serverport + apiServerConfig.profilepath;

    //var authURI = "/mytannfe/auth/AdminApiAuth.do";

    request.defaults({jar: true});
    if(requestConfig.verbose == true) {
      request.debug = true;
    }

    var j = request.jar();
    var cookieVal = "JSESSIONID=" + jsessionID;
    var cookie = request.cookie(cookieVal);
    var cookieHostName = apiServerConfig.protocol + "://" + apiServerConfig.serverhostname;
    j.setCookie(cookie, cookieHostName);
    if(requestConfig.verbose == true) {
      logger.info("apiServerConfig.serverhostname: " + apiServerConfig.serverhostname);
      logger.info("Cookie JAR: " + j.getCookieString(apiServerConfig.serverhostname));
    }


    request( { method: 'POST', url: serverURL, jar: j }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        if(requestConfig.verbose == true) {
          logger.debug(body) // Print the response
        }
        callback(false, JSON.parse(body));
      }
      else if( response.statusCode == 302) {
        if(requestConfig.verbose == true) {
          logger.debug("Redirect has been generated, need to log user in");
        }
        callback(true, { "authenticated" : false, "statuscode": response.statusCode });
      }
      else {
        if(requestConfig.verbose == true) {
          logger.error("Error making request: " + body);
        }
        callback(true, JSON.parse(body));
      }
    })
  }

}
