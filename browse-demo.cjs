const { chromium } = require("playwright")
const fs = require("fs")
const path = require("path")
const feedbackScript = fs.readFileSync(path.join(__dirname, "src/octocode-desktop/visual-feedback.cjs"), "utf8")

;(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--no-first-run", "--disable-extensions", "--no-sandbox", "--disable-dev-shm-usage"],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.evaluate(feedbackScript)

  // 1. GitHub
  console.log("1. Opening GitHub...")
  await page.goto("https://github.com/farhanic017/octocode", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.evaluate(() => window.__octoLabel?.("Opened GitHub repo", 500, 30))
  await new Promise((r) => setTimeout(r, 2000))

  // 2. Click on README
  console.log("2. Clicking README section...")
  await page.evaluate(() => {
    const el = document.querySelector("article")
    if (el) {
      const r = el.getBoundingClientRect()
      window.__octoMoveToAndClick?.("article")
    }
  })
  await new Promise((r) => setTimeout(r, 1500))

  // 3. Scroll
  console.log("3. Scrolling...")
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 200))
    await new Promise((r) => setTimeout(r, 300))
  }
  await page.evaluate(() => window.__octoLabel?.("Reading README...", 500, 30))
  await new Promise((r) => setTimeout(r, 2000))

  // 4. npm
  console.log("4. Checking npm package...")
  await page.goto("https://www.npmjs.com/package/octocode-ai", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.evaluate(() => window.__octoLabel?.("Checking npm package", 500, 30))
  await new Promise((r) => setTimeout(r, 2000))

  // 5. Google search
  console.log("5. Searching Google...")
  await page.goto("https://www.google.com/search?q=octocode+ai+coding+agent", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.evaluate(() => window.__octoLabel?.("Google search results", 500, 30))
  await new Promise((r) => setTimeout(r, 2000))

  // 6. Click first result
  console.log("6. Clicking first result...")
  await page.evaluate(() => {
    const h3 = document.querySelector("h3")
    if (h3) window.__octoMoveToAndClick?.("h3")
  })
  await new Promise((r) => setTimeout(r, 1500))

  // 7. Wikipedia
  console.log("7. Opening Wikipedia...")
  await page.goto("https://en.wikipedia.org/wiki/Artificial_intelligence", { waitUntil: "domcontentloaded", timeout: 15000 })
  await page.evaluate(() => window.__octoLabel?.("Reading about AI", 500, 30))
  await new Promise((r) => setTimeout(r, 2000))

  // 8. Scroll article
  console.log("8. Scrolling article...")
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 300))
    await new Promise((r) => setTimeout(r, 200))
  }
  await page.evaluate(() => window.__octoLabel?.("Found useful info!", 500, 30))

  console.log("Demo complete! Browser stays open.")
  page.on("close", () => process.exit(0))
  await new Promise(() => {})
})()
