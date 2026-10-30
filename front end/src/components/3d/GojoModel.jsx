import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Creates an elliptical radial alpha mask texture to dissolve rectangular
 * PNG edges into the surrounding dark theme with zero visible box boundaries.
 */
function createVignetteAlphaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Fill entire perimeter with pure black (alpha = 0, guaranteed zero border seams)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);

  // Scaled elliptical gradient matching the 3.2 x 2.79 aspect ratio
  ctx.save();
  ctx.translate(256, 256);
  ctx.scale(1.12, 1.0);

  const gradient = ctx.createRadialGradient(0, 0, 40, 0, 0, 205);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.38, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.60, 'rgba(255, 255, 255, 0.75)');
  gradient.addColorStop(0.78, 'rgba(255, 255, 255, 0.30)');
  gradient.addColorStop(0.92, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 210, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates an ethereal high-contrast anime cursed energy aura texture.
 */
function createAuraGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 252);
  gradient.addColorStop(0, 'rgba(192, 132, 252, 0.85)');   // Vivid Limitless Violet Core
  gradient.addColorStop(0.28, 'rgba(147, 51, 234, 0.65)'); // Royal Purple
  gradient.addColorStop(0.58, 'rgba(14, 165, 233, 0.40)'); // Electric Cyan rim
  gradient.addColorStop(0.82, 'rgba(79, 70, 229, 0.18)');  // Indigo feather
  gradient.addColorStop(1, 'rgba(10, 12, 20, 0)');         // Fade to space

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates an authentic, soft radiant anime light beam flare texture
 * matching the radiating purple/white beam in Gojo's palm.
 */
function createHandBeamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;

  ctx.clearRect(0, 0, 512, 512);

  // 1. Soft glowing core
  const coreGrad = ctx.createRadialGradient(cx, cy, 6, cx, cy, 140);
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  coreGrad.addColorStop(0.20, 'rgba(235, 215, 255, 0.80)');
  coreGrad.addColorStop(0.45, 'rgba(192, 132, 252, 0.50)');
  coreGrad.addColorStop(0.75, 'rgba(147, 51, 234, 0.18)');
  coreGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fill();

  // 2. Radiating soft light beam rays matching reference anime artwork
  const rayCount = 14;
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < rayCount; i++) {
    const angle = (i * Math.PI * 2) / rayCount;
    const length = 175 + (i % 3) * 45;
    const halfWidth = 0.05 + (i % 2) * 0.025;

    ctx.save();
    ctx.rotate(angle);
    const rayGrad = ctx.createLinearGradient(0, 0, length, 0);
    rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
    rayGrad.addColorStop(0.25, 'rgba(216, 180, 254, 0.45)');
    rayGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.15)');
    rayGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');

    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, -Math.tan(halfWidth) * length);
    ctx.lineTo(length, Math.tan(halfWidth) * length);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * GojoReferenceCharacter Component
 * Renders the clean, authentic Gojo Satoru character with:
 * - Natural hand-painted Hollow Purple cursed energy from the reference artwork
 * - Soft, non-intrusive background radial aura glow
 * - Softly animated radiating hand beam flare (dimmed, zero dark rocks or geometric torus rings)
 * - 50% transparency and seamless borderless feathering into the web
 */
function GojoReferenceCharacter() {
  const texture = useLoader(THREE.TextureLoader, '/images/gojo-satoru.png');
  const [alphaMap] = useState(() => createVignetteAlphaTexture());
  const [auraTexture] = useState(() => createAuraGlowTexture());
  const [handBeamTexture] = useState(() => createHandBeamTexture());

  // Enhance texture contrast, sharpness, and micro-detailing in WebGL
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const auraGlowRef = useRef();
  const handBeamRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Subtle breathing pulse of the background cursed aura
    if (auraGlowRef.current) {
      const auraPulse = 1.1 + Math.sin(t * 1.8) * 0.05;
      auraGlowRef.current.scale.set(auraPulse, auraPulse, 1);
    }

    // Soft animated radiating beam rotation and shimmer at Gojo's palm
    if (handBeamRef.current) {
      handBeamRef.current.rotation.z = t * 0.22;
      const beamPulse = 1.0 + Math.sin(t * 3.0) * 0.08;
      handBeamRef.current.scale.set(beamPulse, beamPulse, 1);
      if (handBeamRef.current.material) {
        handBeamRef.current.material.opacity = 0.36 + Math.sin(t * 2.2) * 0.07;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Soft Background Cursed Energy Aura Layer (Radiating behind Gojo's body & head) */}
      <group position={[0.05, 0.05, -0.18]}>
        <mesh ref={auraGlowRef}>
          <planeGeometry args={[4.0, 3.6]} />
          <meshBasicMaterial
            map={auraTexture}
            transparent
            opacity={0.75}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Deep violet backlight casting subtle rim shine */}
        <pointLight color="#9333ea" intensity={3.0} distance={4.5} />
      </group>

      {/* 2. Main Character Plane with Feathered Vignette (Clean Artwork, 50% transparency, zero border seams) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3.2, 2.79]} />
        <meshStandardMaterial
          map={texture}
          alphaMap={alphaMap}
          transparent
          opacity={0.50}
          depthWrite={false}
          roughness={0.14}
          metalness={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. Soft Animated Radiating Beam in Hand (Zero dark rocks, zero artificial rings, smoothly dimmed) */}
      <mesh ref={handBeamRef} position={[-0.08, -0.14, 0.02]}>
        <planeGeometry args={[1.65, 1.65]} />
        <meshBasicMaterial
          map={handBeamTexture}
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * ExternalGojoGLTF Component
 * Attempts to load external /models/gojo.glb when provided by user.
 */
function ExternalGojoGLTF({ url, onError }) {
  try {
    const gltf = useGLTF(url);
    return <primitive object={gltf.scene.clone()} />;
  } catch (err) {
    onError(err);
    return null;
  }
}

/**
 * GojoModel Component
 * Main 3D character controller responding to continuous scroll progress.
 * Smoothly updates rotation, position, and scale on every frame across 4 stages.
 */
export const GojoModel = ({ scrollProgressRef }) => {
  const groupRef = useRef();
  const [modelExists, setModelExists] = useState(false);

  useEffect(() => {
    // Check if an external /models/gojo.glb is physically present
    fetch('/models/gojo.glb', { method: 'HEAD' })
      .then((res) => {
        if (res.ok && res.headers.get('content-type')?.includes('octet-stream')) {
          setModelExists(true);
        }
      })
      .catch(() => setModelExists(false));
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    // Current scroll progress (clamped 0.0 to 1.0)
    const p = Math.min(Math.max(scrollProgressRef?.current ?? 0, 0), 1);

    // 4-Stage Continuous Scroll Behavior:
    // Stage 1 (Top / Hero, p: 0.0 - 0.20):
    // - Character appears prominently with background aura radiating
    // - Gentle three-quarter perspective angle (-0.22 rad)
    //
    // Stage 2 (Scrolling Down, p: 0.20 - 0.50):
    // - Rotates gradually around Y axis (-0.75 rad) exhibiting genuine 3D perspective
    // - Moves smoothly rightward and downward
    //
    // Stage 3 (Tournament Showcase, p: 0.50 - 0.80):
    // - Secondary position beside the tournament cards
    // - Scale gently reduces so cards remain completely unobstructed
    //
    // Stage 4 (Bottom of Page, p: 0.80 - 1.0):
    // - Positions toward right edge (-1.35 rad)
    // - Bottom section remains fully clear and readable
    // - Reverses naturally when scrolling back up

    const targetRotY = -0.22 - p * 1.15;
    const targetPosX = 0.45 + p * 0.95;
    const targetPosY = -0.05 - p * 0.45;
    const targetScale = 1.25 - p * 0.25;

    // Smooth Lerp Interpolation (factor 0.08)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.08);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.08);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08));
  });

  return (
    <group ref={groupRef} position={[0.45, -0.05, 0]} rotation={[0, -0.22, 0]} scale={1.25}>
      {modelExists ? (
        <Suspense fallback={<GojoReferenceCharacter />}>
          <ExternalGojoGLTF url="/models/gojo.glb" onError={() => setModelExists(false)} />
        </Suspense>
      ) : (
        <Suspense fallback={null}>
          <GojoReferenceCharacter />
        </Suspense>
      )}
    </group>
  );
};
