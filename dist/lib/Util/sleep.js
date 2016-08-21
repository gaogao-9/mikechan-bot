"use strict";Object.defineProperty(exports,"__esModule",{value:true});// setTimeoutはsigned 32bitまでしか対応してないので、それ以上の遅延は分割await実装で対応する
let sleep=(()=>{var _ref=_asyncToGenerator(function*(delay){while(delay>maxDelay){yield sleep32bit(maxDelay);delay-=maxDelay;}yield sleep32bit(delay);});return function sleep(_x){return _ref.apply(this,arguments);};})();function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{return Promise.resolve(value).then(function(value){return step("next",value);},function(err){return step("throw",err);});}}return step("next");});};}const maxDelay=-1>>>1;function sleep32bit(ms){if(ms<0)return Promise.resolve();return new Promise(resolve=>{setTimeout(resolve,ms);});}exports.default=sleep;module.exports=exports["default"];