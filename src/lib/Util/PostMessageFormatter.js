import snakeize from "snakeize"
import DateWithOffset from "date-with-offset"

class PostMessageFormatter{
	constructor(slackBot){
		this._slackBot = slackBot;
	}
	
	get slackBot(){
		return this._slackBot;
	}
	static format(message, dataStore){
		// オブジェクトの整形を行う
		message = formatObject(message, dataStore);
		
		// テキストの整形を行う
		message.text = formatText(message, dataStore);
		
		// 投稿結果オブジェクトを返す
		return message;
	}
}

function formatObject(message, dataStore){
	// キャメルケースを全てスネークケースに変換する
	message = snakeize(message);
	
	// チャンネルIDの取得
	if(message.channel_name){
		const channel = dataStore.getChannelByName(message.channel_name);
		message.channel = channel.id;
		delete message.channel_name;
	}
	
	return message;
}

function formatText(message, dataStore){
	let text = message.text || "";
	const rawMessage = Object.assign({}, message);
	
	// リプライ先の付与
	if(rawMessage.reply_to_name){
		const userInfo = dataStore.getUserByName(rawMessage.reply_to_name);
		
		rawMessage.reply_to = userInfo.id;
	}
	if(rawMessage.reply_to){
		text = `<@${rawMessage.reply_to}> ${text}`;
	}
	
	delete message.reply_to_name;
	delete message.reply_to;
	
	// Pingテキストの付与
	if(rawMessage.use_ping && rawMessage.ts){
		text += ` (${(((new DateWithOffset(540)) - rawMessage.ts*1000)/1000).toFixed(3)}sec)`;
	}
	delete message.use_ping;
	
	// 置換が必要なテキストがあったら置換する
	text = text.replace(/\$([a-zA-Z0-9_]+)/g, ($0, $1)=> {
		if(rawMessage[$1] !== undefined){
			return rawMessage[$1];
		}
		return $0;
	});
	
	return text;
}

export default PostMessageFormatter;
