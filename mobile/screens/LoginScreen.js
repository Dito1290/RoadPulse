import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { Button, StatusDot } from '../components/ui';
import { SigerCrown, TapisLine } from '../components/lampung';
import { EyeIcon, GearIcon, LockIcon, UserIcon } from '../components/icons';
import { loginRequest, registerRequest } from '../services/api';
import HeroBackdrop from '../components/HeroBackdrop';

const USERNAME_RE = /^[A-Za-z0-9_.]+$/;

const COPY = {
  login: { title: 'Tabik Pun! 👋', sub: 'Masuk untuk mulai memantau kondisi jalan Lampung.', cta: 'Masuk', busy: 'Memeriksa akun…' },
  register: { title: 'Buat akun baru', sub: 'Gratis untuk petugas & warga yang ingin melaporkan jalan rusak.', cta: 'Daftar & masuk', busy: 'Membuat akun…' },
};

const makeStyles = (t) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A1E1A' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, paddingHorizontal: t.spacing.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, flex: 1 },
  brandMark: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#101827', borderWidth: 1, borderColor: 'rgba(212, 165, 55, 0.45)', alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.6, color: t.colors.heroText },
  brandSub: { fontSize: 10, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase', color: t.colors.heroTextSecondary },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 34, paddingHorizontal: 11, borderRadius: t.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { ...t.type.caption, color: t.colors.heroText, fontWeight: '700' },
  gearBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroCopy: { paddingHorizontal: t.spacing.xl, paddingTop: 44, paddingBottom: 28 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2.6, color: '#A8C0C8', marginBottom: 14 },
  h1: { fontSize: 46, lineHeight: 46, fontWeight: '900', letterSpacing: -2.6, color: '#EDF3F7' },
  heroWord: { color: '#9FD8C6' },
  heroDot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(170,187,198,0.6)', marginLeft: 10, marginBottom: 6,
    borderWidth: 6, borderColor: 'rgba(170,187,198,0.15)',
  },
  tag: {
    alignSelf: 'flex-start', marginTop: 20, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: t.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  tagText: { fontSize: 13, fontWeight: '500', color: '#FFFFFF' },
  lead: { fontSize: 15, lineHeight: 24, color: 'rgba(226,234,244,0.8)' },
  card: {
    marginHorizontal: t.spacing.lg, padding: t.spacing.xxl, borderRadius: t.radius.xxl,
    backgroundColor: t.colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8,
  },
  tabs: { flexDirection: 'row', backgroundColor: t.colors.elevated, borderRadius: t.radius.lg, padding: 4, marginBottom: t.spacing.xl },
  tab: { flex: 1, minHeight: 42, borderRadius: t.radius.md, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: t.colors.accent },
  tabText: { ...t.type.bodyStrong, fontSize: 14, color: t.colors.textSecondary },
  tabTextActive: { color: t.colors.onAccent },
  title: { ...t.type.title, fontSize: 26, color: t.colors.text },
  sub: { ...t.type.body, fontSize: 14, color: t.colors.textSecondary, marginTop: t.spacing.xs, marginBottom: t.spacing.xl },
  label: { ...t.type.overline, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, minHeight: 54, paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.lg, backgroundColor: t.colors.elevated, borderWidth: 1.5, borderColor: 'transparent',
  },
  fieldFocus: { borderColor: t.colors.accent, backgroundColor: t.colors.surface },
  fieldError: { borderColor: t.colors.danger },
  fieldWrap: { marginBottom: t.spacing.lg },
  input: { flex: 1, fontSize: 16, color: t.colors.text, paddingVertical: t.spacing.md },
  eye: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: -t.spacing.sm },
  help: { ...t.type.caption, color: t.colors.textSecondary, marginTop: t.spacing.xs + 2, lineHeight: 17 },
  helpError: { color: t.colors.dangerText },
  meter: { flexDirection: 'row', gap: 4, marginTop: t.spacing.sm },
  meterBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: t.colors.elevated },
  error: {
    flexDirection: 'row', gap: t.spacing.sm, alignItems: 'flex-start', padding: t.spacing.md, borderRadius: t.radius.md,
    backgroundColor: t.colors.dangerSoft, marginBottom: t.spacing.lg,
  },
  errorText: { ...t.type.caption, fontSize: 13, color: t.colors.text, flex: 1, lineHeight: 18 },
  footer: { alignItems: 'center', marginTop: t.spacing.xl },
  footerText: { ...t.type.caption, fontSize: 13, color: t.colors.textSecondary, textAlign: 'center' },
  footerLink: { color: t.colors.accentText, fontWeight: '700' },
  tapis: { alignItems: 'center', marginTop: t.spacing.xl },
});

// Perkiraan kekuatan kata sandi di perangkat (server tetap memvalidasi dengan aturan Django).
function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /\D/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  if (/^\d+$/.test(pw) || pw.length < 8) return 1;
  return Math.min(4, Math.max(1, score));
}
const STRENGTH = [null, ['Lemah', 'danger'], ['Cukup', 'warning'], ['Kuat', 'success'], ['Sangat kuat', 'success']];

function Field({ label, icon, focused, error, help, children }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.field, focused && s.fieldFocus, !!error && s.fieldError]}>{icon}{children}</View>
      {error && error.trim() ? <Text style={[s.help, s.helpError]}>{error}</Text> : help && !error ? <Text style={s.help}>{help}</Text> : null}
    </View>
  );
}

export default function LoginScreen({ host, apiConnected, onLoggedIn, onOpenSettings }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const isRegister = mode === 'register';
  const copy = COPY[mode];
  const strength = passwordStrength(password);
  const server = apiConnected ? { color: c.success, text: 'Server online' }
    : apiConnected === false ? { color: c.danger, text: 'Server offline' } : { color: c.warning, text: 'Memeriksa server…' };

  const switchMode = (next) => {
    if (loading || next === mode) return;
    setMode(next);
    setError('');
    setFieldErrors({});
    setConfirm('');
  };

  const clearErrors = (key) => {
    if (error) setError('');
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Validasi cepat di perangkat agar pengguna tidak menunggu respons server
  const validateLocal = (user) => {
    const errs = {};
    if (!user) errs.username = 'Username wajib diisi.';
    if (!password) errs.password = 'Kata sandi wajib diisi.';
    if (isRegister) {
      if (user && (user.length < 3 || user.length > 30)) errs.username = 'Username 3–30 karakter.';
      else if (user && !USERNAME_RE.test(user)) errs.username = 'Hanya huruf, angka, titik, dan garis bawah.';
      if (password && password.length < 8) errs.password = 'Minimal 8 karakter.';
      if (!confirm) errs.password_confirm = 'Ulangi kata sandi.';
      else if (password !== confirm) errs.password_confirm = 'Kata sandi tidak sama.';
    }
    return errs;
  };

  const submit = async () => {
    if (loading) return;
    const user = username.trim();
    const errs = validateLocal(user);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const data = isRegister
        ? await registerRequest(host, user, password, confirm)
        : await loginRequest(host, user, password);
      onLoggedIn({ token: data.token, username: data.username || user });
    } catch (err) {
      const fields = err?.fields || {};
      const mapped = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]));
      if (!isRegister && /salah/i.test(err?.message || '')) mapped.password = ' ';
      setFieldErrors(mapped);
      setError(Object.keys(fields).length ? '' : err?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const fieldErr = (k) => fieldErrors[k] || '';
  const strengthMeta = STRENGTH[strength];

  return (
    <View style={s.screen}>
      <StatusBar style="light" />
      <HeroBackdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} bounces={false}>
          {/* Bar atas: merek + status server */}
          <View style={[s.topBar, { paddingTop: insets.top + 10 }]}>
            <View style={s.brand}>
              <View style={s.brandMark}><SigerCrown width={26} color={theme.colors.heritage} /></View>
              <View>
                <Text style={s.brandName}>RoadPulse</Text>
                <Text style={s.brandSub}>Bandar Lampung</Text>
              </View>
            </View>
            <Pressable style={s.chip} onPress={onOpenSettings} accessibilityRole="button" accessibilityLabel={`${server.text}, atur alamat server`}>
              <StatusDot color={server.color} />
              <Text style={s.chipText}>{apiConnected ? 'Online' : apiConnected === false ? 'Offline' : 'Memeriksa'}</Text>
            </Pressable>
            <Pressable style={s.gearBtn} onPress={onOpenSettings} accessibilityRole="button" accessibilityLabel="Pengaturan" hitSlop={6}>
              <GearIcon color={c.heroText} size={17} />
            </Pressable>
          </View>

          {/* Teks hero, mengikuti hero dashboard web */}
          <View style={s.heroCopy}>
            <Text style={s.eyebrow}>KOTA BANDAR LAMPUNG</Text>
            <Text style={s.h1} accessibilityRole="header">Kondisi</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[s.h1, s.heroWord]}>jalan rusak</Text>
              <View style={s.heroDot} />
            </View>
            <Text style={s.h1}>di Bandar{'\n'}Lampung.</Text>
            <View style={s.tag}><Text style={s.tagText}>Lampung • Smart Road Monitoring</Text></View>
            <Text style={s.lead}>Deteksi retakan, lubang, dan erosi permukaan jalan secara otomatis dari foto lapangan.</Text>
          </View>

          {/* Kartu masuk / daftar */}
          <View style={s.card}>
            <View style={s.tabs} accessibilityRole="tablist">
              {[['login', 'Masuk'], ['register', 'Daftar']].map(([key, label]) => {
                const on = mode === key;
                return (
                  <Pressable
                    key={key}
                    style={[s.tab, on && s.tabActive]}
                    onPress={() => switchMode(key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[s.tabText, on && s.tabTextActive]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.title} accessibilityRole="header">{copy.title}</Text>
            <Text style={s.sub}>{copy.sub}</Text>

            <Field
              label="Username"
              focused={focus === 'user'}
              error={fieldErr('username')}
              help={isRegister ? '3–30 karakter: huruf, angka, titik, atau garis bawah.' : ''}
              icon={<UserIcon color={focus === 'user' ? c.accentText : c.textSecondary} />}
            >
              <TextInput
                style={s.input}
                value={username}
                onChangeText={(v) => { setUsername(v); clearErrors('username'); }}
                placeholder={isRegister ? 'Contoh: petugas_kedaton' : 'Masukkan username'}
                placeholderTextColor={c.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={isRegister ? 'username-new' : 'username'}
                textContentType="username"
                maxLength={30}
                returnKeyType="next"
                keyboardAppearance={theme.dark ? 'dark' : 'light'}
                onFocus={() => setFocus('user')}
                onBlur={() => setFocus(null)}
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
                accessibilityLabel="Username"
              />
            </Field>

            <Field
              label="Kata sandi"
              focused={focus === 'pass'}
              error={fieldErr('password')}
              icon={<LockIcon color={focus === 'pass' ? c.accentText : c.textSecondary} />}
            >
              <TextInput
                ref={passwordRef}
                style={s.input}
                value={password}
                onChangeText={(v) => { setPassword(v); clearErrors('password'); }}
                placeholder={isRegister ? 'Minimal 8 karakter' : 'Masukkan kata sandi'}
                placeholderTextColor={c.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={isRegister ? 'password-new' : 'password'}
                textContentType={isRegister ? 'newPassword' : 'password'}
                returnKeyType={isRegister ? 'next' : 'go'}
                keyboardAppearance={theme.dark ? 'dark' : 'light'}
                onFocus={() => setFocus('pass')}
                onBlur={() => setFocus(null)}
                onSubmitEditing={() => (isRegister ? confirmRef.current?.focus() : submit())}
                editable={!loading}
                accessibilityLabel="Kata sandi"
              />
              <Pressable
                style={s.eye}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                hitSlop={6}
              >
                <EyeIcon color={c.textSecondary} off={showPassword} />
              </Pressable>
            </Field>

            {isRegister && password ? (
              <View style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.lg }}>
                <View style={s.meter}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={[s.meterBar, i <= strength && { backgroundColor: c[strengthMeta[1]] }]} />
                  ))}
                </View>
                <Text style={s.help}>
                  Kekuatan: <Text style={{ color: c[`${strengthMeta[1]}Text`], fontWeight: '700' }}>{strengthMeta[0]}</Text>
                  {strength < 3 ? ' · gabungkan huruf besar, kecil, dan angka' : ''}
                </Text>
              </View>
            ) : null}

            {isRegister ? (
              <Field
                label="Ulangi kata sandi"
                focused={focus === 'confirm'}
                error={fieldErr('password_confirm')}
                help={confirm && confirm === password ? '✓ Kata sandi cocok' : ''}
                icon={<LockIcon color={focus === 'confirm' ? c.accentText : c.textSecondary} />}
              >
                <TextInput
                  ref={confirmRef}
                  style={s.input}
                  value={confirm}
                  onChangeText={(v) => { setConfirm(v); clearErrors('password_confirm'); }}
                  placeholder="Ketik ulang kata sandi"
                  placeholderTextColor={c.textSecondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  returnKeyType="go"
                  keyboardAppearance={theme.dark ? 'dark' : 'light'}
                  onFocus={() => setFocus('confirm')}
                  onBlur={() => setFocus(null)}
                  onSubmitEditing={submit}
                  editable={!loading}
                  accessibilityLabel="Ulangi kata sandi"
                />
              </Field>
            ) : null}

            {error ? (
              <View style={s.error} accessibilityLiveRegion="polite">
                <View style={{ marginTop: 5 }}><StatusDot color={c.danger} /></View>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button title={loading ? copy.busy : copy.cta} onPress={submit} loading={loading} style={{ minHeight: 56 }} />

            <View style={s.footer}>
              <Text style={s.footerText}>
                {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                <Text style={s.footerLink} onPress={() => switchMode(isRegister ? 'login' : 'register')} accessibilityRole="link">
                  {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
                </Text>
              </Text>
            </View>
          </View>

          <View style={s.tapis}><TapisLine color="#D4A537" count={22} opacity={0.45} /></View>
          <Text style={[s.footerText, { marginTop: theme.spacing.md, fontSize: 11, color: 'rgba(255,255,255,0.65)' }]}>Footage: Marc Espejo / Pexels · Foto Menara Siger: Sakurai Midori, CC BY 2.5</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

