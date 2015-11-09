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
  writeChart();
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
      var svg = getChart(window, d.data.donors);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'bar_chart_' +
          d.recipient.replace(/ /g, '_') + '_' + d.data.type + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      bar.tick();
      if (i < dat.length) writeChart(++i);
    }
  });
}

function getChart(window, data) {
  var colors = [ '#7c7c7c', '#ffdd75', '#e66233' ];

  var d3 = window.d3;
  var PX_RATIO = 4 / 3;

  var w = 500 * PX_RATIO,
      h = 300 * PX_RATIO;

  var barWidth = 150 * PX_RATIO;

  var x = d3.scale.ordinal()
    .domain(data.map(function(d) { return d.donor; }))
    .rangeRoundBands([0, w], .05);

  var y = d3.scale.linear()
    .domain([0, d3.max(data.map(function(d) { return d.amount; }))])
    .range([0, h]);

  var svg = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);

  var bars = svg.append('g');

  bars.selectAll('.bar')
    .data(data)
    .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', function(d, i) { return x(d.donor) + i / 2; })
      .attr('y', function(d) { return h - y(d.amount); })
      .attr('width', barWidth)
      .attr('height', function(d) { return y(d.amount); })
      .attr('fill', function(d, i) { return colors[i]; });

  var labels = svg.append('g');
  labels.selectAll('text')
    .data(data)
    .enter().append('text')
      .text(function(d) { return d.donor + ' - ' + d.amount; })
        .attr('x', function(d) { return x(d.donor) + 30; })
        .attr('y', function(d) { return h - y(d.amount) + 20; });

  return window.document.getElementsByTagName('svg')[0];
}

