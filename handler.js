var plugins = require('./plugins');
var log = require('./log');
var players = require('./players').players;
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

handler.prototype.executeCommand = function(guid, command) {

	var c = command[0].toLowerCase();

	if(vars.existsCV("aliases", c)) {
		c = vars.getCV("aliases", c);
	}

	if(this.commands[c] == undefined) {
		players[guid].say(vars.getLngString("responsenotfound"));
		return false;
	}

	if(!players[guid].isAllowed(guid, c)) {
		players[guid].say(vars.getLngString("commandnotallowed"));
		return false;
	}

	if(typeof this.commands[c] != 'function') {
		log.write(1, "This command has no valid function!", true);

		if(vars.getCV("commands", "responsenotfound") == '1') {
			players[guid].say(vars.getLngString("responsenotfound"));
		}

		return false;
	}

	command.shift();

	this.commands[c]({ guid: guid, message: command });

	
}

handler.prototype.loadPlugins = function() {
	plugins.init();
	defaultevents();
} 

function defaultevents() {
	handler.registerEvent("say", function(args) {
		var message = args[4];
		var guid = args[1];
		if(message.charAt(0) == "!") {

			message = message.split(" ");
			message[0] = message[0].replace("!", "");
			handler.executeCommand(guid, message);
		}
	});
}

var handler = new handler;

module.exports = handler;