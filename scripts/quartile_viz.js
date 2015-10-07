var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');

var _d = JSON.parse(fs.readFileSync( // eslint-disable-line no-underscore-dangle
      path.join(__dirname, 'parsed_data', 'data.json'), { encoding: 'utf-8' }));

var chartData = generateChartData(_d);
writeChartsToDisk(chartData);

function generateChartData(csv) {
  return csv.map(function(d) {
    return {
      donor: d['Name of Donor'],
      data: [
        +d['Q21_Rank'] || 62,
        +d['Q25_Rank'] || 62,
        +d['Q14_Rank'] || 62
      ]
    };
  });
}

function writeChartsToDisk(data, i) {
  if (!i) i = 0;
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    scripts: [ 'http://d3js.org/d3.v3.min.js' ],
    done: function(err, window) {
      if (err) {
        return;
      }
      var svg = getChart(window, data[i]);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'quartile_chart_' + data[i].donor + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      if (++i < data.length) writeChartsToDisk(data, i);
    }
  });
}

function getChart(window, ranks) {
  var d3 = window.d3;
  var PX_RATIO = 4 / 3;

  var labelData = [
    'Agenda Setting Influence',
    'Helpfulness in Implementation',
    'Usefulness of Advice'
  ];

  var w = 525 * PX_RATIO,
      h = 125 * PX_RATIO;

  var qWidth = 90 * PX_RATIO,
      qHeight = 15 * PX_RATIO,
      qMargin = 10 * PX_RATIO,
      qTransX = 80 * PX_RATIO,
      qTransY = 15 * PX_RATIO;

  var markerW = 6 * PX_RATIO,
      markerH = 30 * PX_RATIO;

  var qAreaW = (4 * qWidth) + (3 * qMargin);

  var numberOfDonors = 62;

  var svg = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);

  var bars = svg.append('g')
    .attr('transform', translation(qTransX, qTransY));

  bars.selectAll('.bars')
    .data([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2])
    .enter()
    .append('rect')
      .attr('x', function(d, i) { return (qWidth + qMargin) * (i % 4); })
      .attr('y', function(d) { return d * 40 * PX_RATIO; })
      .attr('width', qWidth)
      .attr('height', qHeight)
      .attr('fill', '#000')
      .attr('fill', function(d, i) {
        switch (i % 4) {
          case 0:
            return '#92b5d8';
          case 1:
            return '#76b657';
          case 2:
            return '#FFDD75';
          case 3:
            return '#E31E1E';
        }
      });

  var labels = svg.append('g')
    .attr('transform', translation(0, qTransY));

  labels.selectAll('.label')
    .data(labelData)
    .enter()
    .append('text')
      .text(function(d) { return d; })
      .attr('x', 10)
      .attr('y', function(d, i) { return i * 45 * PX_RATIO; })
      .call(wrap);


  svg.append('g').attr('transform', translation(qTransX, 10))
    .selectAll('.description')
    .data(['Best Performing', 'Median', 'Worst Performing'])
    .enter()
    .append('text')
      .text(function(d) { return d; })
      .attr('y', -2)
      .attr('x', function(d, i) {
        switch (i) {
          case 0:
            return 0;
          case 1:
            return qAreaW / 2;
          case 2:
            return qAreaW - 110;
        }
      })
      .attr('text-anchor', function(d, i) {
        switch (i) {
          case 0:
            return 'left';
          case 1:
            return 'middle';
          case 2:
            return 'right';
        }
      });

  // median markers
  svg.append('g').attr('transform', translation(qTransX, qTransY - 10)).selectAll('.marker')
    .data([0, 1, 2])
    .enter()
    .append('rect')
      .attr('x', (qAreaW - markerW) / 2)
      .attr('y', function(d) { return d * 41 * PX_RATIO; })
      .attr('width', markerW)
      .attr('height', markerH)
      .attr('fill', '#A9A9A9');

  // rank markers
  svg.append('g').attr('transform', translation(qTransX, qTransY - 10)).selectAll('.rankMarker')
    .data(ranks.data)
    .enter()
    .append('rect')
      .attr('x', function(d) { return (d / numberOfDonors) * qAreaW; })
      .attr('y', function(d, i) { return i * 41 * PX_RATIO; })
      .attr('width', markerW)
      .attr('height', markerH)
      .attr('fill', '#000');

  // rank marker labels
  svg.append('g').attr('transform', translation(qTransX, qTransY - 10)).selectAll('.rankMarkerLabel')
    .data(ranks.data)
    .enter()
    .append('text')
      .text(ranks.donor.replace('_', ' '))
      .attr('x', function(d) { return (d / numberOfDonors) * qAreaW + 15; })
      .attr('y', function(d, i) { return i * 40 * PX_RATIO + (markerH) + 5; });

  svg.selectAll('text')
    .style('font-family', 'Open Sans, sans-serif')
    .style('font-size', '14');

  function translation(x, y) {
    return 'translate(' + (x * PX_RATIO) + ',' + (y * PX_RATIO) + ')';
  }

  // remix of http://bl.ocks.org/mbostock/7555321 that will run in jsdom
  // shout out to @mbostock, luh u boo
  function wrap(text) {
    text.each(function() {
      var text = d3.select(this), // eslint-disable-line no-shadow
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr('y'),
          dy = 0,
          tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (line.join().length > 14) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', ++lineNumber * lineHeight + dy + 'em')
            .text(word);
        }
      }
    });
  }
  return window.document.getElementsByTagName('svg')[0];
}
