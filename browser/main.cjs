const { app, BrowserWindow, screen, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")

let mainWindow = null
let currentUrl = "about:blank"

app.disableHardwareAcceleration()

const devices = [
  { name: "iPhone 17 Pro Max", w: 430, h: 932 },
  { name: "iPhone 16 Pro Max", w: 430, h: 932 },
  { name: "Galaxy S26 Ultra", w: 384, h: 854 },
  { name: "Galaxy Tab S7", w: 800, h: 1280 },
]

function createWindow(targetUrl) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const tabW = 620
  const tabH = 900

  const cursor = screen.getCursorScreenPoint()
  const midX = width / 2
  let posX = cursor.x < midX ? width - tabW - 20 : 20
  let posY = Math.max(10, Math.floor((height - tabH) / 2))

  mainWindow = new BrowserWindow({
    width: tabW,
    height: tabH,
    x: posX,
    y: posY,
    frame: false,
    backgroundColor: "#111111",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
      sandbox: false,
      webSecurity: false,
    },
  })
  mainWindow.setMenu(null)

  const ses = mainWindow.webContents.session
  ses.on("will-download", (e) => e.preventDefault())
  ses.setPermissionRequestHandler((wc, perm, cb) => cb(true))

  let html = fs.readFileSync(path.join(__dirname, "overlay.html"), "utf8")
  html = html.replace("%%URL%%", targetUrl || "about:blank")
  html = html.replace("%%DEVICES%%", JSON.stringify(devices))
  html = html.replace("%%TAB_W%%", String(tabW))
  html = html.replace("%%TAB_H%%", String(tabH))

  mainWindow.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html))
  currentUrl = targetUrl || "about:blank"
  mainWindow.on("closed", () => { mainWindow = null; currentUrl = "about:blank" })
  return mainWindow
}

ipcMain.on("resize", (event, w, h) => {
  if (mainWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const x = Math.floor((width - w) / 2)
    const y = Math.floor((height - h) / 2)
    mainWindow.setBounds({ x, y, width: w, height: h })
  }
})

ipcMain.on("maximize", () => {
  if (mainWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    mainWindow.setBounds({ x: 0, y: 0, width, height })
  }
})

process.on("message", async (msg) => {
  if (!mainWindow) return
  try {
    let result
    switch (msg.action) {
      case "navigate":
        mainWindow.webContents.executeJavaScript("navigate('" + msg.url + "')")
        currentUrl = msg.url; result = { ok: true }; break
      case "title": {
        const t = await mainWindow.webContents.executeJavaScript("document.getElementById('site-frame')?.contentDocument?.title || ''")
        result = { title: t, url: currentUrl }; break
      }
      case "close": mainWindow.close(); result = { ok: true }; break
    }
    if (process.send) process.send({ result })
  } catch (e) {
    if (process.send) process.send({ error: e.message })
  }
})

app.whenReady().then(() => {
  try { createWindow(process.argv[2]) } catch (e) { console.error(e) }
})
app.on("window-all-closed", () => app.quit())
