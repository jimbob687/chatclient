var request = require('request');    // https://www.npmjs.com/package/request

/*
* Server to get user information off. Will make requests to the server and expect json in return
*/


module.exports = {

  queryAuthAPI: function(username, password) {

    var serverURL = apiServerConfig.protocol + "://" + apiServerConfig.serverhostname + ":" + apiServerConfig.serverport;

    var authURI = "/mytannfe/auth/AdminApiAuth.do";

    var formData = {form:{ username:'XXXXXX', password:'XXXXXXXXX'}}

    request.post(serverURL + authURI, formData, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
      }
      else {
        console.log("Error making request: " + body);
      }
    })
  }

}
