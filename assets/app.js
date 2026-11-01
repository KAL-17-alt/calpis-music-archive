(function() {
  "use strict";

  const DATA = window.ARCHIVE_DATA || [];

  const SONG_RENAME_MAP = {"Emily To Juugono Yakusoku": "エミリーと15の約束", "Nouriueno Cracker": "脳裏上のクラッカー", "Haru Koizakura": "春、恋桜。", "わたしね": "わたしね、、", "kick 【歌ってみた】Alfakyun. - kick (Cover) [試唱]": "kick [試唱]", "Hanabami": "花喰み", "こゆび姫♡": "♡こゆび姫♡", "No one": "ダレモ", "刹那の誓い": "刹那の誓い (feat. 由崎司)", "Transparent Compass": "コンパスは透明", "空は高く風は歌う - Piano & Strings": "空は高く風は歌う", "空は高く風は歌う - Piano $ Strings": "空は高く風は歌う", "かけぬけ★青春スパーキング！": "Love♡Vacation", "Pattern of two hearts": "二人模様", "Rokudougokan sanpo": "六道伍感さんぽ", "What if": "碧いif", "Answer to Extreme": "極私的極彩色アンサー", "melt into the dark": "闇に溶けてく", "Nameless Name": "名もなき何もかも", "Against All Answers": "もう何もいらない未来", "Roses in Thorns": "荊の薔薇", "Meant to be": "蝶に結いた赤い糸", "Belle papillon": "飛べない蝶は夢を見る", "Fragile Violet": "薄采ディスプレイ", "Mirage of the mind": "蜃気楼ニ問フ", "Give Me Life": "命をくれよ", "I’ｍ here": "運命の華", "I'm here": "運命の華", "I’m here": "運命の華"};
  const DELETED_NON_SONG_SET = new Set(["アニメ「ガールズバンドクライ」"]);
  const SONG_SEARCH_ALIASES_BY_NEW_TITLE = {"エミリーと15の約束": ["Emily To Juugono Yakusoku", "emilytojuugonoyakusoku", "えみりーと15のやくそく", "えみりーとじゅうごのやくそく"], "脳裏上のクラッカー": ["Nouriueno Cracker", "nouriuenocracker", "のうりじょうのくらっかー", "のうりうえのくらっかー"], "春、恋桜。": ["Haru Koizakura", "harukoizakura", "はるこいざくら", "はる、こいざくら。"], "わたしね、、": ["わたしね", "watashine"], "kick [試唱]": ["kick 【歌ってみた】Alfakyun. - kick (Cover) [試唱]", "Alfakyun. - kick (Cover)", "kick (Cover)"], "花喰み": ["Hanabami", "hanabami", "はなばみ", "ハナバミ"], "♡こゆび姫♡": ["こゆび姫♡", "こゆび姫", "koyubihime", "こゆびひめ", "コユビヒメ"], "ダレモ": ["No one", "no one", "noone", "だれも", "誰モ"], "刹那の誓い (feat. 由崎司)": ["刹那の誓い", "せつなのちかい", "setsunanochikai", "由崎司"], "コンパスは透明": ["Transparent Compass", "transparent compass", "transparentcompass", "こんぱすはとうめい"], "空は高く風は歌う": ["空は高く風は歌う - Piano & Strings", "空は高く風は歌う - Piano $ Strings", "sorawatakakukazewautau", "そらはたかくかぜはうたう"], "Love♡Vacation": ["かけぬけ★青春スパーキング！", "かけぬけ青春スパーキング", "kakenukeseishunsparking", "Love Vacation", "lovevacation", "らぶばけーしょん", "ラブバケーション"], "二人模様": ["Pattern of two hearts", "patternoftwohearts", "pattern of two hearts", "ふたりもよう", "フタリモヨウ"], "六道伍感さんぽ": ["Rokudougokan sanpo", "rokudougokansanpo", "rokudougokan sanpo", "ろくどうごかんさんぽ"], "碧いif": ["What if", "what if", "whatif", "あおいif", "アオイif"], "極私的極彩色アンサー": ["Answer to Extreme", "answer to extreme", "answertoextreme", "ごくしてきごくさいしょくあんさー"], "闇に溶けてく": ["melt into the dark", "meltintothedark", "やみに溶けてく", "やみにとけてく"], "名もなき何もかも": ["Nameless Name", "nameless name", "namelessname", "なもなきなにもかも"], "もう何もいらない未来": ["Against All Answers", "against all answers", "againstallanswers", "もうなにもいらないみらい"], "荊の薔薇": ["Roses in Thorns", "roses in thorns", "rosesinthorns", "いばらのばら", "イバラノバラ"], "蝶に結いた赤い糸": ["Meant to be", "meant to be", "meanttobe", "ちょうにゆいたあかいと"], "飛べない蝶は夢を見る": ["Belle papillon", "belle papillon", "bellepapillon", "とべないちょうはゆめをみる"], "薄采ディスプレイ": ["Fragile Violet", "fragile violet", "fragileviolet", "うすさいでぃすぷれい", "はくさいでぃすぷれい"], "蜃気楼ニ問フ": ["Mirage of the mind", "mirage of the mind", "mirageofthemind", "しんきろうにとう"], "命をくれよ": ["Give Me Life", "give me life", "givemelife", "いのちをくれよ"], "運命の華": ["I’ｍ here", "I'm here", "I’m here", "im here", "imhere", "うんめいのはな"]};
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
    const tierName = t === 3 ? "最上位" : (t === 2 ? "第2グレード" : "第1グレード");
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
      customSongs: getSortedCurrentCustomSongs()
    };
  }

  function editSnapshotsEqual(a, b) {
    if (!a || !b) return false;
    return (
      areStringArraysEqual(a.ids, b.ids) &&
      areStringArraysEqual(a.songFavs, b.songFavs) &&
      areStringArraysEqual(a.customSongs, b.customSongs)
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
        countEl.innerHTML = `${fmtNum(aObj.count)}<span>曲</span>`;
      }
      const favCountEl = row.querySelector(".row-fav-song-count");
      if (favCountEl) {
        const favCnt = getArtistFavSongCount(aObj);
        favCountEl.innerHTML = `${fmtNum(favCnt)}<span>曲</span>`;
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
    const migState = localStorage.getItem(FAV_MIGRATION_STATE_KEY);

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
    recArtistSort: "recFavCountDesc", // "recFavCountDesc" (高評価曲が多い順, default) | "recCustomOrder" (かるが好きな順)
    recSongSort: "recCustomOrder",    // "recCustomOrder" (かるが好きな順, default) | "recFavCountDesc" (高評価曲が多い順)
    searchScope: "all",    // "all" | "cat1" | "cat2"
    searchTarget: "all",   // "all" | "artist" | "song" | "group"
    searchArtistSort: "kanaAsc",      // Default "五十音順" for search ("all" & "artist")
    searchSongSort: "kanaAsc",        // Default "五十音順" (by song title) for search ("song")
    searchGroupSort: "groupCountDesc",// Default "登録名義数順" for search ("group")
    searchSortOverride: false,        // True when user manually changes sort dropdown inside Search
    searchQuery: "",
    sortBy: "countDesc",   // "countDesc" | "countAsc" | "favCountDesc" | "kanaAsc" | "alphaAsc" | "subDesc" | "subAsc"
    savedSortBy: "countDesc", // Sort order saved before 50-on or Alphabet filter auto-switches sort
    lastIndexType: "",     // "kana" | "alpha" | "" (tracks which index filter was operated most recently)
    roles: [],             // Selected activity roles (OR within group)
    subBuckets: [],        // Removed from filter drawer in v26
    agencyGroup: "",       // Selected broad agency/content group
    unitGroup: "",         // Selected standalone unit group (for artists without a broader agencyGroup)
    kanaRows: [],          // Selected 50-on rows e.g. ["あ", "か"] (multi-select supported)
    kanaChar: "",          // Optional sub-character when a single 50-on row is focused
    alphaChars: [],        // Selected alphabet letters e.g. ["A", "B"] (multi-select supported)
    selectedArtistName: null,
    detailMode: "top5",    // "top5" (default when artist clicked) | "archive" (かるが聴いてる曲)
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
      searchScope: state.searchScope,
      searchTarget: state.searchTarget,
      searchArtistSort: state.searchArtistSort,
      searchSongSort: state.searchSongSort,
      searchGroupSort: state.searchGroupSort,
      searchSortOverride: state.searchSortOverride,
      searchQuery: state.searchQuery,
      sortBy: state.sortBy,
      savedSortBy: state.savedSortBy,
      lastIndexType: state.lastIndexType,
      roles: [...state.roles],
      agencyGroup: state.agencyGroup,
      unitGroup: state.unitGroup,
      kanaRows: [...state.kanaRows],
      kanaChar: state.kanaChar,
      alphaChars: [...state.alphaChars],
      selectedArtistName: state.selectedArtistName,
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
    state.searchScope = snap.searchScope;
    state.searchTarget = snap.searchTarget || "all";
    state.searchArtistSort = snap.searchArtistSort || "kanaAsc";
    state.searchSongSort = snap.searchSongSort || "kanaAsc";
    state.searchGroupSort = snap.searchGroupSort || "groupCountDesc";
    state.searchSortOverride = Boolean(snap.searchSortOverride);
    state.searchQuery = snap.searchQuery;
    state.sortBy = snap.sortBy;
    state.savedSortBy = snap.savedSortBy;
    state.lastIndexType = snap.lastIndexType;
    state.roles = [...(snap.roles || [])];
    state.agencyGroup = snap.agencyGroup || "";
    state.unitGroup = snap.unitGroup || "";
    state.kanaRows = [...(snap.kanaRows || [])];
    state.kanaChar = snap.kanaChar || "";
    state.alphaChars = [...(snap.alphaChars || [])];
    state.selectedArtistName = snap.selectedArtistName || null;
    state.detailMode = snap.detailMode || "top5";
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

  // Fast Map from artist name to artist object
  const ARTIST_MAP = new Map();
  DATA.forEach(a => ARTIST_MAP.set(a.name, a));

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
  let currentFiltered = [];

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
      else if (target === "group") titleEl.textContent = "グループを検索";
      else titleEl.textContent = "すべて検索";
    }
    if (inputEl) {
      if (target === "artist") {
        inputEl.placeholder = "アーティスト名・ひらがな・カタカナ・ローマ字を入力...";
      } else if (target === "song") {
        inputEl.placeholder = "楽曲名（登録曲・代表曲）を入力...";
      } else if (target === "group") {
        inputEl.placeholder = "所属（事務所・作品）やユニット名を入力...";
      } else {
        inputEl.placeholder = "アーティスト・楽曲・所属（事務所・作品）・ユニット名を入力...";
      }
    }
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

  function scoreSingleSongMatch(q, qNoSpace, normTitle, normNoSpace, alArr, alNoSpaceArr) {
    const qLen = q.length || 1;
    const qNsLen = (qNoSpace && qNoSpace.length) || qLen;
    if (normTitle === q || (qNoSpace && normNoSpace === qNoSpace)) {
      return { tier: 4, ratio: 3.1 };
    }
    if (alArr.includes(q) || (qNoSpace && alNoSpaceArr.includes(qNoSpace))) {
      return { tier: 4, ratio: 3.0 };
    }
    if (normTitle.startsWith(q) || (qNoSpace && normNoSpace.startsWith(qNoSpace))) {
      return { tier: 5, ratio: 2.0 + (qLen / Math.max(qLen, normTitle.length)) };
    }
    const prefAl = alArr.find(al => al.startsWith(q)) || (qNoSpace ? alNoSpaceArr.find(al => al.startsWith(qNoSpace)) : null);
    if (prefAl) {
      return { tier: 5, ratio: 1.9 + (qLen / Math.max(qLen, prefAl.length)) };
    }
    if (normTitle.includes(q) || (qNoSpace && normNoSpace.includes(qNoSpace))) {
      return { tier: 5, ratio: 1.0 + (qLen / Math.max(qLen, normTitle.length)) };
    }
    const subAl = alArr.find(al => al.includes(q)) || (qNoSpace ? alNoSpaceArr.find(al => al.includes(qNoSpace)) : null);
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
      const sc = scoreSingleSongMatch(q, qNoSpace, ns, nsNoSpace, alArr, alNoSpaceArr);
      if (sc) {
        scoredHits.push({ title: rawSong, tier: sc.tier, ratio: sc.ratio });
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
        const sc = scoreSingleSongMatch(q, qNoSpace, nt, ntNoSpace, alArr, alNoSpaceArr);
        if (sc) {
          scoredHits.push({ title: rawTop, tier: sc.tier, ratio: sc.ratio });
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
    const allMatched = scoredHits.map(h => h.title);
    const shownList = allMatched.slice(0, 3);
    const moreCount = Math.max(0, allMatched.length - 3);
    const displaySongs = shownList.join(" / ") + (moreCount > 0 ? ` ほか${moreCount}曲` : "");
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
      const fa = getArtistFavSongCount(a);
      const fb = getArtistFavSongCount(b);
      if (fb !== fa) return fb - fa;
      const ta = getArtistHeartTier(a.aid);
      const tb = getArtistHeartTier(b.aid);
      if (tb !== ta) return tb - ta;
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

  function applyFilterAndSort() {
    const isSearch = state.view === "search";
    const q = isSearch ? normSearch(state.searchQuery) : "";
    const qNoSpace = q ? stripSpaces(q) : "";
    const kanaActive = hasKanaFilter();
    const alphaActive = hasAlphaFilter();

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
          if (!hasRecommendedSongsForArtist(a.aid)) return false;
        } else {
          if (!isRecommendedArtist(a.name)) return false;
        }
      } else if (!isSearch && !state.agencyGroup && !state.unitGroup) {
        if (state.view === "cat1" && a.cat !== 1) return false;
        if (state.view === "cat2" && a.cat !== 2) return false;
      } else if (isSearch) {
        if (state.searchScope === "cat1" && a.cat !== 1) return false;
        if (state.searchScope === "cat2" && a.cat !== 2) return false;
        if (state.searchTarget === "song" && (!Array.isArray(a.songs) || a.songs.length === 0) && (!Array.isArray(a.topSongs) || a.topSongs.length === 0)) {
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

      if (isSearch && q) {
        if (!evaluateSearchMatch(a, q, qNoSpace)) return false;
      } else {
        a._searchTier = 99;
        a._searchMatchRatio = 0;
        a._matchedSongPreview = null;
        a._matchedSongsList = null;
        a._matchedSongsMoreCount = 0;
        a._matchedSongsDisplay = null;
        a._matchedAliasHint = "";
      }

      if (isSearch && state.searchTarget === "song" && !q) {
        const repSong = getRepresentativeSongForSongTabSort(a, state.searchSongSort || "kanaAsc");
        a._matchedSongPreview = repSong;
      }

      return true;
    });

    // Sort pipeline:
    // - In Search ("song"): sorts by SONG TITLE (五十音順 or アルファベット順), with match ratio prioritized first when q is entered (unless user manually overrode sort).
    // - In Search ("all" / "artist"): defaults to 五十音順, with match ratio prioritized first when q is entered (unless user manually overrode sort).
    // - In Main views ("all" / "cat1" / "cat2"): sorts by state.sortBy.
    currentFiltered.sort((a, b) => {
      if (isSearch) {
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
        if (q && !state.searchSortOverride) {
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

    if (state.searchTarget === "song") {
      const allSongHits = currentFiltered.filter(a => a._matchedSongPreview);
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
      bar.innerHTML = `<span class="search-cand-label">上位候補:</span>` + songHits.map(a => {
        const isExact = a._searchTier === 4;
        const sngTier = getSongHeartTier(a.aid, a._matchedSongPreview);
        const sngHeart = sngTier > 0 ? buildHeartBadgeSpanHTML(sngTier, "artist-fav-heart song-search-fav-heart", "かるのオススメ楽曲") : "";
        return `
          <button type="button" class="search-cand-chip ${isExact ? "exact-hit" : ""}" data-cand-artist="${esc(a.name)}" title="${esc(a.name)} の詳細を表示">
            <span class="search-cand-name">♪ ${esc(a._matchedSongPreview)}${sngHeart}</span>
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
    const scAll = document.getElementById("scopeCntAll");
    if (scAll) scAll.textContent = fmtNum(countTotal);
    const scCat1 = document.getElementById("scopeCntCat1");
    if (scCat1) scCat1.textContent = fmtNum(countCat1);
    const scCat2 = document.getElementById("scopeCntCat2");
    if (scCat2) scCat2.textContent = fmtNum(countCat2);

  }

  // Render Filter Controls (Activity Roles, YouTube Subscribers, 50-on, Alphabet) into both PC drawer & Mobile sheet
  // Item 3: Heading labels simplified to "活動形態" and "YouTubeチャンネル登録者数" without "（複数選択可）"
  function buildFilterControlsHTML() {
    const rows = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];
    const singleRow = state.kanaRows.length === 1 ? state.kanaRows[0] : "";
    const subChars = singleRow ? (KANA_ROW_CHARS[singleRow] || []) : [];

    return `
      <div class="filter-grid">
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
        return `<span class="row-matched-song-token ${isSngFav ? "is-song-fav" : ""}" data-matched-song-title="${esc(sTitle)}">${esc(sTitle)}${sngHeartHTML}</span>`;
      }).join(`<span class="row-matched-song-sep"> / </span>`);
      const moreSuffixHTML = matchedMoreCount > 0
        ? `<span class="row-matched-song-more"> ほか${fmtNum(matchedMoreCount)}曲</span>`
        : "";
      nameWrapInner = `
        <div class="row-song-primary">♪ ${tokensHTML}${moreSuffixHTML}</div>
        <div class="row-name row-name-with-song"><span class="row-artist-prefix">アーティスト:</span>${formatArtistNameHTML(a.name, true)}</div>
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
    const favSongCountHTML = hasCustomRoleRank
      ? `<div class="row-fav-song-count" title="高評価曲数（ハートを付けた曲数）">${fmtNum(favSongCount)}<span>曲</span></div>`
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
        <div class="row-count">${fmtNum(a.count)}<span>曲</span></div>
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
          <div class="row-name row-name-with-song"><span class="row-artist-prefix">アーティスト:</span>${formatArtistNameHTML(a.name, true)}</div>
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

    const isGroupSearchOnly = state.view === "search" && state.searchTarget === "group";
    if (isGroupSearchOnly) {
      totalEl.innerHTML = `表示中: <strong>${fmtNum(currentMatchedGroups.length)}</strong> グループ`;
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
        "Vsinger": "Vsinger",
        "Vtuber": "Vtuber",
        "歌い手": "歌い手",
        "歌手": "歌手",
        "声優": "声優",
        "キャラ": "キャラ",
        "音楽グループ(アニゲー関連)": "複(アニ)",
        "音楽グループ(その他)": "複(他)"
      };

      const aidOrderMap = new Map();
      let aOrdIdx = 0;
      recommendedAidMap.forEach((_tier, aid) => {
        aidOrderMap.set(aid, artistTierOrderMap.has(aid) ? artistTierOrderMap.get(aid) : aOrdIdx++);
      });
      const autoAidOrderMap = new Map();
      DATA.forEach(a => {
        if (a && a.aid && !aidOrderMap.has(a.aid) && getArtistHeartTier(a.aid) > 0) {
          autoAidOrderMap.set(a.aid, artistTierOrderMap.has(a.aid) ? artistTierOrderMap.get(a.aid) : 999999);
        }
      });

      const buckets = new Map();
      roleOrder.forEach(r => buckets.set(r, []));

      if (isSongTab) {
        const songOrderMap = new Map();
        let sOrdIdx = 0;
        recommendedSongMap.forEach((_tier, k) => songOrderMap.set(k, sOrdIdx++));
        let uniqueMatchedSongTotal = 0;

        currentFiltered.forEach(a => {
          const favSongs = getRecommendedSongsForArtist(a);
          if (favSongs.length === 0) return;
          uniqueMatchedSongTotal += favSongs.length;
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
          return `<button type="button" class="rec-role-jump-btn ${hasItems ? "" : "is-empty-role"}" data-jump-role="${esc(rName)}" ${hasItems ? "" : "disabled"} title="${esc(rName)}（${arr.length}曲）へ移動">${esc(shortLbl)}</button>`;
        }).join("");

        const switchBarInnerHTML = `
          <div class="recommend-switch-bar">
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
            <div class="recommend-role-jump-bar" role="navigation" aria-label="活動形態へジャンプ">
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
              <p>編集モードでアーティスト詳細の「かるが聴いてる曲」にハートを付けると、ここに活動形態別で1曲ずつ表示されます。</p>
            </div>
          `;
          if (!resetScroll) preserveCenterScrollPosition(scrollEl, listEl, prevListScrollTop);
          return;
        }

        const songSortMode = state.recSongSort || "recCustomOrder";
        let globalIdx = 0;
        let sectionsHTML = switchBarHTML;
        buckets.forEach((songItems, roleName) => {
          if (!songItems || songItems.length === 0) return;
          if (songSortMode === "recFavCountDesc") {
            // Sort by artist's hearted song count descending, grouping songs of the same artist consecutively!
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
            // Default "かるが好きな順": sort by song heart grade descending (3 -> 2 -> 1), then by orderIdx ascending
            songItems.sort((x, y) => {
              if (y.tier !== x.tier) return y.tier - x.tier;
              return x.orderIdx - y.orderIdx;
            });
          }
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
        return `<button type="button" class="rec-role-jump-btn ${hasItems ? "" : "is-empty-role"}" data-jump-role="${esc(rName)}" ${hasItems ? "" : "disabled"} title="${esc(rName)}（${arr.length}名義）へ移動">${esc(shortLbl)}</button>`;
      }).join("");

      const switchBarInnerHTML = `
        <div class="recommend-switch-bar">
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
          <div class="recommend-role-jump-bar" role="navigation" aria-label="活動形態へジャンプ">
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
            <p>お気に入りのアーティストを設定すると、ここに活動形態別で一覧表示されます。</p>
          </div>
        `;
        if (!resetScroll) preserveCenterScrollPosition(scrollEl, listEl, prevListScrollTop);
        return;
      }

      const artistSortMode = state.recArtistSort || "recFavCountDesc";
      let globalIdx = 0;
      let sectionsHTML = switchBarHTML;
      buckets.forEach((groupList, roleName) => {
        if (!groupList || groupList.length === 0) return;
        if (artistSortMode === "recFavCountDesc") {
          // Default on Artist tab: "高評価曲が多い順" (hearted song count descending, then heart grade descending, then custom order)
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
          // "かるが好きな順" (並び替え): heart grade descending (3 -> 2 -> 1), then custom/addition order
          groupList.sort((x, y) => {
            const tx = getArtistHeartTier(x.aid);
            const ty = getArtistHeartTier(y.aid);
            if (ty !== tx) return ty - tx;
            const ox = aidOrderMap.has(x.aid) ? aidOrderMap.get(x.aid) : (autoAidOrderMap.get(x.aid) || 999999);
            const oy = aidOrderMap.has(y.aid) ? aidOrderMap.get(y.aid) : (autoAidOrderMap.get(y.aid) || 999999);
            return ox - oy;
          });
        }
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
      listEl.innerHTML = sectionsHTML;
      if (!resetScroll) preserveCenterScrollPosition(scrollEl, listEl, prevListScrollTop);
      scheduleLookaheadAvatarPreload(12, 40);
      return;
    }

    if (currentFiltered.length === 0 && !groupsHTML) {
      listEl.innerHTML = `
        <div class="empty-list-state">
          <h3>条件に一致するアーティストが見つかりません</h3>
          <p>検索キーワードや絞り込み条件（活動形態・五十音・英字・所属）を変更してお試しください。</p>
        </div>
      `;
      return;
    }

    const slice = currentFiltered.slice(0, state.renderLimit);
    const isSearch = state.view === "search" && state.searchQuery.trim() !== "";
    listEl.innerHTML = groupsHTML + slice.map((a, idx) => buildArtistRowHTML(a, isSearch, idx)).join("");
    scheduleLookaheadAvatarPreload(12, 40);
  }

  // Append additional artist rows on scroll using DocumentFragment (Zero existing DOM destruction)
  function appendArtistRows(prevLimit, newLimit) {
    const listEl = document.getElementById("artistListContainer");
    if (!listEl) return;
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
      if (row.getAttribute("data-artist-name") !== state.selectedArtistName) {
        row.classList.remove("selected");
      }
    });
    if (state.selectedArtistName) {
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
        <button type="button" class="detail-mode-tab ${isTop5Mode ? "active" : ""}" data-detail-mode="top5" role="tab" aria-selected="${isTop5Mode}">
          ${repHeadingLabel}
        </button>
        ${hasArchiveSongs ? `
        <button type="button" class="detail-mode-tab ${!isTop5Mode ? "active" : ""}" data-detail-mode="archive" role="tab" aria-selected="${!isTop5Mode}">
          かるが聴いてる曲 (${fmtNum(artist.count)})
        </button>
        ` : ""}
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
        <button type="button" class="back-to-top5-btn" data-detail-mode="top5">
          <span>← ${repHeadingLabel} に戻る</span>
        </button>

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
                    <span class="song-edit-heart-indicator ${isSongFav ? `is-fav heart-tier-${songTier}` : ""}" aria-hidden="true">${buildHeartTierInnerHTML(isSongFav ? songTier : activeHeartTier)}</span>
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
            { value: "alphaAsc", label: "アルファベット順" }
          ],
          currentVal: state.searchSongSort || "kanaAsc"
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
      return true;
    }
    if (state.view === "search") {
      const target = state.searchTarget || "all";
      state.searchSortOverride = true;
      if (target === "group") {
        state.searchGroupSort = newVal;
        return true;
      }
      if (target === "song") {
        state.searchSongSort = newVal;
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

    // Sync list-col-header labels, song-list-mode, and recommend-artist-mode ("高評価曲数")
    const isSongListMode =
      (state.view === "recommend" && state.recommendTab === "song") ||
      (state.view === "search" && state.searchTarget === "song");
    const isRecommendArtistMode = state.view === "recommend" && state.recommendTab === "artist";
    const isGroupSearchMode = state.view === "search" && state.searchTarget === "group";
    document.body.setAttribute("data-current-rec-tab", state.recommendTab || "artist");
    document.body.classList.toggle("song-list-mode", isSongListMode);
    document.body.classList.toggle("recommend-artist-mode", isRecommendArtistMode);
    const listColHeaderEl = document.getElementById("listColHeader") || document.querySelector(".list-col-header");
    if (listColHeaderEl) {
      listColHeaderEl.classList.toggle("song-list-mode", isSongListMode);
      listColHeaderEl.classList.toggle("recommend-artist-mode", isRecommendArtistMode);
      listColHeaderEl.classList.toggle("group-search-header-hidden", isGroupSearchMode);
      // On Smartphone, hide column header only on "かるのオススメ" -> "楽曲" tab; on "アーティスト" tab show "アーティスト" + "高評価曲数"
      listColHeaderEl.classList.toggle("recommend-mobile-header-hidden", state.view === "recommend" && isSongListMode);
    }
    const listColRankEl = document.getElementById("listColRankLabel") || document.querySelector(".list-col-header > span:first-child");
    if (listColRankEl) {
      listColRankEl.textContent = state.view === "recommend" ? "" : "#";
    }
    const listColMainEl = document.getElementById("listColMainLabel") || document.querySelector(".list-col-header > span:nth-child(3)");
    if (listColMainEl) {
      listColMainEl.textContent = isSongListMode ? "曲名" : "アーティスト";
    }
    const listColFavCountEl = document.getElementById("listColFavCountLabel");
    if (listColFavCountEl) {
      listColFavCountEl.style.display = isRecommendArtistMode ? "" : "none";
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
    const defaultMode = favQuickEditMode ? "archive" : "top5";
    if (state.selectedArtistName !== name || state.detailMode !== defaultMode) {
      pushHistorySnapshot(fromProfileJump);
    }
    state.selectedArtistName = name;
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
    if (state.selectedArtistName !== null) {
      pushHistorySnapshot(false);
    }
    state.selectedArtistName = null;
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
    state.sortBy = "countDesc";
    state.savedSortBy = "countDesc";
    state.recArtistSort = "recFavCountDesc";
    state.recSongSort = "recCustomOrder";
    state.searchArtistSort = "kanaAsc";
    state.searchSongSort = "kanaAsc";
    state.searchGroupSort = "groupCountDesc";
    state.searchSortOverride = false;
    state.selectedArtistName = null;
    state.detailMode = "top5";
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

    // Home Button (PC Left Sidebar & Smartphone Top Header)
    const pcHomeBtn = document.getElementById("pcHomeBtn");
    if (pcHomeBtn) {
      pcHomeBtn.addEventListener("click", resetToHomeState);
    }
    const mobTopHomeBtn = document.getElementById("mobTopHomeBtn");
    if (mobTopHomeBtn) {
      mobTopHomeBtn.addEventListener("click", resetToHomeState);
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
      state.searchSortOverride = false;
      clearSearchBtn.style.display = state.searchQuery ? "flex" : "none";
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(runSearchUpdate, 80);
    });

    clearSearchBtn.addEventListener("click", () => {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      state.searchQuery = "";
      searchInput.value = "";
      clearSearchBtn.style.display = "none";
      runSearchUpdate();
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
      const rows = Array.from(sectionEl.querySelectorAll(".artist-row"));
      rows.forEach((r, idx) => {
        const rankEl = r.querySelector(".row-rank");
        if (rankEl) rankEl.textContent = String(idx + 1);
      });

      if (state.recommendTab === "song") {
        const newSectionKeys = rows
          .map(r => makeSongKey(r.getAttribute("data-artist-aid") || r.getAttribute("data-artist-name"), r.getAttribute("data-rec-song-title")))
          .filter(Boolean);
        const sectionKeySet = new Set(newSectionKeys);
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
        updateSortOptionLabelsForContext();
        const newSectionAids = rows
          .map(r => r.getAttribute("data-artist-aid") || resolveToAid(r.getAttribute("data-artist-name")))
          .filter(Boolean);
        newSectionAids.forEach(aid => {
          artistTierOrderMap.set(aid, favOrderSeqCounter++);
        });
        const manualSectionAids = newSectionAids.filter(aid => recommendedAidMap.has(aid));
        const manualSectionSet = new Set(manualSectionAids);
        const allEntries = Array.from(recommendedAidMap.entries());
        let repIdx = 0;
        const nextEntries = allEntries.map(([aid, tier]) => {
          if (manualSectionSet.has(aid)) {
            const nextAid = manualSectionAids[repIdx++];
            return [nextAid, recommendedAidMap.get(nextAid) || tier];
          }
          return [aid, tier];
        });
        recommendedAidMap.clear();
        nextEntries.forEach(([aid, tier]) => {
          recommendedAidMap.set(aid, tier);
        });
      }

      saveFavOrderMemory();
      saveUnsavedDraft();
      updateFavEditBannerStatus();
      syncHistoryButtons();
    }

    function getVisibleSectionRows(section, hiddenSourceRow) {
      return Array.from(section.querySelectorAll(".artist-row")).filter(r => r !== hiddenSourceRow);
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

    function updateDragPlaceholderAndGhostRank(section, placeholderRow, ghostEl, hiddenSourceRow) {
      const rows = getVisibleSectionRows(section, hiddenSourceRow);
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

    function animateSectionRowsFLIP(section, prevTopsMap, skipRow, hiddenSourceRow) {
      const rows = getVisibleSectionRows(section, hiddenSourceRow);
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
          listContainer.setPointerCapture(pointerId);
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

      // Create dedicated placeholder slot element so `row` (and its child `handle`, the Touch.target)
      // is NEVER detached from the DOM during the drag!
      const placeholderEl = row.cloneNode(true);
      placeholderEl.classList.add("is-dragging-row", "is-drag-placeholder");
      placeholderEl.removeAttribute("data-artist-name");
      placeholderEl.removeAttribute("data-artist-aid");
      placeholderEl.removeAttribute("data-rec-song-title");
      placeholderEl.setAttribute("data-heart-tier", draggedTier);
      section.insertBefore(placeholderEl, row);
      row.style.display = "none";

      updateDragPlaceholderAndGhostRank(section, placeholderEl, ghostEl, row);

      activeDragState = {
        pointerId,
        row,
        placeholderEl,
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
      const { row, placeholderEl, section, ghostEl, draggedTier, pointerOffsetY, rowHeight } = activeDragState;

      const siblings = getVisibleSectionRows(section, row);
      // Restrict drag reordering strictly to rows with the exact same heart grade (`draggedTier`)
      const sameTierSiblings = siblings.filter(r => r === placeholderEl || (r.getAttribute("data-heart-tier") || "3") === draggedTier);
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

      const prevIdx = sameTierSiblings.indexOf(placeholderEl);
      const nonPlaceholderSameTierRows = sameTierSiblings.filter(r => r !== placeholderEl);

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
          section.insertBefore(placeholderEl, targetSib);
        } else {
          const lastInTier = nonPlaceholderSameTierRows[nonPlaceholderSameTierRows.length - 1];
          if (lastInTier && lastInTier.nextSibling) {
            section.insertBefore(placeholderEl, lastInTier.nextSibling);
          } else {
            section.appendChild(placeholderEl);
          }
        }
        activeDragState.moved = true;
        updateDragPlaceholderAndGhostRank(section, placeholderEl, ghostEl, row);
        animateSectionRowsFLIP(section, prevTopsMap, placeholderEl, row);
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
      const { row, placeholderEl, section, ghostEl, moved, pointerId } = activeDragState;
      try {
        if (pointerId !== undefined && pointerId !== null) {
          listContainer.releasePointerCapture(pointerId);
        }
      } catch (_e) {}
      if (ghostEl && ghostEl.parentNode) {
        ghostEl.parentNode.removeChild(ghostEl);
      }
      if (placeholderEl && placeholderEl.parentNode === section) {
        section.insertBefore(row, placeholderEl);
        section.removeChild(placeholderEl);
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

    listContainer.addEventListener("click", e => {
      if (suppressNextRowClick || e.target.closest("[data-drag-handle]")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (isPcTextSelectionDrag(e)) {
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
        selectArtist(row.getAttribute("data-artist-name"));
      }
    });

    // Infinite smooth chunk rendering on scroll using DocumentFragment append
    const scrollEl = document.getElementById("centerScrollArea");
    scrollEl.addEventListener("scroll", () => {
      if (state.view === "recommend" || state.renderLimit >= currentFiltered.length) return;
      if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 420) {
        const prevLimit = state.renderLimit;
        state.renderLimit = Math.min(currentFiltered.length, state.renderLimit + 100);
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
    let aboutTitleTapCount = 0;
    let aboutTitleTapTimer = null;

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
        aboutTitleTapCount++;
        if (aboutTitleTapTimer) clearTimeout(aboutTitleTapTimer);
        if (aboutTitleTapCount >= 5) {
          aboutTitleTapCount = 0;
          openOwnerMessagesInboxModal();
        } else {
          aboutTitleTapTimer = setTimeout(() => { aboutTitleTapCount = 0; }, 1200);
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
      const orderChanged = added.length === 0 && removed.length === 0 && !areStringArraysEqual(bArr, cArr);
      return { added, removed, orderChanged, hasChanges: added.length > 0 || removed.length > 0 || orderChanged };
    }

    updateFavEditBannerStatus = function() {
      const diffBadge = document.getElementById("favQeDiffBadge");
      const discardBtn = document.getElementById("discardFavQuickEditBtn");
      const migrateBtn = document.getElementById("openLegacyMigrateBtn");
      const exitBtn = document.getElementById("exitFavQuickEditBtn");

      const curIds = getSortedCurrentAids();
      const curSongs = getSortedCurrentSongFavs();
      const curCustom = getSortedCurrentCustomSongs();

      const dIds = computeDiffCounts(editSessionBaseIds, curIds);
      const dSongs = computeDiffCounts(editSessionBaseSongFavs, curSongs);
      const dCustom = computeDiffCounts(editSessionBaseCustomSongs, curCustom);
      const anyChanged = dIds.hasChanges || dSongs.hasChanges || dCustom.hasChanges;

      if (diffBadge) {
        if (!anyChanged) {
          diffBadge.textContent = "変更なし";
          diffBadge.classList.remove("has-changes");
        } else {
          const reorderCount = (dIds.orderChanged ? 1 : 0) + (dSongs.orderChanged ? 1 : 0);
          const totalChanges = dIds.added.length + dIds.removed.length + dSongs.added.length + dSongs.removed.length + dCustom.added.length + dCustom.removed.length + reorderCount;
          diffBadge.textContent = `未保存の変更: ${totalChanges}件`;
          diffBadge.classList.add("has-changes");
        }
      }
      if (discardBtn) {
        discardBtn.style.display = anyChanged && !isSavingFavorites ? "inline-flex" : "none";
      }
      if (migrateBtn) {
        const legacyAids = getLegacyLocalStorageAids();
        const migState = localStorage.getItem(FAV_MIGRATION_STATE_KEY);
        migrateBtn.style.display = (legacyAids.length > 0 && migState !== "migrated" && !isSavingFavorites)
          ? "inline-flex"
          : "none";
        if (legacyAids.length > 0) {
          migrateBtn.textContent = `端末の既存ハート(${legacyAids.length}件)を移行`;
        }
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
      if (favQuickEditMode) return;
      const existingDraft = loadUnsavedDraft();
      let restoredDraft = false;

      if (
        existingDraft &&
        (!areStringArraysEqual(existingDraft.ids, existingDraft.baseIds) ||
          !areStringArraysEqual(existingDraft.songFavs, existingDraft.baseSongFavs) ||
          !areStringArraysEqual(existingDraft.customSongs, existingDraft.baseCustomSongs))
      ) {
        editSessionBaseIds = existingDraft.baseIds;
        editSessionBaseSongFavs = existingDraft.baseSongFavs;
        editSessionBaseCustomSongs = existingDraft.baseCustomSongs;
        editSessionBaseVersion = existingDraft.baseVersion;
        setAllSharedStates(existingDraft.ids, existingDraft.songFavs, existingDraft.customSongs);
        restoredDraft = true;
      } else {
        editSessionBaseIds = hasFetchedServerOnce ? [...serverFavIds] : getSortedCurrentAids();
        editSessionBaseSongFavs = hasFetchedServerOnce ? [...serverSongFavs] : getSortedCurrentSongFavs();
        editSessionBaseCustomSongs = hasFetchedServerOnce ? [...serverCustomSongs] : getSortedCurrentCustomSongs();
        editSessionBaseVersion = serverVersion;
      }

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

      if (restoredDraft) {
        showOwnerFavToast("前回の未保存の編集内容を復元しました（「完了して閉じる」で保存、「取消」で破棄できます）");
      } else {
        const legacyAids = getLegacyLocalStorageAids();
        const migState = localStorage.getItem(FAV_MIGRATION_STATE_KEY);
        if (serverVersion === 0 && legacyAids.length > 0 && migState !== "migrated" && migState !== "skipped") {
          openFavMigrationModal();
        }
      }

      if (!restoredDraft) {
        fetchServerFavorites({ silent: true, fresh: true });
      }
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
      const forceOverwrite = Boolean(options.forceOverwrite);
      const targetIds = Array.isArray(options.customIds) ? [...options.customIds] : getSortedCurrentAids();
      const targetSongFavs = Array.isArray(options.customSongFavs) ? [...options.customSongFavs] : getSortedCurrentSongFavs();
      const targetCustomSongs = Array.isArray(options.customAddedSongs) ? [...options.customAddedSongs].sort() : getSortedCurrentCustomSongs();
      const customBaseVersion = typeof options.customBaseVersion === "number" ? options.customBaseVersion : editSessionBaseVersion;

      const noDiffFromSession = (
        areStringArraysEqual(targetIds, editSessionBaseIds) &&
        areStringArraysEqual(targetSongFavs, editSessionBaseSongFavs) &&
        areStringArraysEqual(targetCustomSongs, editSessionBaseCustomSongs)
      );
      const noDiffFromServer = !hasFetchedServerOnce || (
        areStringArraysEqual(targetIds, serverFavIds) &&
        areStringArraysEqual(targetSongFavs, serverSongFavs) &&
        areStringArraysEqual(targetCustomSongs, serverCustomSongs)
      );

      if (!forceOverwrite && noDiffFromSession && noDiffFromServer) {
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

        if (resp.status === 409 && data && data.serverData) {
          isSavingFavorites = false;
          updateFavEditBannerStatus();
          openFavConflictModal(data.serverData);
          return;
        }

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

        editSessionBaseIds = [...serverFavIds];
        editSessionBaseSongFavs = [...serverSongFavs];
        editSessionBaseCustomSongs = [...serverCustomSongs];
        editSessionBaseVersion = serverVersion;

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

        const ordMem = loadFavOrderMemory();
        const rawFetchedIds = normalizeArtistIdWithTierArray(data.ids);
        const rawFetchedSongFavs = normalizeSongFavWithTierArray(data.songFavs);
        const fetchedIds = reconcileOrderWithMemory(rawFetchedIds, ordMem.ids);
        const fetchedSongFavs = reconcileOrderWithMemory(rawFetchedSongFavs, ordMem.songFavs);
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

    // ==================== Owner-Only Initial Migration Modal ====================
    const favMigrationModal = document.getElementById("favMigrationModal");
    function openFavMigrationModal() {
      if (!favQuickEditMode) return;
      const legacyAids = getLegacyLocalStorageAids();
      if (!favMigrationModal || legacyAids.length === 0) return;
      const countBadge = document.getElementById("favMigrationCountBadge");
      const previewList = document.getElementById("favMigrationPreviewList");
      const errBox = document.getElementById("favMigrationErrorBox");
      if (countBadge) countBadge.textContent = `${legacyAids.length} 名義`;
      if (previewList) {
        const names = legacyAids.map(resolveAidToName).filter(Boolean);
        previewList.textContent = names.join("、");
      }
      if (errBox) errBox.style.display = "none";
      favMigrationModal.classList.add("open");
      favMigrationModal.setAttribute("aria-hidden", "false");
    }

    function closeFavMigrationModal() {
      if (!favMigrationModal) return;
      favMigrationModal.classList.remove("open");
      favMigrationModal.setAttribute("aria-hidden", "true");
    }

    async function executeLegacyMigration(forceOverwrite = false) {
      const legacyAids = getLegacyLocalStorageAids();
      if (legacyAids.length === 0) {
        closeFavMigrationModal();
        return;
      }
      const confirmBtn = document.getElementById("confirmFavMigrationBtn");
      const errBox = document.getElementById("favMigrationErrorBox");
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = "サーバーへ移行中...";
      }
      if (errBox) errBox.style.display = "none";

      try {
        const resp = await fetch(FAV_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Calpis-Client": "archive-v1",
            "X-Calpis-Edit-Intent": "1"
          },
          body: JSON.stringify({
            action: "migrate",
            ids: legacyAids,
            songFavs: getSortedCurrentSongFavs(),
            customSongs: getSortedCurrentCustomSongs(),
            baseVersion: serverVersion,
            forceOverwrite,
            clientRequestId: `mig_${Date.now()}`
          }),
          cache: "no-store"
        });
        const data = await resp.json().catch(() => null);

        if (resp.status === 409 && data && data.serverData) {
          serverFavIds = normalizeArtistIdWithTierArray(data.serverData.ids);
          serverSongFavs = normalizeSongFavWithTierArray(data.serverData.songFavs);
          serverCustomSongs = normalizeSongKeyArray(data.serverData.customSongs);
          serverVersion = data.serverData.version || 1;
          if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = "サーバーの既存データを上書きしてこの端末から移行する";
            confirmBtn.dataset.forceOverwrite = "1";
          }
          if (errBox) {
            errBox.textContent = `サーバーには既に共有データ（${serverFavIds.length}名義・v${serverVersion}）が存在します。この端末のデータ（${legacyAids.length}名義）で上書きする場合はもう一度ボタンを押してください。`;
            errBox.style.display = "block";
          }
          return;
        }

        if (!resp.ok || !data || !data.ok) {
          throw new Error((data && data.message) || `移行エラー (HTTP ${resp.status})`);
        }

        try {
          const rawOrig = localStorage.getItem(RECOMMENDED_STORAGE_KEY);
          if (rawOrig) localStorage.setItem(RECOMMENDED_BACKUP_KEY, rawOrig);
          localStorage.setItem(FAV_MIGRATION_STATE_KEY, "migrated");
        } catch (e) {}

        serverFavIds = normalizeArtistIdWithTierArray(data.ids || legacyAids);
        serverSongFavs = normalizeSongFavWithTierArray(data.songFavs);
        serverCustomSongs = normalizeSongKeyArray(data.customSongs);
        serverVersion = typeof data.version === "number" ? data.version : 1;
        hasFetchedServerOnce = true;

        editSessionBaseIds = [...serverFavIds];
        editSessionBaseSongFavs = [...serverSongFavs];
        editSessionBaseCustomSongs = [...serverCustomSongs];
        editSessionBaseVersion = serverVersion;

        setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
        saveFavServerCache(serverFavIds, serverSongFavs, serverCustomSongs, serverVersion, data.updatedAt);
        clearUnsavedDraft();

        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = "確認してこの端末からサーバーへ移行する";
          delete confirmBtn.dataset.forceOverwrite;
        }
        closeFavMigrationModal();
        updateFavEditBannerStatus();
        applySilentFavoritesDOMUpdate();
        showOwnerFavToast(`既存の「かるのオススメ」（${serverFavIds.length}名義）をサーバーへ移行しました`);
      } catch (err) {
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = "再試行：この端末からサーバーへ移行する";
        }
        if (errBox) {
          errBox.textContent = `${err && err.message ? err.message : "通信エラーが発生しました。"}（既存のハート設定は端末内に安全に保持されています）`;
          errBox.style.display = "block";
        }
      }
    }

    // ==================== Conflict Resolution Modal ====================
    const favConflictModal = document.getElementById("favConflictModal");
    let lastConflictServerData = null;

    function openFavConflictModal(serverData) {
      if (!favConflictModal || !serverData) return;
      lastConflictServerData = {
        ids: normalizeArtistIdWithTierArray(serverData.ids),
        songFavs: normalizeSongFavWithTierArray(serverData.songFavs),
        customSongs: normalizeSongKeyArray(serverData.customSongs),
        version: typeof serverData.version === "number" ? serverData.version : 1,
        updatedAt: serverData.updatedAt || null
      };

      const curIds = getSortedCurrentAids();
      const curSongs = getSortedCurrentSongFavs();
      const curCustom = getSortedCurrentCustomSongs();

      const localDiff = computeDiffCounts(editSessionBaseIds, curIds);
      const localSongDiff = computeDiffCounts(editSessionBaseSongFavs, curSongs);
      const localCustomDiff = computeDiffCounts(editSessionBaseCustomSongs, curCustom);

      const localSumEl = document.getElementById("favConflictLocalSummary");
      const localDetEl = document.getElementById("favConflictLocalDetail");
      const srvSumEl = document.getElementById("favConflictServerSummary");
      const srvDetEl = document.getElementById("favConflictServerDetail");

      if (localSumEl) localSumEl.textContent = `名義:${curIds.length} / 曲♥:${curSongs.length}`;
      if (localDetEl) {
        const lines = [];
        if (localDiff.added.length > 0) lines.push(`【名義追加】${localDiff.added.map(resolveAidToName).filter(Boolean).join("、")}`);
        if (localDiff.removed.length > 0) lines.push(`【名義解除】${localDiff.removed.map(resolveAidToName).filter(Boolean).join("、")}`);
        if (localSongDiff.hasChanges) lines.push(`【曲♥変更】+${localSongDiff.added.length} / -${localSongDiff.removed.length}`);
        if (localCustomDiff.hasChanges) lines.push(`【曲追加】+${localCustomDiff.added.length}`);
        localDetEl.textContent = lines.length > 0 ? lines.join(" / ") : "変更なし";
      }

      if (srvSumEl) srvSumEl.textContent = `名義:${lastConflictServerData.ids.length} / 曲♥:${lastConflictServerData.songFavs.length} (v${lastConflictServerData.version})`;
      if (srvDetEl) {
        srvDetEl.textContent = `他端末でバージョン v${lastConflictServerData.version} が保存されています。「両方の変更を合体して保存」を押すと両方の編集内容を統合します。`;
      }

      favConflictModal.classList.add("open");
      favConflictModal.setAttribute("aria-hidden", "false");
    }

    function closeFavConflictModal() {
      if (!favConflictModal) return;
      favConflictModal.classList.remove("open");
      favConflictModal.setAttribute("aria-hidden", "true");
    }

    // Secret 5-tap on top-left logo (.brand-disc-icon or .mobile-top-left)
    let secretLogoTapCount = 0;
    let secretLogoTapTimer = null;
    function handleSecretLogoTap() {
      secretLogoTapCount++;
      if (secretLogoTapTimer) clearTimeout(secretLogoTapTimer);
      if (secretLogoTapCount >= 5) {
        secretLogoTapCount = 0;
        if (!favQuickEditMode) {
          enterFavQuickEditMode();
        } else {
          saveFavoritesToServer();
        }
      } else {
        secretLogoTapTimer = setTimeout(() => { secretLogoTapCount = 0; }, 1200);
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
            ind.innerHTML = buildHeartTierInnerHTML(activeHeartTier);
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

    const openLegacyMigrateBtn = document.getElementById("openLegacyMigrateBtn");
    if (openLegacyMigrateBtn) {
      openLegacyMigrateBtn.addEventListener("click", openFavMigrationModal);
    }
    const closeFavMigrationModalBtn = document.getElementById("closeFavMigrationModalBtn");
    if (closeFavMigrationModalBtn) {
      closeFavMigrationModalBtn.addEventListener("click", closeFavMigrationModal);
    }
    const postponeFavMigrationBtn = document.getElementById("postponeFavMigrationBtn");
    if (postponeFavMigrationBtn) {
      postponeFavMigrationBtn.addEventListener("click", closeFavMigrationModal);
    }
    const skipDeviceFavMigrationBtn = document.getElementById("skipDeviceFavMigrationBtn");
    if (skipDeviceFavMigrationBtn) {
      skipDeviceFavMigrationBtn.addEventListener("click", () => {
        try {
          localStorage.setItem(FAV_MIGRATION_STATE_KEY, "skipped");
        } catch (e) {}
        closeFavMigrationModal();
        if (hasFetchedServerOnce) {
          setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
          editSessionBaseIds = [...serverFavIds];
          editSessionBaseSongFavs = [...serverSongFavs];
          editSessionBaseCustomSongs = [...serverCustomSongs];
          editSessionBaseVersion = serverVersion;
          updateFavEditBannerStatus();
          applySilentFavoritesDOMUpdate();
        }
      });
    }
    const confirmFavMigrationBtn = document.getElementById("confirmFavMigrationBtn");
    if (confirmFavMigrationBtn) {
      confirmFavMigrationBtn.addEventListener("click", () => {
        const force = confirmFavMigrationBtn.dataset.forceOverwrite === "1";
        executeLegacyMigration(force);
      });
    }

    // Conflict Modal buttons (3-way merge across ids, songFavs, and customSongs)
    const closeFavConflictModalBtn = document.getElementById("closeFavConflictModalBtn");
    if (closeFavConflictModalBtn) {
      closeFavConflictModalBtn.addEventListener("click", closeFavConflictModal);
    }
    const conflictMergeSaveBtn = document.getElementById("conflictMergeSaveBtn");
    if (conflictMergeSaveBtn) {
      conflictMergeSaveBtn.addEventListener("click", () => {
        if (!lastConflictServerData) return;
        const mergeThreeWay = (baseArr, localArr, serverArr) => {
          const diff = computeDiffCounts(baseArr, localArr);
          const merged = new Set(serverArr);
          diff.added.forEach(x => merged.add(x));
          diff.removed.forEach(x => merged.delete(x));
          return Array.from(merged);
        };

        const mergedIds = mergeThreeWay(editSessionBaseIds, getSortedCurrentAids(), lastConflictServerData.ids);
        const mergedSongFavs = mergeThreeWay(editSessionBaseSongFavs, getSortedCurrentSongFavs(), lastConflictServerData.songFavs);
        const mergedCustomSongs = mergeThreeWay(editSessionBaseCustomSongs, getSortedCurrentCustomSongs(), lastConflictServerData.customSongs);

        serverFavIds = [...lastConflictServerData.ids];
        serverSongFavs = [...lastConflictServerData.songFavs];
        serverCustomSongs = [...lastConflictServerData.customSongs];
        serverVersion = lastConflictServerData.version;

        editSessionBaseIds = [...serverFavIds];
        editSessionBaseSongFavs = [...serverSongFavs];
        editSessionBaseCustomSongs = [...serverCustomSongs];
        editSessionBaseVersion = serverVersion;

        setAllSharedStates(mergedIds, mergedSongFavs, mergedCustomSongs);
        saveUnsavedDraft();
        closeFavConflictModal();
        renderDetailPanel(false);
        applySilentFavoritesDOMUpdate();
        saveFavoritesToServer({
          customIds: mergedIds,
          customSongFavs: mergedSongFavs,
          customAddedSongs: mergedCustomSongs,
          customBaseVersion: lastConflictServerData.version
        });
      });
    }
    const conflictForceOverwriteBtn = document.getElementById("conflictForceOverwriteBtn");
    if (conflictForceOverwriteBtn) {
      conflictForceOverwriteBtn.addEventListener("click", () => {
        if (!lastConflictServerData) return;
        editSessionBaseVersion = lastConflictServerData.version;
        closeFavConflictModal();
        saveFavoritesToServer({
          customIds: getSortedCurrentAids(),
          customSongFavs: getSortedCurrentSongFavs(),
          customAddedSongs: getSortedCurrentCustomSongs(),
          customBaseVersion: lastConflictServerData.version,
          forceOverwrite: true
        });
      });
    }
    const conflictLoadServerBtn = document.getElementById("conflictLoadServerBtn");
    if (conflictLoadServerBtn) {
      conflictLoadServerBtn.addEventListener("click", () => {
        if (!lastConflictServerData) return;
        serverFavIds = [...lastConflictServerData.ids];
        serverSongFavs = [...lastConflictServerData.songFavs];
        serverCustomSongs = [...lastConflictServerData.customSongs];
        serverVersion = lastConflictServerData.version;

        editSessionBaseIds = [...serverFavIds];
        editSessionBaseSongFavs = [...serverSongFavs];
        editSessionBaseCustomSongs = [...serverCustomSongs];
        editSessionBaseVersion = serverVersion;

        setAllSharedStates(serverFavIds, serverSongFavs, serverCustomSongs);
        saveFavServerCache(serverFavIds, serverSongFavs, serverCustomSongs, serverVersion, lastConflictServerData.updatedAt);
        clearUnsavedDraft();
        closeFavConflictModal();
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
      state.detailMode = "top5";
    }
  }
  updateUI(true);
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
})();
