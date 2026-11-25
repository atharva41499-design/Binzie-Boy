import * as THREE from 'three';

const _lLook = new THREE.Vector3();

function buildLulzaHeartGeometry(size = 0.032): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.7 * size);
  s.bezierCurveTo(0.8 * size, -0.2 * size, 1.15 * size, 0.55 * size, 0.55 * size, 0.9 * size);
  s.bezierCurveTo(0.2 * size, 1.1 * size, 0, 0.78 * size, 0, 0.55 * size);
  s.bezierCurveTo(0, 0.78 * size, -0.2 * size, 1.1 * size, -0.55 * size, 0.9 * size);
  s.bezierCurveTo(-1.15 * size, 0.55 * size, -0.8 * size, -0.2 * size, 0, -0.7 * size);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.012 * (size / 0.032),
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

function buildSleekCatTorso(): THREE.BufferGeometry {
  const stations: Array<[number, number, number, number, number]> = [
    [-0.21, 0.015, 0.004, 0.004, 0.004],
    [-0.18, 0.014, 0.048, 0.048, 0.034],
    [-0.125, 0.006, 0.070, 0.070, 0.052],
    [-0.02, 0.004, 0.056, 0.066, 0.038],
    [0.07, 0.003, 0.066, 0.068, 0.060],
    [0.14, 0.020, 0.060, 0.062, 0.054],
    [0.19, 0.048, 0.044, 0.046, 0.040],
    [0.215, 0.068, 0.004, 0.004, 0.004],
  ];
  const radialSegs = 20;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let s = 0; s < stations.length; s++) {
    const [z, cy, hw, topH, botD] = stations[s];
    for (let r = 0; r <= radialSegs; r++) {
      const theta = (r / radialSegs) * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const x = cosT * hw * (sinT < 0 ? 0.92 : 1.0);
      const y =
        sinT >= 0
          ? cy + Math.pow(sinT, 0.92) * topH
          : cy - Math.pow(-sinT, 0.86) * botD;
      positions.push(x, y, z);
    }
  }
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
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildFelineEar(scale = 1.0): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(-0.025 * scale, 0);
  s.quadraticCurveTo(-0.021 * scale, 0.032 * scale, -0.004 * scale, 0.056 * scale);
  s.quadraticCurveTo(0, 0.062 * scale, 0.005 * scale, 0.056 * scale);
  s.quadraticCurveTo(0.022 * scale, 0.03 * scale, 0.025 * scale, 0);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.01 * scale,
    bevelEnabled: true,
    bevelThickness: 0.004 * scale,
    bevelSize: 0.0035 * scale,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.center();
  return geo;
}

export class LulzaCatNPC {
  public readonly id = 'Lulza';
  public readonly root = new THREE.Group();
  public nuzzled = false;

  private readonly bodyRig = new THREE.Group();
  private readonly headGroup = new THREE.Group();
  private readonly upperLidL = new THREE.Group();
  private readonly upperLidR = new THREE.Group();
  private readonly tailSegs: THREE.Group[] = [];
  private readonly hearts: Array<{ mesh: THREE.Mesh; age: number; velY: number; sway: number }> = [];
  private reactPulse = 0;
  private blinkTimer = 2.4;
  private blinkAmt = 0;

  constructor(pos: THREE.Vector3, contactShadowTex?: THREE.Texture) {
    this.root.name = 'Lulza_Neighbor_Girlfriend_Cat';
    this.root.position.copy(pos);
    this.root.rotation.y = Math.PI * 0.15;
    this.root.scale.setScalar(0.84);

    if (contactShadowTex) {
      const shMat = new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      });
      const disc = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), shMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 0.008;
      this.root.add(disc);
    }

    // Calico-cream sleek coat with warm caramel & cocoa patches + pink collar + gold heart tag
    const creamCoatMat = new THREE.MeshStandardMaterial({ color: 0xf7efe2, roughness: 0.85 });
    const caramelPatchMat = new THREE.MeshStandardMaterial({ color: 0xd98038, roughness: 0.86 });
    const cocoaPatchMat = new THREE.MeshStandardMaterial({ color: 0x453229, roughness: 0.86 });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xebb0a8, roughness: 0.8 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xe6888e, roughness: 0.42 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5c443, metalness: 0.82, roughness: 0.22 });
    const eyeLinerMat = new THREE.MeshStandardMaterial({ color: 0x1a100c, roughness: 0.35 });

    const eyeballMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.14,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
    });
    eyeballMat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vEyeLocal;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\nvEyeLocal = position;`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vEyeLocal;`)
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
{
  vec2 ep = vEyeLocal.xy / 0.0165;
  float er = length(ep);
  float frontMask = smoothstep(-0.001, 0.002, vEyeLocal.z);
  vec3 innerEmerald = vec3(0.45, 0.92, 0.68);
  vec3 midJade = vec3(0.14, 0.66, 0.46);
  vec3 outerLimbal = vec3(0.05, 0.20, 0.14);
  vec3 irisCol = mix(innerEmerald, midJade, smoothstep(0.18, 0.56, er));
  irisCol = mix(irisCol, outerLimbal, smoothstep(0.65, 0.86, er));
  float pyNorm = ep.y / 0.65;
  float ay = clamp(abs(pyNorm), 0.0, 1.0);
  float halfW = 0.42 * sqrt(max(0.002, 1.0 - ay * ay * 0.92));
  float slitDist = length(vec2(ep.x / max(0.04, halfW), pyNorm));
  float pupilMask = (1.0 - smoothstep(0.90, 1.04, slitDist)) * frontMask;
  vec3 rimDark = vec3(0.06, 0.03, 0.02);
  vec3 eyeCol = mix(irisCol, rimDark, smoothstep(0.82, 0.92, er));
  eyeCol = mix(eyeCol, rimDark, 1.0 - frontMask);
  eyeCol = mix(eyeCol, vec3(0.015, 0.012, 0.012), pupilMask);
  float catchDist = length(ep - vec2(-0.24, 0.24));
  eyeCol = mix(eyeCol, vec3(1.0, 0.97, 0.92), (1.0 - smoothstep(0.05, 0.14, catchDist)) * frontMask * 0.48);
  diffuseColor.rgb = eyeCol;
}`,
        );
    };

    // Seated / lounging graceful cat posture
    this.bodyRig.position.set(0, 0.105, 0);
    this.bodyRig.rotation.x = -0.35;
    this.root.add(this.bodyRig);

    const torso = new THREE.Mesh(buildSleekCatTorso(), creamCoatMat);
    torso.castShadow = true;
    this.bodyRig.add(torso);

    // Calico saddle & hip patches
    const caramelPatch = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 10), caramelPatchMat);
    caramelPatch.scale.set(0.9, 0.72, 1.45);
    caramelPatch.position.set(0.028, 0.036, -0.02);
    this.bodyRig.add(caramelPatch);

    const cocoaPatch = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), cocoaPatchMat);
    cocoaPatch.scale.set(0.88, 0.72, 1.25);
    cocoaPatch.position.set(-0.025, 0.032, -0.09);
    this.bodyRig.add(cocoaPatch);

    // Neck & Pink Bow Collar + Gold Heart Tag
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.056, 0.1, 14), creamCoatMat);
    neck.position.set(0, 0.072, 0.19);
    neck.rotation.x = 0.42;
    this.bodyRig.add(neck);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.009, 6, 16), collarMat);
    collar.rotation.x = Math.PI / 2 + 0.35;
    collar.position.set(0, 0.072, 0.198);
    this.bodyRig.add(collar);

    const heartTag = new THREE.Mesh(buildLulzaHeartGeometry(0.016), goldMat);
    heartTag.position.set(0, 0.038, 0.246);
    this.bodyRig.add(heartTag);

    // Front tucked legs & paws
    for (const sx of [-0.042, 0.042]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.08, 8, 10), creamCoatMat);
      leg.position.set(sx, -0.04, 0.125);
      leg.rotation.x = 0.35;
      this.bodyRig.add(leg);
      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), creamCoatMat);
      paw.scale.set(1.0, 0.6, 1.2);
      paw.position.set(sx, -0.085, 0.15);
      this.bodyRig.add(paw);
    }

    // Sculpted Feline Head (matching Brownie's crisp anatomical proportions + calico ear patches)
    this.headGroup.position.set(0, 0.135, 0.225);
    this.headGroup.rotation.x = 0.32;
    this.bodyRig.add(this.headGroup);

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.076, 22, 18), creamCoatMat);
    cranium.scale.set(1.04, 0.88, 1.0);
    cranium.castShadow = true;
    this.headGroup.add(cranium);

    const headPatchL = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), caramelPatchMat);
    headPatchL.scale.set(0.9, 0.82, 1.0);
    headPatchL.position.set(-0.035, 0.034, 0.012);
    this.headGroup.add(headPatchL);

    const headPatchR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), cocoaPatchMat);
    headPatchR.scale.set(0.9, 0.82, 1.0);
    headPatchR.position.set(0.038, 0.032, -0.008);
    this.headGroup.add(headPatchR);

    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.054, 10), creamCoatMat);
    bridge.scale.set(1.1, 1.0, 0.74);
    bridge.position.set(0, 0.004, 0.06);
    bridge.rotation.x = 1.06;
    this.headGroup.add(bridge);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), creamCoatMat);
    snout.scale.set(1.04, 0.76, 1.2);
    snout.position.set(0, -0.018, 0.062);
    this.headGroup.add(snout);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 10, 8), noseMat);
    nose.scale.set(1.2, 0.8, 0.72);
    nose.position.set(0, -0.01, 0.088);
    this.headGroup.add(nose);

    for (const [side, upperLid] of [
      [-1, this.upperLidL],
      [1, this.upperLidR],
    ] as Array<[number, THREE.Group]>) {
      const eyeHolder = new THREE.Group();
      eyeHolder.position.set(side * 0.029, 0.012, 0.061);
      eyeHolder.rotation.y = side * 0.28;
      eyeHolder.scale.set(1.08, 0.98, 0.86);

      eyeHolder.add(new THREE.Mesh(new THREE.SphereGeometry(0.0165, 22, 18), eyeballMat));

      const uLid = new THREE.Mesh(
        new THREE.SphereGeometry(0.0178, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.52),
        creamCoatMat,
      );
      upperLid.add(uLid);
      const lash = new THREE.Mesh(new THREE.TorusGeometry(0.0179, 0.001, 6, 18, Math.PI), eyeLinerMat);
      lash.rotation.x = Math.PI / 2;
      upperLid.add(lash);
      upperLid.rotation.x = -0.78;
      upperLid.rotation.z = side * 0.12;
      eyeHolder.add(upperLid);

      this.headGroup.add(eyeHolder);
    }

    const earGeo = buildFelineEar(1.0);
    const earInnerGeo = buildFelineEar(0.65);
    for (const side of [-1, 1]) {
      const earG = new THREE.Group();
      earG.position.set(side * 0.044, 0.052, -0.006);
      earG.rotation.z = -side * 0.3;
      earG.rotation.y = side * 0.14;
      earG.rotation.x = 0.12;
      const outer = new THREE.Mesh(earGeo, side < 0 ? caramelPatchMat : cocoaPatchMat);
      outer.position.y = 0.025;
      earG.add(outer);
      const inner = new THREE.Mesh(earInnerGeo, innerEarMat);
      inner.position.set(0, 0.02, 0.005);
      earG.add(inner);
      this.headGroup.add(earG);
    }

    // Swishing tricolor tail
    let parentObj: THREE.Object3D = this.bodyRig;
    for (let i = 0; i < 8; i++) {
      const seg = new THREE.Group();
      seg.position.set(0, i === 0 ? 0.02 : 0, i === 0 ? -0.19 : -0.032);
      const r = Math.max(0.013, 0.024 - i * 0.0012);
      const mat = i >= 6 ? caramelPatchMat : i >= 3 ? cocoaPatchMat : creamCoatMat;
      const plume = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
      plume.scale.set(0.96, 0.96, 1.5);
      plume.position.z = -0.015;
      seg.add(plume);
      parentObj.add(seg);
      this.tailSegs.push(seg);
      parentObj = seg;
    }

    // Floating heart particles
    const hGeo = buildLulzaHeartGeometry(0.034);
    const hMat = new THREE.MeshStandardMaterial({
      color: 0xff66a3,
      emissive: 0xec4899,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    });
    for (let i = 0; i < 4; i++) {
      const hm = new THREE.Mesh(hGeo, hMat);
      hm.visible = false;
      this.root.add(hm);
      this.hearts.push({ mesh: hm, age: -1, velY: 0.34 + i * 0.05, sway: i * 1.3 });
    }
  }

  public triggerLoveReact() {
    this.reactPulse = 2.2;
    for (let i = 0; i < this.hearts.length; i++) {
      const h = this.hearts[i];
      h.age = -i * 0.16;
      h.mesh.position.set((Math.random() - 0.5) * 0.2, 0.42, 0.15);
      h.mesh.visible = true;
    }
  }

  public reset() {
    this.nuzzled = false;
    this.reactPulse = 0;
    for (const h of this.hearts) {
      h.age = -1;
      h.mesh.visible = false;
    }
  }

  public update(dt: number, browniePos: THREE.Vector3) {
    const t = performance.now() * 0.001;
    this.reactPulse = Math.max(0, this.reactPulse - dt);

    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0) {
      this.blinkAmt = 1;
      this.blinkTimer = 2.2 + Math.random() * 2.5;
    }
    this.blinkAmt = Math.max(0, this.blinkAmt - dt * 6.5);

    const dist = this.root.position.distanceTo(browniePos);
    const happyClose = dist < 2.2 || this.reactPulse > 0;
    const openLid = happyClose ? -0.32 : -0.78;
    this.upperLidL.rotation.x = THREE.MathUtils.damp(
      this.upperLidL.rotation.x,
      THREE.MathUtils.lerp(openLid, 0.4, this.blinkAmt),
      16,
      dt,
    );
    this.upperLidR.rotation.x = this.upperLidL.rotation.x;

    if (dist < 4.5) {
      _lLook.copy(browniePos).sub(this.root.position);
      const localYaw = Math.atan2(_lLook.x, _lLook.z) - this.root.rotation.y;
      const wrapped = Math.atan2(Math.sin(localYaw), Math.cos(localYaw));
      this.headGroup.rotation.y = THREE.MathUtils.damp(
        this.headGroup.rotation.y,
        THREE.MathUtils.clamp(wrapped, -0.85, 0.85),
        7,
        dt,
      );
      this.headGroup.rotation.x = THREE.MathUtils.damp(
        this.headGroup.rotation.x,
        0.32 + (this.reactPulse > 0 ? Math.sin(t * 10) * 0.14 : -0.06),
        8,
        dt,
      );
    } else {
      this.headGroup.rotation.y = THREE.MathUtils.damp(this.headGroup.rotation.y, 0, 5, dt);
      this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, 0.32, 5, dt);
    }

    for (let i = 0; i < this.tailSegs.length; i++) {
      this.tailSegs[i].rotation.x = i === 0 ? 0.52 : 0.1;
      this.tailSegs[i].rotation.y =
        (i === 0 ? 0.45 : 0.22) + Math.sin(t * (happyClose ? 4.2 : 2.1) - i * 0.35) * (happyClose ? 0.12 : 0.05);
    }

    for (const h of this.hearts) {
      if (h.mesh.visible) {
        h.age += dt;
        if (h.age >= 0) {
          h.mesh.position.y += h.velY * dt;
          h.mesh.position.x += Math.sin(t * 4.5 + h.sway) * 0.08 * dt;
          h.mesh.rotation.y += dt * 2.2;
          h.mesh.scale.setScalar(Math.max(0.01, 1.0 - h.age / 1.4));
          if (h.age > 1.4) {
            h.mesh.visible = false;
            h.age = -1;
          }
        } else {
          h.mesh.scale.setScalar(0.01);
        }
      }
    }
  }
}
