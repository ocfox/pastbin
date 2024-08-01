import { Style, css } from "hono/css";
import { html } from "hono/html";

export function Page(server: string) {
  const url = server.split("/")[2];
  return (
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
        <p>
          Source: <a href="https://github.com/ocfox/pastbin">ocfox/pastbin</a>
        </p>
        <p>Usage:</p>
        <pre>cmd | curl -F "c=@-" {url}</pre>
        <pre>dmesg | curl -F "c=@-" {url}</pre>
        <pre>curl -F "c=@test.png" {url}</pre>
      </body>
    </html>
  );
}

export function Highlight(content: string, lang: string) {
  const language = "language-" + lang;
  return (
    <html lang="en">
      <head>
        <title>Pastbin</title>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta charset="utf-8" />
        <link
          href="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/themes/prism.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/plugins/line-numbers/prism-line-numbers.css"
          rel="stylesheet"
        />
        <Style>{css`
          html {
            background-color: #f5f2f0;
          }
        `}</Style>
      </head>
      <body class="line-numbers">
        <pre>
          <code class={language}>{content}</code>
        </pre>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/components/prism-core.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/prismjs@1.23.0/plugins/autoloader/prism-autoloader.min.js"></script>
      </body>
    </html>
  );
}
