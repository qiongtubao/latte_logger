(function(define) { 'use strict';
	define("appenders/engine", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var layouts = require("../layouts")
			, latte_lib = require("latte_lib")
			, os = require("os")
			, eol = os.EOL || "\n"
			, serverStream = require("../streams/serverStream")
			, servers = {};
		process.on("exit", function() {
			for(var i in servers) {
				servers[i].close();
			}
		});
		(function() {
			var createClient = function(config) {
				var Client = require("./"+config.type+"Client");
				return new Client(config);
			}
			this.addServerConfig = function(name, config) {
				servers[name] = createClient(config);
				//servers.set(name , createClient(config));
			}
			this.appender = function(config, layout) {
				layout = layout || layouts.fileLayout;
				var logStream = new serverStream(config, layout);
				return function(logEvent) {					
					if(config.servers) {
						config.servers.forEach(function(serverName) {
							if(servers[serverName]) {
								logStream.write( layout(logEvent) , servers[serverName]);
							}
							
						});
					}
				}
			}
			this.configure = function(config, options) {
				var layout
					, _self = this;
				if(config.layout) {
					layout = layouts.layout(config.layout.type, config.layout);
				}
				options = options || config.options || {};
				return _self.appender(config, layout);
				
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });