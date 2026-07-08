const { spawn } = require("child_process")
const path = require("path")

const electronPath = require("electron")
const mainScript = path.join(__dirname, "main.cjs")

console.log("Launching browser...")

const proc = spawn(electronPath, [mainScript, "https://example.com"], {
  detached: true,
  stdio: "ignore",
  env: { ...process.env, ELECTRON_NO_ATTACH_CONSOLE: "1" },
})

proc.unref()

console.log("Browser launched (PID:", proc.pid, ")")
console.log("It will stay open until you close it manually.")
