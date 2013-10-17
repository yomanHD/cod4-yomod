var handler = require('./../handler');
var log = require('./../log');
var players = require('./../players').players;

var express = require("express");
var app = express();

function plugin() {}

var data = [];
var chatlog = [];

plugin.prototype.init = function() {

	handler.newTimer(5000, "jsonplayerstats", function() {
		var count = 0;
		data = [];
		for(key in players) {
			var playerdata = {
				name: players[key].name,
				guid: players[key].guid.substring(0, 8),
				pid: players[key].pid,
				joined: players[key].joined,
				team: players[key].team,
				kills: players[key].kills,
				deaths: players[key].deaths,
				teamkills: players[key].teamkills,
				teamdeaths: players[key].teamdeaths,
				selfkills: players[key].selfkills,
				headshots: players[key].headshots,
				lastcommand: players[key].lastcommand,
				lastweaponkill: players[key].lastweaponkill,
				lastweapondeath: players[key].lastweapondeath,
				damagegiven: players[key].damagegiven,
				teamdamagegiven: players[key].teamdamagegiven,
				damagetaken: players[key].damagetaken,
				lastvictim: players[key].lastvictim,
				lastkiller: players[key].lastkiller
			}
			data.push(playerdata);
		}
	});

	handler.registerEvent("say", function(data) {
		data.shift();
		chatlog.push(data);
	});
}

app.get("/servername/players", function(req, res) {
	res.send(JSON.stringify(data));
});

app.get("/servername/chatlog", function(req, res) {
	res.send(JSON.stringify(chatlog));
});

app.listen(8080);

module.exports = new plugin;