#!/usr/bin/env python3
"""Genera los bundles i18n (nl/es/en/fr) en i18n/.

Garantía: cada bundle tiene EXACTAMENTE el mismo conjunto de claves (el
script lo asertado; lo verifican además tests/run.js).
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "i18n")

# key: {nl, en, es, fr}
T = {
    "app_name": {"nl": "FitTrack", "en": "FitTrack", "es": "FitTrack", "fr": "FitTrack"},
    "tagline": {
        "nl": "Je gymprogres, in één app.",
        "en": "Your gym progress, in one app.",
        "es": "Tu progreso en el gym, en una app.",
        "fr": "Votre progression en salle, en une app.",
    },
    "nav_dashboard": {"nl": "Overzicht", "en": "Dashboard", "es": "Resumen", "fr": "Tableau de bord"},
    "nav_exercises": {"nl": "Oefeningen", "en": "Exercises", "es": "Ejercicios", "fr": "Exercices"},
    "nav_session": {"nl": "Sessie", "en": "Session", "es": "Sesión", "fr": "Séance"},
    "nav_history": {"nl": "Geschiedenis", "en": "History", "es": "Historial", "fr": "Historique"},
    "save": {"nl": "Opslaan", "en": "Save", "es": "Guardar", "fr": "Enregistrer"},
    "cancel": {"nl": "Annuleren", "en": "Cancel", "es": "Cancelar", "fr": "Annuler"},
    "delete": {"nl": "Verwijderen", "en": "Delete", "es": "Eliminar", "fr": "Supprimer"},
    "back": {"nl": "Terug", "en": "Back", "es": "Volver", "fr": "Retour"},
    "search": {"nl": "Zoeken", "en": "Search", "es": "Buscar", "fr": "Rechercher"},
    "source_seed": {"nl": "Seed (placeholder)", "en": "Seed (placeholder)", "es": "Seed (placeholder)", "fr": "Seed (placeholder)"},
    "source_real": {"nl": "Reële data", "en": "Real data", "es": "Datos reales", "fr": "Données réelles"},
    # ---- dashboard ----
    "dash_title": {"nl": "Overzicht", "en": "Dashboard", "es": "Resumen", "fr": "Tableau de bord"},
    "dash_sub": {
        "nl": "Je laatste weken op een rij.",
        "en": "Your recent weeks at a glance.",
        "es": "Tus últimas semanas de un vistazo.",
        "fr": "Vos dernières semaines en un coup d'œil.",
    },
    "stat_weekly_volume": {"nl": "Volume deze week", "en": "Volume this week", "es": "Volumen esta semana", "fr": "Volume cette semaine"},
    "stat_weekly_sessions": {"nl": "Sessies deze week", "en": "Sessions this week", "es": "Sesiones esta semana", "fr": "Séances cette semaine"},
    "stat_streak": {"nl": "Reeks (dagen)", "en": "Streak (days)", "es": "Racha (días)", "fr": "Série (jours)"},
    "stat_pr": {"nl": "Nieuwe PR's", "en": "New PRs", "es": "Nuevas marcas", "fr": "Nouveaux records"},
    "stat_weight": {"nl": "Lichaamsgewicht", "en": "Body weight", "es": "Peso corporal", "fr": "Poids corporel"},
    "dash_volume_7d": {"nl": "Volume per week (kg)", "en": "Volume per week (kg)", "es": "Volumen por semana (kg)", "fr": "Volume par semaine (kg)"},
    "dash_groups": {"nl": "Volume per spiergroep (7 dagen)", "en": "Volume per muscle group (7 days)", "es": "Volumen por grupo muscular (7 días)", "fr": "Volume par groupe musculaire (7 jours)"},
    "dash_recent": {"nl": "Laatste sessies", "en": "Latest sessions", "es": "Últimas sesiones", "fr": "Dernières séances"},
    "dash_no_sessions": {
        "nl": "Nog geen sessies. Start een sessie om te beginnen.",
        "en": "No sessions yet. Start one to begin.",
        "es": "Aún no hay sesiones. Empieza una para comenzar.",
        "fr": "Pas encore de séance. Lancez-en une pour commencer.",
    },
    "dash_no_weight": {
        "nl": "Nog geen gewicht geregistreerd.",
        "en": "No body weight logged yet.",
        "es": "Aún no has registrado peso.",
        "fr": "Aucun poids enregistré pour l'instant.",
    },
    "dash_empty_hint": {
        "nl": "Voeg je eerste sessie toe om het dashboard te vullen.",
        "en": "Add your first session to fill the dashboard.",
        "es": "Añade tu primera sesión para llenar el panel.",
        "fr": "Ajoutez votre première séance pour remplir le tableau.",
    },
    "dash_bodyweight": {"nl": "Lichaamsgewicht (kg)", "en": "Body weight (kg)", "es": "Peso corporal (kg)", "fr": "Poids corporel (kg)"},
    # ---- exercises ----
    "ex_title": {"nl": "Oefeningen", "en": "Exercises", "es": "Ejercicios", "fr": "Exercices"},
    "ex_sub": {
        "nl": "Bekijk hoe je elke oefening correct uitvoert.",
        "en": "See how to perform each exercise correctly.",
        "es": "Mira cómo hacer cada ejercicio correctamente.",
        "fr": "Voir comment réaliser chaque exercice correctement.",
    },
    "ex_search_ph": {"nl": "Zoek een oefening…", "en": "Search an exercise…", "es": "Busca un ejercicio…", "fr": "Rechercher un exercice…"},
    "ex_filter_group": {"nl": "Spiergroep", "en": "Muscle group", "es": "Grupo muscular", "fr": "Groupe musculaire"},
    "ex_filter_equipment": {"nl": "Uitrusting", "en": "Equipment", "es": "Material", "fr": "Équipement"},
    "ex_filter_all": {"nl": "Alle", "en": "All", "es": "Todos", "fr": "Tous"},
    "ex_found": {"nl": "oefeningen gevonden", "en": "exercises found", "es": "ejercicios encontrados", "fr": "exercices trouvés"},
    "ex_instructions": {"nl": "Uitvoering", "en": "How to perform", "es": "Ejecución", "fr": "Réalisation"},
    "ex_muscle": {"nl": "Hoofdspier", "en": "Primary muscle", "es": "Musculación principal", "fr": "Muscle principal"},
    "ex_secondary": {"nl": "Secundaire spieren", "en": "Secondary muscles", "es": "Músculos secundarios", "fr": "Muscles secondaires"},
    "ex_equipment": {"nl": "Uitrusting", "en": "Equipment", "es": "Material", "fr": "Équipement"},
    "ex_level": {"nl": "Niveau", "en": "Level", "es": "Nivel", "fr": "Niveau"},
    "ex_source": {"nl": "Bron", "en": "Source", "es": "Fuente", "fr": "Source"},
    "ex_license": {"nl": "Licentie", "en": "Licence", "es": "Licencia", "fr": "Licence"},
    "ex_credit": {"nl": "Auteur", "en": "Author", "es": "Autor", "fr": "Auteur"},
    # ---- groups / equipment / levels ----
    "group_chest": {"nl": "Borst", "en": "Chest", "es": "Pecho", "fr": "Poitrine"},
    "group_back": {"nl": "Rug", "en": "Back", "es": "Espalda", "fr": "Dos"},
    "group_legs": {"nl": "Benen", "en": "Legs", "es": "Piernas", "fr": "Jambes"},
    "group_shoulders": {"nl": "Schouders", "en": "Shoulders", "es": "Hombros", "fr": "Épaules"},
    "group_arms": {"nl": "Armen", "en": "Arms", "es": "Brazos", "fr": "Bras"},
    "group_core": {"nl": "Core", "en": "Core", "es": "Core", "fr": "Gainage"},
    "group_cardio": {"nl": "Cardio", "en": "Cardio", "es": "Cardio", "fr": "Cardio"},
    "group_full_body": {"nl": "Heel lichaam", "en": "Full body", "es": "Cuerpo completo", "fr": "Corps entier"},
    "equip_barbell": {"nl": "Knikstang", "en": "Barbell", "es": "Barbell", "fr": "Barre"},
    "equip_dumbbell": {"nl": "Halters", "en": "Dumbbell", "es": "Mancuerna", "fr": "Haltère"},
    "equip_machine": {"nl": "Machine", "en": "Machine", "es": "Máquina", "fr": "Machine"},
    "equip_cable": {"nl": "Cable", "en": "Cable", "es": "Cable", "fr": "Poulie"},
    "equip_bodyweight": {"nl": "Eigen lichaamsgewicht", "en": "Bodyweight", "es": "Peso corporal", "fr": "Poids du corps"},
    "equip_other": {"nl": "Overig", "en": "Other", "es": "Otro", "fr": "Autre"},
    "level_beginner": {"nl": "Beginner", "en": "Beginner", "es": "Principiante", "fr": "Débutant"},
    "level_intermediate": {"nl": "Intermediair", "en": "Intermediate", "es": "Intermedio", "fr": "Intermédiaire"},
    "level_advanced": {"nl": "Geavanceerd", "en": "Advanced", "es": "Avanzado", "fr": "Avancé"},
    # ---- session ----
    "sess_title": {"nl": "Sessie", "en": "Session", "es": "Sesión", "fr": "Séance"},
    "sess_sub": {
        "nl": "Zet je training vast: oefeningen, sets, rep's en gewicht.",
        "en": "Log your workout: exercises, sets, reps and weight.",
        "es": "Registra tu entreno: ejercicios, series, repeticiones y peso.",
        "fr": "Enregistrez votre entraînement : exercices, séries, reps et poids.",
    },
    "sess_pick": {"nl": "Kies een oefening", "en": "Pick an exercise", "es": "Elige un ejercicio", "fr": "Choisissez un exercice"},
    "sess_search_ph": {"nl": "Zoek oefening of spiergroep…", "en": "Search exercise or muscle group…", "es": "Busca ejercicio o grupo muscular…", "fr": "Rechercher un exercice ou groupe…"},
    "sess_add_exercise": {"nl": "Oefening toevoegen", "en": "Add exercise", "es": "Añadir ejercicio", "fr": "Ajouter un exercice"},
    "sess_reps": {"nl": "Rep's", "en": "Reps", "es": "Reps", "fr": "Reps"},
    "sess_weight": {"nl": "Gewicht (kg)", "en": "Weight (kg)", "es": "Peso (kg)", "fr": "Poids (kg)"},
    "sess_sets": {"nl": "Sets", "en": "Sets", "es": "Series", "fr": "Séries"},
    "sess_set": {"nl": "Set", "en": "Set", "es": "Serie", "fr": "Série"},
    "sess_add_set": {"nl": "Set toevoegen", "en": "Add set", "es": "Añadir serie", "fr": "Ajouter une série"},
    "sess_notes": {"nl": "Notities", "en": "Notes", "es": "Notas", "fr": "Notes"},
    "sess_notes_ph": {"nl": "bijv. '5 kg lichter dan vorige week'", "en": "e.g. '5 kg lighter than last week'", "es": "p. ej. '5 kg menos que la semana pasada'", "fr": "ex. « 5 kg de moins que la semaine dernière »"},
    "sess_date": {"nl": "Datum", "en": "Date", "es": "Fecha", "fr": "Date"},
    "sess_save": {"nl": "Sessie opslaan", "en": "Save session", "es": "Guardar sesión", "fr": "Enregistrer la séance"},
    "sess_saved": {"nl": "Sessie opgeslagen", "en": "Session saved", "es": "Sesión guardada", "fr": "Séance enregistrée"},
    "sess_saved_hint": {
        "nl": "Zie je sessie terug in het overzicht.",
        "en": "See it in your dashboard.",
        "es": "Vela en tu resumen.",
        "fr": "Consultez-la dans votre tableau de bord.",
    },
    "sess_no_exercises": {"nl": "Voeg eerst een oefening toe.", "en": "Add an exercise first.", "es": "Añade un ejercicio primero.", "fr": "Ajoutez d'abord un exercice."},
    "sess_bodyweight": {"nl": "Lichaamsgewicht (optioneel, kg)", "en": "Body weight (optional, kg)", "es": "Peso corporal (opcional, kg)", "fr": "Poids corporel (facultatif, kg)"},
    # ---- history ----
    "hist_title": {"nl": "Geschiedenis", "en": "History", "es": "Historial", "fr": "Historique"},
    "hist_sub": {"nl": "Al je sessies, nieuwste eerst.", "en": "All your sessions, newest first.", "es": "Todas tus sesiones, de más reciente a anterior.", "fr": "Toutes vos séances, de la plus récente à l'ancienne."},
    "hist_empty": {"nl": "Nog geen sessies in je geschiedenis.", "en": "No sessions in your history yet.", "es": "Aún no hay sesiones en tu historial.", "fr": "Pas encore de séance dans l'historique."},
    "hist_delete": {"nl": "Sessie verwijderen", "en": "Delete session", "es": "Eliminar sesión", "fr": "Supprimer la séance"},
    "hist_exercises": {"nl": "oefeningen", "en": "exercises", "es": "ejercicios", "fr": "exercices"},
    "hist_sets_total": {"nl": "sets", "en": "sets", "es": "series", "fr": "séries"},
    "hist_volume": {"nl": "volume", "en": "volume", "es": "volumen", "fr": "volume"},
    # ---- footer ----
    "footer": {
        "nl": "FitTrack — lokaal opgeslagen, geen account nodig.",
        "en": "FitTrack — stored locally, no account needed.",
        "es": "FitTrack — se guarda en tu dispositivo, sin cuenta.",
        "fr": "FitTrack — stocké localement, sans compte.",
    },
    "footer_note": {
        "nl": "Oefeningen-database: echte gegevens van wger (CC-BY-SA) — zie PROGRESS.md.",
        "en": "Exercise database: real data from wger (CC-BY-SA) — see PROGRESS.md.",
        "es": "Base de ejercicios: datos reales de wger (CC-BY-SA) — ver PROGRESS.md.",
        "fr": "Base d'exercices : données réelles de wger (CC-BY-SA) — voir PROGRESS.md.",
    },
}

LANGS = ["nl", "es", "en", "fr"]

I18N_JS_LOGIC = r"""
  const DEFAULT = 'es';
  let current = DEFAULT;

  function readStored() {
    try {
      const v = localStorage.getItem('fittrack.lang');
      return BUNDLES[v] ? v : DEFAULT;
    } catch (e) { return DEFAULT; }
  }

  function t(key, vars) {
    let s = (BUNDLES[current] && BUNDLES[current][key]) || (BUNDLES[DEFAULT][key] || key);
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', String(vars[k]));
    return s;
  }

  function apply() {
    current = readStored();
    document.documentElement.setAttribute('lang', current);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('.lang-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-lang') === current);
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === current);
    });
  }

  function setLang(lang) {
    if (!BUNDLES[lang]) return;
    try { localStorage.setItem('fittrack.lang', lang); } catch (e) {}
    apply();
    document.querySelectorAll('.lang-btn').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    // permite que las vistas dinámicas se repinten en el nuevo idioma
    window.dispatchEvent(new CustomEvent('ft-lang-change', { detail: { lang } }));
  }

  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.addEventListener('click', () => setLang(b.getAttribute('data-lang')));
  });
  apply();

  return { t, setLang, getLang: () => current, DEFAULT, BUNDLES };
"""


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    keys = sorted(T.keys())
    for lang in LANGS:
        values = {k: T[k][lang] for k in keys}
        # verificación: sin vacíos
        for k, v in values.items():
            assert v and v.strip(), f"{lang}:{k} vacío"
        path = os.path.join(OUT, f"{lang}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(values, f, ensure_ascii=False, indent=2, sort_keys=True)
            f.write("\n")
        print(f"wrote {path} ({len(values)} claves)")
    # verificación cruzada de paridad de claves
    sets = {lang: set(json.load(open(os.path.join(OUT, f"{lang}.json"))).keys()) for lang in LANGS}
    base = sets["en"]
    for lang in LANGS:
        assert sets[lang] == base, f"paridad de claves fallida en {lang}"
    print(f"OK: {len(keys)} claves idénticas en los 4 bundles")

    # JS de i18n para la web (bundles embebidos, 0 peticiones de red)
    emit_i18n_js(os.path.join(ROOT, "web", "public", "js", "i18n.js"))
    return 0


def emit_i18n_js(path: str) -> None:
    """Genera web/public/js/i18n.js con los 4 bundles embebidos + lógica de
    conmutación instantánea (0 peticiones de red)."""
    keys = sorted(T.keys())
    bundles = {lang: {k: T[k][lang] for k in keys} for lang in LANGS}
    body = "/* FitTrack i18n — 4 bundles (nl/es/en/fr) embebidos: cambio de idioma sin red. */\n"
    body += "window.FT_I18N = (function () {\n"
    body += "  const BUNDLES = " + json.dumps(bundles, ensure_ascii=False, indent=2) + ";\n"
    body += I18N_JS_LOGIC
    body += "})();\n"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(body)
    print(f"wrote {path}")


if __name__ == "__main__":
    raise SystemExit(main())
