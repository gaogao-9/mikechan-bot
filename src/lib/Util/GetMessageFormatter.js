import camelize from "camelize"
import HtmlSpecialChars from "./HtmlSpecialChars.js";

// HTMLエスケープ用のライブラリを初期化する
const h = new HtmlSpecialChars({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
});

class GetMessageFormatter{
	static format(message, dataStore){
		// オブジェクトの整形を行う
		message = formatObject(message, dataStore);
		
		// テキストの整形を行う
		const {text, entities} = formatText(message, dataStore);
		
		// テキストを置換する
		[message.rawText, message.text] = [message.text, text];
		
		// 投稿結果オブジェクトを返す
		return {
			message,
			entities,
		};
	}
}

function formatObject(message, dataStore){
	// スネークケースをキャメルケースに変換する
	message = camelize(message);
	
	return message;
}

function formatText(message, dataStore){
	// 出力の一部となるリプライやチャンネルといった情報を溜めておく配列を定義
	const replyList   = [];
	const channelList = [];
	const othersList  = [];
	
	if(!message.text) return {
		text: "",
		entities: {
			reply:   replyList,
			channel: channelList,
			others:  othersList,
		},
	};
	
	let text = message.text
		// チャンネルの抽出(登録されているユーザー名)
		.replace(/(?:<#([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g, tagReplacerCallback.bind({
			targetList: channelList,
			finder: (id)=> dataStore.getChannelById(id),
		}))
		// ユーザ名の抽出1(登録されているユーザー名)
		.replace(/(?:<@([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g, tagReplacerCallback.bind({
			targetList: replyList,
			finder: (id)=> dataStore.getUserById(id),
		}))
		// その他よくわからないものは良くわからないリストに突っ込んでおく
		.replace(/<([^<>]+)?>/g, ($0, $1)=> {
			othersList.push($1);
			return "";
		});
	
	// ユーザ名の抽出2(架空のユーザー名)
	while(true){
		const replacedText = text.replace(/(?:^|(\s))@([a-z0-9_]+)(?:(\s)|$)/g, ($0,$1,$2,$3)=> {
			replyList.push(dataStore.getUserByName($2));
			return ($1||"")+($3||"");
		});
		if(text === replacedText) break;
		text = replacedText;
	}
	
	// HTML特殊文字をデコードする
	text = h.unescape(text);
	
	return {
		text,
		entities: {
			reply:   replyList,
			channel: channelList,
			others:  othersList,
		},
	};
}

function tagReplacerCallback($0, $1, $2){
	const {targetList, finder} = this;
	
	// IDからオブジェクトを特定する
	const info = finder($1);
	
	if(info){
		targetList.push(info);
	}
	
	// テキスト中からは除外しておく
	return "";
}

export default GetMessageFormatter;
