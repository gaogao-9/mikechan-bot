import del from "del";
import glob from "globby";

function cleanTask(src){
	return async function cleanTask(){
		return del(await glob(src));
	};
}

export default cleanTask;