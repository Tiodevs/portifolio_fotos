import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { sql?: Sql };

/** Acesso dinamico — evita o Next/Vercel “congelar” valor vazio no build. */
function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveDatabaseUrl(): string {
  const url =
    readEnv("DATABASE_URL") ||
    readEnv("POSTGRES_URL") ||
    readEnv("DATABASE_PUBLIC_URL");

  if (!url) {
    throw new Error(
      "DATABASE_URL ausente no runtime. Na Vercel: Settings → Environment Variables → cria DATABASE_URL para Production (e Preview) → Redeploy."
    );
  }

  // Em dev, process.env (ex.: railway shell) sobrescreve .env.local.
  // O proxy publico Railway falha com EBADF nesta maquina — forca o tunel SSH.
  if (
    process.env.NODE_ENV !== "production" &&
    /proxy\.rlwy\.net|railway\.internal/.test(url)
  ) {
    const local =
      readEnv("DATABASE_URL_LOCAL") ||
      url.replace(/@[^/?#]+/, "@127.0.0.1:15432");
    console.warn(
      "[db] DATABASE_URL remoto ignorado em dev; usando",
      local.replace(/:[^:@]+@/, ":***@")
    );
    return local;
  }

  return url;
}

function createSql(): Sql {
  const url = resolveDatabaseUrl();
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  return postgres(url, {
    max: 1, // serverless-friendly
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: isLocal ? false : "require",
  });
}

function getSql(): Sql {
  if (!globalForDb.sql) {
    globalForDb.sql = createSql();
  }
  return globalForDb.sql;
}

/** Lazy client — nao exige DATABASE_URL no import (build da Vercel). */
export const sql: Sql = new Proxy(function sqlTag() {} as unknown as Sql, {
  apply(_target, _thisArg, args) {
    return Reflect.apply(getSql() as unknown as Function, getSql(), args);
  },
  get(_target, prop, _receiver) {
    const client = getSql() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
