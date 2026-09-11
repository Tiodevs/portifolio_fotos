import net from "node:net";
import { spawn } from "node:child_process";

const HOST = "127.0.0.1";
const PORT = 15432;

function isOpen() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: HOST, port: PORT }, () => {
      socket.end();
      resolve(true);
    });
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}

if (await isOpen()) {
  process.exit(0);
}

console.log("[db] Abrindo túnel SSH do Postgres em 127.0.0.1:15432...");

const ssh = spawn(
  "ssh",
  [
    "-N",
    "-L",
    `${PORT}:127.0.0.1:5432`,
    "-o",
    "BatchMode=yes",
    "-o",
    "ExitOnForwardFailure=yes",
    "-o",
    "ConnectTimeout=20",
    "railway-postgres",
  ],
  { detached: true, stdio: "ignore" },
);
ssh.unref();

for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 250));
  if (await isOpen()) {
    console.log("[db] Túnel SSH do Postgres pronto.");
    process.exit(0);
  }
}

console.error(
  "[db] Não foi possível abrir o túnel SSH. Rode:\n  ssh -N -L 15432:127.0.0.1:5432 railway-postgres",
);
process.exit(1);
