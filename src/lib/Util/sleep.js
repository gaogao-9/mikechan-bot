const maxDelay = -1 >>> 1;

// setTimeoutはsigned 32bitまでしか対応してないので、それ以上の遅延は分割await実装で対応する
async function sleep(delay){
	while(delay>maxDelay){
		await sleep32bit(maxDelay);
		delay -= maxDelay;
	}
	await sleep32bit(delay);
}

function sleep32bit(ms){
	if(ms<0) return Promise.resolve();
	
	return new Promise(resolve=>{
		setTimeout(resolve,ms);
	});
}

export default sleep;