(function(define) { 'use strict';
	define("latte_logger/logger", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var util = require("util")
			, events = require("events")
			, levels = require("./levels")
			, logWritesEnabled = true;
		var LoggingEvent = function(categoryName, level, data, logger) {
			this.startTime = new Date();
			this.categoryName = categoryName;
			this.data = data;
			this.level = level;
			this.logger = logger;
		};
		function Logger (name, level) {
			this.category = name || Logger.DEFAULT_CATEGORY;
			if(level) {
				this.setLevel(level);
			}
		};
		util.inherits(Logger, events.EventEmitter);
		(function() {
			var self = this;
			this.level = levels.TRACE;
			this.setLevel = function(level) {
				this.level = levels.toLevel(level, this.level || levels.TRACE);
			};
			this.log = function() {
				var args = Array.prototype.slice.call(arguments)
					, logLevel = levels.toLevel(args.shift())
					, loggingEvent;
				if (this.isLevelEnabled(logLevel)) {
					loggingEvent = new LoggingEvent(this.category, logLevel, args, this);
					this.emit("log", loggingEvent);
				}
			};
			this.isLevelEnabled = function(otherLevel) {
				return this.level.isLessThanOrEqualTo(otherLevel);
			};
			["Trace", "Debug", "Info", "Warn", "Error", "Fatal"].forEach(function(levelString) {
				var level = levels.toLevel(levelString);
				self["is"+levelString+"Enabled"] = function() {
					return this.isLevelEnabled(level);
				};

				self[levelString.toLowerCase()] = function() {
					if(logWritesEnabled && this.isLevelEnabled(level)) {
						var args = Array.prototype.slice.call(arguments);
						args.unshift(level);
						this.log.apply(this, args);
					}
				};
			});
		}).call(Logger.prototype);
		(function() {
			this.DEFAULT_CATEGORY = "[default]";
		}).call(Logger);
		(function() {
			/**
				@method
				@static
				禁止输出
			*/
			this.disableAllLogWrites = function() {
				logWritesEnabled = false;
			};
			/**
				@method
				@static
				恢复输出
			*/
			this.enableAllLogWrites = function() {
				logWritesEnabled = true;
			}
				var originalConsoleFunctions = {
					log:   console.log,
					debug: console.debug,
					info:  console.info,
					warn:  console.warn,
					error: console.error
				};
				var consoleNull = function() {

				}
			this.disableAllConsoleWrites = function() {
				for(var i in originalConsoleFunctions) {
					console[i] = consoleNull;
				}
			};
			this.enableAllConsoleWrites = function() {
				for(var i in originalConsoleFunctions) {
					console[i] = originalConsoleFunctions[i];
				}
			};
			this.create = function(name) {
				return new Logger(name);
			};
			this.LoggingEvent = LoggingEvent;
		}).call(module.exports);
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });