import { Context } from "hono";
import { Bindings } from "./bindings";
import { generateKey, IsFormData } from "./utils";
import { parseFormdata } from "./parse";

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
  if (!content) {
    return ctx.newResponse("Content not found", { status: 400 });
  }

  if (content.length > 1024 * 1024 * 0.99) {
    await ctx.env.DB.prepare(
      "INSERT OR REPLACE INTO pastbin (key, content) VALUES (?, ?)"
    )
      .bind(key, "$STORAGE_IN_R2")
      .run();

    await ctx.env.R2.put(key, content);
  } else {
    await ctx.env.DB.prepare(
      "INSERT OR REPLACE INTO pastbin (key, content) VALUES (?, ?)"
    )
      .bind(key, content)
      .run();
  }

  return ctx.newResponse(ctx.env.SERVER + key);
}

export async function get(
  ctx: Context<{
    Bindings: Bindings;
  }>
) {
  let key = ctx.req.param("key");
  if (key.includes(".")) {
    key = key.split(".")[0];
  }
  type D1Data = {
    key: string;
    content: Uint8Array | string;
  };
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

  return ctx.newResponse(content);
}

export async function del(
  ctx: Context<{
    Bindings: Bindings;
  }>
) {
  return ctx.newResponse("Hello, World!");
}

export async function put(
  ctx: Context<{
    Bindings: Bindings;
  }>
) {
  return ctx.newResponse("Hello, World!");
}