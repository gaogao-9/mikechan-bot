import DateWithOffset from "date-with-offset";

class PostMessageFormatter{
	constructor(slackBot){
		this._slackBot = slackBot;
	}
	
	get slackBot(){
		return this._slackBot;
	}
	
	async format(msgObj){
		// オブジェクトの整形を行う
		msgObj      = await this.formatObject(msgObj);
		msgObj.text = await this.formatText(msgObj);
		
		// 投稿結果オブジェクトを返す
		return msgObj;
	}
	
	async formatObject(msgObj){
		// チャンネルIDの取得
		if(msgObj.channel_name){
			const channel = await this.slackBot.getChannel(msgObj.channel_name);
			msgObj.channel = channel.id;
			delete msgObj.channel_name;
		}
		
		return msgObj;
	}
	
	async formatText(msgObj){
		let text = msgObj.text || "";
		const rawMsgObj = Object.assign({}, msgObj);
		
		// アイコンURLの正規化
		if(rawMsgObj.iconUrl){
			msgObj.icon_url = rawMsgObj.iconUrl;
		}
		
		delete msgObj.iconUrl;
		
		// リプライ先の付与
		if(rawMsgObj.replyToName){
			text = `@${rawMsgObj.replyToName} ${text}`;
		}
		else if(rawMsgObj.replyTo){
			const usersList = (await this.slackBot.getUsers()).members;
			const replyTo  = usersList.find((obj)=> (obj.id===rawMsgObj.replyTo));
			
			rawMsgObj.replyToName = replyTo.name;
			
			if(replyTo){
				text = `@${replyTo.name} ${text}`;
			}
		}
		
		delete msgObj.replyToName;
		delete msgObj.replyTo;
		
		// Pingテキストの付与
		if(rawMsgObj.usePing && rawMsgObj.ts){
			text += ` (${(((new DateWithOffset(540)) - rawMsgObj.ts*1000)/1000).toFixed(3)}sec)`;
		}
		delete msgObj.usePing;
		
		// 置換が必要なテキストがあったら置換する
		text = text.replace(/\$([a-zA-Z0-9_]+)/g,($0,$1)=>{
			if(typeof(rawMsgObj[$1]) !== "undefined") return rawMsgObj[$1];
			return $0;
		});
		
		return text;
	}
}

export default PostMessageFormatter;
