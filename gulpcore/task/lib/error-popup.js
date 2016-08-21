import notifier from "node-notifier";

function errorPopup(err){
	notifier.notify({
		title: "BabelError",
		message: err.message
	});
	
	if(err.stack){
		console.error(err.stack);
	}
	else{
		console.error(err);
	}
	
	if(this && this.emit) this.emit("end");
}

export default errorPopup;