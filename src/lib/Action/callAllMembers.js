import {RTM_EVENTS} from "@slack/client"
import randomReply  from "Action/randomReply"

export default function callAllMembers(username, wordList, matchRegExp, useAlreadyCalled=true){
	const randomReplyObject = randomReply(username, wordList, matchRegExp, useAlreadyCalled);
	
	return {
		filter: randomReplyObject.filter,
		async action(message, entities, ownerClient){
			const {channel, user} = message;
			const channelInfo = this.dataStore.getChannelById(channel);
			
			if(!channelInfo) return;
			
			for(const user of Object.keys(this.dataStore.users)){
				// 既に参加していたらスルー
				if(channelInfo.members.includes(user)) continue;
				
				// オーナー権限でメンバーを招待する
				await ownerClient.channels.invite(channelInfo.id, user);
			}
			
			return randomReplyObject.action.call(this, message, entities, ownerClient);
		},
	};
}
