import {RTM_EVENTS} from "@slack/client"
import SelectableArray from "Util/SelectableArray"

export default function randomMessage(wordList, matchRegExp=null, useAlreadyCalled=true){
	if(typeof(wordList) === "string"){
		wordList = [wordList];
	}
	wordList = SelectableArray
		.from(wordList || [])
		.filter((word)=> (word && (typeof(word) === "string")));
	
	return {
		filter(message, entities, alreadyCalled){
			const {type, subtype, text} = message;
			
			if(type !== RTM_EVENTS.MESSAGE) return false;
			if(subtype) return false;
			if(useAlreadyCalled && alreadyCalled) return false;
			if(matchRegExp && !matchRegExp.test(text)) return false;
			
			return true;
		},
		async action(message, entities, ownerClient){
			const {channel, user} = message;
			
			if(!wordList || !wordList.length) return;
			
			// ランダムにワードを抽出する
			const word = wordList.random();
			if(!word) return;
			
			// ワードに対して特定のタグの置換処理を行う
			const text = word
				.replace(/\[\[replyToName\]\]/ig, this.dataStore.getUserById(user).name);
			
			return {
				channel,
				replyTo: user,
				text,
			};
		},
	};
}
