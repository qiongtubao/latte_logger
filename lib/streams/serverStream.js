//useing engine send log
(function(define) { 'use strict';
	define("moduleName", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var BaseRollingFileStream = require("./baseRollingFileStream")
			, latte_lib = require("latte_lib")
			, fs = require("fs")
			, format = require("../date_format")
			, path = require("path")
			, util = require("util")
			, child_process = require("child_process")
			, async = latte_lib.async
			, asyncs = {

			};
		function serverStream(config) {
			/*this.filename = config.filename;
			this.config = config;
			this.pattern = config.pattern || ".yyyy-MM-dd";
			this.now = Date.now;
			this.lastTimeWeWrotSomething = format.asString(this.pattern, new Date(this.now()));
			this.baseFilename = 	config.filename;
			this.handle = config.handle;*/
			this.config = config;
			this.pattern = config.pattern || "yyyy-MM-dd";
			//this.lastTimeWeWrotSomething = format.asString(this.pattern, new Date(this.now()));
			this.dirName = path.dirname(config.filename);
			this.baseName = path.basename(config.filename);
			this.updateFileName();

		};
		(function() {
			this.updateFileName = function() {
				//thisTime = format.asString(this.pattern, new Date(this.now()));
				this.lastTimeWeWrotSomething = format.asString(this.pattern, new Date(Date.now()));			
				this.filename = this.dirName+"/"+this.lastTimeWeWrotSomething+"/"+this.baseName;
			}
			this.shouldRoll = function() {
				if(this.lastTimeWeWrotSomething == format.asString(this.pattern, new Date(Date.now())) ) {
					return false;
				}
				return true;
			}
			this.write = function(data, client) {
				var self = this;
				//data = data.split("\n").join(" ");
				function writeTheChunk() {
					client.write({
						data: data,
						type: "write",
						filename: self.filename
					});
				}
				if(this.shouldRoll()) {
					client.write({
						data: data,
						type: "close",
						filename: self.filename
					});
					this.updateFileName();
					writeTheChunk();
				}
				writeTheChunk();
				
				
			}
		}).call(serverStream.prototype);
		module.exports = serverStream;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });