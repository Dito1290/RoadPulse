import React from 'react';
import { View } from 'react-native';

// Ornamen regional Lampung, digambar sendiri. Dipakai sebagai aksen halus, bukan elemen dominan.

// Siger: mahkota adat Lampung (bentuk dasar Menara Siger).
export function SigerCrown({ width = 120, color }) {
  const peaks = [0.45, 0.65, 0.85, 1, 0.85, 0.65, 0.45];
  const peakW = width / peaks.length;
  const maxH = width * 0.42;
  const bead = Math.max(3, peakW * 0.3);
  return (
    <View style={{ width, alignItems: 'center' }} pointerEvents="none">
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {peaks.map((h, i) => (
          <View key={i} style={{ width: peakW, alignItems: 'center' }}>
            <View style={{ width: bead, height: bead, borderRadius: bead, backgroundColor: color, marginBottom: 1 }} />
            <View
              style={{
                width: 0, height: 0, borderLeftWidth: peakW / 2, borderRightWidth: peakW / 2, borderBottomWidth: maxH * h,
                borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ width: width * 1.04, height: Math.max(3, width * 0.07), borderRadius: width, backgroundColor: color }} />
      <View style={{ width: width * 0.86, height: Math.max(2, width * 0.035), borderRadius: width, backgroundColor: color, opacity: 0.7, marginTop: Math.max(1, width * 0.025) }} />
    </View>
  );
}

// Garis motif belah ketupat ala kain Tapis — tipis dan transparan.
export function TapisLine({ color, size = 6, count = 40, opacity = 0.55, gap = 6 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', overflow: 'hidden', height: size * 1.6, opacity }} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width: size + gap, alignItems: 'center' }}>
          <View
            style={{
              width: size, height: size, transform: [{ rotate: '45deg' }],
              borderWidth: i % 2 ? 1 : 0, borderColor: color, backgroundColor: i % 2 ? 'transparent' : color,
            }}
          />
        </View>
      ))}
    </View>
  );
}
