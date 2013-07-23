var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());

app.get('/', function(request, response) {
 buf = fs.readFileSync('index.html');
 var htmlString = buf.toString();
 response.send(htmlString);
});


app.use(express.static('public'));

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});

