import React from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { classMeta } from '../theme/tokens';
import { DEFAULT_LOCATION_NAME, formatDate, imageUrlFor, osmUrl } from '../services/api';
import { Button, ClassBadge, DetailRow, ProgressBar } from './ui';
import { ChevronIcon, PinIcon } from './icons';

// Di bawah ambang ini hasil AI dianggap meragukan dan pengguna diminta foto ulang
export const LOW_CONFIDENCE_PCT = 50;

const makeStyles = (t) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.md, minHeight: 72 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.colors.border },
  thumb: { width: 56, height: 56, borderRadius: t.radius.md, backgroundColor: t.colors.elevated },
  body: { flex: 1, gap: 3 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conf: { ...t.type.label, color: t.colors.textSecondary, fontVariant: ['tabular-nums'] },
  confLow: { color: t.colors.warningText, fontWeight: '800' },
  loc: { ...t.type.bodyStrong, fontSize: 14, color: t.colors.text },
  date: { ...t.type.caption, color: t.colors.textSecondary },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: t.colors.scrim },
  sheet: {
    backgroundColor: t.colors.surface, borderTopLeftRadius: t.radius.xxl, borderTopRightRadius: t.radius.xxl, maxHeight: '88%',
    borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: t.colors.border, marginTop: 10, marginBottom: t.spacing.md },
  sheetBody: { paddingHorizontal: t.spacing.xl },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: t.radius.lg, backgroundColor: t.colors.elevated, marginBottom: t.spacing.lg },
  title: { ...t.type.title, marginBottom: t.spacing.xs },
  confRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: t.spacing.lg, marginBottom: t.spacing.sm },
  confLabel: { ...t.type.label, color: t.colors.textSecondary },
  confValue: { ...t.type.label, color: t.colors.text, fontVariant: ['tabular-nums'] },
  notice: {
    marginTop: t.spacing.md, padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: t.colors.warningSoft,
  },
  noticeText: { ...t.type.caption, color: t.colors.text, lineHeight: 18 },
});

export function InspectionRow({ item, host, onPress, isLast }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const uri = imageUrlFor(item, host);
  const pct = Math.round((item.confidence_score || 0) * 100);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${classMeta(item.class_label, theme).name}, keyakinan ${pct} persen, ${item.location_name || DEFAULT_LOCATION_NAME}`}
      style={({ pressed }) => [s.row, !isLast && s.divider, pressed && { opacity: 0.7 }]}
    >
      {uri ? <Image source={{ uri }} style={s.thumb} /> : <View style={s.thumb} />}
      <View style={s.body}>
        <View style={s.top}>
          <ClassBadge label={item.class_label} />
          <Text style={[s.conf, pct < LOW_CONFIDENCE_PCT && s.confLow]}>{pct}%</Text>
        </View>
        <Text style={s.loc} numberOfLines={1}>{item.location_name || DEFAULT_LOCATION_NAME}</Text>
        <Text style={s.date}>{formatDate(item.created_at || item.captured_at)}</Text>
      </View>
      <ChevronIcon color={theme.colors.textSecondary} size={12} />
    </Pressable>
  );
}

// Detail satu inspeksi — hanya memakai data yang sudah dikirim API riwayat.
export function InspectionDetailSheet({ item, host, onClose }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  if (!item) return null;
  const meta = classMeta(item.class_label, theme);
  const uri = imageUrlFor(item, host);
  const pct = (item.confidence_score || 0) * 100;
  const hasCoords = item.latitude != null && item.longitude != null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Tutup detail" />
        <View style={s.sheet}>
          <View style={s.handle} />
          <ScrollView contentContainerStyle={[s.sheetBody, { paddingBottom: insets.bottom + 20 }]}>
            {uri ? <Image source={{ uri }} style={s.photo} resizeMode="cover" /> : null}
            <Text style={[s.title, { color: meta.text }]}>{meta.name}</Text>
            <ClassBadge label={item.class_label} showStatus />
            <View style={s.confRow}>
              <Text style={s.confLabel}>Tingkat keyakinan model</Text>
              <Text style={s.confValue}>{pct.toFixed(1)}%</Text>
            </View>
            <ProgressBar percent={pct} color={meta.color} />
            {pct < LOW_CONFIDENCE_PCT ? (
              <View style={s.notice}>
                <Text style={s.noticeText}>Keyakinan model di bawah {LOW_CONFIDENCE_PCT}%, hasil ini sebaiknya dicek ulang.</Text>
              </View>
            ) : null}
            <View style={{ marginTop: theme.spacing.md }}>
              <DetailRow label="Lokasi" value={item.location_name || DEFAULT_LOCATION_NAME} />
              <DetailRow label="Koordinat" value={hasCoords ? `${item.latitude.toFixed(6)}, ${item.longitude.toFixed(6)}` : 'GPS tidak tersedia'} />
              <DetailRow label="Waktu foto" value={formatDate(item.captured_at)} />
              <DetailRow label="Waktu analisis" value={formatDate(item.created_at)} isLast />
            </View>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
              {hasCoords ? (
                <Button
                  title="Lihat di peta"
                  variant="secondary"
                  icon={(c) => <PinIcon color={c} />}
                  onPress={() => Linking.openURL(osmUrl(item.latitude, item.longitude))}
                />
              ) : null}
              <Button title="Tutup" variant="ghost" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
