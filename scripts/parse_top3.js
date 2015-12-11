var fs = require('fs');
var path = require('path');
var parser = require('csv-parse');
var async = require('async');

try {
  fs.mkdirSync(path.join(__dirname, 'parsed_data'));
}
catch(e) {
  if (e.code !== 'EEXIST') throw e;
}

async.map([
    read('WBG_Region_top_3.csv'),
    read('WBG_Region.csv') ],
    parseCSV,
    join);

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

  csvParser.write(csv);
  csvParser.end();
}

function join(err, data) {
  if (err) throw err;
  var top3 = data[0];
  top3 = top3.reduce(function(out, curr) {
    if (!(curr.WBG_Region in out))
    {
      out[curr.WBG_Region] = {};
      for (var i = 0; i < top3.length; i++)
      {
        var rank = top3[i];
        if (rank.WBG_Region === curr.WBG_Region)
        {
          if (!(rank.q in out[curr.WBG_Region]))
          {
            out[curr.WBG_Region][rank.q] = [];
          }
          out[curr.WBG_Region][rank.q].push(rank);
        }
      }
    }
    return out;
  }, {});
  var countries = data[1];
  countries = countries.map(function(c) {
    c.rankings = top3[c.WBG_Region];
    return c;
  });

  write(countries);
}

function read(fname) {
  return fs.readFileSync(path.join(
        __dirname, '..', 'data', fname), { encoding: 'utf-8' });
}

function write(data) {
  fs.writeFileSync(path.join(
      __dirname, '..', 'data', 'rankings.json'),
      JSON.stringify(data),
      { encoding: 'utf-8' });
}
