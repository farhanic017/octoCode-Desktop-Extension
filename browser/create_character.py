import bpy
import math

# Clear everything
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# === BODY (UV Sphere) ===
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.7, location=(0, 0, 0.8))
body = bpy.context.active_object
body.name = "Body"

# === HEAD (Cube) ===
bpy.ops.mesh.primitive_cube_add(size=0.5, location=(0, 0, 1.7))
head = bpy.context.active_object
head.name = "Head"

# === LEFT ARM (Cylinder, rotated horizontal) ===
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1, depth=1.0,
    location=(-0.9, 0, 1.2),
    rotation=(0, math.pi/2, 0)
)
left_arm = bpy.context.active_object
left_arm.name = "LeftArm"

# === RIGHT ARM ===
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.1, depth=1.0,
    location=(0.9, 0, 1.2),
    rotation=(0, math.pi/2, 0)
)
right_arm = bpy.context.active_object
right_arm.name = "RightArm"

# === LEFT LEG (Cylinder, vertical) ===
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12, depth=1.2,
    location=(-0.25, 0, -0.4)
)
left_leg = bpy.context.active_object
left_leg.name = "LeftLeg"

# === RIGHT LEG ===
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.12, depth=1.2,
    location=(0.25, 0, -0.4)
)
right_leg = bpy.context.active_object
right_leg.name = "RightLeg"

# === LEFT EYE (small cube) ===
bpy.ops.mesh.primitive_cube_add(size=0.1, location=(-0.12, 0.25, 1.75))
left_eye = bpy.context.active_object
left_eye.name = "LeftEye"

# === RIGHT EYE ===
bpy.ops.mesh.primitive_cube_add(size=0.1, location=(0.12, 0.25, 1.75))
right_eye = bpy.context.active_object
right_eye.name = "RightEye"

# === MOUTH (flat cube) ===
bpy.ops.mesh.primitive_cube_add(size=0.03, location=(0, 0.28, 1.65), scale=(3, 1, 1))
mouth = bpy.context.active_object
mouth.name = "Mouth"

# === LIGHT ===
bpy.ops.object.light_add(type='POINT', location=(2, -2, 4))
light = bpy.context.active_object
light.name = "KeyLight"
light.data.energy = 500

# === CAMERA ===
bpy.ops.object.camera_add(location=(3, -3, 2))
cam = bpy.context.active_object
cam.name = "Camera"
cam.rotation_euler = (math.radians(60), 0, math.radians(45))
bpy.context.scene.camera = cam

# === MATERIALS ===
# Body material - blue
body_mat = bpy.data.materials.new("BodyMat")
body_mat.use_nodes = True
bsdf = body_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.2, 0.4, 0.8, 1.0)
body.data.materials.append(body_mat)

# Head material - skin tone
head_mat = bpy.data.materials.new("HeadMat")
head_mat.use_nodes = True
bsdf = head_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.9, 0.75, 0.6, 1.0)
head.data.materials.append(head_mat)

# Eye material - white
eye_mat = bpy.data.materials.new("EyeMat")
eye_mat.use_nodes = True
bsdf = eye_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
left_eye.data.materials.append(eye_mat)
right_eye.data.materials.append(eye_mat)

# Mouth material - red
mouth_mat = bpy.data.materials.new("MouthMat")
mouth_mat.use_nodes = True
bsdf = mouth_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.8, 0.1, 0.1, 1.0)
mouth.data.materials.append(mouth_mat)

# Arm/Leg material - dark gray
limb_mat = bpy.data.materials.new("LimbMat")
limb_mat.use_nodes = True
bsdf = limb_mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.3, 0.3, 0.3, 1.0)
bsdf.inputs["Roughness"].default_value = 0.7
left_arm.data.materials.append(limb_mat)
right_arm.data.materials.append(limb_mat)
left_leg.data.materials.append(limb_mat)
right_leg.data.materials.append(limb_mat)

# === RENDER SETTINGS (Eevee, low-res for fast preview) ===
bpy.context.scene.render.engine = 'BLENDER_EEVEE'
bpy.context.scene.render.resolution_x = 800
bpy.context.scene.render.resolution_y = 600
bpy.context.scene.render.film_transparent = False

print("Low-poly character created successfully!")
print("Objects:", [obj.name for obj in bpy.data.objects])

# Save to Desktop
bpy.ops.wm.save_as_mainfile(filepath=r"C:\Users\Farhan\Desktop\low_poly_character.blend")
print("Saved!")
