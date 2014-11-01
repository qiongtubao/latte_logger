//nodejs
(function(define) { 'use strict';
	define("logger/index", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var events = require("events")
			, latte_lib = require("latte_lib")
			, fs = require("fs")
			, path = require("path")
			, util = require("util")
			, ALL_CATEGORIES = "[all]"
			, Logger = require("./logger")
			, loggers = {}
			, regs = []
			, appenders = {}
			, sets = {}
			, defaultConfig = {
				appenders: [
					{
						type: "console"
					}
				],
				replaceConsole: false
			},
			RunTypes = {
				DEFAULT: 0,
				TEMPLATE: 1,
				REG: 2
			};
		(function() {
			var _self = this;
				var changeConfig = function(config, sets) {
					return JSON.parse(latte_lib.mustache(JSON.stringify(config), sets));
				}
				/**
					@method
					@static 
					
				*/
				this.hasLogger = function(loggerName) {
					return loggers.hasOwnProperty(loggerName);
				}
				this.getLogger= function(loggerName) {
					if(!latte_lib.isString(loggerName)) {
						loggerName = Logger.DEFAULT_CATEGORY;
					}
					var appenderList;
					if(!_self.hasLogger(loggerName)) {
						loggers[loggerName] = Logger.create(loggerName);
						if(appenders[loggerName]) {
							appenderList = appenders[loggerName];
							appenderList.forEach(function(appender) {
								loggers[loggerName].on("log", appender);
							});
						} 
						//即符合固定名字又符合正则表达式的logger
						for(var i = 0, len = regs.length; i < len;i++) {
							if(regs[i].reg.test(loggerName)) {
								switch(regs[i].config.runType) {
									case RunTypes.REG:
										var oneSets = latte_lib._clone(sets);
										oneSets["$category"] = loggerName;
										var clone = changeConfig(regs[i].config, oneSets);
										clone.category = loggerName;
										var appender = _self.loadAppender(clone, regs[i].options);
										addAppender(appender, loggerName);
									break;
								}
							}
						}

						if(appenders[ALL_CATEGORIES]) {
							appenderList = appenders[ALL_CATEGORIES];
							appenderList.forEach(function(appender) {
								loggers[loggerName].on("log", appender);
							});
						}
					}
					return loggers[loggerName];
				}
				/**
					@method
					@static 
					添加输出方式
				*/
				var addAppender = this.addAppender = function(appender, who) {
					if(!latte_lib.isArray(who)) {
						who = [who];
					}
					who.forEach(function(loggerName) {
						if(!appenders[loggerName]) {
							appenders[loggerName] = [];
						}
						appenders[loggerName].push(appender);
						//原来已经创建的loggers 也加上该输出
						if(loggerName == ALL_CATEGORIES) {
							for(var l in loggers) {
								var logger = loggers[l];
								logger.on("log", appender);
							}
						} else if(_self.hasLogger(loggerName)) {
							loggers[loggerName].on("log", appender);
						}
					});
				}
			this.loadAppender = function(appenderConfig, options) {
				var appenderModule = require("./appenders/"+ appenderConfig.type);
				return appenderModule.configure(appenderConfig, options);
			}


				/**
					@method
					@public

				*/
				this.configureServers = function(servers) {
					if(!servers) {return;}
					for(var i in servers) {
						self.configureServer(i, servers[i]);
					}
				}
				var configureServer = this.configureServer = function(servers) {
					var Server = require("./appenders/server");
					for(var i in servers) {
						Server.addServerConfig(i, servers[i]);
					}
					
				}
				/**
					@method
					@private
					load config.appenders 
				*/
				var configureAppenders = this.configureAppenders =function(appenderList, options) {
					if(appenderList) {
						appenderList.forEach(function(appenderConfig) {
							/**
								正则表达式匹配 
								优点 可以动态的生成日志对象
								缺点 不过正则表达式的话可能会导致太多的打印日志
							*/
							switch(appenderConfig.runType) {
								case RunTypes.REG:
									if(appenderConfig.category) {
										if(!latte_lib.isArray(appenderConfig.category)) {
											appenderConfig.category = [appenderConfig.category];
										} 
										appenderConfig.category.forEach(function(category) {
											regs.push({
												reg: new RegExp(appenderConfig.reg),
												config: appenderConfig,
												options: options
											});
										});
									}
									
								break;
								case RunTypes.TEMPLATE:
									if(appenderConfig.category) {
										if(!latte_lib.isArray(appenderConfig.category)) {
											appenderConfig.category = [appenderConfig.category];
										}
										appenderConfig.category.forEach(function(category) {
											var oneSets = latte_lib._clone(sets);
											oneSets["$category"] = category;
											var clone = changeConfig(appenderConfig, oneSets);
											clone.category = category;
											var appender = _self.loadAppender(clone, options);
											addAppender(appender, category);
										});
									}
								break;
								default:
									appenderConfig = changeConfig(appenderConfig, sets);
									var appender = _self.loadAppender(appenderConfig, options);
									addAppender(appender, appenderConfig.category);
								break;
							}
						});
					}
				}
				/**
					@method
					@static
					set levels
				*/
				var configureLevels = _self.configureLevels = function(levels) {
					if(levels) {
						for(var category in levels) {
							_self.getLogger(category).setLevel(levels[category]);
						}
					}
				}
				/**
					@method
					@private
					设置属性
				*/
				var configureOnceOff = function(config, options) {
					if(config) {
						configureServer(config.servers);
						configureAppenders(config.appenders, options);
						configureLevels(config.levels);
						config.disableAllConsoleWrites && Logger.disableAllConsoleWrites();
						config.disableAllLogWrites && Logger.disableAllLogWrites();
						
					}
				}
				/**
					@method
					@private
					加载配置文件

				*/
				var loadConfigurationFile = function(fileName) {
					if(fileName) {
						return JSON.parse(fs.readFileSync(fileName, "utf8"));
					}
					return undefined;
				}
			/**
				@method
				@static
				设置加载配置文件或内容
			*/
			this.configure = function(config, options) {
				options = options || {};
				if(config === undefined || config === null ) {
					config = defaultConfig;
				} else if(latte_lib.isString(config)) {
					config = loadConfigurationFile(config);
				} 
				configureOnceOff(config, options);
			}
			this.set = function(key, value) {
				sets[key] = value;
			}
		}).call(module.exports);
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });