/**
 * Web (R-169): tu historial con WhatsApp. Pega la conversación (o el JSON)
 * y se leen los entrenos de FitTrack; se guardan solo en este navegador y
 * sirven para los pesos de la próxima sesión y la racha Extra mile.
 */
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import type { Lang } from '../i18n';
import type { Exercise } from '../data';
import { exName } from '../lib/names';
import { mergeLog, parseLog, saveLog, extraStreak, type LogEntry } from '../lib/webLog';

/** Nombre (cualquier idioma, sin mayúsculas) → id. */
export function nameIndex(exercises: Exercise[]): (name: string) => string | null {
  const m = new Map<string, string>();
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  for (const e of exercises) {
    for (const n of [e.id, e.name_en, e.name_nl, e.name_es, e.name_fr, ...(e.aliases || []), ...(['es', 'en', 'nl', 'fr'] as Lang[]).map((l) => exName(e, l))]) {
      if (n && !m.has(norm(n))) m.set(norm(n), e.id);
    }
  }
  return (name) => m.get(norm(name)) ?? null;
}

export function WebHistory({
  log,
  exercises,
  onChange,
  onClose,
}: {
  log: LogEntry[];
  exercises: Exercise[];
  onChange: (log: LogEntry[]) => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Lang;
  const { p } = useTheme();
  const { width } = useWindowDimensions();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const streak = extraStreak(log.map((x) => !!x.extra));

  const doImport = () => {
    const { entries, unknown } = parseLog(text, nameIndex(exercises));
    const merged = mergeLog(log, entries);
    saveLog(merged);
    onChange(merged);
    setText('');
    setMsg(
      [t('wa_imported', { count: entries.length }), unknown.length ? t('wa_unknown', { names: unknown.slice(0, 5).join(', ') }) : null]
        .filter(Boolean)
        .join(' '),
    );
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.frame, width > 700 && styles.frameWide]}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: p.overlay }]} onPress={onClose} accessibilityLabel={t('howto_close')} />
        <View style={[styles.sheet, { backgroundColor: p.bg, borderColor: p.border }, width > 700 && styles.sheetWide]}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: p.text }]} accessibilityRole="header">{t('wa_history')}</Text>
            <Text style={[styles.sub, { color: p.secondary }]}>{t('wa_how')}</Text>

            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder={t('wa_paste')}
              placeholderTextColor={p.dim}
              accessibilityLabel={t('wa_paste')}
              style={[styles.input, { color: p.text, borderColor: p.border }]}
            />
            <Pressable
              accessibilityRole="button"
              disabled={!text.trim()}
              onPress={doImport}
              style={({ pressed }) => [styles.primary, { backgroundColor: p.accent, opacity: !text.trim() ? 0.4 : pressed ? 0.85 : 1 }]}
            >
              <Text style={[styles.primaryText, { color: p.onAccent }]}>{t('wa_import')}</Text>
            </Pressable>
            {msg ? <Text style={[styles.msg, { color: p.text }]} accessibilityLiveRegion="polite">{msg}</Text> : null}

            <Text style={[styles.section, { color: p.secondary }]}>
              {[t('wa_count', { count: log.length }), streak ? t('xm_done', { count: streak }) : null].filter(Boolean).join(' · ')}
            </Text>
            {log.slice(0, 30).map((e, i) => (
              <View key={i} style={[styles.row, { borderTopColor: p.border }]}>
                <Text style={[styles.rowDate, { color: p.text }]}>{`${e.date}${e.min ? ` · ${e.min} min` : ''}${e.extra ? ' · Extra mile' : ''}`}</Text>
                <Text style={[styles.rowEx, { color: p.secondary }]} numberOfLines={2}>
                  {e.ex.map((x) => { const r = byId.get(x.id); return r ? exName(r, lang) : x.id; }).join(' · ')}
                </Text>
              </View>
            ))}
            <Text style={[styles.note, { color: p.dim }]}>{t('wa_local')}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.close, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.closeText, { color: p.text }]}>{t('howto_close')}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, justifyContent: 'flex-end' },
  frameWide: { justifyContent: 'center', alignItems: 'center' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: StyleSheet.hairlineWidth, maxHeight: '90%' },
  sheetWide: { width: 640, borderRadius: 20 },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  sub: { fontSize: 15, lineHeight: 21, marginTop: 6 },
  input: { marginTop: 16, minHeight: 120, borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 15, textAlignVertical: 'top' },
  primary: { marginTop: 12, minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 17, fontWeight: '800' },
  msg: { fontSize: 15, marginTop: 10, lineHeight: 21 },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 24, marginBottom: 6 },
  row: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  rowDate: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  rowEx: { fontSize: 14, marginTop: 2 },
  note: { fontSize: 13, marginTop: 16, lineHeight: 18 },
  close: { marginTop: 16, minHeight: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: '700' },
});
