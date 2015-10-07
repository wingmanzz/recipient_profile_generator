var fs = require('fs');
var path = require('path');
var extend = require('xtend');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');

var data = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'parsed_data', 'data.json'), { encoding: 'utf-8' }));
var averages = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'parsed_data', 'average.json'), { encoding: 'utf-8' }));


var bubbleData = generateBubbleChartData(data, averages);

writeChartsToDisk(bubbleData);


function generateBubbleChartData(rawData, averageData) {
  var averageBubbleData = {
    dac: {
      pgc1: {
        q21: +averageData[1]['Q21_PGC1'],
        q14: +averageData[1]['Q14_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        q21: +averageData[1]['Q21_PGC2'],
        q14: +averageData[1]['Q14_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        q21: +averageData[1]['Q21_PGC3'],
        q14: +averageData[1]['Q14_PGC3'],
        oda: Math.random() * 5
      }
    },
    nonDac: {
      pgc1: {
        q21: +averageData[2]['Q21_PGC1'],
        q14: +averageData[2]['Q14_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        q21: +averageData[2]['Q21_PGC2'],
        q14: +averageData[2]['Q14_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        q21: +averageData[2]['Q21_PGC3'],
        q14: +averageData[2]['Q14_PGC3'],
        oda: Math.random() * 5
      }
    },
    multi: {
      pgc1: {
        q21: +averageData[0]['Q21_PGC1'],
        q14: +averageData[0]['Q14_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        q21: +averageData[0]['Q21_PGC2'],
        q14: +averageData[0]['Q14_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        q21: +averageData[0]['Q21_PGC3'],
        q14: +averageData[0]['Q14_PGC3'],
        oda: Math.random() * 5
      }
    }
  };

  var allBubbleData = [];
  var obj, name, type;
  for (var i = 0; i < rawData.length; i++) {
    name = rawData[i]['Name of Donor'];
    if (rawData[i]['Multilateral'])
      type = 'multi';
    else if (rawData[i]['DAC Bilateral'])
      type = 'dac';
    else
      type = 'nonDac';
    obj = {};
    obj[name] = {
      pgc1: {
        type: type,
        q14: +rawData[i]['Q14_PGC1'],
        q21: +rawData[i]['Q21_PGC1'],
        oda: Math.random() * 5
      },
      pgc2: {
        type: type,
        q14: +rawData[i]['Q14_PGC2'],
        q21: +rawData[i]['Q21_PGC2'],
        oda: Math.random() * 5
      },
      pgc3: {
        type: type,
        q14: +rawData[i]['Q14_PGC3'],
        q21: +rawData[i]['Q21_PGC3'],
        oda: Math.random() * 5
      }
    };
    allBubbleData.push(flatten(averageBubbleData).concat(flatten(obj)));
  }
  return allBubbleData;
}

function flatten(d) {
  var flattened = [];
  for (var key in d) {
    for (var sub in d[key]) {
      var bubble = {
        donor: key,
        type: sub
      };
      bubble = extend(bubble, d[key][sub]);
      flattened.push(bubble);
    }
  }
  return flattened;
}

function writeChartsToDisk(bData, i) {
  if (!i) i = 0;
  var donor = bData[i].filter(function(d) {
    return ['multi', 'dac', 'nonDac'].indexOf(d.donor) < 0;
  })[0].donor;
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html><div class="chart"></div>',
    scripts: [ 'http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js' ],
    done: function(err, window) {
      if (err) throw err;
      var svg = getChart(window, bData[i]);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'bubble_chart_' + donor + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      if (++i < bData.length) writeChartsToDisk(bData, i);
    }
  });
}

function getChart(window, _data) {
  var d3 = window.d3;

  var PX_RATIO = 4 / 3;

  var width = 280 * PX_RATIO;
  var height = 130 * PX_RATIO;
  var margin = 35 * PX_RATIO;

  var labelX = 'Official Development Assistance (USD in Millions)';
  var labelY = 'Level of Usefulness of Advice (1-5)';

  var svg = d3.select('.chart')
    .append('svg')
    .attr('attr', 'chart')
    .attr('width', width + 2 * margin)
    .attr('height', height + 2 * margin)
    .append('g')
    .style('font-family', 'Open Sans')
    .style('font-size', '12px')
    .attr('transform', 'translate(' + margin + ',' + margin + ')');

  var x = d3.scale.linear()
    .domain([
      d3.min(_data, function(d) { return d.oda; }),
      d3.max(_data, function(d) { return d.oda; })
    ])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([
      d3.min(_data, function(d) { return d.q14; }),
      d3.max(_data, function(d) { return d.q14; })
    ])
    .range([height, 0]);

  var scale = d3.scale.linear()
    .domain([
      d3.min(_data, function(d) { return d.q21; }),
      d3.max(_data, function(d) { return d.q21; })
    ])
    .range([0, 20]);

  var xAxis = d3.svg.axis().scale(x);
  var yAxis = d3.svg.axis().scale(y).orient('left');

  // y axis
  svg.append('g')
    .attr('class', 'y axis')
    .style('shape-rendering', 'crispEdges')
    .style('stroke', '#000')
    .style('fill', 'none')
    .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin + 1)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(labelY);

  // x axis
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .style('shape-rendering', 'crispEdges')
    .style('stroke', '#000')
    .style('fill', 'none')
    .call(xAxis)
    .append('text')
      .attr('x', width / 2)
      .attr('y', margin - 10)
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text(labelX);

  // circles
  svg.append('g').selectAll('circle')
    .data(_data)
    .enter()
    .insert('circle')
    .attr('opacity', 0.8)
    .attr('r', function(d) { return scale(d.q21) * 1.2; })
    .style('fill', function(d) {
      switch (d.donor) {
        case 'dac':
          return '#76b657';
        case 'nonDac':
          return '#92b5d8';
        case 'multi':
          return '#e66233';
        default:
          if (d.type === 'dac') {
            return '#76b657';
          } else if (d.type === 'nonDac') {
            return '#92b5d8';
          } else {
            return '#e66233';
          }
      }
    })
    .attr('cx', function(d) { return x(d.oda); })
    .attr('cy', function(d) { return y(d.q14); });


  // bubble labels
  svg.append('g').selectAll('.labels')
    .data(_data)
    .enter()
    .append('text')
      .text(function(d) { return d.donor.replace(/_/g, ' '); })
      .attr('x', function(d) { return x(d.oda); })
      .attr('y', function(d) { return y(d.q14); })
      .style('text-anchor', 'middle');

  d3.selectAll('text')
    .style('fill', '#000')
    .style('font-family', 'Open Sans')
    .style('font-size', '8')
    .style('font-weight', 'normal')
    .style('stroke', 'none');

  return window.document.getElementsByTagName('svg')[0];
}
