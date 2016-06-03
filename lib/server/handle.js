(function(define) { 'use strict';
	define("latte_lib", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var fs = require("fs")
			, path = require("path")
			, os = require("os")
			, eol = os.EOL || "\n"
			, FileRemoveIdle = require("./fileRemoveIdle")
			, loggers = [];
			process.on("exit", function() {
				for(var i in loggers) {
					loggers[i].onClose();
				}
			});
		function LoggerHandle(socket,logDir) {
			var self = this;
			this.fileStreams = new FileRemoveIdle();
			loggers.push(this);
			this.logDir = logDir;
			self.socket = socket;
		};
		(function() {
			var mkdirs  = function(dirpath, mode, callback) {
				fs.exists(dirpath, function(exists) {
					if(exists) {
						callback(dirpath);
					} else {
						mkdirs(path.dirname(dirpath), mode, function() {
							fs.mkdir(dirpath, mode, callback);
						});
					}
				});
			}
			this.openStream = function(filename, cb) {
				var self = this;
				var fn = path.normalize(this.logDir+filename);
				mkdirs(path.dirname(fn), null, function() {
					var theStream = fs.createWriteStream(fn, {encoding: "utf8", mode: parseInt("0644", 8), flags: "a"} );
					self.fileStreams.set(filename, theStream);
					if(cb) {
						theStream.on("open", cb);
					}
					theStream.on("error", function(error) {
						console.log("log stream error", error);
						self.closeStream(filename);
					});
				});
			}
			this.closeStream = function(filename) {
				this.fileStreams.delete(filename);
			}
			this.onData = function(data) {
				var datas = data.split("\n");

				var self = this;
				datas.forEach(function(d) {
					if(d!="") {
						self.handleData(d+"\n");
					}
					
				});
			}
			this.handleData = function(data) {
				try {
					data = JSON.parse(data.toString());
				}catch(e) {
					console.log("parse error:",data);
					return;
				}
				
				var self = this;
				switch(data.type) {
					case "write":
						if(!data.filename) {console.log("send write data error no fileName");return;}
						var cb = function() {
							self.fileStreams.get(data.filename).write(data.data+eol, "utf8");
						};
						if(!self.fileStreams.get(data.filename)){
							self.openStream(data.filename, cb);
						} else {
							cb();
						}
					break;
					case "close":
						self.closeStream(data.filename);
					break;
				}
			}
			this.onClose = function() {
				var self = this;
				self.fileStreams.destroyAllNow();
			}
		}).call(LoggerHandle.prototype);
		module.exports = LoggerHandle;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });