import randomMessage from "Action/randomMessage"

export default function randomReply(username, wordList, matchRegExp=null, useAlreadyCalled=true){
	const randomMessageObject = randomMessage(wordList, matchRegExp, useAlreadyCalled);
	
	return {
		filter(message, entities, alreadyCalled){
			const {reply} = entities;
			
			if(!~reply.findIndex((user)=> user.name === username)) return false;
			
			return randomMessageObject.filter.call(this, message, entities, alreadyCalled);
		},
		action: randomMessageObject.action,
	};
}
