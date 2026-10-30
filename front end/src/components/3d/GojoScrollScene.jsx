import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useScroll } from 'framer-motion';
import * as THREE from 'three';
import { GojoModel } from './GojoModel';
import { GojoFallback } from './GojoFallback';

/**
 * CameraController Component
 * Subtly interpolates camera position, depth, and lookAt direction across
 * scroll stages to achieve genuine 3D spatial depth.
 */
function CameraController({ scrollProgressRef }) {
  useFrame((state) => {
    const p = Math.min(Math.max(scrollProgressRef?.current ?? 0, 0), 1);
    const targetX = Math.sin(p * 1.2) * 0.3;
    const targetY = -p * 0.22;
    const targetZ = 4.2 + p * 0.35;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.06);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.06);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.06);
    state.camera.lookAt(0.2 * (1 - p), -0.1 - p * 0.25, 0);
  });
  return null;
}

/**
 * Checks whether the current client environment supports WebGL.
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * GojoScrollScene Component
 * Wraps Three.js WebGL canvas and connects Framer Motion's useScroll
 * directly to the 3D Gojo character.
 * 
 * Strict Layout Rules:
 * - pointer-events: none ensures zero interception of button/card clicks
 * - Transparent background merges seamlessly with existing dark esports theme
 * - Respects prefers-reduced-motion
 * - Instant fallback displayed during load or on unsupported devices
 */
export const GojoScrollScene = () => {
  const scrollProgressRef = useRef(0);
  const { scrollYProgress } = useScroll();
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Accessibility: Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // 2. Performance: Check WebGL availability
    setHasWebGL(isWebGLAvailable());

    // 3. Mark initialized
    setIsLoaded(true);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Update scrollProgressRef on every scroll change without triggering React re-renders
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      scrollProgressRef.current = latest;
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // If reduced motion is requested or WebGL is unsupported, render static Gojo artwork
  if (prefersReducedMotion || !hasWebGL) {
    return (
      <div
        className="fixed right-0 top-0 w-full sm:w-[50vw] lg:w-[42vw] h-screen pointer-events-none select-none z-0 overflow-hidden hidden sm:flex items-center justify-end pr-4 lg:pr-12"
        aria-hidden="true"
      >
        <GojoFallback />
      </div>
    );
  }

  return (
    <div
      className="fixed right-0 top-0 w-full sm:w-[50vw] lg:w-[44vw] h-screen pointer-events-none select-none z-0 overflow-hidden hidden sm:block"
      aria-hidden="true"
    >
      {/* Multi-layered Anime Cursed Aura Emanating Behind Gojo */}
      <div className="absolute top-1/4 right-8 w-96 h-96 bg-purple-600/30 rounded-full blur-[110px] animate-pulse pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-16 w-80 h-80 bg-cyan-500/25 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-12 w-[480px] h-[480px] bg-indigo-900/30 rounded-full blur-[140px] pointer-events-none -z-20" />

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.18
        }}
        dpr={[1, 1.5]}
        className="w-full h-full pointer-events-none"
      >
        {/* Dramatic High-Contrast Anime Lighting */}
        {/* Deep Slate Ambient Shadow */}
        <ambientLight color="#080a14" intensity={0.55} />

        {/* Razor-Sharp Cool Cyan Rim Key Light */}
        <directionalLight position={[3.5, 4.2, 3]} color="#38bdf8" intensity={3.4} />

        {/* Saturated Hollow Purple Accent Fill Light */}
        <directionalLight position={[-3.5, -1.2, 2.5]} color="#9333ea" intensity={3.6} />

        {/* Specular White Hair & Edge Highlight */}
        <directionalLight position={[0, 4.5, -2.5]} color="#ffffff" intensity={2.2} />

        {/* Cursed Energy Aura Point Lights */}
        <pointLight position={[1, 1, 2]} color="#38bdf8" intensity={2.2} distance={6} />
        <pointLight position={[-1, -1, 1]} color="#a855f7" intensity={2.8} distance={5} />

        {/* Dynamic 3D Camera Depth Controller */}
        <CameraController scrollProgressRef={scrollProgressRef} />

        {/* Scroll-Driven Gojo Satoru Character with Suspense boundary */}
        <React.Suspense fallback={null}>
          <GojoModel scrollProgressRef={scrollProgressRef} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};
