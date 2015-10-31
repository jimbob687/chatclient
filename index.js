var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql     =    require('mysql');


// Hash of the socket connections, key is the clientID and value is the socket object
var clientHash = {};

var pool      =    mysql.createPool({
    connectionLimit : 10, //important
    host     : 'localhost',
    user     : 'nodejs',
    password : 'xxxxxxxx',
    database : 'nodejs',
    debug    :  false
});

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


app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(from, msg){
    console.log('message: ' + msg + " from: " + from);
    io.emit('chat message', msg);
    handle_database(from,msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

