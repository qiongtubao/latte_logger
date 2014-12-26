(function(define) { 'use strict';
	define("moduleName", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var fs = require("fs")
			, path = require("path")
			, stream = require("stream")
			, util = require("util")
			, latte_lib = require("latte_lib");
			var currentFileSize = function(file) {
				var fileSize = 0;
				try {
					fileSize = fs.statSync(file).size;
				}catch(e) {

				}
				return fileSize;
			}
			function BaseRollingFileStream(config) {
				this.filename = config.filename;
				this.options = config.options || {encoding: "utf8", mode: parseInt("0644", 8), flags: "a"};
				this.currentSize = 0;
				if(!this.filename) {
					throw new Error("config type file no filename");
				}
				stream.Writable.call(this);
				this.openTheStream();
				this.currentSize = currentFileSize(this.filename);
			};
			util.inherits(BaseRollingFileStream, stream.Writable);
			(function() {
				this._write = function(chunk, encoding, callback) {
					var self = this;
					function writeTheChunk() {
						self.currentSize += chunk.length;
						self.theStream.write(chunk, encoding, callback);
					}
					if(this.shouldRoll() ) {
						this.currentSize = 0;
						this.roll(this.filename, writeTheChunk);
					} else {
						writeTheChunk();
					}
				}
				this.openTheStream = function(cb) {
					var self = this;
					var error = latte_lib.fs.mkdirsSync(path.dirname(self.filename));
					if(error) { return cb(error); }
					var stream = latte_lib.fs.createWriteStream(self.filename, self.options);
					self.theStream = stream;
					if(cb) {
						stream.on("open", function() {
							cb()
						});
					}			
					stream.on("error", function (error) {
						console.log("log stream error", error);
						self.theStream = null;
					})
				}
				this.closeTheStream = function(cb) {
					this.theStream.end(cb);
				}
				this.shouldRoll = function() {
					return false;
				}
				this.roll = function(filename, callback) {
					callback();
				}
			}).call(BaseRollingFileStream.prototype);
			module.exports = BaseRollingFileStream;
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });