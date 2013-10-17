var fs = require("fs"),
	chokidar = require('chokidar'),
	handler = require('./handler');

exports.parselog = function(f) {

	var lines = -1;

	fs.readFile(f, function(err, data) {
		var openlines = data.toString().split("\n");

		openlines.forEach(function(line) {
			lines++;
		});
	});

	var watcher = chokidar.watch(f, {ignored: /^\./, persistent: true});

	watcher.on('change', function(path, stats) {
		fs.readFile(path, function(err, data) {
			if(err)
				console.log(err);

			var currline = -1;

			var datalines = data.toString().split("\n");

			datalines.forEach(function() {
				currline++;
			});

			if(currline > lines) {
				for(var i = lines;i<=currline;i++) {
					//currline = lines;
					//var dotrigger = true;

					var line = datalines[i];

					var parts = datalines[i].split(/;|\\|;/);
					
					parts[0] = parts[0].trim().split(" ")[1];

					if(line == "" || parts[0] == "------------------------------------------------------------")
						continue;

					parts[0] = getAction(parts[0]);
					handler.triggerEvent(parts[0], parts);

				}
				lines = currline;
			} else {
				currline = -1;
				console.log("file is smaller than before...", currline, lines);
			}	
		});
	});

}

function getAction(action) {
	var actions = new Array();
	actions["say"] = "say";
	actions["J"] = "playerjoin";
	actions["D"] = "damage";
	actions["K"] = "kill";
	actions["Q"] = "playerquit";
	actions["sayteam"] = "sayteam";
	actions["jointeam"] = "jointeam";
	actions["InitGame:"] = "nextmap";
	actions["ExitLevel: executed"] = "mapend";
	actions["ShutdownGame:"] = "exitmap";
	
	action = action.trim();
	return actions[action];
}