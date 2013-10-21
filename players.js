var log = require('./log');
var handler = require('./handler');
var rcon = require('./rcon');
var vars = require('./vars');

function players() {}

players.prototype.players = new Array();

players.prototype.newPlayer = function(guid, pid, name) {
	this.players[guid] = new player(guid, pid, name);

	log.write(1, "New Player '" + this.players[guid].name + "' (GUID: " + guid + ") with PID: " + pid + " was added to playerlist!", true);

}

players.prototype.getPlayerbyPID = function(pid) {
	for(key in this.players) {
		if(this.players[key].pid == pid)
			return this.players[key];
	}

	return false;
}

players.prototype.getPlayerbyName = function(name) {
	for(key in this.players) {
		if(this.players[key].name.toLowerCase().indexOf(name.toLowerCase()) != -1) {
			return this.players[key];
		}
	}

	return false;
}

players.prototype.playerExists = function(guid) {
	return (this.players[guid] != undefined);
}

players.prototype.deletePlayer = function(guid) {
	if(this.playerExists(guid)) {
		log.write(1, "Player '" + this.players[guid].name + "' (GUID: " + guid + ") with PID: " + this.players[guid].pid + " was delete from playerlist due game quit!", true);
		delete this.players[guid];
	}
}

players.prototype.resetEverything = function() {
	this.players = new Array();
}

players.prototype.getPlayer = function(guid) {
	return this.players[guid];
}

players.prototype.getAllPlayer = function() {
	return this.players;
}

players.prototype.syncPlayerlist = function() {
	var that = this;

	rcon.rcon("status", function(response) {
		var list = response.split("\n");

		var map = list[0].split(":")[1].trim();
		vars.setDvar("mapname", map);

		list.shift();
		list.shift();
		list.shift();

		var playerlist = [];
		var playerdata = [];
		var count = 0;

		for(key in list) {
			if(list[key] != "" && list[key] != undefined) {
				var split = list[key].split(" ");

				for(key2 in split) {
					if(split[key2] != "" && split[key2] != undefined) {
						playerdata.push(split[key2])
					}
				}

				playerlist.push(playerdata);
				playerdata = [];
			}
		}

		for(key in playerlist) {
			var pid = playerlist[key][0];
			var guid = playerlist[key][3];
			var name = playerlist[key][4].slice(0, -2);

			that.newPlayer(guid, pid, name);			
		}

	});
}

function player(guid, pid, name) {
	this.handler = require('./handler');

	this.guid = guid;
	this.pid = pid;
	this.name = name;
	this.joined = new Date().getTime();
	this.team = 'none';
	this.lastweaponkill = '';
	this.lastweapondeath = '';
	this.kills = 0;
	this.deaths = 0;
	this.teamkills = 0;
	this.teamdeaths = 0;
	this.selfkills = 0;
	this.headshots = 0;
	this.lastcommand = 0;
	this.damagegiven = 0;
	this.teamdamagegiven = 0;
	this.damagetaken = 0;
	this.lastvictim = '';
	this.lastkiller = '';

	this.update = function(data) {

		if(this.name != data.name && data.name != undefined) {
			var oldname = this.name;
			this.name = data.name;
			this.handler.triggerEvent("playerChangeName", [this.guid, this.name, this.pid, oldname]);
			log.write(0, "Player '" + oldname + "' changed his name to '" + this.name + "'!", true);
		}

		if(this.team != data.team && data.team != undefined) {
			var oldteam = this.team;
			this.team = data.team;
			this.handler.triggerEvent("playerChangeTeam", [this.guid, this.name, this.pid, oldteam, this.team]);
		}

		if(this.pid != data.pid && data.pid != undefined) {
			this.pid = data.pid;
			this.handler.triggerEvent("playerChangePID", [this.guid, this.name, this.pid]);
			log.write(0, "Player '" + this.name + "' changed his PID to '" + this.pid + "'!", true);
		}
	}

	this.getTeam = function() {
		return this.team;
	}

	this.getPbid = function() {
		return (parseInt(this.pid) + 1);
	}

	this.getGroup = function() {
		return vars.getAdminGroup(this.guid);
	}

	this.isAllowed = function(command) {
		var playerGroup = vars.getAdminGroup(this.guid);
		var group = vars.getGroup(playerGroup);
		var commands = group["commands"].split(",");

		if(commands[0] == "*")
			return true;

		if(commands[command] != undefined) {
			return true;
		}
		return false;
	}

	this.isProtected = function() {
		var admin = vars.getAdmins()[guid];
		if(!admin)
			return false;

		return (admin["protected"] == '1');
	}

	this.damageTaken = function(type, giver, weapon, damage, bodypart) {
		this.damagetaken = parseInt(this.damagetaken) + parseInt(damage);
		if(type == "teamdamage") {
			this.handler.triggerEvent("playerTeamDamageTaken", [this.guid, giver, weapon, damage, bodypart]);
		} else if(type == "damage") {
			this.handler.triggerEvent("playerDamageTaken", [this.guid, giver, weapon, damage, bodypart]);
		} else if(type == "selfdamage") {
			this.handler.triggerEvent("playerSelfDamage", [this.guid, weapon, damage, bodypart]);
		}
	}

	this.damageGiven = function(type, taker, weapon, damage, bodypart) {
		if(type == "teamdamage") {
			this.teamdamagegiven = parseInt(this.teamdamagegiven) + parseInt(damage);
			this.handler.triggerEvent("playerTeamDamageGiven", [this.guid, taker, weapon, damage, bodypart]);
		} else if(type == "damage") {
			this.damagegiven += damage;
			this.handler.triggerEvent("playerDamageGiven", [this.guid, taker, weapon, damage, bodypart]);
		}
	}

	this.kill = function(type, victim, weapon, damage, bodypart) {
		this.lastvictim = victim;
		this.lastweaponkill = weapon;

		if(type == "kill") {
			this.kills++;
			this.damagegiven = parseInt(this.damagegiven) + parseInt(damage);
			if(weapon[1] == "MOD_HEAD_SHOT") {
				this.headshots++;
			}
			handler.triggerEvent("playerKill", [this.guid, victim, weapon, damage, bodypart]);
		} else if(type == "teamkill") {
			this.teamdamagegiven = parseInt(this.teamdamagegiven) + parseInt(damage);
			this.teamkills++;
			this.handler.triggerEvent("playerTeamKill", [this.guid, victim, weapon, damage, bodypart]);
		}
	}

	this.death = function(type, killer, weapon, damage, bodypart) {
		this.lastkiller = killer;
		this.lastweapondeath = weapon;
		this.deaths++;

		if(weapon[1] != "MOD_SUICIDE")
			this.damagetaken = parseInt(this.damagetaken) + parseInt(damage);

		if(type == "teamkill") {
			this.teamdeaths++;
			this.handler.triggerEvent("playerTeamDeath", [this.guid, killer, weapon, damage, bodypart]);
		} else if(type == "selfkill") {
			this.selfkills++;
			this.lastkiller = this.guid;
			this.lastvictim = this.guid;
			this.lastweaponkill = weapon;
			this.handler.triggerEvent("playerSelfKill", [this.guid, weapon, damage, bodypart]);
		} else {
			this.handler.triggerEvent("playerDeath", [this.guid, killer, weapon, damage, bodypart]);
		}
	}

	this.say = function(msg) {
		rcon.rcon("tell " + this.pid + " " + msg);
	}

	this.kick = function(reason, kicker) {
		if(!reason) {
			reason = vars.getCV("kickban", "defaultkickreason");
		}

		if(!kicker) {
			kicker = "Server";
		}

		if(vars.getCV("kickban", "usepb") == "1") {
			rcon.rcon("pb_sv_kick " + this.getPbid() + " 0 " + reason + "^7", function(result) {
				if(result.indexOf("Command Issued") != -1) {
					rcon.rcon("clientkick " + this.pid);
				}
			});
		} else {
			rcon.rcon("clientkick " + this.pid);
		}

		rcon.rcon("say " + vars.getLngString("playerKick", ["<NAME>", "<GUID>", "<REASON>", "<KICKER>"], [this.name, this.guid, reason, kicker]));
		log.write(1, vars.getLngString("playerKick", ["<NAME>", "<GUID>", "<REASON>", "<KICKER>"], [this.name, this.guid, reason, kicker]), true);

		this.handler.triggerEvent("playerKicked", [guid, reason, kicker]);
		return true;
	}

	this.ban = function(reason, kicker) {
		if(!reason) {
			reason = vars.getCV("kickban", "defaultbanreason");
		}

		if(!kicker) {
			kicker = "Server";
		}

		if(vars.getCV("kickban", "usepb") == "1") {
			rcon.rcon("pb_sv_ban " + this.getPbid() + " 0 " + reason + "^7");
		} else {
			rcon.rcon("banClient " + this.pid);
		}

		rcon.rcon("say " + vars.getLngString("playerBan", ["<NAME>", "<GUID>", "<REASON>", "<KICKER>"], [this.name, this.guid, reason, kicker]));
		log.write(1, vars.getLngString("playerBan", ["<NAME>", "<GUID>", "<REASON>", "<KICKER>"], [this.name, this.guid, reason, kicker]), true);

		this.handler.triggerEvent("playerBanned", [guid, reason, kicker]);
		return true;
	}

	this.tempBan = function(reason, kicker, time) {
		if(!reason) {
			reason = vars.getCV("kickban", "defaulttempbanreason");
		}

		if(!kicker) {
			kicker = "Server";
		}

		if(vars.getCV("kickban", "usepb") == "1") {
			rcon.rcon("pb_sv_kick " + this.getPbid() + " " + time + " " + reason + "^7");
		} else {
			rcon.rcon("tempBanClient " + this.pid);
		}

		rcon.rcon("say " + vars.getLngString("playerTempBan", ["<NAME>", "<GUID>", "<REASON>", "<KICKER>", "<TIME>"], [this.name, this.guid, reason, kicker, time]));
		log.write(1, vars.getLngString("playerTempBan", ["<NAME>", "<GUID>", "<REASON>", "<KICKER>", "<TIME>"], [this.name, this.guid, reason, kicker, time]), true);

		this.handler.triggerEvent("playerTempbanBanned", [guid, reason, kicker, time]);
		return true;
	}
}

module.exports = new players;