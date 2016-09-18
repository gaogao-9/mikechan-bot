class Circle{
	constructor(length, offset=0){
		this._offset = offset;
		this.now = this._offset;
		this.length = length;
	}
	
	set now(value){
		this._cursor = value;
		this.succ; this.prev;
	}
	get now(){
		return this._cursor;
	}
	
	set length(value){
		this._length = value - 1;
		this.succ; this.prev;
	}
	get length(){
		return this._length + 1;
	}
	
	get succ(){
		this._cursor++;
		if(this._cursor > (this._length+this._offset)) this._cursor = this._offset;
		return this._cursor;
	}
	
	get prev(){
		this._cursor--;
		if(this._cursor < this._offset) this._cursor = (this._length+this._offset);
		return this._cursor;
	}
}

export default Circle;