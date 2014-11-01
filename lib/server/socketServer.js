(function(define) { 'use strict';
	define("latte_lib", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var net = require("net")
			, Server = require("./server")
			, latte_lib = require("latte_lib");
		function SocketServer(config, connectFunc) {
			config = config || {};
			config.port = config.port || 3001;
			var self = this;
			this.server = net.createServer(function(socket) {
				self.handle = connectFunc(socket);
				var datas = "";
				socket.on("data", function(data) {
					datas += data.toString();
					if(datas[datas.length-1] == "\n") {
						self.onData(datas);
						datas = "";
					}
				});

				socket.on("error", function(error) {
					self.onError(error);
				});
			});
			this.server.listen(config.port);
			console.log("socketServer open ", config.port);
		};
		latte_lib.inherits(SocketServer, Server);
		module.exports = SocketServer;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });