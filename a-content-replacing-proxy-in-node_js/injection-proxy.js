//
// injection-proxy.js
// Emil Stenqvist <emsten@gmail.com>
//
// Free for all!
//
// A content-replacing proxy in node.js.
//
// I made this for debugging JavaScript on a live website.
//
// Instead of reproducing the error locally by either downloading the entire
// site, or coding together a (hopefully) equivalent scenario, I thought it'd be
// nicer to be able to replace the JavaScript on the site with a locally modified
// version.
//
// Specify URL:s to override with a local file in the `injections` object.
//
//
// One could improve this into a version of dotjs (https://github.com/defunkt/dotjs)
// that doesn't require a browser plugin.
//

var http = require('http'),
    fs = require('fs');

// If path is absolute, it is relative to environment's CWD, naturally.
var injections = {
  'http://www.google-analytics.com/ga.js': 'fake.js'
};


var port = port || 8083;

http.createServer(function(request, response) {


  var injectFile = injections[request.url];
  // If URL matches: send local file as response
  if(injectFile) {

    console.log('** "' + request.url + '": serving "' + injectFile + '" instead');

    fs.readFile(injectFile, function(err, data) {
      if(err) {
        response.writeHead(404);
      } else {
        response.write(data, 'binary');
      }

      response.end();
    });

  // else just pass it one as normal
  } else {

    // (Got this snippet from http://www.catonmat.net/http-proxy-in-nodejs/, laziness for the win)
    var parts = request.headers['host'].split(':'),
        host = parts[0], port = parts[1] || 80;

    var proxy = http.createClient(port, host)
    var proxy_request = proxy.request(request.method, request.url, request.headers);

    proxy_request.addListener('response', function (proxy_response) {
      proxy_response.addListener('data', function(chunk) {
        response.write(chunk, 'binary');
      });
      proxy_response.addListener('end', function() {
        response.end();
      });
      response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });
    request.addListener('data', function(chunk) {
      proxy_request.write(chunk, 'binary');
    });
    request.addListener('end', function() {
      proxy_request.end();
    });

  }

}).listen(post);
