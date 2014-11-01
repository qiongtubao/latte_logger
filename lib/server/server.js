(function(define) { 'use strict';
	define("latte_lib", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var Server = function() {

		};
		(function() {
			this.onData = function(data) {
				this.handle.onData(data);
			}
			this.onClose = function(data) {
				this.handle.onClose();
			}
			this.onError = function(error) {
				console.log(error);
			}
		}).call(Server.prototype);
		module.exports = Server;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });