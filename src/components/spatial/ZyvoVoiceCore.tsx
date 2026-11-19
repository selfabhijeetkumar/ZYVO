'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface ModuleNodeInfo {
  id: string;
  name: string;
  route: string;
  accentColor: string;
  category: string;
  operationalDetail: string;
}

export const MODULE_NODES: ModuleNodeInfo[] = [
  {
    id: 'milk_delivery',
    name: 'Milk Delivery',
    route: '/milk',
    accentColor: '#86D5D4',
    category: 'Recurring Logistics',
    operationalDetail: '20:00 cutoff engine, dual-model billing ledger, route manifests',
  },
  {
    id: 'kirana',
    name: 'Kirana Store',
    route: '/kirana',
    accentColor: '#DAB77A',
    category: 'Retail Commerce',
    operationalDetail: 'Colloquial alias matching, integer paise totals, fulfillment queue',
  },
  {
    id: 'vegetable_vendor',
    name: 'Vegetable Vendor',
    route: '/vegetables',
    accentColor: '#69D9AD',
    category: 'Mandi Commerce',
    operationalDetail: 'Fractional weighing (g/kg/bundles), daily rate board, prep manifest',
  },
  {
    id: 'clinic',
    name: 'Clinic Outpatient',
    route: '/clinic',
    accentColor: '#86D5D4',
    category: 'Healthcare Access',
    operationalDetail: 'Administrative scheduling, slot reservation, strict non-diagnostic boundary',
  },
  {
    id: 'agriculture',
    name: 'Agri Procurement',
    route: '/agriculture',
    accentColor: '#DAB77A',
    category: 'Farm Logistics',
    operationalDetail: 'Official CCEA PIB MSP benchmarks, volume conversion, payout formula',
  },
];

interface ZyvoVoiceCoreProps {
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
  audioAnalyser?: AnalyserNode | null;
  isRecording?: boolean;
}

export default function ZyvoVoiceCore({
  selectedModuleId = 'milk_delivery',
  onSelectModule,
  audioAnalyser,
  isRecording = false,
}: ZyvoVoiceCoreProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [activeModule, setActiveModule] = useState<string>(selectedModuleId);
  const activeModuleRef = useRef<string>(selectedModuleId);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sync ref with prop
  useEffect(() => {
    setActiveModule(selectedModuleId);
    activeModuleRef.current = selectedModuleId;
  }, [selectedModuleId]);

  const handleSelect = useCallback(
    (id: string) => {
      setActiveModule(id);
      activeModuleRef.current = id;
      if (onSelectModule) {
        onSelectModule(id);
      }
    },
    [onSelectModule]
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL capability
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      return;
    }
    setWebglSupported(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101211);
    scene.fog = new THREE.FogExp2(0x101211, 0.08);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 7.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Illumination
    const ambientLight = new THREE.AmbientLight(0x1b241e, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf2efe6, 1.5);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const coreLight = new THREE.PointLight(0x69d9ad, 3.0, 8);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0x24765e, 2.0);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    // VOICE CORE ASSEMBLY
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Faceted Inner Core
    const innerGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x1b2b22,
      roughness: 0.25,
      metalness: 0.85,
      emissive: 0x174031,
      emissiveIntensity: 0.5,
      flatShading: true,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Core Wireframe Outline
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x69d9ad,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireCore = new THREE.Mesh(innerGeo, wireMat);
    wireCore.scale.set(1.02, 1.02, 1.02);
    coreGroup.add(wireCore);

    // 2. Gyroscopic Orbital Bands
    const bandMat1 = new THREE.MeshStandardMaterial({
      color: 0x46534a,
      roughness: 0.3,
      metalness: 0.9,
    });
    const bandGeo1 = new THREE.TorusGeometry(1.6, 0.035, 16, 90, Math.PI * 1.7);
    const band1 = new THREE.Mesh(bandGeo1, bandMat1);
    band1.rotation.x = Math.PI / 3;
    band1.rotation.y = Math.PI / 6;
    coreGroup.add(band1);

    const bandMat2 = new THREE.MeshStandardMaterial({
      color: 0x69d9ad,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x24765e,
      emissiveIntensity: 0.4,
    });
    const bandGeo2 = new THREE.TorusGeometry(2.0, 0.025, 16, 90, Math.PI * 1.55);
    const band2 = new THREE.Mesh(bandGeo2, bandMat2);
    band2.rotation.x = -Math.PI / 4;
    band2.rotation.z = Math.PI / 5;
    coreGroup.add(band2);

    // 3. Sound-Wave Pulsing Ring
    const waveGeo = new THREE.RingGeometry(1.2, 1.25, 64);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x69d9ad,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const waveRing = new THREE.Mesh(waveGeo, waveMat);
    waveRing.rotation.x = Math.PI / 2;
    coreGroup.add(waveRing);

    // FIVE INDUSTRY NODES & CONDUITS
    // Positions arranged in spatial semi-circle / orbital array
    const nodeConfigs = [
      { id: 'milk_delivery', pos: new THREE.Vector3(-2.8, 1.3, 0.2), color: 0x86d5d4 },
      { id: 'kirana', pos: new THREE.Vector3(2.8, 1.4, 0.3), color: 0xdab77a },
      { id: 'vegetable_vendor', pos: new THREE.Vector3(-2.4, -1.5, 0.4), color: 0x69d9ad },
      { id: 'clinic', pos: new THREE.Vector3(2.4, -1.4, 0.1), color: 0x86d5d4 },
      { id: 'agriculture', pos: new THREE.Vector3(0, -2.6, 0.5), color: 0xdab77a },
    ];

    const nodeMeshes: { id: string; mesh: THREE.Group; conduit: THREE.Line; basePos: THREE.Vector3 }[] = [];

    nodeConfigs.forEach((cfg) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(cfg.pos);

      // Node Geometry based on specialized domain
      let nodeInner: THREE.Object3D;
      if (cfg.id === 'milk_delivery') {
        // Measured vessel cylinder
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.28, 0.6, 16),
          new THREE.MeshStandardMaterial({
            color: 0x202622,
            metalness: 0.8,
            roughness: 0.2,
            emissive: cfg.color,
            emissiveIntensity: 0.35,
          })
        );
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.25, 0.02, 8, 32),
          new THREE.MeshBasicMaterial({ color: cfg.color })
        );
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.3;
        cyl.add(rim);
        nodeInner = cyl;
      } else if (cfg.id === 'kirana') {
        // Shelf and box packages
        const shelfGroup = new THREE.Group();
        const basePlate = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.04, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x46534a, metalness: 0.9, roughness: 0.3 })
        );
        const box1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.32, 0.18),
          new THREE.MeshStandardMaterial({ color: 0x2a322d, emissive: cfg.color, emissiveIntensity: 0.4 })
        );
        box1.position.set(-0.15, 0.18, 0);
        const box2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 0.24, 0.16),
          new THREE.MeshStandardMaterial({ color: 0x202622, emissive: cfg.color, emissiveIntensity: 0.25 })
        );
        box2.position.set(0.16, 0.14, 0);
        shelfGroup.add(basePlate, box1, box2);
        nodeInner = shelfGroup;
      } else if (cfg.id === 'vegetable_vendor') {
        // Weighing scale balance plane with faceted produce
        const scaleGroup = new THREE.Group();
        const pan = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.34, 0.05, 20),
          new THREE.MeshStandardMaterial({ color: 0x46534a, metalness: 0.85, roughness: 0.25 })
        );
        const produce1 = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.16, 0),
          new THREE.MeshStandardMaterial({ color: 0x24765e, emissive: cfg.color, emissiveIntensity: 0.45 })
        );
        produce1.position.set(0.08, 0.15, 0);
        const produce2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0x1b2b22, emissive: 0x82a355, emissiveIntensity: 0.3 })
        );
        produce2.position.set(-0.12, 0.12, 0.05);
        scaleGroup.add(pan, produce1, produce2);
        nodeInner = scaleGroup;
      } else if (cfg.id === 'clinic') {
        // Concentric architectural scheduling rings
        const clinicGroup = new THREE.Group();
        const dial1 = new THREE.Mesh(
          new THREE.TorusGeometry(0.32, 0.025, 8, 36, Math.PI * 1.6),
          new THREE.MeshStandardMaterial({ color: 0x86d5d4, emissive: cfg.color, emissiveIntensity: 0.5 })
        );
        const dial2 = new THREE.Mesh(
          new THREE.TorusGeometry(0.2, 0.02, 8, 24, Math.PI * 1.3),
          new THREE.MeshStandardMaterial({ color: 0x46534a, metalness: 0.8 })
        );
        dial2.rotation.z = Math.PI / 4;
        clinicGroup.add(dial1, dial2);
        nodeInner = clinicGroup;
      } else {
        // Agriculture: Terraced stepped field and harvest crate
        const agriGroup = new THREE.Group();
        const terrace1 = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.48, 0.08, 6),
          new THREE.MeshStandardMaterial({ color: 0x202622, metalness: 0.6, roughness: 0.5 })
        );
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(0.26, 0.22, 0.26),
          new THREE.MeshStandardMaterial({ color: 0x2a322d, emissive: cfg.color, emissiveIntensity: 0.4 })
        );
        crate.position.set(0, 0.15, 0);
        agriGroup.add(terrace1, crate);
        nodeInner = agriGroup;
      }

      nodeGroup.add(nodeInner);

      // Hit-test bounding sphere for easy touch/pointer selection
      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitSphere.name = `hit_${cfg.id}`;
      nodeGroup.add(hitSphere);

      scene.add(nodeGroup);

      // Radial Energy Conduit from Core to Node
      const conduitPoints = [new THREE.Vector3(0, 0, 0), cfg.pos];
      const conduitGeo = new THREE.BufferGeometry().setFromPoints(conduitPoints);
      const conduitMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.35,
      });
      const conduit = new THREE.Line(conduitGeo, conduitMat);
      scene.add(conduit);

      nodeMeshes.push({
        id: cfg.id,
        mesh: nodeGroup,
        conduit,
        basePos: cfg.pos.clone(),
      });
    });

    // Raycaster for Pointer / Touch Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ('touches' in event) {
        if (event.touches.length === 0) return;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        if (hit.object.name.startsWith('hit_')) {
          const modId = hit.object.name.replace('hit_', '');
          handleSelect(modId);
          break;
        }
      }
    };

    renderer.domElement.addEventListener('click', onPointerDown);
    renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Audio frequency buffer for real Web Audio analysis
    const audioDataArray = new Uint8Array(64);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // If user prefers reduced motion, render static view
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      // Voice Core rotation
      coreGroup.rotation.y += 0.0035;
      coreGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.05;
      band1.rotation.z += 0.006;
      band2.rotation.y -= 0.005;

      // Real audio analyser energy modulation
      if (audioAnalyser && isRecording) {
        try {
          audioAnalyser.getByteFrequencyData(audioDataArray);
          let sum = 0;
          for (let i = 0; i < 32; i++) {
            sum += audioDataArray[i];
          }
          const avg = sum / 32 / 255; // 0.0 to 1.0
          const scale = 1.0 + avg * 0.8;
          waveRing.scale.set(scale, scale, scale);
          waveMat.opacity = 0.35 + avg * 0.55;
          coreLight.intensity = 2.5 + avg * 4.0;
        } catch {
          // Fallback if audio context state differs
        }
      } else {
        // Subtle ambient idle breathing
        const idlePulse = Math.sin(elapsed * 1.8) * 0.08;
        waveRing.scale.set(1.0 + idlePulse, 1.0 + idlePulse, 1.0 + idlePulse);
        waveMat.opacity = 0.3 + idlePulse * 0.5;
        coreLight.intensity = 2.2 + idlePulse * 0.8;
      }

      // Industry Node Idle & Selected State
      const currentSelected = activeModuleRef.current;
      nodeMeshes.forEach((item) => {
        const isSelected = item.id === currentSelected;

        // Subtle oscillation
        item.mesh.position.y = item.basePos.y + Math.sin(elapsed * 1.5 + item.basePos.x) * 0.05;

        // Scale & emissive highlighting on selection
        const targetScale = isSelected ? 1.25 : 1.0;
        item.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // Conduit brightness
        const lineMat = item.conduit.material as THREE.LineBasicMaterial;
        lineMat.opacity = isSelected ? 0.85 : 0.25;
      });

      // Camera gentle reframe towards selected node
      const activeCfg = nodeConfigs.find((n) => n.id === currentSelected);
      if (activeCfg) {
        const targetLook = new THREE.Vector3(
          activeCfg.pos.x * 0.25,
          activeCfg.pos.y * 0.25,
          0
        );
        camera.lookAt(targetLook);
      } else {
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Context loss handler
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onPointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      bandGeo1.dispose();
      bandMat1.dispose();
      bandGeo2.dispose();
      bandMat2.dispose();
      waveGeo.dispose();
      waveMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleSelect, audioAnalyser, isRecording]);

  const activeNodeInfo = MODULE_NODES.find((m) => m.id === activeModule) || MODULE_NODES[0];

  return (
    <div className="relative w-full rounded-md border border-[#46534A] bg-[#101211] overflow-hidden shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        className="w-full h-[360px] sm:h-[420px] lg:h-[480px] cursor-grab active:cursor-grabbing relative"
        aria-label="Interactive 3D Voice Core and Industry Orbit Scene"
        role="region"
      >
        {webglSupported === false && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-[#101211] text-[#F2EFE6]">
            <div>
              <div className="text-sm font-semibold tracking-wide text-emerald-400 mb-1">
                OPERATIONAL OBSERVATORY (2D FALLBACK)
              </div>
              <p className="text-xs text-[#A4B0A6] max-w-md">
                WebGL is unavailable in this environment. The operational interface, voice pipeline, and transaction ledger remain 100% accessible below.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Atmospheric Vignette & Reading Overlays */}
      <div className="absolute top-3 left-4 pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-xs bg-[#69D9AD] animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#A4B0A6]">
            VOICE CORE · VC-01 ONLINE
          </span>
        </div>
        <div className="text-xs text-[#C3CBC3] mt-0.5 font-medium">
          Multi-Vertical Spatial Dispatch
        </div>
      </div>

      {/* Real Audio Status Indicator */}
      {isRecording && (
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[#24765E]/60 border border-[#69D9AD] text-[#F2EFE6] text-xs font-mono">
          <span className="w-2 h-2 rounded-xs bg-[#F1A79C] animate-ping" />
          <span>AUDIO STREAM ACTIVE</span>
        </div>
      )}

      {/* Synchronized HTML Selection Bar (100% Accessible & Screen-Reader Compatible) */}
      <div className="border-t border-[#46534A] bg-[#171B19] p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-mono uppercase text-[#A4B0A6] shrink-0 mr-1">
              Select Sector:
            </span>
            {MODULE_NODES.map((node) => {
              const isSelected = node.id === activeModule;
              return (
                <button
                  key={node.id}
                  onClick={() => handleSelect(node.id)}
                  className={`min-h-[44px] px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-[#2A322D] text-[#F2EFE6] border-[#69D9AD] shadow-xs'
                      : 'bg-[#202622] text-[#C3CBC3] border-[#46534A] hover:bg-[#2A322D] hover:text-[#F2EFE6]'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Select ${node.name} industry node`}
                >
                  <span
                    className="w-2 h-2 rounded-xs"
                    style={{ backgroundColor: node.accentColor }}
                  />
                  <span>{node.name}</span>
                </button>
              );
            })}
          </div>

          <a
            href={activeNodeInfo.route}
            className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xs bg-[#69D9AD] text-[#101211] hover:bg-[#86D5D4] transition-colors shrink-0"
          >
            Enter {activeNodeInfo.name} Workflow →
          </a>
        </div>

        {/* Selected Node Provenance Metadata Card */}
        <div className="mt-3 pt-3 border-t border-[#2C3530] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#A4B0A6] gap-2">
          <div>
            <span className="text-[#F2EFE6] font-medium">{activeNodeInfo.name}</span>
            <span className="mx-2 text-[#46534A]">·</span>
            <span>{activeNodeInfo.category}</span>
            <span className="mx-2 text-[#46534A]">·</span>
            <span className="text-[#C3CBC3]">{activeNodeInfo.operationalDetail}</span>
          </div>
          <div className="font-mono text-[11px] text-[#A4B0A6] shrink-0">
            ROUTE: {activeNodeInfo.route}
          </div>
        </div>
      </div>
    </div>
  );
}
