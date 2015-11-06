var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');
var fetchRecipients = require('./fetch_recipients');
var Promise = require('promise');
var ProgressBar = require('progress');

fetchRecipients()
  .then(generateRandomPieData)
  .then(writeChartsToDisk)
  .catch(function(err) { console.log(err); });

function generateRandomPieData(data) {
  setBar(data.count);
  var recipients = data.recipients;
  return new Promise(function(resolve) {
    resolve(recipients.map(function(d) {
      function getData() {
        return [ 1, 2, 3, 4, 5, 6 ].map(function(i) {
          return {
            donor: d.name + ' donor ' + i,
            amount: Math.random()
          };
        });
      }
      return {
        recipient: d.name,
        donors: {
          dac: getData(),
          multi: getData(),
          nondac: getData()
        }
      };
    }));
  });
}

var pairs = [];
var allData;
function writeChartsToDisk(d) {
  allData = d;
  for (var i = 0; i < allData.length; i++) {
    for (var key in allData[i].donors) {
      pairs.push({
        idx: i,
        recipient: allData[i].recipient,
        group: key
      });
    }
  }
  writeChart();
}

var bar;
function setBar(total) {
  bar = new ProgressBar('Progress [:bar] :percent', { total: total });
}

function writeChart(i) {
  if (!i) i = 0;
  var p = pairs[i];
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    scripts: [ 'http://d3js.org/d3.v3.min.js' ],
    done: function(err, window) {
      if (err) return;
      var svg = getChart(window, allData[p.idx].donors[p.group]);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'pie_chart_' + p.recipient.replace(/ /g, '_') + '_' + p.group + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      bar.tick();
      if (i < pairs.length) writeChart(++i);
    }
  });
}

function getChart(window, data) {
  var d3 = window.d3;
  var PX_RATIO = 4 / 3;

  var w = 500 * PX_RATIO,
      h = 500 * PX_RATIO,
      r = Math.min(w, h) / 2;

  var color = d3.scale.ordinal()
    .range([ '#161f34', '#ffdd75', '#76b657', '#92b5d8', '#e66233', '#7c7c7c' ]);

  var arc = d3.svg.arc()
    .outerRadius(r - 10)
    .innerRadius(0);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.amount; });

  var svg = d3.select('body').append('svg')
      .attr('width', w)
      .attr('height', h)
    .append('g')
      .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');

  var g = svg.selectAll('arc')
      .data(pie(data))
    .enter().append('g')
      .attr('class', 'arc');

  g.append('path')
    .attr('d', arc)
    .style('fill', function(d) { return color(d.data.amount); });

  g.append('text')
    .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .text(function(d) { return d.data.donor; });

  svg.selectAll('text')
    .style('font-family', 'Open Sans, sans-serif')
    .style('color', '#fff');

  return window.document.getElementsByTagName('svg')[0];
}
