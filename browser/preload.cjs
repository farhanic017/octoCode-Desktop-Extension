const { contextBridge, ipcRenderer } = require("electron")
contextBridge.exposeInMainWorld("electronAPI", {
  resize: (w, h) => ipcRenderer.send("resize", w, h),
  maximize: () => ipcRenderer.send("maximize"),
})
