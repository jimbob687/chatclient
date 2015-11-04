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


/*
 * Take a password and the saltKey and convert to a Base64 string to match with what is in the db 
*/
function encodePasswd(passwd, saltKey) {

  var ITERATION_COUNT = 1;
  //String encodedPassword = null;

  var saltByteArr = [];
  saltByteArr = new Buffer(saltKey, 'base64');
  // convert salt to a byte array
  //for (var i = 0; i < saltKey.length; ++i) {
  //  bytes.push(saltKey.charCodeAt(i));
  //}

  var shasum = crypto.createHash('sha256');
  shasum.update(saltByteArr);

  // byte[] btPass = digest.digest(password.getBytes("UTF-8"));

  var passUTF8 = unescape(encodeURIComponent(passwd));

  var passArr = [];
  for (var i = 0; i < passUTF8.length; i++) {
    arr.push(utf8.charCodeAt(i));
  }

  var btPass = shasum.update(passUTF8);

  for(var i = 0; i < ITERATION_COUNT; i++) {
    //digest.reset();
    btPass = shasum(btPass);
  }

  // encode the byte array into Base64
  var encodedPassword = new Buffer(btPass, 'binary').toString('base64');

  return encodedPassword;
}




