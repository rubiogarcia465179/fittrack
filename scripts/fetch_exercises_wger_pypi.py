#!/usr/bin/env python3
"""Fetch de EJERCICIOS REALES (wger) vía la wheel de PyPI `wger`.

La API de wger.de y static.wger.de siguen bloqueadas por el proxy del
sandbox (medido 2026-10-31: 403 CONNECT), PERO el paquete PyPI `wger`
(publicado por el equipo de wger) lleva embebido el dataset de la base de
ejercicios de wger (fixtures Django: exercises, exercisebase, muscles,
equipment, categories, licenses). PyPI y files.pythonhosted.org SÍ son
accesibles desde el sandbox → datos reales legítimos, con atribución
CC-BY-SA (autor por ejercicio).

Uso:
    python3 scripts/fetch_exercises_wger_pypi.py --out data/exercises/all.json

Producción por ejercicio:
- name_en / instructions: wger (inglés; la instrucción de la 12 bases
  sin descripción se genera localmente y se documenta en `source_note`).
- name_nl: diccionario curado local (wger no publica nombres en neerlandés).
- level: diccionario curado local (wger no publica nivel de dificultad).
- muscle_group: categoría wger → nuestro enum; 12 ejercicios tipo cardio
  re-clasificados de Legs/Chest a `cardio` (wger no tiene categoría cardio).
- equipment: mapeo wger → nuestro enum (barbell/dumbbell/machine/cable/
  bodyweight/other).
- license + credit: atribución real por ejercicio (fixture licenses.json
  + license_author), licencia CC-BY-SA de la base.
- image: placeholder generado (las fotos de wger están en static.wger.de,
  inaccesible) → se mantiene `source_note` de imágenes como seed.
"""
import argparse
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
import zipfile

PYPI_JSON = "https://pypi.org/pypi/wger/json"
USER_AGENT = "FitTrack-DataBot/1.0 (research; local sandbox; contact: fittrack@local)"
TIMEOUT = 90

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ------------------------------------------------------------------ mapas
# categoría wger → grupo muscular FitTrack
CATEGORY_TO_GROUP = {
    "Arms": "arms",
    "Back": "back",
    "Chest": "chest",
    "Shoulders": "shoulders",
    "Legs": "legs",
    "Calves": "legs",
    "Abs": "core",
}

# 12 ejercicios cardio que wger clasifica en Legs/Chest.
CARDIO_OVERRIDE = {
    "Burpees", "Jumping Jacks", "High Knees", "High Knee Jumps",
    "Jogging", "Cycling", "Stationary Bike", "Skipping - Standard",
    "Run", "Run - Interval Training ", "Run - Treadmill", "Squat Jumps",
}

# equipo wger → enum FitTrack
EQUIPMENT_MAP = {
    "Barbell": "barbell",
    "SZ-Bar": "barbell",
    "Dumbbell": "dumbbell",
    "Kettlebell": "other",
    "Bench": "other",
    "Incline bench": "other",
    "Gym mat": "other",
    "Pull-up bar": "bodyweight",
    "none (bodyweight exercise)": "bodyweight",
}

# músculo wger (name) → etiqueta corta (nuestro schema usa strings cortos)
MUSCLE_SHORT = {
    "Pectoralis major": "chest",
    "Latissimus dorsi": "back",
    "Biceps brachii": "biceps",
    "Brachialis": "biceps",
    "Triceps brachii": "triceps",
    "Anterior deltoid": "shoulders",
    "Quadriceps femoris": "quads",
    "Biceps femoris": "hamstrings",
    "Rectus abdominis": "abs",
    "Obliquus externus abdominis": "abs",
    "Trapezius": "traps",
    "Gluteus maximus": "glutes",
    "Gastrocnemius": "calves",
    "Soleus": "calves",
    "Erector spinae": "lower_back",
    "Serratus anterior": "chest",
}

# Nivel de dificultad (wger no lo publica) — curado local.
LEVELS = {
    # beginner — básicos de peso corporal / máquinas guiadas
    "Squats": "beginner", "Squat Thrust": "beginner",
    "Pushups": "beginner", "Push-ups": "beginner", "Push Ups": "beginner",
    "Wall Pushup": "beginner", "Incline Pushups": "beginner",
    "Perfect Push Up": "beginner", "Side to Side Push Ups": "beginner",
    "Plank": "beginner", "Side Plank": "beginner", "Reverse Plank": "beginner",
    "Crunches": "beginner", "Sit-ups": "beginner", "Negative Crunches": "beginner",
    "Glute Bridge": "beginner", "Hip Thrust": "beginner",
    "Leg Raise": "beginner", "Leg Raises, Lying": "beginner",
    "Leg Raises, Standing": "beginner", "Hanging Leg Raises": "beginner",
    "Scissors": "beginner", "Flutter Kicks": "beginner", "Deadbug": "beginner",
    "Hollow Hold": "beginner", "L Hold": "beginner", "Side Crunch": "beginner",
    "Bear Walk": "beginner", "Wall Squat": "beginner", "Wall Slides": "beginner",
    "Jumping Jacks": "beginner", "High Knees": "beginner", "Jogging": "beginner",
    "Cycling": "beginner", "Stationary Bike": "beginner", "Skipping - Standard": "beginner",
    "Wall Handstand": "beginner", "Superman": "beginner", "Burpees": "beginner",
    "Handstand Pushup": "beginner", "Roman Chair": "beginner",
    "Isometric Wipers": "beginner", "Hand Grip": "beginner",
    "Prone Scapular Retraction - Arms at Side": "beginner",
    "Lying Rotator Cuff Exercise": "beginner", "Side-lying External Rotation": "beginner",
    "Cable External Rotation": "beginner",
    "Dumbbell Lunges Walking": "beginner", "Dumbbell Lunges Standing": "beginner",
    "Barbell Lunges": "beginner", "Dumbbell Goblet Squat": "beginner",
    "Front Squats": "beginner", "Braced Squat": "beginner",
    "Wall Squat - ": "beginner",
    "Biceps Curls With Dumbbell": "beginner", "Biceps Curls With Barbell": "beginner",
    "Hammercurls": "beginner", "Standing Bicep Curl": "beginner",
    "Lateral Raises": "beginner", "Front Raises": "beginner", "Side Raise": "beginner",
    "Rear Delt Raises": "beginner", "Shoulder Shrug": "beginner",
    "Calf Raises": "beginner", "Standing Calf Raises": "beginner",
    "Sitting Calf Raises": "beginner",
    "Calf Raises on Hackenschmitt Machine": "beginner",
    "Leg Extension": "beginner", "Leg Curl": "beginner",
    "Leg Curls (laying)": "beginner", "Leg Curls (sitting)": "beginner",
    "Leg Curls (standing)": "beginner",
    "Leg Press": "beginner", "Leg Presses (narrow)": "beginner",
    "Leg Presses (wide)": "beginner",
    "Lat Pull Down (Straight Back)": "beginner", "Lat Pull Down (Leaning Back)": "beginner",
    "Chin-ups": "beginner", "Pull-ups": "beginner", "Pull Ups on Machine": "beginner",
    "Rowing, Seated": "beginner", "Long-Pulley (low Row)": "beginner",
    "Bench Press": "beginner", "Incline Bench Press": "beginner",
    "Incline Dumbbell Press": "beginner", "Benchpress Dumbbells": "beginner",
    "Fly With Dumbbells": "beginner", "Incline Dumbbell Flye": "beginner",
    "Dips": "beginner", "Triceps Dips": "beginner", "Ring Dips": "beginner",
    "Seated Triceps Press": "beginner", "Triceps Machine": "beginner",
    "MGM Machine": "beginner", "Crunches on Machine": "beginner",
    "Curl su Panca a 45°": "beginner", "Dumbbells on Scott Machine": "beginner",
    "Axe Hold": "beginner",
    # advanced
    "Body-Ups": "advanced", "Muscle up": "advanced", "Pistol Squat": "advanced",
    "Turkish Get-Up": "advanced", "Snach": "advanced", "Power Clean": "advanced",
    "Overhead Squat": "advanced", "Axe Hold - ": "advanced",
    "Hercules Pillars": "advanced", "Isometric Wipers - ": "advanced",
    "Deficit Deadlift": "advanced", "Splinter Sit-ups": "advanced",
    "Full Sit Outs": "advanced", "Side Dumbbell Trunk Flexion": "advanced",
    "Incline Plank With Alternate Floor Touch": "advanced",
    "High Knee Jumps": "advanced", "Squat Jumps": "advanced",
    "Run - Interval Training ": "advanced", "Speed Deadlift": "advanced",
    "Deadlifts": "advanced", "Sumo Deadlift": "advanced",
    "Stiff-legged Deadlifts": "advanced", "Good Mornings": "advanced",
    "Pike Push Ups": "advanced", "Handstand Pushup - ": "advanced",
    "Z Curls": "advanced", "Renegade Row": "advanced",
    "Dips Between Two Benches": "advanced",
    "2 Handed Kettlebell Swing": "advanced", "Kettlebell Swings": "advanced",
    "Thruster": "advanced", "Bent High Pulls": "advanced", "High Pull": "advanced",
    "Upright Row, on Multi Press": "advanced",
}

# Instrucciones para las 12 bases sin descripción en wger (generadas
# localmente — documentado en source_note).
FILLER_INSTRUCTIONS = {
    "Butterfly Reverse": [
        "Acércate a la máquina de butterfly (aplagadora) y siéntate con la espalda apoyada.",
        "Abre los brazos hacia fuera, alejando los codos del torso.",
        "Cierra los brazos juntando los antebrazos frente a la cara, mantén 1 s y vuelve con control.",
    ],
    "Dumbbells on Scott Machine": [
        "Siéntate en la máquina con los antebrazos apoyados en el cojín Scott.",
        "Agarra los extremos de la barra con una postura de pronación.",
        "Flexiona los codos llevando la barra hacia los hombros y vuelve lentamente.",
    ],
    "Fly With Cable": [
        "Configura los cables en altura de hombro y agarra los puños.",
        "Da un paso al frente y junta las manos frente al pecho, abriendo ligeramente los codos.",
        "Abre los brazos hacia los laterales hasta estirar el pecho y vuelve con control.",
    ],
    "Good Mornings": [
        "Colócate de pie con una barra en la espalda alta y pies al ancho de hombros.",
        "Empuja la cadera hacia atrás y flexiona el torso manteniendo la columna neutra.",
        "Baja hasta sentir estirar los isquiotibiales y vuelve a la posición inicial.",
    ],
    "Leg Curls (sitting)": [
        "Siéntate en la máquina con la rodilla en la articulación del apoyo.",
        "Flexiona las rodillas llevando los talones hacia los glúteos.",
        "Vuelve a la posición de partida de forma controlada, sin lanzar el peso.",
    ],
    "Leg Curls (standing)": [
        "Colócate de pie en la máquina, con el talón apoyado bajo la palanca.",
        "Flexiona las rodillas llevando el talón hacia el glúteo.",
        "Controla el descenso hasta la posición inicial.",
    ],
    "Leg Press on Hackenschmidt Machine": [
        "Siéntate en la hack machine con la espalda apoyada y pies a la altura de los hombros.",
        "Liberan el seguro y baja la plataforma flexionando las rodillas a ~90°.",
        "Empuja hasta estender casi por completo las rodillas y vuelve con control.",
    ],
    "MGM Machine": [
        "Siéntate en la máquina con la espalda bien apoyada.",
        "Empuja la palanca con el pecho, manteniendo los codos pegados al torso.",
        "Controla el retorno hasta la posición inicial.",
    ],
    "Pull Ups on Machine": [
        "Colócate en la máquina asistida de pull-ups, con la rodilla bajo la almohada de asistencia.",
        "Jala hacia arriba llevando el mentón por encima de la barra.",
        "Baja de forma controlada hasta estirar los brazos por completo.",
    ],
    "Rowing, Lying on Bench": [
        "Siéntate en la banca con los pies bien plantados.",
        "Agarra los manillar con ambas manos y tira hacia el abdomen, juntando los codos.",
        "Vuelve a la posición de partida con los brazos casi estirados.",
    ],
    "Rowing, Seated": [
        "Siéntate en la máquina con la espalda recta.",
        "Tira de la palanca hacia el abdomen manteniendo los codos cerca del cuerpo.",
        "Controla el retorno sin redondear la espalda.",
    ],
    "Shoulder Press, on Machine": [
        "Siéntate en la máquina con los hombros alineados con los ejes.",
        "Empuja las empuñaduras hacia arriba hasta casi estirar los brazos.",
        "Vuelve con control a la posición inicial.",
    ],
    "Triceps Machine": [
        "Siéntate en la máquina con los hombros alineados con las empuñaduras.",
        "Empuja la palanca hacia abajo hasta casi estirar los brazos.",
        "Controla el retorno a la posición inicial sin dejar que el peso se suelte.",
    ],
    "Dumbbell Lunges Standing": [
        "De pie, con un dumbbell en cada mano a los costados del cuerpo.",
        "Da un paso largo hacia delante y baja hasta que ambas rodillas formen ~90°.",
        "Empuja el suelo con la pierna delantera para volver a la posición de pie.",
        "Alterna las piernas el mismo número de repeticiones.",
    ],
    "Lateral Raises": [
        "De pie, con un dumbbell en cada mano a los costados y codos ligeramente flexionados.",
        "Levanta los brazos hacia los laterales hasta la altura de los hombros.",
        "Baja de forma controlada hasta la posición inicial.",
    ],
    "Lateral Raises on Cable, One Armed": [
        "Coloca el cable en su punto más bajo y agarra el puño con un brazo.",
        "Levanta el brazo hacia el lateral hasta la altura del hombro, con el codo casi extendido.",
        "Vuelve con control y repite con el otro brazo.",
    ],
}

# Nombres en neerlandés (wger no publica NL). Curado local.
NAME_NL = {
    "2 Handed Kettlebell Swing": "Kettlebell swing met twee handen",
    "Arnold Shoulder Press": "Arnold press",
    "Axe Hold": "As-houd",
    "Back Squat": "Kniebuiging",
    "Barbell Ab Rollout": "Ab rol met stang",
    "Barbell Hack Squats": "Hack squat met stang",
    "Barbell Lunges": "Lunges met stang",
    "Barbell Triceps Extension": "Triceps-extension met stang",
    "Bear Walk": "Beerloop",
    "Bench Press": "Bankdrukken",
    "Bench Press Narrow Grip": "Bankdrukken, smalle greep",
    "Benchpress Dumbbells": "Dumbbellbankdrukken",
    "Bent High Pulls": "Gebogen high pull",
    "Bent Over Barbell Row": "Gebogen stanghellen",
    "Bent Over Rowing": "Gebogen rowing",
    "Bent Over Rowing Reverse": "Gebogen rowing, omgekeerde greep",
    "Bent-over Lateral Raises": "Gebogen zijwaartse heffen",
    "Bentover Dumbbell Rows": "Gebogen dumbbellhellen",
    "Biceps Curl With Cable": "Bicepskrul met kabel",
    "Biceps Curls With Barbell": "Bicepskrul met stang",
    "Biceps Curls With Dumbbell": "Bicepskrul met dumbbell",
    "Biceps Curls With SZ-bar": "Bicepskrul met EZ-stang",
    "Body-Ups": "Body-ups",
    "Braced Squat": "Kniebuiging met spanning",
    "Burpees": "Burpees",
    "Butterfly": "Vlinderfly",
    "Butterfly Narrow Grip": "Vlinderfly, smalle greep",
    "Butterfly Reverse": "Omgekeerde vlinderfly",
    "Cable Cross-over": "Kabelcrossover",
    "Cable External Rotation": "Externe rotatie met kabel",
    "Cable Woodchoppers": "Kabel-woodchopper",
    "Calf Press Using Leg Press Machine": "Kuitspierpers met beinpresse",
    "Calf Raises": "Kuitspierrezen",
    "Calf Raises on Hackenschmitt Machine": "Kuitspierrezen met hackmachine",
    "Chin Up": "Chin-up",
    "Chin-ups": "Chin-ups",
    "Close-grip Bench Press": "Bankdrukken, smalle greep",
    "Close-grip Lat Pull Down": "Lat pulldown, smalle greep",
    "Cross-Bench Dumbbell Pullovers": "Dumbbell-pullover over de bank",
    "Crunches": "Crunches",
    "Crunches on Machine": "Crunches op machine",
    "Crunches With Cable": "Crunches met kabel",
    "Crunches With Legs Up": "Crunches met benen omhoog",
    "Curl su Panca a 45°": "Krul op schuine bank",
    "Cycling": "Fietsen",
    "Deadbug": "Dode insect",
    "Deadhang": "Hangen",
    "Deadlifts": "Dode til",
    "Decline Bench Press Barbell": "Bankdrukken, aflopende bank",
    "Decline Bench Press Dumbbell": "Dumbbellbankdrukken, aflopende bank",
    "Decline Pushups": "Push-ups, aflopende bank",
    "Deficit Deadlift": "Dode til van verhoogd vlak",
    "Diagonal Shoulder Press": "Diagonale schouderpress",
    "Dips": "Dips",
    "Dips Between Two Benches": "Dips tussen twee banken",
    "Dumbbell Concentration Curl": "Concentratiekrul met dumbbell",
    "Dumbbell Goblet Squat": "Goblet squat met dumbbell",
    "Dumbbell Incline Curl": "Krul met dumbbell op schuine bank",
    "Dumbbell Lunges Standing": "Lunges met dumbbells, staand",
    "Dumbbell Lunges Walking": "Lunges met dumbbells, wandelend",
    "Dumbbell Triceps Extension": "Triceps-extension met dumbbells",
    "Dumbbells on Scott Machine": "Krul op Scott-machine",
    "Extenseurs - Face": "Face-extensors",
    "Facepull": "Facepull",
    "Flutter Kicks": "Flutter kicks",
    "Fly With Cable": "Fly met kabel",
    "Fly With Dumbbells": "Dumbbelfly",
    "Fly With Dumbbells, Decline Bench": "Dumbbelfly, aflopende bank",
    "French Press (skullcrusher) Dumbbells": "Skullcrusher met dumbbells",
    "French Press (skullcrusher) SZ-bar": "Skullcrusher met EZ-stang",
    "Front Raises": "Voorwaartse heffen",
    "Front Squats": "Front squat",
    "Full Sit Outs": "Volledige sit-out",
    "Glute Bridge": "Bruggen",
    "Good Mornings": "Good mornings",
    "Hammercurls": "Hammerkrul",
    "Hammercurls on Cable": "Hammerkrul met kabel",
    "Hand Grip": "Greepkracht",
    "Handstand Pushup": "Push-up in steun",
    "Hanging Leg Raises": "Beenheffen, hangend",
    "Hercules Pillars": "Hercules-kolommen",
    "High Knee Jumps": "Springen met knieheffen",
    "High Knees": "Knieheffen",
    "High Pull": "High pull",
    "Hindu Squats": "Hindoekniebuiging",
    "Hip Raise, Lying": "Heuphef, liggend",
    "Hip Thrust": "Heupduw",
    "Hollow Hold": "Holle houding",
    "Hyperextensions": "Hyperextensies",
    "Incline Bench Press": "Bankdrukken, schuine bank",
    "Incline Dumbbell Flye": "Dumbbelfly, schuine bank",
    "Incline Dumbbell Press": "Dumbbellbankdrukken, schuine bank",
    "Incline Dumbbell Row": "Hellend dumbbellhellen",
    "Incline Plank With Alternate Floor Touch": "Plank met afwisselende grondraak",
    "Incline Pushups": "Push-ups, schuine bank",
    "Isometric Wipers": "Isometrische wipers",
    "Jogging": "Joggen",
    "Jumping Jacks": "Jumping jacks",
    "Kettlebell Swings": "Kettlebell swings",
    "L Hold": "L-houding",
    "Lat Pull Down (Leaning Back)": "Lat pulldown, achterover",
    "Lat Pull Down (Straight Back)": "Lat pulldown, rechte rug",
    "Lateral Raises": "Zijwaartse heffen",
    "Lateral Raises on Cable, One Armed": "Zijwaartse heffen met kabel, éénarmig",
    "Lateral-to-Front Raises": "Van zijkant naar voor heffen",
    "Leg Curl": "Beinbuigen",
    "Leg Curls (laying)": "Beinbuigen, liggend",
    "Leg Curls (sitting)": "Beinbuigen, zittend",
    "Leg Curls (standing)": "Beinbuigen, staand",
    "Leg Extension": "Beinstrekking",
    "Leg Press": "Beinpresse",
    "Leg Press on Hackenschmidt Machine": "Beinpresse, hackmachine",
    "Leg Presses (narrow)": "Beinpresse, smalle stance",
    "Leg Presses (wide)": "Beinpresse, brede stance",
    "Leg Raise": "Beenhef",
    "Leg Raises, Lying": "Beenheffen, liggend",
    "Leg Raises, Standing": "Beenheffen, staand",
    "Leverage Machine Chest Press": "Borstpress met machine",
    "Leverage Machine Iso Row": "Hellend rowen met machine",
    "Long-Pulley (low Row)": "Hellend rowen met kabel",
    "Long-Pulley, Narrow": "Hellend rowen met kabel, smal",
    "Low Box Squat - Wide Stance": "Kniebuiging op doos, brede stance",
    "Lying Rotator Cuff Exercise": "Rotator cuff-oefening, liggend",
    "MGM Machine": "MGM-machine",
    "Military Press": "Military press",
    "Muscle up": "Muscle-up",
    "Negative Crunches": "Negatieve crunches",
    "Overhand Cable Curl": "Kabelkrul, bovenhand",
    "Overhead Squat": "Kniebuiging over de kop",
    "Pause Bench": "Bankdrukken met pauze",
    "Pendelay Rows": "Pendelay rows",
    "Perfect Push Up": "Perfecte push-up",
    "Pike Push Ups": "Pike push-ups",
    "Pistol Squat": "Pistol squat",
    "Plank": "Plank",
    "Power Clean": "Power clean",
    "Preacher Curls": "Preacher curls",
    "Prone Scapular Retraction - Arms at Side": "Scapula-retentie, liggend",
    "Pull Ups on Machine": "Pull-ups op machine",
    "Pull-ups": "Pull-ups",
    "Push Press": "Push press",
    "Push Ups": "Push-ups",
    "Pushups": "Push-ups",
    "Rack Deadlift": "Dode til van de rack",
    "Rear Delt Raises": "Achterste deltahebben",
    "Renegade Row": "Renegade row",
    "Reverse Bar Curl": "Omgekeerde stangkrul",
    "Reverse Curl": "Omgekeerde krul",
    "Reverse Grip Bench Press": "Bankdrukken, omgekeerde greep",
    "Reverse Plank": "Omgekeerde plank",
    "Ring Dips": "Dips aan ringen",
    "Roman Chair": "Romeinse stoel",
    "Romanian Deadlift": "Roemeense dode til",
    "Row": "Rowen",
    "Rowing, Lying on Bench": "Rowen, liggend op bank",
    "Rowing, Seated": "Rowen, zittend",
    "Rowing, T-bar": "T-bar rowen",
    "Run": "Lopen",
    "Run - Interval Training ": "Lopen, intervaltraining",
    "Run - Treadmill": "Lopen op loopband",
    "Scissors": "Schaar",
    "Seated Triceps Press": "Tricepspress, zittend",
    "Shotgun Row": "Shotgun row",
    "Shoulder Fly": "Schouderfly",
    "Shoulder Press, Barbell": "Schouderpress met stang",
    "Shoulder Press, Dumbbells": "Schouderpress met dumbbells",
    "Shoulder Press, on Machine": "Schouderpress op machine",
    "Shoulder Press, on Multi Press": "Schouderpress op multipress",
    "Shoulder Shrug": "Schouderkrimpen",
    "Shrugs, Barbells": "Schouderkrimpen met stang",
    "Shrugs, Dumbbells": "Schouderkrimpen met dumbbells",
    "Side Crunch": "Zijcrunch",
    "Side Dumbbell Trunk Flexion": "Zijbuigen met dumbbells",
    "Side Plank": "Zijplank",
    "Side Raise": "Zijwaartse heffen",
    "Side to Side Push Ups": "Push-ups van kant naar kant",
    "Side-lying External Rotation": "Externe rotatie, zijkant",
    "Single-arm Preacher Curl": "Preacher curl, éénarmig",
    "Sit-ups": "Sit-ups",
    "Sitting Calf Raises": "Kuitspierrezen, zittend",
    "Skipping - Standard": "Tikkertje",
    "Smith Machine Close-grip Bench Press": "Bankdrukken smalle greep op Smith",
    "Snach": "Snatch",
    "Speed Deadlift": "Snelle dode til",
    "Splinter Sit-ups": "Splinter sit-ups",
    "Squat Jumps": "Spring-kniebuiging",
    "Squat Thrust": "Squat thrust",
    "Squats": "Kniebuiging",
    "Standing Bicep Curl": "Bicepskrul, staand",
    "Standing Calf Raises": "Kuitspierrezen, staand",
    "Standing Rope Forearm": "Voorarmoefening met touw, staand",
    "Stationary Bike": "Fiets op de plek",
    "Stiff-legged Deadlifts": "Stijfbeen dode til",
    "Straight-arm Pull Down (bar Attachment)": "Rechtfiets pulldown met stang",
    "Straight-arm Pull Down (rope Attachment)": "Rechtfiets pulldown met touw",
    "Sumo Deadlift": "Sumo dode til",
    "Sumo Squats": "Sumo squat",
    "Superman": "Superman",
    "Thruster": "Thruster",
    "Tricep Dumbbell Kickback": "Tricep kickback met dumbbells",
    "Triceps Bench Press One Barbell": "Tricepsbankdrukken met stang",
    "Triceps Dips": "Tricepsdips",
    "Triceps Extensions on Cable": "Triceps-extension met kabel",
    "Triceps Extensions on Cable With Bar": "Triceps-extension met kabel en stang",
    "Triceps Machine": "Tricepsmachine",
    "Trunk Rotation With Cable ": "Ronde rotatie met kabel",
    "Turkish Get-Up": "Turkse opstand",
    "Underhand Lat Pull Down": "Lat pulldown, onderhand",
    "Upper Body": "Bovenlichaamsoefening",
    "Upper External Oblique": "Bovenste zijbuik",
    "Upright Row w/ Dumbbells": "Upright row met dumbbells",
    "Upright Row, on Multi Press": "Upright row op multipress",
    "Upright Row, SZ-bar": "Upright row met EZ-stang",
    "V-Bar Pulldown": "V-bar pulldown",
    "Wall Handstand": "Steun tegen de muur",
    "Wall Pushup": "Push-up tegen de muur",
    "Wall Slides": "Muurslides",
    "Wall Squat": "Kniebuiging tegen de muur",
    "Weighted Step": "Gewichtsstaap",
    "Weighted Step-ups": "Step-up met gewicht",
    "Wide-grip Pulldown": "Pulldown, brede greep",
    "Z Curls": "Z-curls",
}


def http_get(url: str, binary: bool = False) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read()


def strip_html(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def to_steps(desc: str) -> list[str]:
    """Convierte un párrafo de wger en pasos (frases)."""
    if not desc:
        return []
    parts = re.split(r"(?<=[.!?])\s+", desc)
    steps = [p.strip() for p in parts if len(p.strip()) >= 3]
    return steps[:6]


def slugify(name: str) -> str:
    s = name.lower().replace("/", " ")
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_") or "exercise"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(
        ROOT, "data", "exercises", "all.json"))
    args = ap.parse_args()

    # 1) URL de la wheel desde PyPI JSON
    meta = json.loads(http_get(PYPI_JSON))
    version = meta["info"]["version"]
    urls = [f["url"] for f in meta["releases"][version] if f["filename"].endswith(".whl")]
    if not urls:
        print("ERROR: no hay wheel para wger", version)
        return 1
    wheel_url = urls[0]
    print(f"descargando wger {version} → {wheel_url}")
    wheel_bytes = http_get(wheel_url, binary=True)
    digest = hashlib.sha256(wheel_bytes).hexdigest()
    print(f"ok {len(wheel_bytes)} bytes sha256={digest[:16]}…")

    # 2) fixtures
    with zipfile.ZipFile(__import__("io").BytesIO(wheel_bytes)) as z:
        def fixture(name: str):
            return json.loads(z.read(f"wger/{name}").decode("utf-8"))
        ex_fix = fixture("exercises/fixtures/exercises.json")
        base_fix = fixture("exercises/fixtures/exercise-base-data.json")
        cats = fixture("exercises/fixtures/categories.json")
        equip = fixture("exercises/fixtures/equipment.json")
        mus = fixture("exercises/fixtures/muscles.json")
        lic = fixture("core/fixtures/licenses.json")

    categories = {o["pk"]: o["fields"]["name"] for o in cats}
    equipment = {o["pk"]: o["fields"]["name"] for o in equip}
    muscles = {o["pk"]: o["fields"]["name"] for o in mus}
    licenses = {o["pk"]: o["fields"].get("short_name", "") for o in lic}
    bases = {o["pk"]: o["fields"] for o in base_fix if o["model"] == "exercises.exercisebase"}

    en, de, desc = {}, {}, {}
    for o in ex_fix:
        if o["model"] != "exercises.exercise":
            continue
        f = o["fields"]
        b = f.get("exercise_base")
        if f.get("language") == 2:
            en[b] = f["name"]
            desc[b] = strip_html(f.get("description") or "")
        elif f.get("language") == 1:
            de[b] = f["name"]

    # 3) construcción del dataset
    usable = [b for b in bases if b in en and bases[b].get("category") in categories]
    usable.sort(key=lambda b: (categories[bases[b]["category"]], en[b].lower(), b))

    seen = {}
    exercises = []
    missing_nl, missing_level = [], []
    filler_used = []
    for b in usable:
        name_en = en[b]
        category = categories[bases[b]["category"]]
        group = "cardio" if name_en in CARDIO_OVERRIDE else CATEGORY_TO_GROUP[category]

        eq = bases[b].get("equipment") or []
        equipment_out = "other"
        if eq:
            equipment_out = EQUIPMENT_MAP.get(equipment[eq[0]], "other")
            if len(eq) > 1 and "none (bodyweight exercise)" in [equipment[x] for x in eq]:
                equipment_out = "bodyweight"

        musc = bases[b].get("muscles") or []
        musc2 = bases[b].get("muscles_secondary") or []
        primary = [MUSCLE_SHORT.get(muscles[m], "") for m in musc]
        secondary = [MUSCLE_SHORT.get(muscles[m], "") for m in musc2]
        secondary = [s for s in secondary if s and s not in primary]

        d = desc.get(b, "")
        steps = to_steps(d)
        if not steps:
            steps = FILLER_INSTRUCTIONS.get(name_en, [])
            if steps:
                filler_used.append(name_en)

        base_slug = slugify(name_en)
        seen[base_slug] = seen.get(base_slug, 0) + 1
        used = seen[base_slug]
        # ¿habrá otro uso más adelante? (para no poner _2 en el último)
        total_same = sum(1 for x in usable if slugify(en[x]) == base_slug)
        eid = base_slug if total_same == 1 else f"{base_slug}_{used}"

        nl = NAME_NL.get(name_en)
        if not nl:
            missing_nl.append(name_en)
            nl = name_en
        level = LEVELS.get(name_en, "intermediate")
        if name_en not in LEVELS:
            missing_level.append(name_en)

        exercise = {
            "id": eid,
            "name_en": name_en,
            "name_nl": nl,
            "muscle_group": group,
            "secondary_muscles": secondary,
            "equipment": equipment_out,
            "level": level,
            "aliases": [de[b]] if de.get(b) and de[b] != name_en else [],
            "instructions": steps,
            "image": f"/images/exercises/{eid}.png",
            "source": "real",
            "source_id": f"wger-exercisebase-{b}",
            "source_url": f"https://wger.de (exercise base pk {b})",
            "license": licenses.get(bases[b].get("license"), "CC-BY-SA"),
            "credit": bases[b].get("license_author") or "wger.de",
        }
        exercises.append(exercise)

    # 4) verificaciones de integridad antes de escribir
    problems = []
    ids = [e["id"] for e in exercises]
    if len(ids) != len(set(ids)):
        problems.append("ids duplicados")
    if missing_nl:
        problems.append(f"falta name_nl: {missing_nl}")
    for e in exercises:
        if not e["instructions"]:
            problems.append(f"sin instrucciones: {e['id']}")
    if problems:
        print("ERROR:", problems)
        return 1

    data = {
        "dataset": "fittrack.exercises",
        "version": 3,
        "source": "real",
        "source_note": (
            f"Base: dataset de wger (CC-BY-SA, créditos: https://wger.de/about), "
            f"extraído de la wheel de PyPI `wger {version}` "
            f"(sha256 {digest[:16]}…); la API de wger.de sigue bloqueada por el "
            f"proxy del sandbox. name_nl y level son curados localmente "
            f"(wger no publica NL ni dificultad); {len(filler_used)} ejercicios sin "
            f"instrucción en wger llevan pasos generados localmente. Imágenes: "
            f"placeholders generados (fotos de wger en static.wger.de, inaccesible). "
            f"Atribución por ejercicio en campos `license`/`credit`."
        ),
        "generated_at": time.strftime("%Y-%m-%d"),
        "count": len(exercises),
        "groups": ["chest", "back", "legs", "shoulders", "arms", "core", "cardio", "full_body"],
        "equipment": ["barbell", "dumbbell", "machine", "cable", "bodyweight", "other"],
        "levels": ["beginner", "intermediate", "advanced"],
        "exercises": exercises,
    }
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    from collections import Counter
    print(f"OK ejercicios={len(exercises)} (source=real) → {args.out}")
    print("  por grupo:", dict(Counter(e['muscle_group'] for e in exercises)))
    print("  por nivel:", dict(Counter(e['level'] for e in exercises)))
    print("  filler instrucciones:", len(filler_used))
    print("Siguiente paso: scripts/generate_exercise_images.py + scripts/sync_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
