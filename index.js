#!/usr/bin/env node
const { exec, execSync } = require("child_process");
const port = process.argv[2];

if (!port || isNaN(port)) {
  console.error("Usage: port-kill <port>");
  process.exit(1);
}

const { platform } = process;

function findPids() {
  if (platform === "win32") {
    const out = execSync("netstat -ano", { encoding: "utf8" });
    const pids = new Set();
    const re = new RegExp(`:${port}\\s`);
    for (const line of out.split("\n")) {
      if (re.test(line)) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0") pids.add(pid);
      }
    }
    return [...pids];
  } else {
    try {
      const out = execSync(`lsof -ti:${port}`, { encoding: "utf8" });
      return out.trim().split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }
}

function kill(pid) {
  const cmd = platform === "win32"
    ? `taskkill /F /PID ${pid}`
    : `kill -9 ${pid}`;
  execSync(cmd);
  console.log(`Killed process ${pid} on port ${port}`);
}

const pids = findPids();
if (pids.length === 0) {
  console.error(`No process found on port ${port}`);
  process.exit(1);
}
pids.forEach(kill);
