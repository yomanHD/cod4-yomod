var handler = require('./../handler');
var log = require('./../log');
var rcon = require('./../rcon');
var vars = require('./../vars');

function plugin() {}

plugin.prototype.init = function() {

	

	vars.parseTextFile('./config/plugins/banner.lst', function(banners) {

		var count = 0;

		var interval = vars.getCV("banner", "interval") * 1000;

		handler.newTimer(interval, "banner", function() {
			if(banners != undefined && banners[count] != undefined) {
				log.write(0, "Banner: " + banners[count], true);
				rcon.rcon("say " + banners[count]);

				if(count != banners.length - 1)
					count++;
				else
					count = 0;
			}
		});

	});

}

module.exports = new plugin;