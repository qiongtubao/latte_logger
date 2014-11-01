(function(define) { 'use strict';
	define("moduleName", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var latte_lib = require("latte_lib");
		function Level(level, levelStr) {
			this.level = level || 0;
			this.levelStr = levelStr;
		};
		var toLevel = function(level, defaultLevel) {
			if(!level) {
				return defaultLevel;
			}
			if(latte_lib.isString(level)) {
				var s = level.toUpperCase();
				if(module.exports[s]) {
					return module.exports[s];
				} else {
					return defaultLevel;
				}
			}
			return toLevel(level.toString());
		};
		(function() {
			this.toString = function() {
				return this.levelStr;
			};
			//小于等于
			this.isLessThanOrEqualTo = function(otherLevel) {
				if(latte_lib.isString(otherLevel)) {
					otherLevel = toLevel(otherLevel);
				}
				return this.level <= otherLevel.level;
			}
			//大于等于
			this.isGreaterThanOrEqualTo = function(otherLevel) {
				if(latte_lib.isString(otherLevel)) {
					otherLevel = toLevel(otherLevel);
				}
				return this.level >= otherLevel.level;
			}
			//等于
			this.isEqualTo = function(otherLevel) {
				if(latte_lib.isString(otherLevel)) {
					otherLevel = toLevel(otherLevel);
				}
				return this.level == otherLevel.level;
			}

		}).call(Level.prototype);
		(function() {
			var _self = this;
			this.toLevel = toLevel;
			this.LOG = new Level(Number.MIN_VALUE, "ALL");
			this.ALL = new Level(Number.MIN_VALUE, "ALL");
			this.TRACE = new Level(5000, "TRACE");
			this.DEBUG = new Level(10000, "DEBUG");
			this.INFO = new Level(20000, "INFO");
			this.WARN = new Level(30000, "WARN");
			this.ERROR = new Level(40000, "ERROR");
			this.FATAL = new Level(50000, "FATAL");
			this.OFF = new Level(Number.MAX_VALUE, "OFF");
		}).call(module.exports);
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });