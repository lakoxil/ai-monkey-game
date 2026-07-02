# AI 猴子遊戲 / 踩地雷

這是一個第六堂課用的靜態網頁遊戲，用來帶學生理解：

Action → Feedback → 修正下一次 Action

也可以銜接到：

State → Action → Reward → Learning

## 建議部署方式：GitHub + Vercel

這個專案是靜態網頁，最適合放在 GitHub，再交給 Vercel 自動部署。部署後老師和學生只需要打開 Vercel 網址，不需要把網站架在自己的電腦上。

### 第一次部署

1. 在 GitHub 建立一個新的 repository。
2. 把這個資料夾的檔案上傳到該 repository。
3. 到 Vercel 新增專案，選擇剛剛的 GitHub repository。
4. Framework Preset 選 `Other` 或讓 Vercel 自動判斷。
5. Build Command 留空。
6. Output Directory 留空或使用預設值。
7. 按 Deploy。

部署完成後，Vercel 會提供一個公開網址。之後只要更新 GitHub，Vercel 會自動重新部署。

## 本機預覽方式

不需要登入、不需要資料庫、不需要真正 AI API。

如果只是想在自己的電腦上先看效果，可以在此資料夾啟動靜態伺服器後，打開瀏覽器：

```bash
python3 -m http.server 4173
```

網址：

```text
http://127.0.0.1:4173
```

正式上課建議使用 Vercel 網址，不需要讓自己的電腦一直開著。

## 模式

- Mode 1：大於 / 小於模式
- Mode 2：分數模式，`Score = 100 - abs(guess - answer)`
- Mode 3：隱藏規則模式，每 5 格扣 5 分，並依照是否比上一輪更接近答案做 `+1 / -1 / +0`

## 戲劇效果

- 每次猜測會播放短音效。
- 猜中時會播放成功音效，並讓整個畫面閃爍三次、維持成功底色約三秒。
- 音效使用瀏覽器內建 Web Audio 產生，不需要額外音檔。

## 檔案結構

```text
index.html
styles.css
app/main.js
components/
  GuessHistory.js
  ModeSelector.js
  StreamingFeedback.js
lib/
  game.js
  scoring.js
  sound.js
tests/
  scoring.test.js
```

## 測試

```bash
node --test tests/scoring.test.js
```
