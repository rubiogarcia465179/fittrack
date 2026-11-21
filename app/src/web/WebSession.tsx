/**
 * WEB PÚBLICA (R-152, solo web): seguir la sesión creada, una serie cada vez.
 * Arriba: cerrar · tiempo total · series hechas. En medio, solo lo que toca:
 * el ejercicio, "Serie n de m", reps y kg ajustables y un único botón blanco
 * ("Serie hecha"). Después, el descanso a pantalla completa con cuenta atrás
 * (+15 s · Saltar) que vibra al acabar. Al final, "Bien hecho" con minutos,
 * series y lo hecho por ejercicio. No se guarda nada (lógica: lib/webSession).
 */
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import type { Lang } from '../i18n';
import type { Exercise } from '../data';
import { exName } from '../lib/names';
import { restDone } from '../lib/haptics';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { ExerciseHowTo } from '../components/ExerciseHowTo';
import {
  addRest, adjust, clock, completeSet, current, doneSets, endNow, restLeft, skipRest, totalSets, type WsState,
} from '../lib/webSession';

export function WebSession({
  initial,
  byId,
  onExit,
  onNew,
}: {
  initial: WsState;
  byId: Map<string, Exercise>;
  /** Cerrar sin haber hecho nada: vuelve a la sesión propuesta. */
  onExit: () => void;
  /** Tras el resumen: otro entreno desde cero. */
  onNew: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { p } = useTheme();
  const [s, setS] = useState(initial);
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState(false);
  const [howto, setHowto] = useState<string | null>(null);

  // Un tic por segundo mientras la sesión sigue.
  useEffect(() => {
    if (s.finished) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [s.finished]);

  const left = restLeft(s, now);
  // Fin del descanso: vibra y vuelve a la serie.
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
  const kgText = (kg: number, id: string) => (byId.get(id)?.equipment === 'dumbbell' ? t('web_kg_hand', { kg }) : `${kg} kg`);
  const setLine = (x: { reps: number; kg: number; min?: number }, id: string, bw: boolean) =>
    x.min ? `${x.min} min` : bw || !x.kg ? `${x.reps} reps` : `${x.reps} reps · ${kgText(x.kg, id)}`;

  // Lo que viene después (se ve durante la serie y el descanso).
  const nextText = useMemo(() => {
    if (!c || !ex) return null;
    if (c.si + 1 < ex.sets.length) return t('ws_set_of', { n: c.si + 2, total: ex.sets.length });
    const nx = s.ex[c.ei + 1];
    return nx ? name(nx.id) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.ei, c?.si, s, lang]);

  // La pestaña del navegador también cuenta (útil con el móvil bloqueado y vuelta).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.title;
    document.title = s.finished ? `FitTrack · ${t('checkin_title')}` : left ? `${clock(left)} · ${t('rest_title')}` : `${clock(elapsed)} · FitTrack`;
    return () => {
      document.title = prev;
    };
  }, [left, Math.floor(elapsed), s.finished, t]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = doneSets(s);
  const total = totalSets(s);
  const close = () => (done ? setConfirm(true) : onExit());

  // ---------- Resumen ----------
  if (s.finished) {
    return (
      <View style={styles.wrap}>
        <Text style={[styles.h1, { color: p.text }]} accessibilityRole="header">{t('checkin_title')}</Text>
        <View style={styles.stats}>
          <Stat value={String(Math.max(1, Math.round(elapsed / 60)))} label="min" />
          <Stat value={String(done)} label={t('workout_sets_done')} />
        </View>
        <View style={[styles.card, { borderColor: p.border, backgroundColor: p.card }]}>
          {s.ex.map((x, i) => {
            const hechas = x.sets.filter((y) => y.done_at);
            return (
              <View key={x.id} style={[styles.sumRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: p.border }]}>
                <Text style={[styles.sumName, { color: hechas.length ? p.text : p.dim }]} numberOfLines={2}>{name(x.id)}</Text>
                <Text style={[styles.sumSets, { color: p.secondary }]}>
                  {hechas.length ? `${hechas.length} × ${setLine(hechas[hechas.length - 1], x.id, x.bodyweight)}` : '—'}
                </Text>
              </View>
            );
          })}
        </View>
        <Primary label={t('ws_new')} onPress={onNew} />
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
        <Text style={[styles.count, { color: p.secondary }]}>{`${done}/${total}`}</Text>
      </View>
      <View style={[styles.bar, { backgroundColor: p.border }]}>
        <View style={[styles.barFill, { backgroundColor: p.text, width: `${(done / Math.max(1, total)) * 100}%` }]} />
      </View>

      {confirm ? (
        <View style={[styles.card, styles.confirm, { borderColor: p.border, backgroundColor: p.card }]}>
          <Text style={[styles.confirmQ, { color: p.text }]}>{t('ws_end_q')}</Text>
          <View style={styles.row2}>
            <Outline label={t('ws_keep')} onPress={() => setConfirm(false)} />
            <Outline label={t('ws_end')} onPress={() => setS((x) => endNow(x, Date.now()))} />
          </View>
        </View>
      ) : null}

      {left > 0 ? (
        // ---------- Descanso ----------
        <View style={styles.center} accessibilityLiveRegion="polite">
          <Text style={[styles.label, { color: p.secondary }]}>{t('rest_title')}</Text>
          <Text style={[styles.rest, { color: p.text }]}>{clock(left)}</Text>
          <View style={styles.row2}>
            <Outline label="+15 s" a11y={t('rest_add15')} onPress={() => setS((x) => addRest(x, 15, Date.now()))} />
            <Outline label={t('rest_skip')} a11y={t('rest_skip_a11y')} onPress={() => setS((x) => skipRest(x))} />
          </View>
          {nextText ? <Text style={[styles.next, { color: p.secondary }]}>{t('ws_next', { what: nextText })}</Text> : null}
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
            <ExerciseThumb id={ex.id} group={e?.muscle_group || 'core'} size={150} color={p.text} />
          </Pressable>
          <Text style={[styles.exName, { color: p.text }]} accessibilityRole="header" numberOfLines={3}>{name(ex.id)}</Text>
          <Text style={[styles.label, { color: p.secondary, marginTop: 8 }]}>
            {ex.cardio ? t('group_cardio') : t('ws_set_of', { n: c.si + 1, total: ex.sets.length })}
          </Text>
          <View style={styles.steppers}>
            {ex.cardio ? (
              <Stepper value={`${set.min}`} unit="min" onMinus={() => setS((x) => adjust(x, 'min', -5))} onPlus={() => setS((x) => adjust(x, 'min', 5))} />
            ) : (
              <>
                <Stepper value={`${set.reps}`} unit="reps" onMinus={() => setS((x) => adjust(x, 'reps', -1))} onPlus={() => setS((x) => adjust(x, 'reps', 1))} />
                {!ex.bodyweight ? (
                  <Stepper
                    value={`${set.kg}`}
                    unit={e?.equipment === 'dumbbell' ? t('web_kg_hand', { kg: '' }).trim() : 'kg'}
                    onMinus={() => setS((x) => adjust(x, 'kg', -2.5))}
                    onPlus={() => setS((x) => adjust(x, 'kg', 2.5))}
                  />
                ) : null}
              </>
            )}
          </View>
          <Primary label={ex.cardio ? t('ws_done') : t('ws_set_done')} onPress={() => setS((x) => completeSet(x, Date.now()))} />
          {nextText ? <Text style={[styles.next, { color: p.secondary }]}>{t('ws_next', { what: nextText })}</Text> : null}
        </View>
      ) : null}
      {howto && byId.get(howto) ? <ExerciseHowTo exercise={byId.get(howto)!} onClose={() => setHowto(null)} /> : null}
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
  count: { minWidth: 44, textAlign: 'right', fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bar: { height: 2, borderRadius: 1, marginTop: 12, overflow: 'hidden' },
  barFill: { height: 2 },
  center: { alignItems: 'center', paddingTop: 28 },
  art: { width: 180, height: 180, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginTop: 20, lineHeight: 34 },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  steppers: { marginTop: 24, gap: 12, width: '100%' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  signH: { position: 'absolute', width: 18, height: 2, borderRadius: 1 },
  signV: { position: 'absolute', width: 2, height: 18, borderRadius: 1 },
  stepVal: { minWidth: 120, alignItems: 'center' },
  stepNum: { fontSize: 40, fontWeight: '800', fontVariant: ['tabular-nums'], lineHeight: 46 },
  stepUnit: { fontSize: 14, marginTop: 2 },
  primary: { marginTop: 32, minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
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
  sumRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  sumName: { flex: 1, fontSize: 16, fontWeight: '700' },
  sumSets: { fontSize: 14, fontVariant: ['tabular-nums'] },
});
