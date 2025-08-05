import { A, Route, Router } from "@solidjs/router"
import type { ParentProps } from "solid-js"
import * as THREE from "three"
import { extend, T } from "../src/index.ts"
import { Basic } from "./examples/Basic.tsx"
import "./index.css"

extend(THREE)

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
          href="/basic"
          style={{
            color: "white",
            "text-decoration": "none",
            padding: "5px 10px",
            display: "block",
          }}
        >
          Basic Example
        </A>
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
      </nav>
      {props.children}
    </>
  )
}

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/basic" component={Basic} />
      <Route
        path="/"
        component={() => (
          <T.Mesh>
            <T.BoxGeometry />
            <T.MeshBasicMaterial color="gray" />
          </T.Mesh>
        )}
      />
    </Router>
  )
}
