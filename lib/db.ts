import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL nao configurado. Defina em .env.local ou nas variaveis do Railway."
    );
  }

  // Em dev, process.env (ex.: railway shell) sobrescreve .env.local.
  // O proxy publico Railway falha com EBADF nesta maquina — forca o tunel SSH.
  if (
    process.env.NODE_ENV !== "production" &&
    /proxy\.rlwy\.net|railway\.internal/.test(url)
  ) {
    const local =
      process.env.DATABASE_URL_LOCAL ||
      url.replace(/@[^/?#]+/, "@127.0.0.1:15432");
    console.warn(
      "[db] DATABASE_URL remoto ignorado em dev; usando",
      local.replace(/:[^:@]+@/, ":***@")
    );
    return local;
  }

  return url;
}

function createSql() {
  return postgres(resolveDatabaseUrl(), {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export const sql = globalForDb.sql ?? createSql();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}
