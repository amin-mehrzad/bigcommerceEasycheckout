var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://0f54ee11.ngrok.io:2500/appDB";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});