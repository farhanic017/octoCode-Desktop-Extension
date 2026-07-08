const { fork } = require("child_process")
const path = require("path")

const workerPath = path.join(__dirname, "..", "tools", "nut-persistent-worker.cjs")
const worker = fork(workerPath, [], { stdio: ["pipe", "pipe", "pipe", "ipc"] })

const start = Date.now()

worker.on("message", (msg) => {
  const elapsed = Date.now() - start
  console.log(`Batch result in ${elapsed}ms:`, JSON.stringify(msg))
  worker.kill()
  process.exit(0)
})

worker.send({
  id: "test-batch-1",
  batch: [
    { action: "key_combo", keys: ["LeftSuper", "S"], delay: 500 },
    { action: "type", text: "notepad", delay: 800 },
    { action: "key", key: "Enter", delay: 2000 },
    { action: "snap_right", delay: 500 },
  ],
})

console.log("Batch sent...")
