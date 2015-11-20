var fs = require('fs');
var path = require('path');
var parser = require('csv-parse');

try {
  fs.mkdirSync(path.join(__dirname, 'parsed_data'));
}
catch(e) {
  if (e.code !== 'EEXIST') throw e;
}

parse(read('DP_Profiles_Raw_Data_CNTR_DATA_TEAM.csv'), 'data.json');

function parse(csv, outfile) {
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
    fs.writeFile(
      path.join(__dirname, 'parsed_data', outfile),
      JSON.stringify(data),
      { encoding: 'utf-8' }
    );
  });

  csvParser.write(csv);
  csvParser.end();

}

function read(fname) {
  return fs.readFileSync(path.join(__dirname, '..', 'data', fname), { encoding: 'utf-8' });
}
