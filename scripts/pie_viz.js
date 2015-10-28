var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');

writeChartsToDisk();

function generateRandomPieData() {
  return [ 1, 2, 3, 4, 5, 6 ].map(function() {
    var donor = '';
    var j = 7;
    while (j--) {
      donor += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        .charAt(Math.floor(Math.random() * 51));
    }
    return {
      donor: donor,
      amount: Math.random()
    };
  });
}

function writeChartsToDisk(data, i) {
  if (!i) i = 0;
  data = [ 1, 2, 3, 4, 5, 6 ].map(generateRandomPieData);
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    scripts: [ 'http://d3js.org/d3.v3.min.js' ],
    done: function(err, window) {
      if (err) return;
      var svg = getChart(window, data[i]);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'pie_chart_' + data[i].donor + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      if (++i < data.length) writeChartsToDisk(data, i);
    }
  });
}

function getChart(window, data) {
  var d3 = window.d3;
  var PX_RATIO = 4 / 3;

  var w = 900 * PX_RATIO,
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
    .text(function(d) { console.log(d); return d.data.donor; });

  return window.document.getElementsByTagName('svg')[0];
}
