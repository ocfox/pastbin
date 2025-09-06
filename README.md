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

- [x] Code highlight (https://kuu.cat/t1no.hs)
- [x] Image/Video/Audio in browser (https://kuu.cat/heisenberg.png)
- [x] Custom URL (`echo "why" | curl -F "c=@-" kuu.cat/how`)
- [x] Random base36 key (e.g. https://kuu.cat/t1no)
- [x] Delete paste based IP (same ip dont need other password)
- [x] Only one dependency (hono) 
- [ ] File upload front-end

### Usage

- Create a new paste from pipe
```bash
echo "Ciallo～(∠・ω< )" | curl -F "c=@-" kuu.cat
```

- Create a new paste from file
```bash
curl -F "c=@example.zip" kuu.cat
```

- Delete a paste
```bash
curl kuu.cat/xxxx/del
```

### Deploy

```bash
git clone https://github.com/ocfox/pastbin
```
Edit `wrangler.toml` to your own settings.

```bash
yarn exec wrangler login

yarn install && yarn run deploy
```
