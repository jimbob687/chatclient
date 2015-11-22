
//var dbConfig = config.get('chatdb.dbConfig');
//var pool      =    mysql.createPool(dbConfig);

//var fedDbConfig = config.get('feddb.dbConfig');
//global.fedpool   =    mysql.createPool(fedDbConfig);


module.exports = {

  handle_database: function(jsessionid, adminID, callback) {
    
    pool.getConnection(function(err,connection){
      if (err) {
        connection.release();
        res.json({"code" : 100, "status" : "Error in connection database"});
        return;
      }   

      console.log('connected as id ' + connection.threadId);
        
      connection.query("INSERT INTO chatsessions (jsessionid, adminID, expiretime) VALUES (?,?,(now() + INTERVAL ? SECOND)), jsessionid, adminID, 3600, function(err,rows){
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
}

