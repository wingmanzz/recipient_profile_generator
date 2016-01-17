/* eslint camelcase: [0] */
var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');
var ProgressBar = require('progress');

var d3lib = fs.readFileSync('scripts/d3.min.js').toString();

var recipientData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'parsed_data', 'data.json'), { encoding: 'utf-8' }));
    
var nameMappings = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'parsed_data', 'q_mapping.json'), { encoding: 'utf-8' }));

var bar = new ProgressBar('Generating spider chart [:bar] :percent', { total: recipientData.length });

for (var idx = 0; idx < recipientData.length; idx++) {
  var q21s = Object.keys(recipientData[idx]).filter(function(key) {
    return key.indexOf('Q21_PT') > -1;
  }).map(function(key) {
  
  	var nameFound = nameMappings.filter(function(item) {
    	return item.id == key;
	});
    return {
      type: key,
      score: +recipientData[idx][key],
      name: nameFound[0].shorttext,
      indicator: nameFound[0].indicator,
    };
  });
  q21s.sort(function(a, b) {
    return b['score'] - a['score'];
  });

  writeChartToDisk({
    recipient: recipientData[idx]['orgname'],
    q21s: q21s
  });
}

function writeChartToDisk(data, i) {
  if (!i) i = 0;
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    src: [d3lib],
    done: function(err, window) {
      if (!err)
      {
		  var svg = getChart(window, data.q21s);
		  fs.writeFileSync(
			path.join(__dirname, '..', 'graphics', 'spider_chart_' +
				data.recipient.replace(/ /g, '_') + '.svg'),
			xmlserializer.serializeToString(svg),
			{ encoding: 'utf-8' }
		  );
	  }
	  else
	  {
	  	console.log("skipping: "+data.recipient);
	  }
      bar.tick();
    }
  });
}

function getChart(window, data) {

  var d3 = window.d3;
  //var PX_RATIO = 4 / 3;

  var w = 600,
      h = 600;

  var PI = Math.PI;
  var n = data.length;

  var COLOR = '#161f34';

  var CENTER_CIRCLE_RADIUS = 100;
  var CHILD_RADIUS = 37;

  var svg = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);

  svg.append('g').selectAll('line')
      .data(data)
    .enter().append('svg:line')
      .attr('class', 'child')
      .attr('x1', w / 2)
      .attr('y1', h / 2)
      .attr('x2', function(d, i) {
        // draw to the edge of the outer circles
        var angle = (2 * PI / n) * i;
        var x1 = w / 2;
        var y1 = h / 2;
        var x2 = Math.cos((2 * PI / n) * i) * 200 + (h / 2) - Math.cos(100);
        var y2 = Math.sin((2 * PI / n) * i) * 200 + (h / 2) - Math.sin(100);
        var dist = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
        var radius = CHILD_RADIUS;
        var hypo = dist - radius;
        var x = x1 + hypo * Math.cos(angle);
        return x;
      })
      .attr('y2', function(d, i) {
        // draw to the edge of the outer circles
        var angle = (2 * PI / n) * i;
        var x1 = w / 2;
        var y1 = h / 2;
        var x2 = Math.cos((2 * PI / n) * i) * 200 + (h / 2) - Math.cos(100);
        var y2 = Math.sin((2 * PI / n) * i) * 200 + (h / 2) - Math.sin(100);
        var dist = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
        var radius = CHILD_RADIUS;
        var hypo = dist - radius;
        var y = y1 + hypo * Math.sin(angle);
        return y;
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

  svg.append('g').append('circle')
    .attr('cx', w / 2)
    .attr('cy', h / 2)
    .attr('r', CENTER_CIRCLE_RADIUS)
    .attr('fill', COLOR);

  svg.append('g').selectAll('circle.child')
      .data(data)
    .enter().append('svg:circle')
      .attr('class', 'child')
      .attr('cx', function(d, i) { return Math.cos((2 * PI / n) * i - PI / 2) * 200 + (w / 2); })
      .attr('cy', function(d, i) { return Math.sin((2 * PI / n) * i - PI / 2) * 200 + (h / 2); })
      .attr('r', CHILD_RADIUS)
      .attr('fill', COLOR)
      .attr('opacity', function(d, i) { return 1 - (0.5 * (i / n)); });

  svg.append('g').selectAll('.label')
      .data(data)
    .enter().append('text')
      .attr('x', function(d, i) { return Math.cos((2 * PI / n) * i - PI / 2) * 200 + (w / 2); })
      .attr('y', function(d, i) { return Math.sin((2 * PI / n) * i - PI / 2) * 200 + (h / 2); })
      .text(function(d) {return d.name; });

  svg.append('g')
    .append('text')
      .text('Influence in Addressing')
      .attr('x', w / 2)
      .attr('y', h / 2);
  svg.append('g')
    .append('text')
      .text('Different Problem Areas')
      .attr('x', w / 2)
      .attr('y', 20 + h / 2);

  d3.selectAll('text')
    .style('fill', '#fff')
    .style('font-family', 'Open Sans')
    .style('text-anchor', 'middle');

  return window.document.getElementsByTagName('svg')[0];
}

