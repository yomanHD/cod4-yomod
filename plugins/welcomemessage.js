var handler = require('./../handler');
var rcon = require('./../rcon');
var players = require('./../players').players;
var vars = require('./../vars');

function plugin() {}

plugin.prototype.init = function() {

	vars.setDefaultCV("welcomemessage", "enabled", '0');
	vars.setDefaultCV("welcomemessage", "whisper", '1');

	handler.registerEvent("playerjoin", function(data) {

		if(vars.getCV("welcomemessage", "enabled") == '0')
			return false;

		var guid = data[1];

		var group = players[guid].getGroup();

		if(vars.existsCV("welcomemessage", group)) {
			var search = ["<PLAYER_NAME>", "<GUID>", "<PID>", "GROUP_NAME"];
			var replace = [players[guid].name, guid, players[guid].pid, group];

			var welcomemessage = vars.getCV("welcomemessage", group);

			for(key in search) {
				welcomemessage = welcomemessage.replace(search[key], replace[key]);
			}

			if(vars.getCV("welcomemessage", "whisper") == '1' && welcomemessage != undefined) {
				players[guid].say(welcomemessage);
			} else {
				rcon.rcon("say " + welcomemessage);
			}
		}

	});

}

module.exports = new plugin;