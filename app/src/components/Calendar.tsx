/** Calendario de actividad (pestaña Resumen): meses completos con cada día
 *  verde (entrenaste) o rojo suave (no entrenaste), anillo en el día de hoy y
 *  navegación mes a mes. Celdas grandes y tapables, auto-adaptadas al ancho. */
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';

const MONTH_NAMES: Record<string, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
};
const WEEKDAYS: Record<string, string[]> = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
  fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
  nl: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
};

export interface DayStat {
  sets: number;
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
}

function key(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function MonthCalendar({
  lang,
  month,
  year,
  onPrev,
  onNext,
  onToday,
  today,
  days,
  todayLabel,
}: MonthCalendarProps) {
  const { p } = useTheme();
  const scale = useScale();
  const months = MONTH_NAMES[lang] ?? MONTH_NAMES.en;
  const week = WEEKDAYS[lang] ?? WEEKDAYS.en;

  // Celdas auto-medidas: el ancho del calendario depende del ancho real de la
  // tarjeta (márgenes del cuerpo + padding), así que se mide en onLayout y el
  // lado de cada celda se calcula (7 columnas, gap 4) — siempre cabe, en
  // cualquier ancho de teléfono.
  const [gridW, setGridW] = useState<number>(() => Math.max(240, Dimensions.get('window').width - 52));
  const cell = Math.max(30, Math.floor((gridW - 6 * gap) / 7));

  const cells = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const n = new Date(year, month + 1, 0).getDate();
    const out: ({ day: number } | null)[] = [];
    for (let i = 0; i < firstDow; i++) out.push(null);
    for (let d = 1; d <= n; d++) out.push({ day: d });
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

  const isThisMonth = today.y === year && today.m === month;

  return (
    <View>
      {/* Cabecera: mes + flechas */}
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          onPress={onPrev}
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: p.fieldBg, opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' },
          ]}
        >
          <Text style={[styles.arrow, { fontSize: fs(scale, 24), color: p.secondary }]}>‹</Text>
        </Pressable>
        <View style={styles.monthWrap}>
          <Text style={[styles.month, { fontSize: fs(scale, 20), color: p.text }]}>
            {months[month]} {year}
          </Text>
          {isThisMonth ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={todayLabel}
              onPress={onToday}
              style={({ pressed }) => [
                styles.todayPill,
                { borderRadius: RADII.pill, backgroundColor: p.fieldBg, opacity: pressed ? 0.75 : 1, transition: 'opacity 90ms ease' },
              ]}
            >
              <Text style={[styles.todayPillText, { fontSize: fs(scale, 13), color: p.secondary }]}>{todayLabel}</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          onPress={onNext}
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: p.fieldBg, opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' },
          ]}
        >
          <Text style={[styles.arrow, { fontSize: fs(scale, 24), color: p.secondary }]}>›</Text>
        </Pressable>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekRow}>
        {week.map((w) => (
          <View key={w} style={[styles.cell, { width: cell, height: 18 }]}>
            <Text
              style={[
                styles.weekday,
                { fontSize: fs(scale, 12), color: p.dim, textAlign: 'center' },
              ]}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Celdas */}
      <View style={styles.grid} onLayout={(e) => setGridW(e.nativeEvent.layout.width)}>
        {cells.map((c, i) => {
          if (!c) {
            return <View key={`b${i}`} style={[styles.cell, { width: cell, height: cell }]} />;
          }
          const dk = key(year, month, c.day);
          const stat = days[dk];
          const isToday = today.y === year && today.m === month && today.d === c.day;
          const isFuture = isThisMonth && c.day > today.d;
          const bg = stat ? p.green : isFuture ? 'transparent' : 'rgba(196, 60, 42, 0.16)'; // rojo suave: no entrenaste
          const color = stat ? '#ffffff' : isFuture ? p.dim : p.red;
          return (
            <Pressable
              key={dk}
              accessibilityRole="button"
              accessibilityLabel={`${months[month]} ${c.day}${stat ? `, ${stat.sets} series` : ''}`}
              onPress={() => {
                /* tocar el día: hoy nada (sin navegación a sesión todavía) */
              }}
              style={([
                styles.dayCell,
                {
                  width: cell,
                  height: cell,
                  backgroundColor: bg,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? p.accent : 'transparent',
                },
              ] as object)}
            >
              <Text
                style={[
                  styles.dayNum,
                  {
                    fontSize: fs(scale, 15),
                    color,
                    fontWeight: stat || isToday ? '700' : '400',
                  },
                ]}
              >
                {c.day}
              </Text>
              {stat ? (
                <Text
                  style={[
                    styles.daySets,
                    { fontSize: fs(scale, 10), color: 'rgba(255,255,255,0.9)' },
                  ]}
                >
                  {stat.sets}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const gap = 4;
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  month: { fontWeight: '700' },
  arrow: { textAlign: 'center' },
  todayPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  todayPillText: { fontWeight: '600' },
  weekRow: {
    flexDirection: 'row',
    gap,
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap,
  },
  cell: {},
  weekday: { padding: 0 },
  dayCell: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayNum: {},
  daySets: { marginTop: -1 },
});
