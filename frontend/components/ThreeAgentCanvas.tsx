import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three';
import { AgentState } from '../types';

interface ThreeAgentCanvasProps {
  agentState: AgentState;
  analyserNode: AnalyserNode | null;
  ambientActive: boolean;
  bellResonanceTrigger: number;
}

export const ThreeAgentCanvas: React.FC<ThreeAgentCanvasProps> = ({
  agentState,
  analyserNode,
  ambientActive,
  bellResonanceTrigger
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(agentState);
  const analyserRef = useRef(analyserNode);
  const ambientActiveRef = useRef(ambientActive);
  const bellTriggerRef = useRef(bellResonanceTrigger);

  useEffect(() => {
    stateRef.current = agentState;
  }, [agentState]);

  useEffect(() => {
    analyserRef.current = analyserNode;
  }, [analyserNode]);

  useEffect(() => {
    ambientActiveRef.current = ambientActive;
  }, [ambientActive]);

  useEffect(() => {
    bellTriggerRef.current = bellResonanceTrigger;
  }, [bellResonanceTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090d, 0.032);

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 1.42, 4.3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 2.4;
    controls.maxDistance = 6.2;
    controls.target.set(0, 1.12, 0);

    // --- 5-Color Lighting Harmony ---
    const ambientLight = new THREE.AmbientLight(0x171923, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.2);
    keyLight.position.set(3, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const vermilionRim = new THREE.DirectionalLight(0xe11d48, 3.5);
    vermilionRim.position.set(-4, 3, -4);
    scene.add(vermilionRim);

    const goldFill = new THREE.PointLight(0xd97706, 2.0, 8);
    goldFill.position.set(0, -0.2, 1.8);
    scene.add(goldFill);

    const stateLight = new THREE.PointLight(0xd97706, 3.5, 5);
    stateLight.position.set(0, 1.35, 0.6);
    scene.add(stateLight);

    const floorAudioLight = new THREE.PointLight(0xd97706, 0.6, 4);
    floorAudioLight.position.set(0, 0.25, 0);
    scene.add(floorAudioLight);

    // --- 3D NATURE BACKGROUND ENVIRONMENT ---
    // 1. Distant Rising Sun Disc (Vermilion imperial aura)
    const sunGeo = new THREE.CircleGeometry(4.2, 48);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.85
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(0, 3.6, -14);
    scene.add(sunMesh);

    // 2. Distant Mount Fuji Mountain Silhouette
    const fujiGeo = new THREE.ConeGeometry(8.5, 4.2, 32);
    const fujiMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e17,
      roughness: 0.95,
      metalness: 0.1
    });
    const fuji = new THREE.Mesh(fujiGeo, fujiMat);
    fuji.position.set(0, 1.6, -13.8);
    scene.add(fuji);

    // Snowcap on Mount Fuji
    const snowGeo = new THREE.ConeGeometry(2.4, 1.3, 32);
    const snowMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.75
    });
    const snow = new THREE.Mesh(snowGeo, snowMat);
    snow.position.set(0, 3.05, -13.78);
    scene.add(snow);

    // 3. Misty Bamboo Grove Stalks swaying on the flanks
    const bambooStalks: { mesh: THREE.Mesh; baseAngle: number; speed: number }[] = [];
    const stalkGeo = new THREE.CylinderGeometry(0.045, 0.055, 6, 12);
    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0x171923,
      roughness: 0.7,
      metalness: 0.25
    });

    const stalkPositions = [
      { x: -2.8, z: -2.5 },
      { x: -3.4, z: -3.2 },
      { x: -2.2, z: -3.8 },
      { x: -3.8, z: -1.8 },
      { x: 2.8, z: -2.5 },
      { x: 3.4, z: -3.2 },
      { x: 2.2, z: -3.8 },
      { x: 3.8, z: -1.8 }
    ];

    stalkPositions.forEach((pos, idx) => {
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.set(pos.x, 2.5, pos.z);
      stalk.rotation.z = (Math.random() - 0.5) * 0.1;
      scene.add(stalk);
      bambooStalks.push({
        mesh: stalk,
        baseAngle: stalk.rotation.z,
        speed: 0.8 + (idx % 3) * 0.3
      });

      // Bamboo nodes/rings
      for (let k = -2; k <= 2; k++) {
        const ringGeo = new THREE.TorusGeometry(0.055, 0.008, 8, 16);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = k * 1.0;
        stalk.add(ring);
      }
    });

    // 4. Stone Toro Lanterns flanking the dais with warm glowing embers
    const lanternLeftLight = new THREE.PointLight(0xd97706, 1.2, 3);
    lanternLeftLight.position.set(-2.0, 0.9, -0.6);
    scene.add(lanternLeftLight);

    const lanternRightLight = new THREE.PointLight(0xd97706, 1.2, 3);
    lanternRightLight.position.set(2.0, 0.9, -0.6);
    scene.add(lanternRightLight);

    const createStoneLantern = (x: number, z: number) => {
      const lGroup = new THREE.Group();
      lGroup.position.set(x, 0, z);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.26, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x171923, roughness: 0.8 })
      );
      base.position.y = 0.25;
      lGroup.add(base);

      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.28, 0.24),
        new THREE.MeshBasicMaterial({ color: 0xd97706 })
      );
      lamp.position.y = 0.65;
      lGroup.add(lamp);

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.35, 0.18, 4),
        new THREE.MeshStandardMaterial({ color: 0x08090d, roughness: 0.6 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 0.88;
      lGroup.add(roof);

      scene.add(lGroup);
    };

    createStoneLantern(-2.0, -0.6);
    createStoneLantern(2.0, -0.6);

    // 5. Stone Dais Base
    const daisGeo = new THREE.CylinderGeometry(1.65, 1.85, 0.2, 8);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x171923,
      roughness: 0.65,
      metalness: 0.35
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = -0.1;
    dais.receiveShadow = true;
    scene.add(dais);

    const rimGeo = new THREE.TorusGeometry(1.42, 0.025, 16, 48);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.95
    });
    const daisRim = new THREE.Mesh(rimGeo, rimMat);
    daisRim.rotation.x = Math.PI / 2;
    daisRim.position.y = 0.01;
    scene.add(daisRim);

    // --- ACOUSTIC WATER DAIS WAVES & SPECTRUM BLADES ---
    const daisWaveGroup = new THREE.Group();
    daisWaveGroup.position.set(0, 0.015, 0);
    scene.add(daisWaveGroup);

    const ringCount = 3;
    const rippleMeshes: THREE.Mesh[] = [];
    const rippleMaterials: THREE.MeshBasicMaterial[] = [];

    for (let r = 0; r < ringCount; r++) {
      const radius = 0.48 + r * 0.36;
      const rippleGeo = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
      const rippleMat = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0xd97706 : 0xe11d48,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      const ripple = new THREE.Mesh(rippleGeo, rippleMat);
      ripple.rotation.x = Math.PI / 2;
      daisWaveGroup.add(ripple);
      rippleMeshes.push(ripple);
      rippleMaterials.push(rippleMat);
    }

    const bladeCount = 32;
    const frequencyBlades: THREE.Mesh[] = [];
    const bladeRadius = 1.05;

    for (let b = 0; b < bladeCount; b++) {
      const angle = (b / bladeCount) * Math.PI * 2;
      const bladeGeo = new THREE.BoxGeometry(0.038, 0.02, 0.075);
      const bladeMat = new THREE.MeshBasicMaterial({
        color: b % 4 === 0 ? 0xe11d48 : 0xd97706,
        transparent: true,
        opacity: 0.6
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(Math.cos(angle) * bladeRadius, 0.015, Math.sin(angle) * bladeRadius);
      blade.rotation.y = -angle;
      daisWaveGroup.add(blade);
      frequencyBlades.push(blade);
    }

    // Temple shockwave expansion ring
    const templeShockwaveGeo = new THREE.RingGeometry(0.2, 0.26, 64);
    const templeShockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    const templeShockwave = new THREE.Mesh(templeShockwaveGeo, templeShockwaveMat);
    templeShockwave.rotation.x = Math.PI / 2;
    templeShockwave.position.y = 0.025;
    scene.add(templeShockwave);

    // Floating toroidal halo above the dais
    const haloGeo = new THREE.TorusGeometry(0.72, 0.02, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.3;
    scene.add(halo);

    // --- SAMUAI AVATAR ---
    const lacquerMat = new THREE.MeshStandardMaterial({
      color: 0x08090d,
      roughness: 0.15,
      metalness: 0.92
    });

    const vermilionMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.35,
      metalness: 0.4
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.95
    });

    const slateMat = new THREE.MeshStandardMaterial({
      color: 0x171923,
      roughness: 0.4,
      metalness: 0.8
    });

    const eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    const mouthGlowMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });

    const samuraiGroup = new THREE.Group();
    samuraiGroup.position.y = 0.4;
    scene.add(samuraiGroup);

    const waistGeo = new THREE.CylinderGeometry(0.28, 0.18, 0.3, 16);
    const waist = new THREE.Mesh(waistGeo, lacquerMat);
    waist.position.y = 0.45;
    samuraiGroup.add(waist);

    const kusazuriGroup = new THREE.Group();
    kusazuriGroup.position.y = 0.45;
    samuraiGroup.add(kusazuriGroup);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const skirtPlateGeo = new THREE.BoxGeometry(0.22, 0.26, 0.03);
      const skirtPlate = new THREE.Mesh(skirtPlateGeo, vermilionMat);
      skirtPlate.position.set(Math.sin(angle) * 0.3, -0.08, Math.cos(angle) * 0.3);
      skirtPlate.rotation.y = angle;
      skirtPlate.rotation.x = 0.14;
      kusazuriGroup.add(skirtPlate);

      const trimGeo = new THREE.BoxGeometry(0.22, 0.025, 0.035);
      const trim = new THREE.Mesh(trimGeo, goldMat);
      trim.position.set(0, -0.12, 0.01);
      skirtPlate.add(trim);
    }

    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.88;
    samuraiGroup.add(torsoGroup);

    const doChestGeo = new THREE.CylinderGeometry(0.36, 0.3, 0.58, 24);
    const doChest = new THREE.Mesh(doChestGeo, lacquerMat);
    doChest.castShadow = true;
    torsoGroup.add(doChest);

    for (let i = -1; i <= 1; i++) {
      const plateRingGeo = new THREE.TorusGeometry(0.34 + Math.abs(i) * 0.01, 0.018, 8, 32);
      const plateRing = new THREE.Mesh(plateRingGeo, vermilionMat);
      plateRing.rotation.x = Math.PI / 2;
      plateRing.position.y = i * 0.13;
      torsoGroup.add(plateRing);
    }

    const monRimGeo = new THREE.TorusGeometry(0.11, 0.018, 16, 24);
    const monRim = new THREE.Mesh(monRimGeo, goldMat);
    monRim.position.set(0, 0.07, 0.34);
    torsoGroup.add(monRim);

    const monCoreGeo = new THREE.SphereGeometry(0.075, 24, 24);
    const monCore = new THREE.Mesh(monCoreGeo, coreGlowMat);
    monCore.position.set(0, 0.07, 0.34);
    torsoGroup.add(monCore);

    const collarGeo = new THREE.CylinderGeometry(0.19, 0.22, 0.13, 24);
    const collar = new THREE.Mesh(collarGeo, slateMat);
    collar.position.y = 0.35;
    torsoGroup.add(collar);

    const leftSodeGroup = new THREE.Group();
    leftSodeGroup.position.set(-0.52, 0.27, 0);
    leftSodeGroup.rotation.z = 0.22;
    torsoGroup.add(leftSodeGroup);

    const rightSodeGroup = new THREE.Group();
    rightSodeGroup.position.set(0.52, 0.27, 0);
    rightSodeGroup.rotation.z = -0.22;
    torsoGroup.add(rightSodeGroup);

    [leftSodeGroup, rightSodeGroup].forEach((sode) => {
      for (let j = 0; j < 3; j++) {
        const tierGeo = new THREE.BoxGeometry(0.17, 0.075, 0.34);
        const tierMat = j % 2 === 0 ? vermilionMat : lacquerMat;
        const tier = new THREE.Mesh(tierGeo, tierMat);
        tier.position.set(0, -j * 0.07, 0);
        tier.rotation.z = j * 0.05;
        sode.add(tier);

        const sodeGoldGeo = new THREE.BoxGeometry(0.018, 0.08, 0.35);
        const sodeGold = new THREE.Mesh(sodeGoldGeo, goldMat);
        sodeGold.position.set(0.075, 0, 0);
        tier.add(sodeGold);
      }
    });

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.66, 0);
    torsoGroup.add(headGroup);

    const headBaseGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const headBase = new THREE.Mesh(headBaseGeo, lacquerMat);
    headBase.scale.set(1.0, 1.05, 1.0);
    headGroup.add(headBase);

    const kabutoBowlGeo = new THREE.SphereGeometry(0.38, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const kabutoBowl = new THREE.Mesh(kabutoBowlGeo, lacquerMat);
    kabutoBowl.position.set(0, 0.08, -0.02);
    headGroup.add(kabutoBowl);

    const mabizashiGeo = new THREE.CylinderGeometry(0.41, 0.41, 0.045, 24, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    const mabizashi = new THREE.Mesh(mabizashiGeo, goldMat);
    mabizashi.rotation.x = 0.28;
    mabizashi.position.set(0, 0.15, 0.17);
    headGroup.add(mabizashi);

    for (let k = 1; k <= 3; k++) {
      const shikoroGeo = new THREE.CylinderGeometry(
        0.39 + k * 0.04,
        0.41 + k * 0.045,
        0.06,
        24,
        1,
        false,
        Math.PI * 0.45,
        Math.PI * 1.1
      );
      const shikoroMat = k % 2 === 0 ? vermilionMat : lacquerMat;
      const shikoro = new THREE.Mesh(shikoroGeo, shikoroMat);
      shikoro.position.set(0, 0.07 - k * 0.065, -0.07);
      headGroup.add(shikoro);
    }

    const kuwagataGroup = new THREE.Group();
    kuwagataGroup.position.set(0, 0.27, 0.31);
    headGroup.add(kuwagataGroup);

    const hirinGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.02, 24);
    const hirin = new THREE.Mesh(hirinGeo, goldMat);
    hirin.rotation.x = Math.PI / 2;
    kuwagataGroup.add(hirin);

    const hornGeo = new THREE.ConeGeometry(0.032, 0.44, 16);
    const hornLeft = new THREE.Mesh(hornGeo, goldMat);
    hornLeft.position.set(-0.15, 0.19, 0);
    hornLeft.rotation.z = -0.65;
    hornLeft.rotation.x = -0.15;
    kuwagataGroup.add(hornLeft);

    const hornRight = new THREE.Mesh(hornGeo, goldMat);
    hornRight.position.set(0.15, 0.19, 0);
    hornRight.rotation.z = 0.65;
    hornRight.rotation.x = -0.15;
    kuwagataGroup.add(hornRight);

    const menpoGeo = new THREE.BoxGeometry(0.38, 0.23, 0.15);
    const menpo = new THREE.Mesh(menpoGeo, slateMat);
    menpo.position.set(0, -0.11, 0.25);
    menpo.rotation.x = -0.1;
    headGroup.add(menpo);

    const eyeGeo = new THREE.BoxGeometry(0.085, 0.02, 0.02);
    const leftEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    leftEye.position.set(-0.11, 0.02, 0.33);
    leftEye.rotation.z = 0.18;
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeGlowMat);
    rightEye.position.set(0.11, 0.02, 0.33);
    rightEye.rotation.z = -0.18;
    headGroup.add(rightEye);

    const mouthGeo = new THREE.BoxGeometry(0.15, 0.02, 0.02);
    const mouth = new THREE.Mesh(mouthGeo, mouthGlowMat);
    mouth.position.set(0, -0.13, 0.34);
    headGroup.add(mouth);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.65, 0.62, 0.2);
    samuraiGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.65, 0.62, 0.2);
    samuraiGroup.add(rightArmGroup);

    [leftArmGroup, rightArmGroup].forEach((arm) => {
      const vambraceGeo = new THREE.CylinderGeometry(0.075, 0.095, 0.26, 16);
      const vambrace = new THREE.Mesh(vambraceGeo, lacquerMat);
      arm.add(vambrace);

      const trimGeo = new THREE.TorusGeometry(0.09, 0.014, 8, 24);
      const trim = new THREE.Mesh(trimGeo, goldMat);
      trim.rotation.x = Math.PI / 2;
      arm.add(trim);

      const handGeo = new THREE.SphereGeometry(0.095, 16, 16);
      const hand = new THREE.Mesh(handGeo, vermilionMat);
      hand.position.y = -0.15;
      arm.add(hand);
    });

    // Sakura falling petals and firefly particle field
    const petalCount = 70;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 7.0;
      petalPositions[i * 3 + 1] = Math.random() * 4.5;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 7.0;
    }
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xe11d48,
      size: 0.05,
      transparent: true,
      opacity: 0.7
    });
    const petals = new THREE.Points(petalGeo, petalMat);
    scene.add(petals);

    const frequencyData = new Uint8Array(32);
    let shockwaveScale = 1.0;
    let shockwaveAlpha = 0.0;
    let lastHandledTrigger = 0;

    let clock = new THREE.Clock();
    let animationFrameId: number;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;
      const currentAnalyser = analyserRef.current;
      const isAmbientOn = ambientActiveRef.current;
      const currentTrigger = bellTriggerRef.current;

      // Sway bamboo stalks in mountain breeze
      bambooStalks.forEach((item) => {
        item.mesh.rotation.z = item.baseAngle + Math.sin(elapsedTime * item.speed) * 0.04;
      });

      // Gently drift sakura petals downward
      const posAttr = petalGeo.attributes.position as THREE.BufferAttribute;
      for (let p = 0; p < petalCount; p++) {
        let py = posAttr.getY(p) - 0.008;
        let px = posAttr.getX(p) + Math.sin(elapsedTime + p) * 0.004;
        if (py < 0) py = 4.5;
        posAttr.setY(p, py);
        posAttr.setX(p, px);
      }
      posAttr.needsUpdate = true;

      // Handle temple bell resonance shockwave expansion
      if (currentTrigger > lastHandledTrigger) {
        lastHandledTrigger = currentTrigger;
        shockwaveScale = 0.4;
        shockwaveAlpha = 0.95;
      }

      if (shockwaveAlpha > 0.01) {
        shockwaveScale += 0.04;
        shockwaveAlpha *= 0.96;
        templeShockwave.scale.set(shockwaveScale, shockwaveScale, 1.0);
        templeShockwaveMat.opacity = shockwaveAlpha;
      } else {
        templeShockwaveMat.opacity = 0.0;
      }

      // Live microphone frequency telemetry
      let averageAudioLevel = 0;
      if (currentAnalyser) {
        currentAnalyser.getByteFrequencyData(frequencyData);
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          sum += frequencyData[i];
        }
        averageAudioLevel = sum / (frequencyData.length * 255);
      }

      const ambientPulse = isAmbientOn ? Math.sin(elapsedTime * 0.8) * 0.12 + 0.12 : 0;

      // Dais Wave Rotations
      daisWaveGroup.rotation.y = elapsedTime * (0.12 + ambientPulse * 0.2);
      halo.rotation.z = -elapsedTime * 0.35;

      for (let r = 0; r < rippleMeshes.length; r++) {
        const ripple = rippleMeshes[r];
        const rippleMat = rippleMaterials[r];

        const rippleAudioBonus = averageAudioLevel * (1.2 + r * 0.4) + ambientPulse * 0.5;
        const cycle = (elapsedTime * 1.5 + r * 0.8) % 2.5;
        const waveScale = 1.0 + rippleAudioBonus + cycle * 0.18;
        ripple.scale.set(waveScale, waveScale, 1.0);

        const targetOpacity = THREE.MathUtils.clamp(
          0.2 + averageAudioLevel * 0.8 + (isAmbientOn ? 0.25 : 0),
          0.15,
          0.95
        );
        rippleMat.opacity = THREE.MathUtils.lerp(rippleMat.opacity, targetOpacity, 0.15);

        const isSpike = averageAudioLevel > 0.4;
        rippleMat.color.setHex(isSpike ? 0xe11d48 : (r % 2 === 0 ? 0xd97706 : 0xe11d48));
      }

      for (let b = 0; b < frequencyBlades.length; b++) {
        const blade = frequencyBlades[b];
        const freqIndex = b % frequencyData.length;
        const rawFreq = currentAnalyser
          ? frequencyData[freqIndex] / 255
          : (isAmbientOn ? Math.sin(elapsedTime * 2 + b) * 0.08 + 0.08 : 0);

        const targetHeight = 1.0 + rawFreq * 9.0;
        blade.scale.y = THREE.MathUtils.lerp(blade.scale.y, targetHeight, 0.25);
        blade.position.y = (blade.scale.y * 0.02) / 2 + 0.01;

        const bladeMat = blade.material as THREE.MeshBasicMaterial;
        bladeMat.opacity = 0.35 + rawFreq * 0.65;
      }

      floorAudioLight.intensity = THREE.MathUtils.lerp(
        floorAudioLight.intensity,
        0.4 + averageAudioLevel * 4.5 + ambientPulse * 1.2,
        0.2
      );

      // Flickering stone lantern flames
      const flameFlicker = Math.sin(elapsedTime * 9) * 0.15 + Math.cos(elapsedTime * 13) * 0.1;
      lanternLeftLight.intensity = 1.2 + flameFlicker;
      lanternRightLight.intensity = 1.2 - flameFlicker;

      // Samurai Hover Levitation
      const hoverFloat = Math.sin(elapsedTime * 2.0) * 0.045;
      samuraiGroup.position.y = 0.4 + hoverFloat;

      // State Driven Colors
      let targetColorHex = 0xd97706;
      if (currentState === AgentState.LISTENING) {
        targetColorHex = averageAudioLevel > 0.1 ? 0xe11d48 : 0xf8fafc;
      } else if (currentState === AgentState.THINKING) {
        targetColorHex = 0xd97706;
      } else if (currentState === AgentState.SPEAKING) {
        targetColorHex = 0xe11d48;
      } else if (currentState === AgentState.ERROR) {
        targetColorHex = 0xe11d48;
      }

      const currentColor = eyeGlowMat.color;
      currentColor.lerp(new THREE.Color(targetColorHex), 0.12);
      eyeGlowMat.color.copy(currentColor);
      mouthGlowMat.color.copy(currentColor);
      coreGlowMat.color.copy(currentColor);
      stateLight.color.copy(currentColor);

      const coreSpeed = currentState === AgentState.THINKING ? 8 : 2.2;
      const coreScale = 1 + Math.sin(elapsedTime * coreSpeed) * 0.22 + averageAudioLevel * 0.5 + ambientPulse * 0.15;
      monCore.scale.set(coreScale, coreScale, coreScale);

      switch (currentState) {
        case AgentState.LISTENING: {
          headGroup.position.z = THREE.MathUtils.lerp(headGroup.position.z, 0.07, 0.1);
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.09, 0.1);
          headGroup.rotation.y = Math.sin(elapsedTime * 1.4) * 0.05;
          headGroup.rotation.z = 0.03;

          leftArmGroup.position.set(-0.46, 0.66, 0.36);
          leftArmGroup.rotation.set(0.35, 0.2, -0.25);
          rightArmGroup.position.set(0.46, 0.66, 0.36);
          rightArmGroup.rotation.set(0.35, -0.2, 0.25);

          mouth.scale.set(1.0 + averageAudioLevel * 0.5, 1.0 + averageAudioLevel * 2.0, 1.0);
          break;
        }

        case AgentState.THINKING: {
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.14, 0.1);
          headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, Math.sin(elapsedTime * 4.0) * 0.16, 0.1);
          headGroup.rotation.z = Math.sin(elapsedTime * 2.5) * 0.04;

          rightArmGroup.position.set(0.28, 0.86 + Math.sin(elapsedTime * 4) * 0.03, 0.4);
          rightArmGroup.rotation.set(0.75, -0.25, 0.35);
          leftArmGroup.position.set(-0.52, 0.56, 0.2);
          leftArmGroup.rotation.set(0.1, 0.1, -0.1);

          mouth.scale.set(0.7, 1.0 + Math.sin(elapsedTime * 14) * 0.45, 1.0);
          break;
        }

        case AgentState.SPEAKING: {
          headGroup.position.z = THREE.MathUtils.lerp(headGroup.position.z, 0.04, 0.1);
          headGroup.rotation.x = Math.sin(elapsedTime * 4.5) * 0.08;
          headGroup.rotation.y = Math.sin(elapsedTime * 2.8) * 0.11;
          headGroup.rotation.z = Math.sin(elapsedTime * 2.0) * 0.035;

          const speechPulse = Math.abs(Math.sin(elapsedTime * 15)) * 4.0;
          mouth.scale.y = Math.max(0.8, speechPulse);
          mouth.scale.x = 1.0 + Math.cos(elapsedTime * 9) * 0.32;

          leftArmGroup.position.set(
            -0.6 - Math.sin(elapsedTime * 3) * 0.1,
            0.7 + Math.cos(elapsedTime * 3.5) * 0.08,
            0.4 + Math.sin(elapsedTime * 3.8) * 0.1
          );
          leftArmGroup.rotation.set(0.28, 0.18, -0.18);

          rightArmGroup.position.set(
            0.6 + Math.cos(elapsedTime * 3.2) * 0.1,
            0.74 + Math.sin(elapsedTime * 3.4) * 0.08,
            0.42 + Math.cos(elapsedTime * 3.2) * 0.12
          );
          rightArmGroup.rotation.set(0.28, -0.18, 0.18);
          break;
        }

        case AgentState.ERROR: {
          headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.3, 0.1);
          headGroup.rotation.y = 0;
          headGroup.rotation.z = 0;
          mouth.scale.set(0.8, 0.5, 1.0);
          break;
        }

        case AgentState.IDLE:
        default: {
          headGroup.position.z = THREE.MathUtils.lerp(headGroup.position.z, 0, 0.08);
          headGroup.rotation.x = Math.sin(elapsedTime * 1.3) * 0.03;
          headGroup.rotation.y = Math.sin(elapsedTime * 0.9) * 0.045;
          headGroup.rotation.z = 0;

          const blinkCycle = elapsedTime % 4.5;
          const isBlinking = blinkCycle > 4.3 && blinkCycle < 4.45;
          leftEye.scale.y = isBlinking ? 0.05 : 1.0;
          rightEye.scale.y = isBlinking ? 0.05 : 1.0;

          mouth.scale.set(1.0, 1.0, 1.0);
          leftArmGroup.position.set(-0.62, 0.6 + Math.sin(elapsedTime * 1.8) * 0.025, 0.2);
          leftArmGroup.rotation.set(0, 0, 0);
          rightArmGroup.position.set(0.62, 0.6 + Math.cos(elapsedTime * 1.8) * 0.025, 0.2);
          rightArmGroup.rotation.set(0, 0, 0);
          break;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    render();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
