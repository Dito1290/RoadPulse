import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { classMeta } from '../theme/tokens';
import { SigerCrown } from './lampung';

const makeStyles = (t) => StyleSheet.create({
  card: {
    backgroundColor: t.colors.surface, borderRadius: t.radius.xl, padding: t.spacing.lg,
    borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
  },
  btn: {
    minHeight: 52, borderRadius: t.radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: t.spacing.sm, paddingHorizontal: t.spacing.xl,
  },
  btnPrimary: { backgroundColor: t.colors.accent },
  btnSecondary: { backgroundColor: t.colors.elevated, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border },
  btnGhost: { backgroundColor: 'transparent' },
  btnText: { ...t.type.bodyStrong },
  iconBtn: {
    width: t.touch.min, height: t.touch.min, borderRadius: t.radius.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: t.colors.elevated, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: t.radius.sm },
  badgeText: { ...t.type.caption, fontWeight: '700' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md },
  sectionTitle: { ...t.type.heading, color: t.colors.text },
  sectionAction: { ...t.type.label, color: t.colors.accentText },
  empty: { alignItems: 'center', paddingVertical: t.spacing.xxxl, paddingHorizontal: t.spacing.xxl },
  emptyTitle: { ...t.type.bodyStrong, color: t.colors.text, marginTop: t.spacing.lg, marginBottom: t.spacing.xs },
  emptySub: { ...t.type.body, fontSize: 14, color: t.colors.textSecondary, textAlign: 'center' },
  skeleton: { backgroundColor: t.colors.skeleton, borderRadius: 6 },
  track: { height: 8, borderRadius: 4, backgroundColor: t.colors.elevated, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  seg: { flexDirection: 'row', backgroundColor: t.colors.elevated, borderRadius: t.radius.md, padding: 3, gap: 3 },
  segItem: { flex: 1, minHeight: 40, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center' },
  segItemActive: { backgroundColor: t.colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border },
  segText: { ...t.type.label, color: t.colors.textSecondary },
  segTextActive: { color: t.colors.text },
  detailRow: { paddingVertical: t.spacing.md },
  detailDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.colors.border },
  detailLabel: { ...t.type.caption, color: t.colors.textSecondary, marginBottom: 3 },
  detailValue: { ...t.type.body, color: t.colors.text },
  overline: { ...t.type.overline, color: t.colors.textSecondary },
});

export function Card({ style, children }) {
  const s = useStyles(makeStyles);
  return <View style={[s.card, style]}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, style, accessibilityLabel, textColor }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const color = textColor || (variant === 'primary' ? theme.colors.onAccent : variant === 'ghost' ? theme.colors.textSecondary : theme.colors.text);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!(disabled || loading) }}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' ? s.btnPrimary : variant === 'ghost' ? s.btnGhost : s.btnSecondary,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={color} /> : icon ? icon(color) : null}
      <Text style={[s.btnText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ onPress, children, accessibilityLabel, style }) {
  const s = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }, style]}
    >
      {children}
    </Pressable>
  );
}

export function StatusDot({ color }) {
  const s = useStyles(makeStyles);
  return <View style={[s.dot, { backgroundColor: color }]} />;
}

export function ClassBadge({ label, showStatus = false }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  const meta = classMeta(label, theme);
  return (
    <View style={[s.badge, { backgroundColor: meta.soft }]}>
      <StatusDot color={meta.color} />
      <Text style={[s.badgeText, { color: meta.text }]}>{showStatus ? meta.status : meta.name}</Text>
    </View>
  );
}

export function Badge({ text, color, textColor, soft }) {
  const s = useStyles(makeStyles);
  return (
    <View style={[s.badge, { backgroundColor: soft }]}>
      {color ? <StatusDot color={color} /> : null}
      <Text style={[s.badgeText, { color: textColor || color }]}>{text}</Text>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.sectionHead}>
      <Text style={s.sectionTitle} accessibilityRole="header">{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({ title, subtitle }) {
  const s = useStyles(makeStyles);
  const { theme } = useTheme();
  return (
    <Card style={s.empty}>
      <SigerCrown width={56} color={theme.colors.heritageSoft} />
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.emptySub}>{subtitle}</Text>
    </Card>
  );
}

export function Skeleton({ width = '100%', height = 14, style }) {
  const s = useStyles(makeStyles);
  return <View style={[s.skeleton, { width, height }, style]} />;
}

export function ProgressBar({ percent, color }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${Math.max(0, Math.min(percent, 100))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Segmented({ options, value, onChange }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.seg} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[s.segItem, active && s.segItemActive]}
          >
            <Text style={[s.segText, active && s.segTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function DetailRow({ label, value, isLast }) {
  const s = useStyles(makeStyles);
  return (
    <View style={[s.detailRow, !isLast && s.detailDivider]}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

export function Overline({ children, style }) {
  const s = useStyles(makeStyles);
  return <Text style={[s.overline, style]}>{children}</Text>;
}
