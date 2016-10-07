import {RTM_EVENTS}   from "@slack/client"
import randomFilter   from "Action/randomFilter"
import autoJoin       from "Action/autoJoin"
import addReaction    from "Action/addReaction"
import callAllMembers from "Action/callAllMembers"
import randomMessage  from "Action/randomMessage"
import randomReply    from "Action/randomReply"

const username = "akeno_m";

export default {
	username,
	asUser: true,
	actorList: [
		// 起動時もしくはチャンネル作成時に参加していない全てのチャンネルに参加を試みる
		autoJoin(RTM_EVENTS.HELLO),
		autoJoin(RTM_EVENTS.CHANNEL_CREATED),
		// エゴサしてリアクションを付与する(30%の確率)
		randomFilter(
			0.3,
			addReaction(
				[
					"akeno",
				],
				/(?:みけ|ミケ|ﾐｹ|あけの|明乃)(?:ちゃん|さん)/,
				false,
			),
		),
		// そのチャンネルに所属しないメンバーを全員呼んでくる
		callAllMembers(
			username,
			[
				"みんなを呼んできたよ♪",
			],
			/(?:(?:皆|みんな)|(?:全員|ぜんいん)).*(?:[呼よ](?:ぶ|べ|ぼう|んで)|(?:集合|しゅ[うー]ご[うー]))/,
			false,
		),
		// リプライにはランダムな応答を行う
		randomReply(
			username,
			[
				"えへへっ",
				"よーそろー！",
				"わたし、岬明乃！",
				"ちゃんと艦長出来てるかなぁ…？",
			],
		),
		// 空中リプが飛んできたら反応する
		randomMessage(
			[
				"よーそろー！",
			],
			/よーそろー/,
		),
		// 空中リプが飛んできたら反応する
		randomMessage(
			[
				"[[replyToName]]さん、呼びました？",
				"岬明乃、いますよ～",
			],
			/(?:みけ|ミケ|ﾐｹ|あけの|明乃)(?:ちゃん|さん).*(?:[い居](?:る|ま(?:す|せんか))|お(?:る|ります|らんか))/,
		),
	],
}
