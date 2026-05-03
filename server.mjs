#!/usr/bin/env node
import { execSync } from "node:child_process";

const tools = {
  doctor: () => execSync("npx -y @aurekai/runtime@0.8.0-alpha.2 doctor --deep", { stdio: "pipe", encoding: "utf-8" }),
  manifest: () => execSync("npx -y @aurekai/runtime@0.8.0-alpha.2 manifest:print", { stdio: "pipe", encoding: "utf-8" }),
  help: () => execSync("npx -y @aurekai/runtime@0.8.0-alpha.2 --help", { stdio: "pipe", encoding: "utf-8" })
};

const command = process.argv[2] || "help";

if (!tools[command]) {
  console.error(`unknown command: ${command}`);
  process.exit(1);
}

process.stdout.write(tools[command]());