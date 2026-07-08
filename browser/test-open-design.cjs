const { fork } = require("child_process")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const workerPath = path.join(__dirname, "..", "tools", "nut-persistent-worker.cjs")
const ps1 = path.join(__dirname, "focus-opendesign.ps1")

function runBatch(actions) {
  return new Promise((resolve) => {
    const w = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] })
    const id = `n-${Date.now()}`
    const timeout = setTimeout(() => { resolve({ success: false }); w.kill() }, 30000)
    const handler = (msg) => { if (msg.id === id) { clearTimeout(timeout); w.removeListener("message", handler); w.kill(); resolve(msg) } }
    w.on("message", handler)
    w.on("error", () => { clearTimeout(timeout); w.kill(); resolve({ success: false }) })
    w.send({ id, batch: actions })
  })
}

function clipWrite(text) {
  const tmpFile = path.join(process.env.TEMP || "C:\\Temp", "octo-clip.txt")
  fs.writeFileSync(tmpFile, text, "utf8")
  execSync(`powershell -Command "Set-Clipboard (Get-Content '${tmpFile}' -Raw)"`, { windowsHide: true, timeout: 5000 })
}

function ss(label) {
  execSync('powershell -File "C:\\Users\\Farhan\\Desktop\\extension octo\\octocode-desktop-ext\\browser\\screenshot.ps1"', { windowsHide: true, timeout: 5000 })
  console.log(`  [screenshot: ${label}]`)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const t0 = Date.now()

  // Set clipboard BEFORE any window interactions
  const prompt = `Design a modern SaaS landing page and dashboard for "NexusFlow" - an AI-powered workflow automation platform. Glassmorphism style with frosted glass panels, backdrop blur, semi-transparent backgrounds. Dark mode with electric blue #3B82F6, purple #8B5CF6, cyan #06B6D4 gradients. Deep dark backgrounds (#0A0A1A), glass panels with rgba(255,255,255,0.05). Landing page: Hero with gradient text "Automate Anything. Connect Everything.", glassmorphism CTA with glow, features cards (Visual Pipeline Builder, AI-Powered Routing, 1000+ Integrations), social proof stats (10K+ teams), pricing tiers (Starter $29, Pro $79, Enterprise) in glass cards. Dashboard: glass sidebar nav, pipeline builder with animated gradient connection lines, top bar with search, activity feed, floating action button with pulse. Premium, futuristic, polished glassmorphism.`
  clipWrite(prompt)
  console.log("1. Clipboard set")

  // Focus Open Design
  execSync(`powershell -File "${ps1}"`, { windowsHide: true, timeout: 5000 })
  await sleep(200)

  // ONE atomic batch: click input + paste + click send — no gaps for focus to drift
  console.log("2. Click input + paste + send in one batch...")
  await runBatch([
    { action: "click", x: 1080, y: 280, delay: 100 },
    { action: "key_combo", keys: ["LeftControl", "A"], delay: 100 },
    { action: "key", key: "Delete", delay: 100 },
    { action: "key_combo", keys: ["LeftControl", "V"], delay: 3000 },
    { action: "click", x: 1240, y: 340, delay: 2000 },
  ])
  ss("done")

  console.log("3. Waiting for design generation...")
  await sleep(90000)
  ss("final")

  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

main().catch(e => console.error("Error:", e.message))
