var parser = require('./parser');
var handler = require('./handler');
var rcon = require('./rcon');
var log = require('./log');
var vars = require('./vars');
var players = require('./players');

log.write(0, '-----------------------------------------------------', true);
log.write(0, '!!!!! Starting YOMOD !!!!!', true);

log.write(0, 'yo-mod v0.1  Copyright (C) 2013  Joel Cremer This program comes with ABSOLUTELY NO WARRANTY.  This is free software, and you are welcome to redistribute it under certain conditions. Visit http://yo-mod.de if you have any trouble', true);

vars.parseConfig("./config/config.cfg");
vars.parseAdmins("./config/admins.cfg");
vars.parseGroups("./config/groups.cfg");
vars.parseLanguageFile("./config/languages/de/main.lng");


log.write(1, "Wait until the Config files are loaded!!!", true);
var waitcount = 0;

var startup = setInterval(function() {
	waitcount++;
		if(waitcount == 5)
			start();
}, 100);

function start() {

	clearInterval(startup);

	rcon.setup(vars.getCV("rcon", "host"), vars.getCV("rcon", "port"), vars.getCV("rcon", "password"));
	
	rcon.rcon("version", function(response) {
		if(response.indexOf("version") != -1) {
			log.write(0, "RCON SUCCESSFULLY CONNECTED!", true);
			rcon.rcon("sets _yomod 0.1.1");
			rcon.rcon("say ^1YOMOD was started!");
		} else {
			log.write(3, "Bad Rcon or Server doesnt have any Rcon!", true);
		}
	});
	
	players.syncPlayerlist();

	log.write(0, "STARTING PARSER!", true);

	parser.parselog("/home/cod4/srv01/server/codiv/callofduty4/mods/promod_joey/games_mp.log");

	log.write(0, "PARSER SUCCESSFULLY STARTED!", true);

	log.write(0, "Loading Plugins!", true);

	handler.loadPlugins();

}