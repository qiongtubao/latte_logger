(function(define) { 'use strict';
	define("latte_lib", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var latte_lib = require("latte_lib")
			, Server = require("./server")
			, engine = require("engine.io");
		function EngineServer(config, connectFunc) {
			config = config || {};
			config.port = config.port || 3000;
			
			var http = require('http').createServer().listen(config.port);
			console.log("engine server open ", config.port);
			var server = engine.attach(http);
			var self = this;
			server.on('connection', function (socket) {
				self.handle = connectFunc(socket);
				socket.on("message", function(data) {
					self.onData(data);
				});
				socket.on("error", function(error) {
					self.onError(error);
				});
			});
		};
		latte_lib.inherits(EngineServer, Server);
		module.exports = EngineServer;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });