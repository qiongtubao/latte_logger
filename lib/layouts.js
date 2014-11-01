(function(define) { 'use strict';
	define("moduleName", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var dateFormat = require("./date_format")
			, util = require("util");
		(function() {
			var _self = this;
			function wrapErrorsWithInspect(items) {
				return items.map(function(item) {
					if((item instanceof Error) && item.stack) {
						return {
							inspect: function() {
								return util.format(item) + "\n" + item.stack;
							}
						}
					} else {
						return item;
					}
				});
			};
			function formatLogData(logData) {
				var data = Array.isArray(logData)? logData: Array.prototype.slice.call(arguments);
				return util.format.apply(util, wrapErrorsWithInspect(data));
			}
			var styles = {
				"bold":      [1, 22],
				"italic":    [2, 23],
				"underline": [4, 24],
				"inverse":   [7, 27],
				"white":     [37,39],
				"grey":      [90,39],
				"black":     [90,39],
				"blue":      [34,39],
				"cyan":      [36,39],
				"green":     [32,39],
				"magenta":   [35,39],
				"red":       [31,39],
				"yellow":    [33,39]
			};
			function colorizeStart(style) {
				return style ? "\x1B[" + styles[style][0] + "m": "";
			}
			function colorizeEnd(style) {
				return style ? "\x1B[" + styles[style][1] + "m": "";
			}
			function colorize ( str, style) {
				return colorizeStart(style) + str + colorizeEnd(style);
			}
			function timestampLevelAndCategory(loggingEvent, colour) {
				var output = colorize(
					formatLogData(
						"[%s] [%s] %s - "
						, dateFormat.asString(loggingEvent.startTime)
						, loggingEvent.level
						, loggingEvent.categoryName
					),
					colour);
				return output;
			}
			var colours = {
				ALL:   "grey",
				TRACE: "blue",
				DEBUG: "cyan",
				INFO:  "green",
				WARN:  "yellow",
				ERROR: "red",
				FATAL: "magenta",
				OFF:   "grey"
			};
			this.colouredLayout = function(loggingEvent) {
				return timestampLevelAndCategory(
					loggingEvent,
					colours[loggingEvent.level.toString()]
				) + formatLogData(loggingEvent.data);
			}
			this.basicLayout = function(loggingEvent) {
				return timestampLevelAndCategory(loggingEvent) + formatLogData(loggingEvent.data
					);
			}
			this.fileLayout = function(loggingEvent) {
				var stringData = (loggingEvent.data.map(function(item) {
					return JSON.stringify(item);
				})).join(" ");
				return timestampLevelAndCategory(loggingEvent) + stringData;
			}
			this.layout = function(type) {
				return _self[type] && _self[type](config)
			}
		}).call(module.exports);
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });