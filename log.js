var colors = require('colors'),
	rcon = require('./rcon'),
	fs = require('fs');

function log() {}

log.prototype.write = function(type, message, echo) {
	
	var prefix = "";
	var suffix = "";
	var plainprefix = "";
	var plainsuffix = "";

	switch(type) {
		case 2:
			plainprefix = "!!! Warning";
			plainsuffix = "!!!";
			prefix = plainprefix.yellow.bold;
			suffix = plainsuffix.yellow.bold;
			break;
		case 3:
			plainprefix = "!!! Error";
			plainsuffix = "!!!";
			prefix = plainprefix.red.bold;
			suffix = plainsuffix.red.bold;
			break;
		case 1:
			plainprefix = "!!! Notice";
			plainsuffix = "!!!";
			prefix = plainprefix.yellow;
			suffix = plainsuffix.yellow;
			break;
		case 0:
			plainprefix = ">>>";
			plainsuffix = "<<<";
			prefix = plainprefix.green;
			suffix = plainsuffix.green;
			break;
	}

	message = message.replace(/\^./, "");

	if(echo)
		console.log(prefix, message, suffix);

	var wholem = new Date().getTime() + " " + plainprefix + " " + message + " " + plainsuffix;

	fs.appendFile("./log/main.log", wholem + "\n", function(err) {
	    if(err)
	        console.log("!!! LOG ERROR".bold.red  + err);

	    if(type == 3) {
	    	console.log("Exit because of critical error!".red.bold);
	    	rcon.rcon("say ^1Yomod crashed! Contact a admin to fix the problem!");
	    	process.exit();
		}
	});


		
}

module.exports = new log;