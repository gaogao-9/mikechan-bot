"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _dateWithOffset=require("date-with-offset");var _dateWithOffset2=_interopRequireDefault(_dateWithOffset);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{return Promise.resolve(value).then(function(value){return step("next",value);},function(err){return step("throw",err);});}}return step("next");});};}class PostMessageFormatter{constructor(slackBot){this._slackBot=slackBot;}get slackBot(){return this._slackBot;}format(msgObj){var _this=this;return _asyncToGenerator(function*(){// オブジェクトの整形を行う
msgObj=yield _this.formatObject(msgObj);msgObj.text=yield _this.formatText(msgObj);// 投稿結果オブジェクトを返す
return msgObj;})();}formatObject(msgObj){var _this2=this;return _asyncToGenerator(function*(){// チャンネルIDの取得
if(msgObj.channel_name){const channel=yield _this2.slackBot.getChannel(msgObj.channel_name);msgObj.channel=channel.id;delete msgObj.channel_name;}return msgObj;})();}formatText(msgObj){var _this3=this;return _asyncToGenerator(function*(){let text=msgObj.text||"";const rawMsgObj=Object.assign({},msgObj);// アイコンURLの正規化
if(rawMsgObj.iconUrl){msgObj.icon_url=rawMsgObj.iconUrl;}delete msgObj.iconUrl;// リプライ先の付与
if(rawMsgObj.replyToName){const usersList=(yield _this3.slackBot.getUsers()).members;const replyTo=usersList.find(function(obj){return obj.name===rawMsgObj.replyToName;});rawMsgObj.replyTo=replyTo.name;}if(rawMsgObj.replyTo){text=`<@${rawMsgObj.replyTo}> ${text}`;}delete msgObj.replyToName;delete msgObj.replyTo;// Pingテキストの付与
if(rawMsgObj.usePing&&rawMsgObj.ts){text+=` (${((new _dateWithOffset2.default(540)-rawMsgObj.ts*1000)/1000).toFixed(3)}sec)`;}delete msgObj.usePing;// 置換が必要なテキストがあったら置換する
text=text.replace(/\$([a-zA-Z0-9_]+)/g,function($0,$1){if(typeof rawMsgObj[$1]!=="undefined")return rawMsgObj[$1];return $0;});return text;})();}}exports.default=PostMessageFormatter;module.exports=exports["default"];