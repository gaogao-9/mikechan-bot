process.env.NODE_PATH = __dirname + "/lib";
require('module')._initPaths();

if(process.env.NODE_ENV !== "production"){
	try{
		require("./slackToken");
	}
	catch(err){}
}

require("babel-polyfill");
require("./main");