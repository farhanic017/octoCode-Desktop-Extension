const { fork } = require("child_process")
const { execSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")
const workerPath = path.join(__dirname, "..", "tools", "nut-persistent-worker.cjs")

function run(a) {
  return new Promise(r => {
    const w = fork(workerPath, [], { stdio: ["pipe","pipe","pipe","ipc"] })
    const id = "bp" + Date.now()
    w.on("message", m => { if(m.id===id){w.kill();r(m)} })
    setTimeout(()=>{try{w.kill()}catch{};r({success:false})},15000)
    w.send({id,batch:a})
  })
}

function clipWrite(text) {
  const tmpFile = path.join(os.tmpdir(), "octo-clip.txt")
  fs.writeFileSync(tmpFile, text, "utf8")
  execSync(`powershell -Command "Set-Clipboard (Get-Content '${tmpFile}' -Raw)"`, { windowsHide: true, timeout: 3000 })
}

function ss(l) {
  execSync('powershell -File "C:\\Users\\Farhan\\Desktop\\extension octo\\octocode-desktop-ext\\browser\\screenshot.ps1"',{windowsHide:true,timeout:5000})
  console.log("  ["+l+"]")
}

const sleep = ms => new Promise(r=>setTimeout(r,ms))

async function main() {
  // Kill existing Blender
  try { execSync("taskkill /IM blender.exe /F 2>nul", {windowsHide:true}) } catch {}
  await sleep(2000)

  // Open Blender
  console.log("Opening Blender...")
  await run([
    {action:"key_combo",keys:["LeftSuper","S"],delay:500},
    {action:"type",text:"blender",delay:800},
    {action:"key",key:"Enter",delay:100},
  ])
  await sleep(8000)

  // Dismiss splash
  await run([{action:"click",x:1440,y:540,delay:1000}])
  await sleep(2000)

  // Switch to Scripting tab — click "Scripting" at top
  // Scripting tab is the last tab in the top bar
  console.log("Switching to Scripting tab...")
  // Click the + next to Scripting tab or click Scripting directly
  // From the screenshot, tabs are: Layout, Modeling, Sculpting, UV Editing, Texture Paint, Shading, Animation, Rendering, Compositing, Geometry Nodes, Scripting
  // Scripting is far right
  await run([{action:"click",x:1140,y:30,delay:1000}])
  await sleep(1000)
  ss("scripting-tab")

  // Now we're in Scripting workspace. There should be a Text Editor area.
  // Click in the text editor area to focus it
  // The text editor is typically in the center-left area
  console.log("Clicking text editor...")
  await run([{action:"click",x:1300,y:600,delay:500}])
  await sleep(500)

  // Type the Python script to create the character
  // In Blender's text editor, we can type Python commands
  // But it's better to use the Python Console

  // Actually, let's use Blender's built-in Python console
  // Click the Python Console area — usually bottom panel in Scripting workspace

  // The Python console is at the bottom of the Scripting workspace
  // Click on it
  console.log("Clicking Python console...")
  await run([{action:"click",x:1300,y:900,delay:500}])
  await sleep(500)

  // In the Python console, we can type import bpy and create objects
  // The console accepts Python input at the bottom

  // Type the full script
  const script = `import bpy
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.7, location=(0, 0, 0.8))
body = bpy.context.active_object
body.name = "Body"
bpy.ops.mesh.primitive_cube_add(size=0.5, location=(0, 0, 1.7))
head = bpy.context.active_object
head.name = "Head"
bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=1.0, location=(-0.9, 0, 1.2), rotation=(0, 1.5708, 0))
left_arm = bpy.context.active_object
left_arm.name = "LeftArm"
bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=1.0, location=(0.9, 0, 1.2), rotation=(0, 1.5708, 0))
right_arm = bpy.context.active_object
right_arm.name = "RightArm"
bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=1.2, location=(-0.25, 0, -0.4), rotation=(0, 0, 0))
left_leg = bpy.context.active_object
left_leg.name = "LeftLeg"
bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=1.2, location=(0.25, 0, -0.4), rotation=(0, 0, 0))
right_leg = bpy.context.active_object
right_leg.name = "RightLeg"
bpy.ops.mesh.primitive_cube_add(size=0.1, location=(-0.12, 0.25, 1.75))
left_eye = bpy.context.active_object
left_eye.name = "LeftEye"
bpy.ops.mesh.primitive_cube_add(size=0.1, location=(0.12, 0.25, 1.75))
right_eye = bpy.context.active_object
right_eye.name = "RightEye"
bpy.ops.mesh.primitive_cube_add(size=0.03, location=(0, 0.25, 1.65), scale=(3, 1, 1))
mouth = bpy.context.active_object
mouth.name = "Mouth"
bpy.ops.object.light_add(type='POINT', location=(2, -2, 4))
light = bpy.context.active_object
light.data.energy = 500
bpy.context.view_layer.objects.active = None
print("Character created successfully!")`

  // Paste the script into the Python console
  clipWrite(script)
  await sleep(500)

  // Focus the console and paste
  await run([{action:"click",x:1300,y:900,delay:300}])
  await run([{action:"key_combo",keys:["LeftControl","V"],delay:5000}])
  await sleep(3000)
  ss("script-pasted")

  // The script should auto-execute in the console
  // Wait for it to complete
  await sleep(5000)
  ss("script-executed")

  // Switch back to Layout tab to see the result
  console.log("Switching to Layout...")
  await run([{action:"click",x:1015,y:30,delay:1000}])
  await sleep(3000)
  ss("layout-view")

  // Zoom to fit all objects (Home key)
  await run([{action:"key",key:"Home",delay:500}])
  await sleep(1000)
  ss("character-visible")

  // Switch to Material Preview
  await run([{action:"key",key:"Z",delay:300}])
  await sleep(300)
  await run([{action:"click",x:1015,y:500,delay:500}])
  await sleep(2000)
  ss("material-preview")

  console.log("Done! Character created via Python scripting.")
}

main().catch(e => console.error("Error:", e.message))
