/* eslint new-cap: [0] */
var deasync = require('deasync');
var request = require('request');
var concat = require('concat-stream');
var SIZE = 50;

var recipients = [];
fetchRecipients();

function fetchRecipients(page) {
  if (!page) page = 0;
  request
    .get('http://api.aiddata.org/data/destination/organizations?size=' + SIZE + '&from=' + SIZE * page)
    .on('error', function(err) { /*console.error(err);*/ })
    .pipe(concat(function(data) {
      data = JSON.parse(data);
      recipients = recipients.concat(data.hits);
      if ((page + 1) * SIZE <= data.count) {
        page++;
        fetchRecipients(page);
      } else {
        fetchDonors();
      }
    }));
}

var donors = [];

function fetchDonors(page) {
  if (!page) page = 0;
  request
    .get('http://api.aiddata.org/data/origin/organizations?size=' + SIZE + '&from=' + SIZE * page)
    .on('error', function(err) { /*console.error(err);*/ })
    .pipe(concat(function(data) {
      data = JSON.parse(data);
      donors = donors.concat(data.hits);
      if ((page + 1) * SIZE <= data.count) {
        page++;
        fetchDonors(page)
      } else {
        fetchPairs();
      }
    }))
}

var results = {};
var p = [];

function fetchPairs() {
  for (var i = 0; i < recipients.length; i++) {
    results[recipients[i].name] = {
      donors: [],
      meta: recipients[i]
    };
    for (var j = 0; j < donors.length; j++) {
      p.push([i, j]);
    }
  }
  fetchPair();
}

function fetchPair(i) {
  if (!i) i = 0;
  var req = 'http://api.aiddata.org/flows/destination?fo=' + donors[p[i][1]].id + '&ro=' + recipients[p[i][0]].id + '&from=0&y=2004,2005,2006'; 
  request
    .get(req)
    .on('error', function(err) { /*console.error(err);*/ })
    .pipe(concat(function(data) {
      try {
        data = JSON.parse(data);
        if (data.item_count > 0)
          console.log(data);
        if (recipients[p[i][0]] && data.item_count > 0)
          results[recipients[p[i][0]].name].donors.push({
            donor: donors[p[i][1]],
            data: data
          });
          console.log(JSON.stringify(results[recipients[p[i][0]].name], null, 2));
      } catch (e) {
        console.log(req);
      }
      if (i < p.length) {
        i++;
        fetchPair(i);
      }
    }));
}