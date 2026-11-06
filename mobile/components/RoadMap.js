import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { classMeta } from '../theme/tokens';
import { Button } from './ui';

// Peta interaktif dengan provider yang sama seperti dashboard web: Leaflet 1.9.4 + tile OpenStreetMap.
// Data titik berasal dari GET /api/v1/dashboard/map/ (tidak ada data contoh).
const CENTER = [-5.429, 105.262]; // pusat awal Bandar Lampung, sama dengan dashboard web
const LOAD_TIMEOUT_MS = 15000;

function buildHtml(theme) {
  const c = theme.colors;
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#map{margin:0;padding:0;height:100%;width:100%;background:${c.elevated};}
.leaflet-tile-pane{filter:${c.mapTileFilter};}
.leaflet-control-attribution{font:10px -apple-system,Roboto,sans-serif;background:${c.surface}cc !important;color:${c.textSecondary};}
.leaflet-control-attribution a{color:${c.accentText};}
.leaflet-bar a{background:${c.surface};color:${c.text};border-color:${c.border};}
</style></head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
function post(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m));}
if(!window.L){post({type:'error',message:'Pustaka peta tidak dapat diunduh.'});}
else{
  var map=L.map('map',{zoomControl:false,scrollWheelZoom:false}).setView([${CENTER[0]},${CENTER[1]}],12);
  L.control.zoom({position:'bottomright'}).addTo(map);
  var tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
  var errors=0,ready=false;
  tiles.on('load',function(){if(!ready){ready=true;post({type:'ready'});}});
  tiles.on('tileerror',function(){errors++;if(errors===6&&!ready){post({type:'error',message:'Tile peta OpenStreetMap gagal dimuat.'});}});
  var layer=L.layerGroup().addTo(map);
  window.setPoints=function(points){
    layer.clearLayers();var b=[];
    points.forEach(function(p){
      var m=L.circleMarker([p.lat,p.lng],{radius:9,color:'${c.white}',weight:2,fillColor:p.color,fillOpacity:0.95}).addTo(layer);
      m.on('click',function(){post({type:'select',id:p.id});});
      b.push([p.lat,p.lng]);
    });
    if(b.length){map.fitBounds(b,{maxZoom:15,padding:[28,28]});}else{map.setView([${CENTER[0]},${CENTER[1]}],12);}
  };
  post({type:'loaded'});
}
</script></body></html>`;
}

const makeStyles = (t) => StyleSheet.create({
  wrap: {
    height: 300, borderRadius: t.radius.xl, overflow: 'hidden', backgroundColor: t.colors.elevated,
    borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
  },
  web: { flex: 1, backgroundColor: t.colors.elevated },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xl, backgroundColor: t.colors.elevated },
  overlayTitle: { ...t.type.bodyStrong, color: t.colors.text, textAlign: 'center', marginTop: t.spacing.md },
  overlayText: { ...t.type.caption, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.xs, lineHeight: 18 },
  emptyChip: {
    position: 'absolute', top: t.spacing.md, left: t.spacing.md, right: t.spacing.md, padding: t.spacing.md,
    borderRadius: t.radius.md, backgroundColor: t.colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.border,
  },
  emptyText: { ...t.type.caption, color: t.colors.text, lineHeight: 18 },
});

export default function RoadMap({ points, onSelect }) {
  const s = useStyles(makeStyles);
  const { theme, scheme } = useTheme();
  const webRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorText, setErrorText] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const html = useMemo(() => buildHtml(theme), [theme]);
  const markers = useMemo(
    () => (points || [])
      .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
      .map((p) => ({ id: p.id, lat: p.latitude, lng: p.longitude, color: classMeta(p.class_label, theme).color })),
    [points, theme]
  );

  const statusRef = useRef(status);
  statusRef.current = status;

  // Muat ulang dari awal saat tema berubah atau pengguna menekan "Coba lagi"
  useEffect(() => {
    setStatus('loading');
    setLoaded(false);
    const timer = setTimeout(() => {
      if (statusRef.current !== 'loading') return;
      setErrorText('Peta tidak merespons. Periksa koneksi internet HP.');
      setStatus('error');
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [scheme, attempt]);

  useEffect(() => {
    if (loaded && webRef.current) webRef.current.injectJavaScript(`window.setPoints && window.setPoints(${JSON.stringify(markers)}); true;`);
  }, [loaded, markers]);

  const onMessage = (event) => {
    let msg;
    try { msg = JSON.parse(event.nativeEvent.data); } catch (_) { return; }
    if (msg.type === 'loaded') setLoaded(true);
    else if (msg.type === 'ready') setStatus('ready');
    else if (msg.type === 'error') { setErrorText(msg.message); setStatus('error'); }
    else if (msg.type === 'select') onSelect?.(msg.id);
  };

  return (
    <View style={s.wrap}>
      {status !== 'error' ? (
        <WebView
          key={`${scheme}-${attempt}`}
          ref={webRef}
          source={{ html, baseUrl: 'https://roadpulse.local/' }}
          originWhitelist={['*']}
          onMessage={onMessage}
          onError={() => { setErrorText('Peta gagal dimuat.'); setStatus('error'); }}
          style={s.web}
          nestedScrollEnabled
          setBuiltInZoomControls={false}
          javaScriptEnabled
          domStorageEnabled
          accessibilityLabel="Peta titik inspeksi jalan"
        />
      ) : null}

      {status === 'loading' ? (
        <View style={s.overlay} pointerEvents="none">
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={s.overlayTitle}>Memuat peta…</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={s.overlay}>
          <Text style={s.overlayTitle}>Peta tidak dapat dimuat</Text>
          <Text style={s.overlayText}>{errorText} Peta memakai OpenStreetMap sehingga HP perlu akses internet.</Text>
          <Button title="Coba lagi" variant="secondary" onPress={() => setAttempt((n) => n + 1)} style={{ marginTop: theme.spacing.lg, minHeight: 44 }} />
        </View>
      ) : null}

      {status === 'ready' && markers.length === 0 ? (
        <View style={s.emptyChip} pointerEvents="none">
          <Text style={s.emptyText}>Belum ada inspeksi dengan koordinat GPS. Titik muncul setelah foto diambil dengan lokasi aktif.</Text>
        </View>
      ) : null}
    </View>
  );
}
