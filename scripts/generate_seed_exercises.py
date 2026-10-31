#!/usr/bin/env python3
"""Genera la base de ejercicios seed de FitTrack.

Fuentes reales (wger API, Wikimedia) están bloqueadas por la red del sandbox,
así que este script produce `data/exercises/all.json` con
`source: "seed"` (valores de referencia estándar, no mediciones reales) y
imágenes placeholder en `data/images/` (SVG → PNG, también `seed`).

Uso:  python3 scripts/generate_seed_exercises.py
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "exercises", "all.json")
IMG_DIR = os.path.join(ROOT, "data", "images")
META_OUT = os.path.join(ROOT, "data", "datasets.json")

GROUPS = ["chest", "back", "legs", "shoulders", "arms", "core", "cardio", "full_body"]
EQUIPMENT = ["barbell", "dumbbell", "machine", "cable", "bodyweight", "other"]
LEVELS = ["beginner", "intermediate", "advanced"]

# (id, name_en, name_nl, group, secondary, equipment, level, aliases, steps)
EXERCISES = [
    # ---- CHEST ----
    ("bench_press", "Bench Press", "Benchpress", "chest", ["triceps"], "barbell", "intermediate",
     ["flat barbell press", "press"],
     ["Lie on a flat bench with feet planted on the floor.",
      "Lower the bar to your lower chest with control.",
      "Press the bar up until arms are fully extended.",
      "Keep your shoulder blades pinched and glutes on the bench."]),
    ("incline_bench_press", "Incline Bench Press", "Incline benchpress", "chest", ["triceps", "shoulders"], "barbell", "intermediate",
     ["incline press"],
     ["Set a bench to a 30–45° incline.",
      "Lower the bar to the upper chest.",
      "Press up while keeping elbows slightly tucked.",
      "Avoid arching the back excessively."]),
    ("dumbbell_fly", "Dumbbell Fly", "Dumbbell fly", "chest", [], "dumbbell", "intermediate",
     ["flyes", "fly"],
     ["Lie on a flat bench holding a dumbbell in each hand above your chest.",
      "Open your arms in a wide arc until you feel a stretch in the chest.",
      "Return to the start by squeezing the chest, not by locking the elbows hard."]),
    ("push_up", "Push-Up", "Kruk", "chest", ["triceps", "core"], "bodyweight", "beginner",
     ["pushups", "push up", "chins"],
     ["Start in a plank position with hands under shoulders.",
      "Lower your body until your chest is near the floor.",
      "Keep a straight line from head to heels.",
      "Push the floor away to return to the top."]),
    ("dips", "Dips", "Dips", "chest", ["triceps"], "bodyweight", "intermediate",
     ["dip"],
     ["Support yourself on parallel bars, shoulders slightly forward.",
      "Lower your body until elbows reach about 90°.",
      "Drive up through the chest until arms are extended.",
      "Do not shrug the shoulders toward the ears."]),
    ("cable_crossover", "Cable Crossover", "Cable crossover", "chest", [], "cable", "intermediate",
     ["cable fly", "cable flyes"],
     ["Set both cables to chest height and step between the pulleys.",
      "Bringing hands toward each other in front of the chest.",
      "Squeeze the chest at the midpoint.",
      "Return slowly with control."]),
    ("machine_chest_press", "Machine Chest Press", "Machine chestpress", "chest", ["triceps"], "machine", "beginner",
     ["pec deck press"],
     ["Sit with your back flat against the pad, elbows at 90°.",
      "Press the handles forward until arms are extended.",
      "Return to the start with control.",
      "Adjust the seat so the handles are at upper-chest height."]),
    ("dumbbell_press", "Dumbbell Bench Press", "Dumbbell benchpress", "chest", ["triceps"], "dumbbell", "intermediate",
     ["dumbbell press"],
     ["Lie on a flat bench with a dumbbell in each hand.",
      "Lower the weights to the sides of your chest.",
      "Press up until the dumbbells are nearly touching overhead.",
      "Keep your lower back in contact with the bench."]),
    # ---- BACK ----
    ("deadlift", "Deadlift", "Deadlift", "back", ["glutes", "hamstrings", "core"], "barbell", "advanced",
     ["dl", "strik"],
     ["Stand with the bar over the mid-foot.",
      "Hinge at the hips and grip the bar just outside the knees.",
      "Drive the floor away and stand tall, bar close to the body.",
      "Lock out hips and knees together; do not lean back."]),
    ("pull_up", "Pull-Up", "Muscu", "back", ["biceps"], "bodyweight", "intermediate",
     ["chin up", "pullup"],
     ["Hang from a bar with an overhand, shoulder-width grip.",
      "Pull your chest toward the bar by driving the elbows down.",
      "Lower yourself with control until fully extended.",
      "Avoid kipping or swinging."]),
    ("barbell_row", "Barbell Row", "Barbell row", "back", ["biceps"], "barbell", "intermediate",
     ["bent over row"],
     ["Hinge to about 45° with a flat back.",
      "Pull the bar to the lower ribs.",
      "Squeeze the shoulder blades at the top.",
      "Lower with control, letting the lats lengthen."]),
    ("lat_pulldown", "Lat Pulldown", "Lat pulldown", "back", ["biceps"], "cable", "beginner",
     ["pulldown", "pull down"],
     ["Grip the bar wider than shoulder width.",
      "Pull the bar to the upper chest, elbows down and back.",
      "Resist the return slowly.",
      "Keep a slight lean back without arching the back."]),
    ("seated_cable_row", "Seated Cable Row", "Seated cable row", "back", ["biceps"], "cable", "beginner",
     ["cable row", "rowing machine"],
     ["Sit with knees slightly bent, feet on the pad.",
      "Pull the handle to your abdomen.",
      "Squeeze the shoulder blades together.",
      "Return until the arms are fully extended."]),
    ("face_pull", "Face Pull", "Face pull", "back", ["shoulders"], "cable", "beginner",
     ["facepull"],
     ["Set a rope at face height on a cable machine.",
      "Pull the rope toward your face, elbows out to the sides.",
      "Pause with the rope near your forehead.",
      "Return slowly while keeping tension."]),
    ("single_arm_dumbbell_row", "Single-Arm Dumbbell Row", "Eénarmige dumbbell row", "back", ["biceps"], "dumbbell", "beginner",
     ["dumbbell row"],
     ["Brace one hand and knee on a bench.",
      "Hang the other arm straight down.",
      "Pull the dumbbell to the hip.",
      "Lower with control and keep the torso still."]),
    ("inverted_row", "Inverted Row", "Inverted row", "back", ["biceps"], "bodyweight", "beginner",
     ["bodyweight row", "australian pull up"],
     ["Hang under a bar at waist height with a straight body.",
      "Pull your chest to the bar.",
      "Lower with control.",
      "Increase difficulty by raising the feet."]),
    # ---- LEGS ----
    ("back_squat", "Back Squat", "Knik", "legs", ["glutes", "core"], "barbell", "intermediate",
     ["squat", "kniebuig"],
     ["Rest the bar on your upper back, feet shoulder-width apart.",
      "Sit down and back until thighs are at least parallel.",
      "Drive up through the mid-foot.",
      "Keep the chest tall and knees tracking over the toes."]),
    ("front_squat", "Front Squat", "Front squat", "legs", ["glutes", "core"], "barbell", "advanced",
     [],
     ["Rest the bar on your front delts, elbows high.",
      "Squat to parallel while bracing the core.",
      "Stand up without letting the bar slide forward.",
      "Keep the torso as upright as possible."]),
    ("leg_press", "Leg Press", "Benepers", "legs", ["glutes"], "machine", "beginner",
     ["leg press machine"],
     ["Sit with your back on the pad, feet shoulder-width on the platform.",
      "Lower the platform to about 90° knee flexion.",
      "Press through the mid-foot until legs are almost straight.",
      "Do not lock the knees out hard."]),
    ("romanian_deadlift", "Romanian Deadlift", "Romanian deadlift", "legs", ["glutes", "hamstrings"], "barbell", "intermediate",
     ["rdl"],
     ["Start standing with the bar at hip level.",
      "Hinge at the hips until the bar reaches mid-shin.",
      "Keep the back flat and knees soft.",
      "Return to standing by driving the hips forward."]),
    ("leg_extension", "Leg Extension", "Buitenschachtversterker", "legs", ["quadriceps"], "machine", "beginner",
     ["quad extension"],
     ["Sit with the pad just above the ankles.",
      "Extend the knees to lift the pad.",
      "Pause briefly at the top.",
      "Lower slowly without letting the stack slam."]),
    ("leg_curl", "Lying Leg Curl", "Liggende ben curl", "legs", ["hamstrings"], "machine", "beginner",
     ["lying curl"],
     ["Lie face-down with the pad at the ankles.",
      "Curl the legs up toward the glutes.",
      "Lower with control.",
      "Keep the pelvis pressed into the pad."]),
    ("calf_raise", "Calf Raise", "Kuitbulten", "legs", [], "machine", "beginner",
     ["calf raises", "calf machine"],
     ["Stand on the platform with the balls of your feet.",
      "Rise to the top of your range.",
      "Lower below the platform level for a stretch.",
      "Pause briefly at the top without bouncing."]),
    ("walking_lunge", "Walking Lunge", "Lunges", "legs", ["glutes"], "bodyweight", "intermediate",
     ["lunge", "lunges"],
     ["Take a long step forward.",
      "Lower until the back knee nearly touches the floor.",
      "Drive through the front foot to step into the next lunge.",
      "Keep the torso upright throughout."]),
    ("bulgarian_split_squat", "Bulgarian Split Squat", "Bulgarian split squat", "legs", ["glutes"], "dumbbell", "advanced",
     ["split squat"],
     ["Place the rear foot on a bench, holding dumbbells at the sides.",
      "Squat straight down over the front leg.",
      "Drive up through the front heel.",
      "Keep most of the weight in the front leg."]),
    ("hip_thrust", "Hip Thrust", "Hip thrust", "legs", ["glutes"], "barbell", "intermediate",
     ["glute bridge"],
     ["Sit on the floor, upper back against a bench, bar on the hips.",
      "Drive the hips up until the body is flat.",
      "Squeeze the glutes at the top.",
      "Lower with control."]),
    # ---- SHOULDERS ----
    ("overhead_press", "Overhead Press", "Krukoverhead", "shoulders", ["triceps"], "barbell", "intermediate",
     ["ohp", "military press", "standing press"],
     ["Hold the bar at collarbone height.",
      "Press overhead while keeping the core braced.",
      "Finish with the bar over the mid-foot.",
      "Do not lean back with the lower back."]),
    ("lateral_raise", "Lateral Raise", "Zijwaars", "shoulders", [], "dumbbell", "beginner",
     ["side raise"],
     ["Stand with a dumbbell in each hand at the sides.",
      "Raise the arms out to shoulder height.",
      "Lower slowly.",
      "Lead with the elbows and keep a slight bend in the arm."]),
    ("arnold_press", "Arnold Press", "Arnold press", "shoulders", ["triceps"], "dumbbell", "intermediate",
     [],
     ["Start with palms facing you at shoulder height.",
      "Press up while rotating the palms outward.",
      "Finish overhead with palms facing forward.",
      "Reverse the motion on the way down."]),
    ("upright_row", "Upright Row", "Upright row", "shoulders", ["traps"], "barbell", "intermediate",
     [],
     ["Pull the bar to the chin, elbows high.",
      "Do not pull higher than the chin.",
      "Lower with control.",
      "Keep a neutral spine."]),
    ("rear_delt_fly", "Rear Delt Fly", "Achterste delt fly", "shoulders", ["back"], "dumbbell", "beginner",
     ["reverse fly"],
     ["Hinge forward until the torso is near parallel.",
      "Raise the dumbbells out to the sides.",
      "Squeeze the rear deltoids at the top.",
      "Lower with control."]),
    ("cable_lateral_raise", "Cable Lateral Raise", "Cable zijwaars", "shoulders", [], "cable", "beginner",
     [],
     ["Set a low pulley and stand beside it.",
      "Raise the arm out to the side against the cable.",
      "Return slowly.",
      "Keep the elbow slightly bent."]),
    # ---- ARMS ----
    ("bicep_curl", "Barbell Bicep Curl", "Barbell biceps curl", "arms", [], "barbell", "beginner",
     ["curl", "biceps curl"],
     ["Stand with the bar at hip level, elbows pinned to the sides.",
      "Curl the bar up without swinging.",
      "Lower under control.",
      "Keep the wrists neutral."]),
    ("hammer_curl", "Hammer Curl", "Hammer curl", "arms", [], "dumbbell", "beginner",
     [],
     ["Hold the dumbbells with a neutral grip.",
      "Curl one arm at a time to shoulder height.",
      "Lower and repeat; alternate arms.",
      "Do not let the elbows drift forward."]),
    ("preacher_curl", "Preacher Curl", "Preacher curl", "arms", [], "machine", "intermediate",
     ["preacher bench"],
     ["Rest the upper arms on the pad.",
      "Curl the weight up while the arms stay on the pad.",
      "Lower slowly.",
      "Do not hyperextend the elbows at the bottom."]),
    ("tricep_dip_machine", "Tricep Dip Machine", "Tricep dip machine", "arms", [], "machine", "beginner",
     [],
     ["Sit with the pads at upper-arm height.",
      "Extend the elbows to push the pads away.",
      "Return slowly.",
      "Keep the elbows pointing down."]),
    ("skull_crusher", "Skull Crusher", "Skull crusher", "arms", [], "barbell", "intermediate",
     ["close grip press", "lying extension"],
     ["Lie on a bench holding the bar over your chest with a close grip.",
      "Lower the bar to your forehead by bending the elbows.",
      "Extend the elbows to return to the start.",
      "Keep the upper arms vertical."]),
    ("tricep_pushdown", "Tricep Pushdown", "Tricep pushdown", "arms", [], "cable", "beginner",
     ["rope pushdown"],
     ["Face the cable machine, elbows at the sides.",
      "Extend the forearms to push the bar/rope down.",
      "Return until the elbows are fully bent.",
      "Do not flare the elbows out."]),
    ("close_grip_bench_press", "Close-Grip Bench Press", "Smalle greep bankdruk", "arms", ["chest"], "barbell", "intermediate",
     [],
     ["Grip the bar shoulder-width or narrower.",
      "Lower to the lower chest, elbows close to the body.",
      "Press up to full extension.",
      "Keep the wrists stacked over the elbows."]),
    ("concentration_curl", "Concentration Curl", "Concentration curl", "arms", [], "dumbbell", "beginner",
     [],
     ["Sit with the elbow braced against the inner thigh.",
      "Curl the dumbbell up without moving the elbow.",
      "Lower with control.",
      "Squeeze briefly at the top."]),
    # ---- CORE ----
    ("plank", "Plank", "Plank", "core", [], "bodyweight", "beginner",
     ["core plank"],
     ["Support yourself on the forearms and toes.",
      "Keep a straight line from head to heels.",
      "Breathe steadily and hold the position.",
      "Do not let the hips sag or rise."]),
    ("hanging_leg_raise", "Hanging Leg Raise", "Hangende beenhef", "core", [], "bodyweight", "advanced",
     ["leg raise"],
     ["Hang from a pull-up bar.",
      "Raise the legs to parallel or higher.",
      "Lower with control.",
      "Avoid swinging the body."]),
    ("sit_up", "Sit-Up", "Sit-up", "core", [], "bodyweight", "beginner",
     [],
     ["Lie on your back with knees bent and feet anchored.",
      "Curl the shoulders off the floor.",
      "Return with control.",
      "Do not pull the neck with the hands."]),
    ("russian_twist", "Russian Twist", "Russian twist", "core", [], "bodyweight", "intermediate",
     ["russian twists"],
     ["Sit with the knees bent and the torso leaning back slightly.",
      "Rotate the torso from side to side.",
      "Keep the movement controlled.",
      "Optionally hold a weight in front of the chest."]),
    ("bicycle_crunch", "Bicycle Crunch", "Fiets crank", "core", [], "bodyweight", "beginner",
     ["bike crunch"],
     ["Lie on your back with the hands behind the ears.",
      "Bring one elbow toward the opposite knee while extending the other leg.",
      "Alternate sides in a pedaling rhythm.",
      "Keep the lower back in contact with the floor."]),
    ("side_plank", "Side Plank", "Zij plank", "core", [], "bodyweight", "intermediate",
     ["lateral plank"],
     ["Support yourself on one forearm and the side of one foot.",
      "Lift the hips until the body forms a straight line.",
      "Hold the position on one side, then switch.",
      "Do not let the hips drop toward the floor."]),
    ("v_up", "V-Up", "V-up", "core", [], "bodyweight", "advanced",
     ["reverse crunch"],
     ["Lie flat with the legs and torso lifted into a V shape.",
      "Reach the hands toward the toes while extending the legs.",
      "Lower both ends with control.",
      "Keep the lower back flat on the floor."]),
    ("mountain_climber", "Mountain Climber", "Mountain climber", "core", ["shoulders"], "bodyweight", "intermediate",
     [],
     ["Start in a high plank position.",
      "Drive one knee toward the chest.",
      "Switch legs quickly while keeping the hips level.",
      "Keep the shoulders over the wrists."]),
    ("ab_wheel_rollout", "Ab Wheel Rollout", "Ab wheel rollout", "core", [], "other", "advanced",
     ["wheel rollout"],
     ["Kneel with the wheel under the shoulders.",
      "Roll forward until the body is nearly extended.",
      "Pull back using the abs, not the arms.",
      "Keep the back from arching."]),
    # ---- CARDIO ----
    ("burpee", "Burpee", "Burpee", "full_body", ["chest", "core"], "bodyweight", "intermediate",
     [],
     ["From standing, drop into a squat and place the hands on the floor.",
      "Jump the feet back into a plank.",
      "Perform a push-up, then jump the feet back in.",
      "Explode up into a jump."]),
    ("jumping_jack", "Jumping Jack", "Sprong", "cardio", [], "bodyweight", "beginner",
     ["jumping jacks"],
     ["Jump the feet out while raising the arms overhead.",
      "Jump back to the start position.",
      "Maintain a steady rhythm.",
      "Land softly on the balls of the feet."]),
    ("ski_erg", "Ski Erg", "Ski erg", "cardio", ["back", "shoulders"], "machine", "beginner",
     ["ergometer ski"],
     ["Grip the handles and lean slightly forward.",
      "Pull the handles down and back in one fluid motion.",
      "Push back out slowly.",
      "Keep a strong, stable base."]),
    ("rowing_machine", "Rowing Machine", "Roeitoestel", "cardio", ["back"], "machine", "beginner",
     ["rower"],
     ["Start with legs extended, then drive the legs first.",
      "Pull the handle to the lower ribs.",
      "Release the arms, then extend the legs.",
      "Keep the back straight throughout the stroke."]),
    ("treadmill_sprint", "Treadmill Sprint", "Sprint op de loopband", "cardio", [], "machine", "beginner",
     ["sprint"],
     ["Start with a walk to settle in.",
      "Increase to your sprint pace for the work interval.",
      "Recover with a walk between intervals.",
      "Keep the torso upright and the arms driving."]),
    ("burpee_jump", "Burpee with Jump", "Burpee met sprong", "full_body", ["cardio"], "bodyweight", "advanced",
     [],
     ["Perform a full burpee to the plank.",
     "Jump the feet in and explode upward with a jump.",
     "Land softly and repeat immediately.",
     "Keep the core braced the whole time."]),
    # ---- FULL BODY ----
    ("thruster", "Thruster", "Thruster", "full_body", ["chest", "legs"], "barbell", "advanced",
     [],
     ["Start with the bar at the shoulders.",
      "Squat to depth, then drive up into a standing press.",
      "Finish with the bar overhead.",
      "Lower the bar to the shoulders between reps."]),
    ("clean_and_press", "Clean and Press", "Clean and press", "full_body", ["back", "shoulders"], "barbell", "advanced",
     [],
     ["From the floor, pull the bar to the shoulders in one motion.",
      "Catch with a stable squat position.",
      "Press the bar to lockout overhead.",
      "Lower under control."]),
    ("kettlebell_swing", "Kettlebell Swing", "Kettlebell swing", "full_body", ["back", "legs"], "other", "intermediate",
     ["swings"],
     ["Hinge with the kettlebell in front of the body.",
      "Snap the hips forward to send the bell to chest height.",
      "Let it swing back between the legs.",
      "Keep the back flat and the arms relaxed."]),
    ("man_maker", "Man Maker", "Man maker", "full_body", ["chest", "legs"], "bodyweight", "advanced",
     ["muscle up combo"],
     ["Drop into a burpee to a pull-up position.",
      "Complete a pull-up, then step down to a push-up.",
      "Finish with a push-up and a jump.",
      "Chain the movements without pauses."]),
    ("dumbbell_shrug", "Dumbbell Shrug", "Dumbbell shrug", "back", ["traps"], "dumbbell", "beginner",
     ["shrugs"],
     ["Stand with a dumbbell in each hand.",
      "Elevate the shoulders toward the ears.",
      "Hold briefly, then lower slowly.",
      "Do not bend the elbows."]),
    ("neck_flexion", "Neck Flexion", "Halsflexie", "core", [], "bodyweight", "beginner",
     ["neck curls"],
     ["Lie face-up with the neck supported at the edge of a bench.",
      "Raise the head away from the bench.",
      "Lower with control.",
      "Keep the range of motion small."]),
]


def main() -> int:
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    os.makedirs(IMG_DIR, exist_ok=True)

    # Validación de integridad del dataset antes de escribirlo.
    ids = [e[0] for e in EXERCISES]
    assert len(ids) == len(set(ids)), "ids duplicados"
    for e in EXERCISES:
        _id, en, nl, group, sec, equip, level, _al, steps = e
        assert en and nl and steps and len(steps) >= 3
        assert group in GROUPS, f"{_id}: grupo inválido {group}"
        assert equip in EQUIPMENT, f"{_id}: equipo inválido {equip}"
        assert level in LEVELS

    data = {
        "dataset": "fittrack.exercises",
        "version": 1,
        "source": "seed",
        "source_note": ("Placeholder dataset generado localmente (el sandbox no tiene "
                        "acceso a fuentes públicas: npmjs/wger/OFF → 403 del proxy). "
                        "Valores de referencia estándar, NO datos reales."),
        "generated_at": "2026-10-31",
        "count": len(EXERCISES),
        "groups": GROUPS,
        "equipment": EQUIPMENT,
        "levels": LEVELS,
        "exercises": [
            {
                "id": _id,
                "name_en": en,
                "name_nl": nl,
                "muscle_group": group,
                "secondary_muscles": sec,
                "equipment": equip,
                "level": level,
                "aliases": _al,
                "instructions": steps,
                "image": f"/images/exercises/{_id}.png",
                "source": "seed",
            }
            for (_id, en, nl, group, sec, equip, level, _al, steps) in EXERCISES
        ],
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    n_img = render_images(EXERCISES, IMG_DIR)

    meta = {
        "datasets": {
            "exercises": {
                "path": "data/exercises/all.json",
                "source": "seed",
                "count": len(EXERCISES),
                "images": n_img,
                "generated_at": "2026-10-31",
                "note": "Seed: fuentes reales inaccesibles desde el sandbox (ver AGENTS.md).",
            }
        }
    }
    with open(META_OUT, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"OK exercises={len(EXERCISES)} images={n_img}")
    print("wrote", OUT)
    print("wrote", META_OUT)
    return 0


# ---------- Imágenes placeholder (SVG → PNG, source: seed) ----------

GROUP_COLORS = {
    "chest": ("#1d4ed8", "#dbeafe"),
    "back": ("#7c3aed", "#ede9fe"),
    "legs": ("#15803d", "#dcfce7"),
    "shoulders": ("#b45309", "#fef3c7"),
    "arms": ("#be123c", "#ffe4e6"),
    "core": ("#0e7490", "#cffafe"),
    "cardio": ("#dc2626", "#fee2e2"),
    "full_body": ("#4d7c0f", "#ecfccb"),
}


def _font(size: int):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def draw_pose(draw: ImageDraw.ImageDraw, group: str, cx: int, cy: int, s: int = 1.0):
    """Silueta tipo stick-figure por grupo muscular (placeholder)."""
    w = 7
    dark = "#1f2937"

    def pt(x, y):
        return (int(cx + x * s), int(cy + y * s))

    def line(p1, p2):
        draw.line([pt(*p1), pt(*p2)], fill=dark, width=w)

    def circle(p, r):
        draw.ellipse([pt(*p)[0] - r, pt(*p)[1] - r,
                     pt(*p)[0] + r, pt(*p)[1] + r], fill=dark)

    def bar(x1, y1, x2, y2, color="#374151"):
        draw.line([pt(x1, y1), pt(x2, y2)], fill=color, width=w + 6)

    if group == "chest":  # tumbado, presionando
        circle((0, -70), 16)
        line((0, -55), (-85, -40))      # torso horizontal
        line((-85, -40), (-120, -70))   # brazo izq hacia arriba
        line((-60, -44), (-85, -75))   # brazo dcha
        line((-85, -40), (-115, -15))  # pierna
        line((-115, -15), (-95, -5))   # pantorrilla
        bar(-130, -90, -10, -95)
    elif group == "back":  # de pie, tirando
        circle((0, -100), 16)
        line((0, -85), (0, 0))
        line((0, -70), (-30, -45))     # brazos flexionando hacia atrás
        line((0, -70), (30, -45))
        line((0, 0), (-22, 55))
        line((0, 0), (22, 55))
        bar(-40, -95, 40, -95)         # barra de tracción
        line((-40, -95), (-38, -75))
        line((40, -95), (38, -75))
    elif group == "legs":  # sentadilla con barra
        circle((0, -115), 16)
        line((0, -100), (0, -45))
        line((0, -90), (-28, -70))
        line((0, -90), (28, -70))
        line((0, -45), (-25, -15))     # rodillas flexionadas
        line((-25, -15), (-30, 30))
        line((0, -45), (25, -15))
        line((25, -15), (30, 30))
        bar(-45, -105, 45, -105)
    elif group == "shoulders":  # press de hombro
        circle((0, -105), 16)
        line((0, -90), (0, -10))
        line((0, -80), (-35, -130))    # brazos sobre la cabeza
        line((0, -80), (35, -130))
        line((0, -10), (-20, 50))
        line((0, -10), (20, 50))
        bar(-30, -140, 30, -140)
    elif group == "arms":  # curl de bíceps
        circle((0, -105), 16)
        line((0, -90), (0, -10))
        line((0, -80), (-30, -55))     # codo fijo, antebrazo flexionado
        line((-30, -55), (-25, -85))
        line((0, -80), (12, -55))      # otro brazo en reposo
        line((0, -10), (-18, 50))
        line((0, -10), (18, 50))
        bar(-45, -95, -5, -95)
    elif group == "core":  # plank/sentado
        circle((-70, -45), 16)
        line((-55, -35), (70, -20))    # cuerpo horizontal
        line((-55, -35), (-75, -60))   # brazos de apoyo
        line((-30, -28), (-30, -5))    # apoyo
        line((70, -20), (100, 5))
        bar(-110, -5, 110, -5)         # suelo
    elif group == "cardio":  # carrera
        circle((5, -100), 16)
        line((0, -85), (-10, -25))
        line((0, -75), (-35, -50))
        line((-35, -50), (-55, -20))
        line((0, -75), (30, -45))
        line((30, -45), (45, -15))
        line((-10, -25), (-35, 10))
        line((-35, 10), (-50, 45))
        line((-10, -25), (15, 5))
        line((15, 5), (35, 35))
    else:  # full_body: brazos arriba, explosión
        circle((0, -110), 16)
        line((0, -95), (0, -15))
        line((0, -85), (-30, -125))
        line((0, -85), (30, -125))
        line((0, -15), (-22, 45))
        line((0, -15), (22, 45))


def render_images(exercises, img_dir: str) -> int:
    n = 0
    for _id, en, _nl, group, *_, steps in exercises:
        dark, light = GROUP_COLORS[group]
        light_rgb = tuple(int(light[i:i + 2], 16) for i in (1, 3, 5))
        W, H = 640, 420
        img = Image.new("RGB", (W, H), light_rgb)
        d = ImageDraw.Draw(img)
        # degradado vertical suave (blanco → color claro del grupo)
        for y in range(H // 3):
            alpha = y / (H // 3)
            col = tuple(int(a + (b - a) * alpha)
                        for a, b in zip((255, 255, 255), light_rgb))
            d.line([(0, y), (W, y)], fill=col)
        # marco
        d.rectangle([8, 8, W - 9, H - 9], outline=dark, width=3)
        # figura
        draw_pose(d, group, W // 2, 150, s=1.35)
        # barra inferior con el nombre
        d.rectangle([8, H - 78, W - 9, H - 9], fill=dark)
        name = en if len(en) <= 34 else en[:32] + "…"
        d.text((20, H - 58), name, font=_font(30), fill="white")
        d.text((W - 120, H - 58), "SEED", font=_font(18), fill=light)
        out = os.path.join(img_dir, f"{_id}.png")
        img.save(out)
        n += 1
    return n


if __name__ == "__main__":
    sys.exit(main())
