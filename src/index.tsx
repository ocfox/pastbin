import { Hono } from "hono";
import { Bindings } from "./bindings";
import { post, get, del } from "./option";
import { createTable } from "./db";
import { Page } from "./page";

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (ctx) => {
  return ctx.html(Page(ctx.env.SERVER));
});

// Visit https://your.site/~create to create the table at first time
app.get("/~create", async (ctx) => {
  await createTable(ctx.env.DB);
  return ctx.newResponse("Table created");
});

app.get("favicon.ico", async (ctx) => {
  const favicon = await fetch(ctx.env.FAVICON);
  return ctx.newResponse(await favicon.arrayBuffer(), {
    headers: { "Content-Type": "image/x-icon" },
  });
});

app.post("/", async (ctx) => {
  return await post(ctx);
});

app.post("/:key", async (ctx) => {
  return await post(ctx);
});

app.get("/:key", async (ctx) => {
  return await get(ctx);
});

app.get("/:key/del", async (ctx) => {
  return await del(ctx);
});

export default app;
