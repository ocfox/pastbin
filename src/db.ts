export async function createTable(db: D1Database) {
  db.prepare(
    "CREATE TABLE IF NOT EXISTS pastbin (key TEXT PRIMARY KEY, content TEXT, metadata TEXT)"
  ).run();
}

export async function getDB(db: D1Database, key: string) {
  return db.prepare("SELECT * FROM pastbin WHERE key = ?").bind(key).first();
}
