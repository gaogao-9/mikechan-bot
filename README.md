# mikechan-bot
私、岬明乃！ブルーマーメイドを目指して海洋学校に入学したけど初の実習で教官の船から攻撃を受けてしまったの。艦長として晴風とみんなを守りたい！ハイスクール・フリート第一巻、6月22日発売！

# usage
srcディレクトリ直下に「setting.js」を用意して、以下のように記述する。

```js
process.env.SLACK_OWNER_TOKEN = "xoxp-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXX";
process.env.SLACK_BOT_TOKEN_(bot名を大文字表記したもの) = "xoxb-XXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX";
```

例えば、bot名が(@akeno_m)だったら、`SLACK_BOT_TOKEN_AKENO_M`になります。

もしくは、実行時パラメータに直接指定する。どっちでも良いのでトークンを与えればおｋ。

次に、以下のコマンドをぶち込む。win向けしか用意してないので他のOS向けは適宜PRが欲しい。

```bash
npm run update:win
gulp release
```

distディレクトリが出来たら成功。実行時には

```bash
npm start
```

でおk。

