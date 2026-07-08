const { execSync } = require("child_process")
execSync('cmd /c start "" "spotify:"', { windowsHide: true })
console.log("Spotify opened via protocol")
