import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { CLASS_KEYS, classMeta } from '../theme/tokens';
import { Button, Card, EmptyState, Skeleton } from '../components/ui';
import { InspectionRow } from '../components/inspection';

const makeStyles = (t) => StyleSheet.create({
  chips: { gap: t.spacing.sm, paddingBottom: t.spacing.md },
  chip: {
    minHeight: 36, paddingHorizontal: t.spacing.md, borderRadius: t.radius.pill, justifyContent: 'center',
    backgroundColor: t.colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
  },
  chipActive: { backgroundColor: t.colors.accentSoft, borderColor: t.colors.accent },
  chipText: { ...t.type.label, color: t.colors.textSecondary },
  chipTextActive: { color: t.colors.accentText },
  meta: { ...t.type.caption, color: t.colors.textSecondary, marginBottom: t.spacing.md },
  list: { paddingVertical: 0, paddingHorizontal: t.spacing.lg },
  more: { marginTop: t.spacing.lg },
  end: { ...t.type.caption, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.lg },
  error: { ...t.type.caption, color: t.colors.dangerText, textAlign: 'center', marginTop: t.spacing.sm },
});

// Filter bekerja pada data yang sudah dimuat dari API riwayat (API belum mendukung filter server).
export default function HistoryScreen({ historyList, historyMeta, apiConnected, host, loadingMore, loadMoreError, onLoadMore, onOpenDetail }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const [filter, setFilter] = useState('all');

  const filters = [{ key: 'all', label: 'Semua' }, ...CLASS_KEYS.map((k) => ({ key: k, label: classMeta(k, theme).name }))];
  const items = useMemo(() => (filter === 'all' ? historyList : historyList.filter((i) => i.class_label === filter)), [filter, historyList]);
  const hasMore = historyMeta.page < historyMeta.totalPages;

  if (historyList.length === 0) {
    if (apiConnected === null) {
      return <Card>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={52} style={{ marginVertical: 6 }} />)}</Card>;
    }
    return <EmptyState title="Belum ada inspeksi" subtitle="Hasil foto dari tombol Buka kamera akan muncul di sini." />;
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
        {filters.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[s.chip, active && s.chipActive]}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={s.meta}>
        Menampilkan {items.length} dari {historyList.length} inspeksi yang dimuat · total {historyMeta.totalRecords} di server
      </Text>

      {items.length === 0 ? (
        <EmptyState title="Tidak ada yang cocok" subtitle="Belum ada inspeksi dengan kondisi ini pada data yang dimuat." />
      ) : (
        <Card style={s.list}>
          {items.map((item, i) => (
            <InspectionRow key={item.id} item={item} host={host} isLast={i === items.length - 1} onPress={() => onOpenDetail(item)} />
          ))}
        </Card>
      )}

      {hasMore ? (
        <Button title="Muat lebih banyak" variant="secondary" loading={loadingMore} onPress={onLoadMore} style={s.more} />
      ) : (
        <Text style={s.end}>Semua inspeksi sudah dimuat.</Text>
      )}
      {loadMoreError ? <Text style={s.error}>{loadMoreError}</Text> : null}
    </View>
  );
}
