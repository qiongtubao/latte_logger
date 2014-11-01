(function(define) { 'use strict';
	define("latte_lib", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		(function() {
			var servers = {};
			var self = this;
			var latte_lib = require("latte_lib")
				, fs = require("fs")
				, LoggerHandle = require("./handle")
				, logDir = "./";
			this.createServer = function(config) {
				//return new require("./lib/server/"+config.type+"Server")(config);
				var Server = require("./"+config.type+"Server");
				return new Server(config, onConnection);
			}
			var setLogDir = this.setLogDir = function(dirName) {
				if(dirName) {
					logDir = dirName;
				} 
			}; 
			this.createServers = function(config) {
				if(latte_lib.isString(config)) {
					config = JSON.parse(fs.readFileSync(config, "utf8"));
				}
				setLogDir(config.logDir);
				if(config.servers) {
					for(var i in config.servers) {
						servers[i] = self.createServer(config.servers[i]);
					}
				}
				
			} 

			var loggers = [];
			process.on("exit", function() {
				loggers.forEach(function(logger) {
					logger.onClose();
				});
			});
			var onConnection = function(socket) {
				var logger = new LoggerHandle(socket,logDir);
				loggers.push(logger);
				return logger;
			}
		}).call(module.exports);
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });