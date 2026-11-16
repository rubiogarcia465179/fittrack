# Prompts de dibujos (estilo línea, como Everkinetic)

Generado por `node scripts/make_drawing_prompts.js` (no editar a mano).
**117 ejercicios** sin dibujo (sin contar cardio). Para cada uno, 2 imágenes:
posición inicial (`-1`) y final (`-2`).

1. Pega cada bloque en un generador de imágenes (p. ej. ChatGPT).
2. Revisa la técnica (si es incorrecta o insegura, regenera).
3. Guarda como `data/images/photos/inbox/<id>-1.png` y `<id>-2.png`.
4. `python3 scripts/add_drawings.py` → fondo transparente, recorte, tinte
   con el tema; en la app aparecen marcados como "Dibujo generado con IA".
5. `node scripts/photo_status.js` actualiza la cuenta (`docs/fotos/STATUS.md`).

## Estilo común (va en cada prompt)

> Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image.

## Axe Hold `axe_hold`

Grupo: arms · Material: dumbbell

**Inicio** → `data/images/photos/inbox/axe_hold-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Axe Hold". Show the STARTING position. Stand holding a dumbbell in each hand.
```

**Final** → `data/images/photos/inbox/axe_hold-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Axe Hold". Show the END position (the hardest point of the movement). Lift your arms straight out to the sides.
```

## Biceps Curls With SZ-bar `biceps_curls_with_sz_bar`

Grupo: arms · Material: barbell

**Inicio** → `data/images/photos/inbox/biceps_curls_with_sz_bar-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Biceps Curls With SZ-bar". Show the STARTING position. Hold the zigzag bar on its angled grips, palms up.
```

**Final** → `data/images/photos/inbox/biceps_curls_with_sz_bar-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Biceps Curls With SZ-bar". Show the END position (the hardest point of the movement). Bend your elbows to lift it to your shoulders.
```

## Body-Ups `body_ups`

Grupo: arms · Material: bodyweight

**Inicio** → `data/images/photos/inbox/body_ups-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Body-Ups". Show the STARTING position. Start in a plank on your forearms.
```

**Final** → `data/images/photos/inbox/body_ups-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Body-Ups". Show the END position (the hardest point of the movement). Push up onto your hands, one arm at a time.
```

## Curl su Panca a 45° `curl_su_panca_a_45`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/curl_su_panca_a_45-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Curl su Panca a 45°". Show the STARTING position. Sit on a bench tilted at 45° with a dumbbell in each hand, arms hanging.
```

**Final** → `data/images/photos/inbox/curl_su_panca_a_45-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Curl su Panca a 45°". Show the END position (the hardest point of the movement). Bend your elbows to lift the weights.
```

## Deadhang `deadhang`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/deadhang-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deadhang". Show the STARTING position. Grab a pull-up bar with both hands.
```

**Final** → `data/images/photos/inbox/deadhang-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deadhang". Show the END position (the hardest point of the movement). Hang with straight arms and relaxed body.
```

## Dumbbell Triceps Extension `dumbbell_triceps_extension`

Grupo: arms · Material: dumbbell

**Inicio** → `data/images/photos/inbox/dumbbell_triceps_extension-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbell Triceps Extension". Show the STARTING position. Hold one dumbbell with both hands above your head.
```

**Final** → `data/images/photos/inbox/dumbbell_triceps_extension-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbell Triceps Extension". Show the END position (the hardest point of the movement). Bend your elbows to lower it behind your head.
```

## Dumbbells on Scott Machine `dumbbells_on_scott_machine`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/dumbbells_on_scott_machine-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbells on Scott Machine". Show the STARTING position. Sit at the curl bench with your arms resting on the pad.
```

**Final** → `data/images/photos/inbox/dumbbells_on_scott_machine-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbells on Scott Machine". Show the END position (the hardest point of the movement). Bend your elbows to lift the weights.
```

## French Press (skullcrusher) SZ-bar `french_press_skullcrusher_sz_bar`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/french_press_skullcrusher_sz_bar-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "French Press (skullcrusher) SZ-bar". Show the STARTING position. Lie on a bench holding the zigzag bar above your chest.
```

**Final** → `data/images/photos/inbox/french_press_skullcrusher_sz_bar-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "French Press (skullcrusher) SZ-bar". Show the END position (the hardest point of the movement). Bend your elbows to lower it towards your forehead.
```

## Hammercurls on Cable `hammercurls_on_cable`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/hammercurls_on_cable-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hammercurls on Cable". Show the STARTING position. Stand facing a low cable holding the rope, palms facing each other.
```

**Final** → `data/images/photos/inbox/hammercurls_on_cable-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hammercurls on Cable". Show the END position (the hardest point of the movement). Bend your elbows to pull it up.
```

## Hand Grip `hand_grip`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/hand_grip-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hand Grip". Show the STARTING position. Hold the grip trainer in one hand.
```

**Final** → `data/images/photos/inbox/hand_grip-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hand Grip". Show the END position (the hardest point of the movement). Squeeze it closed as hard as you can.
```

## Hercules Pillars `hercules_pillars`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/hercules_pillars-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hercules Pillars". Show the STARTING position. Stand between two cable machines, holding a handle in each hand.
```

**Final** → `data/images/photos/inbox/hercules_pillars-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hercules Pillars". Show the END position (the hardest point of the movement). Keep your arms out to the sides with the cables tense.
```

## Pike Push Ups `pike_push_ups`

Grupo: arms · Material: bodyweight

**Inicio** → `data/images/photos/inbox/pike_push_ups-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pike Push Ups". Show the STARTING position. Start in a push-up position and lift your hips high, forming an upside-down V.
```

**Final** → `data/images/photos/inbox/pike_push_ups-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pike Push Ups". Show the END position (the hardest point of the movement). Bend your elbows to lower your head towards the floor.
```

## Reverse Curl `reverse_curl`

Grupo: arms · Material: barbell

**Inicio** → `data/images/photos/inbox/reverse_curl-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Reverse Curl". Show the STARTING position. Hold the weights with palms facing down.
```

**Final** → `data/images/photos/inbox/reverse_curl-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Reverse Curl". Show the END position (the hardest point of the movement). Bend your elbows to lift them.
```

## Ring Dips `ring_dips`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/ring_dips-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Ring Dips". Show the STARTING position. Hold the gymnastic rings and lift yourself with straight arms.
```

**Final** → `data/images/photos/inbox/ring_dips-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Ring Dips". Show the END position (the hardest point of the movement). Bend your elbows to lower your body.
```

## Standing Rope Forearm `standing_rope_forearm`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/standing_rope_forearm-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Standing Rope Forearm". Show the STARTING position. Hold a wrist roller (a stick with a rope and a weight) in front of you.
```

**Final** → `data/images/photos/inbox/standing_rope_forearm-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Standing Rope Forearm". Show the END position (the hardest point of the movement). Twist your wrists to roll the rope up until the weight reaches the stick.
```

## Triceps Bench Press One Barbell `triceps_bench_press_one_barbell`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/triceps_bench_press_one_barbell-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Triceps Bench Press One Barbell". Show the STARTING position. Lie on a bench holding a weight in one hand at shoulder level.
```

**Final** → `data/images/photos/inbox/triceps_bench_press_one_barbell-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Triceps Bench Press One Barbell". Show the END position (the hardest point of the movement). Push it up until your arm is straight.
```

## Triceps Dips `triceps_dips`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/triceps_dips-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Triceps Dips". Show the STARTING position. Hold the bars or a bench and lift yourself with straight arms.
```

**Final** → `data/images/photos/inbox/triceps_dips-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Triceps Dips". Show the END position (the hardest point of the movement). Bend your elbows to lower your body, staying upright.
```

## Wall Pushup `wall_pushup`

Grupo: arms · Material: bodyweight

**Inicio** → `data/images/photos/inbox/wall_pushup-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Pushup". Show the STARTING position. Stand facing a wall and place your hands on it at shoulder height.
```

**Final** → `data/images/photos/inbox/wall_pushup-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Pushup". Show the END position (the hardest point of the movement). Bend your elbows to bring your chest towards the wall.
```

## Z Curls `z_curls`

Grupo: arms · Material: other

**Inicio** → `data/images/photos/inbox/z_curls-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Z Curls". Show the STARTING position. Lift dumbbells with palms up, like a normal curl.
```

**Final** → `data/images/photos/inbox/z_curls-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Z Curls". Show the END position (the hardest point of the movement). At the top, turn your palms to face down.
```

## Bent Over Barbell Row `bent_over_barbell_row`

Grupo: back · Material: barbell

**Inicio** → `data/images/photos/inbox/bent_over_barbell_row-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bent Over Barbell Row". Show the STARTING position. Hold a barbell and lean forward with a flat back, knees slightly bent.
```

**Final** → `data/images/photos/inbox/bent_over_barbell_row-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bent Over Barbell Row". Show the END position (the hardest point of the movement). Pull the bar towards your belly, squeezing your shoulder blades.
```

## Bentover Dumbbell Rows `bentover_dumbbell_rows`

Grupo: back · Material: dumbbell

**Inicio** → `data/images/photos/inbox/bentover_dumbbell_rows-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bentover Dumbbell Rows". Show the STARTING position. Lean forward with one hand and knee on a bench, dumbbell in the other hand.
```

**Final** → `data/images/photos/inbox/bentover_dumbbell_rows-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bentover Dumbbell Rows". Show the END position (the hardest point of the movement). Pull the weight up to your hip, elbow close to your body.
```

## Deadlifts `deadlifts`

Grupo: back · Material: barbell

**Inicio** → `data/images/photos/inbox/deadlifts-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deadlifts". Show the STARTING position. Stand with the bar over your feet, bend down and grip it.
```

**Final** → `data/images/photos/inbox/deadlifts-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deadlifts". Show the END position (the hardest point of the movement). Stand up by pushing through your legs, keeping your back flat and the bar close.
```

## Deficit Deadlift `deficit_deadlift`

Grupo: back · Material: barbell

**Inicio** → `data/images/photos/inbox/deficit_deadlift-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deficit Deadlift". Show the STARTING position. Stand on a low platform with the bar in front of you.
```

**Final** → `data/images/photos/inbox/deficit_deadlift-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deficit Deadlift". Show the END position (the hardest point of the movement). Lift it like a normal deadlift, back flat.
```

## Incline Dumbbell Row `incline_dumbbell_row`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/incline_dumbbell_row-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Incline Dumbbell Row". Show the STARTING position. Lie face down on an inclined bench, a dumbbell in each hand.
```

**Final** → `data/images/photos/inbox/incline_dumbbell_row-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Incline Dumbbell Row". Show the END position (the hardest point of the movement). Pull the weights up towards your ribs.
```

## Lat Pull Down (Leaning Back) `lat_pull_down_leaning_back`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/lat_pull_down_leaning_back-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lat Pull Down (Leaning Back)". Show the STARTING position. Sit at the pull-down machine holding the wide bar.
```

**Final** → `data/images/photos/inbox/lat_pull_down_leaning_back-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lat Pull Down (Leaning Back)". Show the END position (the hardest point of the movement). Lean back slightly and pull the bar to your upper chest.
```

## Lat Pull Down (Straight Back) `lat_pull_down_straight_back`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/lat_pull_down_straight_back-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lat Pull Down (Straight Back)". Show the STARTING position. Sit upright at the pull-down machine holding the wide bar.
```

**Final** → `data/images/photos/inbox/lat_pull_down_straight_back-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lat Pull Down (Straight Back)". Show the END position (the hardest point of the movement). Pull the bar down in front of you to your chest.
```

## Leverage Machine Iso Row `leverage_machine_iso_row`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/leverage_machine_iso_row-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leverage Machine Iso Row". Show the STARTING position. Sit at the rowing machine with your chest on the pad.
```

**Final** → `data/images/photos/inbox/leverage_machine_iso_row-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leverage Machine Iso Row". Show the END position (the hardest point of the movement). Pull the handles back towards you.
```

## Long-Pulley (low Row) `long_pulley_low_row`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/long_pulley_low_row-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Long-Pulley (low Row)". Show the STARTING position. Sit at the low cable with feet on the platform, holding the handle.
```

**Final** → `data/images/photos/inbox/long_pulley_low_row-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Long-Pulley (low Row)". Show the END position (the hardest point of the movement). Pull it to your belly, sitting tall.
```

## Long-Pulley, Narrow `long_pulley_narrow`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/long_pulley_narrow-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Long-Pulley, Narrow". Show the STARTING position. Sit at the low cable holding the narrow handle.
```

**Final** → `data/images/photos/inbox/long_pulley_narrow-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Long-Pulley, Narrow". Show the END position (the hardest point of the movement). Pull it to your belly, elbows close to your body.
```

## MGM Machine `mgm_machine`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/mgm_machine-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "MGM Machine". Show the STARTING position. Sit on the machine with your back well supported.
```

**Final** → `data/images/photos/inbox/mgm_machine-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "MGM Machine". Show the END position (the hardest point of the movement). Push or pull the handles, keeping elbows close to your body.
```

## Muscle up `muscle_up`

Grupo: back · Material: bodyweight

**Inicio** → `data/images/photos/inbox/muscle_up-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Muscle up". Show the STARTING position. Hang from a bar or rings.
```

**Final** → `data/images/photos/inbox/muscle_up-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Muscle up". Show the END position (the hardest point of the movement). Pull up explosively and push yourself over the bar.
```

## Pendelay Rows `pendelay_rows`

Grupo: back · Material: barbell

**Inicio** → `data/images/photos/inbox/pendelay_rows-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pendelay Rows". Show the STARTING position. Lean forward with a flat back, the bar resting on the floor.
```

**Final** → `data/images/photos/inbox/pendelay_rows-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pendelay Rows". Show the END position (the hardest point of the movement). Pull it explosively to your lower chest.
```

## Prone Scapular Retraction - Arms at Side `prone_scapular_retraction_arms_at_side`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/prone_scapular_retraction_arms_at_side-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Prone Scapular Retraction - Arms at Side". Show the STARTING position. Lie face down with arms out to the sides.
```

**Final** → `data/images/photos/inbox/prone_scapular_retraction_arms_at_side-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Prone Scapular Retraction - Arms at Side". Show the END position (the hardest point of the movement). Lift your arms slowly, squeezing your shoulder blades together.
```

## Pull Ups on Machine `pull_ups_on_machine`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/pull_ups_on_machine-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pull Ups on Machine". Show the STARTING position. Kneel or stand on the assisted pull-up machine.
```

**Final** → `data/images/photos/inbox/pull_ups_on_machine-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pull Ups on Machine". Show the END position (the hardest point of the movement). Pull yourself up until your chin is over the bar.
```

## Rack Deadlift `rack_deadlift`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/rack_deadlift-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Rack Deadlift". Show the STARTING position. Set the bar on supports at knee height.
```

**Final** → `data/images/photos/inbox/rack_deadlift-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Rack Deadlift". Show the END position (the hardest point of the movement). Grip it and stand up straight, back flat.
```

## Renegade Row `renegade_row`

Grupo: back · Material: dumbbell

**Inicio** → `data/images/photos/inbox/renegade_row-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Renegade Row". Show the STARTING position. Get into a push-up position holding two dumbbells on the floor.
```

**Final** → `data/images/photos/inbox/renegade_row-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Renegade Row". Show the END position (the hardest point of the movement). Pull one dumbbell up to your ribs, keeping your body still.
```

## Rowing, Lying on Bench `rowing_lying_on_bench`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/rowing_lying_on_bench-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Rowing, Lying on Bench". Show the STARTING position. Lie face down on a bench with weights hanging below.
```

**Final** → `data/images/photos/inbox/rowing_lying_on_bench-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Rowing, Lying on Bench". Show the END position (the hardest point of the movement). Pull them up towards your chest.
```

## Shotgun Row `shotgun_row`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/shotgun_row-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shotgun Row". Show the STARTING position. Stand in a split stance holding a low cable handle in one hand.
```

**Final** → `data/images/photos/inbox/shotgun_row-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shotgun Row". Show the END position (the hardest point of the movement). Pull it back towards your hip, turning your palm up.
```

## Straight-arm Pull Down (bar Attachment) `straight_arm_pull_down_bar_attachment`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/straight_arm_pull_down_bar_attachment-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Straight-arm Pull Down (bar Attachment)". Show the STARTING position. Stand facing a high cable holding a bar with straight arms.
```

**Final** → `data/images/photos/inbox/straight_arm_pull_down_bar_attachment-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Straight-arm Pull Down (bar Attachment)". Show the END position (the hardest point of the movement). Pull the bar down to your thighs, arms straight.
```

## Straight-arm Pull Down (rope Attachment) `straight_arm_pull_down_rope_attachment`

Grupo: back · Material: other

**Inicio** → `data/images/photos/inbox/straight_arm_pull_down_rope_attachment-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Straight-arm Pull Down (rope Attachment)". Show the STARTING position. Stand facing a high cable holding the rope with straight arms.
```

**Final** → `data/images/photos/inbox/straight_arm_pull_down_rope_attachment-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Straight-arm Pull Down (rope Attachment)". Show the END position (the hardest point of the movement). Pull it down to your thighs, arms straight.
```

## Wall Slides `wall_slides`

Grupo: back · Material: bodyweight

**Inicio** → `data/images/photos/inbox/wall_slides-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Slides". Show the STARTING position. Stand with your back, head and arms against a wall, elbows bent.
```

**Final** → `data/images/photos/inbox/wall_slides-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Slides". Show the END position (the hardest point of the movement). Slide your arms up the wall without arching your back.
```

## Bear Walk `bear_walk`

Grupo: chest · Material: bodyweight

**Inicio** → `data/images/photos/inbox/bear_walk-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bear Walk". Show the STARTING position. Get on your hands and feet, knees slightly off the floor.
```

**Final** → `data/images/photos/inbox/bear_walk-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bear Walk". Show the END position (the hardest point of the movement). Walk forward moving the opposite hand and foot together.
```

## Bench Press `bench_press`

Grupo: chest · Material: barbell

**Inicio** → `data/images/photos/inbox/bench_press-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bench Press". Show the STARTING position. Lie on a bench and hold the bar a little wider than your shoulders.
```

**Final** → `data/images/photos/inbox/bench_press-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bench Press". Show the END position (the hardest point of the movement). Lower it slowly to the middle of your chest.
```

## Benchpress Dumbbells `benchpress_dumbbells`

Grupo: chest · Material: other

**Inicio** → `data/images/photos/inbox/benchpress_dumbbells-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Benchpress Dumbbells". Show the STARTING position. Lie on a bench with a dumbbell in each hand at chest height.
```

**Final** → `data/images/photos/inbox/benchpress_dumbbells-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Benchpress Dumbbells". Show the END position (the hardest point of the movement). Push the weights straight up.
```

## Butterfly Narrow Grip `butterfly_narrow_grip`

Grupo: chest · Material: other

**Inicio** → `data/images/photos/inbox/butterfly_narrow_grip-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Butterfly Narrow Grip". Show the STARTING position. Sit at the butterfly machine holding the handles close together.
```

**Final** → `data/images/photos/inbox/butterfly_narrow_grip-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Butterfly Narrow Grip". Show the END position (the hardest point of the movement). Squeeze them together in front of you.
```

## Decline Pushups `decline_pushups`

Grupo: chest · Material: bodyweight

**Inicio** → `data/images/photos/inbox/decline_pushups-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Decline Pushups". Show the STARTING position. Do a push-up with your feet up on a bench.
```

**Final** → `data/images/photos/inbox/decline_pushups-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Decline Pushups". Show the END position (the hardest point of the movement). Lower your chest to the floor.
```

## Extenseurs - Face `extenseurs_face`

Grupo: chest · Material: other

**Inicio** → `data/images/photos/inbox/extenseurs_face-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Extenseurs - Face". Show the STARTING position. Hold the chest expander in front of you with both hands.
```

**Final** → `data/images/photos/inbox/extenseurs_face-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Extenseurs - Face". Show the END position (the hardest point of the movement). Pull your arms apart, stretching the springs.
```

## Fly With Cable `fly_with_cable`

Grupo: chest · Material: other

**Inicio** → `data/images/photos/inbox/fly_with_cable-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Fly With Cable". Show the STARTING position. Stand between two cables holding a handle in each hand, arms open.
```

**Final** → `data/images/photos/inbox/fly_with_cable-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Fly With Cable". Show the END position (the hardest point of the movement). Bring your hands together in front of your chest.
```

## Incline Pushups `incline_pushups`

Grupo: chest · Material: other

**Inicio** → `data/images/photos/inbox/incline_pushups-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Incline Pushups". Show the STARTING position. Put your hands on a bench and do a push-up.
```

**Final** → `data/images/photos/inbox/incline_pushups-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Incline Pushups". Show the END position (the hardest point of the movement). Lower your chest to the bench.
```

## Isometric Wipers `isometric_wipers`

Grupo: chest · Material: bodyweight

**Inicio** → `data/images/photos/inbox/isometric_wipers-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Isometric Wipers". Show the STARTING position. Start in a wide push-up position.
```

**Final** → `data/images/photos/inbox/isometric_wipers-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Isometric Wipers". Show the END position (the hardest point of the movement). Shift your body over to one hand, bending that elbow.
```

## Pause Bench `pause_bench`

Grupo: chest · Material: barbell

**Inicio** → `data/images/photos/inbox/pause_bench-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pause Bench". Show the STARTING position. Do a bench press, lowering the bar to your chest.
```

**Final** → `data/images/photos/inbox/pause_bench-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pause Bench". Show the END position (the hardest point of the movement). Pause for one second with the bar on your chest.
```

## Perfect Push Up `perfect_push_up`

Grupo: chest · Material: other

**Inicio** → `data/images/photos/inbox/perfect_push_up-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Perfect Push Up". Show the STARTING position. Hold the rotating push-up handles on the floor.
```

**Final** → `data/images/photos/inbox/perfect_push_up-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Perfect Push Up". Show the END position (the hardest point of the movement). Lower your chest, letting the handles turn.
```

## Reverse Grip Bench Press `reverse_grip_bench_press`

Grupo: chest · Material: barbell

**Inicio** → `data/images/photos/inbox/reverse_grip_bench_press-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Reverse Grip Bench Press". Show the STARTING position. Lie on a bench holding the bar with palms facing you.
```

**Final** → `data/images/photos/inbox/reverse_grip_bench_press-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Reverse Grip Bench Press". Show the END position (the hardest point of the movement). Lower it to your lower chest.
```

## Side to Side Push Ups `side_to_side_push_ups`

Grupo: chest · Material: other

**Inicio** → `data/images/photos/inbox/side_to_side_push_ups-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Side to Side Push Ups". Show the STARTING position. Start in a push-up position.
```

**Final** → `data/images/photos/inbox/side_to_side_push_ups-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Side to Side Push Ups". Show the END position (the hardest point of the movement). Lower your chest over one hand, then push up.
```

## Upper Body `upper_body`

Grupo: chest · Material: bodyweight

**Inicio** → `data/images/photos/inbox/upper_body-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Upper Body". Show the STARTING position. Do a circuit of push-ups, planks and arm movements.
```

**Final** → `data/images/photos/inbox/upper_body-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Upper Body". Show the END position (the hardest point of the movement). Keep your stomach tight the whole time.
```

## Upper External Oblique `upper_external_oblique`

Grupo: chest · Material: bodyweight

**Inicio** → `data/images/photos/inbox/upper_external_oblique-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Upper External Oblique". Show the STARTING position. Lie on your back, knees bent.
```

**Final** → `data/images/photos/inbox/upper_external_oblique-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Upper External Oblique". Show the END position (the hardest point of the movement). Lift one shoulder towards the opposite knee.
```

## 2 Handed Kettlebell Swing `2_handed_kettlebell_swing`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/2_handed_kettlebell_swing-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "2 Handed Kettlebell Swing". Show the STARTING position. Stand with feet wider than your hips, holding the kettlebell with both hands.
```

**Final** → `data/images/photos/inbox/2_handed_kettlebell_swing-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "2 Handed Kettlebell Swing". Show the END position (the hardest point of the movement). Push your hips back, then snap them forward to swing the weight up to chest height.
```

## Cable Woodchoppers `cable_woodchoppers`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/cable_woodchoppers-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Cable Woodchoppers". Show the STARTING position. Stand sideways to a cable machine and hold the handle with both hands up high.
```

**Final** → `data/images/photos/inbox/cable_woodchoppers-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Cable Woodchoppers". Show the END position (the hardest point of the movement). Pull it down and across your body to the opposite hip, turning your chest.
```

## Crunches on Machine `crunches_on_machine`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/crunches_on_machine-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Crunches on Machine". Show the STARTING position. Sit in the crunch machine and hold the handles, feet secured.
```

**Final** → `data/images/photos/inbox/crunches_on_machine-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Crunches on Machine". Show the END position (the hardest point of the movement). Curl your chest down towards your knees using your stomach.
```

## Crunches With Cable `crunches_with_cable`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/crunches_with_cable-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Crunches With Cable". Show the STARTING position. Kneel in front of a high cable holding the rope beside your head.
```

**Final** → `data/images/photos/inbox/crunches_with_cable-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Crunches With Cable". Show the END position (the hardest point of the movement). Curl your back and bring your elbows towards your knees.
```

## Crunches With Legs Up `crunches_with_legs_up`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/crunches_with_legs_up-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Crunches With Legs Up". Show the STARTING position. Lie on your back with legs raised, knees bent at a right angle.
```

**Final** → `data/images/photos/inbox/crunches_with_legs_up-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Crunches With Legs Up". Show the END position (the hardest point of the movement). Lift your shoulders off the floor by tightening your stomach.
```

## Deadbug `deadbug`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/deadbug-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deadbug". Show the STARTING position. Lie on your back with arms pointing up and knees bent over your hips.
```

**Final** → `data/images/photos/inbox/deadbug-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Deadbug". Show the END position (the hardest point of the movement). Slowly lower one arm behind you and the opposite leg towards the floor.
```

## Flutter Kicks `flutter_kicks`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/flutter_kicks-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Flutter Kicks". Show the STARTING position. Lie on your back, hands under your hips, legs straight.
```

**Final** → `data/images/photos/inbox/flutter_kicks-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Flutter Kicks". Show the END position (the hardest point of the movement). Lift your legs a little off the floor.
```

## Full Sit Outs `full_sit_outs`

Grupo: core · Material: bodyweight

**Inicio** → `data/images/photos/inbox/full_sit_outs-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Full Sit Outs". Show the STARTING position. Start on hands and toes, as if at the top of a push-up.
```

**Final** → `data/images/photos/inbox/full_sit_outs-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Full Sit Outs". Show the END position (the hardest point of the movement). Lift one hand, turn your body and slide the opposite leg through underneath you.
```

## Hanging Leg Raises `hanging_leg_raises`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/hanging_leg_raises-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hanging Leg Raises". Show the STARTING position. Hang from a pull-up bar with straight arms.
```

**Final** → `data/images/photos/inbox/hanging_leg_raises-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hanging Leg Raises". Show the END position (the hardest point of the movement). Lift your legs in front of you by tightening your stomach.
```

## Hollow Hold `hollow_hold`

Grupo: core · Material: bodyweight

**Inicio** → `data/images/photos/inbox/hollow_hold-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hollow Hold". Show the STARTING position. Lie on your back and press your lower back into the floor.
```

**Final** → `data/images/photos/inbox/hollow_hold-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hollow Hold". Show the END position (the hardest point of the movement). Lift your shoulders and straight legs slightly off the floor, arms reaching forward.
```

## Incline Plank With Alternate Floor Touch `incline_plank_with_alternate_floor_touch`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/incline_plank_with_alternate_floor_touch-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Incline Plank With Alternate Floor Touch". Show the STARTING position. Hold a plank with your hands on a bench or step.
```

**Final** → `data/images/photos/inbox/incline_plank_with_alternate_floor_touch-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Incline Plank With Alternate Floor Touch". Show the END position (the hardest point of the movement). Take one hand off and touch the floor beside you.
```

## L Hold `l_hold`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/l_hold-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "L Hold". Show the STARTING position. Sit on the floor or between two supports with your hands beside your hips.
```

**Final** → `data/images/photos/inbox/l_hold-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "L Hold". Show the END position (the hardest point of the movement). Push down to lift your body, legs straight out in front.
```

## Leg Raises, Standing `leg_raises_standing`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/leg_raises_standing-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leg Raises, Standing". Show the STARTING position. Stand tall, holding onto something for balance if needed.
```

**Final** → `data/images/photos/inbox/leg_raises_standing-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leg Raises, Standing". Show the END position (the hardest point of the movement). Lift one straight leg in front of you as high as is comfortable.
```

## Overhand Cable Curl `overhand_cable_curl`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/overhand_cable_curl-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Overhand Cable Curl". Show the STARTING position. Stand facing a low cable, holding the bar with palms facing down.
```

**Final** → `data/images/photos/inbox/overhand_cable_curl-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Overhand Cable Curl". Show the END position (the hardest point of the movement). Bend your elbows to lift the bar to your chest, upper arms still.
```

## Plank `plank`

Grupo: core · Material: bodyweight

**Inicio** → `data/images/photos/inbox/plank-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Plank". Show the STARTING position. Rest on your forearms and toes, elbows under your shoulders.
```

**Final** → `data/images/photos/inbox/plank-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Plank". Show the END position (the hardest point of the movement). Keep your body straight from head to heels; don't let your hips sag.
```

## Reverse Plank `reverse_plank`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/reverse_plank-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Reverse Plank". Show the STARTING position. Sit with legs straight and hands behind you on the floor.
```

**Final** → `data/images/photos/inbox/reverse_plank-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Reverse Plank". Show the END position (the hardest point of the movement). Push your hips up until your body is a straight line, facing the ceiling.
```

## Roman Chair `roman_chair`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/roman_chair-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Roman Chair". Show the STARTING position. Lie back on the Roman chair with your feet hooked in.
```

**Final** → `data/images/photos/inbox/roman_chair-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Roman Chair". Show the END position (the hardest point of the movement). Lower your upper body slowly.
```

## Scissors `scissors`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/scissors-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Scissors". Show the STARTING position. Lie on your back with legs straight and slightly off the floor.
```

**Final** → `data/images/photos/inbox/scissors-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Scissors". Show the END position (the hardest point of the movement). Cross one leg over the other, then switch, like scissors.
```

## Side Crunch `side_crunch`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/side_crunch-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Side Crunch". Show the STARTING position. Lie on your side with knees slightly bent.
```

**Final** → `data/images/photos/inbox/side_crunch-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Side Crunch". Show the END position (the hardest point of the movement). Lift your upper body sideways towards your hip.
```

## Sit-ups `sit_ups`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/sit_ups-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Sit-ups". Show the STARTING position. Lie on your back, knees bent, feet flat on the floor.
```

**Final** → `data/images/photos/inbox/sit_ups-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Sit-ups". Show the END position (the hardest point of the movement). Sit all the way up using your stomach.
```

## Splinter Sit-ups `splinter_sit_ups`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/splinter_sit_ups-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Splinter Sit-ups". Show the STARTING position. Lie on your back with legs straight.
```

**Final** → `data/images/photos/inbox/splinter_sit_ups-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Splinter Sit-ups". Show the END position (the hardest point of the movement). Sit up while twisting, bringing one knee towards the opposite elbow.
```

## Trunk Rotation With Cable  `trunk_rotation_with_cable`

Grupo: core · Material: other

**Inicio** → `data/images/photos/inbox/trunk_rotation_with_cable-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Trunk Rotation With Cable ". Show the STARTING position. Sit or stand sideways to a cable, holding the handle at chest height.
```

**Final** → `data/images/photos/inbox/trunk_rotation_with_cable-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Trunk Rotation With Cable ". Show the END position (the hardest point of the movement). Turn your upper body away from the machine.
```

## Turkish Get-Up `turkish_get_up`

Grupo: core · Material: dumbbell

**Inicio** → `data/images/photos/inbox/turkish_get_up-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Turkish Get-Up". Show the STARTING position. Lie on your back holding a kettlebell straight up in one hand.
```

**Final** → `data/images/photos/inbox/turkish_get_up-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Turkish Get-Up". Show the END position (the hardest point of the movement). Stand up step by step, always keeping the weight above you.
```

## Braced Squat `braced_squat`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/braced_squat-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Braced Squat". Show the STARTING position. Hold a weight plate straight out in front of you.
```

**Final** → `data/images/photos/inbox/braced_squat-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Braced Squat". Show the END position (the hardest point of the movement). Squat down, keeping your chest up.
```

## Calf Raises on Hackenschmitt Machine `calf_raises_on_hackenschmitt_machine`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/calf_raises_on_hackenschmitt_machine-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Calf Raises on Hackenschmitt Machine". Show the STARTING position. Stand in the hack machine with the balls of your feet on the edge.
```

**Final** → `data/images/photos/inbox/calf_raises_on_hackenschmitt_machine-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Calf Raises on Hackenschmitt Machine". Show the END position (the hardest point of the movement). Rise up onto your toes, knees straight.
```

## Dumbbell Goblet Squat `dumbbell_goblet_squat`

Grupo: legs · Material: dumbbell

**Inicio** → `data/images/photos/inbox/dumbbell_goblet_squat-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbell Goblet Squat". Show the STARTING position. Hold one dumbbell against your chest with both hands.
```

**Final** → `data/images/photos/inbox/dumbbell_goblet_squat-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbell Goblet Squat". Show the END position (the hardest point of the movement). Squat down between your knees, back straight.
```

## Dumbbell Lunges Standing `dumbbell_lunges_standing`

Grupo: legs · Material: dumbbell

**Inicio** → `data/images/photos/inbox/dumbbell_lunges_standing-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbell Lunges Standing". Show the STARTING position. Stand with a dumbbell in each hand.
```

**Final** → `data/images/photos/inbox/dumbbell_lunges_standing-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Dumbbell Lunges Standing". Show the END position (the hardest point of the movement). Step forward and lower your back knee towards the floor.
```

## Hindu Squats `hindu_squats`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/hindu_squats-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hindu Squats". Show the STARTING position. Stand with feet shoulder-width apart, arms forward.
```

**Final** → `data/images/photos/inbox/hindu_squats-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hindu Squats". Show the END position (the hardest point of the movement). Squat down, rising onto your toes, swinging your arms back.
```

## Hip Thrust `hip_thrust`

Grupo: legs · Material: barbell

**Inicio** → `data/images/photos/inbox/hip_thrust-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hip Thrust". Show the STARTING position. Sit with your upper back against a bench, a weight across your hips.
```

**Final** → `data/images/photos/inbox/hip_thrust-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Hip Thrust". Show the END position (the hardest point of the movement). Push your hips up until your body is straight from knees to shoulders.
```

## Kettlebell Swings `kettlebell_swings`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/kettlebell_swings-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Kettlebell Swings". Show the STARTING position. Stand with feet wide holding the kettlebell.
```

**Final** → `data/images/photos/inbox/kettlebell_swings-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Kettlebell Swings". Show the END position (the hardest point of the movement). Push your hips back, then snap them forward to swing the weight.
```

## Leg Press on Hackenschmidt Machine `leg_press_on_hackenschmidt_machine`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/leg_press_on_hackenschmidt_machine-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leg Press on Hackenschmidt Machine". Show the STARTING position. Stand in the hack machine with your back on the pad.
```

**Final** → `data/images/photos/inbox/leg_press_on_hackenschmidt_machine-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leg Press on Hackenschmidt Machine". Show the END position (the hardest point of the movement). Bend your knees to lower yourself.
```

## Leg Presses (wide) `leg_presses_wide`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/leg_presses_wide-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leg Presses (wide)". Show the STARTING position. Sit in the leg press with feet wide apart.
```

**Final** → `data/images/photos/inbox/leg_presses_wide-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Leg Presses (wide)". Show the END position (the hardest point of the movement). Bend your knees to lower the platform.
```

## Low Box Squat - Wide Stance `low_box_squat_wide_stance`

Grupo: legs · Material: barbell

**Inicio** → `data/images/photos/inbox/low_box_squat_wide_stance-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Low Box Squat - Wide Stance". Show the STARTING position. Stand wide in front of a low box, bar on your back.
```

**Final** → `data/images/photos/inbox/low_box_squat_wide_stance-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Low Box Squat - Wide Stance". Show the END position (the hardest point of the movement). Sit back onto the box with control.
```

## Pistol Squat `pistol_squat`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/pistol_squat-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pistol Squat". Show the STARTING position. Stand on one leg, the other straight in front.
```

**Final** → `data/images/photos/inbox/pistol_squat-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Pistol Squat". Show the END position (the hardest point of the movement). Squat down on the standing leg as low as you can.
```

## Speed Deadlift `speed_deadlift`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/speed_deadlift-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Speed Deadlift". Show the STARTING position. Use a light bar.
```

**Final** → `data/images/photos/inbox/speed_deadlift-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Speed Deadlift". Show the END position (the hardest point of the movement). Lift it as fast as you can with good form.
```

## Squat Thrust `squat_thrust`

Grupo: legs · Material: bodyweight

**Inicio** → `data/images/photos/inbox/squat_thrust-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Squat Thrust". Show the STARTING position. Squat and place your hands on the floor.
```

**Final** → `data/images/photos/inbox/squat_thrust-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Squat Thrust". Show the END position (the hardest point of the movement). Jump your feet back into a push-up position.
```

## Stiff-legged Deadlifts `stiff_legged_deadlifts`

Grupo: legs · Material: barbell

**Inicio** → `data/images/photos/inbox/stiff_legged_deadlifts-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Stiff-legged Deadlifts". Show the STARTING position. Stand holding a bar, knees almost straight.
```

**Final** → `data/images/photos/inbox/stiff_legged_deadlifts-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Stiff-legged Deadlifts". Show the END position (the hardest point of the movement). Bend forward from your hips, back flat.
```

## Sumo Deadlift `sumo_deadlift`

Grupo: legs · Material: other

**Inicio** → `data/images/photos/inbox/sumo_deadlift-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Sumo Deadlift". Show the STARTING position. Stand very wide with toes out, hands gripping the bar between your legs.
```

**Final** → `data/images/photos/inbox/sumo_deadlift-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Sumo Deadlift". Show the END position (the hardest point of the movement). Stand up, pushing through your legs, back flat.
```

## Thruster `thruster`

Grupo: legs · Material: barbell

**Inicio** → `data/images/photos/inbox/thruster-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Thruster". Show the STARTING position. Hold a bar or dumbbells at your shoulders.
```

**Final** → `data/images/photos/inbox/thruster-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Thruster". Show the END position (the hardest point of the movement). Squat down, then stand up and push the weight over your head in one movement.
```

## Wall Squat `wall_squat`

Grupo: legs · Material: bodyweight

**Inicio** → `data/images/photos/inbox/wall_squat-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Squat". Show the STARTING position. Lean your back against a wall.
```

**Final** → `data/images/photos/inbox/wall_squat-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Squat". Show the END position (the hardest point of the movement). Slide down until your knees are bent at a right angle.
```

## Bent High Pulls `bent_high_pulls`

Grupo: shoulders · Material: dumbbell

**Inicio** → `data/images/photos/inbox/bent_high_pulls-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bent High Pulls". Show the STARTING position. Lean forward slightly holding two dumbbells.
```

**Final** → `data/images/photos/inbox/bent_high_pulls-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bent High Pulls". Show the END position (the hardest point of the movement). Pull them up to your chest, elbows high.
```

## Bent-over Lateral Raises `bent_over_lateral_raises`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/bent_over_lateral_raises-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bent-over Lateral Raises". Show the STARTING position. Lean forward with a flat back, dumbbells hanging.
```

**Final** → `data/images/photos/inbox/bent_over_lateral_raises-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Bent-over Lateral Raises". Show the END position (the hardest point of the movement). Lift your arms out to the sides.
```

## Butterfly Reverse `butterfly_reverse`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/butterfly_reverse-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Butterfly Reverse". Show the STARTING position. Sit facing the butterfly machine, holding the handles in front of you.
```

**Final** → `data/images/photos/inbox/butterfly_reverse-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Butterfly Reverse". Show the END position (the hardest point of the movement). Open your arms backwards.
```

## Cable External Rotation `cable_external_rotation`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/cable_external_rotation-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Cable External Rotation". Show the STARTING position. Stand sideways to a cable, elbow at your side bent 90°.
```

**Final** → `data/images/photos/inbox/cable_external_rotation-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Cable External Rotation". Show the END position (the hardest point of the movement). Rotate your forearm outward, away from your body.
```

## Diagonal Shoulder Press `diagonal_shoulder_press`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/diagonal_shoulder_press-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Diagonal Shoulder Press". Show the STARTING position. Sit on an inclined bench with the bar in front of you.
```

**Final** → `data/images/photos/inbox/diagonal_shoulder_press-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Diagonal Shoulder Press". Show the END position (the hardest point of the movement). Push it up and slightly forward.
```

## Facepull `facepull`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/facepull-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Facepull". Show the STARTING position. Stand facing a high cable holding a rope.
```

**Final** → `data/images/photos/inbox/facepull-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Facepull". Show the END position (the hardest point of the movement). Pull it towards your face, elbows high and wide.
```

## Front Raises `front_raises`

Grupo: shoulders · Material: barbell

**Inicio** → `data/images/photos/inbox/front_raises-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Front Raises". Show the STARTING position. Stand holding weights in front of your thighs.
```

**Final** → `data/images/photos/inbox/front_raises-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Front Raises". Show the END position (the hardest point of the movement). Lift them straight in front of you to shoulder height.
```

## Handstand Pushup `handstand_pushup`

Grupo: shoulders · Material: bodyweight

**Inicio** → `data/images/photos/inbox/handstand_pushup-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Handstand Pushup". Show the STARTING position. Do a handstand against a wall.
```

**Final** → `data/images/photos/inbox/handstand_pushup-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Handstand Pushup". Show the END position (the hardest point of the movement). Bend your elbows to lower your head towards the floor.
```

## High Pull `high_pull`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/high_pull-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "High Pull". Show the STARTING position. Hold a bar in front of your thighs.
```

**Final** → `data/images/photos/inbox/high_pull-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "High Pull". Show the END position (the hardest point of the movement). Pull it up explosively to your chest, elbows high.
```

## Lateral Raises on Cable, One Armed `lateral_raises_on_cable_one_armed`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/lateral_raises_on_cable_one_armed-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lateral Raises on Cable, One Armed". Show the STARTING position. Stand sideways to a low cable, holding it with the far hand.
```

**Final** → `data/images/photos/inbox/lateral_raises_on_cable_one_armed-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lateral Raises on Cable, One Armed". Show the END position (the hardest point of the movement). Lift your arm out to the side up to shoulder height.
```

## Lateral-to-Front Raises `lateral_to_front_raises`

Grupo: shoulders · Material: dumbbell

**Inicio** → `data/images/photos/inbox/lateral_to_front_raises-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lateral-to-Front Raises". Show the STARTING position. Lift the weights out to the sides to shoulder height.
```

**Final** → `data/images/photos/inbox/lateral_to_front_raises-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lateral-to-Front Raises". Show the END position (the hardest point of the movement). Bring them round to the front.
```

## Lying Rotator Cuff Exercise `lying_rotator_cuff_exercise`

Grupo: shoulders · Material: dumbbell

**Inicio** → `data/images/photos/inbox/lying_rotator_cuff_exercise-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lying Rotator Cuff Exercise". Show the STARTING position. Lie on your side holding a light weight, elbow bent at your side.
```

**Final** → `data/images/photos/inbox/lying_rotator_cuff_exercise-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Lying Rotator Cuff Exercise". Show the END position (the hardest point of the movement). Rotate your forearm upward.
```

## Military Press `military_press_1`

Grupo: shoulders · Material: barbell

**Inicio** → `data/images/photos/inbox/military_press_1-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Military Press". Show the STARTING position. Stand holding a barbell at your shoulders.
```

**Final** → `data/images/photos/inbox/military_press_1-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Military Press". Show the END position (the hardest point of the movement). Push it straight up over your head.
```

## Power Clean `power_clean`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/power_clean-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Power Clean". Show the STARTING position. Stand with the bar over your feet.
```

**Final** → `data/images/photos/inbox/power_clean-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Power Clean". Show the END position (the hardest point of the movement). Pull it up explosively and catch it on your shoulders.
```

## Push Press `push_press`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/push_press-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Push Press". Show the STARTING position. Hold the bar at your shoulders.
```

**Final** → `data/images/photos/inbox/push_press-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Push Press". Show the END position (the hardest point of the movement). Bend your knees slightly, then drive up and push the bar overhead.
```

## Shoulder Fly `shoulder_fly`

Grupo: shoulders · Material: dumbbell

**Inicio** → `data/images/photos/inbox/shoulder_fly-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shoulder Fly". Show the STARTING position. Stand holding dumbbells at your sides.
```

**Final** → `data/images/photos/inbox/shoulder_fly-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shoulder Fly". Show the END position (the hardest point of the movement). Lift your arms out to the sides up to shoulder height.
```

## Shoulder Press, on Multi Press `shoulder_press_on_multi_press`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/shoulder_press_on_multi_press-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shoulder Press, on Multi Press". Show the STARTING position. Sit under the Smith machine bar at shoulder height.
```

**Final** → `data/images/photos/inbox/shoulder_press_on_multi_press-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shoulder Press, on Multi Press". Show the END position (the hardest point of the movement). Push the bar up.
```

## Shrugs, Barbells `shrugs_barbells`

Grupo: shoulders · Material: barbell

**Inicio** → `data/images/photos/inbox/shrugs_barbells-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shrugs, Barbells". Show the STARTING position. Stand holding a bar in front of your thighs.
```

**Final** → `data/images/photos/inbox/shrugs_barbells-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Shrugs, Barbells". Show the END position (the hardest point of the movement). Lift your shoulders towards your ears.
```

## Side-lying External Rotation `side_lying_external_rotation`

Grupo: shoulders · Material: other

**Inicio** → `data/images/photos/inbox/side_lying_external_rotation-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Side-lying External Rotation". Show the STARTING position. Lie on your side with a light weight, elbow bent against your waist.
```

**Final** → `data/images/photos/inbox/side_lying_external_rotation-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Side-lying External Rotation". Show the END position (the hardest point of the movement). Rotate your forearm up.
```

## Snach `snach`

Grupo: shoulders · Material: barbell

**Inicio** → `data/images/photos/inbox/snach-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Snach". Show the STARTING position. Stand with the bar over your feet, wide grip.
```

**Final** → `data/images/photos/inbox/snach-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Snach". Show the END position (the hardest point of the movement). Lift it explosively from the floor straight above your head in one movement.
```

## Wall Handstand `wall_handstand`

Grupo: shoulders · Material: bodyweight

**Inicio** → `data/images/photos/inbox/wall_handstand-1.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Handstand". Show the STARTING position. Place your hands on the floor in front of a wall.
```

**Final** → `data/images/photos/inbox/wall_handstand-2.png`

```text
Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image. Exercise: "Wall Handstand". Show the END position (the hardest point of the movement). Kick up so your heels rest on the wall.
```

