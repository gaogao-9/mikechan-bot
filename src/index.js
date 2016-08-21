process.env.NODE_PATH = __dirname + "/lib";
require('module')._initPaths();

if(process.env.NODE_ENV !== "production"){
	try{
		require("./slackToken");
	}
	catch(err){}
}
else{
	// herokuはサーバー立てないと再起動するらしい(闇)
	require("http").createServer((req, res)=> {
		res.writeHead(200, "OK", {
			"Content-Type": "text/plain; charset=UTF-8",
		});
		res.end("わたし、岬明乃！");
	}).listen(process.env.PORT);
}

require("babel-polyfill");
require("./main");