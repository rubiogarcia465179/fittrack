# Fase 21: la web pública = una pantalla que crea un entreno (R-136, R-138)

Peticiones del usuario (2026-11-16): "In the web, and only the web, the idea is
not that you have a profile and save data. The idea is a simple web to which
you request a training session, then asks you for some data, then it creates a
training session for you … change among spanish, dutch, english, french …
pass the SteveJobs filter 10 times … until the focus of the web is 10" y,
antes de dormir, "Run the SteveJobs analyze, suggest, and apply changes to the
web. Do this 5 times in a loop". Se hicieron **10 vueltas** (la primera
petición) + una pasada de calidad de las sesiones.

*Crítica imaginada al estilo de Steve Jobs, basada en sus principios públicos.*
Capturas a 393 (móvil), 834 (tableta) y 1440 (escritorio) en cada vuelta
(`web/qa.sh` → `docs/screenshots/web/`).

| Vuelta | Foco | Simplicidad | Cómo funciona | Punta a punta | Oficio | Artes liberales | Autenticidad | 1.ª impresión | Funciona solo | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| Base | 7 | 8 | 6 | 8 | 8 | 7 | 9 | 7 | 8 | 68 |
| 1 | 8 | 9 | 8 | 8 | 8 | 9 | 10 | 8 | 9 | 77 |
| 2 | 8 | 9 | 9 | 8 | 8 | 9 | 10 | 8 | 9 | 78 |
| 3 | 8 | 9 | 9 | 8 | 9 | 9 | 10 | 9 | 9 | 80 |
| 4 | 9 | 10 | 9 | 8 | 9 | 9 | 10 | 9 | 9 | 82 |
| 5 | 9 | 10 | 9 | 9 | 10 | 9 | 10 | 9 | 9 | 84 |
| 6 | 9 | 10 | 9 | 9 | 10 | 9 | 10 | 9 | 10 | 85 |
| 7 | 9 | 10 | 9 | 9 | 10 | 9 | 10 | 9 | 10 | 85 |
| 8 | **10** | 10 | 9 | 9 | 10 | 9 | 10 | 9 | 9 | 85 |
| 9 | 10 | 10 | 9 | 9 | 10 | 9 | 10 | 9 | 9 | 85 |
| 10 | 10 | 10 | **10** | 9 | 10 | 9 | 10 | 9 | 9 | **86** |

## Vueltas
1. Ejercicios raros ("Bear Walk" primero por orden alfabético, "Axe Hold") →
   se prefieren los clásicos **con dibujo real**; fuera la pregunta "Nivel"
   (solo empujaba el orden). Todas las filas con dibujo.
2. Empuje con dos aperturas y sin press → multiarticulares primero; miniaturas
   más grandes (64 pt) para leer el dibujo.
3. Salto de diseño al aparecer la sesión → en escritorio la columna derecha
   existe desde el principio con un estado vacío (tres dibujos y una frase);
   los básicos más conocidos primero (press inclinado antes que declinado).
4. Dos llamadas a la acción tras crear → en escritorio cada respuesta
   actualiza la sesión al momento y el botón se va; "3 × 10 · descanso 90 s"
   se dice una vez, no en cada fila.
5. La hoja "¿Cómo se hace?" ocupaba todo el ancho en escritorio → tarjeta
   centrada de 640 pt con fondo a pantalla completa (en el móvil, la hoja
   inferior de siempre).
6. 4 idiomas a la vista: "Knikstang" (barra EZ) usado como "barra" en NL →
   "Halterstang"/"Dumbbell" (también en la app); hover sutil (no un bloque
   negro); fuera el subtítulo de cada fila (el dibujo ya dice el material).
7. Móvil: tras crear, las preguntas se pliegan (una cosa cada vez).
8. El resumen plegado repetía el título → "Cambiar" junto al título de la
   sesión; en escritorio la línea de la sesión solo dice series y descanso.
   **Foco 10**: una pantalla que pide lo justo y da la sesión.
9. Cada grupo = un multiarticular + un aislamiento (no dos press de hombro).
10. Orden dentro del grupo: multiarticular primero; brazos = tríceps en
    empuje, bíceps en tirón.
- Pasada de calidad (escritorio, 3 sesiones más): sin gimnasio nada de
  máquinas/poleas; sin material nada de barra fija ni discos; nada avanzado
  (pinos, muscle-up, arrancada); el consejo del peso solo si hay carga.

## Estado
Web lista. Falta que el usuario conecte Netlify (ver `web/README.md`).
