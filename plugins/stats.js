var handler = require('./../handler');
var log = require('./../log');
var players = require('./../players');

function plugin() {}

plugin.prototype.init = function() {

	handler.registerEvent("playerjoin", function(data) {
		//J;a8cfc038ba12f04182a74bdd0e691cb0;2;[/cH] JoEy
		var guid = data[1];
		var pid = data[2];
		var name = data[3];

		if(players.playerExists(guid) == false) {
			players.newPlayer(guid, pid, name);
			return;
		}

		if(players.playerExists(guid) && pid != undefined)
			players.getPlayer(guid).update({ name: name, pid: pid });

	});

	handler.registerEvent("playerquit", function(data) {
		//Q;a8cfc038ba12f04182a74bdd0e691cb0;2;[/cH] JoEy
		var guid = data[1];
		players.deletePlayer(guid);
	});

	handler.registerEvent("damage", function(data) {
		//D;a89dd29413e82d84a4a982a6cb9d32e9;0;axis;WanderH*Re<3;00000000b262b6c2176a4983845dd0ed;1;allies;{Top}Kolyan;m40a3_mp;98;MOD_RIFLE_BULLET;left_arm_lower
		//D;a69a02212c955314f0dd9aa9fadaa64d;2;allies;fazzyy;;-1;world;;none;19;MOD_FALLING;none
		var takerguid = data[1];
		var takerpid = data[2];
		var takerteam = data[3];
		var takername = data[4];
		var giverguid = data[5];
		var giverpid = data[6];
		var giverteam = data[7];
		var givername = data[8];
		var weapon = data[9];
		var damage = data[10];
		var image = data[11];
		var bodypart = data[12];

		var playerlist = players.getAllPlayer();

		if(takerguid != "" && players.playerExists(takerguid) == false) {
			players.newPlayer(takerguid, takerpid, takername);
		}

		if(giverguid != "" && players.playerExists(giverguid) == false) {
			players.newPlayer(giverguid, giverpid, givername);
		}

		if(takerguid != -1 && playerlist[takerguid] != undefined) {
			playerlist[takerguid].update({ name: takername, pid: takerpid, team: takerteam });
		}		

		if(giverguid != takerguid && giverguid != "" && playerlist[giverguid] != undefined) {
			playerlist[giverguid].update({ name: givername, pid: giverpid, team: giverteam });
		}

		var type = "";

		if(giverguid == takerguid || giverguid == "") {
			type = "selfdamage";
		} else if(playerlist[giverguid].getTeam() == playerlist[takerguid].getTeam()) {
			type = "teamdamage";
		} else {
			type = "damage";
		}

		playerlist[takerguid].damageTaken(type, giverguid, { weapon: weapon, image: image }, damage, bodypart);

		if(giverpid != -1) {
			playerlist[giverguid].damageGiven(type, takerguid, { weapon: weapon, image: image }, damage, bodypart);
		}

	});

	handler.registerEvent("kill", function(data) {
		//K;c90dc162f630049cec0cb632e5e0aa50;0;;manu;87216e65d8efd209b1addfb667c2a3dc;1;;FN! ZZ;m21_mp;147;MOD_HEAD_SHOT;head
		////KILL;GUID KILLED;PID KILLED; ?!; KILLED NAME; KILLER GUID; KILLER PID; ?!;KILLERNAME;WEAPON;DMG; IMAGE; BODY PART
		var victimguid = data[1];
		var victimpid = data[2];
		var victimteam = data[3];
		var victimname = data[4];
		var killerguid = data[5];
		var killerpid = data[6];
		var killerteam = data[7];
		var killername = data[8];
		var weapon = data[9];
		var damage = data[10];
		var image = data[11];
		var bodypart = data[12];

		var playerlist = players.getAllPlayer();

		if(victimguid != "" && players.playerExists(victimguid) == false) {
			players.newPlayer(victimguid, victimpid, victimname);
		}

		if(killerguid != "" && players.playerExists(killerguid) == false) {
			players.newPlayer(killerguid, killerpid, killername);
		}

		if(victimpid != -1) {
			playerlist[victimguid].update({ pid: victimpid, name: victimname });
		}

		if(killerpid != -1) {
			playerlist[killerguid].update({ pid: killerpid, name: killername });
		}

		var type = "";

		if(killerpid == -1 || killerpid == victimpid) {
			type = "selfkill";
		} else if(playerlist[killerguid].getTeam() != "none" && playerlist[victimguid].getTeam() != "none" && playerlist[killerguid].getTeam() == playerlist[victimguid].getTeam()) {
			type = "teamkill";
		} else {
			type = "kill";
		}

		playerlist[victimguid].death(type, killerguid, [weapon, image], damage, bodypart);

		if(killerpid != -1) {
			playerlist[killerguid].kill(type, victimguid, [weapon, image], damage, bodyparty);
		}

	});

	handler.registerEvent("say", function(data) {
		//say;fcf9424ceaa206778173fa78000fa2cb;4;TwEaT;off plss
		var playerlist = players.getAllPlayer();

		var guid = data[0];
		var pid = data[1];
		var name = data[2];

		if(players.playerExists(guid) == false) {
			players.newPlayer(guid, pid, name);
		}

		playerlist[guid].update({ pid: pid, name: name });
		playerlist[guid].lastcommand = data[3];

	});

}

module.exports = new plugin;
