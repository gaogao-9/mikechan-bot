"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=randomMessage;var _client=require("@slack/client");var _SelectableArray=require("Util/SelectableArray");var _SelectableArray2=_interopRequireDefault(_SelectableArray);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{return Promise.resolve(value).then(function(value){return step("next",value);},function(err){return step("throw",err);});}}return step("next");});};}function randomMessage(wordList){let matchRegExp=arguments.length<=1||arguments[1]===undefined?null:arguments[1];let useAlreadyCalled=arguments.length<=2||arguments[2]===undefined?true:arguments[2];if(typeof wordList==="string"){wordList=[wordList];}wordList=_SelectableArray2.default.from(wordList||[]).filter(word=>word&&typeof word==="string");return{filter(message,entities,alreadyCalled){const type=message.type;const subtype=message.subtype;const text=message.text;if(type!==_client.RTM_EVENTS.MESSAGE)return false;if(subtype)return false;if(useAlreadyCalled&&alreadyCalled)return false;if(matchRegExp&&!matchRegExp.test(text))return false;return true;},action(message,entities,ownerClient){var _this=this;return _asyncToGenerator(function*(){const channel=message.channel;const user=message.user;if(!wordList||!wordList.length)return;// ランダムにワードを抽出する
const word=wordList.random();if(!word)return;// ワードに対して特定のタグの置換処理を行う
const text=word.replace(/\[\[replyToName\]\]/ig,_this.dataStore.getUserById(user).name);return{channel,replyTo:user,text};})();}};}module.exports=exports["default"];