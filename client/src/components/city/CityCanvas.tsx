// cityCanvas.tsx

"use client"

import type { MutableRefObject } from "react"
import { Canvas } from "@react-three/fiber"
import CityScene from "./CityScene"
import type { Progress } from "./cityMath"

interface Props {
  progress: MutableRefObject<Progress>
  lite: boolean
  still: boolean // reduced motion: render once at the final state
  active: boolean // false when the stage is off screen: pause rendering
}

const CityCanvas = ({ progress, lite, still, active }: Props) => (
  <Canvas
    dpr={lite ? [1, 1.25] : [1, 1.75]}
    frameloop={still ? "demand" : active ? "always" : "never"}
    gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
    camera={{ fov: lite ? 52 : 38, near: 0.1, far: 90, position: [15, 11, 17] }}
  >
    <fog attach="fog" args={["#050b1a", 22, 60]} />
    <CityScene progress={progress} lite={lite} still={still} />
  </Canvas>
)

export default CityCanvas