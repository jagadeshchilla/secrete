"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Checks whether the browser and hardware support WebGL rendering.
 */
function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Generates a high-resolution procedural normal and roughness map
 * to give the spheres a tactile frosted glass & brushed satin ceramic micro-texture.
 */
function createMicroSurfaceMaps(): {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;

  const nImg = nCtx.createImageData(size, size);
  const rImg = rCtx.createImageData(size, size);

  // Deterministic pseudo-random generator for consistent procedural grain
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Generate height field combining subtle isotropic grain and fine satin brushing
  const heightField = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const latWave = Math.sin((y / size) * Math.PI * 48) * 0.15;
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      const fineGrain = (rand() - 0.5) * 0.7;
      const satinStreak = Math.sin((x / size) * Math.PI * 16 + latWave) * 0.15;
      heightField[idx] = 0.5 + fineGrain * 0.35 + satinStreak * 0.15;
    }
  }

  // Sobel-like derivative pass for tangent-space normal map + roughness variation
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const xLeft = (x - 1 + size) % size;
      const xRight = (x + 1) % size;
      const yUp = (y - 1 + size) % size;
      const yDown = (y + 1) % size;

      const dX = (heightField[y * size + xRight] - heightField[y * size + xLeft]) * 1.65;
      const dY = (heightField[yDown * size + x] - heightField[yUp * size + x]) * 1.65;
      const dZ = 1.0;

      const invLen = 1.0 / Math.sqrt(dX * dX + dY * dY + dZ * dZ);
      const nx = Math.floor(((dX * invLen) * 0.5 + 0.5) * 255);
      const ny = Math.floor(((dY * invLen) * 0.5 + 0.5) * 255);
      const nz = Math.floor(((dZ * invLen) * 0.5 + 0.5) * 255);

      const pIdx = (y * size + x) * 4;
      nImg.data[pIdx] = nx;
      nImg.data[pIdx + 1] = ny;
      nImg.data[pIdx + 2] = nz;
      nImg.data[pIdx + 3] = 255;

      const rVal = Math.floor(Math.min(255, Math.max(0, (0.78 + (heightField[y * size + x] - 0.5) * 0.28) * 255)));
      rImg.data[pIdx] = rVal;
      rImg.data[pIdx + 1] = rVal;
      rImg.data[pIdx + 2] = rVal;
      rImg.data[pIdx + 3] = 255;
    }
  }

  nCtx.putImageData(nImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(3, 3);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(3, 3);

  return { normalMap, roughnessMap };
}

/**
 * Generates a procedural studio HDRI environment via PMREMGenerator
 * with soft architectural softboxes, warm champagne and cool emerald accent strips.
 */
function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileCubemapShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#090D0B');

  // Overhead diffused studio softbox for crisp top-edge specular roll-off
  const topBoxGeo = new THREE.PlaneGeometry(18, 18);
  const topBoxMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#F5F7F4').multiplyScalar(2.4),
    side: THREE.DoubleSide,
  });
  const topBox = new THREE.Mesh(topBoxGeo, topBoxMat);
  topBox.position.set(0, 11, 1);
  topBox.rotation.x = Math.PI / 2;
  envScene.add(topBox);

  // Left emerald rim diffuser strip
  const leftStripGeo = new THREE.PlaneGeometry(9, 16);
  const leftStripMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#34D399').multiplyScalar(2.2),
    side: THREE.DoubleSide,
  });
  const leftStrip = new THREE.Mesh(leftStripGeo, leftStripMat);
  leftStrip.position.set(-12, 2.5, -2);
  leftStrip.lookAt(0, 0, 0);
  envScene.add(leftStrip);

  // Right champagne gold rim diffuser strip
  const rightStripGeo = new THREE.PlaneGeometry(9, 16);
  const rightStripMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#F2C368').multiplyScalar(2.3),
    side: THREE.DoubleSide,
  });
  const rightStrip = new THREE.Mesh(rightStripGeo, rightStripMat);
  rightStrip.position.set(12, 2.5, 2);
  rightStrip.lookAt(0, 0, 0);
  envScene.add(rightStrip);

  // Subtle front-fill silk reflector so the camera-facing hemispheres never fall into flat black
  const frontFillGeo = new THREE.PlaneGeometry(22, 10);
  const frontFillMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#C8D4CE').multiplyScalar(0.85),
    side: THREE.DoubleSide,
  });
  const frontFill = new THREE.Mesh(frontFillGeo, frontFillMat);
  frontFill.position.set(0, 1.5, 14);
  frontFill.lookAt(0, 0, 0);
  envScene.add(frontFill);

  // Warm-emerald lower bounce card
  const floorBounceGeo = new THREE.PlaneGeometry(20, 20);
  const floorBounceMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#131D19').multiplyScalar(1.1),
    side: THREE.DoubleSide,
  });
  const floorBounce = new THREE.Mesh(floorBounceGeo, floorBounceMat);
  floorBounce.position.set(0, -10, 0);
  floorBounce.rotation.x = -Math.PI / 2;
  envScene.add(floorBounce);

  const renderTarget = pmremGenerator.fromScene(envScene, 0.045);

  // Dispose temporary studio geometry & materials
  topBoxGeo.dispose();
  topBoxMat.dispose();
  leftStripGeo.dispose();
  leftStripMat.dispose();
  rightStripGeo.dispose();
  rightStripMat.dispose();
  frontFillGeo.dispose();
  frontFillMat.dispose();
  floorBounceGeo.dispose();
  floorBounceMat.dispose();
  pmremGenerator.dispose();

  return renderTarget.texture;
}

/**
 * Injects custom GLSL subsurface scattering, internal core luminescence,
 * velvet Fresnel rim highlight, and mutual proximity cross-illumination into MeshPhysicalMaterial.
 */
function enhanceSphereMaterialWithSubsurfaceShader(
  material: THREE.MeshPhysicalMaterial,
  config: {
    innerGlowColor: THREE.Color;
    rimColor: THREE.Color;
    partnerColor: THREE.Color;
    subsurfaceStrength: number;
    rimPower: number;
  }
): {
  partnerWorldPos: { value: THREE.Vector3 };
  pulsePhase: { value: number };
} {
  const partnerWorldPos = { value: new THREE.Vector3(3, 0, 0) };
  const pulsePhase = { value: 0 };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uInnerGlowColor = { value: config.innerGlowColor };
    shader.uniforms.uRimColor = { value: config.rimColor };
    shader.uniforms.uPartnerColor = { value: config.partnerColor };
    shader.uniforms.uPartnerWorldPos = partnerWorldPos;
    shader.uniforms.uSubsurfaceStrength = { value: config.subsurfaceStrength };
    shader.uniforms.uRimPower = { value: config.rimPower };
    shader.uniforms.uPulsePhase = pulsePhase;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      varying vec3 vCustomWorldPos;
      varying vec3 vCustomWorldNormal;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vCustomWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vCustomWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform vec3 uInnerGlowColor;
      uniform vec3 uRimColor;
      uniform vec3 uPartnerColor;
      uniform vec3 uPartnerWorldPos;
      uniform float uSubsurfaceStrength;
      uniform float uRimPower;
      uniform float uPulsePhase;
      varying vec3 vCustomWorldPos;
      varying vec3 vCustomWorldNormal;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      // View direction & Fresnel calculation for frosted glass / satin ceramic edge luminosity
      vec3 viewDirW = normalize(cameraPosition - vCustomWorldPos);
      vec3 worldN = normalize(vCustomWorldNormal);
      float NdotV = clamp(dot(worldN, viewDirW), 0.0, 1.0);

      // Deep volumetric core glow (stronger toward the center of the sphere's volume)
      float coreDepth = pow(NdotV, 1.35);
      float subtleBreath = 0.94 + 0.06 * sin(uPulsePhase);
      vec3 internalSubsurface = uInnerGlowColor * coreDepth * uSubsurfaceStrength * subtleBreath;

      // Translucent scatter wrap around the terminator
      float scatterWrap = smoothstep(0.0, 0.85, 1.0 - abs(NdotV - 0.38));
      internalSubsurface += uInnerGlowColor * scatterWrap * (uSubsurfaceStrength * 0.42);

      // Soft satin-glass Fresnel rim highlight
      float fresnelTerm = pow(1.0 - NdotV, uRimPower);
      vec3 fresnelGlow = uRimColor * fresnelTerm * 0.58;

      // Mutual proximity cross-illumination from the companion sphere
      vec3 toPartner = uPartnerWorldPos - vCustomWorldPos;
      float distToPartner = length(toPartner);
      vec3 dirToPartner = toPartner / max(distToPartner, 0.0001);
      float facingPartner = pow(max(0.0, dot(worldN, dirToPartner) * 0.65 + 0.35), 2.0);
      float proximityAtten = smoothstep(4.6, 1.45, distToPartner);
      vec3 partnerTransferLight = uPartnerColor * facingPartner * proximityAtten * 0.36;

      gl_FragColor.rgb += internalSubsurface + fresnelGlow + partnerTransferLight;
      #include <dithering_fragment>
      `
    );
  };

  material.needsUpdate = true;
  return { partnerWorldPos, pulsePhase };
}

export function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (!checkWebGLSupport()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWebglAvailable(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Accessibility: detect reduced-motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // 1. Scene & Renderer initialization
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0F0D');

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Ensure canvas styles blend seamlessly
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // 2. Studio Environment & Procedural Surface Maps
    const envTexture = createStudioEnvironment(renderer);
    scene.environment = envTexture;

    const { normalMap, roughnessMap } = createMicroSurfaceMaps();

    // 3. Camera Setup — Three-quarter cinematic product-film angle
    // Looking slightly downward so the orbital pair sits gracefully above the vertical midpoint
    const camera = new THREE.PerspectiveCamera(
      34,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100
    );
    const baseCameraPos = new THREE.Vector3(0, 1.35, 9.6);
    const lookAtTarget = new THREE.Vector3(0, -0.32, 0);

    // 4. Root Orbital Group positioned slightly above the vertical center
    const orbitCenterY = 0.42;
    const orbitalSystemGroup = new THREE.Group();
    orbitalSystemGroup.position.set(0, orbitCenterY, 0);
    scene.add(orbitalSystemGroup);

    // Shared high-resolution sphere geometry (128x128 segments for flawless silhouette curvature)
    const sphereRadius = 1.12;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 128, 128);
    const innerCoreGeometry = new THREE.SphereGeometry(sphereRadius * 0.72, 64, 64);

    // =========================================================================
    // SPHERE A — EMERALD GREEN (#34D399)
    // Frosted botanical glass mixed with satin ceramic and internal emerald glow
    // =========================================================================
    const emeraldGroup = new THREE.Group();
    orbitalSystemGroup.add(emeraldGroup);

    const emeraldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#196B4F'),
      emissive: new THREE.Color('#09291E'),
      emissiveIntensity: 0.55,
      roughness: 0.27,
      roughnessMap: roughnessMap,
      metalness: 0.08,
      transmission: 0.42,
      thickness: 2.2,
      ior: 1.48,
      attenuationColor: new THREE.Color('#34D399'),
      attenuationDistance: 1.85,
      clearcoat: 0.45,
      clearcoatRoughness: 0.26,
      sheen: 0.65,
      sheenRoughness: 0.35,
      sheenColor: new THREE.Color('#6EE7B7'),
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.045, 0.045),
      envMapIntensity: 1.25,
    });

    const emeraldShaderUniforms = enhanceSphereMaterialWithSubsurfaceShader(emeraldMaterial, {
      innerGlowColor: new THREE.Color('#34D399'),
      rimColor: new THREE.Color('#86EFAC'),
      partnerColor: new THREE.Color('#F2C368'),
      subsurfaceStrength: 0.44,
      rimPower: 2.7,
    });

    const emeraldMesh = new THREE.Mesh(sphereGeometry, emeraldMaterial);
    emeraldGroup.add(emeraldMesh);

    // Subtle internal luminous core inside Sphere A for authentic frosted-glass depth
    const emeraldCoreMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color('#34D399') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float falloff = pow(max(0.0, dot(normal, viewDir)), 1.9);
          gl_FragColor = vec4(uColor * 0.48, falloff * 0.42);
        }
      `,
    });
    const emeraldCoreMesh = new THREE.Mesh(innerCoreGeometry, emeraldCoreMat);
    emeraldGroup.add(emeraldCoreMesh);

    // =========================================================================
    // SPHERE B — CHAMPAGNE GOLD (#F2C368)
    // Frosted champagne glass mixed with brushed satin precious metal
    // =========================================================================
    const champagneGroup = new THREE.Group();
    orbitalSystemGroup.add(champagneGroup);

    const champagneMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#C89B48'),
      emissive: new THREE.Color('#2B1D08'),
      emissiveIntensity: 0.5,
      roughness: 0.25,
      roughnessMap: roughnessMap,
      metalness: 0.44,
      transmission: 0.26,
      thickness: 1.9,
      ior: 1.52,
      attenuationColor: new THREE.Color('#F2C368'),
      attenuationDistance: 2.0,
      clearcoat: 0.48,
      clearcoatRoughness: 0.24,
      sheen: 0.7,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color('#FDE68A'),
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.05, 0.05),
      envMapIntensity: 1.35,
    });

    const champagneShaderUniforms = enhanceSphereMaterialWithSubsurfaceShader(champagneMaterial, {
      innerGlowColor: new THREE.Color('#F2C368'),
      rimColor: new THREE.Color('#FEF08A'),
      partnerColor: new THREE.Color('#34D399'),
      subsurfaceStrength: 0.4,
      rimPower: 2.6,
    });

    const champagneMesh = new THREE.Mesh(sphereGeometry, champagneMaterial);
    champagneGroup.add(champagneMesh);

    // Subtle internal warm core inside Sphere B
    const champagneCoreMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color('#F2C368') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float falloff = pow(max(0.0, dot(normal, viewDir)), 1.9);
          gl_FragColor = vec4(uColor * 0.46, falloff * 0.38);
        }
      `,
    });
    const champagneCoreMesh = new THREE.Mesh(innerCoreGeometry, champagneCoreMat);
    champagneGroup.add(champagneCoreMesh);

    // =========================================================================
    // 5. HIGH-END CINEMATIC LIGHTING SETUP
    // =========================================================================
    // Neutral studio ambient fill so dark hemispheres retain tactile detail
    const ambientLight = new THREE.AmbientLight('#D6E0DC', 0.48);
    scene.add(ambientLight);

    // Overhead slightly warm-neutral key light
    const keyLight = new THREE.DirectionalLight('#F4F6F0', 1.35);
    keyLight.position.set(1.5, 6.5, 5.0);
    scene.add(keyLight);

    // Dedicated Emerald Rim Light (back-left)
    const emeraldRimLight = new THREE.SpotLight('#34D399', 6.5, 22, Math.PI / 3, 0.85, 1.5);
    emeraldRimLight.position.set(-6.2, 3.2, -4.2);
    emeraldRimLight.target = orbitalSystemGroup;
    scene.add(emeraldRimLight);

    // Dedicated Champagne Gold Rim Light (back-right)
    const champagneRimLight = new THREE.SpotLight('#F2C368', 6.8, 22, Math.PI / 3, 0.85, 1.5);
    champagneRimLight.position.set(6.2, 3.0, -3.8);
    champagneRimLight.target = orbitalSystemGroup;
    scene.add(champagneRimLight);

    // Dynamic mutual point lights attached to each sphere so they cast colored light onto one another
    const emeraldPointLight = new THREE.PointLight('#34D399', 1.85, 7.5, 1.8);
    emeraldGroup.add(emeraldPointLight);

    const champagnePointLight = new THREE.PointLight('#F2C368', 1.85, 7.5, 1.8);
    champagneGroup.add(champagnePointLight);

    // =========================================================================
    // 6. LOCALIZED ATMOSPHERIC HALO & DARK REFLECTIVE SANCTUARY FLOOR
    // =========================================================================
    // Faint, localized atmospheric halo behind the orbital pair
    const haloGeo = new THREE.PlaneGeometry(13.5, 9.5);
    const haloMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uEmeraldPos: { value: new THREE.Vector3(-1.6, 0.4, 0) },
        uChampagnePos: { value: new THREE.Vector3(1.6, 0.4, 0) },
        uEmeraldColor: { value: new THREE.Color('#34D399') },
        uChampagneColor: { value: new THREE.Color('#F2C368') },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uEmeraldPos;
        uniform vec3 uChampagnePos;
        uniform vec3 uEmeraldColor;
        uniform vec3 uChampagneColor;
        varying vec3 vWorldPos;
        varying vec2 vUv;

        void main() {
          float dEmerald = length(vWorldPos.xy - uEmeraldPos.xy);
          float dChampagne = length(vWorldPos.xy - uChampagnePos.xy);
          float dCenter = length(vUv - vec2(0.5));

          float glowE = exp(-dEmerald * dEmerald * 0.26) * 0.052;
          float glowC = exp(-dChampagne * dChampagne * 0.26) * 0.048;
          float vignette = smoothstep(0.5, 0.12, dCenter);

          vec3 col = (uEmeraldColor * glowE + uChampagneColor * glowC) * vignette;
          float alpha = (glowE + glowC) * vignette;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, orbitCenterY, -2.6);
    scene.add(haloMesh);

    // Subtle dark matte-reflective floor beneath the spheres that computes real-time
    // soft pooled reflections and ambient contact occlusion directly under each sphere
    const floorY = -1.68;
    const floorGeo = new THREE.PlaneGeometry(24, 16);
    const floorMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uEmeraldPos: { value: new THREE.Vector3(-1.6, 0.4, 0) },
        uChampagnePos: { value: new THREE.Vector3(1.6, 0.4, 0) },
        uEmeraldColor: { value: new THREE.Color('#34D399') },
        uChampagneColor: { value: new THREE.Color('#F2C368') },
        uBaseColor: { value: new THREE.Color('#0B0F0D') },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uEmeraldPos;
        uniform vec3 uChampagnePos;
        uniform vec3 uEmeraldColor;
        uniform vec3 uChampagneColor;
        uniform vec3 uBaseColor;
        varying vec3 vWorldPos;

        void main() {
          // Horizontal distance on the floor plane from each sphere's nadir projection
          vec2 p = vWorldPos.xz;
          vec2 eXZ = uEmeraldPos.xz;
          vec2 cXZ = uChampagnePos.xz;

          float distE = length(p - eXZ);
          float distC = length(p - cXZ);
          float distOrigin = length(p * vec2(0.55, 0.85));

          // Height factor modulates reflection sharpness and occlusion intensity
          float hE = max(0.3, uEmeraldPos.y - (-1.68));
          float hC = max(0.3, uChampagnePos.y - (-1.68));

          // Soft pooled specular reflection lobes on the dark architectural floor
          float reflE = exp(-(distE * distE) / (1.35 + hE * 0.55)) * (0.14 / (0.6 + hE * 0.25));
          float reflC = exp(-(distC * distC) / (1.35 + hC * 0.55)) * (0.135 / (0.6 + hC * 0.25));

          // Restrained ambient occlusion directly beneath the spheres
          float aoE = exp(-(distE * distE) / 0.72) * (0.55 / (0.5 + hE * 0.35));
          float aoC = exp(-(distC * distC) / 0.72) * (0.55 / (0.5 + hC * 0.35));
          float contactShadow = clamp(aoE + aoC, 0.0, 0.68);

          // Radial fade so floor blends imperceptibly into #0B0F0D
          float radialMask = smoothstep(7.5, 1.2, distOrigin);

          vec3 reflectionColor = uEmeraldColor * reflE + uChampagneColor * reflC;
          // Darken core contact zone while keeping luminous reflection halo around it
          vec3 finalColor = mix(reflectionColor, uBaseColor * 0.25, contactShadow * 0.62);

          float alpha = clamp((reflE + reflC + contactShadow * 0.38) * radialMask, 0.0, 0.85);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, floorY, 0);
    scene.add(floorMesh);

    // =========================================================================
    // 7. SPARSE ILLUMINATED DUST MOTES (Only visible when near the spheres' light)
    // =========================================================================
    const particleCount = 38;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 1.6 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const ySpread = (Math.random() - 0.45) * 3.0;

      particlePositions[i * 3] = Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = orbitCenterY + ySpread;
      particlePositions[i * 3 + 2] = Math.sin(theta) * r * 0.75;

      particleSeeds[i * 3] = Math.random() * Math.PI * 2;
      particleSeeds[i * 3 + 1] = 0.4 + Math.random() * 0.8; // size factor
      particleSeeds[i * 3 + 2] = Math.random(); // color mix seed
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(particleSeeds, 3));

    const dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uEmeraldPos: { value: new THREE.Vector3(-1.6, 0.4, 0) },
        uChampagnePos: { value: new THREE.Vector3(1.6, 0.4, 0) },
        uEmeraldColor: { value: new THREE.Color('#34D399') },
        uChampagneColor: { value: new THREE.Color('#F2C368') },
      },
      vertexShader: `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform vec3 uEmeraldPos;
        uniform vec3 uChampagnePos;
        varying float vIllumE;
        varying float vIllumC;
        varying float vTwinkle;

        void main() {
          // Gentle slow drift
          vec3 pos = position;
          pos.x += sin(uTime * 0.22 + aSeed.x) * 0.18;
          pos.y += cos(uTime * 0.18 + aSeed.x * 1.3) * 0.16;
          pos.z += sin(uTime * 0.20 + aSeed.y * 3.0) * 0.18;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vec4 mvPosition = viewMatrix * worldPos;

          // Dust motes are only visible when illuminated by one of the two spheres
          float dE = length(worldPos.xyz - uEmeraldPos);
          float dC = length(worldPos.xyz - uChampagnePos);

          vIllumE = smoothstep(3.4, 1.05, dE);
          vIllumC = smoothstep(3.4, 1.05, dC);
          vTwinkle = 0.65 + 0.35 * sin(uTime * 0.9 + aSeed.x * 4.0);

          float totalIllum = clamp(vIllumE + vIllumC, 0.0, 1.0);
          gl_PointSize = (6.0 * aSeed.y * totalIllum + 1.5) * uPixelRatio * (8.5 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uEmeraldColor;
        uniform vec3 uChampagneColor;
        varying float vIllumE;
        varying float vIllumC;
        varying float vTwinkle;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float softCircle = pow(1.0 - dist * 2.0, 2.2);
          float totalLight = vIllumE + vIllumC;
          if (totalLight < 0.01) discard;

          vec3 moteColor = (uEmeraldColor * vIllumE + uChampagneColor * vIllumC) / max(totalLight, 0.001);
          moteColor = mix(moteColor, vec3(0.95, 0.97, 0.95), 0.35);

          float alpha = softCircle * clamp(totalLight, 0.0, 0.55) * vTwinkle * 0.42;
          gl_FragColor = vec4(moteColor, alpha);
        }
      `,
    });

    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // =========================================================================
    // 8. RESPONSIVE CAMERA FRAMING & INTERACTION HANDLERS
    // =========================================================================
    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);

    const updateCameraForViewport = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      const aspect = width / height;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      dustMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();

      camera.aspect = aspect;

      // Adapt camera distance & vertical framing so both orbiting spheres and negative space
      // remain comfortably inside the viewport across desktop, tablet, and narrow mobile screens
      if (aspect < 0.65) {
        baseCameraPos.set(0, 1.45, 13.6);
        lookAtTarget.set(0, -0.48, 0);
      } else if (aspect < 1.0) {
        baseCameraPos.set(0, 1.4, 11.4);
        lookAtTarget.set(0, -0.4, 0);
      } else {
        baseCameraPos.set(0, 1.32, 9.5);
        lookAtTarget.set(0, -0.32, 0);
      }

      camera.updateProjectionMatrix();
    };

    updateCameraForViewport();

    const resizeObserver = new ResizeObserver(() => {
      updateCameraForViewport();
    });
    resizeObserver.observe(container);

    const onPointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      pointerTarget.set(
        THREE.MathUtils.clamp(nx, -1, 1),
        THREE.MathUtils.clamp(ny, -1, 1)
      );
    };

    const onPointerLeave = () => {
      pointerTarget.set(0, 0);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Pause animation loop when browser tab is hidden to save battery/GPU
    let isTabHidden = document.hidden;
    const onVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (!isTabHidden) {
        lastFrameTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // =========================================================================
    // 9. DETERMINISTIC BINARY ORBITAL ANIMATION LOOP
    // =========================================================================
    // The two spheres revolve smoothly around a shared center on a tilted 3D plane
    // with an intimate periapsis/apoapsis breathing modulation.
    // Minimum center-to-center distance is strictly >= 2.86 units (exceeding 2 * 1.12 = 2.24 diameter),
    // guaranteeing they approach closely and exchange light without ever colliding or intersecting.
    const orbitTiltEuler = new THREE.Euler(0.24, 0.08, -0.21, 'XYZ');
    const worldPosA = new THREE.Vector3();
    const worldPosB = new THREE.Vector3();
    const localOrbitVec = new THREE.Vector3();

    let elapsedSeconds = 0;
    let lastFrameTime = performance.now();
    let animationFrameId = 0;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (isTabHidden) return;

      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      // Advance deterministic clock (respecting reduced-motion preference)
      const timeScale = prefersReducedMotion ? 0.12 : 1.0;
      elapsedSeconds += dt * timeScale;

      // Full orbital period ~ 28 seconds for a slow, hypnotic, sanctuary-like cadence
      const omega = (Math.PI * 2) / 28.0;
      const phase = elapsedSeconds * omega + 0.55; // Start at an attractive diagonal composition

      // Gentle breathing separation (semi-major / semi-minor modulation)
      // Radius from center ranges smoothly between 1.46 and 1.78 units (center-to-center 2.92 to 3.56 units)
      const radialBreath = 1.62 + 0.15 * Math.sin(elapsedSeconds * omega * 2.0);
      const localX = Math.cos(phase) * radialBreath;
      const localZ = Math.sin(phase) * (radialBreath * 0.88);
      // Restrained secondary vertical floating wave
      const localY = Math.sin(phase * 2.0 + 0.4) * 0.14;

      localOrbitVec.set(localX, localY, localZ).applyEuler(orbitTiltEuler);

      // Symmetric binary positions around shared orbital center
      emeraldGroup.position.copy(localOrbitVec);
      champagneGroup.position.copy(localOrbitVec).multiplyScalar(-1);

      // Subtle independent axial rotation on each sphere
      emeraldMesh.rotation.y = elapsedSeconds * 0.14;
      emeraldMesh.rotation.x = Math.sin(elapsedSeconds * 0.11) * 0.18;

      champagneMesh.rotation.y = -elapsedSeconds * 0.12 + 1.2;
      champagneMesh.rotation.z = Math.cos(elapsedSeconds * 0.1) * 0.16;

      // Update world coordinates for mutual cross-illumination, floor reflections & dust illumination
      emeraldGroup.getWorldPosition(worldPosA);
      champagneGroup.getWorldPosition(worldPosB);

      emeraldShaderUniforms.partnerWorldPos.value.copy(worldPosB);
      emeraldShaderUniforms.pulsePhase.value = elapsedSeconds * 1.1;

      champagneShaderUniforms.partnerWorldPos.value.copy(worldPosA);
      champagneShaderUniforms.pulsePhase.value = elapsedSeconds * 1.1 + 1.5;

      haloMat.uniforms.uEmeraldPos.value.copy(worldPosA);
      haloMat.uniforms.uChampagnePos.value.copy(worldPosB);

      floorMat.uniforms.uEmeraldPos.value.copy(worldPosA);
      floorMat.uniforms.uChampagnePos.value.copy(worldPosB);

      dustMat.uniforms.uTime.value = elapsedSeconds;
      dustMat.uniforms.uEmeraldPos.value.copy(worldPosA);
      dustMat.uniforms.uChampagnePos.value.copy(worldPosB);

      // Smooth damped pointer parallax
      const damping = 1 - Math.exp(-3.2 * dt);
      if (prefersReducedMotion) {
        pointerCurrent.set(0, 0);
      } else {
        pointerCurrent.lerp(pointerTarget, damping);
      }

      camera.position.x = baseCameraPos.x + pointerCurrent.x * 0.55;
      camera.position.y = baseCameraPos.y + pointerCurrent.y * 0.32;
      camera.position.z = baseCameraPos.z;
      camera.lookAt(
        lookAtTarget.x + pointerCurrent.x * 0.12,
        lookAtTarget.y + pointerCurrent.y * 0.08,
        lookAtTarget.z
      );

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // =========================================================================
    // 10. COMPLETE RESOURCE DISPOSAL & CLEANUP
    // =========================================================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);

      sphereGeometry.dispose();
      innerCoreGeometry.dispose();
      emeraldMaterial.dispose();
      emeraldCoreMat.dispose();
      champagneMaterial.dispose();
      champagneCoreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      normalMap.dispose();
      roughnessMap.dispose();
      envTexture.dispose();

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <main
      aria-label="A quiet place for two"
      className="relative w-full h-screen min-h-[540px] overflow-hidden select-none flex flex-col justify-between"
      style={{
        backgroundColor: '#0B0F0D',
        backgroundImage:
          'radial-gradient(circle at 46% 40%, rgba(52, 211, 153, 0.035) 0%, rgba(242, 195, 104, 0.025) 32%, rgba(11, 15, 13, 0) 70%)',
      }}
    >
      {/* Interactive 3D WebGL Sanctuary Stage */}
      {webglAvailable ? (
        <div
          ref={mountRef}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        />
      ) : (
        /* Graceful WebGL Fallback */
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: '#0B0F0D' }}
        >
          <div className="relative w-56 h-56 flex items-center justify-center mb-6">
            <div
              className="w-24 h-24 rounded-full -mr-3"
              style={{
                background:
                  'radial-gradient(circle at 32% 30%, #6EE7B7 0%, #34D399 42%, #0D3B2A 88%)',
                boxShadow: '0 0 48px rgba(52, 211, 153, 0.22)',
              }}
            />
            <div
              className="w-24 h-24 rounded-full -ml-3"
              style={{
                background:
                  'radial-gradient(circle at 32% 30%, #FEF08A 0%, #F2C368 45%, #4A3210 90%)',
                boxShadow: '0 0 48px rgba(242, 195, 104, 0.22)',
              }}
            />
          </div>
          <p
            className="text-xs tracking-widest uppercase opacity-50"
            style={{ color: '#EEF2EC' }}
          >
            Interactive 3D view requires WebGL
          </p>
        </div>
      )}

      {/* Top spacer to preserve negative space balance */}
      <div className="pointer-events-none h-12 sm:h-16" aria-hidden="true" />

      {/* Accessible, Selectable HTML Tagline anchored in the lower negative space */}
      <div className="relative z-10 w-full pb-12 sm:pb-16 md:pb-20 pt-6 px-6 flex justify-center pointer-events-none">
        <p
          className="pointer-events-auto select-text text-center font-extralight antialiased"
          style={{
            color: '#EEF2EC',
            fontFamily:
              '"Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 200,
            fontSize: 'clamp(1.05rem, 1.65vw, 1.375rem)',
            letterSpacing: '0.16em',
            lineHeight: 1.6,
            opacity: 0.92,
          }}
        >
          A quiet place for two.
        </p>
      </div>
    </main>
  );
}

export default App;