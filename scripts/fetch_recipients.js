var request = require('request');
var concat = require('concat-stream');
var Promise = require('promise');
var SIZE = 50;

var recipients = [];

function fetchRecipients() {
  return new Promise(function(resolve) {
    fetch(null, resolve);
  });
}

function fetch(page, cb) {
  if (!page) page = 0;
  request
    .get('http://api.aiddata.org/data/destination/organizations?size=' + SIZE + '&from=' + SIZE * page)
    .on('error', function(err) { console.error(err); })
    .pipe(concat(function(data) {
      data = JSON.parse(data);
      recipients = recipients.concat(data.hits);
      if ((page + 1) * SIZE <= data.count) {
        page++;
        fetch(page, cb);
      } else {
        cb(recipients);
      }
    }));
}

module.exports = fetchRecipients;

