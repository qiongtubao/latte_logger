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
		function DateRollingFileStream(config) {
			this.filename = config.filename;
			this.config = config;
			this.pattern = config.pattern || ".yyyy-MM-dd";
			this.now = Date.now;
			this.lastTimeWeWrotSomething = format.asString(this.pattern, new Date(this.now()));
			this.baseFilename = 	config.filename;
			this.handle = config.handle;
			if(latte_lib.isString(config.handle)) {
				var handlePath = (path.relative)(__dirname, process.cwd())+ "/"+config.handle;
				try {
					this.handle = require(handlePath);
				} catch(e) {
					console.log("loading error", handlePath);
				}
			}
			this.async = config.async;
			if(this.async) {
				if(!asyncs[this.async]) {
					asyncs[this.async] = [];
				}
				asyncs[this.async].push(this);
			}
			this.alwaysIncludePattern = config.alwaysIncludePattern || 0;
			var cpConfig = latte_lib.copy(config);
			cpConfig.filename = this.baseFilename + this.lastTimeWeWrotSomething  ;
			BaseRollingFileStream.call(this, cpConfig);
		}
		util.inherits(DateRollingFileStream, BaseRollingFileStream);
		(function() {
			this.shouldRoll = function() {
				var lastTime = this.lastTimeWeWrotSomething
					, thisTime = format.asString(this.pattern, new Date(this.now()));
				this.lastTimeWeWrotSomething = thisTime;
				this.previousTime = lastTime;
				return thisTime !== lastTime;
			}
			this.roll = function(filename, noAsync, callback) {
				if(latte_lib.isFunction(noAsync)) {
					callback = noAsync;
					noAsync = 0;
				}
				var self = this;
				var rollCallback = function(err, result) {
					if(self.async && !noAsync) {
						asyncs[self.async].forEach(function(dateRollingFileStream) {
							if(dateRollingFileStream != self) {
								if(dateRollingFileStream.shouldRoll()) {
									dateRollingFileStream.currentSize = 0;
									dateRollingFileStream.roll(dateRollingFileStream.filename, 1, function(){});
								}
							}
						});
					}
					if(self.handle) {
						if(latte_lib.isFunction(self.handle)) {
							self.handle();
						} else {
							if(self.handle.method) {
								var child = child_process[self.handle.method].apply(null, self.handle.args);
								child.on("message", function(m) {
									console.log(self.filename + " message: ", m);
								});
								child.send(self.handle.send);
							}
						}
					}
					callback(err, result);
				}
				switch(this.alwaysIncludePattern) {
					case 0:
						this.filename =   this.baseFilename+ this.lastTimeWeWrotSomething;
						async.series([
							this.closeTheStream.bind(this),
							this.openTheStream.bind(this)
						], rollCallback);
					break;
					case 1:
						var newFilename = this.baseFilename + this.previousTime;
						var deleteAnyEaxistingFile = function(cb) {
							fs.unlink(newFliename, function(err) {
								cb();
							});
						}
						var renameTheCurrentFile = function(cb) {
							fs.rename(filename, newFliename, cb);
						}
						async.series([
							this.closeTheStream.bind(this),
							deleteAnyEaxistingFile,
							renameTheCurrentFile,
							this.openTheStream.bind(this)
						], rollCallback);
					break;
					case 2:
						var baseDirname = path.dirname(this.filename);
						var newDirname = path.resolve(this.filename, "../"+this.previousTime);
						var existDir = function(cb) {
							fs.exists(newDirname, function(state) {
								if(!state) {
									return fs.mkdir(newDirname, cb);
								}
								cb(null, state);
							});
						}
						var newFilename = path.resolve(newDirname, path.basename(this.filename));
						var removeTheCurrentFile = function(cb) {
							fs.rename(self.filename, newFilename, cb);
						}
						async.series([
							this.closeTheStream.bind(this),
							existDir,
							removeTheCurrentFile,
							this.openTheStream.bind(this)
						], rollCallback);
					break;
				}
			}
		}).call(DateRollingFileStream.prototype);
		module.exports = DateRollingFileStream;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });