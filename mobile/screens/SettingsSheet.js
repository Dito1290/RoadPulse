import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { Button, Overline, Segmented, StatusDot } from '../components/ui';
import { TapisLine } from '../components/lampung';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
];

const makeStyles = (t) => StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: t.colors.scrim },
  sheet: {
    backgroundColor: t.colors.surface, borderTopLeftRadius: t.radius.xxl, borderTopRightRadius: t.radius.xxl, maxHeight: '90%',
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: t.colors.border, marginTop: 10, marginBottom: t.spacing.lg },
  body: { paddingHorizontal: t.spacing.xl },
  title: { ...t.type.title, color: t.colors.text },
  section: { marginTop: t.spacing.xxl },
  sectionTitle: { ...t.type.heading, color: t.colors.text, marginTop: t.spacing.xs, marginBottom: t.spacing.xs },
  desc: { ...t.type.caption, color: t.colors.textSecondary, lineHeight: 18, marginBottom: t.spacing.md },
  status: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, marginBottom: t.spacing.md },
  statusText: { ...t.type.label, color: t.colors.text, flexShrink: 1 },
  input: {
    minHeight: 52, borderRadius: t.radius.md, backgroundColor: t.colors.elevated, borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.border, paddingHorizontal: t.spacing.lg, color: t.colors.text, fontSize: 16, marginBottom: t.spacing.md,
  },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: t.spacing.sm },
  aboutLabel: { ...t.type.caption, color: t.colors.textSecondary },
  aboutValue: { ...t.type.caption, color: t.colors.text, flexShrink: 1, textAlign: 'right', marginLeft: t.spacing.md },
  account: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginTop: t.spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...t.type.heading, color: t.colors.accentText },
  credit: { ...t.type.caption, color: t.colors.textSecondary, lineHeight: 18, marginTop: t.spacing.sm },
});

export default function SettingsSheet({ visible, onClose, host, apiConnected, draftHost, onChangeDraftHost, onSaveHost, username, onLogout }) {
  const s = useStyles(makeStyles);
  const { theme, preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const api = apiConnected ? { color: c.success, text: `Terhubung ke ${host}` }
    : apiConnected === false ? { color: c.danger, text: `Tidak terhubung ke ${host}` } : { color: c.warning, text: `Memeriksa ${host}…` };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup pengaturan" />
        <View style={s.sheet}>
          <View style={s.handle} />
          <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 20 }]} keyboardShouldPersistTaps="handled">
            <Text style={s.title} accessibilityRole="header">Pengaturan</Text>

            {username ? (
              <View style={s.section}>
                <Overline>Akun</Overline>
                <View style={s.account}>
                  <View style={s.avatar}><Text style={s.avatarText}>{username.slice(0, 1).toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sectionTitle} numberOfLines={1}>{username}</Text>
                    <Text style={[s.desc, { marginBottom: 0 }]}>Masuk dengan token RoadPulse</Text>
                  </View>
                </View>
                <Button title="Keluar" variant="secondary" onPress={onLogout} style={{ marginTop: theme.spacing.md }} textColor={c.dangerText} />
              </View>
            ) : null}

            <View style={s.section}>
              <Overline>Tampilan</Overline>
              <Text style={s.sectionTitle}>Tema aplikasi</Text>
              <Text style={s.desc}>"Sistem" mengikuti mode terang/gelap perangkat. Pilihan disimpan di perangkat ini.</Text>
              <Segmented options={THEME_OPTIONS} value={preference} onChange={setPreference} />
            </View>

            <View style={s.section}>
              <Overline>Koneksi</Overline>
              <Text style={s.sectionTitle}>Server backend</Text>
              <Text style={s.desc}>
                Isi dengan IP LAN komputer yang menjalankan proxy RoadPulse (port 8000). Di HP fisik jangan pakai localhost; HP dan komputer harus
                satu jaringan Wi-Fi.
              </Text>
              <View style={s.status}><StatusDot color={api.color} /><Text style={s.statusText} numberOfLines={2}>{api.text}</Text></View>
              <TextInput
                style={s.input}
                value={draftHost}
                onChangeText={onChangeDraftHost}
                placeholder="http://192.168.1.10:8000"
                placeholderTextColor={c.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                keyboardAppearance={theme.dark ? 'dark' : 'light'}
                returnKeyType="done"
                onSubmitEditing={onSaveHost}
                accessibilityLabel="Alamat server"
              />
              <Button title="Simpan & hubungkan" onPress={onSaveHost} />
            </View>

            <View style={s.section}>
              <Overline>Tentang</Overline>
              <View style={s.aboutRow}><Text style={s.aboutLabel}>Aplikasi</Text><Text style={s.aboutValue}>RoadPulse · Smart Mobility Intelligence</Text></View>
              <View style={s.aboutRow}><Text style={s.aboutLabel}>Versi</Text><Text style={s.aboutValue}>{Constants.expoConfig?.version || '-'}</Text></View>
              <View style={s.aboutRow}><Text style={s.aboutLabel}>Wilayah</Text><Text style={s.aboutValue}>Lampung, Indonesia</Text></View>
              <Text style={s.credit}>
                Foto Menara Siger, Bakauheni, Lampung Selatan: Sakurai Midori, Wikimedia Commons, CC BY 2.5 (dipotong). Ornamen Siger & motif Tapis
                digambar ulang untuk aplikasi ini.
              </Text>
              <View style={{ marginTop: theme.spacing.lg, alignItems: 'center' }}><TapisLine color={c.heritage} count={18} opacity={0.4} /></View>
            </View>

            <Button title="Tutup" variant="ghost" onPress={onClose} style={{ marginTop: theme.spacing.md }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
