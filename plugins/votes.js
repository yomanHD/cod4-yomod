var handler = require('./../handler');
var vars = require('./../vars');
var log = require('./../log');
var rcon = require('./../rcon');
var players = require('./../players');

var votes = [];

function plugin() {}

plugin.prototype.init = function() {

	var currVote = undefined;

	votes["map"] = new vote({
		name: "mapvote",
		duration: 30,
		maxVotes: 1,
		onStart: function(guid, args) {
			log.write(1, "Mapvoting: Change map to " + args, true);
		}
	});

	handler.registerCommand("vote", function(data) {
		var type = data.message[0];
		if(currVote == undefined) {
			currVote = votes[type];
			currVote.start(data.guid, data.message);
		}
	});

}

function vote(settings) {
	this.starter = '';
	this.started = undefined;
	this.yes = 0;
	this.no = 0;
	this.isRunning = true;
	this.voter = [];
	this.announceTimer = undefined;

	this.args = undefined;

	this.settings = {
		name: settings.name,
		duration: settings.duration,
		maxVotes: settings.maxVotes,
		onStart: settings.onStart,
		onPlayerVote: settings.onPlayerVote,
		onCancel: settings.onCancel,
		onEnd: settings.onEnd,
		onRefuse: settings.onRefuse,
		onAccept: settings.onAccept,
		announce: settings.announce
	}

	this.start = function(guid, args) {
		this.args = args;

		this.isRunning = true;
		this.started = new Date().getTime();
		this.yes++;
		this.voter.push(guid);

		//nachricht
		log.write(1, "Vote: " + this.settings.name + " was started!", true);

		this.settings.onStart(guid, args);
		this.announceTimer = setInterval(this.settings.announce, (this.settings.duration - 7) / 2);
	}

	this.cancel = function(guid) {
		if(guid == "" || guid == undefined || !this.isRunning)
			return false;

		if(players[guid].isAllowed("cancel") || this.starter == guid) {
			this.isRunning = false;
			log.write(1, "Vote: " + this.settings.name + " was cancelled!", true);
		}
	}

	this.voteYes = function(guid) {

		if(guid == "")
			return false;

		var occurrences = 0;
		for(key in this.voter) {
			if(this.voter[key] == guid)
				occurrences++;
		}

		if(occurrences < this.settings.maxVotes) {
			this.yes++;
			this.voter.push(guid);
			this.settings.onPlayerVote("yes", guid);
		}

	}

	this.voteNo = function(guid) {
		if(guid == "")
			return false;

		var occurrences = 0;
		for(key in this.voter) {
			if(this.voter[key] == guid)
				occurrences++;
		}

		if(occurrences < this.settings.maxVotes) {
			this.no++;
			this.voter.push(guid);
			this.settings.onPlayerVote("no", guid);
		}

	}

}

module.exports = new plugin;