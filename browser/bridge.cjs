const { spawn } = require("child_process")
const path = require("path")
const electronPath = require("electron")

let electronProc = null

function ensureElectron(url) {
  return new Promise((resolve, reject) => {
    if (electronProc && !electronProc.killed) {
      resolve()
      return
    }

    const mainScript = path.join(__dirname, "main.cjs")
    electronProc = spawn(electronPath, [mainScript, url || "about:blank"], {
      detached: true,
      stdio: "ignore",
      env: { ...process.env, ELECTRON_NO_ATTACH_CONSOLE: "1" },
    })
    electronProc.unref()
    electronProc.on("error", reject)
    electronProc.on("exit", () => { electronProc = null })

    setTimeout(resolve, 1500)
  })
}

function sendCommand(action, args = {}) {
  return new Promise((resolve, reject) => {
    if (!electronProc || electronProc.killed) {
      reject(new Error("Browser not running"))
      return
    }
    electronProc.send({ action, ...args })
    electronProc.once("message", (msg) => {
      if (msg.error) reject(new Error(msg.error))
      else resolve(msg.result)
    })
    setTimeout(() => reject(new Error("Command timeout")), 10000)
  })
}

// Simple HTTP server for communication
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  const action = url.searchParams.get("action")

  try {
    let result
    switch (action) {
      case "start":
        await ensureElectron(url.searchParams.get("url"))
        result = { ok: true }
        break
      case "navigate":
        electronProc.send({ action: "navigate", url: url.searchParams.get("url") })
        result = await new Promise((resolve) => {
          electronProc.once("message", (msg) => resolve(msg.result))
          setTimeout(() => resolve({ title: "loading", url: url.searchParams.get("url") }), 2000)
        })
        break
      case "screenshot":
        electronProc.send({ action: "screenshot", selector: url.searchParams.get("selector") })
        result = await new Promise((resolve) => {
          electronProc.once("message", (msg) => resolve(msg.result))
          setTimeout(() => reject(new Error("timeout")), 10000)
        })
        break
      case "evaluate":
        electronProc.send({ action: "evaluate", script: url.searchParams.get("script") })
        result = await new Promise((resolve) => {
          electronProc.once("message", (msg) => resolve(msg.result))
          setTimeout(() => reject(new Error("timeout")), 10000)
        })
        break
      case "title":
        electronProc.send({ action: "title" })
        result = await new Promise((resolve) => {
          electronProc.once("message", (msg) => resolve(msg.result))
        })
        break
      case "close":
        if (electronProc) electronProc.send({ action: "close" })
        result = { ok: true }
        break
      default:
        result = { error: "Unknown action" }
    }

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(result))
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: e.message }))
  }
})

server.listen(port, () => {
  console.log(`Browser bridge listening on port ${port}`)
  process.stdout.write(JSON.stringify({ ready: true, port }) + "\n")
})

process.stdin.setEncoding("utf8")
process.stdin.on("data", async (chunk) => {
  const line = chunk.trim()
  if (!line) return
  try {
    const msg = JSON.parse(line)
    if (msg.action === "start") {
      await ensureElectron(msg.url)
      process.stdout.write(JSON.stringify({ id: msg.id, result: { ok: true } }) + "\n")
    } else if (msg.action === "close") {
      if (electronProc) electronProc.send({ action: "close" })
      process.stdout.write(JSON.stringify({ id: msg.id, result: { ok: true } }) + "\n")
    }
  } catch {}
})
