/* eslint new-cap: [0] */
var request = require('request');
var concat = require('concat-stream');
var SIZE = 50;

var recipients = [];
fetchPage(0);

function fetchPage(page) {
  request
    .get('http://api.aiddata.org/data/destination/organizations?size=' + SIZE + '&from=' + SIZE * page)
    .on('error', function(err) { console.error(err); })
    .pipe(concat(function(data) {
      data = JSON.parse(data);
      recipients = recipients.concat(data.hits);
      if ((page + 1) * SIZE <= data.count) {
        page++;
        fetchPage(page);
      } else {
        agg(recipients);
      }
    }));
}

function agg(data) {
  data.forEach(function(recipient) {
    console.log(recipient);
  });
}

