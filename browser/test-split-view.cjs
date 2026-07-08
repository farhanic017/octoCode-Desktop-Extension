// Test: Open Spotify → snap to right → type in search → close
const { fork } = require("child_process")
const path = require("path")
const workerPath = path.join(__dirname, "..", "tools", "nut-worker.cjs")

async function test() {
  // 1. Open Spotify via protocol (instant, keyboard-safe)
  const { execSync } = require("child_process")
  execSync('cmd /c start "" "spotify:"', { windowsHide: true })
  console.log("1. Spotify opened")

  // 2. Wait for it to load, then snap to right half
  await new Promise(r => setTimeout(r, 1500))
  const worker = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] })
  await new Promise(r => {
    worker.on("message", r)
    setTimeout(r, 3000)
    worker.send({ id: "snap", args: { action: "snap_right" } })
  })
  console.log("2. Snapped to right half")

  // 3. Type in search (fast via SendKeys)
  await new Promise(r => setTimeout(r, 500))
  const worker2 = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] })
  await new Promise(r => {
    worker2.on("message", r)
    setTimeout(r, 3000)
    worker2.send({ id: "type", args: { action: "type", text: "lofi hip hop" } })
  })
  console.log("3. Typed search query (fast)")

  // 4. Press Enter
  await new Promise(r => setTimeout(r, 300))
  const worker3 = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] })
  await new Promise(r => {
    worker3.on("message", r)
    setTimeout(r, 3000)
    worker3.send({ id: "enter", args: { action: "key", key: "Enter" } })
  })
  console.log("4. Search submitted")
}

test().catch(e => console.error("Error:", e.message))
