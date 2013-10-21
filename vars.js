var log = require('./log');
var fs = require('fs');

function vars() {}

var configs = new Array();
var admins = new Array();
var groups = new Array();
var language = new Array();
var dvars = new Array();

vars.prototype.getAdmins = function() {
	return admins;
}

vars.prototype.parseConfig = function(file) {
	fs.readFile(file, function(err, data) {
		if(err) {
			log.write(3, err, true);
			return false;
		}

		var lines = data.toString().split('\n');

		var section = "";

		lines.forEach(function(line) {
			var foundsmth = false;
			

			line = line.trim();

			if(line == "")
				foundsmth = true;

			//Comments
			if(line[0] == ";")
				return;

			if(line[0] == "[") {
				var tmp = line.split("]");

				if(tmp[0] == undefined) {
					log.write(3, "Config: Error parsing line: " + line, true);
				}

				section = tmp[0].trim().substring(1);
				configs[section] = new Array();
				foundsmth = true;
			}

			if(foundsmth == false && section != "") {
				line = line.split("=");
				var key = line[0].trim();
				var value = line[1].trim();

				if(line[0] == undefined && line[1] == undefined) {
					log.write(3, "Config: Error parsing line: " + line, true);
					return false;
				}

				if(value == "null")
					value = null;

				value = value.replace(/"|'/g, function(matched) {
					return "";
				});

				if(configs[section] != undefined) {
					configs[section][key] = value;
				}

			}
		});

		log.write(0, "Config file was successfully read!", true);

	});

}

vars.prototype.parseAdmins = function(file) {
	fs.readFile(file, function(err, data) {
		if(err) {
			log.write(3, err, true);
			return false;
		}

		var lines = data.toString().split('\n');

		var admin = "";

		lines.forEach(function(line) {
			var foundsmth = false;
			

			line = line.trim();

			if(line == "")
				foundsmth = true;

			//Comments
			if(line[0] == ";")
				return;

			if(line[0] == "[") {
				var tmp = line.split("]");

				if(tmp[0] == undefined) {
					log.write(3, "Admins: Error parsing line: " + line, true);
				}

				admin = tmp[0].trim().substring(1);
				admins[admin] = new Array();
				foundsmth = true;
			}

			if(foundsmth == false && admin != "") {
				line = line.split("=");
				var key = line[0].trim();
				var value = line[1].trim();

				if(line[0] == undefined && line[1] == undefined) {
					log.write(3, "Admins: Error parsing line: " + line, true);
					return false;
				}

				if(value == "null")
					value = null;

				value = value.replace(/"|'/g, function(matched) {
					return "";
				});

				if(admins[admin] != undefined) {
					admins[admin][key] = value;
				}

			}
		});

		log.write(0, "Admins file was successfully read!", true);

	});
	
}

vars.prototype.parseGroups = function(file) {
	fs.readFile(file, function(err, data) {
		if(err) {
			log.write(3, err, true);
			return false;
		}

		var lines = data.toString().split('\n');

		var group = "";

		lines.forEach(function(line) {
			var foundsmth = false;
			

			line = line.trim();

			if(line == "")
				foundsmth = true;

			//Comments
			if(line[0] == ";")
				return;

			if(line[0] == "[") {
				var tmp = line.split("]");

				if(tmp[0] == undefined) {
					log.write(3, "Admins: Error parsing line: " + line, true);
				}

				group = tmp[0].trim().substring(1);
				groups[group] = new Array();
				foundsmth = true;
			}

			if(foundsmth == false && group != "") {
				line = line.split("=");
				var key = line[0].trim();
				var value = line[1].trim();

				if(line[0] == undefined && line[1] == undefined) {
					log.write(3, "Admins: Error parsing line: " + line, true);
					return false;
				}

				if(value == "null")
					value = null;

				value = value.replace(/"|'/g, function(matched) {
					return "";
				});

				if(groups[group] != undefined) {
					groups[group][key] = value;
				}

			}
		});

		log.write(0, "Groups file was successfully read!", true);

	});
	
}

vars.prototype.parseLanguageFile = function(file) {
	fs.readFile(file, function(err, data) {
		if(err) {
			log.write(3, err, true);
			return false;
		}

		var lines = data.toString().split("\n");

		lines.forEach(function(line) {
			line = line.split("=");

			if(line[0] == undefined && line[1] == undefined) {
				log.write(3, "Language: Error parsing line: " + line, true);
				return false;
			}

			var key = line[0].trim();
			var value = line[1].trim();

			if(value == "null")
				return false;

			value = value.replace(/"|'/g, function(matched) {
				return "";
			});

			language[key] = value;

		});

		log.write(0, "Language file was successfully read!", true);

	});

}

vars.prototype.parseTextFile = function(file, callback) {
	fs.readFile(file, function(err, data) {
		if(err) {
			log.write(3, err, true);
			return false;
		}

		var lines = data.toString().split("\n");

		log.write(0, "Textfile was successfully read!", true);

		callback(lines);
	});
}

vars.prototype.getLngString = function(name, search, replace) {
	if(language[name] == undefined  && language[name] == "") {
		log.write(3, "MISSING TRANSLATION FOR '" + name + "'", true);
		return "## ^1MISSING TRANSLATION FOR '^2" + name + "^1' ^7##";
	}

	var lngString = language[name];

	if(lngString != undefined) {
		for(key in search) {
			lngString = lngString.replace(search[key], replace[key]);
		}

		return lngString;
	}
	return "## ^1MISSING TRANSLATION FOR '^2" + name + "^1' ^7##";
}

vars.prototype.getCV = function(section, key) {

	if(configs[section] != undefined && configs[section][key] != undefined)
		return configs[section][key];
	
	return false;
}

vars.prototype.existsCV = function(section, key) {

	if(configs[section] != undefined && configs[section][key] != undefined)
		return true;
	
	return false;
}

vars.prototype.setDefaultCV = function(section, key, value) {
	if(configs[section] == undefined) {
		configs[section] = new Array();
	}

	if(configs[section][key] == undefined) {
		configs[section][key] = value;
	}
}

vars.prototype.getAdminGroup = function(guid) {
	if(admins[guid] != undefined)
		return admins[guid]["name"];

	return "default";
} 

vars.prototype.getGroup = function(name) {
	if(groups[name] != undefined)
		return groups[name];

	return false;
}

vars.prototype.getGroupName = function(name) {
	if(groups[name] != undefined && groups[name]["name"] != undefined)
		return groups[name]["name"];

	return false;
}

vars.prototype.setDvars = function(dvararray) {
	for(key in dvararray) {
		if(dvararray[key] != undefined && dvararray[key] != "")
			dvars[key] = dvararray[key];
	}
}

vars.prototype.setDvar = function(dvar, value) {
	dvars[dvar] = value;
}

vars.prototype.getDvar = function(dvar) {
	if(dvars[dvar] != undefined)
		return dvars[dvar];
}

vars.prototype.getTextFile = function(name) {
	return textfiles[name];
}

module.exports = new vars;