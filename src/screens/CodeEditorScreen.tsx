import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HtmlPreview from '../components/HtmlPreview';
import Txt from '../components/Txt';
import { IconButton } from '../components/ui';
import { useApp, useStyles } from '../context/AppContext';
import {
  cursorPosition,
  EDITOR_LANGS,
  EditorLang,
  FONT_MAX,
  FONT_MIN,
  langInfo,
  lineCount,
  longestLine,
} from '../data/editor';
import { RootScreenProps } from '../navigation/types';
import { useRunner } from '../runner/useRunner';
import { F } from '../theme/fonts';
import { Colors } from '../theme/palette';

const DRAFT_KEY = 'devly:editor:v1';
const GUTTER = 44;

type Output = { ok: boolean; text: string };

export default function CodeEditorScreen({ navigation, route }: RootScreenProps<'CodeEditor'>) {
  const { colors: c } = useApp();
  const s = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const runner = useRunner();

  const [lang, setLang] = useState<EditorLang>(route.params?.lang ?? 'python');
  const [code, setCode] = useState(route.params?.code ?? langInfo(route.params?.lang ?? 'python').starter);
  const [size, setSize] = useState(15);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [menu, setMenu] = useState(false);
  const [panel, setPanel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [copied, setCopied] = useState(false);

  const drafts = useRef<Partial<Record<EditorLang, string>>>({});
  const fromLesson = useRef(!!route.params?.code);
  const info = langInfo(lang);

  // Remember what was typed per language between visits (not when opened from a lesson example).
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY)
      .then((raw) => {
        if (!raw) return;
        drafts.current = JSON.parse(raw);
        if (!fromLesson.current && drafts.current[lang]) setCode(drafts.current[lang] as string);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDraft = useCallback((l: EditorLang, text: string) => {
    drafts.current[l] = text;
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(drafts.current)).catch(() => {});
  }, []);

  const onChange = (text: string) => {
    setCode(text);
    saveDraft(lang, text);
  };

  const pickLang = (next: EditorLang) => {
    setMenu(false);
    if (next === lang) return;
    saveDraft(lang, code);
    setLang(next);
    setCode(drafts.current[next] ?? langInfo(next).starter);
    setOutput(null);
    setPanel(false);
    setCursor({ line: 1, col: 1 });
  };

  const run = async () => {
    Keyboard.dismiss();
    if (busy) return;
    setPanel(true);
    if (lang === 'html') {
      setPreviewHtml(code);
      setOutput(null);
      return;
    }
    setBusy(true);
    setOutput(null);
    const res = await runner.run(lang, code);
    const text = [res.output, res.error ? (res.output ? '\n' : '') + res.error : ''].join('').trim();
    setOutput({ ok: res.ok, text: text || (res.ok ? 'Done. Nothing was printed.' : 'Something went wrong.') });
    setBusy(false);
  };

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const onSelection = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
    setCursor(cursorPosition(code, e.nativeEvent.selection.start));

  const lines = lineCount(code);
  const lineHeight = Math.round(size * 1.55);
  // No wrapping: make the input as wide as the longest line so line numbers always match.
  const inputWidth = Math.max(width - GUTTER - 16, (longestLine(code) + 3) * size * 0.62);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Top bar */}
      <View style={s.topBar}>
        <IconButton icon="chevron-back" label="Back" onPress={() => navigation.goBack()} bordered={false} bg="transparent" />
        <Txt v="h3" style={{ flex: 1 }} numberOfLines={1}>
          Code Editor
        </Txt>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Run ${info.label} code`}
          onPress={run}
          disabled={busy}
          style={({ pressed }) => [s.runBtn, { opacity: busy ? 0.6 : pressed ? 0.85 : 1 }]}
        >
          {busy ? <ActivityIndicator size="small" color={c.onPrimary} /> : <Ionicons name="play" size={18} color={c.onPrimary} />}
          <Txt v="bodyBold" color={c.onPrimary} style={{ fontSize: 15 }}>
            {busy ? 'Running' : 'Run'}
          </Txt>
        </Pressable>
        <IconButton icon={copied ? 'checkmark' : 'copy-outline'} label="Copy code" onPress={copy} bordered={false} bg="transparent" />
        <IconButton
          icon={panel ? 'eye-outline' : 'eye-off-outline'}
          label={panel ? 'Hide output' : 'Show output'}
          onPress={() => setPanel((p) => !p)}
          bordered={false}
          bg="transparent"
        />
        <IconButton icon="keypad-outline" label="Hide keyboard" onPress={() => Keyboard.dismiss()} bordered={false} bg="transparent" />
      </View>

      {/* Language and font size */}
      <View style={s.toolBar}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Language: ${info.label}. Change`} onPress={() => setMenu(true)} style={s.langBtn}>
          <Txt v="bodyBold" style={{ fontSize: 14 }}>
            Lang:
          </Txt>
          <Txt v="body" style={{ fontSize: 15 }}>
            {info.label}
          </Txt>
          <Ionicons name="caret-down" size={14} color={c.muted} />
        </Pressable>
        <View style={s.sizeBox}>
          <Pressable accessibilityRole="button" accessibilityLabel="Smaller text" onPress={() => setSize((n) => Math.max(FONT_MIN, n - 1))} style={s.sizeBtn}>
            <Ionicons name="remove" size={18} color={c.text} />
          </Pressable>
          <Txt v="small" color={c.text} style={{ minWidth: 24, textAlign: 'center' }}>
            {size}
          </Txt>
          <Pressable accessibilityRole="button" accessibilityLabel="Larger text" onPress={() => setSize((n) => Math.min(FONT_MAX, n + 1))} style={s.sizeBtn}>
            <Ionicons name="add" size={18} color={c.text} />
          </Pressable>
        </View>
      </View>
      {info.note ? (
        <Txt v="caption" style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
          {info.note}
        </Txt>
      ) : null}

      {/* Editor */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexDirection: 'row', paddingVertical: 8 }} keyboardShouldPersistTaps="handled">
        <View style={[s.gutter, { width: GUTTER }]}>
          {Array.from({ length: lines }, (_, i) => (
            <Txt key={i} v="caption" style={{ height: lineHeight, lineHeight, fontFamily: F.mono, fontSize: size - 2, textAlign: 'right' }}>
              {i + 1}
            </Txt>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
          <TextInput
            value={code}
            onChangeText={onChange}
            onSelectionChange={onSelection}
            multiline
            scrollEnabled={false}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            accessibilityLabel={`${info.label} code editor`}
            style={[s.input, { width: inputWidth, fontSize: size, lineHeight }]}
          />
        </ScrollView>
      </ScrollView>

      {/* Output / preview */}
      {panel ? (
        <View style={s.panel}>
          <View style={s.panelHead}>
            <Ionicons name={lang === 'html' ? 'globe-outline' : 'terminal-outline'} size={20} color={c.text} />
            <Txt v="bodyBold" style={{ flex: 1 }}>
              {lang === 'html' ? 'Preview' : 'Output'}
            </Txt>
            <IconButton icon="close" label="Close output" onPress={() => setPanel(false)} bordered={false} bg="transparent" size={40} />
          </View>
          {lang === 'html' ? (
            <View style={{ flex: 1 }}>
              <HtmlPreview html={previewHtml} />
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
              {busy ? (
                <Txt v="small">Running your code… the first Python or SQL run may take a little while.</Txt>
              ) : output ? (
                <Txt selectable v="small" color={output.ok ? c.successText : c.dangerText} style={{ fontFamily: F.mono, fontSize: size - 1, lineHeight: lineHeight }}>
                  {output.text}
                </Txt>
              ) : (
                <Txt v="small">Press Run to see the output.</Txt>
              )}
            </ScrollView>
          )}
        </View>
      ) : null}

      {/* Status bar */}
      <View style={s.status}>
        <Txt v="caption">
          L: {cursor.line}   C: {cursor.col}
        </Txt>
        <View style={s.langChip}>
          <Txt v="caption" color={c.primaryText} style={{ fontFamily: F.heavy }}>
            {info.label.toUpperCase()}
          </Txt>
        </View>
      </View>

      {/* Language menu */}
      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={s.backdrop} onPress={() => setMenu(false)} accessibilityLabel="Close language list">
          <View style={s.menu}>
            {EDITOR_LANGS.map((l) => {
              const on = l.id === lang;
              return (
                <Pressable
                  key={l.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => pickLang(l.id)}
                  style={({ pressed }) => [s.menuItem, (on || pressed) && { backgroundColor: c.surface2 }]}
                >
                  <Txt v={on ? 'bodyBold' : 'body'} style={{ fontSize: 15 }}>
                    {l.label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* Hidden engine (phone only) */}
      {runner.view}
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 8, backgroundColor: c.primarySoft },
    runBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 16, borderRadius: 14, backgroundColor: c.success },
    toolBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 8, backgroundColor: c.surface2 },
    langBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.surface },
    sizeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.track, borderRadius: 12, paddingHorizontal: 4 },
    sizeBtn: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
    gutter: { paddingRight: 8 },
    input: {
      fontFamily: F.mono,
      color: c.text,
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 10,
      paddingVertical: 0,
      textAlignVertical: 'top',
      minHeight: 120,
      ...({ outlineStyle: 'none' } as object),
    },
    panel: { height: '42%', borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.bg },
    panelHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 8, minHeight: 52, borderBottomWidth: 1, borderBottomColor: c.border },
    status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, minHeight: 36, backgroundColor: c.surface2 },
    langChip: { backgroundColor: c.primarySoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
    menu: { width: 260, backgroundColor: c.surface, borderRadius: 18, paddingVertical: 8, borderWidth: 1, borderColor: c.border },
    menuItem: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 20 },
  });
