class HtmlSpecialChars{
	constructor(list){
		if(typeof(list) === "undefined") return;
		
		this.escapeList = list;
	}
	
	set escapeList(value){
		if(typeof(value) !== "object"){
			throw new TypeError("escapeListはObject型のプロパティです");
		}
		
		this._escapeList = value;
		
		const keys   = Object.keys(this._escapeList);
		const values = keys.map(key=>{
			return this._escapeList[key];
		});
		
		this._unescapeList = keys.reduce((obj,key,i)=>{
			obj[values[i]] = key;
			return obj;
		},{});
		this._escapeRegExp   = new RegExp(`(${keys.join("|")})`,"g");
		this._unescapeRegExp = new RegExp(`(${values.join("|")})`,"g");
	}
	get escapeList(){ return this._escapeList; }
	
	get unescapeList(){ return this._unescapeList; }
	
	get escapeRegExp(){ return this._escapeRegExp; }
	
	get unescapeRegExp(){ return this._unescapeRegExp; }
	
	escape(str){
		return str.replace(this.escapeRegExp,$0=>this.escapeList[$0]);
	}
	
	unescape(str){
		return str.replace(this.unescapeRegExp,$0=>this.unescapeList[$0]);
	}
}

export default HtmlSpecialChars;

/* usage
const h = new HtmlSpecialChars({
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;'
});

console.log("エスケープ");
const escapedStr = h.escape('<script>alert("XSS");</script>');
console.log(escapedStr); // '&lt;script&gt;alert("XSS");&lt;/script&gt;'

console.log("アンエスケープ");
const unescapedStr = h.unescape(escapedStr);
console.log(unescapedStr); // '<script>alert("XSS");</script>;'
*/