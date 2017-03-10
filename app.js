var express = require('express');
var app = express();

app.use(express.static(__dirname + '/dist'));

var port = 8080;
console.log("Express server running on " + port);
app.listen(port);

app.route('/*').get(function(req, res) { 
    res.sendFile('index.html', { root: __dirname + '/dist' });
});