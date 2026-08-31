# 語圖 wanfang-aphasia

以圖片為主的失語症溝通輔助與命名練習工具。**Phase 1 原型，研發測試用，非醫療器材。**

---

## 部署到 GitHub Pages

```bash
git init
git add .
git commit -m "Phase 1 prototype"
git branch -M main
git remote add origin https://github.com/maguro631023/wanfang-aphasia.git
git push -u origin main
```

Settings → Pages → Source 選 `main` / `(root)`。
網址會是 `https://maguro631023.github.io/wanfang-aphasia/`

GitHub Pages 提供 HTTPS，這是後續要用麥克風（`getUserMedia`）的必要條件，也是 service worker 能註冊的前提。

**手機測試**：用 Chrome（Android）或 Safari（iOS）開上面的網址 → 分享 → 加到主畫面。之後從主畫面開啟就是全螢幕、可離線。

---

## 目前有什麼

**溝通模式** — 5 個主題 → 每題 4 個詞，點一下就發聲。導覽深度固定 2 層，沒有訊息列組句，沒有抽象上位類別。

**練習模式** — 看圖命名，說不出來時自行點開提示階梯：

```
Level 0  無提示就說對
Level 1  語意提示（SFA 式：用途／外觀／類別／地點／關聯）
Level 2  音韻提示（目前用注音首音）
Level 3  完整示範（顯示 + 發聲，跟著說）
```

每題記錄「爬到第幾層才成功」。這比對錯本身有用得多，也是未來驗證研究的過程指標。

**設定** — 文字標籤開關（失語症常合併失讀，純圖片模式對部分個案更好用）、慣用手左右切換（左側 CVA 常合併右側偏癱）、三段字級。

**紀錄** — 全部存在裝置本機，可匯出 JSON。**不上傳、不連後端、不做帳號。**

---

## 補上你自己的資產

```
assets/
├── img/
│   ├── daily/      toothbrush.webp  glasses.webp  towel.webp  television.webp
│   ├── food/       water.webp  rice.webp  noodles.webp  medicine.webp
│   ├── body/       headache.webp  sleepy.webp  thirsty.webp  cold.webp
│   ├── people/     wife.webp  son.webp  daughter.webp  doctor.webp
│   ├── act/        toilet.webp  sit-up.webp  eat.webp  bath.webp
│   ├── WF-cat-daily.webp        ← 類別圖：WF-{角色}-{類別}，放根目錄
│   └── WF-cat.webp              ← 角色頭像（選用）
├── audio/          先分語言，再分類別
│   ├── zh/daily/   toothbrush.mp3 ...   華語
│   ├── nan/daily/  toothbrush.mp3 ...   台語
│   ├── hak/daily/  toothbrush.mp3 ...   客語
│   └── en/daily/   toothbrush.mp3 ...   英語
├── icon-192.png
├── icon-512.png
└── icon-512-maskable.png
```

路徑規則：詞條圖是 `assets/img/{類別}/{詞條id}.webp`，詞條音檔是 `assets/audio/{類別}/{詞條id}.mp3`。類別圖與角色頭像不屬於任何單一類別，維持在 `assets/img/` 根目錄。

**角色**：`cat`（萬小貓）、`dog`（萬大狗）、`boy`（萬小廷）、`girl`（萬小芳）
**類別**：`daily` `food` `body` `people` `act`

檔案不存在時會自動退回文字佔位圖與系統語音合成，所以**現在就能跑**，可以邊測邊補。

**圖片授權先確認再放**：ARASAAC（CC BY-NC-SA）、Mulberry Symbols（CC BY-SA）、Sclera 可用；個人化詞彙（太太、兒子、女兒）本來就必須自行拍攝。以萬芳名義發布，未授權圖片的風險不只是下架。

**語音建議預錄真人**。程式會優先播放 `assets/audio/{語言}/{類別}/{詞條id}.mp3`，找不到才退回系統語音合成。人聲對失語症者的辨識度明顯較好，而且錄音是一次性成本。

**台語與客語只能靠錄音。** 瀏覽器的語音合成在 iOS 與 Android 上都沒有台語（`nan`）與客語（`hak`）的語音，這是平台限制，不是設定問題。選了這兩種語言而該詞沒有錄音時，程式會退回華語唸，並在設定裡顯示目前的錄音覆蓋率。華語與英語則有系統語音可用，沒錄音也能運作。

---

## 改詞庫

全部集中在 `index.html` 的 `LEXICON` 陣列，加詞就是加一個物件。心理語言學常模欄位（`name_agreement` / `aoa` / `familiarity` / `imageability` / `frequency`）先留 `null`，取得資料再補——**欄位現在就開好，之後補資料比改結構容易**。

`practice: false` 的詞只出現在溝通模式。目前身體不適與動作類設為 `false`，命名練習先聚焦名詞。動詞命名治療也有文獻支持，要納入時改這個旗標即可。

詞庫超過 100 詞左右建議拆成獨立的 `lexicon.json`，用 `fetch` 載入。現在 20 詞放在單檔裡比較好改。

---

## 音韻提示載體是暫定的

`phon_zhuyin` 目前放注音首音，但這是 **Phase 0 前導測試才能決定的事**。中文書寫系統缺乏次字元與音素的對應關係，PCA 無法直接移植。候選方案：注音首音、聲旁、口型影片。

介面已經把這一層抽象出來了——換載體只要改欄位和 Level 2 那一段的呈現，不必動其他部分。

---

## 已知限制

- **iOS Safari 不支援 Web Speech API 的中文辨識**，所以網頁版沒有自動正確性回饋，目前靠病人自評「我說對了」。要做自動判定必須走 Capacitor 包成原生 app，接 `@capacitor-community/speech-recognition`。
- 沒有治療師端。R3（客製化提示層級）、R4（使用時數遠端監看）、R5（定期關懷）都還沒有，而 Big CACTUS 的過程評估顯示這幾項才是有效成分。**這個原型本身複製不出試驗效果**，它的用途是驗證介面可不可用。
- 沒有個人化詞庫編輯功能（R1）。要做需要後端或至少匯入匯出機制。

---

## 下一步

1. 補圖片與錄音，先做 20 詞
2. 找語言治療師看過提示文案與詞彙選擇
3. 5–8 位病人 + 3–5 位治療師的可用性測試，收 SUS
4. 同時量測中文 ASR 對這個族群的字錯誤率，決定自動回饋是否可行
5. 依回饋迭代後再 Capacitor 打包

收系統性的病人資料需要 IRB。這一階段請把它當成介面可用性測試，不是臨床試驗。
