import React from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { classMeta } from '../theme/tokens';
import { Button, Card, DetailRow, Overline, ProgressBar, Skeleton } from '../components/ui';
import { LOW_CONFIDENCE_PCT } from '../components/inspection';
import { CameraIcon, PinIcon } from '../components/icons';
import { formatDate, osmUrl } from '../services/api';

const makeStyles = (t) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.colors.bg },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: t.spacing.lg },
  barBtn: { minWidth: 64, minHeight: t.touch.min, justifyContent: 'center' },
  barBtnText: { ...t.type.bodyStrong, color: t.colors.accentText },
  barTitle: { ...t.type.heading, color: t.colors.text },
  scroll: { paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.sm, paddingBottom: t.spacing.xxl, gap: t.spacing.md },
  imageWrap: { width: '100%', aspectRatio: 4 / 3, borderRadius: t.radius.xl, overflow: 'hidden', backgroundColor: t.colors.elevated },
  image: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: t.colors.scrim, alignItems: 'center', justifyContent: 'center', gap: 10 },
  imageOverlayText: { ...t.type.label, color: t.colors.heroText },
  resultCard: { borderLeftWidth: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: t.spacing.sm, marginTop: t.spacing.xs },
  className: { ...t.type.display },
  chip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: t.radius.sm },
  chipText: { ...t.type.caption, fontWeight: '700' },
  confRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.lg, marginBottom: t.spacing.sm },
  confLabel: { ...t.type.label, color: t.colors.textSecondary },
  confValue: { ...t.type.label, color: t.colors.text, fontVariant: ['tabular-nums'] },
  low: { marginTop: t.spacing.lg, padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: t.colors.warningSoft },
  lowTitle: { ...t.type.label, color: t.colors.warningText, marginBottom: t.spacing.xs },
  lowText: { ...t.type.caption, color: t.colors.text, lineHeight: 18 },
  errorCard: { backgroundColor: t.colors.dangerSoft, borderColor: 'transparent' },
  errorTitle: { ...t.type.label, color: t.colors.dangerText, marginBottom: t.spacing.xs },
  errorText: { ...t.type.body, color: t.colors.text },
  errorHint: { ...t.type.caption, color: t.colors.textSecondary, marginTop: t.spacing.sm },
  bottom: { paddingHorizontal: t.spacing.xl, paddingTop: t.spacing.md, backgroundColor: t.colors.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border },
});

export default function ResultScreen({ photo, result, errorMessage, loading, host, onClose, onRetake }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const meta = classMeta(result?.class_label, theme);
  const conf = result?.confidence_score;
  const confPct = conf != null ? conf * 100 : null;
  const lowConfidence = confPct != null && confPct < LOW_CONFIDENCE_PCT;
  const hasCoords = photo.latitude != null && photo.longitude != null;
  const ratio = photo.width && photo.height ? Math.max(3 / 4, photo.width / photo.height) : 4 / 3;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <View style={s.bar}>
        <Pressable onPress={onClose} hitSlop={10} style={s.barBtn} disabled={loading} accessibilityRole="button" accessibilityLabel="Tutup hasil">
          <Text style={[s.barBtnText, loading && { opacity: 0.5 }]}>Tutup</Text>
        </Pressable>
        <Text style={s.barTitle} accessibilityRole="header">Hasil Analisis</Text>
        <View style={s.barBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.imageWrap, { aspectRatio: ratio }]}>
          <Image source={{ uri: photo.uri }} style={s.image} resizeMode="cover" />
          {loading ? (
            <View style={s.imageOverlay}>
              <ActivityIndicator color={theme.colors.accent} />
              <Text style={s.imageOverlayText}>Menganalisis gambar…</Text>
            </View>
          ) : null}
        </View>

        {loading ? (
          <Card>
            <Skeleton width="40%" />
            <Skeleton width="70%" height={28} style={{ marginTop: 10 }} />
            <Skeleton height={8} style={{ marginTop: 18 }} />
          </Card>
        ) : result ? (
          <Card style={[s.resultCard, { borderLeftColor: meta.color }]}>
            <Overline>Klasifikasi</Overline>
            <View style={s.head}>
              <Text style={[s.className, { color: meta.text }]}>{meta.name}</Text>
              {meta.status ? (
                <View style={[s.chip, { backgroundColor: meta.soft }]}><Text style={[s.chipText, { color: meta.text }]}>{meta.status}</Text></View>
              ) : null}
            </View>
            {confPct != null ? (
              <>
                <View style={s.confRow}>
                  <Text style={s.confLabel}>Tingkat keyakinan model</Text>
                  <Text style={s.confValue}>{confPct.toFixed(1)}%</Text>
                </View>
                <ProgressBar percent={confPct} color={meta.color} />
              </>
            ) : null}
            {lowConfidence ? (
              <View style={s.low}>
                <Text style={s.lowTitle}>Hasil kurang yakin, sebaiknya foto ulang</Text>
                <Text style={s.lowText}>
                  Keyakinan model di bawah {LOW_CONFIDENCE_PCT}%. Ambil foto lebih dekat ke permukaan jalan, pastikan cukup terang, tidak buram, dan
                  kerusakan berada di tengah bingkai.
                </Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <Card style={s.errorCard}>
            <Text style={s.errorTitle}>Analisis gagal</Text>
            <Text style={s.errorText}>{errorMessage || 'Periksa koneksi ke server lalu coba lagi.'}</Text>
            <Text style={s.errorHint}>Server: {host}</Text>
          </Card>
        )}

        <Card style={{ paddingVertical: theme.spacing.xs }}>
          <DetailRow label="Lokasi" value={result?.location_name || photo.locationName} />
          <DetailRow label="Koordinat" value={hasCoords ? `${photo.latitude.toFixed(6)}, ${photo.longitude.toFixed(6)}` : 'GPS belum tersedia'} />
          <DetailRow label="Waktu" value={formatDate(result?.captured_at || photo.capturedAt)} isLast />
        </Card>

        {hasCoords ? (
          <Button title="Lihat di peta" variant="secondary" icon={(c) => <PinIcon color={c} />} onPress={() => Linking.openURL(osmUrl(photo.latitude, photo.longitude))} />
        ) : null}
      </ScrollView>

      <View style={[s.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title={lowConfidence ? 'Foto ulang' : 'Foto lagi'}
          onPress={onRetake}
          disabled={loading}
          icon={(c) => <CameraIcon color={c} size={18} />}
        />
      </View>
    </View>
  );
}
