import { A, Route, Router } from "@solidjs/router"
import type { ParentProps } from "solid-js"
import * as THREE from "three"
import { Canvas, createT } from "../src/index.ts"
import { SimplePortal } from "./examples/SimplePortal.tsx"
import { SimpleSolarExample } from "./examples/SimpleSolar.tsx"
import "./index.css"

const T = createT(THREE)

function Layout(props: ParentProps) {
  return (
    <>
      <nav
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          "z-index": 1000,
          background: "rgba(0, 0, 0, 0.8)",
          padding: "10px",
          "border-radius": "8px",
        }}
      >
        <A
          href="/"
          style={{
            color: "white",
            "text-decoration": "none",
            padding: "5px 10px",
            display: "block",
          }}
        >
          Home
        </A>
        <A
          href="/simple-solar"
          style={{
            color: "white",
            "text-decoration": "none",
            padding: "5px 10px",
            display: "block",
          }}
        >
          Simple Solar
        </A>
        <A
          href="/portal"
          style={{
            color: "white",
            "text-decoration": "none",
            padding: "5px 10px",
            display: "block",
          }}
        >
          Portal
        </A>
      </nav>
      {props.children}
    </>
  )
}

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/simple-solar" component={SimpleSolarExample} />
      <Route path="/portal" component={SimplePortal} />
      <Route
        path="/"
        component={() => (
          <Canvas
            style={{ width: "100vw", height: "100vh" }}
            camera={{ position: new THREE.Vector3(0, 0, 15) }}
          >
            <T.Mesh>
              <T.BoxGeometry />
              <T.MeshBasicMaterial color="gray" />
            </T.Mesh>
          </Canvas>
        )}
      />
    </Router>
  )
}
