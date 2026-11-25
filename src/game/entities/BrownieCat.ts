import * as THREE from 'three';
import type { BrownieActionState } from '../types';

export interface BrownieAnimInput {
  action: BrownieActionState;
  speed: number;
  isMidnight: boolean;
  isPurring: boolean;
  isCatnip?: boolean;
  meowPulse: number;
  pounceCharge: number;
  lookPitch: number;
}

interface LegRig {
  hip: THREE.Group;
  lower: THREE.Group;
  front: boolean;
  baseX: number;
  baseY: number;
  baseZ: number;
  restHipX: number;
  restLowerX: number;
}

/**
 * Sleek, plush domestic ginger cat torso with outward-facing CCW winding.
 */
function buildFluffyTorsoGeometry(): THREE.BufferGeometry {
  // [z, centerY, halfWidth, topH, bottomD]
  const stations: Array<[number, number, number, number, number]> = [
    [-0.205, 0.015, 0.004, 0.004, 0.004],
    [-0.180, 0.014, 0.062, 0.056, 0.044],
    [-0.122, 0.006, 0.088, 0.078, 0.064], // plush rounded haunches
    [-0.040, 0.004, 0.078, 0.074, 0.056], // natural slim feline waist
    [0.042, 0.003, 0.090, 0.080, 0.072],  // soft fluffy chest
    [0.112, 0.018, 0.080, 0.072, 0.064],  // sleek shoulders
    [0.160, 0.044, 0.056, 0.052, 0.048],  // natural cat neck
    [0.186, 0.062, 0.004, 0.004, 0.004],
  ];

  const radialSegs = 28;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s < stations.length; s++) {
    const [z, cy, hw, topH, botD] = stations[s];
    const v = s / (stations.length - 1);
    const endFade = Math.sin(v * Math.PI);
    for (let r = 0; r <= radialSegs; r++) {
      const u = r / radialSegs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      // Gentle soft longhair fur fullness
      const lockWave =
        (Math.sin(theta * 8 + v * 4.0) * 0.0030 + Math.cos(theta * 5 - v * 5.0) * 0.0020) *
        endFade *
        (sinT < 0.2 ? 1.15 : 0.7);

      const x = cosT * (hw + lockWave) * (sinT < 0 ? 0.94 : 1.0);
      const y =
        sinT >= 0
          ? cy + Math.pow(sinT, 0.92) * (topH + lockWave * 0.45)
          : cy - Math.pow(-sinT, 0.88) * (botD + lockWave * 0.75);

      positions.push(x, y, z);
      uvs.push(v, 0.5 + sinT * 0.5);
    }
  }

  // CCW outward normals: (b - a) x (c - a) = (+Y) x (+Z) = +X at theta = 0
  const stride = radialSegs + 1;
  for (let s = 0; s < stations.length - 1; s++) {
    for (let r = 0; r < radialSegs; r++) {
      const a = s * stride + r;
      const b = a + 1;
      const c = (s + 1) * stride + r;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Cute, smooth fluffy cat head with soft round Persian cheeks and gentle muzzle blend.
 * Seamless UV wrap centered at u = 0.5 on +Z (front face), seam-free at back (-Z).
 */
function buildPersianHeadGeometry(): THREE.BufferGeometry {
  const latSegs = 28;
  const lonSegs = 40;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= latSegs; i++) {
    const phi = (i / latSegs) * Math.PI; // 0 = crown (+Y), PI = chin (-Y)
    const sinP = Math.sin(phi);
    const cosP = Math.cos(phi);

    for (let j = 0; j <= lonSegs; j++) {
      const u = j / lonSegs;
      const theta = -Math.PI + u * Math.PI * 2; // 0 at u=0.5 (+Z front), +-PI at back (-Z)
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const nx = sinP * sinT;
      const ny = cosP;
      const nz = sinP * cosT;

      // Balanced cute domestic feline cranium with soft rounded cheeks
      let rx = 0.080;
      let ry = 0.068;
      let rz = 0.076;

      // Soft lower cheek fluff (adorable rounded cat face, zero harsh ridges)
      const cheekBand = Math.exp(-Math.pow((ny + 0.14) / 0.34, 2));
      const cheekSide = Math.pow(Math.max(0, Math.abs(nx) - 0.30), 1.2);
      rx += 0.011 * cheekSide * cheekBand;

      // Gentle front facial plane & smooth feline muzzle
      if (nz > 0.25) {
        const frontFace = THREE.MathUtils.smoothstep(nz, 0.25, 0.92);

        // Very subtle eye sockets so big cute eyes sit naturally without clipping
        const socketL = Math.exp(-((nx + 0.38) ** 2 + (ny - 0.09) ** 2) / 0.052);
        const socketR = Math.exp(-((nx - 0.38) ** 2 + (ny - 0.09) ** 2) / 0.052);
        rz -= 0.005 * (socketL + socketR) * frontFace;

        // Smooth cute nose bridge & snout cushion
        const bridge = Math.exp(-((nx / 0.15) ** 2 + ((ny - 0.0) / 0.25) ** 2));
        const snoutBox = Math.exp(-((nx / 0.26) ** 2 + ((ny + 0.24) / 0.26) ** 2));
        rz += (0.006 * bridge + 0.011 * snoutBox) * frontFace;
      }

      // Soft subtle fur fluff around sides/back of head
      const outerMask = 1.0 - THREE.MathUtils.smoothstep(nz, 0.15, 0.65);
      const furRelief =
        (Math.sin(theta * 9 + phi * 4) * 0.0024 + Math.cos(theta * 6 - phi * 7) * 0.0016) *
        outerMask *
        sinP;

      const x = nx * (rx + furRelief);
      const y = ny * (ry + furRelief * 0.6);
      const z = nz * (rz + furRelief * 0.7);

      positions.push(x, y, z);
      uvs.push(u, 1.0 - i / latSegs);
    }
  }

  // CCW outward normals: (c - a) x (b - a) = (-Y) x (+X) = +Z at theta = 0
  const stride = lonSegs + 1;
  for (let i = 0; i < latSegs; i++) {
    for (let j = 0; j < lonSegs; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Soft plush chest fluff bib tapering cleanly between the front legs.
 */
function buildShaggyManeGeometry(): THREE.BufferGeometry {
  const latSegs = 20;
  const lonSegs = 32;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= latSegs; i++) {
    const t = i / latSegs;
    const phi = t * Math.PI;
    const sinP = Math.sin(phi);
    const cosP = Math.cos(phi);

    for (let j = 0; j <= lonSegs; j++) {
      const u = j / lonSegs;
      const theta = -Math.PI + u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const lockRipple =
        (Math.sin(theta * 9) * 0.0048 + Math.cos(theta * 15 + t * 2.5) * 0.0024) *
        Math.sin(t * Math.PI);

      const frontBias = Math.max(0, cosT);
      const bibDrop = frontBias * 0.032 * Math.sin(t * Math.PI * 0.9);
      const rx = 0.084 * (0.58 + 0.42 * sinP) + lockRipple;
      const rz = 0.058 * (0.58 + 0.42 * sinP) + frontBias * 0.018 * sinP + lockRipple * 0.6;

      const x = sinT * rx;
      const y = cosP * 0.044 - bibDrop - t * 0.018;
      const z = cosT * rz;

      positions.push(x, y, z);
      uvs.push(u, 1.0 - t);
    }
  }

  const stride = lonSegs + 1;
  for (let i = 0; i < latSegs; i++) {
    for (let j = 0; j < lonSegs; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Handsome broad feline triangular ear with subtle lynx tip */
function buildCatEarGeometry(scale = 1.0): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.032 * scale, 0);
  s.quadraticCurveTo(-0.025 * scale, 0.034 * scale, -0.005 * scale, 0.060 * scale);
  s.quadraticCurveTo(0, 0.066 * scale, 0.005 * scale, 0.060 * scale);
  s.quadraticCurveTo(0.025 * scale, 0.034 * scale, 0.032 * scale, 0);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.014 * scale,
    bevelEnabled: true,
    bevelThickness: 0.005 * scale,
    bevelSize: 0.004 * scale,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.center();
  return geo;
}

/** Cute rounded inverted-triangle cat nose */
function buildCatNoseGeometry(): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.010, 0.0048);
  s.quadraticCurveTo(0, 0.0068, 0.010, 0.0048);
  s.quadraticCurveTo(0.009, -0.0022, 0.0022, -0.0068);
  s.quadraticCurveTo(0, -0.0085, -0.0022, -0.0068);
  s.quadraticCurveTo(-0.009, -0.0022, -0.010, 0.0048);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.0055,
    bevelEnabled: true,
    bevelThickness: 0.0025,
    bevelSize: 0.002,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.center();
  return geo;
}

export class BrownieCat {
  public readonly root = new THREE.Group();
  public readonly mouthAnchor = new THREE.Object3D();

  private readonly bodyRig = new THREE.Group();
  private readonly torsoVisualGroup = new THREE.Group();
  private readonly headGroup = new THREE.Group();
  private readonly pelvisGroup = new THREE.Group();
  private readonly legs: LegRig[] = [];
  private readonly tailSegments: THREE.Group[] = [];
  private readonly earL = new THREE.Group();
  private readonly earR = new THREE.Group();
  private readonly eyeHolderL = new THREE.Group();
  private readonly eyeHolderR = new THREE.Group();
  private readonly upperLidL = new THREE.Group();
  private readonly upperLidR = new THREE.Group();
  private readonly jawGroup = new THREE.Group();
  private readonly ruffGroup = new THREE.Group();
  private readonly shadowDisc: THREE.Mesh | null = null;
  private readonly pupilUniform = { value: 0.64 };

  private gaitTime = 0;
  private idleBlinkTimer = 2.8;
  private blinkAmount = 0;

  constructor(
    bodyFurTex: THREE.Texture,
    faceFurTex: THREE.Texture,
    _furAlphaTuft: THREE.Texture,
    _eyeTex: THREE.Texture,
    contactShadowTex?: THREE.Texture,
    ruffFurTex?: THREE.Texture,
    furBumpTex?: THREE.Texture,
  ) {
    this.root.name = 'BrownieCat';
    this.root.scale.setScalar(0.86);

    if (contactShadowTex) {
      const sMat = new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.56,
      });
      this.shadowDisc = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.54), sMat);
      this.shadowDisc.rotation.x = -Math.PI / 2;
      this.shadowDisc.position.set(0, 0.008, -0.01);
      this.root.add(this.shadowDisc);
    }

    const bodyCoatMat = new THREE.MeshStandardMaterial({
      map: bodyFurTex,
      bumpMap: furBumpTex ?? null,
      bumpScale: 0.009,
      color: 0xffffff,
      roughness: 0.88,
      metalness: 0.0,
    });

    const faceCoatMat = new THREE.MeshStandardMaterial({
      map: faceFurTex,
      bumpMap: furBumpTex ?? null,
      bumpScale: 0.008,
      color: 0xffffff,
      roughness: 0.86,
      metalness: 0.0,
    });

    const shaggyManeMat = new THREE.MeshStandardMaterial({
      map: ruffFurTex ?? null,
      bumpMap: furBumpTex ?? null,
      bumpScale: 0.010,
      color: ruffFurTex ? 0xffffff : 0xebb268,
      roughness: 0.90,
    });

    const richGingerMat = new THREE.MeshStandardMaterial({
      color: 0xd98032,
      bumpMap: furBumpTex ?? null,
      bumpScale: 0.008,
      roughness: 0.88,
    });

    const warmOrangeAmberMat = new THREE.MeshStandardMaterial({
      color: 0xf4c586,
      bumpMap: furBumpTex ?? null,
      bumpScale: 0.008,
      roughness: 0.89,
    });

    const earOuterMat = new THREE.MeshStandardMaterial({
      color: 0xc96e22,
      bumpMap: furBumpTex ?? null,
      bumpScale: 0.008,
      roughness: 0.88,
    });

    const innerEarMat = new THREE.MeshStandardMaterial({
      color: 0xeba9a0,
      roughness: 0.82,
    });

    const earWispMat = new THREE.MeshStandardMaterial({
      color: 0xfae0b2,
      roughness: 0.92,
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xeb8a8e,
      roughness: 0.38,
    });

    const eyeLinerMat = new THREE.MeshStandardMaterial({
      color: 0x261409,
      roughness: 0.35,
    });

    // Adorable, soulful, big glossy honey-amber cat eyes with double specular catchlights
    const eyeballMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.06,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
    });
    eyeballMat.onBeforeCompile = (shader) => {
      shader.uniforms.uPupilWidth = this.pupilUniform;
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
varying vec3 vEyeLocal;`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
vEyeLocal = position;`,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
varying vec3 vEyeLocal;
uniform float uPupilWidth;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
{
  vec2 ep = vEyeLocal.xy / 0.0175;
  float er = length(ep);
  float frontMask = smoothstep(-0.001, 0.002, vEyeLocal.z);

  float eAngle = atan(ep.y, ep.x);
  float fibers = 0.90 + 0.10 * sin(eAngle * 24.0 + sin(er * 10.0) * 1.1);
  vec3 innerHoney = vec3(0.95, 0.62, 0.18);
  vec3 midAmber = vec3(0.68, 0.34, 0.07);
  vec3 outerLimbal = vec3(0.14, 0.06, 0.02);

  vec3 irisCol = mix(innerHoney, midAmber, smoothstep(0.24, 0.66, er));
  irisCol *= fibers;
  irisCol = mix(irisCol, outerLimbal, smoothstep(0.72, 0.90, er));

  // Soft cute round-almond pupil
  float pyNorm = ep.y / 0.74;
  float ay = clamp(abs(pyNorm), 0.0, 1.0);
  float halfW = uPupilWidth * sqrt(max(0.01, 1.0 - ay * ay * 0.78));
  float slitDist = length(vec2(ep.x / max(0.08, halfW), pyNorm));
  float pupilMask = (1.0 - smoothstep(0.86, 1.02, slitDist)) * frontMask;

  vec3 rimDark = vec3(0.09, 0.04, 0.02);
  vec3 eyeCol = mix(irisCol, rimDark, smoothstep(0.86, 0.96, er));
  eyeCol = mix(eyeCol, rimDark, 1.0 - frontMask);
  eyeCol = mix(eyeCol, vec3(0.014, 0.010, 0.010), pupilMask);

  // Cute glossy double catchlight sparkles
  float catchMain = (1.0 - smoothstep(0.06, 0.17, length(ep - vec2(-0.27, 0.27)))) * frontMask;
  float catchSub = (1.0 - smoothstep(0.03, 0.09, length(ep - vec2(0.23, -0.22)))) * frontMask;
  eyeCol = mix(eyeCol, vec3(1.0, 0.98, 0.94), max(catchMain * 0.90, catchSub * 0.55));

  diffuseColor.rgb = eyeCol;
}`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
{
  vec2 ep = vEyeLocal.xy / 0.0175;
  float er = length(ep);
  float frontMask = smoothstep(-0.001, 0.002, vEyeLocal.z);
  float pyNorm = ep.y / 0.74;
  float ay = clamp(abs(pyNorm), 0.0, 1.0);
  float halfW = uPupilWidth * sqrt(max(0.01, 1.0 - ay * ay * 0.78));
  float slitDist = length(vec2(ep.x / max(0.08, halfW), pyNorm));
  float pupilMask = (1.0 - smoothstep(0.86, 1.02, slitDist)) * frontMask;
  float irisGlowMask = (1.0 - smoothstep(0.58, 0.86, er)) * (1.0 - pupilMask) * frontMask;
  totalEmissiveRadiance += vec3(0.75, 0.42, 0.10) * irisGlowMask * 0.24;
}`,
        );
    };

    const whiskerMat = new THREE.MeshStandardMaterial({ color: 0xfcf4e8, roughness: 0.42 });

    // Pivot sits at natural sleek domestic cat standing height (~0.155m above ground)
    this.bodyRig.position.set(0, 0.155, 0);
    this.root.add(this.bodyRig);
    this.bodyRig.add(this.torsoVisualGroup);

    // 1. Sleek Plush Ginger Cat Torso
    const torsoGeo = buildFluffyTorsoGeometry();
    const torso = new THREE.Mesh(torsoGeo, bodyCoatMat);
    torso.castShadow = true;
    torso.receiveShadow = true;
    this.torsoVisualGroup.add(torso);

    this.pelvisGroup.position.set(0, 0.022, -0.172);
    this.bodyRig.add(this.pelvisGroup);

    // 2. Soft Plush Persian Chest Fluff Bib (no spiky collar)
    this.ruffGroup.position.set(0, 0.048, 0.134);
    this.bodyRig.add(this.ruffGroup);

    const chestManeMesh = new THREE.Mesh(buildShaggyManeGeometry(), shaggyManeMat);
    chestManeMesh.position.set(0, -0.014, 0.004);
    chestManeMesh.rotation.x = 0.22;
    chestManeMesh.castShadow = true;
    chestManeMesh.receiveShadow = true;
    this.ruffGroup.add(chestManeMesh);

    // 3. Cute Smooth Persian Cat Head
    this.headGroup.position.set(0, 0.102, 0.174);
    this.bodyRig.add(this.headGroup);

    const headMesh = new THREE.Mesh(buildPersianHeadGeometry(), faceCoatMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Cute tucked ':3' whisker pads blending softly into the muzzle
    for (const side of [-1, 1]) {
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.0165, 14, 10), warmOrangeAmberMat);
      pad.position.set(side * 0.0135, -0.019, 0.070);
      pad.scale.set(1.02, 0.78, 0.72);
      pad.rotation.y = side * 0.24;
      this.headGroup.add(pad);
    }

    // Soft cute chin tucked cleanly beneath the whisker pads
    this.jawGroup.position.set(0, -0.032, 0.062);
    this.headGroup.add(this.jawGroup);
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.0145, 12, 10), warmOrangeAmberMat);
    chin.scale.set(1.06, 0.56, 0.80);
    this.jawGroup.add(chin);

    this.mouthAnchor.position.set(0, -0.025, 0.098);
    this.headGroup.add(this.mouthAnchor);

    // Cute tiny dusty-pink triangle nose
    const nose = new THREE.Mesh(buildCatNoseGeometry(), noseMat);
    nose.scale.setScalar(0.88);
    nose.position.set(0, -0.009, 0.090);
    this.headGroup.add(nose);

    // Big, Sweet, Open Cute Amber Eyes
    const buildCatEye = (side: number, eyeHolder: THREE.Group, upperLid: THREE.Group) => {
      eyeHolder.position.set(side * 0.0305, 0.010, 0.0685);
      eyeHolder.rotation.y = side * 0.18;
      eyeHolder.scale.set(1.02, 1.02, 0.88);

      const eyeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.0175, 28, 22), eyeballMat);
      eyeHolder.add(eyeSphere);

      const upperLidShell = new THREE.Mesh(
        new THREE.SphereGeometry(0.0186, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.50),
        richGingerMat,
      );
      upperLid.add(upperLidShell);
      const upperLash = new THREE.Mesh(
        new THREE.TorusGeometry(0.0187, 0.00075, 6, 22, Math.PI),
        eyeLinerMat,
      );
      upperLash.rotation.x = Math.PI / 2;
      upperLid.add(upperLash);
      upperLid.rotation.x = -0.80;
      upperLid.rotation.z = side * 0.02;
      eyeHolder.add(upperLid);

      const lowerLid = new THREE.Group();
      const lowerLidShell = new THREE.Mesh(
        new THREE.SphereGeometry(0.0185, 24, 10, 0, Math.PI * 2, Math.PI * 0.50, Math.PI * 0.50),
        warmOrangeAmberMat,
      );
      lowerLid.add(lowerLidShell);
      const lowerLash = new THREE.Mesh(
        new THREE.TorusGeometry(0.0186, 0.0006, 6, 22, Math.PI),
        eyeLinerMat,
      );
      lowerLash.rotation.x = Math.PI / 2;
      lowerLid.add(lowerLash);
      lowerLid.rotation.x = 0.84;
      lowerLid.rotation.z = side * 0.02;
      eyeHolder.add(lowerLid);

      this.headGroup.add(eyeHolder);
    };

    buildCatEye(-1, this.eyeHolderL, this.upperLidL);
    buildCatEye(1, this.eyeHolderR, this.upperLidR);

    // Cute Pointed Triangular Ears with Golden-Cream Furnishings & Ear Tip Tufts
    const earOuterGeo = buildCatEarGeometry(0.95);
    const earInnerGeo = buildCatEarGeometry(0.58);
    const lynxTipGeo = new THREE.ConeGeometry(0.0036, 0.016, 6);
    const earWispGeo = new THREE.ConeGeometry(0.0045, 0.024, 6);
    const buildEar = (side: number, earGroup: THREE.Group) => {
      earGroup.position.set(side * 0.052, 0.050, -0.004);
      earGroup.rotation.z = -side * 0.30;
      earGroup.rotation.y = side * 0.16;
      earGroup.rotation.x = 0.08;

      const outer = new THREE.Mesh(earOuterGeo, earOuterMat);
      outer.position.y = 0.024;
      outer.castShadow = true;
      earGroup.add(outer);

      const inner = new THREE.Mesh(earInnerGeo, innerEarMat);
      inner.position.set(0, 0.020, 0.007);
      earGroup.add(inner);

      const tipTuft = new THREE.Mesh(lynxTipGeo, earWispMat);
      tipTuft.position.set(side * 0.001, 0.056, 0.0);
      tipTuft.rotation.z = -side * 0.14;
      earGroup.add(tipTuft);

      for (let f = 0; f < 2; f++) {
        const wisp = new THREE.Mesh(earWispGeo, earWispMat);
        wisp.position.set(-side * (0.008 + f * 0.005), 0.016 + f * 0.011, 0.007);
        wisp.rotation.z = side * (1.05 + f * 0.24);
        earGroup.add(wisp);
      }

      this.headGroup.add(earGroup);
    };
    buildEar(-1, this.earL);
    buildEar(1, this.earR);

    // Long Softly Curving White Whiskers rooted cleanly in whisker pads
    const whiskerGeo = new THREE.CylinderGeometry(0.00022, 0.00065, 0.088, 4);
    whiskerGeo.translate(0, 0.044, 0);
    for (const side of [-1, 1]) {
      for (let w = 0; w < 4; w++) {
        const whisker = new THREE.Mesh(whiskerGeo, whiskerMat);
        whisker.position.set(side * 0.017, -0.019 + (w - 1.5) * 0.0028, 0.075);
        whisker.rotation.z = -side * (Math.PI / 2 + 0.10 + w * 0.07);
        whisker.rotation.y = -side * (0.04 + w * 0.03);
        this.headGroup.add(whisker);
      }
    }

    // 4. Clean Proportional Cat Legs & Soft Paws
    const legSpecs: Array<[number, number, number, boolean]> = [
      [-0.052, -0.010, 0.098, true],
      [0.052, -0.010, 0.098, true],
      [-0.056, -0.002, -0.118, false],
      [0.056, -0.002, -0.118, false],
    ];
    for (const [lx, ly, lz, isFront] of legSpecs) {
      const hip = new THREE.Group();
      hip.position.set(lx, ly, lz);

      const restHipX = isFront ? 0.08 : -0.34;
      const restLowerX = isFront ? -0.08 : 0.52;
      hip.rotation.x = restHipX;

      const upper = new THREE.Mesh(
        new THREE.CapsuleGeometry(isFront ? 0.030 : 0.039, isFront ? 0.052 : 0.056, 8, 12),
        isFront ? shaggyManeMat : richGingerMat,
      );
      upper.scale.set(isFront ? 1.0 : 0.92, 1.0, isFront ? 1.04 : 1.18);
      upper.position.y = -0.034;
      upper.castShadow = true;
      hip.add(upper);

      const lower = new THREE.Group();
      lower.position.set(0, -0.068, 0);
      lower.rotation.x = restLowerX;
      hip.add(lower);

      const ankle = new THREE.Mesh(
        new THREE.CapsuleGeometry(isFront ? 0.024 : 0.023, isFront ? 0.044 : 0.048, 8, 12),
        warmOrangeAmberMat,
      );
      ankle.position.y = -0.030;
      ankle.castShadow = true;
      lower.add(ankle);

      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.027, 12, 10), warmOrangeAmberMat);
      paw.position.set(0, -0.058, 0.012);
      paw.scale.set(1.06, 0.62, 1.24);
      paw.castShadow = true;
      lower.add(paw);

      this.bodyRig.add(hip);
      this.legs.push({
        hip,
        lower,
        front: isFront,
        baseX: lx,
        baseY: ly,
        baseZ: lz,
        restHipX,
        restLowerX,
      });
    }

    // 5. Lush Continuous Bottlebrush Ginger Plume Tail
    let parentObj: THREE.Object3D = this.pelvisGroup;
    for (let i = 0; i < 10; i++) {
      const seg = new THREE.Group();
      seg.position.set(0, i === 0 ? 0.020 : 0, i === 0 ? -0.022 : -0.028);

      const bell = Math.sin(((i + 1) / 10) * Math.PI * 0.88);
      const r = 0.025 + bell * 0.018 - i * 0.0010;
      const mat = i >= 8 ? warmOrangeAmberMat : i <= 2 ? richGingerMat : bodyCoatMat;
      const plume = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.018, r), 12, 10), mat);
      plume.scale.set(1.04, 1.02, 1.62);
      plume.position.set(0, 0, -0.014);
      plume.castShadow = true;
      seg.add(plume);

      parentObj.add(seg);
      this.tailSegments.push(seg);
      parentObj = seg;
    }
  }

  public update(dt: number, input: BrownieAnimInput) {
    const t = performance.now() * 0.001;
    const { action, speed, isMidnight, isPurring, isCatnip, meowPulse, pounceCharge, lookPitch } = input;

    if (this.shadowDisc) {
      this.shadowDisc.visible = action !== 'curtain_climb' && action !== 'shoulder_goblin' && action !== 'sit_in';
      const sScale = action === 'jump' ? 0.68 : action === 'loaf' ? 1.14 : 1.0;
      this.shadowDisc.scale.setScalar(sScale);
    }

    this.idleBlinkTimer -= dt;
    if (this.idleBlinkTimer <= 0) {
      this.blinkAmount = 1;
      this.idleBlinkTimer = 2.6 + Math.random() * 3.4;
    }
    this.blinkAmount = Math.max(0, this.blinkAmount - dt * 6.8);

    const happySquint =
      action === 'loaf' || action === 'knead' || action === 'groom' || isPurring;
    const openLidAngle = happySquint ? -0.44 : -0.80;
    const targetLidRotX = THREE.MathUtils.lerp(openLidAngle, 0.42, this.blinkAmount);
    this.upperLidL.rotation.x = THREE.MathUtils.damp(this.upperLidL.rotation.x, targetLidRotX, 18, dt);
    this.upperLidR.rotation.x = this.upperLidL.rotation.x;

    const extraDilated =
      isMidnight ||
      isCatnip ||
      meowPulse > 0.1 ||
      action === 'peek' ||
      action === 'pounce_charge' ||
      action === 'pounce_attack' ||
      action === 'scratch' ||
      action === 'zoomies' ||
      action === 'wall_stare' ||
      action === 'curtain_climb';
    const targetPupilW = extraDilated ? 0.80 : 0.64;
    this.pupilUniform.value = THREE.MathUtils.damp(this.pupilUniform.value, targetPupilW, 7.5, dt);

    const jawOpen =
      action === 'drink'
        ? Math.max(0, Math.sin(t * 11.5)) * 0.32
        : action === 'groom'
          ? Math.max(0, Math.sin(t * 6.5)) * 0.24
          : meowPulse * 0.45;
    this.jawGroup.rotation.x = THREE.MathUtils.damp(this.jawGroup.rotation.x, jawOpen, 18, dt);

    let bodyY = 0.155;
    let bodyPitch = 0;
    let bodyRoll = 0;
    let torsoScaleX = 1.0;
    let torsoScaleY = 1.0;
    let torsoScaleZ = 1.0;
    let headY = 0.102;
    let headZ = 0.174;
    let headPitch = THREE.MathUtils.clamp(-lookPitch * 0.42, -0.42, 0.38);
    let headYaw = 0;
    let ruffScale = 1.0;

    if (action === 'loaf') {
      bodyY = 0.072;
      torsoScaleX = 1.12;
      torsoScaleY = 0.85;
      torsoScaleZ = 0.94;
      headY = 0.088;
      headZ = 0.162;
      headPitch = 0.04;
    } else if (action === 'knead') {
      bodyY = 0.120 + Math.abs(Math.sin(t * 5.4)) * 0.008;
      bodyPitch = 0.14;
      bodyRoll = Math.sin(t * 5.4) * 0.06;
      headY = 0.088;
      headZ = 0.162;
      headPitch = 0.18;
    } else if (action === 'groom') {
      bodyY = 0.122;
      bodyPitch = -0.46;
      bodyRoll = Math.sin(t * 6.5) * 0.05;
      torsoScaleZ = 0.94;
      headY = 0.090 + Math.sin(t * 6.5) * 0.012;
      headZ = 0.152;
      headPitch = 0.50 + Math.sin(t * 6.5) * 0.16;
      headYaw = -0.20;
    } else if (action === 'scratch') {
      bodyY = 0.175 + Math.abs(Math.sin(t * 14.0)) * 0.018;
      bodyPitch = -0.52;
      bodyRoll = Math.sin(t * 14.0) * 0.08;
      headY = 0.116;
      headZ = 0.156;
      headPitch = 0.24;
      ruffScale = 1.06;
    } else if (action === 'drink') {
      bodyY = 0.128;
      bodyPitch = 0.28;
      headY = 0.028 + Math.sin(t * 11.5) * 0.012;
      headZ = 0.172;
      headPitch = 0.42 + Math.sin(t * 11.5) * 0.12;
    } else if (action === 'pounce_attack') {
      bodyY = 0.185;
      bodyPitch = -0.30;
      headY = 0.100;
      headZ = 0.172;
      headPitch = -0.14;
      ruffScale = 1.08;
    } else if (action === 'sit_in') {
      bodyY = 0.084;
      bodyPitch = -0.64;
      torsoScaleX = 0.96;
      torsoScaleY = 0.94;
      torsoScaleZ = 0.88;
      headY = 0.124;
      headZ = 0.146;
      headPitch = 0.52;
    } else if (action === 'crouch' || action === 'peek') {
      bodyY = 0.102;
      headY = action === 'peek' ? 0.106 : 0.074;
      headZ = 0.170;
      bodyPitch = 0.06;
    } else if (action === 'pounce_charge') {
      bodyY = 0.098;
      bodyPitch = 0.16;
      bodyRoll = Math.sin(t * 28) * 0.13 * Math.max(0.25, pounceCharge);
      headY = 0.070;
      headPitch = -0.18;
    } else if (action === 'jump') {
      bodyY = 0.195;
      bodyPitch = -0.18;
    } else if (action === 'curtain_climb') {
      bodyY = 0.165;
      bodyPitch = -1.12;
      headPitch = 0.50;
    } else if (action === 'shoulder_goblin') {
      bodyY = 0.132;
      bodyPitch = 0.12;
      headPitch = -0.12;
    } else if (action === 'wall_stare') {
      bodyY = 0.152;
      bodyPitch = -0.24;
      headPitch = -0.32;
    }

    if (action === 'zoomies' || isCatnip) ruffScale = 1.1;

    const moving =
      speed > 0.12 &&
      (action === 'walk' || action === 'trot' || action === 'zoomies' || action === 'crouch' || action === 'peek');
    if (moving) {
      const rate = action === 'zoomies' ? 16.5 : action === 'trot' ? 11.5 : 7.5;
      this.gaitTime += dt * rate;
      if (action === 'zoomies') {
        bodyY += Math.abs(Math.sin(this.gaitTime)) * 0.034;
        bodyPitch += Math.cos(this.gaitTime) * 0.1;
      } else {
        bodyY += Math.abs(Math.sin(this.gaitTime)) * 0.014;
      }
    } else {
      bodyY += Math.sin(t * 2.2) * 0.004;
    }

    this.bodyRig.position.y = THREE.MathUtils.damp(this.bodyRig.position.y, bodyY, 14, dt);
    this.bodyRig.rotation.x = THREE.MathUtils.damp(this.bodyRig.rotation.x, bodyPitch, 12, dt);
    this.bodyRig.rotation.z = THREE.MathUtils.damp(this.bodyRig.rotation.z, bodyRoll, 16, dt);
    this.torsoVisualGroup.scale.x = THREE.MathUtils.damp(this.torsoVisualGroup.scale.x, torsoScaleX, 12, dt);
    this.torsoVisualGroup.scale.y = THREE.MathUtils.damp(this.torsoVisualGroup.scale.y, torsoScaleY, 12, dt);
    this.torsoVisualGroup.scale.z = THREE.MathUtils.damp(this.torsoVisualGroup.scale.z, torsoScaleZ, 12, dt);
    this.headGroup.position.y = THREE.MathUtils.damp(this.headGroup.position.y, headY, 12, dt);
    this.headGroup.position.z = THREE.MathUtils.damp(this.headGroup.position.z, headZ, 12, dt);
    this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, headPitch, 12, dt);
    this.headGroup.rotation.y = THREE.MathUtils.damp(this.headGroup.rotation.y, headYaw, 12, dt);
    this.ruffGroup.scale.setScalar(THREE.MathUtils.damp(this.ruffGroup.scale.x, ruffScale, 10, dt));

    this.legs.forEach((leg, idx) => {
      let targetHipX = leg.restHipX;
      let targetLowerX = leg.restLowerX;
      let targetScale = 1;
      let targetPosX = leg.baseX;
      let targetPosY = leg.baseY;
      let targetPosZ = leg.baseZ;

      if (action === 'loaf') {
        targetHipX = leg.front ? 1.35 : -1.35;
        targetLowerX = leg.front ? -1.35 : 1.35;
        targetScale = 0.16;
        targetPosX = Math.sign(leg.baseX) * 0.018;
        targetPosY = 0.014;
      } else if (action === 'knead') {
        if (leg.front) {
          const kPhase = idx === 0 ? t * 5.4 : t * 5.4 + Math.PI;
          targetHipX = -0.35 + Math.sin(kPhase) * 0.42;
          targetLowerX = 0.25 + Math.max(0, Math.cos(kPhase)) * 0.42;
        } else {
          targetHipX = -1.25;
          targetLowerX = 1.25;
          targetScale = 0.52;
        }
      } else if (action === 'groom') {
        if (leg.front && idx === 1) {
          targetHipX = -1.48 + Math.sin(t * 6.5) * 0.22;
          targetLowerX = -0.62;
          targetPosX = 0.028;
          targetPosY = 0.012;
        } else if (leg.front) {
          targetHipX = 0.44;
          targetLowerX = 0.06;
        } else {
          targetHipX = -1.3;
          targetLowerX = 1.3;
          targetScale = 0.44;
          targetPosY = 0.01;
        }
      } else if (action === 'scratch') {
        if (leg.front) {
          const sPhase = idx === 0 ? t * 14.0 : t * 14.0 + Math.PI;
          targetHipX = -1.1 + Math.sin(sPhase) * 0.55;
          targetLowerX = 0.45 + Math.cos(sPhase) * 0.35;
        } else {
          targetHipX = -0.55;
          targetLowerX = 0.65;
        }
      } else if (action === 'drink') {
        targetHipX = leg.front ? 0.36 : -0.32;
        targetLowerX = leg.front ? -0.36 : 0.52;
      } else if (action === 'pounce_attack') {
        targetHipX = leg.front ? -1.25 : 0.72;
        targetLowerX = leg.front ? 0.25 : 0.25;
      } else if (action === 'sit_in') {
        if (leg.front) {
          targetHipX = 0.62;
          targetLowerX = 0.24;
          targetScale = 0.68;
          targetPosX = Math.sign(leg.baseX) * 0.032;
          targetPosY = -0.01;
          targetPosZ = 0.088;
        } else {
          targetHipX = -1.35;
          targetLowerX = 1.3;
          targetScale = 0.34;
          targetPosX = Math.sign(leg.baseX) * 0.03;
          targetPosY = 0.012;
        }
      } else if (action === 'jump') {
        targetHipX = leg.front ? -0.75 : 0.68;
        targetLowerX = 0.25;
      } else if (action === 'curtain_climb') {
        targetHipX = Math.sin(t * 16 + idx * 1.6) * 0.75;
        targetLowerX = -0.35;
      } else if (moving) {
        const phase = idx === 0 ? 0 : idx === 3 ? 0.3 : idx === 1 ? Math.PI : Math.PI + 0.3;
        const amp = action === 'zoomies' ? 0.76 : action === 'crouch' || action === 'peek' ? 0.34 : 0.5;
        targetHipX = leg.restHipX + Math.sin(this.gaitTime + phase) * amp;
        targetLowerX = leg.restLowerX + Math.max(0, -Math.cos(this.gaitTime + phase)) * 0.42;
      } else if (action === 'crouch' || action === 'peek' || action === 'pounce_charge') {
        targetHipX = leg.front ? -0.55 : -0.75;
        targetLowerX = leg.front ? 0.75 : 1.05;
      }

      leg.hip.rotation.x = THREE.MathUtils.damp(leg.hip.rotation.x, targetHipX, 16, dt);
      leg.lower.rotation.x = THREE.MathUtils.damp(leg.lower.rotation.x, targetLowerX, 16, dt);
      leg.hip.scale.x = THREE.MathUtils.damp(leg.hip.scale.x, targetScale, 14, dt);
      leg.hip.scale.y = THREE.MathUtils.damp(leg.hip.scale.y, targetScale, 14, dt);
      leg.hip.scale.z = THREE.MathUtils.damp(leg.hip.scale.z, targetScale, 14, dt);
      leg.hip.position.x = THREE.MathUtils.damp(leg.hip.position.x, targetPosX, 14, dt);
      leg.hip.position.y = THREE.MathUtils.damp(leg.hip.position.y, targetPosY, 14, dt);
      leg.hip.position.z = THREE.MathUtils.damp(leg.hip.position.z, targetPosZ, 14, dt);
    });

    const earTwitch = Math.sin(t * 3.5) * 0.04 + meowPulse * 0.14;
    this.earL.rotation.z = 0.34 + earTwitch;
    this.earR.rotation.z = -0.34 - earTwitch * 0.6;

    this.tailSegments.forEach((seg, i) => {
      let baseLift = 0.28;
      let targetY = Math.sin(t * 2.6 - i * 0.42) * 0.11;
      let segPitch = 0.10;

      if (action === 'zoomies') {
        baseLift = 0.42;
        targetY = Math.sin(t * 9.0 - i * 0.42) * 0.16;
      } else if (action === 'loaf') {
        baseLift = 0.02;
        segPitch = 0.02;
        targetY = i === 0 ? 0.54 : 0.28 + Math.sin(t * 1.4 - i * 0.25) * 0.03;
      } else if (action === 'sit_in') {
        baseLift = 0.56;
        segPitch = 0.04;
        targetY = i === 0 ? 0.64 : 0.34;
      } else if (action === 'groom') {
        baseLift = 0.05;
        segPitch = 0.04;
        targetY = i === 0 ? 0.42 : 0.2;
      } else if (action === 'pounce_charge') {
        baseLift = 0.08;
        targetY = Math.sin(t * 14.0 - i * 0.4) * 0.18;
      } else if (meowPulse > 0.1) {
        baseLift = 0.42;
      }

      const targetX = i === 0 ? baseLift : segPitch;
      seg.rotation.x = THREE.MathUtils.damp(seg.rotation.x, targetX, 10, dt);
      seg.rotation.y = THREE.MathUtils.damp(seg.rotation.y, targetY, 10, dt);
    });
  }
}
