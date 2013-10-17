var walk = require('walk'),
	log = require('./log');
//ALL PLUGINS HERE
var plugs = [];

function plugins() {}

plugins.prototype.init = function() {

	var walker  = walk.walk('./plugins', { followLinks: false });

	walker.on('file', function(root, stat, next) {
	    if(stat.name.split('.')[1] == "js") {
			plugs.push(stat.name.split(".")[0]);
	    }
	    next();
	});

	walker.on('end', function() {
	    plugs.forEach(function(v) {
	    	log.write(1, "Plugin '" + v + "' loaded!", true);
	    	require('./plugins/'+v).init();
	    });

	    log.write(0, "Plugins successfully loaded!", true);

	});
}

module.exports = new plugins;
