var fs = require("fs"),
	handler = require('./handler');

var lines = -1;

exports.parselog = function(f) {

	var watcher = setInterval(function() {
		var data = fs.readFileSync(f);

		var currline = -1;

		var datalines = data.toString().split("\n");

		for(key in datalines) {
			currline++;
		}

		if(lines == -1)
			lines = currline;

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

	}, 50);

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