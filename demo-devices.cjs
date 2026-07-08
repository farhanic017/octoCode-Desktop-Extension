const { chromium } = require("playwright")
const fs = require("fs")
const path = require("path")
const feedbackScript = fs.readFileSync(path.join(__dirname, "src/octocode-desktop/visual-feedback.cjs"), "utf8")

const devices = [
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max" },
  { id: "galaxy-s24", name: "Galaxy S24" },
  { id: "ipad-pro", name: "iPad Pro" },
  { id: "pixel-8", name: "Pixel 8" },
  { id: "desktop", name: "Desktop" },
]

;(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--no-first-run", "--disable-extensions", "--no-sandbox"],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.evaluate(feedbackScript)

  // Navigate to a responsive site
  console.log("Opening responsive test site...")
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" })
  await page.evaluate(() => window.__octoLabel?.("Device Simulator Demo", 500, 30))
  await new Promise(r => setTimeout(r, 2000))

  // Demo device switching
  for (const device of devices) {
    console.log(`Switching to ${device.name}...`)
    await page.evaluate((d) => {
      window.selectDevice?.(d);
      window.__octoLabel?.("Switched to: " + d, 500, 30);
    }, device.id)
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log("Demo complete!")
  page.on("close", () => process.exit(0))
  await new Promise(() => {})
})()
