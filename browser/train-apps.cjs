const { fork } = require("child_process")
const { execSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")
const workerPath = path.join(__dirname, "..", "tools", "nut-persistent-worker.cjs")

function run(actions) {
  return new Promise(resolve => {
    const w = fork(workerPath, [], { stdio: ["pipe","pipe","pipe","ipc"] })
    const id = "w" + Date.now() + Math.random().toString(36).slice(2,5)
    w.on("message", m => { if(m.id===id) { w.kill(); resolve(m) } })
    setTimeout(() => { try{w.kill()}catch{}; resolve({success:false}) }, 15000)
    w.send({ id, batch: actions })
  })
}

function clipWrite(text) {
  const tmpFile = path.join(os.tmpdir(), "octo-clip.txt")
  fs.writeFileSync(tmpFile, text, "utf8")
  execSync(`powershell -Command "Set-Clipboard (Get-Content '${tmpFile}' -Raw)"`, { windowsHide: true, timeout: 3000 })
}

function ss(label) {
  execSync('powershell -File "C:\\Users\\Farhan\\Desktop\\extension octo\\octocode-desktop-ext\\browser\\screenshot.ps1"', { windowsHide: true, timeout: 5000 })
  console.log("  [" + label + "]")
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function setupSplit() {
  console.log("Setting up split: Terminal LEFT...")
  await run([{action:"click", x:300, y:500, delay:300}])
  await run([{action:"snap_left", delay:1000}])
  ss("split-ready")
}

async function openApp(name, search) {
  console.log(`Opening ${name} via Win+S "${search}"...`)
  await run([
    {action:"key_combo", keys:["LeftSuper","S"], delay:500},
    {action:"type", text:search, delay:800},
    {action:"key", key:"Enter", delay:100},
  ])
  await sleep(6000)
  await run([{action:"snap_right", delay:2000}])
  await sleep(3000)
  ss(`${name}-ready`)
}

async function closeApp(processes) {
  await run([{action:"close_window", delay:500}])
  for (const p of processes) {
    try { execSync(`taskkill /IM "${p}" /F 2>nul`, { windowsHide: true }) } catch {}
  }
  await sleep(1500)
}

// ============================================================
// CANVA — Make a burger shop promo banner
// ============================================================
async function trainCanva() {
  console.log("\n========== CANVA TRAINING ==========")
  await setupSplit()
  await openApp("Canva", "canva")
  await sleep(3000)

  // Screenshot the full layout
  ss("canva-layout")

  // Canva home should show: search bar, recent designs, create button
  // Look for "Create a design" or the main input area
  // Click on the search/create area
  console.log("Learning Canva layout...")
  await run([{action:"click", x:1440, y:100, delay:1000}])
  ss("canva-top")

  // Check if there's a "Create a design" button
  // In Canva, the top area usually has: Home, Templates, Brand, etc.
  // The big "Create a design" button is usually in center or top-right

  // Try clicking "Create a design" — typically a purple/blue button
  // From Canva's typical layout: "Create a design" button at top right
  await run([{action:"click", x:1800, y:55, delay:2000}])
  ss("canva-create-click")

  // Wait for dropdown or new page
  await sleep(2000)

  // Try typing in the search to find "banner" template
  // If search opened, type "burger shop banner"
  await run([{action:"click", x:1500, y:100, delay:500}])
  clipWrite("burger shop promotional banner")
  await sleep(300)
  await run([{action:"key_combo", keys:["LeftControl","V"], delay:1000}])
  await run([{action:"key", key:"Enter", delay:3000}])
  await sleep(5000)
  ss("canva-banner-search")

  // Click on first template result
  await run([{action:"click", x:1300, y:400, delay:2000}])
  ss("canva-template-selected")

  await sleep(3000)
  ss("canva-editing")

  // Close Canva
  await closeApp(["Canva.exe"])
  console.log("Canva training done!\n")
}

// ============================================================
// BLENDER — Learn the 3D viewport
// ============================================================
async function trainBlender() {
  console.log("\n========== BLENDER TRAINING ==========")
  await setupSplit()
  await openApp("Blender", "blender")
  await sleep(5000)

  ss("blender-layout")

  // Blender has a splash screen on open — dismiss it by clicking outside
  console.log("Dismissing splash screen...")
  await run([{action:"click", x:1440, y:400, delay:1000}])
  ss("blender-splash-dismissed")

  // Take screenshots of the full UI
  console.log("Learning Blender layout...")

  // Bottom: timeline
  // Right: properties panel (Scene Collection, Properties)
  // Center: 3D viewport
  // Left: toolbar (T panel)
  // Top: menu bar (File, Edit, Render...)

  // Try some hotkeys:
  // Numpad 1 = Front view, Numpad 3 = Right view, Numpad 7 = Top view
  // Shift+A = Add menu
  // Tab = Edit mode toggle

  // Press Shift+A to open Add menu
  console.log("Testing Shift+A (Add menu)...")
  await run([{action:"key_combo", keys:["LeftShift","A"], delay:500}])
  ss("blender-add-menu")

  // Press Escape to close
  await run([{action:"key", key:"Escape", delay:300}])

  // Press 1 for front view
  console.log("Testing Numpad 1 (Front view)...")
  await run([{action:"key", key:"1", delay:500}])
  ss("blender-front-view")

  // Take final screenshot
  ss("blender-final")

  // Close Blender
  await closeApp(["blender.exe", "Blender.exe"])
  console.log("Blender training done!\n")
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  await trainCanva()
  await sleep(2000)
  await trainBlender()

  console.log("========== ALL TRAINING COMPLETE ==========")
}

main().catch(e => console.error("Error:", e.message))
