import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { CLASS_KEYS, classMeta } from '../theme/tokens';
import { Card, Overline, ProgressBar, SectionHeader, Skeleton, StatusDot } from '../components/ui';
import { SigerCrown } from '../components/lampung';

const makeStyles = (t) => StyleSheet.create({
  total: { padding: t.spacing.xl, marginBottom: t.spacing.lg, overflow: 'hidden', backgroundColor: t.colors.elevated },
  watermark: { position: 'absolute', right: -14, bottom: -4 },
  totalValue: { ...t.type.metric, fontSize: 46, color: t.colors.text, marginTop: t.spacing.xs },
  split: { flexDirection: 'row', marginTop: t.spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.colors.border, paddingTop: t.spacing.md },
  splitItem: { flex: 1 },
  splitValue: { ...t.type.heading, fontSize: 20, fontVariant: ['tabular-nums'] },
  splitLabel: { ...t.type.caption, color: t.colors.textSecondary, marginTop: 2 },
  distRow: { marginBottom: t.spacing.lg },
  distHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.sm },
  distName: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  distNameText: { ...t.type.bodyStrong, color: t.colors.text },
  distStatus: { ...t.type.caption, color: t.colors.textSecondary },
  distCount: { ...t.type.bodyStrong, color: t.colors.text, fontVariant: ['tabular-nums'] },
  distPct: { ...t.type.caption, color: t.colors.textSecondary },
  note: { ...t.type.caption, color: t.colors.textSecondary, lineHeight: 18, marginTop: t.spacing.sm },
});

export default function SummaryScreen({ stats, apiConnected }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const c = theme.colors;
  const total = stats.total_inspections || 0;
  const dist = CLASS_KEYS.map((key) => ({ key, count: stats.class_distribution?.[key] || 0 }));
  const damaged = dist.filter((d) => d.key !== 'Normal').reduce((sum, d) => sum + d.count, 0);
  const rate = total > 0 ? Math.round((damaged / total) * 100) : 0;
  const loading = apiConnected === null && total === 0;

  return (
    <View>
      <Card style={s.total}>
        <View style={s.watermark} pointerEvents="none"><SigerCrown width={120} color={c.heritageSoft} /></View>
        <Overline>Total inspeksi</Overline>
        {loading ? <Skeleton width={90} height={44} style={{ marginTop: 8 }} /> : <Text style={s.totalValue}>{total}</Text>}
        <View style={s.split}>
          <View style={s.splitItem}>
            <Text style={[s.splitValue, { color: c.dangerText }]}>{damaged}</Text>
            <Text style={s.splitLabel}>Rusak</Text>
          </View>
          <View style={s.splitItem}>
            <Text style={[s.splitValue, { color: c.successText }]}>{total - damaged}</Text>
            <Text style={s.splitLabel}>Normal</Text>
          </View>
          <View style={s.splitItem}>
            <Text style={[s.splitValue, { color: c.text }]}>{rate}%</Text>
            <Text style={s.splitLabel}>Tingkat rusak</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Distribusi kondisi" />
      <Card>
        {dist.map(({ key, count }, i) => {
          const meta = classMeta(key, theme);
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <View key={key} style={[s.distRow, i === dist.length - 1 && { marginBottom: 0 }]}>
              <View style={s.distHead}>
                <View style={s.distName}>
                  <StatusDot color={meta.color} />
                  <View>
                    <Text style={s.distNameText}>{meta.name}</Text>
                    <Text style={s.distStatus}>{meta.status}</Text>
                  </View>
                </View>
                <Text style={s.distCount}>
                  {count}<Text style={s.distPct}>  {pct.toFixed(0)}%</Text>
                </Text>
              </View>
              <ProgressBar percent={pct} color={meta.color} />
            </View>
          );
        })}
      </Card>
      <Text style={s.note}>Angka dihitung server dari seluruh inspeksi yang tersimpan. Tarik layar ke bawah untuk memperbarui.</Text>
    </View>
  );
}
