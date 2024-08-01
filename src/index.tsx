import { Hono } from "hono";
import { Bindings } from "./bindings";
import { post, get, del, put } from "./option";
import { createTable } from "./db";

export const app = new Hono<{ Bindings: Bindings }>();

app.get("/", async (ctx) => {
  createTable(ctx.env.DB);
  return ctx.newResponse(ctx.req.header("User-Agent") || "");
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

app.get("/:key/:password", async (ctx) => {
  return await del(ctx);
});

export default app;
