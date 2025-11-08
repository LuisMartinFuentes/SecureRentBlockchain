import React, { Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

THREE.Cache.enabled = true;


function FoxModel() {
  const { scene } = useGLTF("/models/fox.glb");

  // Hace que el zorro respire lentamente y mire un poco al mouse
  useFrame(({ mouse }) => {
    scene.rotation.y = mouse.x * 0.5;
    scene.rotation.x = -mouse.y * 0.3;
  });

  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

// 👇 Este es tu componente principal
export default function MetaMaskFox3D({ className, onClick }) {
  return (
    <div
      key="metamask-3d"
      className={`flex justify-center items-center h-64 ${className}`}
      onClick={onClick}
    >
      <Canvas camera={{ position: [0, -1, 4], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <FoxModel />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
