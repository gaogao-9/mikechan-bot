import Circle from "Util/Circle"

const circleMap = new WeakMap();

export default class SelectableArray extends Array{
	static get [Symbol.species]() { return SelectableArray; }
	
	constructor(...args){
		super(...args);
	}
	
	random(){
		return this[Math.random()*this.length|0];
	}
	
	sequence(){
		let circle = circleMap.get(this);
		
		if(circle){
			circle.length = this.length;
		}
		else{
			circle = new Circle(this.length);
		}
		
		const value = this[circle.now];
		
		circle.succ;
		circleMap.set(this, circle);
		
		return value;
	}
}
