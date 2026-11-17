(function() {
  "use strict";

  const DATA = window.ARCHIVE_DATA || [];

  // Vercel Web Analytics with Automatic Permanent Owner Exclusion
  const VERCEL_ANALYTICS_EXCLUDE_KEY = "calpis_va_exclude_owner";

  function isOwnerExcludedFromAnalytics() {
    try {
      return localStorage.getItem(VERCEL_ANALYTICS_EXCLUDE_KEY) === "1";
    } catch (_e) {
      return false;
    }
  }

  function permanentlyExcludeOwnerFromAnalytics() {
    try {
      localStorage.setItem(VERCEL_ANALYTICS_EXCLUDE_KEY, "1");
    } catch (_e) {}
    try {
      window.__CALPIS_VA_EXCLUDED = true;
      if (typeof window.va === "function") {
        try {
          window.va("beforeSend", function() { return null; });
        } catch (_e2) {}
      }
      if (Array.isArray(window.vaq)) {
        window.vaq.length = 0;
        window.vaq.push(["beforeSend", function() { return null; }]);
      }
      window.va = function() { return null; };
      document.querySelectorAll('script[src*="/_vercel/insights/script.js"], script[data-calpis-va]').forEach(function(s) {
        if (s && s.parentNode) s.parentNode.removeChild(s);
      });
    } catch (_e) {}
  }

  function initVercelWebAnalytics() {
    try {
      if (isOwnerExcludedFromAnalytics() || window.__CALPIS_VA_EXCLUDED) {
        window.__CALPIS_VA_EXCLUDED = true;
        window.va = function() { return null; };
        return;
      }
      if (
        document.querySelector('script[src*="/_vercel/insights/script.js"]') ||
        document.querySelector('script[data-calpis-va="1"]') ||
        window.__CALPIS_VA_LOADED
      ) {
        return;
      }
      window.__CALPIS_VA_LOADED = true;
      window.va = window.va || function() {
        if (window.__CALPIS_VA_EXCLUDED || isOwnerExcludedFromAnalytics()) return null;
        (window.vaq = window.vaq || []).push(arguments);
      };
      window.va("beforeSend", function(event) {
        if (window.__CALPIS_VA_EXCLUDED || isOwnerExcludedFromAnalytics()) {
          return null;
        }
        return event;
      });
      const vaScript = document.createElement("script");
      vaScript.defer = true;
      vaScript.async = true;
      vaScript.src = "/_vercel/insights/script.js";
      vaScript.setAttribute("data-calpis-va", "1");
      vaScript.onerror = function() {};
      (document.head || document.documentElement).appendChild(vaScript);
    } catch (_e) {}
  }

  initVercelWebAnalytics();


  const SONG_RENAME_MAP = {"Emily To Juugono Yakusoku": "エミリーと15の約束", "Nouriueno Cracker": "脳裏上のクラッカー", "Haru Koizakura": "春、恋桜。", "わたしね": "わたしね、、", "kick 【歌ってみた】Alfakyun. - kick (Cover) [試唱]": "kick [試唱]", "Hanabami": "花喰み", "こゆび姫♡": "♡こゆび姫♡", "No one": "ダレモ", "刹那の誓い": "刹那の誓い (feat. 由崎司)", "Transparent Compass": "コンパスは透明", "空は高く風は歌う - Piano & Strings": "空は高く風は歌う", "空は高く風は歌う - Piano $ Strings": "空は高く風は歌う", "かけぬけ★青春スパーキング！": "Love♡Vacation", "Pattern of two hearts": "二人模様", "Rokudougokan sanpo": "六道伍感さんぽ", "What if": "碧いif", "Answer to Extreme": "極私的極彩色アンサー", "melt into the dark": "闇に溶けてく", "Nameless Name": "名もなき何もかも", "Against All Answers": "もう何もいらない未来", "Roses in Thorns": "荊の薔薇", "Meant to be": "蝶に結いた赤い糸", "Belle papillon": "飛べない蝶は夢を見る", "Fragile Violet": "薄采ディスプレイ", "Mirage of the mind": "蜃気楼ニ問フ", "Give Me Life": "命をくれよ", "I’ｍ here": "運命の華", "I'm here": "運命の華", "I’m here": "運命の華", "ツギハギスタッカートを": "ツギハギスタッカート", "Himawari": "向日葵", "Blue": "夜に藍", "OVER / Just Be Friends-piano.ver-": "OVER", "エテルネル-Acoustic Piano Version-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌)": "エテルネル", "エテルネル-Acoustic Piano Version-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌）": "エテルネル", "エテルネル-Lyric Video-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌）": "エテルネル", "エテルネル-Lyric Video-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌)": "エテルネル", "エテルネル-Acoustic Piano Version-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌) / エテルネル-Lyric Video-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌）": "エテルネル"};
  const DELETED_NON_SONG_SET = new Set(["アニメ「ガールズバンドクライ」"]);
  const SONG_SEARCH_ALIASES_BY_NEW_TITLE = {"エミリーと15の約束": ["Emily To Juugono Yakusoku", "emilytojuugonoyakusoku", "えみりーと15のやくそく", "えみりーとじゅうごのやくそく"], "脳裏上のクラッカー": ["Nouriueno Cracker", "nouriuenocracker", "のうりじょうのくらっかー", "のうりうえのくらっかー"], "春、恋桜。": ["Haru Koizakura", "harukoizakura", "はるこいざくら", "はる、こいざくら。"], "わたしね、、": ["わたしね", "watashine"], "kick [試唱]": ["kick 【歌ってみた】Alfakyun. - kick (Cover) [試唱]", "Alfakyun. - kick (Cover)", "kick (Cover)"], "花喰み": ["Hanabami", "hanabami", "はなばみ", "ハナバミ"], "♡こゆび姫♡": ["こゆび姫♡", "こゆび姫", "koyubihime", "こゆびひめ", "コユビヒメ"], "ダレモ": ["No one", "no one", "noone", "だれも", "誰モ"], "刹那の誓い (feat. 由崎司)": ["刹那の誓い", "せつなのちかい", "setsunanochikai", "由崎司"], "コンパスは透明": ["Transparent Compass", "transparent compass", "transparentcompass", "こんぱすはとうめい"], "空は高く風は歌う": ["空は高く風は歌う - Piano & Strings", "空は高く風は歌う - Piano $ Strings", "sorawatakakukazewautau", "そらはたかくかぜはうたう"], "Love♡Vacation": ["かけぬけ★青春スパーキング！", "かけぬけ青春スパーキング", "kakenukeseishunsparking", "Love Vacation", "lovevacation", "らぶばけーしょん", "ラブバケーション"], "二人模様": ["Pattern of two hearts", "patternoftwohearts", "pattern of two hearts", "ふたりもよう", "フタリモヨウ"], "六道伍感さんぽ": ["Rokudougokan sanpo", "rokudougokansanpo", "rokudougokan sanpo", "ろくどうごかんさんぽ"], "碧いif": ["What if", "what if", "whatif", "あおいif", "アオイif"], "極私的極彩色アンサー": ["Answer to Extreme", "answer to extreme", "answertoextreme", "ごくしてきごくさいしょくあんさー"], "闇に溶けてく": ["melt into the dark", "meltintothedark", "やみに溶けてく", "やみにとけてく"], "名もなき何もかも": ["Nameless Name", "nameless name", "namelessname", "なもなきなにもかも"], "もう何もいらない未来": ["Against All Answers", "against all answers", "againstallanswers", "もうなにもいらないみらい"], "荊の薔薇": ["Roses in Thorns", "roses in thorns", "rosesinthorns", "いばらのばら", "イバラノバラ"], "蝶に結いた赤い糸": ["Meant to be", "meant to be", "meanttobe", "ちょうにゆいたあかいと"], "飛べない蝶は夢を見る": ["Belle papillon", "belle papillon", "bellepapillon", "とべないちょうはゆめをみる"], "薄采ディスプレイ": ["Fragile Violet", "fragile violet", "fragileviolet", "うすさいでぃすぷれい", "はくさいでぃすぷれい"], "蜃気楼ニ問フ": ["Mirage of the mind", "mirage of the mind", "mirageofthemind", "しんきろうにとう"], "命をくれよ": ["Give Me Life", "give me life", "givemelife", "いのちをくれよ"], "運命の華": ["I’ｍ here", "I'm here", "I’m here", "im here", "imhere", "うんめいのはな"], "ツギハギスタッカート": ["ツギハギスタッカートを", "つぎはぎすたっかーと", "つぎはぎすたっかーとを", "tsugihagistaccato"], "向日葵": ["Himawari", "himawari", "ひまわり", "ヒマワリ"], "夜に藍": ["Blue", "blue", "よるにあい", "ヨルニアイ"], "エテルネル": ["エテルネル-Acoustic Piano Version-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌)", "エテルネル-Lyric Video-（TVアニメ『きみが死ぬまで恋をしたい』ED 主題歌）", "えてるねる", "eteruneru"]};
  const CURATED_V56_ARTISTS = [{"aid": "a_f14dff12", "name": "鈴木愛理", "cat": 2, "count": 1, "reading": "すずきあいり", "kana": "す", "row": "さ", "alpha": "", "img": "https://yt3.googleusercontent.com/yCgi8G0wytpJvWlC9hOtxrGxuafnWRwL0lJs_ocp4kUHB-MBnqidC_bKSPcIc6kARjld6plFqA=s240-c-k-c0x00ffffff-no-rj", "songs": ["空は二度燃える"], "topSongs": ["空は二度燃える", "初恋サイダー", "最強の推し！", "恋におちたら feat. 空音 & Taku Takahashi", "Distance"], "topLinks": ["pKuhQACie_k", "rhfZq9b9h6I", "", "xU07Dte4JhE", ""], "topTypes": ["オリジナル", "オリジナル", "オリジナル", "オリジナル", "オリジナル"], "role": "歌手", "roles": ["歌手"], "groupSubRole": "", "sub": 444000, "subBucket": "100kTo1m", "subDate": "2026-11-01", "al": ["Airi Suzuki", "Suzuki Airi", "suzukiairi", "スズキアイリ", "Buono!", "℃-ute", "UCRkCifCbAw0qwu7XzOa9d7w"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "圧倒的な歌唱力と表現力で知られるソロヴォーカリスト。℃-uteやBuono!での活動を経て2018年にソロデビューし、アニメ主題歌や『空は二度燃える』など幅広い楽曲で輝きを放っている。", "ytChannelUrl": "https://www.youtube.com/channel/UCRkCifCbAw0qwu7XzOa9d7w", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_453a93b8", "name": "平葵", "cat": 2, "count": 1, "reading": "たいらあおい", "kana": "た", "row": "た", "alpha": "", "img": "https://yt3.googleusercontent.com/tHF4W2ea5vj9y-r4copsa5jbbo6QHzdONdb-K4kcHyky2V2YSc997u8PXmhjnOewdZhjWjO6=s240-c-k-c0x00ffffff-no-rj", "songs": ["案山子"], "topSongs": ["案山子", "canfull", "×", "progress", "燐光って"], "topLinks": ["cAlhOMda-Xs", "", "t8LT72qrRjo", "sPqQHgqk_Uk", "si5-RddQoxg"], "topTypes": ["オリジナル", "オリジナル", "オリジナル", "オリジナル", "オリジナル"], "role": "歌手", "roles": ["歌手"], "groupSubRole": "", "sub": null, "subBucket": "unknown", "subDate": "2026-11-01", "al": ["Aoi Taira", "Taira Aoi", "tairaaoi", "タイラアオイ", "UC0JetkYdglzF70e8GffPhMg"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "透明感と芯の強さを併せ持つ歌声で注目を集めるシンガー。『案山子』や『canfull』など、繊細な感情の揺れを描く楽曲を独自の表現力で歌い上げている。", "ytChannelUrl": "https://www.youtube.com/channel/UC0JetkYdglzF70e8GffPhMg", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_3408025f", "name": "わん子 (綰子 /Wanko)", "cat": 1, "count": 2, "reading": "わんこ", "kana": "わ", "row": "わ", "alpha": "", "img": "https://yt3.googleusercontent.com/seAUw4pKG3PB4Wsg5sslqFqFdD24vqvJk57jZMo8hdnRrwbebPdc9JnFX1MulRhgD-NS3tdH=s240-c-k-c0x00ffffff-no-rj", "songs": ["みにまむ", "もでらーと"], "topSongs": ["みにまむ", "もでらーと"], "topLinks": ["S2AhFrGXa8I", "wKusc39aDLA"], "topTypes": ["オリジナル", "オリジナル"], "role": "歌い手", "roles": ["歌い手"], "groupSubRole": "", "sub": null, "subBucket": "unknown", "subDate": "2026-11-01", "al": ["わん子", "綰子", "綰子 /Wanko", "綰子/wanko", "Wanko", "wanko", "わんこ", "ワンコ", "UClDId0k74ZpDwRXJzrb-jIQ"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "", "ytChannelUrl": "https://www.youtube.com/channel/UClDId0k74ZpDwRXJzrb-jIQ", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_aba2a431", "name": "TORi (torry)", "cat": 1, "count": 1, "reading": "とり", "kana": "と", "row": "た", "alpha": "T", "img": "https://yt3.googleusercontent.com/gc-pVzesz1KF8zE5IAN_lfhlr0HLD-a_Im-KpEyeTkntdUZDi47s5JHRvCEWpfnDCnTILMbJCMU=s240-c-k-c0x00ffffff-no-rj", "songs": ["菜の花のように"], "topSongs": ["菜の花のように", "だきしめること。"], "topLinks": ["SIW7cNyQPak", "5RSzx4zMF2U"], "topTypes": ["オリジナル", "オリジナル"], "role": "歌い手", "roles": ["歌い手"], "groupSubRole": "", "sub": 10600, "subBucket": "10kTo100k", "subDate": "2026-11-01", "al": ["TORi", "torry", "tori", "とり", "トリ", "鳥", "UCHeUUDWr8oXbdublNQtJbNQ"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "", "ytChannelUrl": "https://www.youtube.com/channel/UCHeUUDWr8oXbdublNQtJbNQ", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_62c07790", "name": "瀧川ありさ", "cat": 2, "count": 1, "reading": "たきがわありさ", "kana": "た", "row": "た", "alpha": "", "img": "https://yt3.googleusercontent.com/ytc/AIdro_kjdHAsXZLiPrVm666_V9VT5_azux5GVlz4O71207G0OQ=s240-c-k-c0x00ffffff-no-rj", "songs": ["さよならのゆくえ"], "topSongs": ["さよならのゆくえ", "Season", "色褪せない瞳", "わがまま", "夏の花"], "topLinks": ["pe8_2tiHwfQ", "8a1PBi2ROD0", "TBmevKostw4", "GBMuovsHDi8", ""], "topTypes": ["オリジナル", "オリジナル", "オリジナル", "オリジナル", "オリジナル"], "role": "歌手", "roles": ["歌手"], "groupSubRole": "", "sub": 35800, "subBucket": "10kTo100k", "subDate": "2026-11-01", "al": ["Alisa Takigawa", "Takigawa Alisa", "takigawaarisa", "タキガワアリサ", "UCfeGaWl3hge2_4BXrXSqEyw"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "伸びやかで情感豊かな歌声を持つシンガーソングライター。TVアニメ『七つの大罪』EDテーマ『Season』でメジャーデビューし、『終物語』EDテーマ『さよならのゆくえ』など数々のアニメ主題歌を手掛けている。", "ytChannelUrl": "https://www.youtube.com/channel/UCfeGaWl3hge2_4BXrXSqEyw", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_407a13ad", "name": "rei sirose", "cat": 1, "count": 1, "reading": "れいしろせ", "kana": "れ", "row": "ら", "alpha": "R", "img": "https://i.ytimg.com/vi/j1ArobXFdyQ/hqdefault.jpg", "songs": ["贖罪"], "topSongs": ["贖罪"], "topLinks": ["j1ArobXFdyQ"], "topTypes": ["cover"], "role": "歌い手", "roles": ["歌い手"], "groupSubRole": "", "sub": null, "subBucket": "unknown", "subDate": "2026-11-01", "al": ["reisirose", "白瀬怜", "れいしろせ", "レイシロセ", "UCyqaJxeEZLd7AfebCpxu06g"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "", "ytChannelUrl": "https://www.youtube.com/channel/UCyqaJxeEZLd7AfebCpxu06g", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_003d0cad", "name": "花降る日々", "cat": 2, "count": 1, "reading": "はなふるひび", "kana": "は", "row": "は", "alpha": "", "img": "https://i.ytimg.com/vi/c0TtCowqHC0/hqdefault.jpg", "songs": ["ひとりじゃないじゃん"], "topSongs": ["ひとりじゃないじゃん", "muguet", "花降る日々", "紫陽花、まばたき、梅雨の日。"], "topLinks": ["", "c0TtCowqHC0", "jm1ZozgaGQw", "ET92gzWWYbU"], "topTypes": ["オリジナル", "オリジナル", "オリジナル", "オリジナル"], "role": "音楽グループ(その他)", "roles": ["音楽グループ(その他)"], "groupSubRole": "音楽グループ(その他)", "sub": null, "subBucket": "unknown", "subDate": "2026-11-01", "al": ["、花降る日々", "花降る日々、", "hanafuruhibi", "hanahuruhibi", "ハナフルヒビ", "鎖那・000・めありー", "UCVd0lHzInoR_wocMXR74fTA"], "agency": "", "agencyGroup": "", "vocal": "鎖那・000・めありー", "vocalParts": [{"text": "鎖那", "target": "鎖那"}, {"text": "・000・", "target": null}, {"text": "めありー", "target": "めありー"}], "memberOf": [], "profileBio": "鎖那・000・めありーの3人による音楽ユニット。繊細で透明感のあるボーカルアンサンブルとアコースティックな温かみのあるサウンドで、『ひとりじゃないじゃん』や『muguet』などの楽曲を発表している。", "ytChannelUrl": "https://www.youtube.com/channel/UCVd0lHzInoR_wocMXR74fTA", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_10842e73", "name": "miri (璃Miri)", "cat": 1, "count": 1, "reading": "みり", "kana": "み", "row": "ま", "alpha": "M", "img": "https://yt3.googleusercontent.com/erJlmpAFYLgcsBlRl4nSKFV3B0lD1sk6ZlXp6JEWe_n9fWynvli9aAhiL-oFqIfXFkdcba7S3Q=s240-c-k-c0x00ffffff-no-rj", "songs": ["レイラ"], "topSongs": ["レイラ"], "topLinks": ["gqWAui-okAM"], "topTypes": ["オリジナル"], "role": "Vtuber", "roles": ["Vtuber"], "groupSubRole": "", "sub": 34700, "subBucket": "10kTo100k", "subDate": "2026-11-01", "al": ["miri", "璃Miri", "みり", "ミリ", "UCHCnxECJBxKrMByroUWSgcw"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "", "ytChannelUrl": "https://www.youtube.com/channel/UCHCnxECJBxKrMByroUWSgcw", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}];
  const CURATED_V57_ARTISTS = [{"aid": "a_9c4e21b8", "name": "シャイニーカラーズ", "cat": 2, "count": 1, "reading": "しゃいにーからーず", "kana": "し", "row": "さ", "alpha": "", "img": "https://i.ytimg.com/vi/Bsm9rQc7uew/hqdefault.jpg", "songs": ["シャイノグラフィ (2023 Ver.)"], "topSongs": ["シャイノグラフィ (2023 Ver.)", "Spread the Wings!! (2023 Ver.)", "Ambitious Eve (2023 Ver.)", "いつか Shiny Days (2023 Ver.)", "Resonance⁺ (2023 Ver.)"], "topLinks": ["Bsm9rQc7uew", "caM83-aTCEs", "b3vB7kK-C4s", "p8mG8N7bF0g", "3O2yQ5kY8jM"], "topTypes": ["オリジナル", "オリジナル", "オリジナル", "オリジナル", "オリジナル"], "role": "音楽グループ(アニゲー関連)", "roles": ["音楽グループ(アニゲー関連)"], "groupSubRole": "音楽グループ(アニゲー関連)", "sub": null, "subBucket": "unknown", "subDate": "2026-11-01", "al": ["SHINY COLORS", "THE IDOLM@STER SHINY COLORS", "アイドルマスター シャイニーカラーズ", "シャニマス", "しゃいにーからーず", "shinycolors", "UCHQUx1njDuJQwBQ5uMPrr3Q"], "agency": "アイドルマスター シャイニーカラーズ", "agencyGroup": "アイドルマスターシリーズ", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "『アイドルマスター シャイニーカラーズ』（283プロダクション）の全体曲名義。『シャイノグラフィ (2023 Ver.)』や『Spread the Wings!!』など、ユニットの垣根を越えた煌めくアンサンブル楽曲を届けている。", "ytChannelUrl": "https://www.youtube.com/channel/UCHQUx1njDuJQwBQ5uMPrr3Q", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}, {"aid": "a_d83f19a4", "name": "燈華いのり", "cat": 1, "count": 1, "reading": "とうかいのり", "kana": "と", "row": "た", "alpha": "", "img": "https://yt3.googleusercontent.com/fV50hPywDAYHBN7RZgm5wvRcjAgR7HQeTW0kIDek2fiwaXkyPmfY-nBz0dhQVT_I6X87sN9s8_M=s240-c-k-c0x00ffffff-no-rj", "songs": ["ロマンチックを叶えて"], "topSongs": ["ロマンチックを叶えて"], "topLinks": ["gj2IllaDDGQ"], "topTypes": ["オリジナル"], "role": "Vsinger", "roles": ["Vsinger"], "groupSubRole": "", "sub": 11800, "subBucket": "10kTo100k", "subDate": "2026-11-01", "al": ["Inori Toka", "Toka Inori", "tokainori", "とうかいのり", "トウカイノリ", "祈りの灯火", "UCgRYcQz7-f9tpRLRIEeWBxQ"], "agency": "", "agencyGroup": "", "vocal": "", "vocalParts": [], "memberOf": [], "profileBio": "甘く透明感のある歌声で魅了するVsinger。1stオリジナル曲『ロマンチックを叶えて』をはじめ、心に寄り添う歌ってみた動画や歌枠配信で活動している。", "ytChannelUrl": "https://www.youtube.com/channel/UCgRYcQz7-f9tpRLRIEeWBxQ", "ytChannelLabel": "YouTubeチャンネル →", "ytChannelType": "official"}];

  (function applyRuntimeCuratedDataMigrations() {
    if (!Array.isArray(DATA)) return;

    // 1. Rename songs (v56 + v57) & deduplicate in-order, fix multi-role slash strings, rename LeSCa -> Le☆S☆Ca, and update 夢乃ゆき role -> 歌手
    DATA.forEach(a => {
      if (!a) return;
      if (Array.isArray(a.songs)) {
        const nextSongs = [];
        const seen = new Set();
        a.songs.forEach(s => {
          const sc = String(s || "").trim();
          if (DELETED_NON_SONG_SET.has(sc)) return;
          const mapped = SONG_RENAME_MAP[sc] || sc;
          if (mapped && !DELETED_NON_SONG_SET.has(mapped) && !seen.has(mapped)) {
            seen.add(mapped);
            nextSongs.push(mapped);
          }
        });
        a.songs = nextSongs;
        a.count = nextSongs.length;
      }
      if (Array.isArray(a.topSongs)) {
        a.topSongs = a.topSongs
          .map(s => {
            const sc = String(s || "").trim();
            if (DELETED_NON_SONG_SET.has(sc)) return "";
            return SONG_RENAME_MAP[sc] || sc;
          })
          .filter(s => Boolean(s && !DELETED_NON_SONG_SET.has(s)));
      }
      if (a.name === "くまみゆ" && typeof a.profileBio === "string") {
        a.profileBio = a.profileBio.replace("『わたしね』", "『わたしね、、』");
      }

      // Normalize any slash-combined role like "声優 / 歌い手" into individual roles
      const rawRole = String(a.role || "").trim();
      if (rawRole.includes("/") || rawRole.includes("／")) {
        const parts = rawRole.split(/[/／]/).map(p => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          a.role = parts[0];
          const existingRoles = Array.isArray(a.roles) ? a.roles : [];
          const merged = [];
          [...parts, ...existingRoles].forEach(r => {
            String(r || "").split(/[/／]/).map(x => x.trim()).filter(Boolean).forEach(sr => {
              if (!merged.includes(sr)) merged.push(sr);
            });
          });
          a.roles = merged;
        }
      }

      // LeSCa -> Le☆S☆Ca
      if (a.aid === "a_71dcb3a9" || a.name === "LeSCa" || a.name === "Le☆S☆Ca") {
        a.name = "Le☆S☆Ca";
        if (!Array.isArray(a.al)) a.al = [];
        ["LeSCa", "lesca", "Le☆S☆Ca", "レスカ", "れすか"].forEach(al => {
          if (!a.al.includes(al)) a.al.push(al);
        });
      }
      if (Array.isArray(a.memberOf)) {
        a.memberOf = a.memberOf.map(m => m === "LeSCa" ? "Le☆S☆Ca" : m);
      }

      // 夢乃ゆき: Vsinger -> 歌手
      if (a.aid === "a_af866a06" || a.name === "夢乃ゆき") {
        a.role = "歌手";
        a.roles = ["歌手"];
      }

      // 園原ありさ -> 其原有沙 (a_06e0e8cd)
      if (a.aid === "a_06e0e8cd" || a.name === "園原ありさ" || a.name === "其原有沙") {
        a.name = "其原有沙";
        a.reading = "そのはらありさ";
        a.kana = "そ";
        a.row = "さ";
        if (!Array.isArray(a.al)) a.al = [];
        ["Sonohara Arisa", "Arisa Sonohara", "sonoharaarisa", "園原ありさ", "其原有沙", "そのはらありさ", "ソノハラアリサ"].forEach(al => {
          if (!a.al.includes(al)) a.al.push(al);
        });
        if (typeof a.profileBio === "string") {
          a.profileBio = a.profileBio.replace("園原ありさ", "其原有沙");
        }
      }
    });

    // 2. Rename Kimidori / きみどり -> ≡君彩≡ (a_31d1b2a3), merging if separate Kimidori exists
    let kimidoriTarget = null;
    const extraKimidoriIndices = [];
    DATA.forEach((a, idx) => {
      if (!a) return;
      const nm = String(a.name || "").trim();
      if (a.aid === "a_31d1b2a3" || nm === "きみどり" || nm === "≡君彩≡" || nm.toLowerCase() === "kimidori") {
        if (!kimidoriTarget) {
          kimidoriTarget = a;
        } else {
          extraKimidoriIndices.push(idx);
        }
      }
    });
    if (kimidoriTarget) {
      kimidoriTarget.aid = "a_31d1b2a3";
      kimidoriTarget.name = "≡君彩≡";
      kimidoriTarget.reading = "きみどり";
      kimidoriTarget.kana = "き";
      kimidoriTarget.row = "か";
      kimidoriTarget.alpha = "";
      if (!Array.isArray(kimidoriTarget.al)) kimidoriTarget.al = [];
      ["Kimidori", "kimidori", "きみどり", "君彩", "≡君彩≡"].forEach(al => {
        if (!kimidoriTarget.al.includes(al)) kimidoriTarget.al.push(al);
      });
      if (!Array.isArray(kimidoriTarget.songs)) kimidoriTarget.songs = [];
      for (let i = extraKimidoriIndices.length - 1; i >= 0; i--) {
        const ex = DATA[extraKimidoriIndices[i]];
        if (ex && Array.isArray(ex.songs)) {
          ex.songs.forEach(s => {
            if (!kimidoriTarget.songs.includes(s)) kimidoriTarget.songs.push(s);
          });
        }
        DATA.splice(extraKimidoriIndices[i], 1);
      }
      kimidoriTarget.count = kimidoriTarget.songs.length;
    }

    // 3. Ensure all curated artists (v56 + v57) and their songs exist
    [...CURATED_V56_ARTISTS, ...CURATED_V57_ARTISTS].forEach(cur => {
      const cid = (cur.ytChannelUrl || "").split("/channel/").pop();
      let found = DATA.find(a => a && (
        a.aid === cur.aid ||
        a.name === cur.name ||
        (cid && String(a.ytChannelUrl || "").includes(cid))
      ));
      if (!found) {
        DATA.push(JSON.parse(JSON.stringify(cur)));
      } else {
        found.name = cur.name;
        if (!found.ytChannelUrl && cur.ytChannelUrl) found.ytChannelUrl = cur.ytChannelUrl;
        if (!found.img && cur.img) found.img = cur.img;
        if (!Array.isArray(found.songs)) found.songs = [];
        cur.songs.forEach(s => {
          if (!found.songs.includes(s)) found.songs.push(s);
        });
        found.count = found.songs.length;
        if (!Array.isArray(found.al)) found.al = [];
        (cur.al || []).forEach(al => {
          if (!found.al.includes(al)) found.al.push(al);
        });
      }
    });

    // 4. Add 花降る日々 to memberOf of 鎖那 and めありー
    DATA.forEach(a => {
      if (a && (a.name === "鎖那" || a.name === "めありー")) {
        if (!Array.isArray(a.memberOf)) a.memberOf = [];
        if (!a.memberOf.includes("花降る日々")) a.memberOf.push("花降る日々");
      }
    });
  })();

  // Calculate dynamic statistics strictly from Category 1 & 2 artists
  const countCat1 = DATA.filter(a => a.cat === 1).length;
  const countCat2 = DATA.filter(a => a.cat === 2).length;
  const countTotal = countCat1 + countCat2;

  // Constants for Activity Classifications & Subscriber Buckets
  const ACTIVITY_ROLES = [
    "Vsinger",
    "Vtuber",
    "歌い手",
    "声優",
    "キャラ",
    "歌手",
    "音楽グループ"
  ];

  const SUBSCRIBER_BUCKETS = [
    { key: "under10k", label: "1万人未満" },
    { key: "10kTo100k", label: "1万人以上～10万人未満" },
    { key: "100kTo1m", label: "10万人以上～100万人未満" },
    { key: "over1m", label: "100万人以上" },
    { key: "unknown", label: "登録者数が取得できない名義" }
  ];

  const SUB_BUCKET_LABEL_MAP = {};
  SUBSCRIBER_BUCKETS.forEach(b => { SUB_BUCKET_LABEL_MAP[b.key] = b.label; });

  // PC Font Scale steps (4 steps in v6: 100%, 125%, 150%, 175%; 200% removed)
  const VALID_FONT_SCALES = [100, 125, 150, 175];
  const FONT_SCALE_STORAGE_KEY = "calpis_pc_font_scale";
  const RECOMMENDED_STORAGE_KEY = "calpis_recommended_artists_v1";
  const RECOMMENDED_BACKUP_KEY = "calpis_recommended_artists_v1_backup";
  const FAV_SERVER_CACHE_KEY = "calpis_fav_server_cache_v1";
  const FAV_UNSAVED_DRAFT_KEY = "calpis_fav_unsaved_draft_v1";
  const FAV_MIGRATION_STATE_KEY = "calpis_fav_migration_state_v1";


  let isInitialSongCacheReady = false;
  const FAV_ORDER_MEMORY_KEY = "calpis_fav_order_memory_v1";
  const FAV_API_ENDPOINT = "./api/favorites";

  const HEART_SVG_SINGLE = `<svg class="heart-soft-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.6c-.35 0-.7-.12-1-.35C7.1 17.2 2 12.8 2 7.8 2 4.5 4.6 2 7.9 2c1.75 0 3.25.8 4.1 2.05C12.85 2.8 14.35 2 16.1 2 19.4 2 22 4.5 22 7.8c0 5-5.1 9.4-9 12.45-.3.23-.65.35-1 .35Z"/></svg>`;
  const HEART_SVG_MOB_TIER3 = `<svg class="heart-soft-svg heart-mob-tier-3" viewBox="0 0 24 24" aria-hidden="true"><path class="heart-mob-outer-ring" d="M12 21.4c-.38 0-.75-.13-1.08-.38C6.7 17.7 1.3 13.0 1.3 7.7 1.3 4.1 4.1 1.4 7.7 1.4c1.82 0 3.4.82 4.3 2.12C12.9 2.22 14.48 1.4 16.3 1.4 19.9 1.4 22.7 4.1 22.7 7.7c0 5.3-5.4 10.0-9.62 13.32-.33.25-.7.38-1.08.38Z" fill="none" stroke="#fda4af" stroke-width="1.65"/><path class="heart-mob-inner-core" d="M12 18.5c-.28 0-.55-.1-.78-.28C8.2 15.8 4.4 12.5 4.4 8.6 4.4 6.1 6.3 4.2 8.9 4.2c1.38 0 2.52.6 3.1 1.56.58-.96 1.72-1.56 3.1-1.56 2.6 0 4.5 1.9 4.5 4.4 0 3.9-3.8 7.2-6.82 9.62-.23.18-.5.28-.78.28Z" fill="#f43f5e"/></svg>`;
  const HEART_SVG_MOB_TIER2 = `<svg class="heart-soft-svg heart-mob-tier-2" viewBox="0 0 24 24" fill="#fb7185" aria-hidden="true"><path d="M12 20.6c-.35 0-.7-.12-1-.35C7.1 17.2 2 12.8 2 7.8 2 4.5 4.6 2 7.9 2c1.75 0 3.25.8 4.1 2.05C12.85 2.8 14.35 2 16.1 2 19.4 2 22 4.5 22 7.8c0 5-5.1 9.4-9 12.45-.3.23-.65.35-1 .35Z"/></svg>`;
  const HEART_SVG_MOB_TIER1 = `<svg class="heart-soft-svg heart-mob-tier-1" viewBox="0 0 24 24" fill="none" stroke="#fda4af" stroke-width="2.4" aria-hidden="true"><path d="M12 20.2c-.35 0-.7-.12-1-.35C7.1 16.8 2.4 12.6 2.4 7.8 2.4 4.7 4.8 2.3 7.9 2.3c1.75 0 3.25.8 4.1 2.05C12.85 3.1 14.35 2.3 16.1 2.3c3.1 0 5.5 2.4 5.5 5.5 0 4.8-4.7 9-8.6 12.05-.3.23-.65.35-1 .35Z"/></svg>`;

  function buildHeartTierInnerHTML(tier = 3) {
    const t = (tier === 1 || tier === 2 || tier === 3) ? tier : 3;
    const pcHearts = Array.from({ length: t }, () => HEART_SVG_SINGLE).join("");
    const mobHeart = t === 3 ? HEART_SVG_MOB_TIER3 : (t === 2 ? HEART_SVG_MOB_TIER2 : HEART_SVG_MOB_TIER1);
    return `<span class="heart-tier-pc" data-pc-hearts="${t}">${pcHearts}</span><span class="heart-tier-mob" data-mob-tier="${t}">${mobHeart}</span>`;
  }

  function buildHeartBadgeSpanHTML(tier, className = "artist-fav-heart", label = "かるのオススメ") {
    const t = (tier === 1 || tier === 2 || tier === 3) ? tier : 0;
    if (!t) return "";
    const tierName = t === 3 ? "Lv.3" : (t === 2 ? "Lv.2" : "Lv.1");
    const fullTitle = `${label}（${tierName}）`;
    return `<span class="${className} heart-tier-${t}" data-heart-tier="${t}" title="${fullTitle}" aria-label="${fullTitle}">${buildHeartTierInnerHTML(t)}</span>`;
  }

  const HEART_SVG_INNER = buildHeartTierInnerHTML(3);

  // Build stable Artist Identifier (`aid`) maps and preserve static base songs for each artist
  const AID_TO_ARTIST = new Map();
  const NAME_TO_AID = new Map();
  const NORM_NAME_TO_AID = new Map();

  function normLookupKey(s) {
    return String(s || "").trim().replace(/[\s\u3000]+/g, " ").toLowerCase();
  }

  DATA.forEach((a, idx) => {
    if (!a) return;
    if (!a.aid || typeof a.aid !== "string") {
      a.aid = "a_" + String(idx + 1).padStart(4, "0");
    }
    // The playlist sync compacts empty arrays; keep a.songs an array for every artist.
    if (!Array.isArray(a.songs)) a.songs = [];
    if (Array.isArray(a.mugen2HiddenSongs) && a.mugen2HiddenSongs.length > 0) {
      const hiddenSet = new Set(a.mugen2HiddenSongs.map(s => String(s || "").trim()));
      a.songs = a.songs.filter(s => !hiddenSet.has(String(s || "").trim()));
      a.count = a.songs.length;
    }
    a._staticBaseSongs = [...a.songs];
    AID_TO_ARTIST.set(a.aid, a);
    if (a.name) {
      NAME_TO_AID.set(a.name, a.aid);
      NORM_NAME_TO_AID.set(normLookupKey(a.name), a.aid);
    }
    if (Array.isArray(a.al)) {
      a.al.forEach(alias => {
        if (typeof alias === "string" && alias.trim()) {
          const nk = normLookupKey(alias);
          if (!NORM_NAME_TO_AID.has(nk)) NORM_NAME_TO_AID.set(nk, a.aid);
        }
      });
    }
  });

  function resolveToAid(nameOrAid) {
    if (!nameOrAid || typeof nameOrAid !== "string") return null;
    let t = nameOrAid.trim();
    if (!t) return null;
    const tierMatch = t.match(/^(.*?):([123])$/);
    if (tierMatch) t = tierMatch[1].trim();
    if (AID_TO_ARTIST.has(t)) return t;
    if (NAME_TO_AID.has(t)) return NAME_TO_AID.get(t);
    const nk = normLookupKey(t);
    if (NORM_NAME_TO_AID.has(nk)) return NORM_NAME_TO_AID.get(nk);
    return null;
  }

  function parseArtistIdAndTier(rawEntry) {
    if (!rawEntry || typeof rawEntry !== "string") return null;
    const trimmed = rawEntry.trim();
    if (!trimmed) return null;
    let tier = 3;
    let basePart = trimmed;
    const m = trimmed.match(/^(.*?):([123])$/);
    if (m) {
      basePart = m[1].trim();
      tier = Number(m[2]) || 3;
    }
    const aid = resolveToAid(basePart);
    if (!aid) return null;
    return { aid, tier };
  }

  function formatArtistIdWithTier(aid, tier = 3) {
    if (!aid) return null;
    if (tier === 1) return `${aid}:1`;
    if (tier === 2) return `${aid}:2`;
    return aid;
  }

  function normalizeArtistIdWithTierArray(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    const seen = new Set();
    arr.forEach(item => {
      const parsed = parseArtistIdAndTier(item);
      if (parsed && !seen.has(parsed.aid)) {
        seen.add(parsed.aid);
        out.push(formatArtistIdWithTier(parsed.aid, parsed.tier));
      }
    });
    return out;
  }

  function resolveAidToName(aidOrToken) {
    const aid = resolveToAid(aidOrToken);
    const a = aid ? AID_TO_ARTIST.get(aid) : null;
    return a ? a.name : null;
  }

  function makeSongKey(aidOrName, songTitle) {
    const aid = resolveToAid(aidOrName);
    if (!aid) return null;
    let cleanSong = String(songTitle || "").replace(/[\r\n\t]+/g, " ").trim();
    const tierMatch = cleanSong.match(/^(.*?)\|\|([123])$/);
    if (tierMatch) {
      cleanSong = tierMatch[1].trim();
    }
    if (!cleanSong) return null;
    if (SONG_RENAME_MAP[cleanSong]) {
      cleanSong = SONG_RENAME_MAP[cleanSong];
    }
    return `${aid}\t${cleanSong}`;
  }

  function parseSongKeyAndTier(rawEntry) {
    let rawArtist = "";
    let rawSong = "";
    let explicitTier = 0;
    if (typeof rawEntry === "string") {
      const tabIdx = rawEntry.indexOf("\t");
      if (tabIdx <= 0) return null;
      rawArtist = rawEntry.slice(0, tabIdx);
      rawSong = rawEntry.slice(tabIdx + 1);
    } else if (rawEntry && typeof rawEntry === "object") {
      rawArtist = String(rawEntry.aid || rawEntry.artist || "");
      rawSong = String(rawEntry.song || rawEntry.title || "");
      if (rawEntry.tier === 1 || rawEntry.tier === 2 || rawEntry.tier === 3) {
        explicitTier = rawEntry.tier;
      }
    } else {
      return null;
    }
    let cleanSong = String(rawSong || "").replace(/[\r\n\t]+/g, " ").trim();
    let tier = explicitTier || 3;
    const tierMatch = cleanSong.match(/^(.*?)\|\|([123])$/);
    if (tierMatch) {
      cleanSong = tierMatch[1].trim();
      if (!explicitTier) tier = Number(tierMatch[2]) || 3;
    }
    const key = makeSongKey(rawArtist, cleanSong);
    if (!key) return null;
    return { key, tier };
  }

  function formatSongKeyWithTier(key, tier = 3) {
    if (!key) return null;
    if (tier === 1) return `${key}||1`;
    if (tier === 2) return `${key}||2`;
    return key;
  }

  function normalizeSongFavWithTierArray(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    const seen = new Set();
    arr.forEach(item => {
      const parsed = parseSongKeyAndTier(item);
      if (parsed && !seen.has(parsed.key)) {
        seen.add(parsed.key);
        out.push(formatSongKeyWithTier(parsed.key, parsed.tier));
      }
    });
    return out;
  }

  function normalizeSongKeyArray(arr) {
    if (!Array.isArray(arr)) return [];
    const out = [];
    const seen = new Set();
    arr.forEach(item => {
      const parsed = parseSongKeyAndTier(item);
      if (parsed && !seen.has(parsed.key)) {
        seen.add(parsed.key);
        out.push(parsed.key);
      }
    });
    return out;
  }

  // Active maps/sets in memory:
  // 1) recommendedAidMap: Map of manually recommended artist `aid -> tier (1|2|3)`
  // 2) recommendedSongMap: Map of recommended song keys (`"aid\tsongTitle" -> tier (1|2|3)`)
  // 3) customAddedSongSet: Set of manually added song keys (`"aid\tsongTitle"`)
  const recommendedAidMap = new Map();
  const recommendedSongMap = new Map();
  const customAddedSongSet = new Set();
  const artistTierOrderMap = new Map();
  let favOrderSeqCounter = 1;

  let favQuickEditMode = false;
  let activeHeartTier = 3; // Default Tier 3 (最上位) in Edit Mode
  let isSavingFavorites = false;
  let updateFavEditBannerStatus = function() {};

  // Edit Mode Undo / Redo History Stacks
  const editUndoStack = [];
  const editRedoStack = [];
  const MAX_EDIT_HISTORY = 80;

  // Confirmed server state
  let serverFavIds = [];
  let serverSongFavs = [];
  let serverCustomSongs = [];
  let serverVersion = 0;
  let serverConfigured = true;
  let hasFetchedServerOnce = false;
  let lastServerFetchAt = 0;

  // Edit session baselines (captured when entering Edit Mode)
  let editSessionBaseIds = [];
  let editSessionBaseSongFavs = [];
  let editSessionBaseCustomSongs = [];
  let editSessionBaseVersion = 0;
  let editSessionBaseEffectiveMap = new Map();
  let manualReorderCount = 0;

  function captureEffectiveArtistTierMap() {
    const m = new Map();
    DATA.forEach(a => {
      if (a && a.aid) {
        const t = getArtistHeartTier(a.aid);
        if (t > 0) m.set(a.aid, t);
      }
    });
    return m;
  }

  function getSortedCurrentAids() {
    const arr = [];
    recommendedAidMap.forEach((tier, aid) => {
      if (AID_TO_ARTIST.has(aid)) {
        arr.push(formatArtistIdWithTier(aid, tier));
      }
    });
    return arr;
  }

  function getSortedCurrentSongFavs() {
    const arr = [];
    recommendedSongMap.forEach((tier, key) => {
      arr.push(formatSongKeyWithTier(key, tier));
    });
    return arr;
  }

  function getSortedCurrentCustomSongs() {
    return Array.from(customAddedSongSet).sort();
  }

  function areStringArraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Merges `customAddedSongSet` into each artist's `a.songs` and updates `a.count` and search normalization arrays.
   */
  function syncCustomSongsIntoArchiveData() {
    const customByAid = new Map();
    customAddedSongSet.forEach(key => {
      const idx = key.indexOf("\t");
      if (idx <= 0) return;
      const aid = key.slice(0, idx);
      const title = key.slice(idx + 1);
      if (!customByAid.has(aid)) customByAid.set(aid, []);
      customByAid.get(aid).push(title);
    });

    DATA.forEach(a => {
      if (!a || !a.aid) return;
      const baseSongs = Array.isArray(a._staticBaseSongs) ? a._staticBaseSongs : [];
      const extraSongs = customByAid.get(a.aid) || [];
      if (!Array.isArray(a.songs)) a.songs = [...baseSongs];
      if (extraSongs.length === 0) {
        if (a.songs.length !== baseSongs.length) {
          a.songs = [...baseSongs];
          a.count = a.songs.length;
          if (typeof normSearch === "function" && typeof stripSpaces === "function") {
            a._normSongs = a.songs.map(s => normSearch(s));
            a._normSongsNoSpace = a._normSongs.map(s => stripSpaces(s));
            a._normSongAliases = a.songs.map(s => (SONG_SEARCH_ALIASES_BY_NEW_TITLE[s] || []).map(al => normSearch(al)));
            a._normSongAliasesNoSpace = a._normSongAliases.map(arr => arr.map(al => stripSpaces(al)));
          }
        }
        return;
      }
      const existingSet = new Set(baseSongs);
      const merged = [...baseSongs];
      extraSongs.forEach(t => {
        if (!existingSet.has(t)) {
          existingSet.add(t);
          merged.push(t);
        }
      });
      a.songs = merged;
      a.count = merged.length;
      if (typeof normSearch === "function" && typeof stripSpaces === "function") {
        a._normSongs = a.songs.map(s => normSearch(s));
        a._normSongsNoSpace = a._normSongs.map(s => stripSpaces(s));
        a._normSongAliases = a.songs.map(s => (SONG_SEARCH_ALIASES_BY_NEW_TITLE[s] || []).map(al => normSearch(al)));
        a._normSongAliasesNoSpace = a._normSongAliases.map(arr => arr.map(al => stripSpaces(al)));
      }
    });
    if (isInitialSongCacheReady && typeof rebuildAllArtistSongSearchCaches === "function") {
      rebuildAllArtistSongSearchCaches();
  isInitialSongCacheReady = true;
    }
  }

  function setAllSharedStates(ids, songFavs, customSongs) {
    recommendedAidMap.clear();
    artistTierOrderMap.clear();
    if (Array.isArray(ids)) {
      ids.forEach(x => {
        const parsed = parseArtistIdAndTier(x);
        if (parsed && !recommendedAidMap.has(parsed.aid)) {
          recommendedAidMap.set(parsed.aid, parsed.tier);
          artistTierOrderMap.set(parsed.aid, favOrderSeqCounter++);
        }
      });
    }
    recommendedSongMap.clear();
    if (Array.isArray(songFavs)) {
      songFavs.forEach(x => {
        const parsed = parseSongKeyAndTier(x);
        if (parsed && !recommendedSongMap.has(parsed.key)) {
          recommendedSongMap.set(parsed.key, parsed.tier);
        }
      });
    }

    customAddedSongSet.clear();
    normalizeSongKeyArray(customSongs).forEach(k => customAddedSongSet.add(k));

    syncCustomSongsIntoArchiveData();
    DATA.forEach(a => {
      if (a && a.aid && !artistTierOrderMap.has(a.aid) && getArtistHeartTier(a.aid) > 0) {
        artistTierOrderMap.set(a.aid, favOrderSeqCounter++);
      }
    });
  }

  function getLegacyLocalStorageAids() {
    const tempMap = new Map();
    DATA.forEach(a => {
      if (a && a.rec && a.aid) tempMap.set(a.aid, 3);
    });
    try {
      const raw = localStorage.getItem(RECOMMENDED_STORAGE_KEY) || localStorage.getItem(RECOMMENDED_BACKUP_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      parsed.forEach(entry => {
        if (typeof entry === "string" && entry.trim()) {
          if (entry.startsWith("-")) {
            const aid = resolveToAid(entry.slice(1));
            if (aid) tempMap.delete(aid);
          } else {
            const p = parseArtistIdAndTier(entry.trim());
            if (p) tempMap.set(p.aid, p.tier);
          }
        }
      });
    } catch (e) {
      return [];
    }
    const out = [];
    tempMap.forEach((tier, aid) => out.push(formatArtistIdWithTier(aid, tier)));
    return out;
  }

  function loadFavOrderMemory() {
    try {
      const raw = localStorage.getItem(FAV_ORDER_MEMORY_KEY);
      if (!raw) return { ids: [], songFavs: [] };
      const parsed = JSON.parse(raw);
      return {
        ids: normalizeArtistIdWithTierArray(parsed && parsed.ids),
        songFavs: normalizeSongFavWithTierArray(parsed && parsed.songFavs)
      };
    } catch (_e) {
      return { ids: [], songFavs: [] };
    }
  }

  function saveFavOrderMemory(ids, songFavs) {
    try {
      localStorage.setItem(FAV_ORDER_MEMORY_KEY, JSON.stringify({
        ids: Array.isArray(ids) ? ids : getSortedCurrentAids(),
        songFavs: Array.isArray(songFavs) ? songFavs : getSortedCurrentSongFavs(),
        updatedAt: Date.now()
      }));
    } catch (_e) {}
  }

  function isStrictlyLexicographical(arr) {
    if (!Array.isArray(arr) || arr.length <= 1) return false;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1] > arr[i]) return false;
    }
    return true;
  }

  function stripTierFromToken(tok) {
    const s = String(tok || "");
    if (s.includes("\t")) {
      return s.replace(/\|\|[123]$/, "");
    }
    return s.replace(/:[123]$/, "");
  }

  /**
   * Ensures that if an older server endpoint returned lexicographically sorted `ids`/`songFavs`,
   * we preserve our known insertion/custom order and heart tiers, placing newly added items at the end.
   */
  function reconcileOrderWithMemory(incomingArr, memoryArr) {
    if (!Array.isArray(incomingArr) || incomingArr.length === 0) return [];
    if (!Array.isArray(memoryArr) || memoryArr.length === 0) return incomingArr;
    if (!isStrictlyLexicographical(incomingArr) && !areStringArraysEqual(incomingArr, memoryArr)) {
      return incomingArr;
    }
    const incomingByBase = new Map();
    incomingArr.forEach(item => {
      incomingByBase.set(stripTierFromToken(item), item);
    });
    const ordered = [];
    const seenBase = new Set();
    memoryArr.forEach(memItem => {
      const base = stripTierFromToken(memItem);
      if (incomingByBase.has(base) && !seenBase.has(base)) {
        seenBase.add(base);
        const incItem = incomingByBase.get(base);
        // If incoming lost tier suffix due to older server, keep memory tier suffix
        const chosen = (incItem === base && memItem !== base) ? memItem : incItem;
        ordered.push(chosen);
      }
    });
    incomingArr.forEach(incItem => {
      const base = stripTierFromToken(incItem);
      if (!seenBase.has(base)) {
        seenBase.add(base);
        ordered.push(incItem);
      }
    });
    return ordered;
  }

  function loadFavServerCache() {
    try {
      const raw = localStorage.getItem(FAV_SERVER_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.ids)) {
        return {
          ids: normalizeArtistIdWithTierArray(parsed.ids),
          songFavs: normalizeSongFavWithTierArray(parsed.songFavs),
          customSongs: normalizeSongKeyArray(parsed.customSongs),
          version: typeof parsed.version === "number" ? parsed.version : 0,
          updatedAt: parsed.updatedAt || null
        };
      }
    } catch (e) {}
    return null;
  }

  function saveFavServerCache(ids, songFavs, customSongs, version, updatedAt) {
    try {
      localStorage.setItem(FAV_SERVER_CACHE_KEY, JSON.stringify({
        ids: Array.isArray(ids) ? ids : [],
        songFavs: Array.isArray(songFavs) ? songFavs : [],
        customSongs: Array.isArray(customSongs) ? customSongs : [],
        version: typeof version === "number" ? version : 0,
        updatedAt: updatedAt || new Date().toISOString(),
        cachedAt: Date.now()
      }));
    } catch (e) {}
  }

  function hasAnyEditChanges() {
    return (
      manualReorderCount > 0 ||
      !areStringArraysEqual(getSortedCurrentAids(), editSessionBaseIds) ||
      !areStringArraysEqual(getSortedCurrentSongFavs(), editSessionBaseSongFavs) ||
      !areStringArraysEqual(getSortedCurrentCustomSongs(), editSessionBaseCustomSongs)
    );
  }

  function loadUnsavedDraft() {
    try {
      const raw = localStorage.getItem(FAV_UNSAVED_DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.ids)) return null;
      return {
        ids: normalizeArtistIdWithTierArray(parsed.ids),
        songFavs: normalizeSongFavWithTierArray(parsed.songFavs),
        customSongs: normalizeSongKeyArray(parsed.customSongs),
        baseIds: normalizeArtistIdWithTierArray(parsed.baseIds),
        baseSongFavs: normalizeSongFavWithTierArray(parsed.baseSongFavs),
        baseCustomSongs: normalizeSongKeyArray(parsed.baseCustomSongs),
        baseVersion: typeof parsed.baseVersion === "number" ? parsed.baseVersion : 0,
        updatedAt: parsed.updatedAt || Date.now()
      };
    } catch (e) {}
    return null;
  }

  function saveUnsavedDraft() {
    try {
      if (!hasAnyEditChanges()) {
        localStorage.removeItem(FAV_UNSAVED_DRAFT_KEY);
        return;
      }
      localStorage.setItem(FAV_UNSAVED_DRAFT_KEY, JSON.stringify({
        ids: getSortedCurrentAids(),
        songFavs: getSortedCurrentSongFavs(),
        customSongs: getSortedCurrentCustomSongs(),
        baseIds: editSessionBaseIds,
        baseSongFavs: editSessionBaseSongFavs,
        baseCustomSongs: editSessionBaseCustomSongs,
        baseVersion: editSessionBaseVersion,
        updatedAt: Date.now()
      }));
    } catch (e) {}
  }

  function clearUnsavedDraft() {
    try {
      localStorage.removeItem(FAV_UNSAVED_DRAFT_KEY);
    } catch (e) {}
  }

  function getSongHeartTier(aidOrName, songTitle) {
    const key = makeSongKey(aidOrName, songTitle);
    if (!key) return 0;
    return recommendedSongMap.get(key) || 0;
  }

  function isRecommendedSong(aidOrName, songTitle) {
    return getSongHeartTier(aidOrName, songTitle) > 0;
  }

  function getRecommendedSongsForArtist(artist) {
    if (!artist || !artist.aid) return [];
    const pool = [];
    const seen = new Set();
    [...(artist.songs || []), ...(artist.topSongs || [])].forEach(s => {
      if (s && !seen.has(s)) {
        seen.add(s);
        pool.push(s);
      }
    });
    return pool.filter(s => recommendedSongMap.has(`${artist.aid}\t${s}`));
  }

  function getArtistFavSongCount(artistOrNameOrAid) {
    if (!artistOrNameOrAid) return 0;
    const a = (typeof artistOrNameOrAid === "object" && artistOrNameOrAid.aid)
      ? artistOrNameOrAid
      : AID_TO_ARTIST.get(resolveToAid(artistOrNameOrAid));
    if (!a) return 0;
    return getRecommendedSongsForArtist(a).length;
  }

  function getArtistListeningFavSongCount(artistOrNameOrAid) {
    if (!artistOrNameOrAid) return 0;
    const a = (typeof artistOrNameOrAid === "object" && artistOrNameOrAid.aid)
      ? artistOrNameOrAid
      : AID_TO_ARTIST.get(resolveToAid(artistOrNameOrAid));
    if (!a || !Array.isArray(a.songs)) return 0;
    let cnt = 0;
    const seen = new Set();
    for (let i = 0; i < a.songs.length; i++) {
      const s = a.songs[i];
      if (s && !seen.has(s)) {
        seen.add(s);
        if (recommendedSongMap.has(`${a.aid}\t${s}`)) cnt++;
      }
    }
    return cnt;
  }

  function getArtistListeningFavSongRatio(artistOrNameOrAid) {
    if (!artistOrNameOrAid) return 0;
    const a = (typeof artistOrNameOrAid === "object" && artistOrNameOrAid.aid)
      ? artistOrNameOrAid
      : AID_TO_ARTIST.get(resolveToAid(artistOrNameOrAid));
    if (!a || !Array.isArray(a.songs) || a.songs.length === 0) return 0;
    const favCnt = getArtistListeningFavSongCount(a);
    return favCnt / a.songs.length;
  }

  function formatFavRatioPercent(ratio) {
    const r = Number(ratio) || 0;
    if (r <= 0) return "0";
    const pct = r * 100;
    if (Math.abs(pct - Math.round(pct)) < 0.05) {
      return String(Math.round(pct));
    }
    return pct.toFixed(1).replace(/\.0$/, "");
  }

  function getArtistTotalSongHearts(artistOrNameOrAid) {
    if (!artistOrNameOrAid) return 0;
    const a = (typeof artistOrNameOrAid === "object" && artistOrNameOrAid.aid)
      ? artistOrNameOrAid
      : AID_TO_ARTIST.get(resolveToAid(artistOrNameOrAid));
    if (!a) return 0;
    const favSongs = getRecommendedSongsForArtist(a);
    let total = 0;
    for (let i = 0; i < favSongs.length; i++) {
      const tier = getSongHeartTier(a.aid, favSongs[i]) || 3;
      total += tier;
    }
    return total;
  }

  function getManualArtistHeartTier(nameOrAid) {
    const aid = resolveToAid(nameOrAid);
    if (!aid) return 0;
    return recommendedAidMap.get(aid) || 0;
  }

  /**
   * Automatic artist heart promotion for artists without a manual heart:
   * - 4 or more hearted songs -> Tier 3 (最上位ハート)
   * - 3 hearted songs -> Tier 2 (第2ハート)
   * - 2 hearted songs -> Tier 1 (第1ハート)
   * Never overwrites an existing manual heart (`getManualArtistHeartTier(nameOrAid) > 0`).
   */
  function getAutoArtistHeartTier(nameOrAid) {
    const aid = resolveToAid(nameOrAid);
    if (!aid) return 0;
    const a = AID_TO_ARTIST.get(aid);
    if (!a) return 0;
    const favCnt = getRecommendedSongsForArtist(a).length;
    if (favCnt >= 4) return 3;
    if (favCnt === 3) return 2;
    if (favCnt === 2) return 1;
    return 0;
  }

  function getArtistHeartTier(nameOrAid) {
    const manualTier = getManualArtistHeartTier(nameOrAid);
    if (manualTier > 0) return manualTier;
    return getAutoArtistHeartTier(nameOrAid);
  }

  function isRecommendedArtist(nameOrAid) {
    return getArtistHeartTier(nameOrAid) > 0;
  }

  function getRecommendedCount() {
    let cnt = 0;
    DATA.forEach(a => {
      if (a && a.aid && getArtistHeartTier(a.aid) > 0) cnt++;
    });
    return cnt;
  }

  function getRecommendedSongCount() {
    let cnt = 0;
    DATA.forEach(a => {
      cnt += getRecommendedSongsForArtist(a).length;
    });
    return cnt;
  }

  function hasRecommendedSongsForArtist(aidOrName) {
    const aid = resolveToAid(aidOrName);
    if (!aid) return false;
    const a = AID_TO_ARTIST.get(aid);
    return getRecommendedSongsForArtist(a).length > 0;
  }

  function normSongTitleForCompare(title) {
    return String(title || "")
      .normalize("NFKC")
      .replace(/\s*\(cover\)\s*$/i, "")
      .replace(/[\s\u3000]+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getTop5SongHeartTierInArchive(artist, rawTopTitle, dispTopTitle) {
    if (!artist || !artist.aid) return 0;
    const directRaw = getSongHeartTier(artist.aid, rawTopTitle);
    if (directRaw > 0) return directRaw;
    const directDisp = getSongHeartTier(artist.aid, dispTopTitle);
    if (directDisp > 0) return directDisp;
    const targetNorm = normSongTitleForCompare(rawTopTitle);
    const dispNorm = normSongTitleForCompare(dispTopTitle);
    const favSongs = getRecommendedSongsForArtist(artist);
    let bestTier = 0;
    favSongs.forEach(favTitle => {
      const fn = normSongTitleForCompare(favTitle);
      if (fn && (fn === targetNorm || fn === dispNorm)) {
        const t = getSongHeartTier(artist.aid, favTitle);
        if (t > bestTier) bestTier = t;
      }
    });
    return bestTier;
  }

  function isTop5SongHeartedInArchive(artist, rawTopTitle, dispTopTitle) {
    return getTop5SongHeartTierInArchive(artist, rawTopTitle, dispTopTitle) > 0;
  }

  function isCustomAddedSong(aidOrName, songTitle) {
    const key = makeSongKey(aidOrName, songTitle);
    return Boolean(key && customAddedSongSet.has(key));
  }

  // Edit Mode Undo / Redo helpers
  function captureEditSnapshot() {
    return {
      ids: getSortedCurrentAids(),
      songFavs: getSortedCurrentSongFavs(),
      customSongs: getSortedCurrentCustomSongs(),
      manualReorderCount: manualReorderCount
    };
  }

  function editSnapshotsEqual(a, b) {
    if (!a || !b) return false;
    return (
      areStringArraysEqual(a.ids, b.ids) &&
      areStringArraysEqual(a.songFavs, b.songFavs) &&
      areStringArraysEqual(a.customSongs, b.customSongs) &&
      (a.manualReorderCount || 0) === (b.manualReorderCount || 0)
    );
  }

  function pushEditHistorySnapshot() {
    const snap = captureEditSnapshot();
    if (editUndoStack.length > 0 && editSnapshotsEqual(editUndoStack[editUndoStack.length - 1], snap)) {
      return;
    }
    editUndoStack.push(snap);
    if (editUndoStack.length > MAX_EDIT_HISTORY) editUndoStack.shift();
    editRedoStack.length = 0;
    if (typeof syncHistoryButtons === "function") syncHistoryButtons();
  }

  function syncActiveHeartTierUI() {
    document.body.setAttribute("data-active-heart-tier", String(activeHeartTier));
    document.querySelectorAll("[data-select-heart-tier]").forEach(btn => {
      const t = Number(btn.getAttribute("data-select-heart-tier")) || 3;
      const isAct = t === activeHeartTier;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-selected", isAct ? "true" : "false");
    });
  }

  /**
   * Flicker-free in-place DOM update for heart icons and counts during background sync / edits.
   */
  function applySilentFavoritesDOMUpdate() {
    renderStaticStats();

    // Update heart icons & song counts on currently rendered artist rows in-place
    const rows = document.querySelectorAll("#artistListContainer .artist-row[data-artist-name]");
    rows.forEach(row => {
      const aName = row.getAttribute("data-artist-name");
      const recSongTitle = row.getAttribute("data-rec-song-title");
      const aObj = aName ? ARTIST_MAP.get(aName) : null;
      if (!aName || !aObj) return;

      // Update song count column & 高評価曲数 column in-place
      const countEl = row.querySelector(".row-count");
      if (countEl) {
        const isKaruArtistSearch = Boolean(state.karuSpecialMode && state.view === "search" && state.searchTarget === "artist");
        if (isKaruArtistSearch && state.searchArtistSort === "favCountDesc") {
          const fCnt = getArtistListeningFavSongCount(aObj);
          countEl.innerHTML = `${fmtNum(fCnt)}<span>曲</span><span class="karu-sort-sub-metric">/${fmtNum(aObj.count)}曲</span>`;
        } else if (isKaruArtistSearch && state.searchArtistSort === "favRatioDesc") {
          const fCnt = getArtistListeningFavSongCount(aObj);
          const fRat = getArtistListeningFavSongRatio(aObj);
          countEl.innerHTML = `${formatFavRatioPercent(fRat)}<span>%</span><span class="karu-sort-sub-metric">(${fmtNum(fCnt)}/${fmtNum(aObj.count)})</span>`;
        } else {
          countEl.innerHTML = `${fmtNum(aObj.count)}<span>曲</span>`;
        }
      }
      const favCountEl = row.querySelector(".row-fav-song-count");
      if (favCountEl) {
        const favCnt = getArtistFavSongCount(aObj);
        favCountEl.innerHTML = `${fmtNum(favCnt)}<span>曲</span>`;
      }
      const totalHeartEl = row.querySelector(".row-total-heart-count");
      if (totalHeartEl) {
        const totHearts = getArtistTotalSongHearts(aObj);
        totalHeartEl.innerHTML = `${fmtNum(totHearts)}<span class="total-heart-mark" aria-hidden="true">${HEART_SVG_SINGLE}</span>`;
      }

      if (recSongTitle) return; // Song rows in recommend tab are handled by recommend refresh below

      const artistTier = getArtistHeartTier(aName);
      const shouldHaveHeart = artistTier > 0;
      row.classList.toggle("artist-is-fav", shouldHaveHeart);
      if (shouldHaveHeart) {
        row.setAttribute("data-heart-tier", String(artistTier));
      } else {
        row.removeAttribute("data-heart-tier");
      }

      // Update song hearts on song-matched search rows (.song-matched-row)
      if (row.classList.contains("song-matched-row")) {
        const primarySong = row.getAttribute("data-primary-song");
        if (primarySong) {
          const pTier = getSongHeartTier(aObj.aid, primarySong);
          row.classList.toggle("song-is-fav", pTier > 0);
        }
        const songTokens = row.querySelectorAll("[data-matched-song-title]");
        songTokens.forEach(tok => {
          const sTitle = tok.getAttribute("data-matched-song-title");
          const sTier = sTitle ? getSongHeartTier(aObj.aid, sTitle) : 0;
          const isSngFav = sTier > 0;
          tok.classList.toggle("is-song-fav", isSngFav);
          const existingSngHeart = tok.querySelector(".song-search-fav-heart");
          if (isSngFav) {
            const temp = document.createElement("span");
            temp.innerHTML = buildHeartBadgeSpanHTML(sTier, "artist-fav-heart song-search-fav-heart", "かるのオススメ楽曲");
            const newHeart = temp.firstElementChild;
            if (existingSngHeart && newHeart) {
              existingSngHeart.replaceWith(newHeart);
            } else if (newHeart) {
              tok.appendChild(newHeart);
            }
          } else if (existingSngHeart) {
            existingSngHeart.remove();
          }
        });
      }

      const nameEl = row.querySelector(".row-name");
      if (!nameEl) return;
      const existingHeart = nameEl.querySelector(".artist-fav-heart:not(.song-search-fav-heart)");
      if (row.classList.contains("song-matched-row")) {
        if (existingHeart) existingHeart.remove();
        return;
      }
      if (shouldHaveHeart) {
        const temp = document.createElement("span");
        temp.innerHTML = buildHeartBadgeSpanHTML(artistTier, "artist-fav-heart", "かるのオススメ");
        const newHeart = temp.firstElementChild;
        if (existingHeart && newHeart) {
          existingHeart.replaceWith(newHeart);
        } else if (newHeart) {
          nameEl.appendChild(newHeart);
        }
      } else if (existingHeart) {
        existingHeart.remove();
      }
    });

    // Also update top search candidate song chips if visible
    renderSearchCandidates();

    // Also update 代表曲 TOP 5 song hearts if detail panel is open on top5 mode
    if (state.selectedArtistName) {
      const selArtist = ARTIST_MAP.get(state.selectedArtistName);
      if (selArtist) {
        const top5Items = document.querySelectorAll("#detailScrollContent .top5-song-item[data-top5-song-title]");
        top5Items.forEach(item => {
          const rawTop = item.getAttribute("data-top5-song-title") || "";
          const dispTop = item.getAttribute("data-top5-disp-title") || rawTop;
          const repTier = getTop5SongHeartTierInArchive(selArtist, rawTop, dispTop);
          const isFav = repTier > 0;
          item.classList.toggle("song-is-fav", isFav);
          const nameEl = item.querySelector(".song-name");
          if (nameEl) {
            const ex = nameEl.querySelector(".song-fav-heart");
            if (isFav) {
              const temp = document.createElement("span");
              temp.innerHTML = buildHeartBadgeSpanHTML(repTier, "song-fav-heart", "かるのオススメ楽曲");
              const newHeart = temp.firstElementChild;
              if (ex && newHeart) ex.replaceWith(newHeart);
              else if (newHeart) nameEl.appendChild(newHeart);
            } else if (ex) {
              ex.remove();
            }
          }
        });
      }
    }

    // Update heart icon & hero state on currently open detail panel header in-place
    if (state.selectedArtistName) {
      const detailTier = getArtistHeartTier(state.selectedArtistName);
      const shouldHaveHeart = detailTier > 0;
      const detailHeroEl = document.querySelector("#detailScrollContent .detail-hero");
      if (detailHeroEl) {
        detailHeroEl.classList.toggle("detail-artist-is-fav", shouldHaveHeart);
        if (shouldHaveHeart) detailHeroEl.setAttribute("data-heart-tier", String(detailTier));
        else detailHeroEl.removeAttribute("data-heart-tier");
      }
      const detailNameEl = document.querySelector("#detailScrollContent .detail-artist-name");
      if (detailNameEl) {
        const existingHeart = detailNameEl.querySelector(".detail-fav-heart");
        if (shouldHaveHeart) {
          const temp = document.createElement("span");
          temp.innerHTML = buildHeartBadgeSpanHTML(detailTier, "detail-fav-heart", "かるのオススメ");
          const newHeart = temp.firstElementChild;
          if (existingHeart && newHeart) existingHeart.replaceWith(newHeart);
          else if (newHeart) detailNameEl.appendChild(newHeart);
        } else if (existingHeart) {
          existingHeart.remove();
        }
      }
    }

    if (state.view === "recommend") {
      const scrollEl = document.getElementById("centerScrollArea");
      const prevTop = scrollEl ? scrollEl.scrollTop : 0;
      updateUI(false);
      if (scrollEl) scrollEl.scrollTop = prevTop;
    }
  }

  // Initial synchronous boot load (0ms blocking)
  function loadRecommendedArtists() {
    const cachedServer = loadFavServerCache();
    const legacyAids = getLegacyLocalStorageAids();
    let migState = null; try { migState = localStorage.getItem(FAV_MIGRATION_STATE_KEY); } catch (_e) {}

    if (
      cachedServer &&
      (cachedServer.version > 0 ||
        cachedServer.ids.length > 0 ||
        cachedServer.songFavs.length > 0 ||
        cachedServer.customSongs.length > 0)
    ) {
      serverFavIds = cachedServer.ids;
      serverSongFavs = cachedServer.songFavs;
      serverCustomSongs = cachedServer.customSongs;
      serverVersion = cachedServer.version;
      setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
    } else if (legacyAids.length > 0 && migState !== "skipped") {
      setAllSharedStates(legacyAids, [], []);
    } else {
      setAllSharedStates([], [], []);
    }
    editSessionBaseIds = [...serverFavIds];
    editSessionBaseSongFavs = [...serverSongFavs];
    editSessionBaseCustomSongs = [...serverCustomSongs];
    editSessionBaseVersion = serverVersion;
  }

  function toggleRecommendedArtist(name) {
    if (!favQuickEditMode || isSavingFavorites) return false;
    const aid = resolveToAid(name);
    if (!aid) return false;
    const curEffTier = getArtistHeartTier(aid);
    const curManualTier = recommendedAidMap.get(aid) || 0;
    const targetTier = (activeHeartTier === 1 || activeHeartTier === 2 || activeHeartTier === 3) ? activeHeartTier : 3;
    // Requirement: Simple tap/click must NEVER delete a heart!
    // If already at targetTier (manual or effective), do nothing on tap (deletion requires long-press -> delete).
    if (curManualTier === targetTier || (curManualTier === 0 && curEffTier === targetTier)) {
      return false;
    }
    pushEditHistorySnapshot();
    recommendedAidMap.delete(aid);
    recommendedAidMap.set(aid, targetTier);
    artistTierOrderMap.set(aid, favOrderSeqCounter++);
    saveFavOrderMemory();
    saveUnsavedDraft();
    updateFavEditBannerStatus();
    applySilentFavoritesDOMUpdate();
    syncHistoryButtons();
    return true;
  }

  function removeRecommendedArtist(nameOrAid) {
    if (!favQuickEditMode || isSavingFavorites) return false;
    const aid = resolveToAid(nameOrAid);
    if (!aid || !recommendedAidMap.has(aid)) return false;
    pushEditHistorySnapshot();
    recommendedAidMap.delete(aid);
    saveFavOrderMemory();
    saveUnsavedDraft();
    updateFavEditBannerStatus();
    applySilentFavoritesDOMUpdate();
    syncHistoryButtons();
    return true;
  }

  function toggleRecommendedSong(aidOrName, songTitle) {
    if (!favQuickEditMode || isSavingFavorites) return false;
    const key = makeSongKey(aidOrName, songTitle);
    if (!key) return false;
    const curTier = recommendedSongMap.get(key) || 0;
    const targetTier = (activeHeartTier === 1 || activeHeartTier === 2 || activeHeartTier === 3) ? activeHeartTier : 3;
    // Requirement: Simple tap/click must NEVER delete a heart!
    if (curTier === targetTier) {
      return false;
    }
    pushEditHistorySnapshot();
    const aidForSong = resolveToAid(aidOrName);
    const prevArtistEffTier = aidForSong ? getArtistHeartTier(aidForSong) : 0;
    recommendedSongMap.delete(key);
    recommendedSongMap.set(key, targetTier);
    if (aidForSong) {
      const nextAutoTier = getAutoArtistHeartTier(aidForSong);
      const curManualTier = recommendedAidMap.get(aidForSong) || 0;
      if (curManualTier > 0 && nextAutoTier > curManualTier) {
        recommendedAidMap.set(aidForSong, nextAutoTier);
      }
      const nextArtistEffTier = getArtistHeartTier(aidForSong);
      if (nextArtistEffTier > 0 && nextArtistEffTier !== prevArtistEffTier) {
        artistTierOrderMap.set(aidForSong, favOrderSeqCounter++);
      }
    }
    saveFavOrderMemory();
    saveUnsavedDraft();
    updateFavEditBannerStatus();
    renderDetailPanel(false);
    applySilentFavoritesDOMUpdate();
    syncHistoryButtons();
    return true;
  }

  function removeRecommendedSong(aidOrName, songTitle) {
    if (!favQuickEditMode || isSavingFavorites) return false;
    const key = makeSongKey(aidOrName, songTitle);
    if (!key || !recommendedSongMap.has(key)) return false;
    pushEditHistorySnapshot();
    recommendedSongMap.delete(key);
    saveFavOrderMemory();
    saveUnsavedDraft();
    updateFavEditBannerStatus();
    renderDetailPanel(false);
    applySilentFavoritesDOMUpdate();
    syncHistoryButtons();
    return true;
  }

  function addCustomSongToArtist(aidOrName, rawSongTitle) {
    if (!favQuickEditMode || isSavingFavorites) return false;
    const aid = resolveToAid(aidOrName);
    if (!aid) return false;
    const artist = AID_TO_ARTIST.get(aid);
    if (!artist) return false;

    let cleanTitle = String(rawSongTitle || "").replace(/[\r\n\t]+/g, " ").trim();
    if (!cleanTitle) return false;
    if (SONG_RENAME_MAP[cleanTitle]) {
      cleanTitle = SONG_RENAME_MAP[cleanTitle];
    }

    // Prevent adding duplicate song (check both exact match and normalized title comparison)
    const normCand = normSongTitleForCompare(cleanTitle);
    const alreadyExists = Array.isArray(artist.songs) && artist.songs.some(existing => {
      return existing === cleanTitle || (normCand && normSongTitleForCompare(existing) === normCand);
    });
    if (alreadyExists) {
      const inp = document.getElementById("editAddSongInput");
      if (inp) {
        inp.value = "";
        inp.focus();
      }
      return false;
    }

    const key = makeSongKey(aid, cleanTitle);
    if (!key) return false;
    pushEditHistorySnapshot();
    customAddedSongSet.add(key);
    syncCustomSongsIntoArchiveData();
    saveUnsavedDraft();
    updateFavEditBannerStatus();
    renderDetailPanel(false);
    applySilentFavoritesDOMUpdate();
    syncHistoryButtons();

    // Keep focus inside input box for effortless consecutive song additions
    const nextInp = document.getElementById("editAddSongInput");
    if (nextInp) {
      nextInp.value = "";
      nextInp.focus();
    }
    return true;
  }

  function removeCustomSongFromArtist(aidOrName, songTitle) {
    if (!favQuickEditMode || isSavingFavorites) return false;
    const key = makeSongKey(aidOrName, songTitle);
    if (!key || !customAddedSongSet.has(key)) return false;
    pushEditHistorySnapshot();
    customAddedSongSet.delete(key);
    recommendedSongMap.delete(key);
    syncCustomSongsIntoArchiveData();
    saveUnsavedDraft();
    updateFavEditBannerStatus();
    renderDetailPanel(false);
    applySilentFavoritesDOMUpdate();
    syncHistoryButtons();
    return true;
  }

  loadRecommendedArtists();

  // Application State
  const state = {
    view: "all",           // "all" | "cat1" | "cat2" | "search" | "recommend"
    recommendTab: "artist", // "artist" | "song"
    recArtistSort: (function() { try { const s = localStorage.getItem("calpis_rec_artist_sort_v1"); if (s === "recCustomOrder" || s === "recFavCountDesc") return s; } catch (_e) {} return "recFavCountDesc"; })(),
    recSongSort: "recCustomOrder",    // "recCustomOrder" (かるが好きな順, default) | "recFavCountDesc" (高評価曲が多い順)
    recFlatMode: false,               // True when "活動形態で分けない" is active in "かるのオススメ"
    searchScope: "all",    // "all" | "cat1" | "cat2"
    searchTarget: "all",   // "all" | "artist" | "song" | "composer" | "group"
    searchComposerSort: "kanaAsc",    // Default "五十音順" for search ("composer") | "countDesc"
    composerExcludeMaxSongs: 0,       // 0 | 2 | 3 | 5 | 10 | 20 (exclude composers with <= N listening songs in "かる専用モード")
    exactArtistSongsAid: "",
    searchArtistSort: "kanaAsc",      // Default "五十音順" for search ("all" & "artist")
    searchSongSort: "kanaAsc",        // Default "五十音順" (by song title) for search ("song") | "alphaAsc" | "sameSongCountDesc"
    sameSongCountMode: false,         // True when "同一曲数順" is active in "楽曲を検索"
    exactCanonicalSongKey: "",        // Non-empty when user clicked a canonical song row in "同一曲数順"
    exactCanonicalSongTitle: "",      // Display title of clicked canonical song row
    searchGroupSort: "groupCountDesc",// Default "登録名義数順" for search ("group")
    searchSortOverride: false,        // True when user manually changes sort dropdown inside Search
    searchQuery: "",
    sortBy: "countDesc",   // "countDesc" | "countAsc" | "favCountDesc" | "kanaAsc" | "alphaAsc" | "subDesc" | "subAsc"
    savedSortBy: "countDesc", // Sort order saved before 50-on or Alphabet filter auto-switches sort
    lastIndexType: "",     // "kana" | "alpha" | "" (tracks which index filter was operated most recently)
    karuSpecialMode: false,// True when owner activates "かる専用モード" via 5 taps on Home button
    meikyokuFilter: [],    // "all" | "3" | "2" | "1" (available in "かる専用モード")
    heartFilter: [],       // "all" | "3" | "2" | "1"
    roles: [],             // Selected activity roles (OR within group)
    subBuckets: [],        // Removed from filter drawer in v26
    agencyGroup: "",       // Selected broad agency/content group
    unitGroup: "",         // Selected standalone unit group (for artists without a broader agencyGroup)
    kanaRows: [],          // Selected 50-on rows e.g. ["あ", "か"] (multi-select supported)
    kanaChar: "",          // Optional sub-character when a single 50-on row is focused
    alphaChars: [],        // Selected alphabet letters e.g. ["A", "B"] (multi-select supported)
    selectedArtistName: null,
    selectedComposerName: null,
    detailMode: "archive", // "archive" (かるが聴いてる曲, default) | "top5" (代表曲 TOP 5)
    songSort: "titleAsc",  // "titleAsc" (default, persisted across artist switches) | "regAsc"
    pcFilterOpen: false,
    mobFilterOpen: false,
    pcFontScale: 100,      // 100 | 125 | 150 | 175
    renderLimit: 100,
    profileBackAvailable: false
  };

  // Undo / Redo History Stacks for in-site navigation
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 60;

  function captureStateSnapshot() {
    return {
      view: state.view,
      recommendTab: state.recommendTab,
      recArtistSort: state.recArtistSort,
      recSongSort: state.recSongSort,
      recFlatMode: Boolean(state.recFlatMode),
      searchScope: state.searchScope,
      searchTarget: state.searchTarget,
      searchArtistSort: state.searchArtistSort,
      searchSongSort: state.searchSongSort,
      sameSongCountMode: Boolean(state.sameSongCountMode),
      exactCanonicalSongKey: state.exactCanonicalSongKey || "",
      exactCanonicalSongTitle: state.exactCanonicalSongTitle || "",
      searchGroupSort: state.searchGroupSort,
      searchSortOverride: state.searchSortOverride,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      savedSortBy: state.savedSortBy,
      lastIndexType: state.lastIndexType,
      meikyokuFilter: [...(state.meikyokuFilter || [])],
      heartFilter: [...(state.heartFilter || [])],
      roles: [...state.roles],
      agencyGroup: state.agencyGroup,
      unitGroup: state.unitGroup,
      kanaRows: [...state.kanaRows],
      kanaChar: state.kanaChar,
      alphaChars: [...state.alphaChars],
      selectedArtistName: state.selectedArtistName,
      selectedComposerName: state.selectedComposerName,
      searchComposerSort: state.searchComposerSort || "kanaAsc",
      composerExcludeMaxSongs: Number(state.composerExcludeMaxSongs || 0),
      exactArtistSongsAid: state.exactArtistSongsAid || "",
      detailMode: state.detailMode,
      songSort: state.songSort,
      profileBackAvailable: state.profileBackAvailable
    };
  }

  function snapshotsEqual(a, b) {
    if (!a || !b) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function pushHistorySnapshot(markProfileJump = false) {
    const snap = captureStateSnapshot();
    if (undoStack.length > 0 && snapshotsEqual(undoStack[undoStack.length - 1], snap)) {
      if (markProfileJump) state.profileBackAvailable = true;
      syncHistoryButtons();
      return;
    }
    undoStack.push(snap);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
    if (markProfileJump) {
      state.profileBackAvailable = true;
    }
    syncHistoryButtons();
  }

  function applyStateSnapshot(snap) {
    if (!snap) return;
    state.view = snap.view;
    state.recommendTab = snap.recommendTab || "artist";
    state.recArtistSort = snap.recArtistSort || "recFavCountDesc";
    state.recSongSort = snap.recSongSort || "recCustomOrder";
    state.recFlatMode = Boolean(snap.recFlatMode);
    state.searchScope = snap.searchScope;
    state.searchTarget = snap.searchTarget || "all";
    state.searchArtistSort = snap.searchArtistSort || "kanaAsc";
    state.searchSongSort = snap.searchSongSort || "kanaAsc";
    state.sameSongCountMode = Boolean(snap.sameSongCountMode);
    state.exactCanonicalSongKey = snap.exactCanonicalSongKey || "";
    state.exactCanonicalSongTitle = snap.exactCanonicalSongTitle || "";
    state.searchGroupSort = snap.searchGroupSort || "groupCountDesc";
    state.searchSortOverride = Boolean(snap.searchSortOverride);
    state.searchQuery = snap.searchQuery;
    state.sortBy = snap.sortBy;
    state.savedSortBy = snap.savedSortBy;
    state.lastIndexType = snap.lastIndexType;
    state.meikyokuFilter = [...(snap.meikyokuFilter || [])];
    state.heartFilter = [...(snap.heartFilter || [])];
    state.roles = [...(snap.roles || [])];
    state.agencyGroup = snap.agencyGroup || "";
    state.unitGroup = snap.unitGroup || "";
    state.kanaRows = [...(snap.kanaRows || [])];
    state.kanaChar = snap.kanaChar || "";
    state.alphaChars = [...(snap.alphaChars || [])];
    state.selectedArtistName = snap.selectedArtistName || null;
    state.selectedComposerName = snap.selectedComposerName || null;
    state.searchComposerSort = snap.searchComposerSort || "kanaAsc";
    state.composerExcludeMaxSongs = Number(snap.composerExcludeMaxSongs || 0);
    state.exactArtistSongsAid = snap.exactArtistSongsAid || "";
    state.detailMode = snap.detailMode || "archive";
    state.songSort = snap.songSort || "titleAsc";
    // Never open the filter drawer on Undo or Redo
    state.pcFilterOpen = false;
    state.mobFilterOpen = false;
    state.profileBackAvailable = Boolean(snap.profileBackAvailable);

    const mobSheet = document.getElementById("mobFilterSheet");
    const backdrop = document.getElementById("sheetBackdrop");
    if (mobSheet) mobSheet.classList.remove("open");
    if (backdrop) {
      const showBd = (window.innerWidth <= 900 && Boolean(state.selectedArtistName));
      backdrop.classList.toggle("visible", showBd);
    }

    const searchInput = document.getElementById("mainSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (searchInput) searchInput.value = state.searchQuery;
    if (clearSearchBtn) clearSearchBtn.style.display = state.searchQuery ? "flex" : "none";
    document.querySelectorAll("[data-search-scope]").forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-search-scope") === state.searchScope);
    });
    syncSearchTargetUI();
  }

  function syncHistoryButtons() {
    const isFilterDrawerOpen = Boolean(state.pcFilterOpen || state.mobFilterOpen);
    const hasEditUndo = favQuickEditMode && editUndoStack.length > 0;
    const hasEditRedo = favQuickEditMode && editRedoStack.length > 0;
    const canUndo = hasEditUndo || isFilterDrawerOpen || undoStack.length > 0;
    const canRedo = hasEditRedo || redoStack.length > 0;
    document.querySelectorAll('[data-history-action="undo"]').forEach(btn => {
      btn.disabled = !canUndo;
    });
    document.querySelectorAll('[data-history-action="redo"]').forEach(btn => {
      btn.disabled = !canRedo;
    });
    const detailBackBtn = document.getElementById("detailBackBtn");
    if (detailBackBtn) {
      const showProfileBack = hasEditUndo || ((undoStack.length > 0) && (state.profileBackAvailable || Boolean(state.agencyGroup) || undoStack.length > 0));
      detailBackBtn.style.display = showProfileBack ? "inline-flex" : "none";
    }
  }

  function undoStateAction() {
    // In Edit Mode, if there are edit operations on editUndoStack, undo the last edit operation first!
    if (favQuickEditMode && editUndoStack.length > 0) {
      const currentEditSnap = captureEditSnapshot();
      editRedoStack.push(currentEditSnap);
      const prevEditSnap = editUndoStack.pop();
      manualReorderCount = prevEditSnap.manualReorderCount || 0;
      setAllSharedStates(prevEditSnap.ids, prevEditSnap.songFavs, prevEditSnap.customSongs);
      saveFavOrderMemory();
      saveUnsavedDraft();
      updateFavEditBannerStatus();
      renderDetailPanel(false);
      applySilentFavoritesDOMUpdate();
      syncHistoryButtons();
      return;
    }
    // Requirement: If filter drawer is currently open, pressing Undo first closes the filter drawer
    // (keeping current filters intact); subsequent Undo presses remove filters one by one while staying closed.
    if (state.pcFilterOpen || state.mobFilterOpen) {
      state.pcFilterOpen = false;
      state.mobFilterOpen = false;
      const mobSheet = document.getElementById("mobFilterSheet");
      const backdrop = document.getElementById("sheetBackdrop");
      if (mobSheet) mobSheet.classList.remove("open");
      if (backdrop && (!state.selectedArtistName || window.innerWidth > 900)) {
        backdrop.classList.remove("visible");
      }
      syncMobileScrollLock();
      updateUI(false);
      syncHistoryButtons();
      return;
    }
    if (undoStack.length === 0) return;
    const currentSnap = captureStateSnapshot();
    redoStack.push(currentSnap);
    const prevSnap = undoStack.pop();
    applyStateSnapshot(prevSnap);
    updateUI(false);
    renderDetailPanel(true);
    syncHistoryButtons();
  }

  function redoStateAction() {
    // In Edit Mode, if there are undone edit operations on editRedoStack, redo them first!
    if (favQuickEditMode && editRedoStack.length > 0) {
      const currentEditSnap = captureEditSnapshot();
      editUndoStack.push(currentEditSnap);
      const nextEditSnap = editRedoStack.pop();
      manualReorderCount = nextEditSnap.manualReorderCount || 0;
      setAllSharedStates(nextEditSnap.ids, nextEditSnap.songFavs, nextEditSnap.customSongs);
      saveFavOrderMemory();
      saveUnsavedDraft();
      updateFavEditBannerStatus();
      renderDetailPanel(false);
      applySilentFavoritesDOMUpdate();
      syncHistoryButtons();
      return;
    }
    if (redoStack.length === 0) return;
    // Requirement: Redo re-applies selections without opening the filter drawer
    state.pcFilterOpen = false;
    state.mobFilterOpen = false;
    const currentSnap = captureStateSnapshot();
    undoStack.push(currentSnap);
    const nextSnap = redoStack.pop();
    applyStateSnapshot(nextSnap);
    updateUI(false);
    renderDetailPanel(true);
    syncHistoryButtons();
  }

  // KANA ROWS mapping for sub-character selection
  const KANA_ROW_CHARS = {
    "あ": ["あ", "い", "う", "え", "お"],
    "か": ["か", "き", "く", "け", "こ"],
    "さ": ["さ", "し", "す", "せ", "そ"],
    "た": ["た", "ち", "つ", "て", "と"],
    "な": ["な", "に", "ぬ", "ね", "の"],
    "は": ["は", "ひ", "ふ", "へ", "ほ"],
    "ま": ["ま", "み", "む", "め", "も"],
    "や": ["や", "ゆ", "よ"],
    "ら": ["ら", "り", "る", "れ", "ろ"],
    "わ": ["わ", "を", "ん"]
  };

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Natural Collators for Japanese & English
  const jaCollator = new Intl.Collator("ja", { numeric: true, sensitivity: "base" });
  const enCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

  // Format numbers with commas
  const fmtNum = n => new Intl.NumberFormat("ja-JP").format(n);

  // Escape HTML
  function esc(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  // PC Font Size Scaling (Strictly PC-only; 4 steps: 100%, 125%, 150%, 175%; auto-corrects 200 -> 175)
  function loadSavedFontScale() {
    try {
      const raw = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      if (raw !== null) {
        const saved = parseInt(raw, 10);
        if (saved >= 200) {
          state.pcFontScale = 175;
          localStorage.setItem(FONT_SCALE_STORAGE_KEY, "175");
        } else if (VALID_FONT_SCALES.includes(saved)) {
          state.pcFontScale = saved;
        }
      }
    } catch (e) {}
  }

  function applyPcFontScale(pct, persist = true) {
    let normalized = Number(pct);
    if (normalized >= 200) normalized = 175;
    if (!VALID_FONT_SCALES.includes(normalized)) normalized = 100;
    state.pcFontScale = normalized;
    if (persist) {
      try {
        localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(normalized));
      } catch (e) {}
    }
    const isMobile = window.innerWidth <= 900;
    const scaleFactor = isMobile ? 1 : (normalized / 100);
    document.documentElement.style.setProperty("--pc-font-scale", String(scaleFactor));

    const valEl = document.getElementById("pcFontScaleVal");
    if (valEl) valEl.textContent = `${normalized}%`;

    const sliderEl = document.getElementById("pcFontScaleSlider");
    if (sliderEl) {
      sliderEl.value = String(normalized);
      sliderEl.setAttribute("aria-valuenow", String(normalized));
    }

    document.querySelectorAll("[data-font-scale]").forEach(btn => {
      const btnVal = parseInt(btn.getAttribute("data-font-scale"), 10);
      btn.classList.toggle("active", btnVal === normalized);
    });
  }

  // Normalize query for search (absorbs full/half width, case, and converts katakana to hiragana)
  function normSearch(str) {
    const s = String(str ?? "").normalize("NFKC").toLowerCase().trim();
    let res = "";
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      if (code >= 0x30a1 && code <= 0x30f6) {
        res += String.fromCharCode(code - 0x60);
      } else {
        res += s[i];
      }
    }
    return res;
  }

  function stripSpaces(str) {
    return String(str ?? "").replace(/[\s\-_・.／/()（）【】「」『』]+/g, "");
  }

  // Hiragana to Romaji (Hepburn & Kunrei) generator for confirmed reading strings
  const HIRA_ROMAJI_MAP = {
    "きゃ":["kya"],"きゅ":["kyu"],"きょ":["kyo"],
    "しゃ":["sha","sya"],"しゅ":["shu","syu"],"しょ":["sho","syo"],
    "ちゃ":["cha","tya"],"ちゅ":["chu","tyu"],"ちょ":["cho","tyo"],
    "にゃ":["nya"],"にゅ":["nyu"],"にょ":["nyo"],
    "ひゃ":["hya"],"ひゅ":["hyu"],"ひょ":["hyo"],
    "みゃ":["mya"],"みゅ":["myu"],"みょ":["myo"],
    "りゃ":["rya"],"りゅ":["ryu"],"りょ":["ryo"],
    "ぎゃ":["gya"],"ぎゅ":["gyu"],"ぎょ":["gyo"],
    "じゃ":["ja","jya","zya"],"じゅ":["ju","jyu","zyu"],"じょ":["jo","jyo","zyo"],
    "びゃ":["bya"],"びゅ":["byu"],"びょ":["byo"],
    "ぴゃ":["pya"],"ぴゅ":["pyu"],"ぴょ":["pyo"],
    "ふぁ":["fa"],"ふぃ":["fi"],"ふぇ":["fe"],"ふぉ":["fo"],
    "てぃ":["ti"],"でぃ":["di"],"うぃ":["wi"],"うぇ":["we"],"うぉ":["wo"],
    "ゔぁ":["va"],"ゔぃ":["vi"],"ゔ":["vu"],"ゔぇ":["ve"],"ゔぉ":["vo"],
    "あ":["a"],"い":["i"],"う":["u"],"え":["e"],"お":["o"],
    "か":["ka"],"き":["ki"],"く":["ku"],"け":["ke"],"こ":["ko"],
    "さ":["sa"],"し":["shi","si"],"す":["su"],"せ":["se"],"そ":["so"],
    "た":["ta"],"ち":["chi","ti"],"つ":["tsu","tu"],"て":["te"],"と":["to"],
    "な":["na"],"に":["ni"],"ぬ":["nu"],"ね":["ne"],"の":["no"],
    "は":["ha"],"ひ":["hi"],"ふ":["fu","hu"],"へ":["he"],"ほ":["ho"],
    "ま":["ma"],"み":["mi"],"む":["mu"],"め":["め"],"も":["mo"],
    "や":["ya"],"ゆ":["yu"],"よ":["yo"],
    "ら":["ra"],"り":["ri"],"る":["ru"],"れ":["re"],"ろ":["ro"],
    "わ":["wa"],"ゐ":["wi"],"ゑ":["we"],"を":["o","wo"],"ん":["n"],
    "が":["ga"],"ぎ":["gi"],"ぐ":["gu"],"げ":["ge"],"ご":["go"],
    "ざ":["za"],"じ":["ji","zi"],"ず":["zu"],"ぜ":["ze"],"ぞ":["zo"],
    "だ":["da"],"ぢ":["ji","di"],"づ":["zu","du"],"で":["de"],"ど":["do"],
    "ば":["ba"],"び":["bi"],"ぶ":["bu"],"べ":["be"],"ぼ":["bo"],
    "ぱ":["pa"],"ぴ":["pi"],"ぷ":["pu"],"ぺ":["pe"],"ぽ":["po"],
    "ぁ":["a"],"ぃ":["i"],"ぅ":["u"],"ぇ":["e"],"ぉ":["o"],
    "ゃ":["ya"],"ゅ":["yu"],"ょ":["yo"],"ゎ":["wa"]
  };
  HIRA_ROMAJI_MAP["め"] = ["me"];

  function hiraToRomajiPair(hira) {
    if (!hira) return [];
    let hep = "";
    let kun = "";
    let i = 0;
    const n = hira.length;
    while (i < n) {
      if (hira[i] === "っ") {
        let nextSyl = "";
        if (i + 2 < n && HIRA_ROMAJI_MAP[hira.slice(i + 1, i + 3)]) {
          nextSyl = HIRA_ROMAJI_MAP[hira.slice(i + 1, i + 3)][0];
        } else if (i + 1 < n && HIRA_ROMAJI_MAP[hira[i + 1]]) {
          nextSyl = HIRA_ROMAJI_MAP[hira[i + 1]][0];
        }
        if (nextSyl) {
          hep += nextSyl[0];
          kun += nextSyl[0];
        }
        i++;
        continue;
      }
      if (hira[i] === "ー") {
        i++;
        continue;
      }
      if (i + 1 < n && HIRA_ROMAJI_MAP[hira.slice(i, i + 2)]) {
        const opts = HIRA_ROMAJI_MAP[hira.slice(i, i + 2)];
        hep += opts[0];
        kun += opts[opts.length > 1 ? 1 : 0];
        i += 2;
        continue;
      }
      if (HIRA_ROMAJI_MAP[hira[i]]) {
        const opts = HIRA_ROMAJI_MAP[hira[i]];
        hep += opts[0];
        kun += opts[opts.length > 1 ? 1 : 0];
        i++;
        continue;
      }
      hep += hira[i];
      kun += hira[i];
      i++;
    }
    return hep === kun ? [hep] : [hep, kun];
  }

  // Extract confirmed hiragana reading key for 50-on sort (returns "" if reading is not verified kana)
  function extractConfirmedKanaKey(a) {
    const r = normSearch(a.reading || "");
    if (r && /^[ぁ-んー・\s]+$/.test(r)) {
      return r.replace(/[^ぁ-んー]/g, "");
    }
    const als = Array.isArray(a.al) ? a.al : [];
    for (let i = 0; i < als.length; i++) {
      const na = normSearch(als[i]);
      if (na && /^[ぁ-んー・\s]+$/.test(na)) {
        return na.replace(/[^ぁ-んー]/g, "");
      }
    }
    if (a.row && r) {
      const onlyKana = r.replace(/[^ぁ-んー]/g, "");
      if (onlyKana) return onlyKana;
    }
    return "";
  }

  // Extract normalized alphabet key for Alphabet sort
  function extractAlphaKey(a) {
    const cleanName = String(a.name || "")
      .normalize("NFKC")
      .replace(/^[\(\[（【「『《\-＋+#♯♪★☆\s]+/, "")
      .trim();
    if (/^[A-Za-z]/.test(cleanName)) {
      return cleanName.toLowerCase();
    }
    const als = Array.isArray(a.al) ? a.al : [];
    for (let i = 0; i < als.length; i++) {
      const cand = String(als[i] || "").normalize("NFKC").trim();
      if (/^[A-Za-z]/.test(cand)) {
        return cand.toLowerCase();
      }
    }
    return cleanName.toLowerCase();
  }

  // Precompute normalized search tokens & sort keys for artists & songs
  DATA.forEach((a, idx) => {
    a._id = idx;
    a._normName = normSearch(a.name);
    a._normNameNoSpace = stripSpaces(a._normName);
    a._normReading = normSearch(a.reading || "");
    a._normReadingNoSpace = stripSpaces(a._normReading);
    a._kanaSortKey = extractConfirmedKanaKey(a);
    a._alphaSortKey = extractAlphaKey(a);
    a._hasAlphaPrefix = Boolean(a.alpha) || /^[a-z]/i.test(a._alphaSortKey);

    const romajiFromReading = hiraToRomajiPair(a._normReading);
    const rawAliases = Array.isArray(a.al) ? a.al : [];
    const tokenSet = new Set();
    const noSpaceSet = new Set();

    [...rawAliases, ...romajiFromReading].forEach(tok => {
      const nt = normSearch(tok);
      if (nt) {
        tokenSet.add(nt);
        const ns = stripSpaces(nt);
        if (ns) noSpaceSet.add(ns);
      }
    });

    a._normAliases = Array.from(tokenSet);
    a._normAliasesNoSpace = Array.from(noSpaceSet);
    a._normSongs = (a.songs || []).map(s => normSearch(s));
    a._normSongsNoSpace = a._normSongs.map(s => stripSpaces(s));
    a._normSongAliases = (a.songs || []).map(s => (SONG_SEARCH_ALIASES_BY_NEW_TITLE[s] || []).map(al => normSearch(al)));
    a._normSongAliasesNoSpace = a._normSongAliases.map(arr => arr.map(al => stripSpaces(al)));
    a._normTopSongs = (a.topSongs || []).map(s => normSearch(s));
    a._normTopSongAliases = (a.topSongs || []).map(s => (SONG_SEARCH_ALIASES_BY_NEW_TITLE[s] || []).map(al => normSearch(al)));
    a._normTopSongAliasesNoSpace = a._normTopSongAliases.map(arr => arr.map(al => stripSpaces(al)));
  });

  // =========================================================================
  // V66: CANONICAL SONG TITLE GROUPING & FULL SEARCHABLE SONG POOL
  // =========================================================================
  const SPACE_PREFIX_DO_NOT_MERGE_KEYS = new Set([
    "ハピネス オブ ザ デッド",
    "かたち あるもの",
    "ずっと chamjam"
  ]);

  function step1CleanSongTitle(rawTitle) {
    let s = String(rawTitle || "").trim();
    // Strip leading broken bracket prefix like "女性VTuberが歌う】" or "歌ってみた 】"
    s = s.replace(/^[^【\[]*】\s*/, "");
    // Strip trailing 【...】 or space-preceded [...]
    s = s.replace(/\s*【.*$/, "");
    s = s.replace(/\s+\[.*$/, "");
    s = s.replace(/\[(?:試唱|Full|reunion|Orchestra[^\]]*|Flipbook[^\]]*|이터널[^\]]*|봉누도[^\]]*).*$/i, "");
    // Strip trailing (...) or （...） (e.g., アイデンティティ(아이덴티티), アイドル (月夜野兎姫 CV.萌花ちょこ), ロキ(Cover))
    s = s.replace(/\s*[\(（].*$/, "");
    // Strip trailing feat./ver./cover/MV/歌ってみた annotations
    s = s.replace(/\s+(?:feat\.|ft\.|cv\.|ver\.|version\b|cover\b|acoustic\b|piano\b|mv\b|カバー|歌ってみた|踊ってみた|歌って踊ってみた).*$/i, "");
    // Strip trailing " - ..." or " / ..."
    s = s.replace(/\s+[-－―—‐–/／].*$/, "");
    s = s.replace(/\s+~.*~$/, "");
    return s.trim() || String(rawTitle || "").trim();
  }

  function normCanonicalKeyStr(s) {
    return String(s || "")
      .normalize("NFKC")
      .replace(/[\s\u3000]+/g, " ")
      .trim()
      .toLowerCase();
  }

  const BASE_SONG_KEY_TO_DISPLAY = new Map();
  let countSongsTotal = 0;
  let countSongsCat1 = 0;
  let countSongsCat2 = 0;

  function getCanonicalSongTitleAndKey(rawTitle) {
    const c1 = step1CleanSongTitle(rawTitle);
    const k1 = normCanonicalKeyStr(c1);
    if (!SPACE_PREFIX_DO_NOT_MERGE_KEYS.has(k1) && c1.includes(" ")) {
      const firstPart = c1.split(" ")[0].trim();
      const fk = normCanonicalKeyStr(firstPart);
      if (BASE_SONG_KEY_TO_DISPLAY.has(fk) && fk.length >= 2 && !/^[a-z0-9]+$/.test(fk)) {
        return {
          displayTitle: BASE_SONG_KEY_TO_DISPLAY.get(fk),
          canonicalKey: fk
        };
      }
    }
    return {
      displayTitle: BASE_SONG_KEY_TO_DISPLAY.get(k1) || c1,
      canonicalKey: k1
    };
  }

  function rebuildAllArtistSongSearchCaches() {
    BASE_SONG_KEY_TO_DISPLAY.clear();
    const dispFreqByKey = new Map();

    DATA.forEach(a => {
      if (!a) return;
      const allRaw = [...(a.songs || []), ...(a.topSongs || [])];
      allRaw.forEach(s => {
        if (!s) return;
        const c1 = step1CleanSongTitle(s);
        const k1 = normCanonicalKeyStr(c1);
        if (!k1) return;
        if (!dispFreqByKey.has(k1)) dispFreqByKey.set(k1, new Map());
        const fm = dispFreqByKey.get(k1);
        fm.set(c1, (fm.get(c1) || 0) + 1);
      });
    });

    dispFreqByKey.forEach((fm, k1) => {
      let bestDisp = "";
      let bestCnt = -1;
      fm.forEach((cnt, disp) => {
        if (cnt > bestCnt || (cnt === bestCnt && disp.length < bestDisp.length)) {
          bestCnt = cnt;
          bestDisp = disp;
        }
      });
      if (bestDisp) BASE_SONG_KEY_TO_DISPLAY.set(k1, bestDisp);
    });

    let totalAll = 0;
    let totalC1 = 0;
    let totalC2 = 0;

    DATA.forEach(a => {
      if (!a) return;
      const seenNorm = new Set();
      const seenCanonical = new Set();
      const searchable = [];
      const pushSongObj = (rawSong, isTopSong) => {
        if (!rawSong) return;
        const nCmp = normSongTitleForCompare(rawSong);
        if (!nCmp || seenNorm.has(nCmp)) return;
        const canInfo = getCanonicalSongTitleAndKey(rawSong);
        if (isTopSong && canInfo.canonicalKey && seenCanonical.has(canInfo.canonicalKey)) return;
        seenNorm.add(nCmp);
        if (canInfo.canonicalKey) seenCanonical.add(canInfo.canonicalKey);
        const ns = normSearch(rawSong);
        const nsNoSpace = stripSpaces(ns);
        const alArr = (SONG_SEARCH_ALIASES_BY_NEW_TITLE[rawSong] || []).map(al => normSearch(al));
        const alNoSpaceArr = alArr.map(al => stripSpaces(al));
        const normCan = normSearch(canInfo.displayTitle);
        const normCanNoSpace = stripSpaces(normCan);
        searchable.push({
          title: rawSong,
          isTopSong: Boolean(isTopSong),
          norm: ns,
          normNoSpace: nsNoSpace,
          aliases: alArr,
          aliasesNoSpace: alNoSpaceArr,
          canonicalTitle: canInfo.displayTitle,
          canonicalKey: canInfo.canonicalKey,
          normCanonical: normCan,
          normCanonicalNoSpace: normCanNoSpace
        });
      };
      (a.songs || []).forEach(s => pushSongObj(s, false));
      (a.topSongs || []).forEach(s => pushSongObj(s, true));
      a._searchableSongs = searchable;
      totalAll += searchable.length;
      if (a.cat === 1) totalC1 += searchable.length;
      else totalC2 += searchable.length;
    });

    countSongsTotal = totalAll;
    countSongsCat1 = totalC1;
    countSongsCat2 = totalC2;
  }

  rebuildAllArtistSongSearchCaches();

  // Fast Map from artist name to artist object
  const ARTIST_MAP = new Map();
  DATA.forEach(a => ARTIST_MAP.set(a.name, a));

  // =========================================================================
  // V69: かる専用モード & 「銘曲」(☆3段階) カタログ・判定・追加ロジック
  // =========================================================================
  const MEIKYOKU_RAW_CATALOG = [["a_4d4111fd", "AZKi", "from A to Z", 3, "AZKiの名前の由来（AからZまで）を冠した象徴曲"], ["a_4d4111fd", "AZKi", "Operation Z", 1, "AZKiの「Z」を冠した楽曲"], ["a_90992207", "星街すいせい", "スイちゃんのメンテナンスソング", 2, "愛称「スイちゃん」を冠した定番曲"], ["a_90992207", "星街すいせい", "天球、彗星は夜を跨いで （Still Still Stellar ver.）", 3, "「すいせい＝彗星」を冠した初期代表曲"], ["a_90992207", "星街すいせい", "彗星", 2, "「すいせい＝彗星」そのもののタイトル曲"], ["a_90992207", "星街すいせい", "comet", 2, "「すいせい＝comet（彗星）」を冠した1stオリジナル曲"], ["a_90992207", "星街すいせい", "Stellar Stellar", 1, "「星街」の星（Stellar）を重ねた代表曲"], ["a_b5ac7fba", "明透", "Aster", 2, "「明透（あす）」の音と響きを重ねた楽曲"], ["a_d0dde61f", "幸祜", "此処へ", 3, "「幸祜（ここ）」の読み「ここ＝此処」をもじった楽曲"], ["a_aca476b9", "ワルキューレ", "Walkure Attack!", 3, "ユニット名「ワルキューレ（Walküre）」を冠した代表曲"], ["a_aca476b9", "ワルキューレ", "ワルキューレのバースデイソング", 3, "ユニット名「ワルキューレ」を冠した楽曲"], ["a_aca476b9", "ワルキューレ", "ようこそ! ワルキューレ・ワールドへ", 3, "ユニット名「ワルキューレ」を冠した楽曲"], ["a_aca476b9", "ワルキューレ", "ワルキューレがとまらない", 3, "ユニット名「ワルキューレ」を冠した楽曲"], ["a_aca476b9", "ワルキューレ", "ワルキューレは裏切らない", 3, "ユニット名「ワルキューレ」を冠した楽曲"], ["a_aca476b9", "ワルキューレ", "ワルキューレはあきらめない", 3, "ユニット名「ワルキューレ」を冠した楽曲"], ["a_eedab311", "MyGO!!!!!", "迷星叫", 2, "「MyGO!!!!!（迷子）」の「迷」を冠した1stシングル表題曲"], ["a_eedab311", "MyGO!!!!!", "迷路日々", 2, "「MyGO!!!!!（迷子）」の「迷」を冠した楽曲"], ["a_36e3f97b", "角巻わため", "WataMeister", 2, "「わため（Watame）」＋マイスターの造語タイトル"], ["a_36e3f97b", "角巻わため", "わための子守唄", 2, "自身の名前「わため」を冠した初期代表曲"], ["a_a19dc12d", "ときのそら", "そらのとき", 3, "「ときのそら」を逆さにした記念楽曲"], ["a_a19dc12d", "ときのそら", "決意のソラへ", 2, "自身の名前「そら（ソラ）」を織り込んだ楽曲"], ["a_a19dc12d", "ときのそら", "空ノ空", 2, "自身の名前「そら（空）」を重ねた楽曲"], ["a_a19dc12d", "ときのそら", "ケ・セラ・ソラ！", 2, "ケ・セラ・セラと「ソラ」をもじった楽曲"], ["a_a19dc12d", "ときのそら", "ポラリスソラリス", 2, "「ソラ」を織り込んだタイトル曲"], ["a_8b347a8f", "Ave Mujica", "天球(そら)のMúsica", 2, "バンド名「Mujica（Música）」を冠した象徴曲"], ["a_8b347a8f", "Ave Mujica", "Ave Mujica", 3, "バンド名をそのまま冠したセルフタイトル代表曲"], ["a_33bb0812", "大神ミオ", "Howling", 1, "「大神（狼＝オオカミ）」の遠吠え（Howling）を象徴する1stオリジナル曲"], ["a_33bb0812", "大神ミオ", "狼煙", 1, "「大神（狼）」の字を冠した楽曲"], ["a_57bfdcbe", "三月のパンタシア", "三月がずっと続けばいい", 2, "ユニット名「三月」を冠した代表曲"], ["a_57bfdcbe", "三月のパンタシア", "March", 2, "「三月＝March」を冠した楽曲"], ["a_46e4d26b", "音ノ乃のの", "ののの音々ネ！", 3, "「音ノ乃のの」の名前と「音」をもじった自己紹介的楽曲"], ["a_9fa6b1ed", "HACHI", "√64", 3, "√64＝8（ハチ＝HACHI）のひねった数式ネーミング曲"], ["a_9fa6b1ed", "HACHI", "八月の蛍", 2, "「HACHI＝八」を冠した代表曲"], ["a_9fa6b1ed", "HACHI", "HONEY BEES", 3, "HACHI→蜂→HONEY BEES（ファンネーム）を冠した象徴曲"], ["a_7fabb917", "樋口楓", "MapleStep", 2, "「楓＝Maple（メイプル）」を冠した楽曲"], ["a_07a34d60", "MaiR", "AIR", 2, "「MaiR」の名前の核である「AIR」を冠した楽曲"], ["a_13ae23b0", "七海うらら", "それはうららか？", 3, "自身の名前「うらら」と「うららか」を掛けた楽曲"], ["a_13ae23b0", "七海うらら", "Seventh Heaven", 2, "「七海」の「七＝Seventh」を冠したデビュー象徴曲"], ["a_6765a58f", "猫 The Sappiness", "猫のみぞ知る", 2, "ユニット名の「猫」を冠した楽曲"], ["a_6765a58f", "猫 The Sappiness", "猫猫的宇宙論", 2, "ユニット名の「猫」を冠した楽曲"], ["a_ed64487b", "宵-Yoi", "宵月", 2, "自身の名義「宵」を冠した楽曲"], ["a_da53af28", "藍月なくる", "Azura Luno", 3, "エスペラント語で「青い月＝藍月」を意味するタイトル曲"], ["a_5cf40b70", "アキ・ローゼンタール", "ROSE of the LAMP", 2, "「ローゼンタール（薔薇＝ROSE）」を冠した楽曲"], ["a_5cf40b70", "アキ・ローゼンタール", "異薔薇", 2, "「ローゼンタール（薔薇）」と「茨（いばら）」をもじった楽曲"], ["a_1bc12d55", "柊優花", "Holly", 2, "英語で「柊＝Holly」を意味するタイトル曲"], ["a_3640e084", "VESPERBELL", "Bell Ringer", 2, "ユニット名「VESPERBELL」の「BELL」を冠した楽曲"], ["a_d7f1147f", "緑仙", "エヴァーグリーン", 2, "「緑仙」の「緑＝グリーン」を冠した楽曲"], ["a_d7f1147f", "緑仙", "Welcome☆Greeny night", 2, "「緑仙」の「緑＝Greeny」を冠した楽曲"], ["a_91cb75ec", "癒月ちょこ", "ChocoLove", 2, "自身の名前「ちょこ（Choco）」を冠した1stオリジナル曲"], ["a_72a655de", "Roselia", "R", 1, "バンド名「Roselia」の頭文字「R」を冠したアンセム曲"], ["a_8fbb546f", "桃鈴ねね", "ももいろの砂時計", 1, "「桃鈴」の「桃（ももいろ）」を冠した楽曲"], ["a_8fbb546f", "桃鈴ねね", "モモノネ", 3, "「桃鈴ねね」の「桃（モモ）＋音（ネ）」をもじった1stアルバム表題曲"], ["a_8fbb546f", "桃鈴ねね", "ねねちのギラギラファンミーティング", 2, "愛称「ねねち」を冠した代表曲"], ["a_8fbb546f", "桃鈴ねね", "ねねねねねねねね！大爆走", 2, "自身の名前「ねね」を連呼した1stオリジナル代表曲"], ["a_8a241491", "花譜", "花十カクメイ前日譚", 2, "自身の名前「花譜」の「花」を冠した楽曲"], ["a_8a241491", "花譜", "花女", 2, "自身の名前「花譜」の「花」を冠した自伝的楽曲"], ["a_466fc1ef", "理芽", "kotowari", 2, "「理芽」の「理＝ことわり（kotowari）」をもじった楽曲"], ["a_fddf1df7", "TRUE", "10周年記念楽曲「TRUE」", 3, "アーティスト名「TRUE」をそのまま冠した10周年象徴曲"], ["a_2e7b2fee", "夢限大みゅーたいぷ", "みゅーたんとミュータント", 2, "ユニット略称「みゅーたいぷ／みゅーたん」をもじった楽曲"], ["a_2e7b2fee", "夢限大みゅーたいぷ", "アイの夢限", 2, "ユニット名「夢限大」の「夢限」を冠した楽曲"], ["a_2e7b2fee", "夢限大みゅーたいぷ", "夢現妄想世界", 2, "「夢限」と「夢現」を掛けたデビュー曲"], ["a_6f1479fd", "赤井はあと", "RED HEART (Remastered)", 3, "「赤井＝RED」「はあと＝HEART」を直訳した1stオリジナル代表曲"], ["a_3538e6d4", "大空スバル", "ぷ・れ・あ・で・す！", 2, "「スバル（昴）＝プレアデス星団」をもじった楽曲"], ["a_bee65f2a", "サニーピース", "EVERYDAY! SUNNYDAY!", 2, "ユニット名「サニーピース」の「SUNNY」を冠した楽曲"], ["a_bee65f2a", "サニーピース", "SUNNY PEACE for You and Me！", 3, "ユニット名「SUNNY PEACE」をそのまま冠した代表曲"], ["a_bee65f2a", "サニーピース", "SUNNY PEACE HARMONY", 3, "ユニット名「SUNNY PEACE」を冠した楽曲"], ["a_5d92f0b0", "猫又おかゆ", "ネコカブリーナ", 2, "「猫又」の「ネコ」を冠した代表曲"], ["a_5d92f0b0", "猫又おかゆ", "デタバレネコ", 2, "「猫又」の「ネコ」を冠した楽曲"], ["a_5d92f0b0", "猫又おかゆ", "カミサマ・ネコサマ", 2, "「猫又」の「ネコ」を冠した代表曲"], ["a_8a6dabbf", "深影", "DEEP SHADOW", 3, "「深影＝DEEP SHADOW」を英語にした象徴曲"], ["a_8a6dabbf", "深影", "透影", 2, "「深影」の「影」を対比させたタイトル曲"], ["a_2ce39887", "むﾄ", "無知", 1, "「むﾄ」の「む＝無」を冠した1stオリジナル曲"], ["a_3bc2268b", "ASCA", "明日世界が終わるとしても", 1, "「ASCA（あすか＝明日歌）」の頭文字「明日」を冠した代表曲"], ["a_3bc2268b", "ASCA", "雲雀", 1, "「ASCA（飛鳥）」の鳥モチーフを象徴する代表曲"], ["a_56909d9f", "月乃", "つきのうた（It's my song, It's your song）", 3, "「月乃（つきの）」＋「うた（月の歌）」を掛けた象徴曲"], ["a_d5812f2c", "百鬼あやめ", "宵の余、良い！", 1, "百鬼あやめの一人称「余（よ）」をもじった代表曲"], ["a_4deb53fd", "ベイビーレイズJAPAN", "ベイビーステップ", 2, "グループ名「ベイビーレイズ」の「ベイビー」を冠した楽曲"], ["a_19819bed", "ヨノ", "You're Notes", 3, "「ヨノ（Yo-No）」の音と「You're Notes」をもじった楽曲"], ["a_284aa2ca", "wouca", "音を浮かべて", 3, "「音を浮か（おとをうか）＝wouca（をうか）」の名前の由来そのものの楽曲"], ["a_9a25fe7d", "Cheeky Parade", "C.P.U !?", 2, "グループ名「Cheeky Parade」の頭文字「C.P.」をもじった代表曲"], ["a_e87df19d", "DIALOGUE+", "ダイアローグ+インビテーション!", 3, "ユニット名「DIALOGUE+（ダイアローグ＋）」を冠した自己紹介曲"], ["a_318e9245", "nano.RIPE", "なないろびより", 1, "バンド名「nano（なの／なな）」の響きを重ねた代表曲"], ["a_041bf59a", "結束バンド", "UNITE", 2, "「結束＝UNITE」を意味する楽曲"], ["a_041bf59a", "結束バンド", "夢を束ねて", 2, "「結束バンド」の「束ねる」を織り込んだ楽曲"], ["a_041bf59a", "結束バンド", "あのバンド", 2, "「結束バンド」自身を指す代名詞的ナンバー"], ["a_2e788591", "兎田ぺこら", "兎座ストーリー", 2, "「兎田ぺこら」の「兎」を冠した楽曲"], ["a_2e788591", "兎田ぺこら", "ぺこらんだむぶれいん!", 2, "自身の名前「ぺこら」＋ランダムを掛けた1stオリジナル曲"], ["a_2e788591", "兎田ぺこら", "いいわけバニー", 1, "「兎田（バニー）」を冠した代表曲"], ["a_2e788591", "兎田ぺこら", "全人類 兎化計画!", 2, "「兎田」の「兎化」を冠した周年記念曲"], ["a_0ca6e225", "ウタヒメドリーム", "ウタヒメドリーム", 3, "プロジェクト・ユニット名をそのまま冠したテーマ曲"], ["a_3d1dc7ed", "焔魔るり", "その刹那、焔につき。", 2, "自身の名前「焔魔」の「焔」を冠したオリジナル曲"], ["a_02d24e1c", "風真いろは", "いろはすてっぷ！", 2, "自身の名前「いろは」を冠した1stオリジナル曲"], ["a_02d24e1c", "風真いろは", "風を仰ぎし麗容な", 2, "苗字「風真」の「風」を冠した和風オリジナル曲"], ["a_02d24e1c", "風真いろは", "風向きエントロピー", 2, "苗字「風真」の「風」を冠した楽曲"], ["a_27d332b9", "月ノ美兎", "ウラノミト", 3, "「月ノ美兎（ツキノミト）」をもじった「ウラノミト」の1stシングル曲"], ["a_27d332b9", "月ノ美兎", "月の兎はヴァーチュアルの夢をみる", 3, "「月ノ美兎」の「月」と「兎」をそのまま織り込んだアルバム表題曲"], ["a_5e1833de", "火威青", "Club Blue Fire", 3, "「火威＝Fire」「青＝Blue」を英語でもじったオリジナル曲"], ["a_59490a3b", "La prière", "進め!ラブリーアイドル☆ラプリエール", 3, "ユニット名「La prière（ラプリエール）」を冠した楽曲"], ["a_e65243ee", "MORE MORE JUMP!", "モア!ジャンプ!モア!", 3, "ユニット名「MORE MORE JUMP!」を組み替えた代表曲"], ["a_fa1e33b1", "青い子", "The Blueness Of Summer Moon", 2, "「青い子」の「青＝Blueness」を冠したオリジナル曲"], ["a_4555c653", "鷹嶺ルイ", "ホロホーク", 2, "ホロライブ＋「鷹＝ホーク（Hawk）」をもじった代表曲"], ["a_8cbe3586", "宝鐘マリン", "I’m Your Treasure Box *あなたは マリンせんちょうを たからばこからみつけた。", 3, "「宝鐘＝Treasure」「マリン船長」を織り込んだ代表曲"], ["a_8cbe3586", "宝鐘マリン", "Ahoy!! 我ら宝鐘海賊団☆", 2, "「宝鐘海賊団」を冠した自己紹介アンセム曲"], ["a_18389736", "湊あくあ", "#あくあ色ぱれっと", 3, "自身の名前「あくあ」を冠した代表曲"], ["a_18389736", "湊あくあ", "海想列車", 1, "「湊（みなと）／あくあ（水・海）」と「回想／海想」を掛けた楽曲"], ["a_5399029a", "悠木碧", "Mon Ciel Bleu～わたしのあおいそら～", 2, "自身の名前「碧（あおい）＝Bleu」を織り込んだ楽曲"], ["a_bd806987", "Leo/need", "needLe", 3, "ユニット名「Leo/need」のスペルを組み替えた（need＋Le）初期代表曲"], ["a_c6dd8a71", "Mori Calliope", "失礼しますが、RIP♡", 1, "死神（Mori＝Memento Mori）モチーフを象徴するデビュー曲"], ["a_36d718eb", "SorAZ", "紅藍クロニクル", 2, "AZKiのイメージカラー「紅」とときのそらの「藍」を冠したユニット曲"], ["a_0d1fb4ec", "しぐれうい", "うい麦畑でつかまえて", 2, "ライ麦畑と自身の名前「うい」をもじった代表曲"], ["a_2e71c468", "朱名", "朱月の季節", 2, "自身の名前「朱名」の「朱」を冠した楽曲"], ["a_6ec569ac", "私立恵比寿中学", "フォーエバー中坊", 2, "「恵比寿中学（エビ中）」の「中坊（中学生）」を冠した楽曲"], ["a_e36b16a8", "名取さな", "エッビーナースデイ", 1, "ナース（名取さな）＋ハッピーバースデーをもじった代表曲"], ["a_e36b16a8", "名取さな", "さなのおうた。", 2, "自身の名前「さな」をそのまま冠した1stオリジナル代表曲"], ["a_16f49962", "放課後クライマックスガールズ", "夢咲きAfter school", 2, "「放課後＝After school」を冠した1st代表曲"], ["a_16f49962", "放課後クライマックスガールズ", "クライマックスアイランド", 2, "ユニット名の「クライマックス」を冠した楽曲"], ["a_87ea3b04", "夜空メル", "Choco♡Melty", 2, "自身の名前「メル（Melty）」を織り込んだ楽曲"], ["a_87ea3b04", "夜空メル", "かぷっとNight☆Sky", 2, "苗字「夜空＝Night☆Sky」をもじった1stオリジナル代表曲"], ["a_dddebc7b", "Airots", "みどりのこだま~echo of Airots~", 3, "ユニット名「Airots」をサブタイトルに冠した象徴曲"], ["a_3ea47af5", "Universe", "스텔라이브 (StelLive) Universe", 3, "名義「Universe」をそのまま冠したテーマ曲"], ["a_bcf19e11", "青木陽菜", "BLUE BUD", 3, "苗字「青木」の「青＝BLUE」「木（新芽）＝BUD」を英訳した1stオリジナル曲"], ["a_72148352", "赤い公園", "夜の公園", 2, "バンド名「赤い公園」の「公園」を冠した楽曲"], ["a_39733e9b", "北小路ヒスイ", "ヒスイ色のミライ", 3, "自身の名前「ヒスイ」をそのまま冠した1stオリジナル曲"], ["a_55eaaff6", "獅白ぼたん", "Lioness' Pride", 2, "「獅白（獅子＝Lioness）」を英語でもじった1stオリジナル代表曲"], ["a_ad9090ea", "縞子", "縞模様", 3, "自身の名前「縞子」の「縞」を冠した楽曲"], ["a_8de423f1", "すーぱーそに子 (第一宇宙速度)", "SUPERORBITAL", 3, "「すーぱーそに子（SUPER）」＋「第一宇宙速度（ORBITAL）」を掛け合わせたデビュー代表曲"], ["a_b408a530", "小鳥遊キアラ", "HINOTORI", 3, "不死鳥キアラ＋苗字「小鳥遊」の「鳥（TORI）」を掛けた1stオリジナル代表曲"], ["a_b408a530", "小鳥遊キアラ", "HOLOTORI Dance!", 2, "ホロライブ＋苗字「小鳥遊」の「鳥（TORI）」をもじった楽曲"], ["a_02edec58", "箱乃なかみ", "WHIT∄ BOX", 2, "「箱乃なかみ」の「箱＝BOX」を冠したオリジナル曲"], ["a_066b0ee9", "HONK THE HORN", "HORN", 2, "バンド名「HONK THE HORN」の「HORN」をそのまま冠した楽曲"], ["a_80260a0f", "壱百満天原サロメ", "壱百満点☆パクスサロメーナ", 3, "「壱百満天原＝壱百満点」＋「サロメ＝サロメーナ」を完全にもじった1stオリジナル代表曲"], ["a_a18e3319", "P丸様。", "P-KATSU", 2, "「P丸様。」の頭文字「P」と推し活（P活）をもじった楽曲"], ["a_b3384e2d", "本間ひまわり", "Sun! Sun! Sunflower", 3, "自身の名前「ひまわり＝Sunflower」を英訳した1stオリジナル代表曲"], ["a_8cd059b9", "前島麻由", "Mayu-kko", 2, "自身の名前「麻由（Mayu）」をもじった楽曲"], ["a_ef2beb49", "マジカル・パンチライン", "Magiかよ!? BiliBili☆パンチライン", 3, "グループ名「マジカル・パンチライン」をもじった自己紹介的代表曲"], ["a_a1c00d7a", "美雲ΔJUNNA (ワルキューレ)", "ダイアモンド クレバス～Mikumo Ver.～", 1, "自身の名義「美雲（Mikumo）」を冠したバージョン"], ["a_152d65f5", "雪花ラミィ", "Lamy＊Love♡Fest☆", 2, "自身の名前「ラミィ（Lamy）」をそのまま冠したオリジナル代表曲"], ["a_152d65f5", "雪花ラミィ", "Fleur", 1, "苗字「雪花」の「花＝Fleur（フランス語）」を冠したオリジナル曲"], ["a_a72cdb75", "夕月ティア", "ゆうづつすーぱーはいぱーみらくるそんぐ！", 2, "苗字「夕月（ゆうづき／ゆうづつ）」をもじった1stオリジナル曲"], ["a_2f88384d", "ラプラス・ダークネス", "Dark Breath", 3, "「ダークネス（Darkness）」と「Dark Breath（ダークブレス）」の韻をもじった1stオリジナル曲"], ["a_5688b63c", "竜胆尊", "常夜鬼譚", 1, "鬼の女王・竜胆尊の「鬼」モチーフを冠した1stオリジナル曲"], ["a_b1f88cad", "アイ (B小町)", "サインはB", 2, "所属グループ「B小町」の「B」を冠した代表曲"], ["a_db7d4049", "をとは", "O108ROCKET", 3, "「をとは＝O108（お・と・は）」の語呂合わせネーミング曲"], ["a_db7d4049", "をとは", "OTOMEROID", 2, "「をとは（OTO）」の音をもじった楽曲"], ["a_c06e0ae1", "初星学園", "初", 2, "「初星学園」の頭文字「初」を冠した全体テーマ曲"], ["a_c06e0ae1", "初星学園", "Campus mode!!", 2, "「初星学園」の「学園＝Campus」を冠した全体アンセム曲"], ["a_85cc0d70", "伊藤美来", "No.6", 1, "名前「美来（みく）」の数字モチーフ・6thシングル曲"], ["a_3b38c4fa", "さくらみこ", "Sakuraful March", 2, "自身の名前「さくら（Sakura）」＋Fullをもじったオリジナル曲"], ["a_3b38c4fa", "さくらみこ", "サクラカゼ", 2, "自身の名前「さくら（サクラ）」を冠した代表曲"], ["a_3b38c4fa", "さくらみこ", "flower rhapsody", 1, "「さくら＝花（flower）」モチーフの1stアルバム表題曲"], ["a_3b38c4fa", "さくらみこ", "さくら色ハイテンション！", 2, "自身の名前「さくら」を冠した初期オリジナル代表曲"], ["a_21592d44", "nao", "N.O.S", 1, "名義「nao」のアルファベットを織り込んだ楽曲"], ["a_028cf065", "月詠み", "朔日 feat. 吉乃", 1, "「月詠み」の月齢（朔日＝新月）を冠した楽曲"], ["a_028cf065", "月詠み", "月が満ちる", 2, "プロジェクト名「月詠み」の「月」を冠した1st Story象徴曲"], ["a_1ffe3260", "トゲナシトゲアリ", "荊の薔薇", 1, "バンド名「トゲナシトゲアリ」の「トゲ（荊）」モチーフ曲"], ["a_d43902b0", "ナナツカゼ", "七ツ風", 3, "アーティスト名「ナナツカゼ」をそのまま漢字にした象徴曲"], ["a_5f1145bf", "みらくらぱーく！", "みらくりえーしょん", 3, "ユニット名「みらくらぱーく！」＋「クリエイション」をもじった象徴曲"], ["a_82abfc73", "イルミネーションスターズ", "ヒカリのdestination", 3, "「イルミネーション＝ヒカリ」を冠した1stユニット代表曲"], ["a_82abfc73", "イルミネーションスターズ", "星が流れて", 2, "「スターズ＝星」を冠したユニット曲"], ["a_82abfc73", "イルミネーションスターズ", "星の数だけ", 2, "「スターズ＝星」を冠したユニット曲"], ["a_82abfc73", "イルミネーションスターズ", "Shower of light", 2, "「イルミネーション＝light（光のシャワー）」を冠したユニット曲"], ["a_f722877f", "Guilty Kiss", "Guilty Night, Guilty Kiss!", 3, "ユニット名「Guilty Kiss」をそのまま冠した代表曲"], ["a_f722877f", "Guilty Kiss", "Guilty!? Farewell party", 2, "ユニット名の「Guilty」を冠した楽曲"], ["a_f722877f", "Guilty Kiss", "Guilty Eyes Fever", 2, "ユニット名の「Guilty」を冠した楽曲"], ["a_339a28dc", "月のテンペスト", "MELODIES (月のテンペストver.)", 2, "ユニット名「月のテンペスト」を冠したバージョン"], ["a_339a28dc", "月のテンペスト", "月下儚美", 2, "ユニット名「月のテンペスト」の「月」を冠した1st代表曲"], ["a_339a28dc", "月のテンペスト", "Daytime Moon", 2, "ユニット名「月のテンペスト」の「月＝Moon」を冠した楽曲"], ["a_339a28dc", "月のテンペスト", "月ノヒカリ", 2, "ユニット名「月のテンペスト」の「月」を冠した楽曲"], ["a_d52b4416", "星見プロダクション", "星色のカレイドスコープ", 2, "「星見」の「星」を冠した全体曲"], ["a_d52b4416", "星見プロダクション", "The Sun, Moon and Stars", 1, "「星見」の「星＝Stars」を織り込んだ楽曲"], ["a_d52b4416", "星見プロダクション", "星の海の記憶", 2, "「星見」の「星」を冠した代表曲"], ["a_16da2065", "TRINITYAiLE", "Aile to Yell", 3, "ユニット名「TRINITYAiLE」の「AiLE（翼）」と「Yell（エール）」をもじった1st代表曲"], ["a_16da2065", "TRINITYAiLE", "les plumes", 1, "フランス語で「羽根（＝Aile）」を意味するモチーフ曲"], ["a_cc2e2744", "ヒバナ", "消えゆく火花と夏の空", 3, "アーティスト名「ヒバナ＝火花」をそのまま織り込んだ象徴曲"], ["a_fef24112", "AIKATSU☆STARS!", "アイカツ☆ステップ!", 2, "ユニット名「AIKATSU☆（アイカツ☆）」を冠した代表曲"], ["a_fef24112", "AIKATSU☆STARS!", "スタージェット!", 1, "ユニット名「STARS!」の「スター」を冠した代表曲"], ["a_fef24112", "AIKATSU☆STARS!", "STARDOM!", 1, "ユニット名「STARS!」の「STAR」を冠した代表曲"], ["a_aa5784c7", "(K)NoW_NAME", "Knew day", 2, "ユニット名「(K)NoW_NAME」の「Know→Knew」をもじった1st代表曲"], ["a_9428a8e8", "tayori", "風のたより", 3, "ユニット名「tayori＝たより」をそのまま織り込んだ象徴曲"], ["a_86bf9210", "Saint Snow", "Lonely Snow Planet", 2, "ユニット名「Saint Snow」の「Snow」を冠した楽曲"], ["a_86bf9210", "Saint Snow", "Dazzling White Town", 1, "「Snow＝White（白銀の街）」をモチーフにした代表曲"], ["a_c079eca6", "B小町", "サインはB", 3, "グループ名「B小町」の「B」を冠した代表曲"], ["a_2680e198", "WHITE-LIPS", "凪 WHITE-LIPS", 3, "名義「WHITE-LIPS」を冠した楽曲"], ["a_66efc646", "月が綺麗じゃなくたって。", "月を詠む", 2, "ユニット名「月が綺麗じゃなくたって。」の「月」を冠した楽曲"], ["a_66efc646", "月が綺麗じゃなくたって。", "月が消えた", 2, "ユニット名「月が綺麗じゃなくたって。」の「月が…」をもじった楽曲"], ["a_fa287d9d", "Hana Hope", "flowers", 2, "自身の名前「Hana（花）＝flowers」を英訳した代表曲"], ["a_8d04906b", "Appare!", "アッパライナ", 3, "グループ名「Appare!（アッパレ）」をもじった代表曲"], ["a_1610e54e", "JYOCHO", "sugoi kawaii JYOCHO", 3, "バンド名「JYOCHO」をそのまま冠した楽曲"], ["a_b84f3ec3", "Neko Hacker", "TBC Hacker feat. ななひら & をとは", 2, "ユニット名「Neko Hacker」の「Hacker」を冠した楽曲"], ["a_b84f3ec3", "Neko Hacker", "くいしんぼハッカー feat. くいしんぼあかちゃん", 2, "ユニット名「Neko Hacker」の「Hacker＝ハッカー」を冠した代表曲"], ["a_ec619e5d", "いきづらい部！", "イキタクナイ every day", 3, "ユニット名「いきづらい部！」（生きづらい／行きたくない）をもじった1st代表曲"], ["a_9d0dd126", "サンドリオン", "君だけのオリオン", 2, "「サンドリオン（Sound＋Orion）」の「オリオン」を冠した代表曲"], ["a_9d0dd126", "サンドリオン", "Be Shine! Sound × Orion", 3, "「サンドリオン＝Sound × Orion」の名前の由来そのものを冠した象徴曲"], ["a_09cf915d", "Nagi", "空が凪いだら", 3, "自身の名前「Nagi＝凪（なぎ）」を動詞「凪いだら」として織り込んだ象徴曲"], ["a_23bc4d7c", "闇キューレ", "Glow in the dark", 2, "「闇キューレ」の「闇＝dark」を冠した象徴曲"], ["a_23bc4d7c", "闇キューレ", "Diva in Abyss", 2, "「闇キューレ」の「闇（深淵＝Abyss）の歌姫（Diva）」を冠した象徴曲"], ["a_3afeb587", "Aqours", "恋になりたいAQUARIUM", 3, "ユニット名「Aqours」の語源「AQUA（AQUARIUM）」を冠した初期代表曲"], ["a_3afeb587", "Aqours", "WATER BLUE NEW WORLD", 2, "ユニット名「Aqours（水＝WATER BLUE）」を冠した代表曲"], ["a_ec84f1bf", "Cleasky", "想い出はクリアスカイ", 3, "ユニット名「Cleasky＝クリアスカイ」をそのまま冠した代表曲"], ["a_4455fd36", "L.I.N.K.s", "Link with U", 3, "ユニット名「L.I.N.K.s」の「Link」をそのまま冠した代表曲"], ["a_d46c6afb", "藍空と月", "空と遊園地", 2, "ユニット名「藍空と月」の「空」を冠した楽曲"], ["a_6a5b3b94", "雨ニマケテモ", "アンブレラレコード", 1, "ユニット名「雨ニマケテモ」の「雨＝アンブレラ（傘）」モチーフ曲"], ["a_79fcf549", "杏夜くもり", "くもりのうた", 3, "自身の名前「くもり」をそのまま冠した象徴曲"], ["a_79fcf549", "杏夜くもり", "天気雨", 1, "自身の名前「くもり」の天気モチーフ曲"], ["a_6c50a895", "綾野ましろ", "ideal white", 3, "自身の名前「ましろ（真白＝white）」を英語で織り込んだデビュー代表曲"], ["a_6c50a895", "綾野ましろ", "vanilla sky", 1, "「ましろ（白＝vanilla）」をイメージさせる代表曲"], ["a_746fbb0d", "歌組雪月花", "回レ!雪月花", 3, "ユニット名「歌組雪月花」の「雪月花」をそのまま冠した代表曲"], ["a_fe67cd56", "スフィア", "A.T.M.O.S.P.H.E.R.E", 3, "タイトル末尾にユニット名「S.P.H.E.R.E（スフィア）」を織り込んだ1stアルバム象徴曲"], ["a_192435ae", "太陽と踊れ月夜に唄え", "幾望", 1, "ユニット名「月夜に唄え」の月齢（幾望＝満月前夜）モチーフ曲"], ["a_708b20ce", "第一宇宙速度", "SUPERORBITAL", 3, "バンド名「第一宇宙速度（Orbital velocity）」を英語にした象徴曲"], ["a_0fc240b5", "ダイヤモンドダスト", "空の箱 (DIAMOND DUST)", 2, "バンド名「ダイヤモンドダスト（DIAMOND DUST）」を冠したバージョン"], ["a_8ab330f5", "765PRO ALLSTARS", "M@STERPIECE", 1, "アイドルマスター（M@STER）の名を冠した劇場版象徴曲"], ["a_cbfdb822", "FUKA", "花風", 3, "名義「FUKA（ふうか＝風花）」の文字を逆さにした象徴曲"], ["a_9d492c92", "Aice5", "Love Aice5", 3, "ユニット名「Aice5」をそのまま冠した自己紹介代表曲"], ["a_29df268e", "Anemoneria", "anemos", 2, "ユニット名「Anemoneria」の語源「anemos（風）」を冠した楽曲"], ["a_79334a4a", "ChamJam", "ずっと ChamJam", 3, "ユニット名「ChamJam」をそのまま冠した代表曲"], ["a_fc11c6fa", "EScape", "I.D ~EScape from Utopia~", 3, "ユニット名「EScape」をそのまま織り込んだ代表曲"], ["a_ef1f09c8", "EverdreaM", "ever dream", 3, "ユニット名「EverdreaM」そのもののセルフタイトル曲"], ["a_ef1f09c8", "EverdreaM", "Dreams come true〜欲する翼〜", 2, "ユニット名「EverdreaM」の「Dream」を冠したデビュー曲"], ["a_a22985c6", "FAIRY STARS", "FairyTaleじゃいられない", 3, "ユニット名「FAIRY STARS」の「Fairy」を冠した代表曲"], ["a_091669b7", "Happy Clover", "PUNCH☆MIND☆HAPPINESS", 2, "ユニット名「Happy Clover」の「Happy＝HAPPINESS」を冠したOP主題歌"], ["a_1d7343c2", "iLiFE!", "アイドルライフスターターパック", 3, "グループ名「iLiFE!（＝アイドルライフ）」をそのまま冠した代表曲"], ["a_1d7343c2", "iLiFE!", "アイドルライフブースターパック", 3, "グループ名「iLiFE!（＝アイドルライフ）」をそのまま冠した代表曲"], ["a_1d7343c2", "iLiFE!", "サイクロンライフ!", 2, "グループ名「iLiFE!」の「ライフ!」を冠した楽曲"], ["a_e74478cd", "Kill×Your×Idol", "キル×キラ×killer★", 3, "グループ名「Kill×Your×Idol」の「Kill×」をもじった象徴曲"], ["a_7caef4d8", "Lyolite", "リオライト", 3, "名義「Lyolite＝リオライト」そのもののセルフタイトル曲"], ["a_f9915a55", "meltear", "ティアーズテイル", 2, "ユニット名「meltear」の「tear（ティアーズ）」を冠した代表曲"], ["a_1c4fd6cb", "OKINI☆PARTY'S", "オオキニ☆ぱーりーなぃと", 3, "ユニット名「OKINI☆PARTY'S」をもじった自己紹介代表曲"], ["a_dfedacc6", "petit fleurs", "ぷちふるぱーてぃー!", 3, "ユニット略称「ぷちふる（petit fleurs）」をそのまま冠した1st代表曲"], ["a_7a3b6bf1", "Qlover from kyoukaimetro", "Q & []", 2, "名義「Qlover」の頭文字「Q」を記号的にもじった楽曲"], ["a_7a3b6bf1", "Qlover from kyoukaimetro", "Tik[Q]et -解-", 2, "名義「Qlover」の「Q」を織り込んだ楽曲"], ["a_7a3b6bf1", "Qlover from kyoukaimetro", "Tik[Q]et -零-", 2, "名義「Qlover」の「Q」を織り込んだ楽曲"], ["a_4a7d87fc", "retrorain", "Rewrite the Rain", 2, "名義「retrorain」の「Rain」と頭文字Rを重ねた楽曲"], ["a_cd57d77d", "SHADE OF SPADE", "スペードのQ", 3, "名義「SHADE OF SPADE」の「SPADE＝スペード」を冠した楽曲"], ["a_cd57d77d", "SHADE OF SPADE", "KING of SPADE", 3, "名義「SHADE OF SPADE」の「SPADE」をそのまま冠した楽曲"], ["a_cd57d77d", "SHADE OF SPADE", "ESPADA", 2, "スペイン語で剣・スペードの語源「ESPADA（＝SPADE）」を冠した楽曲"], ["a_8a580c16", "Sherry 'n Cherry", "Cherry Colored Love", 3, "ユニット名「Sherry 'n Cherry」の「Cherry」を冠した代表曲"], ["a_1a2db459", "Sunflower Dolls", "Sunflower Dolls (OST)", 3, "ユニット名「Sunflower Dolls」そのもののテーマ曲"], ["a_1ed32114", "team うみフレ", "DEEP BLUE TOWNへおいでよ", 1, "ユニット名「うみ（海＝DEEP BLUE）」モチーフの代表曲"], ["a_1ed32114", "team うみフレ", "Dive to Blue", 1, "ユニット名「うみ（海＝Blue）」モチーフの楽曲"], ["a_1ed32114", "team うみフレ", "DEEP BLUE SONG", 1, "ユニット名「うみ（海＝DEEP BLUE）」モチーフの楽曲"], ["a_1ed32114", "team うみフレ", "Marine Bloomin'", 1, "ユニット名「うみ（海＝Marine）」モチーフの代表曲"], ["a_c0da0f22", "Team. Palette", "色彩", 1, "ユニット名「Palette（パレット＝色彩）」モチーフの楽曲"], ["a_960ab696", "AiRBLUE Flower", "Field of Flowers", 2, "ユニット名「AiRBLUE Flower」の「Flower」を冠した代表曲"], ["a_3d14e739", "廻花", "かいか", 3, "自身の名義「廻花＝かいか」をそのままひらがなにした1st象徴曲"], ["a_09e20099", "ケラケラ", "ケラケラじゃんけん", 3, "ユニット名「ケラケラ」をそのまま冠した代表曲"], ["a_2bb86498", "サイレンススズカ (ウマ娘 プリティーダービー)", "Silent Star (2021 Remastered Version)", 3, "自身の名前「サイレンス（Silent）」を冠したソロ象徴曲"], ["a_c5cd5589", "サンボンリボン", "たいくつりぼん", 2, "ユニット名「サンボンリボン」の「りぼん」を冠した楽曲"], ["a_9c4e21b8", "シャイニーカラーズ", "シャイノグラフィ (2023 Ver.)", 3, "「シャイニー（シャイノ）」を冠した全体象徴曲"], ["a_9c4e21b8", "シャイニーカラーズ", "いつか Shiny Days (2023 Ver.)", 2, "「シャイニー＝Shiny」を冠した全体曲"], ["a_7bb02d7f", "シャドウガーデンナンバーズ", "Shadow Garden", 3, "名義「シャドウガーデンナンバーズ」の「Shadow Garden」をそのまま冠した楽曲"], ["a_33818bbe", "空の標識", "絵空事、夏の終わり", 2, "ユニット名「空の標識」の「空（絵空事）」を冠した楽曲"], ["a_427b10d6", "たこやきレインボー", "にじースターダスト", 2, "グループ名「レインボー＝にじ（虹）」を冠した楽曲"], ["a_427b10d6", "たこやきレインボー", "虹色進化論", 2, "グループ名「レインボー＝虹色」を冠した代表曲"], ["a_427b10d6", "たこやきレインボー", "ナナイロダンス", 2, "グループ名「レインボー＝ナナイロ（七色）」を冠した代表曲"], ["a_427b10d6", "たこやきレインボー", "絶唱!なにわで生まれた少女たち", 1, "「たこやき（なにわ）」モチーフの自己紹介曲"], ["a_e089caf4", "ナナランド", "七色の絵の具で", 3, "グループ名「ナナランド」の「ナナ＝七（七色）」を冠した代表曲"], ["a_003d0cad", "花降る日々", "花降る日々", 3, "ユニット名「花降る日々」そのもののセルフタイトル曲"], ["a_520ad4be", "パジャマパーティーズ", "パジャマパーティー", 3, "ユニット名「パジャマパーティーズ」そのものの楽曲"], ["a_520ad4be", "パジャマパーティーズ", "パジャマパーティーズのうた", 3, "ユニット名「パジャマパーティーズ」をそのまま冠した代表曲"], ["a_278a79dd", "秘密結社holoX", "Just for X", 3, "ユニット名「holoX」の「X」を冠した全体象徴曲"], ["a_ace822a6", "兵藤雫 (サニーピース)", "Tiny Tiny Drops", 3, "自身の名前「雫＝Drops」を英語で冠したソロ象徴曲"], ["a_2049064f", "みかくにんぐッ!", "未確認ふゅーちゃー", 3, "ユニット名「みかくにんぐッ!（未確認）」をそのまま冠したOP代表曲"], ["a_f15ff63c", "夜のひと笑い", "ワライカタ", 2, "ユニット名「夜のひと笑い」の「笑い＝ワライカタ」をもじった楽曲"], ["a_b486fbbd", "ラストランプ", "燈", 2, "バンド名「ラストランプ」の「ランプ＝燈（ともしび）」を冠した象徴曲"], ["a_091caea0", "レイジー・レイジー", "クレイジークレイジー", 3, "ユニット名「レイジー・レイジー（Lazy Lazy）」と韻を踏んでもじった代表曲"], ["a_5aa3068b", "わーすた", "わーるどすたんだーど", 3, "「わーすた」の正式名称（The World Standard＝わーるどすたんだーど）そのものの楽曲"], ["a_5aa3068b", "わーすた", "The World Standard Dancing Club", 3, "グループ名の正式英語表記「The World Standard」をそのまま冠した代表曲"], ["a_5aa3068b", "わーすた", "わったらいふ！", 2, "「わーすた」＋「What a life!」をもじった楽曲"]];
  const MEIKYOKU_BY_AID = new Map();
  const MEIKYOKU_ENTRIES = [];

  function initMeikyokuCatalog() {
    MEIKYOKU_BY_AID.clear();
    MEIKYOKU_ENTRIES.length = 0;
    MEIKYOKU_RAW_CATALOG.forEach(row => {
      const [aid, artistName, songTitle, stars, reason] = row;
      const artist = AID_TO_ARTIST.get(aid) || ARTIST_MAP.get(artistName);
      if (!artist) return;
      const actualAid = artist.aid || aid;
      const norm = normSearch(songTitle);
      const normNoSpace = stripSpaces(norm);
      const canonInfo = getCanonicalSongTitleAndKey(songTitle);
      const normCanon = normSearch(canonInfo.displayTitle);
      const normCanonNoSpace = stripSpaces(normCanon);
      const aliases = (SONG_SEARCH_ALIASES_BY_NEW_TITLE[songTitle] || []).map(al => normSearch(al));
      const aliasesNoSpace = aliases.map(al => stripSpaces(al));
      const entry = {
        aid: actualAid,
        artist,
        songTitle,
        stars: Number(stars) || 2,
        reason: reason || "",
        norm,
        normNoSpace,
        normCanonical: normCanon,
        normCanonicalNoSpace: normCanonNoSpace,
        aliases,
        aliasesNoSpace
      };
      MEIKYOKU_ENTRIES.push(entry);
      if (!MEIKYOKU_BY_AID.has(actualAid)) {
        MEIKYOKU_BY_AID.set(actualAid, []);
      }
      MEIKYOKU_BY_AID.get(actualAid).push(entry);
    });
  }
  initMeikyokuCatalog();

  function isSongInArtistListeningList(artist, targetTitle) {
    if (!artist || !Array.isArray(artist.songs) || !targetTitle) return false;
    if (artist.songs.includes(targetTitle)) return true;
    const normCand = normSongTitleForCompare(targetTitle);
    if (!normCand) return false;
    if (artist.songs.some(s => normSongTitleForCompare(s) === normCand)) return true;
    const canKey = getCanonicalSongTitleAndKey(targetTitle).canonicalKey;
    if (canKey && artist.songs.some(s => getCanonicalSongTitleAndKey(s).canonicalKey === canKey)) return true;
    return false;
  }

  function buildKaruTopOnlyBadgeHTML(artist, songTitle, isTopSongFlag = false, extraClass = "") {
    if (!state.karuSpecialMode) return "";
    if (isSongInArtistListeningList(artist, songTitle)) return "";
    if (!isTopSongFlag && artist && Array.isArray(artist.topSongs)) {
      const normCand = normSongTitleForCompare(songTitle);
      const canKey = getCanonicalSongTitleAndKey(songTitle).canonicalKey;
      const inTop = artist.topSongs.some(ts =>
        ts === songTitle ||
        (normCand && normSongTitleForCompare(ts) === normCand) ||
        (canKey && getCanonicalSongTitleAndKey(ts).canonicalKey === canKey)
      );
      if (!inTop) return "";
    }
    return `<span class="karu-top-only-tag ${extraClass}" title="代表曲（かるが聴いてる曲には未登録）">代表曲</span>`;
  }

  function getMeikyokuStarTierForSong(aidOrName, songTitle) {
    const aid = resolveToAid(aidOrName);
    if (!aid || !songTitle) return 0;
    const list = MEIKYOKU_BY_AID.get(aid);
    if (!list || list.length === 0) return 0;
    const normCand = normSongTitleForCompare(songTitle);
    for (let i = 0; i < list.length; i++) {
      if (list[i].songTitle === songTitle || (normCand && normSongTitleForCompare(list[i].songTitle) === normCand)) {
        return list[i].stars;
      }
    }
    return 0;
  }

  function buildMeikyokuStarBadgeHTML(stars, extraClass = "") {
    const n = Number(stars) || 0;
    if (n <= 0) return "";
    const starsStr = "☆".repeat(n);
    return `<span class="meikyoku-star-badge stars-lv-${n} ${extraClass}" title="銘曲 Lv.${n}" aria-label="銘曲 Lv.${n}">${starsStr}</span>`;
  }

  function hasMeikyokuFilter() {
    return Boolean(state.karuSpecialMode && Array.isArray(state.meikyokuFilter) && state.meikyokuFilter.length > 0);
  }

  function matchesMeikyokuStarFilter(stars) {
    if (!hasMeikyokuFilter()) return true;
    if (state.meikyokuFilter.includes("all")) return stars > 0;
    return stars > 0 && state.meikyokuFilter.includes(String(stars));
  }

  function isMeikyokuListView() {
    return Boolean(state.view === "search" && hasMeikyokuFilter());
  }


  // Precompute clickable broad agency/content groups (>= 2 artists) for PC Filter Drawer
  const AGENCY_GROUP_COUNTS = new Map();
  DATA.forEach(a => {
    const ag = a.agencyGroup || a.agency || "";
    if (ag) {
      AGENCY_GROUP_COUNTS.set(ag, (AGENCY_GROUP_COUNTS.get(ag) || 0) + 1);
    }
  });
  const CLICKABLE_AGENCY_GROUPS = Array.from(AGENCY_GROUP_COUNTS.entries())
    .filter(([, cnt]) => cnt >= 1)
    .map(([name, count]) => ({ name, count }))
    .sort((x, y) => {
      if (y.count !== x.count) return y.count - x.count;
      return jaCollator.compare(x.name, y.name);
    });

  // Readings & aliases for 所属（事務所・作品）
  const AGENCY_SEARCH_ALIASES = {
    "ホロライブ": ["ほろらいぶ", "hololive", "ホロライブプロダクション"],
    "にじさんじ": ["にじさんじ", "nijisanji"],
    "ぶいすぽっ！": ["ぶいすぽっ", "ぶいすぽ", "vspo"],
    "神椿スタジオ": ["かみつばきすたじお", "かみつばき", "kamitsubaki", "sinsekai"],
    "ミリプロ": ["みりぷろ", "millionproduction"],
    "RIOT MUSIC": ["らいおっとみゅーじっく", "riotmusic", "blitzwing"],
    "RK Music": ["あーるけーみゅーじっく", "rkmusic"],
    "Re:AcT": ["りあくと", "react"],
    "ななしいんく": ["ななしいんく", "774inc"],
    "あおぎり高校": ["あおぎりこうこう", "aogiri"],
    "ネオポルテ": ["ねおぽるて", "neoporte"],
    "のりプロ": ["のりぷろ", "noripro"],
    "StelLive": ["すてるらいぶ", "stellive"],
    "Varium": ["ぶいありうむ", "varium"],
    "VEE": ["ぶいー", "vee"],
    "VOMS Project": ["ぼむず", "voms"],
    "Palette Project": ["ぱれっとぷろじぇくと", "パレプロ", "paletteproject"],
    "Phase Connect": ["ふぇいずこねくと", "phaseconnect"],
    "PRISM Project": ["ぷりずむぷろじぇくと", "prismproject"],
    "Propro": ["ぷろぷろ", "propro"],
    "Specialite": ["すぺしゃりて", "specialite"],
    "Voice-ore": ["ぼいすおれ", "voiceore"],
    "ホロスターズ": ["ほろすたーず", "holostars"],
    "ラブライブ！シリーズ": ["らぶらいぶ", "らぶらいぶしりーず", "lovelive", "μ's", "aqours", "虹ヶ咲", "liella", "蓮ノ空"],
    "アイドルマスターシリーズ": ["あいどるますたー", "アイマス", "imas", "idolmaster", "デレマス", "シンデレラガールズ", "ミリマス", "ミリオンライブ", "シャニマス", "シャイニーカラーズ", "学マス", "学園アイドルマスター"],
    "BanG Dream!": ["ばんどり", "バンドリ", "ガルパ", "bangdream", "ゆめみた"],
    "IDOLY PRIDE": ["あいどりーぷらいど", "アイプラ", "idolypride"],
    "プロジェクトセカイ カラフルステージ！ feat. 初音ミク": ["ぷろじぇくとせかい", "プロセカ", "pjsekai", "projectsekai"],
    "ウマ娘 プリティーダービー": ["うまむすめ", "umamusume"],
    "Re:ステージ！": ["りすてーじ", "リステージ", "restage"],
    "少女☆歌劇 レヴュースタァライト": ["れゔゅーすたぁらいと", "スタァライト", "revuestarlight"],
    "D4DJ": ["でぃーふぉーでぃーじぇー", "グルミク", "d4dj"],
    "ヘブンバーンズレッド": ["へぶんばーんずれっど", "ヘブバン", "heavenburnsred"],
    "プリンセスコネクト！Re:Dive": ["ぷりんせすこねくと", "プリコネ", "priconne"],
    "けいおん！": ["けいおん", "k-on"],
    "マクロスシリーズ": ["まくろす", "macross", "マクロスδ", "マクロスf"],
    "ぼっち・ざ・ろっく！": ["ぼっちざろっく", "ぼざろ", "bocchi"],
    "【推しの子】": ["おしのこ", "推しの子", "oshinoko"],
    "青春ブタ野郎シリーズ": ["せいしゅんぶたやろう", "青ブタ", "aobuta"],
    "ワールドダイスター": ["わーるどだいすたー", "ユメステ", "worlddai"],
    "ひなビタ♪": ["ひなびた", "hinabita"],
    "Wake Up, Girls!": ["うぇいくあっぷがーるず", "wug"],
    "アイカツ！シリーズ": ["あいかつ", "aikatsu"],
    "ソードアート・オンライン": ["そーどあーとおんらいん", "sao", "ggo", "ガンゲイル・オンライン"],
    "超かぐや姫！": ["ちょうかぐやひめ"],
    "混血のカレコレ": ["こんけつのかれこれ", "カレコレ"],
    "告白実行委員会 (HoneyWorks)": ["こくはくじっこういいんかい", "ハニワ", "honeyworks"],
    "ガールズバンドクライ": ["がーるずばんどくらい", "ガルクラ", "girlsbandcry"],
    "アズールレーン": ["あずーるれーん", "アズレン", "azurlane"],
    "アークナイツ": ["あーくないつ", "arknights"],
    "温泉むすめ": ["おんせんむすめ", "onsenmusume"],
    "電音部": ["でんおんぶ", "denonbu"],
    "SHOW BY ROCK!!": ["しょーばいろっく", "sb69"],
    "NEW GAME!": ["にゅーげーむ", "newgame"]
  };

  // Build SEARCHABLE_GROUPS:
  // 1) All 所属（事務所・作品） (agencyGroup)
  // 2) All standalone ユニット (units of people who do NOT have a broader 所属（事務所・作品）)
  const SEARCHABLE_GROUPS = [];
  CLICKABLE_AGENCY_GROUPS.forEach(ag => {
    const members = DATA.filter(a => (a.agencyGroup || a.agency || "") === ag.name);
    const cat1Cnt = members.filter(a => a.cat === 1).length;
    const cat2Cnt = members.filter(a => a.cat === 2).length;
    const aliases = AGENCY_SEARCH_ALIASES[ag.name] || [];
    const readingHira = aliases[0] || "";
    const romajiTokens = readingHira ? hiraToRomajiPair(normSearch(readingHira)) : [];
    const normTokens = [
      normSearch(ag.name),
      ...aliases.map(x => normSearch(x)),
      ...romajiTokens.map(x => normSearch(x))
    ].filter(Boolean);
    const normTokensNoSpace = normTokens.map(x => stripSpaces(x)).filter(Boolean);
    const sampleNames = members.slice(0, 4).map(m => m.name).join("・") + (members.length > 4 ? " ほか" : "");
    SEARCHABLE_GROUPS.push({
      type: "agency",
      typeLabel: "所属（事務所・作品）",
      name: ag.name,
      count: members.length,
      cat1Count: cat1Cnt,
      cat2Count: cat2Cnt,
      subtitle: sampleNames,
      _normName: normSearch(ag.name),
      _normNameNoSpace: stripSpaces(normSearch(ag.name)),
      _normTokens: normTokens,
      _normTokensNoSpace: normTokensNoSpace
    });
  });

  // Find units of artists who do NOT have a broader agencyGroup
  const standaloneUnitMembersMap = new Map();
  DATA.forEach(a => {
    const hasBroadAgency = Boolean(a.agencyGroup || a.agency);
    if (!hasBroadAgency && Array.isArray(a.memberOf)) {
      a.memberOf.forEach(uName => {
        if (uName && uName !== a.name && ARTIST_MAP.has(uName)) {
          const uArtist = ARTIST_MAP.get(uName);
          // Exclude units that are themselves already a broad agencyGroup or belong to a broad agencyGroup
          if (uArtist && !(uArtist.agencyGroup || uArtist.agency) && !AGENCY_GROUP_COUNTS.has(uName)) {
            if (!standaloneUnitMembersMap.has(uName)) {
              standaloneUnitMembersMap.set(uName, new Set([uName]));
            }
            standaloneUnitMembersMap.get(uName).add(a.name);
          }
        }
      });
    }
  });

  standaloneUnitMembersMap.forEach((memberSet, uName) => {
    const uArtist = ARTIST_MAP.get(uName);
    if (!uArtist) return;
    const memberObjs = Array.from(memberSet).map(n => ARTIST_MAP.get(n)).filter(Boolean);
    const cat1Cnt = memberObjs.filter(a => a.cat === 1).length;
    const cat2Cnt = memberObjs.filter(a => a.cat === 2).length;
    const indivMembers = Array.from(memberSet).filter(n => n !== uName);
    const subtitle = (uName === "MAISONdes") ? "" : (indivMembers.length > 0 ? `ボーカル: ${indivMembers.join("・")}` : (uArtist.vocal ? `ボーカル: ${uArtist.vocal}` : ""));
    const normTokens = [
      uArtist._normName,
      uArtist._normReading,
      ...(uArtist._normAliases || []),
      ...indivMembers.map(m => normSearch(m))
    ].filter(Boolean);
    const normTokensNoSpace = normTokens.map(x => stripSpaces(x)).filter(Boolean);
    SEARCHABLE_GROUPS.push({
      type: "unit",
      typeLabel: "ユニット",
      name: uName,
      count: memberObjs.length,
      cat1Count: cat1Cnt,
      cat2Count: cat2Cnt,
      subtitle: subtitle,
      _normName: uArtist._normName,
      _normNameNoSpace: uArtist._normNameNoSpace,
      _normTokens: normTokens,
      _normTokensNoSpace: normTokensNoSpace
    });
  });

  // Deterministic luxury avatar gradient & monogram generator
  const AVATAR_PALETTES = [
    ["#1DB954", "#0c5927"],
    ["#2E77D0", "#13335c"],
    ["#8E44AD", "#3d194d"],
    ["#E67E22", "#6e3607"],
    ["#16A085", "#09473b"],
    ["#D35400", "#5e2500"],
    ["#2980B9", "#103752"],
    ["#C0392B", "#59160f"],
    ["#27AE60", "#0e4a27"],
    ["#6C5CE7", "#2d2470"]
  ];

  function getMonogram(name) {
    const clean = String(name || "").replace(/^[\(\[（【「『《\-＋+]+/, "").trim();
    if (!clean) return "♪";
    if (/^[A-Za-z0-9]/.test(clean)) {
      const words = clean.split(/[\s\-_.]+/).filter(Boolean);
      if (words.length >= 2 && /^[A-Za-z0-9]/.test(words[1])) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return clean.slice(0, 2).toUpperCase();
    }
    return clean.slice(0, 2);
  }

  function getAvatarGradient(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    const pair = AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
    return `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`;
  }

  // Optimize Google/YouTube avatar URLs dynamically by display target size (88px for 42px list rows, 48px for 18px chips, 240px for 140px detail view)
  function optimizeAvatarUrl(url, targetSize = 88) {
    if (!url) return "";
    if (
      url.includes("yt3.googleusercontent.com") ||
      url.includes("yt3.ggpht.com") ||
      url.includes("lh3.googleusercontent.com")
    ) {
      return url.replace(/=(?:s\d+|w\d+-h\d+)[^/?#]*/, `=s${targetSize}-c-k-c0x00ffffff-no-rj`);
    }
    return url;
  }

  function getDetailAvatarUrl(url) {
    return optimizeAvatarUrl(url, 240);
  }

  const preloadedAvatarUrls = new Set();
  function preloadAvatarUrl(url) {
    if (!url || preloadedAvatarUrls.has(url)) return;
    preloadedAvatarUrls.add(url);
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    img.src = url;
  }

  let lookaheadTimer = null;
  function scheduleLookaheadAvatarPreload(startIndex = 12, count = 36) {
    if (lookaheadTimer) {
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(lookaheadTimer);
      else clearTimeout(lookaheadTimer);
      lookaheadTimer = null;
    }
    const runner = () => {
      const end = Math.min(currentFiltered.length, startIndex + count);
      for (let i = startIndex; i < end; i++) {
        const a = currentFiltered[i];
        if (a && a.img) {
          preloadAvatarUrl(optimizeAvatarUrl(a.img, 88));
        }
      }
      if (state.selectedArtistName && ARTIST_MAP.has(state.selectedArtistName)) {
        const sel = ARTIST_MAP.get(state.selectedArtistName);
        if (sel && sel.img) preloadAvatarUrl(getDetailAvatarUrl(sel.img));
      }
    };
    if (typeof requestIdleCallback === "function") {
      lookaheadTimer = requestIdleCallback(runner, { timeout: 300 });
    } else {
      lookaheadTimer = setTimeout(runner, 50);
    }
  }

  function renderAvatarHTML(artist, isDetail = false, rowIndex = 999) {
    const mono = esc(getMonogram(artist.name));
    const grad = getAvatarGradient(artist.name);
    const dim = isDetail ? 140 : 42;
    const imgUrl = isDetail ? getDetailAvatarUrl(artist.img) : optimizeAvatarUrl(artist.img, 88);
    if (imgUrl) {
      let loadAttr = 'loading="lazy" decoding="async"';
      if (isDetail) {
        loadAttr = 'loading="eager" fetchpriority="high" decoding="async"';
      } else if (rowIndex < 12) {
        loadAttr = 'loading="eager" fetchpriority="high" decoding="async"';
      } else if (rowIndex < 28) {
        loadAttr = 'loading="eager" decoding="async"';
      }
      const fallbackHandler = artist.name === "MyGO!!!!!"
        ? "if(!this.dataset.fb){this.dataset.fb='1';this.src='data:image/webp;base64,UklGRrYhAABXRUJQVlA4IKohAACQdACdASoAAQABPikSh0KhoQltxsQMAUJTdwulB/Tt/sf5Aa5hzD8Xfyk+U+nf0v+x/nf+yfst8K/7N3Rcgf5X7cvfW8R/JP8D/UP7t/5/9F87/55/Y/YL+VP8t7gH8L/in+B/t3+K/9P+H+KL9ZvcB+zPqA/nX9t/6/+i92f+6ftv7lv2c9gD+af2P/49gL6Av7qerN/pv/D/of3/+in9mf+9/l/3/+gz+ef27/l/n/8gH//9QD//9ZOpj+ifjJ6A/ify39N/IP+3/+r/Z9R3rLzJ/in10+w/3D+9/7//De5H++8I/kp/SeoF+Kfxn+x/kz/gv2v9zvaqAA/PP67/ofza/wfoyaq3h/2AP5//Yf+d+cPMYUAv1V6rf9l/1v9R+V/ut+mP+1/nfgS/nP9k/1v5v/4H///+3ymell+25eCZ11RV9j5b3uL/dRnNRqKOZhRJSqYc5OThmtrB0fEUbNgcrGuAt4f9uxjGJcZY0LNo+trTCqBGT5WNicv7jALiV6m2S2j0sCBBMPPxO7bOQCJCef8nAcsb3WoV9ivIPfTBkdHQAytraiWeggna7T/CiH8uzAHuV6YDw2PTVsaGI0Yo6oVdNG6hBw17TvJex1dgfgl2ivDpsS/a9TYHUT24j3MiJfH9wH8eaxAbZluelUmEcCUUgkLAJA5vVF0Mmvd+QysL/KgqoRhBHW7aUPaJVq7gev373QCnkBJSF6aMKGkVWY6N/Auuc80F+V3oJnghhYj0UigYTvFQk0JzjcPxoJ3TloQpmVlLuSFFjSH1k0nu3ExTV3ZxM7/CimssMukFVJ7ck+6F1Ze1kbxEfMVhPaQ5XUbqPJ7hZODIpOohcGgljkUfD3LCCh6JLMGQ79JNmU4nGZqk+1XI4/YvBPYh8i/nozBcFDYHiD+zUWlh2f4fEAyhnzYcx8aBkZTRqGWgNSP+qiNiT4bpFU3onGugfJpkXtrLsxz+hmkv+klDsaCX9jXgnnZVK/0HvF/M+ImenF+zSysRW5Cdi3J3/fcJ9IOKQncu5MT4kdaDcGHYVSs3DKVQ9//HduJDQBubxSC5xPbMFaQVC/56xLtJaBRovCbfojHEfgJyIwOMeqJcXLkK0T0T9oJBhwSWW3RsNHBe2bVQtOWczJEFjJk8llt4DigFs+i4UW0nLrttFY82sZY0YCeaMf8alnom2125Ef07ozPnZybW95Tcfzb3upL2DRgEYI3EbhKiBQO9Y3QW2/zf6VIjL//P9E2eAAD+/+WymC3UxUFLsurYH59GsQ6jaJ9J0rAnYN9+2+EQBQziBaS04oyMQdEufyiMQnGM/AUu++hI0pn1wmY6nIFpj7NQIfa/smcBrWqu1wNaUK1Jfxs+b84ZMc8LYuMfP3O5CYu+375pF1H2mWBIUDzmq5sMbcREL0ZVvpwIAUrTUWPY6XQ6BUtkVAvEkkNpfvE5TlQL4bjmUjNKwhpidd95+5uSYimuD91BomZQnaZXZcDG7izmp9kBLB3fpC73m9/5doWStRPlDmYUvj0pbrXePfXTv20zCAqiWXIg+aUCK6HlW3nrVc/qgiOCqc26DT0Y067eysQOpf3kORhE1893k+5OJiJt0h64TZdwrgRl2NFjrU9c+h1+z73auniziFm3pU2lgnOXk0DzUNYwszPel5zwZJcr+biCds2Bio+o1BPYTma//8ZNu+NXx/OdrBpScwwXe4KK6Ut47msWlxcowLxvL5DL+bcnNHvWydQGW7FiyS1ABwhRX8uLLevlpJ09h55/5thgXukG0rQsCJf20+SJM83xyVD0usZjsYpL1FgXblWgAAMIRaEAf1tSVlD3hE3GJvC6Ywry5ABMPwOyLNEdzVsKaAUOC0V+YE8NOjvbQBbSavfhRevmj78TB+lJ14v2cHkWZoFUphJPNgelszXTrg9w5vHCBCpzs7AAVLLrV5WfUV3GygnWL/SR54KeTL5mHxuaAjBtAlU+7bsCuPrMurQQEgc8qXhLesQHJy3UerqxawCTbx4tlthUHEQlsuT5LJ4jzjUk4y/Arnank2nCj4986ykq1Pch8Kw12UFYpdJfJbvAHy1z56plks2XU6SpmvPEoXu8GPhqICnx7nBRs3NdOIjRpLmBeamasBkA/vnukjD/eceAIOHuIJ8h3vwKaDbDgASoAquraZ0fSHEjodIj+ComsJZqTyLcPdJld04lrFYdm/dca2Ed3ADOm3FTiB2udmfUfjr8Dk+X1a+S4HygQd4S8bXFXgp10ze5KdwJGcLaEdL06nk8tKMYFEOE5//1Wm/4NcNgzDtWIsBLoldbBeoqn8cqFKKL9WC7kD+Ad6epBlsyrgHGYanF6LeZ4+chTfou1kYIEwrPuh2ZWxDBKSZ3wA4FDrcT1T7AfsmweDAa1PKuDNQ63x6BHVy1vzfFQBG7QU+/Y/ddFonBk46L+POpl/7aBNN2oldmFDcrfh9xhHi6nyCZSYQYMAuJtqeUoZPsQt40TztpbWixCt5Ogu8R56QVIvmioIfzHDW417BKBsWO8wUjJ3D/8d0NoeVwuRjOTzHdhWOR6KaflFj8/KSxrT+XfGMFpaVkzcSOTBO1HhWTXJV5smaCGVEZRqfXL+7rpvVksDeKu9u/HT68/iXMYU4wymGNB1N8bpR0J3TD5vJxpSjx8SiIg1RQMBcpYg+DPRZX0woJnDCVyFcpGPqN4dCU3vlZ2CAxZWEsHuGc9lagronLH9wkgDSuoOx+03nx1JTn6d6doHxOkkcmpPCiWm/DmY9jjTxnUfgtQJF2pQar3EwhpJ+s7xDJckx3NaEzxUHyQ8G6GUdntkKcoiJh6mRZORUrij6VUAs/m7bPM/DQ1f4VvO3aI/ZHAnGyirofRMOS8Xe+G17CQv2r8IKLZDRCo/rBd6LYQ3JlqscJIIPR/zbYgz06mbGECXpyiOIuKUlZuolwnb1W9dq2hkpjB8OVSZQqh6UUyWwixjA5phUHuaL3iybw2ZwACnMfMp1LdORY9/2X2TfxicNd3VP9GCXZlQbw+iftE9eAAZh2mBamSumJJj/ikEIumFScegD2r4l7fbSXcFuyVmwTgOSooliMiUXqxa8gWSFXuel/2WvORnpxmi7eeZu6lJA+Rq2PM3kePdf5+OxtgAXECzmlO5I4cXwH85pVJe+zwr9Y9G5oJnl5bIcGjg/Vb1GRenN6vALI/uvXKs0I4k0ueQkTm6LfIKGLC36zKGyiQxQHlLGV0WuCiLAz/E21Ife5ntz8ZgHR262+FhcaBtxIKfWEpodrc75AhT6MDEvF3bmFh4GCKlHMbtRW4sCHGv+vpPTjuf8YPEJ3DH7h+OcmKAEy5RQzXfwRtMF2RTdk0mCCDckoW8GrYsiL4j7o/QZQqhk2xbmIgm6xZPBUSOm4HKCdZu03tRGuBLQ7haLgvuEx6KQ4ccaAAGAOIFPtSE2vdvOmW6OE6gxcX463pt+WKhuQfKafIy3gopYaoWNhujmmSYOVfO0RTCjthFiF14BDsvMyz9cuhY1HvQIl3YO8LxyVqJnn2Bbi7kky+uCDAj/HntVshIBCheaxXTzS9D7EBEQhaLHujVSQO1PFFA7J/hSvtWBht9xlCh41z0j5cRu+RJjLnWBDMrCncp3Siz1KZ2gJHLmL63NU3psaGgAWFrRLmKn1eWi2bKjNJqRmOl+9TzGQdQE+SkrouJuxkYE0CtXelkCQa1tXUfUK0V8gG49djaS/NreE/J18DH4JlVSDOGIgc/WcBGnb6eZXEzWXnIZN2rNzJTaqUN5wsu81AendYYmSF88dQeesclaB5h3NX45i4POeMjdRM3+UVRnPurAUwttqSKUA/CCVAJUQQ1UvLGUIvkms+AmX12ThM1yWhNluF22++YIEr++yMydUbCXfE/kwO10zysgeF4/VXCDjBu0pyufs85cTXdVSJpYhv/0klmb1Je8o49I9o1Ae0WYCuPtS551oUkz/rrxtz391URuDEivPAYoUsZ3t9nZ7jDuzncYW9RxOmdNGsB56gPJz+Q4xoKn3Rj46OshS64F9xB6CFLeukT4auY+2UfxuXcDHf1LWYOGpMN+Qn/ISXuykEUr7oJ0T8ckb7ukinY7sfHvj+IFi+wa8ePlVD3WdCqHg+7nUdwOcI5uXaEIgXC/9saWmkPeIRBO9PzWnB0mOVeBECW/gqA8u83iIY2XKhdhc2/wM6EHFgX1LAJH7YOGwSv+bTgZnCnB4+yWJsg0xG4IWFH56H+mUiM7V7cg8iwIXJN+PwTgv36XQjKCuCMUhcLPl8mua/ea5H1BQ4oTv/G7awM6SbMklIednYAQTdSd4Pam71C7il77lqGUbHzEqW2PshXMUU3B9Y+XiyS9XJ7ZsLVqqgej3m6l30Pwiwu44UZuNQV9MLbgrWw1KxIAX7sAOm2cg/tpngJHr3LqqLWtD/2lvg6wF/PELrG3nWrM1c8ueVHrJjce/nh3EJWQkXMeQbdVbe0IzCJQFT+SkP1x22ndYywdc/yjDClt/ckMaX23wdAs4BFTsMzhcbkDSHBoqm4ZhxCSeD6Iy+kcxCaubRbkHEmIJwzG0ysT+i+++r5vtOEGBls6X46MZiig+K57u7Sm50Jd9xeYu5iGvYIWHFJmIlVbT7iK2sqsAn7FU9MM3/dLFlCDknoHxLDEQLWxtzyno3V03yOW9BVoRO7Pd0kmUpWyFCaYRQhpqg6mXn2luWAX3eGFeEjRpT0XW2eiDKJY9yjXaRPNJAFzOFXLE+/3gbuRZKyCWnV+uMH8ENygf+yX3gWvzM31twvi+rKvqfzNugQLViL/U6fiPyLJ58fBEE7eFYAcVXgIp/ZHMjw7nWfNF3GbiKkma5QxkPYCPk37ZkS2EMxmpk3gl+MIJja4saJpOiS1ScmNHhmodpltT7a8Iglbrh6at9/Zscsj87n8pv6DmmY/Yt8i0/BBIbMrSluF2YViEFkbLBCeNBNzoad+ecvEawaVdm2OXUrTh+mEOtDIp6AhKnC9ghieh7JTB5i9XHmCsQRQ8xPbU+RtSqZzx8MKl+HK2Vu5kTHHWYCVSH7oO7PFBKnQDsY/85T56mU3Iagj39k7KVOSCsDkXwsSZ6B5j1JlttEUFweOj9IoviSz8dBxh/FJJaC/B/5Xle67jr6GgRwgpfdSrUQ40dc5y9DnzOnr5ooAcAwIe+87TrcP5+7TReAli3PpEb6n8WGJnVcIB6JK3pw3fNK0W32NskquPcn1jFl85To7SxqpGkqikgnL30MqjTVbbGMqZc8Ul9t8CVnxn73iYx9M8p5fuVDZXvHu+0OJP9FcJg9bw6Yj+a4BcfP6S8rg20tieUzx16IMdqD8Vb5HCpWmh3eWcA77Ids6sit380vzH7Lppz/Ts6MVfmB9dMyouTR2reuPRjAdGXP3HatMNMYWMREBitoLn4AMDQEuRIadulLGDN1vHXBI1XCcVdgcENMwPEf6b+2psWOxDyD1YZ7MP18ujxkEb7sGdjaoE3HkHBDqkLip4BM/xBAJpPtpYZOThw8hLKz/RH0Z6MoAyb28jBy240KA5A5fcbHJCg+uZSWDHAqFoQHvonfcokOBM79Uk/VUQR5SR13OhqGrvopEnWbJ39PHj3iJ20qVZ6LE7JCaaUGWBlcLoJZ4jnWzFw83pIQpeQ+rVZg5GMkB7S8vZ3BXIQCd5WBVDAqxFV8CeJhoBg/Y1QYnvTcjsm48IW0Hqt5oiTNonV2ZcTpukHtVV/k2J/cawWHkV3L7ODLvmtFBmTpH0n+ddIQ2J01AcMbCEf+xz5Jd3CDHdHSl/yUoNJ+k9DNoDUKUDkoga72HWeS7OSeHFXZ1682YBwKOvDzL8to37R8OOol9wDaNtOG3/VBbIO5oY/S/f1DZ1pDL9akbcHbGzh4JEtnIlk13wISqnvwAXyp3OTsPH71fa1NupTvifWGZlbVDblpSCHHkQ7yePNK4GqL2UVnCe7X1OvoA7kIi7XhqeUeQ2CWie0eYJ6Yk8NcRkhXhoG8UtYIM4n+O7dWMF9sDvcuhagfOiyyD7lZbg/ylGcZwEWQiI4yEE8qHFEgqg8L5YXSUM9SjGrPk+TFSOyLD2mFFVFufW8P/XUADV0RGiD5BC0JLR0Wuci3ADfDuUUV+JmtydVEkUe94VUMNraSUqtBsrh9zT1XAe2V5v9+2rZvAQuXoAqDyxbvtGGrSmeIR88trrZLf8huXbVQI0phQ6sGLAqcf2woksFur7YqlWx8uwXRCklLZ2TO1s0pvq8JPRFTRdRXApFrGLG3UwKNh5DNLyvNe2xkHPQxCpTKcTKi7TNIWMAyWgKDPKzy7AmIZ0mMx2WapMpnPkdkCzCsgpKVwrPCMe1yjZt+vA/eeR+N8duDu6iO8WfOT7cJMuOQQr/ako0o0+AqqCN3L6O77NHk1loZILWkPLGe0GP8wPQb2vchpXtwEUCF5HFxb04D0d+vgDRL9hpTIP7PaMjXbE0czVCW0jDi0RyVcG9h45ywC9753Pmo0QsOoRTxGpQ715MjTsV8m1Kpivcq5sEo/EkOLMT79uQ+nXHwf/qqIFS5+2yb8aMSeq/Ciw07czeu2ewRJ8BOmADpTzDwQ4PwhJbfaY1kudq8g8C8SXhNAfx0Nn6zGdUcmpWW6KacxorpTPh/RnWy3QGEkTYVd2qI/dqZtmK/7hEHqg21HfQ4wZ685o9Ja2LR1gQOJN1Izrevz9m1e2YkqUE8UyrkftRwSBQlku1XfBI1xbktv/L9w+5P28qDtzcj/HtY6iYsDBdbY18v7rA0xWpkLgJN7UBHP3TK3wfFtTFwpYJ16l9sEhImBMK8vlap6DRKHM5aMw7Oa9f8LDdMJtmIX8glknZzvOVJJOBkICDXhV1u+z2wclwCdW47lEi0deZHlE0iPVe1sbRanBB+jwBC1hYJBdRiEr405y20FkCocSD7KnWqIU2k4WgjJ1it8UKdO++Zu3R84A3uiRmwKMVA7AZzXPPBpPkuENktYlUmnDNFe9Fc1ozWZSx1oGlWq5sFvyYKidpn2aZrQWHvHVxVrKvbhxzc4I2RDXvhA3o4ko3zaqZfUM6tTheesefBi8HF4wxiUc/Oa3bpwzjDuYaA+0bo01BSnCY3j/qe79UnMkXxyYJ9C/SpgA4u7sAQMzF2MV2OP7202eZO5H+MXaff4Eag4GilAi9veYDkRLLf+FPEq+5ykHmF9Ci5/cMBumnlcgKBByNAlZkK/0BNQfD9wjS3Kgu8qiBWNyn919k5tQdjuUQTglH+7S8c+a0s4sM8aLn2O2eu1iuKadvunUdNO0XLAG8GnRi+NeoOVWHZqTPnxeCE9AymtQWKTj+6D27IFR+gZXaWm2eXmZ/LL1TrOth414sQpn1BPk3HyH7i2bVDWafg6xtTUDfYP1WcEdsyokT/gvTQLNcylg3Gx2DXqQFkvMu3WGrdVvW5qBHi7oMM8AMRzrvAEE7+WMMP+Uj3wAV5qYGokXvPymtSwAjmgctecmQ8hzFHZ0XONER5QrAeyeI2iWYiI2FLzEZzH5/4Hu2gow64ufxSKKmvIvVpBYaIoEzqYaj04ENwexyj+2TGu8o8o2jFT1ULZtrPMLvFV72T05L1uS1NpZGfJNJKB6WTA+vwi9hd0E/jDBnpMGfVY1FKgGmSB4eeeLAHsYb29M7Mg0bEl6Z//QktP2kCNCPRZdmYaRMTY94c79Wg5lob/xzZy2B8cd2uB3UDqPBUOqBWLkeE5Cmv2JfyM+AJkvS54fXvYatiyziqlI9XuJ/WutbIeONSzThf1sSafsAChF1y33izpLDtwKB3c6CteC/o0orSzHI3DdzAhEYk0GcWZCS6zmJMletoo2qwH4nC4+bcdYAkJg7Y/CV/qM/gwxQMITfNOuFX4njF+XhsWCZ/iQn/LuLlpZzHXDvNSLBQq5F5e0PIM2jALGDvsUy4nRvLWZbI1kdp5SCReRVJ6O9mtkNdu8EEyP9qbCE61vUTjGiMMB/WLPYi61xS6Qp9PvH/jw93G1VFhyZ7ZbyytKQSfavwM/5XqV3HbuFmtZdeHMTxYyi7VVrclp5h0Dh4h4HcVLm+lJzbJ1OY2vZ9axuEKQ6AkmR26Lf2OT/QfBMmZ3yJ4YtVRn4JYvQ4G9hcttOGSew6tQZFCTxEM9ZHiGjNmbfuX7+7uLybAInGr7HeFHuib/+rTvdxRKcSi93gPhKiM/z3TJ2oRFIaNz7PGjF7WppoYA/KymNxbBAfo77Hrhxrz+2+W1UcRiUKCLRju4Thq/8tJ0mnCPgstB6pwGUaPS1Vp6Ym0LhJN0vOiG6wf3zn50vEQgMuVTuzobxXfDbEH2xtlfNclyMrQlckb4xRA/HG4nWnCQHUg8ng3kgRjZ+oFTGScj2dCirhu0zQifyFWvt/tWIeTTF7SMUnVl/X18+pPpXv8WrTBp1kt0tYQd6yM+RSDhRnT9EnqH+p0iBLKiQ4SCO7XNh2JfiQypxGn2MM07IPE98kZWqx4079fypSDhyOf8zZik6ntOht7BzMpc8mnDDaZJXQS3TI+y8rlvEproEOdPPivByhYu+IUY4X32Yrr8a3w4/TMWKxD6+q7cLp6kCAsNL8+4s1sltGkK1VVHSnznmmjWltPfRf5u88qHJOZ3L3l/Aic25EJ+FNI07bn6+euHZrNkfKAGXxFqJ3aqSvgsNpolbOvnmDoCYDQqo1jUd01qfRBMHBsjRwb1L8Z09VvuV1SGcHGzMgs0/8a57RJjSQ6nCUo044E3Q9M5iIxXwfhYxlNg8Ez21huTejHpSIdFQQYceJBTNWdeWKUVDq7f4VQGUEmdscwI6ViJlwdN6BWBQkVElwKTUl36iYHmAjRU4LFpIV14kE488PPXCqq27yTseze87QWItMg/VsX90WMEO5YJRXknKjdjmrh7CkhG+dVmT2LsAU10ApCZqWjrh6vVKa6sCZhnb8cpSLMsgijSUIctP9/FKmsKWWj8guk30PYenjGJbVQbfIKCsmZQ3MBTWM9ULTbzM1hIlf5fkGyDkBn8GIcbDhtOtwPizAIVqj+hxyQ3jlvP2viOwH8j2DwcDksApSbxT6l+WfxTC8GQpprvjj5+RwL8s7bhCGJ7GYI1x+hYxlR7teCzNZDvmoZ35LFKhP0hioLBA7Qkec5ZByN3HD+FFhG7MlF0btNo3YHLt7XGH+on87Z7ir2HGv8GP2cQkpseT4XyZ3fqBTFGzqsCZWGonV562kEg/SGE3geUa+RQKucumAhEepmPqrAXYD9XxXfnUbfp+Cii8mJnMJw2Imf5u+nGGLN8x1AZXfe752L8lLBR9Kt+PJ6MwAYXL2chSuifUrofA9UjgUvxpwkGZiadhNXCAIMUKGBXA4amzwoRwJY/PeAfSW73Rl3Jq1cz/1VSOj2yA6Z1TsaVVBjfugzk0eyPyz0kP0j05Mvj9VIVLjrdR1a2+tQMDKw9hF+tXiyZ5LU06w/qZgKUgLYSlO7yrrXoXjc4aVZShODyRr7QAI3Kh1jBdM8o9BbV1A85TFU6/UCD1aonyhqNMMcv19ayyzmWRRNXd77qJ7iPSFXvdvN+pvJ++XMKmryt8hrXy/49RBr/9abAGyvLibaAKRN0GUES3jxdU0wG771lNX5JvuyNDVaHyOZpWdc5MAAFTeB0zNDvox1qHhrxWUQSNwslnPbNuToU5/wT9I1EhCm17yO1jAjAsyDSKoMTZT8Qwmh1A4nuovD2Fib1lsCngJer0oKtfe6pAO2Www6iaD+wi0Nqpc4Cn5aTYYgkoiRHoSoyWMVm/5QjQ3f0FbbgBVkdmRHlCDml1r+C0BLlFn7I8aTeCaJHzhr2vYeiFRrtdexM9/rpHklcteZfZoHCdPOgKLwv5y63tj2v/VJPxBrkuO3fpL2awInhHq8aSwCq+PHizVM/xmZx9mz+wSbyqXovRP+riCnOPINWtTAtraMBDG1TP8tTB+AQcAGstMPcBR29Ary/sjJmHASxxccvPx/5JwDUof3YdMIAfnxf+e3W5k1i9BX97InxNPjE7nH//sX8DyGLdE7Ycq2mr6fbcmHNsUR4bFOzG3aqeAf5G7WVvb/5VdSeu+J6cg+reMuEHu/33Mrd2ElKh/ha36touripwYHxm/UPs2XYfL+2ewj+I/A/fi5GfVJ9gpJ3aPsfcVSGS5TKWugN96Z/EarIC/pd+2HrUBkWMe1Wg272y3ePx4tWdTl7cXqFN9b9hhj3pRTyMMst68ggSQjjX+8SdyxPrYL7EvN5PczYvtq91gz1tp46Uyvk90arBrxJfI+0sS2GwBkewWLlPNXNAr0Cmu6+7b56/jhmu+E+58Yeptaec6zGPEHyknRBan+wL84qih299DLCNDiGKAaldhrFQz8nq/DiQHHozYjCZvn7UzHfPslkjkca7ogtygoldMoIlkvn9iZduE5WVcUpQdndzLQvkAIL+3Hu19ScGHyoVNbPZ7jk/5NNNVProw1bAxPQ5WihVkWMzhSsjiWSJUIDIunBg91qWl2LBL5d43uCbkngNnBMfOXQe7VbhAqq/ZG/OQI8zTPBfXQy8J+n5FDLC3BLwaoyu3XvSktahzcyfBgLSvZq2qmRdaEkQLF1oOlBT/PVjP2+UMmmr/3YgPfK/0v2ONzK8nAfLO+XphHWOMCw/7/v7pMBw74SeESiyI+KhhdTL1FC4xb1ezY/zGBtYEQltASKpTWmlv/soR1uQZ7e+iTOHEQlv0HOLIPrQuXT+xjhPt2P4CdvmhzWfgVR1Xp7mz5DHgX2XZ770HbnM/oTLsE4XDv2G308hWNS9v4tdhd7b79qlIY/dCYymAf0MxSmMxttfB800KtGjxLOkIS/kuipsg9KCAgnl7CaSnHojpwjqmubVDyN/vxoej0SQxL+B9H1eiAGbIqtpjopIbFcmcj5PywuwCth4EpwHq/so005l/xCE3BYPqjRhDu5ErYJNtPu43wx+9JTLhKfl82M6jwQfCIf4SM7SKNBYe6PdET/iqXEo4mUavfNhAtSLYQ67DuNmjo06yPQRz/B9SKtnXUCa6P7f4+bqPb+rOJ9RejqZTbLUiIPEDqMVYGQAbWBbvB2ELBHv60WELttAkuSmE3Mn6k0keGPL1kPXL/QtOqR0ocMNvTwL1PAwoHB35wajAnN38An28pIssYUX9e2tSzROKlP/grduiJVPE4TxdHIYMXaH5kCBKr3oUs8MTU1hdaJ2gbO7T3T920c3iJZBxb1xNieNowuUIgXKVbYthGxE6XlD2IUX9+CxbJ6mju+oFBhze3X49ysUyJEunSB2jU3mbiCiQMsPfQC4Jr54Ja6MIBELj2azvbylwTUGu+2WbuWGeuW1ybM88Ln6tT71IZX4G0KWpiY0QBa2zeKkpe/aI9IPCcZNC4bR0/ApSg4Y3XHGSFMVtS+NvMgWTTERapBLjrN9KhGi8dK/blSBBdOa7SeLxl0cEJXpS6NJW5a/kEBKZTJ5bH0lkNEMAF3+eIYvsw1Wb6K9RAAAA==';return;}this.style.display='none';this.nextElementSibling.style.display='flex';"
        : "this.style.display='none';this.nextElementSibling.style.display='flex';";
      return `<img class="row-avatar-img" src="${esc(imgUrl)}" alt="${esc(artist.name)}" width="${dim}" height="${dim}" ${loadAttr} referrerpolicy="no-referrer" onerror="${fallbackHandler}"><div class="avatar-fallback" style="display:none;background:${grad}">${mono}</div>`;
    }
    return `<div class="avatar-fallback" style="background:${grad}">${mono}</div>`;
  }

  // Format representative song title with " (cover)" when songType === "cover" (never duplicating)
  function formatTop5SongTitle(songTitle, songType) {
    const base = String(songTitle ?? "").trim();
    if (songType === "cover" && !/\(cover\)\s*$/i.test(base)) {
      return `${base} (cover)`;
    }
    return base;
  }

  // Helper to check if any 50-on or Alphabet filter is active
  function hasKanaFilter() {
    return state.kanaRows.length > 0 || Boolean(state.kanaChar);
  }

  function hasAlphaFilter() {
    return state.alphaChars.length > 0;
  }

  function hasAnyIndexFilter() {
    return hasKanaFilter() || hasAlphaFilter();
  }

  // Auto-sync sort order when 50-on or Alphabet filters are selected/cleared
  function syncSortWithIndexFilters(triggeredBy) {
    const kanaActive = hasKanaFilter();
    const alphaActive = hasAlphaFilter();

    if (state.karuSpecialMode) {
      state.lastIndexType = "";
      state.sortBy = "kanaAsc";
      return;
    }
    if (!kanaActive && !alphaActive) {
      state.lastIndexType = "";
      state.sortBy = state.savedSortBy || "countDesc";
      return;
    }

    if (triggeredBy === "kana" && kanaActive) {
      state.lastIndexType = "kana";
      state.sortBy = "kanaAsc";
      return;
    }
    if (triggeredBy === "alpha" && alphaActive) {
      state.lastIndexType = "alpha";
      state.sortBy = "alphaAsc";
      return;
    }

    // One of the systems was cleared, but the other is still active
    if (kanaActive && !alphaActive) {
      state.lastIndexType = "kana";
      state.sortBy = "kanaAsc";
    } else if (alphaActive && !kanaActive) {
      state.lastIndexType = "alpha";
      state.sortBy = "alphaAsc";
    } else if (kanaActive && alphaActive) {
      state.sortBy = state.lastIndexType === "alpha" ? "alphaAsc" : "kanaAsc";
    }
  }

  // Filter & Sort Pipeline with Exact-Match Priority

  // =========================================================================
  // v71: COMPOSER & ARRANGER ENGINE FOR "かる専用モード"
  // =========================================================================
  const CANONICAL_SONG_CREDITS = {"Fire◎Flower":{"c":["halyosy"],"a":["halyosy","is"]},"Snow＊Love (GAME Version)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Snow＊Love":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Beyond the way":{"c":["Giga"],"a":["Giga"]},"Ready Steady":{"c":["Giga"],"a":["Giga"]},"Shining Phrase！":{"c":["Q-MHz"],"a":["Q-MHz","伊藤翼"]},"Tulip":{"c":["石濱翔(MONACA)"],"a":["石濱翔(MONACA)"]},"slash":{"c":["馬渕直純"],"a":["馬渕直純"]},"女性VTuberが歌う】Monster":{"c":["Ayase"],"a":["Ayase"]},"怪物":{"c":["Ayase"],"a":["Ayase"]},"Dec.":{"c":["Kanaria"],"a":["Kanaria"]},"ninelie":{"c":["澤野弘之"],"a":["澤野弘之"]},"アイデンティティ":{"c":["大熊淳生(Arte Refact)"],"a":["大熊淳生(Arte Refact)"]},"冬がくれた予感":{"c":["佐伯高志"],"a":["佐伯高志"]},"Booo!":{"c":["TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"Loveit?":{"c":["biz","ZERA"],"a":["biz","ZERA"]},"One Last Kiss":{"c":["宇多田ヒカル"],"a":["宇多田ヒカル","A.G. Cook"]},"マシュマロ":{"c":["DECO*27"],"a":["DECO*27","tepe"]},"不埒なCANVAS":{"c":["信政誠"],"a":["信政誠"]},"再会":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"GETCHA!":{"c":["Giga"],"a":["Giga"]},"POP IN 2":{"c":["照井順政"],"a":["照井順政"]},"SAYONARA MAYBE":{"c":["ツミキ"],"a":["ツミキ"]},"main dishが足りてない":{"c":["ツミキ"],"a":["ツミキ"]},"お呪い":{"c":["なきそ"],"a":["なきそ"]},"とんでいっちゃいたいの":{"c":["佐ق木宏人"],"a":["佐々倉有吾"]},"アイディスマイル":{"c":["とあ"],"a":["とあ"]},"オタク is LOVE!":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"ラヴィ":{"c":["すりぃ"],"a":["すりぃ"]},"レクイエム":{"c":["Kanaria"],"a":["Kanaria"]},"絶対敵対メチャキライヤー":{"c":["メドミア"],"a":["メドミア"]},"蒼穹のファンファーレ":{"c":["梶浦由記"],"a":["梶浦由記"]},"Beat Eater":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"Brand new!":{"c":["烏屋茶房"],"a":["篠崎あやと","橘亮祐"]},"CH4NGE":{"c":["Giga"],"a":["Giga"]},"Close to you":{"c":["niki"],"a":["niki"]},"DEADPOOL":{"c":["春野"],"a":["春野"]},"RADIANT FORCE":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"SOS":{"c":["TAKU INOUE"],"a":["TAKU INOUE"]},"STAR TRAIN":{"c":["中田ヤスタカ"],"a":["中田ヤスタカ"]},"Starduster":{"c":["ジミーサムP"],"a":["ジミーサムP"]},"magnet":{"c":["minato(流星P)"],"a":["minato(流星P)"]},"snooze":{"c":["wotaku"],"a":["wotaku"]},"おもかげ":{"c":["Vaundy"],"a":["Vaundy"]},"アンチユー":{"c":["Chinozo"],"a":["Chinozo"]},"ガランド":{"c":["ピコン"],"a":["ピコン"]},"ザムザ":{"c":["てにをは"],"a":["てにをは"]},"シンデレラ":{"c":["DECO*27"],"a":["Rockwell"]},"チルドレンレコード(Re:boot)":{"c":["じん"],"a":["じん"]},"ネバーフィクション":{"c":["Kanaria"],"a":["Kanaria"]},"ノーザンクロス":{"c":["菅野よう子"],"a":["菅野よう子"]},"ハッピーミルフィーユ":{"c":["岩見陸"],"a":["ナナホシ管弦楽団"]},"ファイアダンス":{"c":["DECO*27"],"a":["Giga"]},"プロポーズ":{"c":["内緒のピアス"],"a":["内緒のピアス"]},"ヨワネハキ":{"c":["和ぬか"],"a":["100回嘔吐"]},"レディメイド":{"c":["すりぃ"],"a":["すりぃ"]},"化けの花":{"c":["なきそ"],"a":["なきそ"]},"君に、胸キュン。":{"c":["細野晴臣","坂本龍一","高橋幸宏"],"a":["YMO"]},"正しくなれない":{"c":["ACAね"],"a":["久保田真悟(Jazzin'park)","100回嘔吐"]},"疑心暗鬼":{"c":["梅とら"],"a":["梅とら"]},"蒼い鳥 (M@STER VERSION)":{"c":["椎名豪"],"a":["椎名豪"]},"逆光":{"c":["Vaundy"],"a":["Vaundy"]},"ALIVE":{"c":["重永亮介"],"a":["重永亮介"]},"Absolute 5":{"c":["sin"],"a":["sin"]},"Biri-Biri":{"c":["Ayase"],"a":["Ayase"]},"CapSule":{"c":["DECO*27"],"a":["Rockwell"]},"Departures 〜あなたにおくるアイの歌〜":{"c":["ryo"],"a":["ryo"]},"ERROR":{"c":["niki"],"a":["niki"]},"Flyer!":{"c":["Chinozo"],"a":["Chinozo"]},"G4L":{"c":["Giga"],"a":["Giga"]},"Gamble Rumble":{"c":["t-kimura"],"a":["t-kimura"]},"Gimme×Gimme":{"c":["八王子P","Giga"],"a":["八王子P","Giga"]},"Give a reason":{"c":["佐藤英敏"],"a":["大平勉"]},"おどりゃんせ":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"抜錨":{"c":["岩見陸"],"a":["ナナホシ管弦楽団"]},"快晴":{"c":["Orangestar"],"a":["Orangestar"]},"空奏列車":{"c":["Orangestar"],"a":["Orangestar"]},"君の脈で踊りたかった":{"c":["ピコン"],"a":["ピコン"]},"フィクサー":{"c":["ぬゆり"],"a":["ぬゆり"]},"ロウワー/ぬゆり":{"c":["ぬゆり"],"a":["ぬゆり"]},"ロウワー":{"c":["ぬゆり"],"a":["ぬゆり"]},"携帯恋話-まふまふ":{"c":["まふまふ"],"a":["まふまふ"]},"携帯恋話":{"c":["まふまふ"],"a":["まふまふ"]},"命ばっかり":{"c":["ぬゆり"],"a":["ぬゆり"]},"てらてら":{"c":["和田たけあき"],"a":["和田たけあき"]},"メビウス":{"c":["柊キライ"],"a":["柊キライ"]},"阿修羅ちゃん":{"c":["Neru"],"a":["Neru"]},"おこちゃま戦争":{"c":["Giga"],"a":["Giga"]},"ロメオ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"い～やい～やい～や":{"c":["Neru","z'5"],"a":["Neru","z'5"]},"アングレイデイズ":{"c":["ツミキ"],"a":["ツミキ"]},"D/N/A":{"c":["Azari"],"a":["Azari"]},"マフィア(Mafia)":{"c":["wotaku"],"a":["wotaku"]},"おやすみ泣き声、さよなら歌姫":{"c":["尾崎世界観"],"a":["クリープハイプ"]},"舞台に立って":{"c":["Ayase"],"a":["Ayase"]},"エンゼルフィッシュ":{"c":["パトリチェフ"],"a":["パトリチェフ"]},"ソラニン":{"c":["後藤正文"],"a":["ASIAN KUNG-FU GENERATION"]},"[A]ddiction":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"月のワルツ":{"c":["諫山実生"],"a":["安部潤"]},"トリコロージュ":{"c":["煮ル果実"],"a":["煮ル果実"]},"おおかみは赤ずきんに恋をした":{"c":["ひとしずく×やま△"],"a":["ひとしずく×やま△"]},"世界一可愛い私":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"貴方の側に。":{"c":["りりあ。"],"a":["りりあ。"]},"若者のすべて":{"c":["志村正彦"],"a":["フジファブリック"]},"ラグトレイン":{"c":["稲葉曇"],"a":["稲葉曇"]},"トキヲ・ファンカ":{"c":["takamatt"],"a":["takamatt"]},"二時間だけのバカンス featuring 椎名林檎":{"c":["宇多田ヒカル"],"a":["宇多田ヒカル"]},"敗北の少年":{"c":["kemu"],"a":["kemu"]},"Mela!":{"c":["peppe","穴見真吾"],"a":["緑黄色社会","横山裕章"]},"ヴィラン":{"c":["てにをは"],"a":["てにをは"]},"Shout Baby":{"c":["長屋晴子"],"a":["緑黄色社会","Naoki Itai"]},"ヲズワルド":{"c":["煮ル果実"],"a":["煮ル果実"]},"メルティランドナイトメア":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"さよならメモリーズ":{"c":["ryo"],"a":["ryo"]},"アウフヘーベン":{"c":["大森元貴"],"a":["大森元貴"]},"SPECIALZ":{"c":["常田大希"],"a":["King Gnu"]},"Q&A リサイタル！":{"c":["田淵智也"],"a":["古川貴浩"]},"青空のナミダ":{"c":["田中秀典"],"a":["渡辺拓也"]},"Get Over":{"c":["BOUNCEBACK"],"a":["矢崎俊輔","中尾昌文"]},"to the beginning":{"c":["梶浦由記"],"a":["梶浦由記"]},"シャル・ウィ・ダンス？":{"c":["ReoNa","毛蟹(LIVE LAB.)"],"a":["小松一也"]},"デーモンロード":{"c":["Kanaria"],"a":["Kanaria"]},"Tot Ⅿusica":{"c":["澤野弘之"],"a":["澤野弘之"]},"心予報":{"c":["Eve"],"a":["Numa"]},"メンタルチェンソー":{"c":["かいりきベア"],"a":["かいりきベア"]},"シス×ラブ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"Catch You Catch Me":{"c":["広瀬香美"],"a":["本間昭光","広瀬香美"]},"デビルじゃないもん":{"c":["DECO*27","ピノキオピー"],"a":["DECO*27","ピノキオピー"]},"わたしの一番かわいいところ":{"c":["ヤマモトショウ"],"a":["ヤマモトショウ"]},"ポニーテールとシュシュ":{"c":["多田慎也"],"a":["生田真心"]},"再会 (produced by Ayase)":{"c":["Ayase"],"a":["Ayase"]},"フロントメモリー":{"c":["の子"],"a":["神聖かまってちゃん"]},"たぶん":{"c":["Ayase"],"a":["Ayase"]},"春愁":{"c":["大森元貴"],"a":["大森元貴"]},"ヒステリックナイトガール":{"c":["PSYQUI"],"a":["PSYQUI"]},"凛として咲く花の如く":{"c":["TOMOSUKE"],"a":["TOMOSUKE"]},"イカサマライフゲイム":{"c":["kemu"],"a":["kemu"]},"ひゅるりらぱっぱ":{"c":["tuki."],"a":["usami"]},"蝶々結び":{"c":["野田洋次郎"],"a":["野田洋次郎"]},"ウミユリ海底譚":{"c":["n-buna"],"a":["n-buna"]},"君と夏フェス":{"c":["宮崎朝子"],"a":["SHISHAMO"]},"＊～アスタリスク～":{"c":["ORANGE RANGE"],"a":["ORANGE RANGE"]},"I LOVE...":{"c":["藤原聡"],"a":["Official髭男dism"]},"暗黒天国":{"c":["片倉三起也"],"a":["片倉三起也"]},"堕天":{"c":["DJ松永"],"a":["DJ松永"]},"KINGS":{"c":["atsuko","KATSU"],"a":["KATSU"]},"swim":{"c":["GEN"],"a":["04 Limited Sazabys"]},"猛独が襲う":{"c":["一二三"],"a":["一二三"]},"君の神様になりたい。":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"春日影":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"春日影 (MyGO!!!!! ver.)":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"サインはB":{"c":["大石昌良"],"a":["大石昌良"]},"STAR☆T☆RAIN":{"c":["小野貴光"],"a":["玉木千尋"]},"HEART's♡KISS":{"c":["設楽哲也"],"a":["設楽哲也"]},"Full moon…!":{"c":["俊龍"],"a":["Sizuk"]},"ピーマン体操":{"c":["立山秋航"],"a":["立山秋航"]},"Say“I love you”":{"c":["大石昌良"],"a":["大石昌良"]},"深海のリトルクライ":{"c":["sasakure.UK"],"a":["sasakure.UK"]},"SHINING LINE*":{"c":["石濱翔(MONACA)"],"a":["石濱翔(MONACA)"]},"START DASH SENSATION":{"c":["石濱翔(MONACA)"],"a":["石濱翔(MONACA)"]},"song for you":{"c":["さかいゆう"],"a":["さかいゆう"]},"First Step":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"星の海の記憶":{"c":["やしきん"],"a":["やしきん"]},"Pray for you":{"c":["北川勝利"],"a":["北川勝利"]},"KiLLKiSS":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"Georgette Me, Georgette You":{"c":["Diggy-MO'","松坂康司(SUPA LOVE)"],"a":["松坂康司(SUPA LOVE)"]},"Imprisoned XII":{"c":["松坂康司(SUPA LOVE)","Diggy-MO'"],"a":["松坂康司(SUPA LOVE)"]},"Crucifix X":{"c":["배영근(SUPA LOVE)","Diggy-MO'"],"a":["배영근(SUPA LOVE)"]},"八芒星ダンス":{"c":["あらケン(SUPA LOVE)","Diggy-MO'"],"a":["あらケン(SUPA LOVE)"]},"顔":{"c":["木下龍平(SUPA LOVE)","Diggy-MO'"],"a":["木下龍平(SUPA LOVE)"]},"天球(そら)のMúsica":{"c":["高橋涼(SUPA LOVE)","Diggy-MO'"],"a":["高橋涼(SUPA LOVE)"]},"黒のバースデイ":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"ふたつの月 ~Deep Into The Forest~":{"c":["Diggy-MO'","松坂康司(SUPA LOVE)"],"a":["松坂康司(SUPA LOVE)"]},"Choir ‘S’ Choir":{"c":["角本麻衣(SUPA LOVE)"],"a":["角本麻衣(SUPA LOVE)"]},"神さま、バカ":{"c":["Diggy-MO'","槇島隆人(SUPA LOVE)"],"a":["槇島隆人(SUPA LOVE)"]},"Mas?uerade Rhapsody Re?uest":{"c":["Diggy-MO'","あらケン(SUPA LOVE)"],"a":["あらケン(SUPA LOVE)"]},"Ave Mujica":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"素晴らしき世界 でも どこにもない場所":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"Angles":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"Symbol I : △":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"Symbol II : Air":{"c":["Diggy-MO'","松坂康司(SUPA LOVE)"],"a":["松坂康司(SUPA LOVE)"]},"Symbol III : ▽":{"c":["Diggy-MO'","トミタカズキ(SUPA LOVE)"],"a":["トミタカズキ(SUPA LOVE)"]},"Symbol IV : Earth":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"Ether":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"迷星叫":{"c":["長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"名無声":{"c":["金崎真士(SUPA LOVE)"],"a":["金崎真士(SUPA LOVE)"]},"影色舞":{"c":["木下龍平(SUPA LOVE)"],"a":["木下龍平(SUPA LOVE)"]},"潜在表明":{"c":["鈴木裕明(SUPA LOVE)"],"a":["鈴木裕明(SUPA LOVE)"]},"音一会":{"c":["尾崎豪(SUPA LOVE)"],"a":["尾崎豪(SUPA LOVE)"]},"碧天伴走":{"c":["木下龍平(SUPA LOVE)"],"a":["木下龍平(SUPA LOVE)"]},"壱雫空":{"c":["hisakuni(SUPA LOVE)"],"a":["hisakuni(SUPA LOVE)"]},"詩超絆":{"c":["横地健太(SUPA LOVE)"],"a":["横地健太(SUPA LOVE)"]},"迷路日々":{"c":["松坂康司(SUPA LOVE)"],"a":["松坂康司(SUPA LOVE)"]},"無路矢":{"c":["庄司夏葵(SUPA LOVE)"],"a":["庄司夏葵(SUPA LOVE)"]},"栞":{"c":["米倉千尋"],"a":["高山和芽"]},"焚音打":{"c":["長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"砂寸奏":{"c":["槇島隆人(SUPA LOVE)"],"a":["槇島隆人(SUPA LOVE)"]},"回層浮":{"c":["hisakuni(SUPA LOVE)"],"a":["hisakuni(SUPA LOVE)"]},"処救生":{"c":["松坂康司(SUPA LOVE)"],"a":["松坂康司(SUPA LOVE)"]},"輪符雨":{"c":["木下龍平(SUPA LOVE)"],"a":["木下龍平(SUPA LOVE)"]},"端程山":{"c":["トミタカズキ(SUPA LOVE)"],"a":["トミタカズキ(SUPA LOVE)"]},"明弦音":{"c":["鈴木裕明(SUPA LOVE)"],"a":["鈴木裕明(SUPA LOVE)"]},"孤壊牢":{"c":["木下龍平(SUPA LOVE)"],"a":["木下龍平(SUPA LOVE)"]},"霧周途":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"歩拾道":{"c":["庄司夏葵(SUPA LOVE)"],"a":["庄司夏葵(SUPA LOVE)"]},"歌いましょう鳴らしましょう":{"c":["メガテラ・ゼロ"],"a":["Mr.FanTastiC"]},"エガクミライ":{"c":["太志(Aqua Timez)"],"a":["大介(Aqua Timez)"]},"人間になりたいうた":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"R·I·O·T":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"UNSTOPPABLE":{"c":["藤田淳平(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"A DECLARATION OF ×××":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"EXPOSE ‘Burn out!!!’":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Invincible Fighter":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Takin’ my Heart":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"DRIVE US CRAZY":{"c":["上松範康(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"HELL! or HELL?":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Beautiful Birthday":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"!NVADE SHOW!":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"REIGNING":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"mind of Prominence":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"OUT OF CONTROL":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"BLACK SHOUT":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"LOUDER":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"FIRE BIRD":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"PASSIONATE ANTHEM":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"BRAVE JEWEL":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"R":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"Determination Symphony":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"熱色スターマイン":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"ONENESS":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"礎の花冠":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"ときめきエクスペリエンス！":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"キズナミュージック♪":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"イニシャル":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"ティアドロップス":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"STAR BEAT!〜ホシノコドウ〜":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"ミライトレイン":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"Returns":{"c":["上松範康(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"Hey-day狂騒曲 (カプリチオ)":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"ツナグ、ソラモヨウ":{"c":["岩橋星実(Elements Garden)"],"a":["岩橋星実(Elements Garden)"]},"That Is How I Roll!":{"c":["岩橋星実(Elements Garden)"],"a":["岩橋星実(Elements Garden)"]},"Y.O.L.O！！！！！":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"しゅわりん☆どり～みん":{"c":["末益涼太(Elements Garden)"],"a":["末益涼太(Elements Garden)"]},"天下トーイツA to Z☆":{"c":["都丸椋太(Elements Garden)"],"a":["都丸椋太(Elements Garden)"]},"もういちど ルミナス":{"c":["末益涼太(Elements Garden)"],"a":["末益涼太(Elements Garden)"]},"ゆめゆめグラデーション":{"c":["都丸椋太(Elements Garden)"],"a":["都丸椋太(Elements Garden)"]},"えがおのオーケストラっ！":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"ゴーカ！ごーかい！？ファントムシーフ！":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"キミがいなくちゃっ！":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"Daylight -デイライト-":{"c":["上松範康(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"ブルームブルーム":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"ハーモニー・デイ":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"寄る辺のSunny, Sunny":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Don't be afraid!":{"c":["岩橋星実(Elements Garden)"],"a":["岩橋星実(Elements Garden)"]},"コハク":{"c":["堀江晶太"],"a":["堀江晶太"]},"グラディエント":{"c":["仲町あられ","堀江晶太"],"a":["堀江晶太"]},"みゅーたんとミュータント":{"c":["原口沙輔"],"a":["原口沙輔"]},"夢現妄想世界":{"c":["堀江晶太"],"a":["堀江晶太"]},"ビッグマウス":{"c":["堀江晶太"],"a":["堀江晶太"]},"初":{"c":["原口沙輔"],"a":["宮川弾","原口沙輔"]},"Campus mode!!":{"c":["田淵智也"],"a":["滝澤俊輔(TRYTONELABO)"]},"標":{"c":["佐藤貴文"],"a":["兼松衆"]},"キミとセミブルー":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"冠菊":{"c":["早川博隆(Rebrast)","河原レオ(Rebrast)"],"a":["河原レオ(Rebrast)"]},"仮装狂騒曲":{"c":["FAKE TYPE."],"a":["DYES IWASAKI (FAKE TYPE.)"]},"古今東西ちょちょいのちょい":{"c":["大澤めい(バンダイナムコスタジオ)"],"a":["大澤めい(バンダイナムコスタジオ)"]},"雨上がりのアイリス":{"c":["神前暁(MONACA)"],"a":["神前暁(MONACA)"]},"Yellow Big Bang！":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"Fighting My Way":{"c":["Giga"],"a":["Giga"]},"Luna say maybe":{"c":["美波"],"a":["美波","真船勝博"]},"白線":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"光景":{"c":["長谷川白紙"],"a":["長谷川白紙"]},"コントラスト":{"c":["佐々木恵梨","鵜飼大幹","中村ヒロ"],"a":["中村ヒロ"]},"アイヴイ":{"c":["ツミキ"],"a":["ツミキ"]},"Tame-Lie-One-Step":{"c":["東優太"],"a":["東優太"]},"カクシタワタシ":{"c":["東優太"],"a":["東優太"]},"Fluorite":{"c":["Moe Shop"],"a":["Moe Shop"]},"The Rolling Riceball":{"c":["佐藤貴文"],"a":["半田彬倫"]},"小さな野望":{"c":["鬱P"],"a":["鬱P"]},"ナイワ":{"c":["佐伯youthK"],"a":["佐伯youthK"]},"みちなるひろがる":{"c":["いよわ"],"a":["いよわ"]},"Agitato":{"c":["Ryo'LEFTY'Miyata"],"a":["Ryo'LEFTY'Miyata"]},"Wildest Flower":{"c":["Giga"],"a":["Giga"]},"一体いつから":{"c":["大橋ちっぽけ"],"a":["岩崎隆一"]},"ORDER FAKE":{"c":["にほしか"],"a":["にほしか"]},"The Cute!!!":{"c":["金山秀士(Dream Monster)"],"a":["金山秀士(Dream Monster)"]},"Be proud":{"c":["kenchang"],"a":["斎藤優輝"]},"クライアイ":{"c":["GLIM SPANKY"],"a":["亀本寛貴"]},"極光":{"c":["重永亮介"],"a":["重永亮介"]},"Fragile Heart":{"c":["アッシュ井上(Dream Monster)"],"a":["アッシュ井上(Dream Monster)"]},"Atmosphere":{"c":["Heart's Cry"],"a":["Heart's Cry"]},"Wake up!!":{"c":["田中透真(Dream Monster)"],"a":["アッシュ井上(Dream Monster)","田中透真(Dream Monster)"]},"サンフェーデッド":{"c":["長谷川白紙"],"a":["長谷川白紙"]},"Cosmetic":{"c":["MOMONADY","YUKI FUNAKOSHI"],"a":["YUKI FUNAKOSHI"]},"Roar":{"c":["BOYHOOD"],"a":["BOYHOOD"]},"ヒカリのdestination":{"c":["中野領太(onetrap)"],"a":["中野領太(onetrap)"]},"虹になれ":{"c":["中野領太(onetrap)"],"a":["中野領太(onetrap)"]},"We can go now!":{"c":["矢野達也"],"a":["矢野達也"]},"Twinkle way":{"c":["中野領太(onetrap)"],"a":["中野領太(onetrap)"]},"Happy Funny Lucky":{"c":["中野領太(onetrap)"],"a":["中野領太(onetrap)"]},"PRISISM":{"c":["三好啓太"],"a":["三好啓太"]},"スマイルシンフォニア":{"c":["三好啓太"],"a":["三好啓太"]},"Shower of light":{"c":["三好啓太"],"a":["三好啓太"]},"枕木の歌":{"c":["三好啓太"],"a":["三好啓太"]},"無自覚アプリオリ":{"c":["四市田雲豹"],"a":["四市田雲豹"]},"くだらないや":{"c":["四市田雲豹"],"a":["四市田雲豹"]},"平行線の美学":{"c":["四市田雲豹"],"a":["四市田雲豹"]},"ハナムケのハナタバ":{"c":["園田健太郎"],"a":["園田健太郎"]},"Heads or Tails？":{"c":["YUU for YOU","Giz'Mo"],"a":["YUU for YOU"]},"泥濘鳴鳴":{"c":["ArmySlick","常楽寺澪"],"a":["ArmySlick"]},"Dream Believers":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"On your mark":{"c":["EFFY"],"a":["EFFY"]},"永遠のEuphoria":{"c":["オオヤギヒロオ"],"a":["オオヤギヒロオ"]},"夏めきペイン":{"c":["栗原暁(Jazzin'park)","前田佑"],"a":["前田佑"]},"DEEPNESS":{"c":["古河夕"],"a":["EFFY"]},"Legato":{"c":["浅利進吾"],"a":["山下洋介"]},"Trick & Cute":{"c":["志村真白"],"a":["EFFY"]},"ツバサ・ラ・リベルテ":{"c":["山本玲史"],"a":["山本玲史"]},"Link to the FUTURE":{"c":["家原正樹"],"a":["家原正樹"]},"抱きしめる花びら":{"c":["Kanata Okajima","Hayato Yamamoto"],"a":["Hayato Yamamoto"]},"STEP UP！":{"c":["山岸洸一"],"a":["山岸洸一"]},"Bloom the smile, Bloom the dream!":{"c":["塚田耕平"],"a":["塚田耕平"]},"Now or Never":{"c":["古河夕"],"a":["鈴木雅也"]},"Hello, new dream!":{"c":["塚田耕平"],"a":["塚田耕平"]},"水彩世界":{"c":["栗原暁(Jazzin'park)","前田佑"],"a":["前田佑"]},"謳歌爛漫":{"c":["小野寺祐輔(Arte Refact)"],"a":["河合泰志(Arte Refact)"]},"眩耀夜行":{"c":["小野寺祐輔(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"Holiday∞Holiday":{"c":["桃宇アリサ","めんま"],"a":["めんま"]},"残陽":{"c":["小野寺祐輔(Arte Refact)"],"a":["小野寺祐輔(Arte Refact)"]},"フォーチュンムービー":{"c":["桃宇アリサ","めんま"],"a":["めんま"]},"Reflection in the mirror":{"c":["桃宇アリサ","めんま"],"a":["めんま"]},"素顔のピクセル":{"c":["桃宇アリサ","めんま"],"a":["めんま"]},"千変万華":{"c":["大熊淳生(Arte Refact)"],"a":["大熊淳生(Arte Refact)"]},"シュガーメルト":{"c":["山下洋介"],"a":["山下洋介"]},"Special Thanks":{"c":["めんま"],"a":["めんま"]},"月夜見海月":{"c":["塚田耕平"],"a":["塚田耕平"]},"アオクハルカ":{"c":["鶴崎輝一"],"a":["鶴崎輝一"]},"Celebration!":{"c":["塚田耕平"],"a":["CHOKKAKU"]},"ハナムスビ":{"c":["川崎智哉"],"a":["川崎智哉"]},"ユメワズライ":{"c":["塚田耕平"],"a":["塚田耕平"]},"AWOKE":{"c":["Kanata Okajima","Hayato Yamamoto"],"a":["Hayato Yamamoto"]},"Sparkly Spot":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"Mirage Voyage":{"c":["Kanata Okajima","Hayato Yamamoto"],"a":["Hayato Yamamoto"]},"ツキマカセ":{"c":["福田陽司"],"a":["渡辺和紀"]},"希望的プリズム":{"c":["水流雄一朗","室屋優美","Haruka Kato"],"a":["水流雄一朗"]},"ジブンダイアリー":{"c":["栗原暁(Jazzin'park)","前田佑"],"a":["前田佑"]},"パラレルダンサー":{"c":["家原正樹"],"a":["家原正樹"]},"Take It Over":{"c":["LiCu"],"a":["LiCu"]},"KNOT":{"c":["Kanata Okajima","Hayato Yamamoto"],"a":["Hayato Yamamoto"]},"青春の輪郭":{"c":["SHIBU"],"a":["SHIBU"]},"レディバグ":{"c":["渡辺拓也"],"a":["鈴木雅也"]},"Proof":{"c":["法戸祐樹"],"a":["佐藤厚仁(Dream Monster)"]},"バアドケージ":{"c":["伊藤聡汰"],"a":["平田祥一郎"]},"アンペア":{"c":["Kanata Okajima","Hayato Yamamoto"],"a":["Hayato Yamamoto"]},"ド！ド！ド！":{"c":["山本玲史"],"a":["山本玲史"]},"ハクチューアラモード":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ココン東西":{"c":["Ryu"],"a":["Ryu"]},"ノンフィクションヒーローショー":{"c":["要田健"],"a":["要田健"]},"天才なのかもしれない":{"c":["戸嶋友祐"],"a":["戸嶋友祐"]},"以心☆電信":{"c":["Kijibato"],"a":["Kijibato"]},"マハラジャンボリー":{"c":["サクマリョウ"],"a":["サクマリョウ"]},"ファンファーレ！！！":{"c":["Kijibato(Dream Monster)"],"a":["Kijibato(Dream Monster)"]},"ジョーショーキリュー":{"c":["ハム"],"a":["ハム"]},"全方位キュン♡":{"c":["Junky"],"a":["Junky"]},"君のこころは輝いてるかい？":{"c":["光増ハジメ"],"a":["EFFY"]},"恋になりたいAQUARIUM":{"c":["佐々倉有吾"],"a":["渡辺和紀"]},"青空Jumping Heart":{"c":["伊藤賢","光増ハジメ"],"a":["EFFY"]},"ユメ語るよりユメ歌おう":{"c":["山口朗彦"],"a":["山口朗彦"]},"想いよひとつになれ":{"c":["佐伯高志"],"a":["佐伯高志"]},"MIRAI TICKET":{"c":["EFFY"],"a":["EFFY"]},"未来の僕らは知ってるよ":{"c":["光増ハジメ"],"a":["EFFY"]},"勇気はどこに？君の胸に！":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"MY舞☆TONIGHT":{"c":["EFFY"],"a":["EFFY"]},"WATER BLUE NEW WORLD":{"c":["佐伯高志"],"a":["佐伯高志"]},"Wonderful Stories":{"c":["Carlos K."],"a":["EFFY"]},"Thank you, FRIENDS!!":{"c":["TAKAROT","イワツボコーダイ"],"a":["TAKAROT"]},"僕らの走ってきた道は…":{"c":["EFFY"],"a":["EFFY"]},"Brightest Melody":{"c":["光増ハジメ"],"a":["EFFY"]},"未体験HORIZON":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"IDOLY PRIDE":{"c":["清竜人"],"a":["清竜人"]},"Shine Purity～輝きの純度～":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"サヨナラから始まる物語":{"c":["大石昌良"],"a":["大石昌良","岸田勇気"]},"Fight oh! MIRAI oh!":{"c":["Q-MHz"],"a":["Q-MHz","伊藤翼"]},"The Sun, Moon and Stars":{"c":["沖井礼二"],"a":["沖井礼二"]},"星色のカレイドスコープ":{"c":["PA-NON","さかいゆう"],"a":["さかいゆう"]},"SUNNY PEACE HARMONY":{"c":["北川勝利"],"a":["北川勝利"]},"EVERYDAY! SUNNYDAY!":{"c":["北川勝利"],"a":["北川勝利"]},"Shining Days":{"c":["北川勝利"],"a":["北川勝利"]},"全力！絶対！！カウントダウン！！！":{"c":["やしきん"],"a":["やしきん"]},"SUNNY PEACE for You and Me！":{"c":["高尾奏之介(F.M.F)"],"a":["高尾奏之介(F.M.F)"]},"song for you (サニーピースver.)":{"c":["さかいゆう"],"a":["さかいゆう"]},"月下儚美":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"The One and Only":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"恋と花火":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"裏と表":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"Daytime Moon":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"最愛よ君に届け":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"Aile to Yell":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"realiser":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"les plumes":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Lumiere":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"ひめごとリップ":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"チョコラブ・キッス":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Shock out, Dance!!":{"c":["Q-MHz"],"a":["Q-MHz"]},"The Last Chance":{"c":["Q-MHz"],"a":["Q-MHz"]},"GIRI-GIRI borderless world":{"c":["Q-MHz"],"a":["Q-MHz"]},"Darkness sympathizer":{"c":["Q-MHz"],"a":["Q-MHz"]},"星のように夜を照らせ":{"c":["Q-MHz"],"a":["Q-MHz"]},"Blue sky summer":{"c":["Q-MHz"],"a":["Q-MHz"]},"一度だけの恋なら":{"c":["加藤裕介"],"a":["加藤裕介"]},"ルンがピカッと光ったら":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"いけないボーダーライン":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"僕らの戦場":{"c":["加藤裕介"],"a":["加藤裕介"]},"GIRAFFE BLUES":{"c":["h-wonder"],"a":["h-wonder"]},"絶対零度θノヴァティック":{"c":["光増ハジメ"],"a":["EFFY"]},"破滅の純情":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"風は予告なく吹く":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"ワルキューレがとまらない":{"c":["加藤裕介"],"a":["加藤裕介"]},"ワルキューレは裏切らない":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"チェンジ!!!!!":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"Dancing in the Moonlight":{"c":["北川勝利"],"a":["北川勝利","acane_madder"]},"未来はオンナのためにある":{"c":["齋藤大"],"a":["白戸佑輔"]},"ルンに花咲く恋もある":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"ワルキューレはあきらめない":{"c":["加藤裕介"],"a":["加藤裕介"]},"唇の凍傷":{"c":["椿山日南子"],"a":["椿山日南子"]},"つらみ現在進行形":{"c":["堂島孝平"],"a":["白戸佑輔"]},"無限大DRIVE":{"c":["堂島孝平"],"a":["荒幡亮平"]},"キキワケナイ!":{"c":["おかもとえみ"],"a":["PARKGOLF"]},"マダマニア":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"キズナ→スパイラル":{"c":["サエキけんぞう","照井順政"],"a":["照井順政"]},"愛してる":{"c":["北川勝利"],"a":["北川勝利","Tansa"]},"りんごのうた":{"c":["加藤裕介"],"a":["加藤裕介"]},"Alive〜祈りの唄〜":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"宇宙のかけら":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"恋! ハレイション THE WAR～album version～":{"c":["姉田ウ夢ヤ"],"a":["姉田ウ夢ヤ"]},"AXIA〜ダイスキでダイキライ〜":{"c":["加藤裕介"],"a":["河田貴央"]},"涙目爆発音":{"c":["堂島孝平"],"a":["北川勝利"]},"Silent Hacker":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"おにゃの子☆girl":{"c":["TeddyLoid"],"a":["TeddyLoid"]},"Walküre Attack!":{"c":["加藤裕介"],"a":["加藤裕介"]},"Hear The Universe":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"名もなき何もかも":{"c":["飛内将大"],"a":["玉井健二","飛内将大"]},"偽りの理":{"c":["百田留衣"],"a":["玉井健二","百田留衣"]},"気鬱、白濁す":{"c":["Misty mint"],"a":["玉井健二","KOHD"]},"理想的パラドクスとは":{"c":["吉岡大地"],"a":["玉井健二","大西省吾"]},"爆ぜて咲く":{"c":["Misty mint"],"a":["玉井健二","百田留衣"]},"黎明を穿つ":{"c":["Misty mint"],"a":["玉井健二","大西省吾"]},"極私的極彩色アンサー":{"c":["講本健太郎"],"a":["玉井健二","大西省吾"]},"傷つき傷つけ痛くて辛い":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"運命に賭けたい論理":{"c":["カイザー恵理菜"],"a":["玉井健二","南田健吾"]},"サヨナラサヨナラサヨナラ":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"雑踏、僕らの街":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"空の箱":{"c":["松原さらり"],"a":["玉井健二","南田健吾"]},"声なき魚":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"視界の隅 朽ちる音":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"心象的フラクタル":{"c":["okoge"],"a":["玉井健二","高橋亮人"]},"空白とカタルシス":{"c":["永澤和真"],"a":["玉井健二","百田留衣"]},"運命の華":{"c":["Misty mint"],"a":["玉井健二","百田留衣"]},"闇に溶けてく":{"c":["Misty mint"],"a":["玉井健二","百田留衣"]},"蝶に結いた赤い糸":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"ダレモ":{"c":["飛内将大"],"a":["玉井健二","飛内将大"]},"もう何もいらない未来":{"c":["百田留衣"],"a":["玉井健二","百田留衣"]},"命をくれよ":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"arrow":{"c":["飛内将大"],"a":["玉井健二","飛内将大"]},"荊の薔薇":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"蜃気楼ニ問フ":{"c":["Misty mint"],"a":["玉井健二","百田留衣"]},"ETERNAL FLAME (VOID)":{"c":["南田健吾"],"a":["玉井健二","大西省吾"]},"Cycle Of Sorrow":{"c":["古賀頌哉"],"a":["玉井健二","大西省吾"]},"ワールド・ランプシェード [reunion]":{"c":["buzzG"],"a":["buzzG"]},"ワールド・ランプシェード":{"c":["buzzG"],"a":["buzzG"]},"おやすみ泣き声、さよなら歌姫(Remix)":{"c":["尾崎世界観"],"a":["クリープハイプ"]},"永遠のあくる日":{"c":["てにをは"],"a":["てにをは"]},"睨めっ娘":{"c":["友成空"],"a":["友成空"]},"夢と葉桜":{"c":["青木月光"],"a":["青木月光"]},"メトロノーム":{"c":["米津玄師"],"a":["米津玄師"]},"君に最後の口づけを":{"c":["蝶々P"],"a":["蝶々P"]},"朝を呑む":{"c":["バルーン"],"a":["バルーン"]},"エゴロック(long ver.)":{"c":["すりぃ"],"a":["すりぃ"]},"エゴロック":{"c":["すりぃ"],"a":["すりぃ"]},"偽物人間40号":{"c":["¿?shimon"],"a":["¿?shimon"]},"カレシのジュード":{"c":["syudou"],"a":["syudou"]},"ダウナーウィッチ":{"c":["廉"],"a":["廉"]},"夜のピエロ":{"c":["biz"],"a":["biz"]},"夜撫でるメノウ":{"c":["Ayase"],"a":["Ayase"]},"ジェヘナ":{"c":["wotaku"],"a":["wotaku"]},"ボッカデラベリタ/ 柊キライ":{"c":["柊キライ"],"a":["柊キライ"]},"ボッカデラベリタ":{"c":["柊キライ"],"a":["柊キライ"]},"ルマ":{"c":["かいりきベア"],"a":["かいりきベア"]},"幽霊東京/ Ayase":{"c":["Ayase"],"a":["Ayase"]},"幽霊東京":{"c":["Ayase"],"a":["Ayase"]},"ラストダンス":{"c":["Eve"],"a":["Numa"]},"トーキョーゲットー":{"c":["Eve"],"a":["Numa"]},"音偽バナシ":{"c":["DECO*27"],"a":["kous"]},"アンドロメダアンドロメダ":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ライアーダンス":{"c":["DECO*27"],"a":["DECO*27"]},"さよならミッドナイト":{"c":["大柴広己"],"a":["れるりり"]},"リバーシブル・キャンペーン":{"c":["DECO*27"],"a":["kous"]},"雨とペトラ":{"c":["バルーン"],"a":["バルーン"]},"拝啓ドッペルゲンガー":{"c":["kemu"],"a":["kemu"]},"レディーレ":{"c":["バルーン"],"a":["バルーン"]},"レディーレ (Redire)":{"c":["バルーン"],"a":["バルーン"]},"コバルトメモリーズ":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"愛に奇術師":{"c":["koyori"],"a":["koyori"]},"波に名前をつけること、僕らの呼吸に終わりがあること。":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"金星のダンス":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"命に嫌われている。":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"チェチェ・チェック・ワンツー!":{"c":["和田たけあき"],"a":["和田たけあき"]},"フォニイ":{"c":["ツミキ"],"a":["ツミキ"]},"絶頂讃歌":{"c":["和ぬか"],"a":["100回嘔吐"]},"Overdose":{"c":["なとり"],"a":["なとり"]},"Shadow Shadow":{"c":["Azari"],"a":["Azari"]},"ドクトリーヌ":{"c":["煮ル果実"],"a":["煮ル果実"]},"不埒な喝采":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"ギラギラ":{"c":["てにをは"],"a":["てにをは"]},"エンヴィーベイビー":{"c":["Kanaria"],"a":["Kanaria"]},"ジャンキーナイトタウンオーケストラ":{"c":["すりぃ"],"a":["すりぃ"]},"potatoになっていく":{"c":["Neru"],"a":["Neru"]},"ルーマー":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"アルカリレットウセイ":{"c":["かいりきベア"],"a":["かいりきベア"]},"好き！雪！本気マジック":{"c":["Mitchie M"],"a":["Mitchie M"]},"曖昧劣情Lover":{"c":["koyori"],"a":["koyori"]},"翡翠のまち":{"c":["メル"],"a":["メル"]},"わたしのアール":{"c":["和田たけあき"],"a":["和田たけあき"]},"わたしのアール (Watashino R)":{"c":["和田たけあき"],"a":["和田たけあき"]},"余花にみとれて":{"c":["keeno"],"a":["keeno"]},"あだぽしゃ":{"c":["いよわ"],"a":["いよわ"]},"梅雨明けの":{"c":["しの"],"a":["しの"]},"晴れるまでいっしょ- 傘村トータ":{"c":["傘村トータ"],"a":["傘村トータ"]},"まにまに":{"c":["r-906"],"a":["r-906"]},"パメラ":{"c":["バルーン"],"a":["バルーン"]},"ワタシノテンシ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"コールボーイ":{"c":["syudou"],"a":["syudou"]},"うらみのワルツ":{"c":["きくお"],"a":["きくお"]},"女の子になりたい":{"c":["まふまふ"],"a":["まふまふ"]},"ピエロ":{"c":["KEI"],"a":["KEI"]},"命のユースティティア":{"c":["Neru"],"a":["Neru"]},"曖昧さ回避":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"心拍数♯0822-Arrange ver.-":{"c":["蝶々P"],"a":["蝶々P"]},"心拍数♯0822 piano ver. [オリジナルPV付き]":{"c":["蝶々P"],"a":["蝶々P"]},"君色に染まる":{"c":["TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"from Y to Y":{"c":["ジミーサムP"],"a":["ジミーサムP"]},"Just Be Friends-piano.ver-":{"c":["Dixie Flatline"],"a":["Dixie Flatline"]},"letter song":{"c":["doriko"],"a":["doriko"]},"弱虫モンブラン（Reloaded）":{"c":["DECO*27"],"a":["DECO*27"]},"飴か夢":{"c":["doriko"],"a":["doriko"]},"歌に形はないけれど":{"c":["doriko"],"a":["doriko"]},"glow":{"c":["金山秀士"],"a":["金山秀士"]},"エンパープル":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"チーズケーキクライシス":{"c":["TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"Awake Now":{"c":["雄之助"],"a":["雄之助"]},"虚無さん":{"c":["¿?shimon"],"a":["¿?shimon"]},"天天天国地獄国":{"c":["あいつのチョキ"],"a":["あいつのチョキ"]},"エル・タンゴ・エゴイスタ":{"c":["nyanyannya"],"a":["nyanyannya"]},"いのちの名前":{"c":["久石譲"],"a":["久石譲"]},"夕日坂":{"c":["doriko"],"a":["doriko"]},"海のまにまに":{"c":["Ayase"],"a":["Ayase"]},"「Anytime Anywhere」葬送のフリーレン Frieren ED":{"c":["milet","野村陽一郎","中村泰輔"],"a":["Evan Call"]},"歌ってみた 】ハウトゥー世界征服":{"c":["Neru"],"a":["Neru"]},"マカロン (Macaroon/ 마카롱)":{"c":["ATOLS"],"a":["ATOLS"]},"心とかいう名前の未発見の臓器の機能についての考察":{"c":["adstlaxy"],"a":["adstlaxy"]},"うそつき":{"c":["めざめP"],"a":["めざめP"]},"妄想疾患■ガール (Mousousikkan yami girl)":{"c":["もじゃ"],"a":["れるりり"]},"丸の内サディスティック (Marunouchi Sadistic)":{"c":["椎名林檎"],"a":["亀田誠治"]},"ドナーソング (Donor Song)":{"c":["大柴広己"],"a":["れるりり"]},"威風堂々 (kurokumo×konoco-If Do Do)":{"c":["梅とら"],"a":["梅とら"]},"一心不乱":{"c":["梅とら"],"a":["梅とら"]},"クイーンオブハート":{"c":["奏音69"],"a":["奏音69"]},"四季折の羽":{"c":["ひとしずく×やま△"],"a":["ひとしずく×やま△"]},"小夜子":{"c":["みきとP"],"a":["みきとP"]},"サリシノハラ":{"c":["みきとP"],"a":["みきとP"]},"小夜子 - FutureBass Remix":{"c":["みきとP"],"a":["みきとP"]},"腐れ外道とチョコレゐト":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"繰り返し一粒":{"c":["猫虫"],"a":["猫虫"]},"吉原ラメント":{"c":["亜沙"],"a":["亜沙"]},"アイワナムチュー":{"c":["すりぃ"],"a":["すりぃ"]},"ノマド/バルーン":{"c":["バルーン"],"a":["バルーン"]},"Sleepwalk/なとり":{"c":["なとり"],"a":["なとり"]},"渇愛論Ⅱ/平田義久":{"c":["平田義久"],"a":["平田義久"]},"レトロポリス/R Sound Design":{"c":["R Sound Design"],"a":["R Sound Design"]},"デビル/てにをは":{"c":["てにをは"],"a":["てにをは"]},"ハルノ寂寞/稲葉曇":{"c":["稲葉曇"],"a":["稲葉曇"]},"明けない夜のリリィ(傘村トータ)":{"c":["傘村トータ"],"a":["傘村トータ"]},"今更だって僕は言うかな(Saucy Dog)":{"c":["石原慎也"],"a":["Saucy Dog"]},"One Love (嵐)":{"c":["加藤裕介"],"a":["石塚知生"]},"櫂(ヨルシカ)":{"c":["n-buna"],"a":["n-buna"]},"一縷(上白石萌音)":{"c":["野田洋次郎"],"a":["野田洋次郎"]},"ボーイフレンド(aiko)":{"c":["AIKO"],"a":["島田昌典"]},"西藤公園(back number)":{"c":["清水依与吏"],"a":["back number"]},"結(Saucy Dog)":{"c":["石原慎也"],"a":["Saucy Dog"]},"記念撮影(BUMP OF CHICKEN)":{"c":["藤原基央"],"a":["BUMP OF CHICKEN"]},"トレモロ(RADWIMPS)":{"c":["野田洋次郎"],"a":["RADWIMPS"]},"花降らし(n-buna)":{"c":["n-buna"],"a":["n-buna"]},"花降らし":{"c":["n-buna"],"a":["n-buna"]},"ブルーアンバー(back number)":{"c":["清水依与吏"],"a":["back number","蔦谷好位置"]},"me me she(RADWIMPS)":{"c":["野田洋次郎"],"a":["RADWIMPS"]},"詩書きとコーヒー (ヨルシカ)":{"c":["n-buna"],"a":["n-buna"]},"魔法が解けたら (Saucy Dog)":{"c":["石原慎也"],"a":["Saucy Dog"]},"嘘月 (ヨルシカ)":{"c":["n-buna"],"a":["n-buna"]},"よるのあと (adieu)":{"c":["塩入冬湖"],"a":["Yaffle"]},"悪者 (くじら)":{"c":["くじら"],"a":["くじら"]},"crash (菅原圭)":{"c":["菅原圭"],"a":["해일","菅原圭"]},"ia (菅原圭)":{"c":["菅原圭"],"a":["菅原圭"]},"ハルラ":{"c":["sky_delta"],"a":["sky_delta"]},"海月":{"c":["sky_delta"],"a":["sky_delta"]},"Horizon Dream":{"c":["sky_delta"],"a":["sky_delta"]},"宝石を宿す":{"c":["sky_delta"],"a":["sky_delta"]},"コトノハ":{"c":["sky_delta"],"a":["sky_delta"]},"Spica":{"c":["sky_delta"],"a":["sky_delta"]},"桜色プリズム":{"c":["sky_delta"],"a":["sky_delta"]},"Alt.Strato":{"c":["sky_delta"],"a":["sky_delta"]},"泡沫の灯":{"c":["sky_delta"],"a":["sky_delta"]},"リフレクション":{"c":["sky_delta"],"a":["sky_delta"]},"Cornus Florida":{"c":["sky_delta"],"a":["sky_delta"]},"薄明が告げる明日に":{"c":["sky_delta"],"a":["sky_delta"]},"LØST-IDEA":{"c":["sky_delta"],"a":["sky_delta"]},"ユリシス":{"c":["sky_delta"],"a":["sky_delta"]},"Kaleidoscope":{"c":["sky_delta"],"a":["sky_delta"]},"カラフルモーメント":{"c":["sky_delta"],"a":["sky_delta"]},"Horizon Claire":{"c":["sky_delta"],"a":["sky_delta"]},"Fatalism":{"c":["sky_delta"],"a":["sky_delta"]},"floating outsider":{"c":["sky_delta"],"a":["sky_delta"]},"ミントブルー・ガール":{"c":["sky_delta"],"a":["sky_delta"]},"残光":{"c":["sky_delta"],"a":["sky_delta"]},"モノローグ・オフ":{"c":["sky_delta"],"a":["sky_delta"]},"Alice's Suitcase":{"c":["sky_delta"],"a":["sky_delta"]},"惑星トリップ":{"c":["sky_delta"],"a":["sky_delta"]},"Round & Round":{"c":["sky_delta"],"a":["sky_delta"]},"アンダーマリン":{"c":["sky_delta"],"a":["sky_delta"]},"アンチグレーズ":{"c":["sky_delta"],"a":["sky_delta"]},"route signal":{"c":["sky_delta"],"a":["sky_delta"]},"Transistor":{"c":["sky_delta"],"a":["sky_delta"]},"サニーサイド・クローバー":{"c":["sky_delta"],"a":["sky_delta"]},"a fairy with you":{"c":["sky_delta"],"a":["sky_delta"]},"シュガーレス・レイン":{"c":["sky_delta"],"a":["sky_delta"]},"無言の鳥籠":{"c":["sky_delta"],"a":["sky_delta"]},"秒針とソーダフロート":{"c":["sky_delta"],"a":["sky_delta"]},"ペトリコール":{"c":["sky_delta"],"a":["sky_delta"]},"雷花":{"c":["sky_delta"],"a":["sky_delta"]},"Untitled Sky":{"c":["sky_delta"],"a":["sky_delta"]},"ストレンジレッド":{"c":["sky_delta"],"a":["sky_delta"]},"ハートレス・トリコロール":{"c":["sky_delta"],"a":["sky_delta"]},"ペンと林檎とわたし":{"c":["sky_delta"],"a":["sky_delta"]},"COLOURS":{"c":["sky_delta"],"a":["sky_delta"]},"スローアライズ":{"c":["sky_delta"],"a":["sky_delta"]},"フラフィ":{"c":["sky_delta"],"a":["sky_delta"]},"citron":{"c":["sky_delta"],"a":["sky_delta"]},"水彩のカナリア":{"c":["sky_delta"],"a":["sky_delta"]},"Horizon Note":{"c":["sky_delta"],"a":["sky_delta"]},"蛍火の雪":{"c":["sky_delta"],"a":["sky_delta"]},"空白少女":{"c":["sky_delta"],"a":["sky_delta"]},"Focus on":{"c":["sky_delta"],"a":["sky_delta"]},"ゴースト・マキアート":{"c":["sky_delta"],"a":["sky_delta"]},"Draw World!":{"c":["sky_delta"],"a":["sky_delta"]},"タイニーソング":{"c":["sky_delta"],"a":["sky_delta"]},"ドリームブルー":{"c":["sky_delta"],"a":["sky_delta"]},"花残り、蕾ひとつ":{"c":["sky_delta"],"a":["sky_delta"]},"Sincuvate":{"c":["sky_delta"],"a":["sky_delta"]},"絵空":{"c":["sky_delta"],"a":["sky_delta"]},"Apricot":{"c":["sky_delta"],"a":["sky_delta"]},"彗星のパラソル":{"c":["sky_delta"],"a":["sky_delta"]},"Cirro.Strato":{"c":["sky_delta"],"a":["sky_delta"]},"サマーエンディング":{"c":["sky_delta"],"a":["sky_delta"]},"八月と青とラムネ":{"c":["sky_delta"],"a":["sky_delta"]},"アニマリズムと25人の子どもたち":{"c":["Neuron"],"a":["Neuron"]},"Lake of Millennia":{"c":["Neuron"],"a":["Neuron"]},"Cipher":{"c":["Neuron"],"a":["Neuron"]},"アーバンクルーズ":{"c":["Neuron"],"a":["Neuron"]},"Villain":{"c":["Neuron"],"a":["Neuron"]},"Enigma":{"c":["Neuron"],"a":["Neuron"]},"ノスタグラム":{"c":["Neuron"],"a":["Neuron"]},"トワイライト・セレナーデ":{"c":["Neuron"],"a":["Neuron"]},"Inside Story":{"c":["Neuron"],"a":["Neuron"]},"Moonian":{"c":["Neuron"],"a":["Neuron"]},"ゴースト警告を唄う":{"c":["Neuron"],"a":["Neuron"]},"Death Designer":{"c":["Neuron"],"a":["Neuron"]},"Astronomy":{"c":["Neuron"],"a":["Neuron"]},"Buffer":{"c":["Neuron"],"a":["Neuron"]},"Offline Saga":{"c":["Neuron"],"a":["Neuron"]},"Daisy Crown":{"c":["Neuron"],"a":["Neuron"]},"Rhapsody":{"c":["Neuron"],"a":["Neuron"]},"Chronicle A":{"c":["Neuron"],"a":["Neuron"]},"カミツレと愛のブーケ":{"c":["Neuron"],"a":["Neuron"]},"Area G":{"c":["Neuron"],"a":["Neuron"]},"クロマの幻聴":{"c":["Neuron"],"a":["Neuron"]},"青揺れるフィリア":{"c":["Neuron"],"a":["Neuron"]},"Frozen Frozen!":{"c":["Neuron"],"a":["Neuron"]},"Pulse in Flora":{"c":["Neuron"],"a":["Neuron"]},"LOSTSCAPES":{"c":["Neuron"],"a":["Neuron"]},"Looma":{"c":["Neuron"],"a":["Neuron"]},"Shooting Star (Redecorate ver.)":{"c":["折戸伸治"],"a":["齋藤真也"]},"Shooting Star":{"c":["折戸伸治"],"a":["高瀬一矢"]},"Sign of Suspicion":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"幻想の宝石":{"c":["C.G mix"],"a":["C.G mix"]},"resolution of soul":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"硝子の靡風":{"c":["KOTOKO"],"a":["高瀬一矢"]},"stay.":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"ささくれ":{"c":["KOTOKO"],"a":["C.G mix"]},"agony":{"c":["中沢伴行"],"a":["中沢伴行"]},"Mighty Heart ～ある日のケンカ、いつもの恋心":{"c":["KOTOKO"],"a":["羽越実有"]},"ねぇ、...しようよ！":{"c":["中沢伴行"],"a":["中沢伴行"]},"アララト":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Face of Fact":{"c":["C.G mix"],"a":["C.G mix","FISH TONE"]},"Trust in me":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Floating up":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Fragment ～The heat haze of summer～":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"風に負けないハートのかたち":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"原罪のレクイエム":{"c":["C.G mix"],"a":["C.G mix"]},"Leaf ticket":{"c":["C.G mix"],"a":["C.G mix"]},"Re-sublimity":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Imaginary Affair":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"千恋＊万花 主題歌「恋ひ恋ふ縁」":{"c":["Famishin"],"a":["井内舞子"]},"jihad":{"c":["C.G mix"],"a":["C.G mix","尾崎武士"]},"→unfinished→":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"同じ空の下で":{"c":["高瀬一矢"],"a":["高瀬一矢","中沢伴行"]},"went away":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"flow ～水の生まれた場所～ / KOTOKO - flow ~ mizu no umareta basho ~":{"c":["中沢伴行"],"a":["中沢伴行"]},"One-Chance!!":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"涙の誓い":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"being":{"c":["KOTOKO"],"a":["高瀬一矢"]},"bumpy-Jumpy!":{"c":["中沢伴行","尾崎武士"],"a":["中沢伴行","尾崎武士"]},"パズル":{"c":["KOTOKO"],"a":["C.G mix"]},"ashitahenonamida timeless tear mix":{"c":["中沢伴行"],"a":["中沢伴行"]},"faith~Shinjiru chikara~":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"NEGAIGOTO":{"c":["中沢伴行"],"a":["中沢伴行"]},"Eclat":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"SWEETXSWEET":{"c":["C.G mix"],"a":["C.G mix"]},"Fatally (2026 Live Edition)":{"c":["C.G mix"],"a":["C.G mix"]},"Wing My Way":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"effacer":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"雪華の神話":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"ため息クローバー":{"c":["KOTOKO"],"a":["高瀬一矢"]},"Hayate no gotoku!":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"春":{"c":["KOTOKO"],"a":["高瀬一矢"]},"縁どりの世界":{"c":["KOTOKO"],"a":["高瀬一矢"]},"BLAZE":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"β-粘土の惑星":{"c":["KOTOKO"],"a":["高瀬一矢"]},"リアル鬼ごっこ":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"RETRIEVE":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"WING OF ZERO -the ring-":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"P◇liG△n":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"TR∀NSFoRM":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"月夜の舞踏会":{"c":["高瀬一矢"],"a":["中沢伴行"]},"Lament":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Asura":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"【I've Sound】あの日の君へ":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Hatsuyuki distance":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"TRUE BLUE":{"c":["C.G mix"],"a":["C.G mix"]},"Largo":{"c":["C.G mix"],"a":["C.G mix"]},"雷鳴が鳴く頃":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"碧羅の天へ誘えど":{"c":["C.G mix"],"a":["C.G mix"]},"daily-daily Dream":{"c":["C.G mix"],"a":["C.G mix"]},"Sociometry":{"c":["C.G mix"],"a":["C.G mix"]},"rush":{"c":["KOTOKO"],"a":["C.G mix"]},"サイダー":{"c":["KOTOKO"],"a":["C.G mix"]},"Chercher":{"c":["C.G mix"],"a":["C.G mix"]},"秋爽":{"c":["C.G mix"],"a":["C.G mix"]},"Short Circuit PV":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Princess Bride!":{"c":["KOTOKO"],"a":["Sorma"]},"UZU-MAKI":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"allegretto～そらときみ～":{"c":["C.G mix"],"a":["C.G mix"]},"Second Flight":{"c":["高瀬一矢"],"a":["高瀬一矢","中沢伴行"]},"COLORFUL DAYS!!":{"c":["Ceui"],"a":["小高光太郎"]},"Labyrinthus":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"神々の詩":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Centifolia":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"everlasting flowers":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"MeltyMoment":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"PARQUET":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"mellow melody":{"c":["小高光太郎"],"a":["小高光太郎"]},"今、歩き出す君へ。":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Asphodelus":{"c":["小高光太郎"],"a":["小高光太郎","スミイ酸"]},"Truth Of My Destiny":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"奏愛カレンデュラ":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"stigmata":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"銀色、遥か":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"光の溢れるときには":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Finest Sky":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"栖鴉の綿":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"夢の記憶":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Stardust Melodia (Full)":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"星織ユメミライ":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"angelus":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"羽化":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Towa no kotoba":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"espacio":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Eternal Flow":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Qualia":{"c":["小高光太郎"],"a":["小高光太郎"]},"Worlds Pain":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"心の翼":{"c":["小高光太郎"],"a":["小高光太郎"]},"Seisen Spectacle":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"ティタニアの森":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"天使と悪魔のシンフォニア":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"dreamscape":{"c":["小高光太郎"],"a":["小高光太郎"]},"花になった少年の神話":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"パラノイア":{"c":["神前暁","小高光太郎","Ceui"],"a":["小高光太郎"]},"】Pandora":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"光と闇と時の果て":{"c":["小高光太郎"],"a":["小高光太郎"]},"Frozen Tear":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Prelude～運命の欠片～":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"My Sweet Stories":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"まどろみの楽園":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"Watashi ga Tenshi Janaku Naru Hi":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"風のなかのプリムローズ":{"c":["小高光太郎","Ceui"],"a":["小高光太郎"]},"magicaride":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"piece of azure":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"misery":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"libration crisis":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"never no astray":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"last fortune":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"Hesitation Snow":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"1983-schwarzesmarken-(IS3 version)":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"fortissimo-from insanity affection-":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"endless memory ~refrain as Da Capo~":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"split tears":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"red reduction division":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"Fractale Sequence":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"【MAD】マジカライド -":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"Flower of Bravery - 恋姫†無双 OP":{"c":["志倉千代丸"],"a":["八木沼悟志"]},"only my railgun -15th Anniversary version-":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"Blaze of Reunion":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"absolute wish":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"snow blind -after-":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"Brand New Me!":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"precious time":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"sky":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"IMMORAL":{"c":["中沢伴行"],"a":["中沢伴行"]},"eclipse":{"c":["中沢伴行"],"a":["中沢伴行"]},"緋色の空":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"Wings of Courage -空を超えて-":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"21-Two One-":{"c":["中沢伴行"],"a":["中沢伴行"]},"INITIATIVE":{"c":["中沢伴行"],"a":["中沢伴行"]},"【Nightcore】Initiative - 川田まみ":{"c":["中沢伴行"],"a":["中沢伴行"]},"happiness.":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"Angel // resident of the nightmare":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Gardens":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"triangle":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"HOWL":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"parablepsia":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Replica_nt":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"I... civilization":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"SQUARE THE CIRCLE":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Midnight trip // memories of childhood":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"intron tone":{"c":["C.G mix"],"a":["C.G mix"]},"TRILL":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Get my way!":{"c":["高瀬一矢"],"a":["高瀬一矢","尾崎武士"]},"tiny days":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"】空の森で":{"c":["折戸伸治"],"a":["高瀬一矢"]},"remaining snow":{"c":["C.G mix"],"a":["C.G mix"]},"悲しみの森":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"鳥の詩":{"c":["折戸伸治"],"a":["高瀬一矢"]},"Farewell song":{"c":["戸越まごめ"],"a":["戸越まごめ"]},"心に届く詩":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Light colors":{"c":["折戸伸治"],"a":["高瀬一矢"]},"doll":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"Heartily Song (Game Size)":{"c":["麻枝准"],"a":["MintJam"]},"My Soul,Your Beats!":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"一番の宝物":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"小さなてのひら":{"c":["麻枝准"],"a":["戸越まごめ"]},"星の舟":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"Saya's Song":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"雨宿りの憧憬":{"c":["Manack"],"a":["Manack"]},"Bravely You":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"絆-kizunairo-色":{"c":["流歌"],"a":["流歌"]},"JUSTITIA":{"c":["流歌"],"a":["流歌"]},"サガリバナ":{"c":["大橋柊平"],"a":["ANANT-GARDE EYES"]},"Little Busters! (TV Animation Ver.)":{"c":["麻枝准"],"a":["MintJam"]},"遥か彼方":{"c":["麻枝准"],"a":["Manack"]},"Alicemagic (TV Animation Ver.)":{"c":["折戸伸治"],"a":["MintJam"]},"Alicemagic":{"c":["折戸伸治"],"a":["MintJam"]},"Grand Blue":{"c":["内山利彦(Blueberry&Yogurt)"],"a":["内山利彦(Blueberry&Yogurt)"]},"グルッポ":{"c":["内山利彦(Blueberry&Yogurt)"],"a":["内山利彦(Blueberry&Yogurt)"]},"宝物":{"c":["内山利彦(Blueberry&Yogurt)"],"a":["内山利彦(Blueberry&Yogurt)"]},"夢を見る夢 Full Ver.":{"c":["折倉俊則"],"a":["折倉俊則"]},"Moon Story":{"c":["松本慎一郎"],"a":["松本慎一郎"]},"7th WORLD'S OUT":{"c":["内山利彦(Blueberry&Yogurt)"],"a":["内山利彦(Blueberry&Yogurt)"]},"フォーチュンクッキー":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"Primary":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"Tonitrus":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"Princess Blood":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"希いの花":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"Like a Green":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"キミ∽ツナグ":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"beloved ～桜の彼方へ～":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"こころのゆくさき":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"it's just farewell":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"キミの瞳にヒットミー":{"c":["流歌"],"a":["流歌"]},"TrymenT":{"c":["甘束まお"],"a":["甘束まお"]},"命の約束":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"DORCHADAS":{"c":["松本慎一郎"],"a":["松本慎一郎"]},"イノチの灯し方":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"Blue Love Chime":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"ままらぶ":{"c":["内山利彦(Blueberry & Yogurt)"],"a":["内山利彦(Blueberry & Yogurt)"]},"春紛い":{"c":["ニト。"],"a":["ニト。"]},"なんもない (feat. 星街すいせい, sakuma.)":{"c":["sakuma."],"a":["sakuma."]},"ラリー、ラリー":{"c":["meiyo"],"a":["meiyo"]},"アイウエ":{"c":["SAKURAmoti"],"a":["SAKURAmoti"]},"いたいの、いたいの、とんでいけ (feat. 『ユイカ』, KAFUNÉ)":{"c":["KAFUNÉ"],"a":["KAFUNÉ"]},"ならない日々":{"c":["MIMI"],"a":["MIMI"]},"超弩級フロンティア":{"c":["サツキ"],"a":["サツキ"]},"噓偽りのラプソディ":{"c":["AKASAKI"],"a":["AKASAKI"]},"モドキステップ！":{"c":["マサラダ"],"a":["マサラダ"]},"YOU":{"c":["Twinfield"],"a":["Twinfield"]},"カラフルパレット":{"c":["ふるーり"],"a":["ふるーり"]},"バケバケ":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"アイズ":{"c":["ハイノミ"],"a":["ハイノミ"]},"なっていく。":{"c":["meiyo"],"a":["knoak"]},"恋のいうとおり":{"c":["田淵智也"],"a":["堀江晶太"]},"君にふさわしい奇跡":{"c":["くじら"],"a":["くじら"]},"ふり":{"c":["大漠波新"],"a":["大漠波新"]},"薔薇ノ香":{"c":["SAKURAmoti"],"a":["SAKURAmoti"]},"あまのじゃくヒーロー":{"c":["堀江晶太"],"a":["堀江晶太"]},"醒めないで、青春":{"c":["石倉誉之"],"a":["石倉誉之"]},"ビタースイート":{"c":["すこっぷ"],"a":["すこっぷ"]},"マイワンダー":{"c":["いよわ"],"a":["いよわ"]},"幸福なわがまま":{"c":["堀江晶太"],"a":["堀江晶太"]},"ゴールデンレイ":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"花冷列車":{"c":["の子"],"a":["石倉誉之"]},"僕らの幸福論":{"c":["MIMI"],"a":["MIMI"]},"はじまりの速度":{"c":["ARCHITECT"],"a":["ARCHITECT"]},"恋はキライだ":{"c":["堀江晶太","hirao"],"a":["堀江晶太"]},"Seishunnante Iranaiwa":{"c":["n-buna"],"a":["n-buna"]},"サマーグラビティ":{"c":["40mP"],"a":["40mP"]},"ラフスケッチ":{"c":["40mP"],"a":["40mP"]},"星の涙":{"c":["40mP"],"a":["40mP"]},"シークレットハート":{"c":["40mP"],"a":["40mP"]},"あのときの歌":{"c":["40mP"],"a":["40mP"]},"ブラックボードイレイザー":{"c":["40mP"],"a":["40mP"]},"逆さまのLady":{"c":["堀江晶太"],"a":["堀江晶太"]},"三月がずっと続けばいい":{"c":["堀江晶太"],"a":["堀江晶太"]},"たべてあげる":{"c":["堀江晶太"],"a":["江口亮"]},"パステルレイン":{"c":["堀江晶太"],"a":["堀江晶太"]},"まぼろし":{"c":["堀江晶太"],"a":["星銀乃丈","堀江晶太"]},"March":{"c":["堀江晶太"],"a":["堀江晶太"]},"夜光":{"c":["ホリエアツシ"],"a":["堀江晶太"]},"SWITCH":{"c":["水槽","Such"],"a":["水槽"]},"心音賛歌":{"c":["水槽","r-906"],"a":["r-906"]},"Bluenote":{"c":["水槽"],"a":["水槽"]},"点滴":{"c":["水槽"],"a":["水槽"]},"報酬系":{"c":["水槽","lilbesh ramko"],"a":["水槽"]},"36°C":{"c":["水槽"],"a":["水槽"]},"Afterwards":{"c":["水槽"],"a":["水槽"]},"カルチュラル・オートマティカ・フィーディング":{"c":["水槽","たなか"],"a":["水槽"]},"Vivid at 5am":{"c":["水槽","Such"],"a":["水槽"]},"ランタノイド":{"c":["水槽"],"a":["水槽"]},"ロリポップ・バレット":{"c":["水槽"],"a":["水槽"]},"カンフルショット":{"c":["水槽"],"a":["水槽"]},"Suicide":{"c":["水槽"],"a":["水槽"]},"MONOCHROME":{"c":["水槽"],"a":["水槽"]},"Introduction":{"c":["水槽"],"a":["水槽"]},"README":{"c":["水槽","TAKU INOUE"],"a":["TAKU INOUE"]},"Vacant":{"c":["水槽"],"a":["水槽"]},"文学講義":{"c":["水槽"],"a":["水槽"]},"CERAMIC SKIN":{"c":["水槽"],"a":["水槽"]},"はやく夜へ MV [YouTube ver.]":{"c":["水槽"],"a":["水槽"]},"ハルシネイション":{"c":["水槽"],"a":["水槽"]},"ブラックアウト":{"c":["ユリイ・カノン"],"a":["廣澤優也(HANO)","日直伸次(HANO)"]},"Bare Mask":{"c":["SERRA"],"a":["hidë"]},"灯火":{"c":["SERRA"],"a":["hidë"]},"EYERIS (Re:Mix)":{"c":["SERRA"],"a":["篠崎あやと"]},"テノヒラ":{"c":["SERRA"],"a":["GAKU"]},"Always and Forever":{"c":["SERRA"],"a":["河合泰志(Arte Refact)"]},"MYTH LOGY":{"c":["丸山漠(a crowd of rebellion)"],"a":["丸山漠(a crowd of rebellion)"]},"偽済世":{"c":["SERRA"],"a":["MöC"]},"AURORA DAYS":{"c":["SERRA"],"a":["hidë"]},"ダリラ":{"c":["SERRA"],"a":["hidë"]},"Again":{"c":["SERRA"],"a":["hidë"]},"ViVALE":{"c":["SERRA"],"a":["hidë"]},"我儘バクテリア』Live Music Video / \"Egoistic Bacteria":{"c":["SERRA"],"a":["hidë"]},"エルマキナの鼓動":{"c":["SERRA","MöC"],"a":["脇眞富(Arte Refact)"]},"Wavin'on the sky":{"c":["SERRA"],"a":["hidë"]},"喝采シンドローム":{"c":["SERRA"],"a":["hidë"]},"INSOMNIA -Awake-":{"c":["SERRA"],"a":["hidë"]},"MASQUERADE":{"c":["SERRA"],"a":["hidë"]},"世界の歩き方":{"c":["ユリイ・カノン"],"a":["月詠み"]},"朔日 feat. 吉乃":{"c":["ユリイ・カノン"],"a":["月詠み"]},"死よりうるわし":{"c":["ユリイ・カノン"],"a":["月詠み"]},"夜明けのラズリ":{"c":["ユリイ・カノン"],"a":["月詠み"]},"心燃ゆ":{"c":["ユリイ・カノン"],"a":["月詠み"]},"ナラティブ":{"c":["ユリイ・カノン"],"a":["月詠み"]},"秋うらら":{"c":["ユリイ・カノン"],"a":["月詠み"]},"導火":{"c":["ユリイ・カノン"],"a":["月詠み"]},"ハクメイ":{"c":["ユリイ・カノン"],"a":["月詠み"]},"それを僕らは神様と呼ぶ":{"c":["ユリイ・カノン"],"a":["月詠み"]},"愛がゆえに":{"c":["ユリイ・カノン"],"a":["月詠み"]},"カンターレ":{"c":["ユリイ・カノン"],"a":["月詠み"]},"夜に藍":{"c":["ユリイ・カノン"],"a":["月詠み"]},"春めくことば":{"c":["ユリイ・カノン"],"a":["月詠み"]},"八月の万華鏡":{"c":["ユリイ・カノン"],"a":["月詠み"]},"Snow Devil":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"Hanadayori":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"G2G":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"Geminis":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"I - Love - J - K - Kiss - Date":{"c":["lia"],"a":["Naoki Itai"]},"Zombie":{"c":["lia"],"a":["Naoki Itai"]},"sentimental☆lucky girl":{"c":["lia"],"a":["Naoki Itai"]},"Twilight":{"c":["niki"],"a":["niki"]},"Vanity Kiss":{"c":["lia"],"a":["Naoki Itai"]},"the short night star":{"c":["lia"],"a":["Naoki Itai"]},"Infinity Hologram":{"c":["lia"],"a":["Naoki Itai"]},"Hydrangea blue":{"c":["lia"],"a":["Naoki Itai"]},"Upside down Magic":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"Boundary Battle":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"if 1/2":{"c":["lia"],"a":["Naoki Itai"]},"stardust":{"c":["lia"],"a":["Naoki Itai"]},"Distortion in the brain":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"Riot":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"Flash Bird":{"c":["lia"],"a":["Naoki Itai","Yusuke Koshiro"]},"Futaribun":{"c":["lia"],"a":["Naoki Itai"]},"エミリーと15の約束":{"c":["カンザキイオリ"],"a":["大西省吾"]},"Hibiwareta Sekai":{"c":["小倉しんこう"],"a":["横山裕章"]},"クライクライ":{"c":["majiko"],"a":["majiko","木下哲"]},"Kuruoshiihodo Bokuniwa Utsukushii":{"c":["Michael Kaneko"],"a":["Michael Kaneko"]},"Koe":{"c":["majiko"],"a":["majiko","木下哲"]},"春、恋桜。":{"c":["majiko"],"a":["横山裕章"]},"リボン":{"c":["majiko"],"a":["majiko","木下哲"]},"アマデウス":{"c":["ホリエアツシ"],"a":["ホリエアツシ"]},"GHOST":{"c":["佐藤厚仁(Dream Monster)"],"a":["佐藤厚仁(Dream Monster)"]},"Paranoia":{"c":["majiko"],"a":["majiko","木下哲"]},"彗星のパレード":{"c":["ホリエアツシ"],"a":["ホリエアツシ"]},"morrow":{"c":["majiko"],"a":["majiko"]},"Kids":{"c":["majiko"],"a":["majiko"]},"Welcome to Hell":{"c":["majiko"],"a":["majiko"]},"なんで？":{"c":["majiko"],"a":["majiko"]},"TEDDY":{"c":["majiko"],"a":["majiko"]},"DARK HERO":{"c":["majiko"],"a":["majiko"]},"ノクチルカの夜":{"c":["majiko"],"a":["majiko"]},"shinigami":{"c":["majiko"],"a":["majiko"]},"Lucifer":{"c":["majiko"],"a":["majiko"]},"エイプリル (mol-74)":{"c":["武市和希"],"a":["mol-74"]},"従属ふりったー":{"c":["koyori"],"a":["koyori"]},"Adios":{"c":["Chinozo"],"a":["Chinozo"]},"才能":{"c":["Chinozo"],"a":["Chinozo"]},"LoveXposer":{"c":["REQ"],"a":["REQ"]},"やまない":{"c":["REQ"],"a":["REQ"]},"ビターロス":{"c":["REQ"],"a":["REQ"]},"Bitter Loss":{"c":["REQ"],"a":["REQ"]},"ガーデン":{"c":["藤井風"],"a":["Yaffle"]},"シンパシー":{"c":["REQ"],"a":["REQ"]},"bamu":{"c":["REQ"],"a":["REQ"]},"Fade Into Starlight":{"c":["HoYo-MiX"],"a":["HoYo-MiX"]},"The Starborn":{"c":["REQ"],"a":["REQ"]},"ウワサのあの子 (紫 今)":{"c":["紫今"],"a":["紫今"]},"Parallel World":{"c":["REQ"],"a":["REQ"]},"Ibitsuna Kotoba (Wanna be honest) (Unplugged Version)":{"c":["REQ"],"a":["REQ"]},"ブレインロット (東京真中)":{"c":["東京真中"],"a":["東京真中"]},"おやすみルーシー":{"c":["REQ"],"a":["REQ"]},"烏 (米津玄師)":{"c":["米津玄師"],"a":["米津玄師"]},"あぶく(ヨルシカ)":{"c":["n-buna"],"a":["n-buna"]},"give it back (Cö shu Nie)":{"c":["中村未来"],"a":["Cö shu Nie"]},"千鳥 (ヨルシカ)":{"c":["n-buna"],"a":["n-buna"]},"염라(Karma) (달의하루)":{"c":["Ampstyle"],"a":["Ampstyle"]},"恋文":{"c":["折戸伸治"],"a":["MANYO"]},"Ashita no Hanashi":{"c":["やなぎなぎ"],"a":["出羽良彰"]},"偽らない君へ":{"c":["折戸伸治"],"a":["森藤晶司"]},"春擬き":{"c":["北川勝利"],"a":["北川勝利"]},"ラテラリティ":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"終わりの世界から":{"c":["麻枝准"],"a":["竹下智博"]},"Blank":{"c":["やなぎなぎ"],"a":["やなぎなぎ"]},"landscape":{"c":["やなぎなぎ"],"a":["やなぎなぎ"]},"アウトサイダー":{"c":["やなぎなぎ"],"a":["出羽良彰"]},"Sweet Track":{"c":["楠野功太郎"],"a":["大西省吾"]},"ファラウェイ・ハイウェイ":{"c":["やなぎなぎ"],"a":["やなぎなぎ"]},"here and there":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"color capsule":{"c":["やなぎなぎ"],"a":["やなぎなぎ"]},"心月の詩・秘めた想い":{"c":["HoYo-MiX"],"a":["HoYo-MiX"]},"心月の詩":{"c":["HoYo-MiX"],"a":["HoYo-MiX"]},"BLAZE UP":{"c":["大島こうすけ"],"a":["大島こうすけ"]},"ココニイルカラ":{"c":["オワタP"],"a":["オワタP"]},"A.R.":{"c":["志倉千代丸"],"a":["磯江俊道"]},"ガラスのくつ":{"c":["村上正芳"],"a":["村上正芳"]},"I Bless Thy Life":{"c":["磯江俊道"],"a":["磯江俊道"]},"ヒカリ":{"c":["磯江俊道"],"a":["磯江俊道"]},"非線形ジェニアック":{"c":["志倉千代丸"],"a":["オオバコウスケ"]},"F.D.D.":{"c":["志倉千代丸"],"a":["磯江俊道"]},"リバイバル・コード":{"c":["磯江俊道"],"a":["磯江俊道"]},"Revival Code":{"c":["磯江俊道"],"a":["磯江俊道"]},"Hacking to the Gate":{"c":["志倉千代丸"],"a":["磯江俊道"]},"スカイクラッドの観測者":{"c":["志倉千代丸"],"a":["磯江俊道"]},"魂の慟哭":{"c":["志倉千代丸"],"a":["川越好博"]},"冬の音、雪の街〜Song for…〜":{"c":["磯江俊道"],"a":["磯江俊道"]},"happy blue sky trip":{"c":["磯江俊道"],"a":["磯江俊道"]},"アスタロア":{"c":["折戸伸治"],"a":["塚越雄一朗(NanosizeMir)"]},"フィニステラー":{"c":["折戸伸治"],"a":["吉田穣"]},"Theater of Life":{"c":["ANCHOR"],"a":["ANCHOR"]},"全部君がいたから知ったんだ":{"c":["鶴﨑輝一"],"a":["鶴﨑輝一"]},"歌えばそこに君がいるから":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"Resurrection":{"c":["小山寿"],"a":["小山寿"]},"DAYS of DASH":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"Realize":{"c":["篠崎あやと","橘亮祐"],"a":["篠崎あやと","橘亮祐"]},"アルカテイル":{"c":["折戸伸治"],"a":["中山真斗"]},"Lasting Moment":{"c":["折戸伸治"],"a":["宮崎京一"]},"Love? Reason why!!":{"c":["Q-MHz"],"a":["Q-MHz","岸田勇気"]},"Defiant Dolls":{"c":["草野華余子"],"a":["草野華余子"]},"Delighting":{"c":["草野華余子"],"a":["草野華余子"]},"オラシオン":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"頑張れと叫ぶたび":{"c":["鈴木このみ"],"a":["渡辺亮希"]},"Ao no Kanata":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"蒼の彼方":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"ULTRA FLASH":{"c":["草野華余子"],"a":["草野華余子"]},"東のシンドバッド":{"c":["ANCHOR"],"a":["ANCHOR"]},"「わたし」をくれたみんなへ":{"c":["鈴木このみ"],"a":["白戸佑輔"]},"Crossroads":{"c":["辻純更"],"a":["白戸佑輔"]},"夢の続き":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"THERE IS A REASON":{"c":["ヒゲドライバー"],"a":["宮崎誠"]},"Blow out":{"c":["ヒゲドライバー"],"a":["ゆよゆっぺ"]},"Luster piece":{"c":["草野華余子"],"a":["草野華余子"]},"Étoile":{"c":["霜月はるか"],"a":["MANYO"]},"白夜幻想譚":{"c":["霜月はるか"],"a":["霜月はるか"]},"導きのハーモニー":{"c":["霜月はるか"],"a":["MANYO"]},"護森人":{"c":["霜月はるか"],"a":["細井聡司"]},"トラワレビト":{"c":["霜月はるか"],"a":["MANYO"]},"未来自画像":{"c":["霜月はるか"],"a":["MANYO"]},"ラベンダーの純然":{"c":["志倉千代丸"],"a":["上野浩司"]},"Snow x Connect":{"c":["水月陵"],"a":["水月陵"]},"蒼黒のスピカ":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"あの雲の向こうへ":{"c":["霜月はるか"],"a":["MANYO"]},"Magenta Tear":{"c":["霜月はるか"],"a":["MANYO"]},"エルダリア～祈り咲く森～":{"c":["霜月はるか"],"a":["MANYO"]},"Re：call":{"c":["霜月はるか"],"a":["MANYO"]},"希いの標":{"c":["霜月はるか"],"a":["MANYO"]},"夢渡し":{"c":["霜月はるか"],"a":["MANYO"]},"運命の向こうへ":{"c":["霜月はるか"],"a":["MANYO"]},"屍に咲く魔花":{"c":["霜月はるか"],"a":["MANYO"]},"キボウのソラ":{"c":["折戸伸治"],"a":["MANYO"]},"カザハネ":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"泡沫":{"c":["霜月はるか"],"a":["MANYO"]},"life":{"c":["霜月はるか"],"a":["MANYO"]},"Secret Liqueur (Full)":{"c":["霜月はるか"],"a":["MANYO"]},"羽ノ亡キ蝶":{"c":["霜月はるか"],"a":["myu"]},"ダンガイマインド":{"c":["Q-MHz"],"a":["Q-MHz","eba"]},"Ice breaker":{"c":["배","政후(一二三)"],"a":["政후(一二三)"]},"純情サクリファイス":{"c":["一二三"],"a":["一二三"]},"アンダーテイカー":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"狐雨":{"c":["一二三"],"a":["一二三"]},"THE REVO":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"逆行自我":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"Keep it real":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"光になれたら":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"ネオネオン":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"Stray Beats":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"虚構性プロローグ":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"ストラゴヴィゴス":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"天気雨の旅":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"百歌繚乱":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"愛のテロメア":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"Limitless":{"c":["eba"],"a":["eba"]},"純然な声":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"あなたのせいね。":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"共犯":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"POP SICK":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"ヤラララ(YARARARA)":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"live in live":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"ミッドナイト・スクワッド":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"エモーション・キャプチャー":{"c":["sky_delta"],"a":["sky_delta"]},"Azura Luno":{"c":["sky_delta"],"a":["sky_delta"]},"Lilith":{"c":["sky_delta"],"a":["sky_delta"]},"追想のラグナロク":{"c":["sky_delta"],"a":["sky_delta"]},"愛の残滓":{"c":["sky_delta"],"a":["sky_delta"]},"Indigrotto":{"c":["sky_delta"],"a":["sky_delta"]},"友愛進化論":{"c":["sky_delta"],"a":["sky_delta"]},"これくらいで":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"ご注文はえいえんに":{"c":["sky_delta"],"a":["sky_delta"]},"約束のリンカネーション":{"c":["sky_delta"],"a":["sky_delta"]},"待ってて、彼岸で":{"c":["sky_delta"],"a":["sky_delta"]},"Not a Hero":{"c":["sky_delta"],"a":["sky_delta"]},"あなたしか見えないの":{"c":["sky_delta"],"a":["sky_delta"]},"美人局":{"c":["sky_delta"],"a":["sky_delta"]},"コトノハ (Kotonoha)":{"c":["sky_delta"],"a":["sky_delta"]},"クライヤ":{"c":["すこっぷ"],"a":["すこっぷ"]},"Dear":{"c":["19's Sound Factory"],"a":["19's Sound Factory"]},"プリマステラ":{"c":["samfree"],"a":["samfree","ゆうゆ"]},"Pale moonlight":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"Hiraeth":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"優しさの記憶":{"c":["すこっぷ"],"a":["すこっぷ"]},"愛と哀":{"c":["すこっぷ"],"a":["すこっぷ"]},"午前0時の無力な神様":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"Daybreak":{"c":["samfree"],"a":["ゆうゆ"]},"コンパスソング":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"evergreen":{"c":["すこっぷ"],"a":["すこっぷ"]},"今をかける少女":{"c":["すこっぷ"],"a":["すこっぷ"]},"なんで":{"c":["すこっぷ"],"a":["すこっぷ"]},"Melodic Aster*":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"パズルガール":{"c":["とあ"],"a":["とあ"]},"1step 2step":{"c":["鎖那"],"a":["鎖那"]},"KISSIN' CLAW":{"c":["鎖那"],"a":["鎖那"]},"くらくらった":{"c":["鎖那"],"a":["鎖那"]},"ベイビーヘイロー":{"c":["鎖那"],"a":["鎖那"]},"mimicry":{"c":["鎖那"],"a":["鎖那"]},"カプセル":{"c":["鎖那"],"a":["鎖那"]},"sparkle":{"c":["鎖那"],"a":["鎖那"]},"tutu":{"c":["鎖那"],"a":["鎖那"]},"oh my girl":{"c":["鎖那"],"a":["鎖那"]},"すきなうた":{"c":["鎖那","TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"備忘録":{"c":["鎖那"],"a":["鎖那"]},"オオカミと少女":{"c":["鎖那"],"a":["鎖那"]},"シュテルン":{"c":["めざめP"],"a":["めざめP"]},"テルテルユー":{"c":["鎖那"],"a":["鎖那"]},"Personall":{"c":["やなぎなぎ"],"a":["やなぎなぎ"]},"Sapphire":{"c":["みきとP"],"a":["みきとP"]},"Polar Vision":{"c":["R Sound Design"],"a":["R Sound Design"]},"禍禍しい":{"c":["てにをは"],"a":["てにをは"]},"鳴り止まない":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"Rabbit Boku No Naka No Kimi":{"c":["ナノウ"],"a":["ナノウ"]},"Bird cage":{"c":["蝶々P"],"a":["蝶々P"]},"grasp":{"c":["やなぎなぎ"],"a":["やなぎなぎ"]},"Beautiful World":{"c":["宇多田ヒカル"],"a":["宇多田ヒカル","小森雅仁"]},"ソライロ":{"c":["40mP"],"a":["40mP"]},"裏の底":{"c":["煮ル果実"],"a":["煮ル果実"]},"弱者":{"c":["syudou"],"a":["syudou"]},"アルマ":{"c":["かいりきベア"],"a":["かいりきベア"]},"Kill：Fate":{"c":["梅とら"],"a":["梅とら"]},"FATAL Finale":{"c":["奏音69"],"a":["奏音69"]},"Bullets":{"c":["koyori"],"a":["koyori"]},"LUNDI":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"バイバイ、すばらしき世界":{"c":["n-buna"],"a":["n-buna"]},"Android":{"c":["DECO*27"],"a":["Rockwell"]},"ひだまりの彩度":{"c":["有機酸"],"a":["有機酸"]},"フルスロットルHeart":{"c":["安瀬聖"],"a":["安瀬聖"]},"恋をしようよ Let it snow":{"c":["安瀬聖"],"a":["安瀬聖"]},"タイムカプセル":{"c":["安瀬聖"],"a":["安瀬聖"]},"Clearly":{"c":["安瀬聖"],"a":["安瀬聖"]},"ひとひら":{"c":["安瀬聖"],"a":["安瀬聖"]},"EVERLASTING BLUE":{"c":["安瀬聖"],"a":["安瀬聖"]},"星のようになりたい":{"c":["安瀬聖"],"a":["安瀬聖"]},"桜色":{"c":["安瀬聖"],"a":["安瀬聖"]},"コドモノアソビ OP「Passion":{"c":["安瀬聖"],"a":["安瀬聖"]},"Revolution":{"c":["安瀬聖"],"a":["安瀬聖"]},"Purely ～その狭い青空を見上げて～ OP「Aozora":{"c":["太田雅友"],"a":["太田雅友"]},"アオナツライン":{"c":["Nekusam"],"a":["Nekusam"]},"RING ON BOUQUET":{"c":["安瀬聖"],"a":["安瀬聖"]},"メモリー":{"c":["安瀬聖"],"a":["安瀬聖"]},"ゲームOP":{"c":["安瀬聖"],"a":["安瀬聖"]},"ensemble作品ED(Duca歌唱）":{"c":["安瀬聖"],"a":["安瀬聖"]},"ずっとそばで…":{"c":["安瀬聖"],"a":["安瀬聖"]},"青春フラジャイル":{"c":["安瀬聖"],"a":["安瀬聖"]},"pieces/揺り籠のカナリア":{"c":["安瀬聖"],"a":["安瀬聖"]},"アンラベル・トリガー":{"c":["安瀬聖"],"a":["安瀬聖"]},"小金井荘と金色の揚羽蝶":{"c":["安瀬聖"],"a":["安瀬聖"]},"遥か碧の花嫁に":{"c":["安瀬聖"],"a":["安瀬聖"]},"フタリ":{"c":["安瀬聖"],"a":["安瀬聖"]},"幸せのオトシモノ":{"c":["安瀬聖"],"a":["安瀬聖"]},"二人色":{"c":["安瀬聖"],"a":["安瀬聖"]},"your diary":{"c":["安瀬聖"],"a":["安瀬聖"]},"Happiness":{"c":["安瀬聖"],"a":["安瀬聖"]},"アイオライト":{"c":["志村真白"],"a":["志村真白"]},"Answer":{"c":["安瀬聖"],"a":["安瀬聖"]},"Only you":{"c":["安瀬聖"],"a":["安瀬聖"]},"Marry Me ? (Golden Marriage)":{"c":["宮崎京一"],"a":["宮崎京一"]},"Sign":{"c":["安瀬聖"],"a":["安瀬聖"]},"アマオト [English Subtitled]":{"c":["安瀬聖"],"a":["安瀬聖"]},"アイの庭 [English Subtitled]":{"c":["安瀬聖"],"a":["安瀬聖"]},"華暦":{"c":["安瀬聖"],"a":["安瀬聖"]},"観覧車～あの日と、昨日と今日と明日と～ [English Subtitled]":{"c":["安瀬聖"],"a":["安瀬聖"]},"ISI":{"c":["安瀬聖"],"a":["安瀬聖"]},"ラムネ":{"c":["Aqu3ra"],"a":["Aqu3ra"]},"散って、咲いて":{"c":["安瀬聖"],"a":["安瀬聖"]},"beloved story":{"c":["安瀬聖"],"a":["安瀬聖"]},"Night Sky 夜空":{"c":["安瀬聖"],"a":["安瀬聖"]},"Innocent Desire":{"c":["安瀬聖"],"a":["安瀬聖"]},"月の彼方で逢いましょう":{"c":["安瀬聖"],"a":["安瀬聖"]},"コイイロセカイ":{"c":["安瀬聖"],"a":["安瀬聖"]},"Trust in me ～E×E Opening Theme～":{"c":["不知火つばさ"],"a":["不知火つばさ"]},"Eternal Destiny":{"c":["DJ SHIMAMURA"],"a":["DJ SHIMAMURA"]},"呪文はプリ☆まじ":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"恋恋三昧":{"c":["榊原ゆい"],"a":["原田勝通"]},"煌めき一閃":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"Change & Chance!":{"c":["Famishin"],"a":["不知火つばさ"]},"Hold on me ～恋の魔法～":{"c":["榊原ゆい"],"a":["家原正樹"]},"Gregorio":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"恋愛0キロメートル 「恋愛0キロメートル OP」":{"c":["水月陵"],"a":["水月陵"]},"Explorer World":{"c":["不知火つばさ"],"a":["不知火つばさ"]},"まじからっと☆れいでぃあんと":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"やがて消える幻でも":{"c":["榊原ゆい"],"a":["椎名俊介(Angel Note)"]},"ラブ･パラダイス":{"c":["榊原ゆい"],"a":["DJ SHIMAMURA"]},"OWN JUSTICE":{"c":["不知火つばさ"],"a":["不知火つばさ"]},"Heavenly Kiss":{"c":["wight"],"a":["wight"]},"Till I can see you again":{"c":["林達志"],"a":["林達志"]},"Judge of a Life":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Einsatz":{"c":["ペーじゅん"],"a":["ペーじゅん"]},"ラピスラズリの恋":{"c":["榊原ゆい"],"a":["井ノ原智(Angel Note)"]},"Blue mind":{"c":["榊原ゆい"],"a":["原田勝通"]},"77 〜And, two stars meet again〜 OP STAR LEGEND":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"尋ねビト":{"c":["細井聡司"],"a":["細井聡司"]},"夢の罪 -End in childhood-":{"c":["細井聡司"],"a":["細井聡司"]},"evolution 「トキメキファンタジー ラテール」":{"c":["榊原ゆい"],"a":["原田勝通"]},"聖剣なんていらない 「星刻の竜騎士 OP」":{"c":["上松範康(Elements Garden)"],"a":["喜多智弘(Elements Garden)"]},"そして僕は...":{"c":["志倉千代丸"],"a":["磯江俊道"]},"Baby Fantastic!":{"c":["榊原ゆい"],"a":["椎名俊介(Angel Note)"]},"“光あれ”と願う心を 「レミニセンス -Recollect- OP」":{"c":["不知火つばさ"],"a":["不知火つばさ"]},"Come Home! Princess":{"c":["榊原ゆい"],"a":["原田勝通"]},"片翼のイカロス":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"秘密仕掛けのApple 「キミとボクとエデンの林檎 OP」":{"c":["不知火つばさ"],"a":["不知火つばさ"]},"幻想の城「暁の護衛〜罪深き終末論〜 OP」":{"c":["wight"],"a":["wight"]},"Scarlet":{"c":["上松範康(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"奇跡なんか、いらない。":{"c":["太田雅友"],"a":["太田雅友"]},"恋さくミライ":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"恋花":{"c":["母里治樹(Elements Garden)"],"a":["母里治樹(Elements Garden)"]},"ヒトツボシ":{"c":["堀江晶太"],"a":["堀江晶太"]},"ワールドエンド":{"c":["天門"],"a":["天門"]},"Zzz":{"c":["前山田健一"],"a":["前山田健一"]},"fly away t.p.s":{"c":["tororo"],"a":["高田暁"]},"君を仰ぎ乙女は姫に":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"少年少女よ、大志を抱け":{"c":["小高光太郎"],"a":["小高光太郎"]},"glowing world ～輝きの、セカイへ～":{"c":["小高光太郎"],"a":["小高光太郎"]},"さくら、Reincarnation":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"LOVE EXE":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Heaven's gate":{"c":["俊龍"],"a":["藤田淳平(Elements Garden)"]},"Love♡Vacation":{"c":["小高光太郎"],"a":["小高光太郎"]},"マリンブルーに沿って":{"c":["エンドウ."],"a":["エンドウ."]},"キスのひとつで":{"c":["増谷賢"],"a":["増谷賢"]},"夢と色でできている":{"c":["堀江晶太"],"a":["堀江晶太"]},"夢と色でできている Grand End":{"c":["堀江晶太"],"a":["堀江晶太"]},"Grand symphony":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Golden Mission":{"c":["堀江晶太"],"a":["堀江晶太"]},"Distance":{"c":["Arte Refact"],"a":["Arte Refact"]},"Break your world":{"c":["五条下位(SYNC.ART'S)"],"a":["五条下位(SYNC.ART'S)"]},"Atlantico Blue":{"c":["俊龍"],"a":["原田篤(Arte Refact)"]},"Never the Fever!!":{"c":["太田雅友"],"a":["太田雅友"]},"Reason why XXX":{"c":["ZAQ"],"a":["nyanyannya"]},"IN MY DREAM":{"c":["前澤寛之"],"a":["前澤寛之"]},"FEEL×ALIVE":{"c":["堀江晶太"],"a":["堀江晶太"]},"The Biggest Dreamer":{"c":["太田美知彦"],"a":["太田美知彦"]},"Go future":{"c":["母里治樹(Elements Garden)"],"a":["母里治樹(Elements Garden)"]},"ダイアログ":{"c":["小高光太郎"],"a":["小高光太郎"]},"AMAZING BREAK":{"c":["草野華余子"],"a":["堀江晶太"]},"星彩のRipieno":{"c":["小高光太郎"],"a":["小高光太郎"]},"∞未来":{"c":["羽鳥風画"],"a":["羽鳥風画"]},"セ・キララ":{"c":["俊龍"],"a":["鈴木マサキ"]},"未来回帰線":{"c":["黒須克彦"],"a":["黒須克彦"]},"跪くまで5秒だけ！":{"c":["渡辺拓也"],"a":["鈴木マサキ"]},"Be Ambitious, Guys!":{"c":["大久保薫"],"a":["大久保薫"]},"Glossy:MMM":{"c":["虹音"],"a":["虹音"]},"Star☆drops":{"c":["橋本みゆき"],"a":["安瀬聖"]},"せつなさのグラデイション":{"c":["冨田暁子"],"a":["増田武史"]},"Ageless Love":{"c":["黒須克彦"],"a":["黒須克彦"]},"Shooting the future":{"c":["鈴木マサキ"],"a":["鈴木マサキ"]},"Miss Brand-new day":{"c":["鈴木マサキ"],"a":["鈴木マサキ"]},"幻想楼閣":{"c":["黒須克彦"],"a":["黒須克彦"]},"シンフォニック・ラブ":{"c":["大久保薫"],"a":["大久保薫"]},"Link-age":{"c":["大久保薫"],"a":["大久保薫"]},"青空の約束":{"c":["安瀬聖"],"a":["安瀬聖"]},"5分前の恋心":{"c":["大久保薫"],"a":["大久保薫"]},"Eternal recurrence":{"c":["黒須克彦"],"a":["黒須克彦"]},"L":{"c":["橋本みゆき"],"a":["鈴木マサキ"]},"本当の勇気に変わるまで":{"c":["橋本みゆき"],"a":["鈴木マサキ"]},"AM 1:00":{"c":["アッチョリケ"],"a":["鈴木マサキ"]},"青空の見える丘で":{"c":["黒須克彦"],"a":["黒須克彦"]},"さかみち":{"c":["安瀬聖"],"a":["安瀬聖"]},"夢見るままに恋をして":{"c":["大久保薫"],"a":["大久保薫"]},"The Day Takeoff":{"c":["アッチョリケ"],"a":["鈴木マサキ"]},"夢の無限回廊":{"c":["黒須克彦"],"a":["黒須克彦"]},"秋色":{"c":["安瀬聖"],"a":["安瀬聖"]},"TIME":{"c":["アッチョリケ"],"a":["ms-jacky"]},"恋桜":{"c":["安瀬聖"],"a":["安瀬聖"]},"ペパーミント":{"c":["橋本みゆき"],"a":["鈴木マサキ"]},"ぱすてるチャイム":{"c":["新井健史"],"a":["新井健史"]},"シンクロしようよ":{"c":["志倉千代丸"],"a":["新井健史"]},"quantum faith":{"c":["新井健史"],"a":["新井健史"]},"blade heart":{"c":["新井健史"],"a":["新井健史"]},"Lunatic delusion":{"c":["新井健史"],"a":["新井健史"]},"扉ひらいて、ふたり未来へ":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"Rave:tech (^_^) New;world":{"c":["新井健史"],"a":["新井健史"]},"きりひらけ！グレイシー☆スター":{"c":["志倉千代丸"],"a":["上野浩司"]},"流星のビヴロスト":{"c":["志倉千代丸"],"a":["新井健史"]},"Dimension tripper!!!":{"c":["新井健史"],"a":["MACARONI☆"]},"恋する少女と想いのキセキ (OP Full) 永遠なる絆と想いのキセキ":{"c":["水月陵"],"a":["水月陵"]},"N.O.S":{"c":["新井健史"],"a":["新井健史"]},"ウーズアウト (feat. 倚水)":{"c":["ハム"],"a":["ハム"]},"あの夏は死なない (feat. ねんね)":{"c":["ハム"],"a":["ハム"]},"朝が来るみたいに":{"c":["新井健史"],"a":["新井健史"]},"深紅の徒花":{"c":["折戸伸治"],"a":["MintJam"]},"ひとひらを紡いで":{"c":["SperioNz"],"a":["SperioNz"]},"Smiles Left Behind":{"c":["SperioNz"],"a":["SperioNz"]},"遠くなる君":{"c":["SperioNz"],"a":["SperioNz"]},"雪凪":{"c":["SperioNz"],"a":["SperioNz"]},"Midnight Ping":{"c":["SperioNz"],"a":["SperioNz"]},"Imaginary Arcadia":{"c":["RD-Sounds"],"a":["RD-Sounds"]},"追慕":{"c":["SperioNz"],"a":["SperioNz"]},"蒼のキャンバス":{"c":["SperioNz"],"a":["SperioNz"]},"Vacancy":{"c":["SperioNz"],"a":["SperioNz"]},"ハルハコブネ":{"c":["SperioNz"],"a":["SperioNz"]},"Echoes Calling":{"c":["SperioNz"],"a":["SperioNz"]},"星掬い":{"c":["SperioNz"],"a":["SperioNz"]},"Aorist":{"c":["SperioNz"],"a":["SperioNz"]},"恋、夏めく。":{"c":["SperioNz"],"a":["SperioNz"]},"君を覚えていたい":{"c":["SperioNz"],"a":["SperioNz"]},"瑠璃も玻璃も照らせば光る":{"c":["SperioNz"],"a":["SperioNz"]},"ne / ne [ヒトらしくあるために]":{"c":["bermei.inazawa"],"a":["bermei.inazawa"]},"Prima Littera":{"c":["Fty"],"a":["Fty"]},"徒、花吹雪":{"c":["Fty"],"a":["Fty"]},"days":{"c":["じん"],"a":["じん"]},"カレンダーには花言葉":{"c":["Fty"],"a":["Fty"]},"トワ・モナムール":{"c":["Fty"],"a":["Fty"]},"メディカルルセンターへようこそ":{"c":["Fty"],"a":["Fty"]},"華麗なるスペクタクル":{"c":["Fty"],"a":["Fty"]},"春巡スローステップ":{"c":["Fty"],"a":["Fty"]},"ステイノーブル":{"c":["Fty"],"a":["Fty"]},"カリステファスに乗せて":{"c":["Fty"],"a":["Fty"]},"ほんまやで☆なんでやねん☆しらんけど":{"c":["Fty"],"a":["Fty"]},"忘れものセンターにまたね！":{"c":["Fty"],"a":["Fty"]},"宴の皿":{"c":["Fty"],"a":["Fty"]},"シュガーロス":{"c":["Fty"],"a":["Fty"]},"硝子ドール":{"c":["Fty"],"a":["Fty"]},"オーバーレイ・ワールド":{"c":["Fty"],"a":["Fty"]},"I♡":{"c":["Fty"],"a":["Fty"]},"名探偵連続殺人事件":{"c":["てにをは"],"a":["てにをは"]},"ラブレター":{"c":["Ayase"],"a":["Ayase"]},"逆光のフリューゲル":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"合言葉はトキメキシロップ":{"c":["Fty"],"a":["Fty"]},"Work Out Night":{"c":["Fty"],"a":["Fty"]},"なぜ？謎？！ANSWER":{"c":["Fty"],"a":["Fty"]},"むげんのチケット":{"c":["まらしぃ","kors k"],"a":["まらしぃ","kors k"]},"アクシデントコーディネイター":{"c":["グシミヤギヒデユキ"],"a":["グシミヤギヒデユキ"]},"Clover Day's":{"c":["Manack"],"a":["Manack"]},"Clover Heart's":{"c":["Manack"],"a":["Manack"]},"Clover Heart's -New days recording-":{"c":["Manack"],"a":["Manack"]},"heavenly blue":{"c":["梶浦由記"],"a":["梶浦由記"]},"Magia":{"c":["梶浦由記"],"a":["梶浦由記"]},"Prayer X":{"c":["常田大希"],"a":["King Gnu"]},"inner universe":{"c":["菅野よう子"],"a":["菅野よう子"]},"わが臈たし悪の華":{"c":["片倉三起也"],"a":["片倉三起也"]},"聖少女領域":{"c":["片倉三起也"],"a":["片倉三起也"]},"亡國覚醒カタルシス":{"c":["片倉三起也"],"a":["片倉三起也"]},"aLIEz":{"c":["澤野弘之"],"a":["澤野弘之"]},"LilaS/SawanoHiroyuki[nZk]:Honoka Takahashi":{"c":["澤野弘之"],"a":["澤野弘之"]},"Avid":{"c":["澤野弘之"],"a":["澤野弘之"]},"Silly-Go-Round":{"c":["梶浦由記"],"a":["梶浦由記"]},"mind as Judgement":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"chAngE":{"c":["miwa"],"a":["Naoki-T"]},"ダイアモンドクレバス":{"c":["菅野よう子"],"a":["菅野よう子"]},"ライオン":{"c":["菅野よう子"],"a":["菅野よう子"]},"愛・おぼえていますか":{"c":["加藤和彦"],"a":["清水信之"]},"サヨナラノツバサ～the end of triangle":{"c":["菅野よう子","保刈久明"],"a":["菅野よう子"]},"華鳥風月":{"c":["芳賀敬太"],"a":["Iceon"]},"虹の彼方に":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"虹の彼方に - From THE FIRST TAKE":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"たった1つの想い":{"c":["KOKIA"],"a":["KOKIA"]},"たった１つの想い":{"c":["KOKIA"],"a":["KOKIA"]},"Arrietty's Song":{"c":["Simon Caby","Cécile Corbel"],"a":["Simon Caby","Cécile Corbel"]},"Be Crazy For Me":{"c":["园田健太郎"],"a":["园田健太郎"]},"チキチキバンバン":{"c":["Jolly","Gabi"],"a":["MO.NO"]},"The Bravery":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"星が瞬くこんな夜に 〜ゲームVer.〜":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"Hoshi Ga Matataku Konnayoruni":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"君の知らない物語":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"銀色飛行船":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"海色":{"c":["WEST GROUND"],"a":["WEST GROUND"]},"ambiguous":{"c":["toku"],"a":["GARNiDELiA"]},"桃源恋歌":{"c":["toku"],"a":["GARNiDELiA"]},"極楽浄土":{"c":["toku"],"a":["GARNiDELiA"]},"LADY":{"c":["米津玄師"],"a":["米津玄師","坂東祐大"]},"LADY (米津玄師)":{"c":["米津玄師"],"a":["米津玄師","坂東祐大"]},"KICK BACK (米津玄師)":{"c":["米津玄師"],"a":["米津玄師","常田大希"]},"BOW AND ARROW (요네즈 켄시)":{"c":["米津玄師"],"a":["米津玄師"]},"すずめ Suzume (RADWIMPS feat.十明)":{"c":["野田洋次郎"],"a":["野田洋次郎","陣内一真"]},"海の幽霊 - サンライトLIVE":{"c":["米津玄師"],"a":["米津玄師","坂東祐大"]},"烏":{"c":["米津玄師"],"a":["米津玄師"]},"あぶく":{"c":["n-buna"],"a":["n-buna"]},"花占い":{"c":["Vaundy"],"a":["Vaundy"]},"Prema":{"c":["藤井風"],"a":["Yaffle"]},"クスシキ":{"c":["大森元貴"],"a":["久保田真悟(Jazzin'park)","大森元貴"]},"ケセラセラ":{"c":["大森元貴"],"a":["大森元貴","花井諒"]},"ライラック":{"c":["大森元貴"],"a":["久保田真悟(Jazzin'park)","大森元貴"]},"晴る":{"c":["n-buna"],"a":["n-buna"]},"怪獣":{"c":["山口一郎"],"a":["サカナクション"]},"歌ってみた | 怪獣":{"c":["山口一郎"],"a":["サカナクション"]},"パンドラコール":{"c":["MIMI"],"a":["MIMI"]},"ウィアートル":{"c":["r-906"],"a":["r-906"]},"アルルの花":{"c":["傘村トータ"],"a":["傘村トータ"]},"ネクロの花嫁":{"c":["奏音69"],"a":["奏音69"]},"垂直落下":{"c":["廉"],"a":["廉"]},"シリウスの心臓":{"c":["傘村トータ"],"a":["傘村トータ"]},"物語りのワルツ":{"c":["ピコン"],"a":["ピコン"]},"だれかの心臓になれたなら":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"ノンブレス・オブリージュ":{"c":["ピノキオピー"]},"キャットラビング":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"シャンティ":{"c":["wotaku"]},"MIRA":{"c":["Kanaria"],"a":["Kanaria"]},"ジッタードール":{"c":["niki"],"a":["niki"]},"透明エレジー":{"c":["n-buna"],"a":["n-buna"]},"透明エレジー 歌ってみた。":{"c":["n-buna"],"a":["n-buna"]},"ミルククラウン・オン・ソーネチカ 歌ってみた。":{"c":["ユジー"],"a":["ユジー"]},"マシュマリー":{"c":["MIMI"],"a":["MIMI"]},"炉心融解":{"c":["iroha(sasaki)"],"a":["iroha(sasaki)"]},"地球最後の告白を":{"c":["kemu"],"a":["kemu"]},"アスノヨゾラ哨戒班":{"c":["Orangestar"],"a":["Orangestar"]},"ヒビカセ":{"c":["Giga"],"a":["Giga"]},"からくりピエロ":{"c":["40mP"],"a":["40mP"]},"熱異常":{"c":["いよわ"],"a":["いよわ"]},"ももいろの鍵":{"c":["いよわ"],"a":["いよわ"]},"ライアーダンサー":{"c":["マサラダ"],"a":["マサラダ"]},"テトリス":{"c":["柊マグネタイト"],"a":["柊マグネタイト"]},"プロポーズ ‐ 内緒のピアス":{"c":["内緒のピアス"],"a":["内緒のピアス"]},"デスペレート":{"c":["TeddyLoid","Giga"],"a":["TeddyLoid","Giga"]},"デスぺレート":{"c":["TeddyLoid","Giga"],"a":["TeddyLoid","Giga"]},"グラーヴェ":{"c":["niki"],"a":["niki"]},"紗痲":{"c":["煮ル果実"],"a":["煮ル果実"]},"紗痲/煮ル果実":{"c":["煮ル果実"],"a":["煮ル果実"]},"食虫植物":{"c":["笹川真生"],"a":["笹川真生"]},"食虫植物 踊ってみた":{"c":["笹川真生"],"a":["笹川真生"]},"ユーエンミー":{"c":["笹川真生"],"a":["笹川真生"]},"ピルグリム":{"c":["rui(fade)"],"a":["毛蟹(LIVE LAB.)"]},"不可思議のカルテ 豊浜のどか Ver. (豊浜のどか)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"不可思議のカルテ 花楓＆かえで Ver. (梓川花楓)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"不可思議のカルテ 牧之原翔子 Ver. (牧之原翔子)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"ここから、ここから (小淵沢報瀬)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"ここから、ここから (玉木マリ)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"ここから、ここから (白石結月)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"ここから、ここから (三宅日向)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"水平線は僕の古傷 SP Short Ver. (広川卯月)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"水平線は僕の古傷 広川卯月 Short Ver. (広川卯月)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"水平線は僕の古傷 (赤城郁実)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"水平線は僕の古傷 赤城郁実 Short Ver. (赤城郁実)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"水平線は僕の古傷 霧島透子 Short Ver.":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"Social World 広川卯月 Short Ver. (広川卯月)":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"Social World":{"c":["カワイヒデヒロ"],"a":["カワイヒデヒロ"]},"青春のアーカイブ (セリカ)":{"c":["40mP"],"a":["40mP"]},"青春のアーカイブ (シロコ)":{"c":["40mP"],"a":["40mP"]},"君に恋を結んで (甘神夜重)":{"c":["鶴﨑輝一"],"a":["鶴﨑輝一"]},"君に恋を結んで (甘神夕奈)":{"c":["鶴﨑輝一"],"a":["鶴﨑輝一"]},"桜のかくしごと (甘神夜重)":{"c":["鶴﨑輝一"],"a":["鶴﨑輝一"]},"桜のかくしごと (甘神夕奈)":{"c":["鶴﨑輝一"],"a":["鶴﨑輝一"]},"†吸tie Ladies† (夏木ひなた)":{"c":["小野貴光"],"a":["玉木千尋"]},"†吸tie Ladies† (ソフィー・トワイライト)":{"c":["小野貴光"],"a":["玉木千尋"]},"がらくた・とれじゃあ (エーコ)":{"c":["トミタカズキ(SUPA LOVE)"],"a":["トミタカズキ(SUPA LOVE)"]},"スクラップ・マーチング！ (エーコ)":{"c":["トミタカズキ(SUPA LOVE)"],"a":["トミタカズキ(SUPA LOVE)"]},"がらくた・とれじゃあ (主人公)":{"c":["トミタカズキ(SUPA LOVE)"],"a":["トミタカズキ(SUPA LOVE)"]},"スクラップ・マーチング！ (主人公)":{"c":["トミタカズキ(SUPA LOVE)"],"a":["トミタカズキ(SUPA LOVE)"]},"はるかぜの化学 (ユー子)":{"c":["山口朗彦"],"a":["山口朗彦"]},"はるかぜの化学 (トオル)":{"c":["山口朗彦"],"a":["山口朗彦"]},"夢路らびりんす (小梅)":{"c":["大久保薫"],"a":["大久保薫"]},"夢路らびりんす (紺)":{"c":["大久保薫"],"a":["大久保薫"]},"Rumbling hearts":{"c":["清水永之"],"a":["飯塚昌明"]},"マブラヴ":{"c":["SAGE KOIZUMI"],"a":["飯塚昌明"]},"STRAIGHT JET":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"ZERO!!":{"c":["中土智博"],"a":["中土智博"]},"奇跡メロディ":{"c":["yozuca*"],"a":["lotta"]},"Kiseki Melody / 奇跡メロディ [D.S. i.F. -Dal Segno- in Future OP]":{"c":["yozuca*"],"a":["lotta"]},"サクライロノキセツ":{"c":["tororo"],"a":["Angel Note"]},"ダ・カーポII 〜あさきゆめみし君と〜":{"c":["tororo"],"a":["Angel Note"]},"ダ・カーポIII 〜キミにささげる あいのマホウ〜":{"c":["tororo"],"a":["黒須克彦"]},"櫻ノ詩":{"c":["松本文紀"],"a":["松本文紀"]},"Sakura no Uta 「 Full Vers. 」":{"c":["松本文紀"],"a":["松本文紀"]},"空気力学少女と少年の詩":{"c":["松本文紀"],"a":["松本文紀"]},"ナグルファルの船上にて":{"c":["松本文紀"],"a":["松本文紀"]},"登れない坂道 「素晴らしき日々」ＥＤ":{"c":["松本文紀"],"a":["松本文紀"]},"Philosophyz":{"c":["折戸伸治"],"a":["MintJam"]},"闇の彼方へ":{"c":["塚越雄一朗"],"a":["塚越雄一朗"]},"ささやかなはじまり":{"c":["塚越雄一朗"],"a":["塚越雄一朗"]},"メグメル":{"c":["菊地創"],"a":["菊地創"]},"リフレクティア":{"c":["菊地創"],"a":["菊地創"]},"比翼の羽根":{"c":["菊地創"],"a":["菊地創"]},"Apocrypha":{"c":["菊地創"],"a":["菊地創"]},"コンフェティ":{"c":["菊地創"],"a":["菊地創"]},"ヒカリ輝くセカイ":{"c":["菊地創"],"a":["菊地創"]},"Closing Tears":{"c":["菊地創"],"a":["菊地創"]},"ナルキッソス":{"c":["菊地創"],"a":["菊地創"]},"花あかりの時":{"c":["菊地創"],"a":["菊地創"]},"奈落の花":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"Super scription of data":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"WHEEL OF FORTUNE (運命の輪)":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Red fraction":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Shining stars bless☆":{"c":["井内舞子"],"a":["井内舞子"]},"Chasse":{"c":["高瀬一矢"],"a":["高瀬一矢","中沢伴行"]},"Rolling Star☆彡":{"c":["井内舞子"],"a":["井内舞子"]},"Send-off ～涙色のスタートライン～":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"木の芽風":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"音のない夜空に":{"c":["高瀬一矢"],"a":["高瀬一矢","尾崎武士"]},"Rimless～フチナシノセカイ～":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"誓い言～スコシだけもう一度～":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"true my heart":{"c":["a.k.a.dRESS"],"a":["a.k.a.dRESS"]},"kiss my lips":{"c":["a.k.a.dRESS"],"a":["a.k.a.dRESS"]},"My Sweet Lady":{"c":["a.k.a.dRESS"],"a":["a.k.a.dRESS"]},"届かない恋":{"c":["石川真也"],"a":["松岡純也"]},"closing":{"c":["下川直哉"],"a":["衣笠道雄"]},"After All":{"c":["石川真也"],"a":["衣笠道雄"]},"星座":{"c":["松岡純也"],"a":["松岡純也"]},"トモシビ":{"c":["巽明子"],"a":["衣笠道雄"]},"天命の傀儡":{"c":["衣笠道雄"],"a":["衣笠道雄"]},"恋夢":{"c":["衣笠道雄"],"a":["衣笠道雄"]},"Alchemy (Yui Ver.)":{"c":["麻枝准"],"a":["光収容"]},"Alchemy":{"c":["麻枝准"],"a":["光収容"]},"Crow Song":{"c":["麻枝准"],"a":["光収容"]},"Little Braver":{"c":["麻枝准"],"a":["光収容"]},"Shine Days":{"c":["麻枝准"],"a":["光収容"]},"Awakening Song":{"c":["麻枝准"],"a":["光収容"]},"Brave Song":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"Boys be Smile":{"c":["麻枝准"],"a":["MANYO"]},"ギターと孤独と蒼い惑星":{"c":["音羽-otoha-"],"a":["三井律郎"]},"夢を束ねて":{"c":["佐藤千亜妃"],"a":["三井律郎"]},"milky way":{"c":["石原慎也"],"a":["三井律郎"]},"惑う星":{"c":["大木伸夫"],"a":["三井律郎"]},"UNITE":{"c":["音羽-otoha-"],"a":["三井律郎"]},"花になって - Be a flower":{"c":["長屋晴子"],"a":["穴見真吾","川口圭太"]},"恥ずかしいか青春は":{"c":["長屋晴子"],"a":["穴見真吾","LASTorder"]},"馬鹿の一つ覚え":{"c":["長屋晴子"],"a":["穴見真吾"]},"キャラクター/ 緑黄色社会":{"c":["穴見真吾","peppe"],"a":["緑黄色社会","横山裕章"]},"Sabotage (緑黄色社会)":{"c":["長屋晴子"],"a":["緑黄色社会","Naoki Itai"]},"光るとき":{"c":["塩塚モエカ"],"a":["羊文学"]},"マフラー":{"c":["塩塚モエカ"],"a":["羊文学"]},"クロノスタシス":{"c":["佐藤千亜妃"],"a":["きのこ帝国"]},"海と花束":{"c":["佐藤千亜妃"],"a":["きのこ帝国"]},"パラノイドパレード":{"c":["佐藤千亜妃"],"a":["きのこ帝国"]},"脳裏上のクラッカー":{"c":["ACAね"],"a":["100回嘔吐"]},"Kan Saete Kuyashiiwa":{"c":["ACAね","ラムシーニ"],"a":["ラムシーニ"]},"Saturn":{"c":["ACAね"],"a":["久保田真悟(Jazzin'park)"]},"サターン":{"c":["ACAね"],"a":["久保田真悟(Jazzin'park)"]},"Time Left":{"c":["ACAね"],"a":["100回嘔吐","ZTMY"]},"Kawakiwoameku":{"c":["美波"],"a":["美波","真船勝博","大塚巧"]},"Hollowness":{"c":["美波"],"a":["美波","真船勝博","大塚巧"]},"GOOD LUCKER":{"c":["美波"],"a":["美波","真船勝博","大塚巧"]},"Good Morning":{"c":["美波"],"a":["美波","真船勝博","大塚巧"]},"貴方の恋人になりたい":{"c":["麗"],"a":["チョーキューメイ"]},"テレキャスター・ストライプ":{"c":["雫"],"a":["ポルカドットスティングレイ"]},"初恋キラー":{"c":["乃紫"],"a":["乃紫"]},"接吻の手引き":{"c":["乃紫"],"a":["乃紫"]},"全方向美少女":{"c":["乃紫"],"a":["乃紫"]},"Sakura Biyori and Time Machine with Hatsune Miku":{"c":["まふまふ"],"a":["まふまふ"]},"Kura Kura":{"c":["meiyo"],"a":["菅野よう子"]},"向日葵":{"c":["みゆはん"],"a":["40mP"]},"I I I":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"III":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"幽霊船戦":{"c":["Toby Fox"],"a":["かめりあ"]},"海想列車":{"c":["40mP"],"a":["40mP"]},"未だ、青い":{"c":["じん"],"a":["じん"]},"キズナトキセキ with hololive JP":{"c":["田淵智也"],"a":["堀江晶太"]},"Palette":{"c":["niki"],"a":["niki"]},"Howling":{"c":["Saku"],"a":["Saku"]},"Stellar Stellar":{"c":["TAKU INOUE"],"a":["TAKU INOUE"]},"灼熱にて純情 (wii-wii-woo)":{"c":["田淵智也"],"a":["堀江晶太"]},"Orbital Period":{"c":["古川本舗"],"a":["古川本舗","和音正人"]},"もうどうなってもいいや - Movie edition -":{"c":["Yuki Tsujimura","Naoki Itai"],"a":["Naoki Itai"]},"レクイエム (星街すいせい ver.)":{"c":["Kanaria"],"a":["Kanaria"]},"レクイエム /Kanaria×星街すいせい":{"c":["Kanaria"],"a":["Kanaria"]},"ジュビリー (M@STER Version)":{"c":["TAKU INOUE"],"a":["TAKU INOUE"]},"往け":{"c":["Ayase"],"a":["江口亮"]},"ブラックボックス":{"c":["秋田ひろむ(amazarashi)"],"a":["出羽良彰"]},"ハルシネイト":{"c":["ツミキ"],"a":["ツミキ"]},"赤い罠(who loves it?)":{"c":["田淵智也"],"a":["堀江晶太"]},"unlasting":{"c":["草野華余子"],"a":["堀江晶太"]},"Shouted Serenade":{"c":["田淵智也"],"a":["堀江晶太"]},"Brave Freak Out":{"c":["高橋浩一郎"],"a":["高橋浩一郎"]},"Thrill, Risk, Heartless":{"c":["田淵智也"],"a":["堀江晶太"]},"dawn":{"c":["草野華余子","堀江晶太"],"a":["堀江晶太"]},"SWEET MAGIC":{"c":["田淵智也"],"a":["江口亮"]},"23:50":{"c":["堀江晶太"],"a":["堀江晶太"]},"YES":{"c":["伊澤一葉"],"a":["江口亮"]},"Rain Song":{"c":["小南泰葉"],"a":["江口亮"]},"dis/connect":{"c":["堀江晶太"],"a":["堀江晶太"]},"Patch Walk":{"c":["小南泰葉"],"a":["江口亮"]},"WiLL〜無色透明〜":{"c":["小南泰葉"],"a":["江口亮"]},"エレクトリリカル":{"c":["渡辺翔"],"a":["堀江晶太"]},"ONLY≠LONELY":{"c":["BIGMAMA"],"a":["BIGMAMA"]},"キモチファクトリー":{"c":["渡辺翔"],"a":["堀江晶太"]},"虚無":{"c":["カヨコ"],"a":["堀江晶太"]},"Psychedelic Drive":{"c":["横山直弘(感覚ピエロ)"],"a":["感覚ピエロ"]},"ハローグッデイ":{"c":["LiSA","PABLO"],"a":["PABLO"]},"Believe in ourselves":{"c":["LiSA","田淵智也"],"a":["堀江晶太"]},"蜜":{"c":["女王蜂"],"a":["女王蜂","塚田耕平"]},"rapid lady ハレーション":{"c":["田淵智也"],"a":["堀江晶太"]},"ラブリーデイ":{"c":["野間康介"],"a":["野間康介"]},"黄金の輝き":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"Mosquito":{"c":["ハヤシケイ(LIVE LAB.)"],"a":["ハヤシケイ(LIVE LAB.)"]},"JAMMER":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"Simoom":{"c":["Pan(LIVE LAB.)"],"a":["Pan(LIVE LAB.)"]},"じゃあな":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"By myself":{"c":["rui(fade)"],"a":["ReoNa"]},"R.I.P.":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"未完成":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"Untitled world":{"c":["毛蟹(LIVE LAB.)"],"a":["堀江晶太"]},"Amore":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"Lv.1 職業：人間":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"命という病":{"c":["堀江晶太"],"a":["堀江晶太"]},"ネリヤカナヤ ～美ら奄美～":{"c":["堀江晶太"],"a":["宮野幸子(SHANGRI-LA INC.)"]},"BIRTHDAY":{"c":["堀江晶太"],"a":["堀江晶太"]},"End of Days":{"c":["rui(fade)"],"a":["堀江晶太","宮野幸子(SHANGRI-LA INC.)"]},"Someday":{"c":["傘村トータ(LIVE LAB.)"],"a":["堀江晶太"]},"テディ":{"c":["傘村トータ(LIVE LAB.)"],"a":["堀江晶太"]},"Debris":{"c":["毛蟹(LIVE LAB.)"],"a":["堀江晶太"]},"Weaker":{"c":["ハヤシケイ(LIVE LAB.)"],"a":["堀江晶太"]},"Wake Me Up":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"革命":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"Girls Don't Cry":{"c":["ハヤシケイ(LIVE LAB.)"],"a":["宮田'レフティ'リョウ"]},"Independence":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"葬送の儀":{"c":["872wur"],"a":["堀江晶太"]},"Dancer in the Discord":{"c":["毛蟹(LIVE LAB.)"],"a":["堀江晶太"]},"Oh UnHappy Day":{"c":["rui(fade)"],"a":["小松一也"]},"Toxic":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"Game of Love":{"c":["rui(fade)"],"a":["ハヤシケイ(LIVE LAB.)"]},"海を泳ぐ月":{"c":["40mP"],"a":["40mP"]},"JOURNEE":{"c":["40mP"],"a":["40mP"]},"億万☆Choooo者！":{"c":["40mP"],"a":["40mP"]},"笑顔のおかわり":{"c":["40mP"],"a":["40mP"]},"ってゆーか":{"c":["40mP"],"a":["40mP"]},"月の温度":{"c":["40mP"],"a":["40mP"]},"最強ガール":{"c":["40mP"],"a":["40mP"]},"深海遊泳":{"c":["40mP"],"a":["40mP"]},"1日は25時間。":{"c":["40mP"],"a":["40mP"]},"渋谷アクアリウム":{"c":["40mP"],"a":["40mP"]},"青一色":{"c":["40mP"],"a":["40mP"]},"重力級拘束ラブ":{"c":["小野貴光"],"a":["小野貴光"]},"ブルーライトコネクト":{"c":["青ゐネコ"],"a":["伊藤立"]},"シルベキコト":{"c":["青谷"],"a":["ナノウ"]},"天灯":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"切り傷":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"淡く微か":{"c":["渡辺翔"],"a":["伊根"]},"メーテルリンク":{"c":["渡辺翔"],"a":["キタニタツヤ"]},"あめにながす":{"c":["渡辺翔"],"a":["キタニタツヤ"]},"影裏":{"c":["渡辺翔"],"a":["sajou no hana"]},"エテルネル":{"c":["藤原彩豊"],"a":["湯浅篤"]},"それでも曇天を越えてゆく-Lyric Video-（TVアニメ『ここは俺に任せて先に行けと言ってから10年がたったら伝説になっていた。』オープニングテーマ）":{"c":["鈴木エレカ","oni"],"a":["ナノウ"]},"青嵐のあとで":{"c":["キタニタツヤ"],"a":["キタニタツヤ","渡辺翔"]},"THE IOLITE":{"c":["ナノウ"],"a":["ナノウ"]},"ココロアダプタ":{"c":["粕谷幸史朗"],"a":["粕谷幸史朗"]},"How many":{"c":["煮ル果実"],"a":["煮ル果実"]},"Hitotsugaimagnetic":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"強がりレジスタンス":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Rhythm is Energy":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Aoharuinclusion":{"c":["中山翔吾","田辺望","ホリイモマ"],"a":["中山翔吾"]},"BABURU":{"c":["細井涼介","Kaz Kuwamura","姜藝利","柿沼雅美"],"a":["細井涼介"]},"共感されなくてもいいじゃない":{"c":["永井葉子"],"a":["TOPICS.LAB"]},"U撃つ":{"c":["戸嶋友祐"],"a":["戸嶋友祐"]},"カメレオンシンドローム":{"c":["佐藤厚仁"],"a":["佐藤厚仁"]},"不健康社会":{"c":["永井葉子"],"a":["TOPICS.LAB"]},"Hanseikai":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Saitsuyowatashiizumu":{"c":["田辺望","理沙","日高カホリ"],"a":["田辺望"]},"Zeronohitosaji":{"c":["卯花ロク"],"a":["卯花ロク"]},"ハジマリノヒ":{"c":["田仲圭太","宮崎梧郎"],"a":["宮崎梧郎"]},"JUMP IN -めぐみん ver.- (めぐみん)":{"c":["佐藤良太"],"a":["佐藤良太"]},"Door (エミリア)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"I Trust You (エミリア)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"点と線":{"c":["坂部剛"],"a":["坂部剛"]},"Overture 〜Songs Begin to Turn〜":{"c":["睦月周平"],"a":["睦月周平"]},"rotate":{"c":["睦月周平"],"a":["睦月周平"]},"Now On Air":{"c":["夢見クジラ"],"a":["大沢圭一","夢見クジラ"]},"プラリネ":{"c":["栗山健太"],"a":["YouSee"]},"夜明けまでに":{"c":["Hina Tsukiyama"],"a":["水口浩次"]},"空色ミサンガ":{"c":["今井亮太郎"],"a":["今井亮太郎"]},"織姫な恋心":{"c":["やぎぬまかな"],"a":["辻林美穂"]},"A Quiet Flame":{"c":["園田健太郎"],"a":["園田健太郎"]},"らびちゅ":{"c":["佐野仁美"],"a":["田中竜夫"]},"Cinema":{"c":["睦月周平"],"a":["睦月周平"]},"青100色":{"c":["川本真琴"],"a":["水口浩次"]},"Shocking Blue":{"c":["園田健太郎"],"a":["園田健太郎"]},"No.6":{"c":["園田健太郎"],"a":["園田健太郎"]},"恋はMovie":{"c":["高田暁"],"a":["高田暁"]},"ワタシイロ":{"c":["多保孝一","UTA"],"a":["UTA"]},"マイフレンド":{"c":["織田哲郎"],"a":["葉山たけし"]},"謎":{"c":["小松未歩"],"a":["古井弘人"]},"ゆずれない願い":{"c":["田村直美","石川寛門"],"a":["鷹羽仁","井上龍仁"]},"素敵だね":{"c":["植松伸夫"],"a":["浜渦正志"]},"輪舞-revolution":{"c":["奥井雅美"],"a":["矢吹俊郎"]},"微笑みの爆弾":{"c":["馬渡松子"],"a":["馬渡松子"]},"輝きは君の中に":{"c":["林哲司"],"a":["林哲司"]},"最後の雨":{"c":["都志見隆"],"a":["富田素弘"]},"十六夜涙":{"c":["浅見昂生"],"a":["浅見昂生"]},"モノクロのキス":{"c":["Shinji"],"a":["シド","西平彰"]},"インビジブル":{"c":["kemu"],"a":["kemu"]},"ワールドイズマイン":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"ギブス":{"c":["椎名林檎"],"a":["椎名林檎","亀田誠治"]},"長く短い祭":{"c":["椎名林檎"],"a":["椎名林檎"]},"二時間だけのバカンス":{"c":["宇多田ヒカル"],"a":["宇多田ヒカル"]},"悪魔の子":{"c":["ヒグチアイ"],"a":["兼松衆"]},"asphyxia":{"c":["中村未来"],"a":["Cö shu Nie"]},"華奢なリップ":{"c":["川谷絵音"],"a":["ジェニーハイ"]},"Ｗ●ＲＫ":{"c":["常田大希"],"a":["millennium parade","椎名林檎"]},"W●RK":{"c":["常田大希"],"a":["millennium parade","椎名林檎"]},"カメレオン":{"c":["常田大希"],"a":["King Gnu"]},"ここで息をして":{"c":["eill","Ryo'LEFTY'Miyata"],"a":["Ryo'LEFTY'Miyata"]},"Anything Goes!":{"c":["tatsuo"],"a":["tatsuo","中川幸太郎"]},"美しい鰭":{"c":["草野マサムネ"],"a":["スピッツ","亀田誠治"]},"勘ぐれい":{"c":["ACAね"],"a":["100回嘔吐","ZTMY"]},"地球儀":{"c":["米津玄師"],"a":["米津玄師","坂東祐大"]},"ハッピーエンド":{"c":["清水依与吏"],"a":["back number","島田昌典"]},"瞬き":{"c":["清水依与吏"],"a":["back number","島田昌典"]},"Stand By You":{"c":["藤原聡"],"a":["Official髭男dism"]},"都落ち":{"c":["n-buna"],"a":["n-buna"]},"フィナーレ。":{"c":["eill"],"a":["ソラノアルト"]},"17さいのうた。":{"c":["『ユイカ』"],"a":["小名川高弘"]},"夜明けと蛍":{"c":["n-buna"],"a":["n-buna"]},"春を待つ":{"c":["Islet"],"a":["Islet"]},"星になる":{"c":["Islet"],"a":["Islet"]},"きみに回帰線":{"c":["稲葉曇"],"a":["稲葉曇"]},"生きる":{"c":["水野あつ"],"a":["水野あつ"]},"ばらの花":{"c":["岸田繁"],"a":["くるり"]},"ツバサ":{"c":["太田朝子"],"a":["アンダーグラフ","島田昌典"]},"Sunny Day Sunday":{"c":["鈴木秋則"],"a":["センチメンタル・バス"]},"ボーイフレンド":{"c":["aiko"],"a":["島田昌典"]},"HOWEVER":{"c":["TAKURO"],"a":["GLAY","佐久間正英"]},"誰ガ為ノ世界":{"c":["志方あきこ"],"a":["志方あきこ"]},"白虎野の娘":{"c":["平沢進"],"a":["平沢進"]},"君よ 気高くあれ":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"祝福のメシアとアイの塔":{"c":["ひとしずく×やま△"],"a":["ひとしずく×やま△"]},"FIND THE WAY":{"c":["Lori Fine"],"a":["Ken Kimura"]},"英雄 運命の詩":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"ヘミソフィア":{"c":["菅野よう子"],"a":["菅野よう子"]},"プライド～嘆きの旅":{"c":["新居昭乃"],"a":["保刈久明"]},"鏡面の波":{"c":["照井順政"],"a":["照井順政"]},"Wind Climbing ～風にあそばれて～":{"c":["奥井亜紀"],"a":["小野寺明敏"]},"こきゅうとす":{"c":["ティカ・α"],"a":["やくしまるえつこ","山口元輝"]},"月と花束":{"c":["さユり"],"a":["江口亮"]},"独白":{"c":["内澤崇仁"],"a":["内澤崇仁"]},"DEAREST DROP":{"c":["Q-MHz"],"a":["増田武史"]},"カヌレ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"カオスが極まる":{"c":["田淵智也"],"a":["UNISON SQUARE GARDEN"]},"不安定な神様":{"c":["衣笠道雄"],"a":["松岡純也"]},"Planetes":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"旅の途中":{"c":["吉良知彦"],"a":["吉良知彦"]},"不死鳥のフランメ":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"タブレット":{"c":["TOOBOE"],"a":["TOOBOE"]},"ENDLESS STORY":{"c":["Dawn Ann Thomas"],"a":["澤野弘之"]},"勿忘":{"c":["Awesome City Club","永野亮"],"a":["永野亮"]},"Touch off":{"c":["UVERworld"],"a":["UVERworld","平出悟"]},"found & lost":{"c":["Survive Said The Prophet"],"a":["Survive Said The Prophet"]},"メタり！！":{"c":["RYU-METAL"],"a":["RYU-METAL"]},"VOiCE":{"c":["ラブリーP"],"a":["ラブリーP"]},"VOY@GER":{"c":["井上拓"],"a":["井上拓"]},"MELODIES":{"c":["けんたあろは"],"a":["けんたあろは"]},"それを人は“青春”と呼んだ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"凪":{"c":["樋口秀樹"],"a":["樋口秀樹"]},"凪 WHITE-LIPS":{"c":["樋口秀樹"],"a":["樋口秀樹"]},"誓いの言葉":{"c":["樋口秀樹"],"a":["樋口秀樹"]},"紅葉":{"c":["樋口秀樹"],"a":["樋口秀樹"]},"もしも明日が晴れならば":{"c":["樋口秀樹"],"a":["樋口秀樹"]},"它是うららか？":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"それはうららか？":{"c":["やしきん"],"a":["やしきん"]},"感情革命ロックンロール":{"c":["田淵智也"],"a":["수조"]},"ダイヤノカガヤキ":{"c":["草野華余子"],"a":["eba"]},"ヒスイ色のミライ":{"c":["宮崎まゆ"],"a":["高橋修平"]},"Sun! Sun! Sunflower":{"c":["やしきん"],"a":["やしきん"]},"#あくあ色ぱれっと":{"c":["Junky"],"a":["Junky"]},"Nonfiction Nook":{"c":["타부치 토모야(田淵智也)"],"a":["수조"]},"夢の糸":{"c":["RIRIKO"],"a":["白戸佑輔"]},"Dream thread":{"c":["RIRIKO"],"a":["白戸佑輔"]},"Magie×Magie":{"c":["脇眞富(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"Magie Magie":{"c":["脇眞富(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"any if":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"Fleeting Time":{"c":["内ب田直孝(Rhythmic Toy World)"],"a":["Rhythmic Toy World"]},"With a Wish":{"c":["Saku"],"a":["Saku"]},"Afterglow":{"c":["脇眞富(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"アフターグロウ":{"c":["fu_mou"],"a":["fu_mou"]},"From Fate":{"c":["凛として時雨"],"a":["TK"]},"Fringed Iris":{"c":["佐藤厚仁"],"a":["佐藤厚仁"]},"Dear Doze Days":{"c":["신崎あやと","橘亮祐"],"a":["篠崎あやと","橘亮祐"]},"Eternally":{"c":["半田翼"],"a":["半田翼"]},"mo∞ent":{"c":["Saku"],"a":["Saku"]},"Magic∞world":{"c":["井内舞子"],"a":["井内舞子"]},"X-encounter":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"刹那の果実":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"ハーモナイズ･クローバー":{"c":["黒須克彦"],"a":["黒須克彦","長田直之"]},"ハーモナイズ・クローバー":{"c":["黒須克彦"],"a":["黒須克彦","長田直之"]},"楽園の翼":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"カワルミライ":{"c":["中山真斗(Elements Garden)"],"a":["中山真斗(Elements Garden)"]},"Authentic symphony":{"c":["虹音"],"a":["虹音"]},"優しさの理由":{"c":["宮崎誠"],"a":["宮崎誠"]},"starlog":{"c":["川本新"],"a":["川本新"]},"BLESS YoUr NAME":{"c":["倉内達矢"],"a":["倉内達矢"]},"明日の君さえいればいい。":{"c":["丸山真由子"],"a":["丸山真由子"]},"灰色のサーガ":{"c":["ChouCho"],"a":["村山☆潤"]},"モノクローム":{"c":["川本新"],"a":["川本新"]},"コンプレックス・イマージュ":{"c":["志倉千代丸"],"a":["上野浩司"]},"Lunatic Tears...":{"c":["Tatsh"],"a":["Tatsh"]},"いつもこの場所で":{"c":["志倉千代丸"],"a":["奥山アキラ"]},"ORANGE":{"c":["志倉千代丸"],"a":["磯江俊道"]},"十字架に捧ぐ七重奏":{"c":["黒須克彦"],"a":["경(kyo)"]},"真実への鎮魂歌":{"c":["志倉千代丸"],"a":["磯江俊道"]},"君の描片～キミノカケラ～":{"c":["Tatsh"],"a":["Tatsh"]},"Close Your Eyes":{"c":["志倉千代丸"],"a":["磯江俊道"]},"コワレヤスキ":{"c":["佐伯高志"],"a":["佐伯高志"]},"Shadow gate to love":{"c":["渡辺和紀"],"a":["渡辺和紀"]},"Guilty Eyes Fever":{"c":["本多友紀(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"Phantom Rocket Adventure":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Shooting Star Warrior":{"c":["MEG","Kanata Okajima"],"a":["MEG"]},"Deep Sea Cocoon":{"c":["MEG","Kanata Okajima"],"a":["MEG"]},"Nameless Love Song":{"c":["MEG","Kanata Okajima"],"a":["MEG"]},"Guilty!? Farewell party":{"c":["YASUSHI WATANABE"],"a":["YASUSHI WATANABE"]},"Dazzling White Town":{"c":["渡辺和紀"],"a":["渡辺和紀"]},"Lonely Snow Planet":{"c":["馬渕直純"],"a":["馬渕直純"]},"After The Rain":{"c":["R・O・N"],"a":["R・O・N"]},"CRASH MIND":{"c":["宮崎誠"],"a":["宮崎誠"]},"DROPOUT!?":{"c":["馬渕直純"],"a":["馬渕直純"]},"The Last Frontier":{"c":["AZKi"],"a":["RD-Sounds"]},"afterglow":{"c":["AZKi","中川大二郎"],"a":["中川大二郎"]},"未来カンパネラ":{"c":["山田竜平"],"a":["山田竜平"]},"オキドキ":{"c":["渡辺翔"],"a":["奈須野新平"]},"エンドロールは終わらない":{"c":["瀬名航"],"a":["瀬名航"]},"セカイの色彩":{"c":["やしきん"],"a":["やしきん"]},"こいのうた":{"c":["中島優美"],"a":["GO!GO!7188"]},"スイちゃんのメンテナンスソング":{"c":["ササキトモコ"],"a":["ササキトモコ"]},"彗星":{"c":["tuki."],"a":["野間康介(agehasprings)","KOHD(agehasprings)"]},"夜に咲く":{"c":["sakuma.","野口大志"],"a":["野口大志"]},"Wicked":{"c":["Giga"],"a":["Giga"]},"Planetarium":{"c":["夏代孝明"],"a":["渡辺拓也"]},"My Abyss":{"c":["YAMAAD"],"a":["YAMAAD"]},"バズビバザヴ":{"c":["てにをは"],"a":["てにをは"]},"ChewyChewy":{"c":["nqrse"],"a":["柿迫ヒカル"]},"処方箋":{"c":["和ぬか"],"a":["100回嘔吐","和ぬか"]},"心の在処はすぐ傍に":{"c":["瀬名航"],"a":["瀬名航"]},"不可視":{"c":["ユリイ・カノン"],"a":["廣澤優也"]},"サキミダレアッパレード♪":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"Sakuraful March":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"PON-DERFUL!!!":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ハートオンライン":{"c":["キノシタ"],"a":["キノシタ"]},"花月ノ夢":{"c":["ゆうゆ"],"a":["ゆうゆ"]},"咲き誇れアイドル":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"Love is a potion":{"c":["佐高陵平(Hifumi,inc.)"],"a":["佐高陵平(Hifumi,inc.)"]},"Dorothy":{"c":["Tomggg"],"a":["Tomggg"]},"ブルー・フェアリー":{"c":["Tomggg"],"a":["Tomggg"]},"愛と呼ぶなら":{"c":["オーイシマサヨシ"],"a":["オーイシマサヨシ"]},"Little steps":{"c":["睦月周平"],"a":["睦月周平"]},"Harvest":{"c":["睦月周平"],"a":["睦月周平"]},"Freesia":{"c":["宮崎誠"],"a":["宮崎誠"]},"Resolution":{"c":["R・O・N"],"a":["R・O・N"]},"人間どもよ":{"c":["R・O・N"],"a":["R・O・N"]},"あなたの心のGravity":{"c":["白戸佑輔(Dream Monster)"],"a":["白戸佑輔(Dream Monster)"]},"Exactly":{"c":["園田健太郎"],"a":["園田健太郎"]},"Catch me Cats me":{"c":["清竹真奈美"],"a":["川島弘光"]},"Sweet alert":{"c":["전다운"],"a":["전다운"]},"QT Two-Face":{"c":["大島こうすけ"],"a":["大島こうすけ"]},"Walkure Attack!":{"c":["姐御 head","藤澤慶昌"],"a":["藤澤慶昌"]},"ワルキューレのバースデイソング":{"c":["Happy Field"],"a":["窪田ミナ"]},"ようこそ! ワルキューレ・ワールドへ":{"c":["堂島孝平"],"a":["北川勝利"]},"Glow in the dark":{"c":["渡辺未来"],"a":["渡辺未来"]},"Diva in Abyss":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"ダイアモンド クレバス～Mikumo Ver.～":{"c":["菅野よう子"],"a":["菅野よう子"]},"兎座ストーリー":{"c":["picco"],"a":["picco"]},"ぺこらんだむぶれいん!":{"c":["俊龍"],"a":["よる。"]},"全人類 兎化計画!":{"c":["前山田健一"],"a":["藤原燈太"]},"いいわけバニー":{"c":["岩見陸"],"a":["ナナホシ管弦楽団"]},"カミサマ・ネコサマ":{"c":["やしきん"],"a":["橘亮祐"]},"ネコカブリーナ":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"デタバレネコ":{"c":["kemu"],"a":["kemu"]},"I’m Your Treasure Box *あなたは マリンせんちょうを たからばこからみつけた。":{"c":["U.Z. INU"],"a":["かめりあ"]},"Ahoy!! 我ら宝鐘海賊団☆":{"c":["ARM(IOSYS)"],"a":["ARM(IOSYS)"]},"うい麦畑でつかまえて":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"さなのおうた。":{"c":["もっふーP"],"a":["もっふーP"]},"エッビーナースデイ":{"c":["やしきん"],"a":["やしきん"]},"あのバンド":{"c":["草野華余子"],"a":["三井律郎"]},"ダイアローグ+インビテーション!":{"c":["田淵智也"],"a":["睦月周平"]},"なないろびより":{"c":["きみコ"],"a":["nano.RIPE"]},"モア!ジャンプ!モア!":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"needLe":{"c":["DECO*27"],"a":["Rockwell"]},"アイカツ☆ステップ!":{"c":["connie"],"a":["connie"]},"スタージェット!":{"c":["長橋健一"],"a":["南田健吾(onetrap)"]},"STARDOM!":{"c":["蔦谷好位置"],"a":["田中隼人(agehasprings)"]},"ideal white":{"c":["Carlos K.","Toshi-Fj"],"a":["Carlos K."]},"vanilla sky":{"c":["じん"],"a":["じん","田口囁一"]},"回レ!雪月花":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"SUPERORBITAL":{"c":["藤澤健至"],"a":["藤澤健至"]},"M@STERPIECE":{"c":["神前暁"],"a":["神前暁","高田龍一"]},"シャイノグラフィ":{"c":["古屋真","ヒゲドライバー"],"a":["ヒゲドライバー"]},"シャイノグラフィ (2023 Ver.)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"いつか Shiny Days (2023 Ver.)":{"c":["山田智和"],"a":["住谷翔平"]},"夢咲きAfter school":{"c":["俊龍"],"a":["Sizuk"]},"Guilty Night, Guilty Kiss!":{"c":["R・O・N"],"a":["R・O・N"]},"花女":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"花十カクメイ前日譚":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"かいか":{"c":["廻花"],"a":["Sosuke Oikawa"]},"サクラカゼ":{"c":["ハム"],"a":["ハム"]},"さくら色ハイテンション！":{"c":["ハム"],"a":["ハム"]},"月が満ちる":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"Knew day":{"c":["R・O・N"],"a":["R・O・N"]},"ウラノミト":{"c":["広川恵一(MONACA)"],"a":["広川恵一(MONACA)"]},"月の兎はヴァーチュアルの夢をみる":{"c":["ASA Wu"],"a":["ASA Wu"]},"失礼しますが、RIP♡":{"c":["해랑(Koko)"],"a":["Koko"]},"HINOTORI":{"c":["R・O・N"],"a":["R・O・N"]},"Lioness' Pride":{"c":["かめりあ"],"a":["かめりあ"]},"わための子守唄":{"c":["ハム"],"a":["ハム"]},"宵の余、良い！":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"ぷ・れ・あ・で・す！":{"c":["やしきん"],"a":["やしきん"]},"ねねちのギラギラファンミーティング":{"c":["烏屋茶房"],"a":["篠崎あやと"]},"モモノネ":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"ももいろの砂時計":{"c":["やしきん"],"a":["やしきん"]},"空の箱 (DIAMOND DUST)":{"c":["玉井健二","남혜승"],"a":["百田留衣"]},"ずっと ChamJam":{"c":["渡辺翔"],"a":["倉内達矢"]},"FairyTaleじゃいられない":{"c":["田淵智也"],"a":["堀江晶太"]},"PUNCH☆MIND☆HAPPINESS":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"未確認ふゅーちゃー":{"c":["Junky"],"a":["Junky"]},"クレイジークレイジー":{"c":["Taku Inoue"],"a":["Taku Inoue"]},"ケラケラじゃんけん":{"c":["ふるっぺ"],"a":["宮永治郎"]},"アイドルライフスターターパック":{"c":["Medansy"],"a":["Medansy"]},"アイドルライフブースターパック":{"c":["Medansy"],"a":["Medansy"]},"さよならプリンセス":{"c":["Kai"],"a":["Kai"]},"ラプラスショコラ":{"c":["Kai"],"a":["Kai"]},"マジカホリック":{"c":["Kai"],"a":["Kai"]},"ピタゴラス・ウィッチ":{"c":["Kai"],"a":["Kai"]},"カグヤ":{"c":["Kai"],"a":["Kai"]},"キューピット":{"c":["Kai"],"a":["Kai"]},"ユニコーンガール":{"c":["Kai"],"a":["Kai"]},"シュレディンガール":{"c":["Kai"],"a":["Kai"]},"妄想アスパルテーム":{"c":["picco"],"a":["picco"]},"Marshmallow":{"c":["picco"],"a":["picco"]},"란제리":{"c":["picco"],"a":["picco"]},"モザイクロール":{"c":["DECO*27"],"a":["DECO*27"]},"モザイクロール (Reloaded)":{"c":["DECO*27"],"a":["Rockwell"]},"キッカイケッタイ":{"c":["メドミア"],"a":["メドミア"]},"ビコーズラブユー":{"c":["MIMI"],"a":["MIMI"]},"愛猫":{"c":["biz"],"a":["biz"]},"えいえんじゃなくてゴ×ンネ":{"c":["キノシタ"],"a":["キノシタ"]},"雑魚":{"c":["柊マグネタイト"],"a":["柊マグネタイト"]},"撫でんな":{"c":["柊マグネタイト"],"a":["柊マグネタイト"]},"エレクトロサチュレイタ":{"c":["tilt-six"],"a":["tilt-six"]},"SAN値直葬":{"c":["スズム"],"a":["スズム"]},"恋色病棟":{"c":["OSTER project"],"a":["OSTER project"]},"キャットフード":{"c":["doriko"],"a":["doriko"]},"ピチカートドロップス":{"c":["とあ"],"a":["とあ"]},"サラバイサラバイ":{"c":["とあ"],"a":["とあ"]},"らぶびーむ！！":{"c":["たかやん"],"a":["たかやん"]},"Whisper Whisper Whisper":{"c":["Azari"],"a":["Azari"]},"4BLOOD":{"c":["KIRA"],"a":["KIRA"]},"反芻シ考":{"c":["れるりり"],"a":["れるりり"]},"よくばり":{"c":["Ayase"],"a":["Ayase"]},"絶対的少年値":{"c":["すりぃ"],"a":["すりぃ"]},"セブンティーナ":{"c":["すりぃ"],"a":["すりぃ"]},"フクロウさん":{"c":["すりぃ"],"a":["すりぃ"]},"カメレオン (すりぃ)":{"c":["すりぃ"],"a":["すりぃ"]},"乙女のポリシー":{"c":["永井誠"],"a":["京田誠一"]},"quiet room":{"c":["有機酸"],"a":["有機酸"]},"カトラリー":{"c":["有機酸"],"a":["有機酸"]},"退紅トレイン":{"c":["有機酸"],"a":["有機酸"]},"ONE OFF MIND":{"c":["栗山夕璃"],"a":["Van de Shop"]},"フィグ":{"c":["やみくろ"],"a":["やみくろ"]},"タイニーバニー":{"c":["youまん"],"a":["youまん"]},"ケセラリズム":{"c":["syudou"],"a":["syudou"]},"フロイデ":{"c":["R Sound Design"],"a":["R Sound Design"]},"帝国少女":{"c":["R Sound Design"],"a":["R Sound Design"]},"flos":{"c":["R Sound Design"],"a":["R Sound Design"]},"ラブレター・フロム・メランコリー":{"c":["カラスヤサボウ"],"a":["カラスヤサボウ"]},"君が夜の海に還るまで":{"c":["砂守岳央"],"a":["未来古代楽団"]},"ノウナイディスコ":{"c":["r-906"],"a":["r-906"]},"パノプティコン":{"c":["r-906"],"a":["r-906"]},"三日月ステップ":{"c":["r-906"],"a":["r-906"]},"泣かないあなたの守り方":{"c":["傘村トータ"],"a":["傘村トータ"]},"レムの魔法":{"c":["傘村トータ"],"a":["傘村トータ"]},"22歳の反抗":{"c":["傘村トータ"],"a":["傘村トータ"]},"18歳の責任":{"c":["傘村トータ"],"a":["傘村トータ"]},"生きるってなんだよ":{"c":["傘村トータ"],"a":["傘村トータ"]},"その影へ静かな方へ":{"c":["傘村トータ"],"a":["傘村トータ"]},"僕は夢を持ったままの子どもでいるだけ":{"c":["傘村トータ"],"a":["傘村トータ"]},"僕が夢を捨てて大人になるまで":{"c":["傘村トータ"],"a":["傘村トータ"]},"孤独の波にさらわれないように":{"c":["傘村トータ"],"a":["傘村トータ"]},"小説 夏と罰（上・下）":{"c":["傘村トータ"],"a":["傘村トータ"]},"明けない夜のリリィ":{"c":["傘村トータ"],"a":["傘村トータ"]},"あなたの夜が明けるまで":{"c":["傘村トータ"],"a":["傘村トータ"]},"晴天を穿つ":{"c":["傘村トータ"],"a":["傘村トータ"]},"贖罪":{"c":["傘村トータ"],"a":["傘村トータ"]},"大切な人たちへ":{"c":["傘村トータ"],"a":["傘村トータ"]},"劇場愛歌":{"c":["n-buna"],"a":["n-buna"]},"ドラドの悲劇":{"c":["n-buna"],"a":["n-buna"]},"ラプンツェル":{"c":["n-buna"],"a":["n-buna"]},"ラプンツェル(Rapunzel)":{"c":["n-buna"],"a":["n-buna"]},"ただ君に晴れ":{"c":["n-buna"],"a":["n-buna"]},"그저 네게 맑아라 (ただ君に晴れ)":{"c":["n-buna"],"a":["n-buna"]},"アランスミシー":{"c":["まふまふ"],"a":["まふまふ"]},"猫の食卓":{"c":["きくお"],"a":["きくお"]},"Fine On The Outside":{"c":["Priscilla Ahn"],"a":["Priscilla Ahn"]},"決戦スピリット":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"センパイ。":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"イノコリ先生":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"say my nameの片想い":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"No.1":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"風のアンセム":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"夜もすがら君想ふ":{"c":["TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"夜もすがら君を想う":{"c":["TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"Sheepret! - TOKOTOKO（西沢さんP）":{"c":["TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"スローモーション":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"ありふれたせかいせいふく":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"ありふれたせかいせいふく feat. 初音ミク":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"ラブカ？":{"c":["柊キライ"],"a":["柊キライ"]},"オートファジー":{"c":["柊キライ"],"a":["柊キライ"]},"エバ":{"c":["柊キライ"],"a":["柊キライ"]},"ジェラシス":{"c":["Chinozo"],"a":["Chinozo"]},"シェーマ":{"c":["Chinozo"],"a":["Chinozo"]},"グッバイ宣言":{"c":["Chinozo"],"a":["Chinozo"]},"キルマー":{"c":["煮ル果実"],"a":["煮ル果実"]},"トラフィック・ジャム":{"c":["煮ル果実"],"a":["煮ル果実"]},"Rumor ルーマー ( ポリスピカデリー )":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"Rumor":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"Cynic":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"ナーヴ・インパルス":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"キレキャリオン":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"6900000000":{"c":["ハム"],"a":["ハム"]},"glow」 Piano & Strings Acoustic ver.":{"c":["keeno"],"a":["keeno"]},"藍深く":{"c":["keeno"],"a":["keeno"]},"crack":{"c":["keeno"],"a":["keeno"]},"longing":{"c":["keeno"],"a":["keeno"]},"morning haze":{"c":["keeno"],"a":["keeno"]},"in the rain":{"c":["keeno"],"a":["keeno"]},"drowsiness":{"c":["keeno"],"a":["keeno"]},"Fragile":{"c":["ぬゆり"],"a":["ぬゆり"]},"フラジール":{"c":["ぬゆり"],"a":["ぬゆり"]},"プロトディスコ":{"c":["ぬゆり"],"a":["ぬゆり"]},"ディカディズム":{"c":["ぬゆり"],"a":["ぬゆり"]},"ロンリーユニバース":{"c":["Aqu3ra"],"a":["Aqu3ra"]},"Lonely Universe(ロンリーユニバース)":{"c":["Aqu3ra"],"a":["Aqu3ra"]},"アイスドロップ":{"c":["Aqu3ra"],"a":["Aqu3ra"]},"innocent starter":{"c":["水樹奈々"],"a":["大平勉"]},"ETERNAL BLAZE":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"風待ちジェット":{"c":["鈴木祥子"],"a":["飯田高広"]},"スピカ":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"月光花":{"c":["yasu"],"a":["Janne Da Arc"]},"Black Cherry":{"c":["YUKI"],"a":["Acid Black Cherry"]},"僕たちの行方":{"c":["Yuta Nakano"],"a":["Yuta Nakano"]},"Starry Heavens":{"c":["鈴木大輔"],"a":["day after tomorrow","五十嵐充"]},"My will":{"c":["yashikin","松尾亮"],"a":["菊谷知樹"]},"拍手喝采歌合":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"夜に駆ける":{"c":["Ayase"],"a":["Ayase"]},"ハルカ":{"c":["Ayase"],"a":["Ayase"]},"晩餐歌":{"c":["tuki."],"a":["usami"]},"JANE DOE":{"c":["米津玄師"],"a":["米津玄師"]},"JANE DOE (Kenshi Yonezu, Hikaru Utada)":{"c":["米津玄師"],"a":["米津玄師"]},"Summertime (cinnamons × evening cinema)":{"c":["原田夏樹"],"a":["evening cinema"]},"白い恋人達":{"c":["桑田佳祐"],"a":["桑田佳祐"]},"恋のつぼみ":{"c":["加藤裕介"],"a":["加藤裕介"]},"サイレントマジョリティー":{"c":["バグベア"],"a":["久下真音"]},"YOKU (Eve)":{"c":["Eve"],"a":["Numa"]},"Tot Musica (Ado) ウタ from ONE PIECE FILM RED":{"c":["澤野弘之"],"a":["澤野弘之"]},"許嫁っきゅん / ano":{"c":["真部脩一"],"a":["TAKU INOUE"]},"公然の秘密":{"c":["椎名林檎"],"a":["椎名林檎","斎藤ネコ"]},"Ref:rain":{"c":["飛内将大"],"a":["玉井健二","飛内将大"]},"アンビバレント":{"c":["Uru"],"a":["田中隼人"]},"境界線":{"c":["秋田ひろむ(amazarashi)"],"a":["出羽良彰"]},"Paradise Lost":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"夏夢ノイジー":{"c":["志倉千代丸"],"a":["悠木真一"]},"あたしが隣にいるうちに":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"White key":{"c":["葉山拓亮"],"a":["葉山拓亮"]},"WHITE BREATH":{"c":["浅倉大介"],"a":["浅倉大介"]},"Imitation Rain":{"c":["YOSHIKI"],"a":["YOSHIKI"]},"走れ！":{"c":["michitomo"],"a":["michitomo"]},"気づいたら片想い":{"c":["Akira Sunset"],"a":["湯浅篤"]},"ときめきの導火線":{"c":["家原正嗣"],"a":["山中紀昌"]},"Hajimete no Oto":{"c":["malo"],"a":["malo"]},"Little Traveler":{"c":["ジミーサムP"],"a":["ジミーサムP"]},"君は天然色":{"c":["大瀧詠一"],"a":["多羅尾伴内"]},"あゝ無情":{"c":["NOBODY"],"a":["佐藤準"]},"オリビアを聴きながら":{"c":["尾崎亜美"],"a":["瀬尾一三"]},"ありがとう…":{"c":["KOKIA"],"a":["日向敏文"]},"少年よ我に帰れ":{"c":["ティカ・α"],"a":["やくしまるえつこ","近藤研二"]},"おなじ話":{"c":["佐藤良成"],"a":["ハンバート ハンバート"]},"Moon Crying":{"c":["Miwa Furuse"],"a":["h-wonder","Jun Abe"]},"いのち":{"c":["瀬名航"],"a":["瀬名航"]},"canopus":{"c":["AZKi","中川大二郎"],"a":["中川大二郎"]},"銀河と海路":{"c":["伊東歌詞太郎"],"a":["青柳諒"]},"FreeGeo":{"c":["Twinfield"],"a":["Twinfield"]},"ω猫":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"Operation Z":{"c":["やしきん"],"a":["やしきん"]},"カゲロウノ調":{"c":["小野貴光"],"a":["小野貴光"]},"夢屑ケーキ":{"c":["石井涼大"],"a":["Honoka"]},"白明":{"c":["山本玲史"],"a":["山本玲史"]},"雨のち晴れ晴れ":{"c":["山下洋介"],"a":["山下洋介"]},"Farewell":{"c":["流歌","AZKi"],"a":["佐伯高志","流歌","萩龍一","藤崎昌弘"]},"最強×最弱ガール":{"c":["sumeshiii a.k.a.バーチャルお寿司"],"a":["sumeshiii a.k.a.バーチャルお寿司"]},"ナナワリエネミー":{"c":["アザミ"],"a":["アザミ"]},"オーバーライト":{"c":["ハム","clocknote."],"a":["ハム","clocknote."]},"画面の中の君が好き":{"c":["瀬名航"],"a":["瀬名航"]},"Existlog":{"c":["鈴谷皆人"],"a":["鈴谷皆人"]},"petrichor":{"c":["AZKi"],"a":["中川大二郎"]},"equal":{"c":["AZKi"],"a":["中川大二郎"]},"mirror":{"c":["さめのぽき"],"a":["さめのぽき"]},"petal dance":{"c":["rionos"],"a":["rionos"]},"ディーヴァフィーバー":{"c":["加藤裕介"],"a":["加藤裕介"]},"【My Loving収録】刹那ティックコード【ときのそら":{"c":["渡部チェル"],"a":["渡部チェル"]},"紅藍クロニクル":{"c":["Yugo Ichikawa"],"a":["Yugo Ichikawa"]},"嘘嘘嘘嘘":{"c":["井口イチロウ"],"a":["井口イチロウ"]},"のんびりと":{"c":["ぽりふぉ"],"a":["ぽりふぉ"]},"Midnight Song":{"c":["Batsu"],"a":["Batsu"]},"Cream+Mint":{"c":["Batsu"],"a":["Batsu"]},"Kiss me! Choose me!":{"c":["ハム"],"a":["ハム"]},"あずいろ BESTIE DAYS":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"最強未来衝動":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"fragile":{"c":["菊池一仁"],"a":["高橋圭一"]},"Going My Way":{"c":["瀬名航"],"a":["瀬名航"]},"TRUTH":{"c":["YAMAAD"],"a":["YAMAAD"]},"FACT":{"c":["niki"],"a":["niki"]},"born to be real":{"c":["ANCHOR"],"a":["ANCHOR"]},"AKUMA":{"c":["すりぃ"],"a":["すりぃ"]},"マイロア":{"c":["鬱P"],"a":["鬱P"]},"ミッドナイト・ランナウェイ":{"c":["R Sound Design"],"a":["R Sound Design"]},"U.F.O. - U Feel Overjoyed! -":{"c":["紫煉(Unlucky Morpheus)"],"a":["紫煉(Unlucky Morpheus)"]},"S.T.Y.":{"c":["buzzG"],"a":["buzzG"]},"New Order":{"c":["R・O・N"],"a":["R・O・N"]},"命の洗濯":{"c":["ヒグチアイ"],"a":["兼松衆"]},"凛":{"c":["重永亮介"],"a":["重永亮介"]},"raimei":{"c":["buzzG"],"a":["buzzG"]},"君と明かした夜":{"c":["Keisuke Koyama"],"a":["Keisuke Koyama"]},"シルべ":{"c":["古閑翔平(YOURNESS)"],"a":["古閑翔平(YOURNESS)"]},"シャルイース":{"c":["kotokI"],"a":["kotokI"]},"ヒロインオーディション":{"c":["小池竜暉","野口大志"],"a":["小池竜暉","野口大志"]},"ROSE of the LAMP":{"c":["EFFY(FirstCall)"],"a":["EFFY(FirstCall)"]},"キミにまつわる運命事情":{"c":["小松一也"],"a":["小松一也"]},"異薔薇":{"c":["TKT(from AliA)"],"a":["TKT(from AliA)"]},"モノポリー":{"c":["TKT(from AliA)"],"a":["TKT(from AliA)"]},"ChocoLove":{"c":["Junky"],"a":["Junky"]},"Secret Class":{"c":["奏音69"],"a":["奏音69"]},"NoDistance":{"c":["涼木シンジ(KEYTONE)"],"a":["涼木シンジ(KEYTONE)"]},"Sickbay Mistake":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"Love Trick":{"c":["biz","ZERA"],"a":["biz","ZERA"]},"ユーフォリア":{"c":["窪田ミナ"],"a":["窪田ミナ"]},"Got Cheat":{"c":["梅とら"],"a":["梅とら"]},"「ゎ」":{"c":["DECO*27"],"a":["Rockwell"]},"ゎ":{"c":["DECO*27"],"a":["Rockwell"]},"Sincerely":{"c":["堀江晶太"],"a":["堀江晶太"]},"夏宿り":{"c":["おぐらあすか"],"a":["おぐらあすか"]},"たんぽぽ":{"c":["是"],"a":["是"]},"旅のゆくえ":{"c":["小鷲翔太"],"a":["小鷲翔太"]},"Colorful Universe":{"c":["伊藤和馬(Arte Refact)"],"a":["伊藤和馬(Arte Refact)"]},"ドッタバッタ珍道中！":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"けものへんの女":{"c":["てにをは"],"a":["てにをは"]},"春が来るまでは":{"c":["YOSHIHIRO"],"a":["YOSHIHIRO"]},"小心旅行":{"c":["澤田空海理"],"a":["澤田空海理"]},"little pack":{"c":["やなぎなぎ"],"a":["出羽良彰"]},"セツナライト・スパークル":{"c":["本多友紀"],"a":["本多友紀"]},"狼煙":{"c":["草野華余子"],"a":["BLACK ALBATROSS"]},"ヒロイン":{"c":["加藤冴人"],"a":["加藤冴人"]},"抗う君への鎮魂歌":{"c":["堀江晶太"],"a":["堀江晶太"]},"CHARISMA":{"c":["jon-YAKITORY"],"a":["jon-YAKITORY"]},"Tori To Re:TreaT":{"c":["ハヤシベトモノリ"],"a":["ハヤシベトモノリ"]},"ひみつのおしごと":{"c":["岩見陸"],"a":["ナナホシ管弦楽団"]},"DARE!?":{"c":["柊キライ"],"a":["柊キライ"]},"夢ができたの":{"c":["金崎真士"],"a":["金崎真士"]},"神様がバカなだけ!!":{"c":["ビートまりお","まろん"],"a":["ARM(IOSYS)"]},"Beautiful Circle":{"c":["佐藤純一(fhana)"],"a":["佐藤純一(fhana)"]},"Shout now, sheep!!":{"c":["ダルビッシュP"],"a":["ダルビッシュP"]},"愛昧ショコラーテ -PandaBoYremix-":{"c":["やしきん"],"a":["PandaBoY"]},"Happy day to you!":{"c":["堀江晶太"],"a":["堀江晶太"]},"ラムダック":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"きっと":{"c":["佐藤陽介(Hifumi,inc.)"],"a":["佐藤陽介(Hifumi,inc.)"]},"Go my way":{"c":["木村孝明"],"a":["木村孝明"]},"ししわたクッキング":{"c":["やしきん"],"a":["やしきん"]},"Reaper vs. Sheep -Ouen ver.-":{"c":["Koko"],"a":["Koko"]},"月に向かって撃て":{"c":["岩見陸"],"a":["ナナホシ管弦楽団"]},"OUT OF FRAME":{"c":["桑原聖(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"ゾンビゾンビゾンビ":{"c":["なとり"],"a":["なとり"]},"GUM&DROP":{"c":["Kyler Niko","Geek Boy Al Swettenham"],"a":["Geek Boy Al Swettenham"]},"story time":{"c":["山田高弘"],"a":["齋藤真也"]},"GET THE CROWN":{"c":["酒井拓也(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"教室に青":{"c":["HoneyWorks"],"a":["HoneyWorks","MARUMOCHI"]},"星をみる少女":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"Slumber (ミュウ)":{"c":["じん"],"a":["じん"]},"Slip out! (ミュウ)":{"c":["じん"],"a":["じん"]},"Fairy tale (ミュウ)":{"c":["じん"],"a":["じん"]},"Top of ocean (ミュウ)":{"c":["じん"],"a":["じん"]},"Listeners (ミュウ)":{"c":["じん"],"a":["じん"]},"Muse (ミュウ)":{"c":["じん"],"a":["じん"]},"Love song (ミュウ)":{"c":["じん"],"a":["じん"]},"Dilemma (ミュウ)":{"c":["じん"],"a":["じん"]},"Rainy lain (ミュウ)":{"c":["じん"],"a":["じん"]},"Trauma (ミュウ)":{"c":["じん"],"a":["じん"]},"Borders (ミュウ)":{"c":["じん"],"a":["じん"]},"排他的メランコリー (ヒナリア・ダーケンド)":{"c":["俊龍"],"a":["Sizuk"]},"君は天然色 ～後藤 姫ver.～ (後藤姫)":{"c":["大瀧詠一"],"a":["菊谷知樹"]},"あゝ無情 (朱美)":{"c":["NOBODY"],"a":["佐藤準"]},"オリビアを聴きながら (朱美)":{"c":["尾崎亜美"],"a":["瀬尾一三"]},"燦燦燦":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"きみの名前":{"c":["大畑拓也"],"a":["大畑拓也"]},"あした朝食を食べる頃には":{"c":["近藤世真(Elements Garden)"],"a":["近藤世真(Elements Garden)"]},"夢なんかじゃ飯は喰えないと誰かのせいにして":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"好きになってはいけない理由":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"永遠に一回の":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"愛の歌":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"何処へ":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"祈り":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"FRONTIER":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"Liver's High!!":{"c":["原田雄大"],"a":["原田雄大"]},"奏でろ音楽！！！full ver.":{"c":["Biri"],"a":["Biri"]},"WISH!":{"c":["senaru"],"a":["senaru"]},"MapleStep":{"c":["정구현"],"a":["정구현"]},"あのね、ぼくね。":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"Irodore Fashionista!":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"ゲッカビジン":{"c":["Giz'Mo(from Jam9)","Eunsol(1008)","石黒剛"],"a":["渡辺和紀"]},"ソレイユスマイル":{"c":["綺羅クリア"],"a":["渡辺拓也"]},"百億年分のしあわせ":{"c":["綺羅クリア"],"a":["佐藤厚仁"]},"Yup! Yup! Yup!":{"c":["Kanata Okajima","ArmySlick"],"a":["ArmySlick"]},"明日の空の僕たちへ":{"c":["家原正樹"],"a":["家原正樹"]},"365 Days":{"c":["園田健太郎"],"a":["園田健太郎"]},"メアの教育":{"c":["コウ(Diarays)"],"a":["コウ(Diarays)"]},"シニカル・シニカル":{"c":["吐息."],"a":["吐息."]},"オブソミート":{"c":["サツキ"],"a":["サツキ"]},"レイメイ":{"c":["さユり","Sho"],"a":["MY FIRST STORY"]},"レイメイ (Reimei)":{"c":["さユり","Sho"],"a":["MY FIRST STORY"]},"YUBIKIRI-GENMAN":{"c":["Yamato Kasai"],"a":["Yamato Kasai"]},"ぼくたちいつでも しゅわっしゅわ！":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"歌ってみた 】ぼくたちいつでも しゅわっしゅわ！":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"劇薬中毒":{"c":["齋藤奏太"],"a":["齋藤奏太"]},"劇薬中毒 /＝LOVE（イコールラブ）":{"c":["齋藤奏太"],"a":["齋藤奏太"]},"子供になってみた】おこちゃま戦争":{"c":["Giga"],"a":["Giga"]},"울려퍼져라 (Hibikase ヒビカセ)":{"c":["Giga"],"a":["Giga"]},"​【歌ってみたコラボ】再会":{"c":["Ayase"],"a":["Ayase"]},"FACE":{"c":["小室哲哉"],"a":["小室哲哉"]},"Can't Wait 'Til Christmas":{"c":["宇多田ヒカル"],"a":["宇多田ヒカル"]},"Fallen":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"IRIS OUT":{"c":["米津玄師"],"a":["米津玄師"]},"いるよ":{"c":["水野あつ"],"a":["水野あつ"]},"ハローマリーナ":{"c":["稲葉曇"],"a":["稲葉曇"]},"ハローマリーナ ー":{"c":["稲葉曇"],"a":["稲葉曇"]},"いまさら輪廻":{"c":["なきそ"],"a":["なきそ"]},"いますぐ輪廻":{"c":["なきそ"],"a":["なきそ"]},"オールマスター":{"c":["大漠波新"],"a":["大漠波新"]},"人生リセットボタン":{"c":["kemu"],"a":["kemu"]},"スキスキ絶頂症":{"c":["koyori(電ポルP)"],"a":["koyori(電ポルP)"]},"夏に去りし君を想フ":{"c":["baker"],"a":["baker"]},"on the rocks":{"c":["OSTER project"],"a":["OSTER project"]},"MAD HEAD LOVE":{"c":["米津玄師"],"a":["米津玄師"]},"irony":{"c":["kz"],"a":["kz"]},"変わらないもの":{"c":["奥華子"],"a":["佐藤準"]},"ゾンビ":{"c":["DECO*27"],"a":["Rockwell"]},"鈴々- PEOPLE1":{"c":["Deu"],"a":["Deu","Hajime Taguchi"]},"水星":{"c":["tofubeats"],"a":["tofubeats"]},"シンクロニシティ":{"c":["シライシ紗トリ"],"a":["シライシ紗トリ"]},"セクト":{"c":["Mah"],"a":["Mah"]},"古書屋敷殺人事件":{"c":["てにをは"],"a":["てにをは"]},"レッド・パージ！！！":{"c":["P.I.N.A."],"a":["P.I.N.A."]},"九龍レトロ":{"c":["トーマ"],"a":["トーマ"]},"Fool Definition":{"c":["Rin(ぎんすけ)"],"a":["Rin(ぎんすけ)"]},"花瓶に触れた":{"c":["バルーン"],"a":["バルーン"]},"愛して愛して愛して":{"c":["きくお"],"a":["きくお"]},"忘却日記":{"c":["コウ(Diarays)"],"a":["コウ(Diarays)"]},"身体の分解と再構築、または神話の円環性について":{"c":["こんにちは谷田さん"],"a":["こんにちは谷田さん"]},"砂嵐":{"c":["Mah"],"a":["Mah"]},"夜の反芻は空白を待つ":{"c":["バルーン","宮下遊"],"a":["バルーン","宮下遊"]},"ラズベリー＊モンスター":{"c":["Gom","shito"],"a":["HoneyWorks"]},"ラズベリー*モンスター":{"c":["Gom","shito"],"a":["HoneyWorks"]},"終わらない物語":{"c":["なつめ千秋"],"a":["なつめ千秋"]},"証":{"c":["トラボルタ"],"a":["トラボルタ"]},"スウィートタイム":{"c":["BETTI"],"a":["BETTI"]},"Black Out":{"c":["梅とら"],"a":["梅とら"]},"Love Me If You Can":{"c":["梅とら"],"a":["梅とら"]},"スキナヒト":{"c":["梅とら"],"a":["梅とら"]},"SUPER DAYS":{"c":["梅とら"],"a":["梅とら"]},"celluloid":{"c":["baker"],"a":["baker"]},"「笹舟」PV【*＊Flower✿Drops＊*】":{"c":["doriko"],"a":["F☆T"]},"笹舟":{"c":["doriko"],"a":["F☆T"]},"Flower Drops":{"c":["doriko"],"a":["KAIDOU"]},"君の軌跡":{"c":["齋藤真也"],"a":["齋藤真也"]},"Flower Rail":{"c":["OSTER project"],"a":["OSTER project"]},"かまってウォーアイニー":{"c":["てにをは"],"a":["てにをは"]},"Color":{"c":["YURiCa","ダルビッシュP"],"a":["ダルビッシュP"]},"13文字のアイコトバ":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Polaris":{"c":["G.K"],"a":["G.K"]},"楽園イリュージョン":{"c":["Rabbit J"],"a":["Rabbit J"]},"ERiCa":{"c":["OSTER project"],"a":["OSTER project"]},"Niwaka Ame":{"c":["天野月"],"a":["天野月"]},"カミソリパーティー":{"c":["さつき が てんこもり"],"a":["さつき が てんこもり"]},"poppin' jumpin'":{"c":["まらしぃ"],"a":["kors k"]},"Out of Reality":{"c":["kors k"],"a":["kors k"]},"生花":{"c":["ATOLS"],"a":["ATOLS"]},"C":{"c":["花たん"],"a":["花たん"]},"凍る花":{"c":["bermei.inazawa"],"a":["bermei.inazawa"]},"pale":{"c":["ダルビッシュP"],"a":["ダルビッシュP"]},"胸の箱":{"c":["川江美奈子"],"a":["川江美奈子"]},"Psycho theory":{"c":["buzzG"],"a":["buzzG"]},"Savior of Cross":{"c":["ZUN"],"a":["平茸"]},"片道旅行記":{"c":["珀"],"a":["珀"]},"ひカゲもの":{"c":["珀"],"a":["珀"]},"FICTION":{"c":["珀"],"a":["珀"]},"眩耀":{"c":["珀"],"a":["珀"]},"眩耀（Full ver.）":{"c":["珀"],"a":["珀"]},"Repent":{"c":["珀"],"a":["珀"]},"空梁月落":{"c":["珀"],"a":["珀"]},"ユーフォリック":{"c":["珀"],"a":["珀"]},"邂逅の旋律":{"c":["珀"],"a":["珀"]},"Grieve":{"c":["珀"],"a":["珀"]},"糠星の備忘録":{"c":["珀"],"a":["珀"]},"Angraecum":{"c":["珀"],"a":["珀"]},"Angraecum (Guest Piano : 深根)":{"c":["珀"],"a":["珀"]},"disbelief":{"c":["珀"],"a":["珀"]},"残照とハナムケ":{"c":["珀"],"a":["珀"]},"徒花":{"c":["珀"],"a":["珀"]},"さよなら":{"c":["水野あつ"],"a":["水野あつ"]},"いんさいどぐるうゔ":{"c":["みきとP"],"a":["みきとP"]},"いんさいどぐるうヴ":{"c":["みきとP"],"a":["みきとP"]},"まってるよ":{"c":["MIMI"],"a":["MIMI"]},"あふれる":{"c":["雄之助"],"a":["雄之助"]},"あおいゆめ":{"c":["HiFi-P"],"a":["HiFi-P"]},"つきかげ":{"c":["Feryquitous"],"a":["Feryquitous"]},"しるし":{"c":["Wiz_nicc"],"a":["Wiz_nicc"]},"ETERNAL STORY":{"c":["Hayato"],"a":["Hayato"]},"-Short Ver.- ETERNAL STORY":{"c":["Hayato"],"a":["Hayato"]},"刹那ノ華":{"c":["Hayato"],"a":["Hayato"]},"君がいるその場所へ":{"c":["Hayato"],"a":["Hayato"]},"WtS":{"c":["Hayato"],"a":["Hayato"]},"熱を帯びた青":{"c":["Hayato"],"a":["Hayato"]},"starring bell":{"c":["rig"],"a":["rig"]},"RTA":{"c":["rig"],"a":["rig"]},"Mixed Reality":{"c":["rig"],"a":["rig"]},"渦":{"c":["rig"],"a":["rig"]},"EXIST":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"むり♡KAWA":{"c":["ユプシロン"],"a":["Sachi"]},"デコレーションナイト":{"c":["ユプシロン"],"a":["Sachi"]},"光":{"c":["tonari no Hanako"],"a":["tonari no Hanako"]},"ダイヤモンド":{"c":["なつめ千秋"],"a":["なつめ千秋"]},"コイネガウ":{"c":["ZAQ"],"a":["ZAQ"]},"はうとぅアニオタ！":{"c":["山田紅莉子"],"a":["山田紅莉子"]},"ののの音々ネ！":{"c":["原口沙輔"],"a":["原口沙輔"]},"アルテマ":{"c":["雪乃イト"],"a":["雪乃イト"]},"Ultima":{"c":["雪乃イト"],"a":["雪乃イト"]},"HYPE SEEKER":{"c":["八王子P"],"a":["八王子P"]},"Princess Viral":{"c":["yowanecity"],"a":["yowanecity"]},"ロクデナシテンシ":{"c":["tepe(OTOIRO)"],"a":["tepe(OTOIRO)"]},"約束":{"c":["水野あつ"],"a":["水野あつ"]},"Promise":{"c":["水野あつ"],"a":["水野あつ"]},"パラレルナイト":{"c":["凛々咲"],"a":["朱々音"]},"ハレルヤスカイ":{"c":["凛々咲"],"a":["Mameyudoufu"]},"だーいすきだよ":{"c":["凛々咲"],"a":["凛々咲"]},"Starring...":{"c":["凛々咲"],"a":["凛々咲"]},"Unknown under the city":{"c":["凛々咲"],"a":["凛々咲"]},"Marine Summer Session feat.葉山舞鈴":{"c":["凛々咲"],"a":["凛々咲"]},"Re:Re:リスタート":{"c":["凛々咲"],"a":["凛々咲"]},"アルストロメリア":{"c":["凛々咲"],"a":["凛々咲"]},"SnekQueen":{"c":["凛々咲"],"a":["凛々咲"]},"Olivia Rodrigo":{"c":["凛々咲"],"a":["凛々咲"]},"PLATFORM":{"c":["kazuki washiyama"],"a":["kazuki washiyama"]},"泡沫夢幻":{"c":["mampuku"],"a":["mampuku"]},"ベテルギウスの夜に":{"c":["北川勝利(ROUND TABLE)"],"a":["北川勝利(ROUND TABLE)"]},"電脳東京華道中":{"c":["mampuku"],"a":["mampuku"]},"MASAKARI":{"c":["Aiobahn"],"a":["Aiobahn"]},"GROUND-ZERO":{"c":["mampuku"],"a":["mampuku"]},"AIR":{"c":["FKBC","MaiR"],"a":["FKBC-Z"]},"運命の在処":{"c":["小高光太郎","矢野達也"],"a":["小高光太郎","矢野達也"]},"光の向こうへ":{"c":["海野水玉"],"a":["海野水玉"]},"うたたね":{"c":["明音","littlelittle"],"a":["littlelittle"]},"Bravery～辿り着きたい君へ～":{"c":["水上裕規"],"a":["水上裕規"]},"晴れ→恋心":{"c":["SoundstudioB"],"a":["SoundstudioB"]},"晴れハレはーれむ":{"c":["SoundstudioB"],"a":["SoundstudioB"]},"Labyrinth":{"c":["bassy"],"a":["bassy"]},"Step":{"c":["bassy"],"a":["bassy"]},"うたかた":{"c":["bassy"],"a":["bassy"]},"一瞬のクオリア":{"c":["myu"],"a":["myu"]},"So Precious":{"c":["白戸佑輔(Dream Monster)"],"a":["白戸佑輔(Dream Monster)"]},"The Sunshower":{"c":["佐々木裕"],"a":["佐々木裕"]},"Seize The Day":{"c":["永塚健登"],"a":["永塚健登"]},"Sun Is Coming Up":{"c":["永塚健登"],"a":["立山秋航"]},"Eternal Star":{"c":["Haggy Rock"],"a":["Haggy Rock"]},"Marine SNOW":{"c":["Haggy Rock"],"a":["Haggy Rock"]},"BELIEVE MYSELF":{"c":["夢見クジラ"],"a":["夢見クジラ"]},"彼は誰時の走り方":{"c":["Cronix"],"a":["Cronix"]},"フルスロットル！！！！！！":{"c":["空谷泉身"],"a":["空谷泉身"]},"心解":{"c":["Len"],"a":["YASUHIRO(康寛)"]},"mist":{"c":["夢見クジラ"],"a":["夢見クジラ","Yocke"]},"スターライト旅行記":{"c":["SAKURAmoti"],"a":["SAKURAmoti"]},"アヲイチズ":{"c":["アオトケイ"],"a":["アオトケイ"]},"クラルテ":{"c":["ANEHOKURO","尾崎和樹"],"a":["尾崎和樹"]},"朝焼けのとなりに":{"c":["青田圭"],"a":["パンケーキキャッツ"]},"夜が明けないのなら":{"c":["コヤマヒデカズ"],"a":["コヤマヒデカズ"]},"猫のみぞ知る":{"c":["ゆうゆ"],"a":["ゆうゆ"]},"【セレクトオブリージュ トウリED】わたしだけのPromise【公式・FULL】 ボーカル：Sennzai":{"c":["Seonoo Kim(Elements Garden)"],"a":["Seonoo Kim(Elements Garden)"]},"RedemptioN":{"c":["Hagali"],"a":["Hagali"]},"春宵胡蝶":{"c":["Street"],"a":["Street"]},"Utopia or Dystopia":{"c":["えびかれー伯爵"],"a":["えびかれー伯爵"]},"THE APPLE IS CAST!":{"c":["えびかれー伯爵"],"a":["えびかれー伯爵"]},"アイドゥーミー！":{"c":["サクマリョウ"],"a":["サクマリョウ"]},"いったん":{"c":["佐伯youthK"],"a":["鈴木雅也"]},"いつでも、いつまでも":{"c":["youth case"],"a":["佐々木博史"]},"今、過去、未来の三原色":{"c":["綺羅クリア"],"a":["Seiji Hotta"]},"Echos Beyond":{"c":["EFFY"],"a":["EFFY"]},"おいでよ！石川大観光":{"c":["白戸佑輔(Dream Monster)"],"a":["白戸佑輔(Dream Monster)"]},"おいでよ！石川大観光II":{"c":["はるおがわ"],"a":["酒井拓也"]},"JOKER.":{"c":["Michael Super Lassie"],"a":["鈴木雅也"]},"STEP UP !":{"c":["山岸洸一"],"a":["山岸洸一"]},"チャーミングな花束を！":{"c":["塚田耕平"],"a":["鈴木雅也"]},"Trick ＆ Cute":{"c":["志村真白"],"a":["EFFY"]},"とーひょー☆スター！":{"c":["サクマリョウ"],"a":["サクマリョウ"]},"はじまりの羽音":{"c":["渡辺未来"],"a":["渡辺未来"]},"ハナ咲けばユメ駆ける":{"c":["塚田耕平"],"a":["船山基紀"]},"光の中で花咲いて":{"c":["黒須克彦"],"a":["黒須克彦"]},"一生に夢が咲くように":{"c":["綺羅クリア"],"a":["Seiji Hotta"]},"雪舞う空と二秒の永遠":{"c":["綺羅クリア"],"a":["Seiji Hotta"]},"KEY of Like！":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"AURORA FLOWER":{"c":["山本玲史"],"a":["山本玲史"]},"可惜夜花火":{"c":["佐藤厚仁(Dream Monster)"],"a":["佐藤厚仁(Dream Monster)"]},"乙女詞華集":{"c":["大熊淳生(Arte Refact)"],"a":["大熊淳生(Arte Refact)"]},"金沢片恋慕":{"c":["渡辺未来"],"a":["Eunsol(1008)"]},"Kawaii no susume":{"c":["佐藤厚仁"],"a":["佐藤厚仁","Kijibato"]},"恋景色昭和ロマン":{"c":["きなみうみ"],"a":["きなみうみ"]},"Sayo-Shigure":{"c":["綺羅クリア"],"a":["鈴木雅也"]},"37.5℃のファンタジー":{"c":["園田健太郎"],"a":["園田健太郎"]},"Chu! Chocolate":{"c":["塚田耕平"],"a":["塚田耕平"]},"Dear my future":{"c":["Joshua Leung","不滅のアスカ"],"a":["Joshua Leung"]},"不思議と君とライブラリー":{"c":["塚田耕平"],"a":["塚田耕平"]},"フルーツパンチ":{"c":["本田正樹(Dream Monster)"],"a":["本田正樹(Dream Monster)"]},"Berry Merry Go Round":{"c":["加部輝","RT2"],"a":["加部輝"]},"My Lucky Clover":{"c":["江口寛至(SUPA LOVE)"],"a":["ArmySlick"]},"Mix shake!!":{"c":["川崎智哉"],"a":["川崎智哉"]},"アイシイ":{"c":["Michael Super Lassie"],"a":["佐藤厚仁"]},"アイマイメーデー":{"c":["山下僚海(SUPA LOVE)"],"a":["高橋修平(SUPA LOVE)"]},"青とシャボン":{"c":["佐藤厚仁"],"a":["佐藤厚仁"]},"飴色":{"c":["Aira"],"a":["Aira"]},"アンブレラ":{"c":["園田健太郎"],"a":["園田健太郎"]},"ガランドFlash":{"c":["タケノコ少年"],"a":["タケノコ少年"]},"COMPASS":{"c":["四市田雲豹(SUPA LOVE)"],"a":["鈴木雅也"]},"スケイプゴート":{"c":["Hiroki Sagawa(Relic Lyric, inc.)","武田城以"],"a":["武田城以"]},"太陽であれ！":{"c":["鈴木裕明(SUPA LOVE)"],"a":["鈴木裕明(SUPA LOVE)"]},"diamondz":{"c":["坂本龍"],"a":["前嶋康明"]},"Tragic Drops":{"c":["Kanata Okajima","Hayato Yamamoto"],"a":["Hayato Yamamoto"]},"フリジア":{"c":["Michael Super Lassie"],"a":["佐藤厚仁"]},"ブルウモーメント":{"c":["鶴崎輝一"],"a":["鶴崎輝一"]},"ベジ・ラブ・ルー":{"c":["すみだしんや"],"a":["前嶋康明"]},"リブウト":{"c":["岸明平(Rhythmic Toy World)"],"a":["岸明平(Rhythmic Toy World)"]},"レム":{"c":["田仲圭太"],"a":["高木龍一(Dream Monster)"]},"かくれんぼしよう":{"c":["成本智美(SUPA LOVE)"],"a":["Kotaro Egami(SUPA LOVE)"]},"センパイ":{"c":["きなみうみ"],"a":["きなみうみ"]},"全方位キュン":{"c":["Junky"],"a":["Junky"]},"トモダチになれる場所":{"c":["桑原佑介"],"a":["Capchii","桑原佑介"]},"ニャオシグニャル":{"c":["Kijibato(Dream Monster)"],"a":["Kijibato(Dream Monster)"]},"ハートにQ":{"c":["5u5h1"],"a":["5u5h1"]},"バイタルサイン":{"c":["渡辺未来"],"a":["鈴木雅也"]},"BANG YOU グラビティ":{"c":["山本玲史"],"a":["山本玲史"]},"PANAI☆":{"c":["塚田耕平"],"a":["塚田耕平"]},"Hip, hip, hooray!":{"c":["山本玲史"],"a":["山本玲史"]},"BLAST!!":{"c":["Fi'Ne","Yuqui-lah"],"a":["ハヤシベトモノリ(Plus-Tech Squeeze Box)"]},"Very! Very! COCO夏っ":{"c":["YUU for YOU","小久保祐希"],"a":["YUU for YOU"]},"マハラジャンボリーII":{"c":["Shusui"],"a":["大久保薫"]},"みらくりえーしょん":{"c":["桑原佑介"],"a":["MOSAIC.WAV"]},"ミルク":{"c":["桃宇アリサ","めんま"],"a":["めんま"]},"WAWO!":{"c":["みかんもどき(Dream Monster)"],"a":["ha-j"]},"ENDLESS DANCE":{"c":["首藤義勝"],"a":["藤永龍太郎(Elements Garden)"]},"がむしゃらに行こう！":{"c":["SHOW (Digz, Inc. Group)","Mitsu.J (Digz, Inc. Group)"],"a":["Mitsu.J (Digz, Inc. Group)"]},"ガラクタロード":{"c":["佐藤貴文"],"a":["鈴木俊介","大澤めい(Bandai Namco Studios Inc.)"]},"桜フォトグラフ":{"c":["春川仁志(sixth floor)"],"a":["春川仁志(sixth floor)"]},"SEARCH RIGHT":{"c":["涼木シンジ"],"a":["涼木シンジ"]},"修楽旅行":{"c":["Medansy(TRIFRONTIER)"],"a":["Medansy(TRIFRONTIER)"]},"「ねえ、言っちゃうよ。」":{"c":["アオワイファイ"],"a":["アオワイファイ"]},"Howling over the World":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"White Night! White Wish!":{"c":["佐藤純一(fhana)"],"a":["佐藤純一(fhana)"]},"ミラクルナナウ(ﾟ∀ﾟ)！":{"c":["YUC'e"],"a":["YUC'e"]},"雪解けに":{"c":["河原レオ(Rebrast)"],"a":["河原レオ(Rebrast)"]},"わかし・さわがし・スカパンク":{"c":["AYATOMO(MAYSON's PARTY)","木村孝明"],"a":["木村孝明"]},"過惰幻":{"c":["hisakuni(SUPA LOVE)"],"a":["hisakuni(SUPA LOVE)"]},"聿日箋秋":{"c":["トミタカズキ(SUPA LOVE)"],"a":["トミタカズキ(SUPA LOVE)"]},"往欄印":{"c":["長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"静降想":{"c":["hisakuni(SUPA LOVE)"],"a":["hisakuni(SUPA LOVE)"]},"騒混出":{"c":["李童一心(SUPA LOVE)"],"a":["李童一心(SUPA LOVE)"]},"掌心正銘":{"c":["高橋涼(SUPA LOVE)"],"a":["高橋涼(SUPA LOVE)"]},"証命讃歌":{"c":["田邊駿一"],"a":["高橋涼(SUPA LOVE)"]},"素寄曲":{"c":["呉井辰吉(SUPA LOVE)"],"a":["呉井辰吉(SUPA LOVE)"]},"残痕字":{"c":["長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"夜隠染":{"c":["鈴木裕明(SUPA LOVE)"],"a":["鈴木裕明(SUPA LOVE)"]},"羅永線":{"c":["hisakuni(SUPA LOVE)"],"a":["hisakuni(SUPA LOVE)"]},"ないものねだり":{"c":["谷口鮪"],"a":["KANA-BOON"]},"AWAKE":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"褪せたハナミドリ":{"c":["宮田'レフティ'リョウ"],"a":["宮田'レフティ'リョウ"]},"Andromeda":{"c":["ナノウ"],"a":["ナノウ"]},"Wicked feat. Mori Calliope":{"c":["Giga"],"a":["Giga"]},"駆けろ":{"c":["みきとP"],"a":["みきとP"]},"GUM & DROP":{"c":["Mikhail Beltran","Paris Alexa","Sabrina Claudio","Xansei"],"a":["Mikhail Beltran","Xansei"]},"Caramel Pain":{"c":["Deu"],"a":["Deu","Hajime Taguchi"]},"綺麗事":{"c":["星街すいせい"],"a":["TAKU INOUE"]},"comet":{"c":["*Luna"],"a":["*Luna"]},"ゴールデンタイムラバー":{"c":["大橋卓弥","常田真太郎"],"a":["スキマスイッチ"]},"Golden Time Rubber":{"c":["大橋卓弥","常田真太郎"],"a":["スキマスイッチ"]},"ザイオン":{"c":["下村陽子"],"a":["堀江晶太"]},"灼熱にて純情(wii-wii-woo)":{"c":["田淵智也"],"a":["堀江晶太"]},"自分勝手Dazzling":{"c":["酒井拓也(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"Je t'aime。":{"c":["櫻澤ヒカル(Hifumi,inc.)"],"a":["櫻澤ヒカル(Hifumi,inc.)"]},"Starry Jet":{"c":["齋藤大(Hifumi,inc.)","櫻澤ヒカル(Hifumi,inc.)"],"a":["齋藤大(Hifumi,inc.)","櫻澤ヒカル(Hifumi,inc.)"]},"7days":{"c":["郡陽介"],"a":["郡陽介"]},"先駆者":{"c":["山内総一郎"],"a":["山内総一郎"]},"ソワレ":{"c":["岩見陸"],"a":["ナナホシ管弦楽団"]},"Damn Good Day":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"天球、彗星は夜を跨いで":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"TEMPLATE":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"DEADPOOL feat. 花譜":{"c":["春野"],"a":["春野"]},"デビュタントボール":{"c":["にお"],"a":["にお"]},"TRUE GIRL SHOW":{"c":["ケンカイヨシ"],"a":["ケンカイヨシ"]},"Newton":{"c":["じん"],"a":["じん"]},"NEXT COLOR PLANET":{"c":["酒井拓也(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"バイバイレイニー":{"c":["堀江晶太"],"a":["堀江晶太"]},"ビビデバ":{"c":["ツミキ"],"a":["ツミキ"]},"ビーナスバグ":{"c":["川谷絵音"],"a":["川谷絵音"]},"Bluerose":{"c":["夏代孝明"],"a":["夏代孝明"]},"プラネタリウム":{"c":["DECO*27"],"a":["kous"]},"プリマドンナ":{"c":["SHOW(Digz, Inc. Group)","酒井拓也(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"放送室":{"c":["MI8k"],"a":["MI8k"]},"繭と心":{"c":["高橋諒"],"a":["高橋諒"]},"みちづれ":{"c":["Ayase"],"a":["Ayase"]},"ムーンライト":{"c":["なとり"],"a":["なとり"]},"もうどうなってもいいや":{"c":["辻村有記","板井直樹"],"a":["板井直樹"]},"Crazy:B「Honeycomb Summer」":{"c":["C.ON"],"a":["C.ON"]},"愛昧ショコラーテ":{"c":["Junky"],"a":["Junky"]},"Our step":{"c":["遠藤信吾"],"a":["遠藤信吾"]},"Everlasting Soul":{"c":["Tom-H@ck(TaWaRa)"],"a":["RINZO(TaWaRa)"]},"御伽の詩と永久なるミライ":{"c":["佐藤陽介(Hifumi,inc.)"],"a":["佐高陵平(Hifumi,inc.)"]},"おはようのうた":{"c":["T-POCKET"],"a":["T-POCKET"]},"君色ハナミズキ":{"c":["柴山太朗"],"a":["山崎佳祐"]},"キミだけのメロディ":{"c":["彦田元気(Hifumi,inc.)"],"a":["彦田元気(Hifumi,inc.)"]},"クソザコ回線卒業！のうた":{"c":["角巻吟遊詩人団"],"a":["角巻吟遊詩人団"]},"ししわたクッキング feat. 獅白ぼたん":{"c":["REDALiCE"],"a":["REDALiCE"]},"ジンギス団ラップ":{"c":["角巻吟遊詩人団"],"a":["角巻吟遊詩人団"]},"sweet night, sweet time…":{"c":["佐高陵平"],"a":["佐高陵平"]},"ゼロの足跡":{"c":["砂守岳央(未来古代楽団)"],"a":["未来古代楽団"]},"てぇてぇのうた":{"c":["角巻吟遊詩人団"],"a":["角巻吟遊詩人団"]},"曇天羊":{"c":["T-POCKET"],"a":["T-POCKET"]},"曇天羊 feat. Mori Calliope":{"c":["T-POCKET"],"a":["T-POCKET"]},"Now on step":{"c":["佐藤陽介(Hifumi,inc.)"],"a":["佐藤陽介(Hifumi,inc.)"]},"灰色の証明":{"c":["岸田(岸田教団&THE明星ロケッツ)"],"a":["岸田(岸田教団&THE明星ロケッツ)"]},"はらぺこのうた":{"c":["角巻吟遊詩人団"],"a":["角巻吟遊詩人団"]},"ビリ":{"c":["神田ジョン"],"a":["神田ジョン","篠崎あやと"]},"Fins":{"c":["岡野昭仁","tasuku"],"a":["tasuku"]},"Holidays!":{"c":["ナノウ"],"a":["ナノウ"]},"ホロライブ言えるかな？":{"c":["角巻吟遊詩人団"],"a":["角巻吟遊詩人団"]},"ぼくらのなぞなぞ":{"c":["sabio/高村風太"],"a":["sabio/高村風太"]},"My song":{"c":["堀江晶太"],"a":["堀江晶太"]},"mayday,mayday":{"c":["Junky"],"a":["Junky"]},"mayday,mayday feat. Mori Calliope":{"c":["Junky"],"a":["Junky"]},"夢見る羊":{"c":["堀江晶太"],"a":["堀江晶太"]},"リスポーン!!":{"c":["堀江晶太"],"a":["堀江晶太"]},"Revival":{"c":["Junky"],"a":["Junky"]},"RAINBOW":{"c":["DECO*27"],"a":["Rockwell"]},"WataAme Pop":{"c":["大槻政司"],"a":["小椋健司"]},"WataMeister":{"c":["ケンモチヒデフミ"],"a":["ケンモチヒデフミ"]},"わためラップ":{"c":["角巻吟遊詩人団"],"a":["角巻吟遊詩人団"]},"What an amazing swing":{"c":["FAKE TYPE."],"a":["DYES IWASAKI (FAKE TYPE.)"]},"鯨":{"c":["鈴木健太朗"],"a":["鈴木健太朗"]},"ANEMONE":{"c":["ゆよゆっぺ"],"a":["ゆよゆっぺ"]},"Antares":{"c":["TakoyakiKZY"],"a":["TakoyakiKZY"]},"Cry Out":{"c":["t+pazolite"],"a":["t+pazolite"]},"魁":{"c":["Q-MHz"],"a":["Q-MHz"]},"サンビタリア":{"c":["keeno"],"a":["keeno"]},"SM4SH IT UP":{"c":["磯野涼"],"a":["磯野涼"]},"タイダナワンダー":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"二人三脚 feat. 猫汰つな":{"c":["三好啓太","徳田光希"],"a":["三好啓太","徳田光希"]},"Purple Disease":{"c":["かめりあ"],"a":["かめりあ"]},"Whose thorns?":{"c":["中村未来(Co shu Nie)"],"a":["中村未来(Co shu Nie)"]},"Present Day":{"c":["古閑翔平"],"a":["ユアネス"]},"ライメイ":{"c":["buzzG"],"a":["buzzG"]},"Rewrite the Answer":{"c":["山中拓也","辻村有記"],"a":["山中拓也","辻村有記"]},"#ウチらしか勝たん":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"イニミニまいご":{"c":["Akki"],"a":["Akki"]},"カメリア":{"c":["川江美奈子"],"a":["村田昭"]},"君と星の夜に":{"c":["大神ミオ","脇眞富"],"a":["脇眞富"]},"さしみお feat.スバおか":{"c":["立秋"],"a":["立秋"]},"サヨナラは、まだ":{"c":["河合泰志(Arte Refact)","山本恭平(Arte Refact)"],"a":["河合泰志(Arte Refact)","山本恭平(Arte Refact)","脇眞富(Arte Refact)"]},"Sirius":{"c":["Nika Lenz"],"a":["水野谷怜"]},"溶けない結晶":{"c":["MIMI"],"a":["MIMI"]},"ナイトループ":{"c":["DECO*27"],"a":["tepe"]},"深く紺になる":{"c":["如月結愛"],"a":["如月結愛"]},"夜光通信":{"c":["堀江晶太"],"a":["堀江晶太"]},"夜明けのメロウ":{"c":["如月結愛"],"a":["如月結愛"]},"夜と雨 feat.百鬼あやめ":{"c":["脇眞富"],"a":["脇眞富"]},"わんわん！わおーん":{"c":["立秋"],"a":["立秋"]},"Animal":{"c":["DECO*27"],"a":["Rockwell"]},"青い傷":{"c":["TOOBOE"],"a":["TOOBOE"]},"あっかんべ":{"c":["DECO*27"],"a":["Rockwell"]},"アデュー、サロー":{"c":["FLG4"],"a":["FLG4"]},"エンドロール":{"c":["DECO*27"],"a":["Rockwell"]},"ORANGE PARADE feat. 戌神ころね":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"ガザニア":{"c":["koyori"],"a":["koyori"]},"キスだけでいいからね":{"c":["神山羊"],"a":["神山羊"]},"Grrr Grrr Tummy":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"謙虚っち":{"c":["DECO*27"],"a":["tepe"]},"琥珀糖":{"c":["神山羊"],"a":["神山羊"]},"大嫌いがもっともっと積もるまで":{"c":["FLG4"],"a":["FLG4"]},"つらい思いをさせてごめんね":{"c":["式浦躁吾"],"a":["式浦躁吾"]},"デコグラデーション":{"c":["稲葉曇"],"a":["稲葉曇"]},"毒の王子さま":{"c":["奏音69"],"a":["奏音69"]},"毒杯スワロウ":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"ノンデリシャス":{"c":["てにをは"],"a":["てにをは"]},"パボ":{"c":["すりぃ"],"a":["すりぃ"]},"また、おかえり。":{"c":["Hylen"],"a":["Hylen"]},"もぐもぐYUMMY!":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"Lazyroop":{"c":["夏代孝明"],"a":["快晴P"]},"Rainy":{"c":["R Sound Design"],"a":["R Sound Design"]},"ねむるまち":{"c":["くじら"],"a":["くじら"]},"インキャララバイ":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"おらくる":{"c":["じん"],"a":["じん"]},"片羽":{"c":["Toby Fox"],"a":["かめりあ"]},"救済のEnde":{"c":["sasakure.UK"],"a":["sasakure.UK"]},"きゅーぴっど。":{"c":["TeddyLoid"],"a":["TeddyLoid"]},"十万億土":{"c":["天音かなた"],"a":["Numa"]},"純粋心":{"c":["つんく"],"a":["大久保薫"]},"睡キャン界隈":{"c":["すみだしんや"],"a":["REO"]},"START UP":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"世界で一番のアイドル":{"c":["西片瑞樹","めんま"],"a":["西片瑞樹"]},"セルフサービス":{"c":["サツキ"],"a":["サツキ"]},"DA・LI・LA":{"c":["佐野仁美"],"a":["つちやみさと"]},"誰も見てない夢を見ろ":{"c":["ヒグチアイ"],"a":["THE CHARM PARK"]},"中空の庭":{"c":["bermei.inazawa"],"a":["bermei.inazawa"]},"天使のagape":{"c":["渡辺翔"],"a":["中山真斗"]},"特者生存ワンダラダー！！":{"c":["田淵智也"],"a":["佐高陵平"]},"Knock it out!":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"ハッピーピープル":{"c":["てにをは"],"a":["てにをは"]},"ヒル":{"c":["DECO*27"],"a":["tepe"]},"Leech":{"c":["DECO*27"],"a":["tepe"]},"返信願望":{"c":["みきとP"],"a":["みきとP","YK from 有感覚"]},"別世界":{"c":["天音かなた"],"a":["Numa"]},"Last-resort":{"c":["草野華余子"],"a":["BLACK ALBATROSS"]},"lumiere":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"わたしのせいだ":{"c":["堀江晶太"],"a":["堀江晶太"]},"Pray":{"c":["松坂康司"],"a":["松坂康司"]},"Like a Phoenix":{"c":["草野華余子"],"a":["堀江晶太"]},"Over Time":{"c":["西片瑞樹"],"a":["西片瑞樹"]},"ONIGOKKO":{"c":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"],"a":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"]},"pa pa pa":{"c":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"],"a":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"]},"Untouchable":{"c":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"],"a":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"]},"スペースキャットビックバン":{"c":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"],"a":["前田佑","久保田真悟(Jazzin'park)","栗原暁(Jazzin'park)"]},"ケッケッケ":{"c":["FAKE TYPE."],"a":["DYES IWASAKI(FAKE TYPE.)"]},"アイラブインターネット":{"c":["超学生"],"a":["超学生"]},"ネクロバイト":{"c":["超学生"],"a":["超学生"]},"暁に鳴る":{"c":["辻村有記","MEG(MEGMETAL)"],"a":["辻村有記","MEG(MEGMETAL)"]},"Abyss-Over":{"c":["烏屋茶房"],"a":["Powerless"]},"阿弥陀籤":{"c":["辻村有記"],"a":["辻村有記"]},"Innocent Tyrant":{"c":["FAKE TYPE."]},"インキュベーター":{"c":["すりぃ"],"a":["すりぃ"]},"サイコ":{"c":["すりぃ"],"a":["すりぃ"]},"ルーム No.4":{"c":["すりぃ"],"a":["すりぃ"]},"インゲル":{"c":["篠崎あやと","橘亮祐"],"a":["篠崎あやと","橘亮祐"]},"永久アンフィテアトルへようこそ":{"c":["原口沙輔"],"a":["原口沙輔"]},"オーバールック":{"c":["てにをは"],"a":["てにをは"]},"ガトリングアジテイタア":{"c":["cosMo＠暴走P"],"a":["cosMo＠暴走P"]},"キュートなカノジョ":{"c":["syudou"]},"バットオンリーユー":{"c":["syudou"]},"キラーチューナー":{"c":["フロクロ"],"a":["フロクロ"]},"Give it to me":{"c":["ROBBIN","ZWOO","Mohanp","RYAN JHUN"],"a":["ROBBIN","ZWOO","Mohanp","RYAN JHUN"]},"CLAPTRAP":{"c":["zensen"],"a":["zensen"]},"けものになりたい！":{"c":["ピノキオピー"]},"しゅきしゅきメイドマスカレイド":{"c":["チバニャン"],"a":["チバニャン"]},"CGS":{"c":["超学生"],"a":["ESME MORI"]},"超獣戯画":{"c":["煮ル果実"]},"Did you see the sunrise?":{"c":["松隈ケンタ"],"a":["SCRAMBLES"]},"Hazure":{"c":["辻村有記","山中拓也(THE ORAL CIGARETTES)"],"a":["辻村有記"]},"ヒス":{"c":["柊キライ"]},"ヒト":{"c":["柊キライ"]},"ファンデモーニカ":{"c":["弌誠"],"a":["9maBear","Ahhri"]},"ファントム":{"c":["DECO*27"],"a":["Hayato Yamamoto"]},"Fake Parade":{"c":["Yuki Tsujimura"],"a":["Yuki Tsujimura"]},"Let's go":{"c":["Peter Nord"],"a":["Peter Nord"]},"レベチ":{"c":["宮守文学"],"a":["宮守文学"]},"嵐の中で輝いて":{"c":["夢野真音"],"a":["見良津健雄"]},"WILL":{"c":["鵜島仁文"],"a":["岩本正樹"]},"永遠の扉":{"c":["鵜島仁文"],"a":["見良津健雄"]},"10 YEARS AFTER":{"c":["三浦一年"],"a":["見良津健雄"]},"Butterfly Kiss":{"c":["鵜島仁文"],"a":["aqua.t"]},"恋せよ乙女！":{"c":["Famishin(ゆずソフト)"]},"ハルトキ ～Spring Moment～":{"c":["ぱれっと"],"a":["ぱれっと"]},"ソラノキオク":{"c":["ぱれっと"],"a":["ぱれっと"]},"Give me five!":{"c":["米倉千尋"],"a":["宮崎京一"]},"シリウスの瞬く空に":{"c":["米倉千尋"],"a":["宮崎京一"]},"零-ZERO-":{"c":["米倉千尋"],"a":["宮崎京一"]},"Seize the Days":{"c":["小松清人"],"a":["田辺恵二"]},"Just Fly Away":{"c":["米倉千尋"],"a":["勝又隆一"]},"I believe":{"c":["米倉千尋"],"a":["勝又隆一"]},"桜色の街":{"c":["米倉千尋"],"a":["勝又隆一"]},"遠くへ":{"c":["米倉千尋"],"a":["勝又隆一"]},"青空とキミへ":{"c":["米倉千尋"],"a":["高山和芽"]},"Kaleido Earth":{"c":["米倉千尋"],"a":["高山和芽"]},"tsubomi":{"c":["米倉千尋"],"a":["高山和芽"]},"Dear my friend":{"c":["米倉千尋"],"a":["高山和芽"]},"暁の車":{"c":["梶浦由記"]},"いつの日か":{"c":["鵜島仁文"],"a":["見良津健雄"]},"Carry On":{"c":["鵜島仁文"],"a":["見良津健雄"]},"−祈り−":{"c":["米倉千尋"],"a":["門倉聡"]},"陽のあたる場所":{"c":["米倉千尋"],"a":["門倉聡"]},"WINTER WISH":{"c":["米倉千尋"],"a":["重実徹"]},"かえりみち":{"c":["米倉千尋"],"a":["重実徹"]},"笑顔に花束を":{"c":["米倉千尋"],"a":["見良津健雄"]},"Truth":{"c":["米倉千尋"],"a":["見良津健雄"]},"さくら咲く日に":{"c":["米倉千尋"],"a":["aqua.t"]},"stars":{"c":["米倉千尋"],"a":["aqua.t"]},"月に願いを":{"c":["米倉千尋"],"a":["aqua.t"]},"夏の終わりの花火":{"c":["米倉千尋"],"a":["aqua.t"]},"陽だまりをつれて":{"c":["米倉千尋"],"a":["aqua.t"]},"ふたり":{"c":["米倉千尋"],"a":["aqua.t"]},"そして愛になる":{"c":["米倉千尋"],"a":["勝又隆一"]},"Squall":{"c":["米倉千尋"],"a":["勝又隆一"]},"Pale Blaze":{"c":["俊龍"],"a":["Sizuk"]},"DEAR MY WAKER":{"c":["宮崎京一"],"a":["宮崎京一"]},"Smiling-Swinging!!":{"c":["Famishin(ゆずソフト)"],"a":["Angel Note"]},"InFINITE Line":{"c":["折戸伸治"],"a":["高瀬一矢"]},"暁光ノ祭宴":{"c":["Junxix."],"a":["Junxix.","藤田卓也"]},"在りし世界の君×機械ヶ蝶の譚":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介"]},"空蝉挿話":{"c":["橋本鏡也"],"a":["橋本鏡也"]},"空虚の渦の中心で":{"c":["橋本鏡也"],"a":["橋本鏡也"]},"鬼ノ木偶刀、かく語りき":{"c":["佐藤純一"],"a":["ANCHOR","佐藤純一"]},"hymn":{"c":["onoken"],"a":["onoken"]},"金色の夜想曲～Golden Nocturne～":{"c":["ラック眼力"]},"クロックワーク・アイロニィ":{"c":["たくまる"]},"刻誓の縁":{"c":["たくまる"]},"さくら、さよなら。":{"c":["たくまる"]},"泣殻":{"c":["たくまる"]},"ふたりの場所":{"c":["たくまる"]},"Goddess will…":{"c":["RUCCA"],"a":["藤間仁"]},"衝撃リアクト":{"c":["150P"],"a":["150P"]},"リピートラジディー":{"c":["150P"],"a":["150P"]},"真命ノ仁義":{"c":["羽鳥風画"],"a":["羽鳥風画"]},"ツワモノガタリ":{"c":["羽鳥風画"],"a":["羽鳥風画"]},"優しい拒絶":{"c":["羽鳥風画"],"a":["羽鳥風画"]},"熄滅":{"c":["bermei.inazawa"],"a":["bermei.inazawa"]},"誰そ彼":{"c":["bermei.inazawa"],"a":["bermei.inazawa"]},"そばにいる":{"c":["三浦誠司"],"a":["草野よしひろ"]},"闘艶結義～トウエンノチカイ～":{"c":["三浦誠司"]},"闘艶結義~トウエンノチカイ~":{"c":["三浦誠司"]},"とどきますように":{"c":["ロドリゲスのぶ"],"a":["高島孝"]},"深霧の楽園":{"c":["鶴由雄"]},"when they cry":{"c":["大嶋啓之"]},"ワタシのタメのセカイのアリカタ":{"c":["大嶋啓之"]},"めざめの鳥":{"c":["ロドリゲスのぶ"],"a":["ロドリゲスのぶ"]},"もののけ元旦録":{"c":["Meis Clauson"]},"約束の世界":{"c":["Satoru.A"],"a":["Satoru.A"]},"世迷言":{"c":["HT-SOUND"],"a":["HT-SOUND"]},"THE BIND SEEKER":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"get the regret over":{"c":["片霧烈火"],"a":["羽鳥風画"]},"魂響":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"パラダイムシフト":{"c":["wight"],"a":["wight"]},"砂銀":{"c":["wight"],"a":["wight"]},"嘘つきと傷あと":{"c":["羽鳥風画"],"a":["羽鳥風画"]},"HE∀ting Soul":{"c":["羽鳥風画"],"a":["羽鳥風画"]},"恋獄":{"c":["MANYO"],"a":["MANYO"]},"だらだらり":{"c":["百夜カエル"],"a":["百夜カエル"]},"アイがあるようでないようである":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"オトナのピーターパン":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"おばけのウケねらい (にゅ～ ver.)":{"c":["ピノキオピー"],"a":["タイヘイ"]},"愛の歌なんて":{"c":["ナナヲアカリ"],"a":["Neru"]},"I LOVE MEでいられるように feat. 湊あくあ":{"c":["キノシタ"],"a":["キノシタ"]},"明日の私に幸あれ":{"c":["玉屋2060%(Wienners)"],"a":["玉屋2060%(Wienners)"]},"完全放棄宣言":{"c":["玉屋2060%(Wienners)"],"a":["玉屋2060%(Wienners)"]},"全部ホントで全部ウソ":{"c":["玉屋2060%(Wienners)"],"a":["玉屋2060%(Wienners)"]},"POI POI POI":{"c":["玉屋2060%(Wienners)"],"a":["玉屋2060%(Wienners)"]},"あなたじゃなくても feat. 澤田空海理":{"c":["澤田空海理"],"a":["澤田空海理"]},"イエスマンイズデッド":{"c":["ナナヲアカリ"],"a":["Sori Sawada"]},"一生奇跡に縋ってろ":{"c":["Neru"],"a":["Neru"]},"お釈迦になる":{"c":["Neru"],"a":["Neru"]},"正解はいらない":{"c":["Neru"],"a":["Neru"]},"ハッピーになりたい":{"c":["Neru"],"a":["Neru"]},"インスタントヘヴン feat.Eve":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"シアワセシンドローム":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ダダダダ天使":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ダメレオンハート":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ディスコミュ星人":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ベイビーあいへいちゅー":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ギミギミ聖域":{"c":["ナユタン星人"],"a":["堀江晶太"]},"Higher's High":{"c":["ナユタン星人"],"a":["ナユタセイジ"]},"宇宙のチリーズ":{"c":["山内総一郎(フジファブリック)"],"a":["山内総一郎"]},"ウツムキブレザー":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"学校だるい":{"c":["粗品"]},"奇縁ロマンス":{"c":["和ぬか"],"a":["100回嘔吐"]},"kidding":{"c":["ナナヲアカリ"],"a":["加藤祐介"]},"キュートフィクション":{"c":["ハイノミ"],"a":["ハイノミ"]},"逆走少女":{"c":["みきとP"],"a":["emon"]},"クライソング":{"c":["DECO*27"],"a":["Rockwell"]},"魔法":{"c":["Eve"],"a":["Numa"]},"七転七起":{"c":["ナナヲアカリ","DECO*27"],"a":["Rockwell"]},"事象と空想":{"c":["バルーン"],"a":["バルーン"]},"ハノ":{"c":["バルーン"],"a":["バルーン"]},"人類殲滅のテーマ":{"c":["朝日(ネクライトーキー)"],"a":["朝日"]},"Step In The Dark":{"c":["ナナヲアカリ","Hajime Taguchi"],"a":["Hajime Taguchi"]},"ツギハギ":{"c":["ナナヲアカリ","Hajime Taguchi"],"a":["Hajime Taguchi"]},"たぶん、嘘だね。":{"c":["LASTorder"],"a":["LASTorder"]},"ドラマ":{"c":["LASTorder"],"a":["LASTorder"]},"チューリングラブ feat.Sou":{"c":["ナユタセイジ"],"a":["ナユタセイジ"]},"ブループリント":{"c":["ナユタセイジ"],"a":["Hajime Taguchi"]},"月だけが聞いている":{"c":["蒼山幸子"],"a":["江口亮"]},"どうやったって":{"c":["Joseph Gen"],"a":["Joseph Gen"]},"ドッペルアリー":{"c":["Eve","ナナヲアカリ"]},"$ラリ無双":{"c":["大森靖子"],"a":["大久保薫"]},"ナンセンス・ハビット":{"c":["ゆよゆっぺ"],"a":["ゆよゆっぺ"]},"なんとかなるくない？":{"c":["オカモトショウ","オカモトコウキ"],"a":["えんじぇるズ","加藤祐介"]},"二度目の花火":{"c":["荻野目諒"],"a":["荻野目諒"]},"眠らない街、眠りたい僕":{"c":["こんにちは谷田さん"]},"note:":{"c":["ナナヲアカリ"],"a":["大西省吾"]},"Heart.empty":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"ひとりごと":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"パスポート":{"c":["大沼パセリ"],"a":["大沼パセリ"]},"ヒステリーショッパー":{"c":["煮ル果実"],"a":["煮ル果実"]},"ぴ":{"c":["ヤマモトショウ"],"a":["ヤマモトショウ"]},"ピヨ":{"c":["ナナヲアカリ"],"a":["えんじぇるズ"]},"FASHION feat. GaL":{"c":["GaL"],"a":["GaL"]},"Flying":{"c":["じん"],"a":["じん"]},"プラネタリー・メッセージ":{"c":["Yunomi"]},"PLAY&PRAY":{"c":["tepe(OTOIRO)"],"a":["tepe(OTOIRO)"]},"ホントのことを言うのなら":{"c":["ナナヲアカリ"],"a":["笹川真生"]},"ボーイゼンガールズ":{"c":["Hayato Yamamoto","Kanata Okajima"],"a":["Hayato Yamamoto"]},"∞劣等星":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"忘れないでベイベー":{"c":["笹川真生"],"a":["笹川真生"]},"愛のせいで眠れない":{"c":["板垣祐介"],"a":["板垣祐介"]},"Dear my tears":{"c":["板垣祐介"],"a":["板垣祐介"]},"I lost the place":{"c":["黒須克彦"],"a":["黒須克彦"]},"Unusual Days":{"c":["黒須克彦"],"a":["黒須克彦"]},"いまの君が遠くても":{"c":["黒須克彦"],"a":["黒須克彦"]},"最後の旅":{"c":["黒須克彦"],"a":["黒須克彦"]},"HAPPY CHERRY FESTA!":{"c":["黒須克彦"],"a":["黒須克彦"]},"feel it":{"c":["黒須克彦"],"a":["黒須克彦"]},"BLUE BIRD EMBLEM":{"c":["黒須克彦"],"a":["黒須克彦"]},"忘却バタフライ":{"c":["黒須克彦"],"a":["黒須克彦"]},"Made in WONDER":{"c":["黒須克彦"],"a":["黒須克彦"]},"もう愛しかいらない":{"c":["黒須克彦"],"a":["黒須克彦"]},"disarm dreamer":{"c":["黒須克彦"],"a":["宅見将典"]},"不自由なEmotion":{"c":["黒須克彦"],"a":["鈴木マサキ"]},"BLOOD QUEEN":{"c":["黒須克彦"],"a":["鈴木マサキ"]},"あかるい恋のうた":{"c":["渡辺翔"],"a":["増田武史"]},"明日をとめないで":{"c":["田中秀典"],"a":["宅見将典"]},"another life":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"君が空だった":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"Confusion Lovers":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"sad rain":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"Scarlet Bomb!":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"Hide and seek":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"ふたりが忘れない":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"夢にみた楽園":{"c":["飯塚昌明"],"a":["飯塚昌明"]},"さよなら君の声":{"c":["田辺トシノ"],"a":["田辺トシノ"]},"UNLIMITED FIRE":{"c":["mia"],"a":["鈴木雅也"]},"アンリミテッド":{"c":["mia"],"a":["鈴木雅也"]},"If… ～I wish～":{"c":["宇佐美宏"],"a":["宇佐美宏"]},"beautiful flower":{"c":["宇佐美宏"],"a":["宇佐美宏"]},"美しい地球を知る者よ":{"c":["増田武史"],"a":["増田武史"]},"運命の誓い":{"c":["Scuderia K."]},"all allow":{"c":["藤末樹"],"a":["藤末樹"]},"Life and proud":{"c":["藤末樹"],"a":["藤末樹"]},"Wild succession":{"c":["藤末樹"],"a":["藤末樹"]},"Cross Illusion":{"c":["アッチョリケ"],"a":["アッチョリケ"]},"Jewelry tears":{"c":["アッチョリケ"],"a":["アッチョリケ"]},"[MAD] PCゲーム 俺たちに翼はない 主題歌「Jewelry tears」":{"c":["アッチョリケ"],"a":["アッチョリケ"]},"DESIRE":{"c":["アッチョリケ"],"a":["アッチョリケ"]},"Defy Gravity (Not Found 2010)":{"c":["アッチョリケ"],"a":["アッチョリケ"]},"Spread Wings.":{"c":["アッチョリケ"],"a":["田辺トシノ"]},"Find true love":{"c":["アッチョリケ"],"a":["田辺トシノ"]},"PARANoiA":{"c":["アッチョリケ"],"a":["東タカゴー"]},"Goal to NEW WORLD":{"c":["齋藤真也"],"a":["齋藤真也"]},"少女迷路でつかまえて":{"c":["齋藤真也"],"a":["齋藤真也"]},"here I am":{"c":["齋藤真也"],"a":["齋藤真也"]},"最後のエデン":{"c":["菊田大介"],"a":["菊田大介"]},"シアワセは月より高く":{"c":["オオヤギヒロオ"],"a":["オオヤギヒロオ"]},"守護心PARADOX":{"c":["山元祐介"],"a":["山元祐介"]},"僕らの自由":{"c":["山田高弘"],"a":["山田高弘"]},"希望の旋律":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"めちゃ真剣SSS!":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"Chosen Road":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"CONNECT":{"c":["ZAI-ON"],"a":["ZAI-ON"]},"irony -season 02-":{"c":["kz"],"a":["kz"]},"CLICK":{"c":["kz"],"a":["kz"]},"STEP":{"c":["kz"],"a":["kz"]},"reunion":{"c":["kz"],"a":["kz"]},"ナイショの話":{"c":["ryo(supercell)"],"a":["ryo(supercell)","TAKUYA"]},"コネクト":{"c":["渡辺翔"],"a":["湯浅篤"]},"ルミナス":{"c":["渡辺翔"],"a":["湯浅篤"]},"カラフル":{"c":["渡辺翔"],"a":["湯浅篤"]},"カラフル -season 03-":{"c":["渡辺翔"],"a":["湯浅篤"]},"clever":{"c":["渡辺翔"],"a":["toku(GARNiDELiA)"]},"ケアレス":{"c":["渡辺翔"],"a":["湯浅篤"]},"ヒトリゴト":{"c":["ケリー"],"a":["重永亮介"]},"PRIMALove":{"c":["kz"],"a":["kz"]},"Masquerade":{"c":["末廣健一郎"],"a":["末廣健一郎"]},"アイヲウタエ":{"c":["じん"],"a":["じん"]},"アリシア":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"CheerS":{"c":["ハヤシケイ(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"アネモネ":{"c":["KOH"],"a":["湯浅篤"]},"Wake Up":{"c":["丸山真由子"],"a":["丸山真由子"]},"秋のグラディエント":{"c":["ha-j","PA-NON"],"a":["長沢知亜紀","永野小織"]},"Umitsuki":{"c":["栗林悟","栗原暁(Jazzin'park)"],"a":["栗林悟"]},"コイセカイ":{"c":["浅見武男"],"a":["浅見武男"]},"SHIORI":{"c":["小川智之"],"a":["湯浅篤"]},"ひらひら　ひらら":{"c":["奥村愛子"],"a":["湯浅篤"]},"ひらひら ひらら":{"c":["奥村愛子"],"a":["湯浅篤"]},"Trigger":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"リンクス":{"c":["丸山真由子"],"a":["丸山真由子"]},"Blue Canvas":{"c":["丸山真由子"],"a":["丸山真由子"]},"アイムリドミ":{"c":["ケンカイヨシ"],"a":["ケンカイヨシ"]},"青春の向こうへ":{"c":["加藤冴人"],"a":["加藤冴人"]},"カルカリナ":{"c":["加藤冴人"],"a":["加藤冴人"]},"クランクアップ":{"c":["加藤冴人"],"a":["加藤冴人"]},"終着駅から":{"c":["加藤冴人"],"a":["加藤冴人"]},"友達代表宣言":{"c":["加藤冴人"],"a":["加藤冴人"]},"独善食":{"c":["加藤冴人"],"a":["加藤冴人"]},"Dokuzenshoku":{"c":["加藤冴人"],"a":["加藤冴人"]},"なんでですか？":{"c":["加藤冴人"],"a":["加藤冴人"]},"猫の手を貸すよ":{"c":["加藤冴人"],"a":["加藤冴人"]},"夜明けの詩":{"c":["加藤冴人"],"a":["加藤冴人"]},"リコネクト":{"c":["加藤冴人"],"a":["加藤冴人"]},"Reconnect":{"c":["加藤冴人"],"a":["加藤冴人"]},"Reject it now!":{"c":["加藤冴人"],"a":["加藤冴人"]},"アネモネ -Novelclip I LOVE YOU-":{"c":["奈良悠樹"],"a":["奈良悠樹"]},"WE ARE YOU":{"c":["eba"],"a":["eba"]},"all-last":{"c":["eba"],"a":["eba"]},"確証論":{"c":["eba"],"a":["eba"]},"Certain evidence":{"c":["eba"],"a":["eba"]},"君の好きなところ":{"c":["eba"],"a":["eba"]},"コンパスは透明":{"c":["eba"],"a":["eba"]},"しあわせクッキー":{"c":["eba"],"a":["eba"]},"Blowin' Wind is blowin'":{"c":["eba"],"a":["eba"]},"機械仕掛けのワルツ":{"c":["緑仙","岸田勇気"],"a":["岸田勇気","奈良悠樹"]},"ジョークス":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"Jokes":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"バケネコダンス":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"sleep sheep syndrome (feat. ヒトリエ)":{"c":["シノダ(ヒトリエ)"],"a":["ヒトリエ"]},"燃えろ！雀荘牌舞台":{"c":["T4K"],"a":["T4K"]},"Tenchu":{"c":["すりぃ"],"a":["すりぃ"]},"天誅":{"c":["すりぃ"],"a":["すりぃ"]},"Only for you":{"c":["加藤冴人"],"a":["加藤冴人"]},"タイト":{"c":["川谷絵音"],"a":["休日課長","川谷絵音"]},"カルミアのキス":{"c":["加藤冴人"],"a":["加藤冴人"]},"エヴァーグリーン":{"c":["加藤冴人"],"a":["加藤冴人"]},"Welcome☆Greeny night":{"c":["加藤冴人"],"a":["加藤冴人"]},"君になりたいから":{"c":["水野良樹"],"a":["家入レオ"]},"キミノスキピ":{"c":["クボナオキ(M-AG)"],"a":["サトウコウスケ(M-AG)"]},"KINGWORLD":{"c":["sasakure.UK"],"a":["sasakure.UK"]},"グローエンブレイス":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"KONKON Beats":{"c":["TOKOTOKO"],"a":["TOKOTOKO"]},"ストーリーテラー":{"c":["ハム"],"a":["ハム"]},"Say!ファンファーレ!":{"c":["ハム"],"a":["ハム"]},"Hi Fine FOX!!":{"c":["ハム"],"a":["ハム"]},"SUPERNOVA":{"c":["小池竜暉"],"a":["小池竜暉","菊池博人"]},"閃光のように":{"c":["岸田(岸田教団&THE明星ロケッツ)"],"a":["岸田(岸田教団&THE明星ロケッツ)"]},"HAPPY BANG!":{"c":["金崎真士(SUPA LOVE)"],"a":["金崎真士(SUPA LOVE)"]},"FOXXXROOM":{"c":["EO"],"a":["EO"]},"ブリにゃんモードはピピピのピ":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"星空コンフェッティ":{"c":["Fty"],"a":["Fty"]},"僕らの星座":{"c":["Revo"],"a":["Revo"]},"冥界Halloween Night！":{"c":["中村歩","野口大志"],"a":["中村歩","野口大志"]},"LETTER☆彡":{"c":["宮腰侑子"],"a":["坂本夏樹"]},"ワンダーフューチャー！":{"c":["西片瑞樹"],"a":["西片瑞樹"]},"ピパポ☆ピピプ":{"c":["キノシタ"],"a":["キノシタ"]},"Happiness World":{"c":["広川恵一(MONACA)"],"a":["広川恵一(MONACA)"]},"進め↑BAKATARATION":{"c":["本多友紀(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"恋文前線":{"c":["末益涼太(Elements Garden)"],"a":["末益涼太(Elements Garden)"]},"わくわくエブリデイ":{"c":["佐藤純一(fhána)"],"a":["佐藤純一(fhána)"]},"ウィーゴー！～白上フブキ、宝鐘マリン、角巻わため with 大槻マキ Ver.～":{"c":["田中公平"],"a":["根岸貴幸"]},"Vivid Stampede!!!!":{"c":["乌屋茶房"],"a":["篠崎あやと","橘亮祐"]},"ETERNAL":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"コンパスローズ":{"c":["矢野達也"],"a":["矢野達也"]},"深海のフレイム":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"永久に枯れぬ花":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"FARAWAY":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"BREATHE":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"また、ここから":{"c":["矢野達也"],"a":["矢野達也"]},"まぼろしの行方":{"c":["Aira(Dream Monster)"],"a":["Aira(Dream Monster)"]},"みらいのかたち":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"モシモノセカイ":{"c":["Junky"],"a":["Junky"]},"ラケナリアの夢":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"The Dream of Lachenalia":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"ARCADIA":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"Whereabouts of the phantom":{"c":["Aira(Dream Monster)"],"a":["Aira(Dream Monster)"]},"Alias":{"c":["수조(水槽)"],"a":["水槽"]},"果てなきソラへ":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"キミ消失セカイ":{"c":["廉"],"a":["廉"]},"描き続けた君へ":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"愛厭奇縁":{"c":["すりぃ"],"a":["すりぃ"]},"Last Night, Good Night":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"誰もいない絵で":{"c":["rionos"],"a":["rionos"]},"ぼくらの逃避行":{"c":["夏代孝明"],"a":["夏代孝明"]},"レプリカ":{"c":["sasakure.UK"],"a":["sasakure.UK"]},"刻印":{"c":["柊マグネタイト"],"a":["柊マグネタイト"]},"決意":{"c":["廉"],"a":["朝比奈健人"]},"未遂":{"c":["Feryquitous"],"a":["Feryquitous"]},"機械の声":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"玩具":{"c":["笹川真生"],"a":["笹川真生"]},"秘密":{"c":["たかやん"],"a":["Giga"]},"祭壇":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"輪廻":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"輪廻 acoustic ver.":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"愛詩":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"宣戦":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"言霊":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"電脳":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"定命":{"c":["カンザキイオリ"],"a":["宅見将典"]},"変身":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"明日":{"c":["大沼パセリ"],"a":["安宅秀紀"]},"言葉":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"Little Busters!":{"c":["麻枝准"],"a":["I've"]},"夢を見る夢":{"c":["折倉俊則"],"a":["折倉俊則"]},"I will":{"c":["shilo"],"a":["shilo"]},"桜の風":{"c":["shilo"],"a":["伊藤賢"]},"徒花夢現":{"c":["内山利彦(Blueberry＆Yogurt)"],"a":["木村孝明"]},"Amal":{"c":["塚越雄一朗(NanosizeMir)"],"a":["塚越雄一朗(NanosizeMir)"]},"アリス・イン・ブルー":{"c":["渡部チェル"],"a":["渡部チェル"]},"Angel Fly":{"c":["渡部チェル"],"a":["渡部チェル"]},"Id+air ～イデア～":{"c":["川野勝広"],"a":["川野勝広"]},"運命のその先へ":{"c":["松本慎一郎(love solfege)"],"a":["松本慎一郎(love solfege)"]},"Every My Dear":{"c":["瀬名"],"a":["NOIZ'n GIRL"]},"輝きの未来":{"c":["瀬名"],"a":["大野宏明"]},"風の吹く方へ":{"c":["しほり"],"a":["福富雅之"]},"変らない奇跡":{"c":["鈴木達也"],"a":["鈴木達也"]},"きっと、ずっと":{"c":["沙雪ヒロノ"],"a":["沙雪ヒロノ"]},"Cross my heart":{"c":["SigN"],"a":["SigN"]},"さがしにいこうよ":{"c":["松井洋平"],"a":["石川智久"]},"jamais vu":{"c":["細井そうし"],"a":["細井そうし"]},"Jumpin' Hoppin' Brand New Days":{"c":["けんせい(Silver Seats Records)"],"a":["けんせい(Silver Seats Records)"]},"Recurring Dreams":{"c":["けんせい(Silver Seats Records)"],"a":["けんせい(Silver Seats Records)"]},"JEWELRY HALATION":{"c":["木ノ下慶行"],"a":["木ノ下慶行"]},"流れる星に願う":{"c":["スズム"],"a":["スズム"]},"Hybris":{"c":["myu"],"a":["myu"]},"harmonia":{"c":["iyuna"],"a":["iyuna"]},"be there":{"c":["iyuna"],"a":["iyuna"]},"プリズムタイム":{"c":["藤本記子"],"a":["福富雅之"]},"ミニシアター":{"c":["片山義美"],"a":["片山義美"]},"MemoRia":{"c":["ぺさま"],"a":["ぺさま"]},"Laugh it up, Roll with it!":{"c":["Loser Kashiwagi"],"a":["Loser Kashiwagi"]},"朱きロザリオ ～破かれた頁～":{"c":["Ceui"],"a":["毛蟹"]},"クルクル☆ミラクル☆パステル！":{"c":["Ceui"],"a":["毛蟹"]},"安楽死姫":{"c":["毛蟹"],"a":["毛蟹"]},"君が残したオリオンからの手紙":{"c":["毛蟹"],"a":["毛蟹"]},"サーカス☆ワンダーラー！":{"c":["毛蟹"],"a":["毛蟹"]},"ピ.ピ.ピ.ハッピー":{"c":["毛蟹"],"a":["毛蟹"]},"Metamorphoses":{"c":["毛蟹"],"a":["毛蟹"]},"Energy":{"c":["Ceui"],"a":["小高光太郎"]},"Thousand Tears":{"c":["Ceui"],"a":["東タカゴー"]},"ピーターパンはきみがすき":{"c":["Ceui"],"a":["myu"]},"ひとつだけ～君と僕の秘密の物語～":{"c":["Ceui"],"a":["小高光太郎","Ceui"]},"あの日見た星空を、僕はずっと忘れない。":{"c":["小高光太郎"],"a":["小高光太郎"]},"今、歩き出す君へ":{"c":["小高光太郎"],"a":["小高光太郎"]},"Jewelry Time":{"c":["小高光太郎"],"a":["小高光太郎"]},"始まりへの旅":{"c":["小高光太郎"],"a":["小高光太郎"]},"Pandora":{"c":["小高光太郎"],"a":["小高光太郎"]},"微睡みの楽園":{"c":["小高光太郎"],"a":["小高光太郎"]},"敏感な風景":{"c":["大久保薫"],"a":["大久保薫","菊谷知樹"]},"あらたな光":{"c":["石川智久"],"a":["石川智久"]},"3minutes ランデブー":{"c":["福島貴夫"],"a":["福島貴夫"]},"アスター":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"a little pain":{"c":["山口寛雄"],"a":["土屋昌巳"]},"UNCAGE":{"c":["164"],"a":["164"]},"World End Heaven":{"c":["164"],"a":["164"]},"Emerge":{"c":["蝶々P"],"a":["蝶々P"]},"このピアノでお前を8759632145回ぶん殴る":{"c":["SLAVE.V-V-R"],"a":["SLAVE.V-V-R"]},"Stillness of Night":{"c":["forute"],"a":["forute"]},"花病み":{"c":["奏音69"],"a":["堤博明"]},"ヒGAY者A-PEAL":{"c":["大柴広己(もじゃ)"],"a":["コモリタミノル"]},"BLACK LIPS":{"c":["梅とら"],"a":["梅とら"]},"Black Lily":{"c":["湊貴大"],"a":["湊貴大"]},"右肩の蝶":{"c":["のりぴー"],"a":["のりぴー"]},"夜行線上のフライト":{"c":["ゆうゆ"],"a":["ゆうゆ"]},"剪定、ゼラニウムの行く末":{"c":["ぷす"],"a":["ぷす"]},"リリオペ":{"c":["ぷす"],"a":["ぷす"]},"ff (フォルティッシモ)":{"c":["蓑輪単志"],"a":["HOUND DOG"]},"青":{"c":["164"],"a":["164"]},"僕は僕でも僕じゃないかも":{"c":["一二三"],"a":["一二三"]},"Alienate":{"c":["koyori"],"a":["koyori"]},"shining of star":{"c":["*Luna"],"a":["*Luna"]},"雨音ペトリコール (Amaoto petorico-ru)":{"c":["奏音69"],"a":["奏音69"]},"クロニックヒロイン":{"c":["みきとP"],"a":["みきとP"]},"雫":{"c":["大橋卓弥","常田真太郎"],"a":["スキマスイッチ"]},"同担☆拒否":{"c":["shito"],"a":["HoneyWorks"]},"ねねねねねねねね！大爆走":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Orange Sparkle":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Breaking Down":{"c":["ナノウ"],"a":["ナノウ"]},"Liminal":{"c":["キノシタ"],"a":["キノシタ"]},"Ring-A-Linger":{"c":["やしきん"],"a":["やしきん"]},"last note":{"c":["ハム"],"a":["ハム"]},"LIVE IT LOUD!":{"c":["中野領太"],"a":["中野領太"]},"LOVE受信、ヒクツ発信":{"c":["キノシタ"],"a":["キノシタ"]},"カラカラ！":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"みちしるべ":{"c":["菊池達也"],"a":["菊池達也"]},"Lunch with me":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"WAO!!":{"c":["전진(Junjin)","아야토(篠崎あやと)","橘亮祐"],"a":["篠崎あやと","橘亮祐"]},"乙女よ求めよQ.E.D.":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"Tear-Gazer":{"c":["堀江晶太"],"a":["堀江晶太"]},"デコレート":{"c":["OSTER project"],"a":["OSTER project"]},"管制塔より":{"c":["すりぃ"],"a":["すりぃ"]},"アンバランス":{"c":["DECO*27"],"a":["Rockwell"]},"キミ=♡":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"エゴイスティック・シーソー":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"New Journey":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"Dear you 128√e980":{"c":["toku(GARNiDELiA)"],"a":["toku(GARNiDELiA)"]},"RISING 酸":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"いろはすてっぷ！":{"c":["40mP"],"a":["40mP"]},"風を仰ぎし麗容な":{"c":["牛肉","雄之助"],"a":["雄之助"]},"ハードモード":{"c":["みきとP"],"a":["みきとP"]},"風向きエントロピー":{"c":["まふまふ"],"a":["まふまふ"]},"Dreamy Sky":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Dream Shower":{"c":["ハム"],"a":["ハム"]},"ドリームキャッチピュアいろは！":{"c":["キノシタ"],"a":["キノシタ"]},"ホントノワタシ":{"c":["傘村トータ"],"a":["傘村トータ"]},"魔法少女まじかる☆ござる":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"パラライズ":{"c":["みきとP"],"a":["みきとP"]},"擬態ごっこ":{"c":["DECO*27"],"a":["Rockwell"]},"右左君君右下上目きゅるんめちょかわ！":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"P.E.T.":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"ラブフラストレーション":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"混ざる鈍色":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"モードク":{"c":["かいりきベア"],"a":["かいりきベア"]},"オーバード":{"c":["柊キライ"],"a":["柊キライ"]},"魔眼ウインク":{"c":["てにをは"],"a":["てにをは"]},"ハートにピース":{"c":["すりぃ"],"a":["すりぃ"]},"ばかばっか":{"c":["DECO*27"],"a":["tepe"]},"ZIG-ZAG":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"FIRST CRY":{"c":["杉山勝彦"],"a":["杉山勝彦"]},"get lucky":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"アナスタシスガール":{"c":["奏音69"],"a":["奏音69"]},"アナスタシスガール":{"c":["奏音69"],"a":["奏音69"]},"B4N":{"c":["かめりあ"],"a":["かめりあ"]},"アン・シンデレラ":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"Smart":{"c":["がらり"],"a":["がらり"]},"Sweet Temptation":{"c":["R・O・N"],"a":["R・O・N"]},"Lioness’ Pride":{"c":["かめりあ"],"a":["かめりあ"]},"I I I Love You":{"c":["수조(水槽)"],"a":["水槽"]},"Connect:Addict":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"がおってこ！":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"シミュラクル":{"c":["Taku Inoue"],"a":["Taku Inoue"]},"トキハナテ":{"c":["REDALiCE"],"a":["REDALiCE"]},"boundary":{"c":["鬱P"],"a":["鬱P"]},"HOLD ME, Homie?":{"c":["DYES IWASAKI"],"a":["DYES IWASAKI"]},"スターライト":{"c":["Wiggy"],"a":["Wiggy"]},"DODEKAMBITIOUS":{"c":["大石昌良"],"a":["大石昌良"]},"6eyond The Limit":{"c":["草野華余子"],"a":["草野華余子"]},"Stellar Symphony":{"c":["Arte Refact"],"a":["Arte Refact"]},"星灯":{"c":["蜂屋ななし"],"a":["蜂屋ななし"]},"ラブミ！":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"爆夏!!トロピカバケーション":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"未完成な青色":{"c":["Neru"],"a":["Neru"]},"ウーニャカ":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"ラヴレター":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"ばーちゃらぶ":{"c":["キノシタ"],"a":["キノシタ"]},"Sparkling!!":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"ENDLESS FES":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"等身大ラブレター":{"c":["40mP"],"a":["40mP"]},"君と眺める夏の花":{"c":["ハム"],"a":["ハム"]},"Smile & Go!!":{"c":["ハム"],"a":["ハム"]},"SKYSONAR":{"c":["やしきん"],"a":["やしきん"]},"アトリエ":{"c":["渡辺翔"],"a":["수조"]},"ユグドラシル":{"c":["堀江晶太"],"a":["堀江晶太"]},"Funfair":{"c":["buzzG"],"a":["buzzG"]},"Silent Flame,Never Fade":{"c":["草野華余子"],"a":["草野華余子"]},"架空と本当":{"c":["にお"],"a":["にお"]},"青く在れ":{"c":["みきとP"],"a":["みきとP"]},"しらないファンタスティックワールド":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"ワクワクトレジャーワールド":{"c":["キノシタ"],"a":["キノシタ"]},"なかま歌":{"c":["ぼっちぼろまる"],"a":["ぼっちぼろまる"]},"スクラップ & ビルド！":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"Run or Run":{"c":["R・O・N"],"a":["R・O・N"]},"ヨマツリズム":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"ヨマツリズム":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"ファッションビート":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"Mosh Race":{"c":["じん"],"a":["堀江晶太"]},"アワーツリー":{"c":["ハム"],"a":["ハム"]},"シュガーラッシュ":{"c":["DECO*27"],"a":["tepe"]},"光になれ！":{"c":["田淵智也"],"a":["堀江晶太"]},"僕らと君のうた。":{"c":["40mP"],"a":["40mP"]},"RED HEART":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"RED HEART (Remastered)":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"Infinity":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"Infinity (Remastered)":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"BUTA":{"c":["てにをは"],"a":["てにをは"]},"お人形":{"c":["きくお"],"a":["きくお"]},"感触":{"c":["椎乃味醂"],"a":["椎乃味醂"]},"めちゃゴミ♡完♡全♡食!!":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"BAN RTA":{"c":["かめりあ"],"a":["かめりあ"]},"Who2":{"c":["かいりきベア"],"a":["かいりきベア"]},"Secret Garden":{"c":["如月結愛"],"a":["如月結愛"]},"電脳ぴゅあ推し大宣言":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"Finale":{"c":["アキ・ローゼンタール","如月結愛"],"a":["如月結愛"]},"Bremen Music Festival":{"c":["アキ・ローゼンタール","如月結愛"],"a":["如月結愛"]},"Feel my Song!":{"c":["如月結愛"],"a":["如月結愛"]},"The Fantasy Seeker":{"c":["如月結愛"],"a":["如月結愛"]},"Dreaming Princess〜Road to Bremen":{"c":["如月結愛"],"a":["如月結愛"]},"Miracle Voice":{"c":["如月結愛"],"a":["如月結愛"]},"ちょこせんせーしょん":{"c":["キノシタ"],"a":["キノシタ"]},"サマーラブ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"初恋大戦争":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"色をくれたキミへ":{"c":["ハム"],"a":["ハム"]},"キミの秒針":{"c":["みきとP"],"a":["みきとP"]},"お陰様で":{"c":["てにをは"],"a":["てにをは"]},"夢花火":{"c":["まふまふ"],"a":["まふまふ"]},"かわ世":{"c":["Medansy"],"a":["Medansy"]},"melting":{"c":["渡辺翔"],"a":["수조"]},"花吹雪":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"万歳☆満開":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"Sparklers (ヤマトファンタジアver.)":{"c":["石倉誉之","YAS"],"a":["YAS"]},"UnAlive":{"c":["Elliot Hsu"],"a":["Elliot Hsu"]},"居場所":{"c":["Mori Calliope","Kenichiro Nishihara"],"a":["Kenichiro Nishihara"]},"Cursed Night":{"c":["Koko"],"a":["Koko"]},"Lose-Lose Days":{"c":["鬱P"],"a":["鬱P"]},"いじめっ子Bully":{"c":["きくお"],"a":["きくお"]},"MERA MERA":{"c":["Giga"],"a":["Giga"]},"Live Again":{"c":["Koko"],"a":["Koko"]},"Dawn Blue":{"c":["川谷絵音"],"a":["川谷絵音"]},"Queen of the Night":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"Memento":{"c":["ケンカイヨシ"],"a":["ケンカイヨシ"]},"Last Days":{"c":["Koko"],"a":["Koko"]},"INSOMNIAC BLACK":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"Through the glass":{"c":["HaTo"],"a":["HaTo"]},"Transparent Blue":{"c":["Kengo Minamida"],"a":["Kengo Minamida"]},"Daydreamer":{"c":["Lotas"],"a":["Lotas"]},"Lycoris":{"c":["永塚健登"],"a":["永塚健登"]},"salvia":{"c":["堀江晶太"],"a":["堀江晶太"]},"Ray of Hope":{"c":["中野領太"],"a":["中野領太"]},"夜が明けるまで":{"c":["石濱翔(MONACA)"],"a":["石濱翔(MONACA)"]},"Yorugaakerumade":{"c":["石濱翔(MONACA)"],"a":["石濱翔(MONACA)"]},"Deep Forest":{"c":["広川恵一(MONACA)"],"a":["広川恵一(MONACA)"]},"Fragment":{"c":["R・O・N"],"a":["R・O・N"]},"Prologue":{"c":["R・O・N"],"a":["R・O・N"]},"優しい君へ":{"c":["ヒグチアイ"],"a":["兼松衆"]},"Yasashiikimie":{"c":["ヒグチアイ"],"a":["兼松衆"]},"Try add":{"c":["渡辺翔"],"a":["eba"]},"Odyssey":{"c":["加藤冴人"],"a":["加藤冴人"]},"唄を教えてくれたあなたへ":{"c":["Carlos K."],"a":["Carlos K."]},"地獄屋八丁荒らし":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"六道伍感さんぽ":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"Twilight Road":{"c":["堀江晶太"],"a":["堀江晶太"]},"Telescope":{"c":["みきとP"],"a":["みきとP"]},"旅路":{"c":["藤井風"],"a":["Yaffle"]},"アイ":{"c":["秦基博"],"a":["松浦晃久"]},"ハートにドン":{"c":["玉屋2060%"],"a":["玉屋2060%"]},"偏食":{"c":["川谷絵音"],"a":["川谷絵音"]},"Broken":{"c":["R・O・N"],"a":["R・O・N"]},"【シロ×戌亥とこSpecial MV】エメラルド（Song":{"c":["清水依与吏"],"a":["back number"]},"Laundry":{"c":["生田絵梨花"],"a":["市川淳"]},"No one compares":{"c":["生田絵梨花"],"a":["市川淳"]},"I'm gonna beat you!!":{"c":["生田絵梨花"],"a":["井上薫"]},"だからね":{"c":["柳沢亮太(SUPER BEAVER)"],"a":["柳沢亮太"]},"ピリオド":{"c":["生田絵梨花","内澤崇仁"],"a":["内澤崇仁"]},"上出来":{"c":["生田絵梨花"],"a":["大濱健悟"]},"モンブラン":{"c":["生田絵梨花"],"a":["大濱健悟"]},"無視":{"c":["生田絵梨花"],"a":["大濱健悟"]},"かくれんぼ":{"c":["生田絵梨花"],"a":["市川淳"]},"今も、ありがとう":{"c":["生田絵梨花"],"a":["大濱健悟"]},"シオン":{"c":["Eve"],"a":["Numa"]},"星に願いを":{"c":["Eve"],"a":["Numa"]},"パンダビリティー":{"c":["すりぃ"],"a":["すりぃ"]},"フェイクファーワルツ":{"c":["Guiano"],"a":["Guiano"]},"アイセタ":{"c":["Guiano"],"a":["Guiano"]},"愛の唄":{"c":["Guiano"],"a":["Guiano"]},"Arcana":{"c":["Guiano"],"a":["Guiano"]},"マリー":{"c":["Guiano"],"a":["Guiano"]},"花はかぐや":{"c":["Myuk","大濱健悟"],"a":["大濱健悟"]},"明日が来る":{"c":["Myuk"],"a":["TomoLow"]},"雪唄 - yukiuta":{"c":["Myuk"],"a":["TomoLow"]},"グライド":{"c":["lily-chou-chou","小林武史"],"a":["小林武史"]},"Black Sheep":{"c":["Myuk"],"a":["TomoLow"]},"ODD NUMBER":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"なに笑ろとんねん":{"c":["てにをは"],"a":["てにをは"]},"ババロア":{"c":["みきとP"],"a":["みきとP"]},"カサブランカ":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"Tenden Barabara":{"c":["てにをは"],"a":["てにをは"]},"Follow My Lead":{"c":["みきとP"],"a":["みきとP"]},"百倍返し":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"BAD MAD":{"c":["柊キライ"],"a":["柊キライ"]},"Endless":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"Transfer Student":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"Infinity karat":{"c":["田淵智也"],"a":["堀江晶太"]},"Love and Hate":{"c":["유よゆっぺ"],"a":["ゆよゆっぺ"]},"キワメテカワイイ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"茜光":{"c":["umigame"],"a":["umigame"]},"Seventh Heaven":{"c":["やしきん"],"a":["やしきん"]},"光のみちしるべ":{"c":["やしきん"],"a":["やしきん"]},"Kiss and Cry":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"蒼のカケラ":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Luv Rendezvous":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"赤い風船":{"c":["みきとP"],"a":["みきとP"]},"あたしワールド":{"c":["キノシタ"],"a":["キノシタ"]},"ハッピーアイスクリン":{"c":["やしきん"],"a":["やしきん"]},"Umbrella":{"c":["重永亮介"],"a":["重永亮介"]},"愛包ダンスホール":{"c":["Gohgo"],"a":["南田健吾"]},"LADY CRAZY":{"c":["Gohgo"],"a":["Gohgo"]},"Mr.VIRTUALIZER":{"c":["Gohgo"],"a":["Gohgo"]},"フリコドウル":{"c":["Gohgo"],"a":["Gohgo"]},"うたかたよいかないで (Message-In)":{"c":["Gohgo"],"a":["Gohgo"]},"魂にひそむ":{"c":["Gohgo"],"a":["Gohgo"]},"Lemonade":{"c":["Gohgo"],"a":["Gohgo"]},"流れ行く命":{"c":["Gohgo"],"a":["Gohgo"]},"ヒトガタ":{"c":["Gohgo"],"a":["南田健吾"]},"ヒバリ":{"c":["Gohgo"],"a":["南田健吾"]},"Rainy proof":{"c":["海野水玉"],"a":["海野水玉"]},"20":{"c":["海野水玉"],"a":["海野水玉"]},"涙することは疎か、息も出来ない。":{"c":["海野水玉"],"a":["海野水玉"]},"灰色":{"c":["海野水玉"],"a":["海野水玉"]},"八月の蛍":{"c":["海野水玉"],"a":["海野水玉"]},"羽根を下さい":{"c":["海野水玉"],"a":["海野水玉"]},"Weekend milk":{"c":["海野水玉"],"a":["海野水玉"]},"Lonely Girl":{"c":["海野水玉"],"a":["海野水玉"]},"夏灯篭":{"c":["海野水玉"],"a":["海野水玉"]},"バスタイムプラネタリウム":{"c":["海野水玉"],"a":["海野水玉"]},"Twilight Line":{"c":["海野水玉"],"a":["海野水玉"]},"ビー玉":{"c":["海野水玉"],"a":["海野水玉"]},"空が待ってる":{"c":["海野水玉"],"a":["海野水玉"]},"HONEY BEES":{"c":["海野水玉"],"a":["海野水玉"]},"さよならfrequency":{"c":["海野水玉"],"a":["海野水玉"]},"Level off":{"c":["海野水玉"],"a":["海野水玉"]},"まなざし":{"c":["海野水玉"],"a":["海野水玉"]},"いつかのために":{"c":["海野水玉"],"a":["海野水玉"]},"Deep Sleep Sheep":{"c":["海野水玉"],"a":["海野水玉"]},"석양(夕陽)":{"c":["海野水玉"],"a":["海野水玉"]},"透明軌道":{"c":["国吉亜耶子and西川真吾Duo"],"a":["国吉亜耶子and西川真吾Duo"]},"万華鏡":{"c":["Loyly"],"a":["Loyly"]},"檻":{"c":["keeno"],"a":["keeno"]},"Dusk":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"ivy":{"c":["keeno"],"a":["keeno"]},"星を待つ":{"c":["satoshi","B swamp"],"a":["satoshi","B swamp","藤原燈太"]},"To Be Alive":{"c":["海野水玉"],"a":["海野水玉"]},"Brand New Episode":{"c":["海野水玉"],"a":["海野水玉"]},"line, sphere, dot.":{"c":["海野水玉"],"a":["海野水玉"]},"スウィングバイ":{"c":["海野水玉"],"a":["海野水玉"]},"異星から":{"c":["海野水玉"],"a":["海野水玉"]},"万有引力":{"c":["海野水玉"],"a":["海野水玉"]},"VESTIGIA":{"c":["海野水玉"],"a":["海野水玉"]},"Pale Blue Dot":{"c":["海野水玉"],"a":["海野水玉"]},"レコードのように":{"c":["海野水玉"],"a":["海野水玉"]},"夜迷い言":{"c":["海野水玉"],"a":["海野水玉"]},"R・I・O・T":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"EXPOSE 'Burn out!!!'":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Sacred world":{"c":["上松範康(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"CORUSCATE -DNA-":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"灼熱 Bonfire!":{"c":["日高勇輝(Elements Garden)"],"a":["日高勇輝(Elements Garden)"]},"Bad Kids All Bet":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"DEAD HEAT BEAT":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"DANCING DARING":{"c":["竹田祐介(Elements Garden)"],"a":["竹田祐介(Elements Garden)"]},"JUST THE WAY I AM":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"HOWLING AMBITION":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"WHAT AN EXPLOSION":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"'FIGHT' ADDICT":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"V.I.P MONSTER":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Choir 'S' Choir":{"c":["Diggy-MO'","角本麻衣(SUPA LOVE)"],"a":["角本麻衣(SUPA LOVE)"]},"DIVINE":{"c":["Diggy-MO'","大빈(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"A Song Of Romance (from EP \"神の名を\")":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"A Song Of Romance":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"Abracadabra":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"‘S/’ The Way":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"The Whole Blue World":{"c":["Diggy-MO'","松坂康司(SUPA LOVE)"],"a":["松坂康司(SUPA LOVE)"]},"神の名を":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"BADDY BADDY":{"c":["Diggy-MO'","長谷川大介(SUPA LOVE)"],"a":["長谷川大介(SUPA LOVE)"]},"Legendary":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"“UNIONS” Road":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"－HEROIC ADVENT－":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"陽だまりロードナイト":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"Ringing Bloom":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"Dazzle the Destiny":{"c":["上松範康(Elements Garden)"],"a":["竹田祐介(Elements Garden)"]},"シャルル":{"c":["バルーン"],"a":["バルーン"]},"深愛":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"誰にもなれない私だから":{"c":["南田健吾"],"a":["玉井健二","南田健吾"]},"薄采ディスプレイ":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"飛べない蝶は夢を見る":{"c":["南田健吾"],"a":["玉井健二","南田健吾"]},"群青ミニアチュール":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"碧いif":{"c":["南田健吾"],"a":["玉井健二","南田健吾"]},"ただ声一つ":{"c":["MIMI"],"a":["MIMI"]},"愛が灯る":{"c":["MIMI"],"a":["MIMI"]},"アルビレオ":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"ユリイカ":{"c":["傘村トータ"],"a":["小松一也"]},"生活の":{"c":["MIMI"],"a":["MIMI"]},"眼差し":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"3 o'clock Kiss":{"c":["40mP"],"a":["40mP"]},"言葉の続き":{"c":["一二三"],"a":["一二三"]},"あやふや":{"c":["Guiano"],"a":["Guiano"]},"As you don't know":{"c":["みきとP"],"a":["みきとP"]},"About You":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"夏を書き留める":{"c":["負け犬"],"a":["負け犬"]},"草々不一":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"心の奥":{"c":["MIMI"],"a":["MIMI"]},"数センチメンタル":{"c":["泣き虫☔︎"],"a":["泣き虫☔︎"]},"人生に期待をしてはいけない":{"c":["傘村トータ"],"a":["傘村トータ"]},"涙の融点":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"星の鼓動":{"c":["Guiano"],"a":["Guiano"]},"刹那、夏が終わっていく":{"c":["ミリ子"],"a":["ミリ子"]},"ひとりじゃないんだ":{"c":["MIMI"],"a":["MIMI"]},"Iam":{"c":["澤野弘之"],"a":["澤野弘之"]},"10年後の私になら":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"恋してる自分すら愛せるんだ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"DREAM LINE":{"c":["俊龍"],"a":["加藤大祐"]},"純真Always":{"c":["堀江晶太"],"a":["堀江晶太"]},"1HOPE SNIPER":{"c":["Q-MHz"],"a":["Q-MHz"]},"運命ジレンマ":{"c":["田淵智也"],"a":["eba"]},"リトルソルジャー":{"c":["黒須克彦"],"a":["黒須克彦"]},"イコール":{"c":["高橋諒"],"a":["高橋諒"]},"ヤサシイセカイ":{"c":["堀江晶太"],"a":["堀江晶太"]},"箱庭の幸福":{"c":["神田ジョン"],"a":["神田ジョン"]},"プライベート・ルーム":{"c":["柴山太朗"],"a":["柴山太朗"]},"Private Room":{"c":["柴山太朗"],"a":["柴山太朗"]},"It's my CUE.":{"c":["堀江晶太"],"a":["堀江晶太"]},"ギミーシェルター・ブライトネス":{"c":["堀江晶太"],"a":["堀江晶太"]},"Visual Vampire":{"c":["Q-MHz"],"a":["Q-MHz","堀江晶太"]},"Pajama KINGDOM":{"c":["Q-MHz"],"a":["Q-MHz"]},"ヒムナル":{"c":["神田ジョン"],"a":["神田ジョン"]},"Straight Forward":{"c":["堀江晶太"],"a":["堀江晶太"]},"ダ・カーポ ～第2ボタンの誓い～":{"c":["tororo"],"a":["Angel Note"]},"第2ボタンの誓い":{"c":["tororo"],"a":["Angel Note"]},"サクラサクミライコイユメ":{"c":["tororo"],"a":["Angel Note"]},"サクラキミニエム":{"c":["tororo"],"a":["黒須克彦"]},"記憶の海":{"c":["lotta"],"a":["大久保薫"]},"未来地図":{"c":["rino"],"a":["長田直之"]},"Happy my life ～Thank you for everything!!～":{"c":["tororo"],"a":["Angel Note"]},"レンブラントの光":{"c":["俊龍"],"a":["전진"]},"Graduation from yesterday":{"c":["tororo"],"a":["長田直之"]},"優しさは雨のように":{"c":["rino"],"a":["大久保薫"]},"消えないで…":{"c":["tororo"],"a":["長田直之"]},"LOVING TRIP":{"c":["yozuca*"],"a":["chokix"]},"君がいた未来 君といない未来":{"c":["yozuca*"],"a":["lotta"]},"祝福の歌":{"c":["yozuca*"],"a":["黒須克彦"]},"メモリーズ・ラスト":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"黎鳴 -reimei-":{"c":["デワヨシアキ"],"a":["デワヨシアキ"]},"Brand new, Standing wings":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"ALGO～Who Knows It?～":{"c":["中沢伴行"],"a":["中沢伴行"]},"... Because, in SHADOW":{"c":["a2c"],"a":["MintJam"]},"Dysnomia-ディスノミア-":{"c":["R・O・N"],"a":["R・O・N"]},"Trying! Trying!":{"c":["R・O・N"],"a":["R・O・N"]},"ひまわりと夏":{"c":["fu_mou"],"a":["fu_mou"]},"fixxx and lie":{"c":["井内舞子"],"a":["井内舞子"]},"REINCARNATION":{"c":["R・O・N"],"a":["R・O・N"]},"mind as Judgment":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"Errand":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"螺旋、或いは聖なる欲望。":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"終末のフラクタル":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"Dead END":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"Blood teller":{"c":["中山真斗(Elements Garden)"],"a":["中山真斗(Elements Garden)"]},"WHITE justice":{"c":["上松範康(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"東京ゼロハーツ":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"RED decision":{"c":["増谷賢"],"a":["増谷賢"]},"【Switch版セレクトオブリージュ新主題歌】With my Brave【公式・FULL】ボーカル：Faylan":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"紫電 ～円環の絆～":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"Live in Despair":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"レコンキスタ":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"UNISONIA":{"c":["fandelmale"],"a":["酒井拓也(Arte Refact)"]},"エイル":{"c":["高田暁"],"a":["高田暁"]},"DREAM SOLISTER":{"c":["加藤裕介"],"a":["加藤裕介"]},"飛竜の騎士":{"c":["酒井拓也(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"サウンドスケープ":{"c":["渡辺拓也"],"a":["EFFY"]},"Another colony":{"c":["中野領太"],"a":["BBC"]},"Blast!":{"c":["加藤裕介"],"a":["加藤裕介"]},"Storyteller":{"c":["津波幸平"],"a":["津波幸平"]},"アンサンブル":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"ReCoda":{"c":["トミタカズキ(SUPA LOVE)"],"a":["ហា-j","松田彬人"]},"フローズン":{"c":["堀江晶太"],"a":["堀江晶太"]},"フロム":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"10周年記念楽曲「TRUE」":{"c":["堀江晶太"],"a":["堀江晶太"]},"ブルーデイズ":{"c":["堀江晶太"],"a":["堀江晶太"]},"ユートピア":{"c":["堀江晶太"],"a":["堀江晶太"]},"Letter":{"c":["Evan Call"],"a":["Evan Call"]},"Lonely Queen's Liberation Party":{"c":["本多友紀(Arte Refact)"],"a":["河合泰志(Arte Refact)"]},"Swinging Heart":{"c":["田淵智也"],"a":["成田ハネダ"]},"Desire Again":{"c":["俊龍"],"a":["Sizuk"]},"キミのとなりで":{"c":["伊藤翼"],"a":["伊藤翼"]},"No Continue":{"c":["ANCHOR"],"a":["ANCHOR"]},"Esquisse":{"c":["Soflan Daichi"],"a":["伊藤翼"]},"moment":{"c":["脇眞富(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"Dive to World":{"c":["Saku"],"a":["Saku"]},"The One":{"c":["光増ハジメ"],"a":["光増ハジメ"]},"キャンバス":{"c":["堀江晶太"],"a":["堀江晶太"]},"ロケット (月坂紗由)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Watch Me (Mikari ver,) (橘美花莉)":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"ぐるぐるライブ (由崎司)":{"c":["エンドウ."],"a":["エンドウ."]},"空は高く風は歌う":{"c":["梶浦由記"],"a":["森空青"]},"Overfly":{"c":["Saku"],"a":["Saku"]},"snowdrop":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"snowdrop -春奈るな×河野マリナver.-":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"Startear":{"c":["Saku"],"a":["Saku"]},"君色シグナル":{"c":["増谷賢"],"a":["増谷賢"]},"Ripple Effect":{"c":["ZAQ"],"a":["ZAQ"]},"Ripple Effect - Piano & Strings":{"c":["ZAQ"],"a":["ZAQ"]},"Windia":{"c":["伊湊"],"a":["津波幸平"]},"ステラブリーズ":{"c":["杉坂天汰","ツカダタカシゲ"],"a":["ツカダタカシゲ"]},"TRUE STORY - Piano & Strings":{"c":["宮崎京一"],"a":["宮崎京一"]},"ユリアザミ":{"c":["Saku"],"a":["Saku"]},"キミシニタモウコトナカレ":{"c":["本間昭光"],"a":["本間昭光"]},"Scarlet Ballet":{"c":["浅倉大介"],"a":["浅倉大介"]},"Brain Diver":{"c":["山田智和"],"a":["CHOKKAKU"]},"Chase the world":{"c":["浅倉大介"],"a":["浅倉大介"]},"ViViD":{"c":["秋田博之"],"a":["CHOKKAKU"]},"You":{"c":["中野領太"],"a":["NAOKI-T"]},"牙と翼":{"c":["渡辺翔"],"a":["h-wonder"]},"天使よ故郷を聞け":{"c":["h-wonder"],"a":["h-wonder"]},"あはっててっぺんっ":{"c":["大石昌良","園田健太郎"],"a":["園田健太郎"]},"オレンジ":{"c":["해랑(Junky)"],"a":["Junky"]},"Fly me to the エンド！☆":{"c":["Junky"],"a":["Junky"]},"genesis/destiny":{"c":["加藤裕介"],"a":["加藤裕介"]},"LOVE IS THE STRONGEST":{"c":["吉木絵里子"],"a":["華原大輔"]},"人生進行形":{"c":["Junky"],"a":["Junky"]},"What's a Hero":{"c":["加藤裕介"],"a":["加藤裕介"]},"True Destiny":{"c":["TSUKASA"],"a":["TSUKASA"]},"イマココ":{"c":["流歌"],"a":["流歌"]},"月がきれい":{"c":["WEST GROUND"],"a":["伊賀拓郎"]},"灯火のまにまに":{"c":["ZAI-ON"],"a":["ZAI-ON"]},"群青インフィニティ":{"c":["東山奈央"],"a":["WEST GROUND"]},"歩いていこう！":{"c":["川嶋あい"],"a":["伊賀拓郎"]},"冷めない魔法":{"c":["RIRIKO"],"a":["RIRIKO"]},"OVER!!":{"c":["東山奈央"],"a":["배(ヒゲドライバー)"]},"I WILL":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"真夜中の怪獣":{"c":["배(烏屋茶房)"],"a":["烏屋茶房"]},"MEMORIA":{"c":["安田史生"],"a":["下川佳代"]},"INNOCENCE":{"c":["重永亮介"],"a":["下川佳代","重永亮介"]},"シリウス":{"c":["重永亮介"],"a":["重永亮介"]},"IGNITE":{"c":["小川智之"],"a":["Saku"]},"ツナガルオモイ":{"c":["藍井エイル"],"a":["水木峻","石塚英一朗"]},"GENESIS":{"c":["黒須克彦"],"a":["篤志","黒須克彦"]},"ラピスラズリ":{"c":["加藤裕介"],"a":["加藤裕介"]},"翼":{"c":["山田竜平"],"a":["加藤裕介"]},"流星":{"c":["津波幸平"],"a":["津波幸平"]},"アイリス":{"c":["ArmySlick","Lauren Kaori"],"a":["ArmySlick"]},"I will...":{"c":["TAMATE BOX","Saku"],"a":["Saku"]},"心臓":{"c":["n-buna"],"a":["n-buna"]},"MONSTER":{"c":["重永亮介"],"a":["重永亮介"]},"絵空事":{"c":["Saku"],"a":["Saku"]},"DRUM":{"c":["津波幸平"],"a":["津波幸平"]},"Decay":{"c":["Saku"],"a":["Saku"]},"青く、青く":{"c":["重永亮介"],"a":["重永亮介"]},"君にふれて":{"c":["배(bonbon)"],"a":["배(bonbon)"]},"Memories":{"c":["ヒゲドライバー"],"a":["Powerless"]},"Whiteout":{"c":["배(bonbon)"],"a":["배(bonbon)"]},"Glow at the Velocity of Light":{"c":["ナスカ"],"a":["the Third"]},"be perfect, plz!":{"c":["R・O・N"],"a":["R・O・N"]},"Keep weaving your spider way":{"c":["田淵智也"],"a":["堀江晶太"]},"Chance! & Revenge!":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"かたち":{"c":["eba"],"a":["eba"]},"BLUE CYALUME":{"c":["安月名莉子"],"a":["배(bonbon)"]},"Sayonara":{"c":["安月名莉子"],"a":["Powerless"]},"DreamRiser":{"c":["R・O・N"],"a":["R・O・N"]},"夏の日と君の声":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"ピースマイル!":{"c":["ミト"],"a":["ミト"]},"空とキミのメッセージ":{"c":["矢吹香那"],"a":["黒須克彦"]},"Elemental World":{"c":["AstroNoteS"],"a":["AstroNoteS"]},"kaleidoscope":{"c":["川本新"],"a":["川本新"]},"Green jade":{"c":["ChouCho"],"a":["村山☆潤"]},"Stardust Diary":{"c":["ChouCho"],"a":["村山☆潤"]},"なないろのたね":{"c":["ChouCho"],"a":["村山☆潤"]},"希望の絆":{"c":["俊龍"],"a":["Sizuk"]},"Nonstop Daydream":{"c":["ChouCho"],"a":["村山☆潤"]},"アムリタ":{"c":["かの香織"],"a":["藤田哲司"]},"ウンディーネ":{"c":["窪田ミナ"],"a":["窪田ミナ"]},"シンフォニー":{"c":["北川勝利"],"a":["北川勝利","桜井康史"]},"もどかしい世界の上で":{"c":["佐々倉有吾"],"a":["島田昌典"]},"スケッチブックを持ったまま":{"c":["大江千里"],"a":["清水信之"]},"ふわふわ♪":{"c":["전진(ヒゲドライバー)"],"a":["ヒゲドライバー"]},"ジャスミン":{"c":["SONALIO"],"a":["SONALIO"]},"エヴリデイドリーム (佐久間まゆ)":{"c":["滝澤俊輔(TRYTONELABO)"],"a":["滝澤俊輔(TRYTONELABO)"]},"KOE":{"c":["Saku"],"a":["Saku"]},"PLEDGE":{"c":["Saku"],"a":["Saku"]},"RESISTER":{"c":["重永亮介"],"a":["重永亮介"]},"雲雀":{"c":["梶浦由記"],"a":["梶浦由記"]},"CHAIN":{"c":["重永亮介"],"a":["重永亮介"]},"進化論":{"c":["重永亮介"],"a":["重永亮介"]},"君が見た夢の物語":{"c":["梶浦由記"],"a":["梶浦由記"]},"私が笑う理由は":{"c":["古川貴浩"],"a":["古川貴浩"]},"紫苑の花束を":{"c":["해랑(重永亮介)"],"a":["重永亮介"]},"明日世界が終わるとしても":{"c":["重永亮介"],"a":["重永亮介"]},"Never Let It Go":{"c":["Saku"],"a":["Saku"]},"逆境スペクトル":{"c":["重永亮介"],"a":["重永亮介"]},"I DON’T CARE":{"c":["重永亮介"],"a":["重永亮介"]},"最前線":{"c":["Saku"],"a":["Saku"]},"創傷イノセンス":{"c":["R・O・N"],"a":["R・O・N"]},"ギミー!レボリューション":{"c":["田淵智也"],"a":["やしきん"]},"からっぽカプセル":{"c":["渡辺翔"],"a":["黒須克彦"]},"Resonant Heart":{"c":["y0c1e"],"a":["堀江晶太"]},"c.o.s.m.o.s":{"c":["渡辺翔"],"a":["ミト"]},"aventure bleu":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"youthful beautiful":{"c":["RIRIKO"],"a":["白戸佑輔","RIRIKO"]},"鼓動エスカレーション":{"c":["本多友紀"],"a":["脇眞富"]},"ノーシナリオ":{"c":["渡辺翔"],"a":["白戸佑輔"]},"ストロボメモリー":{"c":["RIRIKO"],"a":["RIRIKO"]},"聴こえる?":{"c":["林英樹"],"a":["佐藤純一(fhána)"]},"ラウドヘイラー":{"c":["渡辺翔"],"a":["白戸佑輔"]},"創路":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"パラレルなハート":{"c":["大石昌良"],"a":["大石昌良"]},"COMPRESSION :[":{"c":["やしきん"],"a":["やしきん"]},"共鳴レゾンデートル":{"c":["田淵智也"],"a":["堀江晶太"]},"パパルラ":{"c":["y0c1e"],"a":["y0c1e"]},"はじめてのかくめい!":{"c":["田淵智也"],"a":["田中秀和(MONACA)"]},"人生イージー?":{"c":["田淵智也"],"a":["田中秀和(MONACA)"]},"あやふわアスタリスク":{"c":["田淵智也"],"a":["広川恵一(MONACA)"]},"おもいでしりとり":{"c":["田淵智也"],"a":["睦月周平"]},"僕らが愚かだなんて誰が言った":{"c":["田淵智也"],"a":["kz(livetune)"]},"恋は世界定理と共に":{"c":["竹内サティフォ"],"a":["中山真斗"]},"デネブとスピカ":{"c":["田淵智也"],"a":["堀江晶太"]},"かすかでたしか":{"c":["田淵智也"],"a":["広川恵一(MONACA)"]},"にゃんぼりーdeモッフィー!!":{"c":["田淵智也"],"a":["久下真音"]},"イージー?ハード?しかして進めっ!":{"c":["田淵智也"],"a":["伊藤翼"]},"ユートピア学概論":{"c":["田淵智也"],"a":["瀬名航"]},"奇跡は起きない":{"c":["田淵智也"],"a":["堀江晶太"]},"夏に重ねて":{"c":["田淵智也"],"a":["수조"]},"パジャマdeパーティー":{"c":["田淵智也"],"a":["やしきん"]},"夢のつぼみ":{"c":["渡部チェル"],"a":["渡部チェル"]},"harmony ribbon":{"c":["多田慎也"],"a":["鈴木雅也"]},"Starry Wish":{"c":["nozomi"],"a":["KOUGA"]},"アイマイモコ":{"c":["Haggy Rock"],"a":["白戸佑輔"]},"Ready Steady Go!":{"c":["藤末樹"],"a":["藤末樹"]},"TRUST IN ETERNITY":{"c":["加藤裕介"],"a":["加藤裕介"]},"Wonder Caravan!":{"c":["新田目翔"],"a":["新田目翔"]},"ココロソマリ":{"c":["櫻澤ヒカル"],"a":["白戸佑輔"]},"Starlight Museum":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"HELLO HORIZON":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"REAL-EYES":{"c":["RUCCA"],"a":["藤間仁(Elements Garden)"]},"スクラップアート":{"c":["栁舘周平"],"a":["栁舘周平"]},"フラーグム":{"c":["カノエラナ"],"a":["白戸佑輔"]},"クータスタ":{"c":["栁舘周平"],"a":["栁舘周平"]},"三月と群青":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"Two Colors (レム)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"やさしい希望":{"c":["矢吹香那"],"a":["前口渉"]},"Installation":{"c":["早見沙織","矢吹香那"],"a":["前口渉"]},"夢の果てまで":{"c":["竹内まりや"],"a":["増田武史"]},"Jewelry":{"c":["早見沙織"],"a":["倉内達矢"]},"新しい朝":{"c":["竹内まりや"],"a":["前口渉"]},"Awake":{"c":["TK"],"a":["TK"]},"Guide":{"c":["渡辺翔"],"a":["大久保薫"]},"視紅":{"c":["渡辺翔"],"a":["大久保薫"]},"白と花束":{"c":["早見沙織"],"a":["大久保薫"]},"エブリデイワールド (雪ノ下雪乃)":{"c":["黒須克彦"],"a":["黒須克彦"]},"エブリデイ is パーフェクト (雪ノ下雪乃)":{"c":["黒須克彦"],"a":["黒須克彦"]},"Bitter Bitter Sweet (雪ノ下雪乃)":{"c":["전진(北川勝利)"],"a":["北川勝利"]},"resume (雪ノ下雪乃)":{"c":["北川勝利"],"a":["北川勝利"]},"INSANE":{"c":["Neuron"],"a":["Neuron"]},"ROSE":{"c":["ちゃんみな"],"a":["ちゃんみな","Ryosuke \"Dr.R\" Sakai"]},"花の唄":{"c":["梶浦由記"],"a":["梶浦由記"]},"白日":{"c":["常田大希"],"a":["King Gnu"]},"more than words":{"c":["塩塚モエカ"],"a":["羊文学"]},"逆夢":{"c":["常田大希"],"a":["King Gnu"]},"Deep down":{"c":["永澤和真"],"a":["玉井健二","百田留衣"]},"Brave Shine":{"c":["小山寿"],"a":["玉井健二","大西省吾"]},"偽顔":{"c":["川谷絵音"],"a":["川谷絵音"]},"All Alone With You":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"ハレンチ":{"c":["ちゃんみな","B.O"],"a":["B.O"]},"名前のない怪物":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"ずうっといっしょ！":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"Heaven and Hell":{"c":["Neuron"],"a":["Neuron"]},"Azalea":{"c":["米津玄師"],"a":["米津玄師","Yaffle"]},"夢をみせて":{"c":["中村未来"],"a":["Cö shu Nie"]},"対象a":{"c":["bermei.inazawa"],"a":["bermei.inazawa"]},"give it back":{"c":["中村未来"],"a":["Cö shu Nie"]},"The Story of Us":{"c":["向井太一","CELSIOR COUPE"],"a":["CELSIOR COUPE"]},"AIZO":{"c":["常田大希"],"a":["King Gnu"]},"TEST ME":{"c":["ちゃんみな"],"a":["Ryosuke \"Dr.R\" Sakai"]},"飛ぼうよ":{"c":["椎名林檎"],"a":["椎名林檎"]},"ロミオとシンデレラ":{"c":["doriko"],"a":["doriko"]},"硝子窓":{"c":["常田大希"],"a":["King Gnu"]},"My Body":{"c":["Neuron"],"a":["Neuron"]},"STYX HELIX":{"c":["MYTH & ROID"],"a":["MYTH & ROID"]},"華奢なリップfeat.ちゃんみな":{"c":["川谷絵音"],"a":["ジェニーハイ"]},"二時間だけのバカンスfeaturing 椎名林檎 -宇多田ヒカル":{"c":["宇多田ヒカル"],"a":["宇多田ヒカル"]},"Tiger":{"c":["Neuron"],"a":["Neuron"]},"心見":{"c":["堀江晶太"],"a":["堀江晶太"]},"きららかにうたえ":{"c":["松坂康司"],"a":["松坂康司"]},"微笑みの爆弾（Hohoemi no Bakudan）- 馬渡松子":{"c":["馬渡松子"],"a":["馬渡松子"]},"nowhere":{"c":["梶浦由記"],"a":["梶浦由記"]},"Light My Fire":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"小さきもの":{"c":["山移高寛"],"a":["山移高寛"]},"Dancing in the velvet moon":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)","中山真斗(Elements Garden)"]},"禁断のレジスタンス":{"c":["加藤裕介"],"a":["加藤裕介"]},"oblivious":{"c":["梶浦由記"],"a":["梶浦由記"]},"あなたがいることで":{"c":["Uru"],"a":["トオミヨウ"]},"WHITE REFLECTION":{"c":["高山みなみ"],"a":["永野椎菜","高山みなみ"]},"深い森":{"c":["D・A・I"],"a":["Do As Infinity","亀田誠治"]},"ガラス":{"c":["河村隆一"],"a":["河村隆一","中村哲"]},"Corruption":{"c":["Neuron"],"a":["Neuron"]},"残響ヴァンデラー":{"c":["れるりり"],"a":["れるりり"]},"めめしぃ":{"c":["すりぃ"],"a":["すりぃ"]},"僕らは今日も車の中":{"c":["林萌々子"],"a":["Hump Back"]},"身体は正直だって言ってんの":{"c":["式浦躁吾"],"a":["式浦躁吾"]},"あーあ。":{"c":["佐藤乃子"],"a":["佐藤乃子"]},"きかせたいのは":{"c":["理想論"],"a":["理想論"]},"あぁ、もう。":{"c":["石原慎也"],"a":["Saucy Dog"]},"プラネテス":{"c":["seiza"],"a":["seiza"]},"またねがあれば":{"c":["草野華余子"],"a":["草野華余子"]},"Bansoukou":{"c":["傘村トータ"],"a":["傘村トータ"]},"GAME OVER":{"c":["Sammy"],"a":["Sammy"]},"甘党":{"c":["Rak"],"a":["Rak"]},"ワレワレは宇宙人だ。":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"トートバッグ":{"c":["やしきん"],"a":["やしきん"]},"Do Well":{"c":["SIRUP","Mori Zentaro"],"a":["Mori Zentaro"]},"Blue Jeans":{"c":["ちゃんみな"],"a":["Ryosuke \"Dr.R\" Sakai"]},"飛ぶ時":{"c":["Vaundy"],"a":["Vaundy"]},"Cold Night":{"c":["ちゃんみな"],"a":["ちゃんみな"]},"lulu.":{"c":["大森元貴"],"a":["大森元貴"]},"不可幸力":{"c":["Vaundy"],"a":["Vaundy"]},"赤い洗礼":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"君の望み、君の願い":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"道化師ブランケット":{"c":["大沼パセリ"],"a":["大沼パセリ"]},"空爽パレット ver.】Sooda":{"c":["廉"],"a":["廉"]},"旅の途中 (Live":{"c":["吉良知彦"],"a":["吉良知彦"]},"臨界ダイバー":{"c":["うたたP"],"a":["うたたP"]},"ほしつなぎ":{"c":["一二三"],"a":["一二三"]},"君と見た色彩":{"c":["廉"],"a":["廉"]},"生活に落ちる":{"c":["牛肉","雄之助"],"a":["雄之助"]},"馥郁の街":{"c":["Misumi"],"a":["Misumi"]},"うわのそら":{"c":["傘村トータ"],"a":["傘村トータ"]},"眼裏の懐疑":{"c":["柊マグネタイト"],"a":["柊マグネタイト"]},"窓を開けて":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"少年漫画":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"空中散歩":{"c":["大沼パセリ"],"a":["大沼パセリ"]},"空より":{"c":["笹川真生"],"a":["笹川真生"]},"僕たちの群青":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"Tell Me":{"c":["Mori Zentaro","SIRUP"],"a":["Mori Zentaro"]},"たいたいな":{"c":["水野あつ"],"a":["水野あつ"]},"ハツコイソウ":{"c":["FLG4"],"a":["FLG4"]},"Dancer in the Dark":{"c":["有機酸"],"a":["有機酸"]},"twinkle night":{"c":["nyankobrq"],"a":["nyankobrq"]},"hp":{"c":["大沼パセリ"],"a":["大沼パセリ"]},"桜流し":{"c":["宇多田ヒカル","Paul Carter"],"a":["宇多田ヒカル","Paul Carter"]},"hazama":{"c":["Guiano"],"a":["Guiano"]},"さみしいひと":{"c":["傘村トータ"],"a":["傘村トータ"]},"メロイズム":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"罪と罰 (Reloaded)":{"c":["椎名林檎"],"a":["亀田誠治"]},"ひこうき雲":{"c":["荒井由実"],"a":["キャラメル・ママ"]},"ウワサのあの子":{"c":["くじら"],"a":["くじら"]},"COSMO":{"c":["笹川真生"],"a":["笹川真生"]},"自己愛主義天使":{"c":["笹川真生"],"a":["笹川真生"]},"ハネムーン":{"c":["一二三"],"a":["一二三"]},"星空オーケストラ":{"c":["水野あつ"],"a":["水野あつ"]},"ココロガール":{"c":["とあ"],"a":["とあ"]},"君が死んでも許してあげるよ":{"c":["れるりり"],"a":["れるりり"]},"ユメミ":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"サマータイムゴースト":{"c":["水野あつ"],"a":["水野あつ"]},"πανσπερμία":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"OOPARTS":{"c":["いよわ"],"a":["いよわ"]},"Lift Up":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"恋愛後遺症":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"SOPPY":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"ぼくたちの失敗":{"c":["森田童子"],"a":["石川鷹彦"]},"あなたのことをおしえて":{"c":["じん"],"a":["じん"]},"暗く黒く":{"c":["ACAね"],"a":["100回嘔吐","ZTMY"]},"九夏":{"c":["八王子P"],"a":["八王子P"]},"アポリア":{"c":["n-buna"],"a":["n-buna"]},"IMAWANOKIWA":{"c":["いよわ"],"a":["いよわ"]},"初恋":{"c":["村下孝蔵"],"a":["水谷公生"]},"プレイヤーわたし":{"c":["笹川真生"],"a":["笹川真生"]},"桜心中":{"c":["一二三"],"a":["一二三"]},"ラピスのお人形":{"c":["mothy"],"a":["mothy"]},"月輪迷宮":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"痛いの痛いの飛んでいけ":{"c":["TOOBOE"],"a":["TOOBOE"]},"福音":{"c":["wotaku"],"a":["wotaku"]},"愛属性":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"グレーゾーンにて。":{"c":["ツミキ"],"a":["ツミキ"]},"A Horny Money World ~伝説の夜~":{"c":["宝鐘マリン"],"a":["かめりあ"]},"糸":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"BLUE SIGNAL":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"この世界は美しい":{"c":["Guiano"],"a":["Guiano"]},"背景、夏に溺れる":{"c":["n-buna"],"a":["n-buna"]},"ユーフォーを見にいこう":{"c":["大森靖子"],"a":["大久保薫"]},"ありふれてたい":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"一世風靡":{"c":["真部脩一"],"a":["真部脩一"]},"一服":{"c":["ケンモチヒデフミ"],"a":["ケンモチヒデフミ"]},"閃光だった":{"c":["笹川真生"],"a":["笹川真生"]},"鏡写し":{"c":["笹川真生"],"a":["笹川真生"]},"kotowari":{"c":["笹川真生"],"a":["笹川真生"]},"ふかいです！":{"c":["笹川真生"],"a":["笹川真生"]},"いたいよ":{"c":["笹川真生"],"a":["笹川真生"]},"ぷれいや":{"c":["笹川真生"],"a":["笹川真生"]},"素的":{"c":["笹川真生"],"a":["笹川真生"]},"Do you feel":{"c":["笹川真生"],"a":["笹川真生"]},"夜に暇電":{"c":["笹川真生"],"a":["笹川真生"]},"巫女":{"c":["たかやん"],"a":["たかやん"]},"牢獄":{"c":["煮ル果実"],"a":["煮ル果実"]},"猛進":{"c":["たかやん"],"a":["Giga"]},"回向 -echo-":{"c":["一二三"],"a":["一二三"]},"Independent Red":{"c":["Feryquitous"],"a":["Feryquitous"]},"Golden":{"c":["Feryquitous"],"a":["Feryquitous"]},"コールドケース":{"c":["大沼パセリ"],"a":["大沼パセリ"]},"名も無き囚人":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"超惑星Xへの旅":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"in my words":{"c":["みきとP"],"a":["みきとP"]},"愛は衝動":{"c":["すりぃ"],"a":["すりぃ"]},"うちゅうのふしぎ":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"これはぼくたちの生存のあらすじ":{"c":["ボカロP"],"a":["ボカロP"]},"アイの夢限":{"c":["DECO*27"],"a":["tepe"]},"夢我夢中":{"c":["40mP"],"a":["40mP"]},"歌ってみた 】君が飛び降りるのならば":{"c":["Omoi"],"a":["Omoi"]},"歌ってみた 】パラレルラルラ":{"c":["夏代孝明"],"a":["夏代孝明"]},"歌ってみた 】ジレンマ":{"c":["DECO*27"],"a":["Rockwell"]},"歌ってみた 】メンタルチェンソー":{"c":["かいりきベア"],"a":["かいりきベア"]},"歌ってみた 】ホシアイ":{"c":["レフティーモンスターP"],"a":["レフティーモンスターP"]},"歌ってみた 】ELECT":{"c":["niki"],"a":["niki"]},"シンデレラボーイ":{"c":["石原慎也"],"a":["Saucy Dog"]},"もしも命が描けたら":{"c":["Ayase"],"a":["Ayase"]},"遠心力":{"c":["岩見陸"],"a":["ナナホシ管弦楽団"]},"社会距離":{"c":["40mP"],"a":["40mP"]},"二息歩行 (Reloaded)":{"c":["DECO*27"],"a":["DECO*27"]},"キリトリセン":{"c":["40mP"],"a":["40mP"]},"TEENAGE RIOT":{"c":["米津玄師"],"a":["米津玄師"]},"星が流れて":{"c":["奈須野新平"],"a":["奈須野新平"]},"星の数だけ":{"c":["三好啓太"],"a":["三好啓太"]},"Secret utopIA":{"c":["秋浦智裕"],"a":["設楽哲也"]},"BRIGHTEST WHITE":{"c":["丸山真由子"],"a":["丸山真由子"]},"FELICE":{"c":["丸山真由子"],"a":["清水武仁"]},"トライアングル":{"c":["구(原田篤)"],"a":["原田篤(Arte Refact)"]},"Song for You":{"c":["麻枝准"],"a":["MANYO"]},"君がのぞくレンズ":{"c":["渡辺翔"],"a":["渡辺翔"]},"未来模様":{"c":["전진(Q-MHz)"],"a":["Q-MHz"]},"Gemstones (琴乃 & さくらver.)":{"c":["PA-NON","さかいりょう"],"a":["さかいりょう"]},"友達だよ、いつの日も":{"c":["清竜人"],"a":["清竜人"]},"Moonlights":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"Searchlight":{"c":["渡辺翔"],"a":["eba"]},"クリスマスには君と":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"Question":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"月ノヒカリ":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"君の残り香":{"c":["利根川貴之","坂和也"],"a":["坂和也 & Wicky.Recordings"]},"réaliser":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Magical Melody":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Victoire":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Fantastique!":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Brand new day":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"最高優美ロンリネス":{"c":["Q-MHz"],"a":["Q-MHz"]},"Shiny Mystery Tour":{"c":["Q-MHz"],"a":["Q-MHz"]},"情熱だけで生きてみろ":{"c":["Q-MHz"],"a":["Q-MHz","大和"]},"Bang Bang":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"Top of the Tops":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"So What?":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"Blow Up":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"Night Pool":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"Bittersweet Echo":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"What is my LIFE?":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"Pray for love":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"Tale of Primavera":{"c":["白戸佑輔(Dream Monster)"],"a":["白戸佑輔(Dream Monster)"]},"いつか碧":{"c":["塚田耕平"],"a":["塚田耕平"]},"イキタクナイevery day":{"c":["要田健"],"a":["要田健"]},"ジリティックBEGINNER":{"c":["姉田ウ夢ヤ"],"a":["姉田ウ夢ヤ"]},"不確定性☆COSMIC MOVEMENT":{"c":["姉田ウ夢ヤ"],"a":["姉田ウ夢ヤ"]},"NEO STREAM":{"c":["渡辺未来"],"a":["渡辺未来"]},"LOVE! THUNDER GLOW":{"c":["サカノウエヨースケ"],"a":["渡辺未来"]},"放課後オーバーフロウ":{"c":["菅野よう子"],"a":["菅野よう子"]},"ユニバーサル・バニー":{"c":["菅野よう子"],"a":["菅野よう子"]},"爛々スペシャルボーナスメドレー":{"c":["菅野よう子"],"a":["菅野よう子"]},"Two of Us (吾妻凛)":{"c":["Haggy Rock(Dream Monster)","佐藤厚仁(Dream Monster)"],"a":["佐藤厚仁"]},"小さな想い (吾妻凛)":{"c":["橘亮祐","篠崎あやと"],"a":["篠崎あやと","橘亮祐"]},"虹の彼方へ (リリス)":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"はなまるの方程式 (朝日奈みらい)":{"c":["高木洋"],"a":["高木洋"]},"夢までふたり乗り♪ (朝日奈みらい)":{"c":["Nostalgic Orchestra"],"a":["Nostalgic Orchestra"]},"紅、華を咲かせて (桑名江ver.) (桑名江)":{"c":["전진(睦月周平)"],"a":["睦月周平"]},"華よ心々から (桑名江ver.) (桑名江)":{"c":["設楽哲也"],"a":["設楽哲也"]},"闇を切り咲く華 (桑名江ver.) (桑名江)":{"c":["宮崎誠"],"a":["宮崎誠"]},"My Dream (直樹美紀)":{"c":["大久保薫"],"a":["大久保薫"]},"Little Secret (雁谷崎芳乃)":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"Sprout (雁谷崎芳乃)":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"雪の街と空想タイムマシン (七橋御乃梨)":{"c":["高田龍一(MONACA)"],"a":["高田龍一(MONACA)"]},"ポプラと僕らのヒストリー (七橋御乃梨)":{"c":["広川恵一(MONACA)"],"a":["広川恵一(MONACA)"]},"MEMORIES (勝木翼)":{"c":["黒須克彦"],"a":["黒須克彦"]},"大衆性ロマン":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"NAMED":{"c":["堀江晶太"],"a":["堀江晶太"]},"オーバーハレイション！":{"c":["やしきん"],"a":["やしきん"]},"平行線":{"c":["さユり"],"a":["さユり","江口亮"]},"プリズムシェイク":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"We are Travelers":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"カクテルライツ":{"c":["すりぃ"],"a":["すりぃ"]},"Wagamama Conflict":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"永遠の場所":{"c":["草野華余子"],"a":["草野華余子"]},"Blazing Out":{"c":["ゆよゆっぺ"],"a":["ゆよゆっぺ"]},"Awaken Now":{"c":["R・O・N"],"a":["R・O・N"]},"Crazy Rock Girl":{"c":["みきとP"],"a":["みきとP"]},"Crossed Identity":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"Shout My Life":{"c":["草野華余子"],"a":["堀江晶太"]},"スーパースター":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"未完成アンチテーゼ":{"c":["Q-MHz"],"a":["Q-MHz"]},"ナミダアステリズム":{"c":["堀江晶太"],"a":["堀江晶太"]},"ヒカリヘ":{"c":["miwa"],"a":["Naoki-T"]},"STAY REAL":{"c":["草野華余子"],"a":["草野華余子"]},"Lightning":{"c":["ゆよゆっぺ"],"a":["ゆよゆっぺ"]},"聲":{"c":["天野月"],"a":["戸倉弘智"]},"星空のglitter":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Brave it out":{"c":["R・O・N"],"a":["R・O・N"]},"Survivor":{"c":["田辺トシノ"],"a":["田辺トシノ"]},"せめて、青く":{"c":["みきとP"],"a":["みきとP"]},"伝播、転生、オルタナティブ":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"餞":{"c":["buzzG"],"a":["buzzG"]},"Admit (VESPERBELL ヨミ ＆ HACHI）":{"c":["海野水玉"],"a":["海野水玉"]},"emergence":{"c":["KENT"],"a":["KENT"]},"Bell Ringer":{"c":["KENT"],"a":["KENT"]},"RISE":{"c":["KENT"],"a":["KENT"]},"RISE (2022 ver.)":{"c":["KENT"],"a":["KENT"]},"RAMPAGE":{"c":["KENT"],"a":["KENT"]},"ホログラム":{"c":["亀ير竜太"],"a":["NICO Touches the Walls"]},"VERSUS":{"c":["KENT"],"a":["KENT"]},"Imperfect":{"c":["大石昌良"],"a":["大石昌良"]},"Revelation":{"c":["KENT"],"a":["KENT"]},"EX MACHINA":{"c":["KENT"],"a":["KENT"]},"メイビス":{"c":["KENT"],"a":["KENT"]},"或いは虚空に夢を視る":{"c":["KENT"],"a":["KENT"]},"ebb and flow":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"lull ～そして僕らは～":{"c":["中沢伴行"],"a":["中沢伴行","尾崎武士"]},"楽園PROJECT":{"c":["奥井雅美"],"a":["大久保薫"]},"secret arms":{"c":["渡辺翔"],"a":["y0c1e"]},"季節のシャッター":{"c":["折戸伸治"],"a":["高瀬一矢"]},"君に会いに行こう [Kimi ni ai ni ikou]":{"c":["中沢伴行"],"a":["中沢伴行"]},"♡こゆび姫♡":{"c":["y0c1e"],"a":["y0c1e"]},"Party time!":{"c":["黒須克彦"],"a":["黒須克彦"]},"As for me":{"c":["中沢伴行"],"a":["中沢伴行"]},"Recall":{"c":["井内舞子"],"a":["井内舞子"]},"夜明け Brand New Days":{"c":["堀江晶太"],"a":["堀江晶太"]},"走れ、走れ":{"c":["堀江晶太"],"a":["堀江晶太"]},"閃光Believer":{"c":["堀江晶太"],"a":["堀江晶太"]},"シンデレラじゃいられない":{"c":["堀江晶太"],"a":["堀江晶太"]},"バキバキ":{"c":["堀江晶太"],"a":["堀江晶太"]},"ベイビーステップ":{"c":["堀江晶太"],"a":["堀江晶太"]},"ミチシルベ":{"c":["堀江晶太"],"a":["堀江晶太"]},"光ったコインが示す方":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Toward the shining coin":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"常識外れヒューマン":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Unconventional Human":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"キュンアピ":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Kyun-Appeal":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Dream's Top Star!!":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"Dream’s Top Star!!":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"YABABA！":{"c":["Kijibato"],"a":["Kijibato"]},"My “I”":{"c":["田仲圭太"],"a":["TOPICS.LAB"]},"Release Sigh (天乃リリサ)":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"つまさきMovin' on!":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Little smile":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"一冊のアロー":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"僕らのWatercolor":{"c":["母里治樹(Elements Garden)"],"a":["母里治樹(Elements Garden)"]},"Unreal Creation!":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"不思議なプリズム":{"c":["藤田淳平(Elements Garden)"],"a":["藤田淳平(Elements Garden)"]},"はよ、New World.":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"ふゆびより":{"c":["佐々木恵梨","中村ヒロ"],"a":["中村ヒロ"]},"はるのとなり":{"c":["佐々木恵梨","中村ヒロ"],"a":["中村ヒロ"]},"Ring of Fortune":{"c":["千葉\"naotyu-\"直樹"],"a":["千葉\"naotyu-\"直樹"]},"ロッホと旅人":{"c":["佐々木恵梨","中村ヒロ"],"a":["中村ヒロ"]},"Seabird Song":{"c":["佐々木恵梨","中村ヒロ"],"a":["中村ヒロ"]},"鼓動ふたつ鳴る前に":{"c":["佐々木恵梨","中村ヒロ"],"a":["中村ヒロ"]},"エニグマはAの夢を見たか":{"c":["minato"],"a":["G'n-"]},"cue.":{"c":["minato"],"a":["G'n-"]},"True meaning of...":{"c":["minato"],"a":["G'n-"]},"箱庭シンドローム":{"c":["minato"],"a":["G'n-"]},"Prey":{"c":["minato"],"a":["G'n-"]},"PERSONA":{"c":["minato"],"a":["G'n-"]},"Awakening the World":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"恋":{"c":["堀江晶太"],"a":["堀江晶太"]},"Falling heaven's now":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"TOON→GO→ROUND!":{"c":["俊龍"],"a":["大久保薫"]},"Defection":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"危ないくらいに熱くなれ":{"c":["黒須克彦"],"a":["黒須克彦"]},"戦場の華":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"君のせいで愛してる":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"背負う者 -リリックMV-":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"冒険のVLOG":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"ノスタルジックレインフォール":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"今日もサクラ舞う暁に":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"月夜ノ空 full ver.":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"Red Star":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"ReStart Line":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"キミの友達":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"I.M.":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"皐月の風":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"夕暮れリフレイン":{"c":["光増ハジメ(FirstCall)"],"a":["光増ハジメ(FirstCall)"]},"Vermillion":{"c":["石川智晶"],"a":["西田マサラ"]},"谺、碧海、那由多を見定むアグラフォノスの詩篇":{"c":["류(電気)"],"a":["電気"]},"サクラメイキュウ":{"c":["分島花音"],"a":["千葉\"naotyu-\"直樹"]},"StarRingChild":{"c":["澤野弘之"],"a":["澤野弘之"]},"銀の龍の背に乗って":{"c":["中島みゆき"],"a":["瀬尾一三"]},"夢の島思念公園":{"c":["平沢進"],"a":["平沢進"]},"アヤノの幸福理論":{"c":["じん"],"a":["じん"]},"【ハミダシクリエイティブ凸 詩桜ED】恋影【公式・FULL】ボーカル：朝ノ瑠璃":{"c":["堀江晶太"],"a":["堀江晶太"]},"my life":{"c":["朝ノ瑠璃"],"a":["周防パトラ"]},"Moonflower":{"c":["周防パトラ"],"a":["周防パトラ"]},"私、C君が好き":{"c":["周防パトラ"],"a":["周防パトラ"]},"舞風":{"c":["朝ノ瑠璃"],"a":["朝ノ瑠璃"]},"アンダンテ":{"c":["朝ノ瑠璃"],"a":["朝ノ瑠璃"]},"鮫":{"c":["天野月子"],"a":["戸倉弘智"]},"紫電一閃":{"c":["草野華余子"],"a":["草野華余子"]},"Outsider":{"c":["Eve"],"a":["Numa"]},"蝶":{"c":["天野月子"],"a":["戸倉弘智"]},"妄想感傷代償連盟":{"c":["DECO*27"],"a":["emon(Tes.)"]},"Reveal":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"No More Cry":{"c":["松隈ケンタ"],"a":["SCRAMBLES"]},"明日と君とソラ":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"oyasumi":{"c":["MIMI"],"a":["MIMI"]},"DAISUKIパレード":{"c":["やしきん"],"a":["やしきん"]},"光が満ちる":{"c":["堀江晶太"],"a":["堀江晶太"]},"とっておき":{"c":["40mP"],"a":["40mP"]},"ちっぽけな勇者":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"ココロノオト":{"c":["みきとP"],"a":["みきとP"]},"いとをかし":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"無地":{"c":["Feryquitous"],"a":["Feryquitous"]},"Spotlight":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"maquia":{"c":["Feryquitous"],"a":["Feryquitous"]},"銀色の月":{"c":["Feryquitous"],"a":["Feryquitous"]},"ミライゴト":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Dance w/z my heart":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"Voiceless Mind":{"c":["Feryquitous"],"a":["Feryquitous"]},"Stray & Stay":{"c":["R・O・N"],"a":["R・O・N"]},"Skyfall":{"c":["Adele","Paul Epworth"],"a":["Paul Epworth"]},"カノン":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"紫色の向日葵":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"敗走":{"c":["傘村トータ"],"a":["傘村トータ"]},"Honeycomb Summer":{"c":["C.ON"],"a":["C.ON"]},"日本の夏":{"c":["平田義久"],"a":["平田義久"]},"福寿草":{"c":["ぐちり"],"a":["ぐちり"]},"ALL IN":{"c":["Bang Chan","Changbin","HAN","J.Y. Park"],"a":["J.Y. Park","Lee Hae Sol"]},"死別":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"ちっちゃな私":{"c":["マサラダ"],"a":["マサラダ"]},"砂時計":{"c":["徳永英明"],"a":["坂بس昌之"]},"リードコントロール":{"c":["なるみや"],"a":["なるみや"]},"Lead Control":{"c":["なるみや"],"a":["なるみや"]},"Dear my fairy":{"c":["KOTONOHOUSE"],"a":["KOTONOHOUSE"]},"ふわり":{"c":["MIMI"],"a":["MIMI"]},"傷つく誰かの心を守ることができたなら":{"c":["知知(miwa)"],"a":["qurosawa"]},"FOCUS":{"c":["向井太一","CELSIOR COUPE"],"a":["CELSIOR COUPE"]},"夢幻":{"c":["MY FIRST STORY","HYDE"],"a":["MY FIRST STORY","CHOKKAKU"]},"Luminous":{"c":["渡辺翔"],"a":["湯浅篤"]},"야화":{"c":["박효신","정재일"],"a":["정재일"]},"推し変なんて許さない！":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"次元通信":{"c":["夏代孝明"],"a":["夏代孝明"]},"恋しているのさ":{"c":["内緒のピアス"],"a":["内緒のピアス"]},"クネクネ (Wiggle Wiggle)":{"c":["すりぃ"],"a":["すりぃ"]},"天国":{"c":["大森元貴"],"a":["大森元貴"]},"初恋日記":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"ジェリーフィッシュ":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"절대적대완전싫어":{"c":["メドミア"],"a":["メドミア"]},"ミッドナイト・リフレクション":{"c":["星街すいせい","Taku Inoue"],"a":["Taku Inoue"]},"Sacrifice":{"c":["まふまふ"],"a":["まふまふ"]},"風のたより":{"c":["Islet"],"a":["Islet"]},"ジェニ":{"c":["柊キライ"],"a":["柊キライ"]},"Find Me":{"c":["miolly"],"a":["miolly"]},"不屈のファンファーレ":{"c":["Gom"],"a":["HoneyWorks"]},"飴色の微熱":{"c":["夏代孝明"],"a":["夏代孝明"]},"彼氏になってよ。":{"c":["清水依与吏"],"a":["back number"]},"ねがいごと":{"c":["波羅ノ鬼"],"a":["波羅ノ鬼"]},"大正浪漫":{"c":["Ayase"],"a":["Ayase"]},"花火":{"c":["aiko"],"a":["島田昌典"]},"またね":{"c":["吉田美和"],"a":["中村正人"]},"自堕楽/こめだわら":{"c":["こめだわら"],"a":["こめだわら"]},"うっせぇわ/Ado":{"c":["syudou"],"a":["syudou"]},"金木犀/くじら":{"c":["くじら"],"a":["くじら"]},"my crush/香椎モイミ":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"いらないもの/キタニタツヤ×なとり":{"c":["キタニタツヤ","なとり"],"a":["キタニタツヤ","なとり"]},"デビデビデビット":{"c":["すりぃ"],"a":["すりぃ"]},"ハーモニー カバー 羊羊":{"c":["Kokia"],"a":["Kokia"]},"nuit カバー 羊羊":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"Supernatural カバー 羊羊":{"c":["Pharrell Williams","250"],"a":["250"]},"Complicated カバー 羊羊":{"c":["Avril Lavigne","The Matrix"],"a":["The Matrix"]},"魔女裁判":{"c":["一二三"],"a":["一二三"]},"猿芝居":{"c":["なとり"],"a":["なとり"]},"A4。‐ Oh...":{"c":["A4。"],"a":["A4。"]},"クィホーティ":{"c":["志津"],"a":["志津"]},"テレパシ":{"c":["DECO*27"],"a":["tepe"]},"スタンチク":{"c":["煮ル果実"],"a":["煮ル果実"]},"ノルカ／／ソルカ":{"c":["666"],"a":["666"]},"ねむるまち (くじら)":{"c":["くじら"],"a":["くじら"]},"Love wins all (IU)":{"c":["서동환(Seo Dong Hwan)"],"a":["서동환(Seo Dong Hwan)"]},".今好きになる。":{"c":["shito"],"a":["HoneyWorks"]},"今好きになる。":{"c":["shito"],"a":["HoneyWorks"]},"プレイ (Giga )":{"c":["Giga"],"a":["Giga"]},"PLAY (Giga -プレイ)":{"c":["Giga"],"a":["Giga"]},"デーモンロード/Kanaria":{"c":["Kanaria"],"a":["Kanaria"]},"비행정 [飛行艇":{"c":["常田大希"],"a":["King Gnu"]},"가짜 얼굴(yama)":{"c":["川谷絵音"],"a":["川谷絵音"]},"青い珊瑚礁":{"c":["小田裕一郎"],"a":["大村雅朗"]},"花時計 piano arrange":{"c":["ねこぼーろ"],"a":["ねこぼーろ"]},"解けない夏":{"c":["Aqu3ra"],"a":["Aqu3ra"]},"No Logic":{"c":["ジミーサムP"],"a":["ジミーサムP"]},"ジャガーノート":{"c":["夏代孝明"],"a":["夏代孝明"]},"HALO":{"c":["れるりり"],"a":["れるりり"]},"夏はぐれ 〖Official Music Video〗":{"c":["しほ"],"a":["しほ"]},"1/6 -out of the gravity-":{"c":["ぼーかりおどP"],"a":["ぼーかりおどP"]},"馬鹿は死なないと治らない":{"c":["ちいたな"],"a":["ちいたな"]},"main actor":{"c":["美波"],"a":["美波"]},"Kaihyou（Natsunose）/ 月-Tsuki-":{"c":["夏野瀬"],"a":["夏野瀬"]},"As I Love You（MIMI）/ 月-Tsuki-":{"c":["MIMI"],"a":["MIMI"]},"夏霞":{"c":["あたらよ"],"a":["あたらよ"]},"What Call This Day ?":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"What Call This Day?":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"一寸の赤":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"藍を見つけて":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"嫌いにさせて":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"雪は何色":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"ヒロインは平均以下。":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"ダミーロマンス":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"透明夜(feat.MIMI)":{"c":["MIMI"],"a":["MIMI"]},"悪魔の踊り方":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"死んでしまったのだろうか":{"c":["Guiano"],"a":["Guiano"]},"bin/猫アレルギー @Coverd":{"c":["猫アレルギー"],"a":["猫アレルギー"]},"とても素敵な六月でしたを歌いました":{"c":["Eight"],"a":["Eight"]},"Ghost of a smile":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"Time after time ~花舞う街で~":{"c":["大野愛果"],"a":["Cybersound"]},"ディナーベル":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"I beg you":{"c":["梶浦由記"],"a":["梶浦由記"]},"ひだまりのよる":{"c":["MIMI"],"a":["MIMI"]},"祝福 - from CrosSing":{"c":["Ayase"],"a":["Ayase"]},"おやすみモノクローム [ Full ] - Islet":{"c":["Islet"],"a":["Islet"]},"ツクヨミステップ":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"キラースパイダー":{"c":["かいりきベア"],"a":["かいりきベア"]},"ユメハミ":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"花に風":{"c":["バルーン"],"a":["バルーン"]},"ケムニマク":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"リンネ":{"c":["ハチ"],"a":["ハチ"]},"メルヘンデビュー":{"c":["ARM(IOSYS)"],"a":["ARM(IOSYS)"]},"Love Cheat!":{"c":["柏森進"],"a":["柏森進"]},"Love Cheat！":{"c":["柏森進"],"a":["柏森進"]},"Let Me Be With You":{"c":["北川勝利"],"a":["北川勝利"]},"◣きみだけは。- 夏代孝明":{"c":["夏代孝明"],"a":["夏代孝明"]},"うちゅうひこうしのうた":{"c":["菅野よう子"],"a":["菅野よう子"]},"とんとんまーえ！(쿵쿵 앞-으로!)":{"c":["さつき が てんこもり"],"a":["さつき が てんこもり"]},"君にルムウム":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"バニラソルト":{"c":["Funta7"],"a":["Funta7"]},"僕たちはまだ世界を知らない":{"c":["純市","有感覚"],"a":["有感覚"]},"Life Is Tasty!":{"c":["やしきん"],"a":["やしきん"]},"桜ノ雨":{"c":["halyosy"],"a":["halyosy"]},"死ぬとき死ねばいい 【歌ってみた】 Alfakyun. - I should die when I die":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"Our sympathy":{"c":["睦月周平"],"a":["睦月周平"]},"Dokie Doggy Night":{"c":["れるりり"],"a":["れるりり"]},"HERO」Full.Ver":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"いっせーのーで":{"c":["MIMI"],"a":["MIMI"]},"アナタサマ":{"c":["かいりきベア"],"a":["かいりきベア"]},"陽キャJKに憧れる陰キャJKの歌":{"c":["音莉飴"],"a":["MARUMOCHI"]},"真生活「ねぇねぇ話をしてよ」":{"c":["案山子"],"a":["案山子"]},"Ⅿyra":{"c":["Tani Yuuki"],"a":["Tani Yuuki"]},"私が明日死ぬなら":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"ドーナドーナのうた":{"c":["Shade"],"a":["Shade"]},"命ばっかり を":{"c":["ぬゆり"],"a":["ぬゆり"]},"嘘の火花":{"c":["谷口尚久"],"a":["谷口尚久"]},"フタリボシ":{"c":["40mP"],"a":["40mP"]},"ツギハギスタッカート":{"c":["とあ"],"a":["とあ"]},"イガク":{"c":["原口沙輔"],"a":["原口沙輔"]},"ホントノ":{"c":["サツキ"],"a":["サツキ"]},"ねこの厭世観":{"c":["すりぃ"],"a":["すりぃ"]},"ノーギフテッド":{"c":["カノエラナ"],"a":["カノエラナ"]},"Synchrogazer":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"WON'T BE LONG":{"c":["Bro.KORN"],"a":["Bro.KORN"]},"朝まで踊ろう":{"c":["浜口庫之助"],"a":["寺内タケシ"]},"懐色、虚色 / Teary Planet":{"c":["Teary Planet"],"a":["Teary Planet"]},"ありあ / MIMI":{"c":["MIMI"],"a":["MIMI"]},"ノスタルジック・ブルー / Aqu3ra":{"c":["Aqu3ra"],"a":["Aqu3ra"]},"ローカル線 / ____ natural":{"c":["____natural"],"a":["____natural"]},"カタオモイ - from CrosSing":{"c":["内澤崇仁"],"a":["玉井健二","飛内将大"]},"【OP】『GINKA』":{"c":["松本文紀"],"a":["松本文紀"]},"102号室のシグナル":{"c":["敷嶋てとら"],"a":["敷嶋てとら"]},"スマトラ警備隊":{"c":["相対性理論"],"a":["相対性理論"]},"サラマンダー":{"c":["DECO*27"],"a":["Rockwell"]},"SUMMER SONG":{"c":["YUI"],"a":["northa+"]},"憂、燦々":{"c":["尾崎世界観"],"a":["クリープハイプ"]},"うるわしきひと":{"c":["水野良樹"],"a":["江口亮"]},"琥珀色の街、上海蟹の朝":{"c":["岸田繁"],"a":["くるり"]},"僕は初音ミクとキスをした":{"c":["みきとP"],"a":["みきとP"]},"地獄でなぜ悪い":{"c":["星野源"],"a":["星野源"]},"ひかげぼっこ":{"c":["和田たけあき(くらげP)"],"a":["和田たけあき(くらげP)"]},"Reply – kz(livetune)":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"夢をみる島 – yuigot":{"c":["yuigot"],"a":["yuigot"]},"竹取オーバーナイトセンセーション – HoneyWorks":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"瞬間、シンフォニー。 – 40mP":{"c":["40mP"],"a":["40mP"]},"ray (超かぐや姫！ Version)":{"c":["藤原基央"],"a":["BUMP OF CHICKEN"]},"Tell Your World – kz":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"トリノコシティ – 40mP":{"c":["40mP"],"a":["40mP"]},"ロンリーユニバース – Aqu3ra":{"c":["Aqu3ra"],"a":["Aqu3ra"]},"ビビっとラブ 歌って踊ってみた【にじさんじ/東堂コハク":{"c":["まふまふ"],"a":["まふまふ"]},"花を唄う":{"c":["シノ"],"a":["シノ"]},"歌ってみた | 人間みたいね":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"歌ってみた | ミラーチューン":{"c":["ACAね"],"a":["100回嘔吐","ZTMY"]},"Habit":{"c":["Nakajin"],"a":["SEKAI NO OWARI"]},"アイデア":{"c":["星野源"],"a":["星野源"]},"帰り道は遠回りしたくなる":{"c":["渡邉俊彦"],"a":["渡邉俊彦","早川博隆"]},"ラストコンティニュー":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"【歌って踊ってみた】恋（3Dお披露目LIVE ダンスVer）【にじさんじ":{"c":["星野源"],"a":["星野源"]},"圧 倒 的 存 在 感":{"c":["立秋"],"a":["立秋"]},"君が飛び降りるのならば - Omoi":{"c":["Omoi"],"a":["Omoi"]},"ラプラスショコラ - Kai":{"c":["Kai"],"a":["Kai"]},"僕なんかいなくても - ピノキオピー":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"昔は好きでした - 青谷":{"c":["青谷"],"a":["青谷"]},"飛ぶ時 - Vaundy / Cover:焔魔るり":{"c":["Vaundy"],"a":["Vaundy"]},"두근어질 (큐 큐라링)":{"c":["いよわ"],"a":["いよわ"]},"굿바이 선언":{"c":["Chinozo"],"a":["Chinozo"]},"베텔기우스":{"c":["優里"],"a":["CHIMERAZ"]},"겨울의 선물 (冬のプレゼント)":{"c":["もさを。"],"a":["もさを。"]},"너에게 메롱(一二三)":{"c":["一二三"],"a":["一二三"]},"Henceforth":{"c":["Orangestar"],"a":["Orangestar"]},"경화수월(鏡花水月)":{"c":["まふまふ"],"a":["まふまふ"]},"주름맞추기 (しわあわせ":{"c":["Vaundy"],"a":["Vaundy"]},"︎走馬灯で会えたなら(yugu)":{"c":["yugu"],"a":["yugu"]},"︎夏空とコントレイル(ラテルネ)":{"c":["ラテルネ"],"a":["ラテルネ"]},"︎マフィア(MAFIA)(wotaku)":{"c":["wotaku"],"a":["wotaku"]},"さよならだけが人生だ":{"c":["伊東歌詞太郎"],"a":["ゆりん"]},"ドライフラワー":{"c":["優里"],"a":["CHIMERAZ"]},"車輪の唄":{"c":["藤原基央"],"a":["BUMP OF CHICKEN"]},"3月9日":{"c":["藤巻亮太"],"a":["レミオロメン"]},"メリュー(AcousticArrange)":{"c":["n-buna"],"a":["n-buna"]},"感情のピクセル":{"c":["岡崎体育"],"a":["岡崎体育"]},"アユミ☆マジカルショータイム":{"c":["キノシタ"],"a":["キノシタ"]},"花が落ちたので、":{"c":["一二三"],"a":["一二三"]},"lllトゥルティンアンテナlll 歌ってみた。":{"c":["レタスP"],"a":["レタスP"]},"悪魔のキッス":{"c":["전진(戦慄かなの)","かてぃ"],"a":["サクライケンタ"]},"気まぐれ屋のウェザーリポート":{"c":["Orangestar"],"a":["Orangestar"]},"フロムトーキョー":{"c":["夏代孝明"],"a":["渡辺拓也"]},"Wake-up Call～目覚めるとき～":{"c":["馬飼野康二"],"a":["大久保薫"]},"宵々古今 歌って踊ってみた 【にじさんじ/山神カルタ":{"c":["Reol","Giga"],"a":["Giga"]},"サラマンダー 歌って踊ってみた 【にじさんじ/山神カルタ":{"c":["DECO*27"],"a":["Rockwell"]},"バグ":{"c":["かいりきベア"],"a":["かいりきベア"]},"Iなんです":{"c":["れるりり"],"a":["れるりり"]},"地獄先生":{"c":["石風呂"],"a":["石風呂"]},"うみたがり":{"c":["MARETU"],"a":["MARETU"]},"DAYBREAKFRONTLINE":{"c":["Orangestar"],"a":["Orangestar"]},"DAYBREAK FRONTLINE (セレナーデ・オックスブラッド Cover Ver.)":{"c":["Orangestar"],"a":["Orangestar"]},"回る空うさぎ":{"c":["Orangestar"],"a":["Orangestar"]},"こちら、幸福安心委員会です。- うたたP":{"c":["うたたP"],"a":["うたたP"]},"いかないで":{"c":["想太"],"a":["想太"]},"アブノーマリティ・ダンシンガール":{"c":["ぐちり"],"a":["ぐちり"]},"1/2 - from CrosSing":{"c":["川本真琴"],"a":["石川鉄男"]},"星間飛行 (ランカ・リー)":{"c":["菅野よう子"],"a":["菅野よう子"]},"星間飛行～Freyja Ver.～ (フレイア・ヴィオン)":{"c":["菅野よう子"],"a":["菅野よう子"]},"僕らの戦場～Freyja Solo Edition～ (フレイア・ヴィオン)":{"c":["加藤裕介"],"a":["加藤裕介"]},"奏 (かなで) (藤宮香織)":{"c":["大橋卓弥","常田真太郎"],"a":["百石元"]},"いってらっしゃい/ヒグチアイ":{"c":["ヒグチアイ"],"a":["Yaffle"]},"SHISHAMO /「君の隣にいたいから":{"c":["宮崎朝子"],"a":["SHISHAMO"]},"風のゆくえ":{"c":["秦基博"],"a":["トオミヨウ"]},"バレリーコ":{"c":["みきとP"],"a":["みきとP"]},"銀河録":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"【胖达×Akie秋绘】コイワズライ":{"c":["Aimer","飛内将大"],"a":["玉井健二","飛内将大"]},"Weight of the World/壊レタ世界ノ歌 - from CrosSing":{"c":["岡部啓一(MONACA)"],"a":["岡部啓一(MONACA)"]},"カルテNo.2222":{"c":["かいりきベア"],"a":["かいりきベア"]},"ツインズ":{"c":["CHiCO","Gom"],"a":["HoneyWorks"]},"ブルーアンビエンス (feat. asmi)":{"c":["大森元貴"],"a":["大森元貴"]},"フラッター現象の顛末と単一指向性の感情論":{"c":["TOMOSUKE"],"a":["TOMOSUKE"]},"虚空と光明のディスクール":{"c":["TOMOSUKE"],"a":["TOMOSUKE"]},"１＋１でQ.E.D.！！":{"c":["まろん(IOSYS)"],"a":["まろん(IOSYS)"]},"夏祭り":{"c":["破矢ジンタ"],"a":["破矢ジンタ"]},"ファンサ":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"〚 歌ってみた 〛パラソルサイダー〚 にじさんじ":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"浪漫飛行 (河北智恵)":{"c":["米米CLUB"],"a":["米米CLUB"]},"エンヴィキャットウォーク":{"c":["トーマ"],"a":["トーマ"]},"ふっかつのじゅもん":{"c":["片岡健太"],"a":["sumika"]},"気まぐれメルシィ":{"c":["八王子P"],"a":["八王子P"]},"絶え間なく藍色":{"c":["獅子志司"],"a":["獅子志司"]},"八月の夜":{"c":["すぅ","クボナオキ"],"a":["クボナオキ"]},"少女交響曲":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"寝起きヤシの木":{"c":["ゆこぴ"],"a":["ゆこぴ"]},"瞬間センチメンタル":{"c":["SCANDAL","田鹿祐一"],"a":["川口圭太"]},"カンタレラ":{"c":["黒うさP"],"a":["黒うさP"]},"エメラルドシティ/TOKOTOKO（西沢さんP）":{"c":["TOKOTOKO"],"a":["TOKOTOKO"]},"ツキミソウ(Novelbright)":{"c":["竹中雄大","沖聡次郎"],"a":["Novelbright"]},"ブルーウォーター":{"c":["井上ヨシマサ"],"a":["ジョー・リノイエ"]},"深海の孤独":{"c":["梶浦由記"],"a":["梶浦由記"]},"more than words（Original Song by 羊文学）":{"c":["塩塚モエカ"],"a":["羊文学"]},"DREAMER":{"c":["BOUNCEBACK"],"a":["ats-"]},"Cagayake!GIRLS":{"c":["Tom-H@ck"],"a":["Tom-H@ck"]},"daze":{"c":["じん"],"a":["じん"]},"終わらないメロディーを歌いだしました。":{"c":["ナカムラヒロシ"],"a":["i-dep"]},"喜劇":{"c":["星野源"],"a":["星野源"]},"真赤な誓い":{"c":["福山芳樹"],"a":["河野陽吾"]},"フィクション":{"c":["片岡健太"],"a":["sumika"]},"絶対彼女":{"c":["大森靖子"],"a":["ミト"]},"心という名の不可解":{"c":["まふまふ"],"a":["まふまふ"]},"雨音ノイズ":{"c":["40mP"],"a":["40mP"]},"ドレミファロンド":{"c":["40mP"],"a":["40mP"]},"ミライチズ":{"c":["MeMe"],"a":["MeMe"]},"メランコリック (地原舞)":{"c":["Junky"],"a":["Junky"]},"Destin Histoire":{"c":["色白(ryo)"],"a":["色白"]},"Sing My Pleasure":{"c":["神前暁(MONACA)"],"a":["神前暁(MONACA)"]},"Winter Bells":{"c":["徳永暁人"],"a":["徳永暁人"]},"trust you":{"c":["MARKIE"],"a":["Jin Nakamura"]},"God Save The Girls":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"TSUNAMI":{"c":["桑田佳祐"],"a":["サザンオールスターズ"]},"花喰み":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン"]},"MESMERIZER":{"c":["サツキ"],"a":["サツキ"]},"Tiny Stars‐ 澁谷かのん、唐 可可":{"c":["秋浦智裕"],"a":["秋浦智裕"]},"Crazy Party Night～ぱんぷきんの逆襲～":{"c":["中田ヤスタカ"],"a":["中田ヤスタカ"]},"ブルー・フィールド":{"c":["Heart's Cry"],"a":["Heart's Cry"]},"逆さまの蝶":{"c":["SNoW","山野英明"],"a":["山野英明","藤田謙一"]},"I Really Want to Stay at Your House":{"c":["Rosa Walton"],"a":["Hallie Coggins","Rosa Walton"]},"I Really Want to Stay At Your House (Arrange ver.)":{"c":["Rosa Walton"],"a":["Hallie Coggins","Rosa Walton"]},"Agape":{"c":["岡崎律子"],"a":["西脇辰弥"]},"Last Surprise":{"c":["目黒将司"],"a":["目黒将司"]},"天壌を翔る者たち":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"I SAY YES":{"c":["坂本裕介"],"a":["新井理生"]},"DOGLAND":{"c":["薔薇園アヴ"],"a":["PEOPLE 1"]},"Hero too":{"c":["林ゆうき"],"a":["林ゆうき"]},"Clover wish":{"c":["渡辺翔"],"a":["倉内達矢"]},"青春バスガイド":{"c":["つんく"],"a":["大久保薫"]},"ファタール":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"世界寿命と最後の一日":{"c":["スズム"],"a":["スズム"]},"進め、BLUE STAR!":{"c":["平田博信"],"a":["平田博信"]},"Burst The Gravity":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"三日月ライダー":{"c":["40mP"],"a":["40mP"]},"Here":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"風の音さえ聞こえない":{"c":["R・O・N"],"a":["R・O・N"]},"海と真珠":{"c":["梶浦由記"],"a":["梶浦由記"]},"コノユビトマレ":{"c":["白戸佑輔"],"a":["白戸佑輔"]},"眠らされたリネージュ":{"c":["石川智晶"],"a":["白戸佑輔"]},"Vai! Ya! Vai!":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"LaLaL危":{"c":["梅とら"],"a":["梅とら"]},"侵蝕":{"c":["Dios/シグナルP"],"a":["Dios/シグナルP"]},"上海幻想曲":{"c":["ZUN"]},"恋ノ蟲":{"c":["ZUN"]},"TRUE MAGIC.....":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"イレヴンス":{"c":["ポリスピカデリー"],"a":["ポリスピカデリー"]},"#FFFFFFはまほう":{"c":["わらべ"],"a":["わらべ"]},"インクベリー":{"c":["rusino"],"a":["rusino"]},"LAZULI*":{"c":["R Sound Design"],"a":["R Sound Design"]},"ヨヰシグレ":{"c":["コメダワラ"],"a":["コメダワラ"]},"快盗Vを見逃すな":{"c":["常楽寺澪","popopo"],"a":["YUU for YOU"]},"Blue Symphony":{"c":["山口朗彦"],"a":["山口朗彦"]},"リベレイシング／アロン -LiberaSing Along-":{"c":["椎名豪"],"a":["椎名豪"]},"いつだって僕らは":{"c":["秋浦智裕"],"a":["秋浦智裕"]},"いつかのキミへ":{"c":["丸山真由子"],"a":["丸山真由子"]},"青空":{"c":["真嶋昂大"],"a":["真嶋昂大"]},"DEpArture from THe life":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"Fermata in Rapsodia":{"c":["小高光太郎"],"a":["小高光太郎"]},"想い出はクリアスカイ":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"虹色letters":{"c":["KOH"],"a":["KOH"]},"バベルシティ・グレイス":{"c":["南田健吾"],"a":["南田健吾"]},"幻惑SILHOUETTE":{"c":["no_my"],"a":["no_my"]},"Enjoy & Feel":{"c":["鶴﨑輝一"],"a":["鶴﨑輝一"]},"唸れ！ミリオンアーマー！":{"c":["佐藤陽介"],"a":["佐藤陽介"]},"SUPER SIZE LOVE!!":{"c":["酒井拓也(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"満腹至極フルコォス":{"c":["ラムシーニ"],"a":["ラムシーニ"]},"青の一番星":{"c":["BNSI(Taku Inoue)"],"a":["BNSI(Taku Inoue)"]},"OVERLAY OF HOPES":{"c":["三好啓太"],"a":["三好啓太"]},"Sky Survive":{"c":["白戸佑輔(Dream Monster)"],"a":["白戸佑輔(Dream Monster)"]},"瑠璃色金魚と花菖蒲":{"c":["ラムシーニ"],"a":["ラムシーニ"]},"オトメゴコロ更新中":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"オトメゴコロ更新中 (GAME Version)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"アニマル☆ステイション！":{"c":["AstroNoteS"],"a":["AstroNoteS"]},"ときどきシーソー":{"c":["原田篤(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"自分 REST@RT":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"神SUMMER!!":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"Crossing!":{"c":["唐沢美帆","堀江晶太"],"a":["堀江晶太"]},"UNION!!":{"c":["藤本記子"],"a":["福富雅之"]},"未完成のポラリス":{"c":["木下龍平"],"a":["木下龍平"]},"飛べない僕は泳いだ":{"c":["金崎真士(SUPA LOVE)"],"a":["金崎真士(SUPA LOVE)"]},"Gift Sign":{"c":["原田篤(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"Catch my dream":{"c":["太田雅友"],"a":["EFFY"]},"Melty Fantasia":{"c":["백현(ヒゲドライバー)"],"a":["白戸佑輔"]},"HOME, SWEET FRIENDSHIP":{"c":["AstroNoteS"],"a":["AstroNoteS"]},"Raise the FLAG":{"c":["三好啓太"],"a":["三好啓太"]},"ESPADA":{"c":["佐高陵平"],"a":["佐高陵平"]},"Cherry Colored Love":{"c":["オオヤギヒロオ"],"a":["オオヤギヒロオ"]},"グッデイ・グッナイ":{"c":["内海孝彰(TRYTONELABO)"],"a":["内海孝彰(TRYTONELABO)"]},"グッデイ・グッナイ (GAME Version)":{"c":["内海孝彰(TRYTONELABO)"],"a":["内海孝彰(TRYTONELABO)"]},"BEAM":{"c":["小久保祐希","Eunsol(1008)","N1K0"],"a":["Eunsol(1008)"]},"アツアツ♪マカロニグラタン":{"c":["滝澤俊輔(TRYTONELABO)"],"a":["滝澤俊輔(TRYTONELABO)"]},"アツアツ♪マカロニグラタン (GAME Version)":{"c":["滝澤俊輔(TRYTONELABO)"],"a":["滝澤俊輔(TRYTONELABO)"]},"BOUNCING♪ SMILE!":{"c":["BNSI(佐藤貴文)"],"a":["BNSI(佐藤貴文)"]},"EVER RISING":{"c":["BNSI(中川浩二)"],"a":["BNSI(中川浩二)"]},"HUG":{"c":["俊龍"],"a":["Sizuk"]},"Irodori":{"c":["俊龍"],"a":["白戸佑輔"]},"CAT CROSSING":{"c":["R・O・N"],"a":["R・O・N"]},"パンとフィルム":{"c":["矢野達也"],"a":["矢野達也"]},"Understand? Understand!":{"c":["桑原聖(Arte Refact)"],"a":["酒井拓也(Arte Refact)"]},"ONE STAR":{"c":["中ノ森文子"],"a":["長橋健一"]},"エヴリデイドリーム":{"c":["滝澤俊輔(TRYTONELABO)"],"a":["滝澤俊輔(TRYTONELABO)"]},"Blooming Star":{"c":["椎名豪"],"a":["椎名豪"]},"教えてlast note…":{"c":["奈須野新平"],"a":["奈須野新平"]},"Forbidden Paradise":{"c":["R・O・N"],"a":["R・O・N"]},"無垢":{"c":["草野華余子"],"a":["草野華余子"]},"Wandering Dream Chaser":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"スマイル体操":{"c":["宮崎誠"],"a":["宮崎誠"]},"ホントウノワタシ":{"c":["中土智博"],"a":["中土智博"]},"誰ソ彼アイデンティティー":{"c":["Yocke"],"a":["Yocke"]},"共鳴世界の存在論":{"c":["烏屋茶房"],"a":["烏屋茶房","篠崎あやと"]},"LOVE is GAME":{"c":["高田暁"],"a":["高田暁"]},"プリンセス・アラモード":{"c":["松井洋平","AstroNoteS"],"a":["AstroNoteS"]},"ヴィーナスシンドローム":{"c":["R・O・N"],"a":["R・O・N"]},"14平米にスーベニア":{"c":["高尾奏之介"],"a":["高尾奏之介"]},"サマーサイダー":{"c":["橘亮祐","篠崎あやと"],"a":["橘亮祐","篠崎あやと"]},"サマーサイダー (GAME Version)":{"c":["橘亮祐","篠崎あやと"],"a":["橘亮祐","篠崎あやと"]},"サマーサイダー (GAME Version) (乙倉悠貴)":{"c":["橘亮祐","篠崎あやと"],"a":["橘亮祐","篠崎あやと"]},"Lullaby for Armors":{"c":["佐藤貴文"],"a":["佐藤貴文"]},"O-Ku-Ri-Mo-No Sunday!":{"c":["烏屋茶房","篠崎あやと"],"a":["篠崎あやと"]},"Strawberry Trapper":{"c":["金崎真士"],"a":["金崎真士"]},"Bring the LOVE！":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"Dazzling Game":{"c":["古河夕"],"a":["EFFY"]},"ビタミンSUMMER！":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"アステリズム":{"c":["森本練"],"a":["森本練"]},"無敵級*ビリーバー":{"c":["DECO*27"],"a":["Rockwell"]},"背伸びしたって":{"c":["Akira Sunset","遠藤ナオキ"],"a":["遠藤ナオキ"]},"咬福論":{"c":["チバニャン"],"a":["チバニャン"]},"EMOTION":{"c":["tofubeats"],"a":["tofubeats"]},"幸せのリボン":{"c":["森本練"],"a":["森本練"]},"不可視なブルー":{"c":["めんま"],"a":["めんま"]},"Rise Up High!":{"c":["ケンモチヒデフミ"],"a":["ケンモチヒデフミ"]},"ハッピー至上主義！":{"c":["くじら"],"a":["くじら"]},"PASTEL":{"c":["川浦正大"],"a":["川浦正大"]},"Pleasure Feather":{"c":["徳田光希"],"a":["徳田光希"]},"きっと青春が聞こえる":{"c":["高阪昌至"],"a":["高阪昌至"]},"恥は人生のかきすて":{"c":["めんま"],"a":["めんま"]},"MONSTER GIRLS":{"c":["Dummy Dog"],"a":["Dummy Dog"]},"Colorfulness":{"c":["きなみうみ"],"a":["きなみうみ"]},"Hi5でピースサイン！":{"c":["北川勝利"],"a":["北川勝利"]},"ラブリー♡♡♡♡♡♡":{"c":["北川勝利"],"a":["北川勝利"]},"常夏！サマー！センセーション！":{"c":["薮崎太郎"],"a":["薮崎太郎"]},"Precious":{"c":["Q-MHz"],"a":["Q-MHz"]},"ココロ Distance":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"Do you believe in music?":{"c":["北川勝利"],"a":["北川勝利"]},"恋心 ああ無情":{"c":["Q-MHz"],"a":["Q-MHz"]},"天使と悪魔":{"c":["Q-MHz"],"a":["Q-MHz"]},"もういいよ":{"c":["北川勝利"],"a":["北川勝利"]},"つながる心Binary":{"c":["高尾奏之介"],"a":["高尾奏之介"]},"風になっていく":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"星屑カンパネラ":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"Girls in wonderland":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"shiny shiny":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"ひと夏の永遠":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"Colorful×Parallel":{"c":["Q-MHz"],"a":["Q-MHz"]},"スフォルツァート":{"c":["Q-MHz"],"a":["Q-MHz"]},"欲しいよ":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"voyage":{"c":["北川勝利"],"a":["北川勝利"]},"ちいさな物語":{"c":["北川勝利"],"a":["北川勝利"]},"ビー・ウィズ・ユウ":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"クロッカスの扉":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Ignition":{"c":["Q-MHz"],"a":["Q-MHz"]},"Tiny Tiny Drops":{"c":["大畑拓也"],"a":["大畑拓也"]},"unbreakable (2021 Remastered Version)":{"c":["俊龍"],"a":["Randee"]},"Silent Star (2021 Remastered Version)":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"僕が憧れた青":{"c":["佐藤厚仁(Dream Monster)"],"a":["佐藤厚仁(Dream Monster)"]},"Overrunner!":{"c":["星銀乃丈"],"a":["星銀乃丈"]},"Ms. VICTORIA":{"c":["堀江晶太"],"a":["堀江晶太"]},"Glorious Moment！":{"c":["三好啓太"],"a":["三好啓太"]},"恋する世界 (2021 Remastered Version)":{"c":["オオヤギヒロオ"],"a":["オオヤギヒロオ"]},"LIKE THE WIND":{"c":["本田正樹(Dream Monster)"],"a":["本田正樹(Dream Monster)"]},"Sasanqua":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"燦々":{"c":["藤永龍太郎(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"夢を撃ち抜く瞬間に！ (3rd Season #13 Short Ver.)":{"c":["上松範康(Elements Garden)"],"a":["藤永龍太郎(Elements Garden)"]},"B.O.F":{"c":["DAIGO"],"a":["宅見将典"]},"世界中の青空をあつめて":{"c":["笠井雄太(Elements Garden)"],"a":["笠井雄太(Elements Garden)"]},"YELL":{"c":["水野良樹"],"a":["松任谷正隆"]},"disobedience":{"c":["堀江晶太"],"a":["堀江晶太"]},"Odd Dice":{"c":["堀江晶太"],"a":["堀江晶太"]},"everscape":{"c":["堀江晶太"],"a":["堀江晶太"]},"鳴らす":{"c":["堀江晶太"],"a":["堀江晶太"]},"カーネーションの咲く日に":{"c":["堀江晶太"],"a":["堀江晶太"]},"起死開戦":{"c":["堀江晶太"],"a":["堀江晶太"]},"ジャイアント・キラー・チューン":{"c":["烏屋茶房"],"a":["篠崎あやと"]},"Keep on Riddim":{"c":["烏屋茶房"],"a":["篠崎あやと"]},"ピースフル・ピーシーズ！":{"c":["烏屋茶房"],"a":["篠崎あやと"]},"ホーミー・タイッ！！":{"c":["烏屋茶房"],"a":["篠崎あやと"]},"1,2,Sing for You!":{"c":["秋浦智裕"],"a":["南田健吾(onetrap)"]},"One Step":{"c":["石濱翔(MONACA)"],"a":["石濱翔(MONACA)"]},"Message of a Rainbow":{"c":["HALIFANIE"],"a":["南田健吾(onetrap)"]},"GLAMOUROUS BLUE":{"c":["石濱翔(MONACA)"],"a":["石濱翔(MONACA)"]},"カレンダーガール":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"ドラマチックガール":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"Re:Rays":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Rainbow FlowerS":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Purple Rays":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"キライキライCЯY":{"c":["伊藤翼"],"a":["伊藤翼"]},"367Days":{"c":["伊藤翼"],"a":["伊藤翼"]},"Blooming,Blooming!":{"c":["伊藤翼"],"a":["伊藤翼"]},"ロケット":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"僕らは青空になる":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"Snow in \"I love you\"":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"YELLOW":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"PRIZM♪RIZM":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"たいくつりぼん":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"I need you":{"c":["fox capture plan"],"a":["fox capture plan"]},"Hilbert Space":{"c":["fox capture plan"],"a":["fox capture plan"]},"ミューズになっちゃう":{"c":["전田雅友"],"a":["EFFY"]},"超音波のメロディ":{"c":["田淵智也"],"a":["やしきん"]},"水平線は僕の古傷":{"c":["fox capture plan"],"a":["fox capture plan"]},"ワナビスタ！":{"c":["高尾奏之介"],"a":["高尾奏之介"]},"トゥ・オブ・アス":{"c":["高尾奏之介"],"a":["高尾奏之介"]},"Etoile":{"c":["高尾奏之介"],"a":["高尾奏之介"]},"Color of Drops (feat. 花里みのり & 桐谷遥 & 桃井愛莉 & 日野森雫 & 巡音ルカ)":{"c":["40mP"],"a":["40mP"]},"くうになる (feat. 花里みのり & 桐谷遥 & 桃井愛莉 & 日野森雫 & MEIKO)":{"c":["MIMI"],"a":["MIMI"]},"インテグラル":{"c":["*Luna"],"a":["*Luna"]},"星、ときどき光":{"c":["じん"],"a":["じん"]},"演劇 (feat. 宵崎奏 & 朝比奈まふゆ & 東雲絵名 & 暁山瑞希 & 巡音ルカ)":{"c":["ナノウ"],"a":["ナノウ"]},"青色絵具":{"c":["くじら"],"a":["くじら"]},"[Re] termination":{"c":["中山真斗"],"a":["eba"]},"Celsius":{"c":["中山真斗"],"a":["eba"]},"はなびらの栞 - 「SHOW BY ROCK!!」":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"旅路宵酔ゐ夢花火":{"c":["烏屋茶房"],"a":["烏屋茶房"]},"Everlasting Show to the SHOW！ (エーデル ver.)":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"butterfly":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"Road to Forever":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"One More Step!":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Burn My Soul":{"c":["麻枝准"],"a":["吉田穣"]},"深海52Hz":{"c":["小野寺祐輔"],"a":["脇眞富(Arte Refact)"]},"綺麗な花には毒がある":{"c":["コモリタミノル"],"a":["コモリタミノル"]},"ティアーズテイル":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"アオノショウドウ":{"c":["전田雅友"],"a":["EFFY"]},"OVERFLOW":{"c":["谷ナオキ"],"a":["谷ナオキ"]},"Get Over the World":{"c":["Mitsukiyo"],"a":["Mitsukiyo"]},"Polaris in the Night":{"c":["末廣健一郎"],"a":["末廣健一郎"]},"ステラ･ドライブ":{"c":["田中秀和(MONACA)"],"a":["田中秀和(MONACA)"]},"生きてるってマジ優勝！":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"おはよう、またあした":{"c":["前澤寛之"],"a":["前澤寛之"]},"リルビ":{"c":["てにをは"],"a":["てにをは"]},"glory days":{"c":["TORIENA"],"a":["TORIENA"]},"アザミナ":{"c":["てにをは"],"a":["てにをは"]},"with∅":{"c":["TORIENA"],"a":["TORIENA"]},"現世アリス":{"c":["てにをは"],"a":["てにをは"]},"SUPER DUPER":{"c":["Kijibato"],"a":["Kijibato"]},"アワータイムイエロー":{"c":["めんま"],"a":["めんま"]},"シンメトリー":{"c":["OHTORA"],"a":["New K"]},"bvdiz":{"c":["OHTORA"],"a":["New K"]},"瞬間ハートビート -tepe Remix-":{"c":["OHTORA"],"a":["tepe"]},"ローテート・リピーテッド":{"c":["やしきん"],"a":["やしきん"]},"Windy Traveler":{"c":["渡辺拓也"],"a":["渡辺拓也"]},"Future Island":{"c":["ケンモチヒデフミ"],"a":["ケンモチヒデフミ"]},"君にしか読めない手紙":{"c":["40mP"],"a":["40mP"]},"キミと見たい景色":{"c":["俊龍"],"a":["Sizuk"]},"ブライダルドリーム":{"c":["HoneyWorks"],"a":["HoneyWorks"]},"ラブノカサブタ":{"c":["ナナホシ管弦楽団"],"a":["ナナホシ管弦楽団"]},"HOLOTORI Dance!":{"c":["OSTER project"],"a":["OSTER project"]},"DO U":{"c":["KIRA"],"a":["KIRA"]},"Heart Challenger":{"c":["KIRA"],"a":["KIRA"]},"Chatter Chatter":{"c":["かめりあ"],"a":["かめりあ"]},"Escalate":{"c":["TeddyLoid"],"a":["TeddyLoid"]},"心臓が止まるまで":{"c":["カンザキイオリ"],"a":["カンザキイオリ"]},"ハジメノイッポ":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"恋愛コスモロジー":{"c":["ナユタン星人"],"a":["ナユタン星人"]},"VIOLET - Eurobeat Remix":{"c":["seibin"],"a":["Turbo"]},"Choco♡Melty":{"c":["かめりあ"],"a":["かめりあ"]},"暁光クロニクル":{"c":["堀江晶太"],"a":["堀江晶太"]},"Dirty Look":{"c":["Giga","TeddyLoid"],"a":["Giga","TeddyLoid"]},"アイシカケ":{"c":["すりぃ"],"a":["すりぃ"]},"ブレイブリーダンス":{"c":["ハム"],"a":["ハム"]},"爆鳴DIVER!!!!":{"c":["乌屋茶房"],"a":["篠崎あやと"]},"百cd融怪点":{"c":["市松寿ゞ謡"],"a":["市松寿ゞ謡"]},"寝言は寝て言え":{"c":["いよわ"],"a":["いよわ"]},"Arc goes oN":{"c":["堀江晶太"],"a":["堀江晶太"]},"こころのアビッシー":{"c":["SASAKRECT"],"a":["SASAKRECT"]},"壱百満点☆パクスサロメーナ":{"c":["前山田健一"],"a":["藤原燈太"]},"ハオ feat. 初音ミク":{"c":["DECO*27"],"a":["DECO*27"]},"スターラブレイション":{"c":["ふるっぺ"],"a":["宮永治郎"]},"殺屋中毒":{"c":["じん"],"a":["じん"]},"mirafull":{"c":["やしきん"],"a":["やしきん"]},"Imprinting":{"c":["eba"],"a":["eba"]},"ときめきパステル":{"c":["橋口祐介"],"a":["橋口祐介"]},"Moonlit Bloom":{"c":["橋口祐介"],"a":["橋口祐介"]},"水色ファンファーレ":{"c":["橋口祐介"],"a":["橋口祐介"]},"ハート":{"c":["西野亮廣"],"a":["橋口祐介"]},"mewmew-in-the-room":{"c":["橋口祐介"],"a":["橋口祐介"]},"Kiss the sky!":{"c":["橋口祐介"],"a":["橋口祐介"]},"音を浮かべて":{"c":["ヨノ"],"a":["ヨノ"]},"Romantica":{"c":["春野"],"a":["春野"]},"loosey":{"c":["春野"],"a":["春野"]},"遊泳":{"c":["春野"],"a":["春野"]},"空想線":{"c":["Sho-P"],"a":["Sho-P"]},"Dear Song":{"c":["Sho-P"],"a":["Sho-P"]},"ノクタンブルー":{"c":["Sho-P"],"a":["Sho-P"]},"透命":{"c":["脇眞富(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"あなただけは":{"c":["岡ナオキ"],"a":["岡ナオキ"]},"あなただけは…":{"c":["岡ナオキ"],"a":["岡ナオキ"]},"硝子のLoneliness":{"c":["前澤寛之"],"a":["前澤寛之"]},"Perfect Tears":{"c":["田村信二"],"a":["田村信二"]},"Blood Knife":{"c":["前澤寛之"],"a":["前澤寛之"]},"夕焼けのマージナル":{"c":["前澤寛之"],"a":["前澤寛之"]},"Prime star":{"c":["前澤寛之"],"a":["前澤寛之"]},"Bejewel Escape":{"c":["園田健太郎"],"a":["園田健太郎"]},"Only oneのあなたのせいよ":{"c":["園田健太郎"],"a":["園田健太郎"]},"Umbrella Sign":{"c":["太田雅友"],"a":["太田雅友"]},"the penance (エルフリンデ)":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"君という名のキセキ":{"c":["若G"],"a":["若G"]},"キラリ":{"c":["若G"],"a":["若G"]},"たとえばもし・・・":{"c":["若G"],"a":["若G"]},"マダ君ノコト":{"c":["若G"],"a":["若G"]},"flowers":{"c":["照井順政"],"a":["照井順政"]},"サファイア":{"c":["パソコン音楽クラブ"],"a":["パソコン音楽クラブ"]},"blue hour":{"c":["JOE IRON"],"a":["JOE IRON"]},"星紡ぎ":{"c":["江﨑文武"],"a":["江﨑文武"]},"Hollow Veil":{"c":["安田史生"],"a":["森藤晶司"]},"star*frost":{"c":["fu_mou"],"a":["fu_mou"]},"ヒトリイロ":{"c":["류(ヒゲドライバー)"],"a":["Powerless"]},"White White Snow":{"c":["安田史生"],"a":["安田史生"]},"flower〇ring":{"c":["fu_mou"],"a":["fu_mou"]},"Savage":{"c":["夢見クジラ"],"a":["夢見クジラ"]},"Ready Set Go!!":{"c":["久下真音","金子麻友美"],"a":["久下真音"]},"Triple Crown":{"c":["成本智美"],"a":["賀佐泰洋"]},"終わらない夢":{"c":["40mP"],"a":["40mP"]},"Magenta Another Sky":{"c":["yamazo"],"a":["yamazo"]},"Oh No, Oh No":{"c":["yamazo"],"a":["yamazo"]},"Emotional Flutter":{"c":["天門"],"a":["天門"]},"悠久の翼":{"c":["天門"],"a":["天門"]},"Morning Arch":{"c":["神前暁(MONACA)"],"a":["神前暁(MONACA)"]},"バルーンシアター":{"c":["神前暁(MONACA)"],"a":["神前暁(MONACA)"]},"世界の果て":{"c":["重永亮介"],"a":["重永亮介"]},"Imperfect blue":{"c":["流歌"],"a":["流歌"]},"ホロウ":{"c":["R Sound Design"],"a":["R Sound Design"]},"リーチライト":{"c":["柊マグネタイト"],"a":["柊マグネタイト"]},"ひとちがい":{"c":["いよわ"],"a":["いよわ"]},"in":{"c":["じん"],"a":["じん"]},"フローリア":{"c":["DECO*27"],"a":["Rockwell"]},"Rainy Smiley":{"c":["40mP"],"a":["40mP"]},"Tictac":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富(Arte Refact)"]},"絆創膏":{"c":["40mP"],"a":["40mP"]},"めぐり逢うすべてに":{"c":["園田健太郎"],"a":["藤間仁(Elements Garden)"]},"Meguriau Subete ni":{"c":["園田健太郎"],"a":["藤間仁(Elements Garden)"]},"Tenku no Kanaria":{"c":["加藤裕介"],"a":["加藤裕介"]},"拍動":{"c":["堀江晶太"],"a":["堀江晶太"]},"優しい記憶":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"TWIST & TIGER":{"c":["本間昭光"],"a":["本間昭光"]},"High Free Spirits":{"c":["山崎佳祐"],"a":["山崎佳祐"]},"青空DRIVING":{"c":["渡辺翔"],"a":["倉内達矢"]},"微かな密かな確かなミライ":{"c":["渡辺翔"],"a":["森谷敏紀"]},"Heart to Heart":{"c":["俊龍"],"a":["Sizuk"]},"Heart To Heart":{"c":["俊龍"],"a":["Sizuk"]},"Welcome to あざとさワールド":{"c":["神谷礼"],"a":["神谷礼"]},"ドリームパレード":{"c":["渡辺徹"],"a":["渡辺徹"]},"Changing point":{"c":["黒須克彦"],"a":["黒須克彦"]},"Queens Bluff":{"c":["ARAKI"],"a":["ARAKI"]},"Romantic Showdown":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"しあわせフレーバー":{"c":["草野華余子"],"a":["草野華余子"]},"たゆたえ、七色":{"c":["草野華余子"],"a":["堀江晶太"]},"アイレ":{"c":["堀江晶太"],"a":["堀江晶太"]},"快晴のエスタリスタ":{"c":["草野華余子"],"a":["中山真斗"]},"Eureka":{"c":["中山真斗"],"a":["中山真斗"]},"変革Delight":{"c":["TAKE(FLOW)"],"a":["FLOW"]},"Flash Summit!!":{"c":["TAKUYA"],"a":["本間昭光"]},"NOISY LOVE POWER☆":{"c":["本多友紀(Arte Refact)"],"a":["本多友紀(Arte Refact)"]},"Clear Morning":{"c":["俊龍"],"a":["Sizuk"]},"Future Strike":{"c":["俊龍"],"a":["小高光太郎"]},"インソムニア・マーメイド":{"c":["睦月周平"],"a":["睦月周平"]},"Sweet Sweet Sweat":{"c":["睦月周平"],"a":["睦月周平"]},"黄昏のスタアライト":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"新世界":{"c":["丸山真由子"],"a":["丸山真由子"]},"エガオノキミヘ":{"c":["俊龍"],"a":["大久保薫"]},"ハーモニア":{"c":["太田雅友"],"a":["太田雅友"]},"キラリアット":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Gift":{"c":["渡辺翔"],"a":["白戸佑輔"]},"Cherish":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"最先端△ガール feat.内田真礼":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"VENUS REVOLUTION":{"c":["北川勝利"],"a":["北川勝利"]},"Yarenno? Endless":{"c":["北川勝利"],"a":["北川勝利"]},"Love Me":{"c":["北川勝利"],"a":["北川勝利"]},"Rondo Carrousel":{"c":["結城アイラ"],"a":["渡部チェル"]},"星を求めて":{"c":["結城アイラ"],"a":["黒須克彦"]},"why, or why not":{"c":["大嶋啓之"],"a":["大嶋啓之"]},"The fine every day":{"c":["志倉千代丸"],"a":["水野大輔"]},"瞬間スプライン":{"c":["志倉千代丸"],"a":["水野大輔"]},"消せない気持ち":{"c":["東タカゴー"],"a":["東タカゴー"]},"Lucky Monster":{"c":["水夏える"],"a":["水夏える"]},"縁りて此の葉は紅に OP 「アカリノアリカ":{"c":["椎名俊介(Angel Note)"],"a":["椎名俊介(Angel Note)"]},"新世界のα":{"c":["竹下智博"],"a":["竹下智博"]},"刻ト詩":{"c":["折戸伸治"],"a":["塚越雄一朗(NanosizeMir)"]},"夏の砂時計":{"c":["水月陵"],"a":["水月陵"]},"羽のゆりかご":{"c":["折戸伸治"],"a":["水月陵"]},"Key『Rewrite Harvest festa!』エンディングテーマ":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"Candy a Mine":{"c":["佐久間きらら"],"a":["佐久間きらら"]},"しあわせがたり":{"c":["Manack"],"a":["Manack"]},"ほらね":{"c":["iyuna"],"a":["iyuna"]},"Especially For You":{"c":["大嶋啓之"],"a":["大嶋啓之"]},"同じ星の上で。":{"c":["bassy"],"a":["bassy"]},"こわれかけのオルゴール":{"c":["Tsukasa"],"a":["Tsukasa"]},"祝福のカンパネラ":{"c":["上松範康(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"みずいろ":{"c":["上松範康(Elements Garden)"],"a":["上松範康(Elements Garden)"]},"もう魔法はいらない":{"c":["上松範康(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"INSANITY":{"c":["Monta"],"a":["鈴木Daichi秀行"]},"FISSION":{"c":["奥井雅美"],"a":["MACARONI☆"]},"CHAOS LOVE":{"c":["奥井雅美"],"a":["矢吹俊郎"]},"Dogma":{"c":["奥井雅美"],"a":["矢吹俊郎"]},"千夜一夜VORTEX":{"c":["折戸伸治"],"a":["高瀬一矢"]},"Lたちの船出":{"c":["折戸伸治"],"a":["水月陵"]},"イチジツセンカ":{"c":["折戸伸治"],"a":["中沢伴行"]},"フカキユメミシ":{"c":["どんまる"],"a":["どんまる"]},"kicks!":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"KILL":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"no vain":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"repeat -Deep Forest Remix-":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"sail to a new world":{"c":["Shade"],"a":["Shade"]},"Concerto Note":{"c":["菊田大介(Elements Garden)"],"a":["菊田大介(Elements Garden)"]},"ツクモノツキ":{"c":["天門"],"a":["天門"]},"れみぜら！":{"c":["羽鳥風画"],"a":["羽鳥風画"]},"LOVE ADVENTURE":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"ハローグッバイ":{"c":["藤間仁(Elements Garden)"],"a":["藤間仁(Elements Garden)"]},"絆":{"c":["椎名俊介(Angel Note)"],"a":["椎名俊介(Angel Note)"]},"内なる雨":{"c":["不知火つばさ(Angel Note)"],"a":["不知火つばさ(Angel Note)"]},"夢の季節へ":{"c":["椎名俊介(Angel Note)"],"a":["椎名俊介(Angel Note)"]},"せかいにさよなら":{"c":["不知火つばさ(Angel Note)"],"a":["不知火つばさ(Angel Note)"]},"rebirthday eve":{"c":["椎名俊介(Angel Note)"],"a":["椎名俊介(Angel Note)"]},"Your Lips":{"c":["Manack"],"a":["Manack"]},"アルテミスブルーOP":{"c":["水月陵"],"a":["水月陵"]},"Love Hell Rocket":{"c":["中山真斗"],"a":["中山真斗"]},"百花繚乱ファンタズム full chorus Ver.":{"c":["水月陵"],"a":["水月陵"]},"Clap":{"c":["水月陵"],"a":["水月陵"]},"Brand new diary":{"c":["R・O・N"],"a":["R・O・N"]},"カコ→イマ→ミライ→?":{"c":["本田光史郎"],"a":["本田光史郎"]},"ユメイロコンパス":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"向上上々ハイジャンプ↑↑↑↑":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Shake!":{"c":["百石元"],"a":["百石元"]},"go to Romanceᐳᐳᐳᐳᐳ":{"c":["大石昌良"],"a":["大石昌良"]},"Shiny Day, Shiny Life":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"You are a star!":{"c":["八木沼悟志"],"a":["八木沼悟志"]},"Stargazer":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Dreamroid":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"North method":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Your Voice":{"c":["川田瑠夏"],"a":["川田瑠夏"]},"夢色パレード":{"c":["ヒゲドライバー"],"a":["baker"]},"Nirvana":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"Heart realize":{"c":["ryo(supercell)"],"a":["ryo(supercell)"]},"さよならのゆくえ":{"c":["瀧川ありさ","Saku"],"a":["Saku"]},"ごめんね、いいコじゃいられない。":{"c":["沢井美空"],"a":["立山秋航"]},"契り歌":{"c":["松浦勇気"],"a":["宮崎誠"]},"Keep on!!":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"モラトリアム・クラスタ":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"I'm home-unplugged-":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"☆虹色ロックンロール♪":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"黒蝶のサイケデリカ":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"砂の城 ～The Castle of Sand～":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Bullshit!! Hard problem!!":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Ashita no Mukou (Will you take my hand mix)":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Shiawase ni tsuite watashi ga shitteiru itsutsu no houhou":{"c":["Rasmus Faber"],"a":["Rasmus Faber"]},"Shippo no Uta":{"c":["菅野よう子"],"a":["菅野よう子"]},"DOWN TOWN":{"c":["山下達郎"],"a":["服部隆之"]},"Ashitadeiikara":{"c":["広川恵一(MONACA)"],"a":["広川恵一(MONACA)"]},"Tatoeba sorewa Yuuki no Mahou":{"c":["俊龍"],"a":["Sizuk"]},"Koisuru MODE":{"c":["大久保薫"],"a":["大久保薫"]},"Pleasure garden":{"c":["湊貴大"],"a":["湊貴大"]},"Triangle days":{"c":["堀江晶太"],"a":["堀江晶太"]},"Green Leaves (涼風青葉)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"CONTINUE... ? (涼風青葉)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"ココロ＝ハレーション":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"夢見サンライズ":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"きらめきっ!の日":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"青空のつくりかた":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"Yes! Precious Harmony! (ペコリーヌ)":{"c":["田中公平"],"a":["東大路憲太"]},"Yes! Precious Harmony! (コッコロ)":{"c":["田中公平"],"a":["東大路憲太"]},"青春のアーカイブ (ホシノ)":{"c":["Mitsukiyo"],"a":["Mitsukiyo"]},"青春のアーカイブ (アヤネ)":{"c":["Mitsukiyo"],"a":["Mitsukiyo"]},"青春スピナー (クロエ)":{"c":["田中公平"],"a":["根岸貴幸"]},"青春スピナー (チエル)":{"c":["田中公平"],"a":["根岸貴幸"]},"青春スピナー (ユニ)":{"c":["田中公平"],"a":["根岸貴幸"]},"はるかぜの化学 (るん)":{"c":["MONACA"],"a":["MONACA"]},"はるかぜの化学 (ナギ)":{"c":["MONACA"],"a":["MONACA"]},"Make Up Life! (ファ)":{"c":["MONACA"],"a":["MONACA"]},"Make Up Life! (風色琴音)":{"c":["MONACA"],"a":["MONACA"]},"Ubiquitous dB (ユナ)":{"c":["梶浦由記"],"a":["梶浦由記"]},"Break Beat Bark! (ユナ)":{"c":["梶浦由記"],"a":["梶浦由記"]},"YAHHO!!":{"c":["堀江由衣"],"a":["大川茂伸"]},"きっと恋をしている":{"c":["清竜人"],"a":["清竜人"]},"Birth":{"c":["山口朗彦"],"a":["河合英嗣"]},"Be Starters!":{"c":["山口朗彦"],"a":["山口朗彦"]},"Ring Ring Rainbow!!":{"c":["俊龍"],"a":["大久保薫"]},"アシタノツバサ":{"c":["堀江晶太"],"a":["堀江晶太"]},"Climber's High!":{"c":["WEST GROUND"],"a":["WEST GROUND"]},"LOVE MEN HOLIC":{"c":["WEST GROUND"],"a":["WEST GROUND"]},"Aozora No Namida":{"c":["田中秀典"],"a":["渡辺善太郎"]},"Brightdown":{"c":["藤末樹"],"a":["nishi-ken"]},"空は二度燃える":{"c":["40mP"],"a":["40mP"]},"白色蜉蝣":{"c":["飛内将大"],"a":["玉井健二","飛内将大"]},"この世界で":{"c":["尾崎雄貴"],"a":["尾崎雄貴"]},"それを愛と呼ぶなら":{"c":["Uru"],"a":["小林武史"]},"プラットフォーム":{"c":["Uru"],"a":["トオミヨウ"]},"a.m.3:21":{"c":["くじら"],"a":["くじら"]},"アダルトチックチルドレン":{"c":["ウォルピスカーター","ケダルイ"],"a":["ケダルイ"]},"夜踊る雫":{"c":["STEAKA"],"a":["STEAKA"]},"六角形のカフカ":{"c":["STEAKA"],"a":["STEAKA"]},"cat reincarnation":{"c":["nyamura"],"a":["nyamura"]},"you are my curse":{"c":["nyamura"],"a":["nyamura"]},"冬がすぎたら":{"c":["nyamura"],"a":["nyamura"]},"かわいいふりで食んで":{"c":["灰色ねむり"],"a":["灰色ねむり"]},"Twig":{"c":["大沼パセリ"],"a":["大沼パセリ"]},"彗星とねむる":{"c":["Aliey:S"],"a":["Aliey:S"]},"ツナギアイ":{"c":["Neo"],"a":["Neo"]},"八月のレイニー":{"c":["はるまきごはん"],"a":["はるまきごはん"]},"花めづる君":{"c":["傘村トータ"],"a":["傘村トータ"]},"凹面黙示録":{"c":["柊マグネタイト"],"a":["柊マグネタイト"]},"レテノール":{"c":["R Sound Design"],"a":["R Sound Design"]},"ローゼンハイヴ":{"c":["廉"],"a":["廉"]},"最底辺の嫌がらせ":{"c":["100回嘔吐"],"a":["100回嘔吐"]},"Elopement":{"c":["香椎モイミ"],"a":["香椎モイミ"]},"馬と鹿に謝って":{"c":["Δ"],"a":["Δ"]},"Bye-Bye Lover":{"c":["samfree"],"a":["samfree"]},"I am a broken umbrella":{"c":["Nem"],"a":["Nem"]},"なまえのないうた":{"c":["DATEKEN"],"a":["DATEKEN"]},"芥の部屋は錆色に沈む":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"記憶の水槽":{"c":["キタニタツヤ"],"a":["キタニタツヤ"]},"青色が怖くなったんだ":{"c":["Δ"],"a":["Δ"]},"ジブラ":{"c":["すりぃ"],"a":["すりぃ"]},"【オリジナル楽曲】♡ラブチーノ":{"c":["Junky"],"a":["Junky"]},"【Kawaii Future Bass】Ms.Dummy":{"c":["Junky"],"a":["Junky"]},"CRITICAL ERROR":{"c":["天野月"],"a":["天野月"]},"言葉繋ぎ":{"c":["미키토P"],"a":["みきとP"]},"Brand New Voice":{"c":["ダルビッシュP","花たん"],"a":["ダルビッシュP"]},"BWLAUTE BEIRRD":{"c":["おおくまけんいち"],"a":["おおくまけんいち"]},"Twinkle Every Day":{"c":["岩橋星実(Elements Garden)"],"a":["岩橋星実(Elements Garden)"]},"ソーダライト":{"c":["夏代孝明"],"a":["夏代孝明"]},"単純馬鹿でごめんね":{"c":["シンイチ"],"a":["久下真音"]},"不完全という証明":{"c":["シンイチ"],"a":["久下真音"]},"踊る、透明で":{"c":["シンイチ"],"a":["久下真音"]},"約束のブルー":{"c":["シンイチ"],"a":["久下真音"]},"風去る時に":{"c":["シンイチ"],"a":["久下真音"]},"最終的に曖昧な僕らは。":{"c":["シンイチ"],"a":["久下真音"]},"一人ぼっちの革命":{"c":["シンイチ"],"a":["久下真音"]},"ふわり恋模様":{"c":["rian"],"a":["山下航生"]},"希望の前で待ち合わせ":{"c":["松本文紀"],"a":["松本文紀"]},"ヒマワリの教会":{"c":["松本文紀"],"a":["松本文紀"]},"さくらとことり":{"c":["松本文紀"],"a":["松本文紀"]},"いつか天使になって あるいは青い鳥になって アダムとイブになって":{"c":["松本文紀"],"a":["松本文紀"]},"ひだまりライン":{"c":["水月陵"],"a":["水月陵"]},"コーティングチョコ":{"c":["こはるん"],"a":["こはるん"]},"明日の始まり":{"c":["伊吹ユキヒロ"],"a":["伊吹ユキヒロ"]},"両手いっぱいに I love you (solo ver.)":{"c":["橋咲透"],"a":["橋咲透"]},"Flashing! Search light":{"c":["橋咲透"],"a":["橋咲透"]},"All the way":{"c":["橋咲透"],"a":["橋咲透"]},"Sunny Steps":{"c":["鶴﨑輝一"],"a":["鶴﨑輝一"]},"潜涙":{"c":["전田雅友"],"a":["EFFY"]},"閃響":{"c":["堀江晶太"],"a":["堀江晶太"]},"Windshifter":{"c":["5u5h1"],"a":["5u5h1"]},"realization":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"Memory of Stella":{"c":["流歌"],"a":["流歌"]},"夜奏花":{"c":["折戸伸治"],"a":["塚越雄一朗(NanosizeMir)"]},"ROUTE√":{"c":["折戸伸治"],"a":["水月陵"]},"青き此方":{"c":["どんまる"],"a":["どんまる"]},"心ノ約束":{"c":["Meis Clauson"],"a":["Meis Clauson"]},"重なる記憶":{"c":["Meis Clauson"],"a":["Meis Clauson"]},"さよならを空に":{"c":["Meis Clauson"],"a":["Meis Clauson"]},"恋空":{"c":["Meis Clauson"],"a":["Meis Clauson"]},"GLORIOUS DAYS":{"c":["水月陵"],"a":["水月陵"]},"東の空から始まる世界":{"c":["水月陵"],"a":["水月陵"]},"Depressing":{"c":["Meis Clauson"],"a":["Meis Clauson"]},"キミトユメミシ":{"c":["Meis Clauson"],"a":["Meis Clauson"]},"petit bonheur":{"c":["水月陵"],"a":["水月陵"]},"冬に咲く華":{"c":["天ヶ咲麗","橋咲透"],"a":["橋咲透"]},"冬に咲く華(彼女のセイイキ OP)":{"c":["天ヶ咲麗","橋咲透"],"a":["橋咲透"]},"後ろ髪の証跡":{"c":["橋咲透"],"a":["橋咲透"]},"さくら、もゆ。":{"c":["堀江晶太"],"a":["堀江晶太"]},"明日のこと":{"c":["忍"],"a":["忍"]},"Coincidence (黒姫結灯)":{"c":["忍"],"a":["忍"]},"Vanille Rouge -Rencontre ver.-":{"c":["不知火つばさ(Angel Note)"],"a":["不知火つばさ(Angel Note)"]},"Precious Line":{"c":["椎名俊介(Angel Note)"],"a":["椎名俊介(Angel Note)"]},"Sugar Ripple":{"c":["不知火つばさ(Angel Note)"],"a":["不知火つばさ(Angel Note)"]},"GREAT JOURNEY":{"c":["박진배(ESTi)"],"a":["ESTi"]},"Moving Go On":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"永遠のアセリア":{"c":["高瀬一矢"],"a":["高瀬一矢"]},"Trample on Schatten!! ～かげふみのうた～":{"c":["不知火つばさ(Angel Note)"],"a":["不知火つばさ(Angel Note)"]},"広がる夜空の下で":{"c":["不知火つばさ(Angel Note)"],"a":["不知火つばさ(Angel Note)"]},"Ever Never":{"c":["水月陵"],"a":["水月陵"]},"夏の日のリフレイン":{"c":["水月陵"],"a":["水月陵"]},"夢飼い日和":{"c":["水月陵"],"a":["水月陵"]},"刀心幻戯":{"c":["折倉俊則"],"a":["折倉俊則"]},"カレイドパレヱド":{"c":["折倉俊則"],"a":["折倉俊則"]},"On my Sheep":{"c":["bermei.inazawa"],"a":["bermei.inazawa"]},"月ノ鐘":{"c":["미月陵"],"a":["水月陵"]},"ロオド・ラスト":{"c":["折倉俊則"],"a":["折倉俊則"]},"星彩のとことは":{"c":["Aira"],"a":["Aira"]},"碧天に尽き":{"c":["Aira"],"a":["Aira"]},"prism":{"c":["Aira"],"a":["Aira"]},"くらげ":{"c":["宗谷いちか"],"a":["Aira"]},"少しの自信があったら、":{"c":["みきとP"],"a":["みきとP"]},"一期百会 meets 40mP":{"c":["40mP"],"a":["40mP"]},"ファンタジック・パートナー":{"c":["カヨコ"],"a":["千葉\"naotyu-\"直樹"]},"目眩":{"c":["전田雅友"],"a":["EFFY"]},"大切なタカラモノ (キュアロゼッタ)":{"c":["高木洋"],"a":["高木洋"]},"for you (秋月風夏)":{"c":["WEST GROUND"],"a":["WEST GROUND"]},"Fair wind (秋月風夏)":{"c":["WEST GROUND"],"a":["WEST GROUND"]},"CHOOSE ME CHOOSE ME (fran)":{"c":["園田健太郎"],"a":["園田健太郎"]},"My First Story (桐須真冬)":{"c":["山田高弘"],"a":["山田高弘"]},"甘くない林檎 (夕桐アヤノ)":{"c":["俊龍"],"a":["Sizuk"]},"満ちる月影の彼方":{"c":["毛蟹(LIVE LAB.)"],"a":["毛蟹(LIVE LAB.)"]},"天体図":{"c":["園田健太郎"],"a":["園田健太郎"]},"ゆびきりの唄":{"c":["園田健太郎"],"a":["園田健太郎"]},"君だけのオリオン":{"c":["園田健太郎"],"a":["園田健太郎"]},"シェケナ!":{"c":["HIKIE"],"a":["HIKIE"]},"Shout along !":{"c":["木下智哉"],"a":["木下智哉"]},"チェケラ":{"c":["전山田健一"],"a":["前山田健一"]},"Fly Higher":{"c":["HIKIE"],"a":["HIKIE"]},"Hands up !":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"唇がふれあえば":{"c":["鈴木Daichi秀行"],"a":["鈴木Daichi秀行"]},"世界中の微笑み集めてもかなわない":{"c":["都倉俊一"],"a":["都倉俊一"]},"You are only my love":{"c":["大森俊之"],"a":["大森俊之"]},"GET LOVE":{"c":["タケカワユキヒデ"],"a":["タケカワユキヒデ"]},"Oh Please!":{"c":["タケカワユキヒデ"],"a":["タケカワユキヒデ"]},"last cross":{"c":["T2ya"],"a":["T2ya"]},"Desperate":{"c":["T2ya"],"a":["T2ya"]},"Silent of Me":{"c":["T2ya"],"a":["T2ya"]},"彼女の“Modern…”":{"c":["TAKURO"],"a":["GLAY"]},"月を詠む":{"c":["40mP"],"a":["40mP"]},"ローダンセ":{"c":["40mP"],"a":["40mP"]},"Melon Soda":{"c":["加賀(ネギシャワーP)"],"a":["加賀(ネギシャワーP)"]},"月が消えた":{"c":["加賀(ネギシャワーP)"],"a":["加賀(ネギシャワーP)"]},"ハッピーエンドをはじめから":{"c":["TOKOTOKO(西沢さんP)"],"a":["TOKOTOKO(西沢さんP)"]},"Hand in Hand":{"c":["kz(livetune)"],"a":["kz(livetune)"]},"White Princess":{"c":["Drop"],"a":["Drop"]},"Secret Rose Garden":{"c":["Drop"],"a":["Drop"]},"紅蓮夜叉":{"c":["Drop"],"a":["Drop"]},"まっかっか":{"c":["Drop"],"a":["Drop"]},"MOTTAI":{"c":["かいりきベア"],"a":["かいりきベア"]},"クローバー♧クラブ -C♧C-":{"c":["ゆうゆ"],"a":["ゆうゆ"]},"如月アテンション":{"c":["じん"],"a":["じん"]},"プロローグ":{"c":["Uru"],"a":["トオミヨウ"]},"melt bitter":{"c":["さとうもか"],"a":["さとうもか"]},"raspberry cube":{"c":["まふまふ"],"a":["まふまふ"]},"My Heart Will Go On":{"c":["James Horner"],"a":["James Horner"]},"愛されなくても君がいる":{"c":["ピノキオピー"],"a":["ピノキオピー"]},"FAKE LAND":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"Viva La Vida":{"c":["Coldplay"],"a":["Coldplay"]},"선잠 (Leina)":{"c":["Leina"],"a":["Leina"]},"チョコレーション":{"c":["Tensions"],"a":["Tensions"]},"プレゼント":{"c":["大森元貴"],"a":["大森元貴"]},"sumire iro amulet":{"c":["40mP"],"a":["40mP"]},"〖 歌ってみた 〗 Trio Dreams":{"c":["滝澤俊輔(TRYTONELABO)"],"a":["滝澤俊輔(TRYTONELABO)"]},"メガネゴーラウンド（綴cover）":{"c":["大石昌良"],"a":["大石昌良"]},"青染 (feat. ナツノセ)":{"c":["ナツノセ"],"a":["ナツノセ"]},"Honky Tonky Night":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"XXX(めろくる)":{"c":["めろくる"],"a":["めろくる"]},"【吹いてみた】上を向いて歩こう":{"c":["中村八大"],"a":["中村八大"]},"おやすみパラリシス":{"c":["砕糖おわり"]},"カートゥーンガール":{"c":["Kanaria"]},"のろいのももいろ":{"c":["砕糖おわり"]},"mgmg":{"c":["まどわく"]},"メイ":{"c":["大沼パセリ"]},"dop":{"c":["■37"]},"夜風に飛べ":{"c":["犀は火曜日、山羊は海"]},"茜音色の蝉時雨":{"c":["ちいたな"]},"夏色のルージュ":{"c":["yamada"]},"wound**":{"c":["ほいっぷ"]},"U were there":{"c":["hisui"]},"すこし歩く":{"c":["tezzy"]},"ユーフォービート":{"c":["犀は火曜日、山羊は海"]},"Empty Anxiety":{"c":["ほいっぷ"]},"匿名希望":{"c":["shino"]},"サウンド":{"c":["baker"]},"stranger":{"c":["Capils"]},"スコア20":{"c":["由末イリ"]},"ラブイズユーリカ（2024ver）":{"c":["yamada"]},"ふぁうんどふってーじ":{"c":["■37"]},"Poolside":{"c":["大沼パセリ"]},"なんてね":{"c":["citrus"]},"ホンメイ":{"c":["Neo"]},"いまのあと":{"c":["ぽて"]},"廃頽":{"c":["江戸川スミス"]},"アーティファクト":{"c":["江戸川スミス"]},"孤独に溺れる":{"c":["ぽりふぉ"]},"取り返しのつかない注意報":{"c":["江戸川スミス"]},"月の光を喰む":{"c":["江戸川スミス"]},"審美眼":{"c":["和ぬか"]},"ヴィクター":{"c":["めいちゃん"]},"拡散性マジョリティ":{"c":["あるか"],"a":["Limpid"]},"あかぬけたよね":{"c":["BCNO"]},"エンジェル・ハート":{"c":["江戸川スミス"],"a":["Neo Nexus Near"]},"喰らいながら":{"c":["獅子志司"]},"迷々":{"c":["烏屋茶房"]},"コールドハンド":{"c":["ライブP"]},"In Your Hands":{"c":["yusukeP"]},"グレゴリオ":{"c":["古川本舗"]},"雪峰":{"c":["彩音 ～xi-on～"]},"声":{"c":["針原翼(HarryP)"]},"街路灯を横切って":{"c":["ちんまりP"]},"アヤカシ":{"c":["buzzG"]},"tanzanite":{"c":["narry"]},"kiss":{"c":["みきーの"]},"さいしょへ":{"c":["ぬゆり"],"a":["なつめ千秋"]},"橙一点":{"c":["獅子志司"]},"冬眠":{"c":["n-buna"]},"伊っ達さ":{"c":["マキシウキョウ"]},"Blood":{"c":["Azari"]},"光よ":{"c":["きくお"]},"洒落枯れ坊主と花一匁":{"c":["結音"]},"月に花咲け 夜に歌え":{"c":["傘村トータ"]},"Be My Guest":{"c":["Azari"]},"心のそばに":{"c":["岩崎太整"]},"歌よ":{"c":["Ludvig Forssell"]},"U":{"c":["Daiki Tsuneta"]},"げのげ":{"c":["なきそ"]},"White":{"c":["傘村トータ"]},"靴と爪":{"c":["傘村トータ"]},"デジャヴ":{"c":["まふまふ"]},"きみのかみ":{"c":["Sori Sawada"]},"朱灯音 -key note-":{"c":["酔シグレ"]},"銀の糸":{"c":["吉田和人"]},"花を踏む":{"c":["傘村トータ"]},"ボッコの残業":{"c":["苑楽あそび"]},"夢現実":{"c":["moki"]},"月の夜のけものたち":{"c":["松岡美弥子"]},"Scyld":{"c":["tokiwa"]},"生きてさえ":{"c":["傘村トータ"]},"时光盲盒":{"c":["YuH_ChiliChill"]},"Hunter's Song 明日方舟 アークナイツ":{"c":["Adam Gubman"]},"霞光":{"c":["陈欣若"]},"Da Capo":{"c":["蔡近翰Zoe(HOYO-MiX)"],"a":["宫奇Gon(HOYO-MiX)","苑迪萌Dimeng Yuan(HOYO-MiX)","崔瀚普TSAR(HOYO-MiX)","车子玉Ziyu Che(HOYO-MiX)"]},"落花劫":{"c":["洛劫"]},"A Dream by the Sea":{"c":["暗猫"]},"倾心纪":{"c":["著小生zoki（半木生）"],"a":["未济"]},"elm":{"c":["纯白P"],"a":["何展沙"]},"六月":{"c":["小宇Cosmos"]},"将遗憾写成歌":{"c":["著小生zoki"]},"旧电台":{"c":["魚咕噜"]},"观星者":{"c":["小绵羊magens"]},"雪国の女":{"c":["JohnyP"]},"【オリジナル曲 Original Song】「花」Flower":{"c":["小绵羊magens"]},"远远乡":{"c":["铁塔"],"a":["藏灵工作室"]},"致川流的无名诗":{"c":["魚咕噜"]},"为了你唱下去 Cover COP feat.洛天依":{"c":["COP"]},"千岁绿":{"c":["呀呀"]},"目撃！ミク31世！":{"c":["はろける"]},"帰り道（回家的路）":{"c":["Peijia You (HOYO-MiX)"]},"浮生若有归":{"c":["苏逸"]},"我不曾忘记 I've never forgotten":{"c":["ChiliChill"]},"D":{"c":["梅とら"]},"FLASH BACK":{"c":["梅とら"]},"angelite":{"c":["narry"]},"miss you":{"c":["ツカダタカシゲ"]},"紫陽花の夜":{"c":["ねじ式"]},"NEW DAY":{"c":["田辺恵二"]},"イノセントシーン":{"c":["あーるP"]},"雨降りエトセトラ":{"c":["PolyphonicBranch"]},"peristerite":{"c":["narry"]},"甘い病":{"c":["なつめ千秋"]},"she":{"c":["keeno"]},"The Sweet Loop":{"c":["香椎モイミ"]},"ぜろぐらむ":{"c":["みきとP"]},"ラストソング":{"c":["fatmanP"]},"不気味":{"c":["buzzG"]},"烈火":{"c":["niki"]},"Vanity":{"c":["シータ"]},"光彩":{"c":["めろくる"]},"あのねのね":{"c":["ツカダタカシゲ"]},"ヴァニタス":{"c":["青栗鼠"]},"深海アクアリウム":{"c":["瑠芽"]},"ネメシア":{"c":["necchi"]},"Why Does a Heart Break?":{"c":["KIRA"]},"花となれ":{"c":["雄之助"]},"雨音と、舞う。":{"c":["きっと、ずっと、ぼっち。"]},"花色":{"c":["香椎モイミ"]},"よるをおどる":{"c":["西島尊大"]},"ムーン":{"c":["tama"]},"Rabbit":{"c":["一億円P"]},"Rem":{"c":["forute"]},"絶対love×love宣言!!":{"c":["Wataru Maeguchi"]},"everlasting":{"c":["東条サダヲ"]},"Minority":{"c":["北澤伸一郎"]},"Blue Skies":{"c":["東条サダヲ"]},"With Tomorrow":{"c":["Meis Clauson"]},"ラストタイム":{"c":["北澤伸一郎"]},"First Time":{"c":["東条サダヲ"]},"二つの光":{"c":["水城新人"]},"夜を飼う":{"c":["TOKOTOKO（西沢さんP）"]},"かなりあ色の星":{"c":["瀬名水紀"]},"オールユーニードイズオーディナリーズ":{"c":["TOKOTOKO"]},"マイルームコレクション":{"c":["TOKOTOKO"]},"この恋、青春により。ED「Missing":{"c":["北澤伸一郎"]},"Activity":{"c":["北澤伸一郎"]},"Which is Which":{"c":["西坂恭平"]},"ウタウタイ":{"c":["のりる"]},"黒猫乙女":{"c":["azami"]},"ドリームランド":{"c":["みずな"]},"いれない":{"c":["是"]},"アリシス feat.初音ミク":{"c":["ユラメP"]},"月に吠える":{"c":["n-buna"]},"마.피.아. In the morning":{"c":["J.Y. Park \"The Asiansoul\"","LYRE","earattack","KASS","이해솔"],"a":["J.Y. Park \"The Asiansoul\"","LYRE","earattack","이해솔"]},"'Anpanman'":{"c":["Pdogg","Supreme Boi","\"hitman\" bang","RM","Suga","Jinbo"]},"アイシテの証明":{"c":["biz"]},"ネオンを消して":{"c":["比喩根"]},"結い傷な":{"c":["一二三"]},"ココロクラウド":{"c":["雨上がりP"]},"波に飲まれる前に":{"c":["Guiano"]},"青歴史":{"c":["こひ"]},"春の底":{"c":["naruno"]},"月を歩くのは君だけだ":{"c":["saikawa"]},"不変的な青":{"c":["セカンドセカンド"]},"ウルトラロケット":{"c":["niki"]},"ラベンダー":{"c":["MIMI"]},"透明なパレット":{"c":["Aqu3ra"]},"東京カラー":{"c":["北澤伸一郎"]},"ある存在":{"c":["シンイチ"]},"Tsuyogatte Kudaranai":{"c":["Shinichiro Kitazawa"]},"嘘とアイデンティティ":{"c":["北澤伸一郎"]},"グッバイロング":{"c":["北澤伸一郎"]},"純情ニツキ":{"c":["シンイチ"]},"命くれない":{"c":["シンイチ"]},"サヨナラ夜風":{"c":["シンイチ"]},"レイガン":{"c":["シンイチ"]},"自白":{"c":["シンイチ"]},"Navy":{"c":["雄之助"]},"夏夜ノ唄":{"c":["平田義久"]},"体温":{"c":["水槽"]},"From The Start":{"c":["Laufey","Spencer Stewart"]},"東京は夜":{"c":["平田義久"],"a":["Michael Kaneko"]},"Espresso":{"c":["Sabrina Carpenter","Julian Bunetta","Amy Allen","Steph Jones"]},"カイコ":{"c":["DECO*27"],"a":["DECO*27","Hayato Yamamoto"]},"舞台の上で":{"c":["松木美定"]},"ホンキートンキーラブ":{"c":["キタノコウヤ"],"a":["POP ART TOWN"]},"ジャンク":{"c":["内緒のピアス"]},"yakusoku o'clock":{"c":["高木誠司","oni"]},"Your Own Daybreak":{"c":["buzzG"]},"Breezy Magic":{"c":["星銀乃丈","Kawaii Psycho 俱楽部"]},"1R Vacation":{"c":["RED"]},"散歩":{"c":["雪乃イト"]},"About me":{"c":["蝶々P"]},"Turning Point.":{"c":["雪乃イト"]},"雷・々・来":{"c":["RED"]},"猫猫的宇宙論":{"c":["ナユタン星人"]},"君と僕":{"c":["rian"],"a":["山下航生"]},"蕚 - Utena -":{"c":["ZUN"],"a":["katsu"]},"Linaria (vocal ver)":{"c":["まらしぃ"]},"HEARTSTRINGS":{"c":["ZUN"]},"gradation":{"c":["小野寺祐輔"],"a":["脇 眞富"]},"冷たいぬくもり":{"c":["OSTER project"]},"Ray of Light":{"c":["うたたね歌菜"]},"不夜城":{"c":["doriko"]},"心影 -Music Video-":{"c":["doriko"]},"SODA POP [Saja Boys]":{"c":["Vince","Kush","Danny Chung","24","Dominsuk"]},"死神(사신)":{"c":["米津玄師"],"a":["米津玄師","坂東祐大"]},"BE SOMEBODY (육성재)":{"c":["Scott Russell Stoddart","Andy Love"],"a":["Scott Russell Stoddart"]},"HERO (LUCY)":{"c":["조원상","O.YEON"],"a":["조원상","신예찬","최상엽","신광일","O.YEON"]},"첫사랑 ( 백아 )":{"c":["백아"]},"낮에 뜨는 달 ( 안예은 )":{"c":["안예은"],"a":["안예은","Strawberrybananaclub"]},"그 여름에 피어나 (あの夏に咲け)":{"c":["n-buna"]},"Healer":{"c":["Jae","Young K","원필","홍지상"],"a":["홍지상"]},"새봄의 노래":{"c":["서동환","도영"],"a":["서동환","강버터"]},"Id-Entity":{"c":["丸田凌央"]},"EMOVER FLOW":{"c":["Shogo","Tsubasa"]},"ROLLBACK":{"c":["大和"]},"CHEMISTREAM":{"c":["山崎光"]},"染脳":{"c":["銀河ワプミ"]},"散花":{"c":["Tsubasa","Shogo"]},"覚醒.exe":{"c":["MEDA"]},"Chu lu Chu!":{"c":["MEDA"],"a":["RIKIYA","Koki"]},"星屑の夜空":{"c":["Hayashi Yuta"]},"From far away":{"c":["buzzG"]},"わたしのつばさ":{"c":["佐藤恭野"]},"月が綺麗":{"c":["岩見拓馬"]},"月影":{"c":["中野領太"],"a":["玉井健二","中野領太"]},"Target for Love":{"c":["mitsukiyo","Lee Jin Ah"]},"星屑ビーナス":{"c":["飛内将大"],"a":["Kenji Tamai","Masahiro Tobinai"]},"螺旋":{"c":["SAS","LOAR","Sho from MY FIRST STORY"],"a":["高慶“CO-K”卓史"]},"おしまいの未来より":{"c":["キタニタツヤ"]},"その切っ先が愛であれば":{"c":["傘村トータ"],"a":["新田目駿(HANO)"]},"fotia":{"c":["ルワン"]},"呼吸する春たち":{"c":["まろ","mido"],"a":["まろ","アヲヒイロ"]},"君がいて、僕が在る":{"c":["あかまる"],"a":["ユリイ・カノン"]},"熱風":{"c":["kemu"]},"尾びれ":{"c":["烏鷺"]},"巫":{"c":["柊マグネタイト"]},"我愛メイデン":{"c":["羽生まゐご"]},"グレーテのいない星":{"c":["傘村トータ"]},"夢の中で愛して":{"c":["ヨノ"],"a":["Powerless"]},"花に落ちる":{"c":["ヨノ-Yono"],"a":["椿山日南子"]},"響く音の、その先で":{"c":["ヨノ"]},"拝啓、はじまりの色":{"c":["ヨノ"],"a":["出羽良彰"]},"You're Notes":{"c":["ヨノ"],"a":["長橋健一"]},"僕は僕の速さで":{"c":["ヨノ-Yono"],"a":["椿山日南子"]},"なしのつぶて":{"c":["一二三"]},"ハイド & シークレット":{"c":["ノラ"]},"BREAK":{"c":["Chii-G"]},"カルメン":{"c":["Peg"]},"デイムーン":{"c":["*Luna"]},"はこにわ。":{"c":["*Luna"]},"クリスマスキャンセル同好会":{"c":["NEKOZUME"]},"Holly":{"c":["wotaku"]},"Immature":{"c":["wotaku"]},"Postscript":{"c":["Orangestar"],"a":["Orangestar","遼遼"]},"Hello wonderful world":{"c":["廣澤優也(HANO)"],"a":["廣澤優也(HANO)","日直伸次(HANO)"]},"18":{"c":["雪乃イト"]},"最終話 (Acoustic Ver.)":{"c":["Tsubasa Harihara (HarryP)"],"a":["장재훈","REQ"]},"ADDICT!ON":{"c":["ESAI","REQ","Memme","문연","제이돕","ONAIR(온에어)","CLEF CREW"],"a":["ESAI"]},"最終花":{"c":["Tsubasa Harihara (HarryP)"],"a":["Masataka Aratomai"]},"青い宝石と竜の子":{"c":["Miyako Matsuoka"]},"Frozen Eclipse":{"c":["REQ"]},"The Last Flower":{"c":["Tsubasa Harihara (HarryP)"],"a":["Masataka Aratomai"]},"Little Love":{"c":["Taro Shibayama"]},"Placebo":{"c":["희장(Coke paris)","김기산","김명관"],"a":["Coke paris"]},"Allergy":{"c":["PAPRIKAA","BrotherSu","Lim Jeong-woo"],"a":["Jeongwoo Lim","PAPRIKAA"]},"Catalepsy (カナシバリ)":{"c":["秋浦智裕"]},"Vaundy":{"c":["Vaundy"]},"不亂不破":{"c":["崔瀚普"],"a":["AzureHead","崔瀚普","堀江晶太"]},"ドールズ":{"c":["なつめ千秋"]},"エンジョイ":{"c":["北川悠仁"]},"シング・サイン・シンフォニー":{"c":["なつめ千秋"],"a":["うしー"]},"Break through":{"c":["ミナミイズミ"],"a":["山下真和"]},"諦めることを諦めたい":{"c":["ミナミイズミ"],"a":["永澤和真"]},"ぐるぐる":{"c":["ミナミイズミ"],"a":["東京真中"]},"心の残響":{"c":["ミナミイズミ"],"a":["えいぷ"]},"結晶":{"c":["ミナミイズミ"],"a":["nosono"]},"リバイバルゼロ":{"c":["ユギカ"]},"MIRAI":{"c":["toku"],"a":["GARNiDELiA"]},"ノイズ":{"c":["ミオヤマザキ"],"a":["KenKen"]},"Year N":{"c":["Cassie Wei","Yamato Kasai"],"a":["Yamato Kasai"]},"Nectar":{"c":["まふまふ"]},"憧憬人魚姫":{"c":["YASUHIRO（康寛）"]},"夏の半券":{"c":["みきとP"]},"8.32":{"c":["*Luna"]},"心象カスケード":{"c":["koyori(電ポルP)"]},"さよならはきえない":{"c":["みきとP"]},"QUEEN":{"c":["Kanaria"]},"夏待ち":{"c":["北川勝利"],"a":["ROUND TABLE","桜井康史","窪田ミナ"]},"エルドローブ":{"c":["Kainē"]},"波音のプレリュード":{"c":["Shogo Nomura"]},"Blue Aqua":{"c":["佐藤純一（fhána）"]},"꿈의 신호(Dream Signal)💭 Official Video":{"c":["甘い夢","Shirayuki Hina"]},"Sweet Dreams, My Dear(Lost Ark)":{"c":["장여울"]},"드라마(Drama)":{"c":["아이유 (IU)"]},"Catch the Summer (夏拏)":{"c":["*Luna"]},"하나(夏拏)":{"c":["*Luna"]},"約束の花":{"c":["Aqu3ra"]},"imaginaly":{"c":["kamome sano"]},"intention":{"c":["NUU$HI"]},"Violet":{"c":["花鋏キョウ"]},"Aonitamerau":{"c":["ポリスピカデリー"]},"空が鳴っている":{"c":["亀田誠治"],"a":["東京事変"]},"タクト - Happy Merry Xmath":{"c":["ryo (supercell)"]},"舟":{"c":["堀江晶太"]},"Laziness":{"c":["HiFi-P"]},"ハレバレ":{"c":["kani"]},"眩々":{"c":["rinri"]},"at dawn":{"c":["higma"]},"自分ごっこ":{"c":["rinri"]},"コバルト・ブルー":{"c":["やま"]},"0.08":{"c":["やま"]},"杪夏":{"c":["Laica"]},"薄明の約束":{"c":["yama"]},"わたしね、、":{"c":["熊川みゆ"],"a":["大久保友裕","Kumamiyu"]},"Blue Bird":{"c":["熊川みゆ"]},"Synesthesia":{"c":["本間昭光"]},"アジンガマサラ (feat. RRR)":{"c":["ヌビア"]},"ハーフ・エルアール":{"c":["ORYO"]},"GIVER":{"c":["ORYO(FAULHEIT)"]},"僕の声":{"c":["内田直孝"]},"オメガリズム":{"c":["青山友樹"]},"ASEED":{"c":["ZAQ"]},"フューエル":{"c":["鬱P"]},"ムーンライト・デライト":{"c":["打打だいず"]},"つきのうた（It's my song, It's your song）":{"c":["河原憂祐"]},"Pulsatilla":{"c":["Tansa"]},"プリズムのお姫様":{"c":["どんまる"],"a":["奈須野新平 (Rebrast)"]},"未来への空地図":{"c":["市瀬るぽ"]},"PAPARACHA":{"c":["めろくる/Mellowcle"]},"9UTE!!":{"c":["金山秀士"]},"恋風":{"c":["幾田りら"],"a":["Carlos K."]},"余命宣告":{"c":["閻魔P"]},"春恋":{"c":["閻魔P"]},"トラウマ":{"c":["閻魔P"]},"サイレン":{"c":["閻魔P"]},"ロストメモリー":{"c":["山崎光（Arte Refact）"]},"ゴーストレタッチ":{"c":["廉"]},"透影":{"c":["umigame"]},"DEEP SHADOW":{"c":["rukaku"]},"水玉と月光":{"c":["蒼井純人"]},"Lady grey":{"c":["蒼井純人"]},"散歩道":{"c":["YUZAME"]},"瞼残火":{"c":["YUZAME"]},"star shine":{"c":["TIDY","EINN"],"a":["TIDY"]},"Slow Dancing":{"c":["Sincere","Chocoholic"],"a":["Chocoholic"]},"Parallax":{"c":["A.G.O","アマアラシ(from ミセカイ)"],"a":["A.G.O"]},"ほしをみるひと。":{"c":["ぷにぷに電機"],"a":["Taishi Sato"]},"Glitter Luv":{"c":["YUC'e"]},"透明流星ラプソディ":{"c":["HIDEYA KOJIMA"]},"クローゼット":{"c":["HIDEYA KOJIMA"]},"走れシュガー":{"c":["HIDEYA KOJIMA"]},"天使の翼。":{"c":["A4。"]},"Non-Mellow":{"c":["楽園市街"]},"桜見丘":{"c":["野見山睦未","永嶋圭司"],"a":["Local Bus","石川鉄男"]},"relic":{"c":["奏"]},"リトルハミング":{"c":["堀江晶太"]},"ふれるよるに":{"c":["古川本舗"],"a":["和音正人","古川本舗"]},"潜光":{"c":["DJ WILDPARTY"]},"セイシュンライナー":{"c":["papiyon"]},"遊園市街":{"c":["ハチ"]},"さっさかサレンダー":{"c":["メドミア"]},"バラードじゃ物足りないわ":{"c":["Noz."]},"circus":{"c":["根津まなみ","井上惇志"],"a":["井上惇志"]},"バズらない愛":{"c":["もの憂げ"]},"kunzite":{"c":["narry"]},"Glory sun":{"c":["buzzG"]},"ないない":{"c":["毛蟹(LIVE LAB.)"],"a":["小松一也","宮野幸子"]},"Unbreakable Sphere (승리의 여신: 니케 OST)":{"c":["Cosmograph"],"a":["Cosmograph","Nauts"]},"TAEYEON (태연) 'To. X'":{"c":["Stephen Puth","Dazy","Kristin Carpenter"]},"꿈의 카니발 (Grand Feast Daydream)":{"c":["Obadiah Brown-Beach"]},"Maid My Way":{"c":["Reica"],"a":["Reica","oco(이다윗)"]},"BALALAIKA":{"c":["Marchin","Tana.H","芦田菜名子"]},"BLUE MOON":{"c":["Marchin","Tana.H","芦田菜名子","Kohei Kiriake"]},"ネオラダイト":{"c":["Tana.H","KOHEI KIRIAKE","Amala","Marchin"]},"混線と対話":{"c":["蓮尾理之"]},"シグナルグラフ":{"c":["myu"]},"手のひらの楽園 (HQ Audio)":{"c":["MANYO"]},"ぼくらのうた":{"c":["堀江晶太"]},"トゥモローアゲイン":{"c":["堀江晶太"]},"アッパライナ":{"c":["堀江晶太"]},"まわり":{"c":["あおい。"],"a":["MARUMOCHI"]},"神頼みヒーロー":{"c":["ドゥー"]},"ホワイトノイズ":{"c":["藤原聡"],"a":["Official髭男dism"]},"LeMU ～遙かなるレムリア大陸～":{"c":["志倉千代丸"],"a":["磯江俊道"]},"天武の舞、暁の門":{"c":["志倉千代丸"]},"小さなブリリアント":{"c":["志倉千代丸"]},"それは世界を越えて":{"c":["RD-Sounds"]},"恋のイリュージョニスタ":{"c":["koyoron"]},"無法地点":{"c":["Shun Aratame"]},"未完成ランデヴー":{"c":["夏目縋"]},"葛藤Tomorrow":{"c":["松隈ケンタ"],"a":["SCRAMBLES"]},"僕":{"c":["カンザキイオリ"]},"Divas Eid":{"c":["早川博隆","柿迫ヒカル"]},"Funeral":{"c":["早川博隆","柿迫ヒカル"]},"終点":{"c":["Misumi","EMA"]},"哀色エンパシー":{"c":["watanabe"]},"空が凪いだら":{"c":["yoss"]},"青盲論":{"c":["baKe"]},"ネモフィラ":{"c":["Qisano"]},"574":{"c":["Qisano"],"a":["Takayuki Ishikura"]},"カンタービレ":{"c":["Qisano"],"a":["Takayuki Ishikura"]},"BIAS:METER":{"c":["REiNa"]},"ワスレボシ":{"c":["REiNa"]},"Astral Note":{"c":["REiNa"]},"クロユリ":{"c":["塚越雄一朗 (NanosizeMir)"]},"L'ultima nota":{"c":["Powerless"]},"scabiosa":{"c":["ああああ"]},"Day before Memory":{"c":["マグナム三郎","ねいびー"],"a":["大仏太郎"]},"暁のLeaf Boat":{"c":["チンプティマンプティ","大津村正"]},"ultimate breaKING":{"c":["人狼仮面"]},"浮世謳歌生命教":{"c":["YAMAAD"],"a":["YAMAAD","山田淳平"]},"カルディア":{"c":["ユリイ・カノン"]},"シンギラ":{"c":["ユリイ・カノン"]},"命運":{"c":["堀江晶太"]},"あの夏の隠れ家":{"c":["水上浩介"]},"RAKUEN":{"c":["Noz."]},"クラムボン":{"c":["momo"]},"冷たい壁のむこうに":{"c":["momo"]},"恋するキリギリス":{"c":["momo"]},"轟":{"c":["園田健太郎"]},"結び":{"c":["園田健太郎"]},"メタハンマー":{"c":["園田健太郎"]},"疲れたからさ":{"c":["瀬名航"]},"ベビーデーズ":{"c":["Chinozo"]},"スコール":{"c":["春野"]},"薄陽":{"c":["waka"],"a":["山本一輝"]},"ルナ":{"c":["waka"],"a":["UK"]},"罰ゲーム":{"c":["waka"]},"Burn Ash":{"c":["石濱翔(MONACA)"]},"恋ひ渡る雨粒":{"c":["香椎モイミ"]},"君がくれた音":{"c":["40mP"]},"女サムライが歌ってみた】ONE OK ROCK":{"c":["Taka"],"a":["akkin","ONE OK ROCK"]},"colors":{"c":["大沼パセリ"]},"In Your Eyes":{"c":["Osanzi"]},"ズルくてすごい":{"c":["一二三"],"a":["サイトウ リョースケ","Carlos K."]},"Recollection":{"c":["矢野達也"]},"Miracle heart!":{"c":["斎藤悠弥"]},"放課後アメージンッKiss":{"c":["斎藤悠弥"],"a":["伊藤直樹"]},"JOYFUL":{"c":["斎藤悠弥"]},"drop":{"c":["ケンモチヒデフミ"]},"Baby UFO":{"c":["ケンモチヒデフミ"]},"悪い人":{"c":["かやゆー"]},"聖心少女":{"c":["シャノン"]},"メテオ":{"c":["じょん"]},"鳴潮】ダーニャEP「Decensus Ad Nihilum (JP Ver.)":{"c":["Justin Phillips"]},"剣花":{"c":["夢見クジラ"]},"aimai":{"c":["瀬名航"]},"わたしのアイス":{"c":["mereo","sol"]},"Hope Song":{"c":["夢見クジラ"],"a":["夢見クジラ","Yocke"]},"その刹那、焔につき。":{"c":["廉"]},"呪り-inori-":{"c":["Street"]},"死神":{"c":["米津玄師"],"a":["米津玄師","坂東祐大"]},"いえない":{"c":["ひらぎ"]},"螺旋 -RASEN-":{"c":["SAS","LOAR","Sho from MY FIRST STORY"]},"えいえんなつやすみ MV":{"c":["⟳"]},"moonlight MV":{"c":["ねこむら(cat nap)"]},"ラヴレス MV":{"c":["NARUMI HELVETICA"]},"薄明":{"c":["齋藤奏太","柴崎あゆみ"]},"NullPointerException":{"c":["三谷秀甫"]},"Don't get in my way":{"c":["三谷秀甫"]},"Summer (Paul Blanco Feat. BE′O)":{"c":["BRLLNT","Arto"],"a":["BRLLNT"]},"Summertime [이터널 리턴 OST]":{"c":["haru","YUMU","3Q4L"]},"Born To Run [봉누도 Official Sound Track]":{"c":["Mitsukiyo"]},"Star Trail":{"c":["松本文紀"]},"青と親友 (Yuricia)":{"c":["大橋柊平"]},"blue sky, blue star (Anime Ver.) (セツ)":{"c":["Q flavor"],"a":["深澤秀行"]},"Up To You":{"c":["MIMI"]},"The Pale Moonlight":{"c":["白夏十日"]},"Balloon":{"c":["saikawa"]},"逃避行":{"c":["Eve"],"a":["Numa","Zingai"]},"はこゆめ":{"c":["つかもともく"]},"Fall in Love":{"c":["Suiet"]},"kick [試唱]":{"c":["猫アレルギー"]},"ミッドナイト":{"c":["水野あつ"]},"永遠に咲く花":{"c":["水城新人"]},"BREAKING!":{"c":["宮崎京一"]},"Noiseless":{"c":["DjeDje","Shuya Masayoshi"]},"潤色の祈り":{"c":["青柳諒"]},"アンルート":{"c":["40mP"]},"ユレル、クレル、ハゼル":{"c":["ヒゲドライバー"]},"白命":{"c":["rinri"]},"アメクミゾレ":{"c":["サクライケンタ"]},"花風":{"c":["ふーか。"]},"初恋モーメント":{"c":["Kaho"],"a":["サクマリョウ"]},"下の名前で呼ばないで":{"c":["Canaco"]},"crazy night":{"c":["some"],"a":["田仲圭太"]},"Barely Last":{"c":["松隈ケンタ"],"a":["田仲圭太"]},"双生コンフリクト":{"c":["香椎モイミ"]},"Mr.Friday":{"c":["むゆるん"]},"Tomorrow":{"c":["Sorato","YHEL","gratia","Ryo Ito"],"a":["Sorato"]},"Sweetie":{"c":["GARDEN","Tim Tan","Ciara Muscat","Krady"],"a":["GARDEN","Krady"]},"ホシノキズナ":{"c":["kz"]},"青の風":{"c":["Yoshifumi Kanamaru"],"a":["Ruka Kawada"]},"恋仲花火 (feat. enu)":{"c":["田村雄太"]},"演技で染めた二人の日々に。":{"c":["まつり"]},"蒼穹のBlue Grandia":{"c":["本多友紀(Arte Refact)"],"a":["河合泰志"]},"Break the Blue!!":{"c":["高瀬一矢"]},"Bless":{"c":["YOSHIHIRO(KEYTONE)"]},"Black Bird":{"c":["飛内将大"],"a":["玉井健二","百田留衣"]},"UNFINISHED":{"c":["tomoya"]},"Before the daylight":{"c":["tomoya"]},"さようなら":{"c":["神馬譲"]},"紡ぎ星":{"c":["神馬譲"]},"直感オーバーライト":{"c":["40mP"]},"オルビット":{"c":["*Luna"]},"refrain moon":{"c":["内藤侑史","山田屋カズ"]},"七色の地図":{"c":["俊龍"],"a":["三宅博文"]},"One Flower":{"c":["CHOI SUNYUL","CHOI UNYUL"],"a":["CHOI SUNYUL","CHOI UNYUL","HWANG SU HUN"]},"Illusionism":{"c":["최선율","최운율"]},"JUICE（ララ）":{"c":["梅とら"]},"乙女的サイコパシー":{"c":["カンザキイオリ"]},"ふたりの形 (studio ver.)":{"c":["capo2"]},"let go":{"c":["capo2"]},"Message":{"c":["MASAYA SUZUKI"]},"Don't Forget Memory":{"c":["YASUHIRO HOSHINO"],"a":["鈴木雅也"]},"ゆるされないで":{"c":["水槽"]},"Dasvidaniya":{"c":["Justin Phillips"]},"灯り月":{"c":["MIMI"]},"もう、忘れてもいいよ。":{"c":["m","K4nji"]},"H2O":{"c":["ピクセルビー"]},"ZYPRESSENの花束":{"c":["Pixelbee"]},"もっとプリンセス！":{"c":["unMOMENT"],"a":["4-EVER"]},"あの日の空":{"c":["unMOMENT"],"a":["4-EVER"]},"クジラ病棟の或る前夜":{"c":["トーマ"]},"全部夢だった！":{"c":["黒うさぎ"]},"二人模様":{"c":["MIMI"]},"Happy Hypnoctism":{"c":["堀江晶太"]},"Unveil":{"c":["*Luna"]},"ミライ＝テレポート":{"c":["ねんね"],"a":["佐々木聡作"]},"星空へ架かる橋":{"c":["上松範康 (Elements Garden)"]},"4SEASONs":{"c":["上松範康 (Elements Garden)"],"a":["藤間仁 (Elements Garden)"]},"人間らしい":{"c":["ユリイ・カノン"]},"撫子色ハート":{"c":["ユリイ・カノン"]},"Nadenna":{"c":["Hiiragi Magnetite"]},"ナイトルール":{"c":["煮ル果実"]},"みにまむ":{"c":["MIMI"]},"もでらーと":{"c":["MIMI"]},"闇に落ちる涙":{"c":["bassy"]},"幻影ノスタルジア":{"c":["mo2","wight"]},"アオとキラメキ":{"c":["清家寛"]},"Twinkle":{"c":["渡辺翔"]},"月明かり":{"c":["セフィナ"]},"旅の扉":{"c":["7OAST","ESAI"]},"ヴェルヴェット":{"c":["内緒のピアス"]},"僕らの記憶を掠わないで":{"c":["rinri"]},"レッド・ルーラー":{"c":["sasakure.UK"]},"一瞬の永遠":{"c":["草野華余子"],"a":["草野華余子","eba","岸田(岸田教団&THE明星ロケッツ)"]},"Do or Die":{"c":["堀江晶太"]},"FIGHT SONG":{"c":["堀江晶太"]},"ふたりかくれんぼ (feat. カゲチヨ, シディ & ヨーメイ)":{"c":["皆見朝"]},"ブルーダイアリー":{"c":["meiyo"]},"Midnight Mission":{"c":["TAKU INOUE"]},"僕のための歌":{"c":["ルンルン","DYES IWASAKI(FAKE TYPE.)"],"a":["DYES IWASAKI(FAKE TYPE.)"]},"新天体 -Clock mercy ver.-":{"c":["ルンルン","WICSTONE"]},"Burning charming":{"c":["大野貴寛"],"a":["Mwk"]},"Happy Shelter":{"c":["周防パトラ"]},"不老不死":{"c":["龍崎一"]},"夜が明けたら":{"c":["龍崎一"]},"夜空に引いた線 (甘神夜重)":{"c":["鶴崎輝一"]},"White Destination (アテナ)":{"c":["小高光太郎","ichi"],"a":["小高光太郎"]},"Fixer":{"c":["100回嘔吐"]},"picture frame":{"c":["Mei Iwasaki"],"a":["Masaki Iehara"]},"Bitter":{"c":["ロス"],"a":["100回嘔吐"]},"ChaO!":{"c":["Hi-yunk(BACK-ON)"]},"walk":{"c":["Kikuchi Kazuhito"],"a":["鈴木雅也"]},"メテオトレイル":{"c":["*Luna"]},"禁忌肢":{"c":["なきそ"]},"我魂為君":{"c":["与猶啓至"]},"ピースワーク":{"c":["樋口秀樹"]},"PRELUDE":{"c":["tomita"],"a":["福島章嗣"]},"プラチナ (Platinum)":{"c":["菅野よう子"]},"Fly Again!!":{"c":["小高光太郎","UiNA"],"a":["牧野太洋"]},"Wish for you":{"c":["Imaban"],"a":["石倉誉之","Imaban"]},"no man’s world":{"c":["音羽-otoha-"]},"STRAIGHT BET":{"c":["MYTH & ROID"]},"Hajimariの合図":{"c":["北川悠仁","佐々木“コジロー”貴之"],"a":["佐々木“コジロー”貴之"]},"DELICIOUS HAPPY DAYS♪":{"c":["ヒゲドライバー"]},"アマカミサマ":{"c":["田中秀和"]},"ソラの果てまで":{"c":["森本練"]},"花筏":{"c":["Orangestar"],"a":["TAKU INOUE","永山ひろなお","Orangestar"]},"灯台":{"c":["Orangestar"]},"Oh wow!":{"c":["メガテラ・ゼロ"],"a":["つっくん"]},"ティーンエイジブルー":{"c":["Eve"],"a":["Numa"]},"グッバイ・ララバイ":{"c":["habana"]},"指先ハート":{"c":["木村孝明"]},"KING OF EVIL":{"c":["本多友紀"]},"すーぱーびっぐらぶ！":{"c":["ヒゲドライバー"]},"Portrait":{"c":["Bank of Innovation, Inc."]},"Moshimo":{"c":["Akki"]},"愛 make CRAZY world":{"c":["堀江晶太"]},"夜明けのベルが鳴る":{"c":["堀江晶太"],"a":["堀江晶太","瀬恒啓"]},"ソラコイ (空恋)":{"c":["東条サダヲ","セクシー大統領","北澤伸一郎"],"a":["東条サダヲ"]},"宵月":{"c":["1991"]},"金木犀の夜":{"c":["佐藤千亜妃"]},"ヤラララ":{"c":["AnythingBecomeMoe"]},"おきらくスーパースター":{"c":["佐々木創良"]},"Otoshimono":{"c":["40mP"]},"Yohaku":{"c":["40mP"]},"片想いのメロディを":{"c":["鶴丸雄太"],"a":["堀江晶太"]},"Lingering Traces":{"c":["山本彩","小名川高弘"],"a":["小名川高弘"]},"Lamento":{"c":["山本彩","多保考一"],"a":["多保考一"]},"【声優が歌ってみた】我ら！ゴミ分別団":{"c":["かてらざわ"]},"HighSpeed◎Hurricane (日向千夏)":{"c":["Medansy"]},"FaV -F*** and Vanguard-":{"c":["cittan*"]},"レジリエンス":{"c":["志倉千代丸"],"a":["悠木真一"]},"Mon Ciel Bleu～わたしのあおいそら～":{"c":["佐々倉有吾"]},"魔法の歌 (志摩きりん)":{"c":["ヒゲドライバー"],"a":["篠崎あやと"]},"路傍の真夏":{"c":["ばくの群れ"]},"プラトニック・ラヴ":{"c":["メル"]},"一体いつから｜初星学園":{"c":["大橋ちっぽけ"],"a":["岩崎隆一"]},"だきしめるまで。":{"c":["MIMI"]},"イレギュラートリップ":{"c":["ながはな"]},"深更":{"c":["佐々木正明"]},"あと1メートル":{"c":["ハヤシケイ"],"a":["堀江晶太"]},"アオトアオ (葦原ミコ)":{"c":["高木龍一"]},"White Eternity":{"c":["野崎心平"],"a":["Gravity musik"]},"終わりなき夏 永遠なる音律":{"c":["神崎ゆう","藤末樹"],"a":["藤末樹"]},"レゾナンス・レゾナンス (イノー)":{"c":["アオワイファイ"]},"Immutable (ケルシー)":{"c":["Robert Wolf"]},"恋の押し売り":{"c":["HoneyWorks"]},"こころミルキーウェイ！":{"c":["小幡康裕"],"a":["山下洋介"]},"1991":{"c":["米津玄師"]},"想い知る":{"c":["橋口洋平"],"a":["村中慧慈"]},"救いを求めるヒトの詩":{"c":["近藤佑輔"]},"SweetVice":{"c":["myu"]},"エウテルペ":{"c":["ryo"]},"朱月の季節":{"c":["野村勇輔"]},"名もなき詩":{"c":["桜井和寿"]},"끝나지 않은 노래":{"c":["Adam Gubman"]},"Drowning":{"c":["WOODZ","NATHAN","HOHO"],"a":["NATHAN","HOHO"]},"くもりのうた":{"c":["buzzG"]},"天気雨":{"c":["Nei"]},"Hey Darling!":{"c":["堀江晶太"]},"my little wish":{"c":["田中俊裕"]},"​アオイロ":{"c":["豊住サトシ"]},"虹":{"c":["石崎ひゅーい"],"a":["Tomi Yo"]},"メディアノーチェ":{"c":["ACAね"],"a":["100回嘔吐","ZTMY"]},"相対性インソムニア":{"c":["夜丹れにや"]},"フォーエバー中坊":{"c":["前山田健一"],"a":["鈴木雅也"]},"フユコイ":{"c":["田仲圭太"],"a":["松隈ケンタ"]},"花弁":{"c":["ナノウ"]},"文学少年の憂鬱":{"c":["ナノウ"]},"Go-Go-Adventure!":{"c":["第二文芸部"]},"t r a v e l e r s":{"c":["第二文芸部"]},"フラグライフ":{"c":["やしきん"]},"Gaming!":{"c":["弦月藤士郎"]},"Re:LieF(レリーフ) OP FULL 「Re:TrymenT」":{"c":["甘利紗陽"]},"Re:何度目かのはじめまして":{"c":["山口たこ"]},"ウラオモテ":{"c":["Giga"]},"NAME":{"c":["堀江晶太"]},"May day+":{"c":["えびかれー伯爵"]},"May day+^2":{"c":["えびかれー伯爵"]},"marionnette":{"c":["kazuya takase"]},"pledge of stars":{"c":["Tomoyuki Nakazawa"],"a":["Kazuya Takase"]},"Revive":{"c":["Aqu3ra"]},"ヴァイパー":{"c":["柊マグネタイト"]},"スターチップフラペチーノ":{"c":["DYES IWASAKI"]},"Choose Your Way":{"c":["彦田元気"]},"Equation":{"c":["ckwa"]},"Twilight Ribbon":{"c":["鈴谷皆人"]},"鯨神のティアスティラ ED2":{"c":["薬師るり"],"a":["根本克則"]},"アペイリア":{"c":["薬師るり"],"a":["根本克則"]},"空と遊園地":{"c":["kanju"]},"Kimito Hutaride Yukiwo Nagetahi":{"c":["kanju"]},"caramel ribbon cursetard":{"c":["ミト"]},"いつも二人がいいね":{"c":["斎藤仁久","小高光太郎"]},"ミライアワセ":{"c":["ユタ","ヒサメ"]},"愛です。嫌いです。":{"c":["シグレ"],"a":["ぬゆり"]},"ベルカ (feat. ミフメイ)":{"c":["ミフメイ"]},"Aquarium":{"c":["MY NEW GEAR"]},"ラブ＆デストロイ":{"c":["MI8k"]},"7":{"c":["梅とら"]},"はじまりの音":{"c":["dela shoma"]},"あなたがくれた宝物":{"c":["dela shoma"]},"銀色":{"c":["長沢知亜紀","永野小織","YHEL"],"a":["ESME MORI"]},"Happy Ever After":{"c":["李童一心"],"a":["高橋修平"]},"VICTORY PORTION":{"c":["いちからDJ部"]},"フーテンダンス (feat. KIBAKO & aruma)":{"c":["KIBAKO"]},"Netafuri":{"c":["園田健太郎"],"a":["APAZZI"]},"星団歩行":{"c":["TakuOouchi"]},"結婚行進曲":{"c":["雨曇"]},"赤ペンおねがいします":{"c":["椎名もた"]},"クレール":{"c":["konoco"]},"インフェルノ":{"c":["大森元貴"]},"Lady Go!":{"c":["宅見将典"]},"桃幻浪漫":{"c":["小高光太郎","sumiisan"],"a":["小高光太郎"]},"Life is サイダー -TV size-":{"c":["秋葉広大"],"a":["小松一也"]},"Ryokoukeikaku":{"c":["Anna"],"a":["Naoki Itai"]},"虚空のシズク":{"c":["Antistar"]},"アロー":{"c":["シキ","Awkmiu"],"a":["Awkmiu"]},"Inanna no Mita Yume":{"c":["志倉千代丸"],"a":["悠木真一"]},"強がり":{"c":["清澤実来"]},"6:00 PM":{"c":["井上竜馬(SHE'S)"],"a":["井上竜馬(SHE'S)","服部栞汰(SHE'S)"]},"Tokyo stuck":{"c":["渡辺翔"],"a":["eba"]},"明けない夜のリリィシリーズ":{"c":["傘村トータ"]},"ずっとふたりで":{"c":["LTunes"]},"AngelRing ～繋げようよ恋のリング～":{"c":["Cy-Rim Project","Corey&Carter"]},"光の空のクオリア":{"c":["志倉千代丸"],"a":["水野大輔"]},"Evidence":{"c":["40mP"]},"Allure of the Dark":{"c":["HIDEYA KOJIMA"]},"BE ME":{"c":["Doul","URU"],"a":["URU","堀江晶太"]},"Never Ends":{"c":["株式会社バンク・オブ・イノベーション"]},"華向":{"c":["ES-TRUS"],"a":["板垣祐介"]},"Ghost Sequence":{"c":["藤永龍太郎"]},"Catch Me If You Can":{"c":["Terry Zhong","Renjin Zhao"],"a":["Renjin Zhao"]},"Dreams come true〜欲する翼〜":{"c":["ROCK★PANDA"],"a":["Yuichi Ohno"]},"ドメスティック・ドラスティック":{"c":["yowanecity"]},"ゴートゥーフェス☆":{"c":["ヒゲドライバー"]},"アニバーサリー":{"c":["FUKI","EIGO"]},"Aono Shioriuta":{"c":["LowFat"]},"Forget-Me-Not Wasurenagusa":{"c":["三橋隆幸"],"a":["Jin Nakamura"]},"WAKE:WOKE":{"c":["MEG","Kanata Okajima"],"a":["MEG"]},"ロンリーマート":{"c":["Gacharic Spin"],"a":["Gacharic Spin","角田崇徳"]},"DIVE into YOURSELF PV":{"c":["HIGH and MIGHTY COLOR"]},"夕立アンブレラ":{"c":["Helios+trope"]},"キミがボクなら":{"c":["志倉千代丸"],"a":["真下正樹"]},"ヒマワリ":{"c":["竹下智博"]},"キル×キラ×killer★":{"c":["大和","生亀貴之"],"a":["大和"]},"きらめき＊Chocolaterie":{"c":["藤井稿太郎"]},"Every-buddy goes！":{"c":["岩橋星実(Elements Garden)"]},"月光":{"c":["キタニタツヤ","はるまきごはん"]},"Ondine":{"c":["KANON"]},"Shining Road（実況パワフルプロ野球14主題歌　ロングバージョン）":{"c":["弓島隆子"]},"風の唄":{"c":["上原一之龍"]},"こなたよりかなたまで":{"c":["中沢伴行"],"a":["中沢伴行","羽越実有"]},"STAY FREE":{"c":["岩崎貴文"],"a":["水口浩次"]},"共感覚おばけ (re:marry mix)":{"c":["ササノマリイ"]},"divergent flow":{"c":["Hiroki"]},"-thymia":{"c":["慎之甫(VONOBA Inc.)"]},"Ignite the Flame":{"c":["Hiroki Katayama (Ukiyone)"]},"青空モーニンググローリー (花坂結衣)":{"c":["奥井康介"],"a":["奥井康介","小森茂生"]},"無限大ノック/Team BII":{"c":["園田健太郎"]},"ALONE":{"c":["MY FIRST STORY"]},"Never Let You Go!":{"c":["麻枝准"]},"アオゾラ":{"c":["ポチ"]},"全ての始まり":{"c":["Ryuga"],"a":["加古涼真"]},"リナリア":{"c":["KIYOSHI IKEGAMI"]},"生命のRebels":{"c":["翔","蓮実えれな"],"a":["翔"]},"リトルワールド":{"c":["五十嵐五十"],"a":["PompadollS"]},"ならばおさらば":{"c":["尾崎世界観"],"a":["キタニタツヤ"]},"Q & []":{"c":["ユリイ・カノン"],"a":["ユリイ・カノン","廣澤優也(HANO)"]},"ひなたぼっこ":{"c":["辻村有記","MEG（MEGMETAL）"]},"No title - Seaside Remix":{"c":["Reol","ギガ"],"a":["ぬゆり"]},"Paradox in the Mirror":{"c":["Amatsuka"]},"Can't You Say":{"c":["Roys"],"a":["koshin"]},"電線は消えても":{"c":["園田健太郎"]},"fakey merry game":{"c":["広川恵一（MONACA）"]},"ハレ晴レユカイ":{"c":["田代智一"],"a":["安藤高弘"]},"夕焼けといっしょに":{"c":["前山田健一"],"a":["三好啓太"]},"嵐の女王":{"c":["工藤帆乃佳"],"a":["安部遥音","Haruhito Nishi"]},"Chemical Soda":{"c":["ヒゲドライバー"]},"Lapis Lazuli":{"c":["tom・k","kors k"]},"Cat!!してSuperGirls":{"c":["園田健太郎"]},"Can now, Can now":{"c":["園田健太郎"],"a":["鈴木Daichi秀行"]},"カラフルムーンライト":{"c":["横山克"]},"Yurameku Honoo":{"c":["40mP"]},"菜の花のように":{"c":["駒木優"],"a":["星坂光"]},"FLYING FAFNIR":{"c":["Sayaka Kanda"],"a":["Billy"]},"Voyaging Star's Farewell":{"c":["王謝波"]},"呼び声":{"c":["丁"],"a":["丁","樂"]},"シュワシュワ":{"c":["杏沙子","石崎光"],"a":["伊賀拓郎"]},"So the youth":{"c":["katz"]},"サクラ 咲ク":{"c":["ユウ"]},"いっちゃえ! ぽぽたん":{"c":["桃井はるこ"],"a":["小池雅也"]},"フレアグランス":{"c":["清澄ライラ"]},"深青Philosophy":{"c":["さなぎ"]},"その瞳で":{"c":["亀本寛貴","XAI"],"a":["亀本寛貴"]},"蒼月の懺悔詩～Universal Nemesis":{"c":["ZUN"]},"Wonderful Wonder World*":{"c":["飛内将大"]},"Girls' Carnival":{"c":["ウミガメ"]},"風の旋律":{"c":["鳥海剛史"],"a":["南利一"]},"旅立ちのベル":{"c":["南田健吾"]},"Innocent Blue":{"c":["Mi-Ya"]},"ウィークエンドロール":{"c":["山崎真吾"]},"Let's Journey! don't you?":{"c":["田中隼人"]},"BRAVE GROOVE":{"c":["Medansy(TRIFRONTIER)"]},"tailwind":{"c":["みきとP"],"a":["カワムラヒロシ"]},"Self":{"c":["la la larks"]},"HyperNova":{"c":["m-flo","Maya","Novel Core","Alenoise","MONJOE","NOIZEWAVE","Satoru Kurihara -Jazzin'park-","Yackle"]},"Liar's Lie":{"c":["バンク・オブ・イノベーション"]},"Crow Blues":{"c":["光収容","麻枝准"]},"恋の☆Magic":{"c":["ms-jacky"]},"天マデトドケ☆":{"c":["ichi","小高光太郎"],"a":["小高光太郎"]},"レイラ":{"c":["40mP"]},"Helado":{"c":["関野元規"]},"Shandy Gaff":{"c":["miu"]},"哀悼、そして日常は続く":{"c":["卯花ロク"]},"さよならアネモネ":{"c":["niilu"]},"青い幸福":{"c":["相澤大"],"a":["凸"]},"Rain Lily":{"c":["駒木優"],"a":["星坂光"]},"シナリオ":{"c":["Tatsuo Kimura"]},"ラストシーン":{"c":["yona"]},"ハルカトオク":{"c":["藤澤慶昌"]},"Baby's breath":{"c":["Kosuke Morimoto"],"a":["鈴木雅也"]},"Warrior Oath":{"c":["Kenichi"],"a":["ワシザムジカ"]},"Another Complex":{"c":["somei"],"a":["古川貴浩"]},"Reach for the sky":{"c":["井手コウジ"],"a":["鈴木雅也"]},"歌姫が死んだ":{"c":["吸う彩度"],"a":["飯澤遥土"]},"DEEP BLUE TOWNへおいでよ":{"c":["利根川貴之","坂和也"],"a":["坂和也","Wicky.Recordings"]},"キミのとなり":{"c":["Famishin"],"a":["森まもる"]},"Chase your way!（ショートサイズ）":{"c":["園田健太郎"]},"青の蛍言葉":{"c":["アオトケイ"]},"MOON":{"c":["只野楓"]},"名前のない君へ":{"c":["thug.B"]},"silent days":{"c":["渡辺拓也"]},"LOOP":{"c":["うぴ子"]},"アートの自由":{"c":["荻凪裕作"]},"石ころ願望":{"c":["古屋葵"]},"藍時雨":{"c":["Aqu3ra"]},"涙はみせない":{"c":["みきとP"]},"knot Country Version":{"c":["clapscrap"],"a":["Torao"]},"にじースターダスト":{"c":["田仲圭太"],"a":["SCRAMBLES"]},"あかね色に染まる坂":{"c":["野中\"まさ\"雄一"]},"ぱじゃまParty":{"c":["ヒゲドライバー"]},"White Promise":{"c":["Islet"]},"夏の幻":{"c":["なお"]},"あんずの花":{"c":["すりぃ"]},"연예인":{"c":["PSY","유건형"]},"降る星のアスター":{"c":["たてべなお","コミナミ"]},"運命共同体！":{"c":["音莉飴","メブキユウ"],"a":["MARUMOCHI"]},"ルティナ":{"c":["MIMI"]},"ひとひらの、だいすきを":{"c":["西坂恭平(12th colors)"]},"君は夏風":{"c":["Bocchi"]},"やじるし→":{"c":["山下宏明"]},"「 $BW; (B」)":{"c":["x0o0x_"]},"Awesome!":{"c":["下田晃太郎(Elements Garden)"]},"Linaria":{"c":["Ryuga"],"a":["吹野クワガタ"]},"とまどい→レシピ":{"c":["Junky"]},"Starry Rain":{"c":["Taishi"]},"残光ルミネセンス":{"c":["どんまる"]},"風のRhythm":{"c":["石井裕樹"]},"隙":{"c":["原口沙輔"]},"青色プロフィール":{"c":["picco"]},"ハウリング":{"c":["ZUN"],"a":["kaztora"]},"【MV】ちっちゃな革命（Song":{"c":["バンク・オブ・イノベーション"]},"星の降らないタイムライン":{"c":["園田健太郎"]},"Blue Shining Star":{"c":["アイナ・ジ・エンド","Ryosuke \"Dr.R\" Sakai"],"a":["Ryosuke \"Dr.R\" Sakai"]},"Prelude":{"c":["OSTER project"]},"麗う":{"c":["argɐ","ねりきり","涼木シンジ"],"a":["ねりきり","涼木シンジ"]},"フロンティア":{"c":["ノイ"]},"AMBITION":{"c":["岩橋星実（Elements Garden）"],"a":["竹田祐介（Elements Garden）"]},"わたしが幸せであるために":{"c":["近藤世真(Elements Garden)"]},"Mushroom":{"c":["Enna Alouette","keiki"],"a":["keiki"]},"sunbeams":{"c":["R Sound Design"]},"笑顔の花言葉":{"c":["Tansa"]},"残像の高鳴り":{"c":["松隈ケンタ"],"a":["SCRAMBLES"]},"レイドバックジャーニー":{"c":["久下真音"]},"わからない果実たち":{"c":["橋本由香利"],"a":["安藤高弘"]},"Kiseki":{"c":["GReeeeN"],"a":["JIN"]},"明日もBeautiful Day":{"c":["丸山真由子 (Blue Bird's Nest)"],"a":["清水武仁 (Blue Bird's Nest)"]},"メニメリ・メモリーズ！":{"c":["石濱翔(MONACA)"]},"ときめきランデヴー":{"c":["辻林美穂"]},"世界はそれを愛と呼ぶんだぜ":{"c":["山口隆"],"a":["サンボマスター"]},"セレナーデ":{"c":["なとり"],"a":["なとり","ツミキ"]},"yummy goodday":{"c":["岩崎慧"]},"Code":{"c":["板垣祐介"]},"ヨロコビ･シンクロニシティ":{"c":["石濱翔(MONACA)"]},"スパッと!スパイ & スパイス":{"c":["ヒゲドライバー"]},"七色の絵の具で":{"c":["藤永龍太郎(Elements Garden)"]},"COLOUR":{"c":["遠藤信吾"]},"世界一の友人だったあなたへ":{"c":["Gom(MARUMOCHI)"],"a":["MARUMOCHI"]},"パジャマパーティー":{"c":["立山秋航"]},"【ハミダシクリエイティブ凸 あすみED】トキラキメキ【公式・FULL】 ボーカル：ヒヅキミウ":{"c":["哥丸雄貴"]},"『奇々解体』都市伝説解体センター 主題歌":{"c":["MURASAKI"],"a":["MURASAKI","かたたかんな"]},"もう一度":{"c":["ナノウ"]},"最強純情DNA":{"c":["ヒゲドライバー"]},"光のペンダント":{"c":["MIMI"]},"Cukup":{"c":["keigoaria"]},"Royal":{"c":["Junky"]},"【鳴潮/モーニエ】『風の名前』":{"c":["MIMI"]},"古今無双 (東郷美森)":{"c":["黒田賢一"]},"インフィニア":{"c":["Ceui","小高光太郎"],"a":["小高光太郎"]},"Kagiri Aru Toki no Naka de":{"c":["T2ya"],"a":["小高光太郎"]},"Lily (八乙女撫子)":{"c":["北澤ゆうほ"],"a":["佐藤厚仁"]},"君がいるから":{"c":["下川みくに"],"a":["Sin"]},"新時代壊造":{"c":["Seina"],"a":["Fuminnikki"]},"素敵なしゅうまつを！":{"c":["キタニタツヤ"],"a":["Mizore","Tatsuya Kitani"]},"Fall":{"c":["Tonic Holic"]},"Tears to Tiara":{"c":["豆田将"]},"不確定性☆COSMIC MOVEMENT～Walkure meets Ranka～ (Live Ver.) (ランカ・リー)":{"c":["姉田ウ夢ヤ"]},"流氷に消ゆキラリ":{"c":["前山田健一"]},"ただ美しい呪い":{"c":["Nakamura Hak"]},"可愛くって意地悪しちゃう":{"c":["ヒゲドライバー"]},"よしとしようよ":{"c":["ナノウ"]},"It's a fine day":{"c":["志倉千代丸"],"a":["上野浩司"]},"DEKISOKONAI CONTINUE":{"c":["堀江晶太"],"a":["みちる","篠崎あやと"]},"雪どけの街":{"c":["ヒゲドライバー"]},"カノジョ＊ステップ OP「ハレノヒステップ":{"c":["ウミガメ"]},"寝れない夜に":{"c":["くじら"]},"あなたは魔法":{"c":["UgokuBall"]},"優しい痣":{"c":["ナノウ"]},"Dive to Blue (アイマリン)":{"c":["玉屋2060%"]},"ヴィヴァーチェ！":{"c":["ZAQ"],"a":["高田暁"]},"君とのなくしもの":{"c":["折戸伸治"],"a":["nishi-ken"]},"死にたいと言ってくれ。":{"c":["かいゑ"]},"アルカディア":{"c":["宮崎京一"]},"Growing! (布良梓)":{"c":["Famishin"],"a":["椎名俊介"]},"夢路らびりんす (千矢)":{"c":["山田高弘"],"a":["大川茂伸"]},"蒼き隼が如く":{"c":["上野義雄"]},"paranoiaを":{"c":["つなまる(めざめP)"]},"蒼の彼方へ（eBASEBALLパワフルプロ野球2020主題歌）":{"c":["米須優太郎"],"a":["米須優太郎","渡邊紀如"]},"Speed of Light":{"c":["DJ Okawari"]},"ゆうづつすーぱーはいぱーみらくるそんぐ！":{"c":["もち(ﾉ)・ω・(ヾ)"]},"Bye Bye My Days":{"c":["田仲圭太(SCRAMBLES)"]},"水金地火木土天海よりどデカい愛！":{"c":["塩 à la mode"],"a":["ひこ"]},"Fanfare":{"c":["小名川高弘"]},"人生は愛と夢と冒険だ":{"c":["大塚紗英"],"a":["鈴木雅也"]},"一生分の星と逃げる":{"c":["傘村トータ"],"a":["堀江晶太"]},"青春とは？ (三谷裳ちお)":{"c":["園田健太郎"]},"Brightness":{"c":["田中俊裕（Sound Drive）"]},"여우비":{"c":["G.고릴라"]},"CHARACTER":{"c":["5u5h1"]},"花の跡":{"c":["Bank of Innovation, Inc."]},"ツノ":{"c":["40mP"]},"Hajimarino Oto":{"c":["Hayato Tanaka"]},"太陽とレインボー (琴川晶)":{"c":["yamazo"]},"hectopascal (七海燈子)":{"c":["本多友紀(Arte Refact)"],"a":["脇眞富"]},"ニホンゴワカリマセン (トマリン)":{"c":["園田健太郎"]},"海岸線":{"c":["えびかれー伯爵"],"a":["ハム"]},"弔花":{"c":["他人事"]},"白いサクラ咲いて":{"c":["野崎心平"]},"朝焼けを追い越す空 (リリアナ・マスカレード)":{"c":["ヒゲドライバー"],"a":["Powerless"]},"HURRAY!":{"c":["ナノウ"]},"Lone Star":{"c":["BOI"]},"さよならからはじまりへ":{"c":["堀江晶太"]},"案山子":{"c":["平葵","小唄","タイラトシユキ"]},"Sunday":{"c":["ヒゲドライバー"]},"この心臓に花束を":{"c":["40mP"]},"Heartful Gift":{"c":["恋白るな","Kanata Minegishi"],"a":["傘葱"]},"Digital Date":{"c":["ヒゲドライバー"]},"Unreachable":{"c":["mirai"]},"EverAfter":{"c":["eye burn"]},"Lost":{"c":["百田留衣"]},"あの日の願い (Full 歌詞付き)":{"c":["mi:cs"],"a":["a2c"]},"ぼくのかみさま":{"c":["羽生まゐご"]},"【Firstオリジナル曲】今を１番かわいく！":{"c":["雪乃イト"]},"いっそあなたを":{"c":["doriko"]},"夕色のねがいみち (甘神夕奈)":{"c":["金山秀士"]},"推しのラブより恋のラブ":{"c":["福田和也","Rick Sakurai"]},"Two Colors (ラム)":{"c":["ヒゲドライバー"]},"あとがき":{"c":["Noz."]},"アオ":{"c":["堀江晶太"]},"Alca":{"c":["中村泰輔"],"a":["中村泰輔","TomoLow"]},"木枯らし":{"c":["柚凪。"]},"光放て！":{"c":["松本文紀"]},"響宴":{"c":["LITTLE","大藪良太","Yuria Sannodo"],"a":["Yuria Sannodo"]},"わすれモノ":{"c":["いよわ"]},"ハイリー・センシティブ・ハート":{"c":["PSYQUI"]},"omeshiagarihakyoujyuni":{"c":["40mP"]},"Inocent flower":{"c":["ヒゲドライバー"]},"群像夏":{"c":["吉田真太郎"],"a":["吉田真太郎","米須優太郎"]},"フランネルフラワー":{"c":["40mP"]},"Prism -Album Version-":{"c":["池田綾子"]},"バルカローレ":{"c":["窪田ミナ"]},"とある語り手から、どこかの君へ":{"c":["椿山日南子"]},"エターナルファンタジー":{"c":["虹音"]},"ええじゃないか":{"c":["マサ"]},"全開＜アクセラレーション":{"c":["ヒゲドライバー"]},"春の風":{"c":["熊木杏里"],"a":["吉俣良"]},"いいんだよ":{"c":["園田健太郎"]},"ロマンチックを叶えて":{"c":["蛯沢いつか"]},"紅空恋歌":{"c":["片霧烈火"],"a":["Morrigan"]},"業火":{"c":["雪乃イト"]},"Heavenly Me":{"c":["大濱健悟"],"a":["玉井健二","大濱健悟"]},"Omowase Lovely":{"c":["Junky"]},"音楽を止めないで":{"c":["まるちゅう。"]},"5th single『ドラマティックサバイバー』公式MV":{"c":["雪乃イト"]},"空っぽの箱庭":{"c":["園田健太郎"]},"Tapestry":{"c":["園田健太郎"]},"Lilium":{"c":["小西香葉","近藤由紀夫"]},"Sunflower that never sleeps":{"c":["Aira"]},"君の指先":{"c":["ロリP"]},"Ortus":{"c":["針原翼"],"a":["棚橋EDDYテルアキ"]},"もしも運命の人がいるのなら":{"c":["Takashi Yamaguchi"]},"向いて":{"c":["hisui"]},"星空のいま":{"c":["塚本けむ"]},"Horizon":{"c":["矢作萌夏"],"a":["宗本康兵","矢作萌夏"]},"地獄車":{"c":["FAKE TYPE."],"a":["DYES IWASAKI"]},"believer (エリーゼ)":{"c":["ArmySlick","Giz'Mo"]},"Treasure":{"c":["橋本由香利"]},"One for All":{"c":["本田正樹"]},"透明感":{"c":["ほうのきかずなり","Idiot Pop"]},"Dream me up!":{"c":["DÉ DÉ MOUSE"]},"絵空事、夏の終わり":{"c":["雨沢レイ"]},"Control keys Conjunction":{"c":["Higedriver"]},"常夜鬼譚":{"c":["TOKOTOKO"]},"ビバ・ライ・ライ":{"c":["sakuma."]},"ひたむきシンデレラ！":{"c":["塩原大貴"]},"martini":{"c":["OSTER project"]},"再会系女子はどうすりゃいいですか？":{"c":["えびかれー伯爵"]},"縞模様":{"c":["夜崎ゆい"]},"As time goes by":{"c":["中上和英"]},"送華":{"c":["丁"]},"アイノウ・アイノウ (市村はるか)":{"c":["ヒゲドライバー"],"a":["烏屋茶房"]},"ひとりじゃないじゃん":{"c":["DECO*27"],"a":["Rockwell"]},"予感の途中 TV size ver.":{"c":["☆Taku Takahashi","ARAKI"],"a":["☆Taku Takahashi"]},"ハッピーエンドで眠らせて":{"c":["Aira"]},"Sakura (サクラ)":{"c":["若G"],"a":["小高光太郎"]},"Littlestone":{"c":["米村高広"]},"君の救世主になりたくて!":{"c":["小高光太郎"]},"すれすれ":{"c":["すこっぷ"]},"Aliare":{"c":["椎名俊介"]},"未来図":{"c":["40mP"]},"Anata no Negai Utau Mono":{"c":["doriko"]},"Daydream Syndrome":{"c":["void"]},"Dreamy Stairs":{"c":["さんうさぎ"]},"Memories are here":{"c":["松本慎一郎"]},"プレイ":{"c":["Giga"]},"メタモリボン":{"c":["emon(Tes.)"]},"REAL":{"c":["eye burn"]},"プリズムとレモネド":{"c":["432","最果みのり"],"a":["432"]},"Golden Route":{"c":["ウミガメ"]},"イエロー・サンシャイン":{"c":["堀江晶太"]},"夜空":{"c":["h-wonder"]},"Euphorium":{"c":["小高光太郎","UiNA"],"a":["小高光太郎"]},"Wind":{"c":["谷本真規"]},"嫌々":{"c":["りょうま"]},"Blue Christmas for You":{"c":["戸嶋友祐"]},"夢遊病":{"c":["Daitch"]},"STAND BY ME":{"c":["キツネDJ"]},"BLUE BUD":{"c":["青木陽菜"],"a":["UNDER_COVERS"]},"イノセンス":{"c":["まもも"]},"Aimless Story":{"c":["kz"]},"デビットビット":{"c":["アボガド6"]},"いつか世界が変わるまで":{"c":["佐高陵平"],"a":["園田健太郎"]},"partner":{"c":["斎藤悠弥"]},"蒼き炎":{"c":["Toshiyuki Omori"],"a":["shin-go"]},"夜明けの街":{"c":["kova"]},"救われていたんだ":{"c":["rinri"]},"さんぽびより":{"c":["あくまのゴート"]},"Dream Dust":{"c":["Xenesus"]},"バフォメット":{"c":["江戸川スミス"]},"黄昏の踊り場":{"c":["Bank of Innovation, Inc."]},"主":{"c":["CUR$E/Hakata"]},"クリーム":{"c":["くじら"],"a":["くじら"]},"GOKUSAI":{"c":["THE BINARY"]},"BANG!!!":{"c":["Giga"],"a":["Giga"]},"啄木鳥":{"c":["n-buna"],"a":["n-buna"]},"Face to Face":{"c":["Saku"],"a":["Saku"]},"Ikinoaima":{"c":["渡辺翔"],"a":["岸田勇気"]},"君の文字":{"c":["麻枝准"],"a":["ANANT-GARDE EYES"]},"夢のかけら":{"c":["園田健太郎"],"a":["野村陽一郎"]},"ハローマイトリート":{"c":["いよわ"],"a":["いよわ"]},"群青の約束":{"c":["百景"],"a":["百景"]},"스텔라이브 (StelLive) Universe":{"c":["藤原聡"],"a":["Official髭男dism","湯本淳希"]},"宇宙逃避行":{"c":["MIMI"],"a":["MIMI"]},"ゲーム「ガールズバンドクライ First Riff」":{"c":["キクイケコジロウ"],"a":["玉井健二","大西省吾"]},"Konkaino Soudouni Tsukimashite.":{"c":["ANCHOR"],"a":["ANCHOR"]},"シーソー":{"c":["Sanghee"]},"She is evil!":{"c":["ロス"],"a":["Manao Doi"]},"Mud Princeeeeess!!!":{"c":["A4。"],"a":["A4。"]},"Kawaii Electro Arrange -":{"c":["藤原聡"],"a":["Official髭男dism"]},"Eve":{"c":["Eve"],"a":["Numa","KOHD","Zingai"]},"arrange ver. - / リュベンス・":{"c":["悦"]},"はな":{"c":["佐久間きらら"],"a":["佐久間きらら"]},"カシスオレンジ":{"c":["CHIMERAZ"]},"Ash Pile":{"c":["Bank of Innovation, Inc."]},"ROUTE 66":{"c":["セクシー大統領","北澤伸一郎","東条サダヲ"],"a":["セクシー大統領","北澤伸一郎","東条サダヲ"]},"ゆるり":{"c":["果歩"],"a":["森川祐樹"]},"JUMPING TO DAYS!":{"c":["鶴丸雄太"],"a":["鶴丸雄太"]},"奇跡がやって来る":{"c":["野下俊哉"],"a":["鈴木雅也"]},"冬が来た!":{"c":["野下俊哉"],"a":["鈴木雅也"]},"Once More":{"c":["YUC'e","Nor"]},"Gunjo Love theory (special ver.)":{"c":["daisuke horita"],"a":["daisuke horita"]},"疾走":{"c":["Tom"],"a":["Tom","山下 律"]},"LOVETOXIN":{"c":["Nor"]},"不常識":{"c":["Ryuma"]},"プレイバック・ハイライト":{"c":["buzzG"]},"スイートマリアージュ":{"c":["Famishin"],"a":["伊福部武史"]},"深紅の呂旗-The ONE- 歌詞有り":{"c":["たくまる"],"a":["たくまる"]},"終末のソナタ (神崎・H・アリア)":{"c":["ヒゲドライバー"],"a":["ヒゲドライバー"]},"依依恋恋":{"c":["心愛 -KOKONA-"]},"１億等星、会えますように。":{"c":["s-num"],"a":["眞塩楓"]},"つまんない恋":{"c":["杉本バッハ"],"a":["Z-shimi","杉本バッハ"]},"傘":{"c":["水本夏絵"]},"君への帰り道":{"c":["Bank of Innovation, Inc."]},"愛愛愛":{"c":["秘めごと"]},"Star Rain":{"c":["Muu Dogg"],"a":["Muu Dogg"]},"PINK BLUE × 桜が咲いたら想うこと":{"c":["茉寿","OTOHA"]},"フレグランス":{"c":["茉ひる","RINZO"],"a":["RINZO"]},"Sleeping pretend":{"c":["maru"],"a":["maru"]},"RESTART":{"c":["MiMi"]},"Cinderella Street":{"c":["しっぽり虎太郎","McKurokurosuke"],"a":["McKurokurosuke"]},"リング・ワールド":{"c":["ein himinn"]}};
  const NORM_CANONICAL_SONG_CREDITS = new Map();
  Object.keys(CANONICAL_SONG_CREDITS).forEach(k => {
    const nk = normSearch(k);
    if (nk && !NORM_CANONICAL_SONG_CREDITS.has(nk)) {
      NORM_CANONICAL_SONG_CREDITS.set(nk, CANONICAL_SONG_CREDITS[k]);
    }
  });

  function normComposerCompareKey(name) {
    return String(name || "")
      .normalize("NFKC")
      .replace(/\s*[\(（][^\)）]*[\)）]\s*$/g, "")
      .replace(/[\s\u3000・]+/g, "")
      .trim()
      .toLowerCase();
  }

  function getSongCredits(artist, songTitle) {
    if (!songTitle) return null;
    const raw = String(songTitle || "").trim();
    if (!raw) return null;
    if (artist && artist.sc && artist.sc[raw] && Array.isArray(artist.sc[raw].c) && artist.sc[raw].c.length > 0) {
      return artist.sc[raw];
    }
    if (CANONICAL_SONG_CREDITS[raw]) {
      return CANONICAL_SONG_CREDITS[raw];
    }
    const nk = normSearch(raw);
    if (nk && NORM_CANONICAL_SONG_CREDITS.has(nk)) {
      return NORM_CANONICAL_SONG_CREDITS.get(nk);
    }
    const stripped = raw
      .replace(/\s*[\(（][^\)）]*(?:cover|カバー|ver\.?|version|歌ってみた|live|first take|mv|short|acoustic|piano|arrange)[^\)）]*[\)）]/gi, "")
      .trim();
    if (stripped && stripped !== raw) {
      if (artist && artist.sc && artist.sc[stripped]) return artist.sc[stripped];
      if (CANONICAL_SONG_CREDITS[stripped]) return CANONICAL_SONG_CREDITS[stripped];
      const snk = normSearch(stripped);
      if (snk && NORM_CANONICAL_SONG_CREDITS.has(snk)) return NORM_CANONICAL_SONG_CREDITS.get(snk);
    }
    return null;
  }

  function formatKaruSongCreditsHTML(artist, songTitle) {
    if (!state.karuSpecialMode) return "";
    const cr = getSongCredits(artist, songTitle);
    if (!cr || !Array.isArray(cr.c) || cr.c.length === 0) return "";
    const compList = cr.c.map(x => String(x || "").trim()).filter(Boolean);
    if (compList.length === 0) return "";
    const compText = compList.join("・");
    let html = `<span class="karu-song-credit"><span class="row-artist-prefix">作曲:</span>${esc(compText)}</span>`;

    // Arranger rule: ONLY display when arranger is 1 person AND different from composer(s)
    const arrList = Array.isArray(cr.a) ? cr.a.map(x => String(x || "").trim()).filter(Boolean) : [];
    if (arrList.length === 1) {
      const singleArr = arrList[0];
      const arrNorm = normComposerCompareKey(singleArr);
      const isSameAsComposer = compList.some(cName => normComposerCompareKey(cName) === arrNorm);
      if (arrNorm && !isSameAsComposer) {
        html += `<span class="karu-song-credit"><span class="row-artist-prefix">編曲:</span>${esc(singleArr)}</span>`;
      }
    }
    return html;
  }

  function evaluateSongComposerMatch(artist, songTitle, q, qNoSpace) {
    if (!state.karuSpecialMode || !q) return null;
    const cr = getSongCredits(artist, songTitle);
    if (!cr) return null;
    const compList = Array.isArray(cr.c) ? cr.c : [];
    const arrList = Array.isArray(cr.a) ? cr.a : [];
    const allCredits = [...compList, ...arrList];
    if (allCredits.length === 0) return null;

    let bestTier = 99;
    let bestRatio = 0;
    const qLen = q.length || 1;
    const qWsOnly = q.replace(/\s+/g, "");

    for (let i = 0; i < allCredits.length; i++) {
      const rawName = String(allCredits[i] || "").trim();
      if (!rawName) continue;
      const baseName = rawName.replace(/\s*[\(（][^\)）]*[\)）]\s*$/g, "").trim();
      const candidates = (baseName && baseName !== rawName) ? [rawName, baseName] : [rawName];

      for (let j = 0; j < candidates.length; j++) {
        const cStr = candidates[j];
        const nc = normSearch(cStr);
        if (!nc) continue;
        const ncNoSpace = stripSpaces(nc);
        const ncWsOnly = nc.replace(/\s+/g, "");
        const canMatchNoSpace = Boolean(qNoSpace) && (!/^[a-z0-9]+$/.test(qNoSpace) || ncWsOnly.includes(qWsOnly));
        const baseRatio = qLen / Math.max(qLen, nc.length);

        if (nc === q || (canMatchNoSpace && ncNoSpace === qNoSpace)) {
          const t = 4;
          const r = (j === 0 && nc === q) ? 3.08 : 3.04;
          if (t < bestTier || (t === bestTier && r > bestRatio)) {
            bestTier = t;
            bestRatio = r;
          }
        } else if (nc.startsWith(q) || (canMatchNoSpace && ncNoSpace.startsWith(qNoSpace))) {
          const t = 5;
          const r = 2.0 + baseRatio;
          if (t < bestTier || (t === bestTier && r > bestRatio)) {
            bestTier = t;
            bestRatio = r;
          }
        } else if (nc.includes(q) || (canMatchNoSpace && ncNoSpace.includes(qNoSpace))) {
          const t = 5;
          const r = 1.0 + baseRatio;
          if (t < bestTier || (t === bestTier && r > bestRatio)) {
            bestTier = t;
            bestRatio = r;
          }
        }
      }
    }

    if (bestTier < 99) {
      return { tier: bestTier, ratio: bestRatio };
    }
    return null;
  }

  let currentComposerItems = [];
  let currentKaruAllSearchEntries = [];
  let COMPOSER_MAP = new Map();

  function isKaruAllQuerySearchView() {
    const q = state.view === "search" ? normSearch(state.searchQuery) : "";
    return Boolean(
      state.karuSpecialMode &&
      state.view === "search" &&
      (state.searchTarget === "all" || state.searchTarget === "both") &&
      q &&
      !isMeikyokuListView()
    );
  }

  function buildFilteredComposerItems(filteredArtists, q, qNoSpace) {
    const map = new Map();
    const hasHeartFilter = Array.isArray(state.heartFilter) && state.heartFilter.length > 0;

    filteredArtists.forEach(a => {
      const songs = Array.isArray(a.songs) ? a.songs : [];
      songs.forEach((sTitle, sIdx) => {
        if (hasHeartFilter) {
          const sTier = getSongHeartTier(a.aid, sTitle);
          const aTier = getArtistHeartTier(a.aid);
          if (!matchesHeartTierFilter(sTier) && !matchesHeartTierFilter(aTier)) return;
        }
        const cr = getSongCredits(a, sTitle);
        if (!cr) return;
        const compList = Array.isArray(cr.c) ? cr.c.map(x => String(x || "").trim()).filter(Boolean) : [];
        const arrList = Array.isArray(cr.a) ? cr.a.map(x => String(x || "").trim()).filter(Boolean) : [];
        const compNormSet = new Set(compList.map(normComposerCompareKey));

        const addEntry = (personName, isArrOnly) => {
          if (!personName) return;
          let obj = map.get(personName);
          if (!obj) {
            const nName = normSearch(personName);
            const nNoSpace = stripSpaces(nName);
            const cleanSort = stripLeadingSongSymbols(personName);
            obj = {
              name: personName,
              _normName: nName,
              _normNoSpace: nNoSpace,
              _sortKey: normSearch(cleanSort || personName),
              songs: [],
              _seenKeys: new Set(),
              composeCount: 0,
              arrangeOnlyCount: 0,
              tier: 99,
              ratio: 0,
              matchedSongPreview: ""
            };
            map.set(personName, obj);
          }
          const songKey = `${a.aid}\t${sTitle}`;
          if (obj._seenKeys.has(songKey)) return;
          obj._seenKeys.add(songKey);
          obj.songs.push({
            artist: a,
            songTitle: sTitle,
            regIdx: sIdx + 1,
            isArrOnly
          });
          if (isArrOnly) obj.arrangeOnlyCount++;
          else obj.composeCount++;
        };

        compList.forEach(cName => addEntry(cName, false));
        arrList.forEach(aName => {
          if (!compNormSet.has(normComposerCompareKey(aName))) {
            addEntry(aName, true);
          }
        });
      });
    });

    const excludeMax = (state.karuSpecialMode && state.view === "search" && state.searchTarget === "composer")
      ? Number(state.composerExcludeMaxSongs || 0)
      : 0;
    const results = [];
    map.forEach(obj => {
      if (obj.songs.length === 0) return;
      let favCnt = 0;
      for (let i = 0; i < obj.songs.length; i++) {
        const sItem = obj.songs[i];
        if (getSongHeartTier(sItem.artist.aid, sItem.songTitle) > 0) {
          favCnt++;
        }
      }
      obj.favSongCount = favCnt;
      obj.favSongRatio = obj.songs.length > 0 ? (favCnt / obj.songs.length) : 0;
      obj.displayName = (obj.composeCount === 0 && obj.arrangeOnlyCount > 0)
        ? `${obj.name} (編)`
        : obj.name;
      if (excludeMax > 0 && obj.songs.length <= excludeMax) return;

      if (q) {
        const qLen = q.length || 1;
        let matched = false;
        if (obj._normName === q || (qNoSpace && obj._normNoSpace === qNoSpace)) {
          obj.tier = 1;
          obj.ratio = 3.1;
          matched = true;
        } else if (obj._normName.startsWith(q) || (qNoSpace && obj._normNoSpace.startsWith(qNoSpace))) {
          obj.tier = 2;
          obj.ratio = 2.0 + (qLen / Math.max(qLen, obj._normName.length));
          matched = true;
        } else if (obj._normName.includes(q) || (qNoSpace && obj._normNoSpace.includes(qNoSpace))) {
          obj.tier = 3;
          obj.ratio = 1.0 + (qLen / Math.max(qLen, obj._normName.length));
          matched = true;
        } else {
          for (let i = 0; i < obj.songs.length; i++) {
            const sTitle = obj.songs[i].songTitle;
            const ns = normSearch(sTitle);
            const nsNoSpace = stripSpaces(ns);
            if (ns.includes(q) || (qNoSpace && nsNoSpace.includes(qNoSpace))) {
              obj.tier = 4;
              obj.ratio = 0.8;
              obj.matchedSongPreview = sTitle + (obj.songs[i].isArrOnly ? " (編)" : "");
              matched = true;
              break;
            }
          }
        }
        if (!matched) return;
      }
      results.push(obj);
    });

    const compSort = state.searchComposerSort || "kanaAsc";
    results.sort((a, b) => {
      if (q && !state.searchSortOverride && compSort === "kanaAsc") {
        if (a.tier !== b.tier) return a.tier - b.tier;
        if (Math.abs(b.ratio - a.ratio) > 1e-6) return b.ratio - a.ratio;
      }
      if (compSort === "countDesc") {
        if (b.songs.length !== a.songs.length) return b.songs.length - a.songs.length;
      } else if (compSort === "favCountDesc") {
        if (b.favSongCount !== a.favSongCount) return b.favSongCount - a.favSongCount;
        if (Math.abs(b.favSongRatio - a.favSongRatio) > 1e-9) return b.favSongRatio - a.favSongRatio;
        if (b.songs.length !== a.songs.length) return b.songs.length - a.songs.length;
      } else if (compSort === "favRatioDesc") {
        if (Math.abs(b.favSongRatio - a.favSongRatio) > 1e-9) return b.favSongRatio - a.favSongRatio;
        if (b.favSongCount !== a.favSongCount) return b.favSongCount - a.favSongCount;
        if (b.songs.length !== a.songs.length) return b.songs.length - a.songs.length;
      }
      const ga = getSongKanaGroupPriority(a._sortKey);
      const gb = getSongKanaGroupPriority(b._sortKey);
      if (ga !== gb) return ga - gb;
      const cmp = jaCollator.compare(a._sortKey || a.name, b._sortKey || b.name);
      if (cmp !== 0) return cmp;
      return b.songs.length - a.songs.length;
    });

    results.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    COMPOSER_MAP = map;
    return results;
  }

  function buildComposerRowHTML(comp, rowIndex = 999) {
    const isSelected = state.selectedComposerName === comp.name;
    const rankNum = comp.rank || (rowIndex + 1);
    const matchSubHTML = comp.matchedSongPreview
      ? `<div class="row-match-sub row-match-song-both">♪ 一致担当曲: ${esc(comp.matchedSongPreview)}</div>`
      : (comp.composeCount > 0 && comp.arrangeOnlyCount > 0
          ? `<div class="row-match-sub" style="color:var(--text-secondary);">作曲 ${fmtNum(comp.composeCount)}曲 / 編曲 ${fmtNum(comp.arrangeOnlyCount)}曲</div>`
          : "");
    const compSort = state.searchComposerSort || "kanaAsc";
    let rightCountHTML = `${fmtNum(comp.songs.length)}<span>曲</span>`;
    if (compSort === "favCountDesc") {
      rightCountHTML = `${fmtNum(comp.favSongCount || 0)}<span>曲</span><span class="karu-sort-sub-metric">/${fmtNum(comp.songs.length)}曲</span>`;
    } else if (compSort === "favRatioDesc") {
      rightCountHTML = `${formatFavRatioPercent(comp.favSongRatio || 0)}<span>%</span><span class="karu-sort-sub-metric">(${fmtNum(comp.favSongCount || 0)}/${fmtNum(comp.songs.length)})</span>`;
    }
    return `
      <div class="artist-row composer-row ${isSelected ? "selected" : ""}" data-composer-name="${esc(comp.name)}" role="button" tabindex="0">
        <div class="row-rank">${rankNum}</div>
        <div class="row-name-wrap">
          <div class="row-name">${esc(comp.displayName)}</div>
          ${matchSubHTML}
        </div>
        <div class="row-count">${rightCountHTML}</div>
      </div>
    `;
  }

  function selectComposer(compName) {
    if (!state.karuSpecialMode || !compName) return;
    if (!COMPOSER_MAP.has(compName)) {
      buildFilteredComposerItems(DATA, "", "");
    }
    if (!COMPOSER_MAP.has(compName)) return;
    if (state.selectedComposerName !== compName || state.selectedArtistName !== null) {
      pushHistorySnapshot(false);
    }
    state.selectedComposerName = compName;
    state.selectedArtistName = null;
    if (window.innerWidth <= 900) {
      try {
        history.pushState({ sheet: "detail", composer: compName }, "");
      } catch (e) {}
    }
    updateSelectedRowHighlight();
    renderDetailPanel(true);
  }

  let currentFiltered = [];

  function updateSearchScopeCounts() {
    const isSongTarget = state.searchTarget === "song";
    const scAll = document.getElementById("scopeCntAll");
    const scCat1 = document.getElementById("scopeCntCat1");
    const scCat2 = document.getElementById("scopeCntCat2");
    if (hasMeikyokuFilter()) {
      let mAll = 0, mCat1 = 0, mCat2 = 0;
      MEIKYOKU_ENTRIES.forEach(e => {
        if (!matchesMeikyokuStarFilter(e.stars)) return;
        mAll++;
        if (e.artist && e.artist.cat === 1) mCat1++;
        else if (e.artist && e.artist.cat === 2) mCat2++;
      });
      if (scAll) scAll.textContent = `${fmtNum(mAll)}曲`;
      if (scCat1) scCat1.textContent = `${fmtNum(mCat1)}曲`;
      if (scCat2) scCat2.textContent = `${fmtNum(mCat2)}曲`;
      return;
    }
    if (isSongTarget) {
      if (scAll) scAll.textContent = `${fmtNum(countSongsTotal)}曲`;
      if (scCat1) scCat1.textContent = `${fmtNum(countSongsCat1)}曲`;
      if (scCat2) scCat2.textContent = `${fmtNum(countSongsCat2)}曲`;
    } else {
      if (scAll) scAll.textContent = fmtNum(countTotal);
      if (scCat1) scCat1.textContent = fmtNum(countCat1);
      if (scCat2) scCat2.textContent = fmtNum(countCat2);
    }
  }

  function syncSearchTargetUI() {
    if (state.searchTarget === "both") state.searchTarget = "all";
    const target = state.searchTarget || "all";
    document.querySelectorAll("[data-search-target]").forEach(btn => {
      const isAct = btn.getAttribute("data-search-target") === target;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-selected", isAct ? "true" : "false");
    });
    const titleEl = document.getElementById("searchViewTitle");
    const inputEl = document.getElementById("mainSearchInput");
    if (titleEl) {
      if (target === "artist") titleEl.textContent = "アーティストを検索";
      else if (target === "song") titleEl.textContent = "楽曲を検索";
      else if (target === "composer") titleEl.textContent = "作曲者を検索";
      else if (target === "group") titleEl.textContent = "グループを検索";
      else titleEl.textContent = "すべて検索";
    }
    if (inputEl) {
      if (target === "artist") {
        inputEl.placeholder = "アーティスト名・ひらがな・カタカナ・ローマ字を入力...";
      } else if (target === "song") {
        inputEl.placeholder = "楽曲名（登録曲・代表曲）を入力...";
      } else if (target === "composer") {
        inputEl.placeholder = "作曲者・編曲者・ボカロP名を入力...";
      } else if (target === "group") {
        inputEl.placeholder = "所属（事務所・作品）やユニット名を入力...";
      } else {
        inputEl.placeholder = state.karuSpecialMode
          ? "アーティスト・楽曲・作曲者・所属（事務所・作品）・ユニット名を入力..."
          : "アーティスト・楽曲・所属（事務所・作品）・ユニット名を入力...";
      }
    }
    updateSearchScopeCounts();
  }

  let currentMatchedGroups = [];

  function stripLeadingSongSymbols(str) {
    return String(str || "").replace(/^[-－―—!！?？♡♥★☆♪「『【（\(\[\s"'~〜・×÷+#＝=]+/, "").trim();
  }

  function getSongSortReadingKey(songTitle) {
    const raw = String(songTitle || "").trim();
    if (!raw) return "";
    const aliases = SONG_SEARCH_ALIASES_BY_NEW_TITLE[raw];
    if (Array.isArray(aliases)) {
      const hiraAlias = aliases.find(al => /^[ぁ-んー0-9\s]+$/.test(String(al || "").trim()));
      if (hiraAlias) return normSearch(hiraAlias);
    }
    const stripped = stripLeadingSongSymbols(raw);
    return normSearch(stripped || raw);
  }

  function getSongKanaGroupPriority(key) {
    if (!key) return 9;
    if (/^[ぁ-んァ-ヶ]/.test(key)) return 0;
    if (/^[一-龯]/.test(key)) return 1;
    return 2;
  }

  function compareSongsKanaAsc(songA, songB, artistA, artistB) {
    if (!songA && songB) return 1;
    if (songA && !songB) return -1;
    const ka = getSongSortReadingKey(songA);
    const kb = getSongSortReadingKey(songB);
    const ga = getSongKanaGroupPriority(ka);
    const gb = getSongKanaGroupPriority(kb);
    if (ga !== gb) return ga - gb;
    const cmp = jaCollator.compare(ka || String(songA || ""), kb || String(songB || ""));
    if (cmp !== 0) return cmp;
    const rawCmp = jaCollator.compare(String(songA || ""), String(songB || ""));
    if (rawCmp !== 0) return rawCmp;
    if (artistA && artistB) {
      return jaCollator.compare(artistA.reading || artistA.name, artistB.reading || artistB.name);
    }
    return 0;
  }

  function compareSongsAlphaAsc(songA, songB, artistA, artistB) {
    if (!songA && songB) return 1;
    if (songA && !songB) return -1;
    const cleanA = stripLeadingSongSymbols(songA);
    const cleanB = stripLeadingSongSymbols(songB);
    const aIsAlpha = /^[A-Za-z]/.test(cleanA);
    const bIsAlpha = /^[A-Za-z]/.test(cleanB);
    if (aIsAlpha && !bIsAlpha) return -1;
    if (!aIsAlpha && bIsAlpha) return 1;
    if (aIsAlpha && bIsAlpha) {
      const enCmp = enCollator.compare(cleanA, cleanB);
      if (enCmp !== 0) return enCmp;
    }
    return compareSongsKanaAsc(songA, songB, artistA, artistB);
  }

  function getRepresentativeSongForSongTabSort(a, sortMode) {
    if (a._matchedSongPreview) return a._matchedSongPreview;
    const songs = (Array.isArray(a.songs) && a.songs.length > 0)
      ? a.songs
      : (Array.isArray(a.topSongs) && a.topSongs.length > 0 ? a.topSongs : []);
    if (songs.length === 0) return "";
    if (songs.length === 1) return songs[0];
    const copy = [...songs];
    if (sortMode === "alphaAsc") {
      copy.sort((x, y) => compareSongsAlphaAsc(x, y, a, a));
    } else {
      copy.sort((x, y) => compareSongsKanaAsc(x, y, a, a));
    }
    return copy[0] || "";
  }

  function findMatchingSearchGroups(q, qNoSpace) {
    const scope = state.searchScope || "all";
    const groupSort = (state.view === "search" && state.searchTarget === "group")
      ? (state.searchGroupSort || "groupCountDesc")
      : "groupCountDesc";
    const pool = SEARCHABLE_GROUPS.filter(g => {
      if (scope === "cat1" && g.cat1Count === 0) return false;
      if (scope === "cat2" && g.cat2Count === 0) return false;
      return true;
    });
    const sortGroups = (arr, hasQuery) => {
      return arr.sort((a, b) => {
        if (hasQuery && !state.searchSortOverride && a._groupTier !== b._groupTier) {
          return a._groupTier - b._groupTier;
        }
        if (groupSort === "kanaAsc") {
          const cmp = jaCollator.compare(a.name, b.name);
          if (cmp !== 0) return cmp;
          return b.count - a.count;
        }
        if (b.count !== a.count) return b.count - a.count;
        return jaCollator.compare(a.name, b.name);
      });
    };
    if (!q) {
      if (state.searchTarget !== "group") return [];
      return sortGroups(pool.slice(), false);
    }
    const matched = [];
    pool.forEach(g => {
      let tier = 99;
      if (g._normName === q || (qNoSpace && g._normNameNoSpace === qNoSpace)) {
        tier = 1;
      } else if (g._normTokens.includes(q) || (qNoSpace && g._normTokensNoSpace.includes(qNoSpace))) {
        tier = 2;
      } else if (g._normName.startsWith(q) || (qNoSpace && g._normNameNoSpace.startsWith(qNoSpace)) || g._normTokens.some(t => t.startsWith(q))) {
        tier = 3;
      } else if (g._normName.includes(q) || (qNoSpace && g._normNameNoSpace.includes(qNoSpace)) || g._normTokens.some(t => t.includes(q)) || (qNoSpace && g._normTokensNoSpace.some(t => t.includes(qNoSpace)))) {
        tier = 4;
      }
      if (tier < 99) {
        g._groupTier = tier;
        matched.push(g);
      }
    });
    return sortGroups(matched, true);
  }

  function scoreSingleSongMatch(q, qNoSpace, normTitle, normNoSpace, alArr, alNoSpaceArr, normCanonical = "", normCanonicalNoSpace = "") {
    const qLen = q.length || 1;
    const qNsLen = (qNoSpace && qNoSpace.length) || qLen;
    if (normTitle === q || (qNoSpace && normNoSpace === qNoSpace)) {
      return { tier: 4, ratio: 3.1 };
    }
    if (normCanonical && (normCanonical === q || (qNoSpace && normCanonicalNoSpace === qNoSpace))) {
      return { tier: 4, ratio: 3.05 };
    }
    if (alArr.includes(q) || (qNoSpace && alNoSpaceArr.includes(qNoSpace))) {
      return { tier: 4, ratio: 3.0 };
    }
    // Guard against false cross-punctuation matches like "piano.ver" -> "pianover" matching "over"
    const normWsOnly = normTitle.replace(/\s+/g, "");
    const qWsOnly = q.replace(/\s+/g, "");
    const canMatchNoSpace = Boolean(qNoSpace) && (!/^[a-z0-9]+$/.test(qNoSpace) || normWsOnly.includes(qWsOnly));
    if (normTitle.startsWith(q) || (canMatchNoSpace && normNoSpace.startsWith(qNoSpace))) {
      return { tier: 5, ratio: 2.0 + (qLen / Math.max(qLen, normTitle.length)) };
    }
    const prefAl = alArr.find(al => al.startsWith(q)) || (canMatchNoSpace ? alNoSpaceArr.find(al => al.startsWith(qNoSpace)) : null);
    if (prefAl) {
      return { tier: 5, ratio: 1.9 + (qLen / Math.max(qLen, prefAl.length)) };
    }
    if (normTitle.includes(q) || (canMatchNoSpace && normNoSpace.includes(qNoSpace))) {
      return { tier: 5, ratio: 1.0 + (qLen / Math.max(qLen, normTitle.length)) };
    }
    const subAl = alArr.find(al => al.includes(q)) || (canMatchNoSpace ? alNoSpaceArr.find(al => al.includes(qNoSpace)) : null);
    if (subAl) {
      return { tier: 5, ratio: 0.9 + (qNsLen / Math.max(qNsLen, subAl.length)) };
    }
    return null;
  }

  function findMatchedSongsForArtist(a, q, qNoSpace) {
    const scoredHits = [];
    const seen = new Set();

    for (let i = 0; i < a._normSongs.length; i++) {
      const rawSong = a.songs[i];
      if (seen.has(rawSong)) continue;
      const ns = a._normSongs[i];
      const nsNoSpace = a._normSongsNoSpace[i];
      const alArr = (a._normSongAliases && a._normSongAliases[i]) || [];
      const alNoSpaceArr = (a._normSongAliasesNoSpace && a._normSongAliasesNoSpace[i]) || [];
      const titleSc = scoreSingleSongMatch(q, qNoSpace, ns, nsNoSpace, alArr, alNoSpaceArr);
      const compSc = state.karuSpecialMode ? evaluateSongComposerMatch(a, rawSong, q, qNoSpace) : null;
      if (titleSc || compSc) {
        const bestTier = (titleSc && compSc) ? Math.min(titleSc.tier, compSc.tier) : (titleSc ? titleSc.tier : compSc.tier);
        const bestRatio = (titleSc && compSc) ? Math.max(titleSc.ratio, compSc.ratio) : (titleSc ? titleSc.ratio : compSc.ratio);
        scoredHits.push({ title: rawSong, tier: bestTier, ratio: bestRatio });
        seen.add(rawSong);
      }
    }
    if (a._normTopSongs) {
      for (let i = 0; i < a._normTopSongs.length; i++) {
        const rawTop = a.topSongs[i];
        if (seen.has(rawTop)) continue;
        const nt = a._normTopSongs[i];
        const ntNoSpace = stripSpaces(nt);
        const alArr = (a._normTopSongAliases && a._normTopSongAliases[i]) || [];
        const alNoSpaceArr = (a._normTopSongAliasesNoSpace && a._normTopSongAliasesNoSpace[i]) || [];
        const titleSc = scoreSingleSongMatch(q, qNoSpace, nt, ntNoSpace, alArr, alNoSpaceArr);
        const compSc = state.karuSpecialMode ? evaluateSongComposerMatch(a, rawTop, q, qNoSpace) : null;
        if (titleSc || compSc) {
          const bestTier = (titleSc && compSc) ? Math.min(titleSc.tier, compSc.tier) : (titleSc ? titleSc.tier : compSc.tier);
          const bestRatio = (titleSc && compSc) ? Math.max(titleSc.ratio, compSc.ratio) : (titleSc ? titleSc.ratio : compSc.ratio);
          scoredHits.push({ title: rawTop, tier: bestTier, ratio: bestRatio });
          seen.add(rawTop);
        }
      }
    }
    if (scoredHits.length === 0) return null;
    // Sort matched songs of this artist by match ratio descending, then by song title 50-on order
    scoredHits.sort((x, y) => {
      if (x.tier !== y.tier) return x.tier - y.tier;
      if (Math.abs(y.ratio - x.ratio) > 1e-6) return y.ratio - x.ratio;
      return compareSongsKanaAsc(x.title, y.title, a, a);
    });
    const hasExactTier = scoredHits[0].tier === 4;
    const filteredHits = hasExactTier ? scoredHits.filter(h => h.tier === 4) : scoredHits;
    const allMatched = filteredHits.map(h => h.title);
    const shownList = allMatched.slice(0, 1);
    const moreCount = Math.max(0, allMatched.length - 1);
    const displaySongs = shownList[0] + (moreCount > 0 ? ` ほか${moreCount}曲` : "");
    return {
      tier: scoredHits[0].tier,
      ratio: scoredHits[0].ratio,
      first: allMatched[0],
      list: shownList,
      moreCount,
      display: displaySongs,
      count: allMatched.length
    };
  }

  function computeArtistMatchRatio(a, q, qNoSpace, tier) {
    const qLen = q.length || 1;
    const candidates = [a._normName, a._normReading, ...(a._normAliases || [])].filter(Boolean);
    let minLen = 999;
    candidates.forEach(c => {
      if (c.includes(q) || (qNoSpace && stripSpaces(c).includes(qNoSpace))) {
        if (c.length < minLen) minLen = c.length;
      }
    });
    if (minLen === 999) minLen = Math.max(qLen, (a._normName || "").length || qLen);
    const baseRatio = qLen / Math.max(qLen, minLen);
    if (tier === 1) return (a._normName === q || (qNoSpace && a._normNameNoSpace === qNoSpace)) ? 3.1 : 3.0;
    if (tier === 2) return 2.0 + baseRatio;
    return 1.0 + baseRatio;
  }

  function evaluateSearchMatch(a, q, qNoSpace) {
    const rawMode = state.searchTarget || "all";
    const mode = rawMode === "all" ? "both" : rawMode;
    a._matchedSongsDisplay = null;
    a._matchedSongsList = null;
    a._matchedSongsMoreCount = 0;
    a._searchMatchRatio = 0;
    if (mode === "group") {
      a._searchTier = 99;
      return false;
    }

    if (mode !== "song") {
      // Tier 1: Exact match on artist name, reading, or confirmed alias/romaji
      if (
        a._normName === q ||
        (qNoSpace && a._normNameNoSpace === qNoSpace) ||
        (a._normReading && (a._normReading === q || (qNoSpace && a._normReadingNoSpace === qNoSpace))) ||
        a._normAliases.includes(q) ||
        (qNoSpace && a._normAliasesNoSpace.includes(qNoSpace))
      ) {
        a._searchTier = 1;
        a._searchMatchRatio = computeArtistMatchRatio(a, q, qNoSpace, 1);
        a._matchedSongPreview = null;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = (a._normName !== q && a._normNameNoSpace !== qNoSpace) ? (a.reading || "") : "";
        return true;
      }

      // Tier 2: Prefix match on artist name, reading, or confirmed alias/romaji
      if (
        a._normName.startsWith(q) ||
        (qNoSpace && a._normNameNoSpace.startsWith(qNoSpace)) ||
        (a._normReading && (a._normReading.startsWith(q) || (qNoSpace && a._normReadingNoSpace.startsWith(qNoSpace)))) ||
        a._normAliases.some(al => al.startsWith(q)) ||
        (qNoSpace && a._normAliasesNoSpace.some(al => al.startsWith(qNoSpace)))
      ) {
        a._searchTier = 2;
        a._searchMatchRatio = computeArtistMatchRatio(a, q, qNoSpace, 2);
        a._matchedSongPreview = null;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = (!a._normName.includes(q) && a.reading) ? a.reading : "";
        return true;
      }

      // Tier 3: Substring match on artist name, reading, or confirmed alias/romaji
      if (
        a._normName.includes(q) ||
        (qNoSpace && a._normNameNoSpace.includes(qNoSpace)) ||
        (a._normReading && (a._normReading.includes(q) || (qNoSpace && a._normReadingNoSpace.includes(qNoSpace)))) ||
        a._normAliases.some(al => al.includes(q)) ||
        (qNoSpace && a._normAliasesNoSpace.some(al => al.includes(qNoSpace)))
      ) {
        a._searchTier = 3;
        a._searchMatchRatio = computeArtistMatchRatio(a, q, qNoSpace, 3);
        a._matchedSongPreview = null;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = (!a._normName.includes(q) && a.reading) ? a.reading : "";
        return true;
      }
    }

    if (mode !== "artist") {
      // Tier 4 & 5: Song title match (exact song title = Tier 4, partial song title = Tier 5)
      const sm = findMatchedSongsForArtist(a, q, qNoSpace);
      if (sm) {
        a._searchTier = sm.tier;
        a._searchMatchRatio = sm.ratio;
        a._matchedSongPreview = sm.first;
        a._matchedSongsList = sm.list;
        a._matchedSongsMoreCount = sm.moreCount;
        a._matchedSongsDisplay = sm.display;
        a._matchedAliasHint = "";
        return true;
      }
    }

    a._searchTier = 99;
    a._searchMatchRatio = 0;
    a._matchedSongPreview = null;
    a._matchedSongsDisplay = null;
    a._matchedAliasHint = "";
    return false;
  }

  function compareArtistsBySortKey(a, b, sortKey) {
    if (sortKey === "countDesc") {
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (sortKey === "countAsc") {
      if (a.count !== b.count) return a.count - b.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (sortKey === "favCountDesc") {
      const fa = state.karuSpecialMode ? getArtistListeningFavSongCount(a) : getArtistFavSongCount(a);
      const fb = state.karuSpecialMode ? getArtistListeningFavSongCount(b) : getArtistFavSongCount(b);
      if (fb !== fa) return fb - fa;
      if (state.karuSpecialMode) {
        const ra = getArtistListeningFavSongRatio(a);
        const rb = getArtistListeningFavSongRatio(b);
        if (Math.abs(rb - ra) > 1e-9) return rb - ra;
      }
      const ta = getArtistHeartTier(a.aid);
      const tb = getArtistHeartTier(b.aid);
      if (tb !== ta) return tb - ta;
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (sortKey === "favRatioDesc") {
      const ra = getArtistListeningFavSongRatio(a);
      const rb = getArtistListeningFavSongRatio(b);
      if (Math.abs(rb - ra) > 1e-9) return rb - ra;
      const fa = getArtistListeningFavSongCount(a);
      const fb = getArtistListeningFavSongCount(b);
      if (fb !== fa) return fb - fa;
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (sortKey === "kanaAsc") {
      const ka = a._kanaSortKey;
      const kb = b._kanaSortKey;
      if (ka && !kb) return -1;
      if (!ka && kb) return 1;
      if (ka && kb) {
        const cmp = jaCollator.compare(ka, kb);
        if (cmp !== 0) return cmp;
      }
      const nameCmp = jaCollator.compare(a.name, b.name);
      if (nameCmp !== 0) return nameCmp;
      return b.count - a.count;
    }
    if (sortKey === "alphaAsc") {
      if (a._hasAlphaPrefix && !b._hasAlphaPrefix) return -1;
      if (!a._hasAlphaPrefix && b._hasAlphaPrefix) return 1;
      const cmp = enCollator.compare(a._alphaSortKey, b._alphaSortKey);
      if (cmp !== 0) return cmp;
      const jaCmp = jaCollator.compare(a.name, b.name);
      if (jaCmp !== 0) return jaCmp;
      return b.count - a.count;
    }
    if (sortKey === "subDesc") {
      const aHas = a.sub !== null && a.sub !== undefined;
      const bHas = b.sub !== null && b.sub !== undefined;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (aHas && bHas && b.sub !== a.sub) return b.sub - a.sub;
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    if (sortKey === "subAsc") {
      const aHas = a.sub !== null && a.sub !== undefined;
      const bHas = b.sub !== null && b.sub !== undefined;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      if (aHas && bHas && a.sub !== b.sub) return a.sub - b.sub;
      if (b.count !== a.count) return b.count - a.count;
      return jaCollator.compare(a.reading || a.name, b.reading || b.name);
    }
    return 0;
  }

  function compareBySelectedSort(a, b) {
    return compareArtistsBySortKey(a, b, state.sortBy);
  }

  function isCat1OnlyContext() {
    return (state.view === "cat1") || (state.view === "search" && state.searchScope === "cat1");
  }

  function getEffectiveRolesForArtist(a) {
    const rawList = (Array.isArray(a.roles) && a.roles.length > 0)
      ? a.roles
      : (a.role && a.role !== "判定保留" ? [a.role] : []);
    const expanded = [];
    rawList.forEach(r => {
      String(r || "").split(/[/／]/).map(s => s.trim()).filter(Boolean).forEach(part => {
        if (!expanded.includes(part)) expanded.push(part);
      });
    });
    const cat1Only = isCat1OnlyContext();
    const mapped = [];
    expanded.forEach(r => {
      let m = r;
      if (cat1Only) {
        if (r === "音楽グループ(アニゲー関連)" || r === "音楽グループ(その他)") m = "音楽グループ";
      } else {
        if (r === "音楽グループ") m = a.groupSubRole || "音楽グループ(アニゲー関連)";
      }
      if (!mapped.includes(m)) mapped.push(m);
    });
    return mapped;
  }

  function getRecommendRoleBucketsForArtist(a) {
    if (!a) return ["その他"];
    const rawList = (Array.isArray(a.roles) && a.roles.length > 0)
      ? a.roles
      : [a.role || "その他"];
    const buckets = [];
    rawList.forEach(r => {
      String(r || "その他").split(/[/／]/).map(s => s.trim()).filter(Boolean).forEach(part => {
        let roleName = part;
        if (roleName === "音楽グループ") {
          roleName = a.groupSubRole || "音楽グループ(アニゲー関連)";
        }
        if (!buckets.includes(roleName)) {
          buckets.push(roleName);
        }
      });
    });
    return buckets.length > 0 ? buckets : ["その他"];
  }

  let currentSongSearchItems = [];
  let currentCanonicalSongGroups = [];
  let currentMeikyokuItems = [];

  function evaluateArtistOnlyMatch(a, q, qNoSpace) {
    if (!q) return { matched: true, tier: 99, ratio: 0 };
    if (
      a._normName === q ||
      (qNoSpace && a._normNameNoSpace === qNoSpace) ||
      (a._normReading && (a._normReading === q || (qNoSpace && a._normReadingNoSpace === qNoSpace))) ||
      a._normAliases.includes(q) ||
      (qNoSpace && a._normAliasesNoSpace.includes(qNoSpace))
    ) {
      return { matched: true, tier: 1, ratio: computeArtistMatchRatio(a, q, qNoSpace, 1) };
    }
    if (
      a._normName.startsWith(q) ||
      (qNoSpace && a._normNameNoSpace.startsWith(qNoSpace)) ||
      (a._normReading && (a._normReading.startsWith(q) || (qNoSpace && a._normReadingNoSpace.startsWith(qNoSpace)))) ||
      a._normAliases.some(al => al.startsWith(q)) ||
      (qNoSpace && a._normAliasesNoSpace.some(al => al.startsWith(qNoSpace)))
    ) {
      return { matched: true, tier: 2, ratio: computeArtistMatchRatio(a, q, qNoSpace, 2) };
    }
    if (
      a._normName.includes(q) ||
      (qNoSpace && a._normNameNoSpace.includes(qNoSpace)) ||
      (a._normReading && (a._normReading.includes(q) || (qNoSpace && a._normReadingNoSpace.includes(qNoSpace)))) ||
      a._normAliases.some(al => al.includes(q)) ||
      (qNoSpace && a._normAliasesNoSpace.some(al => al.includes(qNoSpace)))
    ) {
      return { matched: true, tier: 3, ratio: computeArtistMatchRatio(a, q, qNoSpace, 3) };
    }
    return { matched: false, tier: 99, ratio: 0 };
  }

  function matchesHeartTierFilter(tier) {
    if (!Array.isArray(state.heartFilter) || state.heartFilter.length === 0) return true;
    if (state.heartFilter.includes("all")) return tier > 0;
    return tier > 0 && state.heartFilter.includes(String(tier));
  }

  function isSameSongGroupListView() {
    return (
      state.view === "search" &&
      state.searchTarget === "song" &&
      Boolean(state.sameSongCountMode) &&
      !state.exactCanonicalSongKey
    );
  }

  function applyFilterAndSort() {
    if (state.karuSpecialMode) {
      state.sortBy = "kanaAsc";
      if (
        state.searchTarget !== "artist" ||
        (state.searchArtistSort !== "kanaAsc" &&
         state.searchArtistSort !== "favCountDesc" &&
         state.searchArtistSort !== "favRatioDesc")
      ) {
        state.searchArtistSort = "kanaAsc";
      }
      state.searchSongSort = "kanaAsc";
      state.sameSongCountMode = false;
    }
    const isSearch = state.view === "search";
    const meikyokuActive = hasMeikyokuFilter();
    const isMeikyokuSearch = isSearch && meikyokuActive;
    if (!state.karuSpecialMode && state.searchTarget === "composer") {
      state.searchTarget = "all";
    }
    if (!state.karuSpecialMode && state.exactArtistSongsAid) {
      state.exactArtistSongsAid = "";
    }
    const isComposerSearchTab = Boolean(state.karuSpecialMode && isSearch && state.searchTarget === "composer" && !isMeikyokuSearch);
    const isSongSearchTab = isSearch && state.searchTarget === "song" && !isMeikyokuSearch;
    const q = isSearch ? normSearch(state.searchQuery) : "";
    const qNoSpace = q ? stripSpaces(q) : "";
    const kanaActive = hasKanaFilter();
    const alphaActive = hasAlphaFilter();
    const hasHeartFilter = Array.isArray(state.heartFilter) && state.heartFilter.length > 0;

    if (isSearch && (state.searchTarget === "all" || state.searchTarget === "both" || state.searchTarget === "group")) {
      currentMatchedGroups = findMatchingSearchGroups(q, qNoSpace);
    } else {
      currentMatchedGroups = [];
    }

    currentFiltered = DATA.filter(a => {
      if (state.unitGroup) {
        const inUnit = (a.name === state.unitGroup) || (Array.isArray(a.memberOf) && a.memberOf.includes(state.unitGroup));
        if (!inUnit) return false;
      }
      if (state.agencyGroup) {
        if ((a.agencyGroup || a.agency || "") !== state.agencyGroup) return false;
      }
      if (state.view === "recommend") {
        if (state.recommendTab === "song") {
          const favSongs = getRecommendedSongsForArtist(a);
          if (favSongs.length === 0) return false;
          if (hasHeartFilter) {
            const hasMatchingFavSong = favSongs.some(s => matchesHeartTierFilter(getSongHeartTier(a.aid, s)));
            if (!hasMatchingFavSong) return false;
          }
        } else {
          const aTier = getArtistHeartTier(a.name);
          if (aTier <= 0) return false;
          if (hasHeartFilter && !matchesHeartTierFilter(aTier)) return false;
        }
      } else if (!isSearch && !state.agencyGroup && !state.unitGroup) {
        if (state.view === "cat1" && a.cat !== 1) return false;
        if (state.view === "cat2" && a.cat !== 2) return false;
      } else if (isSearch) {
        if (state.searchScope === "cat1" && a.cat !== 1) return false;
        if (state.searchScope === "cat2" && a.cat !== 2) return false;
        if (isMeikyokuSearch) {
          const mkList = MEIKYOKU_BY_AID.get(a.aid);
          if (!mkList || !mkList.some(m => matchesMeikyokuStarFilter(m.stars))) return false;
        } else if (state.searchTarget === "song" && (!Array.isArray(a._searchableSongs) || a._searchableSongs.length === 0)) {
          return false;
        }
      }

      if (state.roles.length > 0) {
        const effRoles = getEffectiveRolesForArtist(a);
        const rawRoles = (Array.isArray(a.roles) && a.roles.length > 0) ? a.roles : [a.role];
        const matchesRole = effRoles.some(r => state.roles.includes(r)) ||
          rawRoles.some(r => state.roles.includes(r)) ||
          Boolean(a.groupSubRole && state.roles.includes(a.groupSubRole)) ||
          Boolean(state.roles.includes("音楽グループ") && (a.role === "音楽グループ" || a.role === "音楽グループ(アニゲー関連)" || a.role === "音楽グループ(その他)"));
        if (!matchesRole) return false;
      }

      if (state.subBuckets.length > 0) {
        const bucket = a.subBucket || "unknown";
        if (!state.subBuckets.includes(bucket)) return false;
      }

      if (kanaActive || alphaActive) {
        let matchKana = false;
        let matchAlpha = false;
        if (kanaActive) {
          if (state.kanaChar) {
            matchKana = (a.kana === state.kanaChar);
          } else {
            matchKana = Boolean(a.row && state.kanaRows.includes(a.row));
          }
        }
        if (alphaActive) {
          matchAlpha = Boolean(a.alpha && state.alphaChars.includes(a.alpha));
        }
        if (!matchKana && !matchAlpha) return false;
      }

      if (meikyokuActive && !isSearch) {
        const mkList = MEIKYOKU_BY_AID.get(a.aid);
        if (!mkList || !mkList.some(m => matchesMeikyokuStarFilter(m.stars))) return false;
      }

      // Apply artist-level heart filter when not in song-row views
      if (hasHeartFilter && !isSongSearchTab && !isMeikyokuSearch && !(state.view === "recommend" && state.recommendTab === "song")) {
        if (!isSearch || state.searchTarget === "artist" || !q) {
          if (!matchesHeartTierFilter(getArtistHeartTier(a.aid))) return false;
        }
      }

      if (isSearch && !isSongSearchTab && !isComposerSearchTab && !isMeikyokuSearch && q) {
        if (!evaluateSearchMatch(a, q, qNoSpace)) return false;
        if (hasHeartFilter) {
          const artMatchesHeart = matchesHeartTierFilter(getArtistHeartTier(a.aid));
          const songMatchesHeart = Array.isArray(a._matchedSongsList) && a._matchedSongsList.some(s => matchesHeartTierFilter(getSongHeartTier(a.aid, s)));
          if (!artMatchesHeart && !songMatchesHeart) return false;
        }
      } else if (!isSongSearchTab && !isMeikyokuSearch) {
        a._searchTier = 99;
        a._searchMatchRatio = 0;
        a._matchedSongPreview = null;
        a._matchedSongsList = null;
        a._matchedSongsMoreCount = 0;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = "";
      }

      return true;
    });

    // Build individual song items & canonical song groups when in "楽曲を検索" (`isSongSearchTab`) or "銘曲" (`isMeikyokuSearch`)
    currentSongSearchItems = [];
    currentCanonicalSongGroups = [];
    currentMeikyokuItems = [];
    currentComposerItems = [];
    currentKaruAllSearchEntries = [];

    if (isComposerSearchTab) {
      currentComposerItems = buildFilteredComposerItems(currentFiltered, q, qNoSpace);
      return;
    }

    if (isMeikyokuSearch) {
      currentFiltered.forEach(a => {
        const mkList = MEIKYOKU_BY_AID.get(a.aid) || [];
        const artMatch = q ? evaluateArtistOnlyMatch(a, q, qNoSpace) : { matched: true, tier: 99, ratio: 0 };
        mkList.forEach(m => {
          if (!matchesMeikyokuStarFilter(m.stars)) return;
          const sTier = getSongHeartTier(a.aid, m.songTitle);
          const aTier = getArtistHeartTier(a.aid);
          if (hasHeartFilter && !matchesHeartTierFilter(sTier) && !matchesHeartTierFilter(aTier)) return;

          let bestTier = 99;
          let bestRatio = 0;
          if (q) {
            const sMatch = scoreSingleSongMatch(
              q,
              qNoSpace,
              m.norm,
              m.normNoSpace,
              m.aliases,
              m.aliasesNoSpace,
              m.normCanonical,
              m.normCanonicalNoSpace
            );
            if (!artMatch.matched && !sMatch) return;
            if (artMatch.matched && sMatch) {
              bestTier = Math.min(artMatch.tier, sMatch.tier);
              bestRatio = Math.max(artMatch.ratio, sMatch.ratio);
            } else if (artMatch.matched) {
              bestTier = artMatch.tier;
              bestRatio = artMatch.ratio;
            } else if (sMatch) {
              bestTier = sMatch.tier;
              bestRatio = sMatch.ratio;
            }
          }

          currentMeikyokuItems.push({
            artist: a,
            songTitle: m.songTitle,
            stars: m.stars,
            reason: m.reason,
            isListening: isSongInArtistListeningList(a, m.songTitle),
            tier: bestTier,
            ratio: bestRatio
          });
        });
      });

      // Sort by 五十音順 of artist (keeping multiple songs of the same artist consecutive!), then by star tier descending, then song title 50-on
      currentMeikyokuItems.sort((x, y) => {
        if (q) {
          if (x.tier !== y.tier) return x.tier - y.tier;
          if (Math.abs((y.ratio || 0) - (x.ratio || 0)) > 1e-6) {
            return (y.ratio || 0) - (x.ratio || 0);
          }
        }
        if (x.artist.aid !== y.artist.aid) {
          return compareArtistsBySortKey(x.artist, y.artist, "kanaAsc");
        }
        if (y.stars !== x.stars) return y.stars - x.stars;
        return compareSongsKanaAsc(x.songTitle, y.songTitle, x.artist, y.artist);
      });

      currentMeikyokuItems.forEach((item, idx) => {
        item.rank = idx + 1;
      });
      return;
    }

    if (isSongSearchTab) {
      const exactKey = state.exactCanonicalSongKey || "";
      const exactArtistAid = (state.karuSpecialMode && state.exactArtistSongsAid) ? state.exactArtistSongsAid : "";
      const seenAidForExactKey = new Set();
      const seenArtistSongKey = new Set();

      currentFiltered.forEach(a => {
        if (exactArtistAid && a.aid !== exactArtistAid) return;
        const artMatch = (state.karuSpecialMode && q && !exactKey && !exactArtistAid)
          ? evaluateArtistOnlyMatch(a, q, qNoSpace)
          : { matched: false, tier: 99, ratio: 0 };
        const songPool = Array.isArray(a._searchableSongs) ? a._searchableSongs : [];
        for (let i = 0; i < songPool.length; i++) {
          const sObj = songPool[i];
          const sTier = getSongHeartTier(a.aid, sObj.title);
          if (hasHeartFilter && !matchesHeartTierFilter(sTier)) continue;

          if (exactArtistAid) {
            // Only list Karu's listening songs (a.songs, not un-listened topSongs) when jumping from「○○の曲」button
            if (sObj.isTopSong) continue;
            const dedupKey = `${a.aid}\t${sObj.title}`;
            if (seenArtistSongKey.has(dedupKey)) continue;
            seenArtistSongKey.add(dedupKey);
            currentSongSearchItems.push({
              artist: a,
              songTitle: sObj.title,
              isTopSong: false,
              canonicalTitle: sObj.canonicalTitle,
              canonicalKey: sObj.canonicalKey,
              tier: 1,
              ratio: 3.1
            });
          } else if (exactKey) {
            if (sObj.canonicalKey !== exactKey) continue;
            if (seenAidForExactKey.has(a.aid)) continue;
            seenAidForExactKey.add(a.aid);
            currentSongSearchItems.push({
              artist: a,
              songTitle: sObj.title,
              isTopSong: Boolean(sObj.isTopSong),
              canonicalTitle: sObj.canonicalTitle,
              canonicalKey: sObj.canonicalKey,
              tier: 4,
              ratio: 3.1
            });
          } else if (q) {
            const sc = scoreSingleSongMatch(
              q,
              qNoSpace,
              sObj.norm,
              sObj.normNoSpace,
              sObj.aliases,
              sObj.aliasesNoSpace,
              sObj.normCanonical,
              sObj.normCanonicalNoSpace
            );
            const compSc = state.karuSpecialMode
              ? evaluateSongComposerMatch(a, sObj.title, q, qNoSpace)
              : null;
            const hasArtMatch = Boolean(state.karuSpecialMode && artMatch.matched && !sObj.isTopSong);
            if (hasArtMatch || sc || compSc) {
              const dedupKey = `${a.aid}\t${sObj.title}`;
              if (seenArtistSongKey.has(dedupKey)) continue;
              seenArtistSongKey.add(dedupKey);
              let bestTier = 99;
              let bestRatio = 0;
              if (hasArtMatch) {
                bestTier = Math.min(bestTier, artMatch.tier);
                bestRatio = Math.max(bestRatio, artMatch.ratio);
              }
              if (sc) {
                bestTier = Math.min(bestTier, sc.tier);
                bestRatio = Math.max(bestRatio, sc.ratio);
              }
              if (compSc) {
                bestTier = Math.min(bestTier, compSc.tier);
                bestRatio = Math.max(bestRatio, compSc.ratio);
              }
              currentSongSearchItems.push({
                artist: a,
                songTitle: sObj.title,
                isTopSong: Boolean(sObj.isTopSong),
                canonicalTitle: sObj.canonicalTitle,
                canonicalKey: sObj.canonicalKey,
                tier: bestTier,
                ratio: bestRatio
              });
            }
          } else {
            currentSongSearchItems.push({
              artist: a,
              songTitle: sObj.title,
              isTopSong: Boolean(sObj.isTopSong),
              canonicalTitle: sObj.canonicalTitle,
              canonicalKey: sObj.canonicalKey,
              tier: 99,
              ratio: 0
            });
          }
        }
      });

      const songSortMode = state.searchSongSort === "alphaAsc" ? "alphaAsc" : "kanaAsc";
      currentSongSearchItems.sort((x, y) => {
        if (q && !exactKey && !state.searchSortOverride) {
          if (x.tier !== y.tier) return x.tier - y.tier;
          if (Math.abs((y.ratio || 0) - (x.ratio || 0)) > 1e-6) {
            return (y.ratio || 0) - (x.ratio || 0);
          }
        }
        if (songSortMode === "alphaAsc") {
          return compareSongsAlphaAsc(x.songTitle, y.songTitle, x.artist, y.artist);
        }
        return compareSongsKanaAsc(x.songTitle, y.songTitle, x.artist, y.artist);
      });

      currentSongSearchItems.forEach((item, idx) => {
        item.rank = idx + 1;
      });

      if (state.sameSongCountMode && !exactKey) {
        const grpMap = new Map();
        currentSongSearchItems.forEach(item => {
          const ck = item.canonicalKey;
          if (!ck) return;
          let g = grpMap.get(ck);
          if (!g) {
            g = {
              canonicalKey: ck,
              displayCounts: new Map(),
              artistMap: new Map(),
              bestTier: item.tier,
              bestRatio: item.ratio
            };
            grpMap.set(ck, g);
          }
          g.displayCounts.set(item.canonicalTitle, (g.displayCounts.get(item.canonicalTitle) || 0) + 1);
          if (!g.artistMap.has(item.artist.aid)) {
            g.artistMap.set(item.artist.aid, item.artist.name);
          }
          if (item.tier < g.bestTier) g.bestTier = item.tier;
          if (item.ratio > g.bestRatio) g.bestRatio = item.ratio;
        });

        grpMap.forEach(g => {
          let bestDisp = "";
          let bestCnt = -1;
          g.displayCounts.forEach((cnt, disp) => {
            if (cnt > bestCnt || (cnt === bestCnt && disp.length < bestDisp.length)) {
              bestCnt = cnt;
              bestDisp = disp;
            }
          });
          const artistNames = Array.from(g.artistMap.values());
          const sampleText = artistNames.slice(0, 4).join("・") + (artistNames.length > 4 ? " ほか" : "");
          currentCanonicalSongGroups.push({
            canonicalKey: g.canonicalKey,
            displayTitle: bestDisp || g.canonicalKey,
            count: g.artistMap.size,
            sampleArtistsText: sampleText,
            bestTier: g.bestTier,
            bestRatio: g.bestRatio
          });
        });

        currentCanonicalSongGroups.sort((x, y) => {
          if (y.count !== x.count) return y.count - x.count;
          if (q) {
            if (x.bestTier !== y.bestTier) return x.bestTier - y.bestTier;
            if (Math.abs(y.bestRatio - x.bestRatio) > 1e-6) return y.bestRatio - x.bestRatio;
          }
          return compareSongsKanaAsc(x.displayTitle, y.displayTitle, null, null);
        });

        let prevCnt = null;
        let curRank = 0;
        currentCanonicalSongGroups.forEach((g, idx) => {
          if (g.count !== prevCnt) {
            curRank = idx + 1;
            prevCnt = g.count;
          }
          g.rank = curRank;
        });
      }
      return;
    }

    // Sort pipeline:
    // - In Search ("song"): sorts by SONG TITLE (五十音順 or アルファベット順), with match ratio prioritized first when q is entered (unless user manually overrode sort).
    // - In Search ("all" / "artist"): defaults to 五十音順, with match ratio prioritized first when q is entered (unless user manually overrode sort).
    // - In Main views ("all" / "cat1" / "cat2"): sorts by state.sortBy.
    currentFiltered.sort((a, b) => {
      if (isSearch) {
        if (isMeikyokuListView()) {
      const mkHits = currentMeikyokuItems.slice(0, 6);
      if (mkHits.length === 0) {
        bar.style.display = "none";
        bar.innerHTML = "";
        return;
      }
      const moreCount = Math.max(0, currentMeikyokuItems.length - mkHits.length);
      const moreNoteHTML = moreCount > 0
        ? `<span class="search-cand-more-note">＋ほか${fmtNum(moreCount)}件（下の一覧に表示）</span>`
        : "";
      bar.style.display = "flex";
      bar.innerHTML = `<span class="search-cand-label">上位候補:</span>` + mkHits.map(item => {
        const a = item.artist;
        const starBadge = buildMeikyokuStarBadgeHTML(item.stars, "cand-meikyoku-stars");
        return `
          <button type="button" class="search-cand-chip exact-hit" data-cand-artist="${esc(a.name)}" title="${esc(a.name)} の詳細を表示">
            <span class="search-cand-name">♪ ${esc(item.songTitle)}${starBadge}</span>
            <span class="search-cand-count">${esc(a.name)}</span>
          </button>
        `;
      }).join("") + moreNoteHTML;
      return;
    }
    if (state.searchTarget === "song") {
          const songSortMode = state.searchSongSort || "kanaAsc";
          if (q && !state.searchSortOverride) {
            if (a._searchTier !== b._searchTier) return a._searchTier - b._searchTier;
            if (Math.abs((b._searchMatchRatio || 0) - (a._searchMatchRatio || 0)) > 1e-6) {
              return (b._searchMatchRatio || 0) - (a._searchMatchRatio || 0);
            }
          }
          const sA = a._matchedSongPreview || getRepresentativeSongForSongTabSort(a, songSortMode);
          const sB = b._matchedSongPreview || getRepresentativeSongForSongTabSort(b, songSortMode);
          if (songSortMode === "alphaAsc") {
            return compareSongsAlphaAsc(sA, sB, a, b);
          }
          return compareSongsKanaAsc(sA, sB, a, b);
        }

        const artSortMode = state.searchArtistSort || "kanaAsc";
        const isKaruFavArtistSort = Boolean(
          state.karuSpecialMode &&
          state.searchTarget === "artist" &&
          (artSortMode === "favCountDesc" || artSortMode === "favRatioDesc")
        );
        if (q && !state.searchSortOverride && !isKaruFavArtistSort) {
          if (a._searchTier !== b._searchTier) return a._searchTier - b._searchTier;
          if (Math.abs((b._searchMatchRatio || 0) - (a._searchMatchRatio || 0)) > 1e-6) {
            return (b._searchMatchRatio || 0) - (a._searchMatchRatio || 0);
          }
          // When both are song matches in "all" search, sort by matched song title in 50-on order!
          if (a._searchTier >= 4 && b._searchTier >= 4 && a._matchedSongPreview && b._matchedSongPreview) {
            return compareSongsKanaAsc(a._matchedSongPreview, b._matchedSongPreview, a, b);
          }
          return compareArtistsBySortKey(a, b, "kanaAsc");
        }
        if (artSortMode === "kanaAsc" && q && a._searchTier >= 4 && b._searchTier >= 4 && a._matchedSongPreview && b._matchedSongPreview) {
          return compareSongsKanaAsc(a._matchedSongPreview, b._matchedSongPreview, a, b);
        }
        return compareArtistsBySortKey(a, b, artSortMode);
      }

      if (kanaActive && alphaActive && (state.sortBy === "kanaAsc" || state.sortBy === "alphaAsc")) {
        const aIsAlpha = Boolean(a.alpha && state.alphaChars.includes(a.alpha));
        const bIsAlpha = Boolean(b.alpha && state.alphaChars.includes(b.alpha));
        if (aIsAlpha !== bIsAlpha) {
          if (state.sortBy === "alphaAsc") return aIsAlpha ? -1 : 1;
          return aIsAlpha ? 1 : -1;
        }
      }
      return compareBySelectedSort(a, b);
    });

    // Precalculate display rank
    let prevMetric = null;
    let currentRank = 0;
    currentFiltered.forEach((a, idx) => {
      if (!isSearch && state.sortBy === "countDesc") {
        if (a.count !== prevMetric) {
          currentRank = idx + 1;
          prevMetric = a.count;
        }
        a._displayRank = currentRank;
      } else if (!isSearch && state.sortBy === "favCountDesc") {
        const fc = getArtistFavSongCount(a);
        if (fc !== prevMetric) {
          currentRank = idx + 1;
          prevMetric = fc;
        }
        a._displayRank = currentRank;
      } else {
        a._displayRank = idx + 1;
      }
    });

    if (isKaruAllQuerySearchView()) {
      const matchedArtists = currentFiltered.filter(a => a._searchTier <= 3);
      matchedArtists.forEach((a, idx) => {
        a._displayRank = idx + 1;
        currentKaruAllSearchEntries.push({
          type: "artist",
          artist: a,
          rank: idx + 1
        });
      });

      const seenSongKeys = new Set();
      const expandedSongs = [];
      currentFiltered.forEach(a => {
        const isMatchedArtist = a._searchTier <= 3;
        const songPool = Array.isArray(a._searchableSongs) ? a._searchableSongs : [];
        for (let i = 0; i < songPool.length; i++) {
          const sObj = songPool[i];
          const sTier = getSongHeartTier(a.aid, sObj.title);
          if (hasHeartFilter && !matchesHeartTierFilter(sTier)) continue;
          const sc = scoreSingleSongMatch(
            q,
            qNoSpace,
            sObj.norm,
            sObj.normNoSpace,
            sObj.aliases,
            sObj.aliasesNoSpace,
            sObj.normCanonical,
            sObj.normCanonicalNoSpace
          );
          const compSc = evaluateSongComposerMatch(a, sObj.title, q, qNoSpace);
          const hasArtMatch = Boolean(isMatchedArtist && !sObj.isTopSong);
          if (hasArtMatch || sc || compSc) {
            const dk = `${a.aid}\t${sObj.title}`;
            if (seenSongKeys.has(dk)) continue;
            seenSongKeys.add(dk);
            let bestTier = 99;
            let bestRatio = 0;
            if (hasArtMatch) {
              bestTier = Math.min(bestTier, a._searchTier);
              bestRatio = Math.max(bestRatio, a._searchMatchRatio || 0);
            }
            if (sc) {
              bestTier = Math.min(bestTier, sc.tier);
              bestRatio = Math.max(bestRatio, sc.ratio);
            }
            if (compSc) {
              bestTier = Math.min(bestTier, compSc.tier);
              bestRatio = Math.max(bestRatio, compSc.ratio);
            }
            expandedSongs.push({
              artist: a,
              songTitle: sObj.title,
              isTopSong: Boolean(sObj.isTopSong),
              canonicalTitle: sObj.canonicalTitle,
              canonicalKey: sObj.canonicalKey,
              tier: bestTier,
              ratio: bestRatio
            });
          }
        }
      });

      expandedSongs.sort((x, y) => {
        if (!state.searchSortOverride) {
          if (x.tier !== y.tier) return x.tier - y.tier;
          if (Math.abs((y.ratio || 0) - (x.ratio || 0)) > 1e-6) {
            return (y.ratio || 0) - (x.ratio || 0);
          }
        }
        return compareSongsKanaAsc(x.songTitle, y.songTitle, x.artist, y.artist);
      });

      expandedSongs.forEach((item, idx) => {
        item.rank = idx + 1;
        currentSongSearchItems.push(item);
        currentKaruAllSearchEntries.push({
          type: "song",
          songItem: item,
          rank: idx + 1
        });
      });
    }
  }

  // Render Search Candidate Chips below Search Input
  function renderSearchCandidates() {
    const bar = document.getElementById("searchCandidatesBar");
    if (!bar) return;
    const isSearch = state.view === "search";
    const q = isSearch ? normSearch(state.searchQuery) : "";
    if (!isSearch || !q) {
      bar.style.display = "none";
      bar.innerHTML = "";
      return;
    }

    if (state.karuSpecialMode && state.searchTarget === "composer" && !isMeikyokuListView()) {
      const compHits = currentComposerItems.slice(0, 6);
      if (compHits.length === 0) {
        bar.style.display = "none";
        bar.innerHTML = "";
        return;
      }
      const moreCount = Math.max(0, currentComposerItems.length - compHits.length);
      const moreNoteHTML = moreCount > 0
        ? `<span class="search-cand-more-note">＋ほか${fmtNum(moreCount)}件（下の一覧に表示）</span>`
        : "";
      bar.style.display = "flex";
      bar.innerHTML = `<span class="search-cand-label">上位候補:</span>` + compHits.map(comp => {
        const isExact = comp.tier === 1;
        return `
          <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-composer="${esc(comp.name)}" title="${esc(comp.displayName)} の担当曲一覧を表示">
            <span class="search-cand-name">${esc(comp.displayName)}</span>
            <span class="search-cand-count">${fmtNum(comp.songs.length)}曲</span>
          </button>
        `;
      }).join("") + moreNoteHTML;
      return;
    }

    if (state.searchTarget === "song") {
      if (isSameSongGroupListView()) {
        bar.style.display = "none";
        bar.innerHTML = "";
        return;
      }
      const allSongHits = currentSongSearchItems;
      const songHits = allSongHits.slice(0, 6);
      if (songHits.length === 0) {
        bar.style.display = "none";
        bar.innerHTML = "";
        return;
      }
      const moreCount = Math.max(0, allSongHits.length - songHits.length);
      const moreNoteHTML = moreCount > 0
        ? `<span class="search-cand-more-note">＋ほか${fmtNum(moreCount)}件（下の一覧に表示）</span>`
        : "";
      bar.style.display = "flex";
      bar.innerHTML = `<span class="search-cand-label">上位候補:</span>` + songHits.map(item => {
        const a = item.artist;
        const isExact = item.tier === 4;
        const sngTier = getSongHeartTier(a.aid, item.songTitle);
        const sngHeart = sngTier > 0 ? buildHeartBadgeSpanHTML(sngTier, "artist-fav-heart song-search-fav-heart", "かるのオススメ楽曲") : "";
        const topBadge = buildKaruTopOnlyBadgeHTML(a, item.songTitle, item.isTopSong, "cand-top-only-tag");
        return `
          <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-artist="${esc(a.name)}" title="${esc(a.name)} の詳細を表示">
            <span class="search-cand-name">♪ ${esc(item.songTitle)}${sngHeart}${topBadge}</span>
            <span class="search-cand-count">${esc(a.name)}</span>
          </button>
        `;
      }).join("") + moreNoteHTML;
      return;
    }

    const allGroupHits = (state.searchTarget === "all" || state.searchTarget === "group")
      ? currentMatchedGroups
      : [];
    const allArtistHits = state.searchTarget === "group"
      ? []
      : currentFiltered.filter(a => a._searchTier <= 3);
    const allSongHits = state.searchTarget === "all"
      ? currentFiltered.filter(a => a._matchedSongPreview)
      : [];

    const groupHits = allGroupHits.slice(0, state.searchTarget === "group" ? 6 : 3);
    const artistHits = allArtistHits.slice(0, state.searchTarget === "all" ? 4 : 6);
    const songHits = allSongHits.slice(0, 4);

    if (groupHits.length === 0 && artistHits.length === 0 && songHits.length === 0) {
      bar.style.display = "none";
      bar.innerHTML = "";
      return;
    }

    const totalHidden =
      Math.max(0, allGroupHits.length - groupHits.length) +
      Math.max(0, allArtistHits.length - artistHits.length) +
      Math.max(0, allSongHits.length - songHits.length);
    const moreNoteHTML = totalHidden > 0
      ? `<span class="search-cand-more-note">＋ほか${fmtNum(totalHidden)}件（下の一覧に表示）</span>`
      : "";

    const groupChipsHTML = groupHits.map(g => `
      <button type="button" class="search-cand-chip exact-hit" data-cand-group-type="${esc(g.type)}" data-cand-group-name="${esc(g.name)}" title="グループ「${esc(g.name)}」で絞り込む">
        <span>${esc(g.name)}</span>
        <span class="search-cand-count">${fmtNum(g.count)}名義</span>
      </button>
    `).join("");

    const artistChipsHTML = artistHits.map(a => {
      const isExact = a._searchTier === 1;
      const mono = esc(getMonogram(a.name));
      const grad = getAvatarGradient(a.name);
      const dotContent = a.img
        ? `<img src="${esc(optimizeAvatarUrl(a.img, 48))}" alt="" width="18" height="18" loading="eager" decoding="async" referrerpolicy="no-referrer" onerror="this.style.display='none'">`
        : `<span style="background:${grad};width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${mono[0] || "♪"}</span>`;
      return `
        <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-artist="${esc(a.name)}" title="${esc(a.name)} の詳細を表示">
          <span class="search-cand-dot">${dotContent}</span>
          <span>${esc(a.name)}</span>
          <span class="search-cand-count">${fmtNum(a.count)}曲</span>
        </button>
      `;
    }).join("");

    const songChipsHTML = songHits.map(a => {
      const isExact = a._searchTier === 4;
      const isSngFav = isRecommendedSong(a.aid, a._matchedSongPreview);
      const sngHeart = isSngFav ? `<span class="artist-fav-heart song-search-fav-heart" title="かるのオススメ楽曲" aria-label="かるのオススメ楽曲">${HEART_SVG_INNER}</span>` : "";
      return `
        <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-artist="${esc(a.name)}" title="一致楽曲: ${esc(a._matchedSongPreview)}（${esc(a.name)}）">
          <span class="search-cand-name">♪ ${esc(a._matchedSongPreview)}${sngHeart}</span>
          <span class="search-cand-count">${esc(a.name)}</span>
        </button>
      `;
    }).join("");

    bar.style.display = "flex";
    bar.innerHTML = `<span class="search-cand-label">上位候補:</span>` + groupChipsHTML + artistChipsHTML + songChipsHTML + moreNoteHTML;
  }

  // Update Header Stats & Navigation Badges (PC & Mobile Stat Cards dynamically populated)
  function renderStaticStats() {
    document.getElementById("statTotal").textContent = fmtNum(countTotal);
    document.getElementById("statCat1").textContent = fmtNum(countCat1);
    document.getElementById("statCat2").textContent = fmtNum(countCat2);
    document.getElementById("mobStatTotal").textContent = fmtNum(countTotal);
    document.getElementById("mobStatCat1").textContent = fmtNum(countCat1);
    document.getElementById("mobStatCat2").textContent = fmtNum(countCat2);
    const navAll = document.getElementById("navBadgeAll");
    if (navAll) navAll.textContent = fmtNum(countTotal);
    document.getElementById("navBadgeCat1").textContent = fmtNum(countCat1);
    document.getElementById("navBadgeCat2").textContent = fmtNum(countCat2);
    const recCnt = fmtNum(getRecommendedCount());
    const recSongCnt = fmtNum(getRecommendedSongCount());
    const navRec = document.getElementById("navBadgeRecommend");
    if (navRec) navRec.textContent = recCnt;
    const statRec = document.getElementById("statRecommend");
    if (statRec) statRec.textContent = recCnt;
    const mobStatRec = document.getElementById("mobStatRecommend");
    if (mobStatRec) mobStatRec.textContent = recCnt;
    const mobStatRecSongs = document.getElementById("mobStatRecommendSongs");
    if (mobStatRecSongs) mobStatRecSongs.textContent = recSongCnt;
    updateSearchScopeCounts();

  }

  // Render Filter Controls (Activity Roles, YouTube Subscribers, 50-on, Alphabet) into both PC drawer & Mobile sheet
  // Item 3: Heading labels simplified to "活動形態" and "YouTubeチャンネル登録者数" without "（複数選択可）"
  function buildFilterControlsHTML() {
    const rows = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];
    const singleRow = state.kanaRows.length === 1 ? state.kanaRows[0] : "";
    const subChars = singleRow ? (KANA_ROW_CHARS[singleRow] || []) : [];

    const isSongSearchOnly = state.view === "search" && state.searchTarget === "song";
    const heartAllAct = state.heartFilter.includes("all");
    const heart3Act = state.heartFilter.includes("3");
    const heart2Act = state.heartFilter.includes("2");
    const heart1Act = state.heartFilter.includes("1");

    const mkAllAct = state.meikyokuFilter.includes("all");
    const mk3Act = state.meikyokuFilter.includes("3");
    const mk2Act = state.meikyokuFilter.includes("2");
    const mk1Act = state.meikyokuFilter.includes("1");
    const meikyokuGroupHTML = state.karuSpecialMode ? `
        <div class="meikyoku-filter-section">
          <div class="filter-group-title">
            <span>銘曲</span>
            ${state.meikyokuFilter.length ? `<button type="button" class="clear-all-chips-btn" data-clear-meikyoku="1">解除</button>` : ""}
          </div>
          <div class="preset-pills">
            <button type="button" class="pill-btn meikyoku-filter-pill ${mkAllAct ? "active" : ""}" data-filter-meikyoku="all" aria-pressed="${mkAllAct}">
              <span class="meikyoku-pill-stars">☆</span><span>すべて</span>
            </button>
            <button type="button" class="pill-btn meikyoku-filter-pill ${mk3Act ? "active" : ""}" data-filter-meikyoku="3" aria-pressed="${mk3Act}">
              <span class="meikyoku-pill-stars stars-lv-3">☆☆☆</span><span>Lv.3</span>
            </button>
            <button type="button" class="pill-btn meikyoku-filter-pill ${mk2Act ? "active" : ""}" data-filter-meikyoku="2" aria-pressed="${mk2Act}">
              <span class="meikyoku-pill-stars stars-lv-2">☆☆</span><span>Lv.2</span>
            </button>
            <button type="button" class="pill-btn meikyoku-filter-pill ${mk1Act ? "active" : ""}" data-filter-meikyoku="1" aria-pressed="${mk1Act}">
              <span class="meikyoku-pill-stars stars-lv-1">☆</span><span>Lv.1</span>
            </button>
          </div>
        </div>
    ` : "";

    const isComposerSearchOnly = Boolean(state.karuSpecialMode && state.view === "search" && state.searchTarget === "composer");
    const composerExcludeOpts = [2, 3, 5, 10, 20];
    const curCompExclude = Number(state.composerExcludeMaxSongs || 0);
    const composerExcludeGroupHTML = isComposerSearchOnly ? `
        <div class="composer-exclude-filter-section">
          <div class="filter-group-title">
            <span>担当曲を除外</span>
            ${curCompExclude > 0 ? `<button type="button" class="clear-all-chips-btn" data-clear-composer-exclude="1">解除</button>` : ""}
          </div>
          <div class="preset-pills">
            ${composerExcludeOpts.map(n => {
              const isAct = curCompExclude === n;
              return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-filter-composer-exclude="${n}" aria-pressed="${isAct}">${n}曲以下</button>`;
            }).join("")}
          </div>
        </div>
    ` : "";

    return `
      <div class="filter-grid">
        ${composerExcludeGroupHTML}
        ${meikyokuGroupHTML}
        <div>
          <div class="filter-group-title">
            <span>高評価</span>
            ${state.heartFilter.length ? `<button type="button" class="clear-all-chips-btn" data-clear-hearts="1">解除</button>` : ""}
          </div>
          <div class="preset-pills">
            <button type="button" class="pill-btn heart-filter-pill ${heartAllAct ? "active" : ""}" data-filter-heart="all" aria-pressed="${heartAllAct}">
              <span class="heart-filter-all-mark" aria-hidden="true">${HEART_SVG_SINGLE}</span><span>すべて</span>
            </button>
            <button type="button" class="pill-btn heart-filter-pill ${heart3Act ? "active" : ""}" data-filter-heart="3" aria-pressed="${heart3Act}">
              ${buildHeartBadgeSpanHTML(3, "artist-fav-heart heart-filter-badge", "Lv.3")}<span>Lv.3</span>
            </button>
            <button type="button" class="pill-btn heart-filter-pill ${heart2Act ? "active" : ""}" data-filter-heart="2" aria-pressed="${heart2Act}">
              ${buildHeartBadgeSpanHTML(2, "artist-fav-heart heart-filter-badge", "Lv.2")}<span>Lv.2</span>
            </button>
            <button type="button" class="pill-btn heart-filter-pill ${heart1Act ? "active" : ""}" data-filter-heart="1" aria-pressed="${heart1Act}">
              ${buildHeartBadgeSpanHTML(1, "artist-fav-heart heart-filter-badge", "Lv.1")}<span>Lv.1</span>
            </button>
          </div>
        </div>


        <div>
          <div class="filter-group-title">
            <span>活動形態</span>
            ${state.roles.length ? `<button type="button" class="clear-all-chips-btn" data-clear-roles="1">解除</button>` : ""}
          </div>
          <div class="preset-pills">
            ${(() => {
              const isCat1Only = (state.view === "cat1") || (state.view === "search" && state.searchScope === "cat1");
              const isCat2Only = (state.view === "cat2") || (state.view === "search" && state.searchScope === "cat2");
              let rolesToShow;
              if (isCat1Only) {
                rolesToShow = ["Vsinger", "Vtuber", "歌い手", "声優", "キャラ", "歌手", "音楽グループ"];
              } else if (isCat2Only) {
                rolesToShow = ["Vtuber", "Vsinger", "歌手", "声優", "キャラ", "音楽グループ(アニゲー関連)", "音楽グループ(その他)"];
                if (state.roles.includes("歌い手")) rolesToShow.unshift("歌い手");
              } else {
                rolesToShow = ["Vsinger", "Vtuber", "歌い手", "声優", "キャラ", "歌手", "音楽グループ(アニゲー関連)", "音楽グループ(その他)"];
              }
              return rolesToShow.map(role => {
                const isAct = state.roles.includes(role);
                const mobRoleLabel = role.startsWith("音楽グループ(") ? role.replace(/^音楽/, "") : role;
                const labelHTML = (mobRoleLabel !== role)
                  ? `<span class="tab-label-pc">${esc(role)}</span><span class="tab-label-mob">${esc(mobRoleLabel)}</span>`
                  : esc(role);
                return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-filter-role="${esc(role)}" aria-pressed="${isAct}">${labelHTML}</button>`;
              }).join("");
            })()}
          </div>
        </div>

        <div>
          <div class="filter-group-title">
            <span>五十音</span>
            ${hasKanaFilter() ? `<button type="button" class="clear-all-chips-btn" data-clear-kana="1">解除</button>` : ""}
          </div>
          <div class="index-pills">
            ${rows.map(r => {
              const isAct = state.kanaRows.includes(r);
              return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-kana-row="${r}" aria-pressed="${isAct}">${r}行</button>`;
            }).join("")}
          </div>
          ${subChars.length ? `
            <div class="sub-kana-row">
              <div class="sub-kana-top">
                <span class="sub-kana-label">${singleRow}行の文字:</span>
                <button type="button" class="pill-btn ${!state.kanaChar ? "active" : ""}" data-kana-char="">${singleRow}行すべて</button>
              </div>
              <div class="sub-kana-chars">
                ${subChars.map(c => `<button type="button" class="pill-btn ${state.kanaChar === c ? "active" : ""}" data-kana-char="${c}">${c}</button>`).join("")}
              </div>
            </div>
          ` : ""}
        </div>

        <div>
          <div class="filter-group-title">
            <span>アルファベット (A–Z)</span>
            ${hasAlphaFilter() ? `<button type="button" class="clear-all-chips-btn" data-clear-alpha="1">解除</button>` : ""}
          </div>
          <div class="index-pills">
            ${ALPHABET.map(ch => {
              const isAct = state.alphaChars.includes(ch);
              return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-alpha-char="${ch}" aria-pressed="${isAct}">${ch}</button>`;
            }).join("")}
          </div>
        </div>

        <div class="pc-only-filter-group filter-agency-wide">
          <div class="filter-group-title">
            <span>所属（事務所・作品）</span>
            ${state.agencyGroup ? `<button type="button" class="clear-all-chips-btn" data-clear-agency="1">解除</button>` : ""}
          </div>
          <div class="preset-pills">
            ${CLICKABLE_AGENCY_GROUPS.map(ag => {
              const isAct = state.agencyGroup === ag.name;
              return `<button type="button" class="pill-btn ${isAct ? "active" : ""}" data-filter-agency-pill="${esc(ag.name)}" aria-pressed="${isAct}">${esc(ag.name)}<span class="ag-pill-cnt">(${ag.count})</span></button>`;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderActiveFilterChips() {
    const chips = [];
    if (state.karuSpecialMode && state.view === "search" && state.searchTarget === "composer" && Number(state.composerExcludeMaxSongs || 0) > 0) {
      chips.push({ key: "composerExclude", label: `担当曲: ${Number(state.composerExcludeMaxSongs)}曲以下を除外` });
    }
    if (hasMeikyokuFilter()) {
      if (state.meikyokuFilter.includes("all")) {
        chips.push({ key: "meikyoku:all", label: "銘曲: ☆すべて" });
      } else {
        const starLabelMap = { "3": "☆☆☆ Lv.3", "2": "☆☆ Lv.2", "1": "☆ Lv.1" };
        state.meikyokuFilter.forEach(mt => {
          chips.push({ key: `meikyoku:${mt}`, label: `銘曲: ${starLabelMap[mt] || mt}` });
        });
      }
    }
    if (state.view === "search" && state.searchTarget === "song" && !isMeikyokuListView()) {
      if (state.exactCanonicalSongKey) {
        chips.push({ key: "exactCanonicalSong", label: `同一曲: 「${state.exactCanonicalSongTitle || state.searchQuery}」` });
      } else if (state.sameSongCountMode) {
        chips.push({ key: "sameSongCountMode", label: "集計: 同一曲数順" });
      }
    }
    if (Array.isArray(state.heartFilter) && state.heartFilter.length > 0) {
      if (state.heartFilter.includes("all")) {
        chips.push({ key: "heart:all", label: "高評価: ❤すべて" });
      } else {
        const tierLabelMap = { "3": "Lv.3", "2": "Lv.2", "1": "Lv.1" };
        state.heartFilter.forEach(ht => {
          chips.push({ key: `heart:${ht}`, label: `高評価: ${tierLabelMap[ht] || ht}` });
        });
      }
    }
    if (state.agencyGroup) {
      chips.push({ key: "agencyGroup", label: `所属: ${state.agencyGroup}` });
    }
    if (state.unitGroup) {
      chips.push({ key: "unitGroup", label: `ユニット: ${state.unitGroup}` });
    }
    state.roles.forEach(role => {
      chips.push({ key: `role:${role}`, label: `活動形態: ${role}` });
    });
    if (state.kanaChar) {
      chips.push({ key: "kanaChar", label: `頭文字: 「${state.kanaChar}」` });
    } else {
      state.kanaRows.forEach(r => {
        chips.push({ key: `kanaRow:${r}`, label: `五十音: ${r}行` });
      });
    }
    state.alphaChars.forEach(ch => {
      chips.push({ key: `alpha:${ch}`, label: `英字: ${ch}` });
    });

    const container = document.getElementById("activeChipsContainer");
    const filterBtn = document.getElementById("pcFilterToggleBtn");

    const hasFilters = chips.length > 0;
    filterBtn.classList.toggle("has-filters", hasFilters);
    filterBtn.classList.toggle("open", state.pcFilterOpen || state.mobFilterOpen);

    if (!hasFilters) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = chips.map(c => `
      <span class="filter-chip">
        <span>${esc(c.label)}</span>
        <button type="button" class="chip-remove-btn" data-remove-chip="${esc(c.key)}" title="この条件を解除" aria-label="${esc(c.label)}を解除">×</button>
      </span>
    `).join("") + `<button type="button" class="clear-all-chips-btn" data-remove-chip="all">× すべて解除</button>`;
  }

  // Format YouTube subscriber count in readable Japanese (e.g. 134万人, 5.15万人, 4,560人, 未取得)
  function formatSubscribersJP(sub) {
    if (sub === null || sub === undefined || Number.isNaN(Number(sub))) {
      return "未取得";
    }
    const n = Number(sub);
    if (n >= 10000) {
      const man = n / 10000;
      const formatted = Number.isInteger(man)
        ? String(man)
        : man.toFixed(2).replace(/\.?0+$/, "");
      return `${formatted}万人`;
    }
    return `${fmtNum(n)}人`;
  }

  function formatArtistNameHTML(rawName, forSongSubtitle = false) {
    const s = String(rawName || "");
    if (s === "神崎エルザ (ガンゲイル・オンライン)") {
      if (forSongSubtitle) {
        return `<span class="name-pc-only">${esc(s)}</span><span class="name-mob-only">神崎エルザ(GGO)</span>`;
      }
      return `<span class="name-pc-only">${esc(s)}</span><span class="name-mob-only">神崎エルザ<br class="mob-paren-br">(GGO)</span>`;
    }
    const m = s.match(/^([^\(（]+?)(\s*)([\(（].*)$/);
    if (m && m[1]) {
      const basePart = esc(m[1]);
      const spacePart = m[2] ? `<span class="pc-paren-space">${esc(m[2])}</span>` : "";
      const parenPart = esc(m[3]);
      if (forSongSubtitle) {
        return `${basePart}${spacePart}<span class="mob-paren-chunk">${parenPart}</span>`;
      }
      return `${basePart}${spacePart}<br class="mob-paren-br"><span class="mob-paren-chunk">${parenPart}</span>`;
    }
    return esc(s);
  }

  // Build a single Artist Row HTML string
  function buildArtistRowHTML(a, isSearch, rowIndex = 999, hideRankNumber = false, customRoleRank = null) {
    const isSelected = state.selectedArtistName === a.name;
    const artistTier = getArtistHeartTier(a.name);
    const isFav = artistTier > 0;
    const favHeartHTML = isFav ? buildHeartBadgeSpanHTML(artistTier, "artist-fav-heart", "かるのオススメ") : "";
    const hasCustomRoleRank = typeof customRoleRank === "number" && customRoleRank > 0;
    const rankClass = (!hasCustomRoleRank && !hideRankNumber && state.sortBy === "countDesc" && !isSearch && a._displayRank <= 3) ? `top-${a._displayRank}` : "";
    const rankText = hasCustomRoleRank ? customRoleRank : (hideRankNumber ? "" : a._displayRank);
    const isSongSearchMode = (isSearch && (state.searchTarget === "song" || state.searchTarget === "all") && Boolean(a._matchedSongPreview)) || (state.view === "search" && state.searchTarget === "song" && Boolean(a._matchedSongPreview || (a.songs && a.songs[0])));
    const primarySongTitle = a._matchedSongPreview || ((state.view === "search" && state.searchTarget === "song" && Array.isArray(a.songs) && a.songs.length > 0) ? a.songs[0] : "");
    const matchedSongList = (Array.isArray(a._matchedSongsList) && a._matchedSongsList.length > 0)
      ? a._matchedSongsList
      : (primarySongTitle ? [primarySongTitle] : []);
    const matchedMoreCount = (Array.isArray(a._matchedSongsList) && a._matchedSongsList.length > 0)
      ? (a._matchedSongsMoreCount || 0)
      : ((!a._matchedSongPreview && state.view === "search" && state.searchTarget === "song" && Array.isArray(a.songs) && a.songs.length > 1) ? (a.songs.length - 1) : 0);
    const primarySongTier = (isSongSearchMode && primarySongTitle) ? getSongHeartTier(a.aid, primarySongTitle) : 0;
    const isPrimarySongFav = primarySongTier > 0;
    const songDisplayStr = a._matchedSongsDisplay || a._matchedSongPreview || "";
    let nameWrapInner = "";

    if (isSongSearchMode) {
      const tokensHTML = matchedSongList.map(sTitle => {
        const sTier = getSongHeartTier(a.aid, sTitle);
        const isSngFav = sTier > 0;
        const sngHeartHTML = isSngFav
          ? buildHeartBadgeSpanHTML(sTier, "artist-fav-heart song-search-fav-heart", "かるのオススメ楽曲")
          : "";
        const topOnlyBadgeHTML = buildKaruTopOnlyBadgeHTML(a, sTitle, false);
        return `<span class="row-matched-song-token ${isSngFav ? "is-song-fav" : ""}" data-matched-song-title="${esc(sTitle)}">${esc(sTitle)}${sngHeartHTML}</span>${topOnlyBadgeHTML}`;
      }).join(`<span class="row-matched-song-sep"> / </span>`);
      const moreSuffixHTML = matchedMoreCount > 0
        ? `<span class="row-matched-song-more"> ほか${fmtNum(matchedMoreCount)}曲</span>`
        : "";
      nameWrapInner = `
        <div class="row-song-primary">♪ ${tokensHTML}${moreSuffixHTML}</div>
        <div class="row-name row-name-with-song"><span class="row-artist-prefix">アーティスト:</span>${formatArtistNameHTML(a.name, true)}${formatKaruSongCreditsHTML(a, primarySongTitle)}</div>
      `;
    } else {
      let matchSub = "";
      if (isSearch) {
        if (a._matchedSongPreview) {
          matchSub = `<div class="row-match-sub row-match-song-both">♪ 一致楽曲: ${esc(songDisplayStr)}</div>`;
        } else if (a._matchedAliasHint) {
          matchSub = `<div class="row-match-sub row-match-kana">よみがな: ${esc(a._matchedAliasHint)}</div>`;
        }
      }
      nameWrapInner = `
        <div class="row-name">${formatArtistNameHTML(a.name, false)}${favHeartHTML}</div>
        ${matchSub}
      `;
    }

    const isUnclassified = !a.role || a.role === "判定保留";
    const effRoles = getEffectiveRolesForArtist(a);
    const rowRoles = effRoles.length > 0 ? effRoles : [isUnclassified ? "未分類" : a.role];
    const rowRoleBadgesHTML = rowRoles
      .map(r => `<span class="row-role-badge ${isUnclassified ? "unclassified" : ""}">${esc(r)}</span>`)
      .join("");
    const AGENCY_SHORT_LABELS = {
      "アイドルマスターシリーズ": "アイマス",
      "ラブライブ！シリーズ": "ラブライブ！",
      "神椿スタジオ": "神椿",
      "BanG Dream!": "バンドリ",
      "ウマ娘 プリティーダービー": "ウマ娘",
      "Tokyo 7th シスターズ": "ナナシス",
      "ガールズバンドクライ": "ガルク",
      "プロジェクトセカイ カラフルステージ！ feat. 初音ミク": "プロセカ",
      "青春ブタ野郎シリーズ": "青ブタ",
      "アイカツ！シリーズ": "アイカツ",
      "少女☆歌劇 レヴュースタァライト": "スタァライト",
      "INCS toenter (インクストゥエンター)": "INCS toenter",
      "ソードアート・オンライン": "SAO",
      "プリンセスコネクト！Re:Dive": "プリコネ",
      "ブルーアーカイブ -Blue Archive-": "ブルアカ",
      "ヘブンバーンズレッド": "ヘブバン",
      "ライヴラリ (ゆにクリエイト)": "ライヴラリ",
      "陰の実力者になりたくて！": "陰実",
      "告白実行委員会 (HoneyWorks)": "告白実行委員会"
    };

    const rawAgency = (a.agencyGroup || a.agency || "").trim();
    const shortAgency = rawAgency ? (AGENCY_SHORT_LABELS[rawAgency] || rawAgency) : "";
    const agencyCellHTML = shortAgency
      ? `<span class="row-agency-badge" title="所属（事務所・作品）：${esc(rawAgency)}">${esc(shortAgency)}</span>`
      : `<span class="row-agency-empty">—</span>`;

    const hasSub = a.sub !== null && a.sub !== undefined;
    const subLabel = formatSubscribersJP(a.sub);
    const subTitle = hasSub
      ? `YouTube公式チャンネル公開登録者数（${a.subDate || "2026-10-27"}取得）`
      : "YouTube公式チャンネル登録者数：未取得";

    const favSongCount = getArtistFavSongCount(a);
    const totalSongHearts = hasCustomRoleRank ? getArtistTotalSongHearts(a) : 0;
    const favSongCountHTML = hasCustomRoleRank
      ? `<div class="row-fav-song-count" title="高評価曲数（ハートを付けた曲数）">${fmtNum(favSongCount)}<span>曲</span></div><div class="row-total-heart-count col-pc-only" title="楽曲の総ハート数（最上位=3・第2=2・第1=1の合計）">${fmtNum(totalSongHearts)}<span class="total-heart-mark" aria-hidden="true">${HEART_SVG_SINGLE}</span></div>`
      : "";

    return `
      <div class="artist-row ${isSelected ? "selected" : ""} ${isFav ? "artist-is-fav" : ""} ${hasCustomRoleRank ? "recommend-artist-row" : ""} ${isSongSearchMode ? "song-matched-row" : ""} ${isPrimarySongFav ? "song-is-fav" : ""}" data-artist-name="${esc(a.name)}" data-artist-aid="${esc(a.aid || "")}" ${isFav ? `data-heart-tier="${artistTier}"` : ""} ${isSongSearchMode && primarySongTitle ? `data-primary-song="${esc(primarySongTitle)}"` : ""} role="button" tabindex="0">
        <div class="row-rank ${(hideRankNumber && !hasCustomRoleRank) ? "row-rank-blank" : rankClass}">${rankText}</div>
        <div class="row-avatar-wrap" title="${isSongSearchMode ? "" : "編集モード時：タップでオススメ切替"}">${renderAvatarHTML(a, false, rowIndex)}</div>
        <div class="row-name-wrap">
          ${nameWrapInner}
        </div>
        <div class="row-role col-pc-only">
          ${rowRoleBadgesHTML}
        </div>
        <div class="row-agency col-pc-only col-agency-wide">
          ${agencyCellHTML}
        </div>
        <div class="row-subs col-pc-only ${hasSub ? "" : "unacquired"}" title="${esc(subTitle)}">${esc(subLabel)}</div>
        <div class="row-count">${(function() {
          const isKaruArtistSearch = Boolean(state.karuSpecialMode && state.view === "search" && state.searchTarget === "artist");
          if (isKaruArtistSearch && state.searchArtistSort === "favCountDesc") {
            const fCnt = getArtistListeningFavSongCount(a);
            return `${fmtNum(fCnt)}<span>曲</span><span class="karu-sort-sub-metric">/${fmtNum(a.count)}曲</span>`;
          }
          if (isKaruArtistSearch && state.searchArtistSort === "favRatioDesc") {
            const fCnt = getArtistListeningFavSongCount(a);
            const fRat = getArtistListeningFavSongRatio(a);
            return `${formatFavRatioPercent(fRat)}<span>%</span><span class="karu-sort-sub-metric">(${fmtNum(fCnt)}/${fmtNum(a.count)})</span>`;
          }
          return `${fmtNum(a.count)}<span>曲</span>`;
        })()}</div>
        ${favSongCountHTML}
        ${hasCustomRoleRank ? `<div class="row-drag-handle" data-drag-handle="1" title="ドラッグして同じハートグレード内で並び替え" aria-label="ドラッグして並び替え"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="8" x2="20" y2="8"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="16" x2="20" y2="16"></line></svg></div>` : ""}
      </div>
    `;
  }

  // Build a single Song Row HTML for "かるのオススメ" -> "楽曲" tab (1 row per song, never joined with "/", artist heart hidden for clarity)
  function buildRecommendSongRowHTML(a, songTitle, rowIndex = 999, roleRank = 1) {
    const isSelected = state.selectedArtistName === a.name;
    const songTier = getSongHeartTier(a.aid, songTitle) || 3;
    const songHeartHTML = buildHeartBadgeSpanHTML(songTier, "artist-fav-heart", "かるのオススメ楽曲");

    const isUnclassified = !a.role || a.role === "判定保留";
    const effRoles = getEffectiveRolesForArtist(a);
    const rowRoles = effRoles.length > 0 ? effRoles : [isUnclassified ? "未分類" : a.role];
    const rowRoleBadgesHTML = rowRoles
      .map(r => `<span class="row-role-badge ${isUnclassified ? "unclassified" : ""}">${esc(r)}</span>`)
      .join("");

    const hasSub = a.sub !== null && a.sub !== undefined;
    const subLabel = formatSubscribersJP(a.sub);
    const subTitle = hasSub
      ? `YouTube公式チャンネル公開登録者数（${a.subDate || "2026-10-27"}取得）`
      : "YouTube公式チャンネル登録者数：未取得";

    const rawAgency = (a.agencyGroup || a.agency || "").trim();
    const AGENCY_SHORT_MAP = {
      "アイドルマスターシリーズ": "アイマス",
      "ラブライブ！シリーズ": "ラブライブ！",
      "神椿スタジオ": "神椿",
      "BanG Dream!": "バンドリ",
      "ウマ娘 プリティーダービー": "ウマ娘",
      "Tokyo 7th シスターズ": "ナナシス",
      "ガールズバンドクライ": "ガルク",
      "プロジェクトセカイ カラフルステージ！ feat. 初音ミク": "プロセカ",
      "青春ブタ野郎シリーズ": "青ブタ",
      "アイカツ！シリーズ": "アイカツ",
      "少女☆歌劇 レヴュースタァライト": "スタァライト",
      "INCS toenter (インクストゥエンター)": "INCS toenter",
      "ソードアート・オンライン": "SAO",
      "プリンセスコネクト！Re:Dive": "プリコネ",
      "ブルーアーカイブ -Blue Archive-": "ブルアカ",
      "ヘブンバーンズレッド": "ヘブバン",
      "ライヴラリ (ゆにクリエイト)": "ライヴラリ",
      "陰の実力者になりたくて！": "陰実",
      "告白実行委員会 (HoneyWorks)": "告白実行委員会"
    };
    const shortAgency = rawAgency ? (AGENCY_SHORT_MAP[rawAgency] || rawAgency) : "";
    const agencyCellHTML = shortAgency
      ? `<span class="row-agency-badge" title="所属（事務所・作品）：${esc(rawAgency)}">${esc(shortAgency)}</span>`
      : `<span class="row-agency-empty">—</span>`;

    return `
      <div class="artist-row recommend-song-row song-is-fav ${isSelected ? "selected" : ""}" data-artist-name="${esc(a.name)}" data-artist-aid="${esc(a.aid || "")}" data-rec-song-title="${esc(songTitle)}" data-heart-tier="${songTier}" role="button" tabindex="0">
        <div class="row-rank">${roleRank}</div>
        <div class="row-avatar-wrap" title="">${renderAvatarHTML(a, false, rowIndex)}</div>
        <div class="row-name-wrap">
          <div class="row-song-primary">♪ ${esc(songTitle)}${songHeartHTML}</div>
          <div class="row-name row-name-with-song"><span class="row-artist-prefix">アーティスト:</span>${formatArtistNameHTML(a.name, true)}${formatKaruSongCreditsHTML(a, songTitle)}</div>
        </div>
        <div class="row-role col-pc-only">
          ${rowRoleBadgesHTML}
        </div>
        <div class="row-agency col-pc-only col-agency-wide">
          ${agencyCellHTML}
        </div>
        <div class="row-subs col-pc-only ${hasSub ? "" : "unacquired"}" title="${esc(subTitle)}">${esc(subLabel)}</div>
        <div class="row-count">${fmtNum(a.count)}<span>曲</span></div>
        <div class="row-drag-handle" data-drag-handle="1" title="ドラッグして同じハートグレード内で並び替え" aria-label="ドラッグして並び替え"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="8" x2="20" y2="8"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="16" x2="20" y2="16"></line></svg></div>
      </div>
    `;
  }

  // Build a single Individual Song Row HTML for "楽曲を検索" (1 row per song, no "ほか〇曲" collapsing)
  function buildSongSearchRowHTML(item, rowIndex = 999) {
    const a = item.artist;
    const songTitle = item.songTitle;
    const isSelected = state.selectedArtistName === a.name;
    const sTier = getSongHeartTier(a.aid, songTitle);
    const isSngFav = sTier > 0;
    const sngHeartHTML = isSngFav
      ? buildHeartBadgeSpanHTML(sTier, "artist-fav-heart song-search-fav-heart", "かるのオススメ楽曲")
      : "";

    const isUnclassified = !a.role || a.role === "判定保留";
    const effRoles = getEffectiveRolesForArtist(a);
    const rowRoles = effRoles.length > 0 ? effRoles : [isUnclassified ? "未分類" : a.role];
    const rowRoleBadgesHTML = rowRoles
      .map(r => `<span class="row-role-badge ${isUnclassified ? "unclassified" : ""}">${esc(r)}</span>`)
      .join("");

    const AGENCY_SHORT_LABELS = {
      "アイドルマスターシリーズ": "アイマス",
      "ラブライブ！シリーズ": "ラブライブ！",
      "神椿スタジオ": "神椿",
      "BanG Dream!": "バンドリ",
      "ウマ娘 プリティーダービー": "ウマ娘",
      "Tokyo 7th シスターズ": "ナナシス",
      "ガールズバンドクライ": "ガルク",
      "プロジェクトセカイ カラフルステージ！ feat. 初音ミク": "プロセカ",
      "青春ブタ野郎シリーズ": "青ブタ",
      "アイカツ！シリーズ": "アイカツ",
      "少女☆歌劇 レヴュースタァライト": "スタァライト",
      "INCS toenter (インクストゥエンター)": "INCS toenter",
      "ソードアート・オンライン": "SAO",
      "プリンセスコネクト！Re:Dive": "プリコネ",
      "ブルーアーカイブ -Blue Archive-": "ブルアカ",
      "ヘブンバーンズレッド": "ヘブバン",
      "ライヴラリ (ゆにクリエイト)": "ライヴラリ",
      "陰の実力者になりたくて！": "陰実",
      "告白実行委員会 (HoneyWorks)": "告白実行委員会"
    };
    const rawAgency = (a.agencyGroup || a.agency || "").trim();
    const shortAgency = rawAgency ? (AGENCY_SHORT_LABELS[rawAgency] || rawAgency) : "";
    const agencyCellHTML = shortAgency
      ? `<span class="row-agency-badge" title="所属（事務所・作品）：${esc(rawAgency)}">${esc(shortAgency)}</span>`
      : `<span class="row-agency-empty">—</span>`;

    const hasSub = a.sub !== null && a.sub !== undefined;
    const subLabel = formatSubscribersJP(a.sub);
    const subTitle = hasSub
      ? `YouTube公式チャンネル公開登録者数（${a.subDate || "2026-10-27"}取得）`
      : "YouTube公式チャンネル登録者数：未取得";

    return `
      <div class="artist-row song-matched-row ${isSelected ? "selected" : ""} ${isSngFav ? "song-is-fav" : ""}" data-artist-name="${esc(a.name)}" data-artist-aid="${esc(a.aid || "")}" data-primary-song="${esc(songTitle)}" role="button" tabindex="0">
        <div class="row-rank">${item.rank || (rowIndex + 1)}</div>
        <div class="row-avatar-wrap" title="">${renderAvatarHTML(a, false, rowIndex)}</div>
        <div class="row-name-wrap">
          <div class="row-song-primary">♪ <span class="row-matched-song-token ${isSngFav ? "is-song-fav" : ""}" data-matched-song-title="${esc(songTitle)}">${esc(songTitle)}${sngHeartHTML}</span>${buildKaruTopOnlyBadgeHTML(a, songTitle, item.isTopSong)}</div>
          <div class="row-name row-name-with-song"><span class="row-artist-prefix">アーティスト:</span>${formatArtistNameHTML(a.name, true)}${formatKaruSongCreditsHTML(a, songTitle)}</div>
        </div>
        <div class="row-role col-pc-only">
          ${rowRoleBadgesHTML}
        </div>
        <div class="row-agency col-pc-only col-agency-wide">
          ${agencyCellHTML}
        </div>
        <div class="row-subs col-pc-only ${hasSub ? "" : "unacquired"}" title="${esc(subTitle)}">${esc(subLabel)}</div>
        <div class="row-count">${fmtNum(a.count)}<span>曲</span></div>
      </div>
    `;
  }

  // Build a single Meikyoku Row HTML for "かる専用モード" -> "銘曲" filter (1 row per song; distinct style + Add button for unheard songs)
  function buildMeikyokuSongRowHTML(item, rowIndex = 999) {
    const a = item.artist;
    const songTitle = item.songTitle;
    const isListening = isSongInArtistListeningList(a, songTitle);
    const isSelected = state.selectedArtistName === a.name;
    const sTier = getSongHeartTier(a.aid, songTitle);
    const isSngFav = sTier > 0;
    const sngHeartHTML = isSngFav
      ? buildHeartBadgeSpanHTML(sTier, "artist-fav-heart song-search-fav-heart", "かるのオススメ楽曲")
      : "";
    const starBadgeHTML = buildMeikyokuStarBadgeHTML(item.stars, "row-meikyoku-stars");
    const unheardBadgeHTML = !isListening
      ? `<span class="meikyoku-unheard-tag" title="かるが聴いてる曲に未登録の銘曲">未聴</span>`
      : "";
    const addBtnHTML = !isListening
      ? `<button type="button" class="meikyoku-add-listening-btn" data-add-meikyoku-aid="${esc(a.aid)}" data-add-meikyoku-title="${esc(songTitle)}" title="「${esc(songTitle)}」をかるが聴いてる曲に追加">＋ 聴いてる曲に追加</button>`
      : "";

    const isUnclassified = !a.role || a.role === "判定保留";
    const effRoles = getEffectiveRolesForArtist(a);
    const rowRoles = effRoles.length > 0 ? effRoles : [isUnclassified ? "未分類" : a.role];
    const rowRoleBadgesHTML = rowRoles
      .map(r => `<span class="row-role-badge ${isUnclassified ? "unclassified" : ""}">${esc(r)}</span>`)
      .join("");

    const AGENCY_SHORT_LABELS = {
      "アイドルマスターシリーズ": "アイマス",
      "ラブライブ！シリーズ": "ラブライブ！",
      "神椿スタジオ": "神椿",
      "BanG Dream!": "バンドリ",
      "ウマ娘 プリティーダービー": "ウマ娘",
      "Tokyo 7th シスターズ": "ナナシス",
      "ガールズバンドクライ": "ガルク",
      "プロジェクトセカイ カラフルステージ！ feat. 初音ミク": "プロセカ",
      "青春ブタ野郎シリーズ": "青ブタ",
      "アイカツ！シリーズ": "アイカツ",
      "少女☆歌劇 レヴュースタァライト": "スタァライト",
      "INCS toenter (インクストゥエンター)": "INCS toenter",
      "ソードアート・オンライン": "SAO",
      "プリンセスコネクト！Re:Dive": "プリコネ",
      "ブルーアーカイブ -Blue Archive-": "ブルアカ",
      "ヘブンバーンズレッド": "ヘブバン",
      "ライヴラリ (ゆにクリエイト)": "ライヴラリ",
      "陰の実力者になりたくて！": "陰実",
      "告白実行委員会 (HoneyWorks)": "告白実行委員会"
    };
    const rawAgency = (a.agencyGroup || a.agency || "").trim();
    const shortAgency = rawAgency ? (AGENCY_SHORT_LABELS[rawAgency] || rawAgency) : "";
    const agencyCellHTML = shortAgency
      ? `<span class="row-agency-badge" title="所属（事務所・作品）：${esc(rawAgency)}">${esc(shortAgency)}</span>`
      : `<span class="row-agency-empty">—</span>`;

    const hasSub = a.sub !== null && a.sub !== undefined;
    const subLabel = formatSubscribersJP(a.sub);
    const subTitle = hasSub
      ? `YouTube公式チャンネル公開登録者数（${a.subDate || "2026-10-27"}取得）`
      : "YouTube公式チャンネル登録者数：未取得";

    return `
      <div class="artist-row song-matched-row meikyoku-song-row ${!isListening ? "meikyoku-unheard-row" : ""} ${isSelected ? "selected" : ""} ${isSngFav ? "song-is-fav" : ""}" data-artist-name="${esc(a.name)}" data-artist-aid="${esc(a.aid || "")}" data-primary-song="${esc(songTitle)}" data-meikyoku-stars="${item.stars}" role="button" tabindex="0">
        <div class="row-rank">${item.rank || (rowIndex + 1)}</div>
        <div class="row-avatar-wrap" title="">${renderAvatarHTML(a, false, rowIndex)}</div>
        <div class="row-name-wrap">
          <div class="row-song-primary">${starBadgeHTML}♪ <span class="row-matched-song-token ${isSngFav ? "is-song-fav" : ""}" data-matched-song-title="${esc(songTitle)}">${esc(songTitle)}${sngHeartHTML}</span>${unheardBadgeHTML}${addBtnHTML}</div>
          <div class="row-name row-name-with-song"><span class="row-artist-prefix">アーティスト:</span>${formatArtistNameHTML(a.name, true)}${formatKaruSongCreditsHTML(a, songTitle)}</div>
        </div>
        <div class="row-role col-pc-only">
          ${rowRoleBadgesHTML}
        </div>
        <div class="row-agency col-pc-only col-agency-wide">
          ${agencyCellHTML}
        </div>
        <div class="row-subs col-pc-only ${hasSub ? "" : "unacquired"}" title="${esc(subTitle)}">${esc(subLabel)}</div>
        <div class="row-count">${fmtNum(a.count)}<span>曲</span></div>
      </div>
    `;
  }

  // Build a single Canonical Song Group Row HTML for "同一曲数順" in "楽曲を検索" (no icon column; expanded song title width)
  function buildCanonicalSongGroupRowHTML(group, rowIndex = 999) {
    const rankNum = group.rank || (rowIndex + 1);
    const rankClass = rankNum <= 3 ? `top-${rankNum}` : "";
    return `
      <div class="artist-row same-song-group-row" data-canonical-song-key="${esc(group.canonicalKey)}" data-canonical-song-title="${esc(group.displayTitle)}" role="button" tabindex="0" title="「${esc(group.displayTitle)}」の該当楽曲（${group.count}曲）を表示">
        <div class="row-rank ${rankClass}">${rankNum}</div>
        <div class="row-name-wrap">
          <div class="row-song-primary">♪ <span class="row-matched-song-token">${esc(group.displayTitle)}</span></div>
          <div class="row-name row-name-with-song"><span class="row-artist-prefix">名義:</span>${esc(group.sampleArtistsText)}</div>
        </div>
        <div class="same-song-group-count">(${fmtNum(group.count)}曲)</div>
      </div>
    `;
  }

  // Render Artist Rows (Initial / Reset render)
  function buildSearchGroupsSectionHTML(groups) {
    if (!groups || groups.length === 0) return "";
    const isGroupOnly = state.searchTarget === "group";
    const shown = isGroupOnly ? groups : groups.slice(0, 16);
    return `
      <div class="search-groups-section">
        <div class="search-groups-heading">
          <span>一致したグループ（所属・ユニット）：${fmtNum(groups.length)}件（クリックで絞り込み）</span>
        </div>
        <div class="search-groups-grid">
          ${shown.map(g => `
            <button type="button" class="search-group-card" data-select-search-group="${esc(g.name)}" data-select-search-group-type="${esc(g.type)}" title="「${esc(g.name)}」で絞り込む">
              <span class="search-group-name">${esc(g.name)}</span>
              <span class="search-group-count">${fmtNum(g.count)}名義</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function preserveCenterScrollPosition(scrollEl, listEl, prevScrollTop) {
    if (!scrollEl || !listEl || typeof prevScrollTop !== "number" || prevScrollTop <= 0) return;
    scrollEl.scrollTop = prevScrollTop;
    if (scrollEl.scrollTop < prevScrollTop) {
      let spacer = listEl.querySelector(".list-scroll-preserve-spacer");
      if (!spacer) {
        spacer = document.createElement("div");
        spacer.className = "list-scroll-preserve-spacer";
        spacer.setAttribute("aria-hidden", "true");
        listEl.appendChild(spacer);
      }
      const sRect = scrollEl.getBoundingClientRect();
      const spRect = spacer.getBoundingClientRect();
      const usedHeight = (spRect.top - sRect.top) + scrollEl.scrollTop;
      const neededSpacer = (prevScrollTop + scrollEl.clientHeight) - usedHeight + 4;
      if (neededSpacer > 0) {
        spacer.style.height = Math.ceil(neededSpacer) + "px";
      }
      scrollEl.scrollTop = prevScrollTop;
    }
  }

  function renderArtistList(resetScroll = false) {
    const listEl = document.getElementById("artistListContainer");
    const totalEl = document.getElementById("resultSummaryText");
    const mobColCountEl = document.getElementById("mobCollectionCount");
    const scrollEl = document.getElementById("centerScrollArea");
    const prevListScrollTop = (!resetScroll && scrollEl) ? scrollEl.scrollTop : 0;

    const isMeikyokuMode = isMeikyokuListView();
    const isGroupSearchOnly = state.view === "search" && state.searchTarget === "group" && !isMeikyokuMode;
    const isComposerSearchOnly = Boolean(state.karuSpecialMode && state.view === "search" && state.searchTarget === "composer" && !isMeikyokuMode);
    const isSongSearchOnly = state.view === "search" && state.searchTarget === "song" && !isMeikyokuMode;
    const isKaruAllQueryMode = isKaruAllQuerySearchView();
    if (isMeikyokuMode) {
      const unheardCnt = currentMeikyokuItems.filter(x => !isSongInArtistListeningList(x.artist, x.songTitle)).length;
      const unheardNote = unheardCnt > 0 ? `（うち未聴 <strong>${fmtNum(unheardCnt)}</strong> 曲）` : "";
      totalEl.innerHTML = `表示中: <strong>${fmtNum(currentMeikyokuItems.length)}</strong> 銘曲${unheardNote}`;
    } else if (isGroupSearchOnly) {
      totalEl.innerHTML = `表示中: <strong>${fmtNum(currentMatchedGroups.length)}</strong> グループ`;
    } else if (isComposerSearchOnly) {
      totalEl.innerHTML = `表示中: <strong>${fmtNum(currentComposerItems.length)}</strong> 作曲者`;
    } else if (isSongSearchOnly) {
      if (isSameSongGroupListView()) {
        totalEl.innerHTML = `表示中: <strong>${fmtNum(currentCanonicalSongGroups.length)}</strong> 曲種（全 <strong>${fmtNum(currentSongSearchItems.length)}</strong> 曲）`;
      } else {
        totalEl.innerHTML = `表示中: <strong>${fmtNum(currentSongSearchItems.length)}</strong> 曲`;
      }
    } else if (isKaruAllQueryMode) {
      const artCnt = currentFiltered.filter(a => a._searchTier <= 3).length;
      if (artCnt > 0) {
        totalEl.innerHTML = `表示中: <strong>${fmtNum(artCnt)}</strong> 名義 / <strong>${fmtNum(currentSongSearchItems.length)}</strong> 曲`;
      } else {
        totalEl.innerHTML = `表示中: <strong>${fmtNum(currentSongSearchItems.length)}</strong> 曲`;
      }
    } else {
      totalEl.innerHTML = `表示中: <strong>${fmtNum(currentFiltered.length)}</strong> 名義`;
    }
    if (mobColCountEl) {
      mobColCountEl.textContent = `${fmtNum(currentFiltered.length)} 名義`;
    }

    renderSearchCandidates();

    if (resetScroll) {
      state.renderLimit = 100;
      scrollEl.scrollTop = 0;
    }

    const recSwitchSlot = document.getElementById("recommendSwitchBarSlot");
    if (recSwitchSlot && state.view !== "recommend") {
      recSwitchSlot.style.display = "none";
      recSwitchSlot.innerHTML = "";
    }

    const groupsHTML = (state.view === "search" && currentMatchedGroups.length > 0)
      ? buildSearchGroupsSectionHTML(currentMatchedGroups)
      : "";

    if (isGroupSearchOnly) {
      if (currentMatchedGroups.length === 0) {
        listEl.innerHTML = `
          <div class="empty-list-state">
            <h3>条件に一致するグループ（所属・ユニット）が見つかりません</h3>
            <p>別の所属（事務所・作品）名やユニット名でお試しください。</p>
          </div>
        `;
      } else {
        listEl.innerHTML = groupsHTML;
      }
      return;
    }

    if (state.view === "recommend") {
      const recArtistCnt = getRecommendedCount();
      const recSongCnt = getRecommendedSongCount();
      const isSongTab = state.recommendTab === "song";

      const roleOrder = [
        "Vsinger",
        "Vtuber",
        "歌い手",
        "歌手",
        "声優",
        "キャラ",
        "音楽グループ(アニゲー関連)",
        "音楽グループ(その他)"
      ];

      const roleJumpShortLabelMap = {
        "Vsinger": "Vsin",
        "Vtuber": "Vtu",
        "歌い手": "歌い手",
        "歌手": "歌手",
        "声優": "声優",
        "キャラ": "キャラ",
        "音楽グループ(アニゲー関連)": "複(アニ)",
        "音楽グループ(その他)": "複(他)"
      };
      const roleJumpPcLabelMap = {
        "Vsinger": "Vsinger",
        "Vtuber": "Vtuber",
        "歌い手": "歌い手",
        "歌手": "歌手",
        "声優": "声優",
        "キャラ": "キャラ",
        "音楽グループ(アニゲー関連)": "複(アニ)",
        "音楽グループ(その他)": "複(他)"
      };

      const isFlatMode = Boolean(state.recFlatMode);

      const aidOrderMap = new Map();
      let aOrdIdx = 0;
      recommendedAidMap.forEach((_tier, aid) => {
        aidOrderMap.set(aid, aOrdIdx++);
      });
      const autoAidOrderMap = new Map();
      DATA.forEach(a => {
        if (a && a.aid && !aidOrderMap.has(a.aid) && getArtistHeartTier(a.aid) > 0) {
          autoAidOrderMap.set(a.aid, artistTierOrderMap.has(a.aid) ? artistTierOrderMap.get(a.aid) : 999999);
        }
      });

      const buckets = new Map();
      roleOrder.forEach(r => buckets.set(r, []));

      const sortSongItemsFn = (songItems, songSortMode) => {
        if (songSortMode === "recFavCountDesc") {
          songItems.sort((x, y) => {
            const favCntX = getArtistFavSongCount(x.artist);
            const favCntY = getArtistFavSongCount(y.artist);
            if (favCntY !== favCntX) return favCntY - favCntX;
            if (x.artist.aid !== y.artist.aid) {
              const artTierX = getArtistHeartTier(x.artist.aid);
              const artTierY = getArtistHeartTier(y.artist.aid);
              if (artTierY !== artTierX) return artTierY - artTierX;
              const aOx = aidOrderMap.has(x.artist.aid) ? aidOrderMap.get(x.artist.aid) : (autoAidOrderMap.get(x.artist.aid) || 999999);
              const aOy = aidOrderMap.has(y.artist.aid) ? aidOrderMap.get(y.artist.aid) : (autoAidOrderMap.get(y.artist.aid) || 999999);
              if (aOx !== aOy) return aOx - aOy;
              const nmCmp = jaCollator.compare(x.artist.reading || x.artist.name, y.artist.reading || y.artist.name);
              if (nmCmp !== 0) return nmCmp;
              return x.artist.aid.localeCompare(y.artist.aid);
            }
            if (y.tier !== x.tier) return y.tier - x.tier;
            return x.orderIdx - y.orderIdx;
          });
        } else {
          songItems.sort((x, y) => {
            if (y.tier !== x.tier) return y.tier - x.tier;
            return x.orderIdx - y.orderIdx;
          });
        }
      };

      const sortArtistsFn = (groupList, artistSortMode) => {
        if (artistSortMode === "recFavCountDesc") {
          groupList.sort((x, y) => {
            const fx = getArtistFavSongCount(x);
            const fy = getArtistFavSongCount(y);
            if (fy !== fx) return fy - fx;
            const tx = getArtistHeartTier(x.aid);
            const ty = getArtistHeartTier(y.aid);
            if (ty !== tx) return ty - tx;
            const ox = aidOrderMap.has(x.aid) ? aidOrderMap.get(x.aid) : (autoAidOrderMap.get(x.aid) || 999999);
            const oy = aidOrderMap.has(y.aid) ? aidOrderMap.get(y.aid) : (autoAidOrderMap.get(y.aid) || 999999);
            if (ox !== oy) return ox - oy;
            return y.count - x.count;
          });
        } else {
          groupList.sort((x, y) => {
            const tx = getArtistHeartTier(x.aid);
            const ty = getArtistHeartTier(y.aid);
            if (ty !== tx) return ty - tx;
            const ox = aidOrderMap.has(x.aid) ? aidOrderMap.get(x.aid) : (autoAidOrderMap.get(x.aid) || 999999);
            const oy = aidOrderMap.has(y.aid) ? aidOrderMap.get(y.aid) : (autoAidOrderMap.get(y.aid) || 999999);
            return ox - oy;
          });
        }
      };

      if (isSongTab) {
        const songOrderMap = new Map();
        let sOrdIdx = 0;
        recommendedSongMap.forEach((_tier, k) => songOrderMap.set(k, sOrdIdx++));
        let uniqueMatchedSongTotal = 0;
        const flatSongItems = [];

        currentFiltered.forEach(a => {
          const favSongs = getRecommendedSongsForArtist(a).filter(s => matchesHeartTierFilter(getSongHeartTier(a.aid, s)));
          if (favSongs.length === 0) return;
          uniqueMatchedSongTotal += favSongs.length;
          favSongs.forEach(songTitle => {
            const sKey = makeSongKey(a.aid, songTitle);
            const sTier = getSongHeartTier(a.aid, songTitle) || 3;
            flatSongItems.push({
              artist: a,
              songTitle,
              songKey: sKey,
              tier: sTier,
              orderIdx: songOrderMap.has(sKey) ? songOrderMap.get(sKey) : 999999
            });
          });
          const artistRoles = getRecommendRoleBucketsForArtist(a);
          artistRoles.forEach(roleName => {
            if (state.roles.length > 0 && !state.roles.includes(roleName)) return;
            if (!buckets.has(roleName)) {
              buckets.set(roleName, []);
            }
            const bucketArr = buckets.get(roleName);
            favSongs.forEach(songTitle => {
              const sKey = makeSongKey(a.aid, songTitle);
              const sTier = getSongHeartTier(a.aid, songTitle) || 3;
              bucketArr.push({
                artist: a,
                songTitle,
                songKey: sKey,
                tier: sTier,
                orderIdx: songOrderMap.has(sKey) ? songOrderMap.get(sKey) : 999999
              });
            });
          });
        });

        const jumpButtonsHTML = roleOrder.map(rName => {
          const arr = buckets.get(rName) || [];
          const hasItems = arr.length > 0;
          const shortLbl = roleJumpShortLabelMap[rName] || rName;
          const pcLbl = roleJumpPcLabelMap[rName] || shortLbl;
          return `<button type="button" class="rec-role-jump-btn ${hasItems ? "" : "is-empty-role"}" data-jump-role="${esc(rName)}" ${hasItems ? "" : "disabled"} title="${esc(rName)}（${arr.length}曲）へ移動"><span class="jump-lbl-pc">${esc(pcLbl)}</span><span class="jump-lbl-mob">${esc(shortLbl)}</span></button>`;
        }).join("");

        const switchBarInnerHTML = `
          <div class="recommend-switch-bar">
            <div class="recommend-switch-top-row">
              <div class="recommend-switch-tabs" role="tablist" aria-label="かるのオススメ表示切り替え">
                <button type="button" class="recommend-switch-tab ${!isSongTab ? "active" : ""}" data-recommend-tab="artist" role="tab" aria-selected="${!isSongTab}">
                  <span class="rec-tab-icon">${HEART_SVG_SINGLE}</span>
                  <span>アーティスト</span>
                  <span class="rec-tab-count">${fmtNum(recArtistCnt)}</span>
                </button>
                <button type="button" class="recommend-switch-tab ${isSongTab ? "active" : ""}" data-recommend-tab="song" role="tab" aria-selected="${isSongTab}">
                  <span class="rec-tab-icon">♪</span>
                  <span>楽曲</span>
                  <span class="rec-tab-count">${fmtNum(recSongCnt)}</span>
                </button>
              </div>
              <button type="button" class="rec-flat-mode-toggle-btn pc-rec-flat-mode-btn ${isFlatMode ? "active" : ""}" data-toggle-rec-flat="1" aria-pressed="${isFlatMode ? "true" : "false"}">活動形態で分けない</button>
            </div>
            <div class="recommend-role-jump-bar" role="navigation" aria-label="活動形態へジャンプ" style="${isFlatMode ? "display:none;" : ""}">
              ${jumpButtonsHTML}
            </div>
          </div>
        `;
        if (recSwitchSlot) {
          recSwitchSlot.style.display = "block";
          recSwitchSlot.innerHTML = switchBarInnerHTML;
        }
        const switchBarHTML = recSwitchSlot ? "" : switchBarInnerHTML;

        totalEl.innerHTML = `表示中: <strong>${fmtNum(uniqueMatchedSongTotal)}</strong> 曲`;
        if (mobColCountEl) {
          mobColCountEl.textContent = `${fmtNum(recArtistCnt)}名義/${fmtNum(recSongCnt)}曲`;
        }

        if (uniqueMatchedSongTotal === 0) {
          listEl.innerHTML = switchBarHTML + `
            <div class="empty-list-state">
              <h3>「かるのオススメ」に設定された楽曲がまだありません</h3>
              <p>編集モードでアーティスト詳細の「かるが聴いてる曲」にハートを付けると、ここに一覧表示されます。</p>
            </div>
          `;
          if (!resetScroll) preserveCenterScrollPosition(scrollEl, listEl, prevListScrollTop);
          return;
        }

        const songSortMode = state.recSongSort || "recCustomOrder";
        let globalIdx = 0;
        let sectionsHTML = switchBarHTML;
        if (isFlatMode) {
          sortSongItemsFn(flatSongItems, songSortMode);
          const rowsHTML = flatSongItems.map((item, idx) => {
            const htmlRow = buildRecommendSongRowHTML(item.artist, item.songTitle, globalIdx, idx + 1);
            globalIdx++;
            return htmlRow;
          }).join("");
          sectionsHTML += `
            <div class="recommend-role-section recommend-flat-section" data-role-section="__flat__">
              ${rowsHTML}
            </div>
          `;
        } else {
          buckets.forEach((songItems, roleName) => {
            if (!songItems || songItems.length === 0) return;
            sortSongItemsFn(songItems, songSortMode);
            const rowsHTML = songItems.map((item, idxInRole) => {
              const htmlRow = buildRecommendSongRowHTML(item.artist, item.songTitle, globalIdx, idxInRole + 1);
              globalIdx++;
              return htmlRow;
            }).join("");
            sectionsHTML += `
              <div class="recommend-role-section" data-role-section="${esc(roleName)}">
                <div class="recommend-role-group-header">
                  <span class="recommend-role-dot" aria-hidden="true"></span>
                  <span class="recommend-role-title">${esc(roleName)}</span>
                  <span class="recommend-role-count">${fmtNum(songItems.length)} 曲</span>
                </div>
                ${rowsHTML}
              </div>
            `;
          });
        }
        listEl.innerHTML = sectionsHTML;
        if (!resetScroll) preserveCenterScrollPosition(scrollEl, listEl, prevListScrollTop);
        scheduleLookaheadAvatarPreload(12, 40);
        return;
      }

      // Artist tab in "recommend" view
      currentFiltered.forEach(a => {
        const artistRoles = getRecommendRoleBucketsForArtist(a);
        artistRoles.forEach(roleName => {
          if (state.roles.length > 0 && !state.roles.includes(roleName)) return;
          if (!buckets.has(roleName)) {
            buckets.set(roleName, []);
          }
          buckets.get(roleName).push(a);
        });
      });

      const jumpButtonsHTML = roleOrder.map(rName => {
        const arr = buckets.get(rName) || [];
        const hasItems = arr.length > 0;
        const shortLbl = roleJumpShortLabelMap[rName] || rName;
        const pcLbl = roleJumpPcLabelMap[rName] || shortLbl;
        return `<button type="button" class="rec-role-jump-btn ${hasItems ? "" : "is-empty-role"}" data-jump-role="${esc(rName)}" ${hasItems ? "" : "disabled"} title="${esc(rName)}（${arr.length}名義）へ移動"><span class="jump-lbl-pc">${esc(pcLbl)}</span><span class="jump-lbl-mob">${esc(shortLbl)}</span></button>`;
      }).join("");

      const switchBarInnerHTML = `
        <div class="recommend-switch-bar">
          <div class="recommend-switch-top-row">
            <div class="recommend-switch-tabs" role="tablist" aria-label="かるのオススメ表示切り替え">
              <button type="button" class="recommend-switch-tab ${!isSongTab ? "active" : ""}" data-recommend-tab="artist" role="tab" aria-selected="${!isSongTab}">
                <span class="rec-tab-icon">${HEART_SVG_SINGLE}</span>
                <span>アーティスト</span>
                <span class="rec-tab-count">${fmtNum(recArtistCnt)}</span>
              </button>
              <button type="button" class="recommend-switch-tab ${isSongTab ? "active" : ""}" data-recommend-tab="song" role="tab" aria-selected="${isSongTab}">
                <span class="rec-tab-icon">♪</span>
                <span>楽曲</span>
                <span class="rec-tab-count">${fmtNum(recSongCnt)}</span>
              </button>
            </div>
            <button type="button" class="rec-flat-mode-toggle-btn pc-rec-flat-mode-btn ${isFlatMode ? "active" : ""}" data-toggle-rec-flat="1" aria-pressed="${isFlatMode ? "true" : "false"}">活動形態で分けない</button>
          </div>
          <div class="recommend-role-jump-bar" role="navigation" aria-label="活動形態へジャンプ" style="${isFlatMode ? "display:none;" : ""}">
            ${jumpButtonsHTML}
          </div>
        </div>
      `;
      if (recSwitchSlot) {
        recSwitchSlot.style.display = "block";
        recSwitchSlot.innerHTML = switchBarInnerHTML;
      }
      const switchBarHTML = recSwitchSlot ? "" : switchBarInnerHTML;

      if (mobColCountEl) {
        mobColCountEl.textContent = `${fmtNum(recArtistCnt)}名義/${fmtNum(recSongCnt)}曲`;
      }
      if (currentFiltered.length === 0) {
        listEl.innerHTML = switchBarHTML + `
          <div class="empty-list-state">
            <h3>「かるのオススメ」に設定されたアーティストがまだありません</h3>
            <p>お気に入りのアーティストを設定すると、ここに一覧表示されます。</p>
          </div>
        `;
        if (!resetScroll) preserveCenterScrollPosition(scrollEl, listEl, prevListScrollTop);
        return;
      }

      const artistSortMode = state.recArtistSort || "recFavCountDesc";
      let globalIdx = 0;
      let sectionsHTML = switchBarHTML;
      if (isFlatMode) {
        const flatList = [...currentFiltered];
        sortArtistsFn(flatList, artistSortMode);
        const rowsHTML = flatList.map((a, idx) => {
          const htmlRow = buildArtistRowHTML(a, false, globalIdx, false, idx + 1);
          globalIdx++;
          return htmlRow;
        }).join("");
        sectionsHTML += `
          <div class="recommend-role-section recommend-flat-section" data-role-section="__flat__">
            ${rowsHTML}
          </div>
        `;
      } else {
        buckets.forEach((groupList, roleName) => {
          if (!groupList || groupList.length === 0) return;
          sortArtistsFn(groupList, artistSortMode);
          const rowsHTML = groupList.map((a, idxInRole) => {
            const htmlRow = buildArtistRowHTML(a, false, globalIdx, false, idxInRole + 1);
            globalIdx++;
            return htmlRow;
          }).join("");
          sectionsHTML += `
            <div class="recommend-role-section" data-role-section="${esc(roleName)}">
              <div class="recommend-role-group-header">
                <span class="recommend-role-dot" aria-hidden="true"></span>
                <span class="recommend-role-title">${esc(roleName)}</span>
                <span class="recommend-role-count">${fmtNum(groupList.length)} 名義</span>
              </div>
              ${rowsHTML}
            </div>
          `;
        });
      }
      listEl.innerHTML = sectionsHTML;
      if (!resetScroll) preserveCenterScrollPosition(scrollEl, listEl, prevListScrollTop);
      scheduleLookaheadAvatarPreload(12, 40);
      return;
    }

    if (isMeikyokuMode) {
      if (currentMeikyokuItems.length === 0) {
        listEl.innerHTML = `
          <div class="empty-list-state">
            <h3>条件に一致する銘曲が見つかりません</h3>
            <p>検索キーワードや銘曲（☆）の段階・絞り込み条件を変更してお試しください。</p>
          </div>
        `;
        return;
      }
      const sliceMk = currentMeikyokuItems.slice(0, state.renderLimit);
      listEl.innerHTML = sliceMk.map((item, idx) => buildMeikyokuSongRowHTML(item, idx)).join("");
      scheduleLookaheadAvatarPreload(12, 40);
      return;
    }

    if (isComposerSearchOnly) {
      if (currentComposerItems.length === 0) {
        listEl.innerHTML = `
          <div class="empty-list-state">
            <h3>条件に一致する作曲者・編曲者が見つかりません</h3>
            <p>検索キーワードや絞り込み条件を変更してお試しください。</p>
          </div>
        `;
        return;
      }
      const sliceComp = currentComposerItems.slice(0, state.renderLimit);
      listEl.innerHTML = sliceComp.map((comp, idx) => buildComposerRowHTML(comp, idx)).join("");
      return;
    }

    if (isSongSearchOnly) {
      if (isSameSongGroupListView()) {
        if (currentCanonicalSongGroups.length === 0) {
          listEl.innerHTML = `
            <div class="empty-list-state">
              <h3>条件に一致する楽曲が見つかりません</h3>
              <p>検索キーワードや絞り込み条件を変更してお試しください。</p>
            </div>
          `;
          return;
        }
        const sliceGroups = currentCanonicalSongGroups.slice(0, state.renderLimit);
        listEl.innerHTML = sliceGroups.map((g, idx) => buildCanonicalSongGroupRowHTML(g, idx)).join("");
        return;
      }

      if (currentSongSearchItems.length === 0) {
        listEl.innerHTML = `
          <div class="empty-list-state">
            <h3>条件に一致する楽曲が見つかりません</h3>
            <p>検索キーワードや絞り込み条件を変更してお試しください。</p>
          </div>
        `;
        return;
      }
      const backBannerHTML = (state.sameSongCountMode && state.exactCanonicalSongKey)
        ? `<div class="same-song-drill-banner">
             <span class="same-song-drill-text">同一曲「<strong>${esc(state.exactCanonicalSongTitle || state.searchQuery)}</strong>」の該当楽曲（${fmtNum(currentSongSearchItems.length)}曲）</span>
             <button type="button" class="same-song-back-btn" data-back-to-same-song-list="1">← 同一曲数順の一覧に戻る</button>
           </div>`
        : "";
      const sliceSongs = currentSongSearchItems.slice(0, state.renderLimit);
      listEl.innerHTML = backBannerHTML + sliceSongs.map((item, idx) => buildSongSearchRowHTML(item, idx)).join("");
      return;
    }

    if (isKaruAllQueryMode) {
      if (currentKaruAllSearchEntries.length === 0 && !groupsHTML) {
        listEl.innerHTML = `
          <div class="empty-list-state">
            <h3>条件に一致するアーティスト・楽曲が見つかりません</h3>
            <p>検索キーワードや絞り込み条件を変更してお試しください。</p>
          </div>
        `;
        return;
      }
      const sliceEntries = currentKaruAllSearchEntries.slice(0, state.renderLimit);
      listEl.innerHTML = groupsHTML + sliceEntries.map((entry, idx) => {
        if (entry.type === "artist") {
          return buildArtistRowHTML(entry.artist, true, idx);
        }
        return buildSongSearchRowHTML(entry.songItem, idx);
      }).join("");
      scheduleLookaheadAvatarPreload(12, 40);
      return;
    }

    if (currentFiltered.length === 0 && !groupsHTML) {
      listEl.innerHTML = `
        <div class="empty-list-state">
          <h3>条件に一致するアーティストが見つかりません</h3>
          <p>検索キーワードや絞り込み条件（高評価・活動形態・五十音・英字・所属）を変更してお試しください。</p>
        </div>
      `;
      return;
    }

    const slice = currentFiltered.slice(0, state.renderLimit);
    const isSearch = state.view === "search" && state.searchQuery.trim() !== "";
    listEl.innerHTML = groupsHTML + slice.map((a, idx) => buildArtistRowHTML(a, isSearch, idx)).join("");
    scheduleLookaheadAvatarPreload(12, 40);
  }

  function getActiveRenderListLength() {
    if (isMeikyokuListView()) {
      return currentMeikyokuItems.length;
    }
    if (state.karuSpecialMode && state.view === "search" && state.searchTarget === "composer") {
      return currentComposerItems.length;
    }
    if (state.view === "search" && state.searchTarget === "song") {
      if (isSameSongGroupListView()) return currentCanonicalSongGroups.length;
      return currentSongSearchItems.length;
    }
    if (isKaruAllQuerySearchView()) {
      return currentKaruAllSearchEntries.length;
    }
    return currentFiltered.length;
  }

  // Append additional rows on scroll using DocumentFragment (Zero existing DOM destruction)
  function appendArtistRows(prevLimit, newLimit) {
    const listEl = document.getElementById("artistListContainer");
    if (!listEl) return;
    if (isMeikyokuListView()) {
      const sliceM = currentMeikyokuItems.slice(prevLimit, newLimit);
      if (sliceM.length === 0) return;
      const temp = document.createElement("div");
      temp.innerHTML = sliceM.map((item, idx) => buildMeikyokuSongRowHTML(item, prevLimit + idx)).join("");
      const frag = document.createDocumentFragment();
      while (temp.firstElementChild) frag.appendChild(temp.firstElementChild);
      listEl.appendChild(frag);
      scheduleLookaheadAvatarPreload(prevLimit, 40);
      return;
    }
    if (state.karuSpecialMode && state.view === "search" && state.searchTarget === "composer") {
      const sliceC = currentComposerItems.slice(prevLimit, newLimit);
      if (sliceC.length === 0) return;
      const temp = document.createElement("div");
      temp.innerHTML = sliceC.map((comp, idx) => buildComposerRowHTML(comp, prevLimit + idx)).join("");
      const frag = document.createDocumentFragment();
      while (temp.firstElementChild) frag.appendChild(temp.firstElementChild);
      listEl.appendChild(frag);
      return;
    }
    if (isKaruAllQuerySearchView()) {
      const sliceE = currentKaruAllSearchEntries.slice(prevLimit, newLimit);
      if (sliceE.length === 0) return;
      const temp = document.createElement("div");
      temp.innerHTML = sliceE.map((entry, idx) => {
        if (entry.type === "artist") {
          return buildArtistRowHTML(entry.artist, true, prevLimit + idx);
        }
        return buildSongSearchRowHTML(entry.songItem, prevLimit + idx);
      }).join("");
      const frag = document.createDocumentFragment();
      while (temp.firstElementChild) frag.appendChild(temp.firstElementChild);
      listEl.appendChild(frag);
      scheduleLookaheadAvatarPreload(prevLimit, 40);
      return;
    }
    if (state.view === "search" && state.searchTarget === "song") {
      if (isSameSongGroupListView()) {
        const sliceG = currentCanonicalSongGroups.slice(prevLimit, newLimit);
        if (sliceG.length === 0) return;
        const temp = document.createElement("div");
        temp.innerHTML = sliceG.map((g, idx) => buildCanonicalSongGroupRowHTML(g, prevLimit + idx)).join("");
        const frag = document.createDocumentFragment();
        while (temp.firstElementChild) frag.appendChild(temp.firstElementChild);
        listEl.appendChild(frag);
        return;
      }
      const sliceS = currentSongSearchItems.slice(prevLimit, newLimit);
      if (sliceS.length === 0) return;
      const temp = document.createElement("div");
      temp.innerHTML = sliceS.map((item, idx) => buildSongSearchRowHTML(item, prevLimit + idx)).join("");
      const frag = document.createDocumentFragment();
      while (temp.firstElementChild) frag.appendChild(temp.firstElementChild);
      listEl.appendChild(frag);
      return;
    }
    const slice = currentFiltered.slice(prevLimit, newLimit);
    if (slice.length === 0) return;
    const isSearch = state.view === "search" && state.searchQuery.trim() !== "";
    const temp = document.createElement("div");
    temp.innerHTML = slice.map((a, idx) => buildArtistRowHTML(a, isSearch, prevLimit + idx)).join("");
    const frag = document.createDocumentFragment();
    while (temp.firstElementChild) {
      frag.appendChild(temp.firstElementChild);
    }
    listEl.appendChild(frag);
    scheduleLookaheadAvatarPreload(prevLimit, 40);
  }

  // Update selected row class in-place without re-rendering list (Preserves 100% scroll & images)
  function updateSelectedRowHighlight() {
    const listEl = document.getElementById("artistListContainer");
    if (!listEl) return;
    const prevSelected = listEl.querySelectorAll(".artist-row.selected");
    prevSelected.forEach(row => {
      const rArt = row.getAttribute("data-artist-name");
      const rComp = row.getAttribute("data-composer-name");
      const keep = (rArt && rArt === state.selectedArtistName) || (rComp && rComp === state.selectedComposerName);
      if (!keep) {
        row.classList.remove("selected");
      }
    });
    if (state.selectedComposerName) {
      const rows = listEl.querySelectorAll(".artist-row.composer-row");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute("data-composer-name") === state.selectedComposerName) {
          rows[i].classList.add("selected");
          break;
        }
      }
    } else if (state.selectedArtistName) {
      const rows = listEl.querySelectorAll(".artist-row");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].getAttribute("data-artist-name") === state.selectedArtistName) {
          rows[i].classList.add("selected");
          break;
        }
      }
    }
  }

  // Lock/Unlock background scroll on mobile when bottom sheet is open
  function syncMobileScrollLock() {
    const scrollEl = document.getElementById("centerScrollArea");
    const rightPanel = document.getElementById("rightDetailPanel");
    if (!scrollEl) return;
    const isMobile = window.innerWidth <= 900;
    const isDetailOpen = Boolean(rightPanel && rightPanel.classList.contains("mobile-open"));
    const isSheetOpen = isMobile && (isDetailOpen || state.mobFilterOpen);
    scrollEl.classList.toggle("scroll-locked", isSheetOpen);
  }

  // Render Artist Detail Panel (Representative Songs TOP 5 with (cover) & YouTube links + Toggle to かるが聴いてる曲)
  function renderDetailPanel(resetDetailScroll = false) {
    const shell = document.getElementById("appShell");
    const rightPanel = document.getElementById("rightDetailPanel");
    const backdrop = document.getElementById("sheetBackdrop");
    const contentEl = document.getElementById("detailScrollContent");
    const prevDetailScrollTop = contentEl ? contentEl.scrollTop : 0;
    const topTitleEl = document.getElementById("detailTopBarTitle");

    if (state.karuSpecialMode && state.selectedComposerName) {
      if (!COMPOSER_MAP.has(state.selectedComposerName)) {
        buildFilteredComposerItems(DATA, "", "");
      }
      const comp = COMPOSER_MAP.get(state.selectedComposerName);
      if (!comp) {
        state.selectedComposerName = null;
      } else {
        shell.classList.remove("detail-closed");
        if (window.innerWidth <= 900) {
          rightPanel.classList.add("mobile-open");
          backdrop.classList.add("visible");
        }
        syncMobileScrollLock();
        topTitleEl.textContent = comp.displayName;

        let compSongs = comp.songs.map((item, idx) => ({
          artist: item.artist,
          title: item.songTitle,
          isArrOnly: item.isArrOnly,
          regIdx: idx + 1,
          heartTier: getSongHeartTier(item.artist.aid, item.songTitle)
        }));

        compSongs.sort((x, y) => {
          if (x.heartTier !== y.heartTier) return y.heartTier - x.heartTier;
          if (state.songSort === "titleAsc") {
            const cmp = jaCollator.compare(x.title, y.title);
            if (cmp !== 0) return cmp;
            return jaCollator.compare(x.artist.reading || x.artist.name, y.artist.reading || y.artist.name);
          }
          return x.regIdx - y.regIdx;
        });

        contentEl.innerHTML = `
          <div class="detail-hero composer-detail-hero">
            <h2 class="detail-artist-name">${esc(comp.displayName)}</h2>
          </div>
          <div class="detail-actions-row">
            <div class="detail-section-heading">かるが聴いてる曲（${fmtNum(compSongs.length)}曲）</div>
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="song-sort-toggle" role="group" aria-label="楽曲の並び替え">
                <button type="button" class="song-sort-btn ${state.songSort === "titleAsc" ? "active" : ""}" data-song-sort="titleAsc">曲名順</button>
                <button type="button" class="song-sort-btn ${state.songSort === "regAsc" ? "active" : ""}" data-song-sort="regAsc">登録順</button>
              </div>
            </div>
          </div>
          <div class="detail-song-list">
            ${compSongs.map((s, i) => {
              const songTier = s.heartTier;
              const isSongFav = songTier > 0;
              const arrTagHTML = s.isArrOnly ? `<span class="composer-arr-tag">(編)</span>` : "";
              return `
                <div class="detail-song-item ${isSongFav ? "song-is-fav" : ""}" data-song-title="${esc(s.title)}" data-artist-aid="${esc(s.artist.aid)}" ${isSongFav ? `data-heart-tier="${songTier}"` : ""}>
                  <span class="song-idx">${i + 1}</span>
                  <span class="song-name">${esc(s.title)}${arrTagHTML}${isSongFav ? buildHeartBadgeSpanHTML(songTier, "song-fav-heart", "かるのオススメ楽曲") : ""}<span class="composer-song-artist">（${esc(s.artist.name)}）</span></span>
                  <span class="detail-song-right-actions">
                    <span class="song-edit-heart-indicator ${isSongFav ? `is-fav heart-tier-${songTier}` : ""}" aria-hidden="true">${HEART_SVG_SINGLE}</span>
                  </span>
                </div>
              `;
            }).join("")}
          </div>
        `;
        if (resetDetailScroll) contentEl.scrollTop = 0;
        return;
      }
    }

    const artist = state.selectedArtistName ? ARTIST_MAP.get(state.selectedArtistName) : null;
    if (!artist) {
      shell.classList.add("detail-closed");
      rightPanel.classList.remove("mobile-open");
      if (!state.mobFilterOpen) backdrop.classList.remove("visible");
      syncMobileScrollLock();
      return;
    }

    // Clear any previous image immediately before painting new artist to prevent image flash
    const oldImg = contentEl.querySelector(".detail-avatar-wrap img");
    if (oldImg && oldImg.getAttribute("alt") !== artist.name) {
      oldImg.src = "";
      oldImg.style.display = "none";
    }

    shell.classList.remove("detail-closed");
    if (window.innerWidth <= 900) {
      rightPanel.classList.add("mobile-open");
      backdrop.classList.add("visible");
    }
    syncMobileScrollLock();

    topTitleEl.textContent = (window.innerWidth <= 900 && artist.name === "神崎エルザ (ガンゲイル・オンライン)") ? "神崎エルザ(GGO)" : artist.name;

    const rawSongs = artist.songs || [];
    const topSongs = artist.topSongs || [];
    const topTypes = artist.topTypes || [];
    const topLinks = artist.topLinks || [];
    let displaySongs = rawSongs.map((t, idx) => ({
      title: t,
      regIdx: idx + 1,
      heartTier: getSongHeartTier(artist.aid, t),
      isCustom: isCustomAddedSong(artist.aid, t)
    }));

    // Unconditionally place hearted songs at the top (sorted by heart grade 3 -> 2 -> 1),
    // and within the same heart state/grade, sort by the selected sort (titleAsc or regAsc).
    displaySongs.sort((x, y) => {
      if (x.heartTier !== y.heartTier) {
        return y.heartTier - x.heartTier;
      }
      if (favQuickEditMode && x.heartTier === 0 && x.isCustom !== y.isCustom) {
        return x.isCustom ? -1 : 1;
      }
      if (state.songSort === "titleAsc") {
        return jaCollator.compare(x.title, y.title);
      }
      if (favQuickEditMode && x.isCustom && y.isCustom) {
        return y.regIdx - x.regIdx;
      }
      return x.regIdx - y.regIdx;
    });

    const q = state.view === "search" ? normSearch(state.searchQuery) : "";
    const catLabel = artist.cat === 1 ? "カバーあり" : "カバーなし";
    const catClass = artist.cat === 1 ? "cat-1" : "cat-2";
    const detailRoles = getEffectiveRolesForArtist(artist);
    const roleBadgeHTML = detailRoles
      .map(r => `<span class="detail-role-badge static-role-badge">${esc(r)}</span>`)
      .join("");
    const hasArchiveSongs = favQuickEditMode || ((artist.count || 0) >= 1 && rawSongs.length >= 1);
    if (!hasArchiveSongs && state.detailMode === "archive") {
      state.detailMode = "top5";
    }
    const isTop5Mode = state.detailMode === "top5";

    const subMetaParts = [];
    if (artist.vocal) {
      const vParts = Array.isArray(artist.vocalParts) && artist.vocalParts.length > 0
        ? artist.vocalParts.map(pt => {
            if (pt.target && ARTIST_MAP.has(pt.target)) {
              return `<button type="button" class="vocal-artist-link" data-open-artist="${esc(pt.target)}" title="${esc(pt.target)}のアーティスト詳細を開く">${esc(pt.text)}</button>`;
            }
            return `<span>${esc(pt.text)}</span>`;
          }).join("")
        : esc(artist.vocal);
      subMetaParts.push(`<span class="detail-vocal-badge">（ボーカル：${vParts}）</span>`);
    }
    if (Array.isArray(artist.memberOf) && artist.memberOf.length > 0) {
      const grpLinks = artist.memberOf
        .filter(gName => ARTIST_MAP.has(gName))
        .map(gName => `<button type="button" class="vocal-artist-link" data-open-artist="${esc(gName)}" title="${esc(gName)}のアーティスト詳細を開く">${esc(gName)}</button>`)
        .join("<span>・</span>");
      if (grpLinks) {
        subMetaParts.push(`<span class="detail-vocal-badge detail-memberof-badge">（参加ユニット：${grpLinks}）</span>`);
      }
    }
    if (artist.agency) {
      const agGroup = artist.agencyGroup || artist.agency;
      const isAgActive = state.agencyGroup === agGroup;
      const canFilterAg = Boolean(artist.agencyClickable && (artist.agencyGroupCount || 0) >= 2);
      if (canFilterAg) {
        subMetaParts.push(`<button type="button" class="detail-agency-badge interactive-agency-btn ${isAgActive ? "active-agency" : ""}" data-filter-agency="${esc(agGroup)}" title="「${esc(agGroup)}」のランキング（${artist.agencyGroupCount}名義）を表示">所属：${esc(artist.agency)}</button>`);
      } else {
        subMetaParts.push(`<span class="detail-agency-badge static-agency-badge">所属：${esc(artist.agency)}</span>`);
      }
    }
    const subMetaRowHTML = subMetaParts.length > 0
      ? `<div class="detail-submeta-row">${subMetaParts.join("")}</div>`
      : "";

    const repHeadingLabel = (topSongs.length > 0 && topSongs.length < 5)
      ? `代表曲（${topSongs.length}曲）`
      : "代表曲 TOP 5";
    const modeTabsHTML = `
      <div class="detail-mode-tabs" role="tablist" aria-label="表示楽曲の切り替え">
        ${hasArchiveSongs ? `
        <button type="button" class="detail-mode-tab ${!isTop5Mode ? "active" : ""}" data-detail-mode="archive" role="tab" aria-selected="${!isTop5Mode}">
          かるが聴いてる曲 (${fmtNum(artist.count)})
        </button>
        ` : ""}
        <button type="button" class="detail-mode-tab ${isTop5Mode ? "active" : ""}" data-detail-mode="top5" role="tab" aria-selected="${isTop5Mode}">
          ${repHeadingLabel}
        </button>
      </div>
    `;

    let bodySectionHTML = "";
    if (isTop5Mode) {
      bodySectionHTML = `
        <div class="top5-section-box">
          <div class="top5-header-row">
            <div class="top5-title-wrap">
              <span class="top5-badge-dot"></span>
              <h3 class="top5-heading">${repHeadingLabel}</h3>
            </div>
          </div>
          ${topSongs.length === 0 ? `
            <div class="empty-songs-box">
              代表曲データは未確認です
            </div>
          ` : `
            <div class="detail-song-list">
              ${topSongs.slice(0, 5).map((songTitle, idx) => {
                const sType = topTypes[idx] || "unconfirmed";
                const dispTitle = formatTop5SongTitle(songTitle, sType);
                const videoId = topLinks[idx] || "";
                const repTier = getTop5SongHeartTierInArchive(artist, songTitle, dispTitle);
                const isRepFav = repTier > 0;
                const repHeartHTML = isRepFav
                  ? buildHeartBadgeSpanHTML(repTier, "song-fav-heart", "かるのオススメ楽曲")
                  : "";
                if (videoId) {
                  const ytUrl = videoId.startsWith("http")
                    ? videoId
                    : `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
                  return `
                    <div class="top5-song-item has-yt-link ${isRepFav ? "song-is-fav" : ""}" data-top5-song-title="${esc(songTitle)}" data-top5-disp-title="${esc(dispTitle)}">
                      <span class="top5-rank-num">${idx + 1}</span>
                      <a class="top5-song-link" href="${esc(ytUrl)}" target="_blank" rel="noopener noreferrer" title="YouTube公式動画を開く: ${esc(dispTitle)}">
                        <span class="song-name">${esc(dispTitle)}${repHeartHTML}</span>
                        <span class="yt-link-badge" aria-hidden="true">
                          <svg class="yt-ext-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
                        </span>
                      </a>
                    </div>
                  `;
                }
                return `
                  <div class="top5-song-item ${isRepFav ? "song-is-fav" : ""}" data-top5-song-title="${esc(songTitle)}" data-top5-disp-title="${esc(dispTitle)}">
                    <span class="top5-rank-num">${idx + 1}</span>
                    <span class="song-name">${esc(dispTitle)}${repHeartHTML}</span>
                  </div>
                `;
              }).join("")}
            </div>
          `}
        </div>


      `;
    } else {
      bodySectionHTML = `
        <div class="detail-actions-row">
          <div class="detail-section-heading">かるが聴いてる曲（${fmtNum(artist.count)}曲）</div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="song-sort-toggle" role="group" aria-label="楽曲の並び替え">
              <button type="button" class="song-sort-btn ${state.songSort === "titleAsc" ? "active" : ""}" data-song-sort="titleAsc">曲名順</button>
              <button type="button" class="song-sort-btn ${state.songSort === "regAsc" ? "active" : ""}" data-song-sort="regAsc">登録順</button>
            </div>
          </div>
        </div>

        <div class="edit-add-song-bar" id="editAddSongBar">
          <input type="text" class="edit-add-song-input" id="editAddSongInput" placeholder="追加する曲名を入力..." autocomplete="off" aria-label="追加する曲名">
          <button type="button" class="edit-add-song-btn" id="editAddSongSubmitBtn" title="この名義に曲を追加" aria-label="曲を追加">＋</button>
        </div>

        ${displaySongs.length === 0 ? `
          <div class="empty-songs-box">
            登録されている楽曲データはありません（0曲）
          </div>
        ` : `
          <div class="detail-song-list">
            ${displaySongs.map((s, i) => {
              const sAliases = (SONG_SEARCH_ALIASES_BY_NEW_TITLE[s.title] || []).map(al => normSearch(al));
              const isMatch = Boolean(q && (normSearch(s.title).includes(q) || sAliases.some(al => al.includes(q))));
              const songTier = getSongHeartTier(artist.aid, s.title);
              const isSongFav = songTier > 0;
              const isCustom = isCustomAddedSong(artist.aid, s.title);
              return `
                <div class="detail-song-item ${isMatch ? "highlight-match" : ""} ${isSongFav ? "song-is-fav" : ""}" data-song-title="${esc(s.title)}" data-artist-aid="${esc(artist.aid)}" ${isSongFav ? `data-heart-tier="${songTier}"` : ""}>
                  <span class="song-idx">${i + 1}</span>
                  <span class="song-name">${esc(s.title)}${isSongFav ? buildHeartBadgeSpanHTML(songTier, "song-fav-heart", "かるのオススメ楽曲") : ""}</span>
                  <span class="detail-song-right-actions">
                    ${isCustom ? `<button type="button" class="custom-song-del-btn" data-delete-custom-song="${esc(s.title)}" title="手動追加したこの曲を削除" aria-label="${esc(s.title)}を削除">－</button>` : ""}
                    <span class="song-edit-heart-indicator ${isSongFav ? `is-fav heart-tier-${songTier}` : ""}" aria-hidden="true">${HEART_SVG_SINGLE}</span>
                  </span>
                </div>
              `;
            }).join("")}
          </div>
        `}
      `;
    }

    const detailArtistTier = getArtistHeartTier(artist.name);
    const isDetailArtistFav = detailArtistTier > 0;
    contentEl.innerHTML = `
      <div class="detail-hero ${isDetailArtistFav ? "detail-artist-is-fav" : ""}" ${isDetailArtistFav ? `data-heart-tier="${detailArtistTier}"` : ""}>
        <div class="detail-avatar-wrap" title="編集モード時：タップでオススメ切替">
          ${renderAvatarHTML(artist, true)}
        </div>
        <h2 class="detail-artist-name">${artist.name === "神崎エルザ (ガンゲイル・オンライン)" ? `<span class="name-pc-only">${esc(artist.name)}</span><span class="name-mob-only">神崎エルザ(GGO)</span>` : esc(artist.name)}${isDetailArtistFav ? buildHeartBadgeSpanHTML(detailArtistTier, "detail-fav-heart", "かるのオススメ") : ""}</h2>
        <div class="detail-karu-artist-songs-row">
          <button type="button" class="detail-karu-artist-songs-btn" data-karu-artist-songs="${esc(artist.name)}" title="楽曲検索で「${esc(artist.name)}」の聴いてる曲一覧を表示">♪ ${esc(artist.name)}の曲</button>
        </div>
        <div class="detail-meta-row">
          ${roleBadgeHTML}
        </div>
        ${subMetaRowHTML}
        ${artist.ytChannelUrl ? `
        <div class="detail-yt-channel-row">
          <a class="detail-yt-channel-btn yt-type-${esc(artist.ytChannelType || "official")}" href="${esc(artist.ytChannelUrl)}" target="_blank" rel="noopener noreferrer" title="${esc(artist.name)} の ${esc(artist.ytChannelLabel || "YouTubeチャンネル")} を新しいタブで開く">
            <svg class="detail-yt-channel-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
            <span>${esc(artist.ytChannelLabel || "YouTubeチャンネル →")}</span>
          </a>
        </div>
        ` : ""}
      </div>
      ${modeTabsHTML}
      ${bodySectionHTML}
      ${artist.profileBio ? `
      <div class="detail-profile-bio-box">
        <div class="detail-profile-bio-header">
          <span class="top5-badge-dot"></span>
          <h3 class="detail-profile-bio-heading">プロフィール</h3>
        </div>
        <p class="detail-profile-bio-text">${esc(artist.profileBio)}</p>
      </div>
      ` : ""}
    `;

    if (resetDetailScroll) {
      contentEl.scrollTop = 0;
    } else if (typeof prevDetailScrollTop === "number" && prevDetailScrollTop > 0) {
      contentEl.scrollTop = prevDetailScrollTop;
      if (contentEl.scrollTop < prevDetailScrollTop) {
        const spacer = document.createElement("div");
        spacer.className = "detail-scroll-preserve-spacer";
        spacer.setAttribute("aria-hidden", "true");
        contentEl.appendChild(spacer);
        const cRect = contentEl.getBoundingClientRect();
        const sRect = spacer.getBoundingClientRect();
        const usedHeight = (sRect.top - cRect.top) + contentEl.scrollTop;
        const neededSpacer = (prevDetailScrollTop + contentEl.clientHeight) - usedHeight + 2;
        if (neededSpacer > 0) {
          spacer.style.height = Math.ceil(neededSpacer) + "px";
        }
        contentEl.scrollTop = prevDetailScrollTop;
      }
    }
  }

  function getContextSortConfig() {
    if (state.view === "recommend") {
      if (state.recommendTab === "song") {
        return {
          options: [
            { value: "recCustomOrder", label: "かるが好きな順" },
            { value: "recFavCountDesc", label: "高評価曲が多い順" }
          ],
          currentVal: state.recSongSort || "recCustomOrder"
        };
      }
      return {
        options: [
          { value: "recFavCountDesc", label: "高評価曲が多い順" },
          { value: "recCustomOrder", label: "かるが好きな順" }
        ],
        currentVal: state.recArtistSort || "recFavCountDesc"
      };
    }

    if (state.karuSpecialMode) {
      if (state.view === "search" && state.searchTarget === "composer") {
        return {
          options: [
            { value: "kanaAsc", label: "五十音順" },
            { value: "countDesc", label: "担当曲数が多い順" },
            { value: "favCountDesc", label: "高評価曲数が多い順" },
            { value: "favRatioDesc", label: "高評価割合が高い順" }
          ],
          currentVal: state.searchComposerSort || "kanaAsc"
        };
      }
      if (state.view === "search" && state.searchTarget === "artist") {
        return {
          options: [
            { value: "kanaAsc", label: "五十音順" },
            { value: "favCountDesc", label: "高評価曲数が多い順" },
            { value: "favRatioDesc", label: "高評価割合が高い順" }
          ],
          currentVal: state.searchArtistSort || "kanaAsc"
        };
      }
      return {
        options: [
          { value: "kanaAsc", label: "五十音順" }
        ],
        currentVal: "kanaAsc"
      };
    }

    if (state.view === "search") {
      const target = state.searchTarget || "all";
      if (target === "group") {
        return {
          options: [
            { value: "groupCountDesc", label: "登録名義数順" },
            { value: "kanaAsc", label: "五十音順" }
          ],
          currentVal: state.searchGroupSort || "groupCountDesc"
        };
      }
      if (target === "song") {
        return {
          options: [
            { value: "kanaAsc", label: "五十音順" },
            { value: "alphaAsc", label: "アルファベット順" },
            { value: "sameSongCountDesc", label: "同一曲数順" }
          ],
          currentVal: state.sameSongCountMode ? "sameSongCountDesc" : (state.searchSongSort || "kanaAsc")
        };
      }
      return {
        options: [
          { value: "kanaAsc", label: "五十音順" },
          { value: "alphaAsc", label: "アルファベット順" },
          { value: "countDesc", label: "登録曲数が多い順" },
          { value: "countAsc", label: "登録曲数が少ない順" },
          { value: "favCountDesc", label: "高評価曲数が多い順" },
          { value: "subDesc", label: "登録者数が多い順" },
          { value: "subAsc", label: "登録者数が少ない順" }
        ],
        currentVal: state.searchArtistSort || "kanaAsc"
      };
    }

    return {
      options: [
        { value: "countDesc", label: "登録曲数が多い順" },
        { value: "countAsc", label: "登録曲数が少ない順" },
        { value: "favCountDesc", label: "高評価曲数が多い順" },
        { value: "kanaAsc", label: "五十音順" },
        { value: "alphaAsc", label: "アルファベット順" },
        { value: "subDesc", label: "登録者数が多い順" },
        { value: "subAsc", label: "登録者数が少ない順" }
      ],
      currentVal: state.sortBy || "countDesc"
    };
  }

  function applySelectedSortValueForContext(newVal) {
    if (!newVal) return false;
    if (state.view === "recommend") {
      if (state.recommendTab === "song") {
        if (state.recSongSort === newVal) return false;
        state.recSongSort = newVal;
        return true;
      }
      if (state.recArtistSort === newVal) return false;
      state.recArtistSort = newVal;
      try { localStorage.setItem("calpis_rec_artist_sort_v1", newVal); } catch (_e) {}
      return true;
    }
    if (state.view === "search") {
      const target = state.searchTarget || "all";
      state.searchSortOverride = true;
      if (target === "composer") {
        state.searchComposerSort = newVal;
        return true;
      }
      if (target === "group") {
        state.searchGroupSort = newVal;
        return true;
      }
      if (target === "song") {
        if (newVal === "sameSongCountDesc") {
          state.sameSongCountMode = true;
          state.searchSongSort = "sameSongCountDesc";
          if (state.exactCanonicalSongKey) {
            state.exactCanonicalSongKey = "";
            state.exactCanonicalSongTitle = "";
            state.searchQuery = "";
            const inp = document.getElementById("mainSearchInput");
            const clr = document.getElementById("clearSearchBtn");
            if (inp) inp.value = "";
            if (clr) clr.style.display = "none";
          }
        } else {
          state.sameSongCountMode = false;
          state.exactCanonicalSongKey = "";
          state.exactCanonicalSongTitle = "";
          state.searchSongSort = newVal;
        }
        return true;
      }
      state.searchArtistSort = newVal;
      return true;
    }
    if (state.sortBy === newVal) return false;
    state.sortBy = newVal;
    state.savedSortBy = newVal;
    return true;
  }

  function updateSortOptionLabelsForContext() {
    const cfg = getContextSortConfig();
    const sel = document.getElementById("pcSortSelect");
    if (sel) {
      sel.innerHTML = cfg.options
        .map(o => `<option value="${esc(o.value)}" ${o.value === cfg.currentVal ? "selected" : ""}>${esc(o.label)}</option>`)
        .join("");
      sel.value = cfg.currentVal;
    }
    const customMenu = document.getElementById("customSortMenu");
    if (customMenu) {
      customMenu.innerHTML = cfg.options
        .map(o => {
          const isAct = o.value === cfg.currentVal;
          return `<button type="button" class="custom-sort-option ${isAct ? "active" : ""}" data-sort-value="${esc(o.value)}" role="option" aria-selected="${isAct ? "true" : "false"}">${esc(o.label)}</button>`;
        })
        .join("");
    }
  }

  // Sync full UI with state
  function updateUI(resetScroll = false) {
    document.body.setAttribute("data-current-view", state.view);
    document.body.setAttribute("data-search-target", state.searchTarget || "all");
    updateSortOptionLabelsForContext();
    applyFilterAndSort();

    // Update desktop nav buttons & mobile bottom nav buttons
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-nav-view") === state.view);
    });

    // Normalize music group role filters when switching between cat1 ("音楽グループ") and all/cat2 ("音楽グループ(アニゲー関連)" / "音楽グループ(その他)")
    if (isCat1OnlyContext()) {
      const hadSubGrp = state.roles.some(r => r === "音楽グループ(アニゲー関連)" || r === "音楽グループ(その他)");
      if (hadSubGrp) {
        state.roles = Array.from(new Set(state.roles.map(r => (r === "音楽グループ(アニゲー関連)" || r === "音楽グループ(その他)") ? "音楽グループ" : r)));
      }
    } else {
      if (state.roles.includes("音楽グループ")) {
        state.roles = Array.from(new Set(state.roles.flatMap(r => r === "音楽グループ" ? ["音楽グループ(アニゲー関連)", "音楽グループ(その他)"] : [r])));
      }
    }

    // Highlight Home button when in clean initial state
    const isInitialDefault = (
      state.view === "all" &&
      !state.agencyGroup &&
      !state.unitGroup &&
      !state.searchQuery &&
      state.heartFilter.length === 0 &&
      state.roles.length === 0 &&
      !hasAnyIndexFilter() &&
      state.sortBy === "countDesc"
    );
    const pcHomeBtn = document.getElementById("pcHomeBtn");
    if (pcHomeBtn) {
      pcHomeBtn.classList.toggle("is-home-default", isInitialDefault);
    }

    // Update hero, mobile stat cards, mobile collection header vs search header visibility
    const heroEl = document.getElementById("heroHeaderSection");
    const mobStatsEl = document.getElementById("mobileStatsGrid");
    const mobColHeaderEl = document.getElementById("mobileCollectionHeader");
    const searchHeaderEl = document.getElementById("searchHeaderSection");

    if (state.view === "search") {
      heroEl.style.display = "none";
      mobStatsEl.style.display = "none";
      mobColHeaderEl.style.display = "none";
      searchHeaderEl.style.display = "block";
    } else {
      heroEl.style.display = "";
      mobStatsEl.style.display = "";
      mobColHeaderEl.style.display = "";
      searchHeaderEl.style.display = "none";
    }

    // Update mobileRecommendWrap visibility & active state
    const mobRecWrap = document.getElementById("mobileRecommendWrap");
    if (mobRecWrap) {
      mobRecWrap.style.display = state.view === "search" ? "none" : "";
    }
    const mobRecBtn = document.getElementById("mobRecommendBtn");
    if (mobRecBtn) {
      mobRecBtn.classList.toggle("active-cat", state.view === "recommend");
    }

    document.body.classList.toggle("karu-special-mode", Boolean(state.karuSpecialMode));
    // Sync list-col-header labels, song-list-mode, same-song-group-mode, and recommend-artist-mode ("高評価曲数")
    updateSearchScopeCounts();
    const isMeikyokuMode = isMeikyokuListView();
    const isSameSongGroupMode = !isMeikyokuMode && isSameSongGroupListView();
    const isSongListMode =
      isMeikyokuMode ||
      (state.view === "recommend" && state.recommendTab === "song") ||
      (state.view === "search" && state.searchTarget === "song" && !isSameSongGroupMode);
    const isRecommendArtistMode = state.view === "recommend" && state.recommendTab === "artist";
    const isGroupSearchMode = state.view === "search" && state.searchTarget === "group";
    const isComposerListMode = Boolean(state.karuSpecialMode && state.view === "search" && state.searchTarget === "composer" && !isMeikyokuMode);
    document.body.setAttribute("data-current-rec-tab", state.recommendTab || "artist");
    document.body.classList.toggle("song-list-mode", isSongListMode);
    document.body.classList.toggle("same-song-group-mode", isSameSongGroupMode);
    document.body.classList.toggle("composer-list-mode", isComposerListMode);
    document.body.classList.toggle("recommend-artist-mode", isRecommendArtistMode);
    const listColHeaderEl = document.getElementById("listColHeader") || document.querySelector(".list-col-header");
    if (listColHeaderEl) {
      listColHeaderEl.classList.toggle("song-list-mode", isSongListMode);
      listColHeaderEl.classList.toggle("same-song-group-mode", isSameSongGroupMode);
      listColHeaderEl.classList.toggle("composer-list-mode", isComposerListMode);
      listColHeaderEl.classList.toggle("recommend-artist-mode", isRecommendArtistMode);
      listColHeaderEl.classList.toggle("group-search-header-hidden", isGroupSearchMode);
      // On Smartphone, hide column header only on "かるのオススメ" -> "楽曲" tab; on "アーティスト" tab show "アーティスト" + "高評価曲数"
      listColHeaderEl.classList.toggle("recommend-mobile-header-hidden", state.view === "recommend" && isSongListMode);
    }
    const listColCountEl = document.getElementById("listColCountLabel");
    if (listColCountEl) {
      if (isSameSongGroupMode) {
        listColCountEl.textContent = "同一曲数";
      } else if (isComposerListMode) {
        if (state.searchComposerSort === "favCountDesc") listColCountEl.textContent = "高評価曲数";
        else if (state.searchComposerSort === "favRatioDesc") listColCountEl.textContent = "高評価割合";
        else listColCountEl.textContent = "担当楽曲数";
      } else if (state.karuSpecialMode && state.view === "search" && state.searchTarget === "artist") {
        if (state.searchArtistSort === "favCountDesc") listColCountEl.textContent = "高評価曲数";
        else if (state.searchArtistSort === "favRatioDesc") listColCountEl.textContent = "高評価割合";
        else listColCountEl.textContent = "登録楽曲数";
      } else {
        listColCountEl.textContent = "登録楽曲数";
      }
    }
    const listColRankEl = document.getElementById("listColRankLabel") || document.querySelector(".list-col-header > span:first-child");
    if (listColRankEl) {
      listColRankEl.textContent = state.view === "recommend" ? "" : "#";
    }
    const listColMainEl = document.getElementById("listColMainLabel") || document.querySelector(".list-col-header > span:nth-child(3)");
    if (listColMainEl) {
      listColMainEl.textContent = isComposerListMode ? "作曲者" : ((isSongListMode || isSameSongGroupMode) ? "曲名" : "アーティスト");
    }
    const listColFavCountEl = document.getElementById("listColFavCountLabel");
    if (listColFavCountEl) {
      listColFavCountEl.style.display = isRecommendArtistMode ? "" : "none";
    }
    const listColTotalHeartEl = document.getElementById("listColTotalHeartLabel");
    if (listColTotalHeartEl) {
      listColTotalHeartEl.style.display = isRecommendArtistMode ? "" : "none";
    }

    // Highlight active stat pill (PC) & stat card (Mobile)
    const pillAllEl = document.getElementById("pillAll");
    if (pillAllEl) pillAllEl.classList.toggle("active-cat", state.view === "all");
    document.getElementById("pillCat1").classList.toggle("active-cat", state.view === "cat1");
    document.getElementById("pillCat2").classList.toggle("active-cat", state.view === "cat2");
    const pillRecEl = document.getElementById("pillRecommend");
    if (pillRecEl) pillRecEl.classList.toggle("active-cat", state.view === "recommend");
    const mobCardTotalEl = document.getElementById("mobCardTotal");
    if (mobCardTotalEl) mobCardTotalEl.classList.toggle("active-cat", state.view === "all");
    document.getElementById("mobCardCat1").classList.toggle("active-cat", state.view === "cat1");
    document.getElementById("mobCardCat2").classList.toggle("active-cat", state.view === "cat2");

    // Update mobile top bar title & collection header title
    const mobTitleEl = document.getElementById("mobileTopTitle");
    const mobColTitleEl = document.getElementById("mobCollectionTitle");
    const mobColSubEl = document.getElementById("mobCollectionSub");
    const sortDescMap = {
      countDesc: "歌い手・アーティストを登録楽曲数順に表示",
      countAsc: "歌い手・アーティストを登録楽曲数が少ない順に表示",
      favCountDesc: "歌い手・アーティストを高評価曲数が多い順に表示",
      kanaAsc: "歌い手・アーティストを五十音順に表示",
      alphaAsc: "歌い手・アーティストをアルファベット順に表示",
      subDesc: "歌い手・アーティストを登録者数が多い順に表示",
      subAsc: "歌い手・アーティストを登録者数が少ない順に表示"
    };
    if (mobColSubEl) {
      mobColSubEl.textContent = sortDescMap[state.sortBy] || sortDescMap.countDesc;
    }

    if (state.unitGroup && state.view !== "search") {
      mobTitleEl.textContent = `ユニット：${state.unitGroup}`;
      if (mobColTitleEl) mobColTitleEl.textContent = `ユニット：${state.unitGroup}`;
    } else if (state.agencyGroup && state.view !== "search") {
      mobTitleEl.textContent = `所属：${state.agencyGroup}`;
      if (mobColTitleEl) mobColTitleEl.textContent = `所属：${state.agencyGroup}`;
    } else if (state.view === "all") {
      mobTitleEl.textContent = "すべて";
      if (mobColTitleEl) mobColTitleEl.textContent = "すべて";
    } else if (state.view === "cat1") {
      mobTitleEl.textContent = "カバーあり";
      if (mobColTitleEl) mobColTitleEl.textContent = "カバーあり";
      if (mobColSubEl) mobColSubEl.textContent = "歌みた・カバー曲を一定数出しているアーティスト";
    } else if (state.view === "cat2") {
      mobTitleEl.textContent = "カバーなし";
      if (mobColTitleEl) mobColTitleEl.textContent = "カバーなし";
      if (mobColSubEl) mobColSubEl.textContent = "オリジナル曲を主に活動しているアーティスト";
    } else if (state.view === "recommend") {
      mobTitleEl.textContent = "かるのオススメ";
      if (mobColTitleEl) mobColTitleEl.textContent = "かるのオススメ";
      if (mobColSubEl) mobColSubEl.textContent = "";
    } else {
      mobTitleEl.textContent = "検索";
    }

    const mobRecFlatBtn = document.getElementById("mobRecFlatModeBtn");
    if (mobRecFlatBtn) {
      mobRecFlatBtn.style.display = state.view === "recommend" ? "inline-flex" : "none";
      mobRecFlatBtn.classList.toggle("active", Boolean(state.recFlatMode));
      mobRecFlatBtn.setAttribute("aria-pressed", state.recFlatMode ? "true" : "false");
    }

    // Sync unified sort select dropdown & custom sort menu for active context
    updateSortOptionLabelsForContext();

    // Sync filter drawers
    const pcDrawer = document.getElementById("pcFilterDrawer");
    pcDrawer.classList.toggle("open", state.pcFilterOpen);
    pcDrawer.innerHTML = buildFilterControlsHTML();

    const mobSheetBody = document.getElementById("mobFilterSheetBody");
    mobSheetBody.innerHTML = buildFilterControlsHTML();

    renderActiveFilterChips();
    renderArtistList(resetScroll);
    renderDetailPanel(false);
    syncHistoryButtons();
  }

  // Select / Open Artist Detail (Always defaults to Representative TOP 5, resets detail scroll, preserves list scroll & songSort)
  function selectArtist(name, fromProfileJump = false) {
    if (!name || !ARTIST_MAP.has(name)) return;
    const defaultMode = "archive";
    if (state.selectedArtistName !== name || state.detailMode !== defaultMode) {
      pushHistorySnapshot(fromProfileJump);
    }
    state.selectedArtistName = name;
    state.selectedComposerName = null;
    state.detailMode = defaultMode;
    if (window.innerWidth <= 900) {
      try {
        history.pushState({ sheet: "detail", artist: name }, "");
      } catch (e) {}
    }
    updateSelectedRowHighlight();
    renderDetailPanel(true);
  }

  function closeDetailPanel() {
    if (state.selectedArtistName !== null || state.selectedComposerName !== null) {
      pushHistorySnapshot(false);
    }
    state.selectedArtistName = null;
    state.selectedComposerName = null;
    updateSelectedRowHighlight();
    renderDetailPanel(false);
  }

  function openMobFilterSheet(recordHistory = false) {
    if (recordHistory && !state.mobFilterOpen) pushHistorySnapshot(false);
    state.mobFilterOpen = true;
    document.getElementById("mobFilterSheet").classList.add("open");
    document.getElementById("sheetBackdrop").classList.add("visible");
    syncMobileScrollLock();
    renderActiveFilterChips();
    try {
      history.pushState({ sheet: "filter" }, "");
    } catch (e) {}
  }

  function closeMobFilterSheet(recordHistory = false) {
    if (recordHistory && state.mobFilterOpen) pushHistorySnapshot(false);
    state.mobFilterOpen = false;
    document.getElementById("mobFilterSheet").classList.remove("open");
    if (!state.selectedArtistName || window.innerWidth > 900) {
      document.getElementById("sheetBackdrop").classList.remove("visible");
    }
    syncMobileScrollLock();
    renderActiveFilterChips();
  }

  function clearAllFilters() {
    const hadIndex = hasAnyIndexFilter();
    state.heartFilter = [];
    if (state.exactCanonicalSongKey) {
      state.exactCanonicalSongKey = "";
      state.exactCanonicalSongTitle = "";
      state.searchQuery = "";
      const inp = document.getElementById("mainSearchInput");
      const clr = document.getElementById("clearSearchBtn");
      if (inp) inp.value = "";
      if (clr) clr.style.display = "none";
    }
    state.sameSongCountMode = false;
    if (state.searchSongSort === "sameSongCountDesc") {
      state.searchSongSort = "kanaAsc";
    }
    state.composerExcludeMaxSongs = 0;
    state.meikyokuFilter = [];
    state.heartFilter = [];
    state.sameSongCountMode = false;
    state.exactCanonicalSongKey = "";
    state.exactCanonicalSongTitle = "";
    state.agencyGroup = "";
    state.unitGroup = "";
    state.roles = [];
    state.subBuckets = [];
    state.kanaRows = [];
    state.kanaChar = "";
    state.alphaChars = [];
    if (hadIndex) {
      syncSortWithIndexFilters("");
    }
  }

  // Item 5: Home Button Reset Function (Resets all search, filters, sort, category, detail panel, and scroll to initial state; preserves PC font scale)
  function resetToHomeState() {
    pushHistorySnapshot(false);
    state.profileBackAvailable = false;
    state.view = "all";
    state.searchScope = "all";
    state.searchTarget = "all";
    state.searchQuery = "";
    state.agencyGroup = "";
    state.unitGroup = "";
    state.roles = [];
    state.subBuckets = [];
    state.kanaRows = [];
    state.kanaChar = "";
    state.alphaChars = [];
    state.lastIndexType = "";
    state.composerExcludeMaxSongs = 0;
    state.meikyokuFilter = [];
    state.heartFilter = [];
    state.sameSongCountMode = false;
    state.exactCanonicalSongKey = "";
    state.exactCanonicalSongTitle = "";
    state.sortBy = state.karuSpecialMode ? "kanaAsc" : "countDesc";
    state.savedSortBy = state.karuSpecialMode ? "kanaAsc" : "countDesc";
    state.recArtistSort = "recFavCountDesc";
    state.recSongSort = "recCustomOrder";
    state.searchArtistSort = "kanaAsc";
    state.searchSongSort = "kanaAsc";
    state.searchGroupSort = "groupCountDesc";
    state.searchSortOverride = false;
    state.selectedArtistName = null;
    state.selectedComposerName = null;
    state.searchComposerSort = "kanaAsc";
    state.exactArtistSongsAid = "";
    state.detailMode = "archive";
    state.pcFilterOpen = false;
    state.mobFilterOpen = false;

    const searchInput = document.getElementById("mainSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (searchInput) searchInput.value = "";
    if (clearSearchBtn) clearSearchBtn.style.display = "none";

    document.querySelectorAll("[data-search-scope]").forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-search-scope") === "all");
    });

    document.getElementById("mobFilterSheet").classList.remove("open");
    document.getElementById("sheetBackdrop").classList.remove("visible");
    syncMobileScrollLock();

    updateUI(true);
  }

  // Delegate Filter Control Events (including Item 4 Auto-Link of 50-on & Alphabet filters with Sort Order)
  function handleFilterControlClick(e) {
    if (e.target.closest("button")) {
      pushHistorySnapshot(false);
    }
    const compExBtn = e.target.closest("[data-filter-composer-exclude]");
    if (compExBtn && state.karuSpecialMode) {
      const nVal = parseInt(compExBtn.getAttribute("data-filter-composer-exclude") || "0", 10);
      if ([2, 3, 5, 10, 20].includes(nVal)) {
        state.composerExcludeMaxSongs = (Number(state.composerExcludeMaxSongs) === nVal) ? 0 : nVal;
      }
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-composer-exclude]")) {
      state.composerExcludeMaxSongs = 0;
      updateUI(true);
      return;
    }

    const meikyokuBtn = e.target.closest("[data-filter-meikyoku]");
    if (meikyokuBtn && state.karuSpecialMode) {
      const mVal = meikyokuBtn.getAttribute("data-filter-meikyoku") || "";
      if (mVal === "all") {
        if (state.meikyokuFilter.includes("all")) {
          state.meikyokuFilter = [];
        } else {
          state.meikyokuFilter = ["all"];
        }
      } else if (mVal === "1" || mVal === "2" || mVal === "3") {
        state.meikyokuFilter = state.meikyokuFilter.filter(x => x !== "all");
        const idx = state.meikyokuFilter.indexOf(mVal);
        if (idx >= 0) state.meikyokuFilter.splice(idx, 1);
        else state.meikyokuFilter.push(mVal);
      }
      if (state.meikyokuFilter.length > 0 && state.view !== "search") {
        if (state.view === "cat1" || state.view === "cat2") {
          state.searchScope = state.view;
        }
        state.view = "search";
      }
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-meikyoku]")) {
      state.meikyokuFilter = [];
      updateUI(true);
      return;
    }

    const heartBtn = e.target.closest("[data-filter-heart]");
    if (heartBtn) {
      const hVal = heartBtn.getAttribute("data-filter-heart") || "";
      if (hVal === "all") {
        if (state.heartFilter.includes("all")) {
          state.heartFilter = [];
        } else {
          state.heartFilter = ["all"];
        }
      } else if (hVal === "1" || hVal === "2" || hVal === "3") {
        state.heartFilter = state.heartFilter.filter(x => x !== "all");
        const idx = state.heartFilter.indexOf(hVal);
        if (idx >= 0) state.heartFilter.splice(idx, 1);
        else state.heartFilter.push(hVal);
      }
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-hearts]")) {
      state.heartFilter = [];
      updateUI(true);
      return;
    }

    const sameSongBtn = e.target.closest("[data-filter-same-song]");
    if (sameSongBtn) {
      if (state.sameSongCountMode && !state.exactCanonicalSongKey) {
        state.sameSongCountMode = false;
        if (state.searchSongSort === "sameSongCountDesc") state.searchSongSort = "kanaAsc";
      } else {
        state.sameSongCountMode = true;
        state.searchSongSort = "sameSongCountDesc";
        if (state.exactCanonicalSongKey) {
          state.exactCanonicalSongKey = "";
          state.exactCanonicalSongTitle = "";
          state.searchQuery = "";
          const inp = document.getElementById("mainSearchInput");
          const clr = document.getElementById("clearSearchBtn");
          if (inp) inp.value = "";
          if (clr) clr.style.display = "none";
        }
      }
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-same-song]")) {
      state.sameSongCountMode = false;
      state.exactCanonicalSongKey = "";
      state.exactCanonicalSongTitle = "";
      if (state.searchSongSort === "sameSongCountDesc") state.searchSongSort = "kanaAsc";
      updateUI(true);
      return;
    }

    const roleBtn = e.target.closest("[data-filter-role]");
    if (roleBtn) {
      const r = roleBtn.getAttribute("data-filter-role");
      const idx = state.roles.indexOf(r);
      if (idx >= 0) state.roles.splice(idx, 1);
      else state.roles.push(r);
      updateUI(true);
      return;
    }

    const subBtn = e.target.closest("[data-filter-sub]");
    if (subBtn) {
      const bKey = subBtn.getAttribute("data-filter-sub");
      const idx = state.subBuckets.indexOf(bKey);
      if (idx >= 0) state.subBuckets.splice(idx, 1);
      else state.subBuckets.push(bKey);
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-roles]")) {
      state.roles = [];
      updateUI(true);
      return;
    }

    const agPillBtn = e.target.closest("[data-filter-agency-pill]");
    if (agPillBtn) {
      const ag = agPillBtn.getAttribute("data-filter-agency-pill") || "";
      state.agencyGroup = (state.agencyGroup === ag) ? "" : ag;
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-agency]")) {
      state.agencyGroup = "";
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-subs]")) {
      state.subBuckets = [];
      updateUI(true);
      return;
    }

    const rowBtn = e.target.closest("[data-kana-row]");
    if (rowBtn) {
      const r = rowBtn.getAttribute("data-kana-row");
      const hadIndexBefore = hasAnyIndexFilter();
      const idx = state.kanaRows.indexOf(r);
      if (idx >= 0) {
        state.kanaRows.splice(idx, 1);
        state.kanaChar = "";
      } else {
        if (!hadIndexBefore) {
          state.savedSortBy = state.sortBy;
        }
        state.kanaRows.push(r);
        state.kanaChar = "";
      }
      syncSortWithIndexFilters("kana");
      updateUI(true);
      return;
    }

    const charBtn = e.target.closest("[data-kana-char]");
    if (charBtn) {
      const c = charBtn.getAttribute("data-kana-char");
      state.kanaChar = c;
      syncSortWithIndexFilters("kana");
      updateUI(true);
      return;
    }

    const alphaBtn = e.target.closest("[data-alpha-char]");
    if (alphaBtn) {
      const ch = alphaBtn.getAttribute("data-alpha-char");
      const hadIndexBefore = hasAnyIndexFilter();
      const idx = state.alphaChars.indexOf(ch);
      if (idx >= 0) {
        state.alphaChars.splice(idx, 1);
      } else {
        if (!hadIndexBefore) {
          state.savedSortBy = state.sortBy;
        }
        state.alphaChars.push(ch);
      }
      syncSortWithIndexFilters("alpha");
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-kana]")) {
      state.kanaRows = [];
      state.kanaChar = "";
      syncSortWithIndexFilters("");
      updateUI(true);
      return;
    }

    if (e.target.closest("[data-clear-alpha]")) {
      state.alphaChars = [];
      syncSortWithIndexFilters("");
      updateUI(true);
      return;
    }
  }

  // Initialize Event Listeners
  function initEvents() {
    // PC 4-Step Font Scale Slider & Tick Buttons (100% / 125% / 150% / 175%)
    const fontSlider = document.getElementById("pcFontScaleSlider");
    if (fontSlider) {
      fontSlider.addEventListener("input", e => {
        const val = parseInt(e.target.value, 10);
        applyPcFontScale(val, true);
      });
      fontSlider.addEventListener("change", e => {
        const val = parseInt(e.target.value, 10);
        applyPcFontScale(val, true);
      });
    }
    const fontBox = document.getElementById("pcFontScaleBox");
    if (fontBox) {
      fontBox.addEventListener("click", e => {
        const tickBtn = e.target.closest("[data-font-scale]");
        if (!tickBtn) return;
        const val = parseInt(tickBtn.getAttribute("data-font-scale"), 10);
        applyPcFontScale(val, true);
      });
    }

    // Home Button (PC Left Sidebar & Smartphone Top Header) + 5-Tap Secret Toggle for "かる専用モード"
    let homeTapTimestamps = [];
    function toggleKaruSpecialMode() {
      permanentlyExcludeOwnerFromAnalytics();
      state.karuSpecialMode = !state.karuSpecialMode;
      document.body.classList.toggle("karu-special-mode", state.karuSpecialMode);
      if (state.karuSpecialMode) {
        state.sortBy = "kanaAsc";
        state.savedSortBy = "kanaAsc";
        state.searchArtistSort = "kanaAsc";
        state.searchSongSort = "kanaAsc";
        state.sameSongCountMode = false;
        state.exactCanonicalSongKey = "";
        state.exactCanonicalSongTitle = "";
      } else {
        state.composerExcludeMaxSongs = 0;
        state.meikyokuFilter = [];
        if (state.searchTarget === "composer") {
          state.searchTarget = "all";
        }
        state.selectedComposerName = null;
        state.exactArtistSongsAid = "";
        state.sortBy = "countDesc";
        state.savedSortBy = "countDesc";
      }
      syncSearchTargetUI();
      updateUI(true);
      const toastEl = document.getElementById("favSyncToast");
      if (toastEl) {
        toastEl.textContent = state.karuSpecialMode
          ? "かる専用モードに移行しました（五十音順・銘曲絞り込み対応）"
          : "通常モードに戻りました";
        toastEl.classList.remove("toast-warn");
        toastEl.classList.add("show");
        setTimeout(() => toastEl.classList.remove("show"), 2600);
      }
    }
    window.__toggleKaruSpecialMode = toggleKaruSpecialMode;

    function handleHomeButtonTap() {
      const now = Date.now();
      homeTapTimestamps = homeTapTimestamps.filter(t => now - t <= 2200);
      homeTapTimestamps.push(now);
      if (homeTapTimestamps.length >= 5) {
        homeTapTimestamps = [];
        toggleKaruSpecialMode();
        return;
      }
      resetToHomeState();
    }

    const pcHomeBtn = document.getElementById("pcHomeBtn");
    if (pcHomeBtn) {
      pcHomeBtn.addEventListener("click", handleHomeButtonTap);
    }
    const mobTopHomeBtn = document.getElementById("mobTopHomeBtn");
    if (mobTopHomeBtn) {
      mobTopHomeBtn.addEventListener("click", handleHomeButtonTap);
    }

    function triggerMobileSearchTransition(triggerBtn) {
      if (triggerBtn) {
        triggerBtn.classList.add("mob-search-tap-active");
      }
      setTimeout(() => {
        if (triggerBtn) {
          triggerBtn.classList.remove("mob-search-tap-active");
        }
        pushHistorySnapshot(false);
        state.view = "search";
        closeDetailPanel();
        closeMobFilterSheet();
        updateUI(true);
        const scrollEl = document.getElementById("centerScrollArea");
        if (scrollEl) {
          scrollEl.classList.remove("mob-search-screen-enter");
          void scrollEl.offsetWidth;
          scrollEl.classList.add("mob-search-screen-enter");
        }
        setTimeout(() => {
          const inp = document.getElementById("mainSearchInput");
          if (inp) inp.focus();
        }, 65);
      }, 55);
    }

    // Navigation buttons (Left Sidebar & Mobile Bottom Nav)
    document.querySelectorAll("[data-nav-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetView = btn.getAttribute("data-nav-view");
        if (targetView === "search" && window.innerWidth <= 900) {
          triggerMobileSearchTransition(btn);
          return;
        }
        pushHistorySnapshot(false);
        state.view = targetView;
        if (targetView === "all" || targetView === "cat1" || targetView === "cat2" || targetView === "recommend") {
          state.agencyGroup = "";
          state.unitGroup = "";
        }
        if (window.innerWidth <= 900) {
          closeDetailPanel();
          closeMobFilterSheet();
        }
        updateUI(true);
        if (targetView === "search") {
          setTimeout(() => {
            const inp = document.getElementById("mainSearchInput");
            if (inp) inp.focus();
          }, 50);
        }
      });
    });

    // Mobile Top Bar quick search button
    const mobTopSearchBtn = document.getElementById("mobTopSearchBtn");
    if (mobTopSearchBtn) {
      mobTopSearchBtn.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
          triggerMobileSearchTransition(mobTopSearchBtn);
          return;
        }
        state.view = "search";
        closeDetailPanel();
        closeMobFilterSheet();
        updateUI(true);
        setTimeout(() => {
          const inp = document.getElementById("mainSearchInput");
          if (inp) inp.focus();
        }, 50);
      });
    }

    // Hero stat pills (PC) & Mobile Stat Cards can switch category (すべて / カバーあり / カバーなし)
    const pillAllBtn = document.getElementById("pillAll");
    if (pillAllBtn) {
      pillAllBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = "all";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    document.getElementById("pillCat1").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat1";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });
    document.getElementById("pillCat2").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat2";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });
    const pillRecBtn = document.getElementById("pillRecommend");
    if (pillRecBtn) {
      pillRecBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = "recommend";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    const mobRecBtn = document.getElementById("mobRecommendBtn");
    if (mobRecBtn) {
      mobRecBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = state.view === "recommend" ? "all" : "recommend";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    const mobCardTotalBtn = document.getElementById("mobCardTotal");
    if (mobCardTotalBtn) {
      mobCardTotalBtn.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.view = "all";
        state.agencyGroup = "";
        state.unitGroup = "";
        updateUI(true);
      });
    }
    document.getElementById("mobCardCat1").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat1";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });
    document.getElementById("mobCardCat2").addEventListener("click", () => {
      pushHistorySnapshot(false);
      state.view = "cat2";
      state.agencyGroup = "";
      state.unitGroup = "";
      updateUI(true);
    });

    // Unified Sort select & Custom compact sort popup menu
    const pcSortSelectEl = document.getElementById("pcSortSelect");
    const sortWrapEl = document.getElementById("sortWrapContainer") || (pcSortSelectEl && pcSortSelectEl.closest(".sort-wrap"));
    const customSortMenuEl = document.getElementById("customSortMenu");

    if (pcSortSelectEl) {
      pcSortSelectEl.addEventListener("change", e => {
        pushHistorySnapshot(false);
        applySelectedSortValueForContext(e.target.value);
        if (customSortMenuEl) customSortMenuEl.classList.remove("open");
        updateUI(state.view !== "recommend");
      });
      // On mobile (<= 900px), intercept native select opening and use the compact custom sort popup
      pcSortSelectEl.addEventListener("mousedown", e => {
        if (window.innerWidth <= 900 && customSortMenuEl) {
          e.preventDefault();
          customSortMenuEl.classList.toggle("open");
        }
      });
      pcSortSelectEl.addEventListener("touchstart", e => {
        if (window.innerWidth <= 900 && customSortMenuEl) {
          e.preventDefault();
          customSortMenuEl.classList.toggle("open");
        }
      }, { passive: false });
    }

    if (sortWrapEl && customSortMenuEl) {
      sortWrapEl.addEventListener("click", e => {
        if (window.innerWidth <= 900 && !e.target.closest(".custom-sort-option")) {
          e.preventDefault();
          e.stopPropagation();
          customSortMenuEl.classList.toggle("open");
        }
      });
      customSortMenuEl.addEventListener("click", e => {
        const optBtn = e.target.closest(".custom-sort-option");
        if (!optBtn) return;
        e.preventDefault();
        e.stopPropagation();
        const newVal = optBtn.getAttribute("data-sort-value");
        customSortMenuEl.classList.remove("open");
        if (newVal) {
          pushHistorySnapshot(false);
          applySelectedSortValueForContext(newVal);
          if (pcSortSelectEl) pcSortSelectEl.value = newVal;
          updateUI(state.view !== "recommend");
        }
      });
      document.addEventListener("click", e => {
        if (!sortWrapEl.contains(e.target)) {
          customSortMenuEl.classList.remove("open");
        }
      });
    }

    // Unified Filter button: opens collapsible drawer on PC, or bottom filter sheet on Smartphone (does not pollute undoStack)
    document.getElementById("pcFilterToggleBtn").addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        if (state.mobFilterOpen) closeMobFilterSheet(false);
        else openMobFilterSheet(false);
      } else {
        state.pcFilterOpen = !state.pcFilterOpen;
        updateUI(false);
        if (state.pcFilterOpen) {
          const drawerEl = document.getElementById("pcFilterDrawer");
          const scrollEl = document.getElementById("centerScrollArea");
          const stickyEl = document.querySelector(".sticky-controls");
          if (drawerEl && scrollEl) {
            const stickyH = stickyEl ? stickyEl.offsetHeight : 62;
            const dRect = drawerEl.getBoundingClientRect();
            const sRect = scrollEl.getBoundingClientRect();
            const visibleTop = sRect.top + stickyH + 10;
            if (dRect.top < visibleTop) {
              const targetTop = Math.max(0, scrollEl.scrollTop + (dRect.top - visibleTop));
              scrollEl.scrollTo({ top: targetTop, behavior: "smooth" });
            }
          }
        }
      }
    });

    document.getElementById("closeMobFilterBtn").addEventListener("click", closeMobFilterSheet);
    document.getElementById("applyMobFilterBtn").addEventListener("click", closeMobFilterSheet);
    document.getElementById("resetMobFilterBtn").addEventListener("click", () => {
      clearAllFilters();
      updateUI(true);
    });

    // Filter controls delegation
    document.getElementById("pcFilterDrawer").addEventListener("click", handleFilterControlClick);
    document.getElementById("mobFilterSheetBody").addEventListener("click", handleFilterControlClick);

    // Active filter chips removal (individual & clear all, with automatic sort restoration)
    document.getElementById("activeChipsContainer").addEventListener("click", e => {
      const btn = e.target.closest("[data-remove-chip]");
      if (!btn) return;
      const key = btn.getAttribute("data-remove-chip");
      pushHistorySnapshot(false);
      if (key === "all") {
        clearAllFilters();
      } else if (key === "composerExclude") {
        state.composerExcludeMaxSongs = 0;
      } else if (key === "exactCanonicalSong") {
        state.exactCanonicalSongKey = "";
        state.exactCanonicalSongTitle = "";
        state.searchQuery = "";
        const inp = document.getElementById("mainSearchInput");
        const clr = document.getElementById("clearSearchBtn");
        if (inp) inp.value = "";
        if (clr) clr.style.display = "none";
      } else if (key === "sameSongCountMode") {
        state.sameSongCountMode = false;
        state.exactCanonicalSongKey = "";
        state.exactCanonicalSongTitle = "";
        if (state.searchSongSort === "sameSongCountDesc") state.searchSongSort = "kanaAsc";
      } else if (key.startsWith("meikyoku:")) {
        const mVal = key.slice(9);
        if (mVal === "all") state.meikyokuFilter = [];
        else state.meikyokuFilter = state.meikyokuFilter.filter(item => item !== mVal);
      } else if (key.startsWith("heart:")) {
        const hVal = key.slice(6);
        if (hVal === "all") state.heartFilter = [];
        else state.heartFilter = state.heartFilter.filter(item => item !== hVal);
      } else if (key === "agencyGroup") {
        state.agencyGroup = "";
      } else if (key === "unitGroup") {
        state.unitGroup = "";
      } else if (key.startsWith("role:")) {
        const r = key.slice(5);
        state.roles = state.roles.filter(item => item !== r);
      } else if (key.startsWith("sub:")) {
        const bKey = key.slice(4);
        state.subBuckets = state.subBuckets.filter(item => item !== bKey);
      } else if (key === "kanaChar") {
        state.kanaChar = "";
        state.kanaRows = [];
        syncSortWithIndexFilters("");
      } else if (key.startsWith("kanaRow:")) {
        const r = key.slice(8);
        state.kanaRows = state.kanaRows.filter(item => item !== r);
        state.kanaChar = "";
        syncSortWithIndexFilters("");
      } else if (key.startsWith("alpha:")) {
        const ch = key.slice(6);
        state.alphaChars = state.alphaChars.filter(item => item !== ch);
        syncSortWithIndexFilters("");
      }
      updateUI(true);
    });

    // Search input with 80ms debounce & candidate click delegation
    const searchInput = document.getElementById("mainSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    let searchDebounceTimer = null;

    function runSearchUpdate() {
      applyFilterAndSort();
      renderArtistList(true);
      if (state.selectedArtistName) renderDetailPanel(false);
    }

    searchInput.addEventListener("input", e => {
      state.searchQuery = e.target.value;
      state.exactCanonicalSongKey = "";
      state.exactCanonicalSongTitle = "";
      state.exactArtistSongsAid = "";
      state.searchSortOverride = false;
      clearSearchBtn.style.display = state.searchQuery ? "flex" : "none";
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        renderActiveFilterChips();
        runSearchUpdate();
      }, 80);
    });

    clearSearchBtn.addEventListener("click", () => {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      state.searchQuery = "";
      state.exactCanonicalSongKey = "";
      state.exactCanonicalSongTitle = "";
      state.exactArtistSongsAid = "";
      searchInput.value = "";
      clearSearchBtn.style.display = "none";
      updateUI(true);
      searchInput.focus();
    });

    function applySearchGroupFilter(groupType, groupName) {
      if (!groupName) return;
      pushHistorySnapshot(false);
      if (groupType === "agency") {
        state.agencyGroup = groupName;
        state.unitGroup = "";
      } else {
        state.unitGroup = groupName;
        state.agencyGroup = "";
      }
      state.view = state.searchScope === "cat1" ? "cat1" : (state.searchScope === "cat2" ? "cat2" : "all");
      updateUI(true);
    }

    function scrollToRecommendRoleSection(roleName) {
      if (!roleName) return;
      const scrollEl = document.getElementById("centerScrollArea");
      const secEl = document.querySelector(`#artistListContainer .recommend-role-section[data-role-section="${CSS.escape(roleName)}"]`);
      if (!scrollEl || !secEl) return;
      const stickyEl = document.querySelector(".sticky-controls");
      const stickyH = stickyEl ? stickyEl.offsetHeight : 54;
      const sRect = scrollEl.getBoundingClientRect();
      const secRect = secEl.getBoundingClientRect();
      const targetTop = Math.max(0, scrollEl.scrollTop + (secRect.top - sRect.top) - stickyH - 6);
      scrollEl.scrollTo({ top: targetTop, behavior: "smooth" });
    }

    const recSwitchSlotEl = document.getElementById("recommendSwitchBarSlot");
    if (recSwitchSlotEl) {
      recSwitchSlotEl.addEventListener("click", e => {
        const flatBtn = e.target.closest("button[data-toggle-rec-flat]");
        if (flatBtn) {
          e.preventDefault();
          pushHistorySnapshot(false);
          state.recFlatMode = !state.recFlatMode;
          updateUI(false);
          return;
        }
        const jumpBtn = e.target.closest("[data-jump-role]");
        if (jumpBtn) {
          e.preventDefault();
          scrollToRecommendRoleSection(jumpBtn.getAttribute("data-jump-role"));
          return;
        }
        const recTabBtn = e.target.closest("[data-recommend-tab]");
        if (!recTabBtn) return;
        const nextTab = recTabBtn.getAttribute("data-recommend-tab") || "artist";
        if (state.recommendTab !== nextTab) {
          state.recommendTab = nextTab;
          updateUI(false);
        }
      });
    }

    const mobRecFlatBtnEl = document.getElementById("mobRecFlatModeBtn");
    if (mobRecFlatBtnEl) {
      mobRecFlatBtnEl.addEventListener("click", e => {
        e.preventDefault();
        pushHistorySnapshot(false);
        state.recFlatMode = !state.recFlatMode;
        updateUI(false);
      });
    }

    const candBar = document.getElementById("searchCandidatesBar");
    if (candBar) {
      candBar.addEventListener("click", e => {
        const grpChip = e.target.closest("[data-cand-group-name]");
        if (grpChip) {
          applySearchGroupFilter(
            grpChip.getAttribute("data-cand-group-type"),
            grpChip.getAttribute("data-cand-group-name")
          );
          return;
        }
        const compChip = e.target.closest("[data-cand-composer]");
        if (compChip) {
          selectComposer(compChip.getAttribute("data-cand-composer"));
          return;
        }
        const chip = e.target.closest("[data-cand-artist]");
        if (!chip) return;
        const name = chip.getAttribute("data-cand-artist");
        selectArtist(name);
      });
    }

    document.querySelectorAll("[data-search-scope]").forEach(tab => {
      tab.addEventListener("click", () => {
        pushHistorySnapshot(false);
        state.searchScope = tab.getAttribute("data-search-scope");
        document.querySelectorAll("[data-search-scope]").forEach(t => {
          t.classList.toggle("active", t === tab);
        });
        updateUI(true);
      });
    });

    document.querySelectorAll("[data-search-target]").forEach(tab => {
      tab.addEventListener("click", () => {
        const nextTarget = tab.getAttribute("data-search-target") || "both";
        if (state.searchTarget === nextTarget) return;
        pushHistorySnapshot(false);
        if (state.exactCanonicalSongKey) {
          state.exactCanonicalSongKey = "";
          state.exactCanonicalSongTitle = "";
        }
        state.exactArtistSongsAid = "";
        state.searchTarget = nextTarget;
        state.searchSortOverride = false;
        syncSearchTargetUI();
        updateUI(true);
      });
    });

    // Artist row click & hover/touch detail avatar preloader
    const listContainer = document.getElementById("artistListContainer");
    const handleRowHoverPreload = e => {
      const row = e.target.closest(".artist-row");
      if (!row) return;
      const name = row.getAttribute("data-artist-name");
      const a = name ? ARTIST_MAP.get(name) : null;
      if (a && a.img) {
        preloadAvatarUrl(getDetailAvatarUrl(a.img));
      }
    };
    listContainer.addEventListener("pointerover", handleRowHoverPreload, { passive: true });
    listContainer.addEventListener("touchstart", handleRowHoverPreload, { passive: true });
    // Drag-to-reorder within Activity Role section in "かるのオススメ" during Edit Mode
    let activeDragState = null;
    let suppressNextRowClick = false;

    function commitRecommendSectionOrder(sectionEl, recordUndo = true) {
      if (!sectionEl) return;
      if (recordUndo) {
        pushEditHistorySnapshot();
      }
      manualReorderCount++;

      const rows = Array.from(sectionEl.querySelectorAll(".artist-row"));
      rows.forEach((r, idx) => {
        const rankEl = r.querySelector(".row-rank");
        if (rankEl) rankEl.textContent = String(idx + 1);
      });

      if (state.recommendTab === "song") {
        state.recSongSort = "recCustomOrder";
        updateSortOptionLabelsForContext();

        // Extract exact song order inside the dragged `sectionEl` (`rows`) and perform in-place slot replacement
        // in `recommendedSongMap` so multi-role artists (e.g. "Vsinger / 歌い手") in earlier sections NEVER overwrite this section's order!
        const newSectionKeys = [];
        const sectionKeySet = new Set();
        rows.forEach(r => {
          const k = makeSongKey(r.getAttribute("data-artist-aid") || r.getAttribute("data-artist-name"), r.getAttribute("data-rec-song-title"));
          if (k && !sectionKeySet.has(k)) {
            sectionKeySet.add(k);
            newSectionKeys.push(k);
          }
        });

        newSectionKeys.forEach(k => {
          if (!recommendedSongMap.has(k)) {
            recommendedSongMap.set(k, 3);
          }
        });

        const allEntries = Array.from(recommendedSongMap.entries());
        let repIdx = 0;
        const nextEntries = allEntries.map(([k, tier]) => {
          if (sectionKeySet.has(k)) {
            const nextKey = newSectionKeys[repIdx++];
            return [nextKey, recommendedSongMap.get(nextKey) || tier];
          }
          return [k, tier];
        });
        recommendedSongMap.clear();
        nextEntries.forEach(([k, tier]) => recommendedSongMap.set(k, tier));
      } else {
        state.recArtistSort = "recCustomOrder";
        try { localStorage.setItem("calpis_rec_artist_sort_v1", "recCustomOrder"); } catch (_e) {}
        updateSortOptionLabelsForContext();

        // 1. Extract the exact artist order inside the dragged `sectionEl` (`rows`)
        const newSectionAids = [];
        const sectionAidSet = new Set();
        rows.forEach(r => {
          const aid = r.getAttribute("data-artist-aid") || resolveToAid(r.getAttribute("data-artist-name"));
          if (aid && !sectionAidSet.has(aid)) {
            sectionAidSet.add(aid);
            newSectionAids.push(aid);
          }
        });

        // 2. Cache current effective heart tiers before mutating `recommendedAidMap`
        const effTierCache = new Map();
        DATA.forEach(a => {
          if (a && a.aid) {
            const effT = getArtistHeartTier(a.aid);
            if (effT > 0) effTierCache.set(a.aid, effT);
          }
        });
        newSectionAids.forEach(aid => {
          if (!effTierCache.has(aid)) {
            effTierCache.set(aid, getArtistHeartTier(aid) || recommendedAidMap.get(aid) || 3);
          }
        });

        // 3. Ensure every recommended artist (including auto-promoted artists) is present in `recommendedAidMap`
        //    so all slots of `newSectionAids` exist in `recommendedAidMap`
        newSectionAids.forEach(aid => {
          if (!recommendedAidMap.has(aid)) {
            recommendedAidMap.set(aid, effTierCache.get(aid) || 3);
          }
        });
        effTierCache.forEach((tier, aid) => {
          if (!recommendedAidMap.has(aid)) {
            recommendedAidMap.set(aid, tier);
          }
        });

        // 4. Perform in-place slot replacement for `sectionAidSet` in `recommendedAidMap`!
        //    Because the slots occupied by `sectionAidSet` have strictly increasing indices I_1 < I_2 < ... < I_k,
        //    placing `newSectionAids[0..k-1]` into those exact slots guarantees 100% that `newSectionAids`
        //    will sort in the exact order `newSectionAids[0], newSectionAids[1], ...` even for multi-role "歌い手" artists!
        const allEntries = Array.from(recommendedAidMap.entries());
        let repIdx = 0;
        const nextEntries = allEntries.map(([aid, tier]) => {
          if (sectionAidSet.has(aid)) {
            const nextAid = newSectionAids[repIdx++];
            const nextTier = effTierCache.get(nextAid) || recommendedAidMap.get(nextAid) || tier;
            return [nextAid, nextTier];
          }
          return [aid, effTierCache.get(aid) || tier];
        });

        recommendedAidMap.clear();
        artistTierOrderMap.clear();
        nextEntries.forEach(([aid, tier]) => {
          recommendedAidMap.set(aid, tier);
          artistTierOrderMap.set(aid, favOrderSeqCounter++);
        });
      }

      saveFavOrderMemory();
      saveUnsavedDraft();
      updateFavEditBannerStatus();
      syncHistoryButtons();
    }

    function getVisibleSectionRows(section) {
      return Array.from(section.querySelectorAll(".artist-row"));
    }

    function getRowLayoutTop(el) {
      const rect = el.getBoundingClientRect();
      const tr = window.getComputedStyle(el).transform;
      if (tr && tr !== "none") {
        try {
          const mat = new DOMMatrixReadOnly(tr);
          return rect.top - (mat.m42 || 0);
        } catch (_e) {}
      }
      return rect.top;
    }

    function updateDragPlaceholderAndGhostRank(section, placeholderRow, ghostEl) {
      const rows = getVisibleSectionRows(section);
      let targetRank = 1;
      rows.forEach((r, idx) => {
        const num = idx + 1;
        const rankEl = r.querySelector(".row-rank");
        if (rankEl) rankEl.textContent = String(num);
        if (r === placeholderRow) targetRank = num;
      });
      placeholderRow.setAttribute("data-drop-target-label", `ここに移動（#${targetRank}）`);
      if (ghostEl) {
        const ghostRankEl = ghostEl.querySelector(".row-rank");
        if (ghostRankEl) ghostRankEl.textContent = `${targetRank}`;
      }
    }

    function animateSectionRowsFLIP(section, prevTopsMap, skipRow) {
      const rows = getVisibleSectionRows(section);
      rows.forEach(r => {
        if (r === skipRow) return;
        const prevTop = prevTopsMap.get(r);
        if (typeof prevTop !== "number") return;
        const newTop = getRowLayoutTop(r);
        const dy = prevTop - newTop;
        if (Math.abs(dy) > 1) {
          r.style.transition = "none";
          r.style.transform = `translateY(${dy}px)`;
          void r.offsetWidth;
          r.style.transition = "transform 0.16s cubic-bezier(0.22, 1, 0.36, 1)";
          r.style.transform = "";
        }
      });
    }

    function startRecommendDragSession(handle, clientY, pointerId) {
      const row = handle.closest(".artist-row");
      const section = row ? row.closest(".recommend-role-section") : null;
      if (!row || !section) return false;

      if (activeDragState) {
        finishRecommendDrag();
      }

      if (pointerId !== undefined && pointerId !== null) {
        try {
          handle.setPointerCapture(pointerId);
        } catch (_e) {}
      }

      const draggedTier = row.getAttribute("data-heart-tier") || "3";
      const rowRect = row.getBoundingClientRect();
      const pointerOffsetY = clientY - rowRect.top;

      // Create floating drag card that follows the pointer smoothly
      const ghostEl = row.cloneNode(true);
      ghostEl.classList.add("drag-floating-card");
      ghostEl.style.position = "fixed";
      ghostEl.style.left = `${rowRect.left}px`;
      ghostEl.style.top = `${rowRect.top}px`;
      ghostEl.style.width = `${rowRect.width}px`;
      ghostEl.style.height = `${rowRect.height}px`;
      ghostEl.style.margin = "0";
      ghostEl.style.zIndex = "9995";
      ghostEl.style.pointerEvents = "none";
      document.body.appendChild(ghostEl);

      // Keep `row` itself visible in the DOM as the drop-slot placeholder so the pointer/touch target
      // is NEVER hidden (`display: none`) and the browser never fires a spurious `pointercancel`!
      row.classList.add("is-dragging-row", "is-drag-placeholder");

      updateDragPlaceholderAndGhostRank(section, row, ghostEl);

      activeDragState = {
        pointerId,
        row,
        placeholderEl: row,
        section,
        handle,
        ghostEl,
        draggedTier,
        startTop: rowRect.top,
        pointerOffsetY,
        rowHeight: rowRect.height,
        moved: false
      };
      return true;
    }

    function moveRecommendDragSession(clientY) {
      if (!activeDragState) return;
      const { row, section, ghostEl, draggedTier, pointerOffsetY, rowHeight } = activeDragState;

      const siblings = getVisibleSectionRows(section);
      // Restrict drag reordering strictly to rows with the exact same heart grade (`draggedTier`)
      const sameTierSiblings = siblings.filter(r => r === row || (r.getAttribute("data-heart-tier") || "3") === draggedTier);
      if (sameTierSiblings.length <= 1) return;

      const firstSame = sameTierSiblings[0];
      const lastSame = sameTierSiblings[sameTierSiblings.length - 1];
      const minTop = firstSame ? firstSame.getBoundingClientRect().top - 4 : section.getBoundingClientRect().top;
      const maxTop = lastSame ? Math.max(minTop, lastSame.getBoundingClientRect().bottom - rowHeight + 4) : section.getBoundingClientRect().bottom;
      const desiredTop = Math.max(minTop, Math.min(maxTop, clientY - pointerOffsetY));
      if (ghostEl) {
        ghostEl.style.top = `${desiredTop}px`;
      }

      // Gentle auto-scroll if dragging near top/bottom edge of #centerScrollArea
      const scrollEl = document.getElementById("centerScrollArea");
      if (scrollEl) {
        const sRect = scrollEl.getBoundingClientRect();
        if (clientY < sRect.top + 48) {
          scrollEl.scrollTop -= 6;
        } else if (clientY > sRect.bottom - 48) {
          scrollEl.scrollTop += 6;
        }
      }

      const prevIdx = sameTierSiblings.indexOf(row);
      const nonPlaceholderSameTierRows = sameTierSiblings.filter(r => r !== row);

      // Record current layout tops for smooth FLIP transition if slot moves
      const prevTopsMap = new Map();
      siblings.forEach(r => prevTopsMap.set(r, getRowLayoutTop(r)));

      const dragCenterY = clientY;
      let targetSib = null;
      let targetIdx = nonPlaceholderSameTierRows.length;

      for (let i = 0; i < nonPlaceholderSameTierRows.length; i++) {
        const sib = nonPlaceholderSameTierRows[i];
        const layoutTop = getRowLayoutTop(sib);
        const h = sib.offsetHeight || rowHeight;
        const midY = layoutTop + h / 2;
        if (dragCenterY < midY) {
          targetSib = sib;
          targetIdx = i;
          break;
        }
      }

      if (targetIdx !== prevIdx) {
        if (targetSib) {
          section.insertBefore(row, targetSib);
        } else {
          const lastInTier = nonPlaceholderSameTierRows[nonPlaceholderSameTierRows.length - 1];
          if (lastInTier && lastInTier.nextSibling) {
            section.insertBefore(row, lastInTier.nextSibling);
          } else {
            section.appendChild(row);
          }
        }
        activeDragState.moved = true;
        updateDragPlaceholderAndGhostRank(section, row, ghostEl);
        animateSectionRowsFLIP(section, prevTopsMap, row);
      }
    }

    function finishRecommendDrag(e) {
      if (!activeDragState) return;
      if (
        e &&
        e.pointerId !== undefined &&
        activeDragState.pointerId !== undefined &&
        activeDragState.pointerId !== null &&
        e.pointerId !== activeDragState.pointerId
      ) {
        return;
      }
      const { row, section, handle, ghostEl, moved, pointerId } = activeDragState;
      try {
        if (pointerId !== undefined && pointerId !== null && handle && handle.releasePointerCapture) {
          handle.releasePointerCapture(pointerId);
        }
      } catch (_e) {}
      if (ghostEl && ghostEl.parentNode) {
        ghostEl.parentNode.removeChild(ghostEl);
      }
      row.style.display = "";
      row.classList.remove("is-dragging-row", "is-drag-placeholder");
      row.removeAttribute("data-drop-target-label");
      Array.from(section.querySelectorAll(".artist-row")).forEach(r => {
        r.style.transition = "";
        r.style.transform = "";
      });
      activeDragState = null;
      suppressNextRowClick = true;
      setTimeout(() => { suppressNextRowClick = false; }, 80);
      if (moved) {
        commitRecommendSectionOrder(section, true);
      }
    }

    listContainer.addEventListener("pointerdown", e => {
      if (!favQuickEditMode || state.view !== "recommend") return;
      const handle = e.target.closest("[data-drag-handle]");
      if (!handle) return;
      e.preventDefault();
      e.stopPropagation();
      if (!activeDragState) {
        startRecommendDragSession(handle, e.clientY, e.pointerId);
      }
    });

    listContainer.addEventListener("touchstart", e => {
      if (!favQuickEditMode || state.view !== "recommend") return;
      const handle = e.target.closest("[data-drag-handle]");
      if (!handle) return;
      e.preventDefault();
      e.stopPropagation();
      if (!activeDragState && e.touches && e.touches.length > 0) {
        startRecommendDragSession(handle, e.touches[0].clientY, null);
      }
    }, { passive: false });

    window.addEventListener("pointermove", e => {
      if (!activeDragState) return;
      if (activeDragState.pointerId !== null && activeDragState.pointerId !== undefined && e.pointerId !== activeDragState.pointerId) return;
      e.preventDefault();
      moveRecommendDragSession(e.clientY);
    }, { passive: false });

    window.addEventListener("touchmove", e => {
      if (!activeDragState) return;
      if (e.touches && e.touches.length > 0) {
        e.preventDefault();
        moveRecommendDragSession(e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener("pointerup", finishRecommendDrag);
    window.addEventListener("pointercancel", finishRecommendDrag);
    window.addEventListener("touchend", () => finishRecommendDrag());
    window.addEventListener("touchcancel", () => finishRecommendDrag());

    // Expose programmatic helper for reordering within a role section (restricted to same heart grade!)
    window.__reorderRecommendSectionRow = function(sectionEl, fromIndex, toIndex) {
      if (!sectionEl) return false;
      const rows = Array.from(sectionEl.querySelectorAll(".artist-row"));
      if (fromIndex < 0 || fromIndex >= rows.length || toIndex < 0 || toIndex >= rows.length || fromIndex === toIndex) return false;
      const movingRow = rows[fromIndex];
      const targetRow = rows[toIndex];
      const movingTier = movingRow.getAttribute("data-heart-tier") || "3";
      const targetTier = targetRow.getAttribute("data-heart-tier") || "3";
      if (movingTier !== targetTier) {
        // Cannot swap across different heart grades!
        return false;
      }
      if (fromIndex < toIndex) {
        sectionEl.insertBefore(movingRow, targetRow.nextSibling);
      } else {
        sectionEl.insertBefore(movingRow, targetRow);
      }
      commitRecommendSectionOrder(sectionEl, true);
      return true;
    };

    let lastPcPointerDown = { x: 0, y: 0 };
    window.addEventListener("pointerdown", e => {
      lastPcPointerDown = { x: e.clientX || 0, y: e.clientY || 0 };
    }, { passive: true });

    function isPcTextSelectionDrag(e) {
      if (window.innerWidth <= 900) return false;
      const dist = Math.hypot((e.clientX || 0) - lastPcPointerDown.x, (e.clientY || 0) - lastPcPointerDown.y);
      if (dist <= 6) return false;
      const sel = window.getSelection ? window.getSelection() : null;
      return Boolean(sel && !sel.isCollapsed && String(sel.toString() || "").trim().length > 0);
    }

    async function addUnheardMeikyokuToListening(aid, rawSongTitle) {
      const resolvedAid = resolveToAid(aid);
      if (!resolvedAid) return false;
      const artist = AID_TO_ARTIST.get(resolvedAid);
      if (!artist) return false;
      let cleanTitle = String(rawSongTitle || "").replace(/[\r\n\t]+/g, " ").trim();
      if (!cleanTitle) return false;
      if (SONG_RENAME_MAP[cleanTitle]) {
        cleanTitle = SONG_RENAME_MAP[cleanTitle];
      }
      if (isSongInArtistListeningList(artist, cleanTitle)) return false;
      const key = makeSongKey(resolvedAid, cleanTitle);
      if (!key) return false;

      if (favQuickEditMode) {
        pushEditHistorySnapshot();
      }
      customAddedSongSet.add(key);
      syncCustomSongsIntoArchiveData();

      renderStaticStats();
      applyFilterAndSort();
      renderArtistList(false);
      if (state.selectedArtistName === artist.name) {
        renderDetailPanel(false);
      }

      if (favQuickEditMode) {
        saveUnsavedDraft();
        updateFavEditBannerStatus();
      } else {
        const nextCustom = getSortedCurrentCustomSongs();
        serverCustomSongs = [...nextCustom];
        editSessionBaseCustomSongs = [...nextCustom];
        saveFavServerCache(serverFavIds, serverSongFavs, serverCustomSongs, serverVersion, new Date().toISOString());
        try {
          const resp = await fetch(FAV_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Calpis-Client": "archive-v1",
              "X-Calpis-Edit-Intent": "1"
            },
            body: JSON.stringify({
              action: "save",
              ids: getSortedCurrentAids(),
              songFavs: getSortedCurrentSongFavs(),
              customSongs: nextCustom,
              baseVersion: serverVersion,
              forceOverwrite: true,
              clientRequestId: `mk_add_${Date.now()}`
            }),
            cache: "no-store"
          });
          const data = await resp.json().catch(() => null);
          if (resp && resp.ok && data && data.ok) {
            if (typeof data.version === "number") {
              serverVersion = data.version;
              editSessionBaseVersion = serverVersion;
            }
            saveFavServerCache(serverFavIds, serverSongFavs, serverCustomSongs, serverVersion, data.updatedAt);
          }
        } catch (_e) {}
      }
      const toastEl = document.getElementById("favSyncToast");
      if (toastEl) {
        toastEl.textContent = `「${cleanTitle}」を ${artist.name} の聴いてる曲に追加しました`;
        toastEl.classList.remove("toast-warn");
        toastEl.classList.add("show");
        setTimeout(() => toastEl.classList.remove("show"), 2600);
      }
      return true;
    }

    listContainer.addEventListener("click", e => {
      if (suppressNextRowClick || e.target.closest("[data-drag-handle]")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const addMeikyokuBtn = e.target.closest("[data-add-meikyoku-aid]");
      if (addMeikyokuBtn) {
        e.preventDefault();
        e.stopPropagation();
        const targetAid = addMeikyokuBtn.getAttribute("data-add-meikyoku-aid") || "";
        const targetTitle = addMeikyokuBtn.getAttribute("data-add-meikyoku-title") || "";
        if (targetAid && targetTitle) {
          addUnheardMeikyokuToListening(targetAid, targetTitle);
        }
        return;
      }
      if (isPcTextSelectionDrag(e)) {
        return;
      }
      const backSameSongBtn = e.target.closest("[data-back-to-same-song-list]");
      if (backSameSongBtn) {
        e.preventDefault();
        pushHistorySnapshot(false);
        state.exactCanonicalSongKey = "";
        state.exactCanonicalSongTitle = "";
        state.searchQuery = "";
        const inp = document.getElementById("mainSearchInput");
        const clr = document.getElementById("clearSearchBtn");
        if (inp) inp.value = "";
        if (clr) clr.style.display = "none";
        updateUI(true);
        return;
      }
      const sameSongGroupRow = e.target.closest(".same-song-group-row[data-canonical-song-key]");
      if (sameSongGroupRow) {
        e.preventDefault();
        const cKey = sameSongGroupRow.getAttribute("data-canonical-song-key") || "";
        const cTitle = sameSongGroupRow.getAttribute("data-canonical-song-title") || "";
        if (cKey) {
          pushHistorySnapshot(false);
          state.exactCanonicalSongKey = cKey;
          state.exactCanonicalSongTitle = cTitle;
          state.searchQuery = cTitle;
          const inp = document.getElementById("mainSearchInput");
          const clr = document.getElementById("clearSearchBtn");
          if (inp) inp.value = cTitle;
          if (clr) clr.style.display = "flex";
          updateUI(true);
        }
        return;
      }
      const grpCard = e.target.closest("[data-select-search-group]");
      if (grpCard) {
        applySearchGroupFilter(
          grpCard.getAttribute("data-select-search-group-type"),
          grpCard.getAttribute("data-select-search-group")
        );
        return;
      }
      const recTabBtn = e.target.closest("[data-recommend-tab]");
      if (recTabBtn) {
        const nextTab = recTabBtn.getAttribute("data-recommend-tab") || "artist";
        if (state.recommendTab !== nextTab) {
          state.recommendTab = nextTab;
          updateUI(false);
        }
        return;
      }
      const row = e.target.closest(".artist-row");
      if (!row) return;
      if (row.classList.contains("composer-row")) {
        const compName = row.getAttribute("data-composer-name");
        if (compName) {
          if (window.innerWidth <= 900) {
            row.classList.add("mob-tap-active");
            setTimeout(() => {
              row.classList.remove("mob-tap-active");
              selectComposer(compName);
            }, 55);
          } else {
            selectComposer(compName);
          }
        }
        return;
      }
      const name = row.getAttribute("data-artist-name");
      const recSongTitle = row.getAttribute("data-rec-song-title");

      if (favQuickEditMode) {
        // 1) Song row in "かるのオススメ" -> "楽曲" tab (`.recommend-song-row` / `recSongTitle`):
        //    - Clicking the avatar icon must do nothing.
        //    - Clicking anywhere else on the row (song title / wide non-avatar area) removes the heart (if same grade selected) or switches to the selected heart grade, without opening Artist Detail!
        if (row.classList.contains("recommend-song-row") || recSongTitle) {
          e.preventDefault();
          e.stopPropagation();
          if (e.target.closest(".row-avatar-wrap")) {
            return;
          }
          const aObj = ARTIST_MAP.get(name);
          if (aObj && aObj.aid && recSongTitle) {
            toggleRecommendedSong(aObj.aid, recSongTitle);
          }
          return;
        }

        // 2) Song-matched row in "すべて検索" or "楽曲を検索":
        //    - Clicking the avatar icon must NOT heart the artist.
        //    - Clicking anywhere else on the row (the song title / non-avatar area) toggles/switches the song heart!
        if (row.classList.contains("song-matched-row")) {
          e.preventDefault();
          e.stopPropagation();
          if (e.target.closest(".row-avatar-wrap")) {
            return;
          }
          const aObj = ARTIST_MAP.get(name);
          const tokenEl = e.target.closest("[data-matched-song-title]");
          const targetSong = (tokenEl && tokenEl.getAttribute("data-matched-song-title")) || row.getAttribute("data-primary-song");
          if (aObj && aObj.aid && targetSong) {
            toggleRecommendedSong(aObj.aid, targetSong);
          }
          return;
        }

        // 3) Normal artist row or "かるのオススメ" -> "アーティスト" row -> tapping the circular avatar toggles/switches artist ❤
        if (e.target.closest(".row-avatar-wrap")) {
          e.preventDefault();
          e.stopPropagation();
          toggleRecommendedArtist(name);
          return;
        }
      }

      if (window.innerWidth <= 900) {
        row.classList.add("mob-tap-active");
        setTimeout(() => {
          row.classList.remove("mob-tap-active");
          selectArtist(name);
        }, 55);
      } else {
        selectArtist(name);
      }
    });
    listContainer.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        const row = e.target.closest(".artist-row");
        if (!row) return;
        e.preventDefault();
        if (row.classList.contains("composer-row")) {
          selectComposer(row.getAttribute("data-composer-name"));
        } else {
          selectArtist(row.getAttribute("data-artist-name"));
        }
      }
    });

    // Infinite smooth chunk rendering on scroll using DocumentFragment append
    const scrollEl = document.getElementById("centerScrollArea");
    scrollEl.addEventListener("scroll", () => {
      const activeTotal = getActiveRenderListLength();
      if (state.view === "recommend" || state.renderLimit >= activeTotal) return;
      if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 420) {
        const prevLimit = state.renderLimit;
        state.renderLimit = Math.min(activeTotal, state.renderLimit + 100);
        appendArtistRows(prevLimit, state.renderLimit);
      }
    }, { passive: true });

    // Detail panel close, mode toggle (TOP 5 <-> かるが聴いてる曲), & song sort toggle
    document.getElementById("closeDetailBtn").addEventListener("click", closeDetailPanel);

    // =========================================================================
    // V59: LONG-PRESS HEART DELETE CONFIRMATION MODAL (IN EDIT MODE)
    // =========================================================================
    const heartDeleteModal = document.getElementById("heartDeleteConfirmModal");
    const heartDeleteTargetEl = document.getElementById("heartDeleteConfirmTarget");
    const confirmHeartDeleteBtn = document.getElementById("confirmHeartDeleteBtn");
    const cancelHeartDeleteBtn = document.getElementById("cancelHeartDeleteBtn");
    let pendingHeartDelete = null; // { type: "artist" | "song", aid, name, songTitle }
    let longPressTimer = null;
    let longPressStartPos = { x: 0, y: 0 };

    function openHeartDeleteConfirmModal(targetInfo) {
      if (!favQuickEditMode || !heartDeleteModal || !targetInfo) return;
      pendingHeartDelete = targetInfo;
      if (heartDeleteTargetEl) {
        heartDeleteTargetEl.textContent = targetInfo.type === "song"
          ? `♪ ${targetInfo.songTitle}（${targetInfo.name || ""}）`
          : `${targetInfo.name}`;
      }
      heartDeleteModal.classList.add("open");
      heartDeleteModal.setAttribute("aria-hidden", "false");
    }

    function closeHeartDeleteConfirmModal() {
      pendingHeartDelete = null;
      if (!heartDeleteModal) return;
      heartDeleteModal.classList.remove("open");
      heartDeleteModal.setAttribute("aria-hidden", "true");
    }

    if (cancelHeartDeleteBtn) {
      cancelHeartDeleteBtn.addEventListener("click", closeHeartDeleteConfirmModal);
    }
    if (heartDeleteModal) {
      heartDeleteModal.addEventListener("click", e => {
        if (e.target === heartDeleteModal) closeHeartDeleteConfirmModal();
      });
    }
    if (confirmHeartDeleteBtn) {
      confirmHeartDeleteBtn.addEventListener("click", () => {
        if (!pendingHeartDelete) return;
        const info = pendingHeartDelete;
        closeHeartDeleteConfirmModal();
        if (info.type === "song") {
          removeRecommendedSong(info.aid, info.songTitle);
        } else if (info.type === "artist") {
          removeRecommendedArtist(info.aid || info.name);
        }
      });
    }

    // Expose programmatic helper for opening long-press delete modal from tests/UI
    window.__openHeartDeleteModalForTarget = openHeartDeleteConfirmModal;

    function resolveLongPressHeartTarget(targetEl) {
      if (!favQuickEditMode || !targetEl) return null;
      if (targetEl.closest("[data-drag-handle]")) return null;

      // 1) Detail panel song item
      const detailSongItem = targetEl.closest("#detailScrollContent .detail-song-item[data-song-title]");
      if (detailSongItem) {
        const aid = detailSongItem.getAttribute("data-artist-aid");
        const sTitle = detailSongItem.getAttribute("data-song-title");
        if (aid && sTitle && isRecommendedSong(aid, sTitle)) {
          return { type: "song", aid, name: resolveAidToName(aid) || "", songTitle: sTitle };
        }
        return null;
      }

      // 2) Detail panel artist hero avatar/name
      const detailHeroTarget = targetEl.closest("#detailScrollContent .detail-avatar-wrap, #detailScrollContent .detail-artist-name");
      if (detailHeroTarget && state.selectedArtistName) {
        const aid = resolveToAid(state.selectedArtistName);
        if (aid && recommendedAidMap.has(aid)) {
          return { type: "artist", aid, name: state.selectedArtistName };
        }
        return null;
      }

      // 3) List row in #artistListContainer
      const row = targetEl.closest("#artistListContainer .artist-row");
      if (!row) return null;
      const name = row.getAttribute("data-artist-name") || "";
      const aid = row.getAttribute("data-artist-aid") || resolveToAid(name);
      const recSongTitle = row.getAttribute("data-rec-song-title");

      if (row.classList.contains("recommend-song-row") || recSongTitle) {
        if (targetEl.closest(".row-avatar-wrap")) return null;
        if (aid && recSongTitle && isRecommendedSong(aid, recSongTitle)) {
          return { type: "song", aid, name, songTitle: recSongTitle };
        }
        return null;
      }

      if (row.classList.contains("song-matched-row")) {
        if (targetEl.closest(".row-avatar-wrap")) return null;
        const tok = targetEl.closest("[data-matched-song-title]");
        const sTitle = (tok && tok.getAttribute("data-matched-song-title")) || row.getAttribute("data-primary-song");
        if (aid && sTitle && isRecommendedSong(aid, sTitle)) {
          return { type: "song", aid, name, songTitle: sTitle };
        }
        return null;
      }

      if (targetEl.closest(".row-avatar-wrap")) {
        if (aid && recommendedAidMap.has(aid)) {
          return { type: "artist", aid, name };
        }
      }
      return null;
    }

    function cancelEditLongPress() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }

    function startEditLongPress(targetEl, clientX, clientY) {
      cancelEditLongPress();
      const info = resolveLongPressHeartTarget(targetEl);
      if (!info) return;
      longPressStartPos = { x: clientX || 0, y: clientY || 0 };
      longPressTimer = setTimeout(() => {
        longPressTimer = null;
        suppressNextRowClick = true;
        setTimeout(() => { suppressNextRowClick = false; }, 350);
        openHeartDeleteConfirmModal(info);
      }, 420);
    }

    document.addEventListener("pointerdown", e => {
      if (!favQuickEditMode || e.button === 2) return;
      startEditLongPress(e.target, e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener("pointermove", e => {
      if (!longPressTimer) return;
      const dist = Math.hypot((e.clientX || 0) - longPressStartPos.x, (e.clientY || 0) - longPressStartPos.y);
      if (dist > 10) cancelEditLongPress();
    }, { passive: true });

    document.addEventListener("pointerup", cancelEditLongPress, { passive: true });
    document.addEventListener("pointercancel", cancelEditLongPress, { passive: true });

    document.addEventListener("contextmenu", e => {
      if (!favQuickEditMode) return;
      const info = resolveLongPressHeartTarget(e.target);
      if (info) {
        e.preventDefault();
        e.stopPropagation();
        cancelEditLongPress();
        openHeartDeleteConfirmModal(info);
      }
    });

    // =========================================================================
    // V59: ABOUT MODAL + SEND MESSAGE MODAL + SECRET 5-TAP OWNER INBOX MODAL
    // =========================================================================
    const LOCAL_MESSAGES_FALLBACK_KEY = "calpis_local_messages_v1";
    function loadLocalFallbackMessages() {
      try {
        const raw = localStorage.getItem(LOCAL_MESSAGES_FALLBACK_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (_e) {
        return [];
      }
    }
    function saveLocalFallbackMessages(arr) {
      try {
        localStorage.setItem(LOCAL_MESSAGES_FALLBACK_KEY, JSON.stringify(Array.isArray(arr) ? arr.slice(0, 200) : []));
      } catch (_e) {}
    }

    const aboutModal = document.getElementById("aboutSiteModal");
    const openAboutModal = () => {
      if (!aboutModal) return;
      aboutModal.classList.add("open");
      aboutModal.setAttribute("aria-hidden", "false");
    };
    const closeAboutModal = () => {
      if (!aboutModal) return;
      aboutModal.classList.remove("open");
      aboutModal.setAttribute("aria-hidden", "true");
    };
    const mobAboutBtn = document.getElementById("mobAboutBtn");
    if (mobAboutBtn) mobAboutBtn.addEventListener("click", openAboutModal);
    const pcAboutBtn = document.getElementById("pcAboutBtn");
    if (pcAboutBtn) pcAboutBtn.addEventListener("click", openAboutModal);
    const closeAboutBtn = document.getElementById("closeAboutModalBtn");
    if (closeAboutBtn) closeAboutBtn.addEventListener("click", closeAboutModal);
    if (aboutModal) {
      aboutModal.addEventListener("click", e => {
        if (e.target === aboutModal) closeAboutModal();
      });
    }
    const openRecommendFromAbout = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeAboutModal();
      pushHistorySnapshot(false);
      if (window.innerWidth <= 900) {
        state.selectedArtistName = null;
      }
      state.view = "recommend";
      state.unitGroup = "";
      state.agencyGroup = "";
      state.pcFilterOpen = false;
      state.mobFilterOpen = false;
      updateUI(true);
    };
    const aboutOpenRecRow = document.getElementById("aboutOpenRecommendRow");
    if (aboutOpenRecRow) {
      aboutOpenRecRow.addEventListener("click", openRecommendFromAbout);
      aboutOpenRecRow.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") openRecommendFromAbout(e);
      });
    }

    // Send Message Modal handlers
    const sendMessageModal = document.getElementById("sendMessageModal");
    const visitorMessageInput = document.getElementById("visitorMessageInput");
    const visitorMessageStatus = document.getElementById("visitorMessageStatus");
    const submitVisitorMessageBtn = document.getElementById("submitVisitorMessageBtn");
    const closeSendMessageModalBtn = document.getElementById("closeSendMessageModalBtn");

    function openSendMessageModal() {
      if (!sendMessageModal) return;
      if (visitorMessageInput) visitorMessageInput.value = "";
      if (visitorMessageStatus) visitorMessageStatus.textContent = "";
      sendMessageModal.classList.add("open");
      sendMessageModal.setAttribute("aria-hidden", "false");
      setTimeout(() => {
        if (visitorMessageInput) visitorMessageInput.focus();
      }, 40);
    }

    function closeSendMessageModal() {
      if (!sendMessageModal) return;
      sendMessageModal.classList.remove("open");
      sendMessageModal.setAttribute("aria-hidden", "true");
      if (visitorMessageInput) visitorMessageInput.value = "";
      if (visitorMessageStatus) visitorMessageStatus.textContent = "";
    }

    const mobMessageBtn = document.getElementById("mobMessageBtn");
    if (mobMessageBtn) mobMessageBtn.addEventListener("click", openSendMessageModal);
    const pcMessageBtn = document.getElementById("pcMessageBtn");
    if (pcMessageBtn) pcMessageBtn.addEventListener("click", openSendMessageModal);
    if (closeSendMessageModalBtn) closeSendMessageModalBtn.addEventListener("click", closeSendMessageModal);
    if (sendMessageModal) {
      sendMessageModal.addEventListener("click", e => {
        if (e.target === sendMessageModal) closeSendMessageModal();
      });
    }

    if (submitVisitorMessageBtn) {
      submitVisitorMessageBtn.addEventListener("click", async () => {
        const text = visitorMessageInput ? visitorMessageInput.value.trim() : "";
        if (!text) {
          if (visitorMessageStatus) visitorMessageStatus.textContent = "メッセージを入力してください。";
          return;
        }
        submitVisitorMessageBtn.disabled = true;
        submitVisitorMessageBtn.textContent = "送信中...";
        if (visitorMessageStatus) visitorMessageStatus.textContent = "";

        const msgObj = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          text,
          createdAt: new Date().toISOString()
        };
        const localMsgs = loadLocalFallbackMessages();
        saveLocalFallbackMessages([msgObj, ...localMsgs]);

        try {
          await fetch(FAV_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Calpis-Client": "archive-v1",
              "X-Calpis-Edit-Intent": "1"
            },
            body: JSON.stringify({
              action: "send_message",
              message: text
            }),
            cache: "no-store"
          });
        } catch (_e) {}

        // Clear immediately so no message remains on screen
        if (visitorMessageInput) visitorMessageInput.value = "";
        submitVisitorMessageBtn.disabled = false;
        submitVisitorMessageBtn.textContent = "送る";
        if (visitorMessageStatus) {
          visitorMessageStatus.textContent = "かるへ送信しました！ありがとうございます。";
        }
      });
    }

    // Owner-only Secret 5-Tap on "？ 当サイトについて" modal title (#aboutSiteModalTitleWrap)
    const ownerInboxModal = document.getElementById("ownerMessagesInboxModal");
    const ownerInboxListEl = document.getElementById("ownerMessagesInboxList");
    const closeOwnerInboxModalBtn = document.getElementById("closeOwnerInboxModalBtn");
    const aboutTitleWrapEl = document.getElementById("aboutSiteModalTitleWrap");
    let aboutTitleTapTimes = [];

    function formatInboxTimestamp(isoStr) {
      if (!isoStr) return "";
      try {
        const d = new Date(isoStr);
        if (Number.isNaN(d.getTime())) return isoStr;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${y}/${m}/${day} ${hh}:${mm}`;
      } catch (_e) {
        return isoStr;
      }
    }

    function renderOwnerInboxMessages(messages) {
      if (!ownerInboxListEl) return;
      if (!Array.isArray(messages) || messages.length === 0) {
        ownerInboxListEl.innerHTML = `<div class="owner-inbox-empty">届いているメッセージはまだありません。</div>`;
        return;
      }
      ownerInboxListEl.innerHTML = messages.map(m => `
        <div class="owner-inbox-item" data-message-id="${esc(m.id || "")}">
          <div class="owner-inbox-item-top">
            <span class="owner-inbox-time">${esc(formatInboxTimestamp(m.createdAt))}</span>
            <button type="button" class="owner-inbox-del-btn" data-delete-message-id="${esc(m.id || "")}" title="このメッセージを削除">削除</button>
          </div>
          <div class="owner-inbox-text">${esc(m.text || "")}</div>
        </div>
      `).join("");
    }

    async function openOwnerMessagesInboxModal() {
      closeAboutModal();
      if (!ownerInboxModal) return;
      ownerInboxModal.classList.add("open");
      ownerInboxModal.setAttribute("aria-hidden", "false");
      const localList = loadLocalFallbackMessages();
      renderOwnerInboxMessages(localList);

      try {
        const resp = await fetch(`${FAV_API_ENDPOINT}?messages=1&_t=${Date.now()}`, {
          method: "GET",
          headers: { "Accept": "application/json" },
          cache: "no-store"
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data && Array.isArray(data.messages)) {
            const seen = new Set();
            const merged = [];
            [...data.messages, ...localList].forEach(m => {
              if (m && m.text && !seen.has(m.id || m.text)) {
                seen.add(m.id || m.text);
                merged.push(m);
              }
            });
            renderOwnerInboxMessages(merged);
          }
        }
      } catch (_e) {}
    }

    function closeOwnerMessagesInboxModal() {
      if (!ownerInboxModal) return;
      ownerInboxModal.classList.remove("open");
      ownerInboxModal.setAttribute("aria-hidden", "true");
    }

    if (aboutTitleWrapEl) {
      aboutTitleWrapEl.addEventListener("click", () => {
        const now = Date.now();
        aboutTitleTapTimes = aboutTitleTapTimes.filter(t => now - t <= 1500);
        aboutTitleTapTimes.push(now);
        if (aboutTitleTapTimes.length >= 5) {
          aboutTitleTapTimes = [];
          openOwnerMessagesInboxModal();
        }
      });
    }

    if (closeOwnerInboxModalBtn) {
      closeOwnerInboxModalBtn.addEventListener("click", closeOwnerMessagesInboxModal);
    }
    if (ownerInboxModal) {
      ownerInboxModal.addEventListener("click", e => {
        if (e.target === ownerInboxModal) closeOwnerMessagesInboxModal();
      });
    }
    if (ownerInboxListEl) {
      ownerInboxListEl.addEventListener("click", async e => {
        const delBtn = e.target.closest("[data-delete-message-id]");
        if (!delBtn) return;
        const msgId = delBtn.getAttribute("data-delete-message-id");
        if (!msgId) return;
        const filteredLocal = loadLocalFallbackMessages().filter(m => m && m.id !== msgId);
        saveLocalFallbackMessages(filteredLocal);
        const itemEl = delBtn.closest(".owner-inbox-item");
        if (itemEl) itemEl.remove();
        if (!ownerInboxListEl.querySelector(".owner-inbox-item")) {
          renderOwnerInboxMessages([]);
        }
        try {
          await fetch(FAV_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Calpis-Client": "archive-v1",
              "X-Calpis-Edit-Intent": "1"
            },
            body: JSON.stringify({
              action: "delete_message",
              messageId: msgId
            }),
            cache: "no-store"
          });
        } catch (_e) {}
      });
    }
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && aboutModal && aboutModal.classList.contains("open")) {
        closeAboutModal();
      }
    });
    // Bind Undo / Redo buttons and Profile Top-Left Back Button
    document.querySelectorAll('[data-history-action="undo"]').forEach(btn => {
      btn.addEventListener("click", undoStateAction);
    });
    document.querySelectorAll('[data-history-action="redo"]').forEach(btn => {
      btn.addEventListener("click", redoStateAction);
    });
    const detailBackBtn = document.getElementById("detailBackBtn");
    if (detailBackBtn) {
      detailBackBtn.addEventListener("click", undoStateAction);
    }



    // =========================================================================
    // V49: OWNER-ONLY EDIT MODE CONTROLLER (Artists ❤ + Songs ❤ + Manual Song Add)
    // =========================================================================
    let favToastTimer = null;
    function showOwnerFavToast(message, isWarn = false, durationMs = 3200) {
      const toastEl = document.getElementById("favSyncToast");
      if (!toastEl) return;
      toastEl.textContent = message;
      toastEl.classList.toggle("toast-warn", Boolean(isWarn));
      toastEl.classList.add("show");
      if (favToastTimer) clearTimeout(favToastTimer);
      favToastTimer = setTimeout(() => {
        toastEl.classList.remove("show");
      }, durationMs);
    }

    function computeDiffCounts(baseArr, currentArr) {
      const bArr = Array.isArray(baseArr) ? baseArr : [];
      const cArr = Array.isArray(currentArr) ? currentArr : [];
      const baseSet = new Set(bArr);
      const curSet = new Set(cArr);
      const added = [];
      const removed = [];
      curSet.forEach(x => {
        if (!baseSet.has(x)) added.push(x);
      });
      baseSet.forEach(x => {
        if (!curSet.has(x)) removed.push(x);
      });
      // Check if shared items changed their relative order even when items were also added/removed
      const commonBase = bArr.filter(x => curSet.has(x));
      const commonCur = cArr.filter(x => baseSet.has(x));
      const orderChanged = !areStringArraysEqual(commonBase, commonCur);
      return { added, removed, orderChanged, hasChanges: added.length > 0 || removed.length > 0 || orderChanged };
    }

    function computeEffectiveArtistHeartChanges() {
      const curMap = captureEffectiveArtistTierMap();
      let changedCount = 0;
      const allAids = new Set([...editSessionBaseEffectiveMap.keys(), ...curMap.keys()]);
      allAids.forEach(aid => {
        const bTier = editSessionBaseEffectiveMap.get(aid) || 0;
        const cTier = curMap.get(aid) || 0;
        if (bTier !== cTier) changedCount++;
      });
      return changedCount;
    }

    updateFavEditBannerStatus = function() {
      const diffBadge = document.getElementById("favQeDiffBadge");
      const discardBtn = document.getElementById("discardFavQuickEditBtn");
      const exitBtn = document.getElementById("exitFavQuickEditBtn");

      const curIds = getSortedCurrentAids();
      const curSongs = getSortedCurrentSongFavs();
      const curCustom = getSortedCurrentCustomSongs();

      const dIds = computeDiffCounts(editSessionBaseIds, curIds);
      const dSongs = computeDiffCounts(editSessionBaseSongFavs, curSongs);
      const dCustom = computeDiffCounts(editSessionBaseCustomSongs, curCustom);
      const effArtistChanges = computeEffectiveArtistHeartChanges();
      const songItemChanges = dSongs.added.length + dSongs.removed.length;
      const customSongChanges = dCustom.added.length + dCustom.removed.length;
      const fallbackOrderCount = (dIds.orderChanged ? 1 : 0) + (dSongs.orderChanged ? 1 : 0);
      const reorderCount = Math.max(manualReorderCount, fallbackOrderCount);
      const totalChanges = effArtistChanges + songItemChanges + customSongChanges + reorderCount;
      const anyChanged = totalChanges > 0 || dIds.hasChanges || dSongs.hasChanges || dCustom.hasChanges;

      if (diffBadge) {
        if (!anyChanged) {
          diffBadge.textContent = "変更なし";
          diffBadge.classList.remove("has-changes");
        } else {
          const shownCount = Math.max(1, totalChanges);
          diffBadge.textContent = `未保存の変更: ${shownCount}件`;
          diffBadge.classList.add("has-changes");
        }
      }
      if (discardBtn) {
        discardBtn.style.display = anyChanged && !isSavingFavorites ? "inline-flex" : "none";
      }
      if (exitBtn && !isSavingFavorites) {
        exitBtn.disabled = false;
        exitBtn.textContent = "完了して閉じる";
      }
    }

    function hideFavEditError() {
      const errRow = document.getElementById("favQeErrorRow");
      if (errRow) errRow.style.display = "none";
    }

    function showFavEditError(msg) {
      const errRow = document.getElementById("favQeErrorRow");
      const errMsg = document.getElementById("favQeErrorMsg");
      if (errMsg) errMsg.textContent = msg || "サーバーへの保存に失敗しました。変更内容は端末内に保持されています。";
      if (errRow) errRow.style.display = "flex";
    }

    function enterFavQuickEditMode() {
      // Permanently exclude this owner browser from Vercel Web Analytics
      permanentlyExcludeOwnerFromAnalytics();
      if (favQuickEditMode) return;
      manualReorderCount = 0;
      clearUnsavedDraft();
      editSessionBaseIds = hasFetchedServerOnce ? [...serverFavIds] : getSortedCurrentAids();
      editSessionBaseSongFavs = hasFetchedServerOnce ? [...serverSongFavs] : getSortedCurrentSongFavs();
      editSessionBaseCustomSongs = hasFetchedServerOnce ? [...serverCustomSongs] : getSortedCurrentCustomSongs();
      editSessionBaseVersion = serverVersion;

      editSessionBaseEffectiveMap = captureEffectiveArtistTierMap();
      favQuickEditMode = true;
      activeHeartTier = 3;
      editUndoStack.length = 0;
      editRedoStack.length = 0;
      hideFavEditError();
      document.body.classList.add("fav-quick-edit-mode");
      syncActiveHeartTierUI();
      syncHistoryButtons();

      // Automatically switch open detail panel to "かるが聴いてる曲" ("archive") so song hearting & manual song addition are immediately accessible!
      if (state.selectedArtistName) {
        state.detailMode = "archive";
        renderDetailPanel(false);
      }

      updateFavEditBannerStatus();
      applySilentFavoritesDOMUpdate();

      fetchServerFavorites({ silent: true, fresh: true });
    }

    function closeFavQuickEditModeCleanly() {
      favQuickEditMode = false;
      isSavingFavorites = false;
      editUndoStack.length = 0;
      editRedoStack.length = 0;
      hideFavEditError();
      document.body.classList.remove("fav-quick-edit-mode");
      renderDetailPanel(false);
      updateFavEditBannerStatus();
      syncHistoryButtons();
    }

    // Save changes to server ONLY when pressing 「完了して閉じる」
    async function saveFavoritesToServer(options = {}) {
      if (isSavingFavorites) return;
      const forceOverwrite = options.forceOverwrite !== undefined ? Boolean(options.forceOverwrite) : true;
      const targetIds = Array.isArray(options.customIds) ? [...options.customIds] : getSortedCurrentAids();
      const targetSongFavs = Array.isArray(options.customSongFavs) ? [...options.customSongFavs] : getSortedCurrentSongFavs();
      const targetCustomSongs = Array.isArray(options.customAddedSongs) ? [...options.customAddedSongs].sort() : getSortedCurrentCustomSongs();
      const customBaseVersion = typeof options.customBaseVersion === "number" ? options.customBaseVersion : editSessionBaseVersion;

      const noDiffFromSession = (
        manualReorderCount === 0 &&
        areStringArraysEqual(targetIds, editSessionBaseIds) &&
        areStringArraysEqual(targetSongFavs, editSessionBaseSongFavs) &&
        areStringArraysEqual(targetCustomSongs, editSessionBaseCustomSongs)
      );
      const noDiffFromServer = !hasFetchedServerOnce || (
        manualReorderCount === 0 &&
        areStringArraysEqual(targetIds, serverFavIds) &&
        areStringArraysEqual(targetSongFavs, serverSongFavs) &&
        areStringArraysEqual(targetCustomSongs, serverCustomSongs)
      );

      if (!options.forceOverwrite && noDiffFromSession && noDiffFromServer) {
        clearUnsavedDraft();
        closeFavQuickEditModeCleanly();
        return;
      }

      isSavingFavorites = true;
      hideFavEditError();
      const exitBtn = document.getElementById("exitFavQuickEditBtn");
      const discardBtn = document.getElementById("discardFavQuickEditBtn");
      if (exitBtn) {
        exitBtn.disabled = true;
        exitBtn.textContent = "保存中...";
      }
      if (discardBtn) discardBtn.style.display = "none";

      const clientRequestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      try {
        const resp = await fetch(FAV_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Calpis-Client": "archive-v1",
            "X-Calpis-Edit-Intent": "1"
          },
          body: JSON.stringify({
            action: "save",
            ids: targetIds,
            songFavs: targetSongFavs,
            customSongs: targetCustomSongs,
            baseVersion: customBaseVersion,
            forceOverwrite,
            clientRequestId
          }),
          cache: "no-store"
        });

        const data = await resp.json().catch(() => null);

        if (!resp.ok || !data || !data.ok) {
          const errMsg = (data && data.message)
            ? data.message
            : `サーバー保存エラー (HTTP ${resp.status})。変更内容は維持されています。`;
          throw new Error(errMsg);
        }

        serverFavIds = [...targetIds];
        serverSongFavs = [...targetSongFavs];
        saveFavOrderMemory(serverFavIds, serverSongFavs);
        serverCustomSongs = Array.isArray(data.customSongs) ? normalizeSongKeyArray(data.customSongs) : targetCustomSongs;
        serverVersion = typeof data.version === "number" ? data.version : (customBaseVersion + 1);
        hasFetchedServerOnce = true;

        manualReorderCount = 0;
        editSessionBaseIds = [...serverFavIds];
        editSessionBaseSongFavs = [...serverSongFavs];
        editSessionBaseCustomSongs = [...serverCustomSongs];
        editSessionBaseVersion = serverVersion;
        editSessionBaseEffectiveMap = captureEffectiveArtistTierMap();

        setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
        saveFavServerCache(serverFavIds, serverSongFavs, serverCustomSongs, serverVersion, data.updatedAt);
        clearUnsavedDraft();

        try {
          const rawLegacy = localStorage.getItem(RECOMMENDED_STORAGE_KEY);
          if (rawLegacy && !localStorage.getItem(RECOMMENDED_BACKUP_KEY)) {
            localStorage.setItem(RECOMMENDED_BACKUP_KEY, rawLegacy);
          }
          localStorage.setItem(FAV_MIGRATION_STATE_KEY, "migrated");
        } catch (e) {}

        closeFavQuickEditModeCleanly();
        applySilentFavoritesDOMUpdate();
        showOwnerFavToast(`設定をサーバーに保存しました（名義:${serverFavIds.length} / 曲♥:${serverSongFavs.length}）`);
      } catch (err) {
        isSavingFavorites = false;
        saveUnsavedDraft();
        updateFavEditBannerStatus();
        const exitBtnRetry = document.getElementById("exitFavQuickEditBtn");
        if (exitBtnRetry) {
          exitBtnRetry.disabled = false;
          exitBtnRetry.textContent = "再試行して保存";
        }
        showFavEditError(err && err.message ? err.message : "通信エラーのため保存できませんでした。変更内容は保持されています。");
      }
    }

    // Background fetch of shared favorites & custom songs (completely silent for general visitors)
    async function fetchServerFavorites(options = {}) {
      const fresh = Boolean(options.fresh);
      lastServerFetchAt = Date.now();
      const url = `${FAV_API_ENDPOINT}?_t=${Date.now()}${fresh ? "&fresh=1" : ""}`;

      try {
        const resp = await fetch(url, {
          method: "GET",
          headers: { "Accept": "application/json" },
          cache: "no-store"
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (!data || !data.ok) return;

        const rawFetchedIds = normalizeArtistIdWithTierArray(data.ids);
        const rawFetchedSongFavs = normalizeSongFavWithTierArray(data.songFavs);
        const fetchedIds = rawFetchedIds;
        const fetchedSongFavs = rawFetchedSongFavs;
        if (fetchedIds.length > 0 || fetchedSongFavs.length > 0) {
          saveFavOrderMemory(fetchedIds, fetchedSongFavs);
        }
        const fetchedCustomSongs = normalizeSongKeyArray(data.customSongs);
        const fetchedVersion = typeof data.version === "number" ? data.version : 0;
        serverConfigured = data.configured !== false;
        hasFetchedServerOnce = true;

        serverFavIds = fetchedIds;
        serverSongFavs = fetchedSongFavs;
        serverCustomSongs = fetchedCustomSongs;
        serverVersion = fetchedVersion;
        saveFavServerCache(serverFavIds, serverSongFavs, serverCustomSongs, serverVersion, data.updatedAt);

        if (favQuickEditMode) {
          if (!hasAnyEditChanges()) {
            if (serverVersion > 0) {
              editSessionBaseIds = [...serverFavIds];
              editSessionBaseSongFavs = [...serverSongFavs];
              editSessionBaseCustomSongs = [...serverCustomSongs];
              editSessionBaseVersion = serverVersion;
              setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
              renderDetailPanel(false);
              applySilentFavoritesDOMUpdate();
            }
            updateFavEditBannerStatus();
          }
          return;
        }

        if (serverVersion > 0) {
          const changed = (
            !areStringArraysEqual(getSortedCurrentAids(), serverFavIds) ||
            !areStringArraysEqual(getSortedCurrentSongFavs(), serverSongFavs) ||
            !areStringArraysEqual(getSortedCurrentCustomSongs(), serverCustomSongs)
          );
          editSessionBaseIds = [...serverFavIds];
          editSessionBaseSongFavs = [...serverSongFavs];
          editSessionBaseCustomSongs = [...serverCustomSongs];
          editSessionBaseVersion = serverVersion;
          if (changed) {
            setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
            renderDetailPanel(false);
            applySilentFavoritesDOMUpdate();
          }
        }
      } catch (_err) {}
    }

    // Secret 5-tap on top-left logo (.brand-disc-icon or .mobile-top-left) within 1.5 seconds (1500ms)
    let secretLogoTapTimes = [];
    function handleSecretLogoTap() {
      const now = Date.now();
      secretLogoTapTimes = secretLogoTapTimes.filter(t => now - t <= 1500);
      secretLogoTapTimes.push(now);
      if (secretLogoTapTimes.length >= 5) {
        secretLogoTapTimes = [];
        if (!favQuickEditMode) {
          enterFavQuickEditMode();
        } else {
          saveFavoritesToServer();
        }
      }
    }
    const brandIconEl = document.querySelector(".brand-disc-icon");
    if (brandIconEl) brandIconEl.addEventListener("click", handleSecretLogoTap);
    const mobTopLeftEl = document.querySelector(".mobile-top-left");
    if (mobTopLeftEl) mobTopLeftEl.addEventListener("click", handleSecretLogoTap);

    // Heart tier selector tabs in Edit Mode banner (`最上位` / `第2` / `第1`)
    const favQeTierTabsEl = document.getElementById("favQeTierTabs");
    if (favQeTierTabsEl) {
      favQeTierTabsEl.addEventListener("click", e => {
        const tabBtn = e.target.closest("[data-select-heart-tier]");
        if (!tabBtn) return;
        const nextTier = Number(tabBtn.getAttribute("data-select-heart-tier")) || 3;
        if (nextTier === 1 || nextTier === 2 || nextTier === 3) {
          activeHeartTier = nextTier;
          syncActiveHeartTierUI();
          document.querySelectorAll("#detailScrollContent .song-edit-heart-indicator:not(.is-fav)").forEach(ind => {
            ind.innerHTML = HEART_SVG_SINGLE;
          });
        }
      });
    }

    // 「完了して閉じる」 button
    const exitFavQeBtn = document.getElementById("exitFavQuickEditBtn");
    if (exitFavQeBtn) {
      exitFavQeBtn.addEventListener("click", () => {
        saveFavoritesToServer();
      });
    }

    // 「取消」 button in edit banner
    const discardFavQeBtn = document.getElementById("discardFavQuickEditBtn");
    if (discardFavQeBtn) {
      discardFavQeBtn.addEventListener("click", () => {
        if (isSavingFavorites) return;
        manualReorderCount = 0;
        setAllSharedStates(editSessionBaseIds, editSessionBaseSongFavs, editSessionBaseCustomSongs);
        clearUnsavedDraft();
        closeFavQuickEditModeCleanly();
        applySilentFavoritesDOMUpdate();
        showOwnerFavToast("未保存の変更を取り消しました");
      });
    }

    const retryFavSaveBtn = document.getElementById("retryFavSaveBtn");
    if (retryFavSaveBtn) {
      retryFavSaveBtn.addEventListener("click", () => {
        saveFavoritesToServer();
      });
    }
    const closeKeepDraftBtn = document.getElementById("closeKeepDraftBtn");
    if (closeKeepDraftBtn) {
      closeKeepDraftBtn.addEventListener("click", () => {
        saveUnsavedDraft();
        setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
        closeFavQuickEditModeCleanly();
        applySilentFavoritesDOMUpdate();
      });
    }

    // Silent background fetch on startup + visibilitychange & gentle periodic check
    fetchServerFavorites({ isInitial: true });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && Date.now() - lastServerFetchAt > 15000) {
        fetchServerFavorites({ silent: true });
      }
    });
    window.addEventListener("focus", () => {
      if (Date.now() - lastServerFetchAt > 15000) {
        fetchServerFavorites({ silent: true });
      }
    });
    setInterval(() => {
      if (document.visibilityState === "visible" && !favQuickEditMode) {
        fetchServerFavorites({ silent: true });
      }
    }, 180000);

    document.getElementById("detailScrollContent").addEventListener("click", e => {
      if (isPcTextSelectionDrag(e)) {
        return;
      }
      const karuArtistSongsBtn = e.target.closest("[data-karu-artist-songs]");
      if (karuArtistSongsBtn && state.karuSpecialMode) {
        e.preventDefault();
        const targetName = karuArtistSongsBtn.getAttribute("data-karu-artist-songs") || "";
        const targetArtist = targetName ? ARTIST_MAP.get(targetName) : null;
        if (targetArtist) {
          pushHistorySnapshot(true);
          state.view = "search";
          state.searchTarget = "song";
          state.searchScope = "all";
          state.searchQuery = targetArtist.name;
          state.exactArtistSongsAid = targetArtist.aid || "";
          state.exactCanonicalSongKey = "";
          state.exactCanonicalSongTitle = "";
          state.sameSongCountMode = false;
          state.meikyokuFilter = [];
          state.agencyGroup = "";
          state.unitGroup = "";
          state.roles = [];
          state.kanaRows = [];
          state.kanaChar = "";
          state.alphaChars = [];
          state.searchSortOverride = false;
          const inp = document.getElementById("mainSearchInput");
          const clr = document.getElementById("clearSearchBtn");
          if (inp) inp.value = targetArtist.name;
          if (clr) clr.style.display = "flex";
          document.querySelectorAll("[data-search-scope]").forEach(t => {
            t.classList.toggle("active", t.getAttribute("data-search-scope") === "all");
          });
          if (window.innerWidth <= 900) {
            const rightPanel = document.getElementById("rightDetailPanel");
            const backdrop = document.getElementById("sheetBackdrop");
            if (rightPanel) rightPanel.classList.remove("mobile-open");
            if (backdrop && !state.mobFilterOpen) backdrop.classList.remove("visible");
            syncMobileScrollLock();
          }
          syncSearchTargetUI();
          updateUI(true);
          syncHistoryButtons();
        }
        return;
      }
      const openArtistBtn = e.target.closest("[data-open-artist]");
      if (openArtistBtn) {
        const targetName = openArtistBtn.getAttribute("data-open-artist");
        if (targetName && ARTIST_MAP.has(targetName)) {
          selectArtist(targetName, true);
          syncHistoryButtons();
        }
        return;
      }
      const agencyBtn = e.target.closest("[data-filter-agency]");
      if (agencyBtn) {
        const agGroup = agencyBtn.getAttribute("data-filter-agency") || "";
        const matchCount = DATA.filter(a => (a.agencyGroup || a.agency || "") === agGroup).length;
        if (agGroup && matchCount >= 2) {
          pushHistorySnapshot(true);
          if (state.agencyGroup === agGroup) {
            state.agencyGroup = "";
          } else {
            state.agencyGroup = agGroup;
            if (state.view === "search" || state.view === "recommend") {
              state.view = "all";
            }
          }
          updateUI(true);
          syncHistoryButtons();
        }
        return;
      }
      const modeBtn = e.target.closest("[data-detail-mode]");
      if (modeBtn) {
        state.detailMode = modeBtn.getAttribute("data-detail-mode");
        renderDetailPanel(false);
        return;
      }
      const sortBtn = e.target.closest("[data-song-sort]");
      if (sortBtn) {
        state.songSort = sortBtn.getAttribute("data-song-sort");
        renderDetailPanel(false);
        return;
      }
      if (favQuickEditMode) {
        const avatarOrName = e.target.closest(".detail-avatar-wrap, .detail-artist-name");
        if (avatarOrName && state.selectedArtistName) {
          e.preventDefault();
          e.stopPropagation();
          toggleRecommendedArtist(state.selectedArtistName);
          return;
        }
        const addSongBtn = e.target.closest("#editAddSongSubmitBtn");
        if (addSongBtn) {
          const inp = document.getElementById("editAddSongInput");
          if (inp && state.selectedArtistName) {
            const artist = ARTIST_MAP.get(state.selectedArtistName);
            if (artist && artist.aid) {
              addCustomSongToArtist(artist.aid, inp.value);
            }
          }
          return;
        }
        const delCustomBtn = e.target.closest("[data-delete-custom-song]");
        if (delCustomBtn) {
          e.preventDefault();
          e.stopPropagation();
          const songTitle = delCustomBtn.getAttribute("data-delete-custom-song");
          const artist = state.selectedArtistName ? ARTIST_MAP.get(state.selectedArtistName) : null;
          if (artist && artist.aid && songTitle) {
            removeCustomSongFromArtist(artist.aid, songTitle);
          }
          return;
        }
        const songRow = e.target.closest(".detail-song-item[data-song-title]");
        if (songRow) {
          const sTitle = songRow.getAttribute("data-song-title");
          const aAid = songRow.getAttribute("data-artist-aid");
          if (aAid && sTitle) {
            toggleRecommendedSong(aAid, sTitle);
          }
          return;
        }
      }
    });

    document.getElementById("detailScrollContent").addEventListener("keydown", e => {
      if (favQuickEditMode && e.key === "Enter" && e.target && e.target.id === "editAddSongInput") {
        e.preventDefault();
        const artist = state.selectedArtistName ? ARTIST_MAP.get(state.selectedArtistName) : null;
        if (artist && artist.aid) {
          addCustomSongToArtist(artist.aid, e.target.value);
        }
      }
    });

    // Backdrop click closes mobile sheets
    document.getElementById("sheetBackdrop").addEventListener("click", () => {
      closeDetailPanel();
      closeMobFilterSheet();
    });

    // Browser Back button closes mobile bottom sheet gracefully
    window.addEventListener("popstate", () => {
      if (state.mobFilterOpen) {
        closeMobFilterSheet();
      } else if (state.selectedArtistName && window.innerWidth <= 900) {
        closeDetailPanel();
      }
    });

    window.addEventListener("resize", () => {
      syncMobileScrollLock();
      applyPcFontScale(state.pcFontScale, false);
    }, { passive: true });

    // Non-interfering touch swipe-down gesture for mobile bottom sheets
    setupBottomSheetSwipe(document.getElementById("rightDetailPanel"), closeDetailPanel);
    setupBottomSheetSwipe(document.getElementById("mobFilterSheet"), closeMobFilterSheet);
  }

  function setupBottomSheetSwipe(sheetEl, onClose) {
    let startY = 0;
    let startX = 0;
    let currentY = 0;
    let isDragging = false;
    let isHeaderStart = false;

    sheetEl.addEventListener("touchstart", e => {
      if (window.innerWidth > 900 || e.touches.length !== 1) return;
      const scrollBox = sheetEl.querySelector(".detail-scroll, .mob-sheet-body");
      isHeaderStart = Boolean(e.target.closest(".detail-top-bar, .sheet-drag-handle, .mob-sheet-header, .detail-hero"));
      if (!isHeaderStart && scrollBox && scrollBox.scrollTop > 0) {
        isDragging = false;
        return;
      }
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      currentY = startY;
      isDragging = true;
    }, { passive: true });

    sheetEl.addEventListener("touchmove", e => {
      if (!isDragging || e.touches.length !== 1) return;
      const scrollBox = sheetEl.querySelector(".detail-scroll, .mob-sheet-body");
      if (!isHeaderStart && scrollBox && scrollBox.scrollTop > 0) {
        isDragging = false;
        sheetEl.style.transition = "";
        sheetEl.style.transform = "";
        return;
      }
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      const dy = y - startY;
      const dx = x - startX;

      if (dy <= 0 || Math.abs(dx) > dy) {
        if (!isHeaderStart) {
          isDragging = false;
          sheetEl.style.transition = "";
          sheetEl.style.transform = "";
        }
        return;
      }

      currentY = y;
      if (dy > 6) {
        sheetEl.style.transition = "none";
        sheetEl.style.transform = `translateY(${dy}px)`;
      }
    }, { passive: true });

    sheetEl.addEventListener("touchend", () => {
      if (!isDragging) return;
      const dy = currentY - startY;
      isDragging = false;
      sheetEl.style.transition = "";
      sheetEl.style.transform = "";
      if (dy > 95) {
        onClose();
      }
    });
  }

  // Boot
  loadSavedFontScale();
  applyPcFontScale(state.pcFontScale, false);
  renderStaticStats();
  initEvents();
  // Select the #1 artist by default on desktop so the 3-column layout showcases Representative TOP 5 immediately
  syncSearchTargetUI();
  if (window.innerWidth > 900 && DATA.length > 0) {
    let topArtist = DATA[0];
    for (let i = 1; i < DATA.length; i++) {
      if (DATA[i].count > topArtist.count) topArtist = DATA[i];
    }
    if (topArtist) {
      state.selectedArtistName = topArtist.name;
      state.detailMode = "archive";
    }
  }
  updateUI(true);
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
