var fs = require('fs');
var path = require('path');
var parser = require('csv-parse');
var queue = require('queue-async');

try {
  fs.mkdirSync(path.join(__dirname, 'parsed_data'));
}
catch(e) {
  if (e.code !== 'EEXIST') throw e;
}

queue()
  .defer(parseCSV, read('WBG_Region_top_3.csv'))
  .defer(parseCSV, read('WBG_Region.csv'))
  .awaitAll(join);

function parseCSV(csv, cb) {
  var data = [];
  var header = true;
  var row, record, head;

  var csvParser = parser();

  csvParser.on('readable', function() {
    while (record = csvParser.read()) {
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

  csvParser.on('finish', function() {
    cb(null, data);
  });

  csvParser.on('error', function(err){
    cb(err.message);
  });

}

function join(err, data) {
  if (err) throw err;
  var top3 = data[0];
  var region = data[1];
  console.log(top3);
  console.log(region);
}

function read(fname) {
  return fs.readFileSync(path.join(__dirname, '..', 'data', fname), { encoding: 'utf-8' });
}
