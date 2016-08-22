"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _camelize=require("camelize");var _camelize2=_interopRequireDefault(_camelize);var _HtmlSpecialChars=require("./HtmlSpecialChars.js");var _HtmlSpecialChars2=_interopRequireDefault(_HtmlSpecialChars);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}// HTMLエスケープ用のライブラリを初期化する
const h=new _HtmlSpecialChars2.default({'&':'&amp;','<':'&lt;','>':'&gt;'});class GetMessageFormatter{static format(message,dataStore){// オブジェクトの整形を行う
message=formatObject(message,dataStore);// テキストの整形を行う
var _formatText=formatText(message,dataStore);const text=_formatText.text;const entities=_formatText.entities;// テキストを置換する
// 投稿結果オブジェクトを返す
var _ref=[message.text,text];message.rawText=_ref[0];message.text=_ref[1];return{message,entities};}}function formatObject(message,dataStore){// スネークケースをキャメルケースに変換する
message=(0,_camelize2.default)(message);return message;}function formatText(message,dataStore){// 出力の一部となるリプライやチャンネルといった情報を溜めておく配列を定義
const replyList=[];const channelList=[];const othersList=[];if(!message.text)return{text:"",entities:{reply:replyList,channel:channelList,others:othersList}};let text=message.text// チャンネルの抽出(登録されているユーザー名)
.replace(/(?:<#([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g,tagReplacerCallback.bind({targetList:channelList,finder:id=>dataStore.getChannelById(id)}))// ユーザ名の抽出1(登録されているユーザー名)
.replace(/(?:<@([A-Z0-9]+)(\|[a-z0-9_]+)?>)/g,tagReplacerCallback.bind({targetList:replyList,finder:id=>dataStore.getUserById(id)}))// その他よくわからないものは良くわからないリストに突っ込んでおく
.replace(/<([^<>]+)?>/g,($0,$1)=>{othersList.push($1);return"";});// ユーザ名の抽出2(架空のユーザー名)
while(true){const replacedText=text.replace(/(?:^|(\s))@([a-z0-9_]+)(?:(\s)|$)/g,($0,$1,$2,$3)=>{replyList.push(dataStore.getUserByName($2));return($1||"")+($3||"");});if(text===replacedText)break;text=replacedText;}// HTML特殊文字をデコードする
text=h.unescape(text);return{text,entities:{reply:replyList,channel:channelList,others:othersList}};}function tagReplacerCallback($0,$1,$2){const targetList=this.targetList;const finder=this.finder;// IDからオブジェクトを特定する
const info=finder($1);if(info){targetList.push(info);}// テキスト中からは除外しておく
return"";}exports.default=GetMessageFormatter;module.exports=exports["default"];