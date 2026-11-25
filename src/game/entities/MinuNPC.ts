import * as THREE from 'three';

const _mLook = new THREE.Vector3();

function buildHeartGeometry(size = 0.045): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.7 * size);
  s.bezierCurveTo(0.8 * size, -0.2 * size, 1.15 * size, 0.55 * size, 0.55 * size, 0.9 * size);
  s.bezierCurveTo(0.2 * size, 1.1 * size, 0, 0.78 * size, 0, 0.55 * size);
  s.bezierCurveTo(0, 0.78 * size, -0.2 * size, 1.1 * size, -0.55 * size, 0.9 * size);
  s.bezierCurveTo(-1.15 * size, 0.55 * size, -0.8 * size, -0.2 * size, 0, -0.7 * size);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.015 * (size / 0.045),
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

export class MinuNPC {
  public readonly id = 'Minu';
  public readonly root = new THREE.Group();
  public crushEarned = false;

  private readonly bodyGroup = new THREE.Group();
  private readonly headGroup = new THREE.Group();
  private readonly armL = new THREE.Group();
  private readonly armR = new THREE.Group();
  private readonly hearts: Array<{ mesh: THREE.Mesh; age: number; velY: number; sway: number }> = [];
  private crushPulse = 0;

  constructor(pos: THREE.Vector3, contactShadowTex?: THREE.Texture) {
    this.root.name = 'Minu_Local_Gangster';
    this.root.position.copy(pos);
    this.root.rotation.y = Math.PI * 0.35;

    if (contactShadowTex) {
      const shMat = new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.56,
      });
      const disc = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.66), shMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 0.008;
      this.root.add(disc);
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc48b69, roughness: 0.68 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x691826, roughness: 0.38, metalness: 0.14 });
    const innerTopMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.78 });
    const cargoMat = new THREE.MeshStandardMaterial({ color: 0x242933, roughness: 0.85 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x151518, roughness: 0.55 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x191519, roughness: 0.72 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xebc24b, metalness: 0.85, roughness: 0.2 });
    const shadesMat = new THREE.MeshStandardMaterial({ color: 0x0d0f14, metalness: 0.65, roughness: 0.15 });

    this.root.add(this.bodyGroup);

    // Legs & Combat Boots (confident wide stance)
    for (const [lx, rotZ] of [
      [-0.105, -0.05],
      [0.105, 0.05],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.054, 0.74, 10), cargoMat);
      leg.position.set(lx, 0.42, 0);
      leg.rotation.z = rotZ;
      leg.castShadow = true;
      this.bodyGroup.add(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.11, 0.19), bootMat);
      boot.position.set(lx * 1.15, 0.055, 0.03);
      boot.castShadow = true;
      this.bodyGroup.add(boot);
    }

    // Cropped Leather Biker Jacket + Dark Inner Top + Gold Gangster Chain
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.148, 0.24, 12), innerTopMat);
    waist.scale.set(1.06, 1.0, 0.74);
    waist.position.y = 0.88;
    this.bodyGroup.add(waist);

    const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.145, 0.44, 14), leatherMat);
    jacket.scale.set(1.12, 1.0, 0.76);
    jacket.position.y = 1.16;
    jacket.castShadow = true;
    this.bodyGroup.add(jacket);

    for (const sx of [-0.075, 0.075]) {
      const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.22, 0.03), leatherMat);
      lapel.position.set(sx, 1.24, 0.115);
      lapel.rotation.z = -sx * 2.2;
      this.bodyGroup.add(lapel);
    }

    const goldChain = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.011, 6, 16), goldMat);
    goldChain.rotation.x = Math.PI / 2 - 0.35;
    goldChain.position.set(0, 1.32, 0.082);
    this.bodyGroup.add(goldChain);

    const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.008, 10), goldMat);
    medallion.rotation.x = Math.PI / 2;
    medallion.position.set(0, 1.25, 0.148);
    this.bodyGroup.add(medallion);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.054, 0.1, 10), skinMat);
    neck.position.y = 1.41;
    this.bodyGroup.add(neck);

    // Arms (cool swagger pose -> waves/reaches fondly when Brownie visits)
    for (const [ax, grp, isLeft] of [
      [-0.205, this.armL, true],
      [0.205, this.armR, false],
    ] as Array<[number, THREE.Group, boolean]>) {
      grp.position.set(ax, 1.33, 0);
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.036, 0.42, 10), leatherMat);
      sleeve.position.y = -0.2;
      sleeve.castShadow = true;
      grp.add(sleeve);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), skinMat);
      hand.position.y = -0.42;
      grp.add(hand);

      grp.rotation.z = isLeft ? -0.18 : 0.16;
      grp.rotation.x = isLeft ? -0.25 : 0.1;
      this.bodyGroup.add(grp);
    }

    // Head + Jet-Black Bob + Tilted Street Cap + Aviator Shades
    this.headGroup.position.set(0, 1.54, 0.015);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 14), skinMat);
    head.scale.set(0.94, 1.04, 0.96);
    head.castShadow = true;
    this.headGroup.add(head);

    const bobHair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 14, 12), hairMat);
    bobHair.scale.set(1.06, 0.96, 1.06);
    bobHair.position.set(0, 0.02, -0.022);
    this.headGroup.add(bobHair);

    for (const sx of [-0.088, 0.088]) {
      const sideLock = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.14, 0.09), hairMat);
      sideLock.position.set(sx, -0.04, 0.02);
      this.headGroup.add(sideLock);
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0035, 6, 12), goldMat);
      hoop.rotation.y = Math.PI / 2;
      hoop.position.set(sx * 1.18, -0.025, 0.025);
      this.headGroup.add(hoop);
    }

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.118, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.48), leatherMat);
    cap.position.set(0, 0.03, -0.005);
    cap.rotation.x = -0.18;
    cap.rotation.z = 0.12;
    this.headGroup.add(cap);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.015, 0.095), leatherMat);
    capVisor.position.set(-0.01, 0.056, 0.1);
    capVisor.rotation.z = 0.12;
    capVisor.rotation.x = 0.14;
    this.headGroup.add(capVisor);

    // Aviator Shades + Smirk
    for (const sx of [-0.035, 0.035]) {
      const lens = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.036, 0.014), shadesMat);
      lens.position.set(sx, 0.014, 0.105);
      this.headGroup.add(lens);
    }
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.007, 0.014), goldMat);
    bridge.position.set(0, 0.022, 0.106);
    this.headGroup.add(bridge);

    const lips = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 0.011, 0.014),
      new THREE.MeshStandardMaterial({ color: 0x9e2a3b, roughness: 0.4 }),
    );
    lips.position.set(0, -0.042, 0.098);
    this.headGroup.add(lips);

    // Pool 4 floating 3D pink crush hearts
    const heartGeo = buildHeartGeometry(0.045);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff4d88,
      emissive: 0xd91c5c,
      emissiveIntensity: 0.65,
      roughness: 0.35,
    });
    for (let i = 0; i < 4; i++) {
      const hm = new THREE.Mesh(heartGeo, heartMat);
      hm.visible = false;
      this.root.add(hm);
      this.hearts.push({ mesh: hm, age: -1, velY: 0.42 + i * 0.06, sway: i * 1.4 });
    }
  }

  public triggerCrushReact() {
    this.crushPulse = 2.4;
    for (let i = 0; i < this.hearts.length; i++) {
      const h = this.hearts[i];
      h.age = -i * 0.18;
      h.mesh.position.set((Math.random() - 0.5) * 0.35, 1.72, 0.15);
      h.mesh.visible = true;
    }
  }

  public reset() {
    this.crushEarned = false;
    this.crushPulse = 0;
    this.bodyGroup.rotation.set(0, 0, 0);
    for (const h of this.hearts) {
      h.age = -1;
      h.mesh.visible = false;
    }
  }

  public update(dt: number, browniePos: THREE.Vector3) {
    const t = performance.now() * 0.001;
    this.crushPulse = Math.max(0, this.crushPulse - dt);

    const dist = this.root.position.distanceTo(browniePos);
    const charmed = dist < 2.8 || this.crushPulse > 0;

    if (dist < 5.5) {
      _mLook.copy(browniePos).sub(this.root.position);
      const localYaw = Math.atan2(_mLook.x, _mLook.z) - this.root.rotation.y;
      const wrapped = Math.atan2(Math.sin(localYaw), Math.cos(localYaw));
      this.headGroup.rotation.y = THREE.MathUtils.damp(
        this.headGroup.rotation.y,
        THREE.MathUtils.clamp(wrapped, -0.85, 0.85),
        7,
        dt,
      );
      this.headGroup.rotation.x = THREE.MathUtils.damp(
        this.headGroup.rotation.x,
        charmed ? 0.24 : 0.08,
        7,
        dt,
      );
    } else {
      this.headGroup.rotation.y = THREE.MathUtils.damp(this.headGroup.rotation.y, 0, 5, dt);
      this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, 0, 5, dt);
    }

    // Swooning lean & wave when Brownie is nearby or reacting
    this.bodyGroup.rotation.x = THREE.MathUtils.damp(
      this.bodyGroup.rotation.x,
      this.crushPulse > 0 ? 0.16 : charmed ? 0.07 : 0,
      8,
      dt,
    );
    this.armR.rotation.x = THREE.MathUtils.damp(
      this.armR.rotation.x,
      this.crushPulse > 0 ? -1.1 + Math.sin(t * 10) * 0.25 : charmed ? -0.55 : 0.1,
      9,
      dt,
    );

    // Floating 3D crush hearts animation
    for (const h of this.hearts) {
      if (h.mesh.visible) {
        h.age += dt;
        if (h.age >= 0) {
          h.mesh.position.y += h.velY * dt;
          h.mesh.position.x += Math.sin(t * 4.5 + h.sway) * 0.12 * dt;
          h.mesh.rotation.y += dt * 2.2;
          const sc = Math.max(0.01, 1.0 - h.age / 1.5);
          h.mesh.scale.setScalar(sc);
          if (h.age > 1.5) {
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
