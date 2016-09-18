import {RTM_EVENTS} from "@slack/client"

export default function addReaction(reactionList, matchRegExp, useAlreadyCalled=true){
	return {
		filter(message, entities, alreadyCalled){
			const {type, subtype, text} = message;
			
			if(type !== RTM_EVENTS.MESSAGE) return false;
			if(subtype) return false;
			if(useAlreadyCalled && alreadyCalled) return false;
			if(matchRegExp && !matchRegExp.test(text)) return false;
			
			return true;
		},
		async action(message, entities, ownerClient, botClient){
			const {channel, ts} = message;
			
			// リアクションを順次付与していく
			for(const reaction of reactionList){
				await botClient.reactions.add(reaction, {
					channel,
					timestamp: ts,
				});
			}
		},
	};
}
