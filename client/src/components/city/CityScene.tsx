"use client"

import { createContext, Fragment, useContext, useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { clamp, lerp, mulberry, smoothstep as ss, type Progress } from "./cityMath"

type Sm = MutableRefObject<number>
type V3 = [number, number, number]
interface WinUni {
    uLit: { value: number }
    uTime: { value: number }
    uDay: { value: number }
}

/* ------------------------------- palettes ---------------------------------- */

interface Pal {
    day: boolean
    buildings: string[]
    tierShift: number
    platform: string
    road: string
    roadMark: string
    roadMarkGlow: number
    sidewalk: string
    site: string
    siteBldg: string
    prop: string
    mast: string
    trunk: string
    hubTiers: string[]
    headColor: string
    poolOpacity: number
    patchBad: THREE.Color
    patchOk: THREE.Color
    drainBad: THREE.Color
    drainOk: THREE.Color
    treeDull: THREE.Color
    treeVivid: THREE.Color
    parkDull: THREE.Color
    parkVivid: THREE.Color
    lampOff: THREE.Color
    lampOn: THREE.Color
    ambient: [string, number]
    hemi: [string, string, number]
    sun: [string, number]
    rim: [string, number]
    particles: [string, number]
    exposure: number
    litBase: number
    litGain: number
    hubLight: number
    halo: number
    vehGlow: number
}

const col = (s: string) => new THREE.Color(s)

const NIGHT: Pal = {
    day: false,
    buildings: ["#2b3b5e", "#34476e", "#3d527c", "#243252", "#4a5d86", "#56627f", "#5a4f66", "#3b5568"],
    tierShift: 0.05,
    platform: "#18233f",
    road: "#0b1122",
    roadMark: "#d7c98a",
    roadMarkGlow: 0.18,
    sidewalk: "#2b3b62",
    site: "#5b5a50",
    siteBldg: "#3c5a8a",
    prop: "#27324d",
    mast: "#8a97b5",
    trunk: "#4a3a2a",
    hubTiers: ["#35508a", "#3d5c9c", "#4a6bb0"],
    headColor: "#ffd9a0",
    poolOpacity: 0.5,
    patchBad: col("#6a3320"),
    patchOk: col("#0b1122"),
    drainBad: col("#4a5a3a"),
    drainOk: col("#4fb0e0"),
    treeDull: col("#2f6b4f"),
    treeVivid: col("#46d17a"),
    parkDull: col("#1f4a3a"),
    parkVivid: col("#2b8a5a"),
    lampOff: col("#2a2a2a"),
    lampOn: col("#ffd9a0"),
    ambient: ["#8fa6dc", 0.45],
    hemi: ["#6f8fd8", "#0a1226", 0.5],
    sun: ["#ffdcbc", 1.7],
    rim: ["#6f8fff", 0.7],
    particles: ["#ffb070", 0.6],
    exposure: 1.1,
    litBase: 0.3,
    litGain: 0.32,
    hubLight: 1,
    halo: 1,
    vehGlow: 0.35,
}

const DAY: Pal = {
    day: true,
    buildings: ["#e6ebf2", "#d5dde8", "#c9d4e3", "#f0e9df", "#dfe6dd", "#cfd8e6", "#e8dccf", "#bfcfe0"],
    tierShift: -0.05,
    platform: "#b4c3d4",
    road: "#4a5260",
    roadMark: "#f5ecc0",
    roadMarkGlow: 0,
    sidewalk: "#d3dae4",
    site: "#a9a597",
    siteBldg: "#7a9cc8",
    prop: "#97a3b6",
    mast: "#5d6b85",
    trunk: "#5b4430",
    hubTiers: ["#9db8e0", "#86a8d8", "#6f97cf"],
    headColor: "#e8e2cf",
    poolOpacity: 0,
    patchBad: col("#8a5a3a"),
    patchOk: col("#4a5260"),
    drainBad: col("#7a8a5a"),
    drainOk: col("#4fb0e0"),
    treeDull: col("#3f7f55"),
    treeVivid: col("#2fae5e"),
    parkDull: col("#6f9e6a"),
    parkVivid: col("#4fbf6b"),
    lampOff: col("#5a5a5a"),
    lampOn: col("#fff1c9"),
    ambient: ["#ffffff", 0.85],
    hemi: ["#bfe0ff", "#8a9aa8", 0.75],
    sun: ["#fff0d2", 2.5],
    rim: ["#9ec5ff", 0.35],
    particles: ["#ffffff", 0.5],
    exposure: 1.2,
    litBase: 0,
    litGain: 0,
    hubLight: 0.35,
    halo: 0.45,
    vehGlow: 0.04,
}

const PalCtx = createContext<Pal>(NIGHT)
const usePal = () => useContext(PalCtx)

/* ----------------------------- layout constants ----------------------------- */

const S = 2.6 // block spacing
const ROADS = Array.from({ length: 8 }, (_, i) => (i - 3.5) * S)
const EXT = 20.8
const blockPos = (i: number) => (i - 3) * S

const PARK_BLOCKS: [number, number][] = [[1, 1], [5, 5], [2, 5], [4, 1]]
const SITE_BLOCKS: [number, number][] = [[5, 2], [1, 4]]
const inList = (list: [number, number][], i: number, j: number) => list.some(([a, b]) => a === i && b === j)

const SIDEWALK_BLOCKS: [number, number][] = (() => {
    const out: [number, number][] = []
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (!inList(PARK_BLOCKS, i, j) && !inList(SITE_BLOCKS, i, j)) out.push([i, j])
        }
    }
    return out
})()

const PALETTE_LEN = 8

const ORANGE = new THREE.Color("#ff7a1a")
const GREEN = new THREE.Color("#3ddc97")
const CAR_COLORS = ["#ff7a1a", "#f4f6fb", "#6fb1ff", "#ffd166", "#c8d2e6", "#e0566b"]
const BUS_COLORS = ["#2fae6f", "#ffbf3c", "#e8472f", "#3b82f6"]

const MARKERS = [
    { x: -3.9, z: 2.0 }, // damaged road
    { x: 2.6, z: -1.3 }, // blocked drain
    { x: -0.85, z: -3.45 }, // broken streetlight
    { x: 5.2, z: 3.9 }, // waste
]

const HUB_TOP = 3.45

const win = (a: number, b: number, c: number, d: number, p: number) => ss(a, b, p) * (1 - ss(c, d, p))
const easeBack = (x: number) => {
    const c1 = 1.1
    const c3 = c1 + 1
    const y = x - 1
    return 1 + c3 * y * y * y + c1 * y * y
}

interface Lot {
    x: number
    z: number
    w: number
    h: number
    d: number
    delay: number
    ci: number
    tier: boolean
}
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
                for (let k = 0; k < 7; k++) {
                    trees.push({ x: cx + (rnd() - 0.5) * 1.5, z: cz + (rnd() - 0.5) * 1.5, s: 0.7 + rnd() * 0.6 })
                }
                continue
            }
            if ((i === 3 && j === 3) || inList(SITE_BLOCKS, i, j)) continue
            const dist = Math.hypot(i - 3, j - 3)
            for (const a of [-1, 1]) {
                for (const b of [-1, 1]) {
                    if (rnd() < 0.12) continue
                    const w = 0.7 + rnd() * 0.25
                    const d = 0.7 + rnd() * 0.25
                    const h = 0.5 + rnd() * 1.6 + Math.max(0, 3 - dist) * 0.45
                    const delay = dist * 0.07 + rnd() * 0.12
                    const ci = Math.floor(rnd() * PALETTE_LEN)
                    lots.push({ x: cx + a * 0.5, z: cz + b * 0.5, w, d, h, delay, ci, tier: h > 1.9 })
                }
            }
        }
    }
    return { lots, trees }
}

/* ------------------------------ helper builders ----------------------------- */

function makeGlowTexture() {
    const c = document.createElement("canvas")
    c.width = c.height = 128
    const g = c.getContext("2d")!
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, "rgba(255,255,255,1)")
    grd.addColorStop(0.25, "rgba(255,255,255,0.45)")
    grd.addColorStop(1, "rgba(255,255,255,0)")
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
}

// Building material with procedural windows. Night: warm lit windows. Day: sky-blue glass.
function makeBuildingMaterial(uni: WinUni) {
    const m = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, metalness: 0.15 })
    m.onBeforeCompile = (shader) => {
        shader.uniforms.uLit = uni.uLit
        shader.uniforms.uTime = uni.uTime
        shader.uniforms.uDay = uni.uDay

        shader.vertexShader = shader.vertexShader
            .replace(
                "#include <common>",
                `#include <common>
                varying vec2 vWUv;
                varying float vSide;
                varying float vSeed;`
            )
            .replace(
                "#include <begin_vertex>",
                `#include <begin_vertex>
                vec3 isc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
                vec3 lp = position + 0.5;
                float nax = abs(normal.x);
                float naz = abs(normal.z);
                vSide = nax > 0.5 ? 2.0 : (naz > 0.5 ? 1.0 : 0.0);
                vWUv = nax > 0.5 ? vec2(lp.z * isc.z, lp.y * isc.y) : vec2(lp.x * isc.x, lp.y * isc.y);
                vSeed = fract(sin(dot(instanceMatrix[3].xz, vec2(12.9898, 78.233))) * 43758.5453);`
            )

        shader.fragmentShader = shader.fragmentShader
            .replace(
                "#include <common>",
                `#include <common>
                varying vec2 vWUv;
                varying float vSide;
                varying float vSeed;
                uniform float uLit;
                uniform float uTime;
                uniform float uDay;
                float h21(vec2 p) {
                    p = fract(p * vec2(123.34, 456.21));
                    p += dot(p, p + 45.32);
                    return fract(p.x * p.y);
                }`
            )
            .replace(
                "#include <color_fragment>",
                `#include <color_fragment>
                float winMask = 0.0;
                vec3 winEmit = vec3(0.0);
                if (vSide > 0.5) {
                    vec2 g = vWUv * vec2(4.0, 3.5);
                    vec2 cell = floor(g);
                    vec2 f = fract(g);
                    float inWin = step(0.2, f.x) * step(f.x, 0.8) * step(0.22, f.y) * step(f.y, 0.78);
                    inWin *= step(1.0, cell.y);
                    float r = h21(cell + vSeed * 37.0 + vSide * 11.0);
                    float lit = step(r, uLit);
                    float tw = 0.88 + 0.12 * sin(uTime * 2.0 + r * 60.0);
                    winMask = inWin;
                    vec3 nightGlass = vec3(0.035, 0.06, 0.12);
                    vec3 dayGlass = mix(vec3(0.3, 0.48, 0.66), vec3(0.5, 0.68, 0.82), r);
                    diffuseColor.rgb = mix(diffuseColor.rgb, mix(nightGlass, dayGlass, uDay), inWin * 0.9);
                    vec3 warm = mix(vec3(1.0, 0.78, 0.45), vec3(0.62, 0.82, 1.0), step(0.82, fract(r * 7.0)));
                    winEmit = warm * lit * inWin * tw * 1.7 * (1.0 - uDay);
                }`
            )
            .replace(
                "#include <roughnessmap_fragment>",
                `#include <roughnessmap_fragment>
                roughnessFactor = mix(roughnessFactor, 0.14, winMask);`
            )
            .replace(
                "#include <emissivemap_fragment>",
                `#include <emissivemap_fragment>
                totalEmissiveRadiance += winEmit;`
            )
    }
    m.customProgramCacheKey = () => "city-windows-v2"
    return m
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

        // gentle idle drift so the camera never feels frozen
        const time = still ? 0 : state.clock.elapsedTime
        const driftX = Math.sin(time * 0.25) * 0.18
        const driftY = Math.cos(time * 0.21) * 0.1

        state.camera.position.set(
            lerp(a.pos[0], b.pos[0], e) + driftX,
            lerp(a.pos[1], b.pos[1], e) + driftY,
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
    const pal = usePal()
    return (
        <group>
            <mesh position={[0, -0.32, 0]} receiveShadow>
                <boxGeometry args={[22.8, 0.6, 22.8]} />
                <meshStandardMaterial color={pal.platform} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.66, 0]}>
                <boxGeometry args={[23.2, 0.06, 23.2]} />
                <meshBasicMaterial color="#ff7a1a" toneMapped={false} />
            </mesh>
        </group>
    )
}

function Roads() {
    const pal = usePal()
    return (
        <group>
            {ROADS.map((r) => (
                <Fragment key={r}>
                    <mesh position={[r, 0.01, 0]} receiveShadow>
                        <boxGeometry args={[0.7, 0.04, EXT]} />
                        <meshStandardMaterial color={pal.road} roughness={0.95} />
                    </mesh>
                    <mesh position={[0, 0.012, r]} receiveShadow>
                        <boxGeometry args={[EXT, 0.04, 0.7]} />
                        <meshStandardMaterial color={pal.road} roughness={0.95} />
                    </mesh>
                </Fragment>
            ))}
        </group>
    )
}

function RoadMarks() {
    const pal = usePal()
    const ref = useRef<THREE.InstancedMesh>(null)
    const marks = useMemo(() => {
        const list: { x: number; z: number; rot: number }[] = []
        const near = (v: number) => ROADS.some((r) => Math.abs(v - r) < 0.55)
        for (const r of ROADS) {
            for (let v = -EXT / 2 + 0.4; v < EXT / 2 - 0.2; v += 0.5) {
                if (near(v)) continue
                list.push({ x: r, z: v, rot: Math.PI / 2 })
                list.push({ x: v, z: r, rot: 0 })
            }
        }
        return list
    }, [])

    useLayoutEffect(() => {
        const m = ref.current
        if (!m) return
        const d = new THREE.Object3D()
        marks.forEach((mk, i) => {
            d.position.set(mk.x, 0.034, mk.z)
            d.rotation.set(0, mk.rot, 0)
            d.updateMatrix()
            m.setMatrixAt(i, d.matrix)
        })
        m.instanceMatrix.needsUpdate = true
    }, [marks])

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, marks.length]} frustumCulled={false}>
            <boxGeometry args={[0.26, 0.004, 0.035]} />
            <meshStandardMaterial color={pal.roadMark} emissive={pal.roadMark} emissiveIntensity={pal.roadMarkGlow} roughness={0.8} />
        </instancedMesh>
    )
}

function Sidewalks() {
    const pal = usePal()
    const ref = useRef<THREE.InstancedMesh>(null)
    useLayoutEffect(() => {
        const m = ref.current
        if (!m) return
        const d = new THREE.Object3D()
        SIDEWALK_BLOCKS.forEach(([i, j], k) => {
            d.position.set(blockPos(i), 0.03, blockPos(j))
            d.updateMatrix()
            m.setMatrixAt(k, d.matrix)
        })
        m.instanceMatrix.needsUpdate = true
    }, [])
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, SIDEWALK_BLOCKS.length]} frustumCulled={false} receiveShadow>
            <boxGeometry args={[1.9, 0.06, 1.9]} />
            <meshStandardMaterial color={pal.sidewalk} roughness={0.95} />
        </instancedMesh>
    )
}

function Buildings({ lots, sm, uni }: { lots: Lot[]; sm: Sm; uni: WinUni }) {
    const pal = usePal()
    const baseRef = useRef<THREE.InstancedMesh>(null)
    const tierRef = useRef<THREE.InstancedMesh>(null)
    const propRef = useRef<THREE.InstancedMesh>(null)
    const mastRef = useRef<THREE.InstancedMesh>(null)
    const tipRef = useRef<THREE.InstancedMesh>(null)
    const tipMat = useRef<THREE.MeshBasicMaterial>(null)
    const last = useRef(-1)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    const tiers = useMemo(() => lots.filter((l) => l.tier), [lots])
    const flats = useMemo(() => lots.filter((l) => !l.tier), [lots])
    const material = useMemo(() => makeBuildingMaterial(uni), [uni])
    useEffect(() => () => material.dispose(), [material])

    useLayoutEffect(() => {
        const c = new THREE.Color()
        const base = baseRef.current
        if (base) {
            lots.forEach((l, i) => base.setColorAt(i, c.set(pal.buildings[l.ci])))
            if (base.instanceColor) base.instanceColor.needsUpdate = true
        }
        const tier = tierRef.current
        if (tier) {
            tiers.forEach((l, i) => {
                c.set(pal.buildings[l.ci]).offsetHSL(0, 0, pal.tierShift)
                tier.setColorAt(i, c)
            })
            if (tier.instanceColor) tier.instanceColor.needsUpdate = true
        }
    }, [lots, tiers, pal])

    const shape = (l: Lot, grow: number) => {
        const k = clamp(grow * 1.7 - l.delay)
        const e = easeBack(k)
        return { k, e, sy: Math.max(0.001, l.h * e) }
    }

    useFrame(({ clock }) => {
        // blinking aircraft warning lights
        if (tipMat.current) {
            const on = Math.sin(clock.elapsedTime * 3) > 0.2 ? 1 : 0.12
            tipMat.current.color.setRGB(on, on * 0.12, on * 0.12)
        }

        const base = baseRef.current
        const tier = tierRef.current
        const prop = propRef.current
        const mast = mastRef.current
        const tip = tipRef.current
        if (!base || !tier || !prop || !mast || !tip) return

        const grow = clamp(sm.current / 0.2)
        if (last.current >= 0 && Math.abs(grow - last.current) < 0.002) return
        last.current = grow

        dummy.rotation.set(0, 0, 0)

        lots.forEach((l, i) => {
            const { sy } = shape(l, grow)
            dummy.position.set(l.x, sy / 2, l.z)
            dummy.scale.set(l.w, sy, l.d)
            dummy.updateMatrix()
            base.setMatrixAt(i, dummy.matrix)
        })

        flats.forEach((l, i) => {
            const { k, sy } = shape(l, grow)
            const pk = Math.max(0.001, k)
            dummy.position.set(l.x + l.w * 0.15, sy + 0.06 * pk, l.z - l.d * 0.15)
            dummy.scale.set(0.22 * pk, 0.12 * pk, 0.2 * pk)
            dummy.updateMatrix()
            prop.setMatrixAt(i, dummy.matrix)
        })

        tiers.forEach((l, i) => {
            const { k, e, sy } = shape(l, grow)
            const th = Math.max(0.001, l.h * 0.28 * e)
            dummy.position.set(l.x, sy + th / 2, l.z)
            dummy.scale.set(l.w * 0.66, th, l.d * 0.66)
            dummy.updateMatrix()
            tier.setMatrixAt(i, dummy.matrix)

            const pk = Math.max(0.001, k)
            dummy.position.set(l.x, sy + th + 0.25 * pk, l.z)
            dummy.scale.set(1, 0.5 * pk, 1)
            dummy.updateMatrix()
            mast.setMatrixAt(i, dummy.matrix)

            dummy.position.set(l.x, sy + th + 0.5 * pk, l.z)
            dummy.scale.setScalar(pk)
            dummy.updateMatrix()
            tip.setMatrixAt(i, dummy.matrix)
        })

        base.instanceMatrix.needsUpdate = true
        tier.instanceMatrix.needsUpdate = true
        prop.instanceMatrix.needsUpdate = true
        mast.instanceMatrix.needsUpdate = true
        tip.instanceMatrix.needsUpdate = true
    })

    return (
        <>
            <instancedMesh ref={baseRef} args={[undefined, material, lots.length]} frustumCulled={false} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
            </instancedMesh>
            <instancedMesh ref={tierRef} args={[undefined, material, tiers.length]} frustumCulled={false} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
            </instancedMesh>
            <instancedMesh ref={propRef} args={[undefined, undefined, flats.length]} frustumCulled={false} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={pal.prop} roughness={0.9} />
            </instancedMesh>
            <instancedMesh ref={mastRef} args={[undefined, undefined, tiers.length]} frustumCulled={false}>
                <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
                <meshStandardMaterial color={pal.mast} roughness={0.5} metalness={0.5} />
            </instancedMesh>
            <instancedMesh ref={tipRef} args={[undefined, undefined, tiers.length]} frustumCulled={false}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial ref={tipMat} color="#ff2a2a" toneMapped={false} />
            </instancedMesh>
        </>
    )
}

function Parks({ trees, sm }: { trees: Tree[]; sm: Sm }) {
    const pal = usePal()
    const trunkRef = useRef<THREE.InstancedMesh>(null)
    const lowRef = useRef<THREE.InstancedMesh>(null)
    const upRef = useRef<THREE.InstancedMesh>(null)
    const groundRef = useRef<THREE.InstancedMesh>(null)
    const lowMat = useRef<THREE.MeshStandardMaterial>(null)
    const upMat = useRef<THREE.MeshStandardMaterial>(null)
    const groundMat = useRef<THREE.MeshStandardMaterial>(null)

    useLayoutEffect(() => {
        const d = new THREE.Object3D()
        const tint = new THREE.Color()
        const trunk = trunkRef.current
        const low = lowRef.current
        const up = upRef.current
        if (trunk && low && up) {
            trees.forEach((tr, i) => {
                d.rotation.set(0, tr.s * 7, 0)

                d.position.set(tr.x, tr.s * 0.17, tr.z)
                d.scale.setScalar(tr.s)
                d.updateMatrix()
                trunk.setMatrixAt(i, d.matrix)

                d.position.set(tr.x, tr.s * 0.72, tr.z)
                d.scale.setScalar(tr.s)
                d.updateMatrix()
                low.setMatrixAt(i, d.matrix)

                d.position.set(tr.x, tr.s * 1.08, tr.z)
                d.scale.setScalar(tr.s * 0.78)
                d.updateMatrix()
                up.setMatrixAt(i, d.matrix)

                const sh = 0.82 + (tr.s - 0.7) * 0.3
                tint.setRGB(sh, sh, sh)
                low.setColorAt(i, tint)
                up.setColorAt(i, tint)
            })
            trunk.instanceMatrix.needsUpdate = true
            low.instanceMatrix.needsUpdate = true
            up.instanceMatrix.needsUpdate = true
            if (low.instanceColor) low.instanceColor.needsUpdate = true
            if (up.instanceColor) up.instanceColor.needsUpdate = true
        }
        const g = groundRef.current
        if (g) {
            d.rotation.set(0, 0, 0)
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
        lowMat.current?.color.lerpColors(pal.treeDull, pal.treeVivid, fix)
        upMat.current?.color.lerpColors(pal.treeDull, pal.treeVivid, fix)
        groundMat.current?.color.lerpColors(pal.parkDull, pal.parkVivid, fix)
    })

    return (
        <>
            <instancedMesh ref={groundRef} args={[undefined, undefined, PARK_BLOCKS.length]} frustumCulled={false} receiveShadow>
                <boxGeometry args={[1.9, 0.05, 1.9]} />
                <meshStandardMaterial ref={groundMat} color={pal.parkDull} roughness={1} />
            </instancedMesh>
            <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} frustumCulled={false} castShadow>
                <cylinderGeometry args={[0.04, 0.05, 0.34, 6]} />
                <meshStandardMaterial color={pal.trunk} roughness={1} />
            </instancedMesh>
            <instancedMesh ref={lowRef} args={[undefined, undefined, trees.length]} frustumCulled={false} castShadow receiveShadow>
                <coneGeometry args={[0.34, 0.75, 8]} />
                <meshStandardMaterial ref={lowMat} color={pal.treeDull} roughness={0.9} />
            </instancedMesh>
            <instancedMesh ref={upRef} args={[undefined, undefined, trees.length]} frustumCulled={false} castShadow>
                <coneGeometry args={[0.26, 0.62, 8]} />
                <meshStandardMaterial ref={upMat} color={pal.treeDull} roughness={0.9} />
            </instancedMesh>
        </>
    )
}

function Lamps() {
    const pal = usePal()
    const polesRef = useRef<THREE.InstancedMesh>(null)
    const headsRef = useRef<THREE.InstancedMesh>(null)
    const poolsRef = useRef<THREE.InstancedMesh>(null)
    const glow = useMemo(() => makeGlowTexture(), [])
    useEffect(() => () => glow.dispose(), [glow])

    const points = useMemo(() => {
        const list: { x: number; z: number }[] = []
        for (let a = 0; a < 8; a++) {
            for (let b = 0; b < 8; b++) {
                if ((a + b) % 2 === 0) list.push({ x: ROADS[a] + 0.45, z: ROADS[b] + 0.45 })
            }
        }
        return list
    }, [])

    useLayoutEffect(() => {
        const d = new THREE.Object3D()
        points.forEach((pt, i) => {
            d.rotation.set(0, 0, 0)
            d.position.set(pt.x, 0.51, pt.z)
            d.updateMatrix()
            polesRef.current?.setMatrixAt(i, d.matrix)
            d.position.set(pt.x, 1.0, pt.z)
            d.updateMatrix()
            headsRef.current?.setMatrixAt(i, d.matrix)
            d.position.set(pt.x, 0.075, pt.z)
            d.rotation.set(-Math.PI / 2, 0, 0)
            d.updateMatrix()
            poolsRef.current?.setMatrixAt(i, d.matrix)
        })
        if (polesRef.current) polesRef.current.instanceMatrix.needsUpdate = true
        if (headsRef.current) headsRef.current.instanceMatrix.needsUpdate = true
        if (poolsRef.current) poolsRef.current.instanceMatrix.needsUpdate = true
    }, [points])

    return (
        <>
            <instancedMesh ref={polesRef} args={[undefined, undefined, points.length]} frustumCulled={false} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
                <meshStandardMaterial color="#39455f" />
            </instancedMesh>
            <instancedMesh ref={headsRef} args={[undefined, undefined, points.length]} frustumCulled={false}>
                <sphereGeometry args={[0.07, 10, 10]} />
                <meshBasicMaterial color={pal.headColor} toneMapped={false} />
            </instancedMesh>
            <instancedMesh ref={poolsRef} args={[undefined, undefined, points.length]} frustumCulled={false} visible={pal.poolOpacity > 0}>
                <circleGeometry args={[0.85, 24]} />
                <meshBasicMaterial
                    map={glow}
                    color="#ff9a4a"
                    transparent
                    opacity={pal.poolOpacity}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </instancedMesh>
        </>
    )
}

function Problems({ sm, still }: { sm: Sm; still: boolean }) {
    const pal = usePal()
    const markers = useRef<(THREE.Group | null)[]>([])
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

        patchMat.current?.color.lerpColors(pal.patchBad, pal.patchOk, fix)
        drainMat.current?.color.lerpColors(pal.drainBad, pal.drainOk, fix)
        markMatObject.color.lerpColors(ORANGE, GREEN, fix)
        if (waste.current) waste.current.scale.setScalar(Math.max(0.001, 1 - fix))

        if (brokenMat.current) {
            const on = fix > 0.4 ? 1 : show > 0.5 && Math.sin(t * 23) > 0.85 ? 0.8 : 0
            brokenMat.current.color.lerpColors(pal.lampOff, pal.lampOn, on)
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
            <mesh position={[-3.9, 0.04, 2.0]} receiveShadow>
                <boxGeometry args={[0.5, 0.04, 1.0]} />
                <meshStandardMaterial ref={patchMat} color={pal.patchBad} roughness={1} />
            </mesh>
            {/* blocked drain */}
            <mesh position={[2.6, 0.05, -1.3]} receiveShadow>
                <boxGeometry args={[1.0, 0.05, 0.45]} />
                <meshStandardMaterial ref={drainMat} color={pal.drainBad} roughness={0.6} />
            </mesh>
            {/* broken streetlight */}
            <mesh position={[-0.85, 0.51, -3.45]} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
                <meshStandardMaterial color="#39455f" />
            </mesh>
            <mesh position={[-0.85, 1.0, -3.45]}>
                <sphereGeometry args={[0.08, 10, 10]} />
                <meshBasicMaterial ref={brokenMat} color={pal.lampOff} toneMapped={false} />
            </mesh>
            {/* waste */}
            <group ref={waste} position={[5.2, 0.05, 3.9]}>
                {[
                    [0, 0.1, 0, 0.28],
                    [0.25, 0.08, 0.1, 0.2],
                    [-0.2, 0.09, -0.1, 0.22],
                    [0.05, 0.28, 0.05, 0.18],
                    [-0.3, 0.07, 0.25, 0.16],
                ].map(([x, y, z, s], i) => (
                    <mesh key={i} position={[x, y, z]} rotation={[0, i * 0.7, 0]} castShadow>
                        <boxGeometry args={[s, s, s]} />
                        <meshStandardMaterial color="#55604a" roughness={1} />
                    </mesh>
                ))}
            </group>

            {/* warning markers: orange, turn green after the fix */}
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
            <mesh ref={ring} position={[MARKERS[0].x, 0.09, MARKERS[0].z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.46, 48]} />
                <meshBasicMaterial ref={ringMat} color="#ff7a1a" transparent opacity={0} depthWrite={false} toneMapped={false} />
            </mesh>
        </group>
    )
}

const HUB_TIERS = [
    { y: 0.5, w: 1.6, h: 1.0 },
    { y: 1.65, w: 1.2, h: 1.3 },
    { y: 2.65, w: 0.85, h: 0.7 },
]

function Hub({ sm, still, uni }: { sm: Sm; still: boolean; uni: WinUni }) {
    const pal = usePal()
    const beacon = useRef<THREE.Mesh>(null)
    const halo = useRef<THREE.Sprite>(null)
    const haloMat = useRef<THREE.SpriteMaterial>(null)
    const light = useRef<THREE.PointLight>(null)
    const pulse = useRef<THREE.Mesh>(null)
    const pulseMat = useRef<THREE.MeshBasicMaterial>(null)
    const tower = useRef<THREE.InstancedMesh>(null)

    const material = useMemo(() => makeBuildingMaterial(uni), [uni])
    const glow = useMemo(() => makeGlowTexture(), [])
    useEffect(
        () => () => {
            material.dispose()
            glow.dispose()
        },
        [material, glow]
    )

    useLayoutEffect(() => {
        const m = tower.current
        if (!m) return
        const d = new THREE.Object3D()
        const c = new THREE.Color()
        HUB_TIERS.forEach((t, i) => {
            d.position.set(0, t.y, 0)
            d.scale.set(t.w, t.h, t.w)
            d.updateMatrix()
            m.setMatrixAt(i, d.matrix)
            c.set(pal.hubTiers[i])
            m.setColorAt(i, c)
        })
        m.instanceMatrix.needsUpdate = true
        if (m.instanceColor) m.instanceColor.needsUpdate = true
    }, [pal])

    useFrame(({ clock }) => {
        const p = sm.current
        const t = still ? 0 : clock.elapsedTime
        const w = win(0.56, 0.62, 0.86, 0.92, p)
        beacon.current?.scale.setScalar(0.14 + Math.sin(t * 5) * 0.03 * w + w * 0.05)
        if (halo.current) halo.current.scale.setScalar(1.1 + 2.0 * w + Math.sin(t * 4) * 0.12 * w)
        if (haloMat.current) haloMat.current.opacity = (0.5 + 0.4 * w) * pal.halo
        if (light.current) light.current.intensity = (3 + 40 * w) * pal.hubLight
        if (pulse.current && pulseMat.current) {
            const k = (t * 0.45) % 1
            pulse.current.scale.setScalar(1 + k * 6)
            pulseMat.current.opacity = (1 - k) * 0.7 * w
        }
    })

    return (
        <group>
            <instancedMesh ref={tower} args={[undefined, material, HUB_TIERS.length]} frustumCulled={false} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
            </instancedMesh>
            {/* glowing ring around the tower */}
            <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.72, 0.025, 8, 48]} />
                <meshBasicMaterial color="#ff7a1a" toneMapped={false} />
            </mesh>
            {/* crown */}
            <mesh position={[0, 3.075, 0]}>
                <boxGeometry args={[0.95, 0.15, 0.95]} />
                <meshStandardMaterial color="#ff7a1a" emissive="#ff7a1a" emissiveIntensity={0.8} />
            </mesh>
            {/* spire */}
            <mesh position={[0, 3.3, 0]}>
                <cylinderGeometry args={[0.015, 0.03, 0.4, 6]} />
                <meshStandardMaterial color="#9aa8c8" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh ref={beacon} position={[0, HUB_TOP, 0]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#ffb070" toneMapped={false} />
            </mesh>
            <sprite ref={halo} position={[0, HUB_TOP, 0]}>
                <spriteMaterial
                    ref={haloMat}
                    map={glow}
                    color="#ff9a4a"
                    transparent
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </sprite>
            <pointLight ref={light} position={[0, HUB_TOP, 0]} color="#ff7a1a" distance={9} intensity={3} />

            {/* broadcast pulse on the ground */}
            <mesh ref={pulse} position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 0.96, 64]} />
                <meshBasicMaterial ref={pulseMat} color="#ff7a1a" transparent opacity={0} depthWrite={false} toneMapped={false} />
            </mesh>
        </group>
    )
}

function Links({ sm }: { sm: Sm }) {
    const lines = useMemo(
        () =>
            MARKERS.map((m) => {
                const start = new THREE.Vector3(0, HUB_TOP, 0)
                const end = new THREE.Vector3(m.x, 2.4, m.z)
                const mid = start.clone().lerp(end, 0.5)
                mid.y += 2.2
                const pts = new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(40)
                const geo = new THREE.BufferGeometry().setFromPoints(pts)
                const mat = new THREE.LineBasicMaterial({ color: "#ff7a1a", transparent: true, opacity: 0, toneMapped: false })
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
    const pal = usePal()
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
                    <mesh position={[0, 0.03, 0]} receiveShadow>
                        <boxGeometry args={[1.9, 0.06, 1.9]} />
                        <meshStandardMaterial color={pal.site} roughness={1} />
                    </mesh>
                    <mesh
                        ref={(el) => {
                            bldg.current[i] = el
                        }}
                        position={[-0.2, 0.001, -0.2]}
                        castShadow
                    >
                        <boxGeometry args={[1.1, 2.2, 1.1]} />
                        <meshStandardMaterial color={pal.siteBldg} roughness={0.5} metalness={0.2} transparent opacity={0.9} />
                    </mesh>
                    <mesh position={[0.8, 1.5, 0.8]} castShadow>
                        <boxGeometry args={[0.14, 3, 0.14]} />
                        <meshStandardMaterial color="#ff7a1a" emissive="#ff7a1a" emissiveIntensity={0.3} />
                    </mesh>
                    <group
                        ref={(el) => {
                            arms.current[i] = el
                        }}
                        position={[0.8, 3, 0.8]}
                    >
                        <mesh position={[0.6, 0, 0]} castShadow>
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

/* ------------------------------ buses and cars ------------------------------ */

interface Veh {
    bus: boolean
    vertical: boolean
    lane: number
    off: number
    speed: number
    dir: number
    side: number
    color: string
}

function Vehicles({ buses, cars, still }: { buses: number; cars: number; still: boolean }) {
    const pal = usePal()
    const refs = useRef<(THREE.Group | null)[]>([])

    const list = useMemo<Veh[]>(() => {
        const total = buses + cars
        return Array.from({ length: total }, (_, i) => {
            const bus = i < buses
            const vertical = i % 2 === 0
            const dir = i % 4 < 2 ? 1 : -1
            const lane = ROADS[1 + ((i * 5) % 6)]
            const palette = bus ? BUS_COLORS : CAR_COLORS
            return {
                bus,
                vertical,
                lane,
                off: (i * 0.618034 + 0.07) % 1,
                speed: bus ? 0.026 : 0.036 + (i % 3) * 0.004,
                dir,
                // drive on the left, like in Bangladesh
                side: vertical ? dir * 0.15 : -dir * 0.15,
                color: palette[i % palette.length],
            }
        })
    }, [buses, cars])

    const geo = useMemo(
        () => ({
            busBody: new THREE.BoxGeometry(0.62, 0.17, 0.17),
            busWin: new THREE.BoxGeometry(0.56, 0.06, 0.178),
            busStripe: new THREE.BoxGeometry(0.62, 0.02, 0.172),
            busVent: new THREE.BoxGeometry(0.2, 0.02, 0.1),
            carBody: new THREE.BoxGeometry(0.34, 0.065, 0.17),
            carCabin: new THREE.BoxGeometry(0.19, 0.06, 0.15),
            carRoof: new THREE.BoxGeometry(0.19, 0.012, 0.15),
            busWheel: new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12),
            carWheel: new THREE.CylinderGeometry(0.032, 0.032, 0.03, 12),
            lamp: new THREE.BoxGeometry(0.012, 0.028, 0.04),
        }),
        []
    )

    const mats = useMemo(
        () => ({
            glass: new THREE.MeshStandardMaterial({ color: "#0d1830", emissive: "#ffd9a0", emissiveIntensity: pal.vehGlow, roughness: 0.2, metalness: 0.4 }),
            carGlass: new THREE.MeshStandardMaterial({ color: "#0d1830", roughness: 0.15, metalness: 0.5 }),
            wheel: new THREE.MeshStandardMaterial({ color: "#0a0d14", roughness: 0.9 }),
            stripe: new THREE.MeshStandardMaterial({ color: "#f4f6fb", roughness: 0.6 }),
            vent: new THREE.MeshStandardMaterial({ color: "#8a97b5", roughness: 0.6 }),
            head: new THREE.MeshBasicMaterial({ color: "#fff3c4", toneMapped: false }),
            tail: new THREE.MeshBasicMaterial({ color: "#ff3b3b", toneMapped: false }),
            bodies: list.map((v) => new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.4, metalness: 0.35 })),
        }),
        [list, pal.vehGlow]
    )

    useEffect(
        () => () => {
            Object.values(geo).forEach((g) => g.dispose())
        },
        [geo]
    )
    useEffect(
        () => () => {
            const { bodies, ...rest } = mats
            Object.values(rest).forEach((m) => m.dispose())
            bodies.forEach((m) => m.dispose())
        },
        [mats]
    )

    useFrame(({ clock }) => {
        const t = still ? 0 : clock.elapsedTime
        list.forEach((v, i) => {
            const g = refs.current[i]
            if (!g) return
            const u = (((v.off + t * v.speed * v.dir) % 1) + 1) % 1
            const pos = (u - 0.5) * (EXT - 1)
            if (v.vertical) {
                g.position.set(v.lane + v.side, 0.03, pos)
                g.rotation.y = -v.dir * (Math.PI / 2)
            } else {
                g.position.set(pos, 0.03, v.lane + v.side)
                g.rotation.y = v.dir > 0 ? 0 : Math.PI
            }
        })
    })

    return (
        <>
            {list.map((v, i) => (
                <group
                    key={i}
                    ref={(el) => {
                        refs.current[i] = el
                    }}
                >
                    {v.bus ? (
                        <>
                            <mesh geometry={geo.busBody} material={mats.bodies[i]} position={[0, 0.13, 0]} castShadow />
                            <mesh geometry={geo.busWin} material={mats.glass} position={[0, 0.17, 0]} />
                            <mesh geometry={geo.busStripe} material={mats.stripe} position={[0, 0.09, 0]} />
                            <mesh geometry={geo.busVent} material={mats.vent} position={[-0.1, 0.225, 0]} />
                            {[-0.2, 0.2].map((x) =>
                                [-0.09, 0.09].map((z) => (
                                    <mesh key={`${x}${z}`} geometry={geo.busWheel} material={mats.wheel} position={[x, 0.04, z]} rotation={[Math.PI / 2, 0, 0]} />
                                ))
                            )}
                            {[-0.055, 0.055].map((z) => (
                                <Fragment key={z}>
                                    <mesh geometry={geo.lamp} material={mats.head} position={[0.311, 0.09, z]} />
                                    <mesh geometry={geo.lamp} material={mats.tail} position={[-0.311, 0.09, z]} />
                                </Fragment>
                            ))}
                        </>
                    ) : (
                        <>
                            <mesh geometry={geo.carBody} material={mats.bodies[i]} position={[0, 0.08, 0]} castShadow />
                            <mesh geometry={geo.carCabin} material={mats.carGlass} position={[-0.03, 0.14, 0]} />
                            <mesh geometry={geo.carRoof} material={mats.bodies[i]} position={[-0.03, 0.176, 0]} />
                            {[-0.11, 0.11].map((x) =>
                                [-0.085, 0.085].map((z) => (
                                    <mesh key={`${x}${z}`} geometry={geo.carWheel} material={mats.wheel} position={[x, 0.032, z]} rotation={[Math.PI / 2, 0, 0]} />
                                ))
                            )}
                            {[-0.05, 0.05].map((z) => (
                                <Fragment key={z}>
                                    <mesh geometry={geo.lamp} material={mats.head} position={[0.171, 0.08, z]} />
                                    <mesh geometry={geo.lamp} material={mats.tail} position={[-0.171, 0.08, z]} />
                                </Fragment>
                            ))}
                        </>
                    )}
                </group>
            ))}
        </>
    )
}

function Particles({ count, still }: { count: number; still: boolean }) {
    const pal = usePal()
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
                <pointsMaterial size={0.07} color={pal.particles[0]} transparent opacity={pal.particles[1]} sizeAttenuation depthWrite={false} />
            </points>
        </group>
    )
}

/* ----------------------------------- world ---------------------------------- */

function World({ sm, lite, still }: { sm: Sm; lite: boolean; still: boolean }) {
    const pal = usePal()
    const group = useRef<THREE.Group>(null)
    const layout = useMemo(buildLayout, [])
    const uni = useMemo<WinUni>(() => ({ uLit: { value: 0.3 }, uTime: { value: 0 }, uDay: { value: 0 } }), [])

    useFrame(({ clock }) => {
        const g = group.current
        if (!g) return
        const p = sm.current
        g.rotation.y = (1 - ss(0, 0.28, p)) * 0.9 + ss(0.88, 1, p) * 0.6
        g.position.y = still ? 0 : Math.sin(clock.elapsedTime * 0.6) * 0.08

        // windows: slow twinkle, and more lights turn on once the city is fixed (night only)
        uni.uTime.value = still ? 0 : clock.elapsedTime
        uni.uLit.value = pal.litBase + pal.litGain * ss(0.72, 0.9, p)
        uni.uDay.value = pal.day ? 1 : 0
    })

    return (
        <group ref={group}>
            <Platform />
            <Roads />
            <RoadMarks />
            <Sidewalks />
            <Buildings lots={layout.lots} sm={sm} uni={uni} />
            <Parks trees={layout.trees} sm={sm} />
            <Lamps />
            <Problems sm={sm} still={still} />
            <Hub sm={sm} still={still} uni={uni} />
            <Links sm={sm} />
            <Cranes sm={sm} still={still} />
            <Vehicles buses={lite ? 3 : 6} cars={lite ? 4 : 12} still={still} />
        </group>
    )
}

function Environment({ pal, lite }: { pal: Pal; lite: boolean }) {
    const gl = useThree((s) => s.gl)
    const invalidate = useThree((s) => s.invalidate)
    useEffect(() => {
        gl.toneMappingExposure = pal.exposure
        invalidate()
    }, [gl, invalidate, pal])

    return (
        <>
            <ambientLight intensity={pal.ambient[1]} color={pal.ambient[0]} />
            <hemisphereLight args={[pal.hemi[0], pal.hemi[1], pal.hemi[2]]} />
            {/* key light (warm moon-ish at night, sun by day) with shadows */}
            <directionalLight
                position={[10, 16, 8]}
                intensity={pal.sun[1]}
                color={pal.sun[0]}
                castShadow={!lite}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-15}
                shadow-camera-right={15}
                shadow-camera-top={15}
                shadow-camera-bottom={-15}
                shadow-camera-near={1}
                shadow-camera-far={60}
                shadow-bias={-0.0004}
                shadow-normalBias={0.03}
            />
            {/* cool rim / fill light */}
            <directionalLight position={[-12, 7, -10]} intensity={pal.rim[1]} color={pal.rim[0]} />
        </>
    )
}

export default function CityScene({
    progress,
    lite,
    still,
    day = false,
}: {
    progress: MutableRefObject<Progress>
    lite: boolean
    still: boolean
    day?: boolean
}) {
    const sm = useRef(still ? 1 : 0)
    const pal = day ? DAY : NIGHT
    return (
        <PalCtx.Provider value={pal}>
            <Rig progress={progress} sm={sm} still={still} lite={lite} />
            <Environment pal={pal} lite={lite} />
            <World sm={sm} lite={lite} still={still} />
            <Particles count={lite ? 50 : 160} still={still} />
        </PalCtx.Provider>
    )
}