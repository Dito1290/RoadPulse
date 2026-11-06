import React from 'react';
import { View } from 'react-native';

// Ikon sederhana dari View (tanpa dependency tambahan). Warna selalu dikirim dari token tema.

export function CameraIcon({ color, size = 22 }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'flex-end' }}>
      <View
        style={{
          position: 'absolute', top: size * 0.1, left: size * 0.32, width: size * 0.36, height: size * 0.2,
          borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: color,
        }}
      />
      <View style={{ height: size * 0.68, borderRadius: size * 0.18, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.32, height: size * 0.32, borderRadius: size, borderWidth: 2, borderColor: color }} />
      </View>
    </View>
  );
}

export function ChartIcon({ color, size = 22 }) {
  const bar = (h) => ({ width: size * 0.2, height: size * h, borderRadius: 2, backgroundColor: color });
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: size * 0.06, paddingBottom: size * 0.08 }}>
      <View style={bar(0.45)} />
      <View style={bar(0.8)} />
      <View style={bar(0.6)} />
    </View>
  );
}

export function ListIcon({ color, size = 22 }) {
  const row = (k) => (
    <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.12 }}>
      <View style={{ width: size * 0.16, height: size * 0.16, borderRadius: size, backgroundColor: color }} />
      <View style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: color }} />
    </View>
  );
  return <View style={{ width: size, height: size, justifyContent: 'space-evenly', paddingHorizontal: size * 0.06 }}>{[0, 1, 2].map(row)}</View>;
}

export function HomeIcon({ color, size = 22 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: size * 0.06 }}>
      <View
        style={{
          position: 'absolute', top: size * 0.12, width: size * 0.56, height: size * 0.56, borderLeftWidth: 2, borderTopWidth: 2,
          borderColor: color, transform: [{ rotate: '45deg' }], borderTopLeftRadius: 2,
        }}
      />
      <View style={{ width: size * 0.62, height: size * 0.46, borderWidth: 2, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
    </View>
  );
}

export function CloseIcon({ color, size = 16 }) {
  const bar = { position: 'absolute', width: size, height: 2, borderRadius: 1, backgroundColor: color };
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[bar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[bar, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

export function GearIcon({ color, size = 20 }) {
  const tooth = (deg) => (
    <View key={deg} style={{ position: 'absolute', width: size * 0.22, height: size, alignItems: 'center', transform: [{ rotate: `${deg}deg` }] }}>
      <View style={{ width: size * 0.22, height: size * 0.2, borderRadius: 2, backgroundColor: color }} />
    </View>
  );
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map(tooth)}
      <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: size, borderWidth: size * 0.16, borderColor: color }} />
    </View>
  );
}

export function PinIcon({ color, size = 16 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.7, height: size * 0.7, borderRadius: size, borderBottomRightRadius: 0, borderWidth: 2, borderColor: color,
          transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center', marginTop: size * 0.04,
        }}
      >
        <View style={{ width: size * 0.18, height: size * 0.18, borderRadius: size, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function ChevronIcon({ color, size = 12, direction = 'right' }) {
  const rot = { right: '45deg', down: '135deg', left: '225deg', up: '-45deg' }[direction];
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.6, height: size * 0.6, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: rot }] }} />
    </View>
  );
}

export function UserIcon({ color, size = 18 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'space-between', paddingVertical: size * 0.04 }}>
      <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: size, borderWidth: 2, borderColor: color }} />
      <View style={{ width: size * 0.82, height: size * 0.36, borderTopLeftRadius: size, borderTopRightRadius: size, borderWidth: 2, borderBottomWidth: 0, borderColor: color }} />
    </View>
  );
}

export function LockIcon({ color, size = 18 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ position: 'absolute', top: size * 0.04, width: size * 0.5, height: size * 0.5, borderTopLeftRadius: size, borderTopRightRadius: size, borderWidth: 2, borderBottomWidth: 0, borderColor: color }} />
      <View style={{ width: size * 0.78, height: size * 0.54, borderRadius: size * 0.14, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.12, height: size * 0.18, borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function EyeIcon({ color, size = 18, off = false }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.92, height: size * 0.56, borderRadius: size, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.24, height: size * 0.24, borderRadius: size, backgroundColor: color }} />
      </View>
      {off ? <View style={{ position: 'absolute', width: size * 1.05, height: 2, borderRadius: 1, backgroundColor: color, transform: [{ rotate: '-35deg' }] }} /> : null}
    </View>
  );
}
