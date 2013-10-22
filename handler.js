var plugins = require('./plugins');
var log = require('./log');
var players = require('./players');
var playerlist = players.players;
var vars = require('./vars');
var rcon = require('./rcon');

function handler() {}

handler.prototype.countarray = new Array();

handler.prototype.functions = new Array();
handler.prototype.commands = new Array();
handler.prototype.timers = new Array();
handler.prototype.files = new Array();

handler.prototype.newTimer = function(time, name, callback) {
	if(typeof this.timers[name] == undefined) {
		log.write(3, "Timer '" + name + "' already exists!", true);
	} else {
		if(name != "") {
			this.timers[name] = setInterval(callback, time);
			log.write(0, "Timer '" + name + "' was created!", true);
		}
	}
}

handler.prototype.deleteTimer = function(name) {
	if(typeof this.timers[name] != undefined) {
		clearInterval(this.timers[name]);
		log.write(1, "Timer '" + name + "' was cleared!", true);
	} else {
		log.write(2, "Timer '" + name + "' doesn't exist!", true);
	}
		
}

handler.prototype.registerEvent = function(action, func) {

	if(this.countarray[action] == undefined) {
		this.countarray[action] = 0;
	}

	var count = this.countarray[action];

	if(this.functions[action] == undefined) {
		this.functions[action] = new Array();
		this.functions[action][count] = func;
	} else {
		this.functions[action][count] = func;
	}

	this.countarray[action]++;
}

handler.prototype.registerCommand = function(command, callback) {
	if(typeof command == "string") {
		this.commands[command] = callback;
	} else {
		command.forEach(function(c) {
			handler.commands[c] = callback;
		});
	}
}

handler.prototype.triggerEvent = function(action, args) {
	
	if(this.functions[action] == undefined) {
		//log.write(3, "Event not found!", true);
		return;
	}
		

	if(this.functions[action][0] == undefined) {
		log.write(3, "Event doesnt have any functions!", true);
		return;
	}

	this.functions[action].forEach(function(func) {
		if(typeof func == "function")
			if(func != undefined)
				return func(args);		
	});

	return false;
}

handler.prototype.actionNormal = function(line) {
	this.triggerEvent(line[0], line);
}

handler.prototype.actionNextmap = function(line) {
	var dvars = new Array();
	var i = 0;

	for(i = 1; i < line.length; i += 2) {
		dvars[line[i]] = line[i + 1];
	}

	if(vars.getDvar("_yomod") == false)  {
		log.write(2, "Detected Server restart!", true);
		players.resetEverything();
		this.triggerEvent("ServerRestart");
	}

	if(vars.getDvar("mapname") != dvars["mapname"]) {
		log.write(2, "Detected Map change!", true);
		this.triggerEvent("mapchange");
	}

	vars.setDvars(dvars);
	this.triggerEvent("nextmap");
}

handler.prototype.actionJoin = function(line) {
	var guid = line[1];
	if(!players.playerExists(guid)) {
		this.triggerEvent("playerjoin", line);
	} else {
		playerlist[guid].update({
			name: line[3],
			pid: line[2]
		});
	}
}

handler.prototype.actionSay = function(line) {
	var message = line[4];
	var guid = line[1];

	if(message.charAt(0) == "!") {
		message = message.split(" ");
		message[0] = message[0].replace("!", "");
		this.executeCommand(guid, message);
	}

	this.triggerEvent(line[0], line);
}

handler.prototype.executeCommand = function(guid, command) {

	var c = command[0].toLowerCase();

	if(vars.existsCV("aliases", c)) {
		c = vars.getCV("aliases", c);
	}

	if(this.commands[c] == undefined) {
		playerlist[guid].say(vars.getLngString("responsenotfound"));
		return false;
	}

	if(!playerlist[guid].isAllowed(guid, c)) {
		playerlist[guid].say(vars.getLngString("commandnotallowed"));
		return false;
	}

	if(typeof this.commands[c] != 'function') {
		log.write(1, "This command has no valid function!", true);

		if(vars.getCV("commands", "responsenotfound") == '1') {
			playerlist[guid].say(vars.getLngString("responsenotfound"));
		}

		return false;
	}

	command.shift();

	this.commands[c]({ guid: guid, message: command });

	
}

handler.prototype.loadConfigs = function(callback) {

	vars.parseConfig("./config/config.cfg");
	vars.parseAdmins("./config/admins.cfg");
	vars.parseGroups("./config/groups.cfg");
	vars.parseLanguageFile("./config/languages/de/main.lng");

	var startInterval = setInterval(function() {
		clearInterval(startInterval);
		callback();
	}, 500);
}

handler.prototype.reloadConfigs = function() {
	vars.parseConfig("./config/config.cfg");
	vars.parseAdmins("./config/admins.cfg");
	vars.parseGroups("./config/groups.cfg");
	vars.parseLanguageFile("./config/languages/de/main.lng");
}

handler.prototype.loadPlugins = function() {
	plugins.init();
}
var handler = new handler;

module.exports = handler;