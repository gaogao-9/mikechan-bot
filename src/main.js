import {RtmClient, MemoryDataStore, CLIENT_EVENTS, RTM_EVENTS} from "@slack/client"
import GetMessageFormatter from "Util/GetMessageFormatter"
import PostMessageFormatter from "Util/PostMessageFormatter"
import sleep from "Util/sleep"
import botList from "./actor/index"

const RTM_CLIENT_EVENTS = CLIENT_EVENTS.RTM;

(async ()=> {
	const ownerRTMp = {};
	const createOption = (opt)=> Object.assign({ dataStore: new MemoryDataStore() }, opt);
	
	createRTM(process.env.SLACK_OWNER_TOKEN, createOption({logLevel: "error"}))
		.on(RTM_CLIENT_EVENTS.AUTHENTICATED, function(rtmStartData){
			ownerRTMp.v = this;
		})
		.start();
	
	for(const bot of botList){
		createRTM(
				process.env[`SLACK_BOT_TOKEN_${bot.name.toUpperCase()}`],
				createOption((process.env.NODE_ENV !== "production") ? {logLevel: "debug"} : {logLevel: "error"}),
				bot,
				ownerRTMp,
			)
			.start();
	}
})().catch((err)=> {
	console.error("†Unhandled Error†");
	console.error((err&&err.stack) || err);
});

function createRTM(token, option={dataStore: new MemoryDataStore()}, bot, ownerRTMp){
	const rtm     = new RtmClient(token, option);
	
	rtm.on(RTM_CLIENT_EVENTS.AUTHENTICATED, (rtmStartData)=> {
		console.log(`${rtmStartData.self.name} の認証に成功しました。`);
	});
	
	if(bot){
		rtm.on(RTM_EVENTS.MESSAGE, async (message)=> {
			try{
				let alreadyCalled = false;
				
				const recievedMessage = GetMessageFormatter.format(message, rtm.dataStore);
				
				for(const actor of bot.actorList){
					try{
						if(!actor.filter(recievedMessage, alreadyCalled)) continue;
						
						const responseMessage = await actor.action.call(rtm, recievedMessage, ownerRTMp.v, rtm);
						if(!responseMessage) continue;
						
						alreadyCalled = true;
						
						if(typeof(responseMessage) !== "object") continue;
						
						const sendingMessage = PostMessageFormatter.format(responseMessage);
						
						sendingMessage.username = sendingMessage.username || bot.username;
						sendingMessage.icon_url = sendingMessage.icon_url || bot.iconUrl;
						sendingMessage.as_user  = sendingMessage.as_user  || bot.asUser;
						
						await new Promise((resolve, reject)=> {
							rtm.send(Object.assign({ type: RTM_API_EVENTS.MESSAGE }, sendingMessage), (err, msg)=> {
								if(err) reject(err);
								resolve(msg);
							});
						});
					}
					catch(err){
						console.log("actorの呼び出し途中にエラーが発生しました。");
						console.error((err&&err.stack) || err);
					}
				}
			}
			catch(err){
				console.log("messageの呼び出し途中にエラーが発生しました。");
				console.error((err&&err.stack) || err);
			}
		});
	}
	
	rtm
		.on(RTM_CLIENT_EVENTS.DISCONNECT, ()=> {
			console.log("通信途絶しました");
		})
		.on(RTM_CLIENT_EVENTS.WS_ERROR, (err)=> {
			console.log("websocketで何らかのエラーが発生しました。");
			console.error((err&&err.stack) || err);
		})
		.on(RTM_CLIENT_EVENTS.WS_CLOSE, ()=> {
			console.log("websocketが閉じられました(3秒後に再接続します)");
			sleep(3000).then(()=> createRTM(token, actorList).start());
		});
	
	return rtm;
}
