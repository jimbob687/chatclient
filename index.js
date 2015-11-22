//var app = require('express')();
var express = require('express');
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser());     // This is for cookies
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
var json = require('express-json');
app.use(json());       // to support JSON-encoded bodies
var crypto = require('crypto');


var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql     =    require('mysql');
var config    =    require('config');    // Taken from https://www.npmjs.com/package/config
//var tnfauth = require('./tnfauth.js');
var fs = require('fs');

var authapi = require('./authapi.js');


// Hash of the socket connections, key is the clientID and value is the socket object
var socketHash = {};

/*
var pool      =    mysql.createPool({
    connectionLimit : 10, //important
    host     : 'localhost',
    user     : 'nodejs',
    password : 'xxxxxxxxx',
    database : 'nodejs',
    debug    :  false
});
*/

var chatdbconfig = config.get('chatdb.dbConfig');
var pool      =    mysql.createPool(dbConfig);

var fedDbConfig = config.get('feddb.dbConfig');
global.fedpool   =    mysql.createPool(fedDbConfig);



// Get the configuration for the api server
GLOBAL.apiServerConfig = config.get('apiserver');

GLOBAL.requestConfig = config.get('request');


function handle_database(from,msg) {
    
  pool.getConnection(function(err,connection){
    if (err) {
      connection.release();
      res.json({"code" : 100, "status" : "Error in connection database"});
      return;
    }   

    console.log('connected as id ' + connection.threadId);
        
    connection.query("select * from users",function(err,rows){
      connection.release();
      if(!err) {
        //res.json(rows);
        console.log(rows);
      }           
      else {
        console.log("Error querying db: " + err);
      }
    });

    connection.on('error', function(err) {      
      res.json({"code" : 100, "status" : "Error in connection database"});
      return;     
    });

  });
}

// queryProfileAPI: function(username, password, jesessionid, callback)

function authClient(username, password, req, res) {

  authapi.queryAuthAPI(username, password, function(err, authJson) {

    if (!err) {
      if(authJson == null) {
        console.log("Error, authJson is null");
      }
      else if("success" in authJson) {
        var successVal = authJson["success"];
        if(successVal == "true") {
          if("sessionid" in authJson) {
            var sessionID = authJson["sessionid"];
            console.log("This sessionID: " + sessionID);
            res.cookie('chatsession', sessionID, { maxAge: 900000, httpOnly: true });
            res.send( { "success": true } );
            res.status(200);
            adminProfile(sessionID);   // get the profile details for the admin
          }
          else {
            console.log("sessionid not found in return json");
          }
        }
        else if(successVal == "false") {
          console.log("Error, unable to authenticate user");
          res.status(404);
        }
        else{
          console.log("Error, unable to determine success value: " + successVal);
          res.status(404);
        }
      }
    }
    else {
      var errMsg = null;
      if("message" in authJson) {
        errMsg = authJson.message;
      }
      console.log("Error, unable to authenticate user, error message: " + errMsg);
      res.status(404);
      res.send(errMsg);
    }

  });

}

// Get the admin profile information
function adminProfile(sessionID) {

  authapi.queryProfileAPI(sessionID, function(err, profileJson) {

    if (!err) {
      if(profileJson == null) {
        console.log("Error, profileJson is null");
      }
      /*
      else if("success" in authJson) {
        var successVal = authJson["success"];
        if(successVal == "true") {
          if("sessionid" in authJson) {
            var sessionID = authJson["sessionid"];
            console.log("This sessionID: " + sessionID);
            //res.cookie('chatsession', sessionID, { maxAge: 900000, httpOnly: true });
            //res.send( { "success": true } );
            //res.status(200);
          }
          else {
            console.log("sessionid not found in return json");
          }
        }
        else if(successVal == "false") {
          console.log("Error, unable to authenticate user");
          //res.status(404);
        }
        else{
          console.log("Error, unable to determine success value: " + successVal);
          //res.status(404);
        }
      }
      */
    }
    else {
      var errMsg = null;
      if("message" in profileJson) {
        errMsg = profileJson.message;
      }
      console.log("Error, unable to get profile details for user, error message: " + errMsg);
      //res.status(404);
      //res.send(errMsg);
    }

  });

}


app.get('/', function(req, res){
  res.sendfile('index.html');
});

// This is for authentication
app.post("/login", function(req, res) {
    console.log("Have received a login request." + req.body);
    if(req.body.username && req.body.password) {
        //console.log("username: " + req.body.username + "    passwd: " + req.body.password);
        console.log("username: " + req.body.username);
        authClient(req.body.username, req.body.password, req, res);
        //tnfauth.check_auth(req.body.username, req.body.password)
        // check username and password
        //if(authenticated) {
            // create a token and store it with the current date (if you want it to expire)
        //    var token = generateAndStoreRandomString(req.body.username);
        //    res.redirect("http://your.domain/path?token=" + token);
        //    return;
        //}
        // Do something if username or password wrong
    }
    // Do something if no username or password
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('message', function(message) {
    // Adapted from the following link to be able to send a cookie thru when connecting. 
    // http://stackoverflow.com/questions/4753957/socket-io-authentication
    if(message.rediskey) {
      console.log("rediskey: " + message.rediskey);
      // set the key of the socket
      socket.rediskey = message.rediskey;

      // Add the socket to the hash
      socketHash[message.rediskey] = socket;
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat message', function(from, msg){
    console.log('message: ' + msg + " from: " + from);
    io.emit('chat message', msg);
    handle_database(from,msg);
    // Get the key of the socket
    console.log('Chat message by ', socket.rediskey);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');

  app.use('/css', express.static(__dirname + '/css'));

});




