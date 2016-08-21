'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _HtmlSpecialChars=require('./HtmlSpecialChars.js');var _HtmlSpecialChars2=_interopRequireDefault(_HtmlSpecialChars);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{return Promise.resolve(value).then(function(value){return step("next",value);},function(err){return step("throw",err);});}}return step("next");});};}// HTMLエスケープ用のライブラリを初期化する
const h=new _HtmlSpecialChars2.default({'&':'&amp;','<':'&lt;','>':'&gt;'});class GetMessageFormatter{constructor(slackBot){this._slackBot=slackBot;}get slackBot(){return this._slackBot;}format(msgObj){var _this=this;return _asyncToGenerator(function*(){// オブジェクトの整形を行う
msgObj=yield _this.formatObject(msgObj);// テキストの整形を行う
var _ref=yield _this.formatText(msgObj);const text=_ref.text;const symbols=_ref.symbols;// テキストを置換する
// 投稿結果オブジェクトを返す
var _ref2=[msgObj.text,text];msgObj.rawText=_ref2[0];msgObj.text=_ref2[1];return{messageObject:msgObj,symbols};})();}formatObject(msgObj){return _asyncToGenerator(function*(){return msgObj;})();}formatText(msgObj){var _this2=this;return _asyncToGenerator(function*(){// 出力の一部となるリプライやチャンネルといった情報を溜めておく配列を定義
const replyList=[];const channelList=[];const othersList=[];if(!msgObj.text)return{text:"",symbols:{reply:replyList,channel:channelList,others:othersList}};// 参加者一覧を取ってくる
const usersList=(yield _this2.slackBot.getUsers()).members;// チャンネル一覧を取ってくる
const channelsList=(yield _this2.slackBot.getChannels()).channels;let text=msgObj.text// チャンネルの抽出(登録されているユーザー名)
.replace(/(?:<#([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g,tagReplacerCallback.bind({targetList:channelList,subjectList:channelsList}))// ユーザ名の抽出1(登録されているユーザー名)
.replace(/(?:<@([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g,tagReplacerCallback.bind({targetList:replyList,subjectList:usersList}))// その他よくわからないものは良くわからないリストに突っ込んでおく
.replace(/<([^<>]+)?>/g,function($0,$1){othersList.push($1);return"";});// ユーザ名の抽出2(架空のユーザー名)
while(true){const replacedText=text.replace(/(?:^|(\s))@([a-z0-9_]+)(?:(\s)|$)/g,function($0,$1,$2,$3){replyList.push($2);return($1||"")+($3||"");});if(text===replacedText)break;text=replacedText;}// HTML特殊文字をデコードする
text=h.unescape(text);return{text,symbols:{reply:replyList,channel:channelList,others:othersList}};})();}}function tagReplacerCallback($0,$1,$2){const targetList=this.targetList;const subjectList=this.subjectList;if($2){// エイリアスの指定があればそれを利用する
targetList.push($2);}else{// 指定がなければリストの中から特定する
const subject=subjectList.find(obj=>obj.id===$1);if(subject){targetList.push(subject.name);}}// テキスト中からは除外しておく
return"";}exports.default=GetMessageFormatter;module.exports=exports['default'];