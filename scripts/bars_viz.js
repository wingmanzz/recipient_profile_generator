var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');
var Promise = require('promise');
var ProgressBar = require('progress');
var R = require('ramda');

parseData()
  .then(writeChartsToDisk)
  .catch(function(err) { console.log(err); });

function readData() {
  return JSON.parse(fs.readFileSync(path.join(
          __dirname, '..', 'data', 'rankings.json')));
}

function parseData() {
  var prob = {
    '21': 'agenda',
    '14': 'use',
    '25': 'help'
  };
  return new Promise(function(resolve) {
    resolve(readData().map(function(r) {
      return {
        recipient: r['CountryID'],
        data: Object.keys(r.rankings).map(function(q) {
          var ranks = r.rankings[q].map(function(donor) {
            return {
              donor: donor['Donor_ID'],
              amount: +donor.estimate
            };
          });
          return {
            type: prob[q],
            donors: sort(ranks)
          };
        })
      };
    }));
  });
}

function sort(arr) {
  arr = R.sort(function(a, b) {
    return a.amount - b.amount;
  }, arr);
  var sorted = [];
  sorted.push(arr[1]);
  sorted.push(arr[2]);
  sorted.push(arr[0]);
  return sorted;
}

var dat = [];
var bar;
function writeChartsToDisk(d) {
  bar = new ProgressBar('Generating tiny bar charts [:bar] :percent', { total: d.length * 3 });
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
  if (i == dat.length) return;
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
      .text(function(d) { return d.donor + ' - ' + Math.round(d.amount * 100) / 100; })
        .attr('x', function(d) { return x(d.donor) + 30; })
        .attr('y', function(d) { return h - y(d.amount) + 20; });

  d3.selectAll('text')
    .style('fill', '#fff')
    .style('font-family', 'Open Sans')
    .style('text-anchor', 'middle');


  return window.document.getElementsByTagName('svg')[0];
}
