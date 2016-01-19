var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var xmlserializer = require('xmlserializer');
var fetchRecipients = require('./fetch_recipients');
var Promise = require('promise');
var ProgressBar = require('progress');
var request = require('sync-request');
var R = require('ramda');

var d3lib = fs.readFileSync('scripts/d3.min.js').toString();

var donorcw = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'parsed_data', 'name_mapping_origin.json'), { encoding: 'utf-8' }));

var orgtype = JSON.parse(fs.readFileSync(
      path.join(__dirname, 'parsed_data', 'donor_org.json'), { encoding: 'utf-8' }));


fetchRecipients()
  .then(generatePieData)
  .then(writeChartsToDisk)
  .catch(function(err) { console.log("error"); });


function findDonor(cw, oid)
{
	if (oid == -1)
		return ("Other");
	for (var i = 0; i < cw.hits.length; i++) 
	{
		if (cw.hits[i]['id'] == oid) 
		{
			return cw.hits[i]['name']
		}
	}
	return -1
}
function getODAById (rcvId, type)
{	
	var alloda= [];
    
    
    console.log("Getting Top ODA for: "+rcvId,type);
	var url = 'http://api.aiddata.org/flows/origin?ro='+rcvId+'&y=2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013';
	var res = request('GET', url);
	var oda_json = JSON.parse(res.getBody('utf8'));
	for (var i = 0; i < oda_json.item_count; i++)
	{
		var oda = {id: oda_json.items[i].source._id,
			type:'None',
			oda: oda_json.items[i].total};
			
		// find type (dac/nondac etc)
		for (var x=0; x<orgtype.length; x++) 
		{
			if (orgtype[x].id == oda.id && orgtype[x].type == type) 
			{
				oda.type = orgtype[x].type;
				alloda.push(oda)
			}
		}
	}
	return alloda;
}

function generatePieData(data) {
  setBar(data.count);
  var recipients = data.recipients;
  return new Promise(function(resolve) {
    resolve(recipients.map(function(d) {
      function getData(type) {
      	oda = getODAById(d.id, type);
      	
      	var other = {id:-1, oda:0};
      	for (v = 5; v < oda.length; v++)
      	{
      		other.oda = other.oda + oda[v].oda;
      	}
      
      	function order(a, b) { return b.amount - a.amount; } 
  		oda = R.take(5, R.sort(order, oda));
  		if (other.oda > 0)
  			oda.push(other)
        return oda.map(function(d) {
          return {
            donor: findDonor(donorcw, d.id),
            amount: d.oda
          };
        });
      }
      return {
        recipient: d.name,
        donors: {
          dac: getData('DAC'),
          multi: getData('Multilateral'),
          nondac: getData('Non-DAC')
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
  bar = new ProgressBar('Generating pie charts [:bar] :percent', { total: total });
}

function writeChart(i) {
  if (!i) i = 0;
  var p = pairs[i];
  if (i >= pairs.length) return;
  jsdom.env({
    features: { QuerySelector: true },
    html: '<!DOCTYPE html>',
    src: [ d3lib ],
    done: function(err, window) {
      if (err) return;
      var svg = getChart(window, allData[p.idx].donors[p.group]);
      fs.writeFileSync(
        path.join(__dirname, '..', 'graphics', 'pie_chart_' +
          p.recipient.replace(/ /g, '_') + '_' + p.group + '.svg'),
        xmlserializer.serializeToString(svg),
        { encoding: 'utf-8' }
      );
      if (i < pairs.length) writeChart(++i);
      bar.tick();
    }
  });
}
function formatMoney( money )
{
	if (money > 1000000)
	{
		money = Math.round(money/1000000);
		money = "$"+money+"M";
	}
	else
	{
		money = Math.round(money/1000);
		money = "$"+money+"K";
	}
	return money;
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
    
    g.append('text')
    .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
    .attr('dy', '25px')
    .style('text-anchor', 'middle')
    .text(function(d) { return formatMoney(d.data.amount); });

  svg.selectAll('text')
    .style('font-family', 'Open Sans, sans-serif')
    .style('fill', '#fff');

  return window.document.getElementsByTagName('svg')[0];
}
