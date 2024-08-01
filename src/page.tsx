import { Style, css } from "hono/css";

export default function Page(server: string) {
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
        <p>Usage:</p>
        <pre>cmd | curl -F "c=@-" {url}</pre>
        <pre>dmesg | curl -F "c=@-" {url}</pre>
        <pre>curl -F "c=@test.png" {url}</pre>
      </body>
    </html>
  );
}
