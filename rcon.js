var dgram = require('dgram');
var log = require('./log');

function rcon() {}

rcon.prototype.setup = function(ip, port, password) {
	this.ip = ip;
	this.port = port;
	this.password = password;
}

rcon.prototype.rcon = function(command, callback) {
	var str = "rcon " + this.password + " " + command;
	this.send(str, callback); 
}

rcon.prototype.send = function(str, callback) {

	client = dgram.createSocket('udp4', function(message) {
		var response = message.toString('binary', 10);
		if(typeof callback == 'function') {
			callback(response);
		}
	});

	var message = new Buffer("\xFF\xFF\xFF\xFF" + str + "\x00", 'binary');

	client.send(message, 0, message.length, this.port, this.ip);
}

module.exports = new rcon;