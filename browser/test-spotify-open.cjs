const { fork } = require("child_process")
const path = require("path")
const workerPath = path.join(__dirname, "..", "tools", "nut-worker.cjs")

function run(action) {
  return new Promise((resolve) => {
    const w = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] })
    w.on("message", (msg) => resolve(msg))
    w.on("error", () => resolve({ success: false }))
    setTimeout(() => resolve({ success: false, error: "timeout" }), 5000)
    w.send({ id: Date.now().toString(), args: action })
  })
}

async function main() {
  // Spotify icon is in the taskbar at roughly x=960, y=1070 based on the screenshot
  const result = await run({ action: "click", x: 960, y: 1065 })
  console.log("Clicked taskbar:", JSON.stringify(result))

  await new Promise(r => setTimeout(r, 5000))

  // Screenshot to see what opened
  const { execSync } = require("child_process")
  execSync('powershell -File "C:\\Users\\Farhan\\Desktop\\extension octo\\octocode-desktop-ext\\browser\\screenshot.ps1"', { windowsHide: true })
  console.log("Screenshot saved")
}

main().catch(e => console.error(e.message))
