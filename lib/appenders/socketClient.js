(function(define) { 'use strict';
	define("latte_logger/socketClient", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var net = require("net")
			, latte_lib = require("latte_lib")
			, fs = require("fs")
			, Reconnection = latte_lib.reconnection
			, latte_fs = latte_lib.fs;
		function SocketClient(config) {	
			this.config = config;		
			this.cacheDir = config.cacheDir || "./"+this.config.host+":"+this.config.port+"Cache/";
			this.initCache();
			Reconnection.call(this, config);
			process.on("exit", function() {
				self.writeCache();
			});
			this.open();
		};
		latte_lib.inherits(SocketClient, Reconnection);
		(function() {
				
			this.initCache = function() {
				var self = this;
				this.cache = [];
				this.cacheState = "close";
				this.cacheMax = 10;
				latte_fs.mkdirs(this.cacheDir,null, function() {
					self.cacheFiles = latte_fs.getTimeSort(self.cacheDir);
				});
			}
			this.readCache = function(fn) {
				this.cacheState = "open";
				var self = this;
				this.cacheFiles.forEach(function(file) {
					var datas = latte_fs.read(file).split("\n");
					datas.forEach(function(data) {
						fn(data);
					});
					latte_fs.deleteFile(file);
				});
				
				var cache ;
				while((cache = this.cache.shift())) {
					fn(cache);
				}
				this.cacheState = "close";
			}
			this.onOpen = function(socket) {
				var self = this;
				self.socket = socket;
				self.readyState = "open";
				self.reconnecting = false;
				this.readCache(function(data) {
					self.socket.write(data+"\n");
				});

				/*self.cache.forEach(function(data) {
					self.write(data);
				});*/
			}
			

			this.open = function( callback) {
				var socket = net.connect({host: this.config.host, port: this.config.port}, function() {

				});
				var self = this;
				socket.on("connect", function() {
					self.onOpen(socket);
					callback && callback();					
				});
				socket.on("data", function(data) {

				});
				socket.on("end", function(data) {

				});
				socket.on("close", self.onClose.bind(self));
				socket.on("error", function(error) {
					self.cleanup();
					if(callback) {
						callback(error);
					}
					self.maybeReconnectOnOpen();
				});
				
			}
			this.cleanup = function() {
				this.scoket = null;
				this.readyState = "closed";
			}
			this.writeCache = function() {
				this.cacheFiles = this.cacheFiles || [];
				var datas = this.cache;
				this.cache = [];
				var fileName = latte_lib.random.get();
				latte_fs.write(this.cacheDir+fileName,datas.join("\n"));
				this.cacheFiles.push(this.cacheDir+ fileName);
			}
			this.addCache = function(data) {
				//this.cacheState = "open";
				if(this.cache.length >= this.cacheMax && this.cacheState != "open") {
					this.writeCache();
				}else {
					this.cache.push(data);
				}
			}
			this.write = function(data) {
				if(this.socket && this.cacheState == "close"){
					//&& this.cacheState == "close") {
					this.socket.write(JSON.stringify(data)+"\n");
				} else {
					this.addCache(JSON.stringify(data));
				};
			}
			this.close = function() {
				//cache save or not save to file??? and restart to load the cache
				tthis.cleanup();
				this.socket && this.socket.close();
				this.socket = null;
				this.openReconnect = false;
			}
		}).call(SocketClient.prototype);
		module.exports = SocketClient;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });