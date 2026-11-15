/** Calendario de actividad (Inicio) — estilo X, monocromo y simple:
 *  - Cabecera ligera: mes a la izquierda; "Hoy" (si no es el mes actual) y
 *    flechas a la derecha.
 *  - Semana de lunes a domingo, iniciales en gris.
 *  - Día entrenado: círculo blanco con número negro. Hoy: anillo blanco.
 *    Resto: número gris. Debajo, una leyenda mínima.
 *  Celdas auto-adaptadas al ancho real (onLayout). */
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme-context';
import { Chevron } from './Chevron';

const MONTH_NAMES: Record<string, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  nl: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
};
/** Lunes primero. */
const WEEKDAYS: Record<string, string[]> = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  nl: ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'],
};
const LEGEND: Record<string, string> = { en: 'Workout day', es: 'Día entrenado', fr: "Jour d'entraînement", nl: 'Trainingsdag' };
const LEGEND_PR: Record<string, string> = { en: 'Record', es: 'Récord', fr: 'Record', nl: 'Record' };
/** Verde llamativo para los días de récord (petición del usuario), igual en
 *  todos los temas; texto negro encima (contraste > 10:1). */
export const RECORD_GREEN = '#00E676';

export interface DayStat {
  sets: number;
  /** Ese día se batió una marca personal. */
  pr?: boolean;
}

export interface MonthCalendarProps {
  lang: string;
  month: number; // 0-11
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  today: { y: number; m: number; d: number };
  /** 'yyyy-mm-dd' -> stats del día */
  days: Record<string, DayStat>;
  todayLabel: string; // t('cal_today')
  /** Tocar un día entrenado (futuro: abrir la sesión en InstaGym). */
  onPickDay?: (iso: string) => void;
}

function key(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const GAP = 4;

export function MonthCalendar({ lang, month, year, onPrev, onNext, onToday, today, days, todayLabel, onPickDay }: MonthCalendarProps) {
  const { p } = useTheme();
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES.en;
  const week = WEEKDAYS[lang] ?? WEEKDAYS.en;

  const [gridW, setGridW] = useState<number>(() => Math.max(240, Dimensions.get('window').width - 58));
  const cell = Math.max(30, Math.floor((gridW - 6 * GAP) / 7));
  const dot = Math.min(cell, 40);

  const cells = useMemo(() => {
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
    const n = new Date(year, month + 1, 0).getDate();
    const out: ({ day: number } | null)[] = [];
    for (let i = 0; i < firstDow; i++) out.push(null);
    for (let d = 1; d <= n; d++) out.push({ day: d });
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

  const isThisMonth = today.y === year && today.m === month;
  const trainedThisMonth = cells.filter((c) => c && days[key(year, month, c.day)]).length;
  const prThisMonth = cells.filter((c) => c && days[key(year, month, c.day)]?.pr).length;

  return (
    <View>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={[styles.month, { color: p.text }]} accessibilityRole="header">
          {months[month]} {year}
        </Text>
        <View style={styles.nav}>
          {!isThisMonth ? (
            <Pressable accessibilityRole="button" accessibilityLabel={todayLabel} onPress={onToday} style={styles.todayBtn} hitSlop={8}>
              <Text style={[styles.todayText, { color: p.text }]}>{todayLabel}</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel="‹" onPress={onPrev} style={styles.navBtn} hitSlop={6}>
            <Chevron color={p.text} dir="left" />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="›" onPress={onNext} style={styles.navBtn} hitSlop={6}>
            <Chevron color={p.text} dir="right" />
          </Pressable>
        </View>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekRow}>
        {week.map((w, i) => (
          <Text key={w + i} style={[styles.weekday, { width: cell, color: p.secondary }]}>
            {w}
          </Text>
        ))}
      </View>

      {/* Celdas */}
      <View style={styles.grid} onLayout={(e) => setGridW(e.nativeEvent.layout.width)}>
        {cells.map((c, i) => {
          if (!c) return <View key={`b${i}`} style={{ width: cell, height: dot }} />;
          const dk = key(year, month, c.day);
          const stat = days[dk];
          const isToday = isThisMonth && today.d === c.day;
          const isFuture = isThisMonth && c.day > today.d;
          return (
            <Pressable
              key={dk}
              accessibilityRole="button"
              accessibilityLabel={`${c.day} ${months[month]}${stat ? `, ${LEGEND[lang] ?? LEGEND.en}` : ''}${stat?.pr ? `, ${LEGEND_PR[lang] ?? LEGEND_PR.en}` : ''}`}
              disabled={!stat || !onPickDay}
              onPress={() => onPickDay?.(dk)}
              style={[styles.cell, { width: cell, height: dot }]}
            >
              <View
                style={[
                  styles.dot,
                  {
                    width: dot,
                    height: dot,
                    borderRadius: dot / 2,
                    backgroundColor: stat?.pr ? RECORD_GREEN : stat ? p.accent : 'transparent',
                    borderWidth: isToday && !stat ? 1.5 : 0,
                    borderColor: p.text,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    {
                      color: stat?.pr ? '#000000' : stat ? p.onAccent : isToday ? p.text : isFuture ? p.border : p.secondary,
                      fontWeight: stat || isToday ? '700' : '500',
                    },
                  ]}
                >
                  {c.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Leyenda mínima */}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: p.accent }]} />
        <Text style={[styles.legendText, { color: p.secondary }]}>
          {LEGEND[lang] ?? LEGEND.en} · {trainedThisMonth}
        </Text>
        {prThisMonth ? (
          <>
            <View style={[styles.legendDot, { backgroundColor: RECORD_GREEN, marginLeft: 14 }]} />
            <Text style={[styles.legendText, { color: p.secondary }]}>
              {LEGEND_PR[lang] ?? LEGEND_PR.en} · {prThisMonth}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingLeft: 4,
  },
  month: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  todayBtn: {
    paddingHorizontal: 10,
    minHeight: 36,
    justifyContent: 'center',
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navBtn: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    gap: GAP,
    marginBottom: 6,
  },
  weekday: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    rowGap: 6,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingLeft: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
