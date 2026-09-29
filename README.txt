【拾憶者物語 離線資料包版】—— 放到 GitHub Pages 使用

檔案（全部放在同一層，也就是 repo 根目錄或同一個資料夾）：
  index.html、sw.js、assets/（4 個檔案）、7 個 bgm_*.mp3

步驟：
1. 把整包上傳到 GitHub repo。
2. repo → Settings → Pages → 選 Branch（main）/ root → Save。
3. 用 https://你的帳號.github.io/repo名稱/ 開啟遊戲（不是 github.com 的檔案頁，也不是 raw 連結）。
4. 第一次開啟會跳出「下載離線資料包？」提示，按「下載」即可（也可到 ⚙️ 設定手動下載）。
5. 之後沒網路，開同一個網址就能玩。離線時網址結尾要有斜線（.../repo名稱/），少了斜線的網址離線打不開；建議加入書籤或「加到主畫面」。

想改成「打開就自動下載、不詢問」：把 index.html 裡 AUTO_OFFLINE_DOWNLOAD 改成 true。
更新遊戲檔案後，有網路時開啟遊戲會自動更新離線副本；若換了 mp3，請到 ⚙️ 設定重新按一次下載。
