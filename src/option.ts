import { Context } from "hono";
import { Bindings } from "./bindings";
import { generateKey, IsFormData } from "./utils";
import { parseFormdata } from "./parse";
import { Highlight } from "./page";

type Metadata = {
  ip: string;
};

type D1Data = {
  key: string;
  content: Uint8Array | string;
  metadata: Metadata | string;
};

export async function post(
  ctx: Context<{
    Bindings: Bindings;
  }>
) {
  if (!IsFormData(ctx.req.header("Content-Type") || "")) {
    return ctx.newResponse("Content-Type must be multipart/form-data", {
      status: 400,
    });
  }
  const boundary = ctx.req.header("Content-Type")?.split("boundary=")[1] || "";
  const uint8Array = new Uint8Array(await ctx.req.arrayBuffer());
  const form = parseFormdata(uint8Array, boundary);
  const key = ctx.req.param("key") || generateKey(ctx.env.KEY_LENGTH);
  const content = form.get("c")?.content;
  const ip = ctx.req.header("CF-Connecting-IP");

  if (!content) {
    return ctx.newResponse("Content not found", { status: 400 });
  }

  if (content.length > 1024 * 1024 * 15) {
    return ctx.newResponse("Content is too large", { status: 400 });
  }

  if (content.length > 1024 * 1024 * 0.99) {
    await ctx.env.DB.prepare(
      "INSERT OR REPLACE INTO pastbin (key, content, metadata) VALUES (?, ?, ?)"
    )
      .bind(key, "$STORAGE_IN_R2", JSON.stringify({ ip }))
      .run();

    await ctx.env.R2.put(key, content);
  } else {
    await ctx.env.DB.prepare(
      "INSERT OR REPLACE INTO pastbin (key, content, metadata) VALUES (?, ?, ?)"
    )
      .bind(key, content, JSON.stringify({ ip }))
      .run();
  }

  return ctx.newResponse(ctx.env.SERVER + key + "\n");
}

export async function get(
  ctx: Context<{
    Bindings: Bindings;
  }>
) {
  let key = ctx.req.param("key");

  let lang;
  if (key.includes(".")) {
    lang = key.split(".")[1];
    key = key.split(".")[0];
  }

  const data = await ctx.env.DB.prepare("SELECT * FROM pastbin WHERE key = ?")
    .bind(key)
    .first<D1Data>();

  if (!data || !data.content) {
    return ctx.newResponse("Not found", { status: 404 });
  }

  if (data.content === "$STORAGE_IN_R2") {
    const content = await ctx.env.R2.get(key);
    if (!content) {
      return ctx.newResponse("Not found", { status: 404 });
    }
    return ctx.newResponse(await content.arrayBuffer());
  }

  if (typeof data.content === "string") {
    return ctx.newResponse(data.content);
  }

  const content = new Uint8Array(data.content);
  const imageFormats = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "ico"];

  if (lang && !imageFormats.includes(lang)) {
    return ctx.html(Highlight(new TextDecoder().decode(content), lang));
  }

  const text = new TextDecoder().decode(content);
  return ctx.newResponse(text);
}

export async function del(
  ctx: Context<{
    Bindings: Bindings;
  }>
) {
  const key = ctx.req.param("key");
  const data = await ctx.env.DB.prepare("SELECT * FROM pastbin WHERE key = ?")
    .bind(key)
    .first<D1Data>();

  if (!data) {
    return ctx.newResponse("Not found", { status: 404 });
  }
  const metadata = JSON.parse(data.metadata?.toString() || "{}");

  if (metadata.ip !== ctx.req.header("CF-Connecting-IP")) {
    return ctx.newResponse("Unauthorized", { status: 401 });
  }

  if (data.content === "$STORAGE_IN_R2") {
    await ctx.env.R2.delete(key);
  }

  await ctx.env.DB.prepare("DELETE FROM pastbin WHERE key = ?").bind(key).run();

  return ctx.newResponse("Deleted");
}

export async function put(
  ctx: Context<{
    Bindings: Bindings;
  }>
) {
  return ctx.newResponse("Hello, World!");
}
