## 视频上传（Supabase aesthetic-videos）

这个仓库（cxelegy/stylist-works）已经连上上传服务器。需要上传时，每个会话先做一次验证：
1. 取一次性验证码（10 分钟内有效）：
   curl -s -X POST "https://elegy.tailc8cfff.ts.net/upload/auth/start?repo=cxelegy/stylist-works"
2. 在当前分支推一个空提交（不改任何文件）：
   git commit --allow-empty -m "upload-proof <nonce>" && git push
3. 验证：
   curl -s -X POST "https://elegy.tailc8cfff.ts.net/upload/auth/verify?repo=cxelegy/stylist-works&branch=<当前分支>&nonce=<nonce>"
   返回的 upload_url 每次使用都会续期，连续 12 小时不用才失效（失效后重做 1–3 即可）。只留在本次会话里，不要写进任何文件。
4. 上传：curl -X PUT --data-binary @video.mp4 <upload_url>/video.mp4
- 支持 .mp4 / .webm / .json，每个文件最大 100MB（按扩展名判断类型）
- 文件名只能用英文字母、数字和 . _ -，可以放进子文件夹（最多 5 层）
- 同名文件不能覆盖，请每次用新文件名
- 成功时返回 JSON，其中 public_url 是公开地址
- 网络受限的环境需要放行 elegy.tailc8cfff.ts.net
