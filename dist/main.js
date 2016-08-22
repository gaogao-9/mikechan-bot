"use strict";var _client=require("@slack/client");var _GetMessageFormatter=require("Util/GetMessageFormatter");var _GetMessageFormatter2=_interopRequireDefault(_GetMessageFormatter);var _PostMessageFormatter=require("Util/PostMessageFormatter");var _PostMessageFormatter2=_interopRequireDefault(_PostMessageFormatter);var _sleep=require("Util/sleep");var _sleep2=_interopRequireDefault(_sleep);var _index=require("./actor/index");var _index2=_interopRequireDefault(_index);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value;}catch(error){reject(error);return;}if(info.done){resolve(value);}else{return Promise.resolve(value).then(function(value){return step("next",value);},function(err){return step("throw",err);});}}return step("next");});};}const RTM_CLIENT_EVENTS=_client.CLIENT_EVENTS.RTM;_asyncToGenerator(function*(){const createOption=function(opt){return Object.assign({dataStore:new _client.MemoryDataStore()},opt);};const ownerClient=new _client.WebClient(process.env.SLACK_OWNER_TOKEN,createOption({logLevel:"error"}));for(const bot of _index2.default){createRTM(process.env[`SLACK_BOT_TOKEN_${bot.username.toUpperCase()}`],createOption(process.env.NODE_ENV!=="production"?{logLevel:"debug"}:{logLevel:"error"}),bot,ownerClient).start();}})().catch(err=>{console.error("†Unhandled Error†");console.error(err&&err.stack||err);});function createRTM(token){let option=arguments.length<=1||arguments[1]===undefined?{dataStore:new _client.MemoryDataStore()}:arguments[1];let bot=arguments[2];let ownerClient=arguments[3];const rtm=new _client.RtmClient(token,option);rtm.on(RTM_CLIENT_EVENTS.AUTHENTICATED,rtmStartData=>{console.log(`${rtmStartData.self.name} の認証に成功しました`);});if(bot){rtm.on(RTM_CLIENT_EVENTS.RAW_MESSAGE,(()=>{var _ref2=_asyncToGenerator(function*(message){try{// メッセージをJSONオブジェクトに変換
message=JSON.parse(message);const recievedMessageInfo=_GetMessageFormatter2.default.format(message,rtm.dataStore);let alreadyCalled=false;for(const actor of bot.actorList){try{if(!actor.filter(recievedMessageInfo.message,recievedMessageInfo.entities,alreadyCalled))continue;const responseMessage=yield actor.action.call(rtm,recievedMessageInfo.message,recievedMessageInfo.entities,ownerClient,rtm);if(!responseMessage)continue;alreadyCalled=true;if(typeof responseMessage!=="object")continue;const sendingMessage=_PostMessageFormatter2.default.format(responseMessage);sendingMessage.username=sendingMessage.username||bot.username;sendingMessage.icon_url=sendingMessage.icon_url||bot.iconUrl;sendingMessage.as_user=sendingMessage.as_user||bot.asUser;yield new Promise(function(resolve,reject){rtm.send(Object.assign({type:_client.RTM_EVENTS.MESSAGE},sendingMessage),function(err,msg){if(err)reject(err);resolve(msg);});});}catch(err){console.log("actorの呼び出し途中にエラーが発生しました");console.error(err&&err.stack||err);}}}catch(err){console.log("messageの呼び出し途中にエラーが発生しました");console.error(err&&err.stack||err);}});return function(_x2){return _ref2.apply(this,arguments);};})());}rtm.on(RTM_CLIENT_EVENTS.DISCONNECT,()=>{console.log("通信が途絶しました");}).on(RTM_CLIENT_EVENTS.WS_ERROR,err=>{console.log("websocketで何らかのエラーが発生しました");console.error(err&&err.stack||err);}).on(RTM_CLIENT_EVENTS.WS_CLOSE,()=>{console.log("websocketが閉じられました(3秒後に再接続します)");(0,_sleep2.default)(3000).then(()=>createRTM(token,actorList).start());});return rtm;}