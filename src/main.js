import {WebClient, RtmClient, MemoryDataStore, CLIENT_EVENTS, RTM_EVENTS} from "@slack/client"
import GetMessageFormatter from "Util/GetMessageFormatter"
import PostMessageFormatter from "Util/PostMessageFormatter"
import sleep from "Util/sleep"
import botList from "./actor/index"

const RTM_CLIENT_EVENTS = CLIENT_EVENTS.RTM;

(async ()=> {
	const createOption = (opt)=> Object.assign({ dataStore: new MemoryDataStore() }, opt);
	const ownerClient = new WebClient(process.env.SLACK_OWNER_TOKEN, createOption({logLevel: "error"}));
	
	for(const bot of botList){
		await createRTM(
				process.env[`SLACK_BOT_TOKEN_${bot.username.toUpperCase()}`],
				createOption((process.env.NODE_ENV !== "production") ? {logLevel: "debug"} : {logLevel: "error"}),
				bot,
				ownerClient,
			)
			.start();
	}
})().catch((err)=> {
	console.error("†Unhandled Error†");
	console.error((err&&err.stack) || err);
});

function createRTM(token, option={dataStore: new MemoryDataStore()}, bot, ownerClient){
	const botRtm    = new RtmClient(token, option);
	const botClient = new WebClient(token, option);
	
	botRtm.on(RTM_CLIENT_EVENTS.AUTHENTICATED, (botRtmStartData)=> {
		console.log(`${botRtmStartData.self.name} の認証に成功しました`);
	});
	
	if(bot){
		botRtm.on(RTM_CLIENT_EVENTS.RAW_MESSAGE, async (message)=> {
			try{
				// メッセージをJSONオブジェクトに変換
				message = JSON.parse(message);
				
				const recievedMessageInfo = GetMessageFormatter.format(message, botRtm.dataStore);
				
				let alreadyCalled = false;
				for(const actor of bot.actorList){
					try{
						if(!actor.filter(recievedMessageInfo.message, recievedMessageInfo.entities, alreadyCalled)) continue;
						
						const responseMessage = await actor.action.call(botRtm, recievedMessageInfo.message, recievedMessageInfo.entities, ownerClient, botClient, botRtm);
						if(!responseMessage) continue;
						
						alreadyCalled = true;
						
						if(typeof(responseMessage) !== "object") continue;
						
						const sendingMessage = PostMessageFormatter.format(responseMessage);
						
						sendingMessage.username = sendingMessage.username || bot.username;
						sendingMessage.icon_url = sendingMessage.icon_url || bot.iconUrl;
						sendingMessage.as_user  = sendingMessage.as_user  || bot.asUser;
						
						await botRtm.send(Object.assign({ type: RTM_EVENTS.MESSAGE }, sendingMessage));
					}
					catch(err){
						console.log("actorの呼び出し途中にエラーが発生しました");
						console.error((err&&err.stack) || err);
					}
				}
			}
			catch(err){
				console.log("messageの呼び出し途中にエラーが発生しました");
				console.error((err&&err.stack) || err);
			}
		});
	}
	
	botRtm
		.on(RTM_CLIENT_EVENTS.DISCONNECT, ()=> {
			console.log("通信が途絶しました");
		})
		.on(RTM_CLIENT_EVENTS.WS_ERROR, (err)=> {
			console.log("websocketで何らかのエラーが発生しました");
			console.error((err&&err.stack) || err);
		})
		.on(RTM_CLIENT_EVENTS.WS_CLOSE, ()=> {
			console.log("websocketが閉じられました(3秒後に再接続します)");
			sleep(3000).then(()=> createRTM(token, actorList).start());
		});
	
	return botRtm;
}
