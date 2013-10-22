var handler = require('./../handler');
var log = require('./../log');
var vars = require('./../vars');
var rcon = require('./../rcon');
var players = require('./../players').players;

function plugin() {}

plugin.prototype.init = function() {

	handler.registerCommand(["rollthedice", "rtd"], function(data) {
		rcon.rcon("say " + players[data.guid].name + " rolled the dice. Number: " + (Math.floor(Math.random() * 6) + 1));
	});

	handler.registerCommand(["cointoss", "ctoss"], function(data) {
		var random = Math.floor(Math.random() * 2);
		var coins = new Array("Kopf", "Zahl");

		rcon.rcon("say ^4Cointoss: ^1" + coins[random]);
	});

	handler.registerCommand("mygroup", function(data) {
		var player = players[data.guid];
		player.say(vars.getLngString("mygroup", ["<GROUP_NAME>"], [vars.getGroupName(player.getGroup())]));
	});

	handler.registerCommand("kickme", function(data) {
		var player = players[data.guid];
		player.kick(data.message.join(" "));
	});

	handler.registerCommand("saveconfig", function(data) {
		vars.saveConfig();
	});

	handler.registerCommand("say", function(data) {
		rcon.rcon("say " + data.message.join(" "));
	});

	handler.registerCommand("players", function(data) {
		var names = "";
		for(key in players) {
			if(players[key] != undefined)
				names = names + players[key].name + ", ";
		}

		names.slice(0, -2);

		rcon.rcon("say " + vars.getLngString("getplayers", ["<PLAYERS>"], [names]));

	});
}

module.exports = new plugin;