import { Context, Hono } from 'hono'
import { css, Style } from 'hono/css'

const app = new Hono<{ Bindings: Bindings }>()

type Bindings = {
  PASTBIN: KVNamespace
  SERVER: string
}

function isKeyExist(c: Context, key: string) {
  const bin = c.env.PASTBIN
  if (bin.get(key) === null) {
    return false
  }
  return true
}

function generateKey(length: number): string {
  return Array.from({ length }, () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  }).join('');
}

function getContent(boundary: string, content: string) {
  const parts = content.split(`--${boundary}`).join().split('\r\n\r\n')
  parts.shift()
  return parts.join().slice(0, -5)
}

app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <Style>{css`
          html {
            font-family: Arial, Helvetica, sans-serif;
          }
        `}</Style>
      </head>
      <body>
        <h1>Pastbin</h1>
        <p>Simple pastebin app built with Hono work on cloudflare worker!</p>
        <p>Usage:</p>
        <pre>
          curl -X POST -d "Hello World" https://pastb.in
        </pre>
        <pre>
          curl -F "file=@file.txt" https://pastb.in
        </pre>
        <pre>
          echo "test" | curl -F "c=@-" https://pastb.in
        </pre>
      </body>
    </html>
  )
})

app.post('/', async (c) => {
  const header = c.req.header()
  const key = generateKey(4)

  if (header['content-type'].includes('multipart/form-data')) {
    const boundary = header['content-type'].split('boundary=')[1]
    const content = getContent(boundary, await c.req.text())
    await c.env.PASTBIN.put(key, content)
    return c.newResponse(c.env.SERVER + key + '\n')
  }
  if (header['content-type'].includes('application/x-www-form-urlencoded')) {
    await c.env.PASTBIN.put(key, await c.req.text())
    return c.newResponse(c.env.SERVER + key + '\n')
  }

  return c.newResponse('Unsupported Media Type', { status: 415 })
})

app.put('/:key', async (c) => {
  const key = c.req.param('key')
  const body = await c.req.text()
  if (!isKeyExist(c, key)) {
    return c.newResponse('Not Found', { status: 404 })
  }
  await c.env.PASTBIN.put(key, body)

  return c.newResponse(c.env.SERVER + key + '\n')
})

app.get('/:key', async (c) => {
  const bin = c.env.PASTBIN
  const key = c.req.param('key')
  const value = await bin.get(key)
  if (value === null) {
    return c.newResponse('Not Found', { status: 404 })
  }
  return c.newResponse(value)
})

export default app
