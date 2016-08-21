import HtmlSpecialChars from "./HtmlSpecialChars.js";

// HTMLエスケープ用のライブラリを初期化する
const h = new HtmlSpecialChars({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
});

class GetMessageFormatter{
	constructor(slackBot){
		this._slackBot = slackBot;
	}
	
	get slackBot(){
		return this._slackBot;
	}
	
	async format(msgObj){
		// オブジェクトの整形を行う
		msgObj = await this.formatObject(msgObj);
		
		// テキストの整形を行う
		const {text, symbols} = await this.formatText(msgObj);
		
		// テキストを置換する
		[msgObj.rawText,msgObj.text] = [msgObj.text, text];
		
		// 投稿結果オブジェクトを返す
		return {
			messageObject: msgObj,
			symbols,
		};
	}
	
	async formatObject(msgObj){
		return msgObj;
	}
	
	async formatText(msgObj){
		// 出力の一部となるリプライやチャンネルといった情報を溜めておく配列を定義
		const replyList   = [];
		const channelList = [];
		const othersList  = [];
		
		if(!msgObj.text) return {
			text: "",
			symbols: {
				reply: replyList,
				channel: channelList,
				others: othersList,
			},
		};
		
		// 参加者一覧を取ってくる
		const usersList = (await this.slackBot.getUsers()).members;
		
		// チャンネル一覧を取ってくる
		const channelsList = (await this.slackBot.getChannels()).channels;
		
		let text = msgObj.text
			// チャンネルの抽出(登録されているユーザー名)
			.replace(/(?:<#([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g, tagReplacerCallback.bind({
					targetList:  channelList,
					subjectList: channelsList,
				}))
			// ユーザ名の抽出1(登録されているユーザー名)
			.replace(/(?:<@([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g, tagReplacerCallback.bind({
					targetList:  replyList,
					subjectList: usersList,
				}))
			// その他よくわからないものは良くわからないリストに突っ込んでおく
			.replace(/<([^<>]+)?>/g,($0,$1)=>{
					othersList.push($1);
					return "";
				});
		
		// ユーザ名の抽出2(架空のユーザー名)
		while(true){
			const replacedText = text.replace(/(?:^|(\s))@([a-z0-9_]+)(?:(\s)|$)/g, ($0,$1,$2,$3)=> {
				replyList.push($2);
				return ($1||"")+($3||"");
			});
			if(text === replacedText) break;
			text = replacedText;
		}
		
		// HTML特殊文字をデコードする
		text = h.unescape(text);
		
		return {
			text,
			symbols: {
				reply: replyList,
				channel: channelList,
				others: othersList,
			},
		};
	}
}

function tagReplacerCallback($0,$1,$2){
	const {targetList,subjectList} = this;
	
	if($2){
		// エイリアスの指定があればそれを利用する
		targetList.push($2);
	}
	else{
		// 指定がなければリストの中から特定する
		const subject = subjectList.find(obj=>obj.id===$1);
		if(subject){
			targetList.push(subject.name);
		}
	}
	
	// テキスト中からは除外しておく
	return "";
}

export default GetMessageFormatter;
