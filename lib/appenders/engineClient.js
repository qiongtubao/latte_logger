(function(define) { 'use strict';
	define("latte_logger/streams/engineStream", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		module.exports = engineClient;
		var Engine = require("engine.io-client")
			, latte_lib = require("latte_lib");
		function engineClient(config) {
			var self = this;
			this.config = config;
			self.open(config);	
			this.cache = [];		
		};
		(function() {
			this.open = function() {
				var self = this;
				var socket = Engine("ws://"+this.config.host+":"+this.config.port);
				socket.on("open", function(){
					self.socket = socket;
					self.cache.forEach(function(data) {
						self.write(data);
					});
					socket.on("message", function(data) {
						console.log(data);
					});
					socket.on("close", function() {
						self.socket = null;
						setTimeout(function() {
							self.open(config)	
						});
					});
				});;
				socket.on("error", function(error) {
					console.log("error", error);
					
				});
			}
			this.write = function(data) {
				if(this.socket) {
					this.socket.send(JSON.stringify(data)+"\n");
				} else {
					this.cache.push(data);
				};
			}
			this.close = function() {
				this.socket && this.socket.close();
			}
		}).call(engineClient.prototype);
		module.exports = engineClient;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });