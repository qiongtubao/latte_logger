(function(define) { 'use strict';
	define("moduleName", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var layouts = require("../layouts")
			, consoleLog = console.log.bind(console);
		(function() {
			var _self = this;
			this.appender = function(layout) {
				layout = layout || layouts.colouredLayout;
				return function(loggingEvent) {
					consoleLog(layout(loggingEvent));
				}
			}
			this.configure = function(config) {
				var layout ;
				if(config.layout) {
					layout = layouts.layout(config.layout.type, config.layout);
				}
				return _self.appender(layout);
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });