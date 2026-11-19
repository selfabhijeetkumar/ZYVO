'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface IndustryAccentSceneProps {
  moduleType: 'milk' | 'kirana' | 'vegetable' | 'clinic' | 'agriculture';
  accentColor?: string;
  className?: string;
}

export default function IndustryAccentScene({
  moduleType,
  accentColor = '#69D9AD',
  className = 'w-24 h-24 sm:w-28 sm:h-28',
}: IndustryAccentSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      return;
    }
    setWebglSupported(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || 112;
    const height = container.clientHeight || 112;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 20);
    camera.position.set(0, 0.4, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xf2efe6, 1.4);
    dir.position.set(2, 3, 2);
    scene.add(dir);

    const point = new THREE.PointLight(new THREE.Color(accentColor), 2.0, 4);
    point.position.set(-1, -1, 1);
    scene.add(point);

    // Group for object
    const group = new THREE.Group();
    scene.add(group);

    const hexColor = new THREE.Color(accentColor);

    // Build specific industry geometry
    if (moduleType === 'milk') {
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 0.85, 20),
        new THREE.MeshStandardMaterial({
          color: 0x1b2b22,
          metalness: 0.8,
          roughness: 0.25,
          emissive: hexColor,
          emissiveIntensity: 0.35,
        })
      );
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.36, 0.02, 8, 32),
        new THREE.MeshBasicMaterial({ color: hexColor })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.35;
      cyl.add(ring);
      group.add(cyl);
    } else if (moduleType === 'kirana') {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.05, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x46534a, metalness: 0.9 })
      );
      const box1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.4, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x2a322d, emissive: hexColor, emissiveIntensity: 0.4 })
      );
      box1.position.set(-0.2, 0.22, 0);
      const box2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.28, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x202622, emissive: hexColor, emissiveIntensity: 0.25 })
      );
      box2.position.set(0.2, 0.16, 0);
      group.add(base, box1, box2);
    } else if (moduleType === 'vegetable') {
      const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.4, 0.06, 24),
        new THREE.MeshStandardMaterial({ color: 0x46534a, metalness: 0.85 })
      );
      const produce = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.22, 0),
        new THREE.MeshStandardMaterial({ color: 0x24765e, emissive: hexColor, emissiveIntensity: 0.4 })
      );
      produce.position.set(0, 0.2, 0);
      group.add(pan, produce);
    } else if (moduleType === 'clinic') {
      const dial1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.03, 8, 40, Math.PI * 1.6),
        new THREE.MeshStandardMaterial({ color: 0x86d5d4, emissive: hexColor, emissiveIntensity: 0.5 })
      );
      const dial2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.025, 8, 32, Math.PI * 1.3),
        new THREE.MeshStandardMaterial({ color: 0x46534a, metalness: 0.8 })
      );
      dial2.rotation.z = Math.PI / 4;
      group.add(dial1, dial2);
    } else {
      // Agriculture
      const terrace = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.6, 0.1, 6),
        new THREE.MeshStandardMaterial({ color: 0x202622, metalness: 0.7 })
      );
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.25, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x2a322d, emissive: hexColor, emissiveIntensity: 0.4 })
      );
      crate.position.set(0, 0.18, 0);
      group.add(terrace, crate);
    }

    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      const elapsed = clock.getElapsedTime();
      group.rotation.y = elapsed * 0.45;
      group.rotation.x = Math.sin(elapsed * 0.5) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [moduleType, accentColor]);

  if (webglSupported === false) {
    return (
      <div className={`${className} flex items-center justify-center rounded-xs border border-[#46534A] bg-[#171B19]`}>
        <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: accentColor }} />
      </div>
    );
  }

  return <div ref={mountRef} className={`${className} relative pointer-events-none`} aria-hidden="true" />;
}
