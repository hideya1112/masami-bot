// property取得
var prop = PropertiesService.getScriptProperties().getProperties();
var LINE_ACCESS_TOKEN = prop.LINE_ACCESS_TOKEN;
var LINE_ENDPOINT = prop.LINE_ENDPOINT;

// まさみ画像
var masamiImages = {
  'sad': 'https://blog-imgs-24.fc2.com/n/o/h/nohtani45/e_20.jpg',
  'sad2': 'https://i.ytimg.com/vi/TFAI-YJbmjo/maxresdefault.jpg',
  'sad3': 'https://livedoor.blogimg.jp/rbkyn844/imgs/5/b/5b161c3e.jpg',
  'normal': 'https://imgc.eximg.jp/i=https%253A%252F%252Fs.eximg.jp%252Fexnews%252Ffeed%252FAsajo%252FAsajo_83133_afa6_1.jpg,zoom=600,quality=70,type=jpg',
  'happy': 'https://entametrix.com/wp-content/uploads/2017/09/nagasawa.jpg',
  'happy2': 'https://image.news.livedoor.com/newsimage/6/3/63ad93525842fb2e9319ac817079232c.jpg',
  'happy3': 'https://i.pinimg.com/564x/ed/2a/b4/ed2ab44c9adc16e44c080439f0e891a7.jpg',
  'ishappy': 'https://i.pinimg.com/564x/81/5f/35/815f35813ad738d136f15b9413c8d27e.jpg',
  'work': 'https://i.pinimg.com/originals/74/8c/cc/748ccc152616ec660fca6ce377b079ae.jpg',
  'sleep': 'https://pbs.twimg.com/media/ExzKyezU8AUm47H?format=jpg&name=large',
}

var masamiMaster = [
  //1
  {
    "text": "アカン",
    "image": masamiImages.sad,
    "score": 15
  },
  //2
  {
    "text": "まあまあやばいね",
    "image": masamiImages.sad2,
    "score": 25
  },
  //3
  {
    "text": "ちょっと疲れてるね",
    "image": masamiImages.sad3,
    "score": 45
  },
  //4
  {
    "text": "ふつうやね",
    "image": masamiImages.normal,
    "score": 60
  },
  //5
  {
    "text": "いい感じやね",
    "image": masamiImages.happy,
    "score": 75
  },
  //6
  {
    "text": "めっちゃいい感じやね",
    "image": masamiImages.happy2,
    "score": 90
  },
  //7
  {
    "text": "最高に楽しんでるね",
    "image": masamiImages.happy3,
    "score": 100
  },
]



// webhookを受ける
function doPost(e) {
  var json = JSON.parse(e.postData.contents);

  // トークン取得
  var reply_token = json.events[0].replyToken;
  if (typeof reply_token === 'undefined') {
    return;
  }

  // ロジック
  var responseMessage = ''
  var text = ''

  if (json.events[0].type == 'postback') {
    var requestPostbackData = JSON.parse(json.events[0].postback.data);

    // 結果
    if ("isHappy" in requestPostbackData) {

      var isSleep = requestPostbackData.isSleep
      var isGoodFriends = requestPostbackData.isGoodFriends
      var isHappy = requestPostbackData.isHappy

      var score = isSleep + isGoodFriends + isHappy;
      var data = masamiMaster[score - 3];

      var text = "あなたの健康状態は" + data.score + "点！"

      responseMessage = getMessageTemplate(text, data.text, data.image);

      // 3問目
    } else if ("isGoodFriends" in requestPostbackData) {
      var postbackData = {
        "ans1": JSON.stringify(Object.assign(requestPostbackData, { "isHappy": 3 })),
        "ans2": JSON.stringify(Object.assign(requestPostbackData, { "isHappy": 2 })),
        "ans3": JSON.stringify(Object.assign(requestPostbackData, { "isHappy": 1 })),
      };
      text = '仕事充実してる？'
      responseMessage = getButtonTemplate(postbackData, text, masamiImages.ishappy);

      // 2問目
    } else {
      var postbackData = {
        "ans1": JSON.stringify(Object.assign(requestPostbackData, { "isGoodFriends": 3 })),
        "ans2": JSON.stringify(Object.assign(requestPostbackData, { "isGoodFriends": 2 })),
        "ans3": JSON.stringify(Object.assign(requestPostbackData, { "isGoodFriends": 1 })),
      };
      text = '会社の同僚とはいい感じ？'
      responseMessage = getButtonTemplate(postbackData, text, masamiImages.work);
    }
  } else {
    // 1問目
    var postbackData = {
      "ans1": '{"isSleep":3}',
      "ans2": '{"isSleep":2}',
      "ans3": '{"isSleep":1}',
    };
    text = 'よく眠れている？'
    responseMessage = getButtonTemplate(postbackData, text, masamiImages.sleep);
  }

  // LINEのエンドポイントに投げる
  UrlFetchApp.fetch(LINE_ENDPOINT, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + LINE_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': reply_token,
      'messages': [responseMessage]
    }),
  });
  //response返す
  return ContentService.createTextOutput(JSON.stringify({ 'content': 'post ok' })).setMimeType(ContentService.MimeType.JSON);
}

//jsonをマージして、文字列にする
function mergeJsonAndStringify(json1, json2) {
  return JSON.stringify(Object.assign(json1, json2));
}

//確認テンプレートを返す
function getConfirmTemplate() {
  var actions = [
    { 'type': 'message', 'label': 'yes', 'text': 'isGoodSleepYes' },
    { 'type': 'message', 'label': 'no', 'text': 'isGoodSleepNo' }
  ];
  var template = {
    'type': 'confirm',
    'text': 'よくねれていますか？',
    'actions': actions
  };
  var message = {
    'type': 'template',
    'altText': 'text',
    'template': template
  };
  return message;
}

//ボタンテンプレートを返す
function getButtonTemplate(postbackData, text, thumbnailImageUrl) {

  var actions = [
    { 'type': 'postback', 'label': 'うん', 'data': postbackData.ans1 },
    { 'type': 'postback', 'label': 'どっちでも', 'data': postbackData.ans2 },
    { 'type': 'postback', 'label': 'のん', 'data': postbackData.ans3 },
  ];
  var template = {
    'type': 'buttons',
    'thumbnailImageUrl': thumbnailImageUrl,
    'text': text,
    'actions': actions
  }
  var message = {
    'type': 'template',
    'altText': 'まさみチャットボット',
    'template': template
  }
  return message;
}

//テンプレートメッセージを返す
function getMessageTemplate(title, text, thumbnailImageUrl) {

  var actions = [
    { 'type': 'message', 'label': 'もう一回やる', 'text': 'もう一回やる' }
  ];

  var template = {
    'title': title,
    'type': 'buttons',
    'thumbnailImageUrl': thumbnailImageUrl,
    'text': text,
    'actions': actions
  }

  var message = {
    'type': 'template',
    'altText': 'まさみチャットボット',
    'template': template
  }
  return message;

}


//音声を返す 1分未満で10MB以下
function getAudio() {
  var messages = {
    'type': 'audio',
    'originalContentUrl': '音源Url',
    'duration': '音声ファイルの長さ（ミリ秒）'
  };
  return messages;
}

//テキストを返す
function getMessage(text) {
  var messages = {
    'type': 'text',
    'text': text,
  };
  return messages;
}

//動画を返す
function getVideo() {
  messages = {
    'type': 'video',
    'originalContentUrl': 'videoUrl',
    'previewImageUrl': 'previewImageUrl'
  };
  return messages;
}

//画像を返す
function getImage(imageUrl) {
  var messages = {
    'type': 'image',
    'originalContentUrl': imageUrl,
    'previewImageUrl': imageUrl
  };
  return messages;
}

//ランダム画像を返す
function getRandomImage() {
  var url = GOOGLE_CUSTOM_SEARCH_ENGINE_ENDPOINT + "?key=" + GOOGLE_CUSTOM_SEARCH_API_KEY + "&cx=" + GOOGLE_CUSTOM_SEARCH_ENGINE_ID + "&searchType=image" + "&q=" + "長澤まさみ";
  var response = UrlFetchApp.fetch(url);
  var data = response.getContentText("UTF-8");
  var jsonData = JSON.parse(data);
  var items = jsonData.items;
  var random = Math.floor(Math.random() * items.length);
  var image = items[random].link;

  var messages = {
    'type': 'image',
    'originalContentUrl': image,
    'previewImageUrl': image,
  };
  return messages;
}
