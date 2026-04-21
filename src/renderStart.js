import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const out = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (out.status !== 0) process.exit(out.status ?? 1);
}

// Render free tier doesn't support preDeployCommand, so we migrate on boot.
// `migrate deploy` is safe to run multiple times.
run("npx", ["prisma", "migrate", "deploy"]);
run("node", ["src/index.js"]);

