# masami-bot

## 内容
- 3つの質問に答えると、スコアに応じて結果を返すLINEBOTです
## LINE 側の設定
- LINE Developersでアカウント登録をする
- LINEアカウントさえあれば管理者としてログインできます
- Messaging API チャンネルを作成してください
- Messaging APIの設定からアクセストークンを発行してください
## Google Apps Script 側の設定
- googleアカウントがない人はまずアカウント登録をしてください
- Google App Scriptをインストールしてください
- 新しいプロジェクトを作成し、script/main.jsをコピペしてください
- 「公開」>「ウェブアプリケーションとして導入」からAPIを公開してください
	- アプリの実行者は「自分」を選択してください
	- アプリのアクセスは「誰でも（匿名含む）」を選択してください
	- 内容を変更して公開する場合は、バージョンを新しくして公開してください
- 公開したURLを、LINE Developersで作成したチャンネルのMessaging APIのWebhookのURLに設定してください
- LINE_ACCESS_TOKENとLINE_ENDPOINTについて
  - 「ファイル」>「プロジェクトのプロパティ」>「スクリプトのプロパティ」から追加してください
  - LINE_ENDPOINTは、https://api.line.me/v2/bot/message/reply でOK
  - LINE_ACCESS_TOKENは、LINE Developersからtokenを発行してください
 