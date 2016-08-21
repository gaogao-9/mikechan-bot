import SlackBot from "slackbots"
import GetMessageFormatter from "Util/GetMessageFormatter"
import PostMessageFormatter from "Util/PostMessageFormatter"
import sleep from "Util/sleep"
import botList from "./actor/index"

// エントリポイント
async function startSlackBot(){
	// SlackBot用インスタンスの生成
	const slackBot = new SlackBot({
		token: process.env.NODE_SLACK_BOT_TOKEN,
	});
	// メッセージオブジェクトの整形クラスの生成
	const getMessageFormatter  = new GetMessageFormatter(slackBot);
	const postMessageFormatter = new PostMessageFormatter(slackBot);
	
	// デバッグ用(投稿を止める)
	// slackBot.postMessage = ((_,__,messageObject)=>Promise.resolve(messageObject));
	
	slackBot
		.on("start",()=> {
			// define channel, where bot exist. You can adjust it there https://my.slack.com/services  
			console.log("on start");
		})
		.on("message",async (data)=> {
			try{
				const req = await getMessageFormatter.format(data);
				
				for(const bot of botList){
					let alreadyCalled = false;
					
					for(const actor of bot.actorList){
						try{
							if(!actor.filter(req, alreadyCalled)) continue;
							
							const res = await actor.action.call(slackBot, req, process.env.NODE_SLACK_OWNER_TOKEN, slackBot);
							if(!res) continue;
							
							alreadyCalled = true;
							
							if(typeof(res) !== "object") continue;
							
							const messagePostObject = await postMessageFormatter.format(res);
							const {channelId, text} = messagePostObject;
							
							messagePostObject.username = messagePostObject.username || bot.username;
							messagePostObject.icon_url = messagePostObject.icon_url || bot.iconUrl;
							messagePostObject.as_user  = messagePostObject.as_user  || bot.asUser;
							
							delete messagePostObject.asUser;
							delete messagePostObject.iconUrl;
							delete messagePostObject.channelId;
							delete messagePostObject.text;
							
							await slackBot.postMessage(channelId, text, messagePostObject);
						}
						catch(err){
							console.log("ERROR at actor");
							console.error((err&&err.stack) || err);
						}
					}
				}
			}
			catch(err){
				console.log("ERROR at onmessage");
				console.error((err&&err.stack) || err);
			}
		})
		.on("open",()=> {
			console.log("on open");
			
		})
		.on("close",()=> {
			console.log("on close");
			throw new Error("stream closed");
		})
		.on("error",(err)=> {
			console.log("ERROR at stream");
			console.error((err&&err.stack) || err);
			
			setTimeout(messageLoop, 0);
		});
	
	await slackBot.login();
}

// 落ちた時に自動で再起動します
async function messageLoop(delay=1){
	try{
		await startSlackBot();
	}
	catch(err){
		console.log("ERROR at messageLoop");
		console.error((err&&err.stack) || err);
		console.log(`${delay}秒後に再接続します…`);
		
		await sleep(delay*1000);
		messageLoop(Math.min(delay*2,60));
	}
}

messageLoop().catch(err=>{
	console.error("†Unhandled Error†");
	console.error((err&&err.stack) || err);
	throw err;
});