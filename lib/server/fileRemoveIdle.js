(function(define) { 'use strict';
	define("latte_logger/fileRemoveIdle", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var latte_lib = require("latte_lib")
			, removeIdle = require('latte_removeidle');
		function FileRemoveIdle() {
			this.data = {};
			var self = this;
			removeIdle.call(this, {
				destroy: function(object) {
					object.end();				
					for(var i in self.data) {
						if(self.data[i] == object) {
							delete self.data[i];
						}
					}
				}
			});
		};

		latte_lib.inherits(FileRemoveIdle,removeIdle);
		(function() {
			this.set = function(key, value) {
				this.data[key] = value;
				this.release(value);
			}
			this.get = function(key) {
				var value = this.data[key];
				this.getIdle(value);
				return value;
			}
			this.delete = function(key) {
				this.destroy(this.data[key]);
				//this.data[key] && this.data.key.end();
				//delete this.data[key];

			}

		}).call(FileRemoveIdle.prototype);
		module.exports = FileRemoveIdle;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });