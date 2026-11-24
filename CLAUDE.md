## 文件上传（专用存储桶 stylist-works）

这个仓库（cxelegy/stylist-works）已经连上上传服务器。需要上传时，每个会话先做一次验证：
1. 取一次性验证码（10 分钟内有效）：
   curl -s -X POST "https://elegy.tailc8cfff.ts.net/upload/auth/start?repo=cxelegy/stylist-works"
2. 在当前分支推一个空提交（不改任何文件）：
   git commit --allow-empty -m "upload-proof <nonce>" && git push
3. 验证：
   curl -s -X POST "https://elegy.tailc8cfff.ts.net/upload/auth/verify?repo=cxelegy/stylist-works&branch=<当前分支>&nonce=<nonce>"
   返回的 upload_url 每次使用都会续期，连续 12 小时不用才失效（失效后重做 1–3 即可）。只留在本次会话里，不要写进任何文件。
4. 上传：curl -X PUT --data-binary @file.jpg <upload_url>/images/works/file.jpg
- 支持 .jpg / .jpeg / .png / .webp / .gif / .json / .mp4 / .webm，每个文件最大 100MB（按扩展名判断类型）
- 文件名只能用英文字母、数字和 . _ -，可以放进子文件夹（最多 5 层）
- 同名文件不能覆盖，请每次用新文件名
- 成功时返回 JSON，其中 public_url 是公开地址：https://elegy.tailc8cfff.ts.net/storage/v1/object/public/stylist-works/<路径>
- 网络受限的环境需要放行 elegy.tailc8cfff.ts.net

### 存储里现在有什么（2026-11-24）
- 桶内路径和仓库一致：`images/tumblr/`（Tumblr 原图 61）、`images/works/`、`images/pages/`、`images/hero/`、`data/tumblr-posts.json`、`data/works.json`（由 `data/works.js` 导出）。
- 表 `public.stylist_works`（102 行：sort_order, image, page, media, title, credit, link）。只读，读取需要 anon key（不要写进仓库）。
- 存储和表在用户电脑的本地服务器上，由另一个会话「Cloudflare Tunnel サーバー構築」管理；这个仓库的会话不能直接改表。
- 改了 `data/works.js` 之后：导出新的清单，用新文件名上传（如 `data/works-YYYY-MM-DD.json`），再请用户或服务器会话重新导入表。
- 网站本身用的是仓库里的图片和 `data/works.js`，不依赖这个服务器。
