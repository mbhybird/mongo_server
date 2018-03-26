var http = require('http');

var server = http.createServer(function(req, res){
  if (req.url != '/events') return res.end();
  res.writeHead(200, { 'Content-Type': 'text/event-stream' });
  var id = setInterval(function(){
  	//JSON.stringify({eventTime:Date.now()})
    res.write('data: ' + Date.now() + '\n\n');
  }, 1000);
  req.on('end', function(){
    clearInterval(id);
  });
});

server.listen(3000);
console.log("sse listen on port:3000");

/*
$ curl http://localhost:3000/events
data: 1394572346452

data: 1394572347457

data: 1394572348463
*/

/*
npm install segmentio/sse-stream

var http = require('http');
var sse = require('sse-stream');
var Readable = require('stream').Readable;

http.createServer(function(req, res){
  objectStream().pipe(sse()).pipe(res);
}).listen(3000);

function objectStream(){
  var stream = new Readable({ objectMode: true });
  var i = 0;
  stream._read = function(){
    this.push({
      foo: ++i
    });
    if (i == 3) this.push(null);
  }
  return stream;
}

$ curl http://localhost:3000
data: {"foo":1}

data: {"foo":2}

data: {"foo":3}
*/