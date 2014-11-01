module.exports = require("./lib/index");
var Server = require("./lib/server");
for(var i in Server) {
	module.exports[i] = Server[i];
}