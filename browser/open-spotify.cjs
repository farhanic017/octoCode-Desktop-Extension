// Runs in its own process — no risk of locking parent's keyboard
const { keyboard, Key } = require("@nut-tree-fork/nut-js")

async function openApp(appName) {
  // Release any stuck modifiers
  await keyboard.releaseKey(Key.LeftSuper, Key.LeftControl, Key.LeftAlt, Key.LeftShift)
  await new Promise(r => setTimeout(r, 100))

  // Win+S opens Search specifically (Win alone may open Widgets on Win11)
  await keyboard.pressKey(Key.LeftSuper, Key.S)
  await new Promise(r => setTimeout(r, 400))

  // Release keys immediately
  await keyboard.releaseKey(Key.LeftSuper, Key.S)
  await new Promise(r => setTimeout(r, 200))

  // Type app name
  for (const char of appName) {
    await keyboard.type(char)
    await new Promise(r => setTimeout(r, 30))
  }
  await new Promise(r => setTimeout(r, 600))

  // Enter
  await keyboard.pressKey(Key.Enter)
  await new Promise(r => setTimeout(r, 100))
  await keyboard.releaseKey(Key.Enter)

  console.log(appName + " search triggered via Win+S")
}

const appName = process.argv[2] || "spotify"
openApp(appName).catch(e => console.error("Error:", e.message))
