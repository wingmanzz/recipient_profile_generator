var fs = require('fs');
var path = require('path');
var parser = require('csv-parse');

try {
  fs.mkdirSync(path.join(__dirname, 'parsed_data'));
}
catch(e) {
  if (e.code !== 'EEXIST') throw e;
}

var dataCSV = fs.readFileSync(
  path.join(__dirname, 'data/data.csv'), { encoding: 'utf-8' });
var countryCSV = fs.readFileSync(
  path.join(__dirname, 'data/country.csv'), { encoding: 'utf-8' });
var aiddataIdCSV = fs.readFileSync(
  path.join(__dirname, 'data/donor_recipient_id_crosswalk.csv'), { encoding: 'utf-8' });
var averageCSV = fs.readFileSync(
  path.join(__dirname, 'data/averages.csv'), { encoding: 'utf-8' });

parse('data', dataCSV);
parse('country', countryCSV);
parse('crosswalk', aiddataIdCSV);
parse('average', averageCSV);

function parse(fname, csv) {
  var data = fname === 'country' ? {} : [];
  var header = true;
  var row, record, head;

  var dataCSVParser = parser();

  dataCSVParser.on('readable', function() {
    while (record = dataCSVParser.read()) {
      if (!header) {
        row = {};
        if (fname === 'country') {
          data[record[0]] = record[3];
        } else {
          for (var i = 0; i < record.length; i++) {
            row[head[i]] = record[i];
          }
          data.push(row);
        }
      } else {
        head = record;
        header = false;
      }
    }
  });

  dataCSVParser.on('finish', function() {
    fs.writeFile(
      path.join(__dirname, 'parsed_data', fname + '.json'),
      JSON.stringify(data),
      { encoding: 'utf-8' }
    );
  });

  dataCSVParser.write(csv);
  dataCSVParser.end();

}
