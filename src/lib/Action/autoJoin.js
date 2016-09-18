export default function autoJoin(eventType){
	return {
		filter(message, entities, alreadyCalled){
			const {type, subtype} = message;
			
			return type === eventType;
		},
		async action(message, entities, ownerClient){
			let ownerInfo;
			
			for(const [channel, channelInfo] of Object.entries(this.dataStore.channels)){
				// 既に参加していたらスルー
				if(channelInfo.is_member) continue;
				
				// オーナー情報を取得する(キャッシュを行う)
				ownerInfo = ownerInfo || await ownerClient.auth.test();
				
				// オーナーが参加してない場合は、スルー
				if(channelInfo.members && !channelInfo.members.includes(ownerInfo.user_id)) continue;
				
				// オーナー権限でbotを招待する
				await ownerClient.channels.invite(channel, this.activeUserId);
			}
		},
	};
}
