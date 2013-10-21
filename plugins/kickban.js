var handler = require('./../handler');
var log = require('./../log');
var vars = require('./../vars');
var rcon = require('./../rcon');
var players = require('./../players');

function plugin() {}

plugin.prototype.init = function() {

	var playerlist = players.players;

	handler.registerCommand("kick", function(data) {
		var player = players.getPlayerbyName(data.message[0]);

		if(player == undefined || !player) {
			player = players.getPlayerbyPID(data.message[0]);
		}

		if(player == undefined || !player) {
			log.write(1, "Player not found!", true);
			return false;
		}

		var kicker = playerlist[data.guid].name;

		data.message.shift();
		var reason = data.message.join(" ");

		if(reason[0] == ".")
			reason = vars.getCV("kickban", reason.replace(".", ""));

		player.kick(reason, kicker);

	});

	handler.registerCommand("ban", function(data) {
		var player = players.getPlayerbyName(data.message[0]);

		if(player == undefined || !player) {
			player = players.getPlayerbyPID(data.message[0]);
		}

		if(player == undefined || !player) {
			log.write(1, "Player not found!", true);
			return false;
		}

		var kicker = playerlist[data.guid].name;

		data.message.shift();
		var reason = data.message.join(" ");

		if(reason[0] == ".")
			reason = vars.getCV("reasons", reason.replace(".", ""));

		player.ban(reason, kicker);

	});

	handler.registerCommand("tempban", function(data) {
		var player = players.getPlayerbyName(data.message[0]);

		if(player == undefined || !player) {
			player = players.getPlayerbyPID(data.message[0]);
		}

		if(player == undefined || !player) {
			log.write(1, "Player not found!", true);
			return false;
		}

		var kicker = playerlist[data.guid].name;
		var time = data.message[1];
		if(typeof parseInt(time) == "number") {
			console.log("NUMVER");
		}
		
		var reason = data.message.join(" ");

		if(reason[0] == ".")
			reason = vars.getCV("kickban", reason.replace(".", ""));

		player.tempBan(reason, kicker, time);

	});

}

module.exports = new plugin;