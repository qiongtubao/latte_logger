(function(define) { 'use strict';
	define("moduleName", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var layouts = require("../layouts")
			, streams = require("../streams")
			, os = require("os")
			, eol = os.EOL || "\n"
			, consoleLog = console.log.bind(console)
			, openFiles = [];
		process.on("exit", function() {
			openFiles.forEach(function(file) {
				file.end();
			})
		});
		(function() {
			var _self = this;
			this.appender = function(config, layout) {
				layout = layout || layouts.basicLayout;
				var logFile = new streams.DateRollingFileStream(config);
				openFiles.push(logFile);
				return function(logEvent) {
					logFile.write(layout(logEvent) + eol, "utf8");
				}
			}
			this.configure = function(config, options) {
				var layout;
				if(config.layout) {
					layout = layouts.layout(config.layout.type, config.layout);
				}
				options = options || config.options || {};
				if(options && options.cwd && !config.absolute) {
					config.filename = path.join(options.cwd, config.filename);
				}
				return _self.appender(config, layout);
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });