export default function randomFilter(rate, actor){
	if(Number.isFinite(rate)){
		const _rate = Math.max(0, Math.min(rate, 1));
		rate = ()=> (Math.random() < _rate);
	}
	if(typeof(rate) !== "function") throw new Error("randomFilter: 引数が不正です。");
	
	return {
		filter(...args){
			if(rate()) return false;
			
			return actor.filter.call(this, ...args);
		},
		action(...args){
			return actor.action.call(this, ...args);
		},
	};
}
