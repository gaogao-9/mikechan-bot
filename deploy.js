require("./dist/setting.js");

const cp = require("child_process");

const nodeEnv    = `NODE_ENV=production`;
const port       = `PORT=80`;
const ownerToken = `SLACK_OWNER_TOKEN=${process.env.SLACK_OWNER_TOKEN}`;
const botTokens  = Object.keys(process.env)
	.filter((key)=> key.startsWith("SLACK_BOT_TOKEN_"))
	.map((key)=> `${key}=${process.env[key]}`);

const args = [nodeEnv, port, ownerToken]
	.concat(botTokens)
	.map((env)=> `-e ${env}`)
	.join(" ");

// nowへの環境変数の渡し方
// $ now -e PARAM1=VALUE1 -e PARAM2=VALUE2 ...
cp.exec(`now ${args}`, { maxBuffer: 1024*1024 }, (err, stdout, stderr)=> {
	if(stdout){
		console.log("stdout", stdout);
	}
	if(stderr){
		console.error("stderr", stderr);
	}
	if(err){
		console.error("Exec error", error);
	}
});
