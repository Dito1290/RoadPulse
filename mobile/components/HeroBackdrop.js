import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

// Latar bergerak layar masuk — video yang sama dengan hero dashboard web (Marc Espejo / Pexels).
// Selama video belum siap (atau gagal diputar) tampil foto Menara Siger dengan gerak pan/zoom pelan.
const HERO_VIDEO = require('../assets/city-traffic-hero.mp4');
const SIGER_PHOTO = require('../assets/menara-siger-bakauheni.jpg');

// Overlay gelap kehijauan seperti .left::before di login web: rgba(10,30,26) 0.55 → 0.85
const OVERLAY_STEPS = 12;

export default function HeroBackdrop() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoOpacity = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(HERO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers';
  });

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduceMotion(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v) => setReduceMotion(!!v));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  // Putar video kecuali pengguna mengaktifkan "kurangi gerakan"
  useEffect(() => {
    if (reduceMotion) player.pause();
    else player.play();
  }, [player, reduceMotion]);

  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') setVideoReady(true);
      if (status === 'error') setVideoReady(false);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    Animated.timing(videoOpacity, {
      toValue: videoReady && !reduceMotion ? 1 : 0, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
  }, [videoReady, reduceMotion, videoOpacity]);

  // Efek Ken Burns untuk foto cadangan
  useEffect(() => {
    if (reduceMotion) return undefined;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(drift, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(drift, { toValue: 0, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [drift, reduceMotion]);

  const photoStyle = {
    transform: [
      { scale: drift.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1.2] }) },
      { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] }) },
    ],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.Image source={SIGER_PHOTO} style={[StyleSheet.absoluteFill, styles.fill, photoStyle]} resizeMode="cover" />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: videoOpacity }]}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
          accessible={false}
        />
      </Animated.View>
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: OVERLAY_STEPS }).map((_, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: `rgba(10, 30, 26, ${(0.5 + (0.42 * i) / (OVERLAY_STEPS - 1)).toFixed(3)})` }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
});
