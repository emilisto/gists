#!/usr/bin/env node

var request = require('request'),
    sprintf = require('sprintf').sprintf,
    path = require('path'),
    fs = require('fs'),
    urlify = require('urlify').create({
      spaces: '-'
    });

var username = 'emilisto';

function saveGist(gist) {

    var name = urlify(gist.description).toLowerCase();

    if(!path.existsSync(name)) {
      console.log('Created ' + name);
      fs.mkdirSync(name);
    }

    for(var i in gist.files) {
      if(gist.files.hasOwnProperty(i)) {
        var file = gist.files[i];
        var filePath = sprintf('%s/%s', name, file.filename);

        request(file.raw_url, (function(filePath) {
          return function(error, response, body) {
            if(!error) {
              fs.writeFile(filePath, body, function(err) {
                if(!err) console.log('Wrote ' + filePath);
              });
            }
          }
        }(filePath)));
      }
    }
};

var url = sprintf('https://api.github.com/users/%s/gists', username);
request(url, function(error, response, body) {

  if(error || response.statusCode !== 200) {
    console.error(sptintf('error: couldn\t get gist: %s', error.toString()));
    return;
  }

  var data = JSON.parse(body);
  for(var i = 0; i < data.length; i++) {
    var gist = data[i];
    saveGist(gist);
  }

});
