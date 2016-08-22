import {RTM_EVENTS} from "@slack/client"

const username = "akeno_m";

export default {
	username,
	asUser: true,
	actorList: [
		// 起動時もしくはチャンネル作成時に参加していない全てのチャンネルに参加を試みる
		{
			filter(message, entities, alreadyCalled){
				const {type, subtype} = message;
				
				return (type === RTM_EVENTS.HELLO) || (type === RTM_EVENTS.CHANNEL_CREATED);
			},
			async action(message, entities, ownerClient){
				let ownerInfo;
				
				console.log(this.dataStore);
				
				for(const [channel, channelInfo] of Object.entries(this.dataStore.channels)){
					// 既に参加していたらスルー
					if(channelInfo.is_member) continue;
					
					// オーナー情報を取得する(キャッシュを行う)
					ownerInfo = ownerInfo || await new Promise((resolve, reject)=> {
						ownerClient.auth.test((err, res)=> {
							if(err) reject(err);
							resolve(res);
						});
					});
					
					// オーナーが参加してない場合は、スルー
					if(!channelInfo.members.includes(ownerInfo.user_id)) continue;
					
					// オーナー権限でbotを招待する
					await new Promise((resolve, reject)=> {
						ownerClient.channels.invite({ channel, user: this.activeUserId }, (err, res)=> {
							if(err) reject(err);
							resolve(res);
						});
					});
				}
				
				return true;
			},
		},
		// そのチャンネルに所属しないメンバーを全員呼んでくる
		{
			filter(message, entities, alreadyCalled){
				const {type, subtype, text} = message;
				const {reply}               = entities;
				
				if(type !== RTM_EVENTS.MESSAGE) return false;
				if(subtype) return false;
				if(!reply.includes(username)) return false;
				
				return /((皆|みんな)|(全員|ぜんいん)).*([呼よ](ぶ|べ|ぼう|んで)|(集合|しゅ[うー]ご[うー]))/.test(text);
			},
			async action(message, entities, ownerClient){
				const {channel, user} = message;
				const channelInfo = this.dataStore.getChannelById(channel);
				
				if(!channelInfo) return;
				
				for(const user of Object.keys(this.dataStore.users)){
					// 既に参加していたらスルー
					if(channelInfo.members.includes(user)) continue;
					
					// オーナー権限でメンバーを招待する
					await new Promise((resolve, reject)=> {
						ownerClient.channels.invite({ channel: channelInfo.id, user }, (err, res)=> {
							if(err) reject(err);
							resolve(res);
						});
					});
				}
				
				return {
					channel,
					replyTo: user,
					text: "みんなを呼んできたよ♪",
				};
			},
		},
		// リプライにはランダムな応答を行う
		{
			filter(message, entities, alreadyCalled){
				const {type, subtype, text} = message;
				const {reply}               = entities;
				
				if(type !== RTM_EVENTS.MESSAGE) return false;
				if(subtype) return false;
				if(alreadyCalled) return false;
				
				return ~reply.findIndex((user)=> user.name === username);
			},
			async action(message, entities, ownerClient){
				const {channel, user} = message;
				
				const wordList = [
					"えへへっ",
					"よーそろー！",
					"わたし、岬明乃！",
					"ちゃんと艦長出来てるかなぁ…？",
				];
				
				return {
					channel,
					replyTo: user,
					text: wordList[Math.random()*wordList.length|0],
				};
			},
		},
	],
}
