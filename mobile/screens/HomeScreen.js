import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { classMeta } from '../theme/tokens';
import { Button, Card, EmptyState, Overline, ProgressBar, SectionHeader, Skeleton, StatusDot } from '../components/ui';
import { InspectionRow } from '../components/inspection';
import RoadMap from '../components/RoadMap';
import { TapisLine } from '../components/lampung';
import { CameraIcon } from '../components/icons';

const SIGER_PHOTO = require('../assets/menara-siger-bakauheni.jpg');

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function timeText(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const makeStyles = (t) => StyleSheet.create({
  greet: { ...t.type.label, color: t.colors.textSecondary },
  greetTitle: { ...t.type.title, color: t.colors.text, marginTop: 2, marginBottom: t.spacing.lg },
  // 2. Status sistem
  statusCard: { paddingVertical: t.spacing.xs, paddingHorizontal: t.spacing.lg, marginBottom: t.spacing.xxl },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingVertical: t.spacing.md, minHeight: 48 },
  statusDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.colors.border },
  statusLabel: { ...t.type.label, color: t.colors.text, width: 92 },
  statusValue: { ...t.type.caption, color: t.colors.textSecondary, flex: 1, textAlign: 'right' },
  bannerLink: { ...t.type.label, color: t.colors.accentText },
  // 3. Ringkasan
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginBottom: t.spacing.md },
  tile: { flexBasis: '48%', flexGrow: 1, padding: t.spacing.lg, minHeight: 96, justifyContent: 'space-between' },
  tileValue: { ...t.type.metric, fontSize: 28, marginTop: t.spacing.sm },
  tileHint: { ...t.type.caption, color: t.colors.textSecondary, marginTop: 2 },
  rateCard: { marginBottom: t.spacing.md },
  rateHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: t.spacing.sm },
  rateLabel: { ...t.type.label, color: t.colors.text },
  rateValue: { ...t.type.heading, color: t.colors.text, fontVariant: ['tabular-nums'] },
  info: {
    flexDirection: 'row', gap: t.spacing.sm, padding: t.spacing.md, borderRadius: t.radius.md, backgroundColor: t.colors.infoSoft,
    marginBottom: t.spacing.md,
  },
  infoText: { ...t.type.caption, color: t.colors.text, flex: 1, lineHeight: 18 },
  // 4. Peta
  mapHead: { marginTop: t.spacing.xxl },
  mapSub: { ...t.type.caption, color: t.colors.textSecondary, marginTop: -t.spacing.sm, marginBottom: t.spacing.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.lg, marginTop: t.spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { ...t.type.caption, color: t.colors.textSecondary },
  mapError: { ...t.type.caption, color: t.colors.dangerText, marginTop: t.spacing.sm },
  // 5. Laporan terbaru
  recentHead: { marginTop: t.spacing.xxl },
  list: { paddingVertical: 0, paddingHorizontal: t.spacing.lg },
  // Identitas Lampung
  region: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginTop: t.spacing.xxl, padding: t.spacing.md },
  regionImg: { width: 64, height: 64, borderRadius: t.radius.md, backgroundColor: t.colors.elevated },
  regionTitle: { ...t.type.label, color: t.colors.text },
  regionText: { ...t.type.caption, color: t.colors.textSecondary, lineHeight: 17, marginTop: 2 },
  tapis: { alignItems: 'center', marginTop: t.spacing.lg },
});

export default function HomeScreen({
  stats, historyList, mapPoints, mapError, apiConnected, host, lastUpdated, currentCoords, locationPermission, username,
  onStartCamera, onNavigate, onOpenSettings, onOpenDetail, onSelectMapPoint,
}) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const c = theme.colors;

  const dist = stats.class_distribution || {};
  const total = stats.total_inspections || 0;
  const repair = (dist.Crack || 0) + (dist.Pothole || 0);
  const watch = dist['Surface Erosion'] || 0;
  const normal = dist.Normal || 0;
  const damageRate = total > 0 ? Math.round(((repair + watch) / total) * 100) : 0;
  const loadingData = apiConnected === null && total === 0;

  const server = apiConnected ? { color: c.success, text: 'Online' }
    : apiConnected === false ? { color: c.danger, text: 'Offline' } : { color: c.warning, text: 'Memeriksa…' };
  const gps = currentCoords ? { color: c.success, text: 'Aktif' }
    : locationPermission === false ? { color: c.danger, text: 'Izin ditolak' } : { color: c.warning, text: 'Mencari sinyal…' };

  const tiles = [
    { label: 'Total laporan', value: total, color: c.text, hint: 'Semua inspeksi' },
    { label: 'Perlu perbaikan', value: repair, color: classMeta('Pothole', theme).text, hint: 'Retakan & lubang' },
    { label: 'Perlu dipantau', value: watch, color: classMeta('Surface Erosion', theme).text, hint: 'Erosi permukaan' },
    { label: 'Normal', value: normal, color: classMeta('Normal', theme).text, hint: 'Kondisi baik' },
  ];
  const geoCount = (mapPoints || []).length;

  return (
    <View>
      <Text style={s.greet}>{greeting()}{username ? `, ${username}` : ''} · Tabik Pun!</Text>
      <Text style={s.greetTitle}>Kondisi jalan Lampung hari ini</Text>

      {/* 2. Status sistem */}
      <Overline style={{ marginBottom: theme.spacing.sm }}>Status sistem</Overline>
      <Card style={s.statusCard}>
        <View style={[s.statusRow, s.statusDivider]}>
          <StatusDot color={server.color} />
          <Text style={s.statusLabel}>Server</Text>
          <Text style={s.statusValue} numberOfLines={1}>{server.text} · {host.replace(/^https?:\/\//, '')}</Text>
        </View>
        <View style={[s.statusRow, s.statusDivider]}>
          <StatusDot color={gps.color} />
          <Text style={s.statusLabel}>GPS</Text>
          <Text style={s.statusValue}>{gps.text}</Text>
        </View>
        <View style={s.statusRow}>
          <StatusDot color={lastUpdated ? c.info : c.border} />
          <Text style={s.statusLabel}>Diperbarui</Text>
          <Text style={s.statusValue}>{lastUpdated ? `Pukul ${timeText(lastUpdated)} · tarik untuk segarkan` : 'Belum ada data'}</Text>
        </View>
        {apiConnected === false ? (
          <Pressable onPress={onOpenSettings} accessibilityRole="button" style={[s.statusRow, { minHeight: 44, paddingTop: 0 }]}>
            <Text style={s.bannerLink}>Server tidak terjangkau — atur alamat server ›</Text>
          </Pressable>
        ) : null}
      </Card>

      {/* 3. Ringkasan kondisi */}
      <SectionHeader title="Ringkasan kondisi jalan" action="Detail" onAction={() => onNavigate('stats')} />
      <View style={s.grid}>
        {tiles.map((tile) => (
          <Card key={tile.label} style={s.tile}>
            <Overline>{tile.label}</Overline>
            {loadingData ? <Skeleton width="50%" height={28} style={{ marginTop: 8 }} /> : <Text style={[s.tileValue, { color: tile.color }]}>{tile.value}</Text>}
            <Text style={s.tileHint}>{tile.hint}</Text>
          </Card>
        ))}
      </View>
      <Card style={s.rateCard}>
        <View style={s.rateHead}>
          <Text style={s.rateLabel}>Tingkat kerusakan</Text>
          <Text style={s.rateValue}>{damageRate}%</Text>
        </View>
        <ProgressBar percent={damageRate} color={damageRate > 50 ? c.danger : c.warning} />
      </Card>
      <View style={s.info}>
        <StatusDot color={c.info} />
        <Text style={s.infoText}>
          Data lalu lintas dan titik kemacetan belum tersedia dari server RoadPulse. Aplikasi ini memantau kondisi permukaan jalan dari foto lapangan.
        </Text>
      </View>
      <Button title="Foto & analisis jalan" onPress={onStartCamera} icon={(col) => <CameraIcon color={col} size={18} />} />

      {/* 4. Peta interaktif */}
      <View style={s.mapHead}><SectionHeader title="Peta kerusakan jalan" /></View>
      <Text style={s.mapSub}>{geoCount} titik ber-GPS dari server · ketuk titik untuk melihat detail</Text>
      <RoadMap points={mapPoints} onSelect={onSelectMapPoint} />
      <View style={s.legend}>
        {['Pothole', 'Surface Erosion', 'Normal'].map((k) => {
          const meta = classMeta(k, theme);
          return (
            <View key={k} style={s.legendItem}>
              <StatusDot color={meta.color} />
              <Text style={s.legendText}>{k === 'Pothole' ? 'Retakan/lubang' : meta.name}</Text>
            </View>
          );
        })}
      </View>
      {mapError ? <Text style={s.mapError}>Titik peta gagal dimuat: {mapError}</Text> : null}

      {/* 5. Laporan terbaru */}
      <View style={s.recentHead}>
        <SectionHeader title="Laporan terbaru" action={historyList.length ? 'Lihat semua' : null} onAction={() => onNavigate('history')} />
      </View>
      {historyList.length === 0 ? (
        loadingData ? (
          <Card>{[0, 1].map((i) => <Skeleton key={i} height={52} style={{ marginVertical: 6 }} />)}</Card>
        ) : (
          <EmptyState title="Belum ada laporan" subtitle="Foto jalan lewat tombol Foto & analisis jalan untuk membuat laporan pertama." />
        )
      ) : (
        <Card style={s.list}>
          {historyList.slice(0, 3).map((item, i, arr) => (
            <InspectionRow key={item.id} item={item} host={host} isLast={i === arr.length - 1} onPress={() => onOpenDetail(item)} />
          ))}
        </Card>
      )}

      {/* Identitas Lampung (aksen, bukan latar) */}
      <Card style={s.region}>
        <Image source={SIGER_PHOTO} style={s.regionImg} resizeMode="cover" accessibilityLabel="Foto Menara Siger" />
        <View style={{ flex: 1 }}>
          <Text style={s.regionTitle}>RoadPulse Lampung</Text>
          <Text style={s.regionText}>Menara Siger, Bakauheni, Lampung Selatan · Foto: Sakurai Midori (CC BY 2.5)</Text>
        </View>
      </Card>
      <View style={s.tapis}><TapisLine color={c.heritage} count={22} opacity={0.35} /></View>
    </View>
  );
}
