import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { StatusDot } from '../components/ui';
import { CloseIcon } from '../components/icons';

// Tinggi bar atas & minimum area tombol rana
const TOP_BAR = 64;
const BOTTOM_MIN = 160;

const makeStyles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.colors.camera },
  topBar: { height: TOP_BAR, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.spacing.xl },
  closeBtn: { width: t.touch.min, height: t.touch.min, borderRadius: t.radius.pill, backgroundColor: t.colors.cameraChip, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 7, height: 36, paddingHorizontal: 14, borderRadius: t.radius.pill, backgroundColor: t.colors.cameraChip },
  pillText: { ...t.type.label, color: t.colors.heroText },
  preview: { alignSelf: 'center', borderRadius: t.radius.xl, overflow: 'hidden', backgroundColor: t.colors.black, alignItems: 'center', justifyContent: 'center' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.black },
  frame: { width: '80%', aspectRatio: 1 },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: t.colors.accent },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },
  bottom: { flex: 1, minHeight: BOTTOM_MIN, alignItems: 'center', justifyContent: 'center', gap: 18 },
  hint: { ...t.type.body, fontSize: 14, color: t.colors.heroTextSecondary, textAlign: 'center', paddingHorizontal: t.spacing.xxxl },
  shutter: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: t.colors.white },
});

export default function CaptureScreen({ cameraRef, cameraReady, onCameraReady, loading, hasGps, onClose, onShutter }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();

  // Preview 3:4 (potret) = rasio foto yang tersimpan, jadi yang terlihat sama dengan hasil foto.
  const maxPreviewH = screen.height - insets.top - insets.bottom - TOP_BAR - BOTTOM_MIN;
  const previewH = Math.max(200, Math.min((screen.width * 4) / 3, maxPreviewH));
  const previewW = (previewH * 3) / 4;
  const disabled = !cameraReady || loading;

  return (
    <View style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />
      <View style={s.topBar}>
        <Pressable style={s.closeBtn} onPress={onClose} disabled={loading} accessibilityRole="button" accessibilityLabel="Tutup kamera" hitSlop={8}>
          <CloseIcon color={theme.colors.heroText} />
        </Pressable>
        <View style={s.pill}>
          <StatusDot color={hasGps ? theme.colors.success : theme.colors.warning} />
          <Text style={s.pillText}>{hasGps ? 'GPS terkunci' : 'Mencari GPS'}</Text>
        </View>
      </View>

      <View style={[s.preview, { width: previewW, height: previewH }]}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          ratio="4:3"
          ref={cameraRef}
          onCameraReady={onCameraReady}
          onMountError={(e) => Alert.alert('Kamera tidak tersedia', e?.message || 'Gagal membuka kamera.')}
        />
        <View style={s.frame} pointerEvents="none">
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </View>
        {!cameraReady ? (
          <View style={s.loading} pointerEvents="none"><ActivityIndicator color={theme.colors.accent} /></View>
        ) : null}
      </View>

      <View style={s.bottom}>
        <Text style={s.hint}>Arahkan ke permukaan jalan, pastikan cukup cahaya</Text>
        <Pressable
          style={({ pressed }) => [s.shutter, disabled && { opacity: 0.5 }, pressed && { transform: [{ scale: 0.94 }] }]}
          onPress={onShutter}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Ambil foto"
          accessibilityState={{ disabled }}
        >
          {loading ? <ActivityIndicator color={theme.colors.accent} /> : <View style={s.shutterInner} />}
        </Pressable>
      </View>
    </View>
  );
}
