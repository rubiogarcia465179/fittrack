/**
 * WEB PÚBLICA (R-152, solo web): seguir la sesión creada, una serie cada vez.
 * Arriba: cerrar · tiempo total · series hechas. En medio, solo lo que toca:
 * el ejercicio (dibujo en movimiento), "Ejercicio n de m · Serie n de m",
 * reps y kg (pesos estándar, R-171) con cómo cargarlos (R-163) y un único
 * botón blanco ("Serie hecha"). El descanso, a pantalla completa con cuenta
 * atrás que vibra/suena al acabar (R-159), enseña el siguiente ejercicio si
 * cambia o un consejo si se repite (R-164). Al final:
 * mensaje motivador (R-170), "Extra mile" (R-172) y enviar a WhatsApp (R-169).
 * Lógica pura: lib/webSession y lib/webLog.
 */
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import type { Lang } from '../i18n';
import type { Exercise } from '../data';
import { exName } from '../lib/names';
import { primeWebAlerts, restDone } from '../lib/haptics';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { ExerciseHowTo } from '../components/ExerciseHowTo';
import { LoadLine } from '../components/LoadLine';
import { RestPreview } from '../components/RestPreview';
import { MotivationCard } from '../components/MotivationCard';
import { ChangeSheet } from '../components/ChangeSheet';
import { pickTip } from '../lib/restTips';
import { perHand, fmtKg, loadFor, stepWeight } from '../lib/plates';
import { extraStreak, entryFromSession, loadLog, mergeLog, saveLog, toJson, toText, type LogEntry } from '../lib/webLog';
import {
  addExtra, addRest, clock, completeSet, current, doneSets, endNow, extraDone, laterExercise, lastDoneEi, moveExercise, restLeft, setField, skipRest, swapExercise, totalSets,
  type WsExercise, type WsState,
} from '../lib/webSession';

/** yyyy-mm-dd en hora local. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function WebSession({
  initial,
  byId,
  onExit,
  onNew,
  onExtra,
  exitSignal = 0,
  onLog,
  onTop,
  onAlternatives,
}: {
  initial: WsState;
  byId: Map<string, Exercise>;
  /** Cerrar sin haber hecho nada: vuelve a la sesión propuesta. */
  onExit: () => void;
  /** Tras el resumen: otro entreno desde cero. */
  onNew: () => void;
  /** "Extra mile": el siguiente ejercicio (o null si no hay más). */
  onExtra: (taken: string[]) => WsExercise | null;
  /** Cambia cuando se toca el logo: pide terminar (o sale si no hay nada hecho). */
  exitSignal?: number;
  /** El historial local cambió (racha, pesos). */
  onLog?: (log: LogEntry[]) => void;
  /** Volver arriba (al añadir la Extra mile, el botón queda abajo). */
  onTop?: () => void;
  /** R-177: hasta 3 ejercicios parecidos al actual (con su peso). */
  onAlternatives?: (ex: WsExercise, taken: string[]) => WsExercise[];
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { p } = useTheme();
  const [s, setS] = useState(initial);
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState(false);
  const [howto, setHowto] = useState<string | null>(null);
  // R-176/R-177: hoja "Cambiar ejercicio" (parecido, más tarde, orden).
  const [changing, setChanging] = useState(false);
  const [tip, setTip] = useState(() => pickTip(null));
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState(0);

  // Un tic cada 250 ms mientras la sesión sigue.
  useEffect(() => {
    if (s.finished) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [s.finished]);

  const left = restLeft(s, now);
  // Fin del descanso: vibra / suena y vuelve a la serie.
  useEffect(() => {
    if (s.restUntil && left === 0) {
      restDone();
      setS((x) => skipRest(x));
    }
  }, [left, s.restUntil]);

  const elapsed = ((s.finished ?? now) - s.started) / 1000;
  const c = current(s);
  const ex = c ? s.ex[c.ei] : null;
  const set = c && ex ? ex.sets[c.si] : null;
  const e = ex ? byId.get(ex.id) : undefined;
  const name = (id: string) => {
    const r = byId.get(id);
    return r ? exName(r, lang) : id;
  };
  // Coma decimal en ES/NL/FR (42,5), punto en EN: igual que la línea de carga.
  const kgText = (kg: number, id: string) => (perHand(byId.get(id)) ? t('web_kg_hand', { kg: fmtKg(kg, lang) }) : `${fmtKg(kg, lang)} kg`);
  const setLine = (x: { reps: number; kg: number; min?: number }, id: string, bw: boolean) =>
    x.min ? `${x.min} min` : bw || !x.kg ? `${x.reps} reps` : `${x.reps} reps · ${kgText(x.kg, id)}`;

  // Durante la SERIE, "Siguiente" es lo que viene tras ella. Durante el
  // DESCANSO la serie actual ya avanzó: lo siguiente ES la serie actual (R-158).
  const after = (() => {
    if (!c || !ex) return null;
    if (c.si + 1 < ex.sets.length) return { same: true, text: t('ws_set_of', { n: c.si + 2, total: ex.sets.length }) };
    const nx = s.ex[c.ei + 1];
    return nx ? { same: false, text: name(nx.id) } : null;
  })();
  const restSame = c != null && lastDoneEi(s) === c.ei;

  // Logo durante la sesión = cerrar (con confirmación si ya hay series).
  const firstSignal = useRef(exitSignal);
  useEffect(() => {
    if (exitSignal === firstSignal.current) return;
    if (s.finished) onNew();
    else if (doneSets(s)) setConfirm(true);
    else onExit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exitSignal]);

  // La pestaña del navegador también cuenta (útil con el móvil bloqueado y vuelta).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.title;
    document.title = s.finished ? `FitTrack · ${t('checkin_title')}` : left ? `${clock(left)} · ${t('rest_title')}` : `${clock(elapsed)} · FitTrack`;
    return () => {
      document.title = prev;
    };
  }, [left, Math.floor(elapsed), s.finished, t]); // eslint-disable-line react-hooks/exhaustive-deps

  // Al terminar: copia en este navegador (racha y pesos). Si luego se hace la
  // Extra mile y se vuelve a terminar, la entrada se sustituye.
  const savedRef = useRef<LogEntry | null>(null);
  useEffect(() => {
    if (!s.finished) return;
    const entry = entryFromSession(s, today(), extraDone(s));
    let log = loadLog();
    if (savedRef.current) {
      const old = JSON.stringify(savedRef.current);
      log = log.filter((x) => JSON.stringify(x) !== old);
    }
    if (entry) {
      log = mergeLog(log, [entry]);
      savedRef.current = entry;
    }
    saveLog(log);
    setStreak(extraStreak(log.map((x) => !!x.extra)));
    onLog?.(log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.finished]);

  const done = doneSets(s);
  const total = totalSets(s);
  const close = () => (done ? setConfirm(true) : onExit());
  const tapDone = () => {
    primeWebAlerts(); // el toque desbloquea el pitido / háptico del descanso
    setTip((x) => pickTip(x));
    // Mismo instante para la serie y el reloj: si no, el tic de 250 ms va por
    // detrás y el descanso empieza un segundo por encima (1:31 con 90 s).
    const at = Date.now();
    setNow(at);
    setS((x) => completeSet(x, at));
  };

  // ---------- Resumen ----------
  if (s.finished) {
    const entry = savedRef.current;
    const extra = extraDone(s);
    // Extra mile solo con el plan cumplido (todas sus series) y una vez por sesión.
    const complete = s.ex.filter((x) => !x.extra).every((x) => x.sets.every((y) => y.done_at));
    const offerExtra = complete && !s.ex.some((x) => x.extra);
    const goExtra = () => {
      const nx = onExtra(s.ex.map((x) => x.id));
      if (nx) {
        setS((x) => addExtra(x, nx));
        onTop?.();
      }
    };
    const send = () => {
      if (!entry) return;
      void Linking.openURL(`https://wa.me/?text=${encodeURIComponent(toText(entry, name))}`).catch(() => undefined);
    };
    const copyJson = () => {
      if (!entry) return;
      void globalThis.navigator?.clipboard?.writeText(toJson(entry)).then(() => setCopied(true)).catch(() => undefined);
    };
    const share = () => {
      const text = t('xm_share', { count: streak });
      const nav = globalThis.navigator as Navigator | undefined;
      if (nav?.share) void nav.share({ text }).catch(() => undefined);
      else void Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`).catch(() => undefined);
    };
    return (
      <View style={styles.wrap}>
        <Text style={[styles.h1, { color: p.text }]} accessibilityRole="header">{t('checkin_title')}</Text>
        <MotivationCard />
        <View style={styles.stats}>
          <Stat value={String(Math.max(1, Math.round(elapsed / 60)))} label="min" />
          <Stat value={String(done)} label={t('workout_sets_done')} />
        </View>
        {/* Extra mile: la acción principal hasta hacerla; luego, compartir la racha. */}
        {offerExtra ? (
          <>
            <Primary label={t('xm_button')} onPress={goExtra} />
            <Text style={[styles.next, { color: p.secondary }]}>{t('xm_hint')}</Text>
          </>
        ) : extra ? (
          <>
            <View style={styles.xmRow}>
              <Text style={[styles.xmDone, { color: p.text }]}>{t('xm_done', { count: streak })}</Text>
              <Pressable accessibilityRole="button" onPress={share} style={({ pressed }) => [styles.xmShare, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}>
                <Text style={[styles.outlineText, { color: p.text, fontSize: 15 }]}>{t('xm_share_btn')}</Text>
              </Pressable>
            </View>
          </>
        ) : null}
        <View style={[styles.card, { borderColor: p.border, backgroundColor: p.card }]}>
          {s.ex.map((x, i) => {
            const hechas = x.sets.filter((y) => y.done_at);
            return (
              <View key={`${x.id}-${i}`} style={[styles.sumRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: p.border }]}>
                {/* Nombre entero arriba y lo hecho debajo (nada de "Incline dumbbell …"). */}
                <Text style={[styles.sumName, { color: hechas.length ? p.text : p.dim }]}>{name(x.id)}</Text>
                <Text style={[styles.sumSets, { color: p.secondary }]}>
                  {[x.extra ? 'Extra mile' : null, hechas.length ? `${hechas.length} × ${setLine(hechas[hechas.length - 1], x.id, x.bodyweight)}` : t('ws_not_done')].filter(Boolean).join(' · ')}
                </Text>
              </View>
            );
          })}
        </View>
        {/* Guardar en tu WhatsApp (el historial de la web); JSON como enlace discreto. */}
        {entry ? (
          <View style={{ marginTop: 20 }}>
            <Outline label={t('wa_send')} onPress={send} />
            <Pressable accessibilityRole="button" onPress={copyJson} style={({ pressed }) => [styles.link, { opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.linkText, { color: p.secondary }]}>{copied ? t('wa_copied') : t('wa_copy_json')}</Text>
            </Pressable>
          </View>
        ) : null}
        {!offerExtra ? <Primary label={t('ws_new')} onPress={onNew} /> : (
          <View style={{ marginTop: 4 }}><Outline label={t('ws_new')} onPress={onNew} /></View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {/* Barra: cerrar · tiempo total · series */}
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('ws_end_q')}
          onPress={close}
          style={({ pressed }) => [styles.x, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
        >
          <View style={[styles.xLine, { backgroundColor: p.text, transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.xLine, { backgroundColor: p.text, transform: [{ rotate: '-45deg' }] }]} />
        </Pressable>
        <Text style={[styles.clock, { color: p.text }]} accessibilityLabel={`${clock(elapsed)}`}>{clock(elapsed)}</Text>
        <Text style={[styles.count, { color: p.secondary }]}>{t('ws_sets_count', { done, total })}</Text>
      </View>
      <View style={[styles.bar, { backgroundColor: p.border }]}>
        <View style={[styles.barFill, { backgroundColor: p.text, width: `${(done / Math.max(1, total)) * 100}%` }]} />
      </View>

      {confirm ? (
        <View style={[styles.card, styles.confirm, { borderColor: p.border, backgroundColor: p.card }]}>
          <Text style={[styles.confirmQ, { color: p.text }]}>{t('ws_end_q')}</Text>
          <View style={styles.row2}>
            <Outline label={t('ws_keep')} onPress={() => setConfirm(false)} />
            <Outline label={t('ws_end')} onPress={() => { setConfirm(false); setS((x) => endNow(x, Date.now())); }} />
          </View>
        </View>
      ) : null}

      {left > 0 && ex && set && c ? (
        // ---------- Descanso ----------
        <View style={styles.center}>
          <Text style={[styles.label, { color: p.secondary }]}>{t('rest_title')}</Text>
          {/* Sin región "en vivo" en la cuenta atrás: el lector de pantalla no la lee cada segundo. */}
          <Text style={[styles.rest, { color: p.text }]} accessibilityLabel={`${t('rest_title')}: ${left} s`}>{clock(left)}</Text>
          <View style={styles.row2}>
            <Outline label="+15 s" a11y={t('rest_add15')} onPress={() => setS((x) => addRest(x, 15, Date.now()))} />
            <Outline label={t('rest_skip')} a11y={t('rest_skip_a11y')} onPress={() => setS((x) => skipRest(x))} />
          </View>
          {restSame ? (
            <Text style={[styles.next, { color: p.secondary }]}>
              {t('ws_next', { what: t('ws_set_of', { n: c.si + 1, total: ex.sets.length }) })}
            </Text>
          ) : null}
          <RestPreview
            tip={tip}
            onHowTo={setHowto}
            next={restSame ? null : {
              id: ex.id,
              group: e?.muscle_group || 'core',
              name: name(ex.id),
              // El peso lo dice la línea de carga (si la hay): sin repetirlo.
              line: ex.cardio ? `${set.min} min` : `${ex.sets.length} × ${setLine(set, ex.id, ex.bodyweight || !!loadFor(e?.equipment, set.kg, e?.name_en))}`,
              equipment: e?.equipment,
              name_en: e?.name_en,
              kg: ex.bodyweight ? 0 : set.kg,
            }}
          />
        </View>
      ) : ex && set && c ? (
        // ---------- Serie ----------
        <View style={styles.center}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${name(ex.id)}. ${t('web_tap_hint')}`}
            onPress={() => setHowto(ex.id)}
            style={({ pressed }) => [styles.art, { borderColor: p.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <ExerciseThumb id={ex.id} group={e?.muscle_group || 'core'} size={150} color={p.text} animate />
          </Pressable>
          {/* La misma hoja que en la lista (dibujos, pasos, vídeo) y, al lado,
              "Cambiar": otro parecido, más tarde u otro orden (R-176/R-177). */}
          <View style={styles.pills}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setHowto(ex.id)}
              style={({ pressed }) => [styles.howto, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.howtoText, { color: p.text }]}>{t('howto_button')}</Text>
            </Pressable>
            {onAlternatives ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t('chg_title')}: ${name(ex.id)}`}
                onPress={() => setChanging(true)}
                style={({ pressed }) => [styles.howto, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={[styles.howtoText, { color: p.text }]}>{t('chg_button')}</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.exName, { color: p.text }]} accessibilityRole="header" numberOfLines={3}>{name(ex.id)}</Text>
          {/* Dónde estás: ejercicio n de m · serie n de m (R-158). */}
          <Text style={[styles.label, { color: p.secondary, marginTop: 8, textAlign: 'center' }]}>
            {[
              ex.extra ? 'Extra mile' : t('ws_ex_of', { n: c.ei + 1, total: s.ex.length }),
              ex.cardio ? t('group_cardio') : t('ws_set_of', { n: c.si + 1, total: ex.sets.length }),
            ].join(' · ')}
          </Text>
          <View style={styles.steppers}>
            {ex.cardio ? (
              <Stepper value={`${set.min}`} unit="min" onMinus={() => setS((x) => setField(x, 'min', Math.max(1, (set.min || 0) - 5)))} onPlus={() => setS((x) => setField(x, 'min', (set.min || 0) + 5))} />
            ) : (
              <>
                <Stepper value={`${set.reps}`} unit="reps" onMinus={() => setS((x) => setField(x, 'reps', set.reps - 1))} onPlus={() => setS((x) => setField(x, 'reps', set.reps + 1))} />
                {!ex.bodyweight ? (
                  <Stepper
                    value={fmtKg(set.kg, lang)}
                    unit={perHand(e) ? t('web_kg_hand', { kg: '' }).trim() : 'kg'}
                    // Solo pesos que existen (R-171): mancuerna 12 → 14, barra de 2,5 en 2,5.
                    onMinus={() => setS((x) => setField(x, 'kg', stepWeight(e?.equipment, set.kg, -1, e?.name_en)))}
                    onPlus={() => setS((x) => setField(x, 'kg', stepWeight(e?.equipment, set.kg, 1, e?.name_en)))}
                  />
                ) : null}
              </>
            )}
          </View>
          {!ex.bodyweight ? <View style={{ marginTop: 14 }}><LoadLine equipment={e?.equipment} kg={set.kg} name_en={e?.name_en} /></View> : null}
          <Primary label={ex.cardio ? t('ws_done') : t('ws_set_done')} onPress={tapDone} />
          {after ? <Text style={[styles.next, { color: p.secondary }]}>{t('ws_next', { what: after.text })}</Text> : null}
        </View>
      ) : null}
      {howto && byId.get(howto) ? <ExerciseHowTo exercise={byId.get(howto)!} onClose={() => setHowto(null)} hideCredit /> : null}
      {changing && ex && c && onAlternatives ? (() => {
        const alts = onAlternatives(ex, s.ex.map((x) => x.id));
        const lastPending = s.ex.reduce((a, x, i) => (x.sets.some((y) => !y.done_at) ? i : a), -1);
        return (
          <ChangeSheet
            title={name(ex.id)}
            alts={alts.map((a) => {
              const r = byId.get(a.id);
              return { id: a.id, group: r?.muscle_group || 'core', name: name(a.id), sub: a.cardio ? `${a.sets[0].min} min` : setLine(a.sets[0], a.id, a.bodyweight) };
            })}
            rows={s.ex.map((x, i) => ({
              key: `${i}-${x.id}`,
              id: x.id,
              group: byId.get(x.id)?.muscle_group || 'core',
              name: name(x.id),
              done: x.sets.every((y) => y.done_at),
              current: i === c.ei,
            }))}
            onSwap={(id) => {
              const a = alts.find((x) => x.id === id);
              if (a) setS((x) => swapExercise(x, c.ei, a));
              setChanging(false);
            }}
            onLater={lastPending > c.ei ? () => { setS((x) => laterExercise(x, c.ei)); setChanging(false); } : null}
            onMove={(from, to) => setS((x) => moveExercise(x, from, to))}
            onClose={() => setChanging(false)}
          />
        );
      })() : null}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { p } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.statV, { color: p.text }]}>{value}</Text>
      <Text style={[styles.statL, { color: p.secondary }]}>{label}</Text>
    </View>
  );
}

function Stepper({ value, unit, onMinus, onPlus }: { value: string; unit: string; onMinus: () => void; onPlus: () => void }) {
  const { p } = useTheme();
  const { t } = useTranslation();
  const btn = (sign: '−' | '+', on: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t(sign === '+' ? 'ws_more' : 'ws_less')} ${unit}`}
      onPress={on}
      style={({ pressed }) => [styles.stepBtn, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
    >
      {/* Signos dibujados (no glifos): sin "tofu". */}
      <View style={[styles.signH, { backgroundColor: p.text }]} />
      {sign === '+' ? <View style={[styles.signV, { backgroundColor: p.text }]} /> : null}
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      {btn('−', onMinus)}
      <View style={styles.stepVal}>
        <Text style={[styles.stepNum, { color: p.text }]}>{value}</Text>
        <Text style={[styles.stepUnit, { color: p.secondary }]}>{unit}</Text>
      </View>
      {btn('+', onPlus)}
    </View>
  );
}

function Primary({ label, onPress }: { label: string; onPress: () => void }) {
  const { p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.primary,
        { backgroundColor: p.accent, opacity: pressed ? 0.85 : hovered ? 0.92 : 1 },
      ]}
    >
      <Text style={[styles.primaryText, { color: p.onAccent }]}>{label}</Text>
    </Pressable>
  );
}

function Outline({ label, a11y, onPress }: { label: string; a11y?: string; onPress: () => void }) {
  const { p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y || label}
      onPress={onPress}
      style={({ pressed }) => [styles.outline, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={[styles.outlineText, { color: p.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingTop: 8 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  x: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  xLine: { position: 'absolute', width: 16, height: 2, borderRadius: 1 },
  clock: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  count: { minWidth: 44, textAlign: 'right', fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bar: { height: 2, borderRadius: 1, marginTop: 12, overflow: 'hidden' },
  barFill: { height: 2 },
  center: { alignItems: 'center', paddingTop: 20 },
  howto: { marginTop: 14, minHeight: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  howtoText: { fontSize: 15, fontWeight: '700' },
  art: { width: 180, height: 180, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginTop: 12, lineHeight: 31 },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  // Reps y kg lado a lado: "Serie hecha" cabe en la pantalla del móvil sin desplazar.
  steppers: { marginTop: 20, flexDirection: 'row', gap: 12, width: '100%' },
  stepper: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  signH: { position: 'absolute', width: 18, height: 2, borderRadius: 1 },
  signV: { position: 'absolute', width: 2, height: 18, borderRadius: 1 },
  stepVal: { minWidth: 56, flexShrink: 1, alignItems: 'center' },
  stepNum: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'], lineHeight: 36 },
  stepUnit: { fontSize: 13, marginTop: 2, textAlign: 'center' },
  primary: { marginTop: 24, minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  primaryText: { fontSize: 18, fontWeight: '800' },
  next: { fontSize: 15, marginTop: 16, textAlign: 'center' },
  rest: { fontSize: 96, fontWeight: '800', letterSpacing: -2, fontVariant: ['tabular-nums'], marginVertical: 16 },
  row2: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  outline: { flex: 1, minHeight: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontSize: 16, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 20 },
  confirm: { gap: 14 },
  confirmQ: { fontSize: 18, fontWeight: '800' },
  h1: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, marginTop: 16 },
  stats: { flexDirection: 'row', marginTop: 20 },
  statV: { fontSize: 44, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statL: { fontSize: 14, marginTop: 2 },
  sumRow: { gap: 2, paddingVertical: 12 },
  sumName: { fontSize: 16, fontWeight: '700' },
  sumSets: { fontSize: 14, fontVariant: ['tabular-nums'] },
  xmRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  xmDone: { flex: 1, fontSize: 17, fontWeight: '800' },
  xmShare: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  link: { minHeight: 44, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  linkText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
});
