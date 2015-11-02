/*
File to auth users if that is the option that is used
*/


/*
SELECT adm.userName, adm.first_name, adm.last_name, adm.adminID, pass.passhash, pass.salt, al.locked " +
"FROM admins adm " +
"JOIN adminpasswd pass ON adm.adminID = pass.adminID AND pass.status = ? " +
"LEFT OUTER JOIN adminlocked al ON adm.adminID = al.adminID AND al.status = ? AND al.locked = ? " +
"WHERE adm.userName = ? AND adm.status = ?";
*/



function check_auth(username,passwd) {

  fedpool.getConnection(function(err,connection){
    if (err) {
      connection.release();
      res.json({"code" : 100, "status" : "Error in connection to federal database"});
      return;
    }

    console.log('connected as id ' + connection.threadId);

    connection.query('SELECT adm.userName, adm.first_name, adm.last_name, adm.adminID, pass.passhash, pass.salt, al.locked ' +
      'FROM admins adm ' +
      'JOIN adminpasswd pass ON adm.adminID = pass.adminID AND pass.status = ? ' +
      'LEFT OUTER JOIN adminlocked al ON adm.adminID = al.adminID AND al.status = ? AND al.locked = ? ' +
      'WHERE adm.userName = ? AND adm.status = ?', 'active', 'active', 'n', username, 'active',
      function(err,rows) {
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


