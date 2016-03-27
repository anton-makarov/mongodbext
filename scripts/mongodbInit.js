'use strict';

var Steppy = require('twostep').Steppy,
	path = require('path'),
	ServerManager = require('mongodb-topology-manager').Server,
	versionManager = require('mongodb-version-manager');

var nodeify = function(promise, callback) {
	return promise.then(function (res) {
		callback(null, res);
	}, function (err) {
		callback(err);
	});
};

var manager = new ServerManager('mongod', {
	dbpath: path.resolve('db')
});

Steppy(
	function() {
		console.log('init mongodb');
		versionManager(this.slot());
	},
	function() {
		versionManager.current(this.slot());
	},
	function(err, version) {
		console.log('mongodb version: %s', version);
		nodeify(manager.purge(), this.slot());
	},
	function() {
		console.log('starting mongodb...');
		nodeify(manager.start(), this.slot());
	},
	function(err) {
		if (err) throw (err);

		console.log('mongodb started');
		process.exit(0);
	}
);
