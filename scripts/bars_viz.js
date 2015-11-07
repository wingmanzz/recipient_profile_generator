var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');
var fetchRecipients = require('./fetch_recipients');
var Promise = require('promise');
var ProgressBar = require('progress');

fetchRecipients()
  .then(generateRandomBarData)
  .then(writeChartsToDisk)
  //.then(function(d) { console.log(JSON.stringify(d, null, 2)); })
  .catch(function(err) { console.log(err); });

function generateRandomBarData(data) {
  var recipients = data.recipients;
  return new Promise(function(resolve) {
    resolve(recipients.map(function(r) {
      var donors = [ 'China', 'Germany', 'France' ];
      return {
        recipient: r.name,
        data: [
          {
            type: 'agenda',
            donors: donors.map(function(d, i) {
              return {
                donor: d,
                amount: 3 + i
              };
            })
          },
          {
            type: 'use',
            donors: donors.map(function(d, i) {
              return {
                donor: d,
                amount: 3 + i
              };
            })
          },
          {
            type: 'help',
            donors: donors.map(function(d, i) {
              return {
                donor: d,
                amount: 3 + i
              };
            })
          }
        ]
      };
    }));
  });
}

var dat = [];
var bar;
function writeChartsToDisk(d) {
  bar = new ProgressBar('Progress [:bar] :percent', { total: d.length * 3 });
  for (var i = 0; i < d.length; i++) {
    for (var j = 0; j < d[i].data.length; j++) {
      dat.push({
        data: d[i].data[j],
        recipient: d[i].recipient
      });
    }
  }
  dat.forEach(function(_d) {
    console.log(JSON.stringify(_d, null, 2));
  });
}

function writeChart(i) {
  if (!i) i = 0;
  var d = dat[i];
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    scripts: [ 'http://d3js.org/d3.v3.min.js' ],
    done: function(err, window) {
      if (err) return;
      var svg = getChart(window, d.data);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'bar_chart_' +
          d.recipient.replace(/ /g, '_') + '_' + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      bar.tick();
      if (i < dat.length) writeChart(++i);
    }
  });
}

function getChart() {}

