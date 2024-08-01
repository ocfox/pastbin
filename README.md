# Pastbin

Simple pastebin app built with Hono work on cloudflare worker!

Use D1 and R2, things size over 1MB storage in R2 bucket.

D1 and R2 has more and more and more request limit than KV.

### Free Plan Limit
| Storage | Request Limit      | Size Limit |
| ------- | ------------------ | ---------- |
| D1      | 5 million / day    | 1MB        |
| R2      | 10 million / month | --         |
| KV      | 100,000 / day      | 25MB       |


### Features

- [x] Code highlight
- [x] Image in browser
- [x] Custom URL
- [ ] Delete paste based IP (same ip dont need other password)
- [ ] File upload front-end
