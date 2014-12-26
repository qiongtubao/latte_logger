(function(define) { 'use strict';
	define("latte_logger/lib/streams/dateRollingFileStream", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var BaseRollingFileStream = require("./baseRollingFileStream")
			, latte_lib = require("latte_lib")
			, format = require("../date_format");
		function DateRollingFileStream(config) {
			this.filename_ = config.filename;
			var cpConfig = latte_lib.copy(config);
			this.filename = cpConfig.filename = format.asFileString(this.filename_, new Date(Date.now())) ;
			BaseRollingFileStream.call(this, cpConfig);
		};
		latte_lib.inherits(DateRollingFileStream, BaseRollingFileStream);
		(function() {
			this.shouldRoll = function() {
				this.lastfilename = this.filename;
				var fileString =  format.asFileString(this.filename_, new Date(Date.now()));
				this.filename = fileString;
				return fileString !== this.lastfilename;
			}
			this.roll = function(filename, callback) {
				/**
				 * 极度简化
				 * 可能存在的问题是
				 * 查看日志一时间无法判断哪个是正在写入的文件
				 * 并且未测试查看是否会终止写入
				 * (window linux差异化)
				 */
				latte_lib.async.series([
					this.closeTheStream.bind(this),
					this.openTheStream.bind(this)
				], callback);
			}
		}).call(DateRollingFileStream.prototype);
		module.exports = DateRollingFileStream;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });