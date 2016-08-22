process.env.NODE_PATH = __dirname + "/lib";
require('module')._initPaths();

if(process.env.NODE_ENV !== "production"){
	try{
		require("./settings");
	}
	catch(err){
		console.info("設定ファイルを読み込みませんでした。");
	}
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