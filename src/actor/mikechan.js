const botName = "akeno_m";

export default {
	asUser: true,
	actorList: [
		// 起動時もしくはチャンネル作成時に参加していない全てのチャンネルに参加を試みる
		{
			filter(messageInfo, alreadyCalled){
				const {type, subtype} = messageInfo.messageObject;
				
				return (type === "hello") || (type === "channel_created");
			},
			async action(messageInfo, ownerToken){
				const channelList = (await this.getChannels()).channels;
				const userInfo    = await this.getUser(botName);
				
				const _token = this.token;
				try{
					this.token = ownerToken;
					
					for(const channel of channelList){
						if(channel.is_member) continue;
						
						await this._api("channels.invite", { channel: channel.id, user: userInfo.id });
					}
				}
				finally{
					this.token = _token;
				}
				
				return true;
			},
		},
		// そのチャンネルに所属しないメンバーを全員呼んでくる
		{
			filter(messageInfo, alreadyCalled){
				const {type, subtype, text} = messageInfo.messageObject;
				const {reply}               = messageInfo.symbols;
				
				if(type !== "message") return false;
				if(subtype) return false;
				if(!reply.includes("akeno_m")) return false;
				
				return /((皆|みんな)|(全員|ぜんいん)).*([呼よ](ぼう|んで)|(集合|しゅ[うー]ご[うー]))/.test(text);
			},
			async action(messageInfo, ownerToken){
				const {channel: channelId, user} = messageInfo.messageObject;
				const userList    = (await this.getUsers()).members;
				const channelInfo = (await this.getChannelById(channelId)).channel;
				
				if(!channelInfo) return;
				
				const _token = this.token;
				try{
					this.token = ownerToken;
					
					for(const user of userList){
						if(channelInfo.members.includes(user.id)) continue;
						
						await this._api("channels.invite", { channel: channelId, user: user.id });
					}
				}
				finally{
					this.token = _token;
				}
				
				return {
					channelId,
					replyTo: user,
					text: "みんなを呼んできたよ♪",
				};
			},
		},
		// リプライにはランダムな応答を行う
		{
			filter(messageInfo, alreadyCalled){
				const {type, subtype, text} = messageInfo.messageObject;
				const {reply}               = messageInfo.symbols;
				
				if(type !== "message") return false;
				if(subtype) return false;
				if(alreadyCalled) return false;
				
				return reply.includes("akeno_m");
			},
			async action(messageInfo, ownerToken){
				const {channel: channelId, user} = messageInfo.messageObject;
				
				const wordList = [
					"えへへっ",
					"よーそろー！",
					"わたし、岬明乃！",
					"ちゃんと艦長出来てるかなぁ…？",
				];
				
				return {
					channelId,
					replyTo: user,
					text: wordList[Math.random()*wordList.length|0],
				};
			},
		},
	],
}
