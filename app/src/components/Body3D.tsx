/**
 * Cuerpo 3D de la semana (Inicio) — figura de volúmenes anatómicos en WebGL
 * (three.js + @react-three/fiber; en iPhone vía expo-gl). Aprobado por el
 * usuario el 2026-11-15.
 *
 * - Se orbita con el dedo en CUALQUIER ángulo, como una cámara exterior:
 *   arrastre horizontal = girar, vertical = inclinar (±35°), con inercia.
 *   Sin botones. Arranca de tres cuartos para que se lea el volumen.
 * - Estilo de las SVG de referencia del usuario: relleno negro mate y
 *   contorno blanco (técnica de "casco invertido": una copia algo mayor,
 *   con caras traseras, dibuja la silueta en cualquier ángulo).
 * - Cada grupo muscular es su propio volumen y se colorea por las sesiones
 *   de esta semana: 1 verde · 2 naranja · 3+ violeta.
 * - Perfil: sexo (hombros/cadera/pecho) e IMC (anchura del tronco y
 *   grosor de extremidades) cambian las proporciones con suavidad.
 * - Colores del tema: fondo transparente, relleno p.card, piel p.bg,
 *   contorno p.text (funciona en Noche y Día).
 */
import { useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../theme-context';
import { heatColor, type Sex } from '../lib/heat';

type Group = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs';
type V3 = [number, number, number];

type Shape =
  | { type: 'ellipsoid'; r: V3 }
  | { type: 'lathe'; pts: [number, number][]; scale?: V3 };

/** Nodo de la figura: forma opcional + hijos en coordenadas locales. */
interface Node {
  pos: V3;
  rot?: V3;
  shape?: Shape;
  group?: Group; // sin grupo = piel
  children?: Node[];
}

/** Proporciones según sexo e IMC (cambios suaves, nunca caricatura). */
function proportions(sex: Sex, bmi: number | null) {
  const b = bmi && bmi > 10 && bmi < 60 ? bmi : 22;
  const female = sex === 'female';
  const fat = b > 25 ? Math.min(1, (b - 25) / 12) : 0;
  const thin = b < 18.5 ? Math.min(1, (18.5 - b) / 3.5) : 0;
  return {
    female,
    S: (female ? 0.88 : sex === 'male' ? 1 : 0.94) * (1 - 0.07 * thin), // hombros
    H: (female ? 1.1 : sex === 'male' ? 1 : 1.05) * (1 + 0.08 * fat - 0.05 * thin), // cadera
    W: 1 + 0.4 * fat - 0.08 * thin, // cintura
    L: 1 + 0.2 * fat - 0.16 * thin, // extremidades
  };
}

const ell = (r: V3): Shape => ({ type: 'ellipsoid', r });

/** Figura (frente hacia +z), altura ~1,8, pies en y = 0. */
function buildBody(sex: Sex, bmi: number | null): Node[] {
  const { female, S, H, W, L } = proportions(sex, bmi);
  const depth = 0.62 * (1 + 0.25 * (W - 1));
  // Tronco: superficie de revolución (radio por altura), sección ovalada.
  const torso: [number, number][] = [
    [0, 0.86], [0.12 * H, 0.87], [0.152 * H, 0.92], [0.148 * H, 0.98],
    [(female ? 0.118 : 0.128) * W, 1.06], [0.132 * W, 1.12], [0.148, 1.22],
    [female ? 0.158 : 0.168, 1.33], [0.172, 1.4], [0.15, 1.46], [0.09, 1.495], [0.05, 1.51], [0, 1.515],
  ];
  const body: Node[] = [
    // Cabeza y cuello
    { pos: [0, 1.67, 0], shape: ell([0.098, 0.122, 0.108]) },
    { pos: [0, 0, 0], shape: { type: 'lathe', pts: [[0, 1.48], [0.052, 1.49], [0.048, 1.56], [0.04, 1.6], [0, 1.61]] } },
    // Tronco
    { pos: [0, 0, 0], shape: { type: 'lathe', pts: torso, scale: [S, 1, depth] } },
    // Pecho
    ...([-1, 1] as const).map<Node>((s) =>
      female
        ? { pos: [s * 0.066 * S, 1.31, 0.092], shape: ell([0.062, 0.058, 0.032]), group: 'chest' }
        : { pos: [s * 0.074 * S, 1.335, 0.086], rot: [0, 0, s * -0.14], shape: ell([0.082 * S, 0.058, 0.03]), group: 'chest' },
    ),
    // Abdominales 2 × 3 + oblicuos
    ...[1.235, 1.165, 1.095].flatMap((y) =>
      ([-1, 1] as const).map<Node>((s) => ({ pos: [s * 0.034, y, 0.084 * (1 + 0.3 * (W - 1))], shape: ell([0.031, 0.028, 0.016]), group: 'core' })),
    ),
    ...([-1, 1] as const).map<Node>((s) => ({ pos: [s * 0.118 * S * W, 1.14, 0.035], rot: [0, s * 0.5, s * 0.08], shape: ell([0.028, 0.08, 0.05]), group: 'core' })),
    // Espalda: trapecio, dorsales, lumbar
    { pos: [0, 1.44, -0.055], shape: ell([0.115 * S, 0.05, 0.034]), group: 'back' },
    ...([-1, 1] as const).map<Node>((s) => ({ pos: [s * 0.094 * S, 1.24, -0.084], rot: [0, 0, s * 0.2], shape: ell([0.074 * S, 0.14, 0.028]), group: 'back' })),
    { pos: [0, 1.065, -0.079 * (1 + 0.3 * (W - 1))], shape: ell([0.058, 0.068, 0.02]), group: 'back' },
    // Glúteos
    ...([-1, 1] as const).map<Node>((s) => ({ pos: [s * 0.068 * H, 0.905, -0.072], shape: ell([0.072 * H, 0.078, 0.05]), group: 'legs' })),
  ];
  for (const s of [-1, 1] as const) {
    // Brazo: hombro → codo → muñeca (cada tramo cuelga de su articulación).
    body.push({
      pos: [s * 0.2 * S, 1.43, 0],
      children: [
        { pos: [s * 0.012, 0.005, 0], shape: ell([0.058 * S, 0.064, 0.06]), group: 'shoulders' },
        {
          pos: [0, -0.02, 0],
          rot: [0, 0, s * 0.11],
          children: [
            { pos: [0, 0, 0], shape: { type: 'lathe', pts: [[0, 0.02], [0.044 * L, 0], [0.047 * L, -0.08], [0.04 * L, -0.22], [0.036 * L, -0.28], [0, -0.3]] } },
            { pos: [0, -0.13, 0.036 * L], shape: ell([0.033 * L, 0.085, 0.024]), group: 'arms' },
            { pos: [0, -0.12, -0.036 * L], shape: ell([0.035 * L, 0.095, 0.024]), group: 'arms' },
            {
              pos: [0, -0.285, 0],
              rot: [0, 0, s * 0.06],
              children: [
                { pos: [0, 0, 0], shape: { type: 'lathe', pts: [[0, 0.015], [0.037 * L, 0], [0.039 * L, -0.06], [0.028 * L, -0.24], [0.024, -0.255], [0, -0.26]] } },
                { pos: [0, -0.09, 0.012], shape: ell([0.034 * L, 0.095, 0.028 * L]), group: 'arms' },
                { pos: [0, -0.3, 0.008], shape: ell([0.028, 0.05, 0.018]) },
              ],
            },
          ],
        },
      ],
    });
    // Pierna: cadera → rodilla → tobillo.
    body.push({
      pos: [s * 0.083 * H, 0.9, 0],
      rot: [0, 0, s * 0.025],
      children: [
        { pos: [0, 0, 0], shape: { type: 'lathe', pts: [[0, 0.03], [0.082 * L, 0], [0.08 * L, -0.12], [0.064 * L, -0.32], [0.052, -0.42], [0, -0.44]] } },
        { pos: [0, -0.18, 0.056 * L], shape: ell([0.064 * L, 0.15, 0.036]), group: 'legs' },
        { pos: [0, -0.2, -0.054 * L], shape: ell([0.06 * L, 0.14, 0.036]), group: 'legs' },
        {
          pos: [0, -0.43, 0],
          rot: [0, 0, s * -0.02],
          children: [
            { pos: [0, 0, 0], shape: { type: 'lathe', pts: [[0, 0.02], [0.05, 0], [0.058 * L, -0.11], [0.045 * L, -0.24], [0.03, -0.38], [0.026, -0.41], [0, -0.42]] } },
            { pos: [0, -0.12, -0.044 * L], shape: ell([0.042 * L, 0.095, 0.03]), group: 'legs' },
            { pos: [0, -0.44, 0.04], shape: ell([0.042, 0.028, 0.1]) },
          ],
        },
      ],
    });
  }
  return body;
}

const OUTLINE = 1.06; // grosor relativo del contorno blanco

function ShapeMesh({ shape, color, line, muscle }: { shape: Shape; color: string; line: string; muscle: boolean }) {
  const geo = useMemo(
    () =>
      shape.type === 'lathe'
        ? // Perfil siempre de abajo arriba: así las caras miran hacia fuera.
          new THREE.LatheGeometry([...shape.pts].sort((a, b) => a[1] - b[1]).map(([r, y]) => new THREE.Vector2(r, y)), 40)
        : new THREE.SphereGeometry(1, 32, 22),
    [shape],
  );
  const base: V3 = shape.type === 'lathe' ? shape.scale ?? [1, 1, 1] : shape.r;
  const k = shape.type === 'lathe' ? 1.035 : OUTLINE;
  const hull: V3 = shape.type === 'lathe' ? [base[0] * k, base[1], base[2] * k] : [base[0] * k, base[1] * k, base[2] * k];
  return (
    <>
      <mesh geometry={geo} scale={hull}>
        <meshBasicMaterial color={line} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={geo} scale={base}>
        <meshStandardMaterial color={color} roughness={muscle ? 0.5 : 0.78} metalness={0.06} emissive={muscle ? color : '#000000'} emissiveIntensity={muscle ? 0.1 : 0} />
      </mesh>
    </>
  );
}

function NodeView({ node, colorOf, line }: { node: Node; colorOf: (g?: Group) => string; line: string }) {
  return (
    <group position={node.pos} rotation={node.rot ?? [0, 0, 0]}>
      {node.shape ? <ShapeMesh shape={node.shape} color={colorOf(node.group)} line={line} muscle={!!node.group} /> : null}
      {node.children?.map((c, i) => <NodeView key={i} node={c} colorOf={colorOf} line={line} />)}
    </group>
  );
}

/** Aplica el giro (con inercia) al grupo del cuerpo en cada frame. */
function Rig({ yaw, pitch, vel, children }: { yaw: React.MutableRefObject<number>; pitch: React.MutableRefObject<number>; vel: React.MutableRefObject<number>; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    // Inercia: la velocidad de giro se apaga suavemente al soltar.
    if (Math.abs(vel.current) > 0.0001) {
      yaw.current += vel.current * dt * 60;
      vel.current *= Math.pow(0.88, dt * 60);
    }
    if (ref.current) {
      ref.current.rotation.y = yaw.current;
      ref.current.rotation.x = pitch.current;
    }
  });
  return (
    <group ref={ref} position={[0, -0.88, 0]}>
      {children}
    </group>
  );
}

export function Body3D({
  sex,
  bmi,
  counts,
  hint,
  legend,
  summary,
  height = 380,
}: {
  sex: Sex;
  bmi: number | null;
  counts: Record<string, number>;
  hint: string;
  legend: string;
  summary: string;
  height?: number;
}) {
  const { p } = useTheme();
  const nodes = useMemo(() => buildBody(sex, bmi), [sex, bmi]);
  const yaw = useRef(-0.45); // tres cuartos
  const pitch = useRef(0.06);
  const vel = useRef(0);
  const last = useRef({ dx: 0, dy: 0, t: 0 });

  // Arrastre: horizontal = girar (yaw), vertical = inclinar (pitch, ±35°).
  // Al soltar, el giro sigue con la velocidad del gesto y se apaga (Rig).
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          vel.current = 0;
          last.current = { dx: 0, dy: 0, t: Date.now() };
        },
        onPanResponderMove: (_, g) => {
          const ddx = g.dx - last.current.dx;
          const ddy = g.dy - last.current.dy;
          yaw.current += ddx * 0.012;
          pitch.current = Math.max(-0.6, Math.min(0.6, pitch.current + ddy * 0.008));
          const now = Date.now();
          vel.current = (0.5 * ddx * 0.012) / Math.max(1, (now - last.current.t) / 16.7);
          last.current = { dx: g.dx, dy: g.dy, t: now };
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  // Piel = fondo; músculo sin trabajar = gris medio (se lee la anatomía).
  const colorOf = (g?: Group) => (g ? heatColor(counts[g] ?? 0) ?? p.border : p.bg);

  return (
    <View style={[styles.wrap, { borderColor: p.border }]}>
      <View
        style={{ height }}
        {...pan.panHandlers}
        accessible
        accessibilityRole="image"
        accessibilityLabel={summary}
      >
        <Canvas camera={{ position: [0, 0.12, 3.05], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ flex: 1 }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[2, 3, 4]} intensity={1.6} />
          <directionalLight position={[-3, 1.5, -3]} intensity={0.9} />
          <Rig yaw={yaw} pitch={pitch} vel={vel}>
            {nodes.map((n, i) => (
              <NodeView key={i} node={n} colorOf={colorOf} line={p.text} />
            ))}
            {/* Sombra suave en el suelo */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
              <circleGeometry args={[0.24, 48]} />
              <meshBasicMaterial color={p.text} transparent opacity={0.05} />
            </mesh>
          </Rig>
        </Canvas>
      </View>
      <Text style={[styles.hint, { color: p.secondary }]}>{hint}</Text>
      <View style={styles.legend}>
        {[0, 1, 2, 3].map((n) => (
          <View key={n} style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: p.text, backgroundColor: heatColor(n) ?? p.card }]} />
            <Text style={[styles.legendText, { color: p.secondary }]}>{n === 3 ? '3+' : n}</Text>
          </View>
        ))}
        <Text style={[styles.legendText, { color: p.secondary, marginLeft: 4 }]}>{legend}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingTop: 8, paddingBottom: 16, paddingHorizontal: 8, marginTop: 4, overflow: 'hidden' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  legendText: { fontSize: 13 },
});
