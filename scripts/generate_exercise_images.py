#!/usr/bin/env python3
"""Genera imágenes de ejercicios de calidad (matplotlib, side-view anatómico).

Reemplaza los placeholders de palitos de `generate_seed_exercises.py`.
Cada ejercicio se dibuja como:
  - figura humana en vista lateral construida desde articulaciones
    (cabeza, hombro, codo, muñeca, cadera, rodilla, tobillo),
  - grupo muscular principal resaltado con su color,
  - equipo (barra, mancuerna, banco, barra fija, cable, máquina, caja),
  - flecha de movimiento,
  - cabecera con nombre + chip "SEED" + leyenda del grupo.

Fuente de la pose: spec por ejercicio (source: seed — no hay fotos reales
accesibles desde el sandbox).

Uso:  PYTHONPATH=/sandbox/.pylibs python3 scripts/generate_exercise_images.py
Salida: data/images/<id>.png  (61 imágenes, 640×420).
"""
import json
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import to_rgba
from matplotlib.patches import Ellipse, FancyBboxPatch, Circle

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "exercises", "all.json")
OUT = os.path.join(ROOT, "data", "images")

W, H = 640, 420
DPI = 100

# Colores (paleta Apple)
INK = "#1d1d1f"
INK_FAR = "#86868b"      # extremidad lejana
ACCENT = "#0071e3"
BG_TOP = "#ffffff"
BG_BOTTOM = "#f5f5f7"
MUSCLE = {
    "chest": "#0071e3",
    "back": "#6e5ce6",
    "legs": "#248a3d",
    "shoulders": "#ff9500",
    "arms": "#ff375f",
    "core": "#32ade6",
    "cardio": "#ff3b30",
    "full_body": "#af52de",
}
GROUP_LABEL = {
    "chest": "Chest", "back": "Back", "legs": "Legs", "shoulders": "Shoulders",
    "arms": "Arms", "core": "Core", "cardio": "Cardio", "full_body": "Full body",
}

# ---------------------------------------------------------------- poses
# Espacio 100×100 (y crece hacia abajo). La persona mira a la izquierda.
# Claves: head, neck, shoulder, elbow, wrist, hip, knee, ankle
# (extremidad cercana). La lejana se deriva con offsets.

def P(**j):
    return j

POSES = {
    # de pie neutra
    "stand": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
               elbow=(42, 44), wrist=(42, 56), hip=(42, 56),
               knee=(42, 71), ankle=(42, 87)),
    # sentadilla (barra trasera): cadera atrás de la rodilla
    "squat": P(head=(37, 28), neck=(39, 35), shoulder=(40, 41),
               elbow=(34, 50), wrist=(32, 57), hip=(47, 60),
               knee=(35, 71), ankle=(33, 87)),
    # sentadilla frontal: torso más vertical, barra en deltoides
    "front_squat": P(head=(36, 27), neck=(38, 34), shoulder=(40, 40),
                     elbow=(31, 47), wrist=(30, 54), hip=(46, 61),
                     knee=(34, 72), ankle=(33, 87)),
    # tumbada empujando (banco)
    "bench": P(head=(64, 47), neck=(58, 49), shoulder=(50, 51),
               elbow=(44, 40), wrist=(43, 28), hip=(33, 53),
               knee=(22, 52), ankle=(13, 49)),
    # tumbada (banco inclinado)
    "incline": P(head=(54, 34), neck=(48, 38), shoulder=(42, 42),
                 elbow=(42, 29), wrist=(42, 17), hip=(21, 56),
                 knee=(13, 54), ankle=(5, 50)),
    # flexiones
    "pushup": P(head=(18, 58), neck=(26, 61), shoulder=(36, 63),
                elbow=(46, 66), wrist=(40, 72), hip=(56, 64),
                knee=(70, 66), ankle=(84, 68)),
    # dips en paralelas
    "dips": P(head=(40, 56), neck=(40, 50), shoulder=(40, 45),
              elbow=(33, 39), wrist=(31, 33), hip=(42, 63),
              knee=(40, 75), ankle=(42, 85)),
    # bisagra (deadlift abajo)
    "hinge": P(head=(26, 40), neck=(31, 46), shoulder=(36, 50),
               elbow=(30, 57), wrist=(28, 65), hip=(45, 56),
               knee=(41, 71), ankle=(41, 87)),
    # bisagra remando (barra al abdomen)
    "row_bent": P(head=(27, 40), neck=(32, 46), shoulder=(37, 50),
                  elbow=(31, 55), wrist=(37, 51), hip=(46, 56),
                  knee=(42, 71), ankle=(42, 87)),
    # dominada (a mitad)
    "pullup": P(head=(38, 22), neck=(37, 29), shoulder=(37, 33),
                elbow=(33, 44), wrist=(36, 16), hip=(42, 52),
                knee=(40, 64), ankle=(42, 76)),
    # sentada cable (pulldown / row / pushdown)
    "seat_cable": P(head=(44, 22), neck=(44, 29), shoulder=(46, 35),
                    elbow=(30, 26), wrist=(24, 16), hip=(52, 60),
                    knee=(36, 60), ankle=(36, 73)),
    # sentada row (mano al abdomen)
    "seat_row": P(head=(54, 20), neck=(54, 27), shoulder=(54, 33),
                  elbow=(44, 40), wrist=(37, 47), hip=(54, 62),
                  knee=(40, 62), ankle=(38, 74)),
    # de pie tirando de cable a la cara
    "face_pull": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
                   elbow=(33, 38), wrist=(30, 29), hip=(42, 56),
                   knee=(42, 71), ankle=(42, 87)),
    # elevación lateral
    "lateral_raise": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
                       elbow=(31, 26), wrist=(22, 20), hip=(42, 56),
                       knee=(42, 71), ankle=(42, 87)),
    # press por encima
    "ohp": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
             elbow=(35, 23), wrist=(34, 14), hip=(42, 56),
             knee=(42, 71), ankle=(42, 87)),
    # curl de bíceps (mancuerna)
    "curl": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
              elbow=(36, 47), wrist=(32, 33), hip=(42, 56),
              knee=(42, 71), ankle=(42, 87)),
    # tumbada extensión (skull crusher)
    "lying_ext": P(head=(62, 49), neck=(56, 51), shoulder=(48, 53),
                   elbow=(44, 38), wrist=(44, 25), hip=(32, 55),
                   knee=(20, 54), ankle=(11, 51)),
    # pushdown de tríceps
    "pushdown": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
                  elbow=(40, 41), wrist=(38, 52), hip=(42, 56),
                  knee=(42, 71), ankle=(42, 87)),
    # fly tumbado (brazos abiertos)
    "fly": P(head=(64, 47), neck=(58, 49), shoulder=(50, 51),
             elbow=(39, 43), wrist=(27, 34), hip=(33, 53),
             knee=(22, 52), ankle=(13, 49)),
    # crossover de pie
    "crossover": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
                   elbow=(35, 42), wrist=(31, 39), hip=(42, 56),
                   knee=(42, 71), ankle=(42, 87)),
    # máquina de pecho
    "machine_press": P(head=(46, 26), neck=(46, 33), shoulder=(45, 39),
                       elbow=(37, 45), wrist=(28, 41), hip=(48, 62),
                       knee=(34, 62), ankle=(32, 75)),
    # press de hombro en máquina (dip machine tríceps)
    "machine_arm": P(head=(46, 24), neck=(46, 31), shoulder=(45, 37),
                     elbow=(38, 44), wrist=(31, 46), hip=(48, 62),
                     knee=(34, 62), ankle=(32, 75)),
    # piernas: prensa
    "leg_press": P(head=(14, 44), neck=(18, 50), shoulder=(22, 56),
                   elbow=(24, 62), wrist=(26, 66), hip=(26, 62),
                   knee=(40, 52), ankle=(52, 42)),
    # extensión de cuádriceps
    "leg_ext": P(head=(34, 34), neck=(34, 41), shoulder=(36, 47),
                 elbow=(38, 55), wrist=(40, 60), hip=(40, 60),
                 knee=(48, 58), ankle=(62, 51)),
    # curl femoral tumbado
    "leg_curl": P(head=(14, 51), neck=(21, 53), shoulder=(28, 55),
                  elbow=(34, 58), wrist=(40, 58), hip=(46, 57),
                  knee=(57, 51), ankle=(62, 41)),
    # hip thrust
    "hip_thrust": P(head=(58, 42), neck=(52, 47), shoulder=(46, 51),
                    elbow=(42, 56), wrist=(38, 56), hip=(38, 38),
                    knee=(27, 53), ankle=(25, 68)),
    # zancada
    "lunge": P(head=(44, 14), neck=(44, 21), shoulder=(44, 27),
               elbow=(42, 40), wrist=(42, 52), hip=(46, 52),
               knee=(33, 62), ankle=(31, 76)),
    # box split: pie trasero elevado (caja)
    "split_box": P(head=(40, 14), neck=(40, 21), shoulder=(40, 27),
                   elbow=(38, 40), wrist=(38, 52), hip=(42, 52),
                   knee=(30, 62), ankle=(28, 76)),
    # gemelos
    "calf": P(head=(42, 18), neck=(42, 25), shoulder=(42, 31),
              elbow=(42, 44), wrist=(42, 56), hip=(42, 56),
              knee=(42, 70), ankle=(42, 77)),
    # plancha
    "plank": P(head=(16, 52), neck=(24, 54), shoulder=(32, 56),
               elbow=(36, 62), wrist=(44, 63), hip=(54, 58),
               knee=(68, 60), ankle=(82, 61)),
    # plancha lateral
    "side_plank": P(head=(18, 46), neck=(26, 48), shoulder=(34, 50),
                    elbow=(38, 58), wrist=(46, 58), hip=(56, 52),
                    knee=(70, 54), ankle=(84, 55)),
    # sentado (abdominales)
    "seated_abs": P(head=(28, 40), neck=(33, 44), shoulder=(38, 48),
                    elbow=(30, 42), wrist=(24, 38), hip=(56, 64),
                    knee=(42, 64), ankle=(34, 63)),
    # tumbado (crunches)
    "lying_abs": P(head=(22, 48), neck=(29, 52), shoulder=(37, 55),
                   elbow=(44, 50), wrist=(50, 46), hip=(56, 62),
                   knee=(44, 52), ankle=(34, 60)),
    # hanging leg raise
    "hang_leg": P(head=(38, 22), neck=(37, 29), shoulder=(37, 33),
                  elbow=(33, 44), wrist=(36, 16), hip=(40, 46),
                  knee=(46, 37), ankle=(58, 33)),
    # ab wheel
    "ab_wheel": P(head=(56, 42), neck=(51, 46), shoulder=(45, 50),
                  elbow=(52, 49), wrist=(61, 53), hip=(30, 64),
                  knee=(36, 72), ankle=(45, 72)),
    # salto (burpee/jack)
    "jump": P(head=(42, 20), neck=(42, 27), shoulder=(42, 33),
              elbow=(34, 24), wrist=(29, 13), hip=(42, 50),
              knee=(35, 62), ankle=(31, 72)),
    # ski erg
    "ski_erg": P(head=(29, 27), neck=(34, 33), shoulder=(39, 39),
                 elbow=(29, 45), wrist=(22, 47), hip=(52, 58),
                 knee=(48, 72), ankle=(48, 87)),
    # máquina de remar
    "rower": P(head=(57, 30), neck=(53, 36), shoulder=(49, 42),
               elbow=(41, 44), wrist=(34, 45), hip=(47, 60),
               knee=(33, 61), ankle=(29, 73)),
    # carrera (cinta)
    "run": P(head=(42, 16), neck=(42, 23), shoulder=(42, 29),
             elbow=(33, 37), wrist=(27, 44), hip=(42, 48),
             knee=(29, 57), ankle=(21, 67)),
    # shrug
    "shrug": P(head=(42, 24), neck=(42, 30), shoulder=(42, 36),
               elbow=(42, 48), wrist=(42, 58), hip=(42, 60),
               knee=(42, 74), ankle=(42, 88)),
    # neck flexion
    "neck": P(head=(18, 42), neck=(25, 50), shoulder=(33, 53),
              elbow=(39, 56), wrist=(45, 56), hip=(56, 57),
              knee=(66, 55), ankle=(75, 48)),
    # inverted row
    "inv_row": P(head=(78, 58), neck=(71, 57), shoulder=(63, 56),
                 elbow=(54, 53), wrist=(46, 49), hip=(46, 56),
                 knee=(32, 58), ankle=(18, 60)),
    # single arm row
    "one_arm_row": P(head=(30, 30), neck=(36, 36), shoulder=(42, 40),
                     elbow=(33, 46), wrist=(28, 33), hip=(54, 50),
                     knee=(58, 64), ankle=(58, 80)),
}

# Map ejercicio → (pose, equipo, flecha). equipo ∈ {bar, db, bench, bar_over,
#   pulley_bar, pulley_handle, cable, box, rail, machine, wheel, kb, step,
#   parallel, belt, none}
E = {
    "bench_press": ("bench", "bar", "press"),
    "incline_bench_press": ("incline", "bar", "press"),
    "dumbbell_fly": ("fly", "db", "fly"),
    "push_up": ("pushup", "none", "press_down"),
    "dips": ("dips", "parallel", "dip_down"),
    "cable_crossover": ("crossover", "cable_x", "fly"),
    "machine_chest_press": ("machine_press", "machine", "press"),
    "dumbbell_press": ("bench", "db", "press"),
    "deadlift": ("hinge", "bar_floor", "pull_up"),
    "pull_up": ("pullup", "bar_over", "pull_up"),
    "barbell_row": ("row_bent", "bar", "pull"),
    "lat_pulldown": ("seat_cable", "pulley_bar", "pull_down"),
    "seated_cable_row": ("seat_row", "pulley_handle", "pull"),
    "face_pull": ("face_pull", "pulley_rope", "pull"),
    "single_arm_dumbbell_row": ("one_arm_row", "db_one", "pull"),
    "inverted_row": ("inv_row", "bar_waist", "pull"),
    "back_squat": ("squat", "bar_back", "squat"),
    "front_squat": ("front_squat", "bar_front", "squat"),
    "leg_press": ("leg_press", "machine", "press"),
    "romanian_deadlift": ("hinge", "bar_mid", "pull_up"),
    "leg_extension": ("leg_ext", "machine", "extend"),
    "leg_curl": ("leg_curl", "machine", "curl_down"),
    "calf_raise": ("calf", "step", "raise"),
    "walking_lunge": ("lunge", "none", "lunge_down"),
    "bulgarian_split_squat": ("split_box", "box", "lunge_down"),
    "hip_thrust": ("hip_thrust", "bar_hip", "thrust"),
    "overhead_press": ("ohp", "bar", "press"),
    "lateral_raise": ("lateral_raise", "db", "raise"),
    "arnold_press": ("ohp", "db", "press"),
    "upright_row": ("stand", "bar", "pull"),
    "rear_delt_fly": ("hinge", "db", "fly"),
    "cable_lateral_raise": ("lateral_raise", "cable", "raise"),
    "bicep_curl": ("curl", "bar", "curl"),
    "hammer_curl": ("curl", "db", "curl"),
    "preacher_curl": ("curl", "db", "curl"),
    "tricep_dip_machine": ("machine_arm", "machine", "press"),
    "skull_crusher": ("lying_ext", "bar", "extend"),
    "tricep_pushdown": ("pushdown", "pulley_handle", "push"),
    "close_grip_bench_press": ("bench", "bar", "press"),
    "concentration_curl": ("curl", "db", "curl"),
    "plank": ("plank", "none", "hold"),
    "hanging_leg_raise": ("hang_leg", "bar_over", "raise_legs"),
    "sit_up": ("seated_abs", "none", "curl_up"),
    "russian_twist": ("seated_abs", "none", "twist"),
    "bicycle_crunch": ("lying_abs", "none", "curl_up"),
    "side_plank": ("side_plank", "none", "hold"),
    "v_up": ("lying_abs", "none", "v_up"),
    "mountain_climber": ("plank", "none", "knees"),
    "ab_wheel_rollout": ("ab_wheel", "wheel", "roll"),
    "burpee": ("jump", "none", "jump"),
    "jumping_jack": ("jump", "none", "jump"),
    "ski_erg": ("ski_erg", "machine", "pull"),
    "rowing_machine": ("rower", "rail", "row"),
    "treadmill_sprint": ("run", "belt", "run"),
    "burpee_jump": ("jump", "none", "jump"),
    "thruster": ("squat", "bar_front", "press"),
    "clean_and_press": ("ohp", "bar", "press"),
    "kettlebell_swing": ("hinge", "kb", "swing"),
    "man_maker": ("pullup", "bar_over", "pull_up"),
    "dumbbell_shrug": ("shrug", "db", "raise"),
    "neck_flexion": ("neck", "none", "raise"),
}


# ---------------------------------------------------------------- dibujo

def draw_figure(ax, pose):
    """Dibuja la figura humana. Devuelve dict de puntos para overlays."""
    j = pose
    far_dx, far_dy = 4.5, 1.5  # extremidad lejana (más a la derecha/abajo)

    def far(p):
        return (p[0] + far_dx, p[1] + far_dy)

    # sombra
    ax.add_patch(Ellipse((j["hip"][0] + 2, 90.5), 34, 2.4,
                         facecolor=to_rgba("#000000", 0.07),
                         edgecolor="none", zorder=1))

    def limb(a, b, c, w, color):
        ax.plot([a[0], b[0]], [a[1], b[1]], color=color, lw=w,
                solid_capstyle="round", zorder=5)
        ax.plot([b[0], c[0]], [b[1], c[1]], color=color, lw=w * 0.85,
                solid_capstyle="round", zorder=5)

    def torso(a, b, w, color):
        ax.plot([a[0], b[0]], [a[1], b[1]], color=color, lw=w,
                solid_capstyle="round", zorder=4)

    def head(p, color, r=6.5):
        ax.add_patch(Circle(p, r, facecolor=color, edgecolor="none", zorder=6))

    # lejana: pierna y brazo
    limb(far(j["hip"]), far(j["knee"]), far(j["ankle"]), 9, INK_FAR)
    limb(far(j["shoulder"]), far(j["elbow"]), far(j["wrist"]), 7, INK_FAR)
    # tronco
    torso(j["neck"], j["hip"], 15, INK)
    # cercana: pierna y brazo
    limb(j["hip"], j["knee"], j["ankle"], 10, INK)
    limb(j["shoulder"], j["elbow"], j["wrist"], 8, INK)
    # cabeza
    head(j["head"], INK)
    return j


def muscle_patch(ax, j, group):
    col = MUSCLE.get(group, ACCENT)
    a = 0.85
    def ell(p, w, h, ang=0, r=None):
        ax.add_patch(Ellipse(p, w, h, angle=ang, facecolor=col,
                             edgecolor="#ffffff", linewidth=1.2, alpha=a, zorder=7))
    def ring(p, r):
        ax.add_patch(Circle(p, r, facecolor="none", edgecolor=col,
                            linewidth=2.2, zorder=7))

    chest = ((j["neck"][0] + j["hip"][0]) / 2 - 3, (j["neck"][1] + j["hip"][1]) / 2)
    back = ((j["neck"][0] + j["hip"][0]) / 2 + 6, (j["neck"][1] + j["hip"][1]) / 2)
    thigh = ((j["hip"][0] + j["knee"][0]) / 2, (j["hip"][1] + j["knee"][1]) / 2)
    calf = ((j["knee"][0] + j["ankle"][0]) / 2, (j["knee"][1] + j["ankle"][1]) / 2)
    bicep = ((j["shoulder"][0] + j["elbow"][0]) / 2, (j["shoulder"][1] + j["elbow"][1]) / 2)
    core = ((j["neck"][0] + j["hip"][0]) / 2 + 1, (j["neck"][1] + j["hip"][1]) / 2 + 4)

    if group == "chest":
        ell(chest, 10, 16, 70)
    elif group == "back":
        ell(back, 10, 16, 70)
    elif group == "legs":
        ell(thigh, 9, 18, 60)
        ell(calf, 7, 14, 60)
    elif group == "shoulders":
        ring(j["shoulder"], 7)
    elif group == "arms":
        ell(bicep, 8, 12, 70)
    elif group == "core":
        ell(core, 9, 12, 60)
    elif group == "cardio":
        ring(j["shoulder"], 6)
        ring((j["hip"][0], j["hip"][1]), 6)
    elif group == "full_body":
        ring(j["shoulder"], 6)
        ring((j["hip"][0] + 2, j["hip"][1] - 2), 6)
        ring((j["knee"][0], j["knee"][1]), 5)


def draw_equipment(ax, j, kind):
    def line(a, b, w=2.2, c="#3a3a3f", z=6, **kw):
        ax.plot([a[0], b[0]], [a[1], b[1]], color=c, lw=w, zorder=z,
                solid_capstyle="round", **kw)
    def disk(p, r=4.2, c="#2a2a2e"):
        ax.add_patch(Circle(p, r, facecolor=c, edgecolor="none", zorder=6))
    def bar_line(p1, p2, r=4.6):
        line(p1, p2, w=2.4)
        disk(p1, r)
        disk(p2, r)
    far_ankle = (j["ankle"][0] + 4.5, j["ankle"][1] + 1.5)

    if kind in ("bar", "bar_floor", "bar_mid", "bar_hip", "bar_front", "bar_back"):
        if kind == "bar_back":
            # barra en la espalda (vista lateral = disco + travesaño)
            p = (j["shoulder"][0] + 8, j["shoulder"][1] + 1)
            pf = (p[0] + 4.5, p[1] + 1.5)
            line((p[0] - 4, p[1] - 4), (p[0] + 4, p[1] + 4), w=2.2, c="#4a4a50")
            disk(p, 5)
            disk(pf, 4.2)
            return
        if kind == "bar_hip":
            p = (j["hip"][0] + 3, j["hip"][1] + 2)
            pf = (p[0] + 4.5, p[1] + 1.5)
            line((p[0] - 5, p[1] - 1), (p[0] + 5, p[1] + 1), w=2.2, c="#4a4a50")
            disk(p, 5)
            disk(pf, 4.2)
            return
        if kind == "bar_front":
            # barra vertical delante del pecho, sujeta con las dos manos
            x = j["wrist"][0] - 3
            line((x, j["wrist"][1] - 12), (x, j["wrist"][1] + 12), w=2.4)
            disk((x, j["wrist"][1] - 12), 4.4)
            disk((x, j["wrist"][1] + 12), 4.4)
            return
        if kind in ("bar_floor", "bar_mid"):
            x = (j["wrist"][0] + j["wrist"][0] + 4) / 2
            ax.plot([x, x], [14, 88], color="#2a2a2e", lw=2.4, zorder=6)
            disk((x, 20)); disk((x, 82))
            return
        # barra a través de las muñecas, discos en los extremos
        w1, w2 = j["wrist"], (j["wrist"][0] + 4, j["wrist"][1] + 2)
        dx, dy = w2[0] - w1[0], w2[1] - w1[1]
        L = (dx * dx + dy * dy) ** 0.5 or 1
        ux, uy = dx / L, dy / L
        ext = 14
        bar_line((w1[0] - ux * ext, w1[1] - uy * ext),
                 (w2[0] + ux * ext, w2[1] + uy * ext))
    elif kind == "db" or kind == "db_one":
        for p in (j["wrist"], (j["wrist"][0] + 4, j["wrist"][1] + 2)):
            if kind == "db_one" and p[1] > j["wrist"][1]:
                continue
            line((p[0] - 3, p[1]), (p[0] + 3, p[1]), w=2)
            disk(p, 3.4)
    elif kind == "bench":
        # banco bajo el cuerpo (plataforma + patas)
        y = j["hip"][1] + 4
        line((8, y), (68, y), w=3, c="#4a4a50")
        line((14, y), (14, 88), w=3)
        line((62, y), (62, 88), w=3)
    elif kind == "bar_over":
        line((12, 14), (68, 14), w=3, c="#4a4a50")
        line((14, 14), (14, 6), w=3); line((66, 14), (66, 6), w=3)
    elif kind == "bar_waist":
        line((10, 49), (72, 49), w=3, c="#4a4a50")
    elif kind == "parallel":
        for x in (28, 52):
            line((x, 30), (x, 58), w=3.4, c="#4a4a50")
    elif kind == "pulley_bar":
        line((58, 6), (58, 14), w=3, c="#4a4a50")
        disk((58, 14), 2.6)
        line((20, 16), (56, 16), w=2.6)
        disk((20, 16), 3.4)
    elif kind in ("pulley_handle", "pulley_rope"):
        px, py = (8, 44) if kind == "pulley_handle" else (10, 20)
        line((px, py - 8), (px, py), w=2.6, c="#4a4a50")
        disk((px, py), 2.4)
        line((px, py), j["wrist"], w=1.8, c="#6a6a70")
        disk(j["wrist"], 2.2)
    elif kind == "cable_x":
        for py in (28, 50):
            line((8, py - 6), (8, py), w=2.4, c="#4a4a50")
            disk((8, py), 2.2)
            line((8, py), j["wrist"], w=1.6, c="#6a6a70")
    elif kind == "cable":
        line((8, 30), (8, 38), w=2.4, c="#4a4a50")
        disk((8, 38), 2.2)
        line((8, 38), j["wrist"], w=1.6, c="#6a6a70")
    elif kind == "box":
        bx, by = far_ankle
        ax.add_patch(FancyBboxPatch((bx - 4, by + 2), 16, 10, boxstyle="round,pad=0.6",
                                    facecolor="#d2d2d7", edgecolor="#86868b", zorder=3))
    elif kind == "step":
        ax.add_patch(FancyBboxPatch((30, 82), 24, 6, boxstyle="round,pad=0.4",
                                    facecolor="#d2d2d7", edgecolor="#86868b", zorder=3))
    elif kind == "machine":
        ax.add_patch(FancyBboxPatch((52, 30), 14, 40, boxstyle="round,pad=1",
                                    facecolor="#e8e8ed", edgecolor="#aeaeb2", zorder=3))
    elif kind == "rail":
        line((8, 64), (74, 64), w=3, c="#4a4a50")
        ax.add_patch(Circle((12, 34), 5, facecolor="#e8e8ed",
                            edgecolor="#aeaeb2", zorder=6))
    elif kind == "wheel":
        ax.add_patch(Circle((66, 57), 5.5, facecolor="#d2d2d7",
                            edgecolor="#6e6e73", linewidth=1.5, zorder=6))
    elif kind == "kb":
        ax.add_patch(Circle((20, 30), 5.5, facecolor="#2a2a2e", zorder=6))
        line((17, 24), (23, 24), w=2.6, c="#4a4a50")
    elif kind == "belt":
        line((8, 70), (74, 70), w=4, c="#4a4a50")


def draw_motion(ax, j, kind, col=ACCENT):
    def arrow(a, b, rad=0.35, lw=2.6, style="-|>"):
        ax.annotate("", xy=b, xytext=a, zorder=8,
                    arrowprops=dict(arrowstyle=style, lw=lw, color=col,
                                    mutation_scale=16,
                                    connectionstyle=f"arc3,rad={rad}"))

    if kind == "press":
        arrow((j["wrist"][0], j["wrist"][1] + 12), (j["wrist"][0], j["wrist"][1] - 10), rad=0.0)
    elif kind == "press_down":
        arrow((j["head"][0] - 14, j["head"][1] - 12), (j["head"][0] - 14, j["head"][1] + 6))
    elif kind == "dip_down":
        arrow((j["hip"][0] + 16, j["hip"][1] - 8), (j["hip"][0] + 16, j["hip"][1] + 8))
    elif kind == "fly":
        arrow((j["wrist"][0] + 12, j["wrist"][1] - 8), (j["wrist"][0] - 2, j["wrist"][1] - 12), rad=-0.4)
    elif kind == "pull":
        arrow((j["wrist"][0] - 10, j["wrist"][1] + 6), (j["wrist"][0] + 2, j["wrist"][1] - 4), rad=0.0)
    elif kind == "pull_up":
        arrow((j["wrist"][0] - 12, j["wrist"][1] + 14), (j["wrist"][0] - 12, j["wrist"][1] - 2))
    elif kind == "pull_down":
        arrow((j["wrist"][0] - 8, j["wrist"][1] - 8), (j["wrist"][0] - 8, j["wrist"][1] + 10))
    elif kind == "squat":
        arrow((j["hip"][0] + 14, j["hip"][1] + 10), (j["hip"][0] + 14, j["hip"][1] - 10))
    elif kind == "curl":
        arrow((j["wrist"][0] + 8, j["wrist"][1] + 10), (j["wrist"][0] + 8, j["wrist"][1] - 8), rad=0.5)
    elif kind == "extend":
        arrow((j["wrist"][0] - 4, j["wrist"][1] + 12), (j["wrist"][0] - 4, j["wrist"][1] - 10))
    elif kind == "curl_down":
        arrow((j["ankle"][0] + 10, j["ankle"][1] - 2), (j["ankle"][0] + 2, j["ankle"][1] + 10), rad=-0.5)
    elif kind == "raise":
        arrow((j["wrist"][0] - 4, j["wrist"][1] + 12), (j["wrist"][0] - 4, j["wrist"][1] - 8))
    elif kind == "raise_legs":
        arrow((j["ankle"][0] + 8, j["ankle"][1] + 14), (j["ankle"][0] + 8, j["ankle"][1] - 2), rad=-0.3)
    elif kind == "curl_up":
        arrow((j["head"][0] - 8, j["head"][1] + 12), (j["head"][0] - 10, j["head"][1] - 6), rad=0.4)
    elif kind == "twist":
        arrow((j["wrist"][0] - 6, j["wrist"][1]), (j["wrist"][0] + 12, j["wrist"][1] - 4), rad=0.5)
    elif kind == "v_up":
        arrow((j["ankle"][0] + 6, j["ankle"][1] + 12), (j["ankle"][0] + 6, j["ankle"][1] - 6), rad=-0.4)
    elif kind == "knees":
        arrow((j["knee"][0], j["knee"][1] - 14), (j["knee"][0] - 8, j["knee"][1] - 4), rad=-0.5)
    elif kind == "roll":
        arrow((j["wrist"][0] + 12, j["wrist"][1] + 6), (j["wrist"][0] + 2, j["wrist"][1] - 4), rad=0.5)
    elif kind == "jump":
        arrow((j["hip"][0] + 14, j["hip"][1] + 10), (j["hip"][0] + 14, j["hip"][1] - 12))
    elif kind == "swing":
        arrow((14, 62), (16, 34), rad=0.55)
    elif kind == "thrust":
        arrow((j["hip"][0] - 4, j["hip"][1] + 12), (j["hip"][0] - 4, j["hip"][1] - 8))
    elif kind == "lunge_down":
        arrow((j["knee"][0] - 12, j["knee"][1] + 8), (j["knee"][0] - 12, j["knee"][1] - 6))
    elif kind == "row":
        arrow((j["wrist"][0] - 12, j["wrist"][1] + 4), (j["wrist"][0] + 6, j["wrist"][1] - 2), rad=0.0)
    elif kind == "run":
        arrow((j["ankle"][0] - 8, j["ankle"][1] + 4), (j["ankle"][0] - 20, j["ankle"][1] - 2), rad=-0.3)
    elif kind == "hold":
        pass


def fallback_spec(equipment, muscle_group):
    """Spec (pose, equip, motion) por defecto para ejercicios sin entrada en E.
    Basado en el equipo y grupo muscular reales del dataset."""
    eq = {
        "barbell": "bar_back", "dumbbell": "db", "machine": "machine",
        "cable": "cable", "bodyweight": "none", "other": "none",
    }.get(equipment, "none")
    pose = "squat" if muscle_group in ("legs", "full_body") else "stand"
    motion = {
        "chest": "press", "back": "row", "legs": "squat", "shoulders": "raise",
        "arms": "curl", "core": "raise_legs", "cardio": "run", "full_body": "press",
    }.get(muscle_group, "press")
    return (pose, eq, motion)


def render(ex, out_path):
    spec = E.get(ex["id"])
    if spec is None:
        spec = fallback_spec(ex.get("equipment"), ex.get("muscle_group"))
    pose_name, equip, motion = spec
    pose = POSES[pose_name]

    # Layout: cabecera arriba + figura abajo (sin solaparse).
    fig = plt.figure(figsize=(W / DPI, H / DPI), dpi=DPI, facecolor=BG_TOP)
    ax = fig.add_axes([0, 0, 1, 0.82])
    ax.set_xlim(0, 100)
    ax.set_ylim(100, 0)
    ax.axis("off")
    ax.set_facecolor("none")
    # suelo: franja inferior suave
    ax.axhspan(88, 100, color=to_rgba("#000000", 0.045), zorder=0)

    j = draw_figure(ax, pose)
    draw_equipment(ax, j, equip)
    draw_motion(ax, j, motion)
    muscle_patch(ax, j, ex["muscle_group"])

    # cabecera (en la parte superior, fuera del eje de la figura)
    ax2 = fig.add_axes([0, 0.82, 1, 0.18])
    ax2.set_xlim(0, 100)
    ax2.set_ylim(100, 0)
    ax2.axis("off")
    ax2.set_facecolor("none")
    ax2.text(2.5, 18, ex["name_en"], fontsize=22, fontweight="bold",
             color=INK, zorder=9, family="DejaVu Sans", va="center")
    # chip grupo muscular
    col = MUSCLE.get(ex["muscle_group"], ACCENT)
    ax2.add_patch(FancyBboxPatch((2.8, 34), 26, 7, boxstyle="round,pad=0.7",
                                 facecolor=col, edgecolor="none", alpha=0.16, zorder=9))
    ax2.text(4.5, 35.8, GROUP_LABEL.get(ex["muscle_group"], ex["muscle_group"]),
             fontsize=12, color=INK, zorder=10, family="DejaVu Sans", va="center")
    # chip SEED
    ax2.add_patch(FancyBboxPatch((85, 14), 12, 7, boxstyle="round,pad=0.7",
                                 facecolor=INK, edgecolor="none", zorder=9))
    ax2.text(86.5, 15.8, "SEED", fontsize=11, color="white", fontweight="bold",
             zorder=10, family="DejaVu Sans", va="center")

    fig.savefig(out_path, facecolor=BG_TOP)
    plt.close(fig)


def main():
    data = json.load(open(DATA, encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    n = 0
    for ex in data["exercises"]:
        if ex["id"] not in E:
            print(f"WARN sin spec de pose: {ex['id']} → uso 'stand'")
        render(ex, os.path.join(OUT, ex["id"] + ".png"))
        n += 1
    print(f"OK imágenes={n} → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
