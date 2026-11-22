// cityScene.tsx

"use client"

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { clamp, lerp, mulberry, smoothstep as ss, type Progress } from "./cityMath"

type Sm = MutableRefObject<number>
type V3 = [number, number, number]

/* ----------------------------- layout constants ----------------------------- */

const S = 2.6 // block spacing
const ROADS = Array.from({ length: 8 }, (_, i) => (i - 3.5) * S)
const EXT = 20.8
const blockPos = (i: number) => (i - 3) * S

const PARK_BLOCKS: [number, number][] = [[1, 1], [5, 5], [2, 5], [4, 1]]
const SITE_BLOCKS: [number, number][] = [[5, 2], [1, 4]]
const inList = (list: [number, number][], i: number, j: number) => list.some(([a, b]) => a === i && b === j)

const PALETTE = ["#22304d", "#2a3b5e", "#31446a", "#1b2740", "#3a4f78", "#46567a"]

const ORANGE = new THREE.Color("#ff7a1a")
const GREEN = new THREE.Color("#3ddc97")
const PATCH_BAD = new THREE.Color("#6a3320")
const PATCH_OK = new THREE.Color("#0e1426")
const DRAIN_BAD = new THREE.Color("#4a5a3a")
const DRAIN_OK = new THREE.Color("#4fb0e0")
const TREE_DULL = new THREE.Color("#2f6b4f")
const TREE_VIVID = new THREE.Color("#46d17a")
const PARK_DULL = new THREE.Color("#1f4a3a")
const PARK_VIVID = new THREE.Color("#2b8a5a")
const LAMP_OFF = new THREE.Color("#2a2a2a")
const LAMP_ON = new THREE.Color("#ffd9a0")
const CAR_COLORS = ["#ff7a1a", "#f4f6fb", "#6fb1ff", "#ffd166"].map((c) => new THREE.Color(c))

const MARKERS = [
    { x: -3.9, z: 2.0 }, // damaged road
    { x: 2.6, z: -1.3 }, // blocked drain
    { x: -1.05, z: -3.65 }, // broken streetlight
    { x: 5.2, z: 3.9 }, // waste
]

const win = (a: number, b: number, c: number, d: number, p: number) => ss(a, b, p) * (1 - ss(c, d, p))

interface Lot { x: number; z: number; w: number; h: number; d: number; delay: number; color: THREE.Color }
interface Tree { x: number; z: number; s: number }

function buildLayout() {
    const rnd = mulberry(7)
    const lots: Lot[] = []
    const trees: Tree[] = []
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            const cx = blockPos(i)
            const cz = blockPos(j)
            if (inList(PARK_BLOCKS, i, j)) {
                for (let k = 0; k < 6; k++) {
                    trees.push({ x: cx + (rnd() - 0.5) * 1.5, z: cz + (rnd() - 0.5) * 1.5, s: 0.7 + rnd() * 0.6 })
                }
                continue
            }
            if ((i === 3 && j === 3) || inList(SITE_BLOCKS, i, j)) continue
            const dist = Math.hypot(i - 3, j - 3)
            for (const a of [-1, 1]) {
                for (const b of [-1, 1]) {
                    if (rnd() < 0.12) continue
                    lots.push({
                        x: cx + a * 0.5,
                        z: cz + b * 0.5,
                        w: 0.7 + rnd() * 0.25,
                        d: 0.7 + rnd() * 0.25,
                        h: 0.5 + rnd() * 1.6 + Math.max(0, 3 - dist) * 0.45,
                        delay: rnd() * 0.6,
                        color: new THREE.Color(PALETTE[Math.floor(rnd() * PALETTE.length)]),
                    })
                }
            }
        }
    }
    return { lots, trees }
}

/* --------------------------------- camera rig -------------------------------- */

interface Key { p: number; pos: V3; look: V3 }
const KEYS: Key[] = [
    { p: 0, pos: [15, 11, 17], look: [0, 0.5, 0] },
    { p: 0.14, pos: [12, 8.5, 13], look: [0, 0.5, 0] },
    { p: 0.28, pos: [8, 7, 10], look: [0, 0.3, 0] },
    { p: 0.37, pos: [5, 6.5, 7], look: [3.5, 0, 1] },
    { p: 0.46, pos: [-3.5, 5.5, 8], look: [-3.9, 0, 1] },
    { p: 0.58, pos: [-2.5, 4.5, 6.5], look: [-3.9, 0, 1.5] },
    { p: 0.72, pos: [0.5, 13, 4], look: [0, 0, 0] },
    { p: 0.8, pos: [10, 6, 2], look: [5.2, 0, -2.6] },
    { p: 0.88, pos: [-8, 6, 6], look: [-5.2, 0.5, 2.6] },
    { p: 1, pos: [17, 13, 19], look: [0, 0, 0] },
]

function Rig({ progress, sm, still, lite }: { progress: MutableRefObject<Progress>; sm: Sm; still: boolean; lite: boolean }) {
    const look = useMemo(() => new THREE.Vector3(), [])
    useFrame((state, dt) => {
        const target = still ? 1 : progress.current.value
        sm.current += (target - sm.current) * Math.min(1, dt * 4)
        const p = sm.current

        let i = 0
        while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++
        const a = KEYS[i]
        const b = KEYS[i + 1]
        const t = clamp((p - a.p) / (b.p - a.p))
        const e = (t * t * (3 - 2 * t)) * 0.5 + t * 0.5

        const intro = 1 - ss(0.02, 0.28, p)
        const dy = lite ? -2.2 : 0
        const hx = lite ? 0 : -3.4 * intro // city sits on the right while the headline is on the left
        const hy = lite ? -1.3 * intro : 0 // city sits in the upper part on phones

        state.camera.position.set(
            lerp(a.pos[0], b.pos[0], e),
            lerp(a.pos[1], b.pos[1], e),
            lerp(a.pos[2], b.pos[2], e)
        )
        look.set(
            lerp(a.look[0], b.look[0], e) + hx,
            lerp(a.look[1], b.look[1], e) + dy + hy,
            lerp(a.look[2], b.look[2], e)
        )
        state.camera.lookAt(look)
    }, -1)
    return null
}

/* ---------------------------------- parts ----------------------------------- */

function Platform() {
    return (
        <group>
            <mesh position={[0, -0.32, 0]}>
                <boxGeometry args={[22.8, 0.6, 22.8]} />
                <meshStandardMaterial color="#18233f" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.66, 0]}>
                <boxGeometry args={[23.2, 0.06, 23.2]} />
                <meshBasicMaterial color="#ff7a1a" />
            </mesh>
        </group>
    )
}

function Roads() {
    return (
        <group>
            {ROADS.map((r) => (
                <Fragment key={r}>
                    <mesh position={[r, 0.01, 0]}>
                        <boxGeometry args={[0.7, 0.04, EXT]} />
                        <meshStandardMaterial color="#0e1426" roughness={0.95} />
                    </mesh>
                    <mesh position={[0, 0.012, r]}>
                        <boxGeometry args={[EXT, 0.04, 0.7]} />
                        <meshStandardMaterial color="#0e1426" roughness={0.95} />
                    </mesh>
                </Fragment>
            ))}
        </group>
    )
}

function Buildings({ lots, sm }: { lots: Lot[]; sm: Sm }) {
    const ref = useRef<THREE.InstancedMesh>(null)
    const last = useRef(-1)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    useLayoutEffect(() => {
        const m = ref.current
        if (!m) return
        lots.forEach((l, i) => m.setColorAt(i, l.color))
        if (m.instanceColor) m.instanceColor.needsUpdate = true
    }, [lots])

    useFrame(() => {
        const m = ref.current
        if (!m) return
        const grow = clamp(sm.current / 0.2)
        if (last.current >= 0 && Math.abs(grow - last.current) < 0.002) return
        last.current = grow
        lots.forEach((l, i) => {
            const k = clamp(grow * 1.6 - l.delay)
            const sy = Math.max(0.001, l.h * (k * k * (3 - 2 * k)))
            dummy.position.set(l.x, sy / 2, l.z)
            dummy.scale.set(l.w, sy, l.d)
            dummy.updateMatrix()
            m.setMatrixAt(i, dummy.matrix)
        })
        m.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, lots.length]} frustumCulled={false}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.65} metalness={0.1} />
        </instancedMesh>
    )
}

function Parks({ trees, sm }: { trees: Tree[]; sm: Sm }) {
    const treesRef = useRef<THREE.InstancedMesh>(null)
    const groundRef = useRef<THREE.InstancedMesh>(null)
    const treeMat = useRef<THREE.MeshStandardMaterial>(null)
    const groundMat = useRef<THREE.MeshStandardMaterial>(null)

    useLayoutEffect(() => {
        const d = new THREE.Object3D()
        const t = treesRef.current
        if (t) {
            trees.forEach((tr, i) => {
                d.position.set(tr.x, tr.s * 0.45, tr.z)
                d.scale.setScalar(tr.s)
                d.updateMatrix()
                t.setMatrixAt(i, d.matrix)
            })
            t.instanceMatrix.needsUpdate = true
        }
        const g = groundRef.current
        if (g) {
            PARK_BLOCKS.forEach(([i, j], k) => {
                d.position.set(blockPos(i), 0.02, blockPos(j))
                d.scale.set(1, 1, 1)
                d.updateMatrix()
                g.setMatrixAt(k, d.matrix)
            })
            g.instanceMatrix.needsUpdate = true
        }
    }, [trees])

    useFrame(() => {
        const fix = ss(0.72, 0.88, sm.current)
        treeMat.current?.color.lerpColors(TREE_DULL, TREE_VIVID, fix)
        groundMat.current?.color.lerpColors(PARK_DULL, PARK_VIVID, fix)
    })

    return (
        <>
            <instancedMesh ref={groundRef} args={[undefined, undefined, PARK_BLOCKS.length]} frustumCulled={false}>
                <boxGeometry args={[2, 0.05, 2]} />
                <meshStandardMaterial ref={groundMat} color="#1f4a3a" roughness={1} />
            </instancedMesh>
            <instancedMesh ref={treesRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
                <coneGeometry args={[0.32, 0.95, 7]} />
                <meshStandardMaterial ref={treeMat} color="#2f6b4f" roughness={0.9} />
            </instancedMesh>
        </>
    )
}

function Lamps() {
    const polesRef = useRef<THREE.InstancedMesh>(null)
    const headsRef = useRef<THREE.InstancedMesh>(null)
    const points = useMemo(() => {
        const list: { x: number; z: number }[] = []
        for (let a = 0; a < 8; a++) {
            for (let b = 0; b < 8; b++) {
                if ((a + b) % 2 === 0) list.push({ x: ROADS[a] + 0.25, z: ROADS[b] + 0.25 })
            }
        }
        return list
    }, [])

    useLayoutEffect(() => {
        const d = new THREE.Object3D()
        points.forEach((pt, i) => {
            d.position.set(pt.x, 0.45, pt.z)
            d.updateMatrix()
            polesRef.current?.setMatrixAt(i, d.matrix)
            d.position.set(pt.x, 0.95, pt.z)
            d.updateMatrix()
            headsRef.current?.setMatrixAt(i, d.matrix)
        })
        if (polesRef.current) polesRef.current.instanceMatrix.needsUpdate = true
        if (headsRef.current) headsRef.current.instanceMatrix.needsUpdate = true
    }, [points])

    return (
        <>
            <instancedMesh ref={polesRef} args={[undefined, undefined, points.length]} frustumCulled={false}>
                <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
                <meshStandardMaterial color="#39455f" />
            </instancedMesh>
            <instancedMesh ref={headsRef} args={[undefined, undefined, points.length]} frustumCulled={false}>
                <sphereGeometry args={[0.07, 10, 10]} />
                <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
            </instancedMesh>
        </>
    )
}

function Problems({ sm, still }: { sm: Sm; still: boolean }) {
    const markers = useRef<(THREE.Group | null)[]>([])
    const markMat = useRef<THREE.MeshBasicMaterial>(null)
    const patchMat = useRef<THREE.MeshStandardMaterial>(null)
    const drainMat = useRef<THREE.MeshStandardMaterial>(null)
    const brokenMat = useRef<THREE.MeshBasicMaterial>(null)
    const ringMat = useRef<THREE.MeshBasicMaterial>(null)
    const ring = useRef<THREE.Mesh>(null)
    const waste = useRef<THREE.Group>(null)
    const markMatObject = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ff7a1a", toneMapped: false }), [])
    useEffect(() => () => markMatObject.dispose(), [markMatObject])

    useFrame(({ clock }) => {
        const p = sm.current
        const t = still ? 0 : clock.elapsedTime
        const show = ss(0.28, 0.36, p) * (1 - ss(0.93, 1, p))
        const fix = ss(0.72, 0.88, p)

        patchMat.current?.color.lerpColors(PATCH_BAD, PATCH_OK, fix)
        drainMat.current?.color.lerpColors(DRAIN_BAD, DRAIN_OK, fix)
        markMatObject.color.lerpColors(ORANGE, GREEN, fix)
        if (waste.current) waste.current.scale.setScalar(Math.max(0.001, 1 - fix))

        if (brokenMat.current) {
            const on = fix > 0.4 ? 1 : show > 0.5 && Math.sin(t * 23) > 0.85 ? 0.8 : 0
            brokenMat.current.color.lerpColors(LAMP_OFF, LAMP_ON, on)
        }

        markers.current.forEach((g, i) => {
            if (!g) return
            g.scale.setScalar(Math.max(0.001, show))
            g.position.y = Math.sin(t * 2 + i) * 0.08
            g.rotation.y = t * 0.8
        })

        if (ring.current && ringMat.current) {
            const w = win(0.44, 0.48, 0.58, 0.62, p)
            const k = (t * 0.7) % 1
            ring.current.scale.setScalar(0.6 + k * 3.2)
            ringMat.current.opacity = (1 - k) * 0.9 * w
        }
    })

    return (
        <group>
            {/* damaged road */}
            <mesh position={[-3.9, 0.04, 2.0]}>
                <boxGeometry args={[0.5, 0.04, 1.0]} />
                <meshStandardMaterial ref={patchMat} color="#6a3320" roughness={1} />
            </mesh>
            {/* blocked drain */}
            <mesh position={[2.6, 0.05, -1.3]}>
                <boxGeometry args={[1.0, 0.05, 0.45]} />
                <meshStandardMaterial ref={drainMat} color="#4a5a3a" roughness={0.6} />
            </mesh>
            {/* broken streetlight */}
            <mesh position={[-1.05, 0.45, -3.65]}>
                <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
                <meshStandardMaterial color="#39455f" />
            </mesh>
            <mesh position={[-1.05, 0.95, -3.65]}>
                <sphereGeometry args={[0.08, 10, 10]} />
                <meshBasicMaterial ref={brokenMat} color="#2a2a2a" toneMapped={false} />
            </mesh>
            {/* waste */}
            <group ref={waste} position={[5.2, 0, 3.9]}>
                {[
                    [0, 0.1, 0, 0.28],
                    [0.25, 0.08, 0.1, 0.2],
                    [-0.2, 0.09, -0.1, 0.22],
                    [0.05, 0.28, 0.05, 0.18],
                    [-0.3, 0.07, 0.25, 0.16],
                ].map(([x, y, z, s], i) => (
                    <mesh key={i} position={[x, y, z]}>
                        <boxGeometry args={[s, s, s]} />
                        <meshStandardMaterial color="#55604a" roughness={1} />
                    </mesh>
                ))}
            </group>

            {/* warning markers: orange, turn green after the fix */}
            <meshBasicMaterial ref={markMat} color="#ff7a1a" toneMapped={false} attach="__none" />
            {MARKERS.map((m, i) => (
                <group key={i} position={[m.x, 0, m.z]}>
                    <group
                        ref={(el) => {
                            markers.current[i] = el
                        }}
                    >
                        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[0.35, 0.04, 8, 32]} />
                            <primitive object={markMatObject} attach="material" />
                        </mesh>
                        <mesh position={[0, 1.2, 0]}>
                            <cylinderGeometry args={[0.03, 0.03, 2.2, 8]} />
                            <primitive object={markMatObject} attach="material" />
                        </mesh>
                        <mesh position={[0, 2.35, 0]}>
                            <sphereGeometry args={[0.14, 12, 12]} />
                            <primitive object={markMatObject} attach="material" />
                        </mesh>
                    </group>
                </group>
            ))}

            {/* report ripple at the road problem */}
            <mesh ref={ring} position={[MARKERS[0].x, 0.08, MARKERS[0].z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.46, 48]} />
                <meshBasicMaterial ref={ringMat} color="#ff7a1a" transparent opacity={0} depthWrite={false} />
            </mesh>
        </group>
    )
}

function Hub({ sm, still }: { sm: Sm; still: boolean }) {
    const beacon = useRef<THREE.Mesh>(null)
    const light = useRef<THREE.PointLight>(null)

    useFrame(({ clock }) => {
        const p = sm.current
        const t = still ? 0 : clock.elapsedTime
        const w = win(0.56, 0.62, 0.86, 0.92, p)
        beacon.current?.scale.setScalar(0.16 + Math.sin(t * 5) * 0.04 * w + w * 0.06)
        if (light.current) light.current.intensity = 3 + 40 * w
    })

    return (
        <group>
            <mesh position={[0, 1.3, 0]}>
                <boxGeometry args={[1.3, 2.6, 1.3]} />
                <meshStandardMaterial color="#2c4170" roughness={0.5} />
            </mesh>
            <mesh position={[0, 2.75, 0]}>
                <boxGeometry args={[0.9, 0.3, 0.9]} />
                <meshStandardMaterial color="#ff7a1a" emissive="#ff7a1a" emissiveIntensity={0.6} />
            </mesh>
            <mesh ref={beacon} position={[0, 3.2, 0]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#ffb070" toneMapped={false} />
            </mesh>
            <pointLight ref={light} position={[0, 3.2, 0]} color="#ff7a1a" distance={9} intensity={3} />
        </group>
    )
}

function Links({ sm }: { sm: Sm }) {
    const lines = useMemo(
        () =>
            MARKERS.map((m) => {
                const start = new THREE.Vector3(0, 3.2, 0)
                const end = new THREE.Vector3(m.x, 2.4, m.z)
                const mid = start.clone().lerp(end, 0.5)
                mid.y += 2.2
                const pts = new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(40)
                const geo = new THREE.BufferGeometry().setFromPoints(pts)
                const mat = new THREE.LineBasicMaterial({ color: "#ff7a1a", transparent: true, opacity: 0 })
                return new THREE.Line(geo, mat)
            }),
        []
    )

    useEffect(
        () => () => {
            lines.forEach((l) => {
                l.geometry.dispose()
                    ; (l.material as THREE.Material).dispose()
            })
        },
        [lines]
    )

    useFrame(() => {
        const p = sm.current
        const draw = ss(0.58, 0.68, p)
        const fade = 1 - ss(0.84, 0.9, p)
        lines.forEach((l) => {
            l.geometry.setDrawRange(0, Math.floor(41 * draw))
                ; (l.material as THREE.LineBasicMaterial).opacity = fade * 0.9
        })
    })

    return (
        <>
            {lines.map((l, i) => (
                <primitive key={i} object={l} />
            ))}
        </>
    )
}

function Cranes({ sm, still }: { sm: Sm; still: boolean }) {
    const sites = useRef<(THREE.Group | null)[]>([])
    const arms = useRef<(THREE.Group | null)[]>([])
    const bldg = useRef<(THREE.Mesh | null)[]>([])

    useFrame(({ clock }) => {
        const p = sm.current
        const t = still ? 0 : clock.elapsedTime
        const on = ss(0.58, 0.68, p)
        const rise = ss(0.66, 0.9, p)
        SITE_BLOCKS.forEach((_, i) => {
            const dir = i === 0 ? 1 : -1
            sites.current[i]?.scale.setScalar(Math.max(0.001, on))
            const arm = arms.current[i]
            if (arm) arm.rotation.y = still ? 0.6 * dir : t * 0.5 * dir
            const b = bldg.current[i]
            if (b) {
                b.scale.y = Math.max(0.001, rise)
                b.position.y = rise * 1.1
            }
        })
    })

    return (
        <>
            {SITE_BLOCKS.map(([bi, bj], i) => (
                <group
                    key={i}
                    ref={(el) => {
                        sites.current[i] = el
                    }}
                    position={[blockPos(bi), 0, blockPos(bj)]}
                >
                    <mesh position={[0, 0.03, 0]}>
                        <boxGeometry args={[1.9, 0.06, 1.9]} />
                        <meshStandardMaterial color="#5b5a50" roughness={1} />
                    </mesh>
                    <mesh
                        ref={(el) => {
                            bldg.current[i] = el
                        }}
                        position={[-0.2, 0.001, -0.2]}
                    >
                        <boxGeometry args={[1.1, 2.2, 1.1]} />
                        <meshStandardMaterial color="#3c5a8a" roughness={0.6} transparent opacity={0.9} />
                    </mesh>
                    <mesh position={[0.8, 1.5, 0.8]}>
                        <boxGeometry args={[0.14, 3, 0.14]} />
                        <meshStandardMaterial color="#ff7a1a" emissive="#ff7a1a" emissiveIntensity={0.3} />
                    </mesh>
                    <group
                        ref={(el) => {
                            arms.current[i] = el
                        }}
                        position={[0.8, 3, 0.8]}
                    >
                        <mesh position={[0.6, 0, 0]}>
                            <boxGeometry args={[2, 0.1, 0.1]} />
                            <meshStandardMaterial color="#ff7a1a" emissive="#ff7a1a" emissiveIntensity={0.3} />
                        </mesh>
                        <mesh position={[-0.5, 0, 0]}>
                            <boxGeometry args={[0.4, 0.25, 0.25]} />
                            <meshStandardMaterial color="#39455f" />
                        </mesh>
                        <mesh position={[1.4, -0.3, 0]}>
                            <boxGeometry args={[0.02, 0.6, 0.02]} />
                            <meshStandardMaterial color="#d6dbe8" />
                        </mesh>
                    </group>
                </group>
            ))}
        </>
    )
}

interface Car { vertical: boolean; lane: number; off: number; speed: number; dir: number; side: number }

function Cars({ count, still }: { count: number; still: boolean }) {
    const ref = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const cars = useMemo<Car[]>(() => {
        const rnd = mulberry(21)
        return Array.from({ length: count }, (_, i) => ({
            vertical: i % 2 === 0,
            lane: ROADS[1 + Math.floor(rnd() * 6)],
            off: rnd(),
            speed: 0.03 + rnd() * 0.03,
            dir: rnd() < 0.5 ? 1 : -1,
            side: rnd() < 0.5 ? -0.17 : 0.17,
        }))
    }, [count])

    useLayoutEffect(() => {
        const m = ref.current
        if (!m) return
        cars.forEach((_, i) => m.setColorAt(i, CAR_COLORS[i % CAR_COLORS.length]))
        if (m.instanceColor) m.instanceColor.needsUpdate = true
    }, [cars])

    useFrame(({ clock }) => {
        const m = ref.current
        if (!m) return
        const t = still ? 0 : clock.elapsedTime
        cars.forEach((c, i) => {
            const u = (((c.off + t * c.speed * c.dir) % 1) + 1) % 1
            const pos = (u - 0.5) * (EXT - 1)
            if (c.vertical) {
                dummy.position.set(c.lane + c.side, 0.1, pos)
                dummy.rotation.y = Math.PI / 2
            } else {
                dummy.position.set(pos, 0.1, c.lane + c.side)
                dummy.rotation.y = 0
            }
            dummy.updateMatrix()
            m.setMatrixAt(i, dummy.matrix)
        })
        m.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
            <boxGeometry args={[0.34, 0.14, 0.17]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </instancedMesh>
    )
}

function Particles({ count, still }: { count: number; still: boolean }) {
    const group = useRef<THREE.Group>(null)
    const positions = useMemo(() => {
        const rnd = mulberry(99)
        const arr = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            arr[i * 3] = (rnd() - 0.5) * 34
            arr[i * 3 + 1] = rnd() * 14
            arr[i * 3 + 2] = (rnd() - 0.5) * 34
        }
        return arr
    }, [count])

    useFrame((_, dt) => {
        if (!still && group.current) group.current.rotation.y += dt * 0.02
    })

    return (
        <group ref={group}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.07} color="#ffb070" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
            </points>
        </group>
    )
}

/* ----------------------------------- world ---------------------------------- */

function World({ sm, lite, still }: { sm: Sm; lite: boolean; still: boolean }) {
    const group = useRef<THREE.Group>(null)
    const layout = useMemo(buildLayout, [])

    useFrame(({ clock }) => {
        const g = group.current
        if (!g) return
        const p = sm.current
        g.rotation.y = (1 - ss(0, 0.28, p)) * 0.9 + ss(0.88, 1, p) * 0.6
        g.position.y = still ? 0 : Math.sin(clock.elapsedTime * 0.6) * 0.08
    })

    return (
        <group ref={group}>
            <Platform />
            <Roads />
            <Buildings lots={layout.lots} sm={sm} />
            <Parks trees={layout.trees} sm={sm} />
            <Lamps />
            <Problems sm={sm} still={still} />
            <Hub sm={sm} still={still} />
            <Links sm={sm} />
            <Cranes sm={sm} still={still} />
            <Cars count={lite ? 6 : 14} still={still} />
        </group>
    )
}

export default function CityScene({
    progress,
    lite,
    still,
}: {
    progress: MutableRefObject<Progress>
    lite: boolean
    still: boolean
}) {
    const sm = useRef(still ? 1 : 0)
    return (
        <>
            <Rig progress={progress} sm={sm} still={still} lite={lite} />
            <ambientLight intensity={0.6} color="#9db2e0" />
            <directionalLight position={[10, 16, 8]} intensity={1.9} color="#ffe9d2" />
            <hemisphereLight args={["#6f8fd8", "#0a1226", 0.4]} />
            <World sm={sm} lite={lite} still={still} />
            <Particles count={lite ? 50 : 160} still={still} />
        </>
    )
}