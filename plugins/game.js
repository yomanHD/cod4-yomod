var handler = require('./../handler');
var vars = require('./../vars');
var log = require('./../log');
var players = require('./../players');

function plugin() {}

plugin.prototype.init = function() {

	handler.registerEvent("nextmap", function(data) {
		var dvars = new Array();
		var i = 0;

		for(i = 1; i < data.length; i += 2) {
			dvars[data[i]] = data[i + 1];
		}
		vars.setDvars(dvars);

		if(vars.getDvar("_yomod") == false)  {
			log.write(2, "Detected Server restart!", true);
			handler.triggerEvent("ServerRestart");
			players.resetEverything();
		}
			

	});

}

module.exports = new plugin;

