import * as THREE from "three"
import { DRACOLoader, GLTFLoader } from "three-stdlib"
import { Canvas, Entity, Resource } from "../../src/index.ts"

export function GltfExample() {
  let dracoLoader: DRACOLoader
  return (
    <Canvas
      style={{ width: "100vw", height: "100vh" }}
      defaultCamera={{ position: new THREE.Vector3(0, 0, 3) }}
    >
      <Entity from={THREE.AmbientLight} />
      <Resource
        loader={GLTFLoader}
        url="./suzanne.glb"
        onBeforeLoad={loader => {
          dracoLoader ??= new DRACOLoader()
          dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/")
          loader.setDRACOLoader(dracoLoader)
        }}
      >
        {gltf => <Entity from={gltf().scene} />}
      </Resource>
    </Canvas>
  )
}
