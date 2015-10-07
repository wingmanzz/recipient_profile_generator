var fs = require('fs');
var path = require('path');
var parse = require('csv-parse');

var dataCSV = fs.readFileSync(path.join(__dirname, 'data/data.csv'), { encoding: 'utf-8' });

parseData(dataCSV);

function parseData(csv) {
  var data = [];
  var header = true;
  var row, record, head;

  var dataCSVParser = parse();

  dataCSVParser.on('readable', function() {
    while (record = dataCSVParser.read()) {
      if (!header) {
        row = {};
        for (var i = 0; i < record.length; i++) {
          row[head[i]] = record[i];
        }
        data.push(row);
      } else {
        head = record;
        header = false;
      }
    }
  });

  dataCSVParser.on('finish', function() {
    formatData(data);
  });

  dataCSVParser.write(csv);
  dataCSVParser.end();
}

function formatData(data) {
  var output = [];
  var average = {
    pgc1: data.map(function(d) {
      return d['Q14_PGC1'];
    }).reduce(function(t, n) {
      return +t + +n;
    }, 0) / data.length,
    pgc2: data.map(function(d) {
      return d['Q14_PGC2'];
    }).reduce(function(t, n) {
      return +t + +n;
    }, 0) / data.length,
    pgc3: data.map(function(d) {
      return d['Q14_PGC3'];
    }).reduce(function(t, n) {
      return +t + +n;
    }, 0) / data.length
  };
  for (var i = 0; i < data.length; i++) {
    var donor = {
      pgc1: data[i]['Q14_PGC1'],
      pgc2: data[i]['Q14_PGC2'],
      pgc3: data[i]['Q14_PGC3']
    };
    output.push({
      donor: data[i]['Name of Donor'],
      data: donor,
      average: average
    });
  }
  console.log(JSON.stringify(output));
}
