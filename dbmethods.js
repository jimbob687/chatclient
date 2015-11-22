
module.exports = {

  insertChatSession: function(jsessionid, adminID, callback) {
    
    pool.getConnection(function(err,connection){
      if (err) {
        connection.release();
        res.json({"code" : 100, "status" : "Error in connection database"});
        return;
      }   

      if(chatdbconfig.debug) {
        console.log('connected as id ' + connection.threadId);
      }
        
      connection.query("INSERT INTO chatsessions (jsessionid, adminID, expiretime) VALUES (?,?,(now() + INTERVAL ? SECOND)), jsessionid, adminID, 3600, function(err,result){
        connection.release();
        if(!err) {
          var chatsessionID = result.insertId;    // key for the record that has just been inserted
          callback(chatsessionID);
        }           
        else {
          console.log("Error inserting chatsession into db: " + err);
        }
      });

      connection.on('error', function(err) {      
        res.json({"code" : 100, "status" : "Error in connection database"});
        return;     
      });

    });
  }
}

