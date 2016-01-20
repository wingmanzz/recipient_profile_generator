var fs = require('fs');
var path = require('path');
var parser = require('csv-parse');

try {
  fs.mkdirSync(path.join(__dirname, 'parsed_data'));
}
catch(e) {
  if (e.code !== 'EEXIST') throw e;
}

function parse_file(file_name,out_file)
{
	parse(read(file_name), out_file);

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
}

parse_file('DP_Profiles_Raw_Data_CNTR_DATA_TEAM.csv','data.json');
parse_file('q_name_mapping.csv','q_mapping.json');
parse_file('donor_org.csv','donor_org.json');


function read(fname) {
  return fs.readFileSync(path.join(__dirname, '..', 'data', fname), { encoding: 'utf-8' });
}
